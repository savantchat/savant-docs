// @vitest-environment node
/// <reference types="vite/client" />
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {describe, expect, it} from 'vitest';

const tarballs = Object.keys(import.meta.glob('../../.uilint-packages/*.tgz')).sort();
const lockfile = JSON.parse(readFileSync('package-lock.json', 'utf8'));

function tarEntryNames(tarball: Buffer): string[] {
  const tar = gunzipSync(tarball);
  const names: string[] = [];

  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;

    const name = header.toString('utf8', 0, 100).split('\0')[0];
    const prefix = header.toString('utf8', 345, 500).split('\0')[0];
    const size = Number.parseInt(header.toString('ascii', 124, 136).split('\0')[0].trim(), 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) {
      throw new Error(`Invalid tar entry size for ${name}`);
    }

    names.push(prefix ? `${prefix}/${name}` : name);
    offset += 512 + Math.ceil(size / 512) * 512;
  }

  return names;
}

describe('committed uilint packages', () => {
  it('ships exactly the core, playwright and cli tarballs', () => {
    expect(tarballs.map(file => file.split('/').pop())).toEqual([
      'uilint-cli-0.1.2.tgz',
      'uilint-core-0.1.2.tgz',
      'uilint-playwright-0.1.2.tgz',
    ]);
  });

  for (const file of tarballs) {
    const filename = file.split('/').pop()!;
    const tarball = readFileSync(`.uilint-packages/${filename}`);

    it(`${filename} matches its package-lock.json integrity`, () => {
      const packageName = filename.replace(/^uilint-/, '@uilint/').replace(/-\d.*\.tgz$/, '');
      const locked = lockfile.packages[`node_modules/${packageName}`];

      expect(locked.resolved).toBe(`file:.uilint-packages/${filename}`);
      expect(locked.integrity).toBe(`sha512-${createHash('sha512').update(tarball).digest('base64')}`);
    });

    it(`${filename} contains no .tsbuildinfo build cache`, () => {
      const entries = tarEntryNames(tarball);
      expect(entries).toContain('package/package.json');

      for (const entry of entries) {
        expect(entry.endsWith('.tsbuildinfo'), `${filename} contains build cache entry ${entry}`).toBe(false);
      }
    });
  }
});
