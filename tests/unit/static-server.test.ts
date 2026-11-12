// @vitest-environment node
import fs from 'node:fs';
import http from 'node:http';
import type {AddressInfo} from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {createServer} from '../../server.mjs';

// The docs image serves the built site with server.mjs. Scanners send paths
// that the filesystem rejects with codes other than ENOENT (an overlong
// segment gives ENAMETOOLONG, a NUL byte gives ERR_INVALID_ARG_VALUE).
// serve-handler turns every such code into a 500; the site must answer 404.

let publicDir: string;
let server: http.Server;
let port: number;

function get(rawPath: string, headers: http.OutgoingHttpHeaders = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.get({host: '127.0.0.1', port, path: rawPath, headers}, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode ?? 0));
    });
    req.on('error', reject);
  });
}

function request(
  rawPath: string,
  method: 'GET' | 'HEAD' = 'GET',
): Promise<{status: number; location: string | undefined}> {
  return new Promise((resolve, reject) => {
    const req = http.request({host: '127.0.0.1', port, path: rawPath, method}, (res) => {
      res.resume();
      res.on('end', () => resolve({
        status: res.statusCode ?? 0,
        location: res.headers.location,
      }));
    });
    req.on('error', reject);
    req.end();
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
  for (const [name, content] of [
    ['docs/ai-agents/index.html', '<!doctype html><title>AI agents</title>'],
    ['assets/js/main.js', 'console.log("docs");'],
    ['sitemap.xml', '<urlset/>'],
    ['robots.txt', 'User-agent: *\nAllow: /\n'],
    ['404.html', '<!doctype html><title>Not found</title>'],
  ]) {
    const target = path.join(publicDir, name);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, content);
  }
  fs.copyFileSync(
    new URL('../../static/serve.json', import.meta.url),
    path.join(publicDir, 'serve.json'),
  );
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

describe('static server access log', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function expectReferrer(referer: string | undefined, expected: string) {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const headers = referer === undefined ? {} : {Referer: referer};
    expect(await get('/docs/ai-agents/', headers)).toBe(200);

    const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      '^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d\\.\\d{3}Z GET /docs/ai-agents/ 200 \\d+ms ref=' + escaped + '$',
    );
    await vi.waitFor(() => {
      const line = log.mock.calls
        .map(([message]) => message)
        .find((message) => typeof message === 'string' && message.includes(' GET /docs/ai-agents/ '));
      expect(line).toMatch(pattern);
    });
  }

  it.each(['savant.chat', 'www.savant.chat', 'dev.savant.chat'])(
    'logs only the path for %s, omitting the query and fragment',
    async (host) => {
      await expectReferrer(
        `https://${host}/docs/getting-started/?q=secret#frag`,
        '/docs/getting-started/',
      );
    },
  );

  it('logs only the origin for an external referrer', async () => {
    await expectReferrer('https://www.google.com/search?q=savant', 'https://www.google.com');
  });

  it('logs ref=- when the Referer header is absent', async () => {
    await expectReferrer(undefined, '-');
  });

  it.each(['not a url', '/docs/x'])('logs ref=- for a non-absolute URL: %s', async (referer) => {
    await expectReferrer(referer, '-');
  });

  it('percent-encodes spaces in a same-host referrer path', async () => {
    await expectReferrer('https://savant.chat/a b/?t=1', '/a%20b/');
  });

  it('logs ref=- for a non-HTTP scheme', async () => {
    await expectReferrer('android-app://com.google.android.gm/', '-');
  });
});

// Docusaurus builds trailing-slash routes, but serving a directory's index at a
// slashless URL returns 200 and leaves the client router on the wrong route.
describe('static server page redirects', () => {
  it('redirects GET /docs/ai-agents to its trailing-slash URL', async () => {
    const response = await request('/docs/ai-agents');
    expect(response.status).toBe(301);
    expect(response.location).toBe('/docs/ai-agents/');
  });

  it('preserves the query when redirecting GET /docs/ai-agents?x=1&y=2', async () => {
    const response = await request('/docs/ai-agents?x=1&y=2');
    expect(response.status).toBe(301);
    expect(response.location).toBe('/docs/ai-agents/?x=1&y=2');
  });

  it('redirects HEAD /docs/ai-agents to its trailing-slash URL', async () => {
    const response = await request('/docs/ai-agents', 'HEAD');
    expect(response.status).toBe(301);
    expect(response.location).toBe('/docs/ai-agents/');
  });

  it.each(['/docs/ai-agents/', '/'])('serves %s without a redirect', async (rawPath) => {
    expect(await request(rawPath)).toEqual({status: 200, location: undefined});
  });

  it.each(['/assets/js/main.js', '/img/a.svg', '/sitemap.xml', '/robots.txt'])(
    'serves the static file %s without a redirect',
    async (rawPath) => {
      expect(await request(rawPath)).toEqual({status: 200, location: undefined});
    },
  );

  it.each([
    '/blog/howto-load-non-standard-projects-to-savant-chat',
    '/blog/howto-load-non-standard-projects-to-savant-chat/',
  ])('redirects %s directly to the docs destination', async (rawPath) => {
    expect(await request(rawPath)).toEqual({
      status: 301,
      location: '/docs/howto-load-non-standard-projects-to-savant-chat/',
    });
  });

  it('answers 404 for /docs/nope without a redirect', async () => {
    expect(await request('/docs/nope')).toEqual({status: 404, location: undefined});
  });

  it('never redirects //docs/ai-agents to a protocol-relative URL', async () => {
    const response = await request('//docs/ai-agents');
    expect(response.location?.startsWith('//') ?? false).toBe(false);
  });

  it('does not redirect an encoded traversal path', async () => {
    expect((await request('/..%2f..%2fetc')).status).not.toBe(301);
  });

  it('preserves the existing clean-URL redirect for /404.html', async () => {
    expect(await request('/404.html')).toEqual({status: 301, location: '/404'});
  });
});
