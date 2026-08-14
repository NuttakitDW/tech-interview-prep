/* Minimal, dependency-free syntax colouring for the code samples.
   Deliberately small: comments, strings, numbers, keywords, call names. */
(function (P) {
  var KEYWORDS = {
    python:
      'False None True and as assert async await break class continue def del elif else ' +
      'except finally for from global if import in is lambda nonlocal not or pass raise ' +
      'return try while with yield self cls',
    js:
      'const let var function return if else for while do break continue new class extends ' +
      'import export default from as async await try catch finally throw typeof instanceof ' +
      'in of delete void this super null undefined true false switch case yield static get set'
  };
  KEYWORDS.jsx = KEYWORDS.js;
  KEYWORDS.ts = KEYWORDS.js + ' interface type enum implements readonly public private declare';

  function escapeHtml(src) {
    return src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function build(lang) {
    var words = (KEYWORDS[lang] || KEYWORDS.python).split(' ').join('|');
    return new RegExp(
      '(#[^\\n]*|\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +      // 1 comment
        "|('(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\")" + // 2 string
        '|\\b(\\d+\\.?\\d*)\\b' +                                // 3 number
        '|\\b(' + words + ')\\b' +                               // 4 keyword
        '|\\b([A-Za-z_]\\w*)(?=\\()',                            // 5 call
      'g'
    );
  }

  var cache = {};

  /* "# => [1, 2]" is a result the reader must see, not an aside.
     Escaping has already run, so the arrow arrives as "=&gt;". */
  var OUTPUT = /^(#|\/\/)\s*=(>|&gt;)/;

  P.highlight = function (src, lang) {
    if (lang === 'text') return escapeHtml(src);

    var re = cache[lang] || (cache[lang] = build(lang));
    re.lastIndex = 0;
    return escapeHtml(src).replace(re, function (m, com, str, num, kw, fn) {
      if (com) {
        return '<span class="' + (OUTPUT.test(com) ? 't-out' : 't-com') + '">' + com + '</span>';
      }
      if (str) return '<span class="t-str">' + str + '</span>';
      if (num) return '<span class="t-num">' + num + '</span>';
      if (kw) return '<span class="t-key">' + kw + '</span>';
      if (fn) return '<span class="t-fn">' + fn + '</span>';
      return m;
    });
  };
})(window.PREP);
