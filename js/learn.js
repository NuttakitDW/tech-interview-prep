/* Learn view: renders modules, concept cards, and the navigation rail. */
(function (P) {
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderBlock(block) {
    if (block.p) return '<p>' + block.p + '</p>';

    if (block.list) {
      return '<ul>' + block.list.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    }

    if (block.note) {
      return (
        '<div class="note"><span class="lbl">Watch out</span>' +
        block.note.map(function (i) { return '<p>' + i + '</p>'; }).join('') +
        '</div>'
      );
    }

    /* The transfer: what this mechanism is worth away from the platform
       it came from. Always the last block on a card, just above the answer. */
    if (block.bridge) {
      return (
        '<div class="bridge"><span class="lbl">Carry it into their product</span>' +
        block.bridge.map(function (i) { return '<p>' + i + '</p>'; }).join('') +
        '</div>'
      );
    }

    /* A diagram you can run. The host is filled in by js/sim.js after the
       module HTML lands; without that file it stays an empty figure. */
    if (block.sim) {
      var sim = (P.sims && P.sims[block.sim]) || {};
      return (
        '<figure class="diagram diagram--sim">' +
        '<span class="lbl">' + (block.caption || sim.caption || 'Run it') + '</span>' +
        '<div data-sim="' + block.sim + '"></div>' +
        '</figure>'
      );
    }

    if (block.diagram) {
      return (
        '<figure class="diagram"><span class="lbl">' + (block.caption || 'The model') + '</span>' +
        '<pre>' + esc(block.diagram) + '</pre></figure>'
      );
    }

    /* Collapsed-by-default panels: one container per row, each with a drawn
       model and the cases it is actually for. Native <details> so keyboard
       and screen readers work without any state of ours. */
    if (block.structures) {
      var panels = block.structures
        .map(function (s) {
          var costs = s.cost
            .map(function (c) {
              return '<span class="cost">' + c[0] + ' <b>' + c[1] + '</b></span>';
            })
            .join('');

          var uses = s.use.map(function (u) { return '<li>' + u + '</li>'; }).join('');

          return (
            '<details class="ds__item"><summary>' +
            '<code>' + s.name + '</code>' +
            '<span class="ds__kind">' + s.kind + '</span>' +
            '<span class="ds__costs">' + costs + '</span>' +
            '</summary><div class="ds__body">' +
            '<pre class="ds__viz">' + esc(s.diagram) + '</pre>' +
            '<div class="ds__use"><span class="lbl">Reach for it when</span><ul>' + uses + '</ul></div>' +
            '<p class="ds__not"><span class="lbl">Something else when</span>' + s.not + '</p>' +
            '</div></details>'
          );
        })
        .join('');

      return (
        '<div class="ds"><div class="ds__bar">' +
        '<span class="lbl">' + block.structures.length + ' containers &mdash; open one to see how it is laid out</span>' +
        '<button type="button" class="ds__all" data-act="ds-all">Open all</button>' +
        '</div>' + panels + '</div>'
      );
    }

    if (block.code) {
      return (
        '<pre data-lang="' + block.code.lang + '"><code>' +
        P.highlight(block.code.src, block.code.lang) +
        '</code></pre>'
      );
    }

    return '';
  }

  function clock(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + pad(s);
  }

  /* Deep links into video, at the second the thing is explained.

     `watch` is a plain number of seconds into the page's own PREP.source,
     or {v, t, l} to point somewhere else, or an array to offer several —
     a card can be asked in one video and explained better in another. */
  function watchLink(spec) {
    var v = spec.v || (P.source && P.source.v);
    if (!v || spec.t == null) return '';

    return (
      '<a class="watch" href="https://www.youtube.com/watch?v=' + v + '&t=' + spec.t + 's"' +
      ' target="_blank" rel="noopener noreferrer">' +
      '<span>' + (spec.l || 'Hear it asked') + '</span>' +
      '<time class="num">' + clock(spec.t) + '</time>' +
      '</a>'
    );
  }

  /* The same idea for a written source: a section anchor on PREP.article,
     or {u, l} for somewhere else entirely. */
  function readLink(spec) {
    var u = spec.u || (P.article && P.article.u && P.article.u + '#' + spec.at);
    if (!u) return '';

    return (
      '<a class="watch watch--read" href="' + u + '"' +
      ' target="_blank" rel="noopener noreferrer">' +
      '<span>' + (spec.l || 'Read the section') + '</span>' +
      '</a>'
    );
  }

  function renderWatch(concept) {
    if (concept.watch == null && concept.read == null) return '';

    var links = [].concat(concept.watch || [])
      .map(function (w) { return typeof w === 'number' ? { t: w } : w; })
      .map(watchLink)
      .concat(
        [].concat(concept.read || [])
          .map(function (r) { return typeof r === 'string' ? { at: r } : r; })
          .map(readLink)
      )
      .join('');

    return links ? '<div class="watch__row">' + links + '</div>' : '';
  }

  function renderConcept(concept, index) {
    var tags = (concept.tags || [])
      .map(function (t) {
        return '<span class="tag">' + (t === 'hot' ? 'asked often' : t) + '</span>';
      })
      .join('');

    var traps = concept.traps
      ? '<div class="trap"><span class="lbl">Where candidates lose it</span><ul>' +
        concept.traps.map(function (t) { return '<li>' + t + '</li>'; }).join('') +
        '</ul></div>'
      : '';

    var refs = (P.refs && P.refs[concept.id]) || [];
    var sources = refs.length
      ? '<div class="src"><span class="lbl">Check it yourself</span><ul>' +
        refs
          .map(function (r) {
            return (
              '<li><a href="' + r.u + '" target="_blank" rel="noopener noreferrer">' +
              r.t + '</a></li>'
            );
          })
          .join('') +
        '</ul></div>'
      : '';

    return (
      '<article class="concept" id="' + concept.id + '">' +
      '<div class="concept__head">' +
      '<span class="concept__idx">' + pad(index + 1) + '</span>' +
      '<h3>' + concept.title + '</h3>' +
      '<span class="concept__tags">' + tags + '</span>' +
      '</div>' +
      '<p class="ask">' + concept.ask + '</p>' +
      renderWatch(concept) +
      '<div class="concept__body">' + concept.body.map(renderBlock).join('') + '</div>' +
      '<div class="say"><span class="lbl">Say this out loud</span><p>' + concept.say + '</p></div>' +
      traps +
      sources +
      '</article>'
    );
  }

  function renderModule(mod) {
    return (
      '<section class="module" id="mod-' + mod.id + '">' +
      '<header class="module__head">' +
      '<span class="lbl">' + mod.kicker + ' &nbsp;/&nbsp; ' + mod.concepts.length + ' concepts</span>' +
      '<h2>' + mod.title + '</h2>' +
      '<p class="module__blurb">' + mod.blurb + '</p>' +
      '</header>' +
      mod.concepts.map(renderConcept).join('') +
      '</section>'
    );
  }

  function renderRail(modules) {
    return modules
      .map(function (mod) {
        var links = mod.concepts
          .map(function (c, i) {
            return (
              '<a href="#' + c.id + '" data-target="' + c.id + '">' +
              '<span class="num">' + pad(i + 1) + '</span>' +
              '<span>' + c.title + '</span></a>'
            );
          })
          .join('');

        return (
          '<div class="rail__group">' +
          '<a class="rail__head lbl" href="#mod-' + mod.id + '">' + mod.title + '</a>' +
          '<div class="rail__list">' + links + '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  var observer = null;

  function spy(root) {
    if (observer) observer.disconnect();

    var links = {};
    root.rail.querySelectorAll('a[data-target]').forEach(function (a) {
      links[a.getAttribute('data-target')] = a;
    });

    var visible = new Set();

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });

        var ids = Object.keys(links);
        var active = ids.find(function (id) { return visible.has(id); });

        ids.forEach(function (id) {
          links[id].classList.toggle('is-active', id === active);
        });

        if (active && window.innerWidth > 960) {
          var el = links[active];
          var box = root.rail.getBoundingClientRect();
          var pos = el.getBoundingClientRect();
          if (pos.top < box.top || pos.bottom > box.bottom) {
            el.scrollIntoView({ block: 'nearest' });
          }
        }
      },
      { rootMargin: '-84px 0px -55% 0px' }
    );

    root.modules.querySelectorAll('.concept').forEach(function (c) {
      observer.observe(c);
    });
  }

  P.renderLearn = function (track) {
    var mods = P.modules.filter(function (m) { return m.track === track; });
    var root = { rail: document.getElementById('rail'), modules: document.getElementById('modules') };

    root.rail.innerHTML = renderRail(mods);
    root.modules.innerHTML = mods.map(renderModule).join('');

    root.modules.querySelectorAll('.module').forEach(function (el, i) {
      el.classList.add('rise');
      el.style.animationDelay = i * 70 + 'ms';
    });

    root.modules.querySelectorAll('.ds').forEach(function (group) {
      var btn = group.querySelector('[data-act="ds-all"]');
      btn.addEventListener('click', function () {
        var items = group.querySelectorAll('details');
        var opening = btn.textContent === 'Open all';
        items.forEach(function (d) { d.open = opening; });
        btn.textContent = opening ? 'Close all' : 'Open all';
      });
      group.addEventListener('toggle', function () {
        var items = group.querySelectorAll('details');
        var open = group.querySelectorAll('details[open]').length;
        btn.textContent = open === items.length ? 'Close all' : 'Open all';
      }, true);
    });

    if (P.mountSims) P.mountSims(root.modules);

    spy(root);

    return mods.reduce(function (n, m) { return n + m.concepts.length; }, 0);
  };
})(window.PREP);
