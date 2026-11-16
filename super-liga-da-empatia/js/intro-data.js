// Apresentação do Tuto: um balão por parágrafo.
// RASCUNHO: o documento da Super Liga não trouxe o roteiro do Tuto. Este texto foi escrito a partir das regras
// revisadas, no mesmo formato dos outros jogos, só para a apresentação funcionar. Trocar pelo roteiro oficial
// assim que ele chegar (e, com o áudio, preencher `audio`, `dur`, `boca` e os tempos de `palavras`, como em
// ../../alexpawlow/jogo-tuto-jornada/js/intro-data.js).
// AINDA SEM NARRAÇÃO: o tempo de cada palavra é estimado e a boca mexe palavra a palavra.
const BALOES = [
  'Olá! Eu sou o Tuto e quero apresentar a você a Super Liga da Empatia!',
  'Cada carta traz um dilema de convivência, na escola ou nas redes, com quatro caminhos possíveis. Cada pessoa escolhe o seu em segredo e, depois, todo mundo revela junto.',
  'No modo cooperativo, o grupo soma os pontos e desbloqueia superpoderes como criatividade, amizade e paz. Os pontos mostram só as escolhas desta dinâmica: não medem caráter nem o valor de ninguém.',
  'Ninguém precisa contar experiências pessoais, e qualquer pessoa pode passar. Em situações de violência ou risco, o caminho é buscar uma pessoa adulta de confiança.',
  'Vamos formar a nossa liga e conversar sobre jeitos seguros e respeitosos de agir?',
];

// ritmo estimado: ~2,6 palavras por segundo, com pausas na pontuação e entre balões
function estimar() {
  let t = 0;
  const baloes = BALOES.map((texto) => {
    const palavras = texto.split(/\s+/).map((w) => {
      const p = [w, +t.toFixed(2)];
      t += 0.2 + w.length * 0.035 + (/[.!?”]$/.test(w) ? 0.45 : /[,:;]$/.test(w) ? 0.22 : 0);
      return p;
    });
    t += 0.5;
    return { texto, palavras };
  });
  return { dur: +t.toFixed(2), baloes };
}

export const INTRO = { audio: null, fps: 25, boca: '', ...estimar() };
