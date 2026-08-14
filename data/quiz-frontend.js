/* Frontend question bank — React and React Native. */
(function (P) {
  P.quiz.push(
    /* ---------- React ---------- */
    {
      id: 'f01', track: 'frontend', module: 'react',
      q: 'A handler runs <code>setN(n + 1)</code> twice with <code>n === 0</code>. What is the next rendered value?',
      choices: ['2', '1', '0', 'It depends on whether the handler is async'],
      a: 1,
      why: '<code>n</code> is captured from the current render, so both calls compute <code>0 + 1</code>. The updater form <code>setN(x => x + 1)</code> reads the latest queued value and would give 2.'
    },
    {
      id: 'f02', track: 'frontend', module: 'react',
      q: 'Rows in a re-orderable list use <code>key={index}</code>. What breaks?',
      choices: [
        'Nothing — index keys are equivalent to IDs',
        'React reuses the wrong component instance, so internal state, focus, and inputs follow the wrong row',
        'The list stops rendering entirely',
        'Only server-side rendering is affected'
      ],
      a: 1,
      why: 'Keys are identity. An index ties identity to position, so after an insert or sort React matches new data to old instances, and anything the instance held moves to the wrong item.'
    },
    {
      id: 'f03', track: 'frontend', module: 'react',
      q: 'Why must hooks be called unconditionally at the top level?',
      choices: [
        'To keep the code readable',
        'React matches hook calls to stored state by call order, so a changed order returns the wrong slot',
        'Because hooks are asynchronous',
        'It is only a lint preference, not a runtime requirement'
      ],
      a: 1,
      why: 'Hook state lives in an ordered list on the fiber, indexed by call position. Branching around a hook shifts every subsequent index.'
    },
    {
      id: 'f04', track: 'frontend', module: 'react',
      q: 'Which of these genuinely needs a <code>useEffect</code>?',
      choices: [
        'Computing a full name from first and last name props',
        'Subscribing to a websocket for the current room',
        'Sending an analytics event when a button is clicked',
        'Resetting a form when the selected user changes'
      ],
      a: 1,
      why: 'Effects synchronise with external systems. Derived values belong in render, click logic belongs in the handler, and resetting state on a prop change is best done with a <code>key</code>.'
    },
    {
      id: 'f05', track: 'frontend', module: 'react',
      q: 'When does an effect cleanup function run?',
      choices: [
        'Only on unmount',
        'Before every re-run of the effect, and on unmount',
        'After every render, unconditionally',
        'Only when the dependency array is empty'
      ],
      a: 1,
      why: 'React tears down the previous effect before re-synchronising with new dependencies, and once more when the component unmounts. StrictMode exercises this extra time in development to surface incomplete cleanup.'
    },
    {
      id: 'f06', track: 'frontend', module: 'react',
      q: 'A component wrapped in <code>memo</code> still re-renders every time. Most likely cause?',
      choices: [
        'memo only works on class components',
        'A prop is a new object, array, or arrow function created inline on each parent render',
        'The component has internal state',
        'memo requires a custom comparison to work at all'
      ],
      a: 1,
      why: 'memo does a shallow prop comparison. A fresh reference fails it every time — including <code>children</code> as inline JSX. Stabilise with useMemo/useCallback or hoist the value.'
    },
    {
      id: 'f07', track: 'frontend', module: 'react',
      q: 'What happens to consumers when a context provider\'s <code>value</code> object is recreated each render?',
      choices: [
        'Only components reading the changed field re-render',
        'Every consumer of that context re-renders',
        'React deep-compares the value and skips it',
        'Nothing until the provider unmounts'
      ],
      a: 1,
      why: 'Context has no selector. A new value reference notifies all consumers. Fix by memoising the value and splitting contexts by change frequency, or use an external store with selective subscription.'
    },
    {
      id: 'f08', track: 'frontend', module: 'react',
      q: 'Typing in a search box is janky because filtering 10,000 rows blocks each keystroke. Best React 18+ tool?',
      choices: [
        '<code>useDeferredValue</code> or <code>startTransition</code> for the list update',
        '<code>useLayoutEffect</code> around the filter',
        'Wrapping the input in <code>memo</code>',
        'Debouncing with <code>setTimeout</code> only'
      ],
      a: 0,
      why: 'Marking the list update non-urgent lets React keep the input responsive and render the expensive result at lower priority. Debouncing helps too, but it delays everything rather than prioritising.'
    },
    {
      id: 'f09', track: 'frontend', module: 'react',
      q: 'Which error does an error boundary <b>not</b> catch?',
      choices: [
        'An error thrown during a child\'s render',
        'An error thrown in a child\'s lifecycle method',
        'An error thrown inside an <code>onClick</code> handler',
        'An error thrown in a child\'s constructor'
      ],
      a: 2,
      why: 'Error boundaries catch errors in the render phase of the tree below them. Event handlers, async callbacks, and timers are outside that, so they need their own try/catch.'
    },
    {
      id: 'f10', track: 'frontend', module: 'react',
      q: 'Which state genuinely belongs in a global store rather than a query cache?',
      choices: [
        'The list of orders fetched from <code>/api/orders</code>',
        'The currently open modal and the selected filter chips',
        'The logged-in user profile fetched at startup',
        'Product details for the current page'
      ],
      a: 1,
      why: 'Anything that came from the server is a cache with staleness and refetch semantics — the job of TanStack Query or SWR. UI state that exists only on the client is what a store is actually for.'
    },
    {
      id: 'f11', track: 'frontend', module: 'react',
      q: 'What makes a React component "pure" in the sense React requires?',
      choices: [
        'It has no props',
        'Given the same props and state it returns the same output and causes no side effects during render',
        'It is defined with an arrow function',
        'It never uses hooks'
      ],
      a: 1,
      why: 'Purity is what lets React call a component more than once, abandon a render, or replay it in StrictMode. Mutating externals or writing to the DOM during render breaks those guarantees.'
    },
    {
      id: 'f12', track: 'frontend', module: 'react',
      q: 'You call <code>arr.push(item)</code> then <code>setArr(arr)</code>. What does React do?',
      choices: [
        'Re-renders with the new item',
        'Bails out, because the reference is unchanged',
        'Throws a runtime error',
        'Re-renders twice'
      ],
      a: 1,
      why: 'React compares with <code>Object.is</code>. Same reference means no update is scheduled, and the mutated data may still appear later via an unrelated render — a confusing bug. Always set a new array.'
    },
    {
      id: 'f13', track: 'frontend', module: 'react',
      q: 'What is the difference between <code>useEffect</code> and <code>useLayoutEffect</code>?',
      choices: [
        'useLayoutEffect runs synchronously after DOM mutation and before paint',
        'useLayoutEffect only runs on mount',
        'useEffect cannot return a cleanup function',
        'They are identical outside server rendering'
      ],
      a: 0,
      why: 'useLayoutEffect blocks paint, which is what you want for measuring a node and adjusting before the user sees it — and exactly why it should be rare.'
    },
    {
      id: 'f14', track: 'frontend', module: 'react',
      q: 'The most reliable way to fully reset a child component\'s internal state when a prop changes:',
      choices: [
        'An effect that calls every setter',
        'Give the child a <code>key</code> derived from that prop',
        'Wrap the child in <code>memo</code>',
        'Call <code>forceUpdate</code> on the parent'
      ],
      a: 1,
      why: 'A changed key makes React unmount the old instance and mount a fresh one, discarding all of its state — declaratively and without a render pass showing stale values.'
    },
    {
      id: 'f15', track: 'frontend', module: 'react',
      q: 'What does <code>useRef</code> give you that <code>useState</code> does not?',
      choices: [
        'A mutable value that persists across renders without triggering a re-render when changed',
        'Automatic DOM cleanup',
        'A value shared between all instances of the component',
        'Server-side persistence'
      ],
      a: 0,
      why: 'A ref is an escape hatch for values React should not react to: DOM nodes, timer IDs, previous values, an in-flight request flag. Never read or write <code>ref.current</code> during render.'
    },

    /* ---------- React in practice ---------- */
    {
      id: 'f31', track: 'frontend', module: 'rx',
      q: 'A parent fetches, renders, and only then does the child start its own request. What is this called and how do you fix it?',
      choices: [
        'A hydration mismatch — render on the server instead',
        'A request waterfall — hoist or parallelise the requests, or fetch in a route loader',
        'A memory leak — add a cleanup function',
        'A stale closure — add the dependency'
      ],
      a: 1,
      why: 'Each level of the tree serialises its own round trip, so total latency is the sum rather than the max. Start the requests together, or move them above the render with a loader or server component.'
    },
    {
      id: 'f32', track: 'frontend', module: 'rx',
      q: 'In TanStack Query, what does the <code>queryKey</code> do?',
      choices: [
        'It sets the request URL',
        'It is the cache identity — deduping, invalidation, and refetch all key off it',
        'It controls retry count',
        'It is only used by devtools'
      ],
      a: 1,
      why: 'Two components with the same key share one request and one cache entry, and invalidating that key is what refetches after a mutation. Every value the query depends on must be in it.'
    },
    {
      id: 'f33', track: 'frontend', module: 'rx',
      q: 'React warns that an input changed from uncontrolled to controlled. What caused it?',
      choices: [
        'The <code>value</code> prop started as <code>undefined</code> and later became a string',
        'The input was missing a <code>name</code>',
        'The form had no <code>onSubmit</code>',
        'The component re-rendered too often'
      ],
      a: 0,
      why: 'An undefined value means React leaves the DOM in charge; once a real value arrives React takes over. Initialise with an empty string, or use <code>defaultValue</code> and stay uncontrolled.'
    },
    {
      id: 'f34', track: 'frontend', module: 'rx',
      q: 'Which Testing Library query should you reach for first?',
      choices: [
        '<code>getByTestId</code>',
        '<code>getByRole</code> with an accessible name',
        '<code>container.querySelector</code>',
        '<code>getByClassName</code>'
      ],
      a: 1,
      why: 'Role plus name is how assistive technology and users find a control, so the test breaks only when the user-visible behaviour breaks. Test IDs are the last resort and class selectors are not a query at all.'
    },
    {
      id: 'f35', track: 'frontend', module: 'rx',
      q: 'A server-rendered component calls <code>new Date().toLocaleString()</code> during render. What goes wrong?',
      choices: [
        'Nothing — dates are serialised safely',
        'A hydration mismatch, because the server HTML and the first client render differ',
        'The build fails',
        'It leaks memory on the server'
      ],
      a: 1,
      why: 'Hydration requires the first client render to match the server HTML exactly. Time, randomness, locale, and <code>window</code> are all nondeterministic — move them into an effect or render them client-only.'
    },
    {
      id: 'f36', track: 'frontend', module: 'rx',
      q: 'What does a React Server Component give you that a client component does not?',
      choices: [
        'Faster state updates',
        'It runs only on the server, can access data sources directly, and ships no JavaScript for itself',
        'Automatic memoisation of all children',
        'Access to browser APIs during render'
      ],
      a: 1,
      why: 'RSCs move data work and their own code off the client entirely. Anything interactive — state, effects, event handlers — has to be a client component below them.'
    },

    /* ---------- React Native ---------- */
    {
      id: 'f16', track: 'frontend', module: 'rn',
      q: 'What replaced the asynchronous bridge in the new React Native architecture?',
      choices: [
        'A faster JSON serialiser',
        'JSI, letting JavaScript hold references to C++ objects and call them directly',
        'A WebAssembly runtime',
        'A dedicated worker thread per native module'
      ],
      a: 1,
      why: 'JSI removes the serialise-and-queue step. On top of it sit Fabric (the C++ renderer), TurboModules (lazily loaded native modules), and Codegen (type-safe interfaces from a TypeScript spec).'
    },
    {
      id: 'f17', track: 'frontend', module: 'rn',
      q: 'Which thread computes flexbox layout in React Native?',
      choices: ['The JS thread', 'The main/UI thread', 'The shadow thread, via Yoga', 'The GPU'],
      a: 2,
      why: 'Yoga computes layout off the main thread on the shadow thread, then the resulting positions are applied to native views on the UI thread.'
    },
    {
      id: 'f18', track: 'frontend', module: 'rn',
      q: 'Which properties can the native animation driver handle?',
      choices: [
        'Any style property',
        'Only <code>transform</code> and <code>opacity</code> — anything that does not trigger layout',
        'Only <code>width</code> and <code>height</code>',
        'Only colours'
      ],
      a: 1,
      why: 'Layout-affecting properties must go through Yoga, so they cannot be driven natively. Animate <code>scale</code> and <code>translate</code> rather than <code>width</code> and <code>top</code>.'
    },
    {
      id: 'f19', track: 'frontend', module: 'rn',
      q: 'A feed of 500 items in a <code>ScrollView</code> is slow. Why?',
      choices: [
        'ScrollView renders and mounts every child immediately, with no virtualisation',
        'ScrollView cannot render images',
        'ScrollView runs on the JS thread and FlatList does not',
        'ScrollView re-renders on every scroll event'
      ],
      a: 0,
      why: 'FlatList keeps a window of rows around the viewport and unmounts the rest. ScrollView holds the entire tree in memory, so mount cost and memory grow linearly with the data.'
    },
    {
      id: 'f20', track: 'frontend', module: 'rn',
      q: 'Which FlatList prop lets it skip measuring rows during scrolling?',
      choices: ['<code>removeClippedSubviews</code>', '<code>getItemLayout</code>', '<code>windowSize</code>', '<code>initialNumToRender</code>'],
      a: 1,
      why: 'Supplying <code>getItemLayout</code> tells the list each row\'s height and offset up front, enabling instant scroll-to-index and removing on-the-fly measurement. It only applies when heights are fixed.'
    },
    {
      id: 'f21', track: 'frontend', module: 'rn',
      q: 'You pass an inline arrow to <code>renderItem</code> and memoise the row component. What happens?',
      choices: [
        'The memo works normally',
        'A new function identity every render can defeat the row memoisation and re-render rows',
        'FlatList throws a warning and stops virtualising',
        'Nothing — renderItem identity is ignored'
      ],
      a: 1,
      why: 'Unstable references propagate through the list into the rows. Wrap <code>renderItem</code> and <code>keyExtractor</code> in <code>useCallback</code> and keep row styles out of the render body.'
    },
    {
      id: 'f22', track: 'frontend', module: 'rn',
      q: 'What is the frame budget at 60 fps?',
      choices: ['About 33 ms', 'About 16 ms', 'About 100 ms', 'About 4 ms'],
      a: 1,
      why: '1000/60 is roughly 16.7 ms per frame, and about 8 ms on a 120 Hz display. Any JS-thread work that exceeds it in a single tick shows up as a dropped frame.'
    },
    {
      id: 'f23', track: 'frontend', module: 'rn',
      q: 'Why does Reanimated handle gestures better than a JS-driven <code>Animated</code> value?',
      choices: [
        'It uses the GPU directly',
        'Worklets run on the UI thread, so the animation continues even while the JS thread is busy',
        'It skips layout entirely',
        'It caches frames ahead of time'
      ],
      a: 1,
      why: 'A JS-driven animation needs the JS thread every frame. A worklet is compiled to run on the UI thread alongside natively recognised gestures, so a busy JS thread does not stall the interaction.'
    },
    {
      id: 'f24', track: 'frontend', module: 'rn',
      q: 'Which statement about styling in React Native is true?',
      choices: [
        'Styles cascade from parent to child like CSS',
        '<code>flexDirection</code> defaults to <code>column</code> and there is no cascade',
        'Media queries are supported natively',
        'Percentage units work for every property'
      ],
      a: 1,
      why: 'Styles are plain objects applied per component, with no inheritance beyond some text properties. Flex defaults to column, and responsiveness comes from <code>useWindowDimensions</code> rather than media queries.'
    },
    {
      id: 'f25', track: 'frontend', module: 'rn',
      q: 'Where should an authentication token be stored in a React Native app?',
      choices: [
        'In the JS bundle as a constant',
        'In AsyncStorage, which is encrypted by default',
        'In Keychain (iOS) or Keystore (Android) via a secure-storage library',
        'In a Redux store only'
      ],
      a: 2,
      why: 'AsyncStorage is unencrypted plain storage, and anything in the bundle is readable by anyone who unzips the app. Secrets go to the platform secure store, and true secrets stay server-side.'
    },
    {
      id: 'f26', track: 'frontend', module: 'rn',
      q: 'What can an over-the-air update ship?',
      choices: [
        'JavaScript and asset changes only',
        'Any change, including new native dependencies',
        'Only configuration values',
        'Nothing — every change requires review'
      ],
      a: 0,
      why: 'OTA replaces the JS bundle and assets. Adding or upgrading a native module changes the binary, so it needs a new store build.'
    },
    {
      id: 'f27', track: 'frontend', module: 'rn',
      q: 'You benchmark in the simulator with a debug build and performance looks fine. Why is that misleading?',
      choices: [
        'The simulator has no network stack',
        'Debug builds skip optimisation and run JS differently; real devices are slower and thermally limited',
        'Debug builds disable the UI thread',
        'The simulator caps the frame rate at 30 fps'
      ],
      a: 1,
      why: 'Debug builds carry dev-mode checks and different bundling, and desktop hardware dwarfs a mid-range phone. Always profile a release build on a real, ideally low-end, device.'
    },
    {
      id: 'f28', track: 'frontend', module: 'rn',
      q: 'What is Hermes?',
      choices: [
        'The native module bridge',
        'A JavaScript engine optimised for mobile, using ahead-of-time bytecode for fast startup',
        'The layout engine',
        'A navigation library'
      ],
      a: 1,
      why: 'Hermes is the default engine. Precompiling to bytecode removes parse time at launch and lowers memory, which matters most on low-end Android.'
    },
    {
      id: 'f29', track: 'frontend', module: 'rn',
      q: 'Rendering a plain string directly inside a <code>&lt;View&gt;</code> does what?',
      choices: [
        'Renders it with default styling',
        'Throws an error — text must be wrapped in a <code>&lt;Text&gt;</code>',
        'Silently renders nothing',
        'Works on iOS but not Android'
      ],
      a: 1,
      why: 'There is no DOM and no implicit text node. Every string has to live inside a <code>Text</code> component, which is also the only place text styles apply.'
    },
    {
      id: 'f30', track: 'frontend', module: 'rn',
      q: 'Which approach handles notches, the dynamic island, and the Android gesture bar correctly?',
      choices: [
        'Hardcoding a top padding of 44',
        'Reading safe-area insets, for example with <code>useSafeAreaInsets</code>',
        'Setting <code>flex: 1</code> on the root view',
        'Using <code>Dimensions.get("screen")</code>'
      ],
      a: 1,
      why: 'Inset values differ across devices and orientations, and change with the keyboard and system UI. The safe-area context reports the real values at runtime.'
    }
  );
})(window.PREP);
