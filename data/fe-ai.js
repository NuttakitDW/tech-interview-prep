/* Front-end AI track — working with coding agents without losing the codebase.
   Source: "Top 15 Frontend Interview Questions for 2026" (YouTube AMerB8XjfZ0,
   theSeniorDev). Questions 2, 3, 4 and 5 of the fifteen.

   These four are the reason the video exists, and they are the ones with the
   least settled ground truth — there is no spec for "how should a senior use a
   coding agent". So the cards stay close to what is actually checkable: the
   failure modes are ones you can reproduce, the tools named are ones you can
   install, and the numbers are labelled as the judgement calls they are rather
   than dressed up as standards.

   One correction of substance: the video presents a coverage floor and ceiling
   as the senior answer. Coverage measures execution, not assertion, and an
   agent will happily generate tests that execute everything and assert almost
   nothing. That is on the testing card, because it inverts the advice. */
(function (P) {
  P.modules.push({
    id: 'fe-ai',
    track: 'frontend-senior',
    title: 'Engineering with AI',
    kicker: 'Module 04',
    blurb:
      'The interviewer is not checking whether you use a coding agent — everyone does. They are checking whether you have a system around it, because the failure mode of an unsupervised agent is not broken code. It is code that works, reviews clean, and quietly duplicates your state in four places.',
    concepts: [
      {
        id: 'fe-ai-workflow',
        title: 'Constrain first, generate second',
        tags: ['ai', 'hot'],
        ask: 'What is your AI workflow for front-end engineering, beyond just asking Claude Code?',
        watch: 206,
        body: [
          { p: 'The weak answer names tools. The strong answer describes the constraints you put in place <b>before</b> generating anything, because that is the only point at which you get to decide what the output looks like.' },
          { p: 'The reason is worth stating out loud, because it explains every failure below it. These models are trained and tuned to make a single prompt produce something that looks right. That is what makes them extraordinary at demos. It is also why they optimise locally: the fastest route to a component that looks correct is to inline the colour, duplicate the helper, and hold a second copy of the state next to the first. Nothing in the objective rewards fitting into a codebase it can only partly see.' },
          { p: 'So the workflow is four things.' },
          { p: '<b>One. Plan before generating, with the design system in context.</b> Have the agent produce a plan that names the existing components and tokens it will use. Reviewing a plan costs a minute; reviewing the diff after it has invented a second button component costs an afternoon. A design-to-code MCP server — Figma\'s, for instance — gives it the actual design as the source of truth instead of an inferred one.' },
          { p: '<b>Two. State the structural constraints explicitly</b>, because they are the ones the model will otherwise break:' },
          {
            list: [
              '<b>One source of truth per piece of data.</b> The most expensive habit an agent has is duplicating state — a copy in a parent, a derived copy in a child, a third in a context. It works on the day it is written and produces desynchronisation bugs for a year afterwards.',
              '<b>Design tokens, never literals.</b> Given a colour, the model will hardcode the hex. Given a size, it will write <code>font-size: 11px</code> rather than the scale step, even in a Tailwind project where <code>text-xs</code> was right there.',
              '<b>Relative units.</b> Same failure, and the one that shows up as a broken mobile layout a week later.',
              '<b>Program to interfaces.</b> Fix the prop shapes and the state shape yourself. Given clear boundaries the model executes inside them well; left to choose them, it chooses whatever suits the current file.'
            ]
          },
          { p: 'That last one is the highest-leverage item on the list. The shape of the data dictates the quality of everything built on it, and it is the one decision that is expensive to reverse later.' },
          { p: '<b>Three. Encode the constraints as checks, not as prose.</b> A rule in a prompt is a suggestion; a rule in the linter is enforced on every run whether anyone remembered it or not. Anything you would say twice in review belongs in configuration.' },
          { p: '<b>Four. Triage the review by blast radius.</b> An AI pull request is too large to read evenly, so do not try. Sort by what a mistake would cost:' },
          {
            diagram: `read line by line
      ▲     ┌──────────────────────────────────────────────┐
      │     │  package.json — a new dependency             │  supply chain,
      │     │  build / bundler / framework config          │  bundle size,
      │     │  lint, tsconfig, test setup                  │  every file
      │     │  auth, money, anything with a permission     │
      │     ├──────────────────────────────────────────────┤
      │     │  shared components, hooks, state, API layer  │  many callers
      │     ├──────────────────────────────────────────────┤
      │     │  one leaf component, its styles, its test    │  itself
      ▼     └──────────────────────────────────────────────┘
    skim

  A new dependency is the highest-value thing in the diff to read.
  A slightly clumsy leaf component is a rounding error.`,
            caption: 'Where to spend the review'
          },
          { p: 'A quietly added dependency is the clearest example. It is one line in a diff of ninety files, it costs bundle size on every page, it carries whatever its own dependencies carry, and no reviewer skimming component code will notice it. Reading that line is worth more than reading the other eighty-nine files.' },
          {
            note: [
              '<b>Do not claim your review is exhaustive.</b> Nobody reads a 4,000-line diff properly, and an interviewer who has tried will know it. Saying "I read the config and dependency changes closely and skim the leaf components, because that is where the blast radius is" is a defensible position. "I review everything carefully" is not, and invites exactly the follow-up you do not want.',
              '<b>The tests are part of the diff.</b> An agent that cannot make a test pass will sometimes change the test. A weakened assertion is invisible in a coverage report and looks like a green build.'
            ]
          }
        ],
        say:
          'The workflow is mostly what happens before generation. I plan first, with the design system in context — a Figma MCP or the token file — so the plan names the components and tokens it will reuse rather than inventing new ones, and reviewing a plan is much cheaper than reviewing the diff. Then I state the structural constraints explicitly, because those are the ones the model breaks: one source of truth per piece of data, since duplicated state is its most expensive habit; design tokens instead of hardcoded hex values and pixel sizes; relative units; and fixed prop and state shapes, because the data shape dictates the quality of everything above it. Anything I would say twice in review I move into the linter, since a rule in a prompt is a suggestion and a rule in CI is enforced. And I triage review by blast radius rather than reading evenly — dependencies, build and lint config, and anything touching auth get read line by line, shared components get read, leaf components get skimmed. A new dependency is one line in a huge diff and it is the line most worth reading.',
        traps: [
          'Listing tools. "Claude Code, Copilot, Cursor" answers a different question — the one about what you have installed, not what you do.',
          'Claiming you review the whole diff carefully. On AI-sized pull requests this is not credible, and it replaces a real strategy with a claim nobody can hold.',
          'Only describing what happens after generation. The constraints are the answer; the review is the backstop.',
          'Not naming duplicated state as the characteristic failure. It is the one that survives review, passes tests, and costs the most later.',
          'Leaving the rules in a prompt file. Prompts drift and get skipped. Lint rules, type errors and CI checks do not.'
        ]
      },
      {
        id: 'fe-quality',
        title: 'Static checks first, because they are deterministic and nearly free',
        tags: ['ai', 'tooling'],
        ask: 'How do you keep front-end code quality high when working with AI?',
        watch: 457,
        body: [
          { p: 'Split the answer before you start giving it. This is the move that makes the response sound structured rather than like a list of things you have heard of.' },
          {
            diagram: `                        code quality
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
      STATIC                                DYNAMIC
   the code is not run                   the code is run
          │                                     │
   types                                  unit tests
   linting                                integration tests
   duplication analysis                   end-to-end tests
   complexity, file length
   dead-code detection
          │                                     │
   deterministic, seconds,               catches behaviour
   same answer every time                nothing static can see`,
            caption: 'Two categories, and they catch different things'
          },
          { p: 'Lead with static, for a reason you should say: it is <b>deterministic and cheap</b>. It gives the same answer every run, in seconds, at no marginal cost. Asking a model to review the diff costs tokens and time and gives a slightly different answer each time. Use the deterministic checks for everything they can cover, and save judgement for what is left.' },
          { p: 'In the order I would add them to a project:' },
          {
            list: [
              '<b>TypeScript.</b> The highest-value single addition, and it is the same thing as "program to interfaces" from the previous card — it makes the boundaries the agent must respect machine-checkable. Set <code>strict</code>; a codebase full of <code>any</code> is a type checker that has been asked not to check.',
              '<b>A linter</b> — ESLint with typescript-eslint, or Oxlint if the run time matters. Not for formatting, which a formatter handles, but for the rules you would otherwise repeat in review.',
              '<b>Duplication analysis.</b> This is the one aimed squarely at how models fail. <code>jscpd</code> reports how much of the codebase is copy-paste. An agent that cannot see the whole repository re-implements what already exists, and no single diff ever looks wrong.',
              '<b>Complexity and size limits.</b> ESLint\'s <code>complexity</code> and <code>max-lines</code> rules. Generated components sprawl — one file holding a component, three subcomponents, its data fetching and its formatting helpers.',
              '<b>Dead-code detection</b> — <code>knip</code> or similar, for the exports and dependencies nobody removed after the third rewrite.'
            ]
          },
          { p: 'The last two matter more than they used to, because <b>the characteristic AI failure is not incorrect code — it is code that works and is shaped badly</b>. It compiles, it passes the linter, it renders correctly, and there are four copies of it.' },
          {
            note: [
              '<b>Every one of these checks can pass on a 900-line component.</b> There is no rule that fires for "this file does too many things", so a well-typed, lint-clean, fully-covered file can still be the worst thing in the repository.',
              'Which is why <code>max-lines</code> earns its place — not because line count is quality, but because it is a cheap proxy for a file that has stopped having one job, and it is a proxy that fires automatically.',
              'The useful next move is to try to unit test it. Anything that is hard to test in isolation is telling you where the seams should have been, and that gives you a concrete refactor rather than a vague sense that the file is too big.'
            ]
          },
          {
            bridge: [
              'Worth having the second-order answer ready, because good interviewers ask it: what do you do about the things static analysis structurally cannot see?',
              'It cannot tell you the abstraction is wrong, that a component took on a responsibility that belongs elsewhere, or that a name is misleading. Those need a human, and human attention is the scarce resource — which is the argument for automating everything else. Every rule you encode is review time you get back for the judgement calls.',
              'It is also the honest limit of the whole approach, and saying so is stronger than implying tooling closes the gap.'
            ]
          }
        ],
        say:
          'I would split it into static and dynamic first, because they catch different things. Static does not run the code — types, linting, duplication analysis, complexity and file-length limits, dead-code detection. Dynamic runs it, and that is the test suite. I lead with static because it is deterministic and nearly free: same answer every run, in seconds, where an LLM review costs tokens and varies. Order I would add them: TypeScript in strict mode first, since it makes the boundaries machine-checkable; then a linter for the rules I would otherwise repeat in review; then duplication analysis with something like jscpd, because that is aimed at exactly how models fail — an agent that cannot see the whole repo re-implements what exists, and no individual diff looks wrong; then complexity and max-lines, because generated components sprawl into one file doing five jobs. The thing I would be honest about is that all of those pass on a 900-line component. Static analysis cannot tell you an abstraction is wrong. That still needs a person, which is the argument for automating everything that does not.',
        traps: [
          'Answering "we use TypeScript and ESLint" with no structure. The split into static and dynamic is most of what is being marked.',
          'Not saying <i>why</i> static comes first. Deterministic, fast and free versus probabilistic, slow and metered is the actual argument.',
          'Missing duplication analysis. It is the check that maps directly onto how coding agents fail, and almost nobody mentions it.',
          'Claiming the tooling covers it. Every check listed passes on a bloated file with a wrong abstraction, and admitting that is stronger than pretending otherwise.',
          'Confusing a formatter with a linter. Prettier settles style arguments; the linter is for rules with consequences.'
        ]
      },
      {
        id: 'fe-testing',
        title: 'Coverage measures execution, not assertion',
        tags: ['ai', 'testing'],
        ask: 'AI can now generate hundreds of lines of code and enormous pull requests. What is your approach to front-end testing?',
        watch: 657,
        body: [
          { p: 'Three types, and be ready to say what each is for:' },
          {
            list: [
              '<b>Unit</b> — one function, hook or component in isolation. Fast, and precise about <i>where</i> something broke.',
              '<b>Integration</b> — several pieces together, typically a component tree with its state and a mocked network. In the front end the line between this and a unit test is genuinely blurry, and it is fine to say so.',
              '<b>End-to-end</b> — a real browser driving the real application. Slow, flaky, and the only thing that proves the product actually works.'
            ]
          },
          { p: 'Then the two ideas that make it a senior answer rather than a definition.' },
          { p: '<b>The pyramid, and the inversion people are talking themselves into.</b> Many unit tests, fewer integration tests, few end-to-end tests. The argument for it has changed shape now that generation is cheap, and the new argument is better than the old one.' },
          {
            diagram: `        ╱╲          end-to-end
       ╱  ╲         proves it works
      ╱────╲        slow, flaky, says WHAT broke
     ╱      ╲
    ╱        ╲      integration
   ╱──────────╲     components + state together
  ╱            ╲
 ╱              ╲   unit
╱────────────────╲  fast, precise, says WHERE it broke


The tempting inversion:  "AI writes the code, so I only need
end-to-end tests — if they pass, everything in between is fine."

It does pass. And when it fails, the report is
"checkout is broken" across a codebase you did not write.
Now you are bisecting by hand, or paying an agent to.

Unit tests are not there to prove it works.
They are there to tell you where it stopped working.`,
            caption: 'Why the pyramid survives cheap generation'
          },
          { p: 'That is the whole case, and it lands better than "best practice" ever did. End-to-end tells you <i>that</i> something broke. Unit tests tell you <i>where</i>. In a codebase you largely did not write, the second is worth more, because your own knowledge of the code is no longer available as a substitute.' },
          { p: '<b>Coverage, and what it does not measure.</b> A number in the sixties to eighties is a reasonable working range: below it there are whole paths nobody exercises, and above it you tend to be testing framework behaviour and rewriting tests every refactor.' },
          { p: 'But state the limit plainly, because this is where the AI-specific risk actually is:' },
          {
            code: {
              lang: 'js',
              src: `// 100% coverage of formatPrice. Zero confidence in it.
it('renders', () => {
  render(<Price value={12.5} />);
  expect(screen.getByTestId('price')).toBeInTheDocument();
});
// Every line ran. Nothing about the output was checked.
// Ship formatPrice returning "NaN" and this test still passes.`
            }
          },
          { p: '<b>Coverage counts lines that executed, not claims that were checked.</b> A generated suite reliably reaches a high number, because executing code is easy and asserting the right thing is the hard part. So a coverage figure produced by tests nobody read is not evidence of anything — which inverts the usual advice: the number is a floor to catch untested areas, never a target to optimise toward.' },
          { p: 'What to check instead, on any test you did not write: does it assert on <b>output</b> rather than on existence, and does it fail when you break the thing on purpose? Mutating the implementation and watching the suite stay green takes a minute and tells you what the percentage cannot.' },
          { p: '<b>The AAA structure</b> is the one convention worth enforcing on generated tests, because it makes them skimmable at speed:' },
          {
            code: {
              lang: 'js',
              src: `it('disables submit until the form is valid', async () => {
  // Arrange — set up state, mocks, test doubles
  render(<CheckoutForm />);

  // Act — do the one thing under test
  await user.type(screen.getByLabelText('Email'), 'not-an-email');

  // Assert — check the observable result
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});`
            }
          },
          { p: 'One behaviour per test, and the assertion at the bottom where you can find it. When you are reviewing forty generated tests, being able to read only the Assert block and know whether the test is worth anything is the whole point.' },
          {
            note: [
              '<b>Test behaviour, not implementation.</b> A test that reaches for internal state or a specific hook breaks on every refactor and passes when the user-visible behaviour is broken. Query the way a user finds things — by role, by label — and the test survives the rewrite and fails for real reasons.',
              '<b>The other thing to watch in an AI pull request is a weakened assertion.</b> An agent that cannot make a test pass will sometimes adjust the test until it does. Coverage stays flat, CI goes green, and the guarantee is gone. Changes to existing test files deserve more attention than new ones.'
            ]
          }
        ],
        say:
          'Three types — unit for one piece in isolation, integration for a component tree with its state, end-to-end in a real browser, and in the front end the unit-integration line is genuinely blurry. The two things I would actually argue are the pyramid and coverage. The pyramid matters more now, not less: the tempting move is to say AI writes the code so only end-to-end tests are needed, and they do pass, but when one fails the report is "checkout is broken" across a codebase I did not write, and I am bisecting by hand or paying an agent to. Unit tests are not there to prove it works, they are there to tell me where it stopped working, and that is worth more when I do not already know the code. On coverage, I would aim somewhere in the sixties to eighties, but the important part is that coverage counts lines that executed, not assertions that were checked. A generated test can render a component, assert it exists, and hit every line while checking nothing — so I treat the number as a floor for finding untested areas, never a target. The real check is breaking something on purpose and seeing whether the suite goes red. And I enforce arrange-act-assert, because when I am reading forty generated tests I want to find the assertion immediately.',
        traps: [
          'Listing the three test types and stopping. That is the junior half of the answer.',
          'Treating a coverage percentage as a quality measure. It measures execution. A suite that asserts nothing can reach any number you like.',
          'Arguing for the pyramid on "best practice" grounds. The debugging-cost argument is concrete and it is the one that has got stronger, not weaker, with generated code.',
          'Not spotting that AI-written tests are the risk. They are generated by the same process that wrote the bug, and they are read less carefully than the code.',
          'Writing tests against internal state or a specific hook. They break on refactors and pass while the feature is broken.',
          'Ignoring edits to existing tests in review. A quietly relaxed assertion is invisible in every metric you have.'
        ]
      },
      {
        id: 'fe-tokens',
        title: 'Fewer changes per feature is the whole optimisation',
        tags: ['ai', 'architecture'],
        ask: 'How do you keep your token spend low in front-end engineering?',
        watch: 827,
        body: [
          { p: 'The framing that makes this a good answer: the way you reduce token spend is the same way you have always reduced the cost of change. <b>Fewer files touched per feature</b> — which is what modularity, decoupling and reuse were always for. Nothing here is new engineering advice; the bill just got itemised.' },
          { p: 'Cost has two sides and they behave differently:' },
          {
            diagram: `INPUT  — everything the model reads
         the files it opened, the conversation so far, your rules
         cheaper per token, and usually the larger number
         cacheable: a stable prefix costs a fraction on re-read

OUTPUT — everything the model writes
         the diff, the explanation, the reasoning
         several times the price of input

Spend falls when the FEATURE gets smaller, not when the prompt does.`,
            caption: 'Where the cost actually sits'
          },
          { p: 'Which is why prompt golf is the wrong lever. Instructing the model to be terse trims output tokens on the margin; a codebase where a new feature means composing four existing components instead of writing four new ones changes both sides of the bill at once.' },
          { p: 'The things that actually move it:' },
          {
            list: [
              '<b>A design system.</b> A new screen becomes composition — existing components, existing tokens — rather than fresh CSS. Less to read, far less to write, and the output is more consistent as a side effect.',
              '<b>Atomic CSS and design tokens.</b> Styling becomes class names from a fixed vocabulary rather than invented declarations.',
              '<b>Clear module boundaries.</b> This is the input-side lever. If a feature lives behind a defined interface, the agent reads that slice; if everything reaches into everything, it reads far more to establish what is safe to change.',
              '<b>Types and lint rules.</b> Both are corrections that cost nothing at runtime. A type error caught by <code>tsc</code> is free; the same error found by asking a model to review the diff is not.',
              '<b>Small, reviewable pull requests.</b> A failed 4,000-line attempt is expensive twice — once to generate and once to re-do.'
            ]
          },
          { p: 'On architecture, the honest version: <b>micro-frontends do reduce the context a change requires</b>, because each one can be worked on without the rest of the system in view. But they are a team-scale solution, not a token-spend solution. They cost you runtime performance, duplicated dependencies across bundles, harder end-to-end testing and real operational overhead. Splitting a monolith to save tokens would be paying in the wrong currency.' },
          { p: 'Say it that way round. The defensible answer is that micro-frontends make sense when many teams contend over one codebase, and that lower context cost is a genuine benefit you get on top — not the reason.' },
          {
            note: [
              '<b>The pricing model is not stable, and it is worth saying so.</b> Today most of this is billed per token, and much of it is subsidised. The plausible direction is billing that tracks compute rather than tokens.',
              'Which barely changes the answer, and that is the point worth making: whether you are charged per token or per second of GPU time, the way to spend less is to need less work done. Architecture that minimises the size of a change is the hedge that survives the pricing model changing.',
              '<b>One cheap, concrete lever:</b> keep the stable part of the context stable. Rules files, architecture notes and interface definitions that do not change between runs are cacheable, and cached input is billed at a fraction of the normal rate. Reordering so the volatile part comes last is close to free and measurably reduces the bill.'
            ]
          }
        ],
        say:
          'The lever is the size of the change, not the size of the prompt. Input tokens are everything the model reads and output is what it writes, output costs several times more, and a stable prefix caches cheaply — but telling the model to be terse only trims the margin. What actually moves it is a codebase where a feature means composing what exists instead of writing new code: a design system and design tokens so a new screen is composition rather than fresh CSS, clear module boundaries so the agent reads one slice instead of establishing what is safe to change across the repo, and types and lint rules so corrections are caught for free instead of by spending tokens on a review. Which is just modularity and decoupling — the bill got itemised, the advice did not change. On micro-frontends I would be careful: they genuinely reduce the context a change needs, but they cost runtime performance, duplicated dependencies and operational overhead, so I would only split for team-scale reasons and treat the lower context cost as a bonus. And I would expect billing to move toward compute rather than tokens eventually, which does not change any of this — needing less work done is the hedge either way.',
        traps: [
          'Making it about prompt wording. Terser prompts are a rounding error next to a feature that touches four files instead of forty.',
          'Not separating input from output. They have different prices and different levers, and input caching is a real, cheap win.',
          'Proposing micro-frontends as a token optimisation. It inverts the reasoning — they are a team-scale decision with real costs, and the context saving is a side effect.',
          'Missing that this is ordinary architecture. Saying so is the strongest part of the answer; it shows the principle rather than a trick.',
          'Being certain about pricing. It is moving. Tie the answer to needing less work done and it survives the change.'
        ]
      }
    ]
  });
})(window.PREP);
