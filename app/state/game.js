import {Delay, Presence, State} from '#state/globals';

import {sample, shuffle} from './cards.js';
import namer from './namer.js';

class Player {
  constructor() {
    this.reset();
  }
  closeLongPolls() {
    const {longPolls} = this;
    this.longPolls = [];
    longPolls.forEach((longPoll) => {
      longPoll();
    });
  }
  emit(events) {
    for (const emitter of this.emitters) {
      emitter.emit(events);
    }
  }
  reset() {
    this.answer = [];
    this.cards = [];
    this.emitters = [];
    this.longPolls = [];
    this.name = '';
    this.score = 0;
    this.presence = Presence.ACTIVE;
    this.timeout = undefined;
  }
  set timeout(timeout) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = timeout;
  }
  toJSON() {
    return {
      answer: this.answer.length > 0,
      name: this.name,
      presence: this.presence,
      score: this.score,
    };
  }
}

export class Game {
  static packs = [];
  static tokens = {};
  constructor() {
    this.reset();
  }
  acceptAward(answerer) {
    const answerers = Object.entries(this.answers);
    this.winner = [answerer, +answerers[answerer][0]];
    this.players[this.winner[1]].score++;
    const actions = [
      {type: 'winner', payload: this.winner},
      {
        type: 'score',
        payload: {
          id: +this.winner[1],
          score: this.players[this.winner[1]].score,
        },
      },
    ];
    this.lastStateChange = Date.now();
    if (this.players[this.winner[1]].score === this.scoreToWin) {
      this.state = State.FINISHED;
      actions.push({type: 'timeout', payload: Delay.DESTRUCT});
    }
    else {
      this.state = State.AWARDED;
      actions.push({type: 'timeout', payload: Delay.AWARDED});
    }
    actions.push({type: 'state', payload: this.state});
    return actions;
  }
  addPlayer(id, name) {
    this.players[id] = new Player();
    this.players[id].name = name;
    return this.players[id];
  }
  addActionListener(type, listener) {
    if (!this.actionListeners[type]) {
      this.actionListeners[type] = [];
    }
    this.actionListeners[type].push(listener);
  }
  allocateBlackCards() {
    const {packs} = this.constructor;
    const worstCase = 1 + this.maxPlayers * (this.scoreToWin - 1);
    const pool = sample(this.packs.map((id) => ({id, cards: packs[id].black})), worstCase);
    for (let i = 0; i < pool.length; ++i) {
      this.blackCards[i] = pool[i].pack * 65536 + pool[i].card;
    }
    shuffle(this.blackCards);
  }
  allocateBlackReplacements() {
    const {packs, tokens} = this.constructor;
    for (let i = 0; i < this.blackCards.length; ++i) {
      const encoded = this.blackCards[i];
      const [pack, card] = [Math.floor(encoded / 65536), encoded % 65536];
      if (!packs[pack].tokens?.[card]?.black) {
        continue;
      }
      this.blackCardReplacements[encoded] = [];
      for (let j = 0; j < packs[pack].tokens[card].black.length; ++j) {
        const token = packs[pack].tokens[card].black[j];
        if (tokens[token]) {
          const sample = Math.floor(Math.random() * tokens[token].length);
          this.blackCardReplacements[encoded].push([token, sample]);
        }
      }
    }
  }
  allocateCards() {
    this.allocateBlackCards();
    this.allocateBlackReplacements();
    this.allocateWhiteCards();
    this.allocateWhiteReplacements();
  }
  allocateWhiteCards() {
    const {packs} = this.constructor;
    // Derive the worst case number of white cards from the actual number of answers required from
    // the allocated black cards.
    const totalAnswers = this.blackCards
      // Very last round doesn't matter.
      .slice(0, -1)
      // Map to card text and accumulate the number of blanks.
      .map((encoded) => packs[Math.floor(encoded / 65536)].black[encoded % 65536])
      .reduce((total, text) => total + (text.match(/_/g)?.length || 1), 0)
    const total = this.packs.reduce((total, id) => total + packs[id].white.length, 0);
    const worstCase = this.maxPlayers * 9 + this.maxPlayers * 9 * totalAnswers;
    let pool;
    // Less than worst case? Allocate them all and keep a discard pile.
    if (total <= worstCase) {
      this.discard = [];
      pool = Array(total);
      let i = 0;
      for (let j = 0; j < this.packs.length; ++j) {
        const {white} = packs[this.packs[j]];
        for (let k = 0; k < white.length; ++k) {
          pool[i++] = {pack: this.packs[j], card: k};
        }
      }
    }
    // Sample a random distribution of the worst-case amount. No discard needed.
    else {
      pool = sample(this.packs.map((id) => ({id, cards: packs[id].white})), worstCase);
    }
    for (let i = 0; i < pool.length; ++i) {
      this.whiteCards[i] = pool[i].pack * 65536 + pool[i].card;
    }
    shuffle(this.whiteCards);
  }
  allocateWhiteReplacements() {
    const {packs, tokens} = this.constructor;
    for (let i = 0; i < this.whiteCards.length; ++i) {
      const encoded = this.whiteCards[i];
      const [pack, card] = [Math.floor(encoded / 65536), encoded % 65536];
      if (!packs[pack].tokens?.[card]?.white) {
        continue;
      }
      this.whiteCardReplacements[encoded] = [];
      for (let j = 0; j < packs[pack].tokens[card].white.length; ++j) {
        const token = packs[pack].tokens[card].white[j];
        if (tokens[token]) {
          const sample = Math.floor(Math.random() * tokens[token].length);
          this.whiteCardReplacements[encoded].push([token, sample]);
        }
      }
    }
  }
  static check(formData) {
    const {packs} = this;
    const errors = {};
    const maxPlayers = +formData.get('maxPlayers');
    const scoreToWin = +formData.get('scoreToWin');
    // Check that we have enough cards for the worst case.
    const packIds = formData.getAll('packs').map((pack) => +pack);
    const blackWorstCase = 1 + maxPlayers * (scoreToWin - 1);
    if (blackWorstCase > packIds.reduce((total, id) => total + packs[id].black.length, 0)) {
      errors.black = 'Not enough black cards, select more packs!';
    }
    const whiteWorstCase = maxPlayers * 9;
    if (whiteWorstCase > packIds.reduce((total, id) => total + packs[id].white.length, 0)) {
      errors.white = 'Not enough white cards, select more packs!';
    }
    return errors;
  }
  checkAnswers() {
    const actions = [];
    const players = Object.entries(this.players)
      .filter(([, {presence}]) => presence === Presence.ACTIVE)
      .filter(([id]) => +id !== this.czar);
    if (!players.every(([, {answer}]) => answer.length > 0)) {
      return actions;
    }
    this.answers = players.reduce(
      (answers, [id, player]) => ({
        ...answers,
        [id]: player.answer
          .map((card) => [card, this.renderCard('white', player.cards[card])]),
      }),
      {},
    );
    players.forEach(([id, player]) => {
      player.answer = [];
      actions.push({type: 'answer', payload: [+id, false]});
    });
    actions.push({
      type: 'answers',
      payload: Object.values(this.answers)
        .map((answer) => answer.map(([, rendered]) => rendered)),
    });
    this.lastStateChange = Date.now();
    if (this.czar < 0 || Presence.INACTIVE === this.players[this.czar].presence) {
      actions.push(...this.forceAward());
    }
    else {
      this.state = State.AWARDING;
      actions.push(
        {type: 'state', payload: State.AWARDING},
        {type: 'timeout', payload: this.secondsPerRound},
      );
    }
    return actions;
  }
  dealWhiteCard() {
    if (0 === this.whiteCards.length) {
      this.whiteCards = this.discard;
      this.discard = [];
      shuffle(this.whiteCards);
    }
    return this.whiteCards.pop();
  }
  discardAnswers() {
    const discarding = [];
    Object.entries(this.answers)
      .forEach(([id, answer]) => {
        answer.forEach(([card]) => {
          if (this.discard) {
            discarding.push(this.players[id].cards[card]);
          }
          const whiteCard = this.dealWhiteCard();
          this.players[id].cards[card] = whiteCard;
          this.players[id].emit([{
            type: 'card',
            payload: [
              +id,
              +card,
              this.renderCard('white', whiteCard),
            ],
          }]);
        });
      });
    if (this.discard) {
      this.discard.push(...discarding);
    }
    this.answers = {};
    return [{type: 'answers', payload: {}}];
  }
  emit(actions) {
    for (const id in this.players) {
      this.players[id].emit(actions);
    }
    for (const action of actions) {
      if (this.actionListeners[action.type]) {
        const listeners = [...this.actionListeners[action.type]];
        for (const listener of listeners) {
          listener(action);
        }
      }
    }
  }
  forceAnswers(players) {
    const count = Math.max(1, this.blackCard.split('_').length - 1);
    return players
      .map(([id, player]) => {
        player.answer = [];
        for (let i = 0; i < count; ++i) {
          player.answer.push(i);
        }
        return {type: 'answer', payload: [+id, true]};
      });
  }
  forceAward() {
    return this.acceptAward(Math.floor(Math.random() * Object.keys(this.answers).length));
  }
  handleAction(formData, session) {
    switch (formData.get('action')) {
      case 'answer': {
        switch (this.state) {
          case State.ANSWERING:
            this.players[session.id].answer = formData.getAll('selection');
            this.emit([
              {type: 'answer', payload: [session.id, true]},
              ...this.checkAnswers(),
            ]);
            break;
          case State.AWARDING:
            this.emit(this.acceptAward(formData.get('selection')));
            break;
        }
        break;
      }
      case 'bots': {
        if (State.PAUSED !== this.state) {
          throw new Response('', {status: 400});
        }
        const activePlayers = Object.entries(this.players)
          .filter(([, {presence}]) => presence === Presence.ACTIVE);
        const needed = 3 - activePlayers.length;
        if (needed <= 0) {
          throw new Response('', {status: 400});
        }
        this.lastStateChange = Date.now();
        this.state = State.ANSWERING;
        const actions = [
          {type: 'state', payload: this.state},
          {type: 'timeout', payload: this.secondsPerRound},
        ];
        const bots = [];
        let id = Math.min(0, activePlayers.reduce((lowest, [id]) => Math.min(lowest, id), 0));
        for (let i = 1; i <= needed; ++i) {
          const bot = this.addPlayer(--id, namer());
          for (let i = 0; i < 9; ++i) {
            bot.cards.push(this.dealWhiteCard());
          }
          bots.push([id, bot]);
          actions.push(
            {type: 'joined', payload: {id, player: bot}},
          );
        }
        actions.push(
          ...this.forceAnswers(bots),
          ...this.checkAnswers(),
        );
        this.emit(actions);
        break;
      }
      case 'message': {
        const message = formData.get('message');
        if ('' === message.trim() || message.length > 1024) {
          throw new Response('', {status: 400});
        }
        const payload = {
          key: parseFloat(formData.get('key')),
          owner: session.id,
          text: message,
          timestamp: Date.now(),
        };
        this.messages.push(payload);
        while (this.messages.length > 100) {
          this.messages.shift();
        }
        this.emit([{type: 'message', payload}]);
        break;
      }
      case 'rename': {
        const name = formData.get('name');
        if (0 === name.length) {
          return;
        }
        if (name.length > 24) {
          throw new Response('', {status: 400});
        }
        this.players[session.id].name = name;
        this.emit([{type: 'rename', payload: {id: session.id, name}}]);
        break;
      }
      case 'start': {
        if (![State.FINISHED, State.STARTING].includes(this.state)) {
          throw new Response('', {status: 400});
        }
        if (session.id !== this.owner) {
          throw new Response('', {status: 401});
        }
        this.allocateCards();
        this.answers = {};
        this.blackCard = this.renderCard('black', this.blackCards[0]);
        this.czar = +Object.keys(this.players)[1];
        this.lastStateChange = Date.now();
        this.state = State.ANSWERING;
        const actions = [];
        const bots = [];
        Object.entries(this.players)
          .forEach(([id, player]) => {
            player.score = 0;
            actions.push({type: 'score', payload: {id: +id, score: 0}});
            player.cards = [];
            for (let i = 0; i < 9; ++i) {
              player.cards.push(this.dealWhiteCard());
            }
            player.emit(player.cards.map((card, i) => ({
              type: 'card',
              payload: [
                +id,
                +i,
                this.renderCard('white', card),
              ],
            })));
            if (+id < 0) {
              bots.push([id, player]);
            }
          });
        this.emit([
          ...actions,
          ...this.forceAnswers(bots),
          {type: 'answers', payload: {}},
          {type: 'black-card', payload: this.blackCard},
          {type: 'czar', payload: this.czar},
          {type: 'state', payload: this.state},
          {type: 'timeout', payload: this.secondsPerRound},
        ]);
        break;
      }
    }
  }
  loaderData(session) {
    const json = this.toJSON();
    if (!session.id) {
      return json;
    }
    this.emit(
      this.sideEffectsForSession(session)
        .map((action) => {
          this.constructor.mutateJson(json, action);
          return action;
        }),
    );
    const player = this.players[session.id];
    json.players[session.id] = {
      ...player.toJSON(),
      answer: player.answer.length > 0 && State.ANSWERING === this.state ? player.answer : false,
      cards: player.cards.map((card) => this.renderCard('white', card)),
    };
    return json;
  }
  static mutateJson(game, action) {
    const {type, payload} = action;
    switch (type) {
      case 'answer':
        game.players[payload[0]].answer = payload[1];
        break;
      case 'answers':
        game.answers = payload;
        break;
      case 'black-card':
        game.blackCard = payload;
        break;
      case 'card':
        game.players[payload[0]].cards[payload[1]] = payload[2];
        break;
      case 'czar':
        game.czar = payload;
        break;
      case 'destroy':
        game.destroyed = true;
        break;
      case 'joined': {
        const {id, player} = payload;
        game.players[id] = player;
        break;
      }
      case 'message': {
        const index = game.messages.findLastIndex(({key}) => key == payload.key);
        if (-1 === index) {
          game.messages.push(payload);
        }
        else {
          game.messages[index] = payload;
        }
        break;
      }
      case 'owner':
        game.owner = payload;
        break;
      case 'presence':
        game.players[payload.id].presence = payload.presence;
        break;
      case 'remove':
        delete game.players[payload];
        break;
      case 'rename': {
        const {id, name} = payload;
        game.players[id].name = name;
        break;
      }
      case 'score':
        game.players[payload.id].score = payload.score;
        break;
      case 'state':
        game.state = payload;
        break;
      case 'timeout':
        // Little nudge for cache breaking.
        game.timeout = payload + (Math.random() * 0.001);
        break;
      case 'winner':
        game.winner = payload;
        break;
    }
  }
  removeActionListener(type, listener) {
    if (!this.actionListeners[type]) {
      return;
    }
    const listeners = this.actionListeners[type];
    listeners.splice(listeners.indexOf(listener), 1);
  }
  removePlayer(id) {
    this.emit([
      {type: 'remove', payload: id},
    ]);
    (this.discard ? this.discard : this.whiteCards).push(...this.players[id].cards);
    this.players[id].reset();
    delete this.players[id];
  }
  renderCard(type, encoded) {
    const {packs, tokens} = this.constructor;
    let text = packs[Math.floor(encoded / 65536)][type][encoded % 65536];
    this[`${type}CardReplacements`][encoded]?.forEach(([token, replacement]) => {
      text = text.replace(`[${token}]`, tokens[token][replacement]);
    });
    return text;
  }
  reset() {
    this.actionListeners = {};
    this.answers = {};
    this.blackCard = '';
    this.blackCards = [];
    this.blackCardReplacements = [];
    this.czar = undefined;
    this.packs = [];
    this.lastStateChange = 0;
    this.maxPlayers = 0;
    this.messages = [];
    this.owner = undefined;
    for (const id in this.players) {
      this.players[id].reset();
    }
    this.players = {};
    this.scoreToWin = 0;
    this.secondsPerRound = 0;
    this.state = State.STARTING;
    this.whiteCards = [];
    this.whiteCardReplacements = [];
    this.winner = undefined;
    return this;
  }
  setPlayerInactive(id, remove) {
    const player = this.players[id];
    player.presence = Presence.INACTIVE;
    const actions = [
      {type: 'presence', payload: {id, presence: player.presence}},
    ];
    if (this.owner === id) {
      const entry = Object.entries(this.players)
        .find(([other]) => other !== id && other > 0);
      if (entry) {
        this.owner = +entry[0];
        actions.push({type: 'owner', payload: this.owner});
      }
    }
    switch (this.state) {
      case State.AWARDING:
        if (this.czar === id) {
          actions.push(...this.forceAward());
        }
        break;
      case State.ANSWERING: {
        const activePlayers = Object.values(this.players)
          .filter(({presence}) => presence === Presence.ACTIVE);
        if (activePlayers.length >= 3) {
          actions.push(...this.checkAnswers());
        }
        else {
          this.state = State.PAUSED;
          this.lastStateChange = Date.now();
          this.emit([
            {type: 'state', payload: this.state},
            {type: 'timeout', payload: Delay.DESTRUCT},
          ]);
        }
        break;
      }
    }
    this.emit(actions);
    player.timeout = setTimeout(remove, Delay.REMOVED * 1000);
  }
  sideEffectsForSession(session) {
    const actions = [];
    let player = this.players[session.id];
    let joined = false;
    if (!player) {
      player = this.addPlayer(session.id, namer());
      if (![State.FINISHED, State.STARTING].includes(this.state)) {
        for (let i = 0; i < 9; ++i) {
          player.cards.push(this.dealWhiteCard());
        }
      }
      joined = true;
    }
    if (joined) {
      this.emit([{type: 'joined', payload: {id: session.id, player}}]);
    }
    if (player.presence != Presence.ACTIVE) {
      player.presence = Presence.ACTIVE;
      actions.push({type: 'presence', payload: {id: session.id, presence: player.presence}});
    }
    player.timeout = undefined;
    if (!this.players[this.owner] || this.players[this.owner].presence === Presence.INACTIVE) {
      this.owner = session.id;
      actions.push({type: 'owner', payload: this.owner});
    }
    if (State.PAUSED === this.state) {
      const activePlayers = Object.entries(this.players)
        .filter(([, {presence}]) => presence === Presence.ACTIVE);
      if (activePlayers.length >= 3) {
        if (!this.players[this.czar] || this.players[this.czar].presence !== Presence.ACTIVE) {
          const ids = activePlayers
            .map(([id]) => id)
            .map((id) => +id);
          this.czar = ids[Math.floor(Math.random() * ids.length)];
          actions.push({type: 'czar', payload: this.czar});
        }
        this.lastStateChange = Date.now();
        this.state = State.ANSWERING;
        actions.push(
          {type: 'state', payload: this.state},
          {type: 'timeout', payload: this.secondsPerRound},
        );
      }
    }
    return actions;
  }
  tick() {
    const sinceLast = (Date.now() - this.lastStateChange) / 1000;
    switch (this.state) {
      case State.FINISHED:
      case State.PAUSED:
      case State.STARTING:
        if (sinceLast >= Delay.DESTRUCT) {
          this.emit([{type: 'destroy'}]);
          this.reset();
          return false;
        }
        break;
      case State.ANSWERING:
        if (sinceLast >= this.secondsPerRound) {
          const actions = this.forceAnswers(
            Object.entries(this.players)
              .filter(([id, {answer}]) => (
                +id !== this.czar
                && answer.length === 0
              )),
          );
          actions.push(...this.checkAnswers());
          this.emit(actions);
        }
        break;
      case State.AWARDING:
        if (sinceLast >= this.secondsPerRound) {
          this.emit(this.forceAward());
        }
        break;
      case State.AWARDED:
        if (sinceLast >= Delay.AWARDED) {
          this.lastStateChange = Date.now();
          this.state = State.ANSWERING;
          this.blackCards.shift();
          this.blackCard = this.renderCard('black', this.blackCards[0]);
          const actions = [
            {type: 'black-card', payload: this.blackCard},
            {type: 'state', payload: this.state},
          ];
          actions.push(...this.discardAnswers());
          const activePlayers = Object.entries(this.players)
            .filter(([, {presence}]) => presence === Presence.ACTIVE);
          if (activePlayers.length >= 3) {
            const ids = activePlayers.map(([id]) => id).map((id) => +id);
            this.czar = ids[(ids.indexOf(this.czar) + 1) % ids.length];
            actions.push(...this.forceAnswers(Object.entries(this.players).filter(([id]) => (
              +id < 0
              && this.czar !== +id
            ))));
            actions.push(
              {type: 'czar', payload: this.czar},
              ...this.checkAnswers(),
              {type: 'timeout', payload: this.secondsPerRound},
            );
          }
          else {
            this.state = State.PAUSED;
            actions.push(
              {type: 'state', payload: this.state},
              {type: 'timeout', payload: Delay.DESTRUCT},
            );
          }
          this.emit(actions);
        }
        break;
    }
    return true;
  }
  timeoutToJSON() {
    let timeout;
    switch (this.state) {
      case State.FINISHED:
      case State.PAUSED:
      case State.STARTING:
        timeout = Delay.DESTRUCT - ((Date.now() - this.lastStateChange) / 1000);
        break;
      case State.ANSWERING:
      case State.AWARDING:
        timeout = this.secondsPerRound - ((Date.now() - this.lastStateChange) / 1000);
        break;
      case State.AWARDED:
        timeout = Delay.AWARDED - ((Date.now() - this.lastStateChange) / 1000);
        break;
    }
    return timeout;
  }
  // toWire
  toJSON() {
    return {
      answers: Object.values(this.answers)
        .map((answer) => answer.map(([, rendered]) => rendered)),
      blackCard: this.blackCard,
      czar: this.czar,
      messages: this.messages,
      owner: this.owner,
      players: Object.entries(this.players)
        .map(([id, player]) => [id, player.toJSON()])
        .reduce((players, [id, player]) => ({...players, [id]: player}), {}),
      state: this.state,
      timeout: this.timeoutToJSON(),
      winner: this.winner,
    };
  }
}
