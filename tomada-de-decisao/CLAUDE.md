# tomada-de-decisao — "Entre Caminhos: Decisões em Perspectiva"

Jogo #1 · Módulo 5 do ame sua mente na escola (antes "Tomada de decisão: o que você faria?"). Repositório: VictorLeinad-instituto/Jogos (pasta `tomada-de-decisao/`).
Fonte do conteúdo atual: documento "Jogo: Tomada de decisão — regras, roletas e baralho de dilemas" (nov. 2026), que reescreve cartas, roletas, regras e textos das telas.
Versão com sala e QR code: **repositório separado**, `../../jogo-tomada-de-decisao-sala` (mesmo `main.js`/`data.js`/`intro*.js`/`style.css`; mudou aqui, copiar lá).
O Tuto e a jornada (`../../alexpawlow/jogo-tuto-jornada`) é a referência de tudo o que veio de "padrão dos jogos": apresentação do Tuto, menu do celular, ícone de porta, etc.

## Stack
- Site estático sem build (`index.html`, `css/style.css`, ES modules em `js/`). Sem dependências. Preview: `.claude/launch.json` da pasta raiz, servidor `tomada-de-decisao` (porta 5185).
- Deploy na Vercel (feito pelo dono do repositório).

## Mapa
- `js/data.js` — as 3 roletas (Pessoa envolvida, Contexto, Emoção; conjuntos Base e Expansão, 6 opções cada, com a pergunta de "lente" de cada roleta), as **28 cartas-dilema** (`t` tema, `d` dilema completo escrito para "você", `p` "para pensar"), os marcadores (Ação, Consequência, Apoio e limites), metas (6/9/12/15), palavras do fechamento e avatares.
- `js/main.js` — todo o jogo. Fluxo de uma vez (`G.phase`): `draw` (tirar carta) → `read` (leitura em voz alta; dá para **passar a vez** ou **trocar de carta**) → `spin` (girar as roletas) → `answer` (carta + 3 "lentes"; dá para ignorar uma lente ou sortear outro resultado de UMA roleta por vez; cronômetro opcional de 1 min) → `mark` (o grupo registra Ação/Consequência/Apoio e limites) → próxima pessoa. As roletas **não entram no texto da carta**.
- Cooperativo: trilha coletiva com meta de marcadores (padrão 12, ajustável); sem pontos por concordância, sem placas, sem placar individual e sem vencedor. Fim: voltas combinadas (1 a 3 ou livre) ou ícone de porta; fechamento com "uma palavra ou ideia da conversa" (opcional).
- `js/intro.js` + `js/intro-data.js` — apresentação do Tuto (balões + Tuto animado, desenhos em `assets/intro/`). **Ainda sem narração**: um relógio próprio faz o papel do áudio (ritmo estimado). Quando o Victor mandar o áudio: pôr `assets/intro/narracao.mp3`, preencher `audio`, `dur`, `boca` e os tempos de `palavras` em `intro-data.js` (ver `../../alexpawlow/jogo-tuto-jornada/js/intro-data.js`); o botão de som aparece sozinho.
- `window.ASM` (em `main.js`) — ganchos para a versão com sala (`onSync`, `onFim`, `onHome`, `onRematch`, `primary`, `novaPartida`, `entrar`, `run`, `acoes`, `snapshot`). Na versão normal ninguém os usa.

## Decisões
- Vertente **educadores** (amarelo) + logotipo educadores. Texto preto sobre amarelo; Poppins; ASM Display só em números grandes.
- Título da tela inicial: "Entre Caminhos: Decisões em Perspectiva"; chamada, objetivo e orientação de segurança do documento. O nome do jogo/pasta continua "tomada-de-decisao".
- Instruções (`#rules`) só da versão online, de acordo com a mecânica (sem fichas, adesivos ou tabuleiro de papel).
- Participantes: **3 a 6** (como no documento). O roteiro do Tuto diz "você pode jogar sozinho"; se quiserem permitir 1 a 2 pessoas, mudar `MIN_PLAYERS` em `main.js`.
- Texto das cartas copiado do documento sem alterações (a carta 10 diz "cansado", no masculino, como no original).
- A pasta `assets/placas` (placas verde/amarela/vermelha) saiu; `assets/img/tuto-carta.png` é o Tuto da carta.

## Do Tuto e a jornada (iPhone)
- Barra do topo: no celular em pé (≤640 px) os ícones viram um menu de 3 barras (`#menuBtn`, script inline no `index.html`; modo marcado por JS em `body.menu-compacto`). A barra daqui continua `sticky` (a página rola, diferente do Tuto).
- Ícone de **porta** no topo ("Encerrar a partida") com confirmação; X das janelas fixo ao rolar; maiúscula no início de frases e botões.

## Estado atual (2026-11-16)
- Testado no preview: capa, partida completa (tirar, trocar, passar, roletas, ignorar/sortear outra lente, marcadores, encerrar), fim com fechamento, apresentação do Tuto (sem áudio), 1280×780 e 375×812.
- Ainda **não testado em iPhone de verdade**.
