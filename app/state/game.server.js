import {PassThrough} from 'node:stream';

import {Delay, Presence, State} from '#state/globals';
import {loadSession} from '#state/session';
import {singleton} from '#utils/singleton';
import {TopLevelLongPoll} from '#utils/top-level-long-poll';

import {unreadUpdateStyle} from '../routes/play.$gameKey/bar';
import {numberUpdateStyle} from '../routes/play.$gameKey/bar/timeout/number';
import {
  playerJoinedUpdateStyle,
  playerNameUpdateStyle,
  playerPresenceUpdateStyle,
  playerRemoveUpdateStyle,
  sortPlayers,
} from '../routes/play.$gameKey/players/list';

import {Game} from './game.js';
import namer from './namer.js';

const alphabet = 'ABCDEFHIJKLMNPQRSTUVWXYZ';

const free = singleton('free', [
  'BOOB', 'JUNK', 'BUTT', 'POOP', 'FART', 'CHIT', 'MEOW', 'WOOF', 'BORK', 'DERP', 'YAWN', 'ZOOM',
  'GEEK', 'BEEP', 'HONK', 'GROK', 'NERD', 'PLOP', 'YIKE', 'JAZZ', 'WINK', 'GLOP', 'HISS', 'ZEST',
  'JIVE', 'GAGA', 'FLUB', 'JEEP', 'OOPS', 'VIBE', 'ZING', 'FLIP', 'ZEAL', 'VAMP', 'YOGA', 'GOOP',
  'FIZZ', 'ZANY', 'DORK', 'FLAP', 'HUNK', 'YOWL', 'WISP', 'YAWP', 'DING', 'DONG', 'WANG', 'BURP',
].reverse().map((gameKey) => [gameKey, new Game()]));

const games = singleton('games', new Map());

function createKey() {
  let gameKey;
  do {
    gameKey = '';
    for (let i = 0; i < 4; ++i) {
      gameKey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
  } while (games.has(gameKey));
  return gameKey;
}

export async function createGame(session, formData) {
  const [gameKey, game] = free.length > 0 ? free.pop() : [createKey(), new Game()];
  games.set(gameKey, game);
  game.lastStateChange = Date.now();
  game.maxPlayers = +formData.get('maxPlayers');
  game.owner = session.id;
  game.scoreToWin = +formData.get('scoreToWin');
  game.secondsPerRound = +formData.get('secondsPerRound');
  game.packs = formData.getAll('packs').map((pack) => +pack);
  const bots = +formData.get('bots');
  for (let i = 1; i <= bots; ++i) {
    game.addPlayer(-i, namer());
  }
  return gameKey;
}

export function createGameServerLoop() {
  return setInterval(() => {
    const pruning = [];
    for (const [gameKey, game] of games.entries()) {
      if (!game.tick()) {
        pruning.push(gameKey);
      }
    }
    for (let i = 0; i < pruning.length; ++i) {
      const gameKey = pruning[i];
      free.push([gameKey, games.get(gameKey)]);
      games.delete(gameKey);
    }
  }, 100);
}

export async function joinList() {
  const list = [];
  for (const [gameKey, game] of games.entries()) {
    const players = Object.entries(game.players);
    if (9 === players.length) {
      continue;
    }
    list.push({
      completed: (
        players.length > 0
          ? (
            players
              .map(([, {score}]) => score)
              .toSorted((l, r) => l - r)
              .pop()
            / game.scoreToWin
          )
          : 0
      ),
      key: gameKey,
      playerCount: (
        players
          .filter(([, {presence}]) => Presence.ACTIVE === presence)
          .length
      ),
      state: game.state,
    });
    if (100 === list.length) {
      break;
    }
  }
  return list;
}

export async function loadGame(gameKey) {
  return games.get(gameKey);
}

export async function requestBody(request) {
  const session = await loadSession(request);
  if (!session) {
    return new PassThrough();
  }
  const {pathname, searchParams} = new URL(request.url);
  const matches = pathname.match(/^\/play\/([A-Z]+)$/);
  return matches
    ? new TopLevelLongPoll(async (send) => {
      const gameKey = matches[1];
      const game = await loadGame(gameKey);
      if (request.signal.aborted) return;
      const player = game.players[session.id];
      let resolve;
      const promise = new Promise((resolve_) => {
        resolve = resolve_;
      });
      let closed = false;
      let handle;
      function close() {
        if (closed) {
          return;
        }
        closed = true;
        if (handle) {
          clearTimeout(handle);
        }
        game.removeActionListener('destroy', refresh);
        game.removeActionListener('presence', presence);
        game.removeActionListener('joined', joined);
        game.removeActionListener('message', message);
        game.removeActionListener('remove', remove);
        game.removeActionListener('rename', rename);
        game.removeActionListener('state', refresh);
        request.signal.removeEventListener('abort', close);
        const index = player.longPolls.indexOf(close);
        if (-1 !== index) {
          player.longPolls.splice(index, 1);
          if (0 === player.longPolls.length) {
            player.timeout = startTimeout(gameKey, session);
          }
        }
        resolve();
      }
      const refresh = () => {
        send(`<meta http-equiv="refresh" content="0;URL=/play/${gameKey}" />`);
        close();
      }
      async function pumpTimeout() {
        let timeout = game.timeoutToJSON();
        const fractional = timeout < 10;
        let c = timeout;
        let m;
        if (fractional) {
          [c, m] = `${Math.max(0, timeout)}`.split('.');
        }
        send(numberUpdateStyle(c, m));
        handle = setTimeout(pumpTimeout, fractional ? 77 : 1_000);
      }
      let playerCount = 0;
      const playersRemoved = [];
      const playerMap = {};
      const players = Object.entries(game.players);
      players
        .sort(sortPlayers(game))
        .forEach(([id]) => {
          playerMap[id] = playerCount++;
        });
      function rename({payload}) {
        send(playerNameUpdateStyle(playerMap[payload.id], payload.name));
      }
      let activePlayers = players
        .filter(([, {presence}]) => presence === Presence.ACTIVE)
        .length;
      function presence({payload}) {
        if (Presence.ACTIVE === payload.presence) {
          activePlayers += 1;
          if (game.state === State.STARTING && 3 === activePlayers) {
            refresh();
            return;
          }
        }
        else {
          activePlayers -= 1;
          if (game.state === State.STARTING && 2 === activePlayers) {
            refresh();
            return;
          }
        }
        send(playerPresenceUpdateStyle(payload.presence, playerMap[payload.id]));
      }
      function joined({payload}) {
        activePlayers += 1;
        if (game.state === State.STARTING && 3 === activePlayers) {
          refresh();
          return;
        }
        if (!playerMap[payload.id]) {
          playerMap[payload.id] = 9 === playerCount ? playersRemoved.shift() : playerCount++;
        }
        send(playerJoinedUpdateStyle(playerMap[payload.id], payload.player));
      }
      function remove({payload}) {
        playersRemoved.push(payload);
        send(playerRemoveUpdateStyle(playerMap[payload]));
      }
      let unread = 0;
      function message({payload}) {
        if (searchParams.has('chat') || payload.owner === session.id) {
          return;
        }
        send(unreadUpdateStyle(++unread));
      }
      handle = pumpTimeout();
      request.signal.addEventListener('abort', close);
      player.longPolls.push(close);
      game.addActionListener('destroy', refresh);
      game.addActionListener('presence', presence);
      game.addActionListener('joined', joined);
      game.addActionListener('message', message);
      game.addActionListener('remove', remove);
      game.addActionListener('rename', rename);
      game.addActionListener('state', refresh);
      return promise;
    })
    : new PassThrough();
}

export function startTimeout(gameKey, session) {
  return setTimeout(async () => {
    const game = await loadGame(gameKey);
    if (!game || !game.players[session.id]) {
      return;
    }
    game.setPlayerInactive(session.id, async () => {
      const game = await loadGame(gameKey);
      if (!game || !game.players[session.id]) {
        return;
      }
      game.removePlayer(session.id);
    });
  }, Delay.INACTIVE * 1000);
}
