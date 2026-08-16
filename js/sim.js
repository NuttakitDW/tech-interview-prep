/* Step-through player for the diagrams that are really machines.

   The frames in data/sim-*.js record only what changed, so the first job
   here is to expand them into full snapshots. After that this is a plain
   index into an array: Step moves forward one, Play moves forward on a
   timer, Reset goes home. No state lives anywhere but `at`. */
(function (P) {
  var PHASES = [
    { id: 'task', n: '1', l: 'Run one task' },
    { id: 'drain', n: '2', l: 'Drain microtasks' },
    { id: 'render', n: '3', l: 'Render' }
  ];

  var FIELDS = ['phase', 'line', 'stack', 'web', 'micro', 'macro', 'out', 'note'];

  var TICK = 1400;

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Each frame inherits every field it does not set from the frame before. */
  function expand(frames) {
    var full = [];
    frames.forEach(function (f, i) {
      var prev = i
        ? full[i - 1]
        : { phase: 'task', line: null, stack: [], web: [], micro: [], macro: [], out: [], note: '' };
      var next = {};
      FIELDS.forEach(function (k) {
        next[k] = Object.prototype.hasOwnProperty.call(f, k) ? f[k] : prev[k];
      });
      full.push(next);
    });
    return full;
  }

  function queue(items, prev, empty) {
    if (!items.length) return '<li class="sim__empty">' + empty + '</li>';

    return items
      .map(function (label) {
        var fresh = prev.indexOf(label) < 0 ? ' is-new' : '';
        return '<li class="sim__item' + fresh + '">' + esc(label) + '</li>';
      })
      .join('');
  }

  function build(host, sim) {
    var runs = sim.runs;
    var run = runs[0];
    var frames = expand(run.frames);
    var at = 0;
    var timer = null;

    host.innerHTML =
      '<div class="sim">' +
      '<div class="sim__bar">' +
      '<div class="seg sim__runs">' +
      runs
        .map(function (r, i) {
          return (
            '<button type="button" data-run="' + r.id + '"' +
            ' aria-selected="' + (i === 0) + '">' + r.label + '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="sim__ctl">' +
      '<button type="button" class="sim__btn" data-act="play">Play</button>' +
      '<button type="button" class="sim__btn" data-act="step">Step</button>' +
      '<button type="button" class="sim__btn" data-act="reset">Reset</button>' +
      '<span class="sim__count num" data-el="count"></span>' +
      '</div>' +
      '</div>' +

      '<p class="sim__blurb" data-el="blurb"></p>' +

      '<div class="sim__grid">' +
      '<ol class="sim__code" data-el="code"></ol>' +

      '<div class="sim__panes">' +
      '<div class="sim__pane sim__pane--stack">' +
      '<span class="lbl">Call stack &mdash; last in, first out</span>' +
      '<ul data-el="stack"></ul>' +
      '</div>' +
      '<div class="sim__pane sim__pane--web">' +
      '<span class="lbl">Browser &mdash; where waiting happens</span>' +
      '<ul data-el="web"></ul>' +
      '</div>' +
      '<div class="sim__pane sim__pane--micro">' +
      '<span class="lbl">Microtask queue</span>' +
      '<ul data-el="micro"></ul>' +
      '</div>' +
      '<div class="sim__pane sim__pane--macro">' +
      '<span class="lbl">Task queue</span>' +
      '<ul data-el="macro"></ul>' +
      '</div>' +
      '</div>' +
      '</div>' +

      '<div class="sim__phases" data-el="phases">' +
      PHASES.map(function (p) {
        return (
          '<span class="sim__phase" data-phase="' + p.id + '">' +
          '<b class="num">' + p.n + '</b>' + p.l + '</span>'
        );
      }).join('<span class="sim__arrow" aria-hidden="true">&rarr;</span>') +
      '</div>' +

      '<p class="sim__note" data-el="note" role="status"></p>' +

      '<div class="sim__out">' +
      '<span class="lbl">Console</span>' +
      '<ul data-el="out"></ul>' +
      '</div>' +
      '</div>';

    var el = {};
    host.querySelectorAll('[data-el]').forEach(function (n) { el[n.dataset.el] = n; });

    function paintCode() {
      el.code.innerHTML = run.code
        .map(function (src) {
          return '<li><code>' + esc(src) + '</code></li>';
        })
        .join('');
      el.blurb.innerHTML = run.blurb;
    }

    function draw() {
      var f = frames[at];
      var prev = at ? frames[at - 1] : { stack: [], web: [], micro: [], macro: [], out: [] };

      el.stack.innerHTML = queue(f.stack.slice().reverse(), prev.stack, 'empty');
      el.web.innerHTML = queue(f.web, prev.web, 'nothing pending');
      el.micro.innerHTML = queue(f.micro, prev.micro, 'empty');
      el.macro.innerHTML = queue(f.macro, prev.macro, 'empty');

      el.out.innerHTML = f.out.length
        ? f.out
            .map(function (line, i) {
              var fresh = i >= prev.out.length ? ' is-new' : '';
              return '<li class="' + fresh.trim() + '">' + esc(line) + '</li>';
            })
            .join('')
        : '<li class="sim__empty">nothing printed yet</li>';

      el.code.querySelectorAll('li').forEach(function (li, i) {
        li.classList.toggle('is-on', i === f.line);
      });

      /* 'frozen' is the render step that never arrives, so it highlights the
         drain phase and marks the strip rather than lighting a fourth box. */
      var active = f.phase === 'frozen' ? 'drain' : f.phase;
      el.phases.classList.toggle('is-frozen', f.phase === 'frozen');
      el.phases.querySelectorAll('.sim__phase').forEach(function (n) {
        n.classList.toggle('is-on', n.dataset.phase === active);
      });

      el.note.innerHTML = f.note;
      el.count.textContent = (at + 1) + ' / ' + frames.length;

      host.querySelector('[data-act="step"]').disabled = at >= frames.length - 1;
    }

    function go(i) {
      at = Math.max(0, Math.min(frames.length - 1, i));
      draw();
      if (at >= frames.length - 1) stop();
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
      host.querySelector('[data-act="play"]').textContent = 'Play';
    }

    function play() {
      if (timer) return stop();
      if (at >= frames.length - 1) at = 0;
      host.querySelector('[data-act="play"]').textContent = 'Pause';
      draw();
      timer = setInterval(function () { go(at + 1); }, TICK);
    }

    host.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;

      if (b.dataset.run) {
        if (b.dataset.run === run.id) return;
        stop();
        run = runs.find(function (r) { return r.id === b.dataset.run; });
        frames = expand(run.frames);
        at = 0;
        host.querySelectorAll('[data-run]').forEach(function (n) {
          n.setAttribute('aria-selected', String(n === b));
        });
        paintCode();
        draw();
        return;
      }

      if (b.dataset.act === 'step') go(at + 1);
      if (b.dataset.act === 'reset') { stop(); go(0); }
      if (b.dataset.act === 'play') play();
    });

    /* A simulator running in a section nobody is looking at is just noise. */
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (!en.isIntersecting) stop(); });
      }, { threshold: 0 }).observe(host);
    }

    paintCode();
    draw();
  }

  P.mountSims = function (root) {
    root.querySelectorAll('[data-sim]').forEach(function (host) {
      var sim = P.sims && P.sims[host.dataset.sim];
      if (!sim || host.dataset.mounted) return;
      host.dataset.mounted = '1';
      build(host, sim);
    });
  };
})(window.PREP);
