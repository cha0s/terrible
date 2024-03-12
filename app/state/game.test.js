import {expect} from 'chai';

import {
  Game,
} from './game.js';

it('checks requirements', () => {
  const black = [];
  const white = [];
  Game.packs = [{black, id: 0, white}];
  const formData = new FormData();
  formData.append('maxPlayers', 3);
  formData.append('scoreToWin', 1);
  formData.append('packs', 0);
  expect(Game.check(formData))
    .to.not.deep.equal({});
  black.push('0');
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 9; ++j) {
      white.push(`${i * 9 + j}`);
    }
  }
  expect(Game.check(formData))
    .to.deep.equal({});
  formData.delete('scoreToWin');
  formData.append('scoreToWin', 2);
  black.push('1');
  black.push('2');
  expect(Game.check(formData))
    .to.not.deep.equal({});
  black.push('3');
  expect(Game.check(formData))
    .to.deep.equal({});
});

it('allocates cards', () => {
  const D = 10;
  const N = 4000;
  Game.packs = Array.from({length: D})
    .map((e, id) => ({
      id,
      black: Array.from({length: N}, (e, i) => `black - ${id} - ${i % 2 ? '[foo]' : ''} ${i}`),
      white: Array.from({length: N}, (e, i) => `white - ${id} - ${i % 2 ? '[foo]' : ''} ${i}`),
      tokens: Array.from({length: N}).reduce((tokens, e, i) => ({
        black: i % 2 ? ['foo'] : [],
        white: i % 2 ? ['foo'] : [],
      }))
    }));
  Game.tokens = {foo: Array.from({length: 10}).map((e, i) => `${i}`)};
  const game = new Game();
  game.packs = [0, 2, 4, 6, 8];
  game.maxPlayers = 4;
  game.scoreToWin = 10;
  game.allocateCards();
  expect(game.blackCards.length)
    .to.equal(9 * 4 + 1);
  expect(game.whiteCards.length)
    .to.equal(4 * 9 + 4 * 9 * (game.blackCards.length - 1));
  expect(
    game.whiteCards
      .some(({replacements = []}) => {
        replacements.some((id) => !Game.tokens.foo.includes(id))
      })
    || game.blackCards
      .some(({replacements = []}) => {
        replacements.some((id) => !Game.tokens.foo.includes(id))
      })
  )
    .to.be.false;
});

it('renders cards', () => {
  Game.packs = [
    {
      id: 0,
      black: ['this [foo] is a card [bar]'],
      white: ['this [foo] is a card [bar]'],
      tokens: [
        {black: ['bar'], white: ['bar']},
      ],
    },
  ];
  Game.tokens = {bar: ['sup']};
  const game = new Game();
  game.blackCards = [0];
  game.whiteCards = [0];
  game.allocateBlackReplacements();
  game.allocateWhiteReplacements();
  expect(game.renderCard('white', 0))
    .to.equal('this [foo] is a card sup');
  expect(game.renderCard('black', 0))
    .to.equal('this [foo] is a card sup');
});
