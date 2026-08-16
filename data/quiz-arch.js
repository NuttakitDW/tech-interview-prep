/* Backend architecture question bank — HTTP, data layer, system design. */
(function (P) {
  P.quiz.push(
    /* ---------- Talking over HTTP ---------- */
    {
      id: 'v01', track: 'architecture', module: 'arch-http',
      q: 'Which of these is the RESTful way to delete payment 42?',
      choices: [
        '<code>POST /deletePayment?id=42</code>',
        '<code>DELETE /payments/42</code>',
        '<code>GET /payments/42/delete</code>',
        '<code>POST /payments/delete/42</code>'
      ],
      a: 1,
      why: 'The path names the resource and the method names the action. Once you write <code>delete</code> in the path, the verb lives in two places and the HTTP method stops carrying meaning.'
    },
    {
      id: 'v02', track: 'architecture', module: 'arch-http',
      q: 'Which HTTP method is <b>not</b> idempotent?',
      choices: ['<code>GET</code>', '<code>PUT</code>', '<code>DELETE</code>', '<code>POST</code>'],
      a: 3,
      why: 'Idempotent means repeating the request has the same effect as sending it once. <code>GET</code>, <code>PUT</code> and <code>DELETE</code> qualify; <code>POST</code> does not, which is why a retried <code>POST</code> can create two payments. That is also why using <code>POST</code> for everything costs you safe retries.'
    },
    {
      id: 'v03', track: 'architecture', module: 'arch-http',
      q: 'On the Richardson Maturity Model, where do almost all real-world "REST APIs" sit?',
      choices: [
        'Level 0 — one URL, one verb',
        'Level 1 — resources, but one verb',
        'Level 2 — resources plus HTTP verbs',
        'Level 3 — hypermedia links in every response'
      ],
      a: 2,
      why: 'Level 2 is resource URLs used with the right HTTP methods. Level 3 adds hypermedia, where the response tells the client what it can do next. Very few APIs go that far, so claiming level 3 without links in your responses is an easy thing to be caught on.'
    },
    {
      id: 'v04', track: 'architecture', module: 'arch-http',
      q: 'Which header does a <b>client</b> send to say it can handle a compressed response?',
      choices: [
        '<code>Content-Encoding: gzip</code>',
        '<code>Accept-Encoding: gzip, br</code>',
        '<code>Content-Type: application/gzip</code>',
        '<code>Vary: Accept-Encoding</code>'
      ],
      a: 1,
      why: 'The <code>Accept-</code> family is what the client will take. The <code>Content-</code> family is what the server actually sent. So the client asks with <code>Accept-Encoding</code> and the server answers with <code>Content-Encoding</code>.'
    },
    {
      id: 'v05', track: 'architecture', module: 'arch-http',
      q: 'Your responses are compressed and a shared CDN sits in front of the API. Which header stops the CDN serving a compressed body to a client that cannot unpack it?',
      choices: [
        '<code>Cache-Control: private</code>',
        '<code>Vary: Accept-Encoding</code>',
        '<code>ETag</code>',
        '<code>Content-Length</code>'
      ],
      a: 1,
      why: '<code>Vary</code> tells the cache that the response depends on a request header, so it must store the compressed and uncompressed copies under separate keys. Forgetting it produces the classic bug where a few users see garbage and you cannot reproduce it.'
    },
    {
      id: 'v06', track: 'architecture', module: 'arch-http',
      q: 'What is the difference between <code>Content-Type</code> and <code>Content-Encoding</code>?',
      choices: [
        'They are aliases; <code>Content-Encoding</code> is the older name',
        '<code>Content-Type</code> is what the body is; <code>Content-Encoding</code> is how it was packed for the trip',
        '<code>Content-Type</code> is set by the client, <code>Content-Encoding</code> by the server',
        '<code>Content-Encoding</code> describes the character set'
      ],
      a: 1,
      why: 'Type answers "what is this" — JSON, CSS, a PNG. Encoding answers "how was it wrapped" — gzip, Brotli. A Brotli-compressed JSON body carries both: <code>Content-Type: application/json</code> and <code>Content-Encoding: br</code>.'
    },
    {
      id: 'v07', track: 'architecture', module: 'arch-http',
      q: 'Which asset is <b>not</b> worth compressing with gzip?',
      choices: [
        'A 300 KB JavaScript bundle',
        'A JSON API response listing 500 orders',
        'A 2 MB JPEG photograph',
        'An HTML page'
      ],
      a: 2,
      why: 'JPEG is already compressed, so gzip finds almost nothing left to squeeze and you burn CPU on both ends for no gain. The same goes for PNG, MP4 and ZIP. Text — HTML, CSS, JS, JSON — is where the roughly 70 to 90 percent saving comes from.'
    },

    /* ---------- The data layer ---------- */
    {
      id: 'v08', track: 'architecture', module: 'arch-data',
      q: 'What is the strongest argument for a relational database on a new product catalogue?',
      choices: [
        'It is always faster than a document store',
        'Relationships are real and you will need to ask questions nobody has designed for yet',
        'It does not require a schema',
        'It scales horizontally more easily'
      ],
      a: 1,
      why: 'A join answers a new question without a migration. That is the thing a document store makes you give up, because you shaped the document around the access pattern you knew about at the time.'
    },
    {
      id: 'v09', track: 'architecture', module: 'arch-data',
      q: 'Which workload is the natural fit for a document (NoSQL) store?',
      choices: [
        'Orders, invoices and their line items, where totals must always balance',
        'A high volume of independent click events whose fields drift over time',
        'A permissions model with users, roles and groups that are queried together',
        'Anything that needs one transaction across several entities'
      ],
      a: 1,
      why: 'Log and event data is the classic fit: records are independent, rarely joined, high in volume, and their shape changes without warning. The other three all want joins or a transaction, which is relational territory.'
    },
    {
      id: 'v10', track: 'architecture', module: 'arch-data',
      q: 'Someone says "we chose NoSQL so we do not need a schema". What is the accurate correction?',
      choices: [
        'Correct — document stores genuinely have no schema',
        'The schema moved into application code, where nothing enforces it and old documents keep their old shape',
        'Document stores infer a schema automatically and reject bad writes',
        'It only applies to graph databases'
      ],
      a: 1,
      why: 'There is always a schema, because the code that reads the data expects particular fields. Dropping it from the database just means nothing validates writes and every reader has to defend against documents written months ago.'
    },
    {
      id: 'v11', track: 'architecture', module: 'arch-data',
      q: 'A list screen renders only a title and a price, but <code>GET /products</code> returns forty fields per product. What is this called?',
      choices: ['Under-fetching', 'Over-fetching', 'The N+1 problem', 'Cache invalidation'],
      a: 1,
      why: 'Over-fetching is getting more than the screen needs, because the server fixed the response shape. Under-fetching is the opposite: one endpoint does not give enough, so the client makes extra round trips.'
    },
    {
      id: 'v12', track: 'architecture', module: 'arch-data',
      q: 'Rendering one product page needs <code>GET /products/42</code>, then <code>/variants</code>, then <code>/reviews</code>. What is this called?',
      choices: ['Over-fetching', 'Under-fetching', 'Content negotiation', 'A cache miss'],
      a: 1,
      why: 'Under-fetching means a single endpoint cannot supply what the view needs, so the client pays for extra round trips. It hurts most on mobile, where every trip pays the network latency again.'
    },
    {
      id: 'v13', track: 'architecture', module: 'arch-data',
      q: 'Why is a GraphQL response harder for a CDN to cache than a REST response?',
      choices: [
        'GraphQL responses are always larger than the cache limit',
        'GraphQL forbids caching in the specification',
        'Requests are usually a <code>POST</code> to one <code>/graphql</code> URL, so every request looks the same to the cache',
        'GraphQL responses have no <code>Content-Type</code>'
      ],
      a: 2,
      why: 'A REST <code>GET</code> gives the cache a key for free: the URL. In GraphQL the query is in the body of a <code>POST</code> to a single endpoint, so the URL no longer identifies the response and caching has to move inside your own server.'
    },
    {
      id: 'v14', track: 'architecture', module: 'arch-data',
      q: 'What do persisted queries buy you in GraphQL?',
      choices: [
        'Automatic database indexes for every resolver',
        'A stable URL you can serve over <code>GET</code>, so CDN caching works again — and strangers cannot run arbitrary queries',
        'Field-level authorisation with no extra code',
        'Compression of the response body'
      ],
      a: 1,
      why: 'The client registers its queries ahead of time and then sends only a hash. That restores the URL as a cache key, and as a bonus it closes the door on arbitrary, expensive queries from outside.'
    },
    {
      id: 'v15', track: 'architecture', module: 'arch-data',
      q: 'A GraphQL query partly fails. What does the client typically receive?',
      choices: [
        'HTTP 500 with an empty body',
        'HTTP 400 with the failing field name',
        'HTTP 200 with the partial data and an <code>errors</code> array',
        'HTTP 207 Multi-Status'
      ],
      a: 2,
      why: 'GraphQL reports failures in the body rather than the status line, so a client that only checks the status code sees a success. This is a real source of silently swallowed errors, and it is a fair thing to raise as a disadvantage.'
    },
    {
      id: 'v16', track: 'architecture', module: 'arch-data',
      q: 'A query fetches 3 products, and the <code>translations</code> field resolves with one query per product. How many database queries run?',
      choices: ['1', '3', '4', '60'],
      a: 2,
      why: 'One query for the products, then one per product: 1 + 3 = 4. That is the N+1 shape. With 300 products it is 301 queries for a single request, and nesting one level deeper multiplies it again.'
    },
    {
      id: 'v17', track: 'architecture', module: 'arch-data',
      q: 'A DataLoader batch function is given the keys <code>[1, 2, 3]</code>. What must it return?',
      choices: [
        'Only the rows that were found, in any order',
        'An array of length 3, in the same order as the keys, with <code>null</code> for anything missing',
        'A map keyed by ID',
        'A single flattened array of all matching rows'
      ],
      a: 1,
      why: 'DataLoader matches results to keys by position. Same length, same order. Dropping a miss instead of returning <code>null</code> in its slot shifts every later result onto the wrong key — a quiet, nasty bug.'
    },
    {
      id: 'v18', track: 'architecture', module: 'arch-data',
      q: 'Why must a DataLoader be created per request rather than once at module load?',
      choices: [
        'Module-level objects cannot be used inside resolvers',
        'It caches, so a shared loader could serve one user rows that were loaded for another',
        'It would batch too aggressively and time out',
        'Only to keep memory usage down'
      ],
      a: 1,
      why: 'This is a security rule, not a performance one. The loader caches by key for the lifetime it is given, so a long-lived loader turns into a cross-user data leak.'
    },
    {
      id: 'v19', track: 'architecture', module: 'arch-data',
      q: 'Is N+1 a problem specific to GraphQL?',
      choices: [
        'Yes — only field resolvers can cause it',
        'No — any code that loops over rows and queries once per row causes it; GraphQL just makes it easy to do by accident',
        'Yes — a REST API cannot produce N+1',
        'No, but it only happens with document databases'
      ],
      a: 1,
      why: 'The bug is the loop, not the query language. It long predates GraphQL, and every ORM ships an eager-loading option to prevent it. GraphQL earns its reputation here only because each field has its own resolver, and a resolver cannot see the loop it is running in.'
    },
    {
      id: 'v20', track: 'architecture', module: 'arch-data',
      q: 'You batch an N+1 away and the endpoint is still slow. What is the likely cause?',
      choices: [
        'DataLoader does not work with SQL databases',
        'The single replacement query now returns a very large number of rows',
        'Batching always adds a full second of latency',
        'The batch function ran in parallel with itself'
      ],
      a: 1,
      why: 'Batching removes round trips, not work. If one query now pulls a hundred thousand rows, you moved the problem rather than solved it. Pair batching with pagination and a sane limit.'
    },

    /* ---------- Design and system shape ---------- */
    {
      id: 'v21', track: 'architecture', module: 'arch-design',
      q: 'What does the <b>D</b> in SOLID stand for?',
      choices: [
        'Dependency Injection',
        'Dependency Inversion',
        'Domain Isolation',
        'Decoupled Interfaces'
      ],
      a: 1,
      why: 'Dependency <b>inversion</b> is the principle: high-level code depends on an abstraction, not on a concrete low-level class. Dependency <b>injection</b> is the technique you usually use to achieve it. Mixing the two is the most common slip in this answer.'
    },
    {
      id: 'v22', track: 'architecture', module: 'arch-design',
      q: 'What is the main practical benefit of injecting a dependency instead of importing it directly?',
      choices: [
        'The code runs measurably faster',
        'The caller chooses the implementation, so a test can pass in a fake and never touch the network',
        'It removes the need for interfaces',
        'It guarantees there is only ever one instance'
      ],
      a: 1,
      why: 'An import welds the dependency in at module load. Passing it as a constructor or function argument moves that decision to the caller — production hands in the real client, the test hands in a fake and asserts on the call.'
    },
    {
      id: 'v23', track: 'architecture', module: 'arch-design',
      q: '<code>Square</code> extends <code>Rectangle</code>, and setting its width silently changes its height. Which principle is violated?',
      choices: [
        'Single Responsibility',
        'Open/Closed',
        'Liskov Substitution',
        'Interface Segregation'
      ],
      a: 2,
      why: 'Liskov says a subtype must work anywhere the base type is expected, without surprises. Code written against <code>Rectangle</code> assumes width and height move independently, so handing it a <code>Square</code> breaks it.'
    },
    {
      id: 'v24', track: 'architecture', module: 'arch-design',
      q: 'Adding a fourth payment provider means adding a fourth branch to a growing <code>if</code> chain. Which principle does that break?',
      choices: [
        'Open/Closed',
        'Liskov Substitution',
        'Interface Segregation',
        'Dependency Inversion'
      ],
      a: 0,
      why: 'Open/closed means open to extension, closed to modification. A new provider should be a new class that satisfies the existing interface, not another edit to code that already works and is already tested.'
    },
    {
      id: 'v25', track: 'architecture', module: 'arch-design',
      q: 'Which cost of microservices do candidates most often forget to mention?',
      choices: [
        'You need more CPU',
        'You lose joins across the whole database and transactions across services',
        'The code becomes harder to read',
        'You can no longer use an ORM'
      ],
      a: 1,
      why: 'Each service owns its own data, so a query that used to be one join becomes several network calls, and one transaction becomes a saga with compensating actions. It is usually the most expensive consequence of the split and the least discussed.'
    },
    {
      id: 'v26', track: 'architecture', module: 'arch-design',
      q: 'Are microservices automatically more resilient than a monolith?',
      choices: [
        'Yes — one service failing cannot affect the others',
        'No — without timeouts and circuit breakers, one slow service takes its callers down with it',
        'Yes, as long as each service has its own database',
        'Only when they communicate over a message queue'
      ],
      a: 1,
      why: 'Isolation is something you build, not something you get. With no timeout, a slow payments service holds every orders thread open until orders falls over too. A distributed system can fail in more ways than a monolith, not fewer.'
    },
    {
      id: 'v27', track: 'architecture', module: 'arch-design',
      q: 'What does Conway\'s law say?',
      choices: [
        'A system grows until it exceeds its maintainers',
        'A system ends up shaped like the communication structure of the organisation that built it',
        'Adding people to a late project makes it later',
        'Every distributed system eventually becomes a monolith'
      ],
      a: 1,
      why: 'Three teams that barely talk will produce three loosely joined components whether you planned that or not. It is the strongest honest argument for splitting along team lines — and the reason a split that ignores the org chart tends not to hold.'
    },
    {
      id: 'v28', track: 'architecture', module: 'arch-design',
      q: 'What is the best test to apply <b>before</b> splitting a monolith into services?',
      choices: [
        'Whether the team has Kubernetes experience',
        'Whether you can build a modular monolith — real internal boundaries in one deployable unit',
        'Whether the codebase is over 100,000 lines',
        'Whether the database is the bottleneck'
      ],
      a: 1,
      why: 'If a team cannot keep modules apart inside one codebase, the network will not impose that discipline for them. A boundary inside a monolith costs a refactor to move; the same boundary between services costs an API version, a migration and a coordinated deploy.'
    },
    {
      id: 'v29', track: 'architecture', module: 'arch-design',
      q: 'What is the most common mistake teams make with microservices?',
      choices: [
        'Choosing the wrong programming language per service',
        'Splitting too early, ending up with many services nobody owns',
        'Using HTTP instead of gRPC',
        'Sharing one database between two services'
      ],
      a: 1,
      why: 'Splitting early locks in boundaries you did not understand yet, and merging services back together is far harder than splitting a module apart. Split for a reason you can name — team scale, one hot component, or a blast radius you must contain.'
    },
    {
      id: 'v30', track: 'architecture', module: 'arch-design',
      q: 'Which split gives you all the network cost and almost none of the independence?',
      choices: [
        'Splitting orders from search',
        'Splitting by technical layer — an "API service" and a "database service"',
        'Splitting checkout out because it takes ten times the traffic',
        'Splitting along team ownership lines'
      ],
      a: 1,
      why: 'Layers are not independent — nearly every feature has to change both of them together, so you deploy in lockstep and pay network latency in the middle. Split by business capability instead, so one team can ship a change inside one service.'
    },
    {
      id: 'v31', track: 'architecture', module: 'arch-design',
      q: 'Why do most systems keep REST at the public edge even when they use gRPC internally?',
      choices: [
        'gRPC is slower over the public internet',
        'Browsers cannot speak gRPC directly — they need grpc-web and a proxy',
        'gRPC cannot be secured with TLS',
        'REST is required by the HTTP specification for public APIs'
      ],
      a: 1,
      why: 'It is a capability limit, not a preference. A browser gets no control over HTTP/2 frames, so calling gRPC needs grpc-web plus a proxy such as Envoy. Partners also have to generate clients from your <code>.proto</code>, which is a far bigger ask than handing them a URL.'
    },
    {
      id: 'v32', track: 'architecture', module: 'arch-design',
      q: 'You put a gRPC service behind a plain L4 (connection-level) load balancer. What goes wrong?',
      choices: [
        'Requests fail TLS negotiation',
        'Long-lived HTTP/2 connections pin each client to one backend, so load goes lopsided and new instances stay idle',
        'Protobuf messages arrive corrupted',
        'Nothing — L4 is the recommended setup for gRPC'
      ],
      a: 1,
      why: 'gRPC multiplexes many calls over one long-lived HTTP/2 connection. An L4 balancer only balances connections, so once a client is routed it stays there. You need L7-aware balancing (Envoy, Linkerd) or client-side balancing to spread the individual calls.'
    },
    {
      id: 'v33', track: 'architecture', module: 'arch-design',
      q: 'What must you never do to a field number in a protobuf message?',
      choices: [
        'Add a new one',
        'Renumber it, or reuse the number of a retired field',
        'Give two different messages the same number',
        'Use a number above 100'
      ],
      a: 1,
      why: 'Field numbers are the wire format — the name never travels. Reusing or renumbering means an old reader and a new reader disagree about what a byte means, and they do it silently rather than failing loudly. Add fields, and reserve the numbers you retire.'
    },
    {
      id: 'v34', track: 'architecture', module: 'arch-design',
      q: 'The audit service must record every settled order. Which transport fits best?',
      choices: [
        'A synchronous gRPC call from the order service',
        'A published event on a message broker',
        'A REST call from the browser',
        'A shared database table both services write to'
      ],
      a: 1,
      why: 'Nobody is waiting for the audit result, so a synchronous call only creates coupling: if audit is down, the order fails for no good reason. Publish the event and let consumers read it when they can.'
    },
    {
      id: 'v35', track: 'architecture', module: 'arch-design',
      q: 'Which distributed-systems cost does switching from REST to gRPC remove?',
      choices: [
        'The need for retries and idempotent handlers',
        'None of them — the network is still in the middle; gRPC only makes the hop cheaper',
        'The need for timeouts, because gRPC cannot hang',
        'The need for tracing across services'
      ],
      a: 1,
      why: 'A faster hop is still a hop. Calls still fail halfway, so you still need retries and handlers that are safe to run twice. What gRPC does add is deadline propagation, so a timeout at the edge actually cancels downstream work instead of leaving orphaned queries running.'
    }
  );
})(window.PREP);
