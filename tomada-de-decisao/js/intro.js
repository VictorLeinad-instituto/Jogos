// Apresentação do jogo pelo Tuto (mesmo formato do Tuto e a jornada): balões no estilo do guia do participante,
// palavras aparecendo no tempo da fala e o Tuto em camadas (corpo por pose, olhos piscando, boca em 5 aberturas).
// Enquanto não há narração (INTRO.audio = null), um relógio próprio faz o papel do áudio: o balão "fala" no ritmo
// estimado e a boca mexe palavra a palavra. Com o áudio, a boca segue o volume da voz (INTRO.boca, 25 quadros/s).
import { INTRO } from './intro-data.js';

const $ = (s) => document.querySelector(s);
const POSES = ['aceno', 'apresenta', 'joinha'];
const SRC = 'assets/intro/';
const CHAVE = 'asm-decisao-intro';
const guarda = {
  get() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; } },
  set(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch { /* sem armazenamento */ } },
};
const mudoSalvo = () => !!guarda.get().mudo;

const starts = INTRO.baloes.map((b) => b.palavras[0][1]);
// acena no começo ("Oi! … Eu sou o Tuto"), apresenta a partir do 2º balão, joinha na pergunta final
const tApresenta = starts[1];
const tJoinha = starts[starts.length - 1];

/** Relógio que imita um <audio> (para quando ainda não há narração). */
class Relogio {
  constructor(dur) { this.duration = dur; this.t0 = 0; this.base = 0; this.paused = true; this.ended = false; this.muted = false; this.fim = null; }
  get currentTime() {
    if (this.paused) return this.base;
    const t = this.base + (performance.now() - this.t0) / 1000;
    if (t >= this.duration) { this.base = this.duration; this.paused = true; this.ended = true; this.fim?.(); return this.duration; }
    return t;
  }
  set currentTime(v) { this.base = Math.max(0, Math.min(this.duration, v)); this.t0 = performance.now(); this.ended = false; }
  play() { if (this.paused) { this.t0 = performance.now(); this.paused = false; this.ended = false; } return Promise.resolve(); }
  pause() { if (!this.paused) { this.base = this.currentTime; this.paused = true; } }
  addEventListener(ev, fn) { if (ev === 'ended') this.fim = fn; }
}

let audio = null, built = false, raf = 0, cur = -1, ended = false;
let layers = {}, words = [], blinkAt = 0, blinkUntil = 0;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const temVoz = () => !!INTRO.audio;

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'onclick') e.onclick = v; else if (k === 'class') e.className = v; else e.setAttribute(k, v); }
  e.append(...kids);
  return e;
}

function build() {
  built = true;
  const fig = $('#introFig');
  const img = (name) => el('img', { src: `${SRC}${name}.webp`, alt: '', class: 'lay', draggable: 'false' });
  layers.corpo = {};
  for (const p of POSES) layers.corpo[p] = [0, 1, 2].map((i) => fig.appendChild(img(`corpo-${p}-${i}`)));
  layers.olhos = [0, 1].map((i) => fig.appendChild(img(`olhos-${i}`)));
  layers.boca = [0, 1, 2, 3, 4].map((i) => fig.appendChild(img(`boca-${i}`)));
  const bar = $('#introSegs');
  INTRO.baloes.forEach((_, i) => bar.append(el('button', {
    class: 'iseg', 'aria-label': `Balão ${i + 1} de ${INTRO.baloes.length}`, onclick: () => seek(i),
  }, el('i'))));
  $('#introPlay').onclick = toggle;
  // som da voz: só aparece quando houver narração (a escolha fica lembrada neste aparelho)
  $('#introMute').hidden = !temVoz();
  $('#introMute').onclick = () => setMute(!mudoSalvo());
  $('#introPrev').onclick = () => seek(Math.max(0, para(time()) - (time() - starts[para(time())] > 1.2 ? 0 : 1)));
  $('#introNext').onclick = () => seek(Math.min(INTRO.baloes.length - 1, para(time()) + 1));
  $('#introAgain').onclick = () => seek(0);
  $('#introAgain').textContent = temVoz() ? 'Ouvir de novo' : 'Ver de novo';
  $('#introFig').parentElement.onclick = () => toggle();
}

const time = () => (audio ? audio.currentTime : 0);
function para(t) { let i = 0; starts.forEach((s, k) => { if (t >= s - 0.3) i = k; }); return i; }

function show(i) {
  cur = i;
  const b = $('#introBubble');
  b.innerHTML = '';
  words = INTRO.baloes[i].palavras.map(([w, t]) => {
    const s = el('span', { class: 'w' }, w);
    b.append(s, ' ');
    return { s, t };
  });
  b.setAttribute('aria-label', INTRO.baloes[i].texto);
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
}

/** Abertura da boca: pelo volume da voz (com áudio) ou palavra a palavra (sem áudio). */
function boca(t, playing) {
  if (!playing) return 0;
  if (temVoz()) {
    const f = Math.floor(t * INTRO.fps), b = (n) => +(INTRO.boca[n] || 0);
    return Math.max(b(f), b(f - 1) - 1, b(f - 2) - 2);
  }
  const w = [...words].reverse().find((x) => t >= x.t);
  if (!w) return 0;
  const nx = words[words.indexOf(w) + 1];
  const fimW = nx ? nx.t : w.t + 0.45;
  if (t > fimW - 0.08) return 0;   // pausa entre palavras
  const fase = (t - w.t) * 11 + w.s.textContent.length;
  return [2, 3, 4, 3, 1, 2, 4, 2][Math.floor(fase) % 8];
}

function frame(now) {
  const t = time();
  const playing = audio && !audio.paused && !audio.ended;
  const i = ended ? INTRO.baloes.length - 1 : para(t);
  if (i !== cur) show(i);
  // palavras já ditas aparecem; ao pausar ou no fim, o balão fica completo
  for (const w of words) w.s.classList.toggle('on', !playing || ended || t >= w.t - 0.05);
  const pose = ended || t >= tJoinha - 0.2 ? 'joinha' : t < tApresenta - 0.3 ? 'aceno' : 'apresenta';
  const k = reduce() ? 0 : Math.floor(now / (pose === 'aceno' && playing ? 130 : 170)) % 3;
  for (const p of POSES) layers.corpo[p].forEach((e, n) => { e.hidden = !(p === pose && n === k); });
  const lv = boca(t, playing);
  layers.boca.forEach((e, n) => { e.hidden = n !== lv; });
  // piscar de vez em quando
  if (now > blinkAt) { blinkUntil = now + 130; blinkAt = now + 2400 + Math.random() * 3200; }
  const blink = now < blinkUntil;
  layers.olhos[0].hidden = blink; layers.olhos[1].hidden = !blink;
  // barra de balões
  [...$('#introSegs').children].forEach((e, n) => {
    const a = starts[n], b = starts[n + 1] ?? INTRO.dur;
    e.firstChild.style.width = (ended ? 100 : Math.max(0, Math.min(1, (t - a) / (b - a))) * 100) + '%';
    e.classList.toggle('cur', n === i);
  });
  $('#intro').classList.toggle('playing', playing);
  $('#intro').classList.toggle('ended', ended);
  $('#introPlay').setAttribute('aria-label', playing ? 'Pausar' : temVoz() ? 'Ouvir' : 'Continuar');
  raf = requestAnimationFrame(frame);
}

function setMute(m) {
  guarda.set({ ...guarda.get(), mudo: m });
  if (audio) audio.muted = m;
  const b = $('#introMute');
  b.setAttribute('aria-pressed', String(m));
  const t = m ? 'Ativar a voz' : 'Silenciar a voz';
  b.setAttribute('aria-label', t); b.title = t;
}

function play() { ended = false; audio.play().catch(() => {}); }
function toggle() { if (!audio) return; if (ended) seek(0); else if (audio.paused) play(); else audio.pause(); }
function seek(i) { if (!audio) return; ended = false; audio.currentTime = Math.max(0, starts[i] - 0.15); cur = -1; play(); }

function criarAudio() {
  if (!temVoz()) { const r = new Relogio(INTRO.dur); r.addEventListener('ended', () => { ended = true; }); return r; }
  const a = new Audio(SRC + INTRO.audio);
  a.preload = 'auto';
  a.muted = mudoSalvo();
  a.addEventListener('ended', () => { ended = true; });
  // servidor sem "Range" (ex.: preview local) não deixa pular no áudio: troca por uma cópia em memória
  a.addEventListener('loadedmetadata', () => {
    if (a.src.startsWith('blob:') || a.seekable.length) return;
    fetch(SRC + INTRO.audio).then((r) => r.blob()).then((b) => {
      const t = a.currentTime, tocando = !a.paused;
      a.src = URL.createObjectURL(b);
      a.addEventListener('loadedmetadata', () => { a.currentTime = t; if (tocando) a.play().catch(() => {}); }, { once: true });
    });
  }, { once: true });
  return a;
}

export function openIntro() {
  if (!built) build();
  setMute(mudoSalvo());
  if (!audio) audio = criarAudio();
  ended = false; cur = -1;
  audio.currentTime = 0;
  $('#intro').classList.remove('hidden');
  $('#introPlay').focus({ preventScroll: true });
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
  play();
}

export function stopIntro() {
  if (audio) audio.pause();
  cancelAnimationFrame(raf);
}

export function introKey(e) {
  if ($('#intro').classList.contains('hidden')) return false;
  if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); toggle(); return true; }
  if (e.key === 'ArrowRight') { $('#introNext').click(); return true; }
  if (e.key === 'ArrowLeft') { $('#introPrev').click(); return true; }
  return false;
}
