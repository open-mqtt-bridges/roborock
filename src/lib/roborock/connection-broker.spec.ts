import type { Roborock as RoborockClient } from 'homebridge-roborock-matter/roborockLib/roborockAPI';
import { connectAsync, type MqttClient } from 'mqtt';
import { randomUUID } from 'node:crypto';
import type { MqttBridgeClient } from '~/modules/mqtt/mqtt.service';
import type { RoborockConfig } from '~/types/config/roborock';
import { Roborock } from './index';

const brokerUrl = process.env.MQTT_TEST_URL;

/** Subscribes only after publication and checks the broker's retained delivery. */
async function receiveRetained(url: string, topic: string) {
  const subscriber = await connectAsync(url, { reconnectPeriod: 0, connectTimeout: 2_000 });
  try {
    const message = new Promise<{ payload: string; retained: boolean }>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`No retained connection state received on ${topic}`)), 3_000);
      subscriber.once('message', (_topic, payload, packet) => {
        clearTimeout(timeout);
        resolve({ payload: payload.toString(), retained: packet.retain });
      });
    });
    await subscriber.subscribeAsync(topic);
    return await message;
  } finally {
    await subscriber.endAsync(true);
  }
}

(brokerUrl ? it : it.skip)(
  'delivers retained bridge readiness and shutdown to late broker subscribers',
  async () => {
    const topic = `test/roborock/${randomUUID()}`;
    const connectedTopic = `${topic}/bridge/connected`;
    let publisher: MqttClient | undefined;
    let bridge: Roborock | undefined;
    const publications: Promise<unknown>[] = [];
    try {
      publisher = await connectAsync(brokerUrl!, { reconnectPeriod: 0, connectTimeout: 2_000 });
      const client = publisher;
      const mqtt: MqttBridgeClient = {
        publish: (name, payload, options) => {
          // QoS 1 acknowledges broker storage before the late client subscribes.
          publications.push(client.publishAsync(name, payload === null ? '' : String(payload), { ...options, qos: 1 }));
        },
        subscribe: () => () => {},
      };
      bridge = new Roborock({ id: 'broker-test', topic, logLevel: 'error' } as RoborockConfig, mqtt);
      const readyClient = {
        isInited: () => true,
        states: {},
        stopService: async () => {},
      } as unknown as RoborockClient;
      const internals = bridge as unknown as {
        client: RoborockClient;
        handleConnected(client: RoborockClient): void;
      };
      internals.client = readyClient;
      internals.handleConnected(readyClient);
      await Promise.all(publications.splice(0));
      expect(await receiveRetained(brokerUrl!, connectedTopic)).toEqual({ payload: 'true', retained: true });

      bridge.destroy();
      await Promise.all(publications.splice(0));
      expect(await receiveRetained(brokerUrl!, connectedTopic)).toEqual({ payload: 'false', retained: true });
    } finally {
      bridge?.destroy();
      if (publisher) {
        await publisher.publishAsync(connectedTopic, '', { retain: true, qos: 1 });
        await publisher.endAsync(true);
      }
    }
  },
  15_000,
);
