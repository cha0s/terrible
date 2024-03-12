import {Emitter} from './emitter';
import {eventSource} from './event-source';

export async function actionSource(request, init) {
  const emitter = new Emitter();
  return eventSource(request, (send) => {
    function handleEvent(data) {
      send(JSON.stringify(data), 'action');
    }
    emitter.addListener(handleEvent);
    const cleanup = init(emitter);
    return () => {
      cleanup();
      emitter.removeListener(handleEvent);
    };
  });
}
