/* React beyond the rendering model: data, forms, types, tests, delivery. */
(function (P) {
  P.modules.push({
    id: 'rx',
    track: 'frontend',
    title: 'React in practice',
    kicker: 'Module 05',
    blurb:
      'The second half of a frontend interview leaves the rendering model and asks how you ship: fetching, forms, types, tests, and where the page is actually rendered.',
    concepts: [
      {
        id: 'rx-data',
        title: 'Fetching is a caching problem',
        tags: ['data', 'hot'],
        ask: 'How do you load data in a React app?',
        body: [
          { p: 'A hand-rolled effect gets the happy path and misses everything else: loading and error states, cancelling a stale response, deduping two components asking for the same thing, refetching on focus, and invalidating after a mutation. That list is why TanStack Query and SWR exist.' },
          {
            code: {
              lang: 'jsx',
              src: `const { data, isPending, error } = useQuery({
  queryKey: ['orders', { status, page }],   // the key IS the cache identity
  queryFn: () => api.orders({ status, page }),
  staleTime: 30_000,                        // trust it for 30s, no refetch
});

const mutate = useMutation({
  mutationFn: api.cancelOrder,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
});`
            }
          },
          { p: 'Watch for request waterfalls: a parent fetches, renders, and only then does the child start its own request. Hoist the requests, fire them in parallel, or move fetching to the route loader or a server component so it starts before the client renders anything.' },
          {
            note: [
              'If you must do it by hand, cancel properly: an <code>AbortController</code> in the effect cleanup, or a <code>cancelled</code> flag, so a slow first response cannot overwrite a fast second one.'
            ]
          }
        ],
        say:
          'Server data is a cache, not component state. A query library gives me keys, deduping, staleness, retries, and invalidation for free — and the thing I watch for is waterfalls, where each level of the tree serialises its own request.',
        traps: [
          'Copying fetched data into useState and letting the two drift.',
          'No cancellation, so responses land out of order.',
          'A loading spinner for the whole page when only one panel is pending.'
        ]
      },
      {
        id: 'rx-forms',
        title: 'Forms: controlled, uncontrolled, and actions',
        tags: ['forms'],
        ask: 'Controlled or uncontrolled inputs?',
        body: [
          { p: 'Controlled means React owns the value: <code>value</code> plus <code>onChange</code>, one re-render per keystroke, and the value is always available for validation or conditional UI. Uncontrolled leaves the value in the DOM and you read it via a ref or on submit — cheaper, and the right default for large forms.' },
          {
            code: {
              lang: 'jsx',
              src: `// controlled — needed when the value drives other UI
<input value={query} onChange={e => setQuery(e.target.value)} />

// uncontrolled — the DOM keeps the value, React does not re-render
<input name="email" defaultValue={user.email} ref={emailRef} />

// React 19 form actions: pending state without wiring it by hand
function Save({ id }) {
  const [state, action, pending] = useActionState(saveProfile, null);
  return (
    <form action={action}>
      <input name="name" defaultValue={name} />
      <button disabled={pending}>{pending ? 'Saving' : 'Save'}</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`
            }
          },
          { p: 'For anything non-trivial, react-hook-form is the standard answer: uncontrolled by default so typing does not re-render the form, with a schema resolver (Zod, Yup) so the same shape validates on client and server.' }
        ],
        say:
          'Controlled when the value drives other UI, uncontrolled when it does not — and for real forms, react-hook-form with a Zod schema so validation is declared once and shared with the backend contract.',
        traps: [
          'Switching an input from uncontrolled to controlled mid-life — React warns, and the cause is a <code>value</code> that starts undefined.',
          'Re-rendering a 40-field form on every keystroke.',
          'Client-only validation. It is UX, never a security boundary.'
        ]
      },
      {
        id: 'rx-types',
        title: 'TypeScript where it earns its keep',
        tags: ['types'],
        ask: 'How do you type a component whose props depend on each other?',
        body: [
          { p: 'A discriminated union makes impossible states unrepresentable — the compiler rejects the combination instead of a runtime guard catching it later.' },
          {
            code: {
              lang: 'ts',
              src: `type Props =
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'ready'; items: Item[] };

// no optional fields, no "error might be undefined" checks

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost';
};   // inherits every native button prop, including ref-free rest spread

function List<T>({ items, render }: {
  items: T[];
  render: (item: T) => React.ReactNode;
}) { return <>{items.map(render)}</>; }   // generic, infers T from items`
            }
          },
          { p: 'Prefer <code>unknown</code> over <code>any</code> at boundaries and narrow deliberately. Validate API responses at runtime with Zod — a TypeScript interface is a compile-time promise the network never made.' }
        ],
        say:
          'Discriminated unions for props that vary together, generics for reusable containers, ComponentPropsWithoutRef so wrappers inherit native props, and runtime schema validation at the network boundary because types disappear at build time.',
        traps: [
          'Casting with <code>as</code> to silence the compiler.',
          '<code>React.FC</code> habits and implicit children when the component takes none.',
          'Trusting an API response because it has a TypeScript type.'
        ]
      },
      {
        id: 'rx-testing',
        title: 'Testing what the user experiences',
        tags: ['testing'],
        ask: 'What do you test in a React component?',
        body: [
          { p: 'Testing Library\'s premise: query the way a user finds things, so tests survive refactors. Query priority is role, then label, then text, then <code>data-testid</code> as a last resort. Never assert on class names or component internals.' },
          {
            code: {
              lang: 'jsx',
              src: `test('shows an error when the email is taken', async () => {
  server.use(http.post('/api/signup', () =>
    HttpResponse.json({ error: 'taken' }, { status: 409 })));

  render(<SignupForm />);
  await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
  await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/taken/i);
});`
            }
          },
          {
            list: [
              '<code>userEvent</code> over <code>fireEvent</code> — it models real interaction, including focus and keyboard.',
              '<code>findBy*</code> when the result is async; <code>queryBy*</code> only to assert absence.',
              'Mock the network with MSW, not the fetch function — the test then exercises your real client code.',
              'Reserve Playwright or Cypress for critical flows end to end; unit-test the logic, not the framework.'
            ]
          }
        ],
        say:
          'I test behaviour through accessible queries — role, label, text — with the network mocked at the boundary by MSW. If a test breaks when I rename a hook but the UI still works, the test was wrong.',
        traps: [
          'Shallow rendering and asserting on props.',
          'Snapshot tests that everyone regenerates without reading.',
          'Arbitrary <code>waitFor</code> timeouts instead of <code>findBy</code>.'
        ]
      },
      {
        id: 'rx-a11y',
        title: 'Accessibility as correctness',
        tags: ['a11y'],
        ask: 'You built a modal with a div. What is missing?',
        body: [
          {
            list: [
              'Semantics — <code>role="dialog"</code>, <code>aria-modal</code>, and a label via <code>aria-labelledby</code>. Or use the native <code>&lt;dialog&gt;</code>.',
              'Focus — move focus in on open, trap it inside, and restore it to the trigger on close.',
              'Keyboard — <code>Escape</code> closes; every action reachable by <code>Tab</code>.',
              'The rest of the page — inert or <code>aria-hidden</code> so a screen reader does not wander behind the modal.'
            ]
          },
          { p: 'The cheap wins that cover most audits: real semantic elements instead of clickable divs, a label on every input, visible focus rings, 4.5:1 contrast for body text, alt text that says what the image means, and announcing async results with <code>role="alert"</code> or a live region.' },
          {
            code: {
              lang: 'jsx',
              src: `// a div with onClick is not a button: no Enter/Space, no focus, no role
<div onClick={submit}>Submit</div>

<button type="button" onClick={submit}>Submit</button>

// icon-only controls still need an accessible name
<button aria-label="Close dialog" onClick={close}><CloseIcon aria-hidden /></button>`
            }
          }
        ],
        say:
          'Native semantics first, then focus management and keyboard paths. For a modal that means role and label, focus trapped and restored, Escape to close, and the background made inert.',
        traps: [
          'Clickable divs and spans.',
          'Removing the focus outline for looks with nothing to replace it.',
          'Placeholder text used as the only label.'
        ]
      },
      {
        id: 'rx-render',
        title: 'Where the page renders: CSR, SSR, RSC',
        tags: ['delivery', 'hot'],
        ask: 'When would you not use a client-rendered SPA?',
        body: [
          {
            list: [
              '<b>CSR</b> — an empty shell, then JavaScript. Simple to host, weak first paint and SEO. Fine behind a login.',
              '<b>SSR</b> — HTML per request, then hydration. Good for personalised, fresh content; costs server time on every request.',
              '<b>SSG</b> — HTML at build time from a CDN. Fastest and cheapest, for content that changes on a deploy cadence. <b>ISR</b> regenerates pages in the background on a TTL.',
              '<b>RSC</b> — components that run only on the server, can query the database directly, and ship zero JavaScript for themselves. Client components are the interactive islands below them.'
            ]
          },
          { p: 'Hydration is the step people trip on: the server HTML must match the first client render exactly. <code>Date.now()</code>, <code>window</code>, <code>Math.random()</code>, or locale formatting during render cause a mismatch — move them into an effect or render them client-only.' },
          { p: 'Measure delivery with Core Web Vitals: LCP for perceived load, INP (which replaced FID in 2024) for responsiveness, CLS for layout stability.' }
        ],
        say:
          'Static or server-rendered for anything public-facing and content-heavy, client-rendered for app screens behind auth. React Server Components let me keep data-heavy work on the server and ship interactivity only where it is needed.',
        traps: [
          'Touching <code>window</code> during render and breaking hydration.',
          'Using an effect to fix an SSR mismatch instead of removing the nondeterminism.',
          'Shipping a full SPA bundle for a marketing page.'
        ]
      }
    ]
  });
})(window.PREP);
