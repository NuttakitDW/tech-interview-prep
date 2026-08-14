/* Backend question bank — Python, Django, DRF. */
(function (P) {
  P.quiz.push(
    /* ---------- Python ---------- */
    {
      id: 'b01', track: 'backend', module: 'python',
      q: 'What does <code>def f(x, bucket=[])</code> do across two separate calls?',
      choices: [
        'Each call gets a fresh empty list',
        'Both calls share the same list, created once at definition time',
        'It raises a SyntaxError',
        'The list is recreated whenever the function is redefined at runtime'
      ],
      a: 1,
      why: 'Default arguments are evaluated once, when the <code>def</code> statement executes. A mutable default is therefore shared by every call. Use <code>None</code> as a sentinel and build the list inside the body.'
    },
    {
      id: 'b02', track: 'backend', module: 'python',
      q: 'Which operation on a <code>list</code> is <code>O(n)</code>?',
      choices: ['<code>lst[5]</code>', '<code>lst.append(x)</code>', '<code>lst.pop()</code>', '<code>lst.insert(0, x)</code>'],
      a: 3,
      why: 'A list is a dynamic array. Inserting at the front shifts every element right, so it is <code>O(n)</code>. Index access is <code>O(1)</code>, and append/pop at the end are amortised <code>O(1)</code>. Use <code>collections.deque</code> when you push at both ends.'
    },
    {
      id: 'b03', track: 'backend', module: 'python',
      q: 'You call a generator function. When does its body start executing?',
      choices: [
        'Immediately, at the call',
        'On the first <code>next()</code> or iteration',
        'When the generator is garbage collected',
        'Only if it is wrapped in <code>list()</code>'
      ],
      a: 1,
      why: 'Calling a generator function creates a generator object without running any body code. Execution starts on the first <code>next()</code> and suspends at each <code>yield</code>, keeping the frame and its locals alive.'
    },
    {
      id: 'b04', track: 'backend', module: 'python',
      q: 'Threading in CPython gives you real parallel speed-up for which workload?',
      choices: [
        'Tight numeric loops written in pure Python',
        'Network calls and other I/O waits',
        'Any workload — the GIL was removed in 3.10',
        'Recursive algorithms, because each thread has its own stack'
      ],
      a: 1,
      why: 'The GIL serialises bytecode execution, but it is released around I/O and inside C extensions. So threads help when they are waiting, not when they are computing. CPU-bound Python needs processes. The free-threaded build (PEP 703) exists in 3.13+ but is not the default.'
    },
    {
      id: 'b05', track: 'backend', module: 'python',
      q: 'Why does a decorator normally apply <code>@functools.wraps(fn)</code> to its wrapper?',
      choices: [
        'It makes the wrapped function run faster',
        'It copies <code>__name__</code>, <code>__doc__</code> and metadata so introspection and tracebacks stay useful',
        'It is required for the decorator to accept arguments',
        'It prevents the function from being decorated twice'
      ],
      a: 1,
      why: 'Without it the wrapper replaces the original identity, so logging, documentation tools, and frameworks that read the signature all see <code>wrapper</code> instead of the real function.'
    },
    {
      id: 'b06', track: 'backend', module: 'python',
      q: 'Inside an <code>async def</code> view, which line stalls the entire event loop?',
      choices: [
        '<code>await asyncio.sleep(2)</code>',
        '<code>await client.get(url)</code> with an async HTTP client',
        '<code>time.sleep(2)</code>',
        '<code>await asyncio.gather(*tasks)</code>'
      ],
      a: 2,
      why: '<code>time.sleep</code> blocks the thread running the loop, so every other coroutine is frozen. Blocking calls must be awaited via an async equivalent, <code>asyncio.to_thread</code>, or a process pool.'
    },
    {
      id: 'b07', track: 'backend', module: 'python',
      q: 'What does <code>@dataclass(frozen=True)</code> give you beyond immutability?',
      choices: [
        'A generated <code>__hash__</code>, so instances can be dict keys or set members',
        'Automatic database persistence',
        'Thread-safe attribute writes',
        'Removal of <code>__dict__</code> from instances'
      ],
      a: 0,
      why: 'Frozen dataclasses are hashable because their fields cannot change. Dropping <code>__dict__</code> is a separate flag, <code>slots=True</code>, which reduces memory and speeds up attribute access.'
    },
    {
      id: 'b08', track: 'backend', module: 'python',
      q: 'How does CPython reclaim two objects that reference each other and nothing else?',
      choices: [
        'Reference counting handles it immediately',
        'The generational cycle collector detects the unreachable cycle',
        'They leak until the process exits',
        'The operating system reclaims them on the next page fault'
      ],
      a: 1,
      why: 'Reference counts never reach zero in a cycle, so the generational garbage collector periodically finds unreachable cycles and frees them. Everything else is freed the instant its count hits zero.'
    },
    {
      id: 'b09', track: 'backend', module: 'python',
      q: 'Which is the strongest reason to prefer <code>raise X from exc</code> over a bare <code>raise X</code>?',
      choices: [
        'It is faster',
        'It preserves the original exception as the cause, keeping the full chain in the traceback',
        'It suppresses the original exception entirely',
        'It automatically retries the failed operation'
      ],
      a: 1,
      why: 'Explicit chaining keeps the root cause visible in logs and error trackers. Raising a fresh exception without it hides where the failure really started.'
    },
    {
      id: 'b10', track: 'backend', module: 'python',
      q: 'What does <code>super()</code> refer to in a class with multiple bases?',
      choices: [
        'The first class listed in the bases',
        'The next class in the instance MRO',
        'The direct parent that defined the method',
        'The base of the object being constructed, resolved at runtime by name'
      ],
      a: 1,
      why: '<code>super()</code> follows the C3-linearised MRO of the actual instance, which is what makes cooperative multiple inheritance work. It is not a synonym for "my parent".'
    },

    /* ---------- Django core / ORM ---------- */
    {
      id: 'b11', track: 'backend', module: 'django',
      q: 'Which of these does <b>not</b> evaluate a QuerySet?',
      choices: [
        '<code>list(qs)</code>',
        '<code>len(qs)</code>',
        '<code>qs.filter(active=True)</code>',
        '<code>if qs:</code>'
      ],
      a: 2,
      why: 'Filtering returns a new, still-lazy QuerySet. Evaluation happens on iteration, <code>len()</code>, <code>list()</code>, truthiness, slicing with a step, pickling, or <code>repr()</code>.'
    },
    {
      id: 'b12', track: 'backend', module: 'django',
      q: 'You loop over orders and read <code>order.customer.name</code> each time. Which fixes the N+1?',
      choices: [
        '<code>prefetch_related("customer")</code>',
        '<code>select_related("customer")</code>',
        '<code>only("customer")</code>',
        '<code>defer("customer")</code>'
      ],
      a: 1,
      why: '<code>customer</code> is a forward ForeignKey, so <code>select_related</code> pulls it in with a JOIN in the same query. <code>prefetch_related</code> would also work but costs an extra query and is meant for many-to-many and reverse relations.'
    },
    {
      id: 'b13', track: 'backend', module: 'django',
      q: 'Two workers decrement the same stock row at once. Which version is safe?',
      choices: [
        '<code>obj.stock -= 1; obj.save()</code>',
        '<code>obj.refresh_from_db(); obj.stock -= 1; obj.save()</code>',
        '<code>Product.objects.filter(pk=pk).update(stock=F("stock") - 1)</code>',
        '<code>obj.save(update_fields=["stock"])</code>'
      ],
      a: 2,
      why: 'An <code>F()</code> expression makes the database compute the new value inside a single UPDATE, so concurrent writers cannot lose each other\'s update. Every read-then-write variant has a race window.'
    },
    {
      id: 'b14', track: 'backend', module: 'django',
      q: 'What is the correct order in <code>MIDDLEWARE</code>?',
      choices: [
        'Alphabetical — Django sorts it anyway',
        'Top to bottom on the request, and reversed on the response',
        'Bottom to top on the request, top to bottom on the response',
        'Order is irrelevant; each middleware is independent'
      ],
      a: 1,
      why: 'Middleware is an onion. It runs top to bottom inbound and bottom to top outbound, which is why <code>SessionMiddleware</code> must appear before <code>AuthenticationMiddleware</code>.'
    },
    {
      id: 'b15', track: 'backend', module: 'django',
      q: 'You need to add a <code>NOT NULL</code> column to a huge production table. What is the safe sequence?',
      choices: [
        'One migration adding the column with a default and NOT NULL',
        'Add it nullable, backfill in batches, then add the constraint in a later deploy',
        'Drop and recreate the table during a maintenance window',
        'Add it as nullable and leave it — the constraint is optional'
      ],
      a: 1,
      why: 'Expand, backfill, contract. A nullable add is cheap metadata; a batched backfill avoids a long lock; the constraint lands once the data is clean and both old and new code can coexist during rollout.'
    },
    {
      id: 'b16', track: 'backend', module: 'django',
      q: 'Why should a Celery task be dispatched inside <code>transaction.on_commit()</code>?',
      choices: [
        'It makes the task run faster',
        'A worker can otherwise pick it up before the transaction commits and find no row',
        'Celery requires it for retries to work',
        'It guarantees exactly-once execution'
      ],
      a: 1,
      why: 'Enqueuing inside an open transaction publishes work referring to data that is not yet visible — or may roll back entirely. <code>on_commit</code> defers dispatch until the commit actually lands.'
    },
    {
      id: 'b17', track: 'backend', module: 'django',
      q: 'In a data migration, why use <code>apps.get_model("app", "Model")</code> instead of importing the model?',
      choices: [
        'It is faster',
        'It gives the historical model state matching this point in the migration history',
        'The import would create a circular dependency',
        'It bypasses signals'
      ],
      a: 1,
      why: 'The imported class reflects today\'s code. When the model changes later, an old migration replayed on a fresh database would break. <code>apps.get_model</code> returns the frozen state for that migration.'
    },
    {
      id: 'b18', track: 'backend', module: 'django',
      q: 'What does <code>select_for_update()</code> do?',
      choices: [
        'Caches the rows for later updates',
        'Takes a row-level lock held until the surrounding transaction commits',
        'Selects only fields that are about to change',
        'Upgrades the query to a bulk update'
      ],
      a: 1,
      why: 'It issues <code>SELECT ... FOR UPDATE</code>, so concurrent transactions block on those rows until commit. It requires an open <code>atomic()</code> block; <code>skip_locked</code> and <code>nowait</code> change the waiting behaviour.'
    },
    {
      id: 'b19', track: 'backend', module: 'django',
      q: 'Which enforces an invariant even when data is changed by <code>bulk_create</code>, <code>update()</code>, or psql?',
      choices: [
        'Validation in <code>Model.clean()</code>',
        'An override of <code>Model.save()</code>',
        'A <code>CheckConstraint</code> in <code>Meta.constraints</code>',
        'A <code>pre_save</code> signal'
      ],
      a: 2,
      why: 'Only a database constraint holds for every writer. <code>clean()</code> runs when something calls it, <code>save()</code> overrides and signals are bypassed by queryset-level operations entirely.'
    },
    {
      id: 'b20', track: 'backend', module: 'django',
      q: 'What is the difference between <code>annotate()</code> and <code>aggregate()</code>?',
      choices: [
        'annotate adds a computed value per row and returns a QuerySet; aggregate collapses the whole set into one dict',
        'They are aliases for each other',
        'annotate works only on ForeignKeys; aggregate only on ManyToMany',
        'aggregate is lazy; annotate is eager'
      ],
      a: 0,
      why: 'annotate keeps the QuerySet chainable with an extra attribute per row. aggregate ends the chain and returns a single dictionary of results.'
    },
    {
      id: 'b21', track: 'backend', module: 'django',
      q: 'Which pagination style stays fast on page 5,000 of a large table?',
      choices: [
        'PageNumberPagination',
        'LimitOffsetPagination',
        'CursorPagination on an indexed ordering column',
        'All perform identically'
      ],
      a: 2,
      why: 'Offset-based paging makes the database scan and discard every skipped row. A cursor uses a <code>WHERE ordering_col &lt; last_seen</code> predicate against an index, so cost does not grow with depth — and results stay stable while rows are inserted.'
    },

    /* ---------- DRF / API / production ---------- */
    {
      id: 'b22', track: 'backend', module: 'drf',
      q: 'A serializer exposes <code>fields = "__all__"</code> on the User model. What is the risk?',
      choices: [
        'Slower serialisation only',
        'Sensitive fields leak on read, and clients may set fields like <code>is_staff</code> on write',
        'Nothing — DRF protects sensitive fields automatically',
        'Migrations will fail'
      ],
      a: 1,
      why: 'Wildcard fields is a mass-assignment and data-leak vector. List fields explicitly and mark anything server-owned as read-only, taking ownership from <code>request.user</code>.'
    },
    {
      id: 'b23', track: 'backend', module: 'drf',
      q: 'Where do you scope a ViewSet so users cannot read each other\'s records?',
      choices: [
        'In <code>get_queryset()</code>, filtering by <code>request.user</code>',
        'In the serializer\'s <code>to_representation</code>',
        'In the URL pattern',
        'In a template filter'
      ],
      a: 0,
      why: 'Filtering the base queryset means both list and detail routes are scoped. Filtering later leaves the detail route walkable by ID — the classic IDOR bug. Object-level permissions are the second layer.'
    },
    {
      id: 'b24', track: 'backend', module: 'drf',
      q: 'What is the main trade-off of stateless JWTs versus server-side sessions?',
      choices: [
        'JWTs cannot carry user data',
        'JWTs cannot be revoked before expiry without extra infrastructure',
        'Sessions do not work over HTTPS',
        'JWTs require a database lookup on every request'
      ],
      a: 1,
      why: 'Statelessness is the feature and the cost: nothing is consulted at verification time, so a leaked token stays valid until it expires. Hence short-lived access tokens plus a rotating, blacklistable refresh token.'
    },
    {
      id: 'b25', track: 'backend', module: 'drf',
      q: 'Why does DRF exempt token-authenticated requests from CSRF checks?',
      choices: [
        'CSRF only matters for GET requests',
        'CSRF exploits the automatic sending of cookies; a token in an Authorization header is never sent automatically by the browser',
        'DRF disables CSRF everywhere by default',
        'Because APIs are stateless and therefore inherently safe'
      ],
      a: 1,
      why: 'The attack relies on ambient credentials. A header the attacker\'s page cannot set is not attached to a cross-site request. Session-cookie authentication in DRF still needs CSRF protection.'
    },
    {
      id: 'b26', track: 'backend', module: 'drf',
      q: 'Which single setting is the most dangerous to leave enabled in production?',
      choices: ['<code>USE_TZ = True</code>', '<code>DEBUG = True</code>', '<code>APPEND_SLASH = True</code>', '<code>USE_I18N = True</code>'],
      a: 1,
      why: 'The debug error page exposes settings, environment variables, local variables, and SQL to anyone who can trigger a 500. Run <code>manage.py check --deploy</code> before shipping.'
    },
    {
      id: 'b27', track: 'backend', module: 'drf',
      q: 'A Celery task with <code>acks_late=True</code> must be written how?',
      choices: [
        'Idempotent, because a worker crash causes redelivery',
        'Synchronous, so results return in order',
        'With the model instance passed as an argument',
        'Without retries'
      ],
      a: 0,
      why: 'Late acknowledgement gives at-least-once delivery: a crash mid-task means it runs again. Guard with an idempotency key or a state check, and pass IDs rather than serialised objects.'
    },
    {
      id: 'b28', track: 'backend', module: 'drf',
      q: 'A Django app scales out to 200 gunicorn workers and PostgreSQL starts refusing connections. Best first fix?',
      choices: [
        'Add more application servers',
        'Put a connection pooler such as PgBouncer in front and tune <code>CONN_MAX_AGE</code>',
        'Increase <code>DATABASE_POOL_SIZE</code> in Django settings',
        'Switch every view to async'
      ],
      a: 1,
      why: 'Each worker holds its own connection, so the connection count is the real ceiling. A pooler multiplexes many app connections onto few database ones. Django has no built-in pool setting of that name.'
    },
    {
      id: 'b29', track: 'backend', module: 'drf',
      q: 'You need to return a list of 40,000 rows to a client. What is the right API design?',
      choices: [
        'Return them all in one JSON response',
        'Paginate, with filtering and a documented maximum page size',
        'Return them as a single compressed string field',
        'Send them over a long-polling connection'
      ],
      a: 1,
      why: 'Unbounded lists blow up memory, latency, and mobile data. Pagination with server-enforced limits keeps the response predictable, and the client asks for exactly what it needs.'
    },
    {
      id: 'b30', track: 'backend', module: 'drf',
      q: 'The best way to stop an N+1 regression from returning after you fix it:',
      choices: [
        'Add a comment above the queryset',
        'Assert the query count in a test with <code>assertNumQueries</code>',
        'Enable the debug toolbar in production',
        'Increase the database connection limit'
      ],
      a: 1,
      why: 'A test that pins the query count fails the moment someone adds a lazy attribute access in a loop. Comments and tooling do not block a merge; a failing test does.'
    }
  );
})(window.PREP);
