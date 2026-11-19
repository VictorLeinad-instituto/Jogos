import { CARTAS, SENSIVEIS, AVISO, CONTATOS, PODERES, META, imgPoder, MODOS, QTDS, MIN_JOG, MAX_JOG, CORES } from './data.js';
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
const pts = (n) => `${n} ${n === 1 ? 'ponto' : 'pontos'}`;

const PREFS_KEY = 'asm-liga-prefs';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
};
const prefs = Object.assign({ sound: true, names: [] }, store.get(PREFS_KEY) || {});
const savePrefs = () => store.set(PREFS_KEY, prefs);

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

// Ponto de extensão: a versão com sala e QR code liga aqui os celulares, sem mexer neste arquivo.
const ASM = (window.ASM = {
  onSync: null, onFim: null, onHome: null, onRematch: null,
  primary: () => { renderSetup(); show('#setup'); },
  esc, toast, show, hide,
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
  tick: () => beep(760, .04, 'square', .03),
  flip: () => { beep(420, .08, 'sine', .07); beep(640, .1, 'sine', .06, .06); },
  escolha: () => beep(520, .06, 'triangle', .06),
  revela: () => [392, 523, 659].forEach((f, i) => beep(f, .16, 'sine', .07, i * .08)),
  poder: () => [523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, .24, 'sine', .07, i * .09)),
};

/* ==========================================================
   Estado
   ========================================================== */
let G = null;
const SETUP = { modo: 'coop', n: 4, qtd: 6 };
ASM.SETUP = SETUP;
ASM.MIN_JOG = MIN_JOG; ASM.MAX_JOG = MAX_JOG;

// um aparelho: cada pessoa ganha um avatar diferente (na sala eles vêm dos celulares)
const avPadrao = (n) => { const a = Array.from({ length: 14 }, (_, i) => i + 1); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
function newGame({ names, pids, modo, qtd, avs }) {
  avs = avs || avPadrao(names.length);
  G = {
    modo: modo || 'coop',
    qtd: Math.min(qtd || 6, CARTAS.length),
    qtdBase: Math.min(qtd || 6, CARTAS.length),   // quantas cartas cada "rodada de jogo" tem (o "Continuar" soma mais isso)
    continuando: false,
    sala: !!pids,
    players: names.map((name, i) => ({ name, cor: CORES[i % CORES.length], pid: pids?.[i] || null, av: avs?.[i] || 0, pts: 0, poderes: [] })),
    deck: shuffle(CARTAS.map((_, i) => i)),
    k: 0,                 // cartas já jogadas (a carta atual é a k+1)
    idx: null,            // índice da carta atual em CARTAS
    id: Date.now(),
    fase: 'monte',        // monte → ler → escolher → revelar (ou ler → conversa, no modo sem pontuação)
    pos: [],              // casa em que cada peão está desenhado no tabuleiro
    escolhas: {},         // índice do jogador → 'A'..'D' ou 'passo'
    fila: [], handoff: true, pick: null,
    grupo: 0, poderesGrupo: [],
    lidas: [],
    ganhos: null,         // da última revelação
  };
}

const leitorIdx = () => G.k % G.players.length;
const leitor = () => G.players[leitorIdx()];
// As alternativas mudam de lugar a cada vez que a carta é virada (a de mais pontos nem sempre é a D): G.alts guarda a ordem sorteada
const carta = () => ({ ...CARTAS[G.idx], alternativas: G.alts || CARTAS[G.idx].alternativas });
function sortearAlternativas() {
  const base = CARTAS[G.idx].alternativas.map((a) => ({ texto: a.texto, pontos: a.pontos }));
  for (let i = base.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
  G.alts = base.map((a, i) => ({ letra: 'ABCD'[i], texto: a.texto, pontos: a.pontos }));
}
const pontosDe = (letra) => (letra === 'passo' ? 0 : carta().alternativas.find((a) => a.letra === letra)?.pontos ?? 0);
const ultimo = () => G.k + 1 >= G.qtd || !G.deck.length || (G.modo === 'coop' && G.grupo >= META && !G.continuando);
const comPontos = () => G.modo !== 'conversa';
const poderesAte = (total) => PODERES.filter((p) => p.marco <= total).map((p) => p.id);

/* ==========================================================
   Desenho
   ========================================================== */
function avatar(p, cls = '') {
  if (p.av) return `<span class="av foto ${cls}" style="background-image:url(assets/avatares/av-${String(p.av).padStart(2, '0')}.png)" aria-hidden="true"></span>`;
  const m = /^jogador (\d+)$/i.exec(p.name.trim());
  return `<span class="av ${cls}" style="--av:${p.cor}" aria-hidden="true">${esc(m ? m[1] : (p.name.trim()[0] || '?').toUpperCase())}</span>`;
}

function renderTopbar() {
  $('#topbarTitle').innerHTML = `Carta ${G.k + 1} de ${G.qtd}<small>${MODOS[G.modo].nome} · leitura: ${esc(leitor().name)}</small>`;
}

function cartaHtml({ revelar = false } = {}) {
  const c = carta();
  const cont = {};
  const nomes = {};
  if (revelar) G.players.forEach((p, i) => { const l = G.escolhas[i]; if (l) { cont[l] = (cont[l] || 0) + 1; (nomes[l] = nomes[l] || []).push(p); } });
  return `
    <div class="carta-cab"><span class="carta-n">Dilema <b>${c.n}</b></span><span class="carta-tema">${esc(c.tema)}</span></div>
    <p class="carta-dilema">${esc(c.dilema)}</p>
    <ol class="alts">${c.alternativas.map((a) => `
      <li class="alt${revelar ? ' rev' : ''}">
        <span class="alt-l" translate="no">${a.letra}</span>
        <span class="alt-t">${esc(a.texto)}</span>
        ${revelar && comPontos() ? `<span class="alt-p" title="${pts(a.pontos)}">${a.pontos}<small>${a.pontos === 1 ? 'ponto' : 'pontos'}</small></span>` : ''}
        ${revelar ? `<span class="alt-quem">${cont[a.letra] ? (G.modo === 'comp' ? nomes[a.letra].map((p) => avatar(p, 'mini')).join('') : `<b>${cont[a.letra]}</b> ${cont[a.letra] === 1 ? 'escolha' : 'escolhas'}`) : ''}</span>` : ''}
      </li>`).join('')}
    </ol>
    <img class="carta-tuto" src="assets/tuto/tuto-carta.png" alt="">`;
}

// Ajusta o tamanho da carta aberta para ela caber inteira na tela (sem rolar e sem a barra de baixo cobrir).
// Usa zoom (o layout encolhe junto, textos e espaços na mesma proporção): quando a carta tem mais texto ou está revelada, ela só diminui.
function ajustarCarta() {
  const palco = $('#palco'), box = $('#carta'), apoio = $('#apoio');
  if (!G || G.idx == null || !$('#game').classList.contains('aberta')) return;
  if ($('#game').classList.contains('so-pontos')) {
    // só os pontos (e superpoderes): ajusta apenas o painel central
    apoio.style.zoom = '';
    const c2 = getComputedStyle(palco);
    const av2 = palco.clientHeight - parseFloat(c2.paddingTop) - parseFloat(c2.paddingBottom);
    if (apoio.offsetHeight > av2 + 1) apoio.style.zoom = String(Math.max(0.4, Math.floor((av2 / apoio.offsetHeight) * 100) / 100));
    return;
  }
  if (!box.innerHTML) return;
  box.style.zoom = '';
  box.parentElement.style.removeProperty('--cardw');
  const cs = getComputedStyle(palco);
  const coluna = cs.flexDirection === 'column';
  const folga = coluna && apoio.offsetHeight ? apoio.offsetHeight + (parseFloat(cs.rowGap) || 0) : 0;
  const avail = palco.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - folga;
  const h = box.offsetHeight;
  if (h > avail + 1) box.style.zoom = String(Math.max(0.4, Math.floor((avail / h) * 100) / 100));
  // o painel ao lado (pontos, conversa e aviso) também diminui se não couber
  apoio.style.zoom = '';
  if (!coluna && apoio.offsetHeight > avail + 1) apoio.style.zoom = String(Math.max(0.5, Math.floor((avail / apoio.offsetHeight) * 100) / 100));
}
window.addEventListener('resize', () => ajustarCarta());
document.fonts?.ready.then(() => ajustarCarta());

function renderCarta() {
  const box = $('#carta');
  const jogo = $('#game');
  if (G.idx == null) {
    box.getAnimations().forEach((a) => a.cancel());
    box.innerHTML = ''; $('#apoio').innerHTML = ''; jogo.classList.remove('aberta');
    return;
  }
  jogo.classList.add('aberta');
  // sala com pontos: ao mostrar os pontos a carta some (vai para as lidas) e só fica a explosão, centralizada
  const soPontos = G.sala && comPontos() && G.fase === 'revelar';
  jogo.classList.toggle('so-pontos', soPontos);
  jogo.classList.toggle('carta-ida', soPontos && !!G.cartaSumiu);
  if (soPontos) { $('#apoio').innerHTML = G.cartaSumiu ? bannerHtml() : ''; ajustarCarta(); return; }
  box.innerHTML = cartaHtml({ revelar: G.fase === 'revelar' });
  box.classList.toggle('revelada', G.fase === 'revelar');
  // aviso de proteção nas cartas sensíveis (e depois da revelação, as perguntas para a conversa)
  const sens = SENSIVEIS.includes(carta().n);
  const conversa = ['revelar', 'conversa'].includes(G.fase);
  const passaram = Object.values(G.escolhas).filter((l) => l === 'passo').length;
  $('#apoio').innerHTML = `
    ${comPontos() && G.fase === 'revelar' ? `<div class="pontos-rodada"><small>Nesta carta</small>${bannerPontos()}</div>` : ''}
    ${conversa ? `<div class="conversa"><b>Para conversar, sem exigir consenso</b>
      <p>Que consequências cada caminho pode ter? O que ajudaria a manter as pessoas seguras e respeitadas?</p>
      ${G.fase === 'revelar' && passaram ? `<p class="passaram">${passaram} ${passaram === 1 ? 'pessoa preferiu' : 'pessoas preferiram'} passar. Tudo bem: a rodada continua sem perguntas.</p>` : ''}
      ${comPontos() && G.fase === 'revelar' ? '<p class="lembrete">Os pontos medem só as escolhas previstas nesta dinâmica: não medem caráter, empatia real nem valor pessoal.</p>' : ''}
      <details><summary>Dica para quem conduz</summary><p>${esc(carta().nota)}</p></details></div>` : ''}
    ${sens ? `<div class="aviso" role="note"><b>Atenção</b><p>${esc(AVISO)}</p><p class="contatos">${esc(CONTATOS)}</p></div>` : ''}`;
  ajustarCarta();
}

function cartelaHtml(total) {
  const marcos = Object.fromEntries(PODERES.map((p) => [p.marco, p]));
  return `<div class="cartela" aria-label="Cartela de pontuação: ${total} de ${META}">${Array.from({ length: META }, (_, i) => {
    const n = i + 1, p = marcos[n];
    return `<i class="${n <= total ? 'on' : ''}${p ? ' marco' : ''}${n === META ? ' fim' : ''}" title="${p ? `${n}: ${p.nome}` : n === META ? '60: liga completa' : n}"></i>`;
  }).join('')}</div>`;
}

// Trilha da liga: 13 casas (início, um superpoder a cada 5 pontos e a chegada nos 60). Cada pessoa é uma ficha com o seu avatar;
// no modo cooperativo todas ficam juntas na casa do grupo e, ao ganhar pontos, pulam para a próxima.
let ultimaCasa = {};
const casaDe = (pts) => Math.min(12, Math.floor(pts / 5));
function trilhaHtml(fichas, alcance) {
  const marcos = Object.fromEntries(PODERES.map((p) => [p.marco, p]));
  const porCasa = {};
  fichas.forEach((f) => { (porCasa[casaDe(f.pts)] = porCasa[casaDe(f.pts)] || []).push(f); });
  const novas = {};
  const html = Array.from({ length: 13 }, (_, i) => {
    const marco = i * 5, pw = marcos[marco];
    const aqui = porCasa[i] || [];
    const fichasHtml = aqui.slice(0, 4).map((f) => {
      const k = f.p.pid || f.p.name;
      const pulo = ultimaCasa[k] !== undefined && ultimaCasa[k] < i ? ' pulo' : '';
      return avatar(f.p, 'ficha' + pulo);
    }).join('') + (aqui.length > 4 ? '<span class="mais">+' + (aqui.length - 4) + '</span>' : '');
    aqui.forEach((f) => { novas[f.p.pid || f.p.name] = i; });
    const conteudo = i === 0 ? '<small>Início</small>' : pw ? '<img src="' + imgPoder(pw.id) + '" alt="' + pw.nome + '">' : '<b class="fim">Fim</b>';
    const titulo = i === 0 ? 'Início' : pw ? marco + ' pontos: ' + pw.nome : '60 pontos: liga completa';
    return '<li class="casa' + (i > 0 && i <= casaDe(alcance) ? ' on' : '') + (i === 12 ? ' chegada' : '') + '" title="' + titulo + '"><span class="n">' + (i === 0 ? '' : marco) + '</span>' + conteudo + '<span class="fichas">' + fichasHtml + '</span></li>';
  }).join('');
  ultimaCasa = novas;
  return '<ol class="trilha" aria-label="Trilha da liga">' + html + '</ol>';
}
function poderesHtml(desbloqueados, { pequeno = false } = {}) {
  return `<ul class="poderes${pequeno ? ' peq' : ''}">${PODERES.map((p) => {
    const on = desbloqueados.includes(p.id);
    return `<li class="${on ? 'on' : ''}" title="${p.marco} pontos: ${p.nome}${on ? ' (desbloqueado)' : ''}"><img src="${imgPoder(p.id)}" alt="${p.nome}${on ? '' : ' (bloqueado)'}"><small>${p.marco}</small></li>`;
  }).join('')}</ul>`;
}

function renderLiga(bump = false) {
  const box = $('#ligaCab');
  const L = leitorIdx();
  $('#liga').classList.toggle('sem-pontos', !comPontos());
  if (G.modo === 'coop') {
    const pct = Math.min(100, Math.round((G.grupo / META) * 100));
    box.innerHTML = `<div class="meta${bump ? ' bump' : ''}"><b>${G.grupo}</b><span>de ${META} pontos da liga${G.grupo >= META ? ' · liga completa!' : ''}</span></div>
      <div class="barra" role="progressbar" aria-label="Pontos da liga" aria-valuemin="0" aria-valuemax="${META}" aria-valuenow="${Math.min(G.grupo, META)}"><i style="width:${pct}%"></i></div>`;
  } else if (G.modo === 'comp') {
    box.innerHTML = `<ul class="placar">${G.players.map((p, i) => `<li class="${i === L ? 'vez' : ''}">${avatar(p, 'mini')}<span>${esc(p.name)}</span><b>${p.pts}</b></li>`).join('')}</ul>`;
  } else {
    box.innerHTML = `<div class="meta"><b>${G.lidas.length}</b><span>${G.lidas.length === 1 ? 'dilema conversado' : 'dilemas conversados'}</span></div>`;
  }
  renderPilhas();
}

function renderPilhas() {
  const restam = Math.max(0, Math.min(G.deck.length, G.qtd - G.k - (G.idx != null ? 1 : 0)));
  $('#monteN').textContent = restam + (restam === 1 ? ' carta' : ' cartas');
  $('#lidasN').textContent = G.lidas.length + (G.lidas.length === 1 ? ' carta' : ' cartas');
  $('#monte').classList.toggle('vazio', restam === 0);
  $('#monte').classList.toggle('pulsa', G.fase === 'monte');
  $('#lidas').classList.toggle('vazio', G.lidas.length === 0);
}

// Tabuleiro: 60 casas em serpentina (10 por linha) depois de uma casa de início; um superpoder a cada 5 pontos.
// Cada pessoa é um peão com o seu avatar; no modo cooperativo todos andam juntos e pulam casa a casa.
const COLS = 11, LINHAS = 6;
function casaXY(n) {
  if (n <= 0) return { c: 0, r: 0 };
  const r = Math.floor((n - 1) / 10), k = (n - 1) % 10;
  return { c: (r % 2 === 0 ? k : 9 - k) + 1, r };
}
function construirTabuleiro() {
  const grade = $('#grade');
  if (grade.dataset.jogo === String(G.id)) return;
  grade.dataset.jogo = String(G.id);
  const marcos = Object.fromEntries(PODERES.map((p) => [p.marco, p]));
  let html = '<div class="casa-inicio" style="grid-column:1;grid-row:1"><b>Início</b></div>';
  for (let n = 1; n <= META; n++) {
    const { c, r } = casaXY(n);
    const pw = marcos[n];
    html += `<div class="sq${pw ? ' marco' : ''}${n === META ? ' fim' : ''}" data-n="${n}" style="grid-column:${c + 1};grid-row:${r + 1}" title="${pw ? n + ' pontos: ' + pw.nome : n === META ? '60 pontos: liga completa' : n}"><small>${n}</small>${pw ? `<img src="${imgPoder(pw.id)}" alt="${pw.nome}">` : n === META ? '<b>Fim</b>' : ''}</div>`;
  }
  html += '<div class="peoes" id="peoes">' + G.players.map((p, i) => `<span class="peao" data-i="${i}" style="--dx:${((i - (G.players.length - 1) / 2) * Math.min(18, 60 / G.players.length)).toFixed(1)}px">${avatar(p, 'ficha')}</span>`).join('') + '</div>';
  grade.innerHTML = html;
  G.pos = G.players.map(() => 0);
  G.players.forEach((_, i) => pousarPeao(i, 0));
  marcarCasas(0);
}
function pousarPeao(i, n) {
  const { c, r } = casaXY(n);
  const el = $(`#peoes .peao[data-i="${i}"]`);
  if (!el) return;
  el.style.left = ((c + 0.5) / COLS * 100) + '%';
  el.style.top = ((r + 0.5) / LINHAS * 100) + '%';
  el.style.zIndex = String(10 + n);
}
function marcarCasas(ate) {
  $$('#grade .sq').forEach((s) => s.classList.toggle('on', +s.dataset.n <= ate));
}
async function atualizarTabuleiro(animar = false) {
  construirTabuleiro();
  if (!comPontos()) return;
  const alvo = G.players.map((p) => Math.min(META, G.modo === 'coop' ? G.grupo : p.pts));
  const id = G.id;
  await Promise.all(alvo.map(async (t, i) => {
    let n = G.pos[i] || 0;
    const passo = Math.abs(t - n) > 10 ? 90 : 190;
    while (n < t && G && G.id === id) {
      n++;
      G.pos[i] = n;
      pousarPeao(i, n);
      const el = $(`#peoes .peao[data-i="${i}"] .ficha`);
      if (animar && !reduced()) {
        el?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-22px) scale(1.15)' }, { transform: 'translateY(0)' }], { duration: passo, easing: 'ease-out' });
        await wait(passo);
      }
      if (i === 0 || G.modo === 'comp') marcarCasas(Math.max(...G.pos));
    }
    if (G && G.id === id) { G.pos[i] = t; pousarPeao(i, t); }
  }));
  if (G && G.id === id) marcarCasas(Math.max(0, ...G.pos));
}

const DOT = { monte: 0, ler: 0, escolher: 1, revelar: 2, conversa: 1 };
// Resumo do que a última rodada rendeu (aparece na mesa e no celular).
function resumoPontos() {
  if (!G.ganhos || !comPontos()) return '';
  if (G.modo === 'coop') return `${G.ganhos.soma} ${G.ganhos.soma === 1 ? 'ponto' : 'pontos'} para a liga`;
  const por = G.ganhos.por || [];
  return por.map((g, i) => (g ? `${esc(G.players[i].name)} +${g}` : '')).filter(Boolean).join(' · ') || 'Ninguém pontuou nesta carta';
}

// Superpoder(es) desbloqueado(s) na rodada, mostrado junto com os pontos (sala)
function poderesBanner() {
  const n = (G.ganhos && G.ganhos.novos) || [];
  if (!n.length) return '';
  return `<div class="poder-novo-mesa"><h3>${n.length > 1 ? 'Superpoderes desbloqueados!' : 'Superpoder desbloqueado!'}</h3><div class="pw-lista">${n.map((p) => `<figure><img src="${imgPoder(p.id)}" alt=""><figcaption><b>${esc(p.nome)}</b><small>${p.quem ? `${esc(p.quem)} desbloqueou` : 'Para todo o grupo'}</small></figcaption></figure>`).join('')}</div></div>`;
}
const bannerHtml = () => `<div class="pontos-rodada"><small>Nesta carta</small>${bannerPontos()}</div>${G.ganhos && G.ganhos.completa ? '<p class="liga-completa">Liga completa!</p>' : ''}${poderesBanner()}`;
async function esconderCartaDosPontos() {
  const id0 = G.id, k0 = G.k;
  await voarParaLidas();
  if (!G || G.id !== id0 || G.k !== k0) return;
  G.cartaSumiu = true;
  renderCarta();
}

// Texto grande do quadro "Nesta carta" na mesa
function bannerPontos() {
  if (G.modo === 'coop') { const s = G.ganhos.soma; return `<b class="num">+${s}</b><span>${s === 1 ? 'ponto' : 'pontos'} para a liga</span>`; }
  return `<b>${resumoPontos()}</b>`;
}

function renderStep() {
  const p = leitor();
  const nEsc = Object.keys(G.escolhas).length;
  const txt = {
    monte: [G.sala ? `${esc(p.name)} vira uma carta` : `${esc(p.name)} puxa uma carta`, G.sala ? 'A carta é virada no celular de quem tem a vez.' : 'Toque no monte de cartas para virar a próxima.'],
    ler: [`${esc(p.name)} lê o dilema e as alternativas`, ''],
    escolher: G.sala
      ? (nEsc >= G.players.length
        ? ['Todos escolheram', 'Calculando os pontos…']
        : ['Cada pessoa escolhe no próprio celular', `${nEsc} de ${G.players.length} já escolheram.`])
      : ['Escolhas em segredo', `${nEsc} de ${G.players.length} já escolheram. Passem o aparelho de mão em mão.`],
    revelar: ['Escolhas reveladas', G.sala && comPontos() ? `${resumoPontos()}. A vez passa para a próxima pessoa em instantes.` : comPontos() ? 'Conferiram os pontos? Agora, conversem sem exigir consenso.' : 'Conversem sem exigir consenso.'],
    conversa: ['Hora de conversar', 'Cada pessoa pode escolher, explicar, passar ou apenas ouvir.'],
  }[G.fase];
  const passos = G.modo === 'conversa' ? 2 : 3;
  const idx = DOT[G.fase];
  const dots = Array.from({ length: passos }, (_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'on' : ''}"></i>`).join('');
  const botoes = acoes().map((a) => `<button class="btn ${a.principal ? 'btn-primary' : 'btn-soft'} btn-pill" data-k="${a.k}">${esc(a.rotulo)}</button>`).join('');
  $('#step').innerHTML = `${avatar(p, 'grande')}
    <div class="step-txt"><b>${txt[0]}</b>${txt[1] ? `<span>${txt[1]}</span>` : ''}<div class="step-dots">${dots}</div></div>
    <div class="step-btns">${botoes}</div>`;
  sync();
}

function renderAll(bump = false) {
  $('#game').classList.toggle('sala', !!G.sala);
  renderTopbar(); renderCarta(); renderLiga(bump); renderStep();
}

/* ==========================================================
   Ações (a mesa e, na versão com sala, o celular de quem lê chamam as mesmas)
   ========================================================== */
const A = {
  puxar: () => puxar(),
  virar: () => puxar({ avancar: true }),
  escolher: () => toEscolher(),
  conversar: () => toConversa(),
  retirar: () => retirar(),
  continuar: () => abrirEscolha(),
  revelar: () => revelar(),
  proxima: () => proxima(),
};

function acoes() {
  if (!G) return [];
  switch (G.fase) {
    case 'monte': return [G.sala ? { k: 'virar', rotulo: 'Virar', principal: true } : { k: 'puxar', rotulo: 'Puxar carta', principal: true }];
    case 'ler': return [
      G.modo === 'conversa' ? { k: 'conversar', rotulo: 'Conversar sobre os caminhos', principal: true } : { k: 'escolher', rotulo: 'Ver as alternativas', principal: true },
      { k: 'retirar', rotulo: 'Trocar carta' },
    ];
    case 'escolher': return G.sala
      ? [{ k: 'revelar', rotulo: 'Revelar as escolhas', principal: true }, ...(Object.keys(G.escolhas).length === 0 ? [{ k: 'retirar', rotulo: 'Trocar carta' }] : [])]
      : [{ k: 'continuar', rotulo: 'Continuar as escolhas', principal: true }];
    // na sala (com pontos) não há botão: depois de revelar, a vez passa sozinha para a próxima pessoa
    case 'revelar': return G.sala && comPontos() ? [] : [{ k: 'proxima', rotulo: ultimo() ? 'Ver o resultado' : 'Próxima carta', principal: true }];
    case 'conversa': return [{ k: 'proxima', rotulo: ultimo() ? 'Ver o resultado' : 'Próxima carta', principal: true }];
    default: return [];
  }
}

function run(k) {
  if (!G || !acoes().some((a) => a.k === k)) return false;
  A[k]?.();
  return true;
}

/* ==========================================================
   Fluxo de uma carta
   ========================================================== */
const VERSO = '<div class="carta-verso" aria-hidden="true"></div>';
function proximaCarta() {
  G.cartaSumiu = false;
  G.idx = null; G.fase = 'monte'; G.escolhas = {}; G.fila = []; G.handoff = true; G.pick = null; G.ganhos = null;
  renderAll();
  atualizarTabuleiro(false);
}

// A carta voa do monte até o centro, vira e abre sobre o tabuleiro.
async function voarDoMonte() {
  const box = $('#carta');
  if (reduced()) return;
  const r = box.getBoundingClientRect(), mo = $('#monte .pilha').getBoundingClientRect();
  if (!r.width) return;
  const dx = (mo.left + mo.width / 2) - (r.left + r.width / 2), dy = (mo.top + mo.height / 2) - (r.top + r.height / 2);
  const s = mo.width / r.width;
  box.insertAdjacentHTML('beforeend', VERSO);
  box.classList.add('vindo');
  const meio = `translate(${dx * 0.35}px, ${dy * 0.35 - 30}px) scale(${(1 + s) / 2 + 0.12})`;
  const a = box.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotateY(0deg)`, opacity: 1 },
    { transform: meio + ' rotateY(90deg)', opacity: 1, offset: 0.45 },
    { transform: meio + ' rotateY(-90deg)', opacity: 1, offset: 0.4501 },
    { transform: 'none', opacity: 1 },
  ], { duration: 1100, easing: 'cubic-bezier(.4,.05,.25,1)' });
  await Promise.race([a.finished.catch(() => {}), wait(1500)]);
  box.classList.remove('vindo');
  box.querySelector('.carta-verso')?.remove();
}
// Depois da leitura, a carta vai para o monte das lidas.
async function voarParaLidas() {
  const box = $('#carta');
  if (reduced()) return;
  const r = box.getBoundingClientRect(), mo = $('#lidas .pilha').getBoundingClientRect();
  if (!r.width) return;
  const dx = (mo.left + mo.width / 2) - (r.left + r.width / 2), dy = (mo.top + mo.height / 2) - (r.top + r.height / 2);
  const a = box.animate([
    { transform: 'none', opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(${mo.width / r.width}) rotate(8deg)`, opacity: 1 },
  ], { duration: 650, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
  await Promise.race([a.finished.catch(() => {}), wait(1500)]);
}

const filaDaVez = () => { const L = leitorIdx(), n = G.players.length; return Array.from({ length: n }, (_, i) => (L + i) % n); };
// avancar (sala): a carta é virada e já abre direto na etapa de escolha
async function puxar({ avancar = false } = {}) {
  if (!G || G.fase !== 'monte' || G.animando) return;
  if (!G.deck.length) { toast('Não há mais cartas no monte.'); return; }
  G.animando = true;
  G.idx = G.deck.shift();
  sortearAlternativas();
  G.fase = avancar ? 'escolher' : 'ler'; G.escolhas = {}; G.fila = avancar ? filaDaVez() : []; G.handoff = true; G.pick = null; G.ganhos = null;
  sfx.flip();
  renderAll();
  await voarDoMonte();
  if (G) G.animando = false;
}

// Trocar a carta sem penalidade: ela sai da partida e entra outra (não conta como carta jogada).
async function retirar() {
  // na sala, quem lê ainda pode trocar a carta depois de virá-la, desde que ninguém tenha escolhido
  const podeTrocar = G && (G.fase === 'ler' || (G.fase === 'escolher' && G.sala && Object.keys(G.escolhas).length === 0));
  if (!podeTrocar || G.animando) return;
  if (!G.deck.length) { toast('Não há mais cartas no monte.'); return; }
  toast('Carta trocada, sem penalidade.');
  G.fase = G.sala ? 'escolher' : 'ler';
  G.animando = true;
  G.idx = G.deck.shift();
  sortearAlternativas();
  G.escolhas = {}; G.fila = G.sala ? filaDaVez() : []; G.handoff = true; G.pick = null;
  sfx.flip();
  renderAll();
  await voarDoMonte();
  if (G) G.animando = false;
}

function toConversa() {
  if (!G || G.fase !== 'ler') return;
  G.fase = 'conversa';
  renderAll();
}

function toEscolher() {
  if (!G || G.fase !== 'ler') return;
  G.fase = 'escolher';
  const L = leitorIdx(), n = G.players.length;
  G.fila = Array.from({ length: n }, (_, i) => (L + i) % n);   // começa por quem leu
  G.handoff = true; G.pick = null;
  renderAll();
  if (!G.sala) abrirEscolha();
}

/* ---------- escolha em segredo, no mesmo aparelho ---------- */
function abrirEscolha() {
  if (!G || G.fase !== 'escolher' || G.sala) return;
  const q = G.fila.find((i) => !G.escolhas[i]);
  if (q === undefined) return revelar();
  renderEscolha(q);
  show('#escolha');
}

function renderEscolha(qi) {
  const q = G.players[qi];
  const pos = G.fila.indexOf(qi) + 1;
  const dots = G.fila.map((i) => `<i class="${G.escolhas[i] ? 'done' : i === qi ? 'on' : ''}"></i>`).join('');
  if (G.handoff) {
    $('#escolhaBody').innerHTML = `
      <div class="handoff">
        ${avatar(q, 'enorme')}
        <small>Escolha ${pos} de ${G.fila.length}</small>
        <h2 class="sheet-title" id="escolhaTitulo">Passe o aparelho para ${esc(q.name)}</h2>
        <p class="sheet-sub">${esc(q.name)} escolhe em segredo. Ninguém precisa justificar a escolha.</p>
        <div class="vote-dots">${dots}</div>
      </div>
      <div class="row-btns centro"><button class="btn btn-primary btn-pill" data-esc="pronto" data-i="${qi}">Sou ${esc(q.name)}, escolher</button></div>`;
    return;
  }
  const c = carta();
  $('#escolhaBody').innerHTML = `
    <h2 class="sheet-title" id="escolhaTitulo">${esc(q.name)}, qual caminho você escolhe?</h2>
    <p class="sheet-sub">${esc(c.dilema)}</p>
    <div class="esc-lista" role="radiogroup" aria-label="Alternativas">
      ${c.alternativas.map((a) => `<button class="esc-op${G.pick === a.letra ? ' on' : ''}" role="radio" aria-checked="${G.pick === a.letra}" data-esc="op" data-l="${a.letra}"><span class="alt-l" translate="no">${a.letra}</span><span>${esc(a.texto)}</span></button>`).join('')}
      <button class="esc-op passo${G.pick === 'passo' ? ' on' : ''}" role="radio" aria-checked="${G.pick === 'passo'}" data-esc="op" data-l="passo"><span class="alt-l" translate="no">–</span><span>Prefiro passar</span></button>
    </div>
    <div class="vote-dots">${dots}</div>
    <div class="row-btns centro"><button class="btn btn-primary btn-pill" data-esc="confirmar" data-i="${qi}" ${G.pick ? '' : 'disabled'}>${pos === G.fila.length ? 'Confirmar e revelar' : 'Confirmar'}</button></div>`;
}

function confirmarEscolha(qi) {
  if (!G.pick) return;
  G.escolhas[qi] = G.pick; G.pick = null; G.handoff = true;
  sfx.escolha();
  renderLiga(); renderStep();
  const next = G.fila.find((i) => !G.escolhas[i]);
  if (next === undefined) { hide('#escolha'); revelar(); return; }
  renderEscolha(next);
}

/** Versão sala: um celular escolheu (a carta precisa ser a atual). */
function marcarEscolha(pid, k, letra) {
  if (!G || !G.sala || G.fase !== 'escolher' || k !== G.k) return;
  const i = G.players.findIndex((p) => p.pid === pid);
  if (i < 0 || !['A', 'B', 'C', 'D', 'passo'].includes(letra)) return;
  G.escolhas[i] = letra;
  sfx.escolha();
  renderLiga(); renderStep();
  // quando todos escolheram, a mesa só computa: revela sozinha (sem outro botão)
  if (Object.keys(G.escolhas).length >= G.players.length) setTimeout(() => { if (G?.fase === 'escolher') revelar(); }, 900);
}
ASM.marcarEscolha = marcarEscolha;

/* ---------- revelação, pontos e superpoderes ---------- */
async function revelar() {
  if (!G || G.fase !== 'escolher') return;
  hide('#escolha');
  // quem não escolheu (sala: celular sem rede) conta como "preferiu passar"
  G.players.forEach((_, i) => { if (!G.escolhas[i]) G.escolhas[i] = 'passo'; });
  const novos = [];
  const antesGrupo = G.grupo;
  let soma = 0;
  const por = [];
  G.players.forEach((p, i) => {
    const g = pontosDe(G.escolhas[i]);
    por[i] = g;
    soma += g;
    if (G.modo === 'comp') {
      const antes = p.pts; p.pts += g;
      PODERES.filter((x) => x.marco > antes && x.marco <= p.pts).forEach((x) => { p.poderes.push(x.id); novos.push({ poder: x, quem: p }); });
    }
  });
  if (G.modo === 'coop') {
    G.grupo = Math.min(META, G.grupo + soma);
    PODERES.filter((x) => x.marco > antesGrupo && x.marco <= G.grupo).forEach((x) => { G.poderesGrupo.push(x.id); novos.push({ poder: x }); });
  }
  G.ganhos = {
    soma, por, completa: G.modo === 'coop' && antesGrupo < META && G.grupo >= META,
    novos: novos.map((x) => ({ id: x.poder.id, nome: x.poder.nome, marco: x.poder.marco, quem: x.quem ? x.quem.name : null, pid: x.quem ? x.quem.pid : null })),
  };
  G.fase = 'revelar';
  sfx.revela();
  renderAll(G.modo === 'coop' && soma > 0);
  if (G.sala && comPontos()) esconderCartaDosPontos();
  if (G.modo === 'coop' && soma) toast(`+${pts(soma)} para a liga`);
  // sala: depois de mostrar os pontos, a vez passa sozinha para a próxima pessoa
  if (G.sala && comPontos()) {
    const id0 = G.id, k0 = G.k;
    setTimeout(() => { if (!G || G.id !== id0 || G.k !== k0 || G.fase !== 'revelar') return; hide('#poder'); proxima(); }, (novos.length || G.ganhos.completa) ? 6200 : 3800);
  }
  if (G.sala && comPontos()) {
    // sala: os superpoderes aparecem junto com os pontos (em bannerHtml), sem janela separada
    if (novos.length || G.ganhos.completa) sfx.poder();
    if (G.ganhos.completa) confetti();
  } else if (novos.length || G.ganhos.completa) {
    await wait(reduced() ? 100 : 700); mostrarPoderes(novos, G.ganhos.completa);
  }
}

function mostrarPoderes(novos, completa) {
  sfx.poder();
  const coop = G.modo === 'coop';
  $('#poderBody').innerHTML = `
    <h2 class="sheet-title" id="poderTitulo">${completa ? 'Liga completa!' : novos.length > 1 ? 'Superpoderes desbloqueados!' : 'Superpoder desbloqueado!'}</h2>
    <p class="sheet-sub">${coop ? `A liga chegou a ${pts(G.grupo)}${completa ? ': todos os superpoderes foram desbloqueados para todo o grupo.' : ' e desbloqueou para todo o grupo:'}` : 'Desbloqueados nesta rodada:'}</p>
    <div class="pod-novos">${novos.map((x) => `<figure><img src="${imgPoder(x.poder.id)}" alt=""><figcaption><b>${x.poder.nome}</b>${x.quem ? `<small>${esc(x.quem.name)}</small>` : `<small>${x.poder.marco} pontos</small>`}</figcaption></figure>`).join('')}</div>
    <div class="row-btns centro"><button class="btn btn-primary btn-pill" data-action="close">Continuar</button></div>`;
  show('#poder');
  if (completa) confetti();
}

async function proxima() {
  if (!G || !['revelar', 'conversa'].includes(G.fase) || G.animando) return;
  G.animando = true;
  G.lidas.push({ n: carta().n, escolhas: { ...G.escolhas } });
  const fim = ultimo();
  G.k++;
  if (fim) { G.animando = false; await atualizarTabuleiro(false); return finish(); }
  const id = G.id;
  if (!G.cartaSumiu) await voarParaLidas();
  if (!G || G.id !== id) return;
  proximaCarta();
  await atualizarTabuleiro(true);
  if (G && G.id === id) G.animando = false;
}

/* ---------- fim ---------- */
function finish() {
  hideAll();
  const n = G.lidas.length;
  let corpo = '';
  if (G.modo === 'coop') {
    const completa = G.grupo >= META;
    corpo = `
      <h2 id="endTitle" class="sheet-title">${completa ? 'Liga completa!' : 'A liga encerrou a missão'}</h2>
      <p class="sheet-sub">O grupo somou <b>${pts(G.grupo)}</b> em ${n} ${n === 1 ? 'dilema' : 'dilemas'} e desbloqueou ${G.poderesGrupo.length} ${G.poderesGrupo.length === 1 ? 'superpoder' : 'superpoderes'} para todos.</p>
      ${poderesHtml(G.poderesGrupo, { pequeno: true })}`;
  } else if (G.modo === 'comp') {
    const max = Math.max(...G.players.map((p) => p.pts));
    const venc = G.players.filter((p) => p.pts === max);
    const ranking = [...G.players].sort((a, b) => b.pts - a.pts);
    corpo = `
      <h2 id="endTitle" class="sheet-title">${max === 0 ? 'Fim da partida' : venc.length > 1 ? 'Empate!' : `${esc(venc[0].name)} fez mais pontos`}</h2>
      <p class="sheet-sub">${venc.length > 1 && max > 0 ? `${venc.map((p) => esc(p.name)).join(' e ')} dividem a vitória. ` : ''}Lembrem: a pontuação mede só as escolhas previstas nesta dinâmica, não caráter nem valor pessoal.</p>
      <ol class="podium">${ranking.map((p) => `<li class="${p.pts === max && max > 0 ? 'win' : ''}">${avatar(p)}<span class="pnome">${esc(p.name)}<small>${p.poderes.length} ${p.poderes.length === 1 ? 'superpoder' : 'superpoderes'}</small></span><span class="ppts">${p.pts}</span></li>`).join('')}</ol>`;
  } else {
    corpo = `
      <h2 id="endTitle" class="sheet-title">Fim da conversa</h2>
      <p class="sheet-sub">Vocês conversaram sobre ${n} ${n === 1 ? 'dilema' : 'dilemas'}. Cada pessoa pode levar consigo uma ideia sobre formas seguras e respeitosas de agir.</p>`;
  }
  $('#endBody').innerHTML = `<img class="end-tuto" src="assets/tuto/tuto-capa.png" alt="">${corpo}
    <p class="end-nota">Em situações de violência ou risco, o caminho é buscar uma pessoa adulta ou profissional de confiança. ${esc(CONTATOS)}.</p>
    <div class="row-btns centro">
      <button class="btn btn-soft" data-action="go-home">Início</button>
      <button class="btn btn-soft btn-pill" data-action="rematch">Reiniciar jogo</button>
      <button class="btn btn-primary btn-pill" data-action="continuar-jogo">Continuar · mais ${G.qtdBase} ${G.qtdBase === 1 ? 'carta' : 'cartas'}</button>
    </div>`;
  ASM.onFim?.({ modo: G.modo, grupo: G.grupo, poderes: G.poderesGrupo, cartas: n, ranking: G.players.map((p) => ({ pid: p.pid, nome: p.name, pts: p.pts, poderes: p.poderes.length })) });
  G.fase = 'fim';
  show('#end');
  if (G.modo !== 'conversa') confetti();
}

/* ==========================================================
   Retrato da partida para os celulares (versão com sala)
   ========================================================== */
function snapshot() {
  if (!G) return null;
  const c = G.idx != null ? carta() : null;
  const rev = G.fase === 'revelar';
  const cont = {};
  if (rev) Object.values(G.escolhas).forEach((l) => { cont[l] = (cont[l] || 0) + 1; });
  return {
    fase: G.fase, modo: G.modo, k: G.k, qtd: G.qtd, ultimo: ultimo(),
    leitor: leitor().pid,
    carta: c ? { n: c.n, tema: c.tema, dilema: c.dilema, alternativas: c.alternativas.map((a) => ({ letra: a.letra, texto: a.texto, ...(rev && comPontos() ? { pontos: a.pontos } : {}) })), sensivel: SENSIVEIS.includes(c.n) } : null,
    ganhos: G.fase === 'revelar' && G.ganhos ? { soma: G.ganhos.soma, por: G.ganhos.por || [], novos: G.ganhos.novos || [], completa: !!G.ganhos.completa } : null,
    escolheram: G.fase === 'escolher' ? G.players.filter((_, i) => G.escolhas[i]).map((p) => p.pid) : [],
    contagem: rev ? cont : null,
    grupo: G.grupo, poderesGrupo: G.poderesGrupo,
    jogadores: G.players.map((p) => ({ pid: p.pid, nome: p.name, cor: p.cor, av: p.av, pts: G.modo === 'comp' ? p.pts : null, poderes: p.poderes })),
  };
}
function sync() { if (G && ASM.onSync && G.fase !== 'fim') ASM.onSync(snapshot(), acoes()); }

/* ==========================================================
   Configuração
   ========================================================== */
const modoHtml = () => Object.entries(MODOS).map(([k, m]) => `<button type="button" class="modo${SETUP.modo === k ? ' on' : ''}" data-modo="${k}" aria-pressed="${SETUP.modo === k}"><b>${m.nome}</b><small>${m.curto}</small><span>${m.desc}</span></button>`).join('');
const qtdHtml = () => QTDS.map((v) => `<button data-q="${v}" class="${v === SETUP.qtd ? 'on' : ''}">${v === CARTAS.length ? `Todas (${v})` : v}</button>`).join('');
ASM.modoHtml = modoHtml; ASM.qtdHtml = qtdHtml;

function renderSetup() {
  $('#modoSeg').innerHTML = modoHtml();
  $('#qtdSeg').innerHTML = qtdHtml();
  $('#playersSeg').innerHTML = Array.from({ length: MAX_JOG - MIN_JOG + 1 }, (_, i) => MIN_JOG + i).map((n) => `<button data-n="${n}" class="${n === SETUP.n ? 'on' : ''}">${n}</button>`).join('');
  const list = $('#namesList');
  const old = $$('input', list).map((i) => i.value);
  list.innerHTML = Array.from({ length: SETUP.n }, (_, i) => {
    const v = old[i] ?? prefs.names[i] ?? '';
    return `<label class="name-row">${avatar({ name: v || String(i + 1), cor: CORES[i] })}
      <input maxlength="14" autocomplete="off" placeholder="Jogador ${i + 1}" value="${esc(v)}" aria-label="Nome da pessoa ${i + 1}"></label>`;
  }).join('');
}

/* ==========================================================
   Galeria
   ========================================================== */
function renderGaleria() {
  const comp = $('#galPontos').checked;
  $('#galeriaGrid').innerHTML = CARTAS.map((c) => `
    <article class="carta mini">
      <div class="carta-cab"><span class="carta-n">Dilema <b>${c.n}</b></span><span class="carta-tema">${esc(c.tema)}</span></div>
      <p class="carta-dilema">${esc(c.dilema)}</p>
      <ol class="alts">${c.alternativas.map((a) => `<li class="alt${comp ? ' rev' : ''}"><span class="alt-l" translate="no">${a.letra}</span><span class="alt-t">${esc(a.texto)}</span>${comp ? `<span class="alt-p">${a.pontos}<small>${a.pontos === 1 ? 'ponto' : 'pontos'}</small></span>` : ''}</li>`).join('')}</ol>
    </article>`).join('');
}

/* ==========================================================
   Telas e modais
   ========================================================== */
function show(sel) { $(sel).classList.remove('hidden'); const f = $(`${sel} [data-action]:not(.sheet-close), ${sel} [data-esc]`); f?.focus({ preventScroll: true }); }
function hide(sel) { $(sel).classList.add('hidden'); if (sel === '#intro') stopIntro(); }
function hideAll() { $$('.modal').forEach((m) => m.classList.add('hidden')); stopIntro(); }

async function enterGame() {
  hideAll();
  const home = $('#home');
  home.classList.add('leaving');
  await wait(reduced() ? 0 : 380);
  home.classList.add('hidden'); home.classList.remove('leaving');
  $('#game').classList.remove('hidden');
  window.scrollTo(0, 0);
  proximaCarta();
}

function goHome() {
  hideAll();
  ASM.onHome?.();
  $('#game').classList.add('hidden');
  $('#home').classList.remove('hidden');
  G = null;
}

ASM.novaPartida = (opts) => newGame(opts);
ASM.entrar = () => enterGame();
ASM.get = () => G;
ASM.run = run;
ASM.acoes = acoes;
ASM.snapshot = snapshot;

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
const MODAIS_FECHAVEIS = ['rules', 'setup', 'confirm', 'intro', 'galeria', 'poder'];

document.addEventListener('click', (e) => {
  const seg = e.target.closest('#playersSeg button, #qtdSeg button');
  if (seg) {
    if (seg.dataset.n) SETUP.n = +seg.dataset.n;
    if (seg.dataset.q) SETUP.qtd = +seg.dataset.q;
    renderSetup();
    return;
  }
  const modo = e.target.closest('#modoSeg [data-modo]');
  if (modo) { SETUP.modo = modo.dataset.modo; renderSetup(); return; }
  // na sala quem vira a carta é só o celular de quem tem a vez: a mesa não é para tocar
  if (e.target.closest('#monte')) { if (G?.fase === 'monte' && !G.sala) run(acoes()[0]?.k); return; }
  const k = e.target.closest('#step [data-k]');
  if (k) { run(k.dataset.k); return; }
  const es = e.target.closest('[data-esc]');
  if (es && G?.fase === 'escolher') {
    if (es.dataset.esc === 'pronto') { G.handoff = false; G.pick = null; renderEscolha(+es.dataset.i); }
    else if (es.dataset.esc === 'op') { G.pick = es.dataset.l; sfx.tick(); renderEscolha(+$('[data-esc="confirmar"]').dataset.i); $(`#escolhaBody [data-l="${G.pick}"]`)?.focus({ preventScroll: true }); }
    else if (es.dataset.esc === 'confirmar') confirmarEscolha(+es.dataset.i);
    return;
  }
  const a = e.target.closest('[data-action]');
  if (!a) {
    const m = e.target.classList?.contains('modal') ? e.target : null;
    if (m && MODAIS_FECHAVEIS.includes(m.id)) hide(`#${m.id}`);
    return;
  }
  switch (a.dataset.action) {
    case 'setup': renderSetup(); show('#setup'); break;
    case 'start': {
      const names = $$('#namesList input').map((inp, i) => inp.value.trim() || `Jogador ${i + 1}`);
      prefs.names = $$('#namesList input').map((inp) => inp.value.trim()); savePrefs();
      newGame({ names, modo: SETUP.modo, qtd: SETUP.qtd });
      enterGame(); break;
    }
    case 'rules': show('#rules'); break;
    case 'galeria': renderGaleria(); show('#galeria'); break;
    case 'intro':
      hideAll();
      $('[data-action="intro-play"]').textContent = G ? 'Voltar ao jogo' : 'Vamos jogar!';
      show('#intro'); openIntro(); break;
    case 'intro-play': hide('#intro'); if (!G) ASM.primary(); break;
    case 'close': hide(`#${a.closest('.modal').id}`); break;
    case 'sound':
      prefs.sound = !prefs.sound; savePrefs();
      $('#soundBtn').classList.toggle('off', !prefs.sound);
      toast(prefs.sound ? 'Som ligado' : 'Som desligado'); break;
    case 'home':
      if (G && G.fase !== 'fim') askConfirm({ title: 'Sair da partida?', sub: G.sala ? 'A sala será encerrada e os celulares serão desconectados.' : 'A partida em andamento será perdida.', ok: 'Sair', action: 'go-home' });
      else goHome();
      break;
    case 'ask-finish':
      if (G && G.fase !== 'fim') askConfirm({ title: 'Encerrar a partida?', sub: 'O grupo vê o resultado agora. Não tem problema parar antes: o que foi conversado já valeu.', ok: 'Encerrar', action: 'finish' });
      break;
    case 'finish': finish(); break;
    case 'go-home': goHome(); break;
    case 'rematch': {
      const names = G.players.map((p) => p.name);
      const pids = G.sala ? G.players.map((p) => p.pid) : undefined;
      const avs = G.sala ? G.players.map((p) => p.av) : undefined;
      newGame({ names, pids, avs, modo: G.modo, qtd: G.qtdBase });
      if (G.sala) ASM.onRematch?.();
      hideAll(); proximaCarta(); break;
    }
    case 'continuar-jogo': {
      // segue no mesmo jogo: mesmos jogadores, pontos, tabuleiro e ordem de leitura, com mais uma rodada de cartas
      const extra = G.qtdBase;
      if (G.deck.length < extra) G.deck = G.deck.concat(shuffle(CARTAS.map((_, i) => i).filter((i) => !G.deck.includes(i))));
      G.qtd = G.k + extra;
      G.continuando = true;
      if (G.sala) ASM.onRematch?.();
      hideAll(); proximaCarta(); break;
    }
  }
});
$('#galPontos').addEventListener('change', renderGaleria);

document.addEventListener('keydown', (e) => {
  if (introKey(e)) return;
  if (e.key !== 'Escape') return;
  const open = $$('.modal:not(.hidden)').pop();
  if (open && MODAIS_FECHAVEIS.includes(open.id)) hide(`#${open.id}`);
});

/* ==========================================================
   Confete
   ========================================================== */
function confetti() {
  if (reduced()) return;
  const c = $('#confetti'), ctx = c.getContext('2d');
  const dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cols = ['#F89903', '#AF6CAC', '#2A4947', '#D6E8DB', '#F7C58F', '#C76BAC'];
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
$('#soundBtn').classList.toggle('off', !prefs.sound);
$('#homePoderes').innerHTML = PODERES.map((p) => `<img src="${imgPoder(p.id)}" alt="" style="--i:${PODERES.indexOf(p)}">`).join('');
