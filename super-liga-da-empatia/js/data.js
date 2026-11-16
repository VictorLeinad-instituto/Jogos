// Conteúdo da "Super Liga da Empatia" (Jogo #1 · Módulo 4 do ame sua mente na escola).
// Fonte: documento "Super Liga da Empatia" (revisão de nov. 2026), que refaz as instruções, os modos de jogo,
// a tabela de superpoderes e os 20 dilemas do material impresso ("Super Liga da Empatia.pdf").
// Cada dilema tem 4 alternativas (A a D) com 0 a 3 pontos. Os pontos medem só as escolhas previstas nesta
// dinâmica: não medem caráter, empatia real nem valor pessoal.

export const CARTAS = [
  {
    n: 1, tema: 'Bullying e pedido de segredo',
    dilema: 'Uma pessoa conta que sofre bullying e pede segredo. Como acolher e pensar em apoio?',
    alternativas: [
      { letra: 'A', texto: 'Prometo guardar segredo e não procuro ajuda, mesmo se houver risco.', pontos: 0 },
      { letra: 'B', texto: 'Peço conselho a um colega, sem compartilhar nomes ou detalhes identificáveis.', pontos: 1 },
      { letra: 'C', texto: 'Pergunto do que a pessoa precisa e combino com ela como procurar apoio seguro.', pontos: 2 },
      { letra: 'D', texto: 'Acolho, explico que não posso prometer segredo absoluto diante de risco e ajudo a buscar uma pessoa adulta de confiança.', pontos: 3 },
    ],
    nota: 'O dever de apoio não pode recair sobre quem recebe a revelação. Evitar divulgar nomes; diante de risco, procurar proteção.',
  },
  {
    n: 2, tema: 'Festa e encontro marcado',
    dilema: 'Você recebeu convite para uma festa e também marcou um encontro no mesmo horário. Como lidar com os dois compromissos?',
    alternativas: [
      { letra: 'A', texto: 'Aceito ambos sem avisar ninguém e deixo as pessoas esperando.', pontos: 0 },
      { letra: 'B', texto: 'Escolho um compromisso e aviso a outra pessoa apenas depois.', pontos: 1 },
      { letra: 'C', texto: 'Converse com as pessoas envolvidas e verifique se é possível ajustar horários sem pressionar ninguém.', pontos: 2 },
      { letra: 'D', texto: 'Decido com transparência, aviso com antecedência quem não poderei encontrar e proponho outra ocasião.', pontos: 3 },
    ],
    nota: 'Retirar “não popular” e a ideia de que alguém precisa merecer presença. O dilema trata de comunicação, não de comparar o valor das pessoas.',
  },
  {
    n: 3, tema: 'Exposição de sentimento pessoal',
    dilema: 'Uma colega compartilhou algo pessoal sobre quem ela gosta. Outras pessoas começaram a fazer piadas. O que você pode fazer?',
    alternativas: [
      { letra: 'A', texto: 'Repasso a mensagem para mais pessoas.', pontos: 0 },
      { letra: 'B', texto: 'Fico em silêncio e evito participar.', pontos: 1 },
      { letra: 'C', texto: 'Não compartilho o conteúdo e pergunto à colega, em particular, que apoio ela deseja.', pontos: 2 },
      { letra: 'D', texto: 'Interrompo a exposição sem repetir o conteúdo, apoio a colega e procuro um adulto de confiança se a situação continuar.', pontos: 3 },
    ],
    nota: 'Proteger a privacidade: não revelar a pessoa por quem ela tem interesse nem encaminhar capturas de tela.',
  },
  {
    n: 4, tema: 'Escolha de times e comentários sobre o corpo',
    dilema: 'Na aula de Educação Física, um colega costuma ser escolhido por último e ouve comentários sobre o corpo. Como agir?',
    alternativas: [
      { letra: 'A', texto: 'Repito o comentário ou faço piada.', pontos: 0 },
      { letra: 'B', texto: 'Não participo da piada, mas sigo a atividade sem verificar como o colega está.', pontos: 1 },
      { letra: 'C', texto: 'Convido o colega para o time e pergunto em particular como prefere participar.', pontos: 2 },
      { letra: 'D', texto: 'Convido com respeito, combino uma escolha de times mais justa e aviso a pessoa docente sobre os comentários.', pontos: 3 },
    ],
    nota: 'Eliminar foco no peso como justificativa. Não transformar o colega em objeto de pena nem prometer escolher sempre sem perguntar.',
  },
  {
    n: 5, tema: 'Apelidos por estatura',
    dilema: 'Um estudante recebe apelidos sobre sua estatura. Como você pode contribuir?',
    alternativas: [
      { letra: 'A', texto: 'Uso o apelido junto com o grupo.', pontos: 0 },
      { letra: 'B', texto: 'Não repito o apelido, mas não digo como a pessoa prefere ser chamada.', pontos: 1 },
      { letra: 'C', texto: 'Uso o nome ou a forma de tratamento que ela prefere e digo que o apelido não é adequado.', pontos: 2 },
      { letra: 'D', texto: 'Apoio a pessoa, interrompo a zombaria com segurança e procuro a equipe escolar se continuar.', pontos: 3 },
    ],
    nota: 'Evitar “o mais baixo” como identidade principal. Focar no comportamento de quem provoca e no nome preferido.',
  },
  {
    n: 6, tema: 'Preconceito religioso',
    dilema: 'Colegas fazem comentários preconceituosos sobre a religião de uma pessoa amiga. O que você pode fazer?',
    alternativas: [
      { letra: 'A', texto: 'Afasto-me da pessoa para não ser associado a ela.', pontos: 0 },
      { letra: 'B', texto: 'Não participo, mas não ofereço apoio.', pontos: 1 },
      { letra: 'C', texto: 'Pergunto à pessoa de que apoio precisa e digo que os comentários não são aceitáveis.', pontos: 2 },
      { letra: 'D', texto: 'Apoio a pessoa, registro o ocorrido sem divulgar publicamente e procuro a equipe escolar ou adulto de confiança.', pontos: 3 },
    ],
    nota: 'Não tratar a religião como algo exótico a ser investigado. A curiosidade não substitui o enfrentamento do preconceito.',
  },
  {
    n: 7, tema: 'Zombaria sobre a roupa de uma pessoa docente',
    dilema: 'Alguns colegas fazem comentários sobre a roupa de uma pessoa docente. Como você reage?',
    alternativas: [
      { letra: 'A', texto: 'Faço novas piadas ou espalho os comentários.', pontos: 0 },
      { letra: 'B', texto: 'Não participo, mas também não reforço o respeito.', pontos: 1 },
      { letra: 'C', texto: 'Digo com calma que comentários sobre aparência não são necessários e mudo o foco.', pontos: 2 },
      { letra: 'D', texto: 'Interrompo com segurança e, se virar perseguição, converso com a pessoa docente ou coordenação.', pontos: 3 },
    ],
    nota: 'Evitar fazer da roupa motivo de humilhação. O objetivo é limitar a ofensa sem convidar a retaliação.',
  },
  {
    n: 8, tema: 'Colega com dificuldade de fala excluído do grupo',
    dilema: 'Em um trabalho, um colega com dificuldade de fala acaba sem grupo. Como tornar a participação mais justa?',
    alternativas: [
      { letra: 'A', texto: 'Imito o jeito de falar ou deixo que fique sozinho.', pontos: 0 },
      { letra: 'B', texto: 'Convido por achar engraçado, sem perguntar como prefere participar.', pontos: 1 },
      { letra: 'C', texto: 'Convido e pergunto de que forma gostaria de contribuir.', pontos: 2 },
      { letra: 'D', texto: 'Incluo o colega, combino tarefas com o grupo e verifico com ele se a organização funciona.', pontos: 3 },
    ],
    nota: 'Não reduzir a pessoa à dificuldade de fala nem supor incapacidade. Preservar autonomia e oferecer formas diversas de participação.',
  },
  {
    n: 9, tema: 'Atividade copiada sem autorização',
    dilema: 'Você percebe que um colega copiou sua atividade sem pedir. Como resolver?',
    alternativas: [
      { letra: 'A', texto: 'Autorizo que continue copiando e esconda a situação.', pontos: 0 },
      { letra: 'B', texto: 'Acuso o colega publicamente diante da turma.', pontos: 1 },
      { letra: 'C', texto: 'Conversa em particular, explica o impacto e pede que não use seu trabalho sem autorização.', pontos: 2 },
      { letra: 'D', texto: 'Conversa com respeito, protege seu material e, se continuar ou afetar a avaliação, pede orientação à pessoa docente.', pontos: 3 },
    ],
    nota: 'Corrigir a alternativa original que sugeria mudar palavras para disfarçar cópia. Não presumir intenção; orientar integridade e limites.',
  },
  {
    n: 10, tema: 'Comentários sobre o cabelo de outra pessoa',
    dilema: 'Uma amiga faz comentários repetidos sobre o cabelo de uma estudante. Como você pode agir?',
    alternativas: [
      { letra: 'A', texto: 'Dou risada e replico os comentários.', pontos: 0 },
      { letra: 'B', texto: 'Não participo, mas não converso sobre o efeito das piadas.', pontos: 1 },
      { letra: 'C', texto: 'Digo à amiga que os comentários podem machucar e devem parar.', pontos: 2 },
      { letra: 'D', texto: 'Não repito nem exponho a estudante; apoio-a em particular e procuro a equipe escolar se a situação continuar.', pontos: 3 },
    ],
    nota: 'Evitar elogios físicos como única forma de apoio. Não abordar a estudante para pedir que explique ou defenda o próprio cabelo.',
  },
  {
    n: 11, tema: 'Ataque de raiva após piadas sobre familiar',
    dilema: 'Um colega reage com muita raiva depois que fizeram piadas sobre a aparência de um familiar. Como agir?',
    alternativas: [
      { letra: 'A', texto: 'Continuo as piadas ou incentivo a reação.', pontos: 0 },
      { letra: 'B', texto: 'Peço que o colega se acalme, mas ignoro as provocações que começaram a situação.', pontos: 1 },
      { letra: 'C', texto: 'Interrompo as piadas, dou espaço e pergunto se ele quer ajuda.', pontos: 2 },
      { letra: 'D', texto: 'Ajudo a interromper a situação com segurança e chamo uma pessoa adulta responsável; não tento conter fisicamente.', pontos: 3 },
    ],
    nota: 'Não tratar a raiva como falha isolada. Reconhecer a provocação e evitar confronto ou contenção física por estudantes.',
  },
  {
    n: 12, tema: 'Testemunho de agressão verbal',
    dilema: 'Você presencia uma colega sendo alvo de agressão verbal. Qual é uma resposta segura?',
    alternativas: [
      { letra: 'A', texto: 'Finjo que não vi e compartilho a história como fofoca.', pontos: 0 },
      { letra: 'B', texto: 'Quero intervir, mas fico sem saber como e não peço ajuda.', pontos: 1 },
      { letra: 'C', texto: 'Depois, pergunto em particular como ela está e o que gostaria que eu fizesse.', pontos: 2 },
      { letra: 'D', texto: 'Se for seguro, sinalizo que a agressão deve parar, apoio a colega e aviso uma pessoa adulta responsável.', pontos: 3 },
    ],
    nota: 'Não exigir intervenção direta. Considerar segurança, vontade da pessoa afetada e busca de ajuda.',
  },
  {
    n: 13, tema: 'Pressão para participar de cyberbullying',
    dilema: 'Amigos pressionam você a compartilhar conteúdo ofensivo sobre um colega. O que fazer?',
    alternativas: [
      { letra: 'A', texto: 'Compartilho para continuar no grupo.', pontos: 0 },
      { letra: 'B', texto: 'Não publico, mas encaminho em privado.', pontos: 1 },
      { letra: 'C', texto: 'Recuso e peço aos amigos que parem de compartilhar.', pontos: 2 },
      { letra: 'D', texto: 'Recuso, não encaminho, apoio a pessoa afetada e, conforme o caso, uso a denúncia da plataforma e procuro um adulto de confiança.', pontos: 3 },
    ],
    nota: 'Apagar ou não compartilhar sem amplificar. A denúncia deve preservar a segurança e não expor mais a pessoa afetada.',
  },
  {
    n: 14, tema: 'Comentários racistas em publicação',
    dilema: 'Um amigo publica uma foto e começa a receber comentários racistas. Como oferecer apoio?',
    alternativas: [
      { letra: 'A', texto: 'Respondo com insultos e publico os nomes dos envolvidos.', pontos: 0 },
      { letra: 'B', texto: 'Digo que sinto muito, mas não pergunto o que o amigo deseja.', pontos: 1 },
      { letra: 'C', texto: 'Pergunto em particular como posso apoiar e ajudo a usar as ferramentas de denúncia, se ele quiser.', pontos: 2 },
      { letra: 'D', texto: 'Apoio sem republicar a imagem, guardo evidências apenas se necessário e procuro adulto ou canal responsável para interromper a violência.', pontos: 3 },
    ],
    nota: 'Não confrontar em privado os agressores em nome da pessoa nem prometer apagar comentários. Evitar exposição adicional da imagem.',
  },
  {
    n: 15, tema: 'Mensagens online ofensivas',
    dilema: 'Você vê um colega publicando mensagens que insultam outro estudante. Como agir?',
    alternativas: [
      { letra: 'A', texto: 'Curto, compartilho ou respondo com novas ofensas.', pontos: 0 },
      { letra: 'B', texto: 'Paro de ler e não faço nada.', pontos: 1 },
      { letra: 'C', texto: 'Não compartilho e verifico em particular se a pessoa atingida quer apoio.', pontos: 2 },
      { letra: 'D', texto: 'Apoio a pessoa, denuncio o conteúdo pela plataforma e aviso um adulto responsável se houver ameaça, repetição ou risco.', pontos: 3 },
    ],
    nota: 'Retirar campanha escolar automática como única solução. Priorizar proteção e não aumentar o alcance do conteúdo.',
  },
  {
    n: 16, tema: 'Amizade com alguém que pratica bullying',
    dilema: 'Uma pessoa amiga tem praticado bullying. Como responder sem ignorar o dano?',
    alternativas: [
      { letra: 'A', texto: 'Apoio o comportamento ou digo que é só brincadeira.', pontos: 0 },
      { letra: 'B', texto: 'Evito falar do assunto para não criar conflito.', pontos: 1 },
      { letra: 'C', texto: 'Conversa em particular, descreve o comportamento e deixa claro que precisa parar.', pontos: 2 },
      { letra: 'D', texto: 'Conversa com a pessoa amiga, apoia quem foi atingido e busca ajuda adulta se houver repetição ou risco.', pontos: 3 },
    ],
    nota: 'Não exigir rompimento imediato da amizade nem aceitar a violência por lealdade. Separar a pessoa de suas ações.',
  },
  {
    n: 17, tema: 'Novo estudante alvo de bullying',
    dilema: 'Uma pessoa recém-chegada à escola está sendo alvo de bullying por ser percebida como diferente. Como acolher?',
    alternativas: [
      { letra: 'A', texto: 'Dou risada ou faço perguntas invasivas sobre a diferença.', pontos: 0 },
      { letra: 'B', texto: 'Não participo, mas não ofereço apoio.', pontos: 1 },
      { letra: 'C', texto: 'Faço um convite respeitoso para uma atividade e pergunto se a pessoa quer companhia.', pontos: 2 },
      { letra: 'D', texto: 'Apoio sem pressionar, interrompo a exclusão se for seguro e procuro a equipe escolar sobre a perseguição.', pontos: 3 },
    ],
    nota: 'Substituir “diferente dos outros” por descrição neutra. Incluir sem transformar a pessoa em projeto ou exigir que aceite o convite.',
  },
  {
    n: 18, tema: 'Amigo pratica bullying contra outro amigo',
    dilema: 'Seu melhor amigo começa a praticar bullying contra alguém com quem antes tinha amizade. Como agir?',
    alternativas: [
      { letra: 'A', texto: 'Acho engraçado e incentivo.', pontos: 0 },
      { letra: 'B', texto: 'Peço apenas que evite agressão física, tolerando as ofensas.', pontos: 1 },
      { letra: 'C', texto: 'Digo que as piadas e a intimidação precisam parar e pergunto se posso ajudar a reparar o dano.', pontos: 2 },
      { letra: 'D', texto: 'Apoio a pessoa atingida e procuro um adulto responsável se houver repetição, ameaça ou insegurança.', pontos: 3 },
    ],
    nota: 'A alternativa não deve premiar só uma conversa com o autor; apoiar quem sofreu a violência é parte da resposta.',
  },
  {
    n: 19, tema: 'Violência praticada por familiar e pedido de segredo',
    dilema: 'Um colega conta que uma pessoa da família o intimida ou agride e pede segredo. O que fazer?',
    alternativas: [
      { letra: 'A', texto: 'Prometo não contar a ninguém, mesmo que exista perigo.', pontos: 0 },
      { letra: 'B', texto: 'Conto a colegas ou à família da pessoa sem orientação.', pontos: 1 },
      { letra: 'C', texto: 'Acolho, explico que não posso manter segredo diante de risco e pergunto com quem se sente seguro para conversar.', pontos: 2 },
      { letra: 'D', texto: 'Acompanho a busca imediata por um adulto ou profissional de confiança e aciono os canais de proteção adequados, sem investigar por conta própria.', pontos: 3 },
    ],
    nota: 'Não compartilhar com colegas nem confrontar a pessoa apontada. Em risco imediato, a proteção vem antes do segredo; seguir protocolos locais.',
  },
  {
    n: 20, tema: 'Exclusão de grupos nas redes',
    dilema: 'Você percebe que uma pessoa foi deliberadamente excluída de grupos de mensagens. Como pode responder?',
    alternativas: [
      { letra: 'A', texto: 'Também a excluo ou faço uma postagem pública sobre ela.', pontos: 0 },
      { letra: 'B', texto: 'Pergunto em público o que a pessoa fez para merecer isso.', pontos: 1 },
      { letra: 'C', texto: 'Pergunto em particular como ela está e se deseja ajuda para participar.', pontos: 2 },
      { letra: 'D', texto: 'Apoio sem publicar detalhes e, se houver perseguição ou impacto escolar, procuro a equipe responsável com a pessoa.', pontos: 3 },
    ],
    nota: 'Não criar justificativa engraçada nem presumir culpa. Proteger privacidade e verificar o que a própria pessoa deseja.',
  },
];

// Cartas que tratam de violência, racismo, ameaça ou risco: mostram o aviso de proteção e os contatos de ajuda.
export const SENSIVEIS = [1, 11, 12, 13, 14, 19];
export const AVISO = 'Em situações de violência, racismo, ameaça, sofrimento intenso ou risco, priorizem o apoio de uma pessoa adulta ou profissional de confiança e os canais de proteção adequados. O jogo não substitui atendimento ou proteção.';
export const CONTATOS = 'Disque 100 (direitos humanos) · CVV 188 · SAMU 192';

// Tabela de desbloqueio (marcos de 5 em 5 pontos acumulados, até 60 = liga completa).
export const PODERES = [
  { marco: 5, id: 'criatividade', nome: 'Criatividade' },
  { marco: 10, id: 'assertividade', nome: 'Assertividade' },
  { marco: 15, id: 'gratidao', nome: 'Gratidão' },
  { marco: 20, id: 'curiosidade', nome: 'Curiosidade' },
  { marco: 25, id: 'alegria', nome: 'Alegria' },
  { marco: 30, id: 'diversidade', nome: 'Diversidade' },
  { marco: 35, id: 'amizade', nome: 'Amizade' },
  { marco: 40, id: 'generosidade', nome: 'Generosidade' },
  { marco: 45, id: 'resiliencia', nome: 'Resiliência' },
  { marco: 50, id: 'empatia', nome: 'Empatia' },
  { marco: 55, id: 'paz', nome: 'Paz' },
];
export const META = 60;   // liga completa: todos os superpoderes
export const imgPoder = (id) => `assets/poderes/poder-${id}.webp`;

export const MODOS = {
  coop: { nome: 'Cooperativo', curto: 'Padrão', desc: 'O grupo soma os pontos num marcador comum e desbloqueia os superpoderes para todos. A meta é chegar a 60 pontos ou completar as cartas escolhidas.' },
  comp: { nome: 'Competitivo', curto: 'Opcional', desc: 'Cada pessoa registra os próprios pontos. Pode haver empate e mais de uma pessoa vencedora. Ninguém é eliminado.' },
  conversa: { nome: 'Sem pontuação', curto: 'Conversa', desc: 'Só as cartas sem pontos: cada pessoa pode escolher, explicar, passar ou apenas ouvir.' },
};
export const QTDS = [4, 6, 10, 20];
export const MIN_JOG = 2, MAX_JOG = 10;
export const CORES = ['#F74C00', '#C76BAC', '#E99A22', '#2A9D8F', '#FC1156', '#3A7BD5', '#6A994E', '#8E5AC8', '#D4572A', '#2A4947'];
