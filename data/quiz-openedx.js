/* Open edX question bank — extension points, content model, read path,
   service seams, and safe change. Every answer is traceable to the sources
   linked on the matching learn card. */
(function (P) {
  P.quiz.push(
    /* ---------- A platform you did not write ---------- */
    {
      id: 'x01', track: 'openedx', module: 'ox-platform',
      q: 'You need a feature the platform does not have. What does choosing to fork actually commit you to?',
      choices: [
        'Re-merging your change into every upstream release, forever',
        'A one-time merge when you next upgrade',
        'Nothing, as long as you keep your change in separate files',
        'Losing the ability to run your own database migrations'
      ],
      a: 0,
      why: 'A fork is a permanent diff against a moving codebase. Every upstream release becomes a negotiation between your change and theirs, and the cost arrives on every upgrade rather than once.'
    },
    {
      id: 'x02', track: 'openedx', module: 'ox-platform',
      q: 'Which of these has the same upgrade cost as forking, while looking cleaner in your repository?',
      choices: [
        'A Django app plugin',
        'Monkeypatching a platform function at start-up',
        'An Open edX filter',
        'A theme'
      ],
      a: 1,
      why: 'Monkeypatching keeps your diff out of their repository but is still bound to their internals. It is worse in one way: when the function you replaced changes shape, nothing tells you — the failure is silent.'
    },
    {
      id: 'x03', track: 'openedx', module: 'ox-platform',
      q: 'You only need to change the colours and logo of an Open edX site. Which extension point is right?',
      choices: [
        'A custom micro-frontend',
        'A Django app plugin',
        'Theming and design tokens, applied at run time',
        'A fork of the frontend applications'
      ],
      a: 2,
      why: 'Take the cheapest seam that does the job. Tokens and themes load at run time, so nothing is rebuilt and nothing is forked. Reaching for a heavier mechanism is a cost you chose rather than one you needed.'
    },
    {
      id: 'x04', track: 'openedx', module: 'ox-platform',
      q: 'What makes a pip-installed Django app plugin appear in <code>INSTALLED_APPS</code> without anyone editing settings?',
      choices: [
        'A Python entry point declared in the package, which the platform scans at start-up',
        'A post-install script that rewrites <code>settings.py</code>',
        'An environment variable listing every plugin',
        'Django discovers any package whose name ends in <code>_app</code>'
      ],
      a: 0,
      why: 'The package registers itself under an entry point group such as <code>lms.djangoapp</code>. At start-up the platform asks Python which installed packages registered there and wires up what it finds.'
    },
    {
      id: 'x05', track: 'openedx', module: 'ox-platform',
      q: 'In a plugin app, why is a signal receiver declared as a dotted string like <code>"...signals.ENROLL_STATUS_CHANGE"</code> rather than imported?',
      choices: [
        'Strings are faster to load than imports',
        'It moves the coupling from import time to start-up time, so your package never imports platform code',
        'Django cannot connect receivers that were imported directly',
        'It allows the receiver to run asynchronously'
      ],
      a: 1,
      why: 'Importing the platform module to reach the signal puts back exactly the coupling the plugin system removes. A string path means your module has no import dependency on the platform at all.'
    },
    {
      id: 'x06', track: 'openedx', module: 'ox-platform',
      q: 'Why does reading <code>settings.SOMETHING</code> at the top of a plugin app module break?',
      choices: [
        'Plugin apps cannot read settings at all',
        'Settings are only available inside views',
        'Plugin apps load later than normal Django apps, so settings are not configured while the module body runs',
        'The plugin system deletes settings after start-up'
      ],
      a: 2,
      why: 'Plugin apps do not load at the usual point in Django start-up. Anything that reads settings belongs in <code>AppConfig.ready()</code>, not in the module body.'
    },
    {
      id: 'x07', track: 'openedx', module: 'ox-platform',
      q: 'What does <code>dispatch_uid</code> do on a signal receiver?',
      choices: [
        'Sets the priority of the receiver relative to others',
        'Stops the same receiver being connected twice if its module is imported twice',
        'Identifies which user triggered the signal',
        'Routes the signal to a Celery queue'
      ],
      a: 1,
      why: 'Without it, a module imported twice connects the handler twice and it fires twice per event. That looks exactly like a bug in your business logic, which is why it is hard to find.'
    },
    {
      id: 'x08', track: 'openedx', module: 'ox-platform',
      q: 'What is the one-sentence difference between an Open edX event and an Open edX filter?',
      choices: [
        'Events are synchronous and filters are asynchronous',
        'Events are for the LMS and filters are for Studio',
        'An event returns nothing; a filter is given the arguments and returns them',
        'Filters are Django signals and events are configured pipelines'
      ],
      a: 2,
      why: 'That single difference produces all the others. Because a filter returns the arguments it can change them or raise to stop the process; because an event returns nothing, a receiver can only react to something that already happened.'
    },
    {
      id: 'x09', track: 'openedx', module: 'ox-platform',
      q: 'You must block enrolment for learners from a sanctioned country. Event or filter?',
      choices: [
        'A filter — it runs before the process and can raise to prevent it',
        'An event — the receiver can return False to cancel',
        'Either; they are interchangeable for this',
        'Neither; this requires forking the enrolment view'
      ],
      a: 0,
      why: 'A rule you actually depend on cannot live in an event receiver. Events fire after the fact and returning anything changes nothing. A filter runs before, and raising its exception — such as <code>PreventEnrollment</code> — halts the process.'
    },
    {
      id: 'x10', track: 'openedx', module: 'ox-platform',
      q: 'In <code>OPEN_EDX_FILTERS_CONFIG</code>, what does <code>"fail_silently": True</code> mean?',
      choices: [
        'Filter exceptions such as <code>PreventEnrollment</code> are ignored',
        'The pipeline runs but its return value is discarded',
        'Unexpected errors in your step are swallowed and the process continues',
        'Errors are logged at a lower level but still stop the process'
      ],
      a: 2,
      why: 'It governs accidents, not decisions. Common exceptions from a broken step are caught and execution continues — fine for a nice-to-have, dangerous for a rule that must hold. Filter exceptions like <code>PreventEnrollment</code> are always raised either way.'
    },
    {
      id: 'x11', track: 'openedx', module: 'ox-platform',
      q: 'Why does a filter or event type end in <code>.v1</code>, as in <code>org.openedx.learning.course.enrollment.started.v1</code>?',
      choices: [
        'It records how many pipeline steps are configured',
        'It is the platform release number the hook was added in',
        'It marks the hook as a versioned contract, so a change ships as <code>.v2</code> alongside it',
        'It is required syntax for Django settings keys'
      ],
      a: 2,
      why: 'The hook is a published contract, not an internal function name. When arguments have to change, a <code>.v2</code> ships and both can run for a while, so your step does not break on an upgrade day you did not choose.'
    },
    {
      id: 'x12', track: 'openedx', module: 'ox-platform',
      q: 'A filter pipeline lists three steps. What does the second step receive?',
      choices: [
        'The original arguments, unchanged',
        'Whatever the first step returned',
        'Only the arguments the first step modified',
        'Nothing; steps run independently in parallel'
      ],
      a: 1,
      why: 'A pipeline is ordered and each step is handed the previous step\'s return value. That is why the order in the settings list is part of the behaviour, not a formatting choice.'
    },

    /* ---------- Content is data, not code ---------- */
    {
      id: 'x13', track: 'openedx', module: 'ox-content',
      q: 'What is an XBlock, in one line?',
      choices: [
        'A template that renders one page of a course',
        'The component type every piece of course content is an instance of',
        'A Django model for storing learner answers',
        'A packaging format for exporting courses'
      ],
      a: 1,
      why: 'Video, text, problem and discussion are all XBlocks, and a course is a tree of them. Because they all honour the same contract, the platform can render, grade, export and report on a component it has never seen.'
    },
    {
      id: 'x14', track: 'openedx', module: 'ox-content',
      q: 'Which XBlock view is the authoring form a course team fills in?',
      choices: ['<code>student_view</code>', '<code>studio_view</code>', '<code>public_view</code>', '<code>index_view</code>'],
      a: 1,
      why: '<code>student_view</code> is what a learner sees, <code>studio_view</code> is the editing form in the authoring tool, and <code>author_view</code> is the preview shown there, made to look as close to the learner view as possible.'
    },
    {
      id: 'x15', track: 'openedx', module: 'ox-content',
      q: 'Why does a view return a <code>Fragment</code> rather than an HTML string?',
      choices: [
        'It carries the HTML together with the CSS and JavaScript that HTML needs',
        'It compresses the response before sending it',
        'It is the only object the grading system can read',
        'Fragments are cached and strings are not'
      ],
      a: 0,
      why: 'A block is composed into a page alongside many others, so it has to declare its own assets. Return bare HTML and the markup arrives with none of the styling or behaviour it depends on.'
    },
    {
      id: 'x16', track: 'openedx', module: 'ox-content',
      q: 'The question text of a problem, shared everywhere that problem is used. Which scope?',
      choices: ['<code>Scope.settings</code>', '<code>Scope.content</code>', '<code>Scope.user_state</code>', '<code>Scope.preferences</code>'],
      a: 1,
      why: '<code>Scope.content</code> is no user, at the level of the definition. Reuse the same problem in two courses and both get the same text — which is exactly the intent.'
    },
    {
      id: 'x17', track: 'openedx', module: 'ox-content',
      q: 'Attempts allowed, set differently for the same problem in the beginner and advanced courses. Which scope?',
      choices: ['<code>Scope.content</code>', '<code>Scope.user_state</code>', '<code>Scope.settings</code>', '<code>Scope.user_info</code>'],
      a: 2,
      why: '<code>Scope.settings</code> is no user, at the level of this placement. Same definition, different configuration wherever it is placed — which is what lets one problem be stricter in one course.'
    },
    {
      id: 'x18', track: 'openedx', module: 'ox-content',
      q: 'A learner\'s preferred video playback speed, which should apply to every video they watch. Which scope?',
      choices: ['<code>Scope.user_state</code>', '<code>Scope.preferences</code>', '<code>Scope.settings</code>', '<code>Scope.user_state_summary</code>'],
      a: 1,
      why: 'Both <code>user_state</code> and <code>preferences</code> belong to one learner; they differ in which content. <code>preferences</code> is per block <i>type</i>, so it follows the learner across every video. In <code>user_state</code> they would set it again on each one.'
    },
    {
      id: 'x19', track: 'openedx', module: 'ox-content',
      q: 'Which scope is shared across all learners and writable by any of them, making it the one with real write contention?',
      choices: ['<code>Scope.user_info</code>', '<code>Scope.content</code>', '<code>Scope.user_state_summary</code>', '<code>Scope.preferences</code>'],
      a: 2,
      why: 'It is the "all users, this placement" cell — vote totals, answer distributions. Concurrent read-modify-write loses updates there, so counters want to be incremented in the database rather than read, added to and written back.'
    },
    {
      id: 'x20', track: 'openedx', module: 'ox-content',
      q: 'What are the two independent questions a scope answers?',
      choices: [
        'Which database and which table',
        'Which user does it belong to, and which content is it attached to',
        'Whether it is readable and whether it is writable',
        'How long it lives and how big it is'
      ],
      a: 1,
      why: 'User level is nobody, one learner, or all learners. Block level is the definition, this placement, this block type, or everything. The runtime picks storage from those two answers, so the per-learner filtering is never hand-written.'
    },
    {
      id: 'x21', track: 'openedx', module: 'ox-content',
      q: 'A learner\'s answer is stored in <code>Scope.settings</code> by mistake. What happens?',
      choices: [
        'It is discarded when the page reloads',
        'It becomes shared, so one learner\'s answer is visible to everyone on that block',
        'It cannot be saved, and the block raises an error',
        'It is stored per learner anyway; the scope only affects the editing form'
      ],
      a: 1,
      why: '<code>Scope.settings</code> is the no-user cell. There is one value for the placement, so whatever the last learner wrote is what everyone sees. This is the class of bug the declaration exists to make impossible.'
    },
    {
      id: 'x22', track: 'openedx', module: 'ox-content',
      q: 'A course points at two structures. What are they?',
      choices: [
        'The English version and the translated version',
        'The mobile layout and the desktop layout',
        'The draft that authors edit and the published version learners read',
        'The current term and the archived previous term'
      ],
      a: 2,
      why: 'Studio writes the draft; the LMS reads only the published version. Publishing moves the published pointer to the author\'s version in one step, so it can never half-apply.'
    },
    {
      id: 'x23', track: 'openedx', module: 'ox-content',
      q: 'Blocks are never edited in place — an edit writes a new version. What does that buy?',
      choices: [
        'Smaller storage, because only the difference is kept',
        'Faster publishing, because no rows are updated',
        'Publishing cannot half-apply, and the version a learner was graded against still exists',
        'Authors can edit the same unit simultaneously without conflict'
      ],
      a: 2,
      why: 'Immutability is what makes the pointer move atomic, and it is why a grade can record the course version it was computed against. Months later you can still reconstruct exactly what the learner answered.'
    },
    {
      id: 'x24', track: 'openedx', module: 'ox-content',
      q: 'An author renames a subsection in the course outline and nothing else. When do learners see it?',
      choices: [
        'Immediately — structural changes publish as they are made',
        'Only after pressing publish on that subsection',
        'After the nightly rebuild',
        'Only for learners who enrol after the change'
      ],
      a: 0,
      why: 'The outline, titles and course pages publish as you edit them. Units and components are the parts that need an explicit publish. Not knowing the difference produces both "I changed it and nothing happened" and its opposite.'
    },

    /* ---------- Making the read path cheap ---------- */
    {
      id: 'x25', track: 'openedx', module: 'ox-runtime',
      q: 'Why is caching the finished, per-learner course outline the wrong fix?',
      choices: [
        'Outlines are too large to cache',
        'One entry per learner per course, and every entry is wrong as soon as anything is published',
        'The cache cannot store trees',
        'Learners would all see the same outline'
      ],
      a: 1,
      why: 'The answer differs per learner, so a cache of finished answers barely gets reused and multiplies invalidation. The split into a shared precomputed structure plus a cheap per-learner filter is what makes it work.'
    },
    {
      id: 'x26', track: 'openedx', module: 'ox-runtime',
      q: 'In the block structure design, what happens during the <b>collect</b> phase?',
      choices: [
        'The learner\'s visible blocks are filtered and returned',
        'The whole tree is walked and everything the rules will need is written into one cached structure',
        'Grades are recomputed for every learner in the course',
        'The course is exported to disk'
      ],
      a: 1,
      why: 'Collect is the slow, shared half: walk the tree, ask every transformer what it will need later, write one blob. It runs once per published version in a background job, so nobody is waiting on it.'
    },
    {
      id: 'x27', track: 'openedx', module: 'ox-runtime',
      q: 'What must the <b>transform</b> phase avoid doing?',
      choices: [
        'Returning a subset of blocks',
        'Reading anything from the cached structure',
        'Querying the content store or the database',
        'Comparing dates'
      ],
      a: 2,
      why: 'Transform runs on every request. Everything it needs was collected already, so it filters in memory — visibility, start dates, prerequisites, group access. A query in that phase puts back the cost the design removed.'
    },
    {
      id: 'x28', track: 'openedx', module: 'ox-runtime',
      q: 'A new rule is needed: hide a unit until the previous drill is passed. What does adding it cost on the request path?',
      choices: [
        'A new database query per request',
        'A comparison over data that was already collected',
        'A full re-walk of the course tree',
        'Nothing can be added without changing the cache format'
      ],
      a: 1,
      why: 'A new transformer collects whatever it needs at publish time and filters in memory afterwards. That is the property worth having: rules accumulate without the request path growing a query each time.'
    },
    {
      id: 'x29', track: 'openedx', module: 'ox-runtime',
      q: 'The collect job has not run since the last publish. What is the real problem?',
      choices: [
        'Pages are slower until it runs',
        'Nothing, the transform phase falls back to the content store',
        'The outline can disagree with the progress page and reports, so learners see the wrong content',
        'Only staff are affected'
      ],
      a: 2,
      why: 'The cache stops being a speed concern and becomes a correctness one. That is why it is keyed by course version, rebuilt on publish, and needs a way to force a rebuild.'
    },
    {
      id: 'x30', track: 'openedx', module: 'ox-runtime',
      q: 'Why are grades stored rather than computed when someone asks for them?',
      choices: [
        'Computing them requires the learner to be online',
        'The read path is progress pages and reports over every learner, and replaying the course per read does not scale',
        'Stored grades cannot be disputed',
        'Django cannot aggregate scores in a single query'
      ],
      a: 1,
      why: 'Computing on read means finding every score, weighting each subsection, applying assignment weights and dropping the lowest — for every read. Persisting turns the read into a single row.'
    },
    {
      id: 'x31', track: 'openedx', module: 'ox-runtime',
      q: 'The grade task recomputes the subsection from current scores rather than adding to the stored value. Why does that matter most?',
      choices: [
        'It uses less memory on the worker',
        'It makes the task idempotent, so a retry or a duplicate delivery cannot double-count',
        'It avoids a database migration',
        'It lets the task run before the score is written'
      ],
      a: 1,
      why: 'Queues retry, and a retry after a timeout can run alongside the attempt that did not really fail. A task that recomputes gives the same answer however many times it runs; one that increments quietly corrupts the number.'
    },
    {
      id: 'x32', track: 'openedx', module: 'ox-runtime',
      q: 'Two answers are submitted a second apart and their tasks are processed out of order. What saves the grade?',
      choices: [
        'A lock held for the duration of both tasks',
        'A timestamp comparison that discards the older task',
        'Recomputing from current scores, so whichever runs last reads the latest state',
        'Nothing; out-of-order processing always corrupts the grade'
      ],
      a: 2,
      why: 'The same property that makes the task idempotent makes ordering irrelevant. Each run reads the scores as they are now, so the last one to finish is correct regardless of the order they arrived in.'
    },
    {
      id: 'x33', track: 'openedx', module: 'ox-runtime',
      q: 'Which grading rule makes incremental updating impossible, forcing a full recompute?',
      choices: [
        'Weighting each problem inside a subsection',
        'Dropping the lowest two assignment scores',
        'Converting a percentage to a letter grade',
        'Rounding the final score'
      ],
      a: 1,
      why: 'You cannot know which are the lowest until every subsection grade is known. Any rule that looks at the whole set rules out incremental updates — recompute-from-source is the only correct shape.'
    },
    {
      id: 'x34', track: 'openedx', module: 'ox-runtime',
      q: 'Why is the course version stored alongside a persisted grade?',
      choices: [
        'To let the platform charge per version',
        'To make the row unique in the database',
        'So a disputed grade can be traced back to the content it was actually computed against',
        'Because Celery requires a version key on every task'
      ],
      a: 2,
      why: 'A persisted derived value is a second thing that can be wrong. Storing what it was derived from turns "this grade looks wrong" from an argument into a query, especially after a course team has edited a graded problem mid-run.'
    },

    /* ---------- Where the services meet ---------- */
    {
      id: 'x35', track: 'openedx', module: 'ox-seams',
      q: 'Why can a Django session cookie not keep a user logged in across several services?',
      choices: [
        'Cookies cannot be sent to more than one host',
        'A session is a row in one service\'s database, so the others have nothing to look up',
        'Sessions expire too quickly',
        'Django refuses to read a session it did not create in the same request'
      ],
      a: 1,
      why: 'The cookie is only an identifier. Without the row it points at, another service learns nothing — which is why the answer is a token that carries the user inside it and is signed so anyone can verify it.'
    },
    {
      id: 'x36', track: 'openedx', module: 'ox-seams',
      q: 'The LMS signs its JWTs with a private key using <code>RS512</code>. What does asymmetric signing buy over a shared secret?',
      choices: [
        'Shorter tokens',
        'Verification without a network call',
        'Other services can verify tokens but cannot mint them, so a compromised service cannot issue identities',
        'Tokens can be revoked instantly'
      ],
      a: 2,
      why: 'With a shared secret, anything that can check a token can also forge one. Asymmetric signing keeps minting in one place. Verification without a call is true of any self-contained JWT, symmetric or not.'
    },
    {
      id: 'x37', track: 'openedx', module: 'ox-seams',
      q: 'The JWT is split into <code>edx-jwt-cookie-header-payload</code> and <code>edx-jwt-cookie-signature</code>. Why?',
      choices: [
        'To stay under the cookie size limit by splitting a large token',
        'So JavaScript can read the claims, while the half that makes the token usable stays <code>HttpOnly</code>',
        'So each service can be given a different half',
        'To let the payload be cached separately from the signature'
      ],
      a: 1,
      why: 'The front end reads the user and roles with no extra API call, and a script that scrapes what JavaScript can reach walks away with two thirds of a token that will not verify anywhere. Middleware rejoins the pair on each API call.'
    },
    {
      id: 'x38', track: 'openedx', module: 'ox-seams',
      q: 'Why was storing the JWT in <code>localStorage</code> rejected?',
      choices: [
        'It is not sent automatically with requests',
        'It is limited to 4KB like cookies',
        'Any injected script can read it, and what it reads is a complete working credential',
        'It is cleared when the tab closes'
      ],
      a: 2,
      why: 'That is the whole trade the split cookie exists to win. Web storage is reachable by any script on the page, so an XSS becomes a full account takeover rather than a partial token.'
    },
    {
      id: 'x39', track: 'openedx', module: 'ox-seams',
      q: 'Which limitation is inherent to a self-contained JWT?',
      choices: [
        'It cannot carry the user\'s roles',
        'It cannot be revoked, because nothing is looked up to validate it',
        'It only works over HTTPS',
        'It has to be re-signed by every service that reads it'
      ],
      a: 1,
      why: 'Nothing is consulted at verification time, so nothing can withdraw it. That is why lifetimes are short with a refresh flow, and why "log out everywhere" is a design problem rather than deleting a row.'
    },
    {
      id: 'x40', track: 'openedx', module: 'ox-seams',
      q: 'Why are the claims in a JWT cookie treated as a budget?',
      choices: [
        'Each claim costs a database read',
        'A cookie is capped around 4KB and this one is sent on every request',
        'The signing algorithm limits the payload to ten fields',
        'Claims are billed per byte by the identity provider'
      ],
      a: 1,
      why: 'Put a full permission list in the token and you find the ceiling in production, on your largest account, having also added those bytes to every request the browser makes.'
    },
    {
      id: 'x41', track: 'openedx', module: 'ox-seams',
      q: 'A service needs to call another service\'s API with no user involved. What does it use?',
      choices: [
        'The last user JWT it saw',
        'Its own client credentials, to get a token that represents the service',
        'A shared static API key in an environment variable',
        'An unauthenticated internal endpoint'
      ],
      a: 1,
      why: 'There is no user at the keyboard, so the service authenticates as itself through the OAuth2 client credentials flow. Reusing a user\'s token for background work makes every audit trail a lie.'
    },
    {
      id: 'x42', track: 'openedx', module: 'ox-seams',
      q: 'An Open edX event moves onto the event bus. What changes in the code that fires it?',
      choices: [
        'Nothing — a receiver reads <code>EVENT_BUS_PRODUCER_CONFIG</code> and publishes it',
        'The producer must import and call the broker client',
        'The signal is replaced by a direct HTTP call to each consumer',
        'The event has to be redefined as a Celery task'
      ],
      a: 0,
      why: 'The definition stays; only delivery becomes configuration. That is what makes it a real path out of a monolith — publish the event you already fire, build the consumer elsewhere, and the calling code never learns.'
    },
    {
      id: 'x43', track: 'openedx', module: 'ox-seams',
      q: 'Why must an event bus consumer be idempotent?',
      choices: [
        'Because the producer may fire the event twice',
        'Because brokers deliver at least once, so the same message will arrive again',
        'Because consumers run in parallel on the same message by design',
        'Because Django signals are not transactional'
      ],
      a: 1,
      why: 'At-least-once is the guarantee you actually get from Kafka or Redis Streams. A consumer that is not idempotent will double-count something, and you will hear about it from a number that looks wrong rather than from an error.'
    },
    {
      id: 'x44', track: 'openedx', module: 'ox-seams',
      q: 'Why is versioning an event type more important once it crosses a broker than in process?',
      choices: [
        'Brokers cannot serialise unversioned messages',
        'In process a signature change is a refactor your tests catch; across a broker it breaks strangers whose deploys you do not control',
        'Versioning is what routes the message to the right topic',
        'Consumers cannot subscribe without a version number'
      ],
      a: 1,
      why: 'Once published, the shape is a contract owned by other teams and other release schedules. Changing it in place is a breaking change to people who cannot redeploy on your timetable.'
    },
    {
      id: 'x45', track: 'openedx', module: 'ox-seams',
      q: 'When is a broker the wrong answer?',
      choices: [
        'When the work belongs to the same service and a Celery task would do',
        'When two services need the same event',
        'When events must survive a consumer being down',
        'When events need to be replayed'
      ],
      a: 0,
      why: 'A broker is a cluster to run, consumer lag to watch, poison messages and replay to think about. Taking that on for work that stays inside one service is buying operational weight you did not need.'
    },

    /* ---------- Changing a system that cannot stop ---------- */
    {
      id: 'x46', track: 'openedx', module: 'ox-change',
      q: 'What does shipping behind a feature toggle actually separate?',
      choices: [
        'Development from testing',
        'Deploying the code from releasing the behaviour',
        'The database schema from the application',
        'Staff features from learner features'
      ],
      a: 1,
      why: 'The code ships turned off and is enabled gradually. If it is wrong you turn it off — no rollback, no redeploy, and no waiting on a pipeline while learners are stuck mid-exam.'
    },
    {
      id: 'x47', track: 'openedx', module: 'ox-change',
      q: 'You need a switch an operator sets once and that requires a deploy to change. Which toggle type?',
      choices: ['<code>WaffleFlag</code>', '<code>WaffleSwitch</code>', '<code>SettingToggle</code>', '<code>CourseWaffleFlag</code>'],
      a: 2,
      why: 'A <code>SettingToggle</code> is a Django setting — deliberately deploy-bound. Waffle switches and flags live in the database precisely so they can be changed without one.'
    },
    {
      id: 'x48', track: 'openedx', module: 'ox-change',
      q: 'You want to enable a change for 1% of users, then 10%, then everyone. Which toggle type?',
      choices: ['<code>SettingToggle</code>', '<code>WaffleFlag</code>', '<code>WaffleSwitch</code>', 'A Django feature flag in <code>FEATURES</code>'],
      a: 1,
      why: 'A flag is evaluated per user and supports a percentage. A switch is on or off for everyone at once — that is the kill switch, not the staged rollout.'
    },
    {
      id: 'x49', track: 'openedx', module: 'ox-change',
      q: 'A <code>CourseWaffleFlag</code> has a global default, an organisation override and a course override. Which wins?',
      choices: [
        'The global default always wins',
        'The organisation override always wins',
        'Course beats organisation, and organisation beats the default',
        'Whichever was set most recently'
      ],
      a: 2,
      why: 'Most specific wins. Early in a rollout that means on for three named courses; after the default flips to on, the same object means off for the one customer who is not ready. Same mechanism, opposite jobs, no new code.'
    },
    {
      id: 'x50', track: 'openedx', module: 'ox-change',
      q: 'Which annotation field is the one that keeps a codebase from filling with dead toggles?',
      choices: [
        '<code>toggle_creation_date</code>',
        '<code>toggle_description</code>',
        '<code>toggle_target_removal_date</code>',
        '<code>toggle_implementation</code>'
      ],
      a: 2,
      why: 'Naming the removal date at creation makes cleanup somebody\'s job instead of nobody\'s. Without it, a hundred forgotten flags means nobody can say what actually runs in production.'
    },
    {
      id: 'x51', track: 'openedx', module: 'ox-change',
      q: 'What is the hidden cost of every feature toggle?',
      choices: [
        'A database query on each evaluation',
        'A permanent branch in the code, where both paths must keep working',
        'A slower deployment pipeline',
        'An extra migration per flag'
      ],
      a: 1,
      why: 'Two paths means every future change has to be correct in both. And once the old path stops being exercised, the flag has quietly stopped being a safety net — turning it off will not save you.'
    },
    {
      id: 'x52', track: 'openedx', module: 'ox-change',
      q: 'Why is nesting two flags around the same feature a bad idea?',
      choices: [
        'Waffle only supports one flag per request',
        'Two flags are four combinations, and you have tested one',
        'Flags cannot be evaluated inside other flags',
        'It doubles the database load'
      ],
      a: 1,
      why: 'The states multiply while the testing does not. Whichever combination production ends up in is unlikely to be the one anyone exercised.'
    },
    {
      id: 'x53', track: 'openedx', module: 'ox-change',
      q: 'What is the unit of a micro-frontend migration?',
      choices: [
        'The whole application, released at once',
        'A route or area of the product, migrated on its own',
        'A single React component',
        'A database table'
      ],
      a: 1,
      why: 'One area — courseware, profile — becomes a standalone React app deployed by itself, while Django templates keep serving every other URL. The site never goes down for the migration.'
    },
    {
      id: 'x54', track: 'openedx', module: 'ox-change',
      q: 'What makes the boundary between a Django-rendered page and a React micro-frontend invisible to the user?',
      choices: [
        'Server-side rendering of the React app',
        'A shared JWT cookie for the session plus a shared design system for the look',
        'Loading both applications in the same browser tab',
        'A reverse proxy that rewrites the HTML'
      ],
      a: 1,
      why: 'Without shared auth they are asked to log in again at the seam; without a shared design system the new half looks like a different product and users trust it less. Both are needed.'
    },
    {
      id: 'x55', track: 'openedx', module: 'ox-change',
      q: 'An operator wants to add a component to one region of an existing micro-frontend. What should they do?',
      choices: [
        'Fork the micro-frontend and edit its source',
        'Use a plugin slot from <code>env.config.jsx</code>',
        'Patch the built JavaScript bundle after deployment',
        'Submit a pull request to the upstream application'
      ],
      a: 1,
      why: 'Forking a frontend app costs exactly what forking the platform costs, and these apps change often. A slot lets you modify, replace or add to a named region from configuration, with the source untouched.'
    },
    {
      id: 'x56', track: 'openedx', module: 'ox-change',
      q: 'When is a strangler migration finished?',
      choices: [
        'When the new page is live',
        'When the new page handles all the traffic',
        'When the old page is deleted',
        'When the old framework is removed from the dependency file'
      ],
      a: 2,
      why: 'Two implementations of one screen is worse than either alone — every change has to be made twice, and eventually one of them is forgotten. The old page has to go for the migration to have paid off.'
    }
  );
})(window.PREP);
