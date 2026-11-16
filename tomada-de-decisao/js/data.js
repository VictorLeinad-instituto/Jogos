// Conteúdo do jogo "Entre Caminhos: Decisões em Perspectiva" (Módulo 5, Jogo #1; antes "Tomada de decisão: o que você faria?").
// Fonte: documento "Jogo: Tomada de decisão — regras, roletas e baralho de dilemas" (nov. 2026).
// Cada carta é um dilema autônomo, escrito para uma pessoa ("você"). As roletas NÃO entram no texto da carta:
// depois da leitura, os resultados viram lentes para ampliar a reflexão.
// Rótulos com quebra de linha (\n) ficam em duas linhas na roleta.

export const ROLETAS = {
  pessoa: {
    titulo: 'Pessoa envolvida',
    lente: 'De quem é o ponto de vista que ainda falta considerar?',
    base: ['Você', 'Amizade', 'Colega', 'Familiar', 'Pessoa adulta\nde confiança', 'Grupo'],
    expansao: ['Alguém que\nprecisa de apoio', 'Pessoa\ndiretamente afetada', 'Testemunha', 'Mediador', 'Profissional\nda escola', 'Comunidade'],
  },
  contexto: {
    titulo: 'Contexto',
    lente: 'O contexto muda o que é seguro ou possível?',
    base: ['Escola', 'Casa', 'Espaço\npúblico', 'Atividade\nem grupo', 'Ambiente\ndigital', 'Comunidade'],
    expansao: ['Sala de aula', 'Intervalo', 'Conversa\nprivada', 'Chat de\nturma', 'Serviço/\ncomércio', 'Evento\ncomunitário'],
  },
  emocao: {
    titulo: 'Emoção',
    lente: 'Como essa emoção pode influenciar a decisão? O que ajudaria a pensar com calma?',
    base: ['Dúvida', 'Preocupação', 'Medo', 'Tristeza', 'Raiva', 'Alívio'],
    expansao: ['Vergonha', 'Frustração', 'Entusiasmo', 'Raiva', 'Medo', 'Calma'],
  },
};
export const ROLETA_CHAVES = ['pessoa', 'contexto', 'emocao'];
export const CONJUNTOS = { base: 'Base', expansao: 'Expansão' };

// t: tema. d: o dilema completo. p: pergunta de apoio ("para pensar"), aberta, sem induzir exposição pessoal.
export const DILEMAS = [
  { t: 'Segredo e pedido de ajuda',
    d: 'Uma pessoa próxima conta a você que está sofrendo muito e pede que você não conte a ninguém. Você percebe que ela pode precisar de apoio. O que pode fazer para acolhê-la e buscar ajuda de confiança?',
    p: 'Guardar um segredo e proteger alguém são sempre a mesma coisa? Que adulto de confiança poderia ajudar?' },
  { t: 'Exclusão no grupo',
    d: 'Você percebe que uma pessoa está sendo deixada de fora de uma atividade em grupo. O que pode fazer para incluir essa pessoa sem falar por ela?',
    p: 'Como você pode demonstrar acolhimento e também perguntar o que a pessoa prefere?' },
  { t: 'Mensagem ofensiva',
    d: 'Você recebe no grupo da turma uma mensagem que humilha um colega. O que pode fazer antes de responder, encaminhar ou compartilhar?',
    p: 'Que consequências podem surgir ao compartilhar a mensagem? Quem pode ajudar a interromper a situação?' },
  { t: 'Pressão para aceitar',
    d: 'Uma amizade insiste para que você faça algo que não quer, dizendo que você será excluído se recusar. Como pode responder e proteger seu limite?',
    p: 'Como dizer “não” com clareza? Que apoio pode procurar se a pressão continuar?' },
  { t: 'Ajuda em uma atividade',
    d: 'Um colega pede que você envie as respostas de uma atividade para copiar. Você quer ajudar, mas também quer agir com honestidade. O que pode propor?',
    p: 'Qual é a diferença entre ajudar alguém a aprender e fazer a tarefa por essa pessoa?' },
  { t: 'Rumor sobre alguém',
    d: 'Você ouve um comentário sobre uma pessoa da turma, mas não sabe se é verdadeiro. Antes de repetir a história, o que pode fazer?',
    p: 'Que danos um rumor pode causar? Como confirmar informações sem expor ninguém?' },
  { t: 'Comentário discriminatório',
    d: 'Durante uma conversa, você ouve uma fala que desrespeita alguém por sua aparência, origem ou deficiência. Como pode agir de modo seguro?',
    p: 'Quando pode ser importante interromper a fala? A quem você pode pedir apoio?' },
  { t: 'Assumir um erro',
    d: 'Você percebe que cometeu um erro que afetou outra pessoa. Você teme a reação do grupo. Como pode assumir responsabilidade e reparar o que for possível?',
    p: 'O que torna um pedido de desculpas respeitoso? Que reparação pode ser feita?' },
  { t: 'Muitas tarefas',
    d: 'Você tem várias tarefas próximas e não sabe por onde começar. Como pode organizar o próximo passo e pedir ajuda se precisar?',
    p: 'O que é urgente? Que pessoa pode ajudar você a dividir a tarefa em partes?' },
  { t: 'Cansaço e compromisso',
    d: 'Você está cansado e tem um compromisso importante. Como pode avaliar suas condições, comunicar o que precisa e decidir o próximo passo?',
    p: 'Que sinais ajudam você a perceber seus limites? Como avisar alguém de confiança?' },
  { t: 'Limite pessoal',
    d: 'Uma pessoa continua fazendo uma brincadeira que incomoda você, mesmo depois de você pedir para parar. O que pode dizer ou fazer?',
    p: 'Como comunicar um limite? O que fazer se a outra pessoa não respeitar esse limite?' },
  { t: 'Pedido da família',
    d: 'Você gostaria de participar de uma atividade, mas uma pessoa da família está preocupada com sua segurança. Como pode conversar e buscar uma solução possível?',
    p: 'Que informações podem ajudar a conversa? Como escutar a preocupação sem abandonar sua própria opinião?' },
  { t: 'Segredo que preocupa',
    d: 'Uma amizade pede que você esconda uma situação que pode colocar alguém em perigo. O que pode fazer para cuidar da segurança sem enfrentar isso sozinho?',
    p: 'Em que situações é importante procurar imediatamente uma pessoa adulta de confiança?' },
  { t: 'Presenciar intimidação',
    d: 'Você vê uma pessoa sendo intimidada no intervalo. Intervir diretamente pode não ser seguro. Que outras ações pode considerar?',
    p: 'Como apoiar a pessoa afetada sem aumentar o risco? Que adulto pode ser avisado?' },
  { t: 'Cola na avaliação',
    d: 'Durante uma avaliação, alguém oferece a você uma resposta para copiar. O que pode considerar antes de decidir?',
    p: 'Que consequências existem para você e para os outros? Como pedir ajuda para estudar?' },
  { t: 'Privacidade digital',
    d: 'Uma pessoa pede a você uma senha ou um dado pessoal por mensagem. O que pode fazer antes de responder?',
    p: 'Que informações devem permanecer privadas? Como verificar se o pedido é legítimo?' },
  { t: 'Responder com raiva',
    d: 'Você recebe uma mensagem que deixa você com muita raiva. Antes de responder, que opções tem?',
    p: 'O que pode mudar se você esperar alguns minutos ou conversar com alguém de confiança?' },
  { t: 'Desentendimento em fila',
    d: 'Em uma fila, você percebe que alguém passou à frente e outras pessoas começaram a discutir. Como pode agir sem aumentar o conflito?',
    p: 'Quando vale falar? Quando é mais seguro pedir ajuda a uma pessoa responsável pelo local?' },
  { t: 'Cuidado com o espaço comum',
    d: 'Você nota lixo no espaço que o grupo está usando e ninguém parece se responsabilizar. O que pode fazer de forma colaborativa?',
    p: 'Que ação pequena pode melhorar o espaço? Como convidar outras pessoas sem acusar?' },
  { t: 'Compra por pressão',
    d: 'Seus colegas querem que você compre algo apenas para não ficar de fora. Como pode decidir de acordo com suas possibilidades e vontade?',
    p: 'Como reconhecer a pressão do grupo? Que resposta respeitosa pode dar?' },
  { t: 'Informação duvidosa',
    d: 'Você vê uma informação alarmante circulando nas redes, mas não conhece a fonte. O que deve verificar antes de compartilhar?',
    p: 'Que fonte confiável pode consultar? O que pode acontecer se a informação for falsa?' },
  { t: 'Deslocamento inseguro',
    d: 'Você está com um grupo e percebe que o caminho combinado parece inseguro. Como pode expressar sua preocupação e propor outra opção?',
    p: 'Que alternativa mais segura existe? Quem pode ser avisado?' },
  { t: 'Pessoa sozinha',
    d: 'Você percebe que uma pessoa está sozinha e parece desconfortável em um encontro do grupo. Como pode se aproximar respeitando o espaço dela?',
    p: 'Como oferecer companhia sem pressionar? Que pergunta simples pode fazer?' },
  { t: 'Trabalho em equipe',
    d: 'Em um trabalho coletivo, você percebe que uma pessoa está fazendo quase tudo enquanto outra não participa. Como pode conversar para reorganizar as tarefas?',
    p: 'Como dividir responsabilidades de forma justa? Que acordo o grupo pode estabelecer?' },
  { t: 'Pedido de desculpas',
    d: 'Uma pessoa que magoou você pede desculpas. Você ainda não sabe se quer retomar a proximidade. Como pode responder respeitando seu tempo?',
    p: 'Aceitar um pedido de desculpas obriga você a retomar a relação? Que limite pode comunicar?' },
  { t: 'Dificuldade para aprender',
    d: 'Você não entendeu uma explicação e tem receio de perguntar. O que pode fazer para conseguir o apoio de que precisa?',
    p: 'Que pergunta específica poderia ajudar? A quem você pode recorrer?' },
  { t: 'Preparação para prova',
    d: 'Você tem uma prova em breve e percebe que ainda não estudou tudo. Como pode escolher uma prioridade realista e cuidar do seu descanso?',
    p: 'Que plano curto parece possível? O que você pode deixar para depois ou pedir ajuda para entender?' },
  { t: 'Foto sem autorização',
    d: 'Alguém quer publicar uma foto sua ou de outra pessoa sem pedir autorização. O que pode fazer antes da publicação?',
    p: 'Por que pedir consentimento importa? Como retirar ou denunciar uma publicação, se necessário?' },
];

// Marcadores de percurso: registram aspectos do raciocínio, não medem o valor da pessoa nem uma resposta "correta".
export const MARCADORES = {
  acao: { nome: 'Ação', quando: 'A pessoa apresenta pelo menos um caminho possível.', reconhece: 'Capacidade de imaginar uma resposta.' },
  consequencia: { nome: 'Consequência', quando: 'A pessoa considera o que pode acontecer com ela ou com outra pessoa.', reconhece: 'Antecipação e cuidado com impactos.' },
  apoio: { nome: 'Apoio e limites', quando: 'A pessoa identifica um limite, um adulto de confiança, um serviço ou outra forma segura de apoio, quando pertinente.', reconhece: 'Pedir ajuda também é uma decisão.' },
};
export const MARCADOR_CHAVES = ['acao', 'consequencia', 'apoio'];
export const METAS = [6, 9, 12, 15];   // sugestão do material: 12 marcadores em uma sessão; pode ser ajustada
export const PALAVRAS_FECHAMENTO = ['Alternativa', 'Limite', 'Apoio', 'Consequência'];

export const AVATARES = [
  'assets/tuto/av-joinha.webp',
  'assets/tuto/av-422.webp',
  'assets/tuto/av-444.webp',
  'assets/tuto/av-438.webp',
  'assets/tuto/av-434.webp',
  'assets/tuto/av-site-9.webp',
  'assets/tuto/av-430.webp',
];
