/* Front-end system design track — design systems, scale, and transport.
   Source: "Top 15 Frontend Interview Questions for 2026" (YouTube AMerB8XjfZ0,
   theSeniorDev). Questions 6, 14 and 15 of the fifteen.

   Two corrections of substance, both checked against the linked sources:

     - The scaling card modernises the caching answer. The video describes
       time-based max-age on JavaScript chunks — seven days on vendor code,
       five minutes on app code. That is the pre-content-hashing approach and
       it produces stale-bundle bugs. Hashed filenames with a one-year
       immutable max-age, and a short cache on the HTML entry point, is the
       version that is both faster and correct.

     - The transport card corrects "SSE is native, you do not even need a
       library". EventSource is real and native, but it is GET-only and cannot
       set headers, so it cannot POST a conversation with an Authorization
       header. That is exactly why the OpenAI and Anthropic SDKs use fetch and
       parse the event stream by hand. */
(function (P) {
  P.modules.push({
    id: 'fe-system',
    track: 'frontend-senior',
    title: 'Front-end system design',
    kicker: 'Module 05',
    blurb:
      'The three questions where junior and senior answers diverge most visibly. Everyone knows the keywords — design system, CDN, WebSocket. What is being marked is whether you can say what each one costs, and name the case where you would not use it.',
    concepts: [
      {
        id: 'fe-design-system',
        title: 'Four layers, each one absorbing a decision',
        tags: ['architecture'],
        ask: 'What makes a good design system?',
        body: [
          { p: 'A design system is not a component library. It is a set of layers, and each layer exists to take a decision away from the person building a screen — which is what makes the screens consistent, and what makes them fast to build.' },
          {
            diagram: `4  TOOLING          Storybook, a design-to-code MCP, visual tests
   ────────────     makes the layers below discoverable and enforced
        ▲
3  COMPOSED        SearchForm, DataTable, PageHeader
   ────────────     opinionated, does a whole job, hard to misuse
        ▲
2  PRIMITIVES      Button, Input, Select, Dialog
   ────────────     accessible, unopinionated, styled by layer 1
        ▲
1  TOKENS          --color-brand, --space-4, --radius-md, --font-body
   ────────────     the vocabulary. One line changes it everywhere.

  A consumer enters at whichever layer fits. Grab a composed form,
  or a primitive and style it, or just the tokens.`,
            caption: 'Each layer is usable on its own'
          },
          { p: '<b>Layer one is tokens</b>, and in modern CSS they are custom properties. Every value that repeats — colour, spacing step, radius, type scale, shadow — gets a name, and components only ever reference the name:' },
          {
            code: {
              lang: 'css',
              src: `:root {
  --color-brand: #00d95f;
  --space-4: 1rem;
  --radius-md: 0.5rem;
}

.btn {
  background: var(--color-brand);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

/* A rebrand, a second tenant, or a dark theme is now a block of
   variable reassignments — not a search across the codebase. */`
            }
          },
          { p: '<b>Layer two is primitives</b>, and the important decision here is what not to build. Accessible versions of the awkward components — a combobox, a modal with correct focus trapping, a menu with full keyboard support — take weeks to get right and are wrong in subtle ways for a long time. A headless library such as Radix ships the behaviour and accessibility with no styling at all, so you bring your tokens and get correct components immediately.' },
          { p: 'That is the trade worth naming out loud: <b>you want to own your visual identity and borrow your interaction behaviour.</b> Nobody is differentiating on their own implementation of a dropdown.' },
          { p: '<b>Layer three is composition.</b> Primitives combine into things that do a whole job — a search form, a data table with its empty and loading states. This is where consistency stops being a convention and becomes the path of least resistance, because using the composed component is genuinely easier than assembling it again.' },
          { p: '<b>Layer four is tooling</b>, which is what stops the other three from rotting. Storybook, deployed rather than run locally, so a component can be found and interacted with before someone rebuilds it. Visual regression tests, because a token change touches everything and unit tests will not notice. And a design-to-code MCP server pointed at Figma, so the design file is the source of truth an agent generates against rather than an image it approximates.' },
          {
            bridge: [
              'The reason this question has moved up the list is worth saying, because it explains why the interviewer is asking it now.',
              'A design system used to be about consistency and velocity for a team of humans. It is now also <b>the constraint surface for a coding agent</b> — the thing that stops it inventing a fourth button component and a hex value that is nearly, but not quite, your brand colour.',
              'An agent given tokens and primitives composes. An agent given a blank stylesheet generates, and generates something new every time. The design system is what turns a generative tool into a compositional one, and that is a large part of why "front-end engineering is becoming design systems work" is a claim people take seriously.',
              'It also means the tokens are worth more than the components. Components can be regenerated cheaply now. The vocabulary they must speak cannot.'
            ]
          },
          {
            note: [
              '<b>A design system nobody adopts is worse than none.</b> It becomes a second vocabulary to keep in sync with the one people actually use, and the drift is invisible until a rebrand.',
              'The measurable signal is whether new features are being built by composition or by fresh CSS. Duplication analysis will tell you directly, which is the same check that catches an agent re-implementing what exists.',
              'The usual cause of non-adoption is not quality but discoverability — an undeployed Storybook, or primitives so opinionated that the first genuinely different design has to route around them.'
            ]
          }
        ],
        say:
          'I would describe it as four layers, each one taking a decision away from whoever is building a screen. Tokens first — colour, spacing, radius, type scale as CSS custom properties — so a rebrand or a theme is a block of variable reassignments rather than a search across the codebase. Then primitives: buttons, inputs, dialogs, and here the decision that matters is what not to build. Accessible comboboxes and modals with proper focus trapping take weeks to get right, so I would take something headless like Radix and style it with my tokens — own the visual identity, borrow the interaction behaviour. Then composed components that do a whole job, which is where consistency becomes the easy path rather than a rule. Then tooling: a deployed Storybook so people find components instead of rebuilding them, visual regression tests because a token change touches everything, and a design-to-code MCP so Figma is the source of truth an agent generates against. The reason this matters more now is that the design system is the constraint surface for a coding agent — given tokens and primitives it composes, given a blank stylesheet it invents something new every time.',
        traps: [
          'Describing a component library and calling it a design system. Without the token layer underneath it, a rebrand is still a full sweep of the codebase.',
          'Proposing to build accessible primitives from scratch. It signals you have not tried — a keyboard-accessible combobox is a genuinely hard component.',
          'Leaving out tooling. An undiscoverable design system does not get adopted, and an unadopted one is a liability.',
          'Not mentioning visual regression testing. Tokens are shared by everything, so a change to one is exactly the kind of blast radius unit tests are blind to.',
          'Treating it as a purely human-facing concern. In 2026 the interviewer is at least half asking what constrains the agent.'
        ]
      },
      {
        id: 'fe-scale',
        title: 'Everyone says CDN. The answer is how you chunk and cache',
        tags: ['architecture', 'performance'],
        ask: 'How would you scale a front-end application from 1,000 daily users to 100,000?',
        body: [
          { p: 'Scope it first: this is the front-end half. Going to 100,000 daily users is mostly a backend and database problem, and saying so shows you know where the hard part is.' },
          { p: 'Then split on rendering strategy, because the two answers barely overlap.' },
          { p: '<b>Client-rendered is close to free to scale.</b> The build output is static files. Put them behind a CDN and they are served from a location near each user, by infrastructure designed for exactly this. A hundred thousand daily users is not a demanding number for static assets.' },
          { p: 'So "use a CDN" is where a junior answer stops, and the interviewer is waiting for the next sentence. The next sentence is about <b>how the bundle is split and how each piece is cached</b>, because that is what decides whether returning users download anything at all.' },
          {
            diagram: `Split the build by how often each part changes:

  vendor.a1b2c3.js     React, React DOM, date library
                       changes: a few times a year
                       ─────────────────────────────────────
                       Cache-Control: max-age=31536000, immutable

  app.d4e5f6.js        your components and logic
                       changes: every deploy
                       ─────────────────────────────────────
                       Cache-Control: max-age=31536000, immutable

  index.html           references the hashed filenames above
                       changes: every deploy
                       ─────────────────────────────────────
                       Cache-Control: no-cache

  The hash IS the cache key. New build -> new filename -> new
  download. Same filename -> guaranteed identical -> never re-check.`,
            caption: 'Content hashing plus immutable'
          },
          { p: 'The mechanism is worth stating precisely, because it is the bit that sounds wrong until you see it. Every asset filename contains a hash of its contents, so a file at a given URL <b>can never change</b>. That makes a one-year <code>max-age</code> safe, and <code>immutable</code> tells the browser not even to send a revalidation request. Returning users fetch nothing for the parts that did not change.' },
          { p: 'Only <code>index.html</code> is uncached. It is small, it is fetched every time, and it names the current hashed bundles — so a deploy is picked up immediately and completely, with no window where a user holds a stale mix.' },
          {
            note: [
              '<b>The older approach — a short <code>max-age</code> on app code and a long one on vendor code — is the one to avoid, and it is worth knowing why.</b> Without content hashing, cache lifetime is a guess about deploy frequency, and every guess is wrong in one of two directions.',
              'Too long and users run last week\'s JavaScript against this week\'s API. Too short and everyone re-downloads code that has not changed. Worse, the two bundles expire independently, so a user can hold a new <code>app.js</code> against a cached <code>vendor.js</code> — a version mismatch that reproduces for nobody and appears in your error tracker as an impossible stack trace.',
              'Content hashing removes the guess entirely. There is nothing to tune, because the filename already encodes the answer.'
            ]
          },
          { p: '<b>Server-rendered is a different problem</b>, because now every page view is compute you own.' },
          {
            diagram: `CLIENT-RENDERED                    SERVER-RENDERED

user ──> CDN edge                  user ──> CDN edge  (static assets)
          │                                   │
      static files                            └──> your server
      done.                                        renders HTML
                                                   │
                                              every user, every view
                                              ▲ throughput bottleneck
                                              ▲ latency: distance to origin`,
            caption: 'SSR turns page views into compute'
          },
          { p: 'Two problems, and they need different fixes. Throughput is horizontal scaling: keep the render stateless so you can run many instances, and cache aggressively — a fully static page can be pre-rendered at build time, and a page that is the same for everyone for thirty seconds can be cached for thirty seconds. Most SSR scaling is really a caching exercise. Latency is distance, and the fix is rendering closer to the user.' },
          { p: 'Which is where edge rendering comes in — workers distributed globally, and, if the render needs data, read replicas near them. That buys you low latency worldwide and costs you consistency: writes still go to a primary and take time to propagate, so a user can write and then read their own stale data from a nearby replica.' },
          {
            note: [
              '<b>Say that the edge setup is usually not worth it.</b> Distributed data means eventual consistency, cache invalidation across regions, and debugging problems that only reproduce in one part of the world. That is a serious operational cost.',
              'For 100,000 daily users it is almost certainly unnecessary. A single well-cached origin with a CDN in front, or static generation where the content allows it, will handle that comfortably — and a client-rendered app can do it with essentially no backend scaling at all.',
              'Naming the simpler thing that would work, and reserving the complex one for when the traffic is genuinely global and latency is genuinely critical, is the judgement the question is testing. Reaching for edge workers and read replicas unprompted reads as someone who has read about the architecture rather than run one.'
            ]
          }
        ],
        say:
          'I would scope it to the front end first, since most of going to 100,000 daily users is backend and database work. If it is client-rendered this is close to free — the build output is static, so it goes behind a CDN and that is a load CDNs are built for. But "use a CDN" is where the answer usually stops, and the real content is how you chunk and cache. I would split the bundle by how often each part changes, hash the contents into every filename, and serve those with max-age of a year plus immutable — the hash is the cache key, so the file at that URL can never change and returning users re-download nothing. Only index.html is uncached; it is small and it names the current hashed bundles, so a deploy lands atomically. I would avoid time-based max-age on JavaScript, because the lifetimes are a guess and the two bundles expire independently, which gives you a new app.js against a cached vendor.js and a stack trace nobody can reproduce. SSR is a different problem, because every page view becomes compute I own — throughput needs stateless renders and aggressive caching, and latency needs rendering closer to the user, which means edge workers and read replicas. I would flag that as usually not worth it at this scale: it buys latency and costs consistency and a lot of operational pain, and a well-cached single origin handles 100,000 daily users comfortably.',
        traps: [
          'Answering "put it on a CDN" and stopping. It is correct and it is the junior answer. Chunking and caching strategy is what is being marked.',
          'Time-based cache lifetimes on hashed assets. Content hashing makes the guess unnecessary, and guessing produces version-mismatch bugs that reproduce for nobody.',
          'Caching <code>index.html</code> like the bundles. It is the entry point that names the current hashes; cache it and deploys do not land.',
          'Not distinguishing CSR from SSR. One is a static-asset problem and the other is a compute problem, and answering as if they are the same misses the question.',
          'Jumping to edge workers and distributed replicas unprompted. It reads as architecture astronautics, and the consistency cost is real.',
          'Forgetting that SSR scaling is mostly caching. Static generation and short-lived response caches beat adding instances.'
        ]
      },
      {
        id: 'fe-realtime',
        title: 'The shape of the traffic picks the transport',
        tags: ['api', 'ai'],
        ask: 'If we were to integrate an LLM-powered chatbot into our front end, what real-time communication protocol would you use, and why?',
        body: [
          { p: 'Answer this by describing the traffic first, then choosing. LLM streaming has a specific and unusual shape: <b>one request from the client, then a long one-way stream of tokens back</b>. It is not conversational at the protocol level, even though the product is a conversation.' },
          {
            diagram: `HUMAN CHAT                        LLM STREAMING

client ──── message ────> server   client ──── prompt ────> server
client <─── message ───── server   client <─ tok ─ tok ─ tok ── server
client ──── typing… ────> server   client <─ tok ─ tok ─ done ─ server
       symmetric, both ways               asymmetric, one way

  -> bidirectional transport         -> a one-way stream is enough`,
            caption: 'Two different shapes with the same UI'
          },
          { p: 'That is the entire argument. A bidirectional transport for a one-directional stream is a cost with no return.' },
          { p: 'The three options, with what each actually costs:' },
          {
            list: [
              '<b>Polling</b> — ask every few seconds. Trivial to build, works through any proxy, and survives anything. But it is wrong in both directions at once: too slow for token-by-token output, and at 100,000 clients it is a self-inflicted load generator hitting your API constantly to be told nothing has changed. Fine as a fallback for a status field. Not this.',
              '<b>WebSocket</b> — one long-lived bidirectional connection. The right answer for human-to-human chat, collaborative editing, multiplayer: anything where the server pushes unprompted and the client talks back continuously. The cost is that it is a stateful connection, which makes load balancing, reconnection and horizontal scaling all harder, and it is not plain HTTP so proxies and infrastructure treat it differently.',
              '<b>Server-Sent Events</b> — a plain HTTP response the server holds open and writes to. One direction, server to client. Which is precisely the shape of a token stream.'
            ]
          },
          { p: 'SSE wins here, and the reasons are concrete rather than aesthetic. It is ordinary HTTP, so proxies, load balancers and HTTP/2 all handle it without special treatment. The wire format is text and trivially debuggable. Reconnection with resume is built into the protocol via <code>Last-Event-ID</code>. And when the response ends, the connection ends — which matches a request that has a natural completion.' },
          {
            code: {
              lang: 'text',
              src: `Content-Type: text/event-stream

data: {"delta":"The"}

data: {"delta":" quick"}

data: {"delta":" brown"}

data: [DONE]

# Fields are text, separated by newlines. A blank line ends an event.
# Open the Network tab in ChatGPT or Claude and you will see this.`
            }
          },
          {
            note: [
              '<b>"SSE is native, so you do not need a library" needs one important correction, and it is the detail that separates having used this from having read about it.</b>',
              'The native <code>EventSource</code> API is real, and it does give you automatic reconnection and <code>Last-Event-ID</code> handling for free. But it can only issue a <b>GET</b>, and it cannot set request headers.',
              'An LLM call needs neither of those things to be true. You have to POST the conversation — it is far too large for a URL — and you have to send an <code>Authorization</code> header. <code>EventSource</code> can do neither.',
              'So in practice you use <code>fetch</code> with a POST, read <code>response.body</code> as a stream, and parse the <code>text/event-stream</code> frames yourself. That is exactly what the OpenAI and Anthropic SDKs do under the hood before handing you an async iterator — the transport is SSE, the client is not <code>EventSource</code>.',
              '<b>One more limit worth knowing:</b> over HTTP/1.1, browsers allow only about six connections per origin, and a held-open SSE stream occupies one for its whole life. A few open tabs and the site stops loading anything. Over HTTP/2 the limit effectively disappears, which is why this rarely bites in production but reliably bites in local development.'
            ]
          },
          { p: 'And keep the honest caveat ready, because the good follow-up is "what would change your mind": if the product later needs the server to push unprompted — presence, another user typing in a shared session, live collaboration on the output — the traffic stops being one-directional and WebSocket becomes correct. The transport follows the shape of the traffic, and if the shape changes, so does the answer.' }
        ],
        say:
          'I would pick based on the shape of the traffic. LLM streaming is asymmetric — one request from the client, then a long one-way stream of tokens back — so a bidirectional transport is a cost with no return. Polling is out: too slow for token-by-token output, and at scale it is a self-inflicted load generator asking constantly whether anything changed. WebSocket is the right answer for human-to-human chat or collaborative editing where the server pushes unprompted, but it is a stateful connection, which makes load balancing, reconnection and scaling harder, and it is not plain HTTP so infrastructure treats it differently. Server-Sent Events matches the shape exactly: ordinary HTTP, so proxies and HTTP/2 handle it normally, a text wire format you can read in the Network tab, and reconnection with Last-Event-ID built in. The caveat I would add is that although SSE is native, EventSource is GET-only and cannot set headers, and an LLM call needs to POST a conversation with an Authorization header — so in practice you use fetch, read response.body as a stream, and parse the event frames yourself, which is what the OpenAI and Anthropic SDKs do before handing you an async iterator. Also worth knowing that on HTTP/1.1 you get about six connections per origin and an open stream holds one, so a few tabs can stall the site; HTTP/2 removes that. And if the product later needs the server to push unprompted, presence or live collaboration, then the traffic is no longer one-way and I would move to WebSocket.',
        traps: [
          'Reaching for WebSocket because the word is "chat". The UI is a chat; the traffic is a one-way stream. WebSocket is right for chat between people, not for streaming from a model.',
          'Saying SSE needs no library because it is native. <code>EventSource</code> is GET-only and cannot set headers, so it cannot carry an LLM request at all.',
          'Not knowing what the SDKs do underneath. "OpenAI gives you an async iterator" is a fact about the wrapper; the transport under it is SSE over <code>fetch</code>.',
          'Missing the HTTP/1.1 six-connection limit. It is the classic SSE bug and it only shows up once someone has a few tabs open.',
          'Proposing polling for token streaming. It is both too slow to look right and the option that scales worst.',
          'Giving no condition that would change the answer. "WebSocket once the server needs to push unprompted" shows the choice was reasoned rather than recalled.'
        ]
      }
    ]
  });
})(window.PREP);
