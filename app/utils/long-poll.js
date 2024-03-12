import {stream} from './stream';

export function longPoll(request, init) {
  const headers = new Headers();
  headers.set('Content-Type', 'text/html');
  return stream(request, headers, init);
}
