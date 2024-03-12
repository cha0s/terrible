import {
  json,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import {useEffect, useState} from 'react';

import FluidText from '#fluid-text';
import {GameContext, SelectionContext, SessionContext} from '#hooks/context';
import {Game} from '#state/game';
import {State} from '#state/globals';
import {juggleSession, loadSession} from '#state/session';

import '../../fonts/index.css';
import Bar from './bar';
import styles from './index.module.css';
import Players from './players';

export const meta = ({params: {gameKey}}) => {
  return [{title: `${gameKey} | Doing Terrible`}];
};

// :)
export function shouldRevalidate() {
  return false;
}

export async function action({params, request}) {
  const {loadGame} = await import('#state/game.server');
  const formData = await request.formData();
  const {gameKey} = params;
  if (formData.has('cancel')) {
    return redirect(`/play/${gameKey}?chat`);
  }
  const game = await loadGame(gameKey);
  if (!game) {
    throw new Response('', {status: 400});
  }
  const session = await loadSession(request);
  if (!session.id || !game.players[session.id]) {
    throw new Response('', {status: 400});
  }
  game.handleAction(formData, session);
  // no-js chat message
  if (formData.has('chat')) {
    return redirect(`/play/${gameKey}/chat-form`);
  }
  else {
    return redirect(`/play/${gameKey}`);
  }
}

export async function loader({params, request}) {
  const {gameKey} = params;
  const {loadGame} = await import('#state/game.server');
  const game = await loadGame(gameKey);
  if (!game) {
    throw redirect('/');
  }
  const session = await juggleSession(request);
  if (
    9 === Object.keys(game.players).length
    && !game.players[session.id]
  ) {
    throw redirect('/join?full');
  }
  return json({
    game: game.loaderData(session),
    session,
  });
}

// import.meta.glob
import * as starting from './status/starting';
import * as answering from './status/answering';
import * as awarding from './status/awarding';
import * as awarded from './status/awarded';
import * as finished from './status/finished';
import * as paused from './status/paused';
const Components = {
  [State.STARTING]: starting,
  [State.ANSWERING]: answering,
  [State.AWARDING]: awarding,
  [State.AWARDED]: awarded,
  [State.FINISHED]: finished,
  [State.PAUSED]: paused,
};

const NeedsCookie = {
  Black: () => <FluidText><div>Need cookies enabled to play!</div></FluidText>,
  White: () => <FluidText><div className={styles['no-cookie']}>Sorry!</div></FluidText>,
};

function Play() {
  const [searchParams] = useSearchParams();
  const mutedTuple = useState(true);
  const [isMuted] = mutedTuple;
  const unreadTuple = useState(0);
  const navigate = useNavigate();
  const {gameKey} = useParams();
  const {
    game,
    session,
  } = useLoaderData();
  const chatOpenTuple = useState(searchParams.has('chat'));
  const selectionTuple = useState(
    game.players[session.id]?.answer || searchParams.getAll('selection').map((i) => +i) || []
  );
  const setSelection = selectionTuple[1];
  const [, forceRender] = useState();
  const [message, setMessage] = useState('');
  useEffect(() => {
    switch (game.state) {
      case State.ANSWERING:
      case State.AWARDING:
        setMessage(game.blackCard.replace(/_+/g, 'blank'));
        break;
      case State.AWARDED:
      case State.FINISHED: {
        const text = game.blackCard;
        let utterance = '';
        const blanksCount = text.split('_').length - 1;
        if (0 === blanksCount) {
          utterance += `${text} ${game.answers[game.winner[0]][0]}`;
        }
        else {
          utterance += game.answers[game.winner[0]]
            .reduce((r, text) => r.replace(/_+/, text), text);
        }
        utterance += '.\n';
        utterance += `gg ${game.players[game.winner[1]].name}`;
        setMessage(utterance);
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.state, setMessage]);
  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis?.cancel();
    }
    else {
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(message));
    }
  }, [isMuted, message]);
  // Mutation.
  useEffect(() => {
    function onResize() {
      const em = parseFloat(getComputedStyle(document.body).fontSize);
      game.showUnread = !chatOpenTuple[0] && window.innerWidth < 80 * em;
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [game, chatOpenTuple]);
  useEffect(() => {
    function handler(event) {
      for (const action of JSON.parse(event.data)) {
        const {state: lastState} = game;
        Game.mutateJson(game, action);
        switch (action.type) {
          case 'destroy': {
            navigate('/');
            return;
          }
          case 'message':
            if (game.showUnread) {
              unreadTuple[1](unreadTuple[0] + 1);
            }
            break;
          case 'state':
            if (![game.state, lastState].includes(State.PAUSED)) {
              setSelection([]);
            }
            break;
        }
      }
      forceRender(Math.random());
    }
    let eventSource = new EventSource(`/play/${gameKey}/actions`);
    eventSource.addEventListener('action', handler);
    eventSource.addEventListener('error', () => {
      window.location.reload();
    });
    return () => {
      eventSource.removeEventListener('action', handler);
      eventSource.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, navigate]);
  const Component = session.id ? Components[game.state] : NeedsCookie;
  return (
    <SessionContext.Provider value={session}>
      <GameContext.Provider value={game}>
        <SelectionContext.Provider value={selectionTuple}>
          <div className={styles.play}>
            <Players isOpen={chatOpenTuple[0]} />
            <div className={styles['black-and-white']}>
              <div className={styles['black-wrapper']}>
                <Bar
                  mutedTuple={mutedTuple}
                  chatOpenTuple={chatOpenTuple}
                  gameKey={gameKey}
                  unreadTuple={unreadTuple}
                />
                <div className={styles.black}><Component.Black /></div>
              </div>
              <div className={styles['white-wrapper']}>
                <div className={styles.white}><Component.White /></div>
              </div>
            </div>
          </div>
        </SelectionContext.Provider>
      </GameContext.Provider>
    </SessionContext.Provider>
  );
}

Play.defaultProps = {};

Play.propTypes = {};

Play.displayName = 'Play';

export default Play;
