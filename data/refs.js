/* Sources, one list per concept.
   Every URL here was fetched and checked for a 200, and every #fragment
   was checked to exist on the page, at the time of writing. */
(function (P) {
  P.refs = {
    'py-names': [
      { t: 'Python data model', u: 'https://docs.python.org/3/reference/datamodel.html' },
      { t: 'Default args are evaluated once', u: 'https://docs.python.org/3/reference/compound_stmts.html#function-definitions' },
    ],
    'py-structures': [
      { t: 'Time complexity (Python wiki)', u: 'https://wiki.python.org/moin/TimeComplexity' },
      { t: 'collections', u: 'https://docs.python.org/3/library/collections.html' },
      { t: 'Dict order became official in 3.7', u: 'https://docs.python.org/3/whatsnew/3.7.html' },
      { t: 'functools.lru_cache', u: 'https://docs.python.org/3/library/functools.html#functools.lru_cache' },
    ],
    'py-lru': [
      { t: 'collections.OrderedDict', u: 'https://docs.python.org/3/library/collections.html#collections.OrderedDict' },
      { t: 'functools.lru_cache', u: 'https://docs.python.org/3/library/functools.html#functools.lru_cache' },
    ],
    'py-generators': [
      { t: 'Generators', u: 'https://docs.python.org/3/howto/functional.html#generators' },
    ],
    'py-decorators': [
      { t: 'functools.wraps', u: 'https://docs.python.org/3/library/functools.html#functools.wraps' },
    ],
    'py-context': [
      { t: 'contextlib', u: 'https://docs.python.org/3/library/contextlib.html' },
    ],
    'py-oop': [
      { t: 'The Python 2.3 MRO', u: 'https://docs.python.org/3/howto/mro.html' },
      { t: 'dataclasses', u: 'https://docs.python.org/3/library/dataclasses.html' },
    ],
    'py-gil': [
      { t: 'Free-threading HOWTO', u: 'https://docs.python.org/3/howto/free-threading-python.html' },
      { t: 'PEP 779 - supported status', u: 'https://peps.python.org/pep-0779/' },
      { t: 'What\'s new in 3.14', u: 'https://docs.python.org/3/whatsnew/3.14.html' },
    ],
    'py-errors': [
      { t: 'gc module', u: 'https://docs.python.org/3/library/gc.html' },
    ],
    'dj-lifecycle': [
      { t: 'Middleware reference and ordering', u: 'https://docs.djangoproject.com/en/stable/ref/middleware/' },
      { t: 'Writing middleware', u: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/' },
    ],
    'dj-queryset': [
      { t: 'When QuerySets are evaluated', u: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#when-querysets-are-evaluated' },
    ],
    'dj-nplusone': [
      { t: 'select_related', u: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related' },
      { t: 'prefetch_related', u: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#prefetch-related' },
    ],
    'dj-expressions': [
      { t: 'Combining multiple aggregations', u: 'https://docs.djangoproject.com/en/stable/topics/db/aggregation/#combining-multiple-aggregations' },
      { t: 'F() expressions', u: 'https://docs.djangoproject.com/en/stable/ref/models/expressions/#f-expressions' },
    ],
    'dj-transactions': [
      { t: 'Database transactions', u: 'https://docs.djangoproject.com/en/stable/topics/db/transactions/' },
      { t: 'select_for_update', u: 'https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-for-update' },
    ],
    'dj-migrations': [
      { t: 'Migrations', u: 'https://docs.djangoproject.com/en/stable/topics/migrations/' },
    ],
    'dj-models': [
      { t: 'Constraints reference', u: 'https://docs.djangoproject.com/en/stable/ref/models/constraints/' },
      { t: 'Managers and QuerySets', u: 'https://docs.djangoproject.com/en/stable/topics/db/managers/' },
    ],
    'drf-serializers': [
      { t: 'DRF serializers', u: 'https://www.django-rest-framework.org/api-guide/serializers/' },
    ],
    'drf-views': [
      { t: 'DRF viewsets', u: 'https://www.django-rest-framework.org/api-guide/viewsets/' },
      { t: 'DRF pagination', u: 'https://www.django-rest-framework.org/api-guide/pagination/' },
    ],
    'drf-auth': [
      { t: 'DRF authentication', u: 'https://www.django-rest-framework.org/api-guide/authentication/' },
      { t: 'DRF permissions', u: 'https://www.django-rest-framework.org/api-guide/permissions/' },
    ],
    'drf-async': [
      { t: 'Django caching', u: 'https://docs.djangoproject.com/en/stable/topics/cache/' },
      { t: 'Celery task guide', u: 'https://docs.celeryq.dev/en/stable/userguide/tasks.html' },
    ],
    'dj-security': [
      { t: 'Django security', u: 'https://docs.djangoproject.com/en/stable/topics/security/' },
      { t: 'Deployment checklist', u: 'https://docs.djangoproject.com/en/stable/howto/deployment/checklist/' },
    ],
    'dj-scale': [
      { t: 'Deploying Django', u: 'https://docs.djangoproject.com/en/stable/howto/deployment/' },
      { t: 'Databases and CONN_MAX_AGE', u: 'https://docs.djangoproject.com/en/stable/ref/databases/' },
    ],
    'rc-render': [
      { t: 'Render and commit', u: 'https://react.dev/learn/render-and-commit' },
      { t: 'Queueing state updates', u: 'https://react.dev/learn/queueing-a-series-of-state-updates' },
    ],
    'rc-keys': [
      { t: 'Rendering lists', u: 'https://react.dev/learn/rendering-lists' },
      { t: 'Preserving and resetting state', u: 'https://react.dev/learn/preserving-and-resetting-state' },
    ],
    'rc-hooks-rules': [
      { t: 'Rules of Hooks', u: 'https://react.dev/reference/rules/rules-of-hooks' },
    ],
    'rc-effects': [
      { t: 'You might not need an effect', u: 'https://react.dev/learn/you-might-not-need-an-effect' },
      { t: 'Synchronizing with effects', u: 'https://react.dev/learn/synchronizing-with-effects' },
    ],
    'rc-memo': [
      { t: 'memo', u: 'https://react.dev/reference/react/memo' },
      { t: 'React Compiler 1.0', u: 'https://react.dev/blog/2025/10/07/react-compiler-1' },
    ],
    'rc-state': [
      { t: 'Passing data deeply with context', u: 'https://react.dev/learn/passing-data-deeply-with-context' },
      { t: 'Choosing the state structure', u: 'https://react.dev/learn/choosing-the-state-structure' },
    ],
    'rc-perf': [
      { t: 'useTransition', u: 'https://react.dev/reference/react/useTransition' },
      { t: 'useDeferredValue', u: 'https://react.dev/reference/react/useDeferredValue' },
    ],
    'rx-data': [
      { t: 'TanStack Query', u: 'https://tanstack.com/query/latest/docs/framework/react/overview' },
    ],
    'rx-forms': [
      { t: 'useActionState', u: 'https://react.dev/reference/react/useActionState' },
      { t: 'React Hook Form', u: 'https://react-hook-form.com/get-started' },
    ],
    'rx-types': [
      { t: 'React TypeScript cheatsheet', u: 'https://react-typescript-cheatsheet.netlify.app/' },
    ],
    'rx-testing': [
      { t: 'Testing Library query priority', u: 'https://testing-library.com/docs/queries/about/#priority' },
      { t: 'Mock Service Worker', u: 'https://mswjs.io/docs/' },
    ],
    'rx-a11y': [
      { t: 'ARIA APG dialog pattern', u: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
      { t: 'WCAG quick reference', u: 'https://www.w3.org/WAI/WCAG22/quickref/' },
    ],
    'rx-render': [
      { t: 'React Server Components', u: 'https://react.dev/reference/rsc/server-components' },
      { t: 'INP (Core Web Vital)', u: 'https://web.dev/articles/inp' },
    ],
    'rn-arch': [
      { t: 'React Native architecture', u: 'https://reactnative.dev/architecture/landing-page' },
      { t: 'React Native 0.82 release', u: 'https://reactnative.dev/blog/2025/10/08/react-native-0.82' },
      { t: 'Hermes', u: 'https://reactnative.dev/docs/hermes' },
    ],
    'rn-threads': [
      { t: 'Render pipeline and threads', u: 'https://reactnative.dev/architecture/render-pipeline' },
    ],
    'rn-lists': [
      { t: 'Optimizing FlatList', u: 'https://reactnative.dev/docs/optimizing-flatlist-configuration' },
      { t: 'FlatList reference', u: 'https://reactnative.dev/docs/flatlist' },
    ],
    'rn-anim': [
      { t: 'Animations and useNativeDriver', u: 'https://reactnative.dev/docs/animations' },
      { t: 'Reanimated', u: 'https://docs.swmansion.com/react-native-reanimated/' },
    ],
    'rn-platform': [
      { t: 'Platform-specific code', u: 'https://reactnative.dev/docs/platform-specific-code' },
      { t: 'React Navigation', u: 'https://reactnavigation.org/docs/getting-started' },
    ],
    'rn-native': [
      { t: 'Turbo Native Modules', u: 'https://reactnative.dev/docs/turbo-native-modules-introduction' },
      { t: 'React Native DevTools', u: 'https://reactnative.dev/docs/debugging' },
    ],
    'ar-rest': [
      { t: 'Fielding, REST architectural style (ch. 5)', u: 'https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm' },
      { t: 'RFC 9110 - HTTP semantics, methods and idempotency', u: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      { t: 'Richardson Maturity Model', u: 'https://martinfowler.com/articles/richardsonMaturityModel.html' },
    ],
    'ar-negotiation': [
      { t: 'MDN - Content negotiation', u: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation' },
      { t: 'MDN - HTTP compression', u: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression' },
      { t: 'RFC 9111 - HTTP caching and Vary', u: 'https://www.rfc-editor.org/rfc/rfc9111.html' },
    ],
    'ar-sql-nosql': [
      { t: 'PostgreSQL JSON types', u: 'https://www.postgresql.org/docs/current/datatype-json.html' },
      { t: 'MongoDB data modelling', u: 'https://www.mongodb.com/docs/manual/data-modeling/' },
    ],
    'ar-graphql': [
      { t: 'Introduction to GraphQL', u: 'https://graphql.org/learn/' },
      { t: 'GraphQL specification', u: 'https://spec.graphql.org/October2021/' },
    ],
    'ar-graphql-cost': [
      { t: 'GraphQL caching', u: 'https://graphql.org/learn/caching/' },
      { t: 'GraphQL specification - response format', u: 'https://spec.graphql.org/October2021/' },
    ],
    'ar-nplusone': [
      { t: 'graphql/dataloader', u: 'https://github.com/graphql/dataloader' },
    ],
    'ar-solid': [
      { t: 'Uncle Bob - Solid relevance', u: 'https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html' },
      { t: 'Dependency inversion principle', u: 'https://en.wikipedia.org/wiki/Dependency_inversion_principle' },
      { t: 'Fowler - Inversion of control and DI', u: 'https://martinfowler.com/articles/injection.html' },
    ],
    'ar-transport': [
      { t: 'What is gRPC?', u: 'https://grpc.io/docs/what-is-grpc/introduction/' },
      { t: 'gRPC deadlines', u: 'https://grpc.io/docs/guides/deadlines/' },
      { t: 'gRPC load balancing', u: 'https://grpc.io/blog/grpc-load-balancing/' },
      { t: 'protobuf - do\'s and don\'ts (field numbers)', u: 'https://protobuf.dev/programming-guides/dos-donts/' },
      { t: 'gRPC-Web basics', u: 'https://grpc.io/docs/platforms/web/basics/' },
    ],
    'ar-microservices': [
      { t: 'Fowler - Microservices', u: 'https://martinfowler.com/articles/microservices.html' },
      { t: 'Fowler - Microservice premium', u: 'https://martinfowler.com/bliki/MicroservicePremium.html' },
    ],
    'ar-split': [
      { t: 'Fowler - Monolith first', u: 'https://martinfowler.com/bliki/MonolithFirst.html' },
      { t: 'Fowler - Conway\'s law', u: 'https://martinfowler.com/bliki/ConwaysLaw.html' },
      { t: 'Fowler - Microservice premium', u: 'https://martinfowler.com/bliki/MicroservicePremium.html' },
    ],
    'ox-fork': [
      { t: 'Options for extending the platform', u: 'https://docs.openedx.org/projects/edx-platform/en/latest/concepts/extension_points.html' },
      { t: 'Platform overview', u: 'https://docs.openedx.org/en/latest/developers/concepts/platform_overview.html' },
      { t: 'openedx-platform (was edx-platform)', u: 'https://github.com/openedx/openedx-platform' },
    ],
    'ox-plugin': [
      { t: 'Django app plugins', u: 'https://github.com/openedx/edx-django-utils/blob/master/edx_django_utils/plugins/README.rst' },
      { t: 'How to create a plugin app', u: 'https://github.com/openedx/edx-django-utils/blob/master/edx_django_utils/plugins/docs/how_tos/how_to_create_a_plugin_app.rst' },
      { t: 'Python entry points', u: 'https://packaging.python.org/en/latest/specifications/entry-points/' },
    ],
    'ox-hooks': [
      { t: 'OEP-50 - Hooks extension framework', u: 'https://docs.openedx.org/projects/openedx-proposals/en/latest/architectural-decisions/oep-0050-hooks-extension-framework.html' },
      { t: 'Create a pipeline step', u: 'https://docs.openedx.org/projects/openedx-filters/en/latest/how-tos/create-a-pipeline-step.html' },
      { t: 'openedx-events', u: 'https://github.com/openedx/openedx-events' },
    ],
    'ox-xblock': [
      { t: 'XBlock methods - views and handlers', u: 'https://docs.openedx.org/projects/xblock/en/latest/xblock-tutorial/concepts/methods.html' },
      { t: 'Integrating XBlocks with the platform', u: 'https://docs.openedx.org/en/latest/developers/references/developer_guide/extending_platform/xblocks.html' },
    ],
    'ox-scopes': [
      { t: 'XBlock fields and scopes', u: 'https://docs.openedx.org/projects/xblock/en/latest/xblock-tutorial/concepts/fields.html' },
    ],
    'ox-publish': [
      { t: 'Split Mongo modulestore', u: 'https://docs.openedx.org/projects/edx-platform/en/latest/references/docs/xmodule/modulestore/docs/split-mongo.html' },
      { t: 'Draft and published branches', u: 'https://openedx.atlassian.net/wiki/spaces/PLAT/pages/32309309/Split+Modulestore+Draft+Versioning+Modulestore' },
    ],
    'ox-transformers': [
      { t: 'Course block transformers', u: 'https://openedx.atlassian.net/wiki/spaces/AC/pages/34734111/Course+Block+Transformers' },
      { t: 'Course Blocks API', u: 'https://openedx.atlassian.net/wiki/spaces/AC/pages/29688043/Course+Blocks+API' },
    ],
    'ox-grades': [
      { t: 'Grades background', u: 'https://docs.openedx.org/projects/edx-platform/en/latest/references/docs/lms/djangoapps/grades/docs/background.html' },
    ],
    'ox-jwt': [
      { t: 'ADR - transport JWT in HTTP cookies', u: 'https://docs.openedx.org/projects/edx-platform/en/latest/references/docs/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.html' },
      { t: 'OEP-42 - Authentication', u: 'https://docs.openedx.org/projects/openedx-proposals/en/latest/best-practices/oep-0042-bp-authentication.html' },
    ],
    'ox-eventbus': [
      { t: 'Open edX event bus', u: 'https://docs.openedx.org/projects/openedx-events/en/latest/concepts/event-bus.html' },
      { t: 'OEP-52 - Event bus architecture', u: 'https://docs.openedx.org/projects/openedx-proposals/en/latest/architectural-decisions/oep-0052-arch-event-bus-architecture.html' },
    ],
    'ox-toggles': [
      { t: 'Documenting new feature toggles', u: 'https://docs.openedx.org/projects/edx-toggles/en/latest/how_to/documenting_new_feature_toggles.html' },
      { t: 'OEP-17 - Feature toggles', u: 'https://docs.openedx.org/projects/openedx-proposals/en/latest/best-practices/oep-0017-bp-feature-toggles.html' },
    ],
    'ox-mfe': [
      { t: 'Use a frontend plugin slot', u: 'https://docs.openedx.org/en/latest/site_ops/how-tos/use-frontend-plugin-slots.html' },
      { t: 'Available frontend plugin slots', u: 'https://docs.openedx.org/en/latest/site_ops/references/frontend-plugin-slots.html' },
      { t: 'frontend-plugin-framework', u: 'https://github.com/openedx/frontend-plugin-framework' },
    ],

    /* ---------- Senior front-end track ---------- */
    'fe-compositor': [
      { t: 'Animation performance and frame rate', u: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate' },
      { t: 'Animations guide (web.dev)', u: 'https://web.dev/articles/animations-guide' },
      { t: 'will-change', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/will-change' },
    ],
    'fe-eventloop': [
      { t: 'Event loop processing model (HTML spec)', u: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model' },
      { t: 'Using microtasks', u: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide' },
      { t: 'JavaScript execution model', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model' },
    ],
    'fe-react-slow': [
      { t: 'React memo', u: 'https://react.dev/reference/react/memo' },
      { t: 'React useMemo', u: 'https://react.dev/reference/react/useMemo' },
      { t: 'React Compiler', u: 'https://react.dev/learn/react-compiler' },
    ],
    'fe-map': [
      { t: 'Map', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' },
      { t: 'WeakMap', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap' },
    ],
    'fe-weakmap': [
      { t: 'WeakMap', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap' },
      { t: 'Memory management', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management' },
      { t: 'WeakRef', u: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef' },
    ],
    'fe-boxmodel': [
      { t: 'The box model', u: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model' },
      { t: 'box-sizing', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing' },
      { t: 'outline - takes no space', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline' },
      { t: 'Mastering margin collapsing', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing' },
    ],
    'fe-specificity': [
      { t: 'Specificity', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity' },
      { t: 'The cascade', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade' },
      { t: ':where()', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:where' },
      { t: 'Specificity rules (Selectors Level 4)', u: 'https://www.w3.org/TR/selectors-4/#specificity-rules' },
    ],
    'fe-responsive': [
      { t: 'Responsive design', u: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design' },
      { t: 'Container queries', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries' },
      { t: 'clamp()', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp' },
    ],
    'fe-ai-workflow': [
      { t: 'Claude Code documentation', u: 'https://code.claude.com/docs/en/overview' },
    ],
    'fe-quality': [
      { t: 'typescript-eslint', u: 'https://typescript-eslint.io/' },
      { t: 'jscpd - copy/paste detector', u: 'https://github.com/kucherenko/jscpd' },
      { t: 'ESLint complexity', u: 'https://eslint.org/docs/latest/rules/complexity' },
      { t: 'ESLint max-lines', u: 'https://eslint.org/docs/latest/rules/max-lines' },
    ],
    'fe-testing': [
      { t: 'The practical test pyramid', u: 'https://martinfowler.com/articles/practical-test-pyramid.html' },
      { t: 'React Testing Library', u: 'https://testing-library.com/docs/react-testing-library/intro/' },
      { t: 'Playwright', u: 'https://playwright.dev/' },
    ],
    'fe-tokens': [
      { t: 'Claude Code documentation', u: 'https://code.claude.com/docs/en/overview' },
    ],
    'fe-design-system': [
      { t: 'Custom properties', u: 'https://developer.mozilla.org/en-US/docs/Web/CSS/--*' },
      { t: 'Radix Primitives', u: 'https://www.radix-ui.com/primitives' },
      { t: 'Storybook', u: 'https://storybook.js.org/docs' },
    ],
    'fe-scale': [
      { t: 'Cache-Control', u: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control' },
      { t: 'Love your cache (web.dev)', u: 'https://web.dev/articles/love-your-cache' },
      { t: 'Vite - build options', u: 'https://vite.dev/guide/build' },
    ],
    'fe-realtime': [
      { t: 'Using server-sent events', u: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events' },
      { t: 'EventSource', u: 'https://developer.mozilla.org/en-US/docs/Web/API/EventSource' },
      { t: 'WebSockets API', u: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
      { t: 'Using readable streams', u: 'https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams' },
    ],
  };
})(window.PREP);
