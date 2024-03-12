import {createCookie} from '@remix-run/node';

import {singleton} from '#utils/singleton';

const jar = singleton('jar', {});

export async function mutate(request, key, mutator) {
  return serialize(key, await mutator(await parse(request, key)))
}

export async function parse(request, key, defaultValue) {
  if (!jar[key]) {
    jar[key] = createCookie(key);
  }
  return (await jar[key].parse(request.headers.get('Cookie'))) || defaultValue;
}

export async function serialize(key, data) {
  return jar[key].serialize(data);
}
