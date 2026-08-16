/* Front-end runtime track — the main thread, and the data structures that sit on it.
   Source: "Top 15 Frontend Interview Questions for 2026" (YouTube AMerB8XjfZ0,
   theSeniorDev). Questions 1, 10, 11, 12 and 13 of the fifteen.

   The questions are the ones actually asked in that interview. The answers are
   written from scratch and checked against the specs and docs linked on each
   card. Four places where the video is wrong or imprecise are corrected in the
   body and called out under "Where candidates lose it":

     - "CSS transitions bypass reflow and go straight to the compositor"
       They do not. The property decides the pipeline, not CSS versus JS.
     - The event loop drains one microtask, then renders
       It drains the whole microtask queue, then renders.
     - "A Map cannot be garbage collected"
       A Map is collected like anything else. A *live* Map pins its keys.
     - The outline sits inside the margin box
       Outline takes no space at all and is painted outside the border edge.

   Each correction was verified against the linked source before it was written
   down, and the reasoning is on the card so you can check it rather than
   trust it. */
(function (P) {
  P.modules.push({
    id: 'fe-thread',
    track: 'frontend-senior',
    title: 'The main thread',
    kicker: 'Module 01',
    blurb:
      'Almost every "the app feels slow" question resolves to one of two things: work you put on the main thread that did not need to be there, or work you handed the browser in a shape it cannot optimise. These three cards are the mechanism behind both.',
    concepts: [
      {
        id: 'fe-compositor',
        title: 'The property decides the pipeline, not CSS versus JavaScript',
        tags: ['performance', 'hot'],
        ask: 'An AI coding agent built a button that gets bigger on hover by changing the button\'s width on the mouseenter event. Any thoughts on this?',
        watch: 30,
        body: [
          { p: 'The problem is not that it used JavaScript. The problem is that it animated <code>width</code>.' },
          { p: 'To put a frame on screen the browser runs a pipeline. Which stage it has to start from depends entirely on <b>which property you changed</b>.' },
          {
            diagram: `Style        which rules apply to which element
   │
Layout       where every box sits and how big it is      <- "reflow"
   │
Paint        fill in the pixels of each layer            <- "repaint"
   │
Composite    stack the finished layers, on the GPU
   │
Screen


width, height, padding, margin, top, left
                       ->  start at Layout.     All four stages, every frame.

color, background, box-shadow, border-radius
                       ->  start at Paint.      Three stages.

transform, opacity     ->  start at Composite.  One stage, off the main thread.`,
            caption: 'Where each property enters the pipeline'
          },
          { p: 'Changing <code>width</code> starts at Layout. The browser has to work out the new size of that button, and then of everything whose position depends on it. That is a reflow, and on a hover animation it happens on <b>every single frame</b> — sixty times a second — on the main thread, competing with your JavaScript.' },
          { p: '<code>transform: scale()</code> starts at Composite. The layout tree does not change at all, because the button still occupies exactly the same box; it is only drawn larger. Scaling an already-painted layer is a matrix multiply, which is the one thing a GPU is unambiguously good at, and it happens on the compositor thread rather than the main one.' },
          {
            code: {
              lang: 'css',
              src: `/* what the agent wrote — Layout runs on every frame of the hover */
.btn {
  width: 160px;
  transition: width 150ms ease;
}
.btn:hover {
  width: 176px;
}

/* the compositor version — no layout, no paint */
.btn {
  transition: transform 150ms ease;
}
.btn:hover {
  transform: scale(1.1);
}`
            }
          },
          { p: 'This is the part worth being precise about, because it is the part most people get backwards. <b>Moving the animation into a CSS transition does not save you.</b> The first block above is a CSS transition, and it reflows on every frame just as surely as a <code>requestAnimationFrame</code> loop assigning <code>el.style.width</code> would. There is no rule that CSS is fast and JavaScript is slow. The property is what decides.' },
          { p: 'What doing it in JavaScript <i>does</i> add is a second cost on top: the handler has to be queued as a task, entered on the call stack and run, before it even gets to the DOM write that triggers the reflow. So JavaScript is worse here. But it is worse by an increment. The reflow was always the expensive part.' },
          { p: 'You can also tell the browser in advance that an element is about to be animated, so it gets promoted to its own compositor layer instead of being promoted mid-animation:' },
          {
            code: {
              lang: 'css',
              src: `.btn { will-change: transform; }`
            }
          },
          {
            note: [
              '<b><code>will-change</code> is not a speed switch, and it is not free.</b> Every promoted layer is a separate texture held in GPU memory. Put it on one hero element and you have helped; put it on every card in a list and you have traded a layout cost for a memory cost, which on a mid-range phone is the worse of the two.',
              'Set it on the element shortly before the animation and remove it after, or leave it on a small number of genuinely animated elements. Never ship it as a blanket rule.',
              '<b>And <code>scale()</code> is not a drop-in replacement for <code>width</code>.</b> It scales the whole rendered layer — the label, the border, the padding, the corner radius. If the design says the box grows but the text stays the same size, the compositor cannot give you that, because that genuinely is a layout change. Say so in the interview rather than pretending the two are equivalent. It is the kind of honesty that reads as senior.'
            ]
          }
        ],
        say:
          'The issue is the property, not the fact that it is JavaScript. Animating width means the browser reruns layout on every frame of that hover, and layout is on the main thread, so it competes with everything else. I would animate transform: scale() instead, because transform is handled at the compositing stage — the box stays the same size in the layout tree and only the finished layer gets scaled, which happens off the main thread on the GPU. I would be careful about one thing though: moving it into a CSS transition would not have fixed it either. A transition on width still reflows every frame. And scale scales the text too, so if the design needs the box to grow while the label stays put, that really is a layout change and I would say so rather than fake it.',
        traps: [
          'Saying <b>"use a CSS transition, it bypasses reflow and goes to the compositor thread"</b>. It does not. A transition on <code>width</code> reflows on every frame. Only certain properties — <code>transform</code>, <code>opacity</code> — can be handled by the compositor, and they do it whether a transition, an animation or JavaScript drives them.',
          'The broader version of the same mistake: <b>"CSS animations are faster than JavaScript animations."</b> A JavaScript loop writing <code>transform</code> composites; a CSS transition on <code>height</code> reflows. The technique is not what is being measured.',
          'Animating <code>left</code> and <code>top</code> to move something. Both are layout properties. <code>transform: translate()</code> is the compositor version and looks identical.',
          'Reaching for <code>will-change</code> as a general fix. It costs GPU memory per element, and applied broadly it makes things worse, not better.',
          'Claiming <code>scale()</code> and <code>width</code> are interchangeable. They are not — <code>scale()</code> also scales the text and the border.'
        ]
      },
      {
        id: 'fe-eventloop',
        title: 'One task, then every microtask, then a frame',
        tags: ['javascript', 'hot'],
        ask: 'Can you give me a high-level overview of the event loop?',
        watch: [
          { v: 'lqLSNG_79lI', t: 69, l: 'See the model' },
          { t: 1831, l: 'Hear it asked' }
        ],
        body: [
          { p: 'Build this up in four moves. Each one answers the question the move before it raises, and the last one is where the senior answer lives.' },

          { p: '<b>One. JavaScript runs on a single thread.</b>' },
          { p: 'That is a deliberate choice. The DOM is one shared tree. If two threads could change it at once you would need a lock around every node, and every layout bug would become a race condition. One thread means the page only ever changes in one place at a time.' },
          { p: 'There is a distinction here worth making out loud, because it is the one people fumble. JavaScript cannot do two things <b>in parallel</b> — two things in the same instant. It absolutely can do many things <b>concurrently</b> — many things in flight at once, making progress in turns. Ten <code>fetch</code> calls can be in the air together. What cannot overlap is <i>your JavaScript running</i>.' },

          { p: '<b>Two. So the slow work is handed off.</b>' },
          { p: 'This is the part that makes the rest make sense. When you call <code>setTimeout</code>, or <code>fetch</code>, or <code>addEventListener</code>, JavaScript does not sit and wait. It hands the job to the browser and returns on the very next line.' },
          { p: 'And the browser is not JavaScript. Timers, the network stack, the file and DOM event plumbing are all implemented in the browser\'s own code — typically C++ — and that code <b>is</b> multi-threaded. So the concurrency is real. It just does not live in your language. (Node does the same thing with a C library called libuv; same idea, different name.)' },
          { p: 'So there are four places work can be, and a one-way journey between them:' },
          {
            diagram: `  your code
      │
      ▼
┌─────────────┐   hands off the slow part    ┌──────────────────┐
│  CALL STACK │ ───────────────────────────> │  BROWSER (Web    │
│             │   setTimeout, fetch, click   │  APIs, C++,      │
│  last in,   │                              │  multi-threaded) │
│  first out  │                              │                  │
│             │                              │  the waiting     │
│             │                              │  happens here    │
└─────────────┘                              └──────────────────┘
      ▲                                               │
      │                                               │ done —
      │  ONLY when the stack is empty                 │ hand back
      │                                               │ the callback
      │            ┌──────────────────┐               │
      └─────────── │  CALLBACK QUEUE  │ <─────────────┘
        event loop │  first in,       │
                   │  first out       │
                   └──────────────────┘

  Nothing jumps this queue. Nothing interrupts the stack.`,
            caption: 'The journey every async callback takes'
          },
          { p: 'Read the three boxes as three different shapes:' },
          {
            list: [
              'The <b>call stack</b> is <b>last in, first out</b>. Call a function, it goes on top. If it calls another, that goes on top of it. The top one must finish before anything below it continues. When it returns it pops off.',
              'The <b>browser</b> is where pending work waits. A two-second timer sits here for two seconds. Your stack is empty and free the whole time.',
              'The <b>callback queue</b> is <b>first in, first out</b> — an ordinary queue, like a line at a counter. When the browser finishes a job it puts the callback at the back.'
            ]
          },

          { p: '<b>Three. The loop has exactly one rule.</b>' },
          { p: 'The event loop watches the stack and the queue, and does one thing: <b>if the call stack is empty, take the first callback off the queue and push it onto the stack.</b> That is the entire job.' },
          { p: 'Two consequences fall straight out of that rule, and both are interview answers.' },
          {
            list: [
              '<code>setTimeout(fn, 0)</code> does not mean "run now". It means "after at least 0ms, <i>and</i> not until the stack is clear". A long synchronous function delays every timer behind it.',
              'A slow function does not just make itself slow. It holds the stack, so nothing in the queue can land — no clicks, no responses, no rendering. That is what "blocking the main thread" actually means.'
            ]
          },

          { p: '<b>Four. The browser adds two things that model leaves out</b> — and this is the part a senior answer is graded on.' },
          { p: 'There is not one queue. There are two, and they do not have equal rights.' },
          {
            list: [
              'The <b>task queue</b> — <code>setTimeout</code>, a click, a <code>fetch</code> response arriving. The queue described above.',
              'The <b>microtask queue</b> — <code>.then</code> callbacks, whatever follows an <code>await</code>, <code>queueMicrotask</code>. <b>Higher priority, and drained differently.</b>'
            ]
          },
          { p: 'And between turns the browser needs to paint, or the page freezes no matter how correct your code is. So the real order is:' },
          {
            diagram: `┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1   Take ONE task off the task queue and run it            │
│      to completion.            setTimeout, click, fetch     │
│                    │                                        │
│  2   Drain the microtask queue COMPLETELY.                  │
│      Not one of them — all of them, including any           │
│      queued while draining.    .then, await, queueMicrotask │
│                    │                                        │
│  3   If it is time to paint:                                │
│         run requestAnimationFrame callbacks                 │
│         Style -> Layout -> Paint -> Composite               │
│                    │                                        │
│  4   Go back to 1.                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

  One task per turn.  Every microtask per turn.  At most one frame.`,
            caption: 'The processing model, in order'
          },
          { p: 'That is the whole answer, and it is far easier to believe once you have watched it move. Step through it below. The four runs are the same machine, and each isolates one rule &mdash; start with <b>Offload</b>, which is just the journey above, one frame at a time.' },
          { sim: 'eventloop', caption: 'Run the loop yourself' },
          { p: 'Step 2 is where people go wrong, and it is worth being exact. The loop does not take one microtask and then go and paint. It empties the queue — and if a microtask queues another microtask, that one runs too, in the same turn, before anything else gets a look in.' },
          {
            code: {
              lang: 'js',
              src: `console.log('1 sync');

setTimeout(() => console.log('5 task'), 0);

Promise.resolve().then(() => {
  console.log('3 microtask');
  Promise.resolve().then(() => console.log('4 microtask queued by a microtask'));
});

console.log('2 sync');

// => 1 sync
// => 2 sync
// => 3 microtask
// => 4 microtask queued by a microtask
// => 5 task`
            }
          },
          { p: 'Notice that <code>4</code> — queued from inside a microtask, after the timer was already waiting — still runs before the timer. That is what "drain completely" buys you, and it is the observable difference between the two queues.' },
          { p: 'It also has a consequence you can demonstrate in a tab:' },
          {
            code: {
              lang: 'js',
              src: `// Freezes the tab permanently. Step 2 never finishes, so step 3
// never happens: no paint, no scroll, no clicks, forever.
function starve() { Promise.resolve().then(starve); }

// Does not freeze anything. Each callback is its own task, so the
// loop reaches step 3 between them and the page keeps painting.
function polite() { setTimeout(polite, 0); }`
            }
          },
          { p: 'Both are infinite loops. Only one of them kills the page. If you can explain why, you have understood the model rather than memorised the diagram.' },
          {
            note: [
              '<b>The production version of this is rarely an infinite loop.</b> It is one task that is simply too big — a keystroke handler that re-renders a large tree, or a JSON parse of something enormous.',
              'The loop cannot pre-empt it. Step 1 says "run it to completion", so until that handler returns, step 3 does not happen, and the page does not paint. The user types and sees the characters appear late. That is what "blocking the main thread" means in practice.',
              'The fix is not a faster function, it is a smaller one: send the main thread many small units of work rather than one large one. Memoise so re-renders do less; move genuinely heavy computation to a Web Worker, which has its own thread and no DOM access.'
            ]
          },
          {
            note: [
              '<b>Two details to keep straight if the interviewer pushes.</b>',
              '<b>The loop is not part of the JavaScript engine.</b> The call stack and the microtask queue belong to V8. The task queues, the render step and the loop that drives them belong to the browser. That is exactly why <code>Promise</code> is in the ECMAScript spec and <code>setTimeout</code> is not — <code>setTimeout</code> is a browser API, defined in the HTML spec.',
              '<b>"One task queue" is a simplification.</b> The browser keeps several, so it can prioritise — user input ahead of a background timer, for instance. Node splits its loop into named phases instead (timers, poll, check, and so on) and adds <code>process.nextTick</code> ahead of promises. Neither detail changes the shape of the answer, but knowing the simplification is a simplification is worth a sentence.'
            ]
          }
        ],
        say:
          'I would build it in four steps. JavaScript runs on one thread, because the DOM is a single shared tree and two threads mutating it would mean locking every node — so the useful distinction is that JavaScript cannot run things in parallel, but it can absolutely run them concurrently. That works because the slow work is handed off: when I call setTimeout or fetch, JavaScript does not wait, it passes the job to the browser and returns on the next line, and the browser is C++ and genuinely multi-threaded, so the concurrency is real, it just is not in my language. When the browser finishes, it puts the callback on a queue, and the event loop has exactly one rule — if the call stack is empty, move the first callback from the queue onto the stack. Two things fall out of that: setTimeout(fn, 0) means "when the stack is clear", not "now"; and a slow function blocks everything, because nothing can land while it holds the stack. Then the browser part that model leaves out, which is where the real answer is: there are two queues, not one, and microtasks — .then, await — outrank tasks and are drained completely rather than one at a time, with a chance to paint after. That is why an endless promise chain freezes the tab permanently while an endless setTimeout chain does not.',
        traps: [
          'Getting step 2 and step 3 the wrong way round — saying the loop takes <i>a</i> microtask, then renders, then comes back for the next one. It drains the queue completely first. Everything interesting about microtasks follows from that.',
          'Saying "the event loop is part of V8". The stack and the microtask queue are V8\'s; the task queues and the loop are the browser\'s. That is why <code>setTimeout</code> is not in the ECMAScript spec.',
          'Treating <code>setTimeout(fn, 0)</code> as "run this immediately". It means "queue this as a task", so it runs after all pending microtasks, and after the current one finishes.',
          'Calling the microtask queue the "callback queue" and lumping promises in with timers. Putting <code>.then</code> and <code>setTimeout</code> in the same bucket loses the only distinction the question is testing.',
          'Using <b>parallel</b> and <b>concurrent</b> interchangeably. JavaScript does not run two things in the same instant; it keeps many things in flight and interleaves them. Ten <code>fetch</code> calls really are overlapping — in the browser\'s threads, not in yours.',
          'Saying "JavaScript is asynchronous". The language is stubbornly synchronous, top to bottom. The <i>platform</i> underneath it is asynchronous, and the event loop is the seam between the two. Getting this backwards makes the rest of the answer incoherent.',
          'Reading <code>setTimeout(fn, 2000)</code> as "in exactly two seconds". It is a <i>minimum</i>: after 2000ms the callback is put on the queue, and it runs whenever the stack next empties — which could be much later.',
          'Saying a Web Worker helps with a slow re-render. It cannot touch the DOM. Workers are for computation, not rendering.'
        ]
      },
      {
        id: 'fe-react-slow',
        title: 'Two different bugs share the word "slow"',
        tags: ['react', 'performance'],
        ask: 'You are handed a React codebase that has been vibe coded. The product manager complains the application is slow. How would you deal with this?',
        watch: 2142,
        body: [
          { p: 'First move is a question, not a fix. "Slow" covers two unrelated problems with two unrelated investigations, and guessing wrong wastes the week.' },
          {
            diagram: `"the app is slow"
        │
        ├── slow to LOAD                  first paint, first interaction
        │     the user waits for bytes, parsing and hydration
        │     └─ measure: Lighthouse, bundle analyser, Network tab
        │
        └── slow to RESPOND               typing, clicking, scrolling
              the user waits for a frame after acting
              └─ measure: React Profiler, Performance panel`,
            caption: 'Ask which one before touching anything'
          },
          { p: 'If they cannot say which, ask whether it is slow the first time or slow every time. First time is loading. Every time is responsiveness.' },
          { p: '<b>Slow to load</b> is almost always the amount of JavaScript being shipped. Vibe-coded projects accumulate dependencies nobody removed — a date library imported for one call, a chart library on a page with no chart.' },
          {
            list: [
              'Run the bundle analyser first. It usually names the problem in about a minute, and it stops you optimising the wrong thing.',
              'Split on routes with dynamic <code>import()</code>, so a visitor to the landing page does not download the dashboard.',
              'Push work to the server. Server Components and SSR let you render without shipping the component code at all — the biggest single lever, and the one an AI-generated codebase has almost never used.',
              'Delete rather than optimise. An unused dependency removed is worth more than any amount of tuning.'
            ]
          },
          { p: '<b>Slow to respond</b> is about re-renders, and there are only three moves. Do fewer of them, make each cheaper, or move the state so fewer components care.' },
          {
            code: {
              lang: 'jsx',
              src: `// 1. Do fewer. memo skips a re-render when props are unchanged,
//    so a parent updating no longer drags its children with it.
const Row = memo(function Row({ item, onPick }) { /* ... */ });

// 2. Make each cheaper. Anything that does not read state or props
//    does not belong inside the component — this is rebuilt on
//    every single render for no reason.
function Table({ rows }) {
  const format = (n) => n.toFixed(2);   // <- move it out of the component
  // ...
}

// 3. Move the state down. Search input state living at the top of
//    the tree re-renders the whole page on every keystroke.
//    Kept inside SearchBox, it re-renders one component.`
            }
          },
          { p: 'The third one is the one people skip, and it is usually the biggest win. State lifted higher than it needs to be turns every keystroke into a full-tree render. Pushing it down to the component that actually reads it is a structural fix, and it does not need a single <code>memo</code> call.' },
          {
            note: [
              '<b>Do not open by sprinkling <code>memo</code>, <code>useMemo</code> and <code>useCallback</code> everywhere.</b> Each one costs a comparison on every render and holds onto memory, and applied blindly it can be a net loss. Worse, it hides the structural problem — badly placed state — under a layer of caching.',
              'Measure with the React Profiler first, so you know which components actually re-render and how long they take. Then memoise the ones that showed up.',
              '<b>If the project is on the React Compiler, most of this is automatic.</b> It inserts memoisation for you at build time, so hand-written <code>useMemo</code> and <code>useCallback</code> largely stop being necessary. Worth asking whether it is enabled before you spend a day doing by hand what the build already does.'
            ]
          }
        ],
        say:
          'First I would clarify whether it is slow to load or slow to respond, because those are different investigations — first-time-slow is loading, every-time-slow is responsiveness. If it is loading, I would run the bundle analyser before changing anything; vibe-coded codebases usually carry dependencies nobody needed, and the fix is deleting them, route-level code splitting with dynamic imports, and moving work to Server Components so the JavaScript never ships. If it is responsiveness, it is re-renders, and there are three moves: do fewer with memo, make each cheaper by pulling logic that does not read state out of the component, and move state down so fewer components subscribe to it. That last one is usually the biggest win and needs no memoisation at all. I would profile before memoising rather than after, and I would check whether the React Compiler is enabled first, because if it is, most of the manual memoisation is already being done at build time.',
        traps: [
          'Starting to optimise before asking which kind of slow it is. Half the possible work is wasted on the wrong axis.',
          'Reaching for <code>useMemo</code> and <code>useCallback</code> everywhere as a reflex. They are not free, and they paper over state that is in the wrong place.',
          'Not measuring. "I would add memo to the list items" is a guess; "I would open the Profiler and find what re-renders" is a method.',
          'Forgetting the React Compiler exists. Hand-memoising a compiler-enabled codebase is work the build already did.',
          'Treating bundle size as the only loading cost. Parse, execute and hydrate all cost time too, which is exactly why moving rendering to the server beats shrinking the bundle.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'fe-data',
    track: 'frontend-senior',
    title: 'JavaScript data and memory',
    kicker: 'Module 02',
    blurb:
      'Two questions that look like trivia and are not. Both are really asking whether you know what the runtime is doing with your memory — which is the difference between a cache and a leak.',
    concepts: [
      {
        id: 'fe-map',
        title: 'Object versus Map: keys, collisions, and what you are optimising for',
        tags: ['javascript'],
        ask: 'What is the difference between an object and a Map?',
        watch: 2334,
        body: [
          { p: 'The headline difference is what is allowed to be a key.' },
          {
            list: [
              'An <b>object</b> accepts only strings and symbols. Anything else you hand it is converted to a string first.',
              'A <b>Map</b> accepts anything — objects, functions, numbers, <code>NaN</code>. Keys are compared by identity, so two different objects that look identical are two different keys.'
            ]
          },
          {
            code: {
              lang: 'js',
              src: `const obj = {};
obj[1] = 'number one';
obj['1'] = 'string one';
console.log(Object.keys(obj));   // => ['1']
console.log(obj[1]);             // => 'string one'
// The number 1 was converted to '1', so the second write
// overwrote the first. Two distinct keys silently became one.

const map = new Map();
map.set(1, 'number one');
map.set('1', 'string one');
console.log(map.size);           // => 2
console.log(map.get(1));         // => 'number one'`
            }
          },
          { p: 'The second difference is that an object is never really empty. It inherits from <code>Object.prototype</code>, so it arrives with keys on it. If your keys come from user input, that is a correctness problem rather than a style one:' },
          {
            code: {
              lang: 'js',
              src: `const counts = {};
console.log(counts['toString']);   // => function toString() { ... }
// You wanted undefined. You got an inherited method, and
// 'if (counts[word])' just took the wrong branch.

const safe = new Map();
console.log(safe.get('toString')); // => undefined`
            }
          },
          { p: 'Then a set of smaller, practical ones: a <code>Map</code> has <code>.size</code> where an object needs <code>Object.keys(o).length</code>; a <code>Map</code> is directly iterable where an object needs <code>Object.entries</code>; a <code>Map</code> guarantees insertion order for every key type, where an object puts integer-like keys first, in ascending order, ahead of everything else; and a <code>Map</code> is designed for frequent additions and deletions, where <code>delete</code> on an object can push the engine off its optimised shape.' },
          { p: 'None of that makes <code>Map</code> the default. Objects still win where the shape is fixed and known — a config, a component\'s props, anything that has to survive <code>JSON.stringify</code>, which does not serialise a <code>Map</code> at all. Object literal syntax is also shorter and destructures, which is most of why people reach for it.' },
          { p: 'The rule of thumb worth saying out loud: <b>fixed, known keys that you wrote yourself is a record, and a record is an object. Arbitrary keys that arrive at runtime is a dictionary, and a dictionary is a <code>Map</code>.</b>' },
          {
            structures: [
              {
                name: 'Object',
                kind: 'record, fixed shape',
                cost: [['keys', 'string / symbol'], ['size', 'O(n)'], ['JSON', 'yes'], ['iterable', 'no']],
                diagram: `{ id: 7, name: 'ada' }
      │
      └─ inherits from Object.prototype
             ├─ toString
             ├─ hasOwnProperty
             └─ ...            <- these are readable as keys

Integer-like keys are reordered ahead of the rest:

  const o = { b: 1, 2: 2, a: 3, 1: 4 };
  Object.keys(o)        // => ['1', '2', 'b', 'a']
                        //     ▲ ascending    ▲ insertion order`,
                use: [
                  'The keys are a fixed set you decided at write time — a config object, props, a parsed row.',
                  'It has to round-trip through <code>JSON.stringify</code>. A <code>Map</code> serialises to <code>{}</code>.',
                  'You want destructuring and spread syntax.'
                ],
                not: 'The keys come from user input or another system, in which case inherited names like <code>toString</code> and <code>__proto__</code> are landmines — reach for a <code>Map</code>, or <code>Object.create(null)</code> if you must keep object syntax.'
              },
              {
                name: 'Map',
                kind: 'dictionary, any key',
                cost: [['keys', 'anything'], ['size', 'O(1)'], ['JSON', 'no'], ['iterable', 'yes']],
                diagram: `new Map([[keyA, v1], [keyB, v2]])

  ┌───────────────┬────────┐
  │ key (any type)│ value  │     compared by identity (SameValueZero)
  ├───────────────┼────────┤
  │ 1   (number)  │  'a'   │  ─┐  the number and the string
  │ '1' (string)  │  'b'   │  ─┘  are two separate keys
  │ {…} (object)  │  'c'   │      a different {} would not match
  └───────────────┴────────┘

  No prototype. No inherited keys. .size is kept, not counted.
  Insertion order is preserved for every key type.`,
                use: [
                  'Keys arrive at runtime and you do not control them — user input, IDs from an API, anything untrusted.',
                  'You need non-string keys, typically a DOM node or another object.',
                  'Entries are added and removed often, or you need the count cheaply.'
                ],
                not: 'The data has to be serialised to JSON, or the keys are a small fixed set you wrote yourself — a plain object is shorter to read and destructures.'
              },
              {
                name: 'WeakMap',
                kind: 'side table, keys held weakly',
                cost: [['keys', 'objects only'], ['size', 'none'], ['JSON', 'no'], ['iterable', 'no']],
                diagram: `new WeakMap()

  key ──weak──> { the object }  <──strong── the rest of your app
                                            │
                        when this last strong reference goes,
                        the object is collected AND the WeakMap
                        entry disappears with it. Automatically.

  No .size, no .keys(), no iteration — on purpose. Exposing them
  would let you observe the garbage collector, and results would
  change depending on when it happened to run.`,
                use: [
                  'Attaching data to objects you do not own — a DOM node, an instance from a library — without deciding when to clean it up.',
                  'Memoising a function whose argument is an object, where the cache should not outlive the argument.',
                  'Private state keyed by instance.'
                ],
                not: 'You need to iterate, count, or use primitive keys. None of those are possible; use a <code>Map</code> and delete entries yourself.'
              }
            ]
          }
        ],
        say:
          'The big one is keys: an object only takes strings and symbols and coerces everything else, so obj[1] and obj["1"] are the same key, whereas a Map takes any type and compares by identity. The one that actually bites is the prototype — an object is never empty, so counts["toString"] gives you an inherited function instead of undefined, which quietly breaks any code where the keys come from user input. Beyond that a Map has O(1) size, is directly iterable, preserves insertion order for every key type where an object hoists integer-like keys to the front, and handles frequent add and delete better. But I would not default to Map. Fixed keys I wrote myself is a record and that is an object, especially since a Map does not survive JSON.stringify. Arbitrary keys arriving at runtime is a dictionary, and that is a Map.',
        traps: [
          'Stopping at "Map can use any key". True, but it is the answer everyone gives. The prototype collision is the one with a production bug attached.',
          'Claiming <code>Map</code> is always faster. It is better for frequent add and delete; for a small fixed shape an object is usually quicker and always lighter.',
          'Forgetting <code>JSON.stringify(new Map([[1, 2]]))</code> returns <code>{}</code>. This surprises people in an API layer.',
          'Saying object key order is insertion order, full stop. Integer-like keys come first, in ascending numeric order, ahead of the string keys.',
          'Not knowing <code>Object.create(null)</code>. It is the "object with no prototype" escape hatch, and mentioning it shows you know exactly what the problem was.'
        ]
      },
      {
        id: 'fe-weakmap',
        title: 'WeakMap, reachability, and how a cache becomes a leak',
        tags: ['javascript', 'memory'],
        ask: 'What is the difference between a Map and a WeakMap? Touch on memory management and garbage collection while you are at it.',
        watch: 2397,
        body: [
          { p: 'Start with how JavaScript decides something is garbage, because both halves of the answer come out of it.' },
          { p: 'The collector does not count references. It starts from a set of <b>roots</b> — the global object, and whatever is live on the call stack — and walks every reference it can follow. Anything it reaches is kept. Anything it never reaches is unreachable, and unreachable memory is collected. That is the whole model: <b>reachability from the roots</b>, not "is anyone still using this".' },
          {
            diagram: `      roots  (globalThis, the call stack)
        │
        ├──────> A ──────> B          reachable — both kept
        │
        └──────> C
                                D ──> E    unreachable — both collected,
                                ▲          even though D and E reference
                                └── E      each other. Cycles are fine;
                                           nothing reaches them from a root.`,
            caption: 'Mark and sweep: what can I get to from here?'
          },
          { p: 'Now the difference. <b>A Map holds its keys strongly.</b> As long as the Map itself is reachable, every key in it is reachable too — the Map is a path from the roots to that object.' },
          { p: 'So a long-lived Map used as a cache keeps everything you ever put in it alive, for the lifetime of the Map. Delete the DOM node, close the modal, navigate away: the node is still reachable through your cache, so it is never collected. That is a memory leak, and it is the single most common way front-end code leaks.' },
          {
            code: {
              lang: 'js',
              src: `const cache = new Map();

function track(node) {
  cache.set(node, { clicks: 0 });
}

// ... later
node.remove();
// The node is gone from the document. It is NOT gone from memory:
// cache still points at it, and cache is reachable from a root.
// Do this on every route change and the tab grows all day.`
            }
          },
          { p: '<b>A WeakMap holds its keys weakly.</b> A weak reference does not count as a path during the walk. So if the only thing still pointing at an object is a WeakMap key, the collector treats it as unreachable, collects it, and removes the entry.' },
          {
            code: {
              lang: 'js',
              src: `const cache = new WeakMap();

function track(node) {
  cache.set(node, { clicks: 0 });
}

// ... later
node.remove();
// Nothing else references the node now. The WeakMap key does not
// keep it alive, so the node is collected and the entry vanishes
// with it. No cleanup code, no leak.`
            }
          },
          { p: 'Values are still held <b>strongly</b> — but only for as long as the key is alive. When the key goes, the value becomes collectable too. That is why a value referencing its own key is not a leak, which would otherwise be an obvious trap.' },
          { p: 'Two restrictions follow from the design, and both are worth stating because they are what make WeakMap unusable in most places:' },
          {
            list: [
              '<b>Keys must be objects</b> (or non-registered symbols). Primitives have no identity to track a lifetime against — the string <code>\'a\'</code> is not an allocation that can die.',
              '<b>There is no iteration, no <code>.keys()</code>, and no <code>.size</code>.</b> This is deliberate, not an oversight. If you could list the keys, the list would depend on whether the collector had run yet, and identical code would give different answers on different runs. Rather than expose that, the API leaves it out.'
            ]
          },
          { p: 'Which gives a clean rule. <b>Use a WeakMap when the key\'s owner decides the lifetime.</b> You are attaching data to an object you did not create and cannot clean up after — a DOM node, an instance from a library, a request object — and you want your entry to disappear when it does. Use a Map when you own the lifetime and are prepared to call <code>delete</code>, or when you need to iterate or count.' },
          {
            note: [
              '<b>"A Map cannot be garbage collected" is not right, and it is worth not saying.</b> A Map is an ordinary object; when nothing references the Map, the Map is collected, and so is everything in it.',
              'The precise statement is that a <i>live</i> Map holds its keys strongly, so it keeps them alive. The leak is not that the Map cannot be collected — it is that the Map is still reachable and is therefore holding the door open for everything inside it.',
              'The distinction matters because it tells you the other fix. You do not have to switch to a WeakMap; you can also scope the Map so that it goes out of reach when the work is done.',
              '<b>WeakMap memoisation only works for object arguments.</b> Memoising <code>fn(userId: string)</code> with a WeakMap will throw, because a string cannot be a key. That needs a <code>Map</code> and a real eviction policy.'
            ]
          }
        ],
        say:
          'Garbage collection in JavaScript is reachability from the roots — the global object and the stack. It walks every reference it can follow, and whatever it never reaches gets collected, which is why reference cycles are not a leak. A Map holds its keys strongly, so while the Map is reachable, everything in it is reachable. That is how a cache becomes a leak: you store data against a DOM node, the node gets removed, but your Map is still pointing at it so it never gets freed. A WeakMap holds keys weakly — a weak reference is not a path during the walk — so once nothing else references the key, the key is collected and the entry disappears with it. Values are strong but only while the key lives. The trade-offs are that keys have to be objects, and there is no iteration or size, deliberately, because the answer would depend on whether the collector had run. So I use WeakMap when the key owns the lifetime — attaching data to DOM nodes or to instances I did not create — and Map when I own the lifetime and can delete, or when I need to iterate.',
        traps: [
          'Saying "a Map cannot be garbage collected". It can. The accurate version is that a live Map keeps its keys alive.',
          'Saying a WeakMap "garbage collects its values". Values are held strongly. What is weak is the key, and the value becomes collectable as a consequence of the key going.',
          'Not knowing WeakMap keys must be objects. It is the first thing that breaks when someone tries to use one for memoising a function that takes an ID string.',
          'Describing reachability as reference counting. Reference counting cannot free cycles; JavaScript engines walk from the roots precisely so that they can.',
          'Treating the missing <code>.size</code> and iteration as an oversight. Explaining <i>why</i> they are absent — that they would let you observe the collector — is what separates this from a memorised list.'
        ]
      }
    ]
  });
})(window.PREP);
