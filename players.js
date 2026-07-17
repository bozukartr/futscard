(function () {
  'use strict';

  const firstNames = [
    'Arel', 'Miran', 'Eymen', 'Kerem', 'Bora', 'Tuna', 'Aras', 'Doruk', 'Emir', 'Baran',
    'Lio', 'Niko', 'Milan', 'Theo', 'Dario', 'Enzo', 'Ruben', 'Soren', 'Luka', 'Mateo',
    'Kian', 'Noel', 'Levan', 'Ilyas', 'Rami', 'Tomas', 'Jovan', 'Sandro', 'Elian', 'Viktor'
  ];

  // Surnames are deliberately invented. Any resemblance to a real person is coincidental.
  const surnames = [
    'Veskari', 'Aldero', 'Corvani', 'Demarel', 'Rovek', 'Selvano', 'Torevic', 'Kavren', 'Mirello', 'Zoricen',
    'Belmora', 'Ardeni', 'Novarek', 'Kelmari', 'Valdric', 'Orsano', 'Dervan', 'Lunetti', 'Sarevic', 'Kordel',
    'Velascoz', 'Mariven', 'Tervani', 'Orelkan', 'Faldini', 'Ruzek', 'Eldaro', 'Vorelli', 'Naskov', 'Cerdan'
  ];

  const positionCounts = {
    GK: 18,
    CB: 24,
    LB: 12,
    RB: 12,
    DM: 12,
    CM: 18,
    AM: 12,
    LM: 6,
    RM: 6,
    LW: 10,
    RW: 10,
    ST: 10
  };

  const profiles = {
    GK: { defense: 13, passing: 0, shooting: -34, pace: -13, dribbling: -10, weights: [.50, .22, .06, .12, .10] },
    CB: { defense: 12, passing: 0, shooting: -15, pace: -3, dribbling: -6, weights: [.40, .23, .07, .17, .13] },
    LB: { defense: 6, passing: 2, shooting: -9, pace: 7, dribbling: 2, weights: [.31, .23, .08, .21, .17] },
    RB: { defense: 6, passing: 2, shooting: -9, pace: 7, dribbling: 2, weights: [.31, .23, .08, .21, .17] },
    DM: { defense: 7, passing: 7, shooting: -7, pace: -1, dribbling: 0, weights: [.25, .31, .11, .14, .19] },
    CM: { defense: 0, passing: 10, shooting: 0, pace: 0, dribbling: 5, weights: [.13, .32, .18, .14, .23] },
    AM: { defense: -10, passing: 9, shooting: 7, pace: 2, dribbling: 9, weights: [.06, .29, .24, .15, .26] },
    LM: { defense: -5, passing: 5, shooting: 2, pace: 8, dribbling: 7, weights: [.08, .25, .20, .23, .24] },
    RM: { defense: -5, passing: 5, shooting: 2, pace: 8, dribbling: 7, weights: [.08, .25, .20, .23, .24] },
    LW: { defense: -17, passing: 2, shooting: 8, pace: 11, dribbling: 10, weights: [.04, .17, .28, .24, .27] },
    RW: { defense: -17, passing: 2, shooting: 8, pace: 11, dribbling: 10, weights: [.04, .17, .28, .24, .27] },
    ST: { defense: -19, passing: -2, shooting: 14, pace: 6, dribbling: 5, weights: [.03, .14, .38, .21, .24] }
  };

  const accents = ['#b8ff4a', '#62a8ff', '#ffc94f', '#e17bff', '#5df0d2', '#ff8b45'];
  const skins = ['#f2c6a0', '#d99b70', '#bb744e', '#8b5238', '#6b3e2b', '#e6b487'];
  const hairs = ['#17130f', '#382317', '#6e4827', '#a9814d', '#2e211a', '#111111'];

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value ^= value << 13;
      value ^= value >>> 17;
      value ^= value << 5;
      return (value >>> 0) / 4294967296;
    };
  }

  const rng = seededRandom(11021996);
  const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
  const noise = () => Math.round((rng() - .5) * 10);

  const positions = Object.entries(positionCounts).flatMap(([position, count]) => Array(count).fill(position));
  for (let i = positions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  function groupFor(position) {
    if (position === 'GK') return 'GK';
    if (['CB', 'LB', 'RB'].includes(position)) return 'DEF';
    if (['DM', 'CM', 'AM', 'LM', 'RM'].includes(position)) return 'MID';
    return 'FWD';
  }

  function makeName(index) {
    const first = firstNames[index % firstNames.length];
    const last = surnames[(index * 7 + Math.floor(index / firstNames.length) * 3) % surnames.length];
    return `${first} ${last}`;
  }

  const cards = positions.map((position, index) => {
    const profile = profiles[position];
    let quality = 63 + Math.floor(rng() * 24);
    if (index % 19 === 0) quality += 5;
    if (index % 41 === 0) quality += 3;
    quality = clamp(quality, 62, 91);

    const values = [
      clamp(quality + profile.defense + noise(), 25, 96),
      clamp(quality + profile.passing + noise(), 30, 96),
      clamp(quality + profile.shooting + noise(), 18, 96),
      clamp(quality + profile.pace + noise(), 32, 96),
      clamp(quality + profile.dribbling + noise(), 28, 96)
    ];

    const overall = clamp(Math.round(values.reduce((sum, value, statIndex) => sum + value * profile.weights[statIndex], 0)), 58, 94);

    return Object.freeze({
      id: `FE-${String(index + 1).padStart(3, '0')}`,
      name: makeName(index),
      position,
      group: groupFor(position),
      defense: values[0],
      passing: values[1],
      shooting: values[2],
      pace: values[3],
      dribbling: values[4],
      overall,
      accent: accents[index % accents.length],
      skin: skins[(index * 5) % skins.length],
      hair: hairs[(index * 7) % hairs.length]
    });
  });

  window.PLAYER_POOL = Object.freeze(cards);
})();
