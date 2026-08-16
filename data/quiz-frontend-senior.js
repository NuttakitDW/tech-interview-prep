/* Senior front-end question bank — runtime, data, CSS, AI workflow, system design. */
(function (P) {
  P.quiz.push(
    /* ---------- Module 01: the main thread ---------- */
    {
      id: 's01', track: 'frontend-senior', module: 'fe-thread',
      q: 'A hover effect animates <code>width</code> using a CSS transition. Which pipeline stages run on every frame?',
      choices: [
        'Composite only — CSS transitions are handled by the compositor',
        'Layout, Paint and Composite — <code>width</code> is a layout property',
        'Paint and Composite — the box size is already known',
        'None — transitions are precomputed when the page loads'
      ],
      a: 1,
      why: 'The property decides where the pipeline starts, not whether CSS or JavaScript drove the change. <code>width</code> is a layout property, so every frame reruns Layout, then Paint, then Composite. Wrapping it in a transition changes nothing about that.'
    },
    {
      id: 's02', track: 'frontend-senior', module: 'fe-thread',
      q: 'Which pair of properties can be animated entirely on the compositor, without Layout or Paint?',
      choices: [
        '<code>width</code> and <code>height</code>',
        '<code>transform</code> and <code>opacity</code>',
        '<code>top</code> and <code>left</code>',
        '<code>background-color</code> and <code>box-shadow</code>'
      ],
      a: 1,
      why: '<code>transform</code> and <code>opacity</code> operate on layers that have already been painted, so the compositor can handle them on the GPU. <code>top</code> and <code>left</code> are layout; <code>background-color</code> and <code>box-shadow</code> require a repaint.'
    },
    {
      id: 's03', track: 'frontend-senior', module: 'fe-thread',
      q: 'What is the honest drawback of replacing a <code>width</code> animation with <code>transform: scale()</code>?',
      choices: [
        'It cannot be animated with a CSS transition',
        'It scales everything in the layer, including the text and the border',
        'It is not supported without a vendor prefix',
        'It forces a synchronous reflow when the animation ends'
      ],
      a: 1,
      why: '<code>scale()</code> transforms the finished layer, so the label, border and corner radius grow too. If the design needs the box to grow while the text stays put, that genuinely is a layout change — worth saying rather than pretending the two are equivalent.'
    },
    {
      id: 's04', track: 'frontend-senior', module: 'fe-thread',
      q: 'What is the main cost of applying <code>will-change: transform</code> broadly across a list?',
      choices: [
        'It disables CSS transitions on those elements',
        'Each promoted element becomes a separate GPU layer, consuming memory',
        'It forces every animation onto the main thread',
        'It has no cost — it is purely a hint'
      ],
      a: 1,
      why: 'Promotion allocates a texture per element in GPU memory. On one hero element that is a good trade; applied to every card in a list it swaps a layout cost for a memory cost, which on a mid-range phone is the worse of the two.'
    },
    {
      id: 's05', track: 'frontend-senior', module: 'fe-thread',
      q: 'In one turn of the event loop, what happens immediately after a task finishes?',
      choices: [
        'The browser paints, then one microtask runs',
        'One microtask runs, then the next task is taken',
        'The entire microtask queue is drained, including microtasks queued during the drain',
        'The next task is taken; microtasks run only when the queue is idle'
      ],
      a: 2,
      why: 'The queue is emptied completely before rendering or the next task. A microtask that queues another microtask has it run in the same turn. That is the whole difference between the two queues.'
    },
    {
      id: 's06', track: 'frontend-senior', module: 'fe-thread',
      q: 'Why does <code>function starve() { Promise.resolve().then(starve); }</code> freeze the tab, while <code>function polite() { setTimeout(polite, 0); }</code> does not?',
      choices: [
        'Promises run on a different thread from timers',
        'Microtasks drain to exhaustion before rendering, so the paint step is never reached',
        '<code>setTimeout</code> has a 4ms minimum delay that yields to the browser',
        'The promise version leaks memory until the tab is killed'
      ],
      a: 1,
      why: 'Each <code>starve</code> call queues another microtask, so the drain step never completes and the loop never reaches rendering. Each <code>polite</code> call is a separate task, so the loop paints between them. Both are infinite; only one starves the frame.'
    },
    {
      id: 's07', track: 'frontend-senior', module: 'fe-thread',
      q: 'Which of these belongs to the browser rather than the JavaScript engine?',
      choices: [
        'The call stack',
        'The microtask queue',
        'The task queue and the event loop itself',
        '<code>Promise</code> resolution semantics'
      ],
      a: 2,
      why: 'The stack and microtask queue are V8\'s; the task queues and the loop that drives them belong to the host environment. That is exactly why <code>setTimeout</code> is not in the ECMAScript spec but <code>Promise</code> is.'
    },
    {
      id: 's08', track: 'frontend-senior', module: 'fe-thread',
      q: 'A product manager says the React app is slow. What is the first thing to establish?',
      choices: [
        'Whether the bundle is over 1MB',
        'Whether it is slow to load or slow to respond to input',
        'Whether the components are wrapped in <code>memo</code>',
        'Whether the app uses Server Components'
      ],
      a: 1,
      why: 'They are two unrelated investigations with two different toolsets, and guessing wrong wastes the week. A useful proxy question if they cannot say: slow the first time is loading, slow every time is responsiveness.'
    },
    {
      id: 's09', track: 'frontend-senior', module: 'fe-thread',
      q: 'Which fix for excessive re-renders is structural rather than a caching layer?',
      choices: [
        'Wrapping child components in <code>React.memo</code>',
        'Wrapping callbacks in <code>useCallback</code>',
        'Moving state down to the component that actually reads it',
        'Wrapping derived values in <code>useMemo</code>'
      ],
      a: 2,
      why: 'State lifted higher than necessary turns every keystroke into a full-tree render. Pushing it down removes the re-renders instead of caching around them, and it needs no memoisation at all — which is why it is usually the biggest win.'
    },

    /* ---------- Module 02: JavaScript data and memory ---------- */
    {
      id: 's10', track: 'frontend-senior', module: 'fe-data',
      q: 'After <code>obj[1] = \'a\'; obj[\'1\'] = \'b\';</code> what is <code>Object.keys(obj).length</code>?',
      choices: ['2', '1', '0', 'It throws a TypeError'],
      a: 1,
      why: 'Object keys are strings, so the number <code>1</code> is coerced to <code>\'1\'</code> and the second write overwrites the first. A <code>Map</code> would keep them as two distinct keys, because it compares by identity without coercion.'
    },
    {
      id: 's11', track: 'frontend-senior', module: 'fe-data',
      q: 'Why is <code>const counts = {}; if (counts[word]) {...}</code> risky when <code>word</code> comes from user input?',
      choices: [
        'Object property lookup is O(n) for long strings',
        'Inherited keys like <code>toString</code> return a function instead of <code>undefined</code>',
        'Objects cannot hold more than 2^16 keys',
        'String keys are case-insensitive'
      ],
      a: 1,
      why: 'A plain object inherits from <code>Object.prototype</code>, so it is never really empty. <code>counts[\'toString\']</code> gives you an inherited method, and the truthiness check takes the wrong branch. A <code>Map</code> or <code>Object.create(null)</code> avoids it.'
    },
    {
      id: 's12', track: 'frontend-senior', module: 'fe-data',
      q: 'What does <code>JSON.stringify(new Map([[\'a\', 1]]))</code> produce?',
      choices: ['<code>{"a":1}</code>', '<code>[["a",1]]</code>', '<code>{}</code>', 'It throws'],
      a: 2,
      why: 'A <code>Map</code> has no own enumerable properties, so it serialises to an empty object and the data is silently lost. If it has to round-trip through JSON, use an object or convert explicitly with <code>Object.fromEntries</code>.'
    },
    {
      id: 's13', track: 'frontend-senior', module: 'fe-data',
      q: 'For <code>const o = { b: 1, 2: 2, a: 3, 1: 4 };</code> what does <code>Object.keys(o)</code> return?',
      choices: [
        '<code>[\'b\', \'2\', \'a\', \'1\']</code>',
        '<code>[\'1\', \'2\', \'b\', \'a\']</code>',
        '<code>[\'1\', \'2\', \'a\', \'b\']</code>',
        'The order is unspecified'
      ],
      a: 1,
      why: 'Integer-like keys come first in ascending numeric order, then string keys in insertion order. A <code>Map</code> preserves pure insertion order for every key type, which is one reason it is the safer choice when order matters.'
    },
    {
      id: 's14', track: 'frontend-senior', module: 'fe-data',
      q: 'Which statement about a <code>Map</code> and garbage collection is accurate?',
      choices: [
        'A <code>Map</code> cannot be garbage collected',
        'A reachable <code>Map</code> holds its keys strongly, keeping them alive',
        'A <code>Map</code> releases keys once they are removed from the DOM',
        '<code>Map</code> keys are collected but values are retained'
      ],
      a: 1,
      why: 'A <code>Map</code> is an ordinary object and is collected when nothing references it. The leak is that a <i>live</i> Map is a path from the roots to every key in it — so a removed DOM node stored as a key is still reachable and never freed.'
    },
    {
      id: 's15', track: 'frontend-senior', module: 'fe-data',
      q: 'Which is a valid <code>WeakMap</code> key?',
      choices: [
        'The string <code>\'user-42\'</code>',
        'The number <code>42</code>',
        'A DOM element',
        '<code>Symbol.for(\'user\')</code>'
      ],
      a: 2,
      why: 'Keys must be objects or non-registered symbols — they need an identity with a lifetime the collector can track. Primitives have none, and <code>Symbol.for</code> creates a registered symbol, which is deliberately kept alive by the global registry.'
    },
    {
      id: 's16', track: 'frontend-senior', module: 'fe-data',
      q: 'Why does <code>WeakMap</code> deliberately have no <code>.size</code> and no iteration?',
      choices: [
        'They were left out for performance and may be added later',
        'The result would depend on whether the collector had run, making it non-deterministic',
        'Weak references cannot be counted at the hardware level',
        'It would break structured cloning'
      ],
      a: 1,
      why: 'Exposing the keys would let you observe garbage collection, so identical code would give different answers on different runs. Rather than expose that timing, the API omits enumeration entirely.'
    },

    /* ---------- Module 03: CSS at senior depth ---------- */
    {
      id: 's17', track: 'frontend-senior', module: 'fe-css',
      q: 'An element has <code>width: 160px; padding: 20px; border: 8px solid;</code> with the browser default <code>box-sizing</code>. What is its rendered width?',
      choices: ['160px', '188px', '216px', '104px'],
      a: 2,
      why: 'The default is <code>content-box</code>, where <code>width</code> sizes only the content and padding and border are added on top: 160 + (2 &times; 20) + (2 &times; 8) = 216px. Under <code>border-box</code> it would render at exactly 160px with the content shrinking to 104px.'
    },
    {
      id: 's18', track: 'frontend-senior', module: 'fe-css',
      q: 'Where does an <code>outline</code> sit in the box model?',
      choices: [
        'Between the padding box and the border box',
        'Between the border box and the margin box, taking up that space',
        'Nowhere — it takes no space and is painted outside the border edge',
        'It replaces the border box when both are set'
      ],
      a: 2,
      why: 'Outlines do not affect layout in any way. That is exactly why <code>outline</code> is right for a focus ring — a <code>border</code> there would grow the element and shove the page around every time something received focus.'
    },
    {
      id: 's19', track: 'frontend-senior', module: 'fe-css',
      q: 'A block has <code>margin-bottom: 32px</code> and the next has <code>margin-top: 16px</code>, both in normal flow. What gap appears?',
      choices: ['48px', '32px', '16px', '24px'],
      a: 1,
      why: 'Adjacent vertical margins collapse to the larger of the two rather than adding. It only happens in normal flow — inside flexbox or grid margins never collapse, which is part of why <code>gap</code>-based layouts feel more predictable.'
    },
    {
      id: 's20', track: 'frontend-senior', module: 'fe-css',
      q: 'What is the specificity of <code>form.big-form</code>?',
      choices: ['<code>1-0-0</code>', '<code>0-1-1</code>', '<code>0-2-0</code>', '<code>1-1-0</code>'],
      a: 1,
      why: 'No id, one class and one element type gives <code>0-1-1</code>. Against <code>#my-form</code> at <code>1-0-0</code> it loses on the A column immediately — the B and C columns are never even compared.'
    },
    {
      id: 's21', track: 'frontend-senior', module: 'fe-css',
      q: 'Does a selector with eleven classes (<code>0-11-0</code>) beat a single id (<code>1-0-0</code>)?',
      choices: [
        'Yes — 11 classes outweigh 1 id',
        'No — columns are compared left to right, so any id beats any number of classes',
        'Yes, but only inside the same cascade layer',
        'It depends on source order'
      ],
      a: 1,
      why: 'Specificity is a tuple compared column by column, not a base-ten number that sums. The first difference decides, so no quantity of classes ever reaches an id. This is the single most common misunderstanding of the topic.'
    },
    {
      id: 's22', track: 'frontend-senior', module: 'fe-css',
      q: 'Two rules have identical specificity and sit in the same layer. Which wins?',
      choices: [
        'The one with the shorter selector',
        'The one that appears later in source order',
        'The one that appears first in source order',
        'Neither — the property is left at its initial value'
      ],
      a: 1,
      why: 'Specificity has no answer for an exact tie, so the cascade falls through to source order and the later rule wins. It is the step after specificity, not part of it.'
    },
    {
      id: 's23', track: 'frontend-senior', module: 'fe-css',
      q: 'What is the specificity of <code>:where(.theme-dark) .btn</code>?',
      choices: ['<code>0-2-0</code>', '<code>0-1-0</code>', '<code>1-1-0</code>', '<code>0-0-1</code>'],
      a: 1,
      why: '<code>:where()</code> always contributes zero, whatever is inside it, so only <code>.btn</code> counts. That is what makes it the right tool for shipping defaults that consumers can override without an escalation. <code>:is()</code> and <code>:not()</code> instead take the score of their most specific argument.'
    },
    {
      id: 's24', track: 'frontend-senior', module: 'fe-css',
      q: 'Which is resolved <b>before</b> specificity in the cascade?',
      choices: [
        'Source order',
        'Cascade layer order',
        'The number of matching elements',
        'Selector length'
      ],
      a: 1,
      why: 'The order is origin and importance, then cascade layers, then specificity, then source order. A rule in a later layer wins whatever its selectors look like — which is why layers are the modern way out of specificity fights.'
    },
    {
      id: 's25', track: 'frontend-senior', module: 'fe-css',
      q: 'Which technique makes a card grid responsive with no media query at all?',
      choices: [
        '<code>grid-template-columns: repeat(4, 1fr)</code> plus breakpoints',
        '<code>grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))</code>',
        '<code>display: block</code> with percentage widths',
        '<code>float: left</code> with a clearfix'
      ],
      a: 1,
      why: '<code>auto-fit</code> with <code>minmax</code> fits as many columns as there is room for and shares the remainder — four across on a desktop, one on a phone, and every step in between. Every breakpoint you write is a size you thought of; the bug is always at one you did not.'
    },
    {
      id: 's26', track: 'frontend-senior', module: 'fe-css',
      q: 'Why can a media query not make a card component fully reusable?',
      choices: [
        'Media queries cannot target width, only device type',
        'It measures the viewport, not the space the component was actually given',
        'Media queries do not apply to grid children',
        'It only evaluates once, at page load'
      ],
      a: 1,
      why: 'The same card in a wide main column and in a narrow sidebar needs different layouts at one screen size, and a media query cannot express that. A container query asks about the component\'s own container instead, and has been available in every major browser since early 2023.'
    },
    {
      id: 's27', track: 'frontend-senior', module: 'fe-css',
      q: 'Which is the best use of a fixed pixel value in an otherwise relative layout?',
      choices: [
        'A container max-width',
        'Body text size',
        'A one-pixel hairline border',
        'Vertical section spacing'
      ],
      a: 2,
      why: '"Never use pixels" is too strong. Anything tied to text or layout should be relative so it respects the user\'s font-size setting, but decoration that should not scale — hairlines, small shadow offsets, tiny radii — is exactly what pixels are for.'
    },

    /* ---------- Module 04: engineering with AI ---------- */
    {
      id: 's28', track: 'frontend-senior', module: 'fe-ai',
      q: 'Which file in a 90-file AI-generated pull request deserves line-by-line review first?',
      choices: [
        'The largest new component',
        '<code>package.json</code>, for an added dependency',
        'The test files, because there are the most of them',
        'The CSS, because models hardcode values'
      ],
      a: 1,
      why: 'Blast radius decides where the attention goes. A new dependency is one line that adds bundle weight on every page and brings its own dependency tree, and no reviewer skimming components will spot it. A clumsy leaf component is a rounding error by comparison.'
    },
    {
      id: 's29', track: 'frontend-senior', module: 'fe-ai',
      q: 'What is described as the most expensive habit a coding agent has in front-end work?',
      choices: [
        'Writing overly clever one-liners',
        'Duplicating state so one piece of data lives in several places',
        'Using too many comments',
        'Preferring class components'
      ],
      a: 1,
      why: 'It works on the day it is written, passes review and passes tests, then produces desynchronisation bugs for a year. Stating the single-source-of-truth constraint up front is cheaper than finding the duplicates later.'
    },
    {
      id: 's30', track: 'frontend-senior', module: 'fe-ai',
      q: 'Why encode a rule as a lint rule rather than putting it in a prompt or rules file?',
      choices: [
        'Lint rules use fewer tokens',
        'Prompts are suggestions that drift and get skipped; a lint rule is enforced on every run',
        'Prompt files are not supported by most agents',
        'Lint rules run on the GPU'
      ],
      a: 1,
      why: 'Anything you would say twice in review belongs in configuration. A deterministic check fires whether or not anyone remembered it, which is the whole reason to prefer it over instructions.'
    },
    {
      id: 's31', track: 'frontend-senior', module: 'fe-ai',
      q: 'What is the main argument for putting static analysis ahead of LLM-based review?',
      choices: [
        'It catches more bug classes',
        'It is deterministic, fast and free, where a model review is probabilistic, slow and metered',
        'It can detect wrong abstractions',
        'It replaces the need for tests'
      ],
      a: 1,
      why: 'Static checks give the same answer every run in seconds at no marginal cost. Use them for everything they cover and save the expensive, variable judgement for what is left — which is the part they structurally cannot do.'
    },
    {
      id: 's32', track: 'frontend-senior', module: 'fe-ai',
      q: 'Which static check is aimed most directly at how coding agents fail?',
      choices: [
        'Formatting with Prettier',
        'Duplication analysis with a tool like <code>jscpd</code>',
        'Import sorting',
        'Checking for <code>console.log</code>'
      ],
      a: 1,
      why: 'An agent that cannot see the whole repository re-implements what already exists, and no individual diff ever looks wrong. Duplication analysis is the check that sees it across the codebase, and almost nobody mentions it.'
    },
    {
      id: 's33', track: 'frontend-senior', module: 'fe-ai',
      q: 'What does a coverage percentage actually measure?',
      choices: [
        'How many behaviours are verified',
        'Which lines executed while the suite ran',
        'How likely the suite is to catch a regression',
        'The ratio of test code to source code'
      ],
      a: 1,
      why: 'It counts execution, not assertion. A generated test can render a component, assert only that it exists, and reach every line while checking nothing — which is why the number is a floor for finding untested areas, never a target.'
    },
    {
      id: 's34', track: 'frontend-senior', module: 'fe-ai',
      q: 'What is the strongest argument against replacing unit tests with end-to-end tests alone?',
      choices: [
        'End-to-end tests are more likely to be flaky',
        'A failure tells you something broke but not where, which is expensive in a codebase you did not write',
        'End-to-end tests cannot run in CI',
        'Coverage tools cannot measure end-to-end tests'
      ],
      a: 1,
      why: 'Unit tests are not there to prove it works — they narrow down where it stopped working. That is worth more, not less, when generated code means your own knowledge of the codebase is no longer available as a substitute.'
    },
    {
      id: 's35', track: 'frontend-senior', module: 'fe-ai',
      q: 'Which change in an AI pull request is hardest to catch and most worth watching for?',
      choices: [
        'A new component with duplicated styles',
        'A weakened assertion in an existing test',
        'An added TypeScript type',
        'A renamed variable'
      ],
      a: 1,
      why: 'An agent that cannot make a test pass will sometimes adjust the test until it does. Coverage stays flat, CI goes green, and the guarantee is gone — which is why edits to existing test files deserve more attention than new ones.'
    },
    {
      id: 's36', track: 'frontend-senior', module: 'fe-ai',
      q: 'What is the primary lever for reducing token spend on a feature?',
      choices: [
        'Instructing the model to use fewer words',
        'Reducing the number of files a feature has to touch',
        'Choosing a smaller model',
        'Disabling extended reasoning'
      ],
      a: 1,
      why: 'Terser prompts trim output at the margin. A codebase where a feature is composed from existing components and tokens instead of written fresh reduces both what is read and what is written — which is just modularity and reuse, with the bill itemised.'
    },

    /* ---------- Module 05: front-end system design ---------- */
    {
      id: 's37', track: 'frontend-senior', module: 'fe-system',
      q: 'Which design system layer makes a rebrand a one-line change?',
      choices: [
        'Composed components',
        'Design tokens as CSS custom properties',
        'Storybook',
        'Headless primitives'
      ],
      a: 1,
      why: 'Every repeated value gets a name and components reference only the name, so a rebrand, a second tenant or a dark theme becomes a block of variable reassignments rather than a search across the codebase.'
    },
    {
      id: 's38', track: 'frontend-senior', module: 'fe-system',
      q: 'What is the argument for a headless library like Radix over building your own primitives?',
      choices: [
        'It is smaller than hand-written components',
        'You own the visual identity and borrow the interaction behaviour, which is hard to get right',
        'It removes the need for design tokens',
        'It generates components from Figma automatically'
      ],
      a: 1,
      why: 'A keyboard-accessible combobox or a modal with correct focus trapping takes weeks and stays subtly wrong for longer. Nobody differentiates on their own dropdown implementation — but everybody differentiates on how it looks.'
    },
    {
      id: 's39', track: 'frontend-senior', module: 'fe-system',
      q: 'With content-hashed filenames, what is the correct <code>Cache-Control</code> for <code>app.d4e5f6.js</code>?',
      choices: [
        '<code>max-age=300</code> — it changes every deploy',
        '<code>max-age=31536000, immutable</code>',
        '<code>no-store</code>',
        '<code>max-age=604800</code> — one week'
      ],
      a: 1,
      why: 'The hash is the cache key, so the file at that URL can never change and a one-year lifetime is safe. <code>immutable</code> also stops the browser sending a revalidation request. A new build produces a new filename, which is a new download.'
    },
    {
      id: 's40', track: 'frontend-senior', module: 'fe-system',
      q: 'Which file must <b>not</b> be aggressively cached in that setup?',
      choices: [
        '<code>vendor.a1b2c3.js</code>',
        '<code>index.html</code>',
        'The font files',
        'The hashed CSS bundle'
      ],
      a: 1,
      why: '<code>index.html</code> is the entry point that names the current hashed bundles. Cache it and deploys never land. It is small, so fetching it every time costs almost nothing and makes the deploy atomic.'
    },
    {
      id: 's41', track: 'frontend-senior', module: 'fe-system',
      q: 'What bug does time-based <code>max-age</code> on separate JS bundles produce?',
      choices: [
        'The CDN stops compressing responses',
        'Bundles expire independently, so a user runs a new <code>app.js</code> against a cached <code>vendor.js</code>',
        'The browser refuses to execute the scripts',
        'Source maps stop resolving'
      ],
      a: 1,
      why: 'Cache lifetimes become a guess about deploy frequency, and the two bundles age out at different moments. The resulting version mismatch reproduces for nobody and shows up as an impossible stack trace. Content hashing removes the guess entirely.'
    },
    {
      id: 's42', track: 'frontend-senior', module: 'fe-system',
      q: 'Moving from client rendering to SSR changes the scaling problem how?',
      choices: [
        'It removes the need for a CDN',
        'Every page view becomes compute you own, adding a throughput bottleneck and origin latency',
        'It makes bundle size irrelevant',
        'It shifts the cost entirely to the database'
      ],
      a: 1,
      why: 'Static assets are a solved problem; rendered HTML is not. Throughput is fixed with stateless renders and aggressive caching — most SSR scaling is really a caching exercise — and latency is fixed by rendering closer to the user.'
    },
    {
      id: 's43', track: 'frontend-senior', module: 'fe-system',
      q: 'Why is SSE, rather than WebSocket, the right transport for streaming LLM output?',
      choices: [
        'WebSocket cannot stream text',
        'The traffic is asymmetric — one request, then a one-way stream back — so a bidirectional connection buys nothing',
        'SSE is faster per byte',
        'WebSocket is not supported behind proxies'
      ],
      a: 1,
      why: 'The UI is a chat but the protocol traffic is not conversational. SSE is plain HTTP, so proxies and HTTP/2 handle it normally, and reconnection with <code>Last-Event-ID</code> is built in. WebSocket is right when the server pushes unprompted — presence, collaboration, human-to-human chat.'
    },
    {
      id: 's44', track: 'frontend-senior', module: 'fe-system',
      q: 'Why do the OpenAI and Anthropic SDKs not use the browser\'s native <code>EventSource</code>?',
      choices: [
        '<code>EventSource</code> does not support JSON payloads',
        'It is GET-only and cannot set request headers, so it cannot POST a conversation with an <code>Authorization</code> header',
        'It is deprecated in modern browsers',
        'It cannot handle more than 100 events per connection'
      ],
      a: 1,
      why: 'The transport really is SSE, but the client cannot be <code>EventSource</code>. They use <code>fetch</code> with a POST, read <code>response.body</code> as a stream and parse the <code>text/event-stream</code> frames by hand before handing you an async iterator.'
    },
    {
      id: 's45', track: 'frontend-senior', module: 'fe-system',
      q: 'What limit bites SSE over HTTP/1.1 but effectively disappears over HTTP/2?',
      choices: [
        'A 64KB maximum message size',
        'Roughly six connections per origin, one of which each open stream holds',
        'A 30-second idle timeout',
        'No support for custom event names'
      ],
      a: 1,
      why: 'A held-open stream occupies one of the six for its whole life, so a few open tabs stall everything else on the origin. HTTP/2 multiplexes over one connection, which is why this rarely bites in production but reliably bites in local development.'
    }
  );
})(window.PREP);
