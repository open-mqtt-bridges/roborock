import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseMapImageBuffer, renderMapImage, storeMapImage } from './map';

describe('Roborock map storage', () => {
  const map = {
    floor: [0, 1, 2, 3, 4, 5],
    height: 2,
    obstacle: [1],
    segments: [2 | (1 << 21)],
    width: 3,
  };

  it('renders a PNG image', () => {
    expect(renderMapImage(map).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  });

  it('stores PNG maps under stable device and map IDs with group-readable permissions', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'mqtt-bridges-roborock-maps-'));
    try {
      const file = await storeMapImage(directory, 'robot-1', 42, map);
      const replacement = await storeMapImage(directory, 'robot-1', 42, map);

      expect(file).toBe(path.join(directory, 'robot-1', '42.png'));
      expect(replacement).toBe(file);
      await expect(readdir(path.dirname(file))).resolves.toEqual(['42.png']);
      expect((await stat(file)).mode & 0o777).toBe(0o640);
      expect((await readFile(file)).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it('extracts floor, obstacle, and segment pixels from a classic RRMap v1 buffer', () => {
    const hlength = 28;
    const pixels = Buffer.from([0x00, 0x01, 0xff, 0x07, (16 << 3) | 0x07, 0x00]);
    const totalLength = 0x14 + hlength + pixels.length;
    const buf = Buffer.alloc(totalLength);
    buf[0] = 0x72;
    buf[1] = 0x72;
    buf.writeUInt32LE(totalLength, 0x04);
    buf.writeUInt16LE(2, 0x14);
    buf.writeUInt16LE(hlength, 0x16);
    buf.writeUInt32LE(pixels.length, 0x18);
    buf.writeInt32LE(2, 0x14 + hlength - 8);
    buf.writeInt32LE(3, 0x14 + hlength - 4);
    pixels.copy(buf, 0x14 + hlength);

    expect(parseMapImageBuffer(buf)).toEqual({
      floor: [2, 3],
      height: 2,
      obstacle: [1],
      segments: [((16 << 21) | 4) >>> 0],
      width: 3,
    });
    expect(parseMapImageBuffer(Buffer.from('not-rrmap'))).toBeUndefined();
  });
});
