/* Boot: mode + track switching, hero stats, reading meter, deep links. */
(function (P) {
  /* A page declares its own tracks in the inline PREP bootstrap. A page with
     one track hides the switch rather than offering a choice of one. */
  var tracks = (P.tracks && P.tracks.length) ? P.tracks : [{ v: 'backend', l: 'Backend' }];

  var mode = 'learn';
  var track = tracks[0].v;

  var el = {};

  function trackOf(conceptId) {
    var found = null;
    P.modules.forEach(function (m) {
      m.concepts.forEach(function (c) {
        if (c.id === conceptId) found = m.track;
      });
    });
    return found;
  }

  /* Some browsers reject history writes on file:// — never let that break a click. */
  function setHash(value) {
    try {
      history.replaceState(null, '', '#' + value);
    } catch (e) {
      location.hash = value;
    }
  }

  function setSelected(group, value) {
    group.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.value === value));
    });
  }

  function applyMode() {
    el.viewLearn.hidden = mode !== 'learn';
    el.viewQuiz.hidden = mode !== 'quiz';
    if (tracks.length > 1) {
      el.trackGroup.style.visibility = mode === 'learn' ? 'visible' : 'hidden';
    }
    el.meter.hidden = mode !== 'learn';
    document.body.classList.toggle('is-quiz', mode === 'quiz');
    setSelected(el.modeGroup, mode);
  }

  function applyTrack(scrollTop) {
    setSelected(el.trackGroup, track);
    var count = P.renderLearn(track);
    el.statConcepts.textContent = count;
    el.statModules.textContent = P.modules.filter(function (m) { return m.track === track; }).length;
    el.statQuestions.textContent = P.quiz.filter(function (q) { return q.track === track; }).length;
    P.quizScope(track);
    if (scrollTop !== false) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function meter() {
    var doc = document.documentElement;
    var span = doc.scrollHeight - doc.clientHeight;
    var pct = span > 0 ? Math.min(100, Math.round((doc.scrollTop / span) * 100)) : 0;
    el.meterFill.style.width = pct + '%';
    el.meterNum.textContent = pct + '%';
  }

  function onHash(smooth) {
    var id = location.hash.slice(1);
    if (!id) return;

    if (id === 'quiz' || id === 'learn') {
      mode = id;
      applyMode();
      return;
    }

    var owner = trackOf(id.replace(/^mod-/, ''));
    if (!owner) {
      var mod = P.modules.find(function (m) { return 'mod-' + m.id === id; });
      owner = mod && mod.track;
    }
    if (!owner) return;

    if (mode !== 'learn') { mode = 'learn'; applyMode(); }
    if (owner !== track) { track = owner; applyTrack(false); }

    var node = document.getElementById(id);
    /* 'auto' would defer to the CSS scroll-behavior (smooth); 'instant' does not */
    if (node) node.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
  }

  function boot() {
    el = {
      viewLearn: document.getElementById('view-learn'),
      viewQuiz: document.getElementById('view-quiz'),
      modeGroup: document.getElementById('mode-switch'),
      trackGroup: document.getElementById('track-switch'),
      meter: document.getElementById('meter'),
      meterFill: document.getElementById('meter-fill'),
      meterNum: document.getElementById('meter-num'),
      statConcepts: document.getElementById('stat-concepts'),
      statModules: document.getElementById('stat-modules'),
      statQuestions: document.getElementById('stat-questions')
    };

    el.trackGroup.innerHTML = tracks
      .map(function (t, i) {
        return (
          '<button role="tab" data-value="' + t.v + '"' +
          ' aria-selected="' + (i === 0) + '">' + t.l + '</button>'
        );
      })
      .join('');
    if (tracks.length < 2) el.trackGroup.style.display = 'none';

    el.modeGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      mode = b.dataset.value;
      applyMode();
      setHash(mode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    el.trackGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.dataset.value === track) return;
      track = b.dataset.value;
      applyTrack();
    });

    window.addEventListener('scroll', meter, { passive: true });
    window.addEventListener('hashchange', function () { onHash(true); });

    applyMode();
    P.initQuiz();
    applyTrack(false);
    meter();

    /* Three webfonts land after first layout and move every anchor down the
       page, so the initial deep-link jump waits for them before measuring. */
    var jump = function () { onHash(false); };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(jump); });
    } else {
      jump();
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})(window.PREP);
