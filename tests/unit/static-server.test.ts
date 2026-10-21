// @vitest-environment node
import fs from 'node:fs';
import http from 'node:http';
import type {AddressInfo} from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {createServer} from '../../server.mjs';

// The docs image serves the built site with server.mjs. Scanners send paths
// that the filesystem rejects with codes other than ENOENT (an overlong
// segment gives ENAMETOOLONG, a NUL byte gives ERR_INVALID_ARG_VALUE).
// serve-handler turns every such code into a 500; the site must answer 404.

let publicDir: string;
let server: http.Server;
let port: number;

function get(rawPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.get({host: '127.0.0.1', port, path: rawPath}, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode ?? 0));
    });
    req.on('error', reject);
  });
}

beforeAll(async () => {
  publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-server-'));
  fs.mkdirSync(path.join(publicDir, 'img'));
  fs.writeFileSync(
    path.join(publicDir, 'img', 'a.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg"/>',
  );
  fs.writeFileSync(path.join(publicDir, 'index.html'), '<!doctype html><title>x</title>');
  server = createServer(publicDir);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(publicDir, {recursive: true, force: true});
});

describe('static server', () => {
  it('answers 404 for an overlong segment under /img/', async () => {
    expect(await get('/img/' + 'M'.repeat(300))).toBe(404);
  });

  it('answers 404 for an overlong segment at the root', async () => {
    expect(await get('/' + 'a'.repeat(300))).toBe(404);
  });

  it('answers 404 for a NUL byte in the path', async () => {
    expect(await get('/img/%00.svg')).toBe(404);
  });

  it('serves an existing image', async () => {
    expect(await get('/img/a.svg')).toBe(200);
  });

  it('serves the index page', async () => {
    expect(await get('/')).toBe(200);
  });

  it('answers 400 for malformed percent-encoding', async () => {
    expect(await get('/%E0%A4%A')).toBe(400);
  });
});
