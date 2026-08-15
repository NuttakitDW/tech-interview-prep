/* React rendering model + hooks. */
(function (P) {
  P.modules.push({
    id: 'react',
    track: 'frontend',
    title: 'React, the rendering model',
    kicker: 'Module 04',
    blurb:
      'Almost every React question reduces to one thing: do you know when a component re-renders and what React does with the result. Answer from the model, not from habit.',
    concepts: [
      {
        id: 'rc-render',
        title: 'Render phase vs commit phase',
        tags: ['core', 'hot'],
        ask: 'What happens when you call setState?',
        body: [
          { p: 'React schedules a render. In the <b>render phase</b> it calls your component function — which must be pure — and gets back a description of the UI. It diffs that against the previous tree. In the <b>commit phase</b> it applies the minimum set of DOM mutations, then runs layout effects synchronously and passive effects after paint.' },
          { p: 'Rendering is not the same as updating the DOM. A component can re-render and produce identical output, in which case the commit does nothing. That is why "it re-rendered" is not automatically a bug — but it is why render functions must have no side effects.' },
          {
            code: {
              lang: 'jsx',
              src: `function Counter() {
  const [n, setN] = useState(0);

  function onClick() {
    setN(n + 1);
    setN(n + 1);        // still 1: n is captured from this render
    setN(x => x + 1);   // updater form reads the latest queued value
  }

  // WRONG: side effect during render
  // document.title = n;

  return <button onClick={onClick}>{n}</button>;
}`
            }
          },
          { p: 'State updates are batched — since React 18, in every context including promises and timeouts, not just event handlers. Each render sees a frozen snapshot of its props and state; that snapshot is what closures capture.' }
        ],
        say:
          'setState marks the component dirty and schedules a render. React re-runs the function, diffs the result, and commits only the differences. Updates batch, and each render closes over its own snapshot of state — which is why the updater form exists.',
        traps: [
          'Calling <code>setN(n + 1)</code> twice and expecting +2.',
          'Mutating state in place — <code>arr.push(x); setArr(arr)</code> keeps the same reference so React bails out.',
          'Side effects during render: subscriptions, DOM writes, network calls.'
        ]
      },
      {
        id: 'rc-keys',
        title: 'Reconciliation and keys',
        tags: ['core', 'hot'],
        ask: 'Why is index as a key a problem?',
        body: [
          { p: 'React compares the old and new element trees by position and type. If the type at a position changes, it unmounts the whole subtree and mounts a new one, losing its state. Within a list, <code>key</code> overrides positional matching and tells React which item is which across renders.' },
          { p: 'An index key says "the item at slot 0 is the same item as before". Insert at the front, or sort, and that is false: React reuses the wrong component instance. Uncontrolled input values, focus, animation state, and scroll position all follow the wrong row.' },
          {
            code: {
              lang: 'jsx',
              src: `// breaks on insert, delete, or reorder
{todos.map((todo, i) => <TodoRow key={i} todo={todo} />)}

// stable identity survives any reordering
{todos.map(todo => <TodoRow key={todo.id} todo={todo} />)}

// keys are also a deliberate reset tool:
<ProfileForm key={userId} user={user} />   // new user -> fresh state`
            }
          },
          {
            note: [
              'Index keys are fine for a list that is static, never reordered, never filtered, and whose rows hold no internal state. That is rarer than people assume.'
            ]
          }
        ],
        say:
          'Keys give list children a stable identity between renders. Index keys tie identity to position, so any insert or reorder makes React reuse the wrong instance and state follows the wrong row. I also use a key on a component to intentionally reset its state.',
        traps: [
          '<code>key={Math.random()}</code> — remounts every child on every render.',
          'Keys that are only unique within a fragment of the list.',
          'Expecting a key change to preserve state — it does the opposite.'
        ]
      },
      {
        id: 'rc-hooks-rules',
        title: 'Why hooks have rules',
        tags: ['hooks'],
        ask: 'Why can you not call a hook inside a condition?',
        body: [
          { p: 'React stores hook state as an ordered list on the fiber. There is no name attached — the Nth <code>useState</code> call maps to the Nth slot. Calling hooks conditionally shifts that order between renders, and slot 2 suddenly returns another hook\'s state.' },
          { p: 'Hence: call hooks at the top level, only from components or other hooks, in the same order every render. Conditionals go inside the hook, not around it.' },
          {
            code: {
              lang: 'jsx',
              src: `// WRONG — hook order changes with the prop
if (userId) { const [u, setU] = useState(null); }

// RIGHT — the condition lives inside
const [u, setU] = useState(null);
useEffect(() => {
  if (!userId) return;
  let cancelled = false;
  fetchUser(userId).then(d => { if (!cancelled) setU(d); });
  return () => { cancelled = true; };   // ignore a stale response
}, [userId]);`
            }
          }
        ],
        say:
          'Hook state is positional — React matches calls to slots by call order, not by name. Any branching around a hook shifts that order and corrupts state, so the branch has to live inside the hook.',
        traps: [
          'An early <code>return</code> above a hook call.',
          'Hooks inside loops or callbacks.',
          'Silencing the exhaustive-deps lint rule instead of fixing the dependency.'
        ]
      },
      {
        id: 'rc-effects',
        title: 'useEffect: when not to use it',
        tags: ['hooks', 'hot'],
        ask: 'What is useEffect actually for?',
        body: [
          { p: 'Effects synchronise your component with something <em>outside</em> React: a subscription, a timer, a websocket, an imperative DOM API, an analytics call. If nothing external is involved, an effect is usually the wrong tool.' },
          {
            list: [
              '<b>Derived value</b> — compute it during render. Do not mirror props into state in an effect; that renders twice and can flash the wrong value.',
              '<b>Reacting to a user action</b> — put the logic in the event handler, where you know why it happened.',
              '<b>Resetting state when a prop changes</b> — use a <code>key</code> instead.',
              '<b>Fetching data</b> — an effect works, but a query library or the framework\'s loader handles caching, deduping, and race conditions properly.'
            ]
          },
          {
            code: {
              lang: 'jsx',
              src: `// unnecessary effect: extra render, stale for one frame
const [full, setFull] = useState('');
useEffect(() => { setFull(first + ' ' + last); }, [first, last]);

// just compute it
const full = first + ' ' + last;

// a real effect: external system, with cleanup
useEffect(() => {
  const socket = connect(roomId);
  socket.on('msg', onMessage);
  return () => socket.close();     // runs before re-sync and on unmount
}, [roomId]);`
            }
          },
          { p: 'The cleanup function runs before the effect re-runs and on unmount. In StrictMode during development React deliberately mounts, unmounts, and remounts once — if that breaks your effect, the cleanup is incomplete.' }
        ],
        say:
          'Effects synchronise with external systems. Derived data belongs in render, user-triggered logic belongs in the handler, and resetting state belongs to a key. Every subscription-shaped effect needs a cleanup that fully undoes it.',
        traps: [
          'Chained effects that each set state and trigger the next.',
          'Missing dependencies producing stale closures — a timer that always logs the initial count.',
          'No cancellation flag on a fetch, so a slow response overwrites a newer one.'
        ]
      },
      {
        id: 'rc-memo',
        title: 'useMemo, useCallback, memo',
        tags: ['hooks', 'performance'],
        ask: 'When does memoisation actually help?',
        body: [
          { p: 'All three trade memory and comparison work for skipped work. They pay off in two situations: an expensive computation you would otherwise repeat every render, and a stable reference that a memoised child or a hook dependency array depends on. Everywhere else they add cost and noise.' },
          {
            code: {
              lang: 'jsx',
              src: `// pointless — cheap and nothing depends on the identity
const total = useMemo(() => a + b, [a, b]);

// worth it — expensive, runs on every keystroke otherwise
const rows = useMemo(
  () => items.filter(matches(query)).sort(byDate),
  [items, query],
);

// worth it — memo child would re-render on every parent render
const onSelect = useCallback(id => setSelected(id), []);
const Row = memo(function Row({ item, onSelect }) { ... });

// memo defeated: a fresh object literal every render
<Row item={item} style={{ padding: 8 }} onSelect={onSelect} />`
            }
          },
          { p: '<code>memo</code> compares props shallowly. One inline object, array, or arrow function in the JSX and every render is a miss. The React Compiler does this automatically — it reached 1.0 in October 2025, works with React 17 and up, and is opt-in as a build plugin rather than part of React itself. Interviews still expect you to explain the manual model.' }
        ],
        say:
          'Memoise when the work is genuinely expensive, or when a reference has to stay stable for a memoised child or a dependency array. Otherwise it costs more than it saves, and one inline object in the props defeats it anyway.',
        traps: [
          'Wrapping everything in useMemo as a reflex.',
          'memo on a component whose children prop is fresh JSX each render.',
          'useCallback with a dependency that changes every render.'
        ]
      },
      {
        id: 'rc-state',
        title: 'State: local, lifted, context, external',
        tags: ['architecture', 'hot'],
        ask: 'Where should this state live?',
        body: [
          {
            list: [
              '<b>Local</b> — default. Keep it in the component that uses it.',
              '<b>Lifted</b> — move to the nearest common ancestor when siblings must agree.',
              '<b>Context</b> — for values that are read widely and change rarely: theme, locale, current user, a store handle.',
              '<b>External store</b> — Zustand, Redux Toolkit, Jotai when updates are frequent, cross-cutting, or need middleware and devtools.',
              '<b>Server cache</b> — TanStack Query or SWR. Remote data is not app state; it is a cache with staleness, refetch, and invalidation.'
            ]
          },
          { p: 'The distinction that wins interviews: server state and client state are different problems. Most Redux stores that people found painful were caching server data by hand.' },
          {
            code: {
              lang: 'jsx',
              src: `// every consumer re-renders when ANY field of value changes,
// and this object is new on every provider render
<Ctx.Provider value={{ user, theme, setTheme }}>

// split by change frequency, and memoise the value
const auth = useMemo(() => ({ user, logout }), [user, logout]);
<AuthCtx.Provider value={auth}>
  <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>
</AuthCtx.Provider>`
            }
          },
          { p: 'Context is dependency injection, not a performance tool. It has no selector — any change to the value re-renders every consumer. <code>useSyncExternalStore</code> or a store library gives you selective subscription.' }
        ],
        say:
          'Local first, lift only when siblings need it, context for stable app-wide values, an external store for frequently changing shared state, and a query library for anything that came from the server.',
        traps: [
          'One giant context holding everything, re-rendering the app on each change.',
          'Duplicating server data into local state and letting the copies drift.',
          'Deriving state into state instead of computing during render.'
        ]
      },
      {
        id: 'rc-perf',
        title: 'Performance and concurrent React',
        tags: ['performance'],
        ask: 'The list is janky while typing. What do you do?',
        body: [
          { p: 'Profile first with React DevTools\' Profiler: is it too many components re-rendering, or one component rendering slowly? The fixes are different.' },
          {
            list: [
              '<b>Too many renders</b> — narrow state ownership, split contexts, memoise the leaf.',
              '<b>Too much DOM</b> — virtualise with react-window or TanStack Virtual so only visible rows exist.',
              '<b>Too much JavaScript upfront</b> — <code>lazy</code> plus <code>Suspense</code> for route-level code splitting.',
              '<b>Blocking input</b> — <code>useTransition</code> marks the expensive update non-urgent; <code>useDeferredValue</code> lets the input stay live while the list lags behind.'
            ]
          },
          {
            code: {
              lang: 'jsx',
              src: `const [query, setQuery] = useState('');
const deferred = useDeferredValue(query);      // list trails the input
const results = useMemo(() => search(deferred), [deferred]);

const [isPending, startTransition] = useTransition();
function onTab(next) {
  startTransition(() => setTab(next));         // keeps the click responsive
}`
            }
          },
          { p: 'Error boundaries are still class components (or a library like react-error-boundary) and catch render-phase errors below them — not event handlers, and not async callbacks.' }
        ],
        say:
          'Measure with the Profiler, then match the fix to the cause: fewer renders, fewer DOM nodes, less upfront JavaScript, or marking the expensive update as a transition so typing stays responsive.',
        traps: [
          'Optimising by intuition without a profile.',
          'Rendering ten thousand rows and blaming React.',
          'Expecting an error boundary to catch an error thrown inside an onClick handler.'
        ]
      }
    ]
  });
})(window.PREP);
