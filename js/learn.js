/* Learn view: renders modules, concept cards, and the navigation rail. */
(function (P) {
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

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

    if (block.diagram) {
      return (
        '<figure class="diagram"><span class="lbl">' + (block.caption || 'The model') + '</span>' +
        '<pre>' + block.diagram.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></figure>'
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

    spy(root);

    return mods.reduce(function (n, m) { return n + m.concepts.length; }, 0);
  };
})(window.PREP);
