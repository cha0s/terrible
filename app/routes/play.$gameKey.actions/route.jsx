import {loadSession} from '#state/session';
import {actionSource} from '#utils/action-source';

export async function loader({params, request}) {
  const {loadGame, startTimeout} = await import('#state/game.server');
  const {gameKey} = params;
  const session = await loadSession(request);
  if (!session) {
    throw new Response('', {status: 400});
  }
  const game = await loadGame(gameKey);
  if (!game || !game.players[session.id]) {
    throw new Response('', {status: 400});
  }
  const player = game.players[session.id];
  const {emitters} = player;
  // Close long polls since this request was made with JS.
  player.closeLongPolls();
  return actionSource(request, (emitter) => {
    emitters.push(emitter);
    return () => {
      emitters.splice(emitters.indexOf(emitter), 1);
      if (0 === emitters.length) {
        player.timeout = startTimeout(gameKey, session);
      }
    };
  });
}
