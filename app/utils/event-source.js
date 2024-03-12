import {stream} from './stream';

export function eventSource(request, init) {
  const headers = new Headers();
  headers.set('Content-Type', 'text/event-stream');
  return stream(request, headers, (send, close) => {
    const encoder = new TextEncoder();
    function sendEvent(data, event = 'message') {
      send(encoder.encode(`event: ${event}\n`));
      send(encoder.encode(`data: ${data}\n\n`));
    }
    return init(sendEvent, close);
  });
}
