export function stream(request, headers, init) {
  headers.set('Connection', 'keep-alive');
  headers.set('Cache-Control', 'no-store, no-transform');
  const stream = new ReadableStream({
    start(controller) {
      function send(chunk) {
        controller.enqueue(chunk);
      }
      const cleanup = init(send, close);
      let closed = false;
      function close() {
        if (closed) {
          return;
        }
        cleanup();
        closed = true;
        request.signal.removeEventListener('abort', close);
        controller.close();
      }
      request.signal.addEventListener('abort', close);
      if (request.signal.aborted) {
        close();
      }
    },
  });
  return new Response(stream, {
    headers,
    status: 200,
  });
}
