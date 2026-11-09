import { jest } from '@jest/globals';
import { Roborock as RoborockClient } from 'homebridge-roborock-matter/roborockLib/roborockAPI';
import type { MqttBridgeClient } from '~/modules/mqtt/mqtt.service';
import type { RoborockConfig } from '~/types/config/roborock';
import { Roborock } from './index';

interface ConnectionInternals {
  client?: RoborockClient;
  connect(): Promise<void>;
  loadAuthentication(): Promise<undefined>;
  verifyTwoFactorCode(client: RoborockClient, code: string): Promise<void>;
}

describe('Roborock connection readiness', () => {
  const bridges: Roborock[] = [];
  const cfg: RoborockConfig = {
    baseUrl: 'example.invalid',
    email: 'robot@example.com',
    enabled: true,
    id: 'connection-test',
    logLevel: 'error',
    password: 'fixture-password',
    region: 'auto',
    topic: 'test/roborock',
    updateInterval: 30_000,
  };
  const connectedTopic = `${cfg.topic}/bridge/connected`;

  afterEach(() => {
    for (const bridge of bridges.splice(0)) bridge.destroy();
    jest.restoreAllMocks();
  });

  /** Uses the real client listener implementation without opening cloud connections. */
  function fixture(readyOnStart = true, overrides: Partial<RoborockConfig> = {}) {
    let initialized = false;
    let notifyClientReady: (() => void) | undefined;
    const mqtt = {
      publish: jest.fn<MqttBridgeClient['publish']>(),
      subscribe: jest.fn<MqttBridgeClient['subscribe']>(() => jest.fn()),
    };
    const bridge = new Roborock({ ...cfg, ...overrides }, mqtt);
    bridges.push(bridge);
    const internals = bridge as unknown as ConnectionInternals;
    jest.spyOn(internals, 'loadAuthentication').mockResolvedValue(undefined);
    jest.spyOn(RoborockClient.prototype, 'stopService').mockResolvedValue(undefined);
    jest.spyOn(RoborockClient.prototype, 'isInited').mockImplementation(() => initialized);
    // The dependency removed these legacy auth methods too. These fixtures verify
    // only the bridge's existing verification flow, not the cloud auth contract.
    const requestCode = jest.fn<RoborockClient['sendTwoFactorEmail']>().mockResolvedValue({ ok: true });
    const verifyCode = jest.fn<RoborockClient['verifyTwoFactorCode']>().mockResolvedValue(undefined);
    const start = jest.spyOn(RoborockClient.prototype, 'startService').mockImplementation(async function (
      this: RoborockClient,
    ) {
      notifyClientReady = (Reflect.get(this, 'notifyReady') as () => void).bind(this);
      Object.assign(this, { sendTwoFactorEmail: requestCode, verifyTwoFactorCode: verifyCode });
      if (readyOnStart || verifyCode.mock.calls.length) {
        initialized = true;
        notifyReady();
      }
    });

    function notifyReady() {
      notifyClientReady!();
    }

    return {
      bridge,
      internals,
      mqtt,
      notifyReady,
      requestCode,
      start,
      verifyCode,
      ready() {
        initialized = true;
        notifyReady();
      },
    };
  }

  it('matches the installed dependency API independently of handwritten declarations', () => {
    expect(typeof Reflect.get(RoborockClient.prototype, 'setReadyListener')).toBe('function');
    expect(typeof Reflect.get(RoborockClient.prototype, 'notifyReady')).toBe('function');
    expect(RoborockClient.prototype.startService.length).toBe(0);
  });

  it('publishes retained offline state before retained readiness from parameterless startup', async () => {
    const { bridge, mqtt, start } = fixture();
    bridge.setup();
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(start).toHaveBeenCalledWith();
    const connectionPublications = mqtt.publish.mock.calls.filter(([topic]) => topic === connectedTopic);
    expect(connectionPublications).toEqual([
      [connectedTopic, false, { retain: true }],
      [connectedTopic, true, { retain: true }],
    ]);
  });

  it('observes successful internal recovery after the initial start returns uninitialized', async () => {
    const { internals, mqtt, ready, requestCode, start } = fixture(false);
    await internals.connect();
    expect(requestCode).toHaveBeenCalledTimes(1);
    expect(mqtt.publish).not.toHaveBeenCalledWith(connectedTopic, true, expect.anything());

    ready();

    expect(start).toHaveBeenCalledTimes(1);
    expect(mqtt.publish).toHaveBeenCalledWith(connectedTopic, true, { retain: true });
  });

  it('keeps the readiness listener through verification-code startup', async () => {
    const { internals, mqtt, start, verifyCode } = fixture(false, { verificationCode: '123456' });
    await internals.connect();

    expect(verifyCode).toHaveBeenCalledWith('123456');
    expect(start.mock.calls).toEqual([[], []]);
    expect(mqtt.publish).toHaveBeenCalledWith(connectedTopic, true, { retain: true });
    expect(mqtt.publish).toHaveBeenCalledWith(`${cfg.topic}/bridge/auth/status`, 'authenticated');
  });

  it('keeps the same listener when a verification code arrives after startup', async () => {
    const { internals, mqtt, start, verifyCode } = fixture(false);
    await internals.connect();
    await internals.verifyTwoFactorCode(internals.client!, '654321');

    expect(verifyCode).toHaveBeenCalledWith('654321');
    expect(start.mock.calls).toEqual([[], []]);
    expect(mqtt.publish).toHaveBeenCalledWith(connectedTopic, true, { retain: true });
  });

  it('accepts repeated readiness notifications from the active initialized client', async () => {
    const { internals, mqtt, notifyReady } = fixture();
    await internals.connect();
    notifyReady();

    expect(mqtt.publish.mock.calls.filter(([topic, value]) => topic === connectedTopic && value === true)).toEqual([
      [connectedTopic, true, { retain: true }],
      [connectedTopic, true, { retain: true }],
    ]);
  });

  it('ignores readiness notifications while the client remains uninitialized', async () => {
    const { internals, mqtt, notifyReady } = fixture(false);
    await internals.connect();
    mqtt.publish.mockClear();
    notifyReady();

    expect(mqtt.publish).not.toHaveBeenCalled();
  });

  it('ignores readiness notifications from a replaced client', async () => {
    const { internals, mqtt, notifyReady } = fixture();
    await internals.connect();
    internals.client = undefined;
    mqtt.publish.mockClear();
    notifyReady();

    expect(mqtt.publish).not.toHaveBeenCalled();
  });

  it('retains offline state on shutdown and ignores subsequent readiness', async () => {
    const { bridge, internals, mqtt, notifyReady } = fixture();
    await internals.connect();
    mqtt.publish.mockClear();
    bridge.destroy();
    notifyReady();
    bridge.destroy();

    expect(mqtt.publish.mock.calls).toEqual([[connectedTopic, false, { retain: true }]]);
  });

  it('ignores deferred readiness after shutdown interrupts startup', async () => {
    const { bridge, internals, mqtt, ready } = fixture(false);
    await internals.connect();
    bridge.destroy();
    mqtt.publish.mockClear();
    ready();

    expect(mqtt.publish).not.toHaveBeenCalled();
  });
});
