/* Open edX track — shipping features into a Django platform you do not own.

   Every mechanism on these cards is one that exists in openedx-platform (the
   repository formerly called edx-platform) and is checked against the docs and
   source linked on each card. Code samples are taken from the upstream
   documentation or the upstream source, trimmed but not invented.

   The through-line is deliberate. An interviewer who has run a Django education
   product does not need to hear that Django has an ORM. What they want to know
   is whether you can add features to a large, living system for years without
   the system rotting. Every card is a mechanism for doing that, and every card
   ends with where the same mechanism lands on a product built from scratch. */
(function (P) {
  P.modules.push({
    id: 'ox-platform',
    track: 'openedx',
    title: 'A platform you did not write',
    kicker: 'Module 01',
    blurb:
      'openedx-platform is a Django monolith that runs a course authoring tool and a learner-facing site out of one repository, and it is upgraded by other people several times a year. Everything in this module comes from one constraint: you have to add your features without ever editing that code.',
    concepts: [
      {
        id: 'ox-fork',
        title: 'The first question is not how. It is where.',
        tags: ['architecture', 'hot'],
        ask: 'You need a feature the platform does not have. Where do you put the code?',
        body: [
          { p: 'There are only two answers, and the difference between them is worth years.' },
          { p: 'The first is to change the platform code. Clone the repository, edit the file, run your copy. This works on the first day and it is the reason most teams end up stuck. The moment you edit a file upstream also edits, you own a permanent merge conflict. Every upgrade becomes a negotiation between your change and theirs.' },
          { p: 'The second is to attach your code at a published seam and leave the platform untouched. Your feature ships as a separate Python package. The platform never knows your name. When the platform upgrades, you upgrade with it.' },
          { p: 'This is the real question behind "have you worked with Open edX". Anyone can run it. The people who have shipped on it know that a fork is a decision to stop receiving upgrades, and they know how to avoid taking it.' },
          {
            diagram: `WITHOUT A FORK                        WITH A FORK

  upstream  v1 ── v2 ── v3 ── v4        upstream  v1 ── v2 ── v3 ── v4
                                                    \\
  your pkg  ─────────────────────                    your fork ──────>
            (installed alongside)                    every upgrade is a
                                                     merge you pay for,
  upgrade = bump a version                           forever`,
            caption: 'What a fork actually costs'
          },
          { p: 'So the platform publishes a list of seams. They are not equally cheap, and picking the cheapest one that does the job is the whole skill. Roughly in order:' },
          {
            list: [
              '<b>Theming and design tokens</b> — colours, logos, fonts. Loaded at run time, so nothing is rebuilt.',
              '<b>Frontend plugin slots</b> — swap, wrap or replace a named region of a React page from a config file.',
              '<b>Open edX Filters</b> — run your rule <i>before</i> a platform process, and change or block what it does.',
              '<b>Open edX Events</b> — react <i>after</i> a platform process finishes.',
              '<b>XBlocks</b> — a whole new kind of interactive content inside a course.',
              '<b>Django app plugins</b> — your own models, REST endpoints, admin and background tasks, installed into the platform process.',
              '<b>A separate service</b> — when the feature genuinely is not part of the platform, talk to it over its REST API.'
            ]
          },
          { p: 'Only when none of these fit does anyone talk about changing core code, and even then the move is to add a seam upstream and contribute it back, so that the next person does not have to fork either.' },
          {
            note: [
              'A fork is not the only way to lose upgrades. <b>Monkeypatching</b> — importing a platform module at start-up and reassigning one of its functions — keeps your diff out of their repository but breaks just as hard, and silently, because nothing tells you when the function you replaced changed shape.',
              'A fork you intend to upstream is a different thing from a fork you intend to keep. The first has an end date. Say which one you mean.'
            ]
          },
          {
            bridge: [
              'The habit transfers to anything you did not write: a payment provider, a video host, a CMS, an SDK. Before writing the feature, find the published seam and price the alternatives.',
              'And it works in reverse. When you own the codebase and a second team needs to extend it, the senior move is to give them a seam instead of a pull request into your core.'
            ]
          }
        ],
        say:
          'The first thing I check is where the code can live without forking. Open edX publishes a ladder of extension points — theming, frontend plugin slots, filters, events, XBlocks, Django app plugins, and finally a separate service — and I take the cheapest one that does the job. Forking looks fastest on day one and then you pay for it at every upgrade, because your diff has to be re-merged forever. Monkeypatching is the same trade with a quieter failure. If nothing fits, I would rather add the extension point upstream and contribute it than carry a fork, so the next team does not carry one either.',
        traps: [
          'Forking because it is faster this sprint, with no plan for the second upgrade.',
          'Monkeypatching a platform function at start-up. The diff is invisible and the breakage is silent.',
          'Reaching straight for the heaviest seam. If theming would have done it, a Django app plugin is a cost you chose.',
          'Talking about Open edX as if running it were the achievement. Running it is configuration; extending it without a fork is engineering.'
        ]
      },
      {
        id: 'ox-plugin',
        title: 'A Django app that installs itself',
        tags: ['django', 'hot'],
        ask: 'How does a pip-installed package add models, URLs and settings to a Django project without anyone editing settings.py?',
        body: [
          { p: 'This is the seam that carries most real work, and it is the one worth being able to draw from memory, because you can build the same thing in any Django project you own.' },
          { p: 'Normally a Django app is wired in by hand. You add it to <code>INSTALLED_APPS</code>, add a line to <code>urls.py</code>, add your settings. Three files in the project have to know your app exists.' },
          { p: 'The plugin mechanism inverts that. Your package declares an <b>entry point</b> — a line of metadata that pip writes when the package is installed. At start-up the platform asks Python "which installed packages registered themselves under this name?" and wires up everything it finds.' },
          {
            code: {
              lang: 'python',
              src: `# setup.py, in YOUR package

setup(
    name="drills",
    entry_points={
        "lms.djangoapp": [
            "drills = drills.apps:DrillsConfig",
        ],
        "cms.djangoapp": [
            "drills = drills.apps:DrillsConfig",
        ],
    },
)

# "lms.djangoapp" is the LMS, the learner-facing service.
# "cms.djangoapp" is Studio, the authoring service.
# Register under both, one, or neither — that choice IS the deployment.`
            }
          },
          { p: 'Then the app config says what to wire. A single dictionary called <code>plugin_app</code> answers three questions: where do my URLs mount, which settings do I inject, and which signals do I listen to.' },
          {
            code: {
              lang: 'python',
              src: `# drills/apps.py

from django.apps import AppConfig


class DrillsConfig(AppConfig):
    name = "drills"

    plugin_app = {
        "url_config": {
            "lms.djangoapp": {
                "namespace": "drills",
                "regex": "^api/drills/",
                "relative_path": "api.urls",
            }
        },
        "settings_config": {
            "lms.djangoapp": {
                "common": {"relative_path": "settings.common"},
                "production": {"relative_path": "settings.production"},
            }
        },
        "signals_config": {
            "lms.djangoapp": {
                "relative_path": "handlers",
                "receivers": [{
                    "receiver_func_name": "on_enrollment",
                    "signal_path": "common.djangoapps.student.signals.ENROLL_STATUS_CHANGE",
                    "dispatch_uid": "drills.handlers.on_enrollment",
                }],
            }
        },
    }`
            }
          },
          { p: 'The settings module you point at exports one function, and it is handed the live settings object to modify:' },
          {
            code: {
              lang: 'python',
              src: `# drills/settings/common.py

def plugin_settings(settings):
    settings.DRILLS_MAX_ATTEMPTS = 3
    settings.CELERY_IMPORTS = settings.CELERY_IMPORTS + ("drills.tasks",)`
            }
          },
          { p: 'The result is that <code>pip install drills</code> is the entire installation. Your models get migrations, your endpoints get URLs, your handlers get connected, and not one line of the platform changed.' },
          { p: 'Notice what the <code>signals_config</code> block buys. The receiver is named as a <i>string</i>, so your module never imports the platform module that defines the signal. Import-time coupling becomes start-up-time coupling, which means the platform can move that signal without breaking your import.' },
          {
            note: [
              'Plugin apps load later than a normal Django app, so <b>Django settings are not available while your module body runs</b>. Anything that reads settings belongs in <code>AppConfig.ready()</code>, not at the top of the file. This bites everyone once.',
              'The <code>dispatch_uid</code> is not decoration. It is what stops the same receiver being connected twice when a module is imported twice, and a doubly-connected receiver looks exactly like a bug in your business logic.'
            ]
          },
          {
            bridge: [
              'You can build this seam in an afternoon in any Django project. Python entry points, a conventional attribute on <code>AppConfig</code>, and a loop at start-up.',
              'It is what lets a second team, or a client-specific package, add endpoints and tables to your product without a pull request into your core — and without you reviewing every line of their feature.'
            ]
          }
        ],
        say:
          'A plugin app is a normal Django app that registers a Python entry point — lms.djangoapp or cms.djangoapp — so pip installing it is enough. The platform scans entry points at start-up, adds the app to INSTALLED_APPS, and reads a plugin_app dictionary on the AppConfig to find the URL prefix to mount it under, the settings module to call, and the signal receivers to connect. Receivers are declared as dotted strings, so my package never imports platform code and the coupling moves from import time to start-up time. The one gotcha is that plugin apps load late, so settings are not available in the module body — anything that reads them goes in ready(). I like this pattern enough that I would build it into a project I own, because it lets other teams extend the product without touching its core.',
        traps: [
          'Reading <code>settings.SOMETHING</code> at module level in a plugin app. It is not loaded yet.',
          'Connecting a signal with <code>@receiver</code> in a module that may be imported twice, and no <code>dispatch_uid</code>. The handler fires twice and the cause is not obvious.',
          'Importing a platform module to get at a signal, which puts back exactly the coupling the string path removed.',
          'Registering under <code>lms.djangoapp</code> only, then wondering why the authoring service has no idea your models exist.'
        ]
      },
      {
        id: 'ox-hooks',
        title: 'Events tell you. Filters let you decide.',
        tags: ['architecture', 'hot'],
        ask: 'What is the difference between an Open edX event and an Open edX filter, and when would you reach for each?',
        body: [
          { p: 'Both are seams into a platform process, and candidates routinely blur them. The distinction is one sentence: <b>an event returns nothing, a filter returns the arguments.</b> Everything else follows from that.' },
          {
            diagram: `FILTER                                   EVENT

  request                                  request
     |                                        |
     v                                        v
  your step  <- can change the args        the platform does the work
     |          or raise to stop it           |
     v                                        v
  the platform does the work               your receiver  <- told after
     |                                        |    the fact; cannot
     v                                        v    change the outcome
  response                                 (already done)`,
            caption: 'Before, with a vote — or after, for information'
          },
          { p: 'An <b>event</b> is a standardised Django signal. It fires when something has finished — a learner enrolled, a certificate was issued, a session started. Your receiver runs, returns nothing, and the platform carries on regardless. Use it for anything downstream: send a welcome message, mirror the record into your own table, tell an external system.' },
          { p: 'A <b>filter</b> is a pipeline of steps you list in settings. It runs before the process, is handed the arguments, and must give them back. Return them changed and the platform proceeds with your version. Raise the filter\'s own exception and the process stops.' },
          {
            code: {
              lang: 'python',
              src: `from openedx_filters.filters import PipelineStep


class CheckValidEmailPipelineStep(PipelineStep):

    def run_filter(self, user, course_key, mode):
        if not is_user_email_allowed(user.email):
            raise CourseEnrollmentStarted.PreventEnrollment(
                "User does not have a valid email address"
            )

        # Hand every argument back. Change one and the platform
        # uses your version from here on.
        return {
            "user": user,
            "course_key": course_key,
            "mode": mode,
        }`
            }
          },
          { p: 'It is turned on by configuration, not by code. Nothing imports your class:' },
          {
            code: {
              lang: 'python',
              src: `OPEN_EDX_FILTERS_CONFIG = {
    "org.openedx.learning.course.enrollment.started.v1": {
        "fail_silently": False,
        "pipeline": [
            "drills.pipeline.CheckValidEmailPipelineStep",
        ],
    },
}`
            }
          },
          { p: 'Two details in that block are worth naming out loud, because they are what a senior answer sounds like.' },
          {
            list: [
              '<b>The key ends in <code>.v1</code>.</b> The hook is a versioned contract, not a function name. When the arguments have to change, the platform ships a <code>.v2</code> and both run for a while, so your step does not break on an upgrade day you did not choose.',
              '<b><code>fail_silently</code> decides who wins when your step crashes.</b> Set to <code>True</code>, an unexpected error is swallowed and enrolment proceeds — good for a nice-to-have, terrible for a rule that must hold. Set to <code>False</code> and a bug in your step becomes a failed enrolment, loudly. Filter exceptions such as <code>PreventEnrollment</code> are always raised either way; this setting only governs the accidents.'
            ]
          },
          {
            note: [
              'Do not put a rule you actually depend on inside an event receiver. Events are announcements. Nothing guarantees your receiver ran, nothing guarantees the order, and returning an error changes nothing that already happened.',
              'If the answer to "what happens if this code does not run" is "we let someone in who should not be", it is a filter.'
            ]
          },
          {
            bridge: [
              'The split is the one to copy: an <i>announcement</i> that anyone may listen to, and a <i>decision point</i> that is an ordered, configured list of rules.',
              'Business rules that keep arriving — eligibility, entitlement, regional restrictions, trial limits — belong in a decision point that is a list in configuration. New rule, new list entry, no change to the enrolment code that has worked for two years.'
            ]
          }
        ],
        say:
          'They are the two halves of the Hooks Extension Framework. An event is a standardised Django signal that fires after something happened and returns nothing, so a receiver can react but cannot change the outcome — that is where I put downstream work like notifying another system. A filter runs before the process, receives the arguments and returns them, so it can modify them or raise something like PreventEnrollment to stop the process entirely. Filters are configured in OPEN_EDX_FILTERS_CONFIG as an ordered pipeline, so a new rule is a new list entry, not a code change. Two things I would check on the way in: the hook name is versioned, ending in v1, because it is a contract; and fail_silently decides whether a crash in my step blocks the learner or is swallowed — for a rule that has to hold, it must be False.',
        traps: [
          'Saying "filters are just signals". Signals return nothing. That is the whole difference.',
          'Enforcing a business rule in an event receiver. The thing already happened.',
          'Leaving <code>fail_silently: True</code> on a rule you depend on, so a bug in your step quietly lets everyone through.',
          'Forgetting a filter pipeline is <i>ordered</i>, and that each step receives what the previous one returned.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'ox-content',
    track: 'openedx',
    title: 'Content is data, not code',
    kicker: 'Module 02',
    blurb:
      'An education platform lives or dies on how many lessons non-engineers can produce without you. That is a data-model question, and Open edX answers it with three ideas: a component contract, a declaration of who each field belongs to, and a hard line between authoring and delivery.',
    concepts: [
      {
        id: 'ox-xblock',
        title: 'Build the type once. They author the instances forever.',
        tags: ['data model', 'hot'],
        ask: 'A coach wants two hundred interactive drills. How many of them do you build?',
        body: [
          { p: 'The answer that gets you the job is "one, if they are all the same kind of drill". The engineering task is not two hundred drills. It is one component type and an editor.' },
          { p: 'In Open edX that component type is an <b>XBlock</b>. Every piece of a course is one — a video, a text page, a multiple-choice problem, a discussion. The course itself is a tree of them. Because they all honour the same small contract, the platform can render, grade, export, translate and report on a component it has never seen.' },
          { p: 'The contract has three parts.' },
          {
            list: [
              '<b>Fields</b> hold state, declared as class attributes with a scope. Scopes get their own card next, because they are the good idea.',
              '<b>Views</b> render it. <code>student_view</code> is what a learner sees, <code>studio_view</code> is the editing form an author sees, and <code>author_view</code> is the preview inside the authoring tool. Each returns a <code>Fragment</code>, which carries HTML together with the CSS and JavaScript that HTML needs.',
              '<b>Handlers</b> answer the browser. A handler is a Python method the front end calls over AJAX; <code>@XBlock.json_handler</code> takes parsed JSON in and returns JSON out.'
            ]
          },
          {
            code: {
              lang: 'python',
              src: `class HandDrillBlock(XBlock):

    prompt = String(scope=Scope.content, default="")
    attempts_allowed = Integer(scope=Scope.settings, default=3)
    attempts_used = Integer(scope=Scope.user_state, default=0)

    def student_view(self, context=None):
        frag = Fragment(render_template("drill.html", prompt=self.prompt))
        frag.add_css_url(self.runtime.local_resource_url(self, "public/drill.css"))
        frag.add_javascript_url(self.runtime.local_resource_url(self, "public/drill.js"))
        frag.initialize_js("HandDrillBlock")
        return frag

    @XBlock.json_handler
    def submit(self, data, suffix=""):
        if self.attempts_used >= self.attempts_allowed:
            return {"accepted": False, "reason": "no attempts left"}

        self.attempts_used += 1
        return {"accepted": True, "attempts_left": self.attempts_allowed - self.attempts_used}`
            }
          },
          { p: 'Roughly fifty lines, and an author can now place two hundred drills, each with its own prompt and attempt limit, without opening a terminal. Grades, progress, export and mobile rendering come from the contract, not from you.' },
          { p: 'The judgement call is when <i>not</i> to build one. If the interaction is a one-off, an HTML block with some JavaScript is cheaper. If it must also run on someone else\'s platform, LTI is the standard that travels. An XBlock is worth it when the same interaction will be authored many times, and the platform needs to understand it well enough to grade and report on it.' },
          {
            note: [
              'A custom component type is a promise to maintain it. It has to keep working across platform upgrades, render on mobile, export and re-import, and behave when an author copies the course. Build the third one; do not build the first.'
            ]
          },
          {
            bridge: [
              'This is the leverage question every content product eventually faces: how much of the catalogue can be produced without an engineer?',
              'The shape is the same anywhere — a small component contract (state, a render, a handler), one authoring form per type, and a tree of instances in the database. The day a coach can ship a new drill without a deploy is the day the product starts compounding.'
            ]
          }
        ],
        say:
          'Everything in an Open edX course is an XBlock — video, text, problem, discussion — and a course is a tree of them. A block declares fields for its state, views for rendering, and handlers for AJAX. student_view returns a Fragment carrying HTML plus the CSS and JavaScript it needs, studio_view is the authoring form, and a json_handler answers calls from the browser. The point is leverage: engineering builds the type once and course teams author instances forever, and because every block honours the same contract the platform can grade, export and render on mobile something it has never seen. I would not build one for a one-off — that is an HTML block, or LTI if it has to run on other platforms too. A custom block is worth it when the same interaction will be authored many times.',
        traps: [
          'Building a bespoke page for each lesson. Two hundred lessons then means two hundred deploys.',
          'Putting learner state in an attribute instead of a field. Only fields are persisted, and only fields carry a scope.',
          'Returning bare HTML from a view instead of a <code>Fragment</code>, so the CSS and JavaScript never load.',
          'Writing a new block type for something LTI or a plain HTML block already does.'
        ]
      },
      {
        id: 'ox-scopes',
        title: 'Say who the data belongs to, and the storage follows',
        tags: ['data model', 'hot'],
        ask: 'Where does the question text live, versus a learner\'s answer, versus their preferred playback speed?',
        body: [
          { p: 'This is the best idea in the codebase, and it is one you can lift wholesale.' },
          { p: 'A field on a block does not name a table. It names a <b>scope</b>, and a scope is an answer to two questions: which user does this belong to, and which slice of the content does it belong to. The runtime reads those two answers and picks the storage.' },
          {
            code: {
              lang: 'text',
              src: `                        WHICH USER does it belong to?

                        nobody            one learner            all learners
WHICH CONTENT?
  the definition        Scope.content         -                       -
  this placement        Scope.settings    Scope.user_state       Scope.user_state_summary
  this block type           -             Scope.preferences           -
  every block               -             Scope.user_info             -`
            }
          },
          { p: 'Read it as a sentence and each one becomes obvious.' },
          {
            list: [
              '<code>Scope.content</code> — no user, the definition. The question text, the correct answer. Reuse the same drill in two courses and both get this.',
              '<code>Scope.settings</code> — no user, this placement. Attempts allowed, due date, weight. Same drill, stricter in the advanced course.',
              '<code>Scope.user_state</code> — one learner, this placement. Their answer, their attempts used. The row that must never leak.',
              '<code>Scope.user_state_summary</code> — all learners, this placement. Vote totals, how many people picked each option.',
              '<code>Scope.preferences</code> — one learner, this block type. Playback speed for every video, not one video.',
              '<code>Scope.user_info</code> — one learner, everything. Their time zone.'
            ]
          },
          { p: 'What that buys is enormous. Nobody writes a table per feature, and nobody hand-writes the query that filters by learner. Getting a learner\'s answer wrong — showing it to another learner, or resetting it on every course edit — is not a bug you can write, because the storage is chosen by the declaration and the declaration is one word.' },
          { p: 'It also settles arguments before they start. "Should the due date be per learner?" stops being a debate and becomes: is it <code>Scope.settings</code> or <code>Scope.user_state</code>. One word, in the model, reviewable in a diff.' },
          {
            note: [
              'The two axes are independent, and the trap is collapsing them. <code>Scope.preferences</code> and <code>Scope.user_state</code> both belong to one learner; they differ entirely in <i>which content</i>. Put playback speed in <code>user_state</code> and the learner sets it again on every single video.',
              '<code>Scope.user_state_summary</code> is shared and writable by every learner at once, so it is the one scope with real contention. Counters there want to be incremented in the database, not read, added to and written back.'
            ]
          },
          {
            bridge: [
              'Take the matrix, not the API. Before choosing a table for any piece of state, answer both questions out loud: whose is it, and what is it attached to?',
              'On a training product that is the difference between a learner\'s bankroll settings, a coach\'s configuration of one drill, the drill\'s own text, and a leaderboard that belongs to everyone. Four different lifetimes, four different owners — and teams that never asked the question end up with all four in one table and a migration they dread.'
            ]
          }
        ],
        say:
          'A field declares a scope rather than a table, and a scope answers two independent questions: which user does this belong to — nobody, one learner, or all learners — and which content is it attached to: the definition, this particular placement, this block type, or the whole platform. So the question text is Scope.content, the attempt limit for this placement is Scope.settings, a learner\'s answer is Scope.user_state, vote totals are Scope.user_state_summary, and preferred playback speed is Scope.preferences because it belongs to one learner across every video. The runtime picks the storage from the declaration, which means the per-learner filtering is never hand-written and cannot be got wrong. I have started asking those two questions about state in projects with no XBlocks in them at all, because getting them wrong is what produces the table nobody wants to migrate.',
        traps: [
          'Putting per-learner state in <code>Scope.settings</code>. It is shared, so one learner\'s progress becomes everybody\'s.',
          'Using <code>Scope.user_state</code> for a preference, so it resets on every new block instead of following the learner.',
          'Read-modify-write on <code>Scope.user_state_summary</code> under load. Concurrent votes overwrite each other.',
          'Storing the correct answer in <code>Scope.settings</code> when it belongs to the definition, so a copied course silently diverges.'
        ]
      },
      {
        id: 'ox-publish',
        title: 'Authoring and delivery are two different products',
        tags: ['architecture'],
        ask: 'Why are Studio and the LMS separate services when they run from the same repository?',
        body: [
          { p: 'Because they have almost nothing in common except the data.' },
          {
            code: {
              lang: 'text',
              src: `                    Studio (authoring)          LMS (delivery)

who uses it         dozens of authors           all the learners
traffic shape       writes, bursty              reads, sustained
what hurts          losing work                 latency, and downtime
                                                during a live exam
what it reads       the draft                   the published version`
            }
          },
          { p: 'Put those in one process and the shapes fight. A course import that pins the CPU should never be able to slow down a learner mid-answer, and scaling for the learners should not mean scaling the authoring tool with them.' },
          { p: 'The two are kept apart by a <b>draft branch and a published branch</b>. Each course points at two structures: what authors are editing, and what learners are reading. Authors work on the draft as long as they like. Pressing publish moves the published pointer to their version, atomically.' },
          {
            diagram: `course record
   |
   +-- draft      -> structure v9   <- Studio writes here, freely
   |
   +-- published  -> structure v7   <- the LMS reads here, only here

publish = point "published" at v9. One pointer move.
Blocks themselves are never edited in place — an edit writes
a new version, so v7 is still there, intact, afterwards.`,
            caption: 'Two pointers, immutable versions'
          },
          { p: 'Immutability is what makes that safe. A block is not updated in place; an edit writes a new version and the structure points at it. So publishing cannot half-apply, and the version a learner saw is still on disk after the author has moved on.' },
          { p: 'That last part matters more than it sounds. Grades are stored alongside the course version they were computed against. When someone asks in three months why a learner scored what they scored, the answer is reconstructable, because the content they actually answered still exists.' },
          {
            note: [
              'Not everything waits for the publish button. Structural edits — the outline, section and subsection titles, course pages — publish as you make them. Units and components are the things you must publish explicitly. Knowing that difference is what stops the "I changed it and nothing happened" support ticket, and its mirror, "I changed it and it went live immediately".',
              'Course content still lives in MongoDB through the split modulestore. Newer content libraries are built on Learning Core, a relational store with the same draft-and-publish model, and courses are moving that way. The <i>model</i> is the durable part; the database under it is not.'
            ]
          },
          {
            bridge: [
              'Any product where someone authors what someone else consumes wants this: a draft, a publish, immutable versions, and the consumer reading only what was published.',
              'It is what lets a coach rewrite a lesson at ten in the morning without changing what a learner is halfway through — and what lets you answer, months later, exactly which version they were graded on.'
            ]
          }
        ],
        say:
          'They are one repository run as two services because their traffic and their failure modes are opposites: authoring is bursty writes by a few dozen people where the risk is losing work, delivery is sustained reads by everyone where the risk is latency during a live exam. The split is a draft branch and a published branch. Studio writes the draft, the LMS reads only the published version, and publishing is a pointer move to a new immutable structure, so it can never half-apply. Because versions are immutable, grades can record the course version they were computed against and you can reconstruct months later exactly what a learner answered. Structural changes publish immediately while units need an explicit publish, which is worth knowing because it is the source of most author confusion.',
        traps: [
          'Reading the draft from the delivery path, so learners see half-finished edits.',
          'Editing content in place. You lose the ability to explain any grade computed before the edit.',
          'Assuming everything waits for publish. Outline and title changes do not.',
          'Treating "Mongo for content" as the lesson. The lesson is draft, publish and immutable versions; the store is an implementation detail.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'ox-runtime',
    track: 'openedx',
    title: 'Making the read path cheap',
    kicker: 'Module 03',
    blurb:
      'Two problems dominate a courseware backend: a course outline is a large tree and every learner sees a different subset of it, and a grade is expensive to compute but read constantly. The platform solves both the same way — do the expensive work once, off the request, and keep the per-learner part small.',
    concepts: [
      {
        id: 'ox-transformers',
        title: 'Collect once, transform per request',
        tags: ['performance', 'hot'],
        ask: 'A course outline is thousands of blocks and no two learners see the same subset. How do you serve it fast?',
        body: [
          { p: 'Start with what makes it expensive. Rendering an outline means walking the whole tree, and then, for each block, deciding whether <i>this</i> learner may see it: is it hidden, has it started, is it gated behind a prerequisite, is it for their cohort, is it staff-only.' },
          { p: 'Do that naively and every page load walks the tree and hits the content store thousands of times. The obvious fix — cache the finished outline — does not work either, because the answer differs per learner, so the cache would hold one entry per learner per course and be wrong the moment anything is published.' },
          { p: 'The platform splits the work into two phases instead, and the split is where the whole idea lives.' },
          {
            diagram: `COLLECT — once per published version, in a background job

  walk the whole course tree
  ask every transformer: "what will you need to decide, later?"
  write one blob to the cache
                                   slow: seconds on a large course
                                   but nobody is waiting on it

TRANSFORM — every request, for every learner

  read that one blob
  run each transformer's filter over it, in memory
     visibility -> start dates -> prerequisites -> group access
  return what this learner may see
                                   fast: no content store touched
                                   at all`,
            caption: 'The two phases'
          },
          { p: 'The trick is what each transformer is allowed to do in each phase. A transformer that hides unreleased content <b>collects</b> the start date of every block into the blob. On a request it does no lookups at all — it compares dates already in memory. The rule is simple: anything that is the same for all learners is collected; only the per-learner decision runs on the request.' },
          { p: 'And every new rule is a new transformer. Adding "hide this until the previous drill is passed" means collecting one more piece of data and adding one more filter. The request path does not get slower by a database call; it gets slower by a comparison.' },
          {
            note: [
              'The cache is now a correctness surface, not just a speed one. If the collect job has not run since a publish, the outline can disagree with the progress page and the reports, and the learner sees the inconsistency before you do. Invalidate on publish, key by course version, and have a way to force a rebuild.',
              'Collect is slow on a large course. If it runs synchronously inside the publish request, publishing a big course times out.'
            ]
          },
          {
            bridge: [
              'This generalises to almost any expensive personalised read: a feed, a catalogue, a dashboard, a recommendation list.',
              'Ask what part of the answer is the same for everyone and what part is genuinely per user. Precompute the first when the underlying data changes, keep the second to arithmetic on data already in memory, and version the cache key by whatever the precomputation was built from.'
            ]
          }
        ],
        say:
          'The expensive part is walking the course tree and reading the content store; the per-learner part is just deciding what they may see. So the work is split. A collect phase runs in a background job once per published version, walks the tree, and writes everything every rule will need into a single cached structure. A transform phase runs on each request and filters that structure in memory — visibility, release dates, prerequisites, group access — without touching the content store at all. New rules arrive as new transformers, so the request path grows by a comparison rather than a query. The thing I would watch is that the cache becomes a correctness surface: if it is stale after a publish, the outline and the progress page disagree, so it has to be keyed by course version and rebuilt on publish, and the rebuild has to be asynchronous or publishing a large course times out.',
        traps: [
          'Caching the finished per-learner answer. One entry per learner per course, and useless the moment anything changes.',
          'Letting a transformer query the database during transform. That is the phase that has to stay cheap.',
          'Rebuilding the cache inside the publish request instead of on a worker.',
          'Treating a stale outline cache as slow rather than wrong. It shows learners content they should not see.'
        ]
      },
      {
        id: 'ox-grades',
        title: 'Compute it once, store the answer, recompute on a signal',
        tags: ['async', 'hot'],
        ask: 'A learner answers a problem. What has to happen before their progress page is right?',
        body: [
          { p: 'The naive version is to compute the grade whenever someone asks for it. That means, on every progress page load, finding every score, weighting each subsection, applying assignment-type weights and dropping the lowest few. It is correct and it does not survive contact with a real course, let alone a report over every learner in it.' },
          { p: 'So grades are computed when a score changes and <b>stored</b>. The read path becomes one row.' },
          {
            diagram: `learner submits an answer
      |
      v
score is written                     <- the source of truth
      |
      v
PROBLEM_WEIGHTED_SCORE_CHANGED       <- a Django signal, in process
      |
      v
Celery task on a worker              <- may be retried; may run twice
      |
      v
persistent subsection grade          <- RECOMPUTED from the scores,
      |                                 never incremented
      v
persistent course grade              <- weights the assignment types,
      |                                 drops the lowest N
      v
progress page reads one row          <- the read path never replays
                                        the course`,
            caption: 'From an answer to a number'
          },
          { p: 'Everything interesting is in the two lines about the worker.' },
          {
            list: [
              '<b>The task must be idempotent.</b> A queue that guarantees delivery will sometimes deliver twice, and a retry after a timeout may run alongside the attempt that did not actually fail. So the task recomputes the subsection from the scores it reads now. It never adds to the stored value. Run it five times and the answer is the same five times.',
              '<b>Ordering is not guaranteed.</b> Two answers a second apart can be processed out of order, and a task that recomputes from current state is immune to that too — whichever runs last reads the latest scores and is right.',
              '<b>The stored grade is a cache of a derivable value.</b> That is what makes it safe: it can always be thrown away and rebuilt. Anything that cannot be rebuilt from the scores has no business being only in that row.'
            ]
          },
          { p: 'One rule in the course grade explains why this cannot be an incremental sum. "Drop the lowest two assignments" can only be applied after every subsection grade is known — you do not know which are the lowest until you have them all. Whenever a grading rule looks at the whole set, incremental updating is off the table and recompute-from-source is the only correct shape.' },
          {
            note: [
              'Persisting a derived value creates a second thing that can be wrong. Store what it was derived from: the course version and when it was computed. That is what turns "this grade looks wrong" from an argument into a query.',
              'When a course team edits a graded problem mid-run, previously stored grades were computed against a version of the content that no longer applies. Someone has to decide whether to recompute, and that decision is a product decision, not a technical one. Being the person who raises it before launch is the point.'
            ]
          },
          {
            bridge: [
              'Any number a product shows constantly and computes expensively lands here: progress, streaks, win rates, leaderboards, credits remaining.',
              'The pattern is one shape — a signal on write, a background job that recomputes from the source of truth rather than incrementing, a stored answer stamped with what it was derived from, and a rebuild command you can run when it drifts. The last one is not optional. Every derived value drifts eventually, and the teams that cope are the ones that can rebuild without a migration.'
            ]
          }
        ],
        say:
          'Grades are computed on write and stored, because the read path is a progress page and staff reports over every learner, and replaying the course for each read does not scale. Submitting an answer writes a score and fires a signal, which enqueues a Celery task that recomputes the subsection grade and then the course grade, and the progress page then reads a single row. The important property is that the task recomputes from the scores rather than incrementing, which makes it idempotent under retries and immune to out-of-order delivery — both of which will happen. It also has to be a recompute because rules like dropping the lowest two assignments can only be applied once every subsection grade is known. And I would store the course version alongside the grade, because a derived value that cannot be traced back to what produced it is very hard to defend when someone disputes it.',
        traps: [
          'Incrementing the stored grade. A retried task then double-counts, and nothing tells you.',
          'Assuming tasks arrive in order. They do not, and a recompute is what makes that stop mattering.',
          'Storing a derived value with no record of what it was derived from, and no way to rebuild it.',
          'Trying to update a "drop the lowest two" rule incrementally. It needs the whole set.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'ox-seams',
    track: 'openedx',
    title: 'Where the services meet',
    kicker: 'Module 04',
    blurb:
      'The moment a product is more than one deployable, two questions arrive together: how does the user stay logged in across all of them, and how does one service find out that something happened in another. Open edX has been answering both for years, and its answers are unusually copyable.',
    concepts: [
      {
        id: 'ox-jwt',
        title: 'One login, several apps, two cookies',
        tags: ['security', 'hot'],
        ask: 'Your React app calls three different Django services. How does the user stay logged in across all of them?',
        body: [
          { p: 'A Django session cookie will not do it. A session is a row in one service\'s database, so a second service holding the cookie has nothing to look the user up in. The answer is a token that carries the user inside it, signed so anyone can verify it and nobody can forge it.' },
          { p: 'One service — the LMS — is the identity provider. On login it issues a JSON Web Token signed with a <b>private</b> key, using <code>RS512</code>. Every other service verifies it with the matching public key. No shared secret, no call back to the login service on every request, and a compromised downstream service cannot mint tokens because it never had the private key.' },
          { p: 'Then comes the part worth remembering, because it is a genuinely clever trade. The browser has two conflicting needs. The React app wants to read the username and roles without an extra round trip. And a token stolen by injected JavaScript is a full account takeover. Storing it in <code>localStorage</code> gives you the first and loses the second.' },
          { p: 'So the token is cut in half and set as two cookies.' },
          {
            diagram: `        header . payload  .  signature
        \\_______________/     \\_______/
                |                  |
                v                  v
  edx-jwt-cookie-header-payload   edx-jwt-cookie-signature
  readable by JavaScript          HttpOnly

  the React app reads the name    script that steals the readable
  and roles with no API call      half gets a token that will not
                                  verify anywhere

  on each request to an API, middleware joins the two cookies
  back into edx-jwt-cookie and verifies the whole thing`,
            caption: 'Readable, but not usable'
          },
          { p: 'The front end gets a claims object it can read for free. An attacker who scrapes what JavaScript can reach gets two thirds of a token, which authenticates nothing. The signature half is <code>HttpOnly</code>, so script cannot reach it, and <code>JwtAuthCookieMiddleware</code> reassembles the pair on the way into the API.' },
          { p: 'Two constraints come with the design, and naming them is what separates having read about JWTs from having shipped them.' },
          {
            list: [
              '<b>A cookie is capped around 4KB</b>, and this one travels on every request. Claims are a budget. Put a list of every permission in there and you will find the ceiling in production, on your largest account.',
              '<b>A self-contained token cannot be un-issued.</b> Nothing is looked up, so nothing can be revoked; the token is good until it expires. That is why these are short-lived and refreshed, and why "log out everywhere" is a real design problem rather than deleting a row.'
            ]
          },
          { p: 'Service-to-service calls are the other half of the story and use a different grant. There is no user at the keyboard, so a service authenticates as itself with its client credentials and gets its own token.' },
          {
            note: [
              'Trust the signature, not the payload. The readable cookie is readable — treat it as a hint for rendering, never as an authorisation decision. Every check that matters happens on the server, after verification.'
            ]
          },
          {
            bridge: [
              'The moment a product grows a second backend — a payments service, an analytics API, a coaching tool — this is the decision on the table.',
              'The copyable parts: asymmetric signing so only one service can mint tokens, a split cookie so the front end can read claims without holding a usable credential, short lifetimes because you cannot revoke, and a claims budget you decide on purpose.'
            ]
          }
        ],
        say:
          'Sessions do not cross services, so one service is the identity provider and issues an asymmetrically signed JWT — RS512 in Open edX — which every other service verifies with the public key, so no shared secret and no lookup per request. The neat part is how it reaches the browser: the token is split into two cookies, header-and-payload readable by JavaScript so the React app can read the user and roles without an extra call, and the signature HttpOnly so a script that scrapes what it can reach ends up with a token that will not verify. Middleware rejoins them on each API call. The two constraints I would raise are the cookie size limit, around 4KB on every request, so claims are a budget, and that a self-contained token cannot be revoked, so lifetimes stay short and logging out everywhere needs a real design. Service-to-service calls use client credentials instead, since there is no user involved.',
        traps: [
          'Putting the token in <code>localStorage</code>. Any injected script walks off with a working credential.',
          'Trusting the readable half. It is a rendering hint; authorisation happens after verification.',
          'Stuffing every permission into the claims and meeting the 4KB ceiling on your biggest account.',
          'Promising instant revocation from a token nothing looks up. Short lifetimes plus refresh, or a deny list you have actually built.'
        ]
      },
      {
        id: 'ox-eventbus',
        title: 'The same event, delivered two ways',
        tags: ['architecture'],
        ask: 'When do you move from a Django signal to a message broker, and what has to change?',
        body: [
          { p: 'An Open edX event starts life as a Django signal. It fires in the same process, receivers run in the same request, and if one of them throws, it happens inside the request that caused it. That is exactly what you want for work that belongs to the same service.' },
          { p: 'It stops being what you want the moment a <i>different</i> service needs to know. An in-process signal cannot reach across a network. Making the producer call the other service directly is worse: now enrolment fails when the analytics service is down, and the enrolment code has to learn the name of every consumer that will ever exist.' },
          { p: 'The interesting decision is what the platform did next. The event definition did not change. The <b>delivery</b> became configurable.' },
          {
            code: {
              lang: 'python',
              src: `EVENT_BUS_PRODUCER_CONFIG = {
    "org.openedx.learning.course.enrollment.started.v1": {
        "learning-enrollments": {"event_key_field": "enrollment.course.course_key",
                                 "enabled": True},
    },
}`
            }
          },
          { p: 'One receiver, shipped with the events library, listens to every Open edX event. It checks that configuration. If the event type is enabled for publishing, it serialises the event and hands it to a broker — Kafka or Redis Streams, behind the same producer interface. If it is not, nothing happens at all.' },
          {
            diagram: `                       one event definition
                                |
              +-----------------+-----------------+
              |                                   |
         in process                          over a broker
      (Django signal)                    (Kafka or Redis Streams)

  same service, same request         another service, another machine
  fails with the request             retried, replayed, buffered
  no infrastructure                  a broker to run and watch

  the producer's code is identical in both cases`,
            caption: 'One definition, two transports'
          },
          { p: 'That is the migration path a monolith actually needs. You do not rewrite the producer to extract a service. You publish the event you were already firing, build the consumer somewhere else, and the code that fires it never learns that anything changed.' },
          { p: 'The event type carries a version — <code>.v1</code> again — because once it crosses a network it is a published schema owned by strangers. In-process, a signal signature change is a refactor caught by tests. Across a broker, it is a breaking change to someone whose deploy schedule you do not control.' },
          {
            note: [
              'A broker is real operational weight: a cluster, consumer lag to watch, poison messages, replay. Do not take it on for work that could be a Celery task in the same service.',
              'Consumers must expect the same message twice. Brokers deliver at least once, so a consumer that is not idempotent will double-count something and you will find out from a number that looks wrong.'
            ]
          },
          {
            bridge: [
              'The reusable idea is separating what an event <i>is</i> from how it gets delivered. Define the event once, with a version, and let configuration decide whether it stays in process or goes on a broker.',
              'That is what lets a monolith grow a second service without a rewrite — and it means the decision to introduce a broker can be made later, per event, when the pain is real rather than anticipated.'
            ]
          }
        ],
        say:
          'They start as the same thing. An Open edX event is a Django signal with a versioned type, and by default receivers run in process, in the same request. When another service needs it, the definition does not change — a receiver that ships with the events library checks EVENT_BUS_PRODUCER_CONFIG and, if that event type is enabled, serialises it onto a broker behind a common producer interface, so Kafka and Redis Streams are interchangeable. So the producer code is identical either way, which makes it a real path out of a monolith: publish the event you already fire, build the consumer elsewhere, and the calling code never learns. Two things I would insist on: the type is versioned because across a network it is a schema owned by people whose deploys I do not control, and consumers must be idempotent because brokers deliver at least once.',
        traps: [
          'Calling the other service directly from the producer. Now their outage is your outage.',
          'Reaching for a broker when a Celery task in the same service would do. You have bought a cluster to operate.',
          'Assuming exactly-once delivery. Plan for the duplicate, or a counter somewhere will be wrong.',
          'Changing the shape of an event without a new version once it is on a broker. That is a breaking change to strangers.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'ox-change',
    track: 'openedx',
    title: 'Changing a system that cannot stop',
    kicker: 'Module 05',
    blurb:
      'A learner is mid-exam somewhere at every hour of the day. That single fact rules out the big-bang release and the big-bang rewrite, and it is what the last two mechanisms exist to work around.',
    concepts: [
      {
        id: 'ox-toggles',
        title: 'Every risky change is born behind a flag, and the flag has a death date',
        tags: ['delivery', 'hot'],
        ask: 'How do you ship a change to a platform where a bad release interrupts a live exam?',
        body: [
          { p: 'You separate deploying from releasing. The code ships turned off, you turn it on for a small group, you watch, you widen it. If it is wrong, you turn it off — no rollback, no redeploy, no waiting for a pipeline while learners are stuck.' },
          { p: 'Everyone knows that much. Two things beyond it are what an interviewer is listening for.' },
          { p: '<b>The first is choosing the right kind of toggle.</b> Not every switch has the same lifetime or the same audience, and putting them all in one mechanism is how a codebase gets a settings file nobody dares touch.' },
          {
            code: {
              lang: 'text',
              src: `SettingToggle       a Django setting. Needs a deploy to change.
                    For things an operator decides once.

WaffleSwitch        a database row. On or off, everyone, instantly.
                    The kill switch you reach for at 2am.

WaffleFlag          a database row, but per user, or a percentage.
                    The staged rollout: 1%, then 10%, then all.

CourseWaffleFlag    a flag that can also be forced on or off for
                    one course, or one organisation.
                    Opt in during rollout; opt out afterwards.`
            }
          },
          { p: '<code>CourseWaffleFlag</code> is the one worth dwelling on, because it is the shape most products eventually need and few build deliberately. A course-level setting beats an organisation-level setting, which beats the global default. Early in a rollout that means "on for these three courses only". Late in a rollout, after the flag has flipped to on by default, the same mechanism means "off for this one customer who is not ready". Same object, opposite jobs, no new code in between.' },
          { p: '<b>The second is that the flag is documented in the code, with a date it should be gone.</b> Every toggle in the platform carries an annotation block right above it:' },
          {
            code: {
              lang: 'python',
              src: `# .. toggle_name: drills.enable_new_scoring
# .. toggle_implementation: CourseWaffleFlag
# .. toggle_default: False
# .. toggle_description: Uses the recomputed scoring path for hand drills.
#   Falls back to the old path when off.
# .. toggle_use_cases: temporary
# .. toggle_creation_date: 2026-03-02
# .. toggle_target_removal_date: 2026-06-01
# .. toggle_tickets: DRILL-412
ENABLE_NEW_SCORING = CourseWaffleFlag("drills.enable_new_scoring", __name__)`
            }
          },
          { p: 'The line that does the work is <code>toggle_target_removal_date</code>. A flag is a permanent branch in your code — two paths, both of which must keep working, and every future change has to be correct in both. A hundred forgotten flags is not a hundred switches; it is a codebase where nobody can reason about what actually runs in production.' },
          { p: 'Naming the removal date when you create the flag is how you make cleanup somebody\'s job instead of nobody\'s. And a flag that is meant to live forever — an operator choice, a kill switch — is declared as such, so it is not mistaken for debt.' },
          {
            note: [
              'A flag is a promise that both paths work. The moment the old path stops being tested, the flag has stopped being a safety net and become a trap: turning it off will not save you, because nobody has run that code in months.',
              'Nested flags multiply. Two flags are four states, and only one of them is the one you tested.'
            ]
          },
          {
            bridge: [
              'The toggle is the easy half; the discipline around it is the half that shows experience.',
              'One flag per risky change, chosen for the lifetime it actually has, with an owner and a removal date written next to it — and an audit that lists the expired ones. That is a habit you can bring on your first week, and it is visible in every diff you write afterwards.'
            ]
          }
        ],
        say:
          'By separating deploy from release. The change ships behind a toggle, defaulted off, and I widen it gradually. Open edX has a family of them and picking the right one matters: a setting for operator choices, a switch for a global kill switch, a flag for percentage or per-user rollout, and a course waffle flag that can be forced on or off for a single course or organisation — which is opt-in early in a rollout and opt-out later, from the same object. The part I care most about is that every toggle is annotated in code with its type, default, use case and a target removal date, because a flag is a permanent branch that both paths must keep passing, and a hundred forgotten flags means nobody can say what actually runs in production. So I name the removal date when I create the flag, or declare it as one that is meant to live forever.',
        traps: [
          'A "temporary" flag with no removal date. That is how a codebase ends up with branches nobody understands.',
          'Letting the old path rot. An untested fallback is not a safety net.',
          'Reaching for a per-user flag when a single global switch was the requirement, and inheriting the complexity for free.',
          'Nesting flags. Two flags are four states and you tested one.'
        ]
      },
      {
        id: 'ox-mfe',
        title: 'Replace the front end one page at a time',
        tags: ['delivery'],
        ask: 'You have a large server-rendered Django UI and you want React. What is the plan?',
        body: [
          { p: 'The plan is explicitly not a rewrite. Open edX has been moving off Django templates for years, one page at a time, while the site stayed up the entire while.' },
          { p: 'The unit of migration is a route. A <b>micro-frontend</b> is a standalone React application that owns one area of the product — the course view, the profile, the authoring tool for libraries. It is deployed on its own and it is the only thing that changed. Every other URL is still served by the Django templates that have worked for a decade.' },
          {
            diagram: `            /courses/*        -> React app  (migrated)
            /profile/*        -> React app  (migrated)
            /everything/else  -> Django templates  (not yet, maybe never)

  routing decides who serves the page
  one shared JWT cookie means the user never notices the boundary
  a shared component library means it does not look like two products`,
            caption: 'Strangle it, do not rewrite it'
          },
          { p: 'Two things have to be true for this to feel like one product rather than two. The user must stay logged in across the boundary, which is what the split JWT cookie is for — the React app reads the user from a cookie the Django side already set. And the two halves must share a design system, or the seam is visible on every page and users lose trust in the half that looks unfamiliar.' },
          { p: 'The second half of the story is what happens when someone wants to <i>change</i> one of those React apps, and it is the same lesson as the first module. Forking a micro-frontend has the identical cost as forking the platform: you own the merge forever, and these apps change often.' },
          { p: 'So they have their own seams. A <b>plugin slot</b> is a named region of a page that an operator can modify, replace or add to, from a configuration file, without touching the app\'s source:' },
          {
            code: {
              lang: 'jsx',
              src: `// env.config.jsx — configuration, not a fork

const config = {
  pluginSlots: {
    course_unit_footer_slot: {
      plugins: [
        {
          op: 'insert',
          widget: { id: 'drill_hint', type: 'direct', RenderWidget: DrillHint },
        },
      ],
    },
  },
};`
            }
          },
          { p: 'And the colours, logos and type come from design tokens applied at run time, so branding a site does not mean rebuilding an application. Between the two, most of what teams used to fork an app for is now configuration.' },
          {
            note: [
              'A strangler migration is only over when the old page is deleted. Two implementations of the same screen is worse than either one alone, because every change now has to be made twice, and eventually one of them is forgotten.',
              'Pick the first route carefully. Something real enough to prove the approach, small enough that being wrong is cheap. The login page and the checkout are both the wrong place to learn.'
            ]
          },
          {
            bridge: [
              'This is the answer to "we should rewrite the front end", and it is worth having ready, because that sentence gets said at every product with a few years on it.',
              'Route by route, shared auth so the seam is invisible, one design system so it looks like one product, and the old page deleted as each new one lands. Slower to describe than a rewrite, and it is the version that ships.'
            ]
          }
        ],
        say:
          'One route at a time, never a big-bang rewrite. Each micro-frontend is a standalone React app that owns one area — the courseware, the profile — deployed independently, while the Django templates keep serving everything else. Two things make the seam invisible: the shared JWT cookie, so the user stays logged in when routing hands them from one to the other, and a shared design system so it does not look like two products. And when someone wants to customise one of those apps, forking it costs exactly what forking the platform costs, so they use plugin slots — named regions you modify, replace or add to from a config file — and design tokens applied at run time for branding. The discipline is deleting the old page as each new one lands, because two implementations of one screen is worse than either.',
        traps: [
          'The big-bang rewrite. It is always eighteen months and the old system keeps shipping features you have to catch up on.',
          'Leaving the old page in place "just in case". Now every change is made twice.',
          'Forking a micro-frontend for a colour change, when tokens and slots exist.',
          'Two design systems either side of the boundary, so the migration looks like a downgrade to the user.'
        ]
      }
    ]
  });
})(window.PREP);
