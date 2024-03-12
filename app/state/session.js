import {redirect} from '@remix-run/react';

import namer from './namer';

export async function loadSession(request) {
  const {parse} = await import('#state/cookie.server');
  return parse(request, 'session');
}

export async function juggleSession(request) {
  const session = await loadSession(request);
  const url = new URL(request.url);
  if (!session) {
    if (!url.searchParams.has('session')) {
      const [id] = crypto.getRandomValues(new Uint32Array(1));
      throw redirect(`${url.origin}${url.pathname}?session`, {
        headers: {
          'Set-Cookie': await writeSession({id, name: namer()}),
        },
      });
    }
  }
  else if (url.searchParams.has('session')) {
    throw redirect(`${url.origin}${url.pathname}`);
  }
  return session ? session : {id: 0};
}

async function writeSession(session) {
  const {serialize} = await import('#state/cookie.server');
  return serialize('session', session);
}
