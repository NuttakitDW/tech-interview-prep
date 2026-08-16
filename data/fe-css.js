/* Front-end CSS track — the three questions that are still asked cold.
   Source: "Top 15 Frontend Interview Questions for 2026" (YouTube AMerB8XjfZ0,
   theSeniorDev). Questions 7, 8 and 9 of the fifteen.

   The box model card corrects the video on two points: outline and box-shadow
   are not boxes and take no space at all, and the video's account of
   box-sizing has content-box and border-box the wrong way round in places.
   Both are checked against MDN, linked on the card.

   The responsive card adds container queries, clamp() and intrinsic sizing.
   The video answers this question entirely with breakpoints and media queries,
   which was the right answer in 2018 and is an incomplete one now — container
   queries have been available in every major browser since early 2023. Added
   deliberately, and flagged as an addition rather than passed off as the
   video's. */
(function (P) {
  P.modules.push({
    id: 'fe-css',
    track: 'frontend-senior',
    title: 'CSS at senior depth',
    kicker: 'Module 03',
    blurb:
      'These get asked because so many people cannot answer them. Ten years of experience and a daily Tailwind habit is entirely compatible with never having learned what box-sizing does. The interviewer knows that, which is exactly why the question survives.',
    concepts: [
      {
        id: 'fe-boxmodel',
        title: 'Four boxes, and two things that are not boxes at all',
        tags: ['css', 'hot'],
        ask: 'Can you explain, at least at a high level, the CSS box model?',
        body: [
          { p: 'Every element the browser lays out is a rectangle, whatever it looks like on screen. A circle is a rectangle with a corner radius. The page is a set of nested rectangles.' },
          { p: 'Each element is made of four boxes, one inside the next:' },
          {
            diagram: `┌─────────────────────────────────────────────────┐
│  margin box                                     │   space pushed out
│   ┌─────────────────────────────────────────┐   │   against neighbours
│   │  border box                             │   │
│   │   ┌─────────────────────────────────┐   │   │   the visible edge
│   │   │  padding box                    │   │   │
│   │   │   ┌─────────────────────────┐   │   │   │   breathing room inside
│   │   │   │                         │   │   │   │   the border
│   │   │   │      content box        │   │   │   │
│   │   │   │                         │   │   │   │   the text or the image
│   │   │   └─────────────────────────┘   │   │   │
│   │   │                                 │   │   │
│   │   └─────────────────────────────────┘   │   │
│   │                                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘

  outline and box-shadow are painted OUTSIDE the border edge
  and occupy NO space in any of these boxes.`,
            caption: 'Content, padding, border, margin'
          },
          { p: 'That last line is the part people get wrong, and it is easy to check. <code>outline</code> takes up no room in the layout at all — MDN puts it plainly: outlines "don\'t take up space, so they don\'t affect the layout of the document in any way". It is painted outside the border edge, and <code>outline-offset</code> can push it further out or pull it in, overlapping the margin area without ever displacing anything.' },
          { p: 'That is precisely why <code>outline</code> is the right tool for a focus ring. Swap it for a <code>border</code> and every focused element grows by two pixels and shoves the page around. <code>box-shadow</code> behaves the same way: painted, not laid out.' },
          { p: 'So they are not a fifth and sixth box. They are decoration on top of the four.' },
          { p: 'The follow-up question is always <code>box-sizing</code>, and this is where the arithmetic has to be exact.' },
          {
            code: {
              lang: 'css',
              src: `/* content-box — the browser default */
.a {
  box-sizing: content-box;
  width: 160px;      /* this sizes the CONTENT box only */
  padding: 20px;     /* added on top */
  border: 8px solid; /* added on top */
}
/* rendered width = 160 + (2 x 20) + (2 x 8) = 216px */

/* border-box — what almost everyone actually wants */
.b {
  box-sizing: border-box;
  width: 160px;      /* this sizes CONTENT + PADDING + BORDER */
  padding: 20px;
  border: 8px solid;
}
/* rendered width = 160px. The content box shrinks to 104px. */`
            }
          },
          { p: 'Read it as: under <code>content-box</code>, <code>width</code> is a floor that padding and border are added to, and the element ends up bigger than the number you wrote. Under <code>border-box</code>, <code>width</code> is a ceiling that padding and border are subtracted from, and the element is exactly the number you wrote.' },
          { p: '<code>content-box</code> is the default, which is why nearly every codebase opens with:' },
          {
            code: {
              lang: 'css',
              src: `*, *::before, *::after { box-sizing: border-box; }`
            }
          },
          { p: 'And there is one exception built into the model that is worth knowing by name. <b>Margin collapsing</b>: two vertical margins that meet do not add up, they merge, and the larger one wins. A <code>32px</code> bottom margin meeting a <code>16px</code> top margin gives you <code>32px</code> of gap, not <code>48px</code>. It only applies to vertical margins in normal flow — inside flexbox or grid it does not happen at all, which is a large part of why layouts built with <code>gap</code> feel more predictable.' },
          {
            note: [
              '<b>Why this question survives in an AI-heavy interview.</b> Coding agents hardcode dimensions. Asked for a card, they will write <code>width: 300px</code>, and under the default <code>content-box</code> the thing renders wider than 300 and overflows its parent on a phone.',
              'The usual response is to add breakpoints and a second hardcoded width at each one. Now there are four numbers to keep in sync and the layout is fragile at every size in between.',
              'Knowing the box model is what lets you replace all of that with one declaration. It is also the fastest way to read a layout bug: open DevTools, look at the computed box diagram, and see which of the four boxes is the wrong size.'
            ]
          }
        ],
        say:
          'Everything in CSS is a rectangle, and each element is four nested boxes: content, then padding, then border, then margin. Outline and box-shadow are worth calling out separately because they are not boxes — they are painted outside the border edge and take no space at all, which is exactly why outline is the right thing for a focus ring; a border there would shift the layout every time something got focus. The follow-up is usually box-sizing. The default is content-box, where width sizes only the content and padding and border are added on top, so width 160 with 20 padding and an 8 border renders at 216. With border-box, width covers content plus padding plus border, so it renders at exactly 160 and the content shrinks instead. That is why most codebases set border-box globally. The exception I would mention is margin collapsing — adjacent vertical margins merge to the larger rather than adding, and it does not happen inside flex or grid.',
        traps: [
          'Putting <code>outline</code> or <code>box-shadow</code> inside the box model as a fifth layer. Neither occupies any space; both are painted outside the border edge.',
          'Getting <code>content-box</code> and <code>border-box</code> the wrong way round. Say the arithmetic out loud — 160 plus padding plus border is 216 under the default — and you cannot get it backwards.',
          'Saying <code>border-box</code> is the default because every project you have worked on set it globally. The browser default is <code>content-box</code>.',
          'Thinking adjacent margins add up. <code>32px</code> against <code>16px</code> is <code>32px</code>, not <code>48px</code> — and this is one of the few genuinely surprising rules in CSS.',
          'Expecting margins to collapse inside flexbox or grid. They do not. Only vertical margins in normal flow collapse.'
        ]
      },
      {
        id: 'fe-specificity',
        title: 'Specificity is a three-part tuple, not a number',
        tags: ['css'],
        ask: 'How does CSS specificity work?',
        body: [
          { p: 'When two rules set the same property on the same element, the browser has to pick one. Specificity is one step of that decision — not the whole thing, which matters, because there are things that beat it outright.' },
          { p: 'Every selector scores as three counters, conventionally written <code>A-B-C</code>:' },
          {
            code: {
              lang: 'text',
              src: `A   ids                       #checkout
B   classes, attributes,      .big  [type="text"]  :hover  :not(...)
    pseudo-classes
C   element types,            div  a  ::before
    pseudo-elements`
            }
          },
          { p: 'Take the example the question is usually built from:' },
          {
            code: {
              lang: 'css',
              src: `form.big-form { background-color: white; }   /* 0-1-1 */
#my-form      { background-color: blue;  }   /* 1-0-0 */`
            }
          },
          {
            code: {
              lang: 'text',
              src: `<form id="my-form" class="big-form"> ... </form>`
            }
          },
          { p: 'Score them. <code>form.big-form</code> has no id, one class and one element type, so <code>0-1-1</code>. <code>#my-form</code> has one id and nothing else, so <code>1-0-0</code>.' },
          { p: 'Now compare, and this is the part that has to be right: <b>you compare the columns left to right, and the first difference ends it.</b> A beats B beats C. <code>1</code> against <code>0</code> in the A column decides it immediately — the B and C columns are never read. The background is blue.' },
          { p: 'So it is <b>not base ten, and it does not add up</b>. Eleven classes score <code>0-11-0</code> and still lose to a single id at <code>1-0-0</code>. There is no number of classes that ever beats an id. That is the single most common misunderstanding of this topic.' },
          { p: 'If the tuples are genuinely identical, specificity has no answer, and the tie falls through to <b>source order</b> — the rule that appears later wins.' },
          { p: 'And specificity is only one round of a larger contest. In the order the browser actually applies:' },
          {
            diagram: `1  Origin and importance        author !important beats
                                 author normal; user and UA
                                 origins slot in around them
       │
2  Cascade layers               a later @layer beats an earlier
                                 one — regardless of specificity
       │
3  SPECIFICITY                  the A-B-C comparison above
       │
4  Source order                 last one wins

  Inline style="…"  scores above any selector.
  !important  jumps the whole contest — and inverts layer order,
              so an earlier layer's !important beats a later one's.`,
            caption: 'Specificity is step 3, not step 1'
          },
          { p: 'Which is why cascade layers are the modern answer to specificity fights. Rules in a later layer win over earlier layers whatever their selectors look like, so you can put a third-party stylesheet in one layer and your overrides in another and stop counting altogether.' },
          { p: 'Two selectors exist specifically to let you control the score:' },
          {
            code: {
              lang: 'css',
              src: `/* :where() always scores 0-0-0. Its contents contribute nothing. */
:where(.theme-dark) .btn { color: white; }   /* 0-1-0 — just .btn */

/* :is() and :not() take the score of their most specific argument. */
:is(#main, .side) .btn { color: white; }     /* 1-1-0 — the #main won */`
            }
          },
          { p: '<code>:where()</code> is how you ship defaults that are trivially overridable — a reset, or a component library\'s base styles — without forcing every consumer into an escalation.' },
          {
            note: [
              '<b><code>!important</code> is not a tiebreaker, it is a different competition.</b> It jumps to step 1, above every normal declaration regardless of selector. Once one lands in a codebase the usual response is another one, and the file ends up with no working cascade at all.',
              'Treat one in a code review as a signal that the layering is wrong, not as a fix. The exception is overriding a third-party stylesheet you cannot edit — and even there, a cascade layer is the cleaner answer now.',
              '<b>You do not have to do this arithmetic by hand.</b> In Chrome DevTools the Styles pane lists every rule that matched, strikes through the ones that lost, and shows the specificity on hover. If an interviewer asks how you would debug it in practice, that is the answer — knowing the model is what lets you read the panel.'
            ]
          }
        ],
        say:
          'Every selector scores as three counters — A for ids, B for classes, attributes and pseudo-classes, C for element types and pseudo-elements. So form.big-form is 0-1-1 and #my-form is 1-0-0. You compare left to right and stop at the first difference, so the id wins on the A column and the other two columns never get read; the form comes out blue. The important part is that it is not base ten and it does not sum — eleven classes is 0-11-0 and still loses to one id, so no number of classes ever beats an id. If the tuples tie exactly, it falls through to source order and the last rule wins. I would also point out specificity is only one step of the cascade: origin and importance come first, then cascade layers, then specificity, then source order, with inline styles above any selector. That is why layers are the modern way out of specificity wars — a later layer wins whatever the selectors are. And :where() scores zero, which is how you ship overridable defaults.',
        traps: [
          'Treating the score as a number — "a class is 10, an id is 100". It leads directly to believing enough classes will outweigh an id. They never will.',
          'Adding the columns together. They are compared independently, left to right, and the first difference decides.',
          'Forgetting the tie case. Equal specificity is resolved by source order, not by which one you meant.',
          'Not knowing where specificity sits in the cascade. Layers and <code>!important</code> are resolved before it, so "the more specific selector wins" is only true within a layer.',
          'Reaching for <code>!important</code> to win a fight. It is a different competition, and it makes the next fight worse.',
          'Never having heard of <code>:where()</code>. It is the intended tool for zero-specificity defaults, and mentioning it signals you have written CSS meant to be consumed by other people.'
        ]
      },
      {
        id: 'fe-responsive',
        title: 'Responsive by default, with breakpoints as the last resort',
        tags: ['css'],
        ask: 'What are the core principles of responsive design?',
        body: [
          { p: 'The goal is a layout that adapts because of how it was built, not because you enumerated the screen sizes it has to survive. Every breakpoint you write is a size you thought of; the bug is always at a size you did not.' },
          { p: 'In rough order of leverage:' },
          { p: '<b>One. Size things relatively.</b> A fixed pixel width cannot adapt to anything.' },
          {
            list: [
              '<code>rem</code> is relative to the root font size. Use it for almost everything — spacing, type, container widths — because it scales with the user\'s browser font-size setting, which is a real accessibility win rather than a theoretical one.',
              '<code>em</code> is relative to the <i>parent\'s</i> font size. Use it inside a component you want to scale as a unit: set padding in <code>em</code> and the button\'s padding grows with its own label.',
              '<code>%</code> and the viewport units <code>vw</code> / <code>vh</code> are relative to the container and the viewport respectively.'
            ]
          },
          {
            note: [
              '<b>"Never use pixels" is too strong, and an interviewer may push on it.</b> Pixels are correct for things that should not scale with text: a one-pixel hairline border, a shadow offset, a small radius. Scaling a border with the root font size gives you a chunky outline at large text sizes and nothing anyone wanted.',
              'The accurate rule is that anything tied to <i>text</i> or to <i>layout</i> should be relative, and anything tied to <i>decoration</i> can be fixed.'
            ]
          },
          { p: '<b>Two. Let the layout algorithm do the work.</b> Block is the default and is already responsive — paragraphs stack, text wraps. Flexbox handles one dimension and reflows naturally. Grid handles two, and its real power is that it can respond without any media query at all:' },
          {
            code: {
              lang: 'css',
              src: `.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}
/* Fit as many 16rem columns as there is room for, then share the
   leftover space equally. Four across on a desktop, one on a phone,
   and every step in between. Zero breakpoints. */`
            }
          },
          { p: 'The same idea applies to type, with <code>clamp()</code> giving a floor, a preferred value that tracks the viewport, and a ceiling:' },
          {
            code: {
              lang: 'css',
              src: `h1 { font-size: clamp(1.75rem, 1rem + 2.5vw, 3.5rem); }
/*                    ▲ minimum   ▲ scales     ▲ maximum */`
            }
          },
          { p: '<b>Three. Query the container, not the screen.</b> This is the piece that changed the answer to this question, and it is the piece the older version of it misses.' },
          { p: 'A media query asks how wide the <i>viewport</i> is. But a card does not care about the viewport — it cares how much room it has been given. The same card in a wide main column and in a narrow sidebar wants two different layouts at one screen size, and a media query cannot express that.' },
          {
            code: {
              lang: 'css',
              src: `.card-area { container-type: inline-size; }

/* "when MY container is at least 30rem wide" — not the screen */
@container (min-width: 30rem) {
  .card { display: grid; grid-template-columns: 8rem 1fr; }
}`
            }
          },
          { p: 'That makes the component genuinely reusable: it adapts wherever you drop it, with no knowledge of the page around it. Container queries have shipped in every major browser since early 2023.' },
          { p: '<b>Four. Then add breakpoints,</b> for the things that genuinely are page-level decisions — a sidebar becoming a drawer, a navigation collapsing to a menu. Borrow a tested scale rather than inventing one; Tailwind\'s is fine and widely understood. Media queries are the last tool, not the first.' },
          { p: 'And the one line without which none of it works:' },
          {
            code: {
              lang: 'text',
              src: `<meta name="viewport" content="width=device-width, initial-scale=1">`
            }
          },
          { p: 'Leave it out and a phone renders the page at about 980px wide and scales the whole thing down. Every relative unit below it is then relative to the wrong number.' },
          {
            bridge: [
              'This is also the highest-leverage thing you can put in front of a coding agent, and it is worth saying so when the question is asked in an AI context.',
              'Models hardcode. Asked for a layout they will write <code>width: 420px</code> and <code>font-size: 13px</code>, because that produces a screenshot that looks right on the machine it was generated on. It looks right in review too. It falls apart on a phone.',
              'The fix is a constraint given up front, not a correction applied afterwards: relative units only, <code>auto-fit</code> and <code>minmax</code> over fixed columns, container queries over media queries, and the project\'s spacing scale rather than raw numbers. Retrofitting responsiveness onto generated CSS costs far more than constraining it did.'
            ]
          }
        ],
        say:
          'The principle is that the layout should adapt because of how it is built, not because I listed the screen sizes in advance — every breakpoint is a size I thought of, and the bug is always at one I did not. So: relative units first, rem for anything tied to text or layout so it respects the user\'s font-size setting, em inside a component that should scale as a unit, though I would keep pixels for hairline borders and shadows since those should not grow with text. Then let the layout algorithm do the work — grid with repeat(auto-fit, minmax(16rem, 1fr)) is responsive with no media query at all, and clamp() does the same for type. Then container queries, which is the part that actually changed this answer: a card should respond to the space it was given, not to the viewport, so the same component works in a main column and in a sidebar. Media queries come last, for genuine page-level changes like a sidebar becoming a drawer. And the viewport meta tag, without which none of the rest does anything on a phone.',
        traps: [
          'Answering with only breakpoints and media queries. That was the complete answer in 2018. Container queries have been baseline since 2023, and not mentioning them dates the answer precisely.',
          'Saying "never use pixels" without qualification. Borders, shadows and hairlines should not scale with the root font size.',
          'Not being able to separate <code>rem</code> from <code>em</code>. Root versus parent, and the reason you would choose each, is the actual question underneath.',
          'Forgetting the viewport meta tag. Without it a phone renders at roughly 980px and scales down, and everything else you did is measured against the wrong width.',
          'Treating <code>vw</code> as a general-purpose unit for type. Unclamped, it produces unreadable text at the extremes — which is what <code>clamp()</code> exists to fix.',
          'Reaching for grid plus a stack of media queries where <code>auto-fit</code> and <code>minmax</code> would have done it in one line.'
        ]
      }
    ]
  });
})(window.PREP);
