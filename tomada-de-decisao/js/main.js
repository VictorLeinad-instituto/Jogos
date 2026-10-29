import { ROLETAS, DILEMAS, PLACAS, AVATARES } from './data.js';

/* ==========================================================
   Utilidades
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const SAVE_KEY = 'asm-decisao-v1';
const PREFS_KEY = 'asm-decisao-prefs';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sem armazenamento */ } },
};
const prefs = Object.assign({ sound: true, names: [] }, store.get(PREFS_KEY) || {});
const savePrefs = () => store.set(PREFS_KEY, prefs);

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ==========================================================
   Sons (WebAudio, sem arquivos)
   ========================================================== */
let actx;
function beep(freq, dur = .06, type = 'triangle', vol = .08, when = 0) {
  if (!prefs.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime + when;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + .02);
  } catch { /* áudio indisponível */ }
}
const sfx = {
  tick: () => beep(880 + rnd(120), .03, 'square', .025),
  flip: () => { beep(420, .08, 'sine', .07); beep(640, .1, 'sine', .06, .06); },
  land: () => beep(660, .12, 'triangle', .07),
  placa: () => beep(520, .05, 'triangle', .06),
  chime: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, .22, 'sine', .07, i * .09)),
};

/* ==========================================================
   Roletas (SVG)
   ========================================================== */
const SEG_COLORS = ['#F89903', '#FFFFFF', '#E3C5EA', '#F89903', '#FFFFFF', '#E3C5EA'];   // amarelo, branco e lilás claro
const pt = (r, deg) => { const a = deg * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };

function wheelSvg(labels, { hub = '' } = {}) {
  const R = 92, n = labels.length, step = 360 / n;
  let segs = '';
  labels.forEach((lbl, i) => {
    const a0 = i * step, a1 = a0 + step, mid = a0 + step / 2;
    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1);
    const lines = String(lbl).split('\n');
    // encolhe rótulos longos para caberem entre o miolo e a borda
    const longest = Math.max(...lines.map((s) => s.length));
    const fs = Math.min(10.5, 62 / (longest * .6)).toFixed(1);
    const tsp = lines.length === 1
      ? `<tspan x="84" dy="0">${esc(lines[0])}</tspan>`
      : `<tspan x="84" dy="-.55em">${esc(lines[0])}</tspan><tspan x="84" dy="1.1em">${esc(lines[1])}</tspan>`;
    segs += `<g class="seg" data-i="${i}">
      <path d="M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${SEG_COLORS[i % SEG_COLORS.length]}" stroke="#2A4947" stroke-width="1.2" stroke-linejoin="round"/>
      <g transform="rotate(${mid})">
        <text class="seg-lbl" style="font-size:${fs}px" transform="rotate(-90)" text-anchor="end" dominant-baseline="middle">${tsp}</text>
        <text class="seg-num" x="0" y="-62" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>
      </g>
    </g>`;
  });
  return `<svg viewBox="-100 -104 200 208" aria-hidden="true">
    <circle r="97" fill="#2A4947"/>
    <g class="wheel-rot">${segs}
      ${Array.from({ length: n }, (_, i) => { const [x, y] = pt(94.5, i * step); return `<circle class="peg" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3" fill="#F4EFEA" stroke="#2A4947" stroke-width="1"/>`; }).join('')}
    </g>
    <circle r="21" fill="#2A4947"/><circle r="16" fill="#F4EFEA"/>
    ${hub ? `<text class="hub-txt" text-anchor="middle" dominant-baseline="central">${hub}</text>` : ''}
    <path class="pointer" d="M-11 -107 L11 -107 L0 -82 Z" fill="#2A4947" stroke="#F4EFEA" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`;
}

class Wheel {
  constructor(key, num) {
    this.key = key; this.num = num; this.rot = 0; this.result = null;
    this.el = document.createElement('div');
    this.el.className = 'wheel-box';
    this.el.innerHTML = `
      <div class="wheel-cap"><i>${num}</i>${ROLETAS[key].titulo}</div>
      <div class="wheel"></div>
      <div class="wheel-result empty">?</div>`;
    this.wheelEl = $('.wheel', this.el);
    this.resEl = $('.wheel-result', this.el);
  }
  setItems(items, labelOf) {
    this.items = items;
    this.wheelEl.innerHTML = wheelSvg(items.map(labelOf), { hub: '' });
    this.rotEl = $('.wheel-rot', this.wheelEl);
    this.rotEl.style.transform = `rotate(${this.rot}deg)`;
  }
  clear() {
    this.result = null;
    this.resEl.textContent = '?'; this.resEl.classList.add('empty');
    this.wheelEl.classList.remove('done');
    $$('.seg.win', this.wheelEl).forEach((s) => s.classList.remove('win'));
  }
  spin(target, ms, display) {
    const n = this.items.length, step = 360 / n;
    const jitter = (Math.random() - .5) * step * .6;
    const want = ((-(target * step + step / 2) + jitter) % 360 + 360) % 360;
    const cur = ((this.rot % 360) + 360) % 360;
    const delta = ((want - cur) % 360 + 360) % 360;
    const from = this.rot;
    this.rot += 360 * (4 + rnd(2)) + delta;
    this.wheelEl.style.setProperty('--spin-ms', `${ms}ms`);
    this.wheelEl.classList.add('spinning');
    // força o reflow para a transição pegar o novo valor
    void this.rotEl.getBoundingClientRect();
    this.rotEl.style.transform = `rotate(${this.rot}deg)`;
    this.watchPegs(from, this.rot, ms);
    return wait(ms + 40).then(() => {
      this.wheelEl.classList.remove('spinning');
      this.wheelEl.classList.add('done');
      $(`.seg[data-i="${target}"]`, this.wheelEl)?.classList.add('win');
      this.result = target;
      this.resEl.textContent = display;
      this.resEl.classList.remove('empty', 'pop'); void this.resEl.offsetWidth; this.resEl.classList.add('pop');
      sfx.land();
    });
  }
  // Como na roleta do Wordwall: cada pino que passa pelo ponteiro dá um "tranco" nele.
  // O ângulo vem da mesma curva da transição CSS (calculado, não lido da tela), então nenhum
  // pino se perde mesmo quando a página desenha poucos quadros.
  watchPegs(from, to, ms) {
    if (reduced()) return;
    const pointer = $('.pointer', this.wheelEl);
    const step = 360 / this.items.length;
    const ease = cubicBezier(.12, .62, .1, 1);
    const t0 = performance.now();
    let crossed = Math.floor(from / step), lastA = from, lastT = t0;
    // setTimeout em vez de requestAnimationFrame: segue funcionando mesmo em telas que pausam o rAF
    const frame = () => {
      const now = performance.now();
      const p = Math.min(1, (now - t0) / ms);
      const a = from + (to - from) * ease(p);
      const k = Math.floor(a / step);
      if (k > crossed) {
        crossed = k;
        // quanto mais rápido, mais forte o tranco
        const speed = (a - lastA) / Math.max(1, now - lastT);   // graus por ms
        const kick = Math.min(32, 12 + speed * 9);
        pointer.animate([
          { transform: `rotate(${-kick}deg)` },
          { transform: `rotate(${kick * .25}deg)`, offset: .55 },
          { transform: 'rotate(0deg)' },
        ], { duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)' });
        sfx.tick();
      }
      lastA = a; lastT = now;
      if (p < 1) setTimeout(frame, 16);
    };
    setTimeout(frame, 16);
  }
}

// Curva cubic-bezier igual à do CSS: devolve o progresso (0–1) para um tempo (0–1).
function cubicBezier(x1, y1, x2, y2) {
  const bx = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3;
  const by = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3;
  return (x) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
    return by((lo + hi) / 2);
  };
}

/* ==========================================================
   Estado do jogo
   ========================================================== */
const wheels = {
  personagens: new Wheel('personagens', 1),
  lugares: new Wheel('lugares', 2),
  sentimentos: new Wheel('sentimentos', 3),
};
Object.values(wheels).forEach((w) => $('#wheels').append(w.el));

let G = null;          // partida atual
let spinning = false;
let timerT = null;

const SETUP = { n: 4, rounds: 2, set: 'classicos' };

const MIN_PLAYERS = 3, MAX_PLAYERS = 6;

function newGame(opts) {
  G = {
    players: opts.names.map((name, i) => ({ name, avatar: AVATARES[i % AVATARES.length], pts: 0 })),
    rounds: opts.rounds ?? 0,
    set: opts.set || 'classicos',
    turn: 0,           // índice global de vezes jogadas
    deck: shuffle(DILEMAS.map((_, i) => i)),
    phase: 'spin',
    res: null, card: null, votes: {}, pick: null, handoff: null,
  };
}

const curPlayerIdx = () => G.turn % G.players.length;
const curPlayer = () => G.players[curPlayerIdx()];
const roundNum = () => Math.floor(G.turn / G.players.length) + 1;
const totalTurns = () => G.rounds ? G.rounds * G.players.length : Infinity;
function setForTurn() {
  if (G.set !== 'alternar') return G.set;
  return roundNum() % 2 === 1 ? 'classicos' : 'bonus';
}

function save() {
  if (!G) return;
  const { players, rounds, set, turn, deck } = G;
  store.set(SAVE_KEY, { players, rounds, set, turn, deck, at: Date.now() });
}

/* ==========================================================
   Montagem da tela
   ========================================================== */
let shownSet = null;
function applyWheelSet() {
  const set = setForTurn();
  if (set === shownSet) return;
  shownSet = set;
  wheels.personagens.setItems(ROLETAS.personagens[set], (x) => x.t);
  wheels.lugares.setItems(ROLETAS.lugares[set], (x) => x.t);
  wheels.sentimentos.setItems(ROLETAS.sentimentos[set], (x) => cap(x.m === x.f ? x.m : `${x.m}/${x.f.slice(-1)}`));
  $('#setChip').textContent = set === 'bonus' ? 'Roletas bônus' : 'Roletas clássicas';
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function renderTopbar() {
  const r = G.rounds ? `Rodada ${roundNum()} de ${G.rounds}` : `Rodada ${roundNum()}`;
  $('#topbarTitle').innerHTML = `${r}<small>Vez de ${esc(curPlayer().name)}</small>`;
}

function renderScore(bumpIdx = -1) {
  const ci = curPlayerIdx();
  $('#score').innerHTML = `
    <h3>Placar</h3>
    <ol>${G.players.map((p, i) => `
      <li class="${i === ci ? 'turn' : ''}">
        <span class="avatar"><img src="${p.avatar}" alt=""></span>
        <span class="pname">${esc(p.name)}<small>${i === ci ? 'Respondendo agora' : `${p.pts === 1 ? '1 ponto' : `${p.pts} pontos`}`}</small></span>
        <span class="pts${i === bumpIdx ? ' bump' : ''}">${p.pts}</span>
      </li>`).join('')}
    </ol>
    <p class="score-note">Verde vale 2, amarela vale 1 e vermelha vale 0.</p>`;
  centerTurn();
}

// No celular o placar é uma faixa que rola para o lado: deixa quem está na vez no centro.
function centerTurn() {
  const ol = $('#score ol'), li = $('#score li.turn');
  if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return;
  const left = Math.max(0, li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2);
  ol.scrollTo({ left, behavior: reduced() ? 'auto' : 'smooth' });
  // garante a posição final mesmo se o navegador não animar a rolagem
  setTimeout(() => { if (Math.abs(ol.scrollLeft - left) > 2) ol.scrollLeft = left; }, 700);
}
addEventListener('resize', () => { if (G) centerTurn(); });

const PHASES = ['spin', 'draw', 'answer', 'vote'];
function renderStep() {
  const st = $('#step');
  const idx = PHASES.indexOf(G.phase === 'reveal' ? 'vote' : G.phase);
  const dots = PHASES.map((_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'on' : ''}"></i>`).join('');
  const who = `<span class="avatar"><img src="${curPlayer().avatar}" alt=""></span>`;
  const name = esc(curPlayer().name);
  const txt = {
    spin: ['Gire as três roletas', 'Personagem, lugar e sentimento vão formar a história.', 'Girar', 'spin'],
    draw: ['Tire uma carta-dilema', 'Clique no monte para descobrir a situação.', 'Tirar carta', 'draw'],
    answer: ['Hora de responder', 'Leia a carta em voz alta e diga o que faria.', 'Ver carta', 'open-card'],
    vote: ['Os outros jogadores avaliam', 'Cada um escolhe uma placa: verde, amarela ou vermelha.', 'Avaliar', 'open-vote'],
    reveal: ['Placas reveladas', 'Cada jogador justifica a sua placa.', 'Ver placas', 'open-vote'],
  }[G.phase];
  st.innerHTML = `${who}
    <div class="step-txt"><b>${name}: ${txt[0]}</b><span>${txt[1]}</span><div class="step-dots">${dots}</div></div>
    <button class="btn btn-primary btn-pill" data-action="${txt[3]}" ${spinning ? 'disabled' : ''}>${txt[2]}</button>`;

  const spinBtn = $('#spinBtn');
  spinBtn.disabled = G.phase !== 'spin' || spinning;
  spinBtn.classList.toggle('ready', G.phase === 'spin' && !spinning);
  const deck = $('#deck');
  deck.classList.toggle('ready', G.phase === 'draw');
  deck.setAttribute('aria-disabled', G.phase !== 'draw');
  $('#deckCount').textContent = `${G.deck.length} no monte`;
  $('#deckHint').textContent = G.phase === 'draw' ? 'Clique no monte para tirar uma carta.' : G.phase === 'spin' ? 'Primeiro, gire as roletas.' : '';
}

function renderAll() {
  applyWheelSet();
  renderTopbar(); renderScore(); renderStep();
}

/* ==========================================================
   Fluxo de uma vez
   ========================================================== */
function startTurn() {
  G.phase = 'spin'; G.res = null; G.card = null; G.votes = {}; G.pick = null; G.handoff = null;
  Object.values(wheels).forEach((w) => w.clear());
  renderAll();
}

async function doSpin() {
  if (!G || G.phase !== 'spin' || spinning) return;
  spinning = true; renderStep();
  const set = setForTurn();
  const res = { set, p: rnd(6), l: rnd(6), s: rnd(6) };
  const g = ROLETAS.personagens[set][res.p].g;
  const base = reduced() ? 300 : 2600;
  await Promise.all([
    wheels.personagens.spin(res.p, base, ROLETAS.personagens[set][res.p].t),
    wheels.lugares.spin(res.l, base + (reduced() ? 0 : 500), ROLETAS.lugares[set][res.l].t.replace('\n', ' ')),
    wheels.sentimentos.spin(res.s, base + (reduced() ? 0 : 1000), cap(ROLETAS.sentimentos[set][res.s][g])),
  ]);
  G.res = res; spinning = false;
  G.phase = 'draw';
  renderStep();
}

async function doDraw() {
  if (!G || G.phase !== 'draw') return;
  if (!G.deck.length) { G.deck = shuffle(DILEMAS.map((_, i) => i)); toast('O monte foi embaralhado de novo.'); }
  G.card = G.deck.shift();
  $('#deck').classList.remove('ready');
  G.phase = 'answer';
  renderStep();
  sfx.flip();
  await openCard({ fly: true });
}

function storyHtml() {
  const { set, p, l, s } = G.res;
  const P = ROLETAS.personagens[set][p], L = ROLETAS.lugares[set][l], S = ROLETAS.sentimentos[set][s];
  const art = P.g === 'f' ? 'Uma' : 'Um';
  const dil = DILEMAS[G.card].d.replace(/\{o\}/g, P.g === 'f' ? 'a' : 'o');
  return `${art} <mark class="p">${P.t.toLowerCase()}</mark>, <mark class="l">${L.em}</mark>, estava <mark class="s">${S[P.g]}</mark> ${esc(dil)} O que você faria se fosse essa pessoa?`;
}

// Como no "eu não...": a carta sai do monte, vira no ar e para grande à frente da mesa.
function flyFromDeck(dcard) {
  const deck = $('#deck');
  const from = $('.deck-card.c1', deck).getBoundingClientRect();
  const to = dcard.getBoundingClientRect();
  const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
  const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
  const s = from.width / to.width;
  deck.classList.add('drawing');
  const anim = dcard.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotateY(180deg)` },
    { transform: `translate(${dx * .45}px, ${dy * .45 - 60}px) scale(${(s + 1) / 2 * 1.08}) rotateX(14deg) rotateY(95deg) rotateZ(-4deg)`, offset: .45 },
    { transform: 'translate(0, -10px) scale(1.02) rotateY(0deg)', offset: .82 },
    { transform: 'none' },
  ], { duration: 950, easing: 'cubic-bezier(.22,.8,.24,1)' });
  return anim.finished.catch(() => {}).then(() => deck.classList.remove('drawing'));
}

// A carta desce para a mesa antes da avaliação.
function cardAway() {
  const dcard = $('#dcard');
  if (reduced() || $('#spot').classList.contains('hidden')) return Promise.resolve();
  return dcard.animate([
    { transform: 'none', opacity: 1 },
    { transform: 'translateY(40vh) scale(.35) rotate(10deg)', opacity: 0 },
  ], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' }).finished.catch(() => {});
}

function openCard({ fly = false } = {}) {
  stopTimer();
  const story = $('#spotStory');
  story.innerHTML = storyHtml();
  const len = story.textContent.length;
  story.classList.toggle('l2', len > 165 && len <= 205);
  story.classList.toggle('l3', len > 205);
  const dcard = $('#dcard');
  const extra = $('#spotExtra'), actions = $('#spotActions');
  const think = DILEMAS[G.card].p;

  const p = curPlayer();
  $('#spotWho').innerHTML = `<span class="avatar"><img src="${p.avatar}" alt=""></span>Vez de ${esc(p.name)}: leia em voz alta`;
  extra.innerHTML = `<button class="think locked" data-action="reveal-think"><b>Para pensar</b><span>Mostrar uma pergunta de apoio</span></button>`;
  actions.innerHTML = `
    <span class="timer hidden" id="timer">Tempo para pensar <b id="timerN">60</b></span>
    <button class="btn btn-soft btn-pill" data-action="timer">Cronômetro de 1 min</button>
    <button class="btn btn-primary btn-pill" data-action="answered">Já respondi, avaliar</button>`;
  extra.dataset.think = think;
  const spot = $('#spot');
  spot.classList.toggle('landing', fly && !reduced());
  show('#spot');
  if (fly && !reduced()) return flyFromDeck(dcard);
  return Promise.resolve();
}

function revealThink(btn) {
  const t = $('#spotExtra').dataset.think;
  const div = document.createElement('div');
  div.className = 'think';
  div.innerHTML = `<b>Para pensar</b>${esc(t)}`;
  btn.replaceWith(div);
}

function startTimer() {
  stopTimer();
  let n = 60;
  const el = $('#timer'); el?.classList.remove('hidden');
  $('[data-action="timer"]')?.classList.add('hidden');
  timerT = setInterval(() => {
    n--; const nEl = $('#timerN'); if (nEl) nEl.textContent = n;
    if (n <= 5 && n > 0) sfx.tick();
    if (n <= 0) { stopTimer(); sfx.chime(); if (el) el.innerHTML = 'Tempo esgotado. Hora de responder!'; }
  }, 1000);
}
function stopTimer() { clearInterval(timerT); timerT = null; }

/* ---------- avaliação ---------- */
// Placa no estilo das cartas impressas: cor, logo, nome, rótulo e Tuto.
function placaCard(k, { tag = 'div', small = false, attrs = '' } = {}) {
  const v = PLACAS[k];
  return `<${tag} class="pcard ${k}${small ? ' small' : ''}" ${attrs}>
    <img class="pcard-logo" src="assets/img/logo-preto.webp" alt="">
    <span class="pcard-nome">${v.nome}</span>
    <span class="pcard-lbl">${v.label}</span>
    <img class="pcard-tuto" src="${v.img}" alt="">
  </${tag}>`;
}

// Fila de avaliadores: todos menos quem respondeu, a partir do jogador à esquerda.
const voters = () => {
  const ci = curPlayerIdx(), n = G.players.length;
  return Array.from({ length: n - 1 }, (_, k) => (ci + 1 + k) % n);
};

function openVote() {
  G.phase = G.phase === 'reveal' ? 'reveal' : 'vote';
  renderStep();
  if (G.phase === 'reveal') { renderReveal(); show('#vote'); return; }
  const q = voters().find((i) => !G.votes[i]);
  if (q === undefined) return doReveal();
  G.handoff = G.handoff ?? true;
  renderVoter(q);
  show('#vote');
}

function renderVoter(qi) {
  const list = voters();
  const pos = list.indexOf(qi) + 1;
  const q = G.players[qi], p = curPlayer();
  const dots = list.map((i) => `<i class="${G.votes[i] ? 'done' : i === qi ? 'on' : ''}"></i>`).join('');
  if (G.handoff) {
    // tela de passagem: esconde a escolha anterior até o próximo jogador pegar o aparelho
    $('#voteTitle').innerHTML = '';
    $('#voteSub').textContent = '';
    $('#voteList').innerHTML = `
      <div class="handoff">
        <span class="avatar"><img src="${q.avatar}" alt=""></span>
        <small>Avaliação ${pos} de ${list.length}</small>
        <h2 id="voteTitleH" class="sheet-title">Passe o aparelho para ${esc(q.name)}</h2>
        <p class="sheet-sub">${esc(q.name)} vai avaliar a decisão de ${esc(p.name)} sem que os outros vejam a placa.</p>
        <div class="vote-dots">${dots}</div>
      </div>`;
    $('#voteFoot').innerHTML = `<span></span><button class="btn btn-primary btn-pill" data-action="voter-ready" data-i="${qi}">Sou ${esc(q.name)}, avaliar</button>`;
    return;
  }
  $('#voteTitle').innerHTML = `<span class="vote-who"><span class="avatar"><img src="${q.avatar}" alt=""></span>${esc(q.name)}, qual é a sua placa?</span>`;
  $('#voteSub').textContent = `Você concorda com a decisão de ${p.name}?`;
  $('#voteList').innerHTML = `
    <div class="pcards" role="radiogroup" aria-label="Placa de ${esc(q.name)}">
      ${Object.keys(PLACAS).map((k) => placaCard(k, { tag: 'button', attrs: `role="radio" aria-checked="${G.pick === k}" data-placa="${k}" aria-label="${PLACAS[k].nome}: ${PLACAS[k].desc}"` })).join('')}
    </div>
    <div class="vote-dots">${dots}</div>`;
  $$('#voteList .pcard').forEach((b) => b.classList.toggle('on', b.dataset.placa === G.pick));
  $('#voteList .pcards').classList.toggle('picked', !!G.pick);
  const last = pos === list.length;
  $('#voteFoot').innerHTML = `<small class="vote-count">Avaliação ${pos} de ${list.length}</small>
    <button class="btn btn-primary btn-pill" data-action="confirm-vote" data-i="${qi}" ${G.pick ? '' : 'disabled'}>${last ? 'Confirmar e revelar' : 'Confirmar'}</button>`;
}

function confirmVote(qi) {
  if (!G.pick) return;
  G.votes[qi] = G.pick; G.pick = null;
  const next = voters().find((i) => !G.votes[i]);
  if (next === undefined) return doReveal();
  G.handoff = true;
  renderVoter(next);
}

function doReveal() {
  const need = G.players.length - 1;
  if (Object.keys(G.votes).length < need) return;
  const gained = Object.values(G.votes).reduce((s, k) => s + PLACAS[k].pts, 0);
  curPlayer().pts += gained;
  G.gained = gained;
  G.phase = 'reveal';
  sfx.chime();
  renderReveal();
  renderScore(curPlayerIdx());
  renderStep();
}

function renderReveal() {
  const p = curPlayer();
  const isLast = G.turn + 1 >= totalTurns();
  $('#voteTitle').textContent = `Placas para ${p.name}`;
  $('#voteSub').textContent = '';
  $('#voteList').innerHTML = `
    <div class="reveal">${voters().map((i, k) => `
      <div class="rv" style="--d:${(k * .15).toFixed(2)}s">
        <span class="rv-who"><span class="avatar"><img src="${G.players[i].avatar}" alt=""></span>${esc(G.players[i].name)}</span>
        ${placaCard(G.votes[i], { small: true })}
      </div>`).join('')}
    </div>
    <div class="total"><b>+${G.gained}</b><span>${G.gained === 1 ? 'ponto' : 'pontos'} para ${esc(p.name)}<br>Total: ${p.pts}</span></div>
    <div class="justify"><b>Agora, cada jogador justifica a sua placa.</b> Não existe resposta certa: o que vale é explicar o porquê.</div>`;
  $('#voteFoot').innerHTML = `
    <button class="btn btn-outline btn-pill" data-action="finish">Encerrar partida</button>
    <button class="btn btn-primary btn-pill" data-action="next">${isLast ? 'Ver resultado' : `Próximo: ${esc(G.players[(G.turn + 1) % G.players.length].name)}`}</button>`;
}

function nextTurn() {
  hideAll();
  if (G.turn + 1 >= totalTurns()) { G.turn++; save(); return finish(); }
  G.turn++;
  save();
  startTurn();
  toast(`Vez de ${curPlayer().name}`);
}

/* ---------- fim ---------- */
function finish() {
  hideAll();
  const ranked = G.players.map((p, i) => ({ ...p, i })).sort((a, b) => b.pts - a.pts);
  const top = ranked[0].pts;
  const winners = ranked.filter((p) => p.pts === top);
  $('#endBody').innerHTML = `
    <img class="end-tuto" src="assets/tuto/tuto-coracao.webp" alt="">
    <h2 id="endTitle" class="sheet-title">${winners.length > 1 ? 'Empate no topo!' : `${esc(winners[0].name)} venceu!`}</h2>
    <p class="sheet-sub">${winners.length > 1 ? `${winners.map((w) => esc(w.name)).join(' e ')} juntaram ${top} pontos.` : `Foram ${top} pontos em decisões bem conversadas.`} O mais importante é ouvir os diferentes pontos de vista.</p>
    <ol class="podium">${ranked.map((p, k) => `
      <li class="${p.pts === top ? 'win' : ''}">
        <span class="pos">${k + 1}</span>
        <span class="avatar"><img src="${p.avatar}" alt=""></span>
        <span class="pname">${esc(p.name)}</span>
        <span class="pts">${p.pts}</span>
      </li>`).join('')}
    </ol>
    <div class="row-btns">
      <button class="btn btn-soft" data-action="go-home">Início</button>
      <button class="btn btn-primary btn-pill" data-action="rematch">Jogar de novo</button>
    </div>`;
  store.del(SAVE_KEY);
  show('#end');
  confetti();
}

/* ==========================================================
   Configuração
   ========================================================== */
function renderSetup() {
  $('#playersSeg').innerHTML = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map((n) => `<button data-n="${n}" class="${n === SETUP.n ? 'on' : ''}">${n}</button>`).join('');
  $('#roundsSeg').innerHTML = [[1, '1'], [2, '2'], [3, '3'], [0, 'Livre']].map(([v, l]) => `<button data-r="${v}" class="${v === SETUP.rounds ? 'on' : ''}">${l}</button>`).join('');
  $('#setSeg').innerHTML = [['classicos', 'Clássicas'], ['bonus', 'Bônus'], ['alternar', 'Alternar']].map(([v, l]) => `<button data-s="${v}" class="${v === SETUP.set ? 'on' : ''}">${l}</button>`).join('');
  const list = $('#namesList');
  const old = $$('input', list).map((i) => i.value);
  list.innerHTML = Array.from({ length: SETUP.n }, (_, i) => {
    const v = old[i] ?? prefs.names[i] ?? '';
    return `<label class="name-row"><span class="avatar"><img src="${AVATARES[i]}" alt=""></span>
      <input maxlength="14" autocomplete="off" placeholder="Jogador ${i + 1}" value="${esc(v)}" aria-label="Nome do jogador ${i + 1}"></label>`;
  }).join('');
}

/* ==========================================================
   Telas e modais
   ========================================================== */
function show(sel) { $(sel).classList.remove('hidden'); const f = $(`${sel} [data-action]:not(.sheet-close)`); f?.focus({ preventScroll: true }); }
function hide(sel) { $(sel).classList.add('hidden'); }
function hideAll() { $$('.modal').forEach((m) => m.classList.add('hidden')); stopTimer(); }

async function enterGame() {
  hideAll();
  const home = $('#home');
  home.classList.add('leaving');
  await wait(reduced() ? 0 : 380);
  home.classList.add('hidden'); home.classList.remove('leaving');
  $('#game').classList.remove('hidden');
  shownSet = null;
  startTurn();
}

function goHome() {
  hideAll();
  $('#game').classList.add('hidden');
  $('#home').classList.remove('hidden');
  G = null;
  refreshResume();
}

function refreshResume() {
  const s = store.get(SAVE_KEY);
  const btn = $('#resumeBtn');
  if (s && s.players?.length >= MIN_PLAYERS) {
    const r = Math.floor(s.turn / s.players.length) + 1;
    $('#resumeInfo').textContent = `${s.players.length} jogadores · rodada ${r}${s.rounds ? ` de ${s.rounds}` : ''}`;
    btn.classList.remove('hidden');
  } else btn.classList.add('hidden');
}

/* ==========================================================
   Eventos
   ========================================================== */
document.addEventListener('click', (e) => {
  const seg = e.target.closest('#playersSeg button, #roundsSeg button, #setSeg button');
  if (seg) {
    if (seg.dataset.n) SETUP.n = +seg.dataset.n;
    if (seg.dataset.r !== undefined) SETUP.rounds = +seg.dataset.r;
    if (seg.dataset.s) SETUP.set = seg.dataset.s;
    renderSetup(); return;
  }
  const placa = e.target.closest('button.pcard[data-placa]');
  if (placa) {
    G.pick = placa.dataset.placa; sfx.placa();
    renderVoter(+$('[data-action="confirm-vote"]').dataset.i);
    $(`#voteList .pcard[data-placa="${G.pick}"]`)?.focus({ preventScroll: true });
    return;
  }
  const a = e.target.closest('[data-action]');
  if (!a) {
    // clique fora da folha fecha modais leves
    const m = e.target.classList?.contains('modal') ? e.target : null;
    if (m && ['rules', 'setup', 'confirm'].includes(m.id)) hide(`#${m.id}`);
    return;
  }
  const act = a.dataset.action;
  switch (act) {
    case 'setup': renderSetup(); show('#setup'); break;
    case 'resume': {
      const s = store.get(SAVE_KEY);
      if (!s || s.players?.length < MIN_PLAYERS) { store.del(SAVE_KEY); return refreshResume(); }
      G = { ...s, phase: 'spin', res: null, card: null, votes: {}, pick: null, handoff: null };
      enterGame(); break;
    }
    case 'start': {
      const names = $$('#namesList input').map((inp, i) => inp.value.trim() || `Jogador ${i + 1}`);
      prefs.names = $$('#namesList input').map((inp) => inp.value.trim()); savePrefs();
      newGame({ names, rounds: SETUP.rounds, set: SETUP.set });
      save(); enterGame(); break;
    }
    case 'rules': show('#rules'); break;
    case 'close': hide(`#${a.closest('.modal').id}`); stopTimer(); break;
    case 'sound':
      prefs.sound = !prefs.sound; savePrefs();
      $('#soundBtn').classList.toggle('off', !prefs.sound);
      toast(prefs.sound ? 'Som ligado' : 'Som desligado'); break;
    case 'home':
      if (G && G.turn < totalTurns()) show('#confirm'); else goHome();
      break;
    case 'leave': save(); goHome(); break;
    case 'go-home': goHome(); break;
    case 'spin': doSpin(); break;
    case 'draw': doDraw(); break;
    case 'open-card': openCard(); break;
    case 'reveal-think': revealThink(a); break;
    case 'timer': startTimer(); break;
    case 'answered':
      stopTimer();
      cardAway().then(() => { hide('#spot'); G.phase = 'vote'; openVote(); });
      break;
    case 'open-vote': openVote(); break;
    case 'voter-ready': G.handoff = false; G.pick = null; renderVoter(+a.dataset.i); break;
    case 'confirm-vote': confirmVote(+a.dataset.i); break;
    case 'next': nextTurn(); break;
    case 'finish': finish(); break;
    case 'rematch': {
      const names = G.players.map((p) => p.name);
      newGame({ names, rounds: G.rounds, set: G.set });
      save(); hideAll(); shownSet = null; startTurn(); break;
    }
  }
});

$('#deck').addEventListener('click', doDraw);
$('#deck').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doDraw(); } });

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = $$('.modal:not(.hidden)').pop();
  if (!open) return;
  if (['rules', 'setup', 'confirm'].includes(open.id)) hide(`#${open.id}`);
});

/* ==========================================================
   Confete
   ========================================================== */
function confetti() {
  if (reduced()) return;
  const c = $('#confetti'), ctx = c.getContext('2d');
  const dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cols = ['#F89903', '#2A4947', '#D6E8DB', '#F7C58F', '#1E6B3A'];
  const ps = Array.from({ length: 140 }, () => ({
    x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .5,
    vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: cols[rnd(cols.length)],
  }));
  let f = 0;
  (function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += .03; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (++f < 260) requestAnimationFrame(loop); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

/* ==========================================================
   Início
   ========================================================== */
$('#heroWheel').innerHTML = wheelSvg(['', '', '', '', '', ''].map((_, i) => `${i + 1}`));
$('#heroWheel .wheel-rot')?.querySelectorAll('.seg-lbl').forEach((t) => t.remove());
$$('#heroWheel .seg-num').forEach((t) => { t.style.display = 'block'; t.style.fontFamily = "'ASM Display', Poppins, sans-serif"; t.style.fontSize = '22px'; });
$('#dcardTuto').src = PLACAS.amarela.img;   // mesmo Tuto da carta-dilema impressa
$('#soundBtn').classList.toggle('off', !prefs.sound);
refreshResume();
