import { ROLETAS, ROLETA_CHAVES, CONJUNTOS, DILEMAS, MARCADORES, MARCADOR_CHAVES, METAS, PALAVRAS_FECHAMENTO, AVATARES } from './data.js';
import { openIntro, stopIntro, introKey } from './intro.js';

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
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const um = (s) => s.replace(/\n/g, ' ');   // rótulo de roleta em uma linha

const SAVE_KEY = 'asm-decisao-v2';
const PREFS_KEY = 'asm-decisao-prefs';
const store = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sem armazenamento */ } },
};
const prefs = Object.assign({ sound: true }, store.get(PREFS_KEY) || {});
// Nomes dos jogadores só durante a sessão (LGPD): somem ao fechar o navegador e não ficam no computador da escola.
const NOMES_KEY = PREFS_KEY + '-nomes';
prefs.names = (() => { try { return JSON.parse(sessionStorage.getItem(NOMES_KEY)) || []; } catch { return []; } })();
const savePrefs = () => {
  const { names, ...resto } = prefs;
  store.set(PREFS_KEY, resto);
  try { sessionStorage.setItem(NOMES_KEY, JSON.stringify(names || [])); } catch { /* sem armazenamento */ }
};
savePrefs(); // regrava sem os nomes que versões antigas guardavam

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

// Ponto de extensão: a versão com sala e QR code (jogo-tomada-de-decisao-sala) liga aqui os celulares,
// sem mexer neste arquivo. Na versão normal ninguém usa estes ganchos.
const ASM = (window.ASM = {
  onSync: null,      // (estado, acoes) a cada mudança de etapa
  onFim: null,       // (resultado) quando a partida termina
  onHome: null,      // ao voltar para a tela inicial
  onRematch: null,   // ao jogar de novo com os mesmos jogadores
  primary: () => { renderSetup(); show('#setup'); },   // botão "Vamos jogar!" da apresentação do Tuto
  esc, AVATARES, toast, show, hide,
});

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
  marca: () => beep(520, .05, 'triangle', .06),
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
  setItems(items) {
    this.items = items;
    this.wheelEl.innerHTML = wheelSvg(items, { hub: '' });
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
      $$('.seg.win', this.wheelEl).forEach((s) => s.classList.remove('win'));
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
const wheels = {};
ROLETA_CHAVES.forEach((k, i) => { wheels[k] = new Wheel(k, i + 1); $('#wheels').append(wheels[k].el); });

let G = null;          // partida atual
let spinning = false;
let timerT = null;

const SETUP = { n: 4, rounds: 2, set: 'base', meta: 12 };
ASM.SETUP = SETUP;
const MIN_PLAYERS = 3, MAX_PLAYERS = 6;
ASM.MIN_PLAYERS = MIN_PLAYERS; ASM.MAX_PLAYERS = MAX_PLAYERS;

function newGame(opts) {
  G = {
    players: opts.names.map((name, i) => ({ name, avatar: AVATARES[i % AVATARES.length], pid: opts.pids?.[i] })),
    sala: !!opts.pids,  // partida da sala: os jogadores entraram pelo QR code (versão com sala)
    rounds: opts.rounds ?? 0,
    set: opts.set || 'base',
    meta: opts.meta || 12,
    turn: 0,           // índice global de vezes jogadas
    deck: shuffle(DILEMAS.map((_, i) => i)),
    total: { acao: 0, consequencia: 0, apoio: 0 },
    metaOk: false,
    phase: 'draw',     // draw → read → spin → answer → mark
    res: null, card: null, marks: {}, ign: {}, rerolled: false,
  };
}

const curPlayerIdx = () => G.turn % G.players.length;
const curPlayer = () => G.players[curPlayerIdx()];
const roundNum = () => Math.floor(G.turn / G.players.length) + 1;
const totalTurns = () => G.rounds ? G.rounds * G.players.length : Infinity;
const isLast = () => G.turn + 1 >= totalTurns();
const somaTotal = () => MARCADOR_CHAVES.reduce((s, k) => s + G.total[k], 0);
function setForTurn() {
  if (G.set !== 'alternar') return G.set;
  return roundNum() % 2 === 1 ? 'base' : 'expansao';
}

function save() {
  if (!G || G.sala) return;   // a sala não fica guardada: ela some quando a mesa fecha
  const { players, rounds, set, meta, turn, deck, total, metaOk } = G;
  store.set(SAVE_KEY, { players, rounds, set, meta, turn, deck, total, metaOk, at: Date.now() });
}

/* ==========================================================
   Montagem da tela
   ========================================================== */
let shownSet = null;
function applyWheelSet() {
  const set = setForTurn();
  if (set === shownSet) return;
  shownSet = set;
  ROLETA_CHAVES.forEach((k) => wheels[k].setItems(ROLETAS[k][set]));
  $('#setChip').textContent = `Roletas: ${CONJUNTOS[set]}`;
}

function renderTopbar() {
  const r = G.rounds ? `Rodada ${roundNum()} de ${G.rounds}` : `Rodada ${roundNum()}`;
  $('#topbarTitle').innerHTML = `${r}<small>Vez de ${esc(curPlayer().name)}</small>`;
}

// Trilha coletiva: o grupo reúne marcadores de raciocínio; não há placar individual nem vencedor.
function renderScore(bump = false) {
  const ci = curPlayerIdx();
  const soma = somaTotal();
  const pct = Math.min(100, Math.round((soma / G.meta) * 100));
  $('#score').innerHTML = `
    <h3>Trilha coletiva</h3>
    <div class="trail">
      <div class="trail-n${bump ? ' bump' : ''}"><b>${soma}</b><span>de ${G.meta} marcadores${G.metaOk ? ' · meta alcançada!' : ''}</span></div>
      <div class="trail-bar" role="progressbar" aria-label="Marcadores do grupo" aria-valuemin="0" aria-valuemax="${G.meta}" aria-valuenow="${Math.min(soma, G.meta)}"><i style="width:${pct}%"></i></div>
      <ul class="trail-kinds">${MARCADOR_CHAVES.map((k) => `<li class="${k}"><i class="mk"></i>${MARCADORES[k].nome}<b>${G.total[k]}</b></li>`).join('')}</ul>
    </div>
    <h3>Participantes</h3>
    <ol>${G.players.map((p, i) => `
      <li class="${i === ci ? 'turn' : ''}">
        <span class="avatar"><img src="${p.avatar}" alt=""></span>
        <span class="pname">${esc(p.name)}<small>${i === ci ? 'Na vez' : 'Escutando e apoiando'}</small></span>
      </li>`).join('')}
    </ol>
    <p class="score-note">Cada participação conta. Não há vencedor individual.</p>`;
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

const DOT = { draw: 0, read: 0, spin: 1, answer: 2, mark: 3 };
function renderStep() {
  const st = $('#step');
  const idx = DOT[G.phase];
  const dots = [0, 1, 2, 3].map((i) => `<i class="${i < idx ? 'done' : i === idx ? 'on' : ''}"></i>`).join('');
  const who = `<span class="avatar"><img src="${curPlayer().avatar}" alt=""></span>`;
  const name = esc(curPlayer().name);
  const txt = {
    draw: ['Tire uma carta-dilema', 'Clique no monte para descobrir a situação. Primeiro a carta; depois, as roletas.', 'Tirar carta', 'draw'],
    read: ['Leia a carta em voz alta', 'O dilema já faz sentido sozinho. Você pode passar a vez ou trocar de carta.', 'Ver carta', 'open-card'],
    spin: ['Gire as roletas', 'Elas funcionam como lentes para ampliar a reflexão, não como partes da história.', 'Girar', 'spin'],
    answer: ['Hora de responder', 'Diga “Uma possibilidade seria…”. Dá para pedir tempo, pedir apoio ou passar.', 'Ver carta', 'open-card'],
    mark: ['Marcadores de raciocínio', 'O grupo registra o que apareceu na conversa.', 'Ver marcadores', 'open-mark'],
  }[G.phase];
  st.innerHTML = `${who}
    <div class="step-txt"><b>${name}: ${txt[0]}</b><span>${txt[1]}</span><div class="step-dots">${dots}</div></div>
    <button class="btn btn-primary btn-pill" data-action="${txt[3]}" ${spinning ? 'disabled' : ''}>${txt[2]}</button>`;

  const spinBtn = $('#spinBtn');
  spinBtn.disabled = G.phase !== 'spin' || spinning;
  spinBtn.classList.toggle('ready', G.phase === 'spin' && !spinning);
  $('#rereadBtn').classList.toggle('hidden', G.phase !== 'spin');
  const deck = $('#deck');
  deck.classList.toggle('ready', G.phase === 'draw');
  deck.setAttribute('aria-disabled', G.phase !== 'draw');
  $('#deckCount').textContent = `${G.deck.length} no monte`;
  $('#deckHint').textContent = G.phase === 'draw' ? 'Clique no monte para tirar uma carta.' : G.phase === 'spin' ? 'Agora, as roletas.' : '';
  sync();
}

function renderAll() {
  applyWheelSet();
  renderTopbar(); renderScore(); renderStep();
}

/* ==========================================================
   Ações (a mesa e, na versão com sala, os celulares chamam as mesmas)
   ========================================================== */
const A = {
  draw: () => doDraw(),
  toSpin: () => toSpin(),
  swap: () => swapCard(),
  pass: () => passTurn(),
  spin: () => doSpin(),
  toMark: () => toMark(),
  'm-acao': () => toggleMark('acao'),
  'm-consequencia': () => toggleMark('consequencia'),
  'm-apoio': () => toggleMark('apoio'),
  next: () => nextTurn(),
};

// Botões da etapa atual (a versão com sala mostra estes no celular de quem está na vez).
function acoes() {
  if (!G) return [];
  switch (G.phase) {
    case 'draw': return [{ k: 'draw', rotulo: 'Tirar uma carta', principal: true }];
    case 'read': return [
      { k: 'toSpin', rotulo: 'Girar as roletas', principal: true },
      { k: 'swap', rotulo: 'Trocar de carta' },
      { k: 'pass', rotulo: 'Passar a vez' },
    ];
    case 'spin': return spinning ? [] : [{ k: 'spin', rotulo: 'Girar as roletas', principal: true }];
    case 'answer': return spinning ? [] : [{ k: 'toMark', rotulo: 'Registrar marcadores', principal: true }];
    case 'mark': return [
      ...MARCADOR_CHAVES.map((k) => ({ k: `m-${k}`, rotulo: MARCADORES[k].nome, marca: true, on: !!G.marks[k] })),
      { k: 'next', rotulo: isLast() ? 'Ver resultado' : 'Próxima pessoa', principal: true },
    ];
    default: return [];
  }
}

const lentes = () => ROLETA_CHAVES.map((k) => ({
  k, titulo: ROLETAS[k].titulo, valor: um(ROLETAS[k][G.res.set][G.res[k]]), pergunta: ROLETAS[k].lente, ign: !!G.ign[k],
}));

// Retrato da partida para os celulares (versão com sala). Não leva nada pessoal além dos nomes escolhidos.
function snapshot() {
  const cartaVisivel = G.card != null && ['read', 'answer', 'mark'].includes(G.phase);
  const c = cartaVisivel ? DILEMAS[G.card] : null;
  return {
    fase: G.phase,
    girando: spinning,
    turno: G.turn,
    rodada: roundNum(),
    rodadas: G.rounds,
    meta: G.meta,
    ultimo: isLast(),
    ativo: curPlayer().pid,
    jogadores: G.players.map((p, i) => ({ pid: p.pid, nome: p.name, av: i })),
    total: G.total,
    carta: c ? { d: c.d, p: c.p } : null,
    lentes: G.res && !spinning && ['answer', 'mark'].includes(G.phase) ? lentes() : null,
    marcas: G.phase === 'mark' ? G.marks : null,
  };
}
function sync() {
  if (!G || !ASM.onSync) return;
  ASM.onSync(snapshot(), acoes());
}

/** Executa um botão pela chave (só vale se estiver na lista da etapa atual). */
function run(k) {
  if (!G || !acoes().some((a) => a.k === k)) return false;
  A[k]?.();
  return true;
}

/* ==========================================================
   Fluxo de uma vez
   ========================================================== */
function startTurn() {
  marking = false;
  G.phase = 'draw'; G.res = null; G.card = null; G.marks = {}; G.ign = {}; G.rerolled = false;
  Object.values(wheels).forEach((w) => w.clear());
  renderAll();
}

async function doDraw() {
  if (!G || G.phase !== 'draw') return;
  if (!G.deck.length) { G.deck = shuffle(DILEMAS.map((_, i) => i)); toast('O monte foi embaralhado de novo.'); }
  G.card = G.deck.shift();
  $('#deck').classList.remove('ready');
  G.phase = 'read';
  renderStep();
  sfx.flip();
  await openCard({ fly: true });
}

// Trocar a carta: a carta atual volta para o fim do monte e sai outra.
async function swapCard() {
  if (!G || G.phase !== 'read') return;
  G.deck.push(G.card);
  G.card = G.deck.shift();
  sfx.flip();
  renderStep();
  const dcard = $('#dcard');
  await openCard();
  if (!reduced()) dcard.animate([{ opacity: 0, transform: 'translateY(18px) rotateY(40deg)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,.8,.24,1)' });
}

// Passar a vez: a carta volta para o fim do monte e ninguém é marcado.
function passTurn() {
  if (!G || G.phase !== 'read') return;
  G.deck.push(G.card);
  hide('#spot');
  G.marks = {};
  advance();
}

function toSpin() {
  if (!G || G.phase !== 'read') return;
  stopTimer();
  hide('#spot');
  G.phase = 'spin';
  renderStep();
}

async function doSpin() {
  if (!G || G.phase !== 'spin' || spinning) return;
  spinning = true; renderStep();
  const set = setForTurn();
  const res = { set, pessoa: rnd(6), contexto: rnd(6), emocao: rnd(6) };
  const base = reduced() ? 300 : 2600;
  await Promise.all(ROLETA_CHAVES.map((k, i) =>
    wheels[k].spin(res[k], base + (reduced() ? 0 : i * 500), um(ROLETAS[k][set][res[k]]))));
  G.res = res; spinning = false;
  G.ign = {}; G.rerolled = false;
  G.phase = 'answer';
  renderStep();
  await wait(reduced() ? 0 : 450);
  if (G && G.phase === 'answer') await openCard();
}

// Sortear de novo UMA roleta (uma vez por vez de jogo), caso o resultado não combine ou incomode.
async function reroll(k) {
  if (!G || G.phase !== 'answer' || G.rerolled || spinning) return;
  G.rerolled = true; G.ign[k] = false;
  const set = G.res.set;
  let n; do { n = rnd(6); } while (n === G.res[k]);
  spinning = true; renderLenses(); renderStep();
  await wheels[k].spin(n, reduced() ? 300 : 1100, um(ROLETAS[k][set][n]));
  G.res[k] = n; spinning = false;
  renderLenses(); renderStep();
}

function toggleIgnore(k) {
  if (!G || G.phase !== 'answer') return;
  G.ign[k] = !G.ign[k];
  renderLenses(); sync();
}

/* ---------- carta aberta ---------- */
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

// A carta desce para a mesa antes dos marcadores.
function cardAway() {
  const dcard = $('#dcard');
  if (reduced() || $('#spot').classList.contains('hidden')) return Promise.resolve();
  return dcard.animate([
    { transform: 'none', opacity: 1 },
    { transform: 'translateY(40vh) scale(.35) rotate(10deg)', opacity: 0 },
  ], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' }).finished.catch(() => {});
}

function lensesHtml() {
  const lista = lentes();
  const bloqueado = G.rerolled || spinning;
  return `<div class="lenses" aria-label="Lentes de reflexão">
    <div class="lenses-cab"><b>Roletas como lentes</b><span>Escolha uma ou mais perguntas que ajudem. Pode ignorar o que não combinar.</span></div>
    ${lista.map((l) => `
      <div class="lens ${l.k}${l.ign ? ' ign' : ''}">
        <div class="lens-txt"><small>${l.titulo}</small><b>${esc(l.valor)}</b><p>${esc(l.pergunta)}</p></div>
        <div class="lens-btns">
          <button type="button" data-action="lens-ign" data-k="${l.k}" aria-pressed="${l.ign}">${l.ign ? 'Usar' : 'Ignorar'}</button>
          <button type="button" data-action="lens-reroll" data-k="${l.k}" ${bloqueado ? 'disabled' : ''}>Sortear outro</button>
        </div>
      </div>`).join('')}
    <p class="lenses-nota">${G.rerolled ? 'Você já sorteou outro resultado nesta vez.' : 'Dá para sortear outro resultado de uma única roleta nesta vez.'}</p>
  </div>`;
}
function renderLenses() {
  const box = $('#lensesBox');
  if (box) box.innerHTML = lensesHtml();
}

function openCard({ fly = false } = {}) {
  stopTimer();
  const story = $('#spotStory');
  const d = DILEMAS[G.card];
  story.textContent = d.d;
  const len = d.d.length;
  story.classList.toggle('l2', len > 150 && len <= 190);
  story.classList.toggle('l3', len > 190);
  const dcard = $('#dcard');
  const extra = $('#spotExtra'), actions = $('#spotActions');
  const answering = G.phase === 'answer';

  const p = curPlayer();
  $('#spotWho').innerHTML = `<span class="avatar"><img src="${p.avatar}" alt=""></span>${answering ? `${esc(p.name)} responde` : `Vez de ${esc(p.name)}: leia em voz alta`}`;
  if (answering) {
    extra.innerHTML = `
      <p class="prompt">${esc(p.name)} responde: <b>“Uma possibilidade seria…”</b>. Quem escuta pode acrescentar: <b>“Outra alternativa poderia ser…”</b> ou <b>“Uma consequência possível seria…”</b>. Ninguém precisa aceitar as sugestões.</p>
      <div id="lensesBox">${lensesHtml()}</div>
      `;
    actions.innerHTML = `
      <button class="btn btn-primary btn-pill" data-action="to-mark">Registrar marcadores</button>`;
  } else {
    extra.innerHTML = `
      <p class="prompt">O dilema já faz sentido sozinho: as roletas virão depois, como lentes para pensar. Você pode <b>passar a vez</b>, <b>trocar de carta</b> ou responder sem contar nada vivido por você.</p>
      `;
    actions.innerHTML = `
      <button class="btn btn-lilas btn-pill" data-action="pass">Passar a vez</button>
      <button class="btn btn-soft btn-pill" data-action="swap">Trocar de carta</button>
      <button class="btn btn-primary btn-pill" data-action="to-spin">Girar as roletas</button>`;
  }
  const spot = $('#spot');
  spot.classList.toggle('landing', fly && !reduced());
  spot.classList.toggle('compact', answering);
  show('#spot');
  if (fly && !reduced()) return flyFromDeck(dcard);
  return Promise.resolve();
}

function stopTimer() { clearInterval(timerT); timerT = null; }

/* ---------- marcadores de raciocínio ---------- */
let marking = false;
function toMark() {
  if (!G || G.phase !== 'answer' || spinning || marking) return;
  marking = true;
  stopTimer();
  cardAway().then(() => { hide('#spot'); openMark(); });
}

function openMark() {
  marking = false;
  G.phase = 'mark';
  renderStep();
  renderMark();
  show('#vote');
}

function renderMark() {
  const p = curPlayer();
  const n = MARCADOR_CHAVES.filter((k) => G.marks[k]).length;
  $('#voteTitle').textContent = 'Marcadores de raciocínio';
  $('#voteSub').textContent = `O que apareceu na resposta de ${p.name} e na conversa? Os marcadores registram o raciocínio. Não medem o valor da pessoa nem existe resposta certa, e a pontuação não depende da concordância do grupo.`;
  $('#voteList').innerHTML = `<div class="marcas" role="group" aria-label="Marcadores">
    ${MARCADOR_CHAVES.map((k) => `
      <button type="button" class="marca ${k}${G.marks[k] ? ' on' : ''}" data-marca="${k}" aria-pressed="${!!G.marks[k]}">
        <span class="marca-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        <span class="marca-txt"><b>${MARCADORES[k].nome}</b><span>${MARCADORES[k].quando}</span><small>${MARCADORES[k].reconhece}</small></span>
      </button>`).join('')}
  </div>
  <p class="marcas-nota">Se nenhum marcador for registrado, tudo bem: a conversa continua válida.</p>`;
  $('#voteFoot').innerHTML = `
    <small class="vote-count">${n} de 3 nesta vez</small>
    <button class="btn btn-primary btn-pill" data-action="next">${isLast() ? 'Ver resultado' : `Próxima pessoa: ${esc(G.players[(G.turn + 1) % G.players.length].name)}`}</button>`;
}

function toggleMark(k) {
  if (!G || G.phase !== 'mark') return;
  G.marks[k] = !G.marks[k];
  sfx.marca();
  renderMark(); sync();
}

function commitMarks() {
  MARCADOR_CHAVES.forEach((k) => { if (G.marks[k]) G.total[k]++; });
  G.marks = {};
}

function nextTurn() {
  if (!G || G.phase !== 'mark') return;
  const antes = somaTotal();
  commitMarks();
  const depois = somaTotal();
  hideAll();
  if (!G.metaOk && depois >= G.meta) { G.metaOk = true; sfx.chime(); toast('Meta do grupo alcançada! Cada participação contou.'); }
  advance(depois > antes);
}

// Passa para a pessoa seguinte (ou termina quando as voltas combinadas acabam).
function advance(bump = false) {
  hideAll();
  if (isLast()) { G.turn++; save(); return finish(); }
  G.turn++;
  save();
  startTurn();
  if (bump) renderScore(true);
  toast(`Vez de ${curPlayer().name}`);
}

/* ---------- fim ---------- */
function finish() {
  hideAll();
  const soma = somaTotal();
  const ok = soma >= G.meta;
  $('#endBody').innerHTML = `
    <img class="end-tuto" src="assets/tuto/tuto-coracao.webp" alt="">
    <h2 id="endTitle" class="sheet-title">${ok ? 'O grupo completou a trilha!' : 'Fim da trilha coletiva'}</h2>
    <p class="sheet-sub">O grupo reuniu <b>${soma}</b> de ${G.meta} marcadores de raciocínio. Cada participação conta; não há vencedor individual.${ok ? '' : ' Se o grupo não atingiu o número, a atividade continua válida: o que importa é o que foi pensado e conversado.'}</p>
    <ul class="trail-kinds big">${MARCADOR_CHAVES.map((k) => `<li class="${k}"><i class="mk"></i>${MARCADORES[k].nome}<b>${G.total[k]}</b></li>`).join('')}</ul>
    <div class="closing">
      <b>Para fechar</b>
      <p>Cada pessoa pode escolher uma palavra ou ideia da conversa. A partilha é opcional.</p>
      <div class="words">${PALAVRAS_FECHAMENTO.map((w) => `<span>${w}</span>`).join('')}<span class="outra">Ou outra</span></div>
      <p>Decisões dependem do contexto, e buscar apoio pode fazer parte de uma escolha cuidadosa.</p>
    </div>
    <div class="row-btns">
      <button class="btn btn-soft" data-action="go-home">Início</button>
      <button class="btn btn-primary btn-pill" data-action="rematch">Jogar de novo</button>
    </div>`;
  store.del(SAVE_KEY);
  ASM.onFim?.({ soma, meta: G.meta, total: { ...G.total }, ok });
  show('#end');
  confetti();
}

/* ==========================================================
   Configuração
   ========================================================== */
function renderSetup() {
  $('#playersSeg').innerHTML = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map((n) => `<button data-n="${n}" class="${n === SETUP.n ? 'on' : ''}">${n}</button>`).join('');
  $('#roundsSeg').innerHTML = roundsHtml();
  $('#setSeg').innerHTML = setHtml();
  $('#metaSeg').innerHTML = metaHtml();
  const list = $('#namesList');
  const old = $$('input', list).map((i) => i.value);
  list.innerHTML = Array.from({ length: SETUP.n }, (_, i) => {
    const v = old[i] ?? prefs.names[i] ?? '';
    return `<label class="name-row"><span class="avatar"><img src="${AVATARES[i]}" alt=""></span>
      <input maxlength="14" autocomplete="off" placeholder="Jogador ${i + 1}" value="${esc(v)}" aria-label="Nome do jogador ${i + 1}"></label>`;
  }).join('');
}
const roundsHtml = () => [[1, '1'], [2, '2'], [3, '3'], [0, 'Livre']].map(([v, l]) => `<button data-r="${v}" class="${v === SETUP.rounds ? 'on' : ''}">${l}</button>`).join('');
const setHtml = () => [['base', 'Base'], ['expansao', 'Expansão'], ['alternar', 'Alternar']].map(([v, l]) => `<button data-s="${v}" class="${v === SETUP.set ? 'on' : ''}">${l}</button>`).join('');
const metaHtml = () => METAS.map((v) => `<button data-m="${v}" class="${v === SETUP.meta ? 'on' : ''}">${v}</button>`).join('');
ASM.roundsHtml = roundsHtml; ASM.setHtml = setHtml; ASM.metaHtml = metaHtml;

/* ==========================================================
   Telas e modais
   ========================================================== */
// com uma janela aberta, o título da barra de cima não pode aparecer por trás do desfoque
const marcaModal = () => document.body.classList.toggle('com-modal', !!document.querySelector('.modal:not(.hidden)'));
function show(sel) { $(sel).classList.remove('hidden'); marcaModal(); const f = $(`${sel} [data-action]:not(.sheet-close)`); f?.focus({ preventScroll: true }); }
function hide(sel) { $(sel).classList.add('hidden'); marcaModal(); if (sel === '#intro') stopIntro(); }
function hideAll() { $$('.modal').forEach((m) => m.classList.add('hidden')); marcaModal(); stopTimer(); stopIntro(); }

async function enterGame() {
  hideAll();
  const home = $('#home');
  home.classList.add('leaving');
  await wait(reduced() ? 0 : 380);
  home.classList.add('hidden'); home.classList.remove('leaving');
  $('#game').classList.remove('hidden');
  window.scrollTo(0, 0);
  shownSet = null;
  startTurn();
}

function goHome() {
  hideAll();
  ASM.onHome?.();
  $('#game').classList.add('hidden');
  $('#home').classList.remove('hidden');
  G = null;
  refreshResume();
}

ASM.novaPartida = (opts) => newGame(opts);
ASM.entrar = () => enterGame();
ASM.get = () => G;
ASM.run = run;
ASM.acoes = acoes;
ASM.snapshot = () => (G ? snapshot() : null);

function refreshResume() {
  const s = store.get(SAVE_KEY);
  const btn = $('#resumeBtn');
  if (s && s.players?.length >= MIN_PLAYERS) {
    const r = Math.floor(s.turn / s.players.length) + 1;
    $('#resumeInfo').textContent = `${s.players.length} jogadores · rodada ${r}${s.rounds ? ` de ${s.rounds}` : ''}`;
    btn.classList.remove('hidden');
  } else btn.classList.add('hidden');
}

function askConfirm({ title, sub, ok, action }) {
  $('#confirmTitle').textContent = title;
  $('#confirmSub').textContent = sub;
  const b = $('#confirmOk');
  b.textContent = ok; b.dataset.action = action;
  show('#confirm');
}

/* ==========================================================
   Eventos
   ========================================================== */
const MODAIS_FECHAVEIS = ['rules', 'setup', 'confirm', 'intro'];

document.addEventListener('click', (e) => {
  const seg = e.target.closest('#playersSeg button, #roundsSeg button, #setSeg button, #metaSeg button');
  if (seg) {
    if (seg.dataset.n) SETUP.n = +seg.dataset.n;
    if (seg.dataset.r !== undefined) SETUP.rounds = +seg.dataset.r;
    if (seg.dataset.s) SETUP.set = seg.dataset.s;
    if (seg.dataset.m) SETUP.meta = +seg.dataset.m;
    renderSetup();
    return;
  }
  const marca = e.target.closest('button[data-marca]');
  if (marca) { toggleMark(marca.dataset.marca); return; }
  const a = e.target.closest('[data-action]');
  if (!a) {
    // clique fora da folha fecha modais leves
    const m = e.target.classList?.contains('modal') ? e.target : null;
    if (m && MODAIS_FECHAVEIS.includes(m.id)) hide(`#${m.id}`);
    return;
  }
  const act = a.dataset.action;
  switch (act) {
    case 'setup': renderSetup(); show('#setup'); break;
    case 'resume': {
      const s = store.get(SAVE_KEY);
      if (!s || s.players?.length < MIN_PLAYERS) { store.del(SAVE_KEY); return refreshResume(); }
      G = { ...s, sala: false, phase: 'draw', res: null, card: null, marks: {}, ign: {}, rerolled: false };
      enterGame(); break;
    }
    case 'start': {
      const names = $$('#namesList input').map((inp, i) => inp.value.trim() || `Jogador ${i + 1}`);
      prefs.names = $$('#namesList input').map((inp) => inp.value.trim()); savePrefs();
      newGame({ names, rounds: SETUP.rounds, set: SETUP.set, meta: SETUP.meta });
      save(); enterGame(); break;
    }
    case 'rules': show('#rules'); break;
    case 'intro':
      hideAll();
      $('[data-action="intro-play"]').textContent = G ? 'Voltar ao jogo' : 'Vamos jogar!';
      show('#intro'); openIntro(); break;
    case 'intro-play': if (G) hide('#intro'); else { hide('#intro'); ASM.primary(); } break;
    case 'close':
      hide(`#${a.closest('.modal').id}`); stopTimer(); break;
    case 'sound':
      prefs.sound = !prefs.sound; savePrefs();
      $('#soundBtn').classList.toggle('off', !prefs.sound);
      toast(prefs.sound ? 'Som ligado' : 'Som desligado'); break;
    case 'home':
      if (G && G.turn < totalTurns()) {
        askConfirm({
          title: 'Sair da partida?',
          sub: G.sala ? 'A sala será encerrada e os celulares serão desconectados.' : 'O andamento fica salvo neste aparelho. Você pode continuar depois pela tela inicial.',
          ok: 'Sair', action: 'leave',
        });
      } else goHome();
      break;
    case 'ask-finish':
      if (G) askConfirm({ title: 'Encerrar a partida?', sub: 'O grupo vê o resultado e a trilha termina aqui. Não tem problema encerrar antes: o que foi conversado já valeu.', ok: 'Encerrar', action: 'finish' });
      break;
    case 'leave': save(); goHome(); break;
    case 'go-home': goHome(); break;
    case 'spin': doSpin(); break;
    case 'draw': doDraw(); break;
    case 'open-card': if (G?.card != null) openCard(); break;
    case 'open-mark': if (G?.phase === 'mark') { renderMark(); show('#vote'); } break;
    case 'to-spin': toSpin(); break;
    case 'to-mark': toMark(); break;
    case 'swap': swapCard(); break;
    case 'pass': passTurn(); break;
    case 'lens-ign': toggleIgnore(a.dataset.k); break;
    case 'lens-reroll': reroll(a.dataset.k); break;
    case 'next': nextTurn(); break;
    case 'finish': finish(); break;
    case 'rematch': {
      const names = G.players.map((p) => p.name);
      const pids = G.sala ? G.players.map((p) => p.pid) : undefined;
      newGame({ names, pids, rounds: G.rounds, set: G.set, meta: G.meta });
      if (G.sala) ASM.onRematch?.();
      save(); hideAll(); shownSet = null; startTurn(); break;
    }
  }
});

$('#deck').addEventListener('click', doDraw);
$('#deck').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doDraw(); } });

document.addEventListener('keydown', (e) => {
  if (introKey(e)) return;
  if (e.key !== 'Escape') return;
  const open = $$('.modal:not(.hidden)').pop();
  if (!open) return;
  if (MODAIS_FECHAVEIS.includes(open.id)) hide(`#${open.id}`);
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
$('#dcardTuto').src = 'assets/img/tuto-carta.png';   // o Tuto da carta-dilema impressa
$('#soundBtn').classList.toggle('off', !prefs.sound);
refreshResume();
