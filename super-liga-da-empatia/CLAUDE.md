# super-liga-da-empatia — "Super Liga da Empatia"

Jogo #1 · Módulo 4 do ame sua mente na escola, **criado do zero** em 2026-11-16. Repositório: VictorLeinad-instituto/Jogos (pasta `super-liga-da-empatia/`).
Fontes: material impresso `~/Downloads/Super Liga da Empatia.pdf` (arte, cartela 1–60, superpoderes) e o documento revisado `~/Downloads/Super_Liga_da_Empatia.docx` (modos, instruções, tabela de desbloqueio e os 20 dilemas reescritos).
Versão com sala e QR code: **repositório separado** `../../super-liga-da-empatia-sala` (mesmo `main.js`/`data.js`/`intro*.js`/`style.css`; mudou aqui, copiar lá).
Mesma arquitetura do Tomada de decisão (`../tomada-de-decisao`): `main.js` com ganchos `window.ASM` para a sala.

## Stack
- Site estático sem build. Preview: `.claude/launch.json` da raiz, servidor `super-liga` (porta 5192).

## Mapa
- `js/data.js` — 20 dilemas do documento (`dilema`, 4 `alternativas` com `pontos` 0–3, `nota` de revisão = "Dica para quem conduz"), cartas sensíveis (aviso + Disque 100/CVV 188/SAMU 192), 11 superpoderes com marcos de 5 em 5 e 60 = liga completa, os 3 modos, quantidades de cartas (4/6/10/20), cores.
- `js/main.js` — fluxo de cada carta: `ler` (a pessoa da vez lê; dá para **retirar a carta sem penalidade**) → `escolher` (cada pessoa escolhe em segredo, passando o aparelho; dá para "Prefiro passar") → `revelar` (pontos de cada alternativa, quantas escolhas em cada; perguntas para a conversa; dica para quem conduz) → próxima carta, com a leitura passando adiante. No modo sem pontuação: `ler` → `conversa`.
  - Cooperativo (padrão): soma de todos num marcador comum (cartela de 60 casas), poderes desbloqueados para o grupo; termina com as cartas escolhidas ou ao chegar a 60.
  - Competitivo: pontos de cada pessoa, poderes individuais, empate reconhecido (pode haver mais de uma pessoa vencedora).
  - Sem pontuação: só as cartas sem pontos, conversa.
- `js/intro.js` + `js/intro-data.js` — apresentação do Tuto. **O texto é um RASCUNHO meu** (o documento não trouxe roteiro do Tuto) e ainda **sem narração**. Trocar pelo roteiro oficial e, com o áudio, preencher `audio`, `dur`, `boca` e os tempos (ver o intro-data do Tuto e a jornada).
- `assets/poderes/` — os 11 selos de superpoder recortados da página "Superpoderes" do PDF (com o título curvo). `assets/tuto/tuto-capa.png` (Tuto de capa) e `tuto-carta.png` (Tuto das cartas) extraídos do PDF.

## Decisões
- Vertente **educadores** + logotipo genérico; visual de HQ do material (raios amarelos, explosão rosa, faixa vermelha), com texto preto sobre amarelo/laranja/rosa e branco só sobre verde escuro. Poppins em tudo; ASM Display só nos números (cartela, pontos, nº do dilema).
- A pontuação "mede só as escolhas previstas nesta dinâmica" (aparece nas regras, na revelação e no fim).
- Tabela de desbloqueio do documento (5 Criatividade … 55 Paz, 60 liga completa) **substitui** a cartela original, que tinha marcos irregulares (5, 10, 18, 24, 29, 33, 37, 41, 45, 50, 56, 60).
- As alternativas ficam na ordem do material (A a D). Observação: nas 20 cartas revisadas a pontuação é sempre A=0, B=1, C=2, D=3; quem perceber o padrão pode "acertar" sem pensar. Se a equipe quiser, embaralhar a ordem (mudaria a correspondência com o impresso).
- Os 4 heróis (cartas dos jogadores do PDF) não foram usados: no PDF eles são montados com várias camadas soltas. Os jogadores usam círculos coloridos com a inicial.
- Participantes: 2 a 10 (o material diz "a partir de 2").

## Estado atual (2026-11-16)
- Testado no preview: capa, partida cooperativa completa (6 cartas, superpoderes, fim), competitivo (empate), sem pontuação, galeria, celular 375×812 e 1280×780.
- Não testado em iPhone de verdade.
