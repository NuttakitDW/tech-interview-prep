/* Django request lifecycle + the ORM. The heart of a Django interview. */
(function (P) {
  P.modules.push({
    id: 'django',
    track: 'backend',
    title: 'Django, request to response',
    kicker: 'Module 02',
    blurb:
      'Show that you can trace a request end to end and name the extension point at each layer. That is what separates "I have used Django" from "I know Django".',
    concepts: [
      {
        id: 'dj-lifecycle',
        title: 'The request lifecycle',
        tags: ['architecture', 'hot'],
        ask: 'Walk me through what happens between the browser and your view.',
        body: [
          {
            list: [
              'The web server (gunicorn/uvicorn) hands the request to Django through WSGI or ASGI.',
              '<code>WSGIHandler</code> builds an <code>HttpRequest</code>.',
              'Middleware runs top to bottom on the way in.',
              'The URL resolver matches <code>urlpatterns</code> and extracts view kwargs.',
              'View middleware, then the view, returns an <code>HttpResponse</code> — or raises.',
              'Exception middleware maps unhandled errors to <code>4xx</code>/<code>5xx</code>.',
              'Template response middleware renders lazy responses.',
              'Middleware runs bottom to top on the way out, then the response is serialised.'
            ]
          },
          { p: 'Middleware is an onion: the order in <code>MIDDLEWARE</code> is request order, and exactly reversed on response. <code>SessionMiddleware</code> must precede <code>AuthenticationMiddleware</code>, because <code>request.user</code> is a lazy object resolved from the session.' },
          {
            code: {
              lang: 'python',
              src: `def timing_middleware(get_response):
    # one-time setup at startup
    def middleware(request):
        start = time.perf_counter()
        response = get_response(request)      # everything inside runs here
        response['X-Runtime'] = f'{time.perf_counter() - start:.3f}'
        return response
    return middleware`
            }
          }
        ],
        say:
          'Server to WSGI or ASGI handler, middleware inbound, URL resolution, view, then middleware outbound in reverse. Middleware is the layer for anything cross-cutting: auth, correlation IDs, timing, security headers.',
        traps: [
          'Ordering middleware wrongly and reading <code>request.user</code> before auth has populated it.',
          'Doing queries in middleware that runs on every request, including static and health checks.',
          'Not returning the response from a custom middleware.'
        ]
      },
      {
        id: 'dj-queryset',
        title: 'QuerySets are lazy',
        tags: ['orm', 'hot'],
        ask: 'When does a QuerySet hit the database?',
        body: [
          { p: 'Building a QuerySet builds SQL; it executes only when evaluated — iteration, <code>len()</code>, <code>list()</code>, <code>bool()</code>, slicing with a step, pickling, or <code>repr()</code> in a shell. Until then filters chain into one query.' },
          { p: 'Each QuerySet caches its own result rows. Re-using the same variable is free; re-filtering it issues a new query.' },
          {
            code: {
              lang: 'python',
              src: `qs = Order.objects.filter(status='paid')   # no SQL yet
qs = qs.exclude(total=0).order_by('-created')  # still no SQL
first_page = qs[:20]                       # LIMIT 20, still lazy
for order in first_page:                   # SQL runs here
    ...
len(first_page)                            # cached — no second query

Order.objects.filter(...).exists()   # SELECT 1 ... LIMIT 1
Order.objects.filter(...).count()    # SELECT COUNT(*), never len(qs)
qs.iterator(chunk_size=2000)         # server-side cursor, no result cache`
            }
          },
          {
            note: [
              'In a template, <code>{% if orders %}</code> evaluates and caches the whole QuerySet — then looping over it is free. But calling <code>.count()</code> and then looping issues two queries.'
            ]
          }
        ],
        say:
          'Lazy until evaluated. That lets me compose filters without cost, but it also means an innocent-looking loop or a repeated attribute access can fire queries I did not intend.',
        traps: [
          '<code>len(qs)</code> when you only need a count, or <code>.count()</code> when you are about to iterate anyway.',
          'Calling <code>.count()</code> or <code>.exists()</code> inside a loop.',
          'Passing a QuerySet around and re-filtering it in several places, each one a fresh query.'
        ]
      },
      {
        id: 'dj-nplusone',
        title: 'N+1 queries: select_related vs prefetch_related',
        tags: ['orm', 'hot'],
        ask: 'This endpoint fires 400 queries. Fix it.',
        body: [
          { p: 'The classic cause: iterate a QuerySet, touch a related object per row, and each access lazily loads. One query for the list plus N for the children.' },
          {
            list: [
              '<code>select_related</code> — follows forward <code>ForeignKey</code> and <code>OneToOne</code> with a SQL <code>JOIN</code>. One query, wider rows.',
              '<code>prefetch_related</code> — for <code>ManyToMany</code> and reverse FK. A second query per relation, joined in Python by primary key.',
              '<code>Prefetch()</code> — lets you filter, order, or slice the prefetched set and stash it under <code>to_attr</code>.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `# 1 + N + N queries
for order in Order.objects.all():
    print(order.customer.name, order.items.count())

# 3 queries total
orders = (
    Order.objects
    .select_related('customer')                     # JOIN
    .prefetch_related(
        Prefetch('items',
                 queryset=Item.objects.select_related('product'),
                 to_attr='loaded_items')            # second query
    )
    .annotate(item_count=Count('items'))            # count in SQL
)`
            }
          },
          { p: 'Diagnose rather than guess: <code>django-debug-toolbar</code> in development, <code>CaptureQueriesContext</code> or <code>assertNumQueries</code> in tests, and <code>str(qs.query)</code> or <code>qs.explain()</code> to read the plan.' }
        ],
        say:
          'select_related joins forward one-to-one relations into the same query; prefetch_related runs a second query and stitches many-to-many or reverse relations in Python. I pin the count with assertNumQueries so the regression cannot come back.',
        traps: [
          'Using <code>select_related</code> for a many-to-many — it is not supported and silently does nothing useful.',
          'Prefetching then calling <code>.filter()</code> on the related manager, which throws the prefetch cache away and re-queries.',
          'Over-joining: <code>select_related()</code> with no arguments pulls every relation.'
        ]
      },
      {
        id: 'dj-expressions',
        title: 'Push work into SQL: F, Q, annotate, aggregate',
        tags: ['orm'],
        ask: 'How do you increment a counter safely under concurrency?',
        body: [
          { p: '<code>F()</code> references a column inside the database, so the read-modify-write happens atomically in one statement instead of in Python where two workers can clobber each other. <code>Q()</code> builds composable boolean trees for <code>OR</code> and <code>NOT</code>.' },
          {
            code: {
              lang: 'python',
              src: `# race: read 10, both write 11
product.stock = product.stock - 1
product.save()

# atomic: UPDATE ... SET stock = stock - 1 WHERE id = %s
Product.objects.filter(pk=pk, stock__gte=1).update(stock=F('stock') - 1)

from django.db.models import Q, Count, Sum, Avg, Case, When, Value

Order.objects.filter(Q(status='paid') | ~Q(channel='pos'))

Customer.objects.annotate(                     # per-row, adds a column
    spend=Sum('orders__total'),
    tier=Case(
        When(orders__total__gte=10000, then=Value('gold')),
        default=Value('standard'),
    ),
).filter(spend__gt=1000)

Order.objects.aggregate(total=Sum('total'))    # whole-queryset, one dict`
            }
          },
          {
            note: [
              'annotate returns a QuerySet with an extra attribute per row; aggregate returns a single dictionary and ends the chain. Annotating across two multi-valued joins multiplies rows and inflates sums — use <code>distinct=True</code> or split into subqueries.'
            ]
          }
        ],
        say:
          'F expressions keep read-modify-write inside the database so concurrent workers cannot lose updates. Q objects compose complex boolean filters. Anything I can aggregate in SQL should not be looped in Python.',
        traps: [
          'Reading, computing in Python, then saving — a lost-update race under load.',
          'Double-counting when annotating over two joins in the same query.',
          'Filtering on an annotation with <code>WHERE</code> semantics in mind when Django emits <code>HAVING</code>.'
        ]
      },
      {
        id: 'dj-transactions',
        title: 'Transactions and locking',
        tags: ['orm', 'data'],
        ask: 'Two users book the last seat at the same time. What happens?',
        body: [
          { p: 'By default Django runs in autocommit: each statement commits on its own. <code>transaction.atomic()</code> opens a block that commits at the end or rolls back on any exception; nested blocks become savepoints.' },
          {
            code: {
              lang: 'python',
              src: `from django.db import transaction

with transaction.atomic():
    seat = (Seat.objects
            .select_for_update()          # row lock until commit
            .get(pk=seat_id, taken=False))
    seat.taken = True
    seat.save()
    transaction.on_commit(                # fires only after a real commit
        lambda: send_confirmation.delay(seat_id)
    )`
            }
          },
          { p: '<code>select_for_update()</code> takes a row-level write lock, so the second transaction blocks until the first commits and then sees the updated row. <code>nowait=True</code> or <code>skip_locked=True</code> turns waiting into failing or skipping — the latter is how you build a queue table.' },
          { p: 'For simple cases prefer optimistic control: a conditional <code>update()</code> that returns the number of rows changed. Zero rows means someone beat you to it.' }
        ],
        say:
          'Wrap the critical section in atomic and take a row lock with select_for_update, or use a conditional update and check the affected row count. And I queue side effects with on_commit so nothing fires for a transaction that later rolls back.',
        traps: [
          'Dispatching a Celery task inside atomic — the worker can start before the commit and read stale data.',
          'Catching an exception inside <code>atomic()</code> and continuing to use the broken transaction.',
          'Locking rows in inconsistent order across code paths, which deadlocks.'
        ]
      },
      {
        id: 'dj-migrations',
        title: 'Migrations without downtime',
        tags: ['ops'],
        ask: 'How do you add a non-null column to a 50-million-row table in production?',
        body: [
          { p: 'Migrations are ordered, dependency-linked Python files. <code>makemigrations</code> diffs models against migration state; <code>migrate</code> applies them and records each in <code>django_migrations</code>.' },
          { p: 'The safe shape is expand, backfill, contract, spread over separate deploys:' },
          {
            list: [
              '<b>Expand</b> — add the column as nullable with no default. On PostgreSQL that is a metadata-only change.',
              '<b>Backfill</b> — populate in batches from a data migration or a management command, throttled, outside the schema lock.',
              '<b>Deploy code</b> that writes both old and new.',
              '<b>Contract</b> — add the <code>NOT NULL</code> constraint, then remove the old column in a later release.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `operations = [
    migrations.AddIndex(
        model_name='order',
        index=models.Index(fields=['created'], name='order_created_idx'),
    ),
]
atomic = False    # required with CONCURRENTLY on PostgreSQL

# RunPython always needs a reverse, even if it is a no-op
migrations.RunPython(backfill, migrations.RunPython.noop)`
            }
          },
          { p: 'Inside a data migration use <code>apps.get_model()</code>, never the imported model class — historical state must match the migration, not today\'s code.' }
        ],
        say:
          'Expand, backfill, contract. Nullable column first, batched backfill, then the constraint in a later deploy — so old and new code can run side by side during the rollout.',
        traps: [
          'A single migration that adds a NOT NULL column with a default and rewrites the whole table under an exclusive lock.',
          'Importing the real model in <code>RunPython</code>, which breaks when the model later changes.',
          'Editing an applied migration instead of adding a new one.'
        ]
      },
      {
        id: 'dj-models',
        title: 'Model layer design',
        tags: ['architecture'],
        ask: 'Where does business logic belong?',
        body: [
          { p: 'Fat models, thin views is the Django phrasing, but the durable version is: query logic on custom QuerySets, invariants on the model, orchestration in a service function. Views translate HTTP to those calls and back.' },
          {
            code: {
              lang: 'python',
              src: `class OrderQuerySet(models.QuerySet):
    def paid(self):
        return self.filter(status=Order.Status.PAID)

    def for_customer(self, customer):
        return self.filter(customer=customer)

class Order(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PAID  = 'paid',  'Paid'

    objects = OrderQuerySet.as_manager()

    class Meta:
        constraints = [
            models.CheckConstraint(check=Q(total__gte=0), name='total_non_neg'),
            models.UniqueConstraint(fields=['customer', 'idem_key'],
                                    name='uniq_idempotency'),
        ]
        indexes = [models.Index(fields=['status', '-created'])]

# chains, and reads like the domain
Order.objects.for_customer(user).paid().select_related('customer')`
            }
          },
          { p: 'Push invariants into database constraints. Validation in <code>clean()</code> only runs when something calls it; a <code>CheckConstraint</code> or <code>UniqueConstraint</code> holds for every writer, including a psql session and a bulk update.' }
        ],
        say:
          'Query logic on custom QuerySets so it composes, invariants as database constraints so they always hold, multi-step workflows in service functions, and views kept to HTTP translation.',
        traps: [
          'Business rules living in views, duplicated between the API and the admin.',
          'Relying on <code>save()</code> overrides for invariants — <code>bulk_create</code> and <code>update()</code> bypass them, as do signals-free paths.',
          'Overriding <code>save()</code> to do network calls.'
        ]
      }
    ]
  });
})(window.PREP);
