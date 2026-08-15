/* Python core — language mechanics interviewers actually probe. */
(function (P) {
  P.modules.push({
    id: 'python',
    track: 'backend',
    title: 'Python, the language',
    kicker: 'Module 01',
    blurb:
      'Backend interviews open here. They are not testing syntax — they are testing whether you know what the interpreter is doing underneath: object identity, laziness, and the concurrency model.',
    concepts: [
      {
        id: 'py-names',
        title: 'Names, objects, and mutation',
        tags: ['fundamentals', 'hot'],
        ask: 'What does b = a actually do?',
        body: [
          { p: 'A name in Python is a label, not a box. <code>a = [1, 2]</code> builds <em>one</em> list object and points the label <code>a</code> at it. <code>b = a</code> pins a second label on that same object. Nothing is copied.' },
          {
            caption: 'One object, two labels',
            diagram: `a = [1, 2]      a ──▶ [1, 2]

b = a           a ──┐
                    ├──▶ [1, 2]        one object, two labels
                b ──┘

b.append(3)     a ──┐
                    ├──▶ [1, 2, 3]     MUTATE: the object changed,
                b ──┘                  so both labels see it

b = [9]         a ─────▶ [1, 2, 3]     REBIND: only the label b
                b ─────▶ [9]           moved. a is untouched.`
          },
          { p: 'So there are two different operations, and this whole topic is telling them apart. <b>Mutating</b> reaches through a label and changes the shared object. <b>Rebinding</b> points one label somewhere else and leaves the object alone.' },
          {
            code: {
              lang: 'python',
              src: `a = [1, 2]
b = a                # a second label on the same object
b.append(3)          # mutate through b

a                    # => [1, 2, 3]   a changed, though we never named it
a is b               # => True        one object, one identity

b = [9]              # rebind b
a                    # => [1, 2, 3]   untouched
b                    # => [9]
a is b               # => False       two objects now`
            }
          },
          { p: '<code>is</code> asks "the same object?". <code>==</code> asks "the same value?". Two separate lists that happen to hold equal contents are <code>==</code> but never <code>is</code>.' },
          {
            code: {
              lang: 'python',
              src: `x = [1, 2]
y = [1, 2]           # a separate list that merely looks the same

x == y               # => True    equal contents
x is y               # => False   different objects`
            }
          },
          { p: 'The same split decides whether a function can change its caller’s data. Passing an argument binds a <em>new local label</em> to the caller’s object.' },
          {
            code: {
              lang: 'python',
              src: `def rename(bucket):
    bucket = ['new']         # rebinds the local label only

def fill(bucket):
    bucket.append('new')     # mutates the caller's object

items = ['old']
rename(items)
items                # => ['old']           caller unaffected
fill(items)
items                # => ['old', 'new']    caller changed`
            }
          },
          { p: 'That is what makes the most-asked Python bug possible. A default argument is evaluated <b>once</b>, while the <code>def</code> statement runs — not on each call. So a mutable default is a single object shared by every call, for the life of the process.' },
          {
            code: {
              lang: 'python',
              src: `def collect(item, bucket=[]):    # this list is built ONCE, right here
    bucket.append(item)
    return bucket

collect('a')         # => ['a']
collect('b')         # => ['a', 'b']         the same list, still filling
collect('c')         # => ['a', 'b', 'c']`
            }
          },
          {
            code: {
              lang: 'python',
              src: `def collect(item, bucket=None):  # None is immutable, so it is safe to share
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket

collect('a')         # => ['a']
collect('b')         # => ['b']              a fresh list per call`
            }
          },
          { p: 'Some types can change after you create them. Some cannot.' },
          {
            list: [
              '<b>Can change</b> — the word for this is <em>mutable</em>: <code>list</code>, <code>dict</code>, <code>set</code>, and most classes you write yourself.',
              '<b>Cannot change</b> — the word is <em>immutable</em>: <code>int</code>, <code>str</code>, <code>tuple</code>, <code>frozenset</code>.'
            ]
          },
          { p: 'But "cannot change" means less than most people expect. A tuple does not hold objects. It holds labels that point at objects — the same labels as before. Immutable means you cannot move those labels. It does not mean the objects at the far end are frozen.' },
          {
            caption: 'A tuple locks its labels, not what they point at',
            diagram: `t = ([], 'x')

  t ──▶ position 0 ──▶ []          this list can still grow
        position 1 ──▶ 'x'
        ▲
        └── locked: you cannot point a position
            at some different object`
          },
          {
            code: {
              lang: 'python',
              src: `t = ([], 'x')        # a tuple holding a list and a string

t[0] = [1]           # ERROR — you cannot point position 0 somewhere else
                     # TypeError: 'tuple' object does not support item assignment

t[0].append(1)       # OK — the list at the end of that label still accepts changes
t                    # => ([1], 'x')     the tuple never changed; the list did`
            }
          }
        ],
        say:
          'A name is a label bound to an object, so assignment rebinds a label and never copies. Mutating changes the shared object and every label sees it; rebinding moves one label only. That one distinction explains aliasing bugs, mutable default arguments, and why copying a container does not copy what is inside it.',
        traps: [
          'Using a mutable default argument — it is created once, at definition time, and shared by every call.',
          'Reaching for <code>is</code> to compare values. It appears to work only by accident, via small-int and string interning.',
          'Assuming <code>copy.copy()</code> copies everything. It copies the outer container only, and the objects inside stay shared. <code>copy.deepcopy()</code> copies all the way down.'
        ]
      },
      {
        id: 'py-structures',
        title: 'Choosing the right data structure',
        tags: ['complexity'],
        ask: 'Which container, and what does it cost?',
        body: [
          { p: 'Interviewers want the costs straight away, with one sentence on why. Open a container below to see how it is laid out and what it is for.' },
          {
            structures: [
              {
                name: 'list',
                kind: 'dynamic array',
                cost: [['index', 'O(1)'], ['append', 'O(1)'], ['insert(0)', 'O(n)'], ['x in', 'O(n)']],
                diagram: `index       0     1     2     3
         ┌─────┬─────┬─────┬─────┬─ ─ ─┬─ ─ ─┐
         │  a  │  b  │  c  │  d  │     │     │  spare room
         └─────┴─────┴─────┴─────┴─ ─ ─┴─ ─ ─┘
            ▲                       ▲
            │                       └─ append lands here      O(1)
            └─ insert(0) shifts everything right              O(n)

  One unbroken block of slots, so reaching position 3 is a
  single jump, however long the list is                       O(1)
  but "x in list" has to walk it item by item                 O(n)

  Append is amortised O(1): now and then the block is full and
  everything is copied into a bigger one.`,
                use: [
                  'You need to keep things in the order you put them, and reach one by its position or take a range — rows from a query, parsed lines, a stack built from <code>append</code> and <code>pop</code>.',
                  'The collection is small enough that walking it costs nothing.'
                ],
                not: ' you keep asking "is x in here?" (use a <code>set</code>) or you pop from the front (use a <code>deque</code>).'
              },
              {
                name: 'tuple',
                kind: 'fixed-size array',
                cost: [['index', 'O(1)'], ['x in', 'O(n)'], ['hash', 'O(k)']],
                diagram: `         ┌─────┬─────┬─────┐
         │  a  │  b  │  c  │   fixed at creation, no spare room
         └─────┴─────┴─────┘

  Reading works exactly like a list: jumping to a position
  costs O(1), and searching for a value costs O(n).

  Nothing can be added, removed, or re-pointed, and that is what
  makes the whole tuple hashable — so it can be a dict key.
  Hashing walks every item, so cost grows with length     O(k)`,
                use: [
                  'A fixed record whose shape never changes — <code>(lat, lng)</code>, an RGB colour, several values returned from one function.',
                  'A dict key or set member built from more than one value — <code>counts[(user_id, date)]</code>.',
                  'A constant you want nothing to append to by accident.'
                ],
                not: ' the collection grows or items get replaced. That is a list.'
              },
              {
                name: 'dict',
                kind: 'hash table',
                cost: [['get / set', 'O(1)'], ['delete', 'O(1)'], ['key in', 'O(1)']],
                diagram: `  d['sam']
     │
     │  hash('sam')  ──▶  slot 3
     ▼
  ┌──────┬──────┬──────┬───────────────┬──────┐
  │      │      │      │ 'sam' ──▶ 42  │      │
  └──────┴──────┴──────┴───────────────┴──────┘
     0      1      2           3           4

  The hash picks the slot directly, so the number of entries
  does not change the cost                        O(1) average

  Insertion order is recorded separately, and iteration follows
  it — guaranteed by the language since Python 3.7.`,
                use: [
                  'Lookup by key — id to object, name to handler, parsed configuration.',
                  'Grouping and counting, usually through <code>defaultdict</code> or <code>Counter</code>.',
                  'Anything that arrived as JSON.'
                ],
                not: ' you only need "does this exist?" with no value attached. A set is smaller and states the intent.'
              },
              {
                name: 'set',
                kind: 'hash table, keys only',
                cost: [['add', 'O(1)'], ['x in', 'O(1)'], ['a &amp; b', 'O(min(a,b))']],
                diagram: `  ┌──────┬──────┬──────┬──────┬──────┐
  │      │  b   │      │  a   │  c   │   keys only, no values
  └──────┴──────┴──────┴──────┴──────┘

  'a' in some_set    hash, check one slot, done          O(1)
  'a' in some_list   walk every element                  O(n)

  That difference is the single most valuable line on this card.
  Checking a list inside a loop means walking it every time. Build
  the set once, up front, and the whole loop drops from O(n·m)
  to O(n).`,
                use: [
                  'You keep asking "is this one in here?" inside a loop. Build the set once and every check after that is effectively free.',
                  'Removing duplicates when order does not matter.',
                  'Comparing two collections: <code>a &amp; b</code> shared, <code>a - b</code> missing, <code>a | b</code> combined.'
                ],
                not: ' order matters, duplicates matter, or the items are unhashable — a list cannot go into a set.'
              },
              {
                name: 'collections.deque',
                kind: 'doubly linked blocks',
                cost: [['both ends', 'O(1)'], ['middle', 'O(n)']],
                diagram: ` popleft ◀─┐                                ┌─▶ append
            │                                │
      ┌─────┴────┐    ┌──────────┐    ┌──────┴───┐
      │ a  b  c  │◀──▶│ d  e  f  │◀──▶│ g  h     │
      └──────────┘    └──────────┘    └──────────┘
        block 1         block 2         block 3

  Both ends are cheap, no shifting                        O(1)
  but reaching 'e' walks block by block from an end       O(n)

  This is your queue, not your array.`,
                use: [
                  'A FIFO queue — <code>append</code> at one end, <code>popleft</code> at the other.',
                  'A sliding window moving over a stream.',
                  'Keeping only the most recent N: <code>deque(maxlen=N)</code> drops the oldest for you.'
                ],
                not: ' you reach into the middle by index. That is a list.'
              },
              {
                name: 'heapq',
                kind: 'binary heap kept in a list',
                cost: [['push / pop', 'O(log n)'], ['peek min', 'O(1)']],
                diagram: `  the list:   [1, 3, 5, 7, 9, 8]

  read as a tree:          1     ◀── h[0] is always the
                         ┌─┴─┐       smallest item      O(1)
                         3   5
                       ┌─┴─┐ │
                       7   9 8

  push and pop repair one path between root and leaf  O(log n)

  Only "parent ≤ child" holds. The list is NOT sorted — do not
  read h[1] expecting the second smallest.`,
                use: [
                  'Top-K from a large stream without sorting the whole thing.',
                  'A priority queue — a scheduler, Dijkstra, a worker taking the most urgent job first.',
                  'Merging already-sorted sequences with <code>heapq.merge</code>.'
                ],
                not: ' you need everything in order. Call <code>sorted()</code>.'
              }
            ]
          },
          { p: 'Three shortcuts from the same module are worth memorising, because they save you writing a loop under time pressure:' },
          {
            code: {
              lang: 'python',
              src: `from collections import defaultdict, Counter, deque

groups = defaultdict(list)          # no key checks
for user in users:
    groups[user.team].append(user)

Counter(words).most_common(3)       # top-3 in one line
queue = deque(maxlen=100)           # ring buffer, drops the oldest`
            }
          },
          { p: 'One last container question that comes up a lot: <b>does a dict remember the order you added things in?</b> Yes, since Python 3.7, and the promise is part of the language, so every Python must do it. Before that it happened in CPython 3.6 only by accident, and you were told not to rely on it.' },
          { p: 'That is why <code>collections.OrderedDict</code> is now rare. It <em>is</em> a dict — <code>issubclass(OrderedDict, dict)</code> is <code>True</code> — with a doubly-linked list threaded through it, which costs memory: 408 bytes against 184 for the same three pairs. What that list buys you is cheap removal from the front, which matters for exactly one classic exercise. That is the next concept.' },
        ],
        say:
          'I choose by the operation that runs most often. A list keeps things in the order I put them and lets me jump straight to position 3. A dict finds a value by its key, and a set answers "is this one in here?". A deque adds and removes at both ends. The deciding question is which of those runs inside the busiest loop.',
        traps: [
          'Repeated <code>x in some_list</code> inside a loop — that is <code>O(n·m)</code>. Build a set once.',
          'Using a list as a queue with <code>pop(0)</code>.',
          'Trying to use a list as a dict key — unhashable because it is mutable.'
        ]
      },
      {
        id: 'py-lru',
        title: 'Build an LRU cache',
        tags: ['exercise', 'hot'],
        ask: 'Build a cache that holds N items and drops the least recently used.',
        body: [
          { p: 'This one is asked by name, so it is worth having ready. <b>LRU</b> means <em>least recently used</em>. The cache holds a fixed number of items. When it is full and something new arrives, it throws away whichever item nobody has touched for the longest time.' },
          { p: 'The whole trick is to keep the items in order of last use. Every time an item is used, move it to the back. The untouched ones drift to the front, so the one to throw away is always the first.' },
          {
            caption: 'Capacity 3',
            diagram: `put a, b, c        front [ a  b  c ] back
                          ▲              ▲
                          oldest         newest

get('a')           front [ b  c  a ] back      'a' moves to the back

put('d')           front [ b  c  a  d ] back   now 4 items, over capacity
                          ▲
                          drop this one

result             front [ c  a  d ] back      'b' evicted`
          },
          {
            code: {
              lang: 'python',
              src: `from collections import OrderedDict

cache, CAPACITY = OrderedDict(), 3

def put(key, value):
    cache[key] = value
    cache.move_to_end(key)                # just used -> send to the back
    if len(cache) > CAPACITY:
        cache.popitem(last=False)         # full -> drop the front item

def get(key):
    if key not in cache:
        return None
    cache.move_to_end(key)                # reading counts as using it
    return cache[key]

put('a', 'A'); put('b', 'B'); put('c', 'C')
get('a')             # touch 'a', so 'b' becomes the oldest
put('d', 'D')        # now over capacity

list(cache)          # => ['c', 'a', 'd']   'b' was evicted
get('b')             # => None`
            }
          },
          { p: 'The follow-up question is <b>why not a plain dict</b>, since that keeps insertion order too. Moving a key to the back is not the problem — <code>d[key] = d.pop(key)</code> does it, at 34 ns against 27 ns. The problem is the other half of the job: finding the oldest key to remove.' },
          { p: 'With a plain dict you ask for the first key with <code>next(iter(d))</code>. Deleting a key does not close the gap it leaves behind, so after thousands of evictions the front of the dict is full of holes that iteration has to step over. It degrades under exactly the pattern an LRU cache creates.' },
          {
            caption: 'Measured on CPython 3.14.7',
            diagram: `A 50,000-item cache, then 70,000 evictions:

  plain dict    del d[next(iter(d))]         452 ms
  OrderedDict   popitem(last=False)           10 ms      ~43x faster

The same single call, before and after 40,000 evictions:

  fresh dict                      39 ns
  dict after the churn           998 ns   ← stepping over dead slots
  OrderedDict after the churn     48 ns   ← follows one link, no scan`
          },
          {
            note: [
              'For caching a function you would not write any of this — <code>functools.lru_cache</code> is built in. It does not use <code>OrderedDict</code> either: read <code>functools.py</code> and you will find it keeps its own circular doubly linked list. Write it by hand when you are asked to, or when eviction needs its own rules.'
            ]
          }
        ],
        say:
          'Keep the items in order of last use: move an item to the back whenever it is read or written, and evict from the front when you are over capacity. OrderedDict gives me both in O(1) — move_to_end and popitem(last=False). A plain dict can move to the back just as cheaply, but finding the oldest key means scanning past deleted slots, which degrades badly under churn.',
        traps: [
          'Forgetting that a <em>read</em> counts as a use. If <code>get</code> does not reorder, it is not an LRU cache.',
          'Evicting before inserting, or checking capacity with <code>&gt;=</code> so the cache holds one item too few.',
          'Reaching for <code>OrderedDict</code> and then not being able to say what it gives you over a plain dict.'
        ]
      },
      {
        id: 'py-generators',
        title: 'Iterators, generators, laziness',
        tags: ['memory'],
        ask: 'Why would you return a generator instead of a list?',
        body: [
          { p: 'An iterable produces an iterator via <code>__iter__</code>; the iterator yields items via <code>__next__</code> and raises <code>StopIteration</code> when exhausted. A generator function is a compact way to write one: calling it returns a generator without running any body code, and each <code>yield</code> suspends the frame with its locals intact.' },
          { p: 'The payoff is constant memory and early exit. Reading a 4 GB log line by line, or streaming a query in batches, costs the same memory as one item.' },
          {
            code: {
              lang: 'python',
              src: `def read_events(path):
    with open(path) as fh:
        for line in fh:               # the file object is itself lazy
            if line.startswith('#'):
                continue
            yield json.loads(line)

first_error = next(
    (e for e in read_events(p) if e['level'] == 'ERROR'),
    None,
)   # stops reading the moment it finds one`
            }
          },
          {
            note: [
              'Generators are single-pass. Iterate one twice and the second pass is empty — no error, just silence. If a caller needs to loop more than once, hand back a list or a sequence.'
            ]
          }
        ],
        say:
          'A generator trades random access for constant memory and lazy evaluation. I reach for one whenever the collection is large, unbounded, or the consumer might stop early.',
        traps: [
          'Calling <code>len()</code> on a generator, or indexing it.',
          'Consuming it twice and quietly getting nothing the second time.',
          'Holding a database cursor or file handle open across a generator that the caller may abandon.'
        ]
      },
      {
        id: 'py-decorators',
        title: 'Closures and decorators',
        tags: ['fundamentals'],
        ask: 'Write a decorator that retries a function three times.',
        body: [
          { p: 'A decorator is just a callable taking a function and returning a replacement. <code>@deco</code> above <code>def f</code> is sugar for <code>f = deco(f)</code>. The inner function closes over the enclosing scope, which is how state survives between calls.' },
          {
            code: {
              lang: 'python',
              src: `import functools, time

def retry(times=3, delay=0.2, exc=Exception):
    def decorate(fn):
        @functools.wraps(fn)          # keeps __name__, __doc__, signature
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exc:
                    if attempt == times:
                        raise
                    time.sleep(delay * 2 ** (attempt - 1))
        return wrapper
    return decorate

@retry(times=3, exc=TimeoutError)
def fetch(url): ...`
            }
          },
          { p: 'Three layers because the decorator takes arguments: configure, decorate, wrap. Without arguments you drop the outer layer. To rebind a name in an enclosing scope you need <code>nonlocal</code>; for module scope, <code>global</code>.' }
        ],
        say:
          'A decorator wraps a callable to add behaviour without touching the body — retries, caching, timing, auth checks. I always apply functools.wraps so introspection and stack traces survive.',
        traps: [
          'Forgetting <code>functools.wraps</code>, which breaks logging, docs, and some frameworks that read the signature.',
          'Capturing the loop variable in a closure — it binds late, so every closure sees the final value.',
          'Stacking decorators without knowing the order: the one closest to <code>def</code> is applied first.'
        ]
      },
      {
        id: 'py-context',
        title: 'Context managers',
        tags: ['resources'],
        ask: 'How do you guarantee cleanup?',
        body: [
          { p: '<code>with</code> calls <code>__enter__</code>, runs the block, then calls <code>__exit__</code> — even if the block raises or returns. That guarantee is why files, locks, database transactions, and mocks all use it.' },
          {
            code: {
              lang: 'python',
              src: `from contextlib import contextmanager

@contextmanager
def timed(label):
    start = time.perf_counter()
    try:
        yield                     # the body runs here
    finally:
        log.info('%s took %.3fs', label, time.perf_counter() - start)

with timed('import'), open(path) as fh:   # several at once
    process(fh)`
            }
          },
          { p: 'Returning a truthy value from <code>__exit__</code> swallows the exception. That is almost always wrong — <code>contextlib.suppress</code> makes the intent explicit when you do want it.' }
        ],
        say:
          'Context managers bind acquisition to release, so cleanup runs on every exit path including exceptions. contextlib.contextmanager gets me one from a generator with a try/finally.',
        traps: [
          'A <code>__exit__</code> that returns True and silently eats every error.',
          'Opening resources in a loop without <code>with</code> and leaking handles until the GC happens to run.'
        ]
      },
      {
        id: 'py-oop',
        title: 'Data model, MRO, and dunder methods',
        tags: ['oop'],
        ask: 'How does Python resolve an attribute across multiple base classes?',
        body: [
          { p: 'Attribute lookup walks the MRO — the linearised class order computed by C3, visible as <code>Cls.__mro__</code>. <code>super()</code> does not mean "my parent"; it means "the next class in the MRO of the instance", which is what makes cooperative multiple inheritance work.' },
          { p: 'The data model is the real API. <code>__len__</code>, <code>__iter__</code>, <code>__getitem__</code>, <code>__eq__</code>/<code>__hash__</code>, <code>__repr__</code>, <code>__enter__</code>/<code>__exit__</code> let your objects work with built-in syntax rather than bespoke methods.' },
          {
            code: {
              lang: 'python',
              src: `from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Money:
    amount: int          # minor units — never float for money
    currency: str = 'THB'

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError('currency mismatch')
        return Money(self.amount + other.amount, self.currency)

# frozen=True gives __hash__ and immutability
# slots=True drops __dict__: less memory, faster attribute access`
            }
          },
          { p: 'Rule of thumb: <code>dataclass</code> for records, <code>NamedTuple</code> when it must behave like a tuple, <code>Protocol</code> for structural typing, Pydantic when data crosses a system boundary and needs validation and coercion.' }
        ],
        say:
          'Lookup follows the C3-linearised MRO, and super() delegates to the next class in that order rather than to a fixed parent. Implementing dunder methods is how I make my types feel native.',
        traps: [
          'Defining <code>__eq__</code> without <code>__hash__</code> — the instance becomes unhashable.',
          'Mutable class attributes shared across every instance.',
          'Deep inheritance where composition would read better.'
        ]
      },
      {
        id: 'py-gil',
        title: 'The GIL and the concurrency menu',
        tags: ['concurrency', 'hot'],
        ask: 'Does threading make Python faster?',
        body: [
          { p: 'CPython protects interpreter state with a global interpreter lock, so exactly one thread executes bytecode at a time. Threads still help when they spend their time waiting — the lock is released around I/O and inside C extensions like NumPy.' },
          {
            list: [
              '<b>I/O-bound, many waits</b> — <code>asyncio</code> for thousands of concurrent sockets on one thread; <code>ThreadPoolExecutor</code> when the library is blocking and you cannot rewrite it.',
              '<b>CPU-bound</b> — <code>ProcessPoolExecutor</code> or <code>multiprocessing</code>. Separate interpreters, real parallelism, but arguments and results must pickle across a pipe.',
              '<b>Background work in a web app</b> — a task queue such as Celery or RQ. Do not block the request thread.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `import asyncio, httpx

async def fetch_all(urls):
    async with httpx.AsyncClient(timeout=5) as client:
        results = await asyncio.gather(
            *(client.get(u) for u in urls),
            return_exceptions=True,       # one failure does not kill the batch
        )
    return [r for r in results if not isinstance(r, Exception)]

# One blocking call poisons the whole loop:
# time.sleep(5)                        -> use await asyncio.sleep(5)
# requests.get(url)                    -> use an async client
# heavy_cpu()  -> await asyncio.to_thread(heavy_cpu) or a process pool`
            }
          },
          { p: 'Worth knowing for 2026: the free-threaded build that removes the GIL arrived in 3.13 (PEP 703) and became <b>officially supported</b> in 3.14 (PEP 779) — no longer experimental, though still not the default build, so you opt into it. Separately, 3.12 gave each subinterpreter its own GIL (PEP 684) and 3.14 exposed subinterpreters to Python code through <code>concurrent.interpreters</code> (PEP 734). Answer for the standard build, and mention these to show you are current.' }
        ],
        say:
          'Threads give concurrency, not CPU parallelism, because the GIL serialises bytecode. I/O-bound work goes to asyncio or a thread pool, CPU-bound work goes to processes, and anything slow inside a request goes to a task queue.',
        traps: [
          'Calling a blocking library inside an async view and stalling the entire event loop.',
          'Spawning processes for tiny tasks — pickling and process startup dominate.',
          'Sharing mutable state across threads without a lock and calling it fine because "the GIL protects it". It protects bytecode, not your invariants.'
        ]
      },
      {
        id: 'py-errors',
        title: 'Exceptions, EAFP, and memory',
        tags: ['fundamentals'],
        ask: 'How does Python manage memory, and how should you handle errors?',
        body: [
          { p: 'CPython frees objects by reference counting the instant the count hits zero; a generational cycle collector sweeps up reference cycles that counting alone cannot reclaim. Cycles matter when objects hold each other — caches, parent/child links, closures over self.' },
          { p: 'Style is EAFP — attempt the operation and handle failure — rather than LBYL, which invites race conditions between the check and the use. Catch the narrowest exception you can, and never write a bare <code>except:</code>, which also swallows <code>KeyboardInterrupt</code>.' },
          {
            code: {
              lang: 'python',
              src: `class PaymentDeclined(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code              # structured, not a string blob

try:
    charge(order)
except PaymentDeclined as exc:
    log.warning('declined %s order=%s', exc.code, order.id)
    raise                             # re-raise, keep the traceback
except (TimeoutError, ConnectionError) as exc:
    raise PaymentUnavailable('gateway down') from exc   # keep the cause`
            }
          }
        ],
        say:
          'Reference counting plus a cycle collector. For errors I prefer EAFP with narrow except clauses, custom exception types carrying structured context, and raise-from so the original cause survives.',
        traps: [
          'Bare <code>except:</code> or <code>except Exception: pass</code>.',
          'Losing the original traceback by raising a fresh exception without <code>from</code>.',
          'Control flow via exceptions in a hot loop — it is not free.'
        ]
      }
    ]
  });
})(window.PREP);
