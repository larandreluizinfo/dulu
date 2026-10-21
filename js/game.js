/* Dulu — ludo ao contrário
   Regras: 2 a 8 pininhos, trilha de 40 casas, sentido contrário.
   Ao se encontrarem, os pininhos disputam uma charada. */

(function () {
  "use strict";

  var CORES = ["#f0616d", "#5aa9f0", "#54d18a", "#f5b544", "#b57bf0", "#f28b3c", "#4fd6d0", "#ef7bb0"];
  var NOMES = ["Miguel", "Luiz", "Pietra", "Davi", "Yasmin", "Ana", "Filipe", "Jogador 8"];
  var CASAS = 40;
  var ULTIMA = CASAS - 1;
  var MIN = 2;
  var MAX = 8;
  var TEMPO_CHARADA = 25;
  var PASSO_MS = 155;

  var PIPS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  var state = {
    players: [],
    atual: 0,
    ocupado: false,
    fim: false,
    deck: []
  };

  var board = document.getElementById("board");
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var CELL_POS = (function () {
    var pos = [];
    var raio = 42.5;
    for (var i = 0; i < CASAS; i++) {
      var ang = (-90 - i * (360 / CASAS)) * (Math.PI / 180);
      pos.push({ x: 50 + raio * Math.cos(ang), y: 50 + raio * Math.sin(ang) });
    }
    return pos;
  })();

  function baralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- tabuleiro ---------- */

  function montarTabuleiro() {
    var frag = document.createDocumentFragment();
    CELL_POS.forEach(function (p, i) {
      var cell = document.createElement("div");
      cell.className = "cell";
      if (i === 0) cell.classList.add("is-start");
      if (i === ULTIMA) cell.classList.add("is-goal");
      cell.style.left = p.x + "%";
      cell.style.top = p.y + "%";
      cell.textContent = i === ULTIMA ? "★" : String(i + 1);
      cell.title = i === 0 ? "Largada" : i === ULTIMA ? "Meta" : "Casa " + (i + 1);
      frag.appendChild(cell);
    });
    board.appendChild(frag);
  }

  function renderPinos() {
    var grupos = {};
    state.players.forEach(function (p) {
      if (!grupos[p.pos]) grupos[p.pos] = [];
      grupos[p.pos].push(p);
    });

    Object.keys(grupos).forEach(function (chave) {
      var lista = grupos[chave];
      var c = CELL_POS[Number(chave)];
      var offs = deslocamentos(lista.length, c);
      lista.forEach(function (p, k) {
        var o = offs[k];
        p.el.style.left = (c.x + o[0]) + "%";
        p.el.style.top = (c.y + o[1]) + "%";
        p.el.style.zIndex = String(3 + k);
        p.el.classList.toggle("is-current", !state.fim && state.players.indexOf(p) === state.atual);
        p.el.classList.toggle("is-compact", lista.length > 4);
      });
    });
  }

  /* Espalha os pinos da mesma casa para dentro do círculo, sem cobrir as casas vizinhas. */
  function deslocamentos(n, cell) {
    if (n <= 1) return [[0, 0]];

    var raio = 42.5;
    var rx = (cell.x - 50) / raio;
    var ry = (cell.y - 50) / raio;
    var tx = -ry;
    var ty = rx;

    var cols = n <= 2 ? n : n <= 4 ? 2 : 3;
    var rows = Math.ceil(n / cols);
    var espaco = cols >= 3 ? 1.45 : 1.6;
    var recuo = 3;
    var res = [];

    for (var r = 0; r < rows; r++) {
      var naLinha = Math.min(cols, n - r * cols);
      for (var c = 0; c < naLinha; c++) {
        var t = (c - (naLinha - 1) / 2) * espaco;
        var d = r * recuo;
        res.push([tx * t - rx * d, ty * t - ry * d]);
      }
    }
    return res;
  }

  function inicial(nome) {
    return String(nome).trim().slice(0, 1).toUpperCase() || "?";
  }

  function renderJogadores() {
    var lista = $("players-list");
    lista.innerHTML = "";
    state.players.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "player" + (i === state.atual && !state.fim ? " is-turn" : "");
      li.innerHTML =
        '<span class="chip" style="--c:' + p.cor + '">' + esc(inicial(p.nome)) + "</span>" +
        '<span class="pname">' + esc(p.nome) + "</span>" +
        '<span class="ppos">casa ' + (p.pos + 1) + "/" + CASAS + "</span>";
      lista.appendChild(li);
    });
  }

  function renderVez() {
    var p = state.players[state.atual];
    if (!p) return;
    var nome = $("turn-name");
    nome.textContent = p.nome;
    nome.style.setProperty("--c", p.cor);
    $("turn-hint").textContent = p.nome + ", role o dado e avance no sentido contrário.";
  }

  function renderDado(v) {
    var dado = $("dice");
    dado.innerHTML = "";
    dado.setAttribute("aria-label", v ? "Dado: " + v : "Dado");
    for (var i = 0; i < 9; i++) {
      var pip = document.createElement("span");
      pip.className = "pip" + (v && PIPS[v].indexOf(i) !== -1 ? " on" : "");
      dado.appendChild(pip);
    }
    if (!v) {
      var mark = document.createElement("span");
      mark.className = "dice-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "?";
      dado.appendChild(mark);
    }
  }

  function registrar(msg, quem) {
    var lista = $("log");
    var li = document.createElement("li");
    if (quem && quem.cor) {
      var dot = document.createElement("span");
      dot.className = "log-dot";
      dot.style.setProperty("--c", quem.cor);
      li.appendChild(dot);
    } else if (quem === "evento") {
      li.classList.add("evento");
      var mark = document.createElement("span");
      mark.className = "log-dot";
      mark.style.setProperty("--c", "var(--accent)");
      li.appendChild(mark);
    } else {
      li.classList.add("sistema");
    }
    var txt = document.createElement("span");
    txt.textContent = msg;
    li.appendChild(txt);
    lista.prepend(li);
    while (lista.children.length > 40) lista.lastElementChild.remove();
  }

  /* ---------- configuração ---------- */

  function montarConfiguracao() {
    var lista = $("setup-list");
    NOMES.forEach(function (nome, i) {
      var li = document.createElement("li");
      li.className = "setup-row";
      li.innerHTML =
        '<label class="check">' +
        '<input type="checkbox" data-idx="' + i + '"' + (i < 7 ? " checked" : "") + ">" +
        '<span class="swatch" style="--c:' + CORES[i] + '"></span>' +
        "</label>" +
        '<input class="name-input" type="text" maxlength="14" value="' + esc(nome) + '" data-idx="' + i + '" aria-label="Nome do jogador ' + (i + 1) + '">' +
        '<span class="pos-num">' + (i + 1) + "º</span>";
      lista.appendChild(li);
    });
    lista.addEventListener("change", atualizarDica);
    atualizarDica();
  }

  function atualizarDica() {
    var marcados = Array.prototype.filter.call(
      document.querySelectorAll("#setup-list input[type=checkbox]"),
      function (c) { return c.checked; }
    );
    var n = Math.min(marcados.length, MAX);
    $("setup-hint").textContent = n < MIN ? "Escolha pelo menos " + MIN + " pininhos" : n + " pininhos na mesa";
    $("btn-start").disabled = n < MIN;
  }

  /* ---------- partida ---------- */

  function iniciarPartida() {
    var escolhidos = [];
    document.querySelectorAll("#setup-list input[type=checkbox]").forEach(function (c) {
      if (!c.checked || escolhidos.length >= MAX) return;
      var idx = Number(c.dataset.idx);
      var input = document.querySelector('.name-input[data-idx="' + idx + '"]');
      var nome = (input && input.value ? input.value : "").trim().slice(0, 14) || NOMES[idx];
      escolhidos.push({ idx: idx, nome: nome });
    });
    if (escolhidos.length < MIN) return;

    state.geracao = (state.geracao || 0) + 1;
    board.querySelectorAll(".pin").forEach(function (el) { el.remove(); });

    state.players = escolhidos.map(function (o) {
      return { nome: o.nome, cor: CORES[o.idx], pos: 0, el: null };
    });

    state.players.forEach(function (p) {
      var el = document.createElement("div");
      el.className = "pin";
      el.textContent = inicial(p.nome);
      el.title = p.nome;
      el.style.setProperty("--c", p.cor);
      board.appendChild(el);
      p.el = el;
    });

    state.atual = 0;
    state.ocupado = false;
    state.fim = false;
    state.deck = [];

    $("setup").classList.add("hidden");
    $("game").classList.remove("hidden");
    $("log").innerHTML = "";
    $("btn-roll").disabled = false;

    renderDado(0);
    renderPinos();
    renderJogadores();
    renderVez();
    registrar("Partida começou! Todos largam na casa 1 e correm no sentido contrário.", "sistema");
  }

  async function jogarTurno() {
    if (state.ocupado || state.fim || !state.players.length) return;
    state.ocupado = true;
    $("btn-roll").disabled = true;

    var gen = state.geracao;
    var p = state.players[state.atual];
    var dado = $("dice");

    dado.classList.add("rolling");
    var t0 = Date.now();
    while (Date.now() - t0 < 620) {
      renderDado(1 + Math.floor(Math.random() * 6));
      await sleep(70);
    }
    var valor = 1 + Math.floor(Math.random() * 6);
    renderDado(valor);
    dado.classList.remove("rolling");
    registrar(p.nome + " rolou " + valor + ".", p);
    await sleep(200);
    if (gen !== state.geracao) return;

    var alvo = Math.min(p.pos + valor, ULTIMA);
    var caminho = [];
    for (var i = p.pos + 1; i <= alvo; i++) caminho.push(i);

    for (var k = 0; k < caminho.length; k++) {
      p.pos = caminho[k];
      renderPinos();
      renderJogadores();
      await sleep(PASSO_MS);
      if (gen !== state.geracao) return;
    }

    if (p.pos === ULTIMA) {
      vencer(p);
    } else {
      await resolverEncontro(p, caminho);
      if (gen !== state.geracao) return;
    }

    if (!state.fim) {
      passarVez();
      state.ocupado = false;
      $("btn-roll").disabled = false;
    } else {
      state.ocupado = false;
    }
  }

  async function resolverEncontro(p, caminho) {
    var outros = state.players.filter(function (o) { return o !== p; });
    var alvo = null;
    var verbo = "";

    for (var i = 0; i < outros.length; i++) {
      if (outros[i].pos === p.pos) {
        alvo = outros[i];
        verbo = "encontrou";
        break;
      }
    }

    if (!alvo) {
      var cruzados = outros.filter(function (o) { return caminho.indexOf(o.pos) !== -1; });
      if (cruzados.length) {
        cruzados.sort(function (a, b) { return b.pos - a.pos; });
        alvo = cruzados[0];
        verbo = "cruzou com";
      }
    }

    if (!alvo) return;

    registrar(p.nome + " " + verbo + " " + alvo.nome + " na casa " + (p.pos + 1) + "! Charada valendo.", "evento");
    await duelo(p, alvo);
  }

  async function duelo(atacante, defensor) {
    var gen = state.geracao;
    var acertouAtacante = await perguntarCharada(atacante, "Encontro com " + defensor.nome);
    if (gen !== state.geracao) return;

    if (acertouAtacante) {
      registrar(atacante.nome + " acertou a charada e passa.", atacante);
    } else {
      registrar(atacante.nome + " errou e volta 5 casas.", atacante);
      await recuar(atacante, 5);
      if (gen !== state.geracao) return;
    }

    var acertouDefensor = await perguntarCharada(defensor, "Encontro com " + atacante.nome);
    if (gen !== state.geracao) return;

    if (acertouDefensor) {
      registrar(defensor.nome + " acertou a charada e passa.", defensor);
    } else {
      registrar(defensor.nome + " errou e volta 5 casas.", defensor);
      await recuar(defensor, 5);
    }
  }

  async function recuar(p, casas) {
    var destino = Math.max(0, p.pos - casas);
    while (p.pos > destino) {
      p.pos -= 1;
      renderPinos();
      renderJogadores();
      await sleep(90);
      if (state.fim) return;
    }
  }

  function perguntarCharada(jogador, contexto) {
    return new Promise(function (resolve) {
      var dlg = $("riddle-dialog");
      var who = $("riddle-who");
      var wrap = $("riddle-options");
      var fb = $("riddle-feedback");
      var bar = $("timer-bar");

      if (!state.deck.length) state.deck = baralhar(window.CHARADAS);
      var charada = state.deck.pop();
      var opcoes = baralhar(charada.o.map(function (t, i) {
        return { t: t, ok: i === charada.c };
      }));

      who.textContent = jogador.nome;
      who.style.setProperty("--c", jogador.cor);
      $("riddle-kind").textContent = contexto;
      $("riddle-q").textContent = charada.p;
      fb.textContent = "";
      fb.className = "riddle-feedback";
      wrap.innerHTML = "";

      var respondido = false;
      var timer = 0;

      function encerrar(escolha) {
        if (respondido) return;
        respondido = true;
        clearTimeout(timer);

        var total = bar.parentElement.getBoundingClientRect().width || 1;
        var atual = bar.getBoundingClientRect().width;
        bar.style.transition = "none";
        bar.style.width = ((atual / total) * 100) + "%";

        var acertou = !!(escolha && escolha.ok);

        Array.prototype.forEach.call(wrap.children, function (btn) {
          btn.disabled = true;
          if (btn.dataset.ok === "1") btn.classList.add("correct");
          if (escolha && btn === escolha.btn && !acertou) btn.classList.add("wrong");
        });

        if (acertou) {
          fb.textContent = "Acertou! O pininho passa.";
          fb.classList.add("ok");
        } else {
          fb.textContent =
            (escolha ? "Errou." : "Tempo esgotado!") +
            " A resposta era “" + charada.o[charada.c] + "”. Volta 5 casas.";
          fb.classList.add("err");
        }

        setTimeout(function () {
          if (dlg.open) dlg.close();
          resolve(acertou);
        }, 1900);
      }

      opcoes.forEach(function (op, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option";
        btn.dataset.ok = op.ok ? "1" : "0";

        var key = document.createElement("span");
        key.className = "key";
        key.textContent = "ABCD".charAt(i);

        var txt = document.createElement("span");
        txt.textContent = op.t;

        btn.appendChild(key);
        btn.appendChild(txt);
        btn.addEventListener("click", function () {
          encerrar({ btn: btn, ok: op.ok });
        });
        wrap.appendChild(btn);
      });

      bar.style.transition = "none";
      bar.style.width = "100%";
      void bar.offsetWidth;
      bar.style.transition = "width " + TEMPO_CHARADA + "s linear";
      bar.style.width = "0%";
      timer = setTimeout(function () { encerrar(null); }, TEMPO_CHARADA * 1000 + 60);

      dlg.oncancel = function (e) { e.preventDefault(); };
      if (!dlg.open) dlg.showModal();
    });
  }

  function vencer(p) {
    state.fim = true;
    state.ocupado = false;
    registrar(p.nome + " chegou na meta e venceu o Dulu!", "evento");
    $("win-name").textContent = p.nome;
    $("win-msg").textContent = p.nome + " completou a trilha ao contrário e venceu a partida.";
    $("btn-roll").disabled = true;
    renderPinos();
    renderJogadores();
    if (!$("win-dialog").open) $("win-dialog").showModal();
  }

  function passarVez() {
    state.atual = (state.atual + 1) % state.players.length;
    renderPinos();
    renderJogadores();
    renderVez();
  }

  function novaPartida() {
    state.geracao = (state.geracao || 0) + 1;
    state.fim = true;
    state.ocupado = false;

    ["riddle-dialog", "win-dialog", "help-dialog"].forEach(function (id) {
      var d = $(id);
      if (d && d.open) d.close();
    });

    board.querySelectorAll(".pin").forEach(function (el) { el.remove(); });

    state.players = [];
    state.atual = 0;
    state.deck = [];
    $("log").innerHTML = "";
    $("game").classList.add("hidden");
    $("setup").classList.remove("hidden");
    renderDado(0);
    renderJogadores();
    atualizarDica();
  }

  /* ---------- eventos ---------- */

  $("btn-start").addEventListener("click", iniciarPartida);
  $("btn-roll").addEventListener("click", jogarTurno);
  $("btn-new").addEventListener("click", novaPartida);
  $("btn-help").addEventListener("click", function () { $("help-dialog").showModal(); });
  $("btn-help-close").addEventListener("click", function () { $("help-dialog").close(); });
  $("btn-win-new").addEventListener("click", function () {
    $("win-dialog").close();
    novaPartida();
  });

  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space") return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
    if (document.querySelector("dialog[open]")) return;
    if ($("game").classList.contains("hidden") || state.ocupado || state.fim) return;
    e.preventDefault();
    jogarTurno();
  });

  /* ---------- início ---------- */

  montarTabuleiro();
  montarConfiguracao();
  renderDado(0);
  renderJogadores();
})();

