// Conteúdo do material impresso "Tomada de decisão: o que você faria?" (Módulo 5, Jogo #1).
// g: gênero gramatical do personagem (concorda artigo e sentimento).
// Rótulos com "\n" quebram em duas linhas na roleta.

export const ROLETAS = {
  personagens: {
    titulo: 'Personagem',
    classicos: [
      { t: 'Estudante', g: 'm' },
      { t: 'Professora', g: 'f' },
      { t: 'Avó', g: 'f' },
      { t: 'Irmã', g: 'f' },
      { t: 'Pai', g: 'm' },
      { t: 'Amigo', g: 'm' },
    ],
    bonus: [
      { t: 'Mãe', g: 'f' },
      { t: 'Avô', g: 'm' },
      { t: 'Vizinho', g: 'm' },
      { t: 'Padeiro', g: 'm' },
      { t: 'Tio', g: 'm' },
      { t: 'Psicólogo', g: 'm' },
    ],
  },
  lugares: {
    titulo: 'Lugar',
    classicos: [
      { t: 'Escola', em: 'na escola' },
      { t: 'Parque', em: 'no parque' },
      { t: 'Casa', em: 'em casa' },
      { t: 'Mercado', em: 'no mercado' },
      { t: 'Praça', em: 'na praça' },
      { t: 'Shopping', em: 'no shopping' },
    ],
    bonus: [
      { t: 'Campo de\nfutebol', em: 'no campo de futebol' },
      { t: 'Farmácia', em: 'na farmácia' },
      { t: 'Salão de\nbeleza', em: 'no salão de beleza' },
      { t: 'Cinema', em: 'no cinema' },
      { t: 'Rede\nsocial', em: 'na rede social' },
      { t: 'Biblioteca', em: 'na biblioteca' },
    ],
  },
  sentimentos: {
    titulo: 'Sentimento',
    // m / f: forma concordada com o personagem
    classicos: [
      { m: 'desapontado', f: 'desapontada' },
      { m: 'bravo', f: 'brava' },
      { m: 'animado', f: 'animada' },
      { m: 'apaixonado', f: 'apaixonada' },
      { m: 'curioso', f: 'curiosa' },
      { m: 'chateado', f: 'chateada' },
    ],
    bonus: [
      { m: 'triste', f: 'triste' },
      { m: 'desanimado', f: 'desanimada' },
      { m: 'aliviado', f: 'aliviada' },
      { m: 'encantado', f: 'encantada' },
      { m: 'esperançoso', f: 'esperançosa' },
      { m: 'raivoso', f: 'raivosa' },
    ],
  },
};

// {o} vira "o" ou "a" conforme o personagem sorteado.
// p: pergunta de apoio para a reflexão ("para pensar"), sem resposta certa.
export const DILEMAS = [
  { d: 'e foi bloquead{o} nas redes sociais por alguém de quem gosta.',
    p: 'Dá para respeitar a decisão da outra pessoa e, ao mesmo tempo, cuidar do que você está sentindo? Com quem você conversaria?' },
  { d: 'e foi tratad{o} com grosseria por um desconhecido na rua.',
    p: 'Responder na mesma moeda resolveria? O que ajuda a se acalmar antes de decidir o que fazer?' },
  { d: 'e encontrou uma carteira no chão com R$ 1.000 dentro e não sabe se a devolve ou não ao dono.',
    p: 'Como o dono da carteira estaria se sentindo agora? Que caminhos existem para encontrá-lo?' },
  { d: 'e viu alguém pegando um item da mochila de uma pessoa que mal conhece.',
    p: 'Não conhecer a pessoa muda o que é justo fazer? Quem por perto poderia ajudar?' },
  { d: 'e soube que um amigo está sofrendo muito, mas ele não quer que mais ninguém saiba disso.',
    p: 'Guardar um segredo e proteger alguém são sempre a mesma coisa? Quando vale pedir ajuda a um adulto de confiança?' },
  { d: 'e viu que espalharam fotos de uma conhecida na internet sem a autorização dela.',
    p: 'Compartilhar, ignorar ou denunciar: qual dessas atitudes protege mais a pessoa exposta?' },
  { d: 'e um amigo contou que vai fazer algo proibido, mas não vê problema “porque todo mundo está fazendo também”.',
    p: 'O fato de muita gente fazer algo torna essa atitude segura? Como dizer o que você pensa sem romper a amizade?' },
  { d: 'e viu alguém que aparenta não ter muito dinheiro roubando comida de um mercadinho.',
    p: 'O que muda quando entendemos o motivo de uma atitude? Existe uma forma de ajudar sem ignorar o que aconteceu?' },
  { d: 'e percebeu que uma amiga anda muito solitária, mas ela se recusa a falar sobre isso.',
    p: 'Como mostrar que você está por perto sem pressionar? Pequenos convites e presença também contam.' },
  { d: 'e viu um colega da escola ser ofendido, mas tem receio de contar à coordenação.',
    p: 'O que torna difícil contar? Existe um jeito seguro de pedir ajuda e apoiar quem foi ofendido?' },
  { d: 'e está numa festa e vê adolescentes bebendo álcool.',
    p: 'Quais riscos existem nessa situação? A quem você poderia recorrer se alguém passasse mal?' },
  { d: 'e descobriu a senha do celular da pessoa de quem gosta.',
    p: 'Ter acesso a algo dá o direito de usar? Como você se sentiria se fosse com o seu celular?' },
  { d: 'e viu uma pessoa jogar lixo na rua.',
    p: 'Há um jeito respeitoso de comentar? O que o seu próprio exemplo comunica para quem está por perto?' },
  { d: 'e viu um colega empurrar outro e machucá-lo.',
    p: 'Qual é a primeira coisa a fazer por quem se machucou? Quem precisa saber do que aconteceu?' },
  { d: 'e viu uma pessoa falar mal de uma amiga para outra pessoa.',
    p: 'Contar para a amiga ajuda ou machuca? E se você dissesse algo ali mesmo, na hora?' },
  { d: 'e viu o namorado de uma conhecida em um encontro com outra pessoa.',
    p: 'Você tem todas as informações sobre essa história? O que é seu de resolver e o que não é?' },
  { d: 'e percebeu que o garçom errou na conta e cobrou muito menos do que deveria.',
    p: 'Quem arca com esse erro depois? Avisar seria diferente se o valor fosse pequeno ou grande?' },
  { d: 'e viu o pai mentir para a mãe.',
    p: 'O que você sabe sobre o motivo dessa mentira? Com quem seria possível conversar sobre isso com calma?' },
  { d: 'e, durante um jogo, viu que a bola saiu, mas o juiz não percebeu.',
    p: 'Vencer de qualquer jeito vale a pena? Como você se sentiria se fosse o outro time?' },
  { d: 'e foi convidad{o} para a festa de um colega que não é popular, mas seus amigos recusaram o convite.',
    p: 'O que pesa mais nessa decisão? Como o colega se sentiria se ninguém fosse?' },
  { d: 'e viu o irmão fumando escondido, mas sabe que, se contar aos pais, eles ficarão muito decepcionados.',
    p: 'Dá para conversar primeiro com o irmão? Quando a saúde de alguém está em jogo, o que pesa mais?' },
  { d: 'e viu uma senhora idosa, que não conhece, sendo xingada na rua.',
    p: 'Como oferecer apoio a ela com segurança? Às vezes, ficar ao lado de alguém já faz efeito.' },
  { d: 'e viu uma pessoa estacionar em uma vaga reservada para pessoas com deficiência sem ter direito a ela.',
    p: 'Para quem essa vaga faz falta? Existe um jeito respeitoso e seguro de comentar ou de avisar alguém responsável?' },
  { d: 'e presenciou um garoto rindo de uma moça com deficiência, mas o garoto era bem mais forte.',
    p: 'Como apoiar a moça sem se colocar em risco? Quem mais poderia ajudar naquele momento?' },
  { d: 'e percebeu que alguém deixou cair uma nota de cem reais.',
    p: 'O que você esperaria que fizessem se o dinheiro fosse seu?' },
  { d: 'e viu um homem abandonando um cachorro na rua.',
    p: 'O que o cachorro precisa agora? Quais pessoas ou serviços poderiam ajudar?' },
  { d: 'e presenciou uma pessoa mentir numa entrevista de emprego.',
    p: 'Quem pode ser afetado por essa mentira? Esse assunto é seu de resolver?' },
  { d: 'e percebeu que um colega está colando na prova.',
    p: 'Quais são as consequências para o colega e para a turma? Há algo que você diria a ele depois da prova?' },
];

// Placas do material impresso (página "Cartões"); o rótulo substitui os pontos.
export const PLACAS = {
  verde: { pts: 2, nome: 'Verde', label: 'Concordo', desc: 'Concordo completamente', img: 'assets/placas/placa-verde.png' },
  amarela: { pts: 1, nome: 'Amarelo', label: 'Em partes', desc: 'Concordo em partes', img: 'assets/placas/placa-amarela.png' },
  vermelha: { pts: 0, nome: 'Vermelho', label: 'Discordo', desc: 'Discordo da decisão', img: 'assets/placas/placa-vermelha.png' },
};

export const AVATARES = [
  'assets/tuto/av-joinha.webp',
  'assets/tuto/av-422.webp',
  'assets/tuto/av-444.webp',
  'assets/tuto/av-438.webp',
  'assets/tuto/av-434.webp',
  'assets/tuto/av-site-9.webp',
  'assets/tuto/av-430.webp',
];
