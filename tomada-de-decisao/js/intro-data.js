// Apresentação do Tuto: roteiro do documento "Jogo: Tomada de decisão" (nov. 2026), um balão por parágrafo.
// AINDA SEM NARRAÇÃO: o tempo de cada palavra é estimado (ritmo de fala) e a boca mexe palavra a palavra.
// Quando o áudio chegar: pôr o arquivo em assets/intro/narracao.mp3, preencher `audio`, `dur`, `boca`
// e o tempo real de cada palavra em `palavras` (formato igual ao de ../jogo-tuto-jornada/js/intro-data.js).
const BALOES = [
  'Oi! Que bom ter você por aqui! Eu sou o Tuto e vou acompanhar você nesta experiência.',
  'Este é um jogo sobre escolhas e tomada de decisão. Você pode jogar sozinho, com outras pessoas ou com alguém que conduza a atividade. Não é preciso ser educador: qualquer pessoa pode participar!',
  'Durante o jogo, você vai conhecer situações e dilemas, observar as possibilidades apresentadas e pensar em como agiria em cada caso. Use as roletas e as cartas conforme as instruções, converse sobre as escolhas e conte o que levou você a decidir.',
  'Não se preocupe em encontrar uma única resposta certa. O mais importante é refletir, ouvir diferentes pontos de vista e perceber que uma mesma situação pode ser encarada de várias maneiras.',
  'Está pronto para começar? Reúna quem vai jogar, leia as orientações e prepare-se para fazer escolhas, trocar ideias e aprender com cada dilema. Vamos jogar?',
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
