import { randomUUID } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const MAX_MAP_PIXELS = 4_000_000;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const SEGMENT_COLORS = [
  [96, 165, 250],
  [74, 222, 128],
  [251, 191, 36],
  [244, 114, 182],
  [167, 139, 250],
] as const;

/** Pixel arrays extracted from a parsed Roborock RRMap image block. */
export interface RoborockMapImage {
  floor: number[];
  height: number;
  obstacle: number[];
  segments: number[];
  width: number;
}

const RRMAP_IMAGE_BLOCK = 2;

/** Extracts renderable pixel arrays directly from a classic RRMap v1 buffer. */
export function parseMapImageBuffer(buf: Buffer): RoborockMapImage | undefined {
  if (buf.length < 0x18 || buf[0x00] !== 0x72 || buf[0x01] !== 0x72) return;

  const end = Math.min(buf.readUInt32LE(0x04), buf.length);
  let pos = 0x14;
  while (pos + 8 <= end) {
    const type = buf.readUInt16LE(pos);
    const hlength = buf.readUInt16LE(pos + 2);
    const length = buf.readUInt32LE(pos + 4);
    if (hlength < 8 || pos + hlength + length > buf.length) return;

    if (type === RRMAP_IMAGE_BLOCK && hlength > 24) {
      const height = buf.readInt32LE(pos + hlength - 8);
      const width = buf.readInt32LE(pos + hlength - 4);
      const pixelCount = width * height;
      if (!Number.isSafeInteger(pixelCount) || width <= 0 || height <= 0 || pixelCount > MAX_MAP_PIXELS) return;
      if (length < pixelCount) return;

      const floor: number[] = [];
      const obstacle: number[] = [];
      const segments: number[] = [];
      const pixelsAt = pos + hlength;
      for (let i = 0; i < pixelCount; i++) {
        const pixel = buf[pixelsAt + i];
        if (pixel === 0x01) {
          obstacle.push(i);
        } else if (pixel === 0xff || pixel === 0x07) {
          floor.push(i);
        } else if ((pixel & 0x07) === 0x07) {
          const segmentId = pixel >> 3;
          segments.push(((segmentId << 21) | i) >>> 0);
        }
      }
      return { floor, height, obstacle, segments, width };
    }

    pos += hlength + length;
  }

  return;
}

/** Renders a parsed Roborock floor-plan image as a PNG buffer. */
export function renderMapImage(map: RoborockMapImage) {
  const pixelCount = map.width * map.height;
  if (!Number.isSafeInteger(pixelCount) || pixelCount <= 0 || pixelCount > MAX_MAP_PIXELS) {
    throw new Error(`Roborock map dimensions are unsupported: ${map.width}x${map.height}.`);
  }

  const pixels = Buffer.alloc(pixelCount * 4, 255);
  for (const index of map.floor) paintPixel(pixels, index, pixelCount, [226, 232, 240]);
  for (const encoded of map.segments) {
    const index = encoded & 0x1f_ffff;
    const segmentId = encoded >>> 21;
    paintPixel(pixels, index, pixelCount, SEGMENT_COLORS[segmentId % SEGMENT_COLORS.length]);
  }
  for (const index of map.obstacle) paintPixel(pixels, index, pixelCount, [51, 65, 85]);

  const scanlines = Buffer.alloc((map.width * 4 + 1) * map.height);
  for (let row = 0; row < map.height; row++) {
    const source = row * map.width * 4;
    const target = row * (map.width * 4 + 1);
    scanlines[target] = 0;
    pixels.copy(scanlines, target + 1, source, source + map.width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(map.width);
  header.writeUInt32BE(map.height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Stores one rendered map atomically under its stable device and map identifiers. */
export async function storeMapImage(
  storagePath: string,
  deviceId: string,
  mapId: number | 'current',
  map: RoborockMapImage,
) {
  const file = path.resolve(storagePath, safePathSegment(deviceId), `${mapId}.png`);
  const temporaryFile = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(temporaryFile, renderMapImage(map), { mode: 0o640 });
  await rename(temporaryFile, file);
  return file;
}

/** Converts a remote device identifier into one safe local path segment. */
function safePathSegment(value: string) {
  const segment = value.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!segment || segment === '.' || segment === '..')
    throw new Error('Roborock device ID cannot be used as a map path.');
  return segment;
}

/** Colors one valid RGBA pixel. */
function paintPixel(pixels: Buffer, index: number, pixelCount: number, color: readonly number[]) {
  if (!Number.isInteger(index) || index < 0 || index >= pixelCount) return;

  const offset = index * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = 255;
}

/** Encodes one PNG chunk with its CRC32 checksum. */
function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

/** Calculates a PNG-compatible CRC32 checksum. */
function crc32(data: Buffer) {
  let crc = 0xffff_ffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb8_8320 : 0);
  }
  return (crc ^ 0xffff_ffff) >>> 0;
}
