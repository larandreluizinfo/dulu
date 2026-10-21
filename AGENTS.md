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

- Site estático publicado via GitHub Pages a partir da branch `main` (raiz).
- Arquivo principal: `index.html`.
- URL do site: https://larandreluizinfo.github.io/dulu/
