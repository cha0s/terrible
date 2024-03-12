import {readdir} from 'node:fs/promises';

import {createRequestHandler} from '@remix-run/express';
import {installGlobals} from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import color from 'picocolors';

if (0 === (await readdir('data/packs')).length) {
  console.error(`
    You need some packs to play! Go check out ${
      color.cyan('https://github.com/crhallberg/json-against-humanity')
    }
    and copy e.g. ${
      color.green('cah-all-full.json')
    } to the ${
      color.yellow('data/packs')
    } directory.
  `);
  process.exit(1);
}

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : () => import('./build/server/index.js');

// Warm up caches.
await build();

const app = express();
app.disable('x-powered-by');

app.use(compression());

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
}
else {
  app.use(
    '/assets',
    express.static('build/client/assets', {immutable: true, maxAge: '1y'})
  );
}
app.use(express.static('build/client', {maxAge: '1h'}));

// logs
app.use(morgan('tiny'));

// handle SSR requests
app.all('*', createRequestHandler({build}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
