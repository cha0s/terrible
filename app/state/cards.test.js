import {expect} from 'chai';

import {
  sample,
} from './cards.js';

const D = 20;
const N = 4000;

const packs = Array.from({length: D})
  .map((e, id) => ({
    id,
    cards: Array.from({length: N}, (e, i) => `${id} - ${i}`),
  }));

it('takes valid samples', () => {
  const reservoir = sample(packs, N);
  expect(reservoir.length)
    .to.equal(N);
  reservoir.forEach(({pack, card}) => {
    expect(packs[pack].cards[card])
      .to.equal(`${pack} - ${card}`);
  })
});
