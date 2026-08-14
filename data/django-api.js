/* DRF, auth, caching, background work, security, production. */
(function (P) {
  P.modules.push({
    id: 'drf',
    track: 'backend',
    title: 'APIs with Django REST Framework',
    kicker: 'Module 03',
    blurb:
      'Most Django roles are API roles. Expect questions on serializer boundaries, authentication choices, and how you keep a public endpoint from falling over.',
    concepts: [
      {
        id: 'drf-serializers',
        title: 'Serializers are the boundary',
        tags: ['drf', 'hot'],
        ask: 'Where does validation belong in a DRF app?',
        body: [
          { p: 'A serializer does two jobs: deserialise and validate untrusted input, and serialise model instances into a stable wire format. Treat it as the contract, and never let a client field reach the model without passing through it.' },
          {
            code: {
              lang: 'python',
              src: `class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(read_only=True)
    total    = serializers.DecimalField(max_digits=12, decimal_places=2,
                                        read_only=True)
    items    = ItemSerializer(many=True)

    class Meta:
        model  = Order
        fields = ['id', 'customer', 'items', 'total', 'status', 'created']
        read_only_fields = ['status', 'created']

    def validate_items(self, value):          # one field
        if not value:
            raise serializers.ValidationError('at least one item required')
        return value

    def validate(self, attrs):                # cross-field
        if attrs['ship_date'] < attrs['order_date']:
            raise serializers.ValidationError('ship before order')
        return attrs

    def create(self, validated_data):
        items = validated_data.pop('items')
        with transaction.atomic():
            order = Order.objects.create(
                customer=self.context['request'].user, **validated_data)
            Item.objects.bulk_create(
                [Item(order=order, **i) for i in items])
        return order`
            }
          },
          {
            note: [
              'Never pass <code>fields = "__all__"</code> on a model with sensitive columns, and never trust a writable <code>customer</code> field — take the owner from <code>request.user</code>. Mass assignment is the most common DRF vulnerability.'
            ]
          }
        ],
        say:
          'The serializer is the trust boundary: explicit field lists, read-only for anything server-owned, validate_<field> for single fields, validate() for cross-field rules, and ownership always taken from the request rather than the payload.',
        traps: [
          '<code>__all__</code> leaking internal fields, or letting a client set <code>is_staff</code> or <code>owner</code>.',
          'Nested serializers triggering N+1 — pair every nested relation with select_related or prefetch_related in the view queryset.',
          'Business logic in <code>to_representation</code> where it is untestable.'
        ]
      },
      {
        id: 'drf-views',
        title: 'ViewSets, routers, and pagination',
        tags: ['drf'],
        ask: 'APIView, generics, or ViewSet?',
        body: [
          {
            list: [
              '<code>APIView</code> — full control, one method per verb. Good for endpoints that are not CRUD.',
              '<code>generics.*</code> — <code>ListCreateAPIView</code> and friends. CRUD with hooks.',
              '<code>ViewSet</code> + router — one class per resource, URLs generated, plus <code>@action</code> for extras. Best when the resource really is a resource.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `class OrderViewSet(viewsets.ModelViewSet):
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status']

    def get_queryset(self):                    # scope to the caller, always
        return (Order.objects
                .for_customer(self.request.user)
                .select_related('customer')
                .prefetch_related('items__product'))

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        order = self.get_object()              # runs object permissions
        return Response(OrderSerializer(refund_order(order)).data)`
            }
          },
          { p: 'Paginate every list endpoint. <code>PageNumberPagination</code> is simple but <code>OFFSET</code> degrades on deep pages; <code>CursorPagination</code> is <code>O(1)</code> on an indexed ordering column and stable while rows are inserted — the right default for feeds and large tables.' }
        ],
        say:
          'ViewSets with a router for real CRUD resources, generics for one-off endpoints, APIView when the operation is not a resource at all. get_queryset always scopes to the caller, and every list is paginated.',
        traps: [
          'An unpaginated list endpoint that returns the whole table.',
          'Filtering by owner in the serializer instead of the queryset, which leaks objects through detail routes.',
          'Deep offset pagination on a large table.'
        ]
      },
      {
        id: 'drf-auth',
        title: 'Authentication and permissions',
        tags: ['security', 'hot'],
        ask: 'Session, token, or JWT — and why?',
        body: [
          {
            list: [
              '<b>Session</b> — server-side state, cookie holds the ID. Revocation is instant. Needs CSRF protection. Best for a browser app on the same domain.',
              '<b>DRF token</b> — one opaque token per user in the database. Simple, revocable, but static and not scoped.',
              '<b>JWT</b> — signed and stateless, so any service can verify without a lookup. The cost is revocation: a leaked token stays valid until expiry, which is why you use short-lived access tokens plus a rotating refresh token you can blacklist.'
            ]
          },
          { p: 'For a browser client, storing a JWT in <code>localStorage</code> exposes it to any XSS on the page. An <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code> cookie is safer, at the price of needing CSRF defence again.' },
          {
            code: {
              lang: 'python',
              src: `class IsOwner(BasePermission):
    def has_permission(self, request, view):        # before the object
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.customer_id == request.user.id

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['...JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_THROTTLE_RATES': {'anon': '20/min', 'user': '600/hour'},
}`
            }
          },
          { p: 'Object-level permissions only run through <code>get_object()</code>. A hand-rolled detail view that queries directly bypasses them — which is exactly how IDOR bugs ship.' }
        ],
        say:
          'Sessions for a first-party browser app, short-lived JWTs with rotating refresh tokens for mobile and service-to-service. Default deny at the settings level, and object permissions enforced through get_object so detail routes cannot be walked by ID.',
        traps: [
          'Defaulting to <code>AllowAny</code> and adding permissions per view — one forgotten view is a breach.',
          'Long-lived JWTs with no revocation path.',
          'Returning a different error for "no such object" and "not yours", which enumerates IDs.'
        ]
      },
      {
        id: 'drf-async',
        title: 'Caching and background work',
        tags: ['performance'],
        ask: 'This endpoint takes 4 seconds. What do you do?',
        body: [
          { p: 'Measure first — is it queries, an external call, or serialisation? Then pick the cheapest layer that fixes it.' },
          {
            list: [
              '<b>Query</b> — index, <code>select_related</code>, or move aggregation into SQL. Usually the answer.',
              '<b>Per-object cache</b> — Redis with an explicit key and TTL, invalidated on write.',
              '<b>HTTP cache</b> — <code>ETag</code> and <code>Last-Modified</code> so repeat clients get a <code>304</code>.',
              '<b>Move it off the request</b> — email, PDFs, webhooks, image processing all belong in Celery.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `from django.core.cache import cache

def dashboard(user_id):
    key = f'dash:v2:{user_id}'          # version the key, not the cache
    data = cache.get(key)
    if data is None:
        data = expensive_rollup(user_id)
        cache.set(key, data, timeout=300)
    return data

@shared_task(bind=True, max_retries=5, autoretry_for=(RequestError,),
             retry_backoff=True, acks_late=True)
def sync_invoice(self, invoice_id):     # pass the ID, never the object
    invoice = Invoice.objects.get(pk=invoice_id)
    ...`
            }
          },
          { p: 'Tasks must be idempotent — <code>acks_late</code> plus a worker crash means at-least-once delivery, so the same task can run twice. Guard with a unique key or a state check.' }
        ],
        say:
          'Profile before optimising. Most Django slowness is query count, not Python. After that: cache with explicit versioned keys, use ETags for repeat reads, and push anything that does not need to block the response into Celery.',
        traps: [
          'Caching without an invalidation story, so users see stale data forever.',
          'Passing model instances to Celery — they serialise stale and can precede the commit.',
          'No <code>on_commit</code>, so the worker reads a row that is not there yet.'
        ]
      },
      {
        id: 'dj-security',
        title: 'Security checklist',
        tags: ['security'],
        ask: 'What does Django protect you from, and what is still on you?',
        body: [
          {
            list: [
              '<b>SQL injection</b> — the ORM parameterises. You break it with <code>.raw()</code> string formatting or <code>.extra()</code>. Pass params, never f-strings.',
              '<b>XSS</b> — templates autoescape. You break it with <code>|safe</code>, <code>mark_safe</code>, or rendering user HTML. On the API side, escaping is the client\'s job.',
              '<b>CSRF</b> — middleware plus token, for cookie-authenticated requests. Token-in-header auth is not vulnerable, which is why DRF exempts it.',
              '<b>Clickjacking</b> — <code>XFrameOptionsMiddleware</code> sends <code>DENY</code>.',
              '<b>Passwords</b> — PBKDF2 by default, Argon2 available. Never write your own.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `DEBUG = False                       # never True in production
ALLOWED_HOSTS = ['api.example.com']
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']   # KeyError if missing

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# and run it:  python manage.py check --deploy`
            }
          },
          { p: '<code>DEBUG = True</code> in production is the single worst configuration mistake — the error page prints settings, environment, and SQL to anyone who triggers a 500.' }
        ],
        say:
          'Django covers SQL injection, XSS in templates, CSRF, and password hashing by default. What is on me is not defeating those defaults, keeping secrets in the environment, running check --deploy, and enforcing authorisation on every object access.',
        traps: [
          '<code>ALLOWED_HOSTS = ["*"]</code> with a permissive proxy — enables host-header poisoning of password reset links.',
          'Secrets committed to settings or a <code>.env</code> that is tracked.',
          'Wide-open CORS with credentials allowed.'
        ]
      },
      {
        id: 'dj-scale',
        title: 'Serving and scaling',
        tags: ['ops'],
        ask: 'How do you deploy this, and where does it break first?',
        body: [
          { p: 'Gunicorn with sync workers for classic Django; uvicorn workers for ASGI when you have async views, websockets, or long-lived streams. Worker count starts around <code>2 × cores + 1</code> for CPU-ish work, and you raise threads or use gevent when the app is mostly waiting on I/O.' },
          {
            list: [
              '<b>Database connections</b> break first. Every worker holds one. Use <code>CONN_MAX_AGE</code> and put PgBouncer in front before you scale workers.',
              '<b>Static and media</b> — WhiteNoise or a CDN, never the Django dev server.',
              '<b>Read replicas</b> — a database router sends reads away from the primary; beware of reading your own write on a replica.',
              '<b>Observability</b> — structured logs with a request ID, error tracking, and per-endpoint latency and query counts.'
            ]
          },
          { p: 'Health checks should be cheap and separate: a liveness endpoint that touches nothing, and a readiness endpoint that verifies the database and cache.' }
        ],
        say:
          'Gunicorn behind a proxy, ASGI only where async pays off, sized so total workers stay under the connection budget with PgBouncer in front. The first ceiling in a Django app is almost always database connections or query count, not Python throughput.',
        traps: [
          'Scaling workers until PostgreSQL runs out of connections.',
          'Serving static files through Django in production.',
          'Health checks that run real queries and take the fleet down when the database is slow.'
        ]
      }
    ]
  });
})(window.PREP);
