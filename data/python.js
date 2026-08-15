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
          { p: 'Interviewers want the complexity table without hesitation, plus one sentence on why.' },
          {
            list: [
              '<code>list</code> — dynamic array. Index and append amortised <code>O(1)</code>; <code>insert(0, x)</code> and <code>pop(0)</code> are <code>O(n)</code>; membership is <code>O(n)</code>.',
              '<code>dict</code> / <code>set</code> — hash table. Lookup, insert, delete average <code>O(1)</code>. Keys must be hashable, meaning immutable in practice.',
              '<code>collections.deque</code> — doubly linked blocks. Push and pop at either end are <code>O(1)</code>, but reaching an item in the middle is <code>O(n)</code>. This is your queue, not your array.',
              '<code>tuple</code> — a fixed-size array. Reading costs the same as a list: index <code>O(1)</code>, membership <code>O(n)</code>. Nothing can be added or removed, and that is what makes it hashable — so it works as a dict key, where hashing costs <code>O(k)</code> in the number of items. It also uses a little less memory, because a list over-allocates spare room to grow.',
              '<code>heapq</code> on a list — <code>O(log n)</code> push/pop, <code>O(1)</code> peek at the min. Top-K problems.'
            ]
          },
          { p: 'Since 3.7 dicts preserve insertion order as a language guarantee. <code>collections.OrderedDict</code> now only earns its place for <code>move_to_end</code> and order-sensitive equality — an LRU cache, for instance.' },
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
          }
        ],
        say:
          'List for ordered data I index, dict or set when I need membership or lookup by key, deque when I push and pop at both ends. The deciding question is which operation runs inside the hot loop.',
        traps: [
          'Repeated <code>x in some_list</code> inside a loop — that is <code>O(n·m)</code>. Build a set once.',
          'Using a list as a queue with <code>pop(0)</code>.',
          'Trying to use a list as a dict key — unhashable because it is mutable.'
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
