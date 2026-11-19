// Apresentação do Tuto: um balão por parágrafo, com a narração em assets/intro/narracao.mp3.
// O tempo de cada palavra é ESTIMADO e distribuído pela duração do áudio; ao abrir, intro.js lê o volume da voz
// (Web Audio) para mexer a boca e ajustar o começo de cada balão às pausas reais da fala (ver `refinar`).
// Para alinhar exato (Whisper), preencher `palavras` e `boca` como em ../../alexpawlow/jogo-tuto-jornada/js/intro-data.js.
const BALOES = [
  'Oi, pessoal! Eu sou o Tuto e vim convocar vocês para uma missão especial: formar a Super Liga da Empatia!',
  'Aqui, cada carta traz uma situação de convivência e diferentes caminhos para pensar. Primeiro, alguém lê o dilema e as alternativas. Cada pessoa escolhe a sua resposta em segredo. Depois, todo mundo revela e a equipe conversa: que consequências cada escolha pode trazer? Como podemos agir com respeito e segurança?',
  'Desbloqueei superpoderes como criatividade, amizade, resiliência, empatia e paz até completar a Liga!',
  'Topam entrar nessa missão? Escolham suas cartas, chamem a equipe e descubram: que superpoderes a gente pode praticar junto?',
];
const DUR = 43.89;   // duração do mp3

// distribui as palavras em [ini, fim] (segundos) proporcionalmente ao tamanho de cada uma, com pausas na pontuação
export function distribuir(baloes, ini, fim, inicios) {
  const peso = (w) => 0.2 + w.length * 0.035 + (/[.!?”]$/.test(w) ? 0.45 : /[,:;]$/.test(w) ? 0.22 : 0);
  const lista = BALOES.map((t) => t.split(/\s+/));
  const total = lista.reduce((s, ws) => s + ws.reduce((a, w) => a + peso(w), 0), 0);
  const k = (fim - ini) / (total + 0.5 * (lista.length - 1));
  let t = ini;
  return lista.map((ws, i) => {
    if (inicios && inicios[i] != null) t = inicios[i];
    const palavras = ws.map((w) => { const p = [w, +t.toFixed(2)]; t += peso(w) * k; return p; });
    t += 0.5 * k;
    return { texto: BALOES[i], palavras };
  });
}

export const INTRO = { audio: 'narracao.mp3', fps: 25, boca: '', dur: DUR, baloes: distribuir(null, 0.2, DUR - 0.4) };
