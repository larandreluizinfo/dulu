# Instruções para agentes

## Regra obrigatória: commitar e enviar (push)

Toda e qualquer alteração feita neste repositório **deve** ser commitada e enviada
para o GitHub (`git push`). Não deixe mudanças apenas no disco local.

Fluxo padrão após qualquer alteração:

1. `git add -A`
2. `git commit -m "<descrição curta e clara do que mudou>"`
3. `git push` (para a branch `main`, salvo instrução explícita em contrário)

Regras complementares:

- Nunca use `--force` no push, a menos que seja pedido explicitamente.
- Antes de commitar, rode `git status` para conferir o que está sendo incluído.
- Não faça commit de segredos, tokens ou arquivos de ambiente (`.env`).
- Agrupe alterações relacionadas em um único commit com mensagem descritiva.
- Se o push falhar, resolva o conflito (`git pull --rebase`) e envie novamente.

## Sobre o projeto

- Jogo **Dulu**: ludo ao contrário para 2 a 8 jogadores, com duelos de charadas.
- Site estático publicado via GitHub Pages a partir da branch `main` (raiz).
- URL do site: https://larandreluizinfo.github.io/dulu/
- Sem build e sem dependências. Arquivos:
  - `index.html` — estrutura do jogo (tela de configuração, tabuleiro, painel e modais).
  - `css/styles.css` — estilos do tabuleiro, painel, modais e responsividade.
  - `js/charadas.js` — banco de charadas (`{ p, o, c }`, opções e índice da correta).
  - `js/game.js` — estado, turnos, movimento, encontros, charadas e vitória.
- Regras principais: trilha de 40 casas no sentido anti-horário; ao parar na casa de
  outro pininho ou passar por cima dele, os dois respondem uma charada (acertou passa,
  errou volta 5 casas); vence quem alcançar a meta.
- `AGENTS.md`, `README.md` e `index.html` são os arquivos de referência do projeto.
