/* Quiz view: setup, one-question-at-a-time run, scored review. */
(function (P) {
  var KEYS = ['A', 'B', 'C', 'D', 'E'];
  var STORE = 'prep.best.v1';

  var state = {
    scope: 'all',
    runScope: 'all',
    length: 12,
    deck: [],
    at: 0,
    answers: [],
    locked: false
  };

  function moduleTitle(id) {
    var m = P.modules.find(function (x) { return x.id === id; });
    return m ? m.title : id;
  }

  function shuffle(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /* Shuffle the choices too, and follow the correct answer to its new index. */
  function prepare(q) {
    var order = shuffle(q.choices.map(function (_, i) { return i; }));
    return {
      ref: q,
      text: q.q,
      module: q.module,
      why: q.why,
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(q.a)
    };
  }

  function best() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveBest(scope, pct) {
    try {
      var all = best();
      if (!all[scope] || pct > all[scope]) {
        all[scope] = pct;
        localStorage.setItem(STORE, JSON.stringify(all));
      }
    } catch (e) {
      /* storage unavailable — scores just are not persisted */
    }
  }

  function pool(scope) {
    return scope === 'all'
      ? P.quiz
      : P.quiz.filter(function (q) { return q.track === scope; });
  }

  /* Scope choices follow the page's tracks. "Everything" only means something
     when there is more than one track to combine. */
  function scopeOptions() {
    var tracks = (P.tracks && P.tracks.length)
      ? P.tracks
      : [{ v: 'backend', l: 'Backend' }, { v: 'frontend', l: 'Frontend' }];

    var options = tracks.map(function (t) { return { v: t.v, l: t.l }; });
    if (options.length > 1) options.push({ v: 'all', l: 'Everything' });
    return options;
  }

  /* ---------------- setup ---------------- */

  function seg(name, value, options) {
    return (
      '<div class="seg" role="tablist">' +
      options
        .map(function (o) {
          return (
            '<button role="tab" data-set="' + name + '" data-value="' + o.v + '"' +
            ' aria-selected="' + (String(o.v) === String(value)) + '">' + o.l + '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function renderSetup() {
    var total = pool(state.scope).length;
    var record = best()[state.scope];
    var scopes = scopeOptions();

    return (
      '<div class="panel rise">' +
      '<span class="lbl">Quiz</span>' +
      '<h2 style="margin:.6rem 0 1.4rem">Prove you can <em>recall</em> it</h2>' +
      (scopes.length > 1
        ? '<div class="setup__row"><span class="lbl">Scope</span>' +
          seg('scope', state.scope, scopes) +
          '</div>'
        : '') +
      '<div class="setup__row"><span class="lbl">Length</span>' +
      seg('length', state.length, [
        { v: 8, l: '8' },
        { v: 12, l: '12' },
        { v: 20, l: '20' },
        { v: 999, l: 'All ' + total }
      ]) +
      '</div>' +
      '<div class="setup__row" style="justify-content:space-between">' +
      '<span class="hint">' + total + ' questions in the bank' +
      (record ? ' &nbsp;/&nbsp; best <span class="num">' + record + '%</span>' : '') +
      '</span>' +
      '<button class="btn" data-act="start">Begin</button>' +
      '</div>' +
      '</div>'
    );
  }

  /* ---------------- question ---------------- */

  function renderQuestion() {
    var q = state.deck[state.at];
    var given = state.answers[state.at];
    var done = given !== undefined;
    var pct = Math.round((state.at / state.deck.length) * 100);

    var choices = q.choices
      .map(function (text, i) {
        var cls = 'choice';
        if (done) {
          if (i === q.answer) cls += ' is-right';
          else if (i === given) cls += ' is-wrong';
        }
        return (
          '<button class="' + cls + '" data-act="answer" data-i="' + i + '"' +
          (done ? ' disabled' : '') + '>' +
          '<span class="choice__k">' + KEYS[i] + '</span><span>' + text + '</span></button>'
        );
      })
      .join('');

    var verdict = '';
    if (done) {
      var ok = given === q.answer;
      verdict =
        '<div class="verdict ' + (ok ? 'ok' : 'no') + '">' +
        '<span class="lbl">' + (ok ? 'Correct' : 'Not quite') + '</span>' +
        '<p>' + q.why + '</p></div>';
    }

    var last = state.at === state.deck.length - 1;

    return (
      '<div class="panel">' +
      '<div class="qbar">' +
      '<span class="num">' + (state.at + 1) + ' / ' + state.deck.length + '</span>' +
      '<span class="qbar__track"><span class="qbar__fill" style="width:' + pct + '%"></span></span>' +
      '<span class="num">' + state.answers.filter(function (a, i) {
        return a === state.deck[i].answer;
      }).length + ' right</span>' +
      '</div>' +
      '<span class="q__source">' + moduleTitle(q.module) + '</span>' +
      '<p class="q__text">' + q.text + '</p>' +
      '<div class="choices">' + choices + '</div>' +
      verdict +
      '<div class="qfoot">' +
      '<span class="hint">Press <kbd>1</kbd>&ndash;<kbd>4</kbd> to answer, <kbd>Enter</kbd> to continue</span>' +
      (done
        ? '<button class="btn" data-act="next">' + (last ? 'See results' : 'Next') + '</button>'
        : '<button class="btn" disabled>Next</button>') +
      '</div>' +
      '</div>'
    );
  }

  /* ---------------- results ---------------- */

  function renderResults() {
    var right = state.answers.filter(function (a, i) { return a === state.deck[i].answer; }).length;
    var pct = Math.round((right / state.deck.length) * 100);
    saveBest(state.runScope, pct);

    var verdict =
      pct >= 90 ? 'Interview-ready. Go deeper on trade-offs and war stories.'
        : pct >= 70 ? 'Solid base. Close the gaps below before the call.'
          : pct >= 50 ? 'The shape is there; the detail is not. Re-read the flagged modules.'
            : 'Back to the learning track. Read first, quiz second.';

    var byModule = {};
    state.deck.forEach(function (q, i) {
      var m = byModule[q.module] || (byModule[q.module] = { n: 0, ok: 0 });
      m.n += 1;
      if (state.answers[i] === q.answer) m.ok += 1;
    });

    var breakdown = Object.keys(byModule)
      .map(function (id) {
        var m = byModule[id];
        var p = Math.round((m.ok / m.n) * 100);
        var cls = p >= 75 ? '' : p >= 50 ? ' mid' : ' low';
        return (
          '<div class="brow">' +
          '<span class="brow__name">' + moduleTitle(id) + '</span>' +
          '<span class="brow__bar"><span class="brow__fill' + cls + '" style="width:' + p + '%"></span></span>' +
          '<span class="brow__n">' + m.ok + '/' + m.n + '</span>' +
          '</div>'
        );
      })
      .join('');

    var misses = state.deck
      .map(function (q, i) {
        if (state.answers[i] === q.answer) return '';
        return (
          '<div class="miss">' +
          '<p class="miss__q">' + q.text + '</p>' +
          '<p class="miss__a"><b>' + q.choices[q.answer] + '</b> &mdash; ' + q.why + '</p>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="panel rise">' +
      '<div class="score">' +
      '<div class="score__n">' + pct + '<small>%</small></div>' +
      '<div class="score__verdict">' + verdict + '</div>' +
      '<p class="hint" style="margin-top:.7rem">' + right + ' of ' + state.deck.length + ' correct</p>' +
      '</div>' +
      '<div class="breakdown"><span class="lbl">By module</span>' + breakdown + '</div>' +
      (misses ? '<div class="misses"><span class="lbl">Review these</span>' + misses + '</div>' : '') +
      '<div class="qfoot">' +
      '<button class="btn btn--ghost" data-act="setup">Change scope</button>' +
      '<button class="btn" data-act="again">Run again</button>' +
      '</div>' +
      '</div>'
    );
  }

  /* ---------------- controller ---------------- */

  var screen = 'setup';
  var root;

  function draw() {
    root.innerHTML =
      screen === 'setup' ? renderSetup() : screen === 'run' ? renderQuestion() : renderResults();
  }

  function start() {
    var picked = shuffle(pool(state.scope)).slice(0, state.length);
    state.runScope = state.scope;
    state.deck = picked.map(prepare);
    state.answers = [];
    state.at = 0;
    screen = 'run';
    draw();
  }

  function answer(i) {
    if (state.answers[state.at] !== undefined) return;
    state.answers[state.at] = i;
    draw();
  }

  function next() {
    if (state.at < state.deck.length - 1) {
      state.at += 1;
      draw();
    } else {
      screen = 'results';
      draw();
      if (root.scrollIntoView) root.scrollIntoView({ block: 'start' });
    }
  }

  function onClick(event) {
    var el = event.target.closest('[data-act], [data-set]');
    if (!el) return;

    if (el.dataset.set) {
      var v = el.dataset.value;
      state[el.dataset.set] = el.dataset.set === 'length' ? Number(v) : v;
      draw();
      return;
    }

    var act = el.dataset.act;
    if (act === 'start' || act === 'again') start();
    else if (act === 'answer') answer(Number(el.dataset.i));
    else if (act === 'next') next();
    else if (act === 'setup') { screen = 'setup'; draw(); }
  }

  function onKey(event) {
    if (screen !== 'run' || document.getElementById('view-quiz').hidden) return;

    var n = KEYS.indexOf(event.key.toUpperCase());
    var idx = n >= 0 ? n : Number(event.key) - 1;

    if (idx >= 0 && idx < state.deck[state.at].choices.length) {
      answer(idx);
      event.preventDefault();
    } else if (event.key === 'Enter' && state.answers[state.at] !== undefined) {
      next();
      event.preventDefault();
    }
  }

  P.initQuiz = function () {
    state.scope = scopeOptions()[0].v;
    root = document.getElementById('quiz-root');
    root.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    draw();
  };

  /* Follows the learn track, but never disturbs a run in progress. */
  P.quizScope = function (track) {
    state.scope = track;
    if (root && screen === 'setup') draw();
  };
})(window.PREP);
