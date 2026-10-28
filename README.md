# Dulu

**Ludo ao contrário para até 8 jogadores.** Os pininhos começam no fim da trilha, correm no sentido contrário e, quando se cruzam, disputam charadas.

🎲 Jogue em: **https://larandreluizinfo.github.io/dulu/**

Atalho: para cair direto na partida, use **?jogar** no endereço (ou `?jogar=4` para começar com 4 pininhos).

## Como jogar

- **2 a 8 jogadores**, todos no mesmo aparelho.
- Cada jogador é um animal: **Panda, Coelho, Onça, Cavalo, Macaco, Borboleta** (e, para mesas maiores, Tigre e Coruja). O nome pode ser trocado na montagem da mesa.
- Cada pininho larga na **casa 1** e percorre as **40 casas** no sentido anti-horário até a **meta**.
- Na sua vez, role o dado (1 a 6) e avance. Quem alcançar ou ultrapassar a casa 40 primeiro vence.
- **Encontro:** se um pininho parar na casa de outro — ou passar por cima dele — os dois disputam uma charada.
  - Quem provocou o encontro responde primeiro; depois, o outro.
  - **Acertou:** passa e fica na casa.
  - **Errou:** volta 5 casas.
- Cada charada tem 25 segundos para ser respondida. São 51 charadas no baralho, embaralhadas a cada partida.
- Atalho: a barra de espaço rola o dado.

## Estrutura

```
index.html        página do jogo (tabuleiro, painel e janelas)
css/styles.css    visual do tabuleiro, painel e modais
js/charadas.js    banco de charadas
js/game.js        regras, turnos, encontros e animações
```

Não há build nem dependências: é um site estático.

Para rodar localmente, abra `index.html` no navegador ou, se preferir um servidor:

```bash
python -m http.server 8000
```

## Publicação

O GitHub Pages publica a branch `main` na raiz do repositório. Qualquer push na `main` gera uma nova versão do site automaticamente.

## Autores

- Miguel
- Luiz
- Pietra
- Davi
- Yasmin
- Ana
- Filipe
