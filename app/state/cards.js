function filter(type, text) {
  if (text.match(/insert name/i)) {
    return false;
  }
  return true;
}

function sanitize(type, text) {
  // Trailing periods.
  if ('white' === type) {
    text = text.replace(/(.*)([^.]+)\.+$/, '$1$2');
  }
  // Teh dumb.
  text = text.replace('better then', 'better than');
  text = text.replace('worse then', 'worse than');
  text = text.replace('One in then', 'One in ten');
  text = text.replace('_ then _', '_ than _');
  text = text.replace('pount', 'pound');
  return text;
}

function isCompactJson(json) {
  return !Array.isArray(json);
}

function getCardText(card) {
  return 'string' === typeof card ? card : card.text;
}

function readCompactJsonPacks(json) {
  const packs = [];
  for (let j = 0; j < json.packs.length; ++j) {
    const pack = json.packs[j];
    let tokens = undefined;
    const black = pack.black
      .filter((k) => filter('black', getCardText(json.black[k])))
      .map((k) => sanitize('black', getCardText(json.black[k])));
    black.forEach((text, i) => {
      const matches = text.match(/\[([^\]]+)\]/g);
      if (matches) {
        if (!tokens) {
          tokens = {};
        }
        if (!tokens[i]) {
          tokens[i] = {};
        }
        tokens[i].black = matches.map((match) => match.slice(1, -1));
      }
    });
    const white = pack.white
      .filter((k) => filter('white', getCardText(json.white[k])))
      .map((k) => sanitize('white', getCardText(json.white[k])));
    white.forEach((text, i) => {
      const matches = text.match(/\[([^\]]+)\]/g);
      if (matches) {
        if (!tokens) {
          tokens = {};
        }
        if (!tokens[i]) {
          tokens[i] = {};
        }
        tokens[i].white = matches.map((match) => match.slice(1, -1));
      }
    });
    packs.push({
      ...pack,
      black,
      white,
      tokens,
    });
  }
  return packs;
}

function normalizeToCompactJson(json) {
  const normalized = {
    black: [],
    white: [],
    packs: [],
  };
  for (let j = 0; j < json.length; ++j) {
    const pack = json[j];
    normalized.packs.push({
      ...pack,
      black: pack.black.map((card) => normalized.black.push(getCardText(card)) - 1),
      white: pack.white.map((card) => normalized.white.push(getCardText(card)) - 1),
    });
  }
  return normalized;
}

function readFullJsonPacks(json) {
  return readCompactJsonPacks(normalizeToCompactJson(json));
}

export function readJsonPacks(json) {
  return isCompactJson(json)
    ? readCompactJsonPacks(json)
    : readFullJsonPacks(json);
}

export function shuffle(cards) {
  let currentIndex = cards.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  }
  return cards;
}
// Algorithm L(-ish :))
export function sample(packs, k) {
  const n = packs.reduce((n, {cards: {length}}) => n + length, 0);
  const reservoir = Array(k);
  // Encode the "stream" into a jump table.
  const jump = [];
  let i;
  for (i = 0; i < packs.length; ++i) {
    jump[i] = 0 === i ? 0 : jump[i - 1] + packs[i - 1].cards.length;
  }
  let c = 0, d = 0;
  for (i = 0; i < k; ++i) {
    reservoir[i] = {pack: packs[d].id, card: c};
    if (++c === packs[d].cards.length) {
      c = 0;
      d += 1;
    }
  }
  let W = Math.exp(Math.log(Math.random()) / k);
  let j = d;
  while (i < n) {
    i += Math.floor(Math.log(Math.random()) / Math.log(1 - W)) + 1;
    while (j < jump.length - 1 && i >= jump[j + 1]) {
      j += 1;
    }
    if (i < n) {
      reservoir[Math.floor(Math.random() * k)] = {pack: packs[j].id, card: i - jump[j]};
      W = W * Math.exp(Math.log(Math.random()) / k);
    }
  }
  return reservoir;
}
