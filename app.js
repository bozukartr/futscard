(function () {
  'use strict';

  const pool = window.PLAYER_POOL;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const FORMATIONS = [
    {
      id: '4-3-3', label: 'Dengeli hücum', counts: '4 Defans · 3 Orta Saha · 3 Forvet',
      slots: [
        ['GK', 50, 92], ['LB', 14, 76], ['CB', 38, 80], ['CB', 62, 80], ['RB', 86, 76],
        [['DM', 'CM'], 50, 62], [['CM', 'AM'], 27, 50], [['CM', 'AM'], 73, 50],
        [['LW', 'LM'], 18, 25], ['ST', 50, 16], [['RW', 'RM'], 82, 25]
      ]
    },
    {
      id: '4-4-2', label: 'Klasik ve güvenli', counts: '4 Defans · 4 Orta Saha · 2 Forvet',
      slots: [
        ['GK', 50, 92], ['LB', 14, 76], ['CB', 38, 80], ['CB', 62, 80], ['RB', 86, 76],
        [['LM', 'CM'], 15, 51], ['CM', 39, 58], ['CM', 61, 58], [['RM', 'CM'], 85, 51],
        ['ST', 36, 22], ['ST', 64, 22]
      ]
    },
    {
      id: '4-2-3-1', label: 'Kontrollü oyun', counts: '4 Defans · 5 Orta Saha · 1 Forvet',
      slots: [
        ['GK', 50, 92], ['LB', 14, 76], ['CB', 38, 80], ['CB', 62, 80], ['RB', 86, 76],
        [['DM', 'CM'], 35, 62], [['DM', 'CM'], 65, 62], [['LM', 'AM'], 17, 42], ['AM', 50, 39], [['RM', 'AM'], 83, 42],
        ['ST', 50, 17]
      ]
    },
    {
      id: '3-5-2', label: 'Orta saha üstünlüğü', counts: '3 Defans · 5 Orta Saha · 2 Forvet',
      slots: [
        ['GK', 50, 92], ['CB', 24, 77], ['CB', 50, 82], ['CB', 76, 77],
        [['LM', 'CM'], 10, 52], [['DM', 'CM'], 32, 62], [['CM', 'AM'], 50, 50], [['DM', 'CM'], 68, 62], [['RM', 'CM'], 90, 52],
        ['ST', 36, 21], ['ST', 64, 21]
      ]
    },
    {
      id: '5-3-2', label: 'Savunma güvencesi', counts: '5 Defans · 3 Orta Saha · 2 Forvet',
      slots: [
        ['GK', 50, 92], ['LB', 8, 69], ['CB', 29, 78], ['CB', 50, 82], ['CB', 71, 78], ['RB', 92, 69],
        [['DM', 'CM'], 28, 52], ['CM', 50, 57], [['CM', 'AM'], 72, 52],
        ['ST', 36, 22], ['ST', 64, 22]
      ]
    },
    {
      id: '3-4-3', label: 'Yoğun pres', counts: '3 Defans · 4 Orta Saha · 3 Forvet',
      slots: [
        ['GK', 50, 92], ['CB', 24, 77], ['CB', 50, 82], ['CB', 76, 77],
        [['LM', 'CM'], 12, 52], ['CM', 38, 58], ['CM', 62, 58], [['RM', 'CM'], 88, 52],
        [['LW', 'LM'], 18, 25], ['ST', 50, 16], [['RW', 'RM'], 82, 25]
      ]
    },
    {
      id: '5-4-1', label: 'Duvar savunması', counts: '5 Defans · 4 Orta Saha · 1 Forvet',
      slots: [
        ['GK', 50, 92], ['LB', 8, 69], ['CB', 29, 78], ['CB', 50, 82], ['CB', 71, 78], ['RB', 92, 69],
        [['LM', 'CM'], 15, 49], ['CM', 39, 58], ['CM', 61, 58], [['RM', 'CM'], 85, 49],
        ['ST', 50, 18]
      ]
    }
  ];

  const STATS = [
    ['defense', 'DEFANS'],
    ['passing', 'PAS'],
    ['shooting', 'ŞUT'],
    ['pace', 'HIZ'],
    ['dribbling', 'DRİBLİNG'],
    ['overall', 'OVERALL']
  ];

  const state = {
    selectedFormation: null,
    humanSquad: [],
    cpuSquad: [],
    humanDeck: [],
    cpuDeck: [],
    round: 0,
    humanScore: 0,
    cpuScore: 0,
    roundResults: [],
    roundResolved: false,
    muted: false
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(id) {
    $$('.screen').forEach(screen => screen.classList.toggle('active', screen.id === id));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderFormations() {
    $('#formationList').innerHTML = FORMATIONS.map(formation => {
      const dots = formation.slots.map(([, x, y]) => `<i class="mini-dot" style="left:${x}%;top:${y}%"></i>`).join('');
      return `
        <button class="formation-option" data-formation="${formation.id}" aria-pressed="false">
          <span class="mini-pitch" aria-hidden="true">${dots}</span>
          <span><h3>${formation.id}</h3><p>${formation.counts}</p></span>
          <i class="check" aria-hidden="true"></i>
        </button>`;
    }).join('');

    $$('.formation-option').forEach(button => button.addEventListener('click', () => selectFormation(button.dataset.formation)));
  }

  function selectFormation(id) {
    state.selectedFormation = FORMATIONS.find(formation => formation.id === id);
    $$('.formation-option').forEach(button => {
      const selected = button.dataset.formation === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    $('#dealBtn').disabled = false;
    sound('tap');
  }

  function dealTeam(formation, excludedIds = new Set()) {
    const used = new Set(excludedIds);
    return formation.slots.map(([accepted, x, y]) => {
      const positions = Array.isArray(accepted) ? accepted : [accepted];
      const candidates = pool.filter(card => positions.includes(card.position) && !used.has(card.id));
      const card = candidates[Math.floor(Math.random() * candidates.length)];
      if (!card) throw new Error(`Uygun ${positions.join('/')} kartı bulunamadı.`);
      used.add(card.id);
      return { card, x, y };
    });
  }

  function dealSquads() {
    if (!state.selectedFormation) return;
    state.humanSquad = dealTeam(state.selectedFormation);
    const excluded = new Set(state.humanSquad.map(entry => entry.card.id));
    const cpuFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
    state.cpuSquad = dealTeam(cpuFormation, excluded);
    renderSquad();
    showScreen('squadScreen');
    sound('deal');
  }

  function renderSquad() {
    $('#chosenFormation').textContent = state.selectedFormation.id;
    $('#teamOverall').textContent = Math.round(state.humanSquad.reduce((sum, entry) => sum + entry.card.overall, 0) / 11);
    $('#lineupPitch').innerHTML = state.humanSquad.map(({ card, x, y }) => `
      <div class="lineup-player" style="left:${x}%;top:${y}%" title="${escapeHtml(card.name)}">
        <span class="lineup-badge">${card.overall}<small>${card.position}</small></span>
        <span class="lineup-name">${escapeHtml(card.name)}</span>
      </div>`).join('');
  }

  function cardMarkup(card, selectable = false, selectedStat = '') {
    const number = Number(card.id.slice(-3)) % 99 || 99;
    return `
      <div class="card-top">
        <div class="card-rating">${card.overall}<small>${card.position}</small></div>
        <span class="card-code">${card.id}</span>
      </div>
      <div class="portrait" style="--skin:${card.skin};--hair:${card.hair}">
        <i class="hair"></i><span class="portrait-number">${number}</span>
      </div>
      <div class="card-identity">
        <h3>${escapeHtml(card.name)}</h3><p>${card.group} · ${card.position}</p>
      </div>
      <div class="stats">
        ${STATS.map(([key, label]) => {
          const tag = selectable ? 'button' : 'div';
          const disabled = selectable ? '' : ' aria-disabled="true"';
          return `<${tag} class="stat-btn ${key === 'overall' ? 'overall-stat' : ''} ${selectedStat === key ? 'selected-stat' : ''}" data-stat="${key}"${disabled}><span>${label}</span><strong>${card[key]}</strong></${tag}>`;
        }).join('')}
      </div>`;
  }

  function applyCardStyle(element, card) {
    element.style.setProperty('--accent', card.accent);
  }

  function startMatch() {
    state.humanDeck = shuffle(state.humanSquad.map(entry => entry.card));
    state.cpuDeck = shuffle(state.cpuSquad.map(entry => entry.card));
    state.round = 0;
    state.humanScore = 0;
    state.cpuScore = 0;
    state.roundResults = [];
    showScreen('matchScreen');
    renderRound();
  }

  function renderRound() {
    state.roundResolved = false;
    const human = state.humanDeck[state.round];
    const humanCard = $('#humanCard');
    const cpuCard = $('#cpuCard');

    $('#playerScore').textContent = state.humanScore;
    $('#cpuScore').textContent = state.cpuScore;
    $('#roundLabel').textContent = `TUR ${state.round + 1} / 11`;
    $('#roundDots').innerHTML = Array.from({ length: 11 }, (_, index) => `<i class="${state.roundResults[index] || ''}"></i>`).join('');
    $('#instruction').textContent = 'Karşılaştırmak için bir özellik seç';
    $('#nextRoundBtn').hidden = true;
    $('#nextRoundBtn span').textContent = state.round === 10 ? 'SONUCU GÖR' : 'SONRAKİ TUR';

    humanCard.className = 'player-card';
    humanCard.innerHTML = cardMarkup(human, true);
    applyCardStyle(humanCard, human);
    humanCard.querySelectorAll('.stat-btn').forEach(button => button.addEventListener('click', () => resolveRound(button.dataset.stat)));

    cpuCard.className = 'player-card card-back';
    cpuCard.removeAttribute('style');
    cpuCard.setAttribute('aria-label', 'Rakip kartı kapalı');
    cpuCard.innerHTML = '<div class="back-pattern"><span>11</span></div>';
  }

  function resolveRound(stat) {
    if (state.roundResolved) return;
    state.roundResolved = true;
    const human = state.humanDeck[state.round];
    const cpu = state.cpuDeck[state.round];
    const humanValue = human[stat];
    const cpuValue = cpu[stat];
    const humanCard = $('#humanCard');
    const cpuCard = $('#cpuCard');

    humanCard.innerHTML = cardMarkup(human, false, stat);
    cpuCard.className = 'player-card reveal';
    cpuCard.innerHTML = cardMarkup(cpu, false, stat);
    cpuCard.setAttribute('aria-label', `Rakip kartı: ${cpu.name}`);
    applyCardStyle(cpuCard, cpu);

    let result;
    if (humanValue > cpuValue) {
      result = 'win';
      state.humanScore += 1;
      humanCard.classList.add('winner');
      cpuCard.classList.add('loser');
      $('#instruction').innerHTML = `<span class="win-text">Turu kazandın!</span> ${humanValue} — ${cpuValue}`;
      sound('win');
    } else if (humanValue < cpuValue) {
      result = 'loss';
      state.cpuScore += 1;
      humanCard.classList.add('loser');
      cpuCard.classList.add('winner');
      $('#instruction').innerHTML = `<span class="loss-text">Rakip kazandı.</span> ${humanValue} — ${cpuValue}`;
      sound('loss');
    } else {
      result = 'draw';
      humanCard.classList.add('draw');
      cpuCard.classList.add('draw');
      $('#instruction').innerHTML = `Berabere! ${humanValue} — ${cpuValue}`;
      sound('draw');
    }

    state.roundResults.push(result);
    $('#playerScore').textContent = state.humanScore;
    $('#cpuScore').textContent = state.cpuScore;
    $('#roundDots').innerHTML = Array.from({ length: 11 }, (_, index) => `<i class="${state.roundResults[index] || ''}"></i>`).join('');
    $('#nextRoundBtn').hidden = false;
  }

  function nextRound() {
    if (!state.roundResolved) return;
    if (state.round >= 10) {
      showResult();
      return;
    }
    state.round += 1;
    renderRound();
  }

  function getRecord() {
    try {
      return { wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, ...JSON.parse(localStorage.getItem('finalElevenRecord') || '{}') };
    } catch (_) {
      return { wins: 0, losses: 0, currentStreak: 0, bestStreak: 0 };
    }
  }

  function saveRecord(record) {
    try { localStorage.setItem('finalElevenRecord', JSON.stringify(record)); } catch (_) { /* storage may be unavailable */ }
  }

  function updateRecord() {
    const record = getRecord();
    if (state.humanScore > state.cpuScore) {
      record.wins += 1;
      record.currentStreak += 1;
      record.bestStreak = Math.max(record.bestStreak, record.currentStreak);
    } else if (state.humanScore < state.cpuScore) {
      record.losses += 1;
      record.currentStreak = 0;
    }
    saveRecord(record);
    renderRecord();
  }

  function renderRecord() {
    const record = getRecord();
    $('#winsStat').textContent = record.wins;
    $('#lossesStat').textContent = record.losses;
    $('#streakStat').textContent = record.bestStreak;
  }

  function showResult() {
    const won = state.humanScore > state.cpuScore;
    const lost = state.humanScore < state.cpuScore;
    const emblem = $('#resultEmblem');
    $('#finalPlayerScore').textContent = state.humanScore;
    $('#finalCpuScore').textContent = state.cpuScore;
    $('#resultTitle').textContent = won ? 'Galibiyet!' : lost ? 'Mağlubiyet' : 'Berabere';
    $('#resultCopy').textContent = won
      ? 'Doğru özellik seçimleriyle rakibini geride bıraktın.'
      : lost ? 'Bu kez bilgisayar kazandı. Yeni bir kadroyla rövanşa hazır ol.' : 'Kartlar birbirine üstünlük kuramadı. Rövanş zamanı.';
    emblem.textContent = won ? 'W' : lost ? 'L' : 'D';
    emblem.style.background = won ? 'var(--lime)' : lost ? 'var(--orange)' : '#fff';
    updateRecord();
    showScreen('resultScreen');
  }

  function renderCollection(filter = 'ALL') {
    const cards = filter === 'ALL' ? pool : pool.filter(card => card.group === filter);
    $('#collectionCount').textContent = `${cards.length} kart`;
    $('#cardGrid').innerHTML = cards.map(card => {
      const article = `<article class="player-card" style="--accent:${card.accent}">${cardMarkup(card)}</article>`;
      return article;
    }).join('');
  }

  let audioContext;
  function sound(type) {
    if (state.muted) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const presets = {
        tap: [260, .035], deal: [340, .07], win: [620, .1], loss: [150, .13], draw: [310, .08]
      };
      const [frequency, duration] = presets[type] || presets.tap;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type === 'loss' ? 'sawtooth' : 'sine';
      gain.gain.setValueAtTime(.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* audio is optional */ }
  }

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 1600);
  }

  function bindEvents() {
    $('#newGameBtn').addEventListener('click', () => showScreen('formationScreen'));
    $('#collectionBtn').addEventListener('click', () => { renderCollection(); showScreen('collectionScreen'); });
    $('#dealBtn').addEventListener('click', dealSquads);
    $('#redealBtn').addEventListener('click', () => { dealSquads(); toast('Yeni kadro dağıtıldı'); });
    $('#startMatchBtn').addEventListener('click', startMatch);
    $('#nextRoundBtn').addEventListener('click', nextRound);
    $('#rematchBtn').addEventListener('click', dealSquads);
    $('#resultHomeBtn').addEventListener('click', () => showScreen('homeScreen'));
    $('#brandBtn').addEventListener('click', () => showScreen('homeScreen'));

    $$('.back-btn').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.back)));

    $('#soundBtn').addEventListener('click', () => {
      state.muted = !state.muted;
      $('#soundBtn').classList.toggle('muted', state.muted);
      $('#soundBtn').setAttribute('aria-pressed', String(state.muted));
      $('#soundBtn').setAttribute('aria-label', state.muted ? 'Sesi aç' : 'Sesi kapat');
      if (!state.muted) sound('tap');
    });

    $('#collectionFilters').addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      $$('#collectionFilters button').forEach(item => item.classList.toggle('active', item === button));
      renderCollection(button.dataset.filter);
    });
  }

  function init() {
    if (!pool || pool.length !== 150) throw new Error('Kart havuzu 150 oyuncu içermelidir.');
    renderFormations();
    renderRecord();
    bindEvents();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  init();
})();
