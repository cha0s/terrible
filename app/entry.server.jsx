import {readdir, readFile} from 'node:fs/promises';
import {basename, join} from 'node:path';
import {PassThrough} from 'node:stream';

import {createReadableStreamFromReadable} from '@remix-run/node';
import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import color from 'picocolors';
import {renderToPipeableStream} from 'react-dom/server';

import {readJsonPacks} from '#state/cards';
import {Game} from '#state/game';

const ABORT_DELAY = 5_000;

(async () => {
  const {createGameServerLoop} = await import('#state/game.server');
  const loadStart = Date.now();
  [Game.packs, Game.tokens] = await Promise.all([
    readdir('data/packs').then(async (paths) => (
      (await Promise.all(
        paths
          .filter((path) => path.endsWith('.json'))
          .map(async (path) => (
            readJsonPacks(JSON.parse(await readFile(join('data/packs', path))))
          )),
      ))
        .flat()
    )),
    readdir('data/tokens').then((paths) => (
      paths
        .filter((path) => path.endsWith('.json'))
        .reduce(async (tokens, path) => ({
          ...(await tokens),
          [basename(path, '.json')]: JSON.parse(await readFile(join('data/tokens', path))),
        }), {})
    )),
  ]);
  Game.packs = Game.packs.map((pack, i) => ({...pack, id: i}));
  console.log(
    'Loaded %s packs and %s tokens in %s ms',
    color.yellow(Game.packs.length),
    color.yellow(Object.keys(Game.tokens).length),
    color.cyan(Date.now() - loadStart),
  );
  createGameServerLoop();
})();

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return isbot(request.headers.get('user-agent') || '')
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

function handleBotRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    const {pipe, abort} = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    const {pipe, abort} = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        async onShellReady() {
          const {requestBody} = await import('#state/game.server');
          const body = await requestBody(request);
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
