/* Backend architecture track — APIs, the data layer, and system shape.
   Source: "Backend Interview Questions (Junior & Mid)" (YouTube PnQY02QQrYQ).

   The video is inconsistent about level, so to be clear: the title says junior
   and mid, while the narration calls them senior-level questions that also turn
   up in mid and junior interviews, answered the way a senior would answer them.
   Both are true — the question is the same at every level, and only the depth of
   the answer changes. These cards aim at that depth.

   The questions here are the ones actually asked in that interview. The answers
   are written from scratch and checked against the docs linked on each card,
   including three places where the interviewee misspoke (plural "verb" for noun,
   the D in SOLID, and the N+1 arithmetic) — each is corrected in the body and
   called out under "Where candidates lose it".

   One card is NOT from the video: 'ar-transport' (REST vs gRPC vs messaging).
   The video discusses splitting services but never how they should talk, which
   left an obvious hole in a microservices module. Added deliberately. */
(function (P) {
  P.modules.push({
    id: 'arch-http',
    track: 'architecture',
    title: 'Talking over HTTP',
    kicker: 'Module 01',
    blurb:
      'The interview usually opens here, because everything else runs on top of it. Two questions do most of the work: what makes an API RESTful, and what the client and server agree on before a single byte of the body is sent.',
    concepts: [
      {
        id: 'ar-rest',
        title: 'REST is a noun in the path, a verb in the method',
        tags: ['api', 'hot'],
        ask: 'What makes an API RESTful, and what is an example of one that is not?',
        body: [
          { p: 'A REST URL names a <b>thing</b>. It does not name an action. The thing is called a resource.' },
          { p: 'The action comes from the HTTP method instead. So the noun goes in the path, and the verb goes in the method.' },
          {
            code: {
              lang: 'text',
              src: `RESTful                        Not RESTful
GET    /payments               GET  /getPayments
GET    /payments/42            GET  /getPaymentById?id=42
POST   /payments               POST /createPayment
PATCH  /payments/42            POST /updatePayment
DELETE /payments/42            POST /deletePayment`
            }
          },
          { p: 'Collections take a plural noun. <code>/payments</code> is the whole collection. <code>/payments/42</code> is one member of it. Once you write <code>/getPayments</code> you have put the verb in two places, and the method stops meaning anything.' },
          { p: 'The payoff is that nobody has to read your documentation to guess the next endpoint. If <code>/payments</code> works the way it should, a consumer already knows how to fetch one, create one, and delete one. An API that invents its own shape has to explain every route.' },
          { p: 'There is more to REST than URL shape, and this is where a senior answer separates itself. Two constraints matter in practice.' },
          {
            list: [
              '<b>Stateless</b> — every request carries everything the server needs to answer it. The server keeps no conversation state between calls. That is what lets you put ten identical servers behind a load balancer and not care which one answers.',
              '<b>Cacheable</b> — a <code>GET</code> is safe, meaning it changes nothing, so a browser or CDN can store the response and skip the server entirely. You get that for free only if reads really are <code>GET</code> requests.'
            ]
          },
          { p: 'The Richardson Maturity Model is a handy way to grade how far an API actually goes:' },
          {
            diagram: `Level 0   one URL, one verb          POST /api  {"op": "getPayment", "id": 42}

Level 1   resources                  POST /payments/42

Level 2   resources + HTTP verbs     GET /payments/42
                                     <- almost every "REST API" stops here

Level 3   + hypermedia               the response also lists what you can
                                     do next, as links`,
            caption: 'How RESTful is it, really'
          },
          {
            note: [
              '<b>Avoid saying "our API is fully REST", "we\'re level 3", or "we do HATEOAS"</b> unless your responses genuinely carry links that change as the resource changes. One follow-up question exposes it, and it is always a concrete one: <i>can a client find the refund endpoint without reading your docs?</i> A level 2 API has no answer to that.',
              '<b>Say "level 2, deliberately" instead.</b> That is where nearly every API in production sits, including the interviewer\'s. Naming your level costs you nothing — they are not grading the API, they are grading whether you know the difference between what you built and what the word means.',
              'An overstatement that collapses under one question does more damage than the gap it was hiding.'
            ]
          }
        ],
        say:
          'REST means the URL names a resource and the HTTP method names the action — DELETE /payments/42, not POST /deletePayment. On top of that it is stateless, so any server can answer any request, and GET responses are cacheable. The real advantage is standardisation: a consumer can guess my API instead of reading a document. A non-RESTful API puts the verb in the path, and then every single endpoint has to be explained. Strictly, full REST also needs hypermedia, and like most APIs mine sit at level 2 of the Richardson model — I would rather say that than pretend otherwise.',
        traps: [
          'Verbs in the path — <code>/createPayment</code>, <code>/payments/42/delete</code>. The method already carries the verb.',
          'Using <code>POST</code> for everything. You lose caching, and you lose safe retries: <code>GET</code>, <code>PUT</code> and <code>DELETE</code> are idempotent, <code>POST</code> is not.',
          'Saying "plural verb" when you mean plural noun. It is a small slip that makes the rest of the answer sound memorised.',
          'Claiming hypermedia you do not have. The same block of <code>_links</code> on every response is decoration, not level 3 — the links must <i>change with the state</i> of the resource. A pending payment offers cancel; once captured, it offers refund instead. If yours never change, do not call it HATEOAS.'
        ]
      },
      {
        id: 'ar-negotiation',
        title: 'Content negotiation, and the compression it buys you',
        tags: ['api', 'performance'],
        ask: 'What is content negotiation, and where does it actually pay off?',
        body: [
          { p: 'One resource can exist in several versions. Same data, different packaging. Content negotiation is how the client and the server agree on which version to send.' },
          { p: 'The client states what it will accept. The server picks one and says which it picked.' },
          {
            code: {
              lang: 'text',
              src: `Client asks                          Server answers
Accept: application/json             Content-Type: application/json
Accept-Encoding: gzip, br            Content-Encoding: br
Accept-Language: de, en;q=0.8        Content-Language: de`
            }
          },
          { p: 'The <code>q=0.8</code> is a weight. It reads as "German first; English is fine but I want it less". The server is free to pick from what is on offer.' },
          { p: 'The version you meet every day is compression. A browser puts <code>Accept-Encoding: gzip, br</code> on nearly every request. If the server has a compressed copy it sends that, and sets <code>Content-Encoding</code> so the browser knows to unpack it first.' },
          { p: 'Text compresses very well. CSS, JavaScript, HTML and JSON typically shrink by around 70&ndash;90% with gzip, and Brotli is usually a little smaller again. You spend a little CPU on each end and save a lot of time on the wire. On a slow mobile connection that trade is almost always worth taking.' },
          { p: 'For a backend engineer that is throughput. The same server pushes the same content using a fraction of the bandwidth, so you serve more users on the machines you already have.' },
          { p: 'One header keeps this honest when a shared cache sits in front of you:' },
          {
            code: {
              lang: 'text',
              src: `Content-Encoding: br
Vary: Accept-Encoding

# Vary tells the cache: this response depends on a request header.
# Keep the Brotli copy and the plain copy apart.
# Without it, a cache can hand a compressed body to a client
# that never asked for one, and that client sees garbage.`
            }
          },
          {
            note: [
              'Do not compress what is already compressed. JPEG, PNG, MP4 and ZIP will not shrink — you just burn CPU on both ends.',
              '<code>Content-Type</code> and <code>Content-Encoding</code> are different questions. Type is <i>what the thing is</i>. Encoding is <i>how it was packed for the trip</i>.'
            ]
          }
        ],
        say:
          'Content negotiation is the HTTP mechanism where the client says which representation of a resource it can take, using the Accept family of headers, and the server answers with the matching Content- header. The everyday case is compression: browsers send Accept-Encoding: gzip, br, and the server replies with Content-Encoding. Text drops by roughly 70 to 90 percent, so it is a large throughput win for a small CPU cost. The detail I would add is Vary: Accept-Encoding, so a shared cache does not serve a compressed body to a client that cannot decompress it. It also covers Accept-Language, which is how the same page was served in several languages long before front-end routing existed.',
        traps: [
          'Forgetting <code>Vary</code> behind a CDN or proxy. This is the classic "some users see broken output and you cannot reproduce it" bug.',
          'Compressing already-compressed media, or compressing tiny responses where the header overhead costs more than it saves.',
          'Compressing a response that mixes a secret with attacker-controlled input over TLS. Compression ratios leak information — that is the idea behind the BREACH attack.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'arch-data',
    track: 'architecture',
    title: 'Choosing and querying the data layer',
    kicker: 'Module 02',
    blurb:
      'Which database, and what the client is allowed to ask of it. This is where interviews stop testing recall and start testing judgement — every answer here is a trade, and naming the cost is what scores.',
    concepts: [
      {
        id: 'ar-sql-nosql',
        title: 'SQL or NoSQL, and how to justify it',
        tags: ['database', 'hot'],
        ask: 'You are drafting the architecture for a new service. SQL or NoSQL?',
        body: [
          { p: 'A SQL database stores rows in tables. Every table has a schema — a fixed list of columns and their types. A row that does not fit the schema is rejected.' },
          { p: 'A NoSQL database usually stores documents. A document looks much like a JSON object. There is often no fixed schema, so two documents side by side can carry different fields.' },
          {
            diagram: `SQL — fixed columns, rows linked by keys

  products                          categories
  id  name       cat_id             id  name
  1   Keyboard   7      ----------> 7   Peripherals
  2   Mouse      7                  8   Displays
  3   Monitor    8      ---------------^


NoSQL — documents, free shape, related data nested inside

  { "_id": 1, "name": "Keyboard",
    "category": { "name": "Peripherals" },
    "promo": { "code": "SUMMER" } }   <- only this document has "promo"

  { "_id": 2, "name": "Mouse",
    "category": { "name": "Peripherals" } }`,
            caption: 'The same catalogue, two shapes'
          },
          { p: 'Now the decision. Reach for a relational database when:' },
          {
            list: [
              'The relationships are real and will keep growing. Products belong to categories, categories to departments, and somebody will add another link next quarter.',
              'You will need to ask questions nobody has designed for yet. A join answers a new question without a migration.',
              'One change has to touch several tables at once, and either all of it lands or none of it does.'
            ]
          },
          { p: 'Reach for a document store when:' },
          {
            list: [
              'The records are independent events — log lines, clicks, page views. They are rarely joined to anything.',
              'The shape drifts. One event carries three extra fields this week and five next week, and you do not want a migration each time.',
              'Write volume is very high and each write is small and self-contained.'
            ]
          },
          { p: 'The sentence that lands well in an interview: the real question is not which database is better, it is <b>whether you know your queries in advance</b>. A relational schema keeps the door open to questions you have not thought of. A document store asks you to commit to an access pattern up front, because you shaped the document around it.' },
          {
            note: [
              'The line between the two has blurred, and saying so shows you have kept up. PostgreSQL has <code>jsonb</code>, so you can store a schemaless document in a column and index inside it. MongoDB has transactions and schema validation. "I need some flexible fields" is no longer a reason to run a second database.'
            ]
          }
        ],
        say:
          'For a product catalogue with categories I would start with PostgreSQL. The relationships are real, the business will want to query them in ways nobody has asked for yet, and a join answers a new question without a migration. I would reach for a document store on the analytics side instead: click events are independent, their shape drifts, and the volume is high. And I would point out that the line has blurred — PostgreSQL jsonb covers most flexible-field cases, so I would need a strong reason before running a second database with its own backups and monitoring.',
        traps: [
          'Saying NoSQL "scales better", full stop. Both scale. NoSQL usually buys horizontal write scale by giving up joins and some consistency — name the thing you are trading away.',
          'Assuming NoSQL means no schema. There is always a schema. It just moved out of the database and into application code, where nothing enforces it and old documents keep the old shape forever.',
          'Adding a second database to a service that has no traffic yet. Every store is another thing to back up, monitor, and keep in sync.'
        ]
      },
      {
        id: 'ar-graphql',
        title: 'GraphQL: the client picks the shape',
        tags: ['api'],
        ask: 'What does GraphQL give you that REST does not?',
        body: [
          { p: 'With REST the server decides the shape of every response. Each endpoint returns a fixed payload, and the client takes what it gets.' },
          { p: 'With GraphQL the server publishes a typed graph of data. The client writes a query and receives exactly the fields it asked for — no more, no less.' },
          { p: 'That fixes two specific problems. Both have names, and interviewers listen for them.' },
          {
            code: {
              lang: 'text',
              src: `Over-fetching — you get more than you need

GET /products
  -> full product objects, ~40 fields each
     but the list screen only draws the title and the price


Under-fetching — one endpoint is not enough

GET /products/42            -> the product
GET /products/42/variants   -> a second round trip
GET /products/42/reviews    -> a third`
            }
          },
          { p: 'One GraphQL query replaces all of that:' },
          {
            code: {
              lang: 'graphql',
              src: `query ProductList {
  products(first: 20) {
    title
    price                     # exactly the two fields the screen draws
    variants { sku colour }   # related data, same round trip
  }
}`
            }
          },
          { p: 'Cutting three round trips to one matters most on mobile, where each trip pays the network latency again.' },
          { p: 'It fits well when several different clients — web, iOS, Android, a partner integration — need different slices of the same data, and when screens are composed from many sources so REST turns into a waterfall of dependent requests. It also lets the front end build a new view without waiting for a backend change.' },
          { p: 'It fits badly when there is one client that you control, when the API is mostly uploads and simple CRUD, or when you were relying on a CDN to serve your reads.' }
        ],
        say:
          'REST fixes the response shape on the server, which leads to over-fetching — the list screen pulls forty fields to draw two — and under-fetching, where one screen needs three round trips. GraphQL publishes a typed data layer and lets the client query exactly what it needs in a single request. I would pick it when several clients need different slices of the same data and screens compose from many sources, especially on mobile where round trips are expensive. For a single client I control, REST is less machinery for the same result.',
        traps: [
          'Selling GraphQL only as "fewer round trips". The next question is always what it costs, and having no answer makes the whole pitch sound like hype.',
          'Claiming REST cannot solve over-fetching. Sparse fieldsets such as <code>?fields=title,price</code>, or a purpose-built endpoint for the screen, cover most of it.',
          'Describing GraphQL as a database or a replacement for one. It is a query layer over whatever you already have.'
        ]
      },
      {
        id: 'ar-graphql-cost',
        title: 'What GraphQL costs you',
        tags: ['api', 'security'],
        ask: 'Name some disadvantages of GraphQL.',
        body: [
          { p: 'You trade flexibility on the client for complexity on the server. There are five places you feel it, and caching is the big one.' },
          {
            diagram: `REST
  GET /products/42
  -> the URL is the cache key. A browser or CDN caches it.
     You did nothing to earn that.

GraphQL
  POST /graphql
  { "query": "{ product(id: 42) { title reviews { body } } }" }
  -> every request is a POST to the same URL.
     Same key, different answers. The CDN cannot help.`,
            caption: 'Why the free cache disappears'
          },
          {
            list: [
              '<b>Caching</b> — with the URL gone as a cache key, caching moves inside your server, per object or per field. Tooling exists, but you are now maintaining it, and working out where a stale value came from is genuinely hard.',
              '<b>Complexity</b> — you define a schema and write a resolver for every field. That is many more moving parts than a controller that returns JSON.',
              '<b>Authorisation</b> — with REST you guard an endpoint. In GraphQL one query can walk from an object the caller may see into one they may not, so checks have to move down to the field or object level.',
              '<b>Error handling</b> — GraphQL returns HTTP 200 with an <code>errors</code> array, even when part of the query failed. A client that only checks the status code sees success. There are good conventions for this now; there were not at first.',
              '<b>Testing and cost control</b> — the set of possible queries is effectively unlimited. A deeply nested query can be very expensive to serve, so you need depth limits and complexity scoring, not just unit tests.'
            ]
          },
          {
            note: [
              'The usual fix for the caching problem is persisted queries. The client registers its queries ahead of time and then sends only a hash, over <code>GET</code>. That gives you a stable URL, so CDNs work again, and as a bonus a stranger can no longer run an arbitrary expensive query against you.'
            ]
          }
        ],
        say:
          'Flexibility on the client is paid for on the server. Caching is the headline: a REST GET has a URL and a CDN caches it for free, whereas every GraphQL request is a POST to /graphql, so caching moves into my server at object or field level. Then authorisation has to be field-level, because one query can traverse into data the caller should not see. Errors come back as 200 with an errors array, so clients that check status codes alone get it wrong. And since any query is possible, I need depth limits and complexity scoring. Persisted queries buy back the URL and the CDN, and that is normally the first thing I add.',
        traps: [
          'Saying GraphQL "cannot be cached". It can — just not for free by the HTTP layer.',
          'Leaving introspection on in production with no depth limit. A stranger reads your entire schema, then writes a deeply nested query that exhausts the database.',
          'Hand-rolling field-level authorisation resolver by resolver. One missed resolver is a data leak; push the check into a layer the schema applies everywhere.'
        ]
      },
      {
        id: 'ar-nplusone',
        title: 'The N+1 problem, and batching it away',
        tags: ['database', 'performance', 'hot'],
        ask: 'What is the N+1 problem in GraphQL, and how do you solve it?',
        body: [
          { p: 'One query fetches a list. Then, for every item in that list, the code runs another query. That is one query plus N more — N+1.' },
          { p: 'GraphQL makes it easy to hit by accident. Every field has its own resolver, and a resolver has no idea it is being called in a loop.' },
          {
            diagram: `query { products(first: 3) { title translations { locale text } } }

  products resolver  -> 1 query   SELECT * FROM products LIMIT 3

  translations resolver runs once per product:
    product 1        ->   query   SELECT * FROM translations WHERE product_id = 1
    product 2        ->   query   SELECT * FROM translations WHERE product_id = 2
    product 3        ->   query   SELECT * FROM translations WHERE product_id = 3
                        ------------------------------------------------------
                          4 queries to answer one request.
                          300 products -> 301 queries.
                          Nest one level deeper and it multiplies again.`,
            caption: 'One request, N+1 queries'
          },
          { p: 'At that point you are running a denial-of-service attack on your own database, from inside your own API.' },
          { p: 'The fix is batching. Rather than firing each query the moment a resolver asks, you collect the IDs requested during one tick of the event loop, run a single query for all of them, and hand each resolver its slice.' },
          {
            code: {
              lang: 'js',
              src: `const translationLoader = new DataLoader(async (productIds) => {
  // productIds arrives batched, e.g. [1, 2, 3]
  const rows = await db.translation.findMany({
    where: { productId: { in: productIds } }
  })

  const byProduct = new Map(productIds.map((id) => [id, []]))
  rows.forEach((row) => byProduct.get(row.productId).push(row))

  // same length as productIds, same order — this is the contract
  return productIds.map((id) => byProduct.get(id))
})

// the resolver still reads as one lookup per product
translations: (product) => translationLoader.load(product.id)`
            }
          },
          { p: 'Two rules make a loader correct. The array you return must be the same length as the array of keys, and in the same order — results are matched by position. And the loader must be created fresh for each request.' },
          { p: 'That second rule is a security rule, not a performance one. A loader caches. A loader shared across requests would serve one user rows that were loaded for another.' },
          { p: 'None of this is unique to GraphQL. Any code that loops over a list and queries once per item has the same bug. Every ORM ships a fix for it under its own name — an eager-loading option that says "fetch the related rows too, in one query". Different words, one idea.' },
          {
            note: [
              'Batching removes round trips, not work. If a batch now pulls 100,000 rows in a single query, you moved the problem rather than fixing it. Pair batching with pagination and a sane limit.'
            ]
          }
        ],
        say:
          'N+1 is one query for the list plus one more for every row in it. GraphQL invites it because each field has its own resolver and no resolver knows it is running in a loop — three products with a translations field is four queries, and three hundred is three hundred and one. The fix is batching: DataLoader gathers the IDs requested during a tick, issues one WHERE id IN (...) query, and returns the results in the same order as the keys. Two things must be right — the result array matches the key array by length and position, and the loader is created per request, because it caches and a shared one would leak rows between users. And it is not a GraphQL problem as such — any loop that queries once per row does the same thing, which is why every ORM has an eager-loading call to prevent it.',
        traps: [
          'A loader created once at module load and shared by every request. It caches, so one user can be served another user&rsquo;s rows.',
          'Returning results in a different order from the keys, or silently dropping misses. A missing row must come back as <code>null</code> in its own slot, not be left out.',
          'Fixing the query count and not noticing the single replacement query now scans the table.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'arch-design',
    track: 'architecture',
    title: 'Design principles and system shape',
    kicker: 'Module 03',
    blurb:
      'Questions that sound like theory and are really about judgement: can you name the SOLID principles and show one you have used, can you argue both sides of splitting a monolith without reaching for the hype, and once it is split, can you justify how the pieces talk to each other.',
    concepts: [
      {
        id: 'ar-solid',
        title: 'SOLID, and the one letter people get wrong',
        tags: ['design', 'hot'],
        ask: 'Name a few SOLID principles — and one you have actually used.',
        body: [
          { p: 'SOLID is five design principles for object-oriented code, collected under that acronym by Robert Martin.' },
          {
            list: [
              '<b>S &mdash; Single Responsibility.</b> A class should have one reason to change. If the billing rules and the PDF layout live in the same class, two unrelated teams keep editing the same file.',
              '<b>O &mdash; Open/Closed.</b> You should be able to add behaviour without editing what is already there. A new payment provider should mean a new class, not another branch in a growing <code>if</code> chain.',
              '<b>L &mdash; Liskov Substitution.</b> Anywhere the code expects a base type, any subtype must work without surprises. If <code>Square</code> extends <code>Rectangle</code> and setting the width quietly changes the height, code written against <code>Rectangle</code> breaks.',
              '<b>I &mdash; Interface Segregation.</b> Several small interfaces beat one large one. No class should be forced to implement methods it never calls.',
              '<b>D &mdash; Dependency Inversion.</b> High-level code depends on an abstraction, not on a concrete low-level class. The details plug into the policy, not the other way round.'
            ]
          },
          {
            note: [
              'The <b>D</b> is dependency <b>inversion</b> — the principle. Dependency <b>injection</b> is the technique you normally use to get there: you pass a collaborator in instead of importing it. They are related, not interchangeable, and this is the single most common slip in this answer.'
            ]
          },
          { p: 'Here is the injection technique in the smallest form that shows the point.' },
          {
            code: {
              lang: 'js',
              src: `// Welded in. The import decides the dependency, forever.
import { stripe } from './stripe'

export async function chargeOrder(order) {
  return stripe.charge(order.total)     // always the real Stripe
}


// Injected. The caller decides what "payments" means.
export function makeChargeOrder(payments) {
  return async function chargeOrder(order) {
    return payments.charge(order.total)
  }
}

// production
const chargeOrder = makeChargeOrder(stripe)

// test — no network, and you can assert on what was called
const fake = { charge: async () => ({ id: 'ch_1', status: 'paid' }) }
const chargeOrder = makeChargeOrder(fake)`
            }
          },
          { p: 'That is the whole payoff. The function no longer knows which payment provider it uses, so a test hands it a fake and the test never touches the network. Frameworks automate the wiring — NestJS, Spring and .NET all resolve constructor arguments from a container.' },
          { p: 'Single Responsibility usually shows up as layers rather than as one clever class. A handler that parses the request, applies the business rules, and writes SQL has three reasons to change. Split it:' },
          {
            diagram: `controller    parse and validate the request, shape the response
                    |
service       the business rules      <- the part worth unit testing
                    |
repository    talk to the database

A change to the SQL never touches the business rules,
and the business rules can be tested with no HTTP and no database.`,
            caption: 'Single Responsibility as layers'
          },
          { p: 'That split is what the MVC pattern is doing too. It is the same principle applied to a whole application instead of one class.' }
        ],
        say:
          'Single responsibility, open/closed, Liskov substitution, interface segregation and dependency inversion. The one I use daily is dependency inversion — in practice through dependency injection, passing collaborators in as constructor or function arguments rather than importing them, so a test hands in a fake and never touches the network. I would be precise there: the D is inversion, the principle, and injection is the technique. The other one I lean on constantly is single responsibility, which in a backend shows up as controller, service and repository layers, so the business rules are testable without HTTP or a database.',
        traps: [
          'Calling the D "dependency injection". It is dependency inversion.',
          'Reciting five names with no example. Every interviewer has heard the acronym — the question is whether you have used one.',
          'Applying SOLID until every class hides behind an interface with exactly one implementation. Indirection you never vary is cost without benefit.'
        ]
      },
      {
        id: 'ar-microservices',
        title: 'Microservices: three advantages, three bills',
        tags: ['architecture'],
        ask: 'What are microservices, and what are three advantages and three disadvantages?',
        body: [
          { p: 'A monolith is one deployable unit. One codebase, one build, usually one database.' },
          { p: 'Microservices split that into several small services. Each one owns its own data, deploys on its own, and is reached over the network.' },
          {
            diagram: `Monolith                      Microservices

+----------------------+      +--------+  +----------+  +--------+
| orders    payments   |      | orders |  | payments |  | search |
| search    users      |      +--------+  +----------+  +--------+
+----------------------+           |  HTTP / gRPC / queue   |
                                +----+     +----+        +----+
      one database              | DB |     | DB |        | DB |
                                +----+     +----+        +----+`,
            caption: 'One box, or many'
          },
          { p: 'What you gain:' },
          {
            list: [
              '<b>Independent deploys.</b> A fix to search ships without rebuilding and re-testing orders. Releases get smaller, and so does the blast radius of a bad one.',
              '<b>Independent scaling.</b> If checkout takes the traffic, you scale checkout. In a monolith you scale the whole thing to feed one hot part, and pay for all the idle capacity around it.',
              '<b>Independent teams.</b> Each team owns a service end to end and stops queueing behind other people in one codebase. This is the reason that actually drives most real splits.'
            ]
          },
          { p: 'What you pay:' },
          {
            list: [
              '<b>Operational complexity.</b> Ten services means ten pipelines, ten sets of logs, ten deploys, service discovery, and distributed tracing so you can follow one user request across all of them.',
              '<b>The network sits in the middle.</b> What used to be a function call is now a network call — over REST, gRPC or a broker, it makes no difference to this cost. It can be slow, and it can fail halfway through. You need timeouts, retries, and handlers that are safe to run twice.',
              '<b>Data gets hard.</b> No joins across the whole database, and no single transaction spanning services. Consistency becomes eventual, and you build sagas or outbox tables to keep it honest. This is usually the most expensive part, and the one people forget to mention.',
              '<b>Security surface grows.</b> Every hop needs TLS, certificates that someone has to rotate, and services that authenticate to each other.'
            ]
          },
          { p: 'Martin Fowler calls the sum of this the microservice premium: a fixed cost you pay up front, which only pays back above a certain size of system and team.' },
          {
            note: [
              'Microservices are often sold as more resilient, because one service can fail on its own. That is only true if you built it in. With no timeout, a slow payments service holds every orders thread open until orders falls over too. A distributed system can fail in <i>more</i> ways than a monolith, not fewer.'
            ]
          }
        ],
        say:
          'Microservices split a monolith into small services that each own their data, deploy on their own, and talk over the network. The three wins are independent deploys, independent scaling of the part that is actually hot, and independent teams — and team scale is the reason that drives most real splits. The three bills are operational complexity, because every service needs its own pipeline, logs and tracing; the network in the middle, so every call needs timeouts, retries and idempotent handlers; and data, because you lose joins and cross-service transactions and end up building sagas. Fowler calls it the microservice premium, and it only pays back above a certain size.',
        traps: [
          'Listing resilience as a free advantage. Without timeouts and circuit breakers, one slow service takes its callers down with it.',
          'Forgetting that you lose joins and cross-service transactions. It is usually the costliest consequence of the split.',
          'Talking only about code. Most of the price is operational: pipelines, tracing, on-call rotations, and infrastructure cost per service.'
        ]
      },
      {
        id: 'ar-transport',
        title: 'Which transport between services',
        tags: ['architecture', 'performance', 'hot'],
        ask: 'Your services need to talk to each other. REST, gRPC, or a queue?',
        body: [
          { p: 'There are three ways services talk, and a healthy system uses all three. Picking one for everything is the mistake.' },
          {
            diagram: `browser / partner
      |
      |  REST + JSON            public edge, anyone can consume it
      v
+-------------+
| API gateway |
+-------------+
      |
      |  gRPC                   internal, synchronous, a caller is waiting
      v
+---------+   gRPC    +----------+
| orders  |---------->| matching |
+---------+           +----------+
      |
      |  events (Kafka / NATS)  nobody waits; consumers may be offline
      v
+------------+  +-------+  +---------------+
| settlement |  | audit |  | notifications |
+------------+  +-------+  +---------------+`,
            caption: 'Three transports, three different jobs'
          },
          {
            list: [
              '<b>REST and JSON at the edge.</b> Browsers speak it, partners speak it, and anyone can debug it with <code>curl</code>. This is the only layer that must be universally consumable, so it stays boring on purpose.',
              '<b>gRPC inside.</b> Both ends belong to you, so you can trade human-readability for speed and a stricter contract.',
              '<b>Messaging for events.</b> When nobody is waiting for an answer, do not make a call. "Order settled" should be published, not requested — the audit service being down must never fail the order.'
            ]
          },
          { p: 'The middle one is where the real choice lives. Here is what gRPC buys you over REST between two of your own services.' },
          {
            diagram: `                REST + JSON               gRPC

payload         text, verbose             binary protobuf — smaller and
                                          far cheaper to parse

contract        OpenAPI, kept in step     one .proto generates both sides;
                by discipline             drift breaks the build

connection      one request,              HTTP/2 — many calls multiplexed
                one response              over a single connection

streaming       bolted on (SSE,           native: server, client,
                websockets, polling)      and bidirectional

timeouts        you hand-roll them        deadlines propagate across hops
                                          automatically`,
            caption: 'Internal service-to-service'
          },
          { p: 'Two of those matter more than the others. <b>The generated contract</b> means a breaking change fails at build time instead of at three in the morning, because both services compile against the same <code>.proto</code>. And <b>streaming is native</b> — a price feed or a trade feed is a stream, not a sequence of requests, and in gRPC that is a language feature rather than something you assemble yourself.' },
          {
            code: {
              lang: 'proto',
              src: `syntax = "proto3";

service MarketData {
  rpc GetTicker    (TickerRequest) returns (Ticker);         // unary
  rpc StreamTrades (StreamRequest) returns (stream Trade);   // server stream
}

message Ticker {
  string symbol = 1;   // field numbers ARE the wire format:
  string last   = 2;   // never renumber, never reuse a retired number
  string volume = 3;   // money as string, never float — no rounding drift
}`
            }
          },
          { p: 'Notice the prices are strings. Binary floating point cannot represent most decimal amounts exactly, so money travels as a string or as a scaled integer and is parsed into a decimal type on arrival. That is equally true in JSON; protobuf just forces you to make it a deliberate decision in the schema.' },
          {
            note: [
              '<b>Browsers cannot speak gRPC.</b> They get no control over HTTP/2 frames. You need grpc-web plus a proxy such as Envoy. That, not preference, is the usual reason the public edge stays REST.',
              '<b>A plain L4 load balancer breaks gRPC.</b> HTTP/2 connections are long-lived, so a connection-level balancer pins each client to one backend and leaves it there. Traffic goes lopsided and newly started instances receive nothing. You need L7-aware balancing or client-side balancing.'
            ]
          },
          { p: 'And the honest caveat: gRPC makes the hop cheaper, not free. The network is still in the middle. You still need retries, handlers that are safe to run twice, and a story for a call that fails halfway. What you do gain is deadline propagation — a timeout at the edge actually cancels the work downstream, instead of leaving orphaned queries running against your database.' }
        ],
        say:
          'Three transports, three jobs. REST and JSON at the public edge, because browsers and partners have to consume and debug it. gRPC for internal service-to-service: both ends are ours, so we take binary protobuf for payload size, a generated contract so a breaking change fails at build time rather than in production, HTTP/2 multiplexing, and native streaming for anything feed-shaped. Events go over a broker, because when nobody is waiting for an answer a synchronous call is just coupling you did not need. The two caveats I would raise unprompted are that browsers cannot call gRPC without grpc-web and a proxy, and that gRPC needs L7 or client-side load balancing — long-lived HTTP/2 connections make an L4 balancer distribute traffic very unevenly.',
        traps: [
          'Exposing gRPC as the public API and expecting browsers or partners to consume it. They cannot, without a proxy and generated clients.',
          'Putting gRPC behind a plain L4 load balancer. Long-lived HTTP/2 connections pin clients to backends, so load goes lopsided and new instances sit idle.',
          'Renumbering or reusing a protobuf field number. The numbers are the wire format, so old and new readers silently disagree instead of failing loudly. Add fields; never renumber them.',
          'Making everything synchronous because gRPC is fast. If nobody is waiting for the answer, it should be an event.'
        ]
      },
      {
        id: 'ar-split',
        title: 'When to actually split — and when not to',
        tags: ['architecture', 'hot'],
        ask: 'Our backend keeps growing. When would you recommend moving to microservices?',
        body: [
          { p: 'Split for a reason you can name out loud. Three reasons hold up.' },
          {
            list: [
              '<b>The team cannot get out of its own way.</b> Conway&rsquo;s law says a system ends up shaped like the communication structure of the organisation that built it. When one codebase holds three feature teams that keep colliding, and the standup has fifteen people in it, splitting along team lines buys real speed.',
              '<b>One part is hot and the rest is not.</b> If checkout takes ten times the traffic of everything else, you are paying to scale the quiet parts alongside it. Split checkout out and scale only what needs it.',
              '<b>Failure has to stay contained.</b> If one bad deploy can take the whole product down, isolating the risky part limits the damage — as long as you add the timeouts and circuit breakers that make isolation real.'
            ]
          },
          { p: 'Now the other side, which is what the question is really probing. The most common mistake is splitting too early. Teams end up with a dozen services, each half-owned, and after a year nobody is quite sure what two of them do.' },
          { p: 'There is a good test to apply first: <b>can you build a modular monolith?</b> That means one deployable unit with real internal boundaries — modules that talk through defined interfaces instead of reaching into each other&rsquo;s tables.' },
          {
            diagram: `modular monolith                    microservices

+----------------------------+
|  orders    |   payments    |      one deploy  ->  many deploys
|------------|---------------|      one database -> many databases
|  a real interface between  |
|  them, enforced in code    |
+----------------------------+

boundary costs a refactor to move    boundary costs an API version,
                                     a migration and a coordinated deploy`,
            caption: 'Draw the line where it is still cheap to move'
          },
          { p: 'That is the argument in one line. A boundary inside a monolith costs a refactor to change. The same boundary between two services costs an API version, a data migration and a coordinated deploy. So draw your boundaries where they are cheap, let them settle, and cut only along lines that already proved right.' },
          { p: 'Worth adding: the industry over-corrected on this. Plenty of teams that split have moved back to a well-structured monolith, and monorepo tooling has made large single codebases much easier to live in. Being conservative here is the senior position, because the decision is expensive and very hard to reverse.' },
          {
            note: [
              'If a team cannot keep modules apart inside one codebase, the network will not impose that discipline for them. It will just make the same mess distributed, slower, and harder to debug.'
            ]
          }
        ],
        say:
          'I would split for a named reason, never as a default. The three that hold up are team scale — Conway&rsquo;s law, when one codebase has three teams stepping on each other — one hot component we are tired of scaling the whole system for, and a blast radius we need to contain. Before any of that I want a modular monolith with clear internal boundaries and one deploy. If we cannot keep modules apart in a single codebase, the network will not do it for us. A boundary is cheap to move inside a monolith and expensive to move between services, so I draw the lines first, let them prove themselves, and only then cut. The common failure I have seen is splitting too early and ending up with services nobody owns.',
        traps: [
          'Splitting by technical layer instead of by business capability. A "database service" and an "API service" gives you every network cost and none of the independence.',
          'Splitting before you can name the problem it solves. "We are growing" is not a reason.',
          'Underestimating the cost of reversing it. Merging services back together is far harder than splitting a module apart.'
        ]
      }
    ]
  });
})(window.PREP);
