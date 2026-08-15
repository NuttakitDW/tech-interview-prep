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
  };
})(window.PREP);
