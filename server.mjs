// Static server for the built docs site (the Docker serve stage runs it).
//
// It replaces `serve . -l 3000` (serve@14.2.1) with the same handler
// (serve-handler 6.1.5), the same serve.json, the same gzip compression and
// the same ETag behaviour.
//
// The one difference is the lstat override below. serve-handler lets only
// ENOENT and ENOTDIR through its lstat error checks; any other code becomes a
// 500. A path the filesystem cannot name (an overlong segment gives
// ENAMETOOLONG, a NUL byte gives ERR_INVALID_ARG_VALUE) does not exist, so we
// report it as ENOENT and the request gets the normal 404.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {promisify} from 'node:util';
import compression from 'compression';
import handler from 'serve-handler';

const compress = promisify(compression());

const NOT_A_NAME = new Set(['ENAMETOOLONG', 'EINVAL', 'ERR_INVALID_ARG_VALUE']);

async function lstat(target) {
  try {
    return await fs.promises.lstat(target);
  } catch (err) {
    if (!NOT_A_NAME.has(err.code)) throw err;
    const notFound = new Error(`ENOENT: ${err.code} for lstat`);
    notFound.code = 'ENOENT';
    throw notFound;
  }
}

const methods = {lstat};

function loadConfig(publicDir) {
  // serve reads serve.json from the served directory; keep doing that.
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(path.join(publicDir, 'serve.json'), 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  // serve sets etag from its --no-etag flag, which defaults to on.
  return {...config, public: publicDir, etag: true};
}

export function createServer(publicDir) {
  const config = loadConfig(path.resolve(publicDir));
  return http.createServer((request, response) => {
    const started = Date.now();
    response.on('finish', () => {
      console.log(
        `${new Date(started).toISOString()} ${request.method} ${request.url} ${response.statusCode} ${Date.now() - started}ms`,
      );
    });
    compress(request, response)
      .then(() => handler(request, response, config, methods))
      .catch((err) => {
        console.error(err);
        if (!response.headersSent) response.statusCode = 500;
        response.end();
      });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createServer(process.env.PUBLIC_DIR ?? '/app');
  server.listen(port, () => console.log(`serving on :${port}`));
  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
