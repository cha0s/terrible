import {renderToString} from 'react-dom/server';

import {Presence, State} from '#state/globals';
import {loadSession} from '#state/session';
import {longPoll} from '#utils/long-poll';

import PlayersChatMessage from '../play.$gameKey/players/chat/message';
import styles from '../play.$gameKey/players/chat/message/index.module.css';
import stylesheet from '../play.$gameKey/players/chat/message/index.module.css?raw';

const compiled = Object.entries(styles)
  .sort(([l], [r]) => r.length - l.length)
  .reduce((compiled, [raw, encoded]) => compiled.replaceAll(raw, encoded), stylesheet);

export async function loader({params, request}) {
  const {gameKey} = params;
  const session = await loadSession(request);
  if (!session) {
    throw new Response('', {status: 400});
  }
  const {loadGame} = await import('#state/game.server');
  const game = await loadGame(gameKey);
  if (!game || !game.players[session.id]) {
    throw new Response('', {status: 400});
  }
  return longPoll(request, (send, close) => {
    let messageOwner = false;
    let i = -1;
    function renderMessage(message) {
      if (!game.players[message.owner]) {
        return '';
      }
      let string = renderToString(
        <div className={`o${message.owner}`}>
          <PlayersChatMessage
            key={message.key}
            isShort={messageOwner === message.owner}
            message={message}
            name={''}
          />
        </div>,
      );
      string += `
        <style>
          .o${message.owner} .${styles.owner}:before {
            content: '${game.players[message.owner].name.replaceAll("'", "\\'")}';
          }
        </style>
      `;
      messageOwner = message.owner;
      return string;
    }
    send(
      `
        <!DOCTYPE html><title>.</title>
        <style>
          html,body{
            height: 100%;
          }
          body{
            margin:0;
          }
          ::-webkit-scrollbar {
            width: 12px;
          }
          ::-webkit-scrollbar-track {
            background: #333;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #777;
            border-radius: 20px;
            border: 3px solid #333;
          }
          .messages{
            display:flex;
            flex-direction:column-reverse;
            height: 100%;
            overflow-y:auto;
            scrollbar-width: thin;
            scrollbar-color: #777 #333;
          }
          .${styles.message}{font-size:0.75em;}
          ${compiled}
        </style>
        <div class="messages">
          ${game.messages.map(renderMessage).toReversed().join('')}
      `
        // minimize
        .split('\n').map((s) => s.trim()).join('')
    );
    let activePlayers = Object.values(game.players)
      .filter(({presence}) => presence === Presence.ACTIVE)
      .length;
    function onJoined() {
      activePlayers += 1;
      if (game.state === State.STARTING && 3 === activePlayers) {
        close();
      }
    }
    function onMessage({payload}) {
      // no-js autoscroll
      send(`<div style="order: ${i--}">${renderMessage(payload)}</div>`);
    }
    function onPresence({payload}) {
      if (Presence.ACTIVE === payload.presence) {
        activePlayers += 1;
        if (game.state === State.STARTING && 3 === activePlayers) {
          close();
        }
      }
      else {
        activePlayers -= 1;
        if (game.state === State.STARTING && 2 === activePlayers) {
          close();
        }
      }
    }
    function onRename({payload: {name, id}}) {
      send(`
        <style>
          .o${id} .${styles.owner}:before {
            content: '${name.replaceAll("'", "\\'")}';
          }
        </style>
      `);
    }
    game.addActionListener('rename', onRename);
    game.addActionListener('destroy', close);
    game.addActionListener('joined', onJoined);
    game.addActionListener('presence', onPresence);
    game.addActionListener('message', onMessage);
    game.addActionListener('state', close);
    return () => {
      game.removeActionListener('state', close);
      game.removeActionListener('destroy', close);
      game.removeActionListener('joined', onJoined);
      game.removeActionListener('presence', onPresence);
      game.removeActionListener('message', onMessage);
      game.removeActionListener('rename', onRename);
    };
  });
}
