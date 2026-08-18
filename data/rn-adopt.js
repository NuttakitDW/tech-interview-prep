/* React Native New Architecture — the adoption half.
   Source: "React Native New Architecture: Fabric & Expo 2026" (PkgPulse,
   9 March 2026). Sections: Expo SDK 52, the interop layer, package
   compatibility, migration strategy, performance benchmarks.

   Two corrections here, both checked against React Native's own working
   group docs and linked on the cards:

     - The article shows `unstable_enableNewArchInterop: true` in
       react-native.config.js. That option does not exist. The real key
       was `unstable_reactLegacyComponentNames`, and since 0.74 the
       interop layer is automatic and that key should be deleted.
     - The benchmark table is presented as measurement. It is community
       -sourced, single-device, and its headline row compares two
       different operations. The card keeps the numbers and labels them. */
(function (P) {
  P.modules.push({
    id: 'rn-adopt',
    track: 'rn-newarch',
    title: 'Turning it on',
    kicker: 'Module 04',
    blurb:
      'On a new project this is one line, already written for you. On an existing app the flag is the easy part — what decides the timeline is your native dependency list, and how much of it the compatibility shim can carry.',
    concepts: [
      {
        id: 'rn-enable',
        title: 'One flag, and how to prove it took',
        tags: ['expo', 'tooling'],
        ask: 'How do you enable the New Architecture, and how do you confirm it is actually running?',
        read: 'expo-sdk-52-new-architecture-by-default',
        body: [
          { p: 'First, the thing that makes half of this question moot: <b>it has been the default since React Native 0.76 and Expo SDK 52</b>, both from November 2024. On a project started since then it is already on, and the interesting question is not how to enable it but how to tell.' },
          { p: 'On an existing project, one setting per platform:' },
          {
            code: {
              lang: 'ts',
              src: `// Expo — app.json
{
  "expo": {
    "newArchEnabled": true
  }
}`
            }
          },
          {
            code: {
              lang: 'text',
              src: `# Bare React Native — android/gradle.properties
newArchEnabled=true

# Bare React Native — ios/Podfile
ENV['RCT_NEW_ARCH_ENABLED'] = '1'`
            }
          },
          { p: 'In a managed Expo workflow that really is the whole change — the C++ build, the Hermes configuration and the module linking are handled for you. In a bare project you own those steps, which is most of why the same migration is a different size of job in the two setups.' },
          { p: 'Then verify, because a config flag that silently did not apply is a bad thing to discover in production. Two globals tell you directly:' },
          {
            code: {
              lang: 'js',
              src: `const isFabric = global.nativeFabricUIManager != null;
const isTurbo  = global.__turboModuleProxy != null;

console.log({ isFabric, isTurbo });`
            }
          },
          { p: 'And before you ship, let the tooling audit the dependency list for you:' },
          {
            code: {
              lang: 'text',
              src: `npx expo-doctor

# ✓ All 47 packages are compatible with Expo SDK 52
# ⚠ react-native-camera: not compatible with New Architecture
# ⚠ react-native-action-sheet: partial support`
            }
          },
          {
            note: [
              '<b>Check both globals, not one.</b> Fabric and TurboModules are separate switches internally, and a half-applied configuration is a real state — particularly in a bare project where the Android and iOS settings are edited in different files and it is easy to do one and forget the other.',
              'A build where <code>isFabric</code> is true and <code>isTurbo</code> is false is not a mystery, it is a missed line in a Podfile.'
            ]
          }
        ],
        say:
          'Since React Native 0.76 and Expo SDK 52, both from November 2024, it is the default — so on a new project it is already on. On an existing project it is newArchEnabled in app.json for Expo, or newArchEnabled in gradle.properties plus RCT_NEW_ARCH_ENABLED in the Podfile for bare. In managed Expo that is genuinely the whole change, because the C++ build, Hermes config and module linking are handled; in a bare project you own those, which is why the same migration is a different size of job. Then I would verify at runtime rather than trust the flag: global.nativeFabricUIManager and global.__turboModuleProxy both being non-null. I check both, because they are separate switches and a half-applied config is a real state — usually an Android file edited and the Podfile forgotten. And I would run expo-doctor to audit the dependency list before shipping.',
        traps: [
          'Not knowing it is already the default since 0.76 and SDK 52. It dates the answer immediately.',
          'Checking only <code>nativeFabricUIManager</code>. Fabric and TurboModules are separate switches, and half-on is a state you can genuinely end up in.',
          'Assuming bare and managed are the same job. Managed Expo hides the C++ build and linking; bare does not.',
          'Trusting the config flag without a runtime check. The flag is what you asked for, the global is what you got.'
        ]
      },
      {
        id: 'rn-interop',
        title: 'The interop layer buys time, not parity',
        tags: ['migration'],
        ask: 'What is the interop layer, and where does it stop helping?',
        read: 'the-interop-layer',
        body: [
          { p: 'The interop layer is a compatibility shim. It lets components and modules written against the old renderer keep working inside the New Architecture, by translating between the two systems at runtime.' },
          { p: 'It matters because it changes migration from a cliff into a slope. Without it, one un-migrated native dependency blocks the whole app. With it, that dependency keeps working while you deal with it.' },
          { p: '<b>Since React Native 0.74 it is automatic.</b> Turn on the New Architecture and it is there. There is nothing to configure — and if you are carrying an <code>unstable_reactLegacyComponentNames</code> list in <code>react-native.config.js</code> from an earlier version, 0.74 is where you delete it.' },
          { p: 'But it is a shim, and it has two limits you should be able to name.' },
          {
            list: [
              '<b>It costs performance.</b> A translated Bridge module is measurably slower than a native TurboModule. You are still paying part of the old tax on that path — which is fine as a transition and wrong as a destination.',
              '<b>It does not deliver the new capabilities.</b> The interop layer does not support concurrent features such as <code>startTransition</code>, and it does not support custom shadow nodes. So a screen leaning on an interop component does not get concurrent React <i>there</i>, even though the app as a whole is on Fabric.'
            ]
          },
          { p: 'That second point is the one worth carrying into an interview, because it reframes what interop is for. It is not "New Architecture with old libraries". It is <b>"the app boots and ships while you migrate"</b> — you get the floor, not the ceiling. If the reason you migrated was <code>useTransition</code> on your search screen, and that screen renders through an interop component, you have not got what you came for.' },
          {
            note: [
              '<b>One thing you may read and should not repeat.</b> Guides sometimes show an option called <code>unstable_enableNewArchInterop</code> set in <code>react-native.config.js</code>, described as the way to enable or disable the shim per package.',
              'No such option exists. The key that <i>did</i> exist is <code>unstable_reactLegacyComponentNames</code>, from before 0.74, and the current guidance is to remove it because the layer now works automatically.',
              'It is an easy claim to repeat because it sounds plausible and it is written down in several places. Reciting a config key that does not exist is a bad way to lose a technical conversation.'
            ]
          }
        ],
        say:
          'It is a compatibility shim that lets old-renderer components and modules keep working inside the New Architecture by translating between the two at runtime, and since 0.74 it is automatic — you turn the New Architecture on and it is there, with nothing to configure. What it buys you is that migration becomes a slope instead of a cliff: one un-migrated dependency no longer blocks the whole app. The two limits I would name are that a translated module is measurably slower than a real TurboModule, so it is fine as a transition and wrong as a destination; and that it does not support concurrent features like startTransition or custom shadow nodes. That second one reframes what it is for — it is not New Architecture with old libraries, it is that the app boots and ships while you migrate. If you moved specifically to get useTransition on a screen, and that screen renders through an interop component, you did not get what you came for.',
        traps: [
          'Treating interop as a permanent answer. It reintroduces part of the cost you migrated to remove.',
          'Assuming concurrent React works everywhere once the app is on Fabric. Interop paths do not support <code>startTransition</code> or custom shadow nodes.',
          'Quoting <code>unstable_enableNewArchInterop</code>. It is not a real option — the pre-0.74 key was <code>unstable_reactLegacyComponentNames</code>, and it should now be removed.',
          'Thinking it needs enabling. It has been automatic since 0.74.'
        ]
      },
      {
        id: 'rn-compat',
        title: 'The dependency list is the migration',
        tags: ['migration', 'hot'],
        ask: 'How do you work out whether your app can move, and how long it will take?',
        read: 'package-compatibility-in-2026',
        body: [
          { p: 'The flag takes a minute. The audit takes the week. So the first move is to separate your dependencies into the two groups that actually behave differently.' },
          {
            diagram: `Does the package ship native code?

  NO ─────────> irrelevant to this migration
                react-query, zustand, date-fns, zod, lodash
                pure JavaScript — nothing to port, nothing to check

  YES ────────> this is your whole audit
                reanimated, gesture-handler, screens, maps,
                camera, svg, mmkv, flash-list, anything with an
                ios/ or android/ directory`,
            caption: 'The only question that matters per dependency'
          },
          { p: 'People routinely over-audit here, listing every entry in <code>package.json</code>. <b>A pure-JavaScript library cannot be incompatible with the New Architecture</b>, because it never crosses the boundary the New Architecture changed. That usually removes most of the list before you start.' },
          { p: 'For what remains, the state of the ecosystem in 2026 is roughly 85% compatible. The load-bearing ones are all fine:' },
          {
            list: [
              '<b>Compatible</b> — Reanimated 3.x and Gesture Handler 2.x (both effectively required for Fabric anyway), React Native Screens 3.x, Flash List, MMKV, Safe Area Context, Expo Camera, React Native SVG from v13.',
              '<b>Partial or superseded</b> — React Native Maps works with limits. The other yellow entries are mostly not compatibility problems but abandonment: <code>react-native-camera</code> is unmaintained and the answer is Expo Camera or Vision Camera; <code>react-native-linear-gradient</code> and <code>react-native-blur</code> have maintained successors.',
              '<b>Unsupported</b> — check <a href="https://reactnative.directory" target="_blank" rel="noopener noreferrer">React Native Directory</a>, which tracks New Architecture status per package and is the only figure worth trusting on the day you look.'
            ]
          },
          { p: 'For anything genuinely unsupported you have four options, in the order you should consider them: use the Expo equivalent if one exists; find a maintained fork; lean on the interop layer while you decide; or, if it is small and load-bearing, port it yourself — CodeGen makes that a smaller job than it used to be.' },
          {
            note: [
              '<b>Read compatibility tables with the date attached.</b> Any list of package status is a snapshot, and this one is dated March 2026. React Native Directory is generated from the packages themselves, so it is current by construction; a hand-written table in a guide is current only on the day it was written.',
              'Two smaller things worth noticing in the source table for this card, because they are the kind of thing that makes you doubt a list: <code>react-native-svg</code> is filed under "partially compatible" but marked as fixed and compatible in the same row, and the "not yet compatible — avoid" section names no packages at all.',
              'None of that makes the guide wrong. It does mean the per-package answer belongs to the directory, and the guide is for the shape of the problem.'
            ]
          }
        ],
        say:
          'The flag takes a minute; the audit takes the week. I would split dependencies by one question: does this package ship native code? Anything pure JavaScript — react-query, zustand, date-fns — cannot be incompatible, because it never crosses the boundary that changed, and that usually removes most of package.json before you start. What is left is the real audit. The ecosystem is around 85% compatible now and the load-bearing libraries are all fine: Reanimated 3, Gesture Handler 2, Screens, Flash List, MMKV, Expo Camera, SVG from v13. Most of the remaining problems are not really compatibility, they are abandonment — react-native-camera is unmaintained and the answer is Expo Camera or Vision Camera. For anything genuinely unsupported: Expo equivalent, maintained fork, interop layer while you decide, or port it, which CodeGen has made smaller. And I would take per-package status from React Native Directory rather than any written table, because the directory is generated and a table is only current on the day it was written.',
        traps: [
          'Auditing every dependency. If it ships no native code it is not in scope, and saying so shows you know what the migration actually touches.',
          'Quoting a compatibility table as current. It is a snapshot; React Native Directory is the live source.',
          'Confusing unmaintained with incompatible. Several yellow entries are abandoned packages with maintained successors, which is a different problem with a different fix.',
          'Forgetting Reanimated and Gesture Handler are effectively prerequisites rather than just compatible.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'rn-ship',
    track: 'rn-newarch',
    title: 'Migrating, and what you actually get',
    kicker: 'Module 05',
    blurb:
      'Two questions a lead gets asked and a developer often has not thought about: how do we do this without a bad release, and what do I tell the person who wants to know if it was worth it.',
    concepts: [
      {
        id: 'rn-migrate',
        title: 'Four steps, and a dev build so none of them are risky',
        tags: ['migration'],
        ask: 'Walk me through migrating an existing app. How do you keep it off the critical path?',
        read: 'migration-strategy-for-existing-apps',
        body: [
          { p: 'The mechanical part is four steps:' },
          {
            list: [
              '<b>Audit</b> the native dependencies — <code>npx expo-doctor</code>, or <code>npx react-native doctor</code> on bare.',
              '<b>Update</b> to Expo SDK 52+ or React Native 0.76+: <code>npx expo install expo@^52 --fix</code>.',
              '<b>Enable</b> the flag for each platform.',
              '<b>Fix</b> what breaks — which, from the Fabric card, is mostly <code>setNativeProps</code>, <code>findNodeHandle</code> and measurement in <code>ref</code> callbacks.'
            ]
          },
          { p: 'The part worth actually saying out loud is the fifth thing, which is not a step but a strategy: <b>run the New Architecture in a development build while production stays on the old one.</b>' },
          {
            diagram: `production track                dev / internal track
────────────────                ────────────────────
legacy architecture             New Architecture on
real users                      expo-dev-client build
unchanged                       same commit, same device

        │                               │
        │                     run the full suite here
        │                     Detox or Maestro, plus
        │                     manual QA of every screen
        │                               │
        └──────── cut over once that is clean ────────>`,
            caption: 'Migrate on a branch users never see'
          },
          { p: 'This works because of what the failure mode looks like. With the interop layer carrying most legacy modules, a New Architecture problem is usually <b>a white screen or one component rendering wrong</b> — not a crash, and not something a unit test notices. It is exactly the class of bug that a human clicking through every screen finds in an afternoon and a CI suite misses entirely.' },
          { p: 'So: both builds installed on the same device, walk the app, compare. Automated end-to-end tests for the flows you have, manual QA for the visual regressions they will not catch. Teams that migrate this way consistently report it being less disruptive than they expected — and the reason is not that the migration is easy, it is that nothing about it was ever pointed at a user.' },
          {
            bridge: [
              'This is worth having ready as a general answer, not just a React Native one, because the shape recurs: <b>a risky platform change becomes a safe one when you can run both versions side by side against the same tests.</b>',
              'It is the same instinct as a feature flag, a canary deploy or a dark launch. What makes it available here is that mobile gives you separate distribution tracks for free — internal, TestFlight, Expo channels — so "ship it to nobody first" costs you nothing but the build.',
              'If an interviewer asks how you de-risk any large migration, this is the answer with the details swapped out.'
            ]
          }
        ],
        say:
          'Mechanically it is four steps: audit the native dependencies with expo-doctor, update to SDK 52 or React Native 0.76, set the flag per platform, then fix what breaks — which is mostly setNativeProps, findNodeHandle, and measuring inside ref callbacks. But the thing I would actually lead with is the strategy rather than the steps: run the New Architecture in a development build while production stays legacy, same commit, both installed on the same device. That works because of what the failure mode looks like — with the interop layer carrying legacy modules, the typical problem is a white screen or one component rendering wrong, not a crash. That is precisely what a CI suite misses and a person clicking through every screen finds in an afternoon. So automated Detox or Maestro for the flows we have, manual QA for the visual regressions, then cut over. Teams that do it this way report it being less disruptive than expected, and the reason is not that it is easy, it is that no step of it was ever pointed at a user.',
        traps: [
          'Giving the four steps and stopping. The steps are public; the risk management is the answer a lead is listening for.',
          'Relying on the test suite alone. The characteristic failure is visual and intermittent, which automated tests are weakest at.',
          'Migrating and upgrading in one release. Upgrade first, land it, then flip the architecture — otherwise you cannot tell which change caused the regression.',
          'Expecting crashes. With interop in place it is more often a blank screen or a component that renders slightly wrong, which is easier to miss and worse to ship.'
        ]
      },
      {
        id: 'rn-perf',
        title: 'The numbers, and how to read them honestly',
        tags: ['performance'],
        ask: 'What performance improvement should we expect from migrating?',
        read: 'performance-benchmarks',
        body: [
          { p: 'The figures that circulate come from community benchmarks on a mid-range Android device — a Pixel 6a — comparing the same app on both architectures:' },
          {
            diagram: `Metric                          Old        New       Change
──────────────────────────────────────────────────────────
Cold start (complex app)      1,850ms    1,420ms    23% faster
List scroll, 1,000 items         45fps      59fps    31% smoother
Animation start latency          32ms        8ms    75% lower
Native module call               12ms      0.2ms    60x faster
JS bundle evaluation            280ms      250ms    11% faster`,
            caption: 'Community benchmarks, Pixel 6a, RN 0.76 / Expo SDK 52'
          },
          { p: 'Take those as the shape of the win rather than as a forecast, and be ready to say why — because the person asking is usually deciding whether to fund the work.' },
          { p: '<b>The last row is not a like-for-like comparison.</b> 12ms is an <i>asynchronous</i> bridge call; 0.2ms is a <i>synchronous</i> JSI call. Those are different operations, and the ratio between them is not a speedup you can apply to your app. Most of your calls will still be async, because they should be. Quoting "60x faster native calls" without that caveat is the single easiest thing to get caught on here.' },
          { p: '<b>The rest are one app on one device.</b> Cold start and scroll numbers are dominated by what the app does — a 23% cold start improvement on an app with forty lazily-loaded native modules says very little about an app with four.' },
          { p: 'The defensible version, and the one the guide itself gives when it is not quoting the table: <b>typical apps see roughly 10&ndash;30% on the UI thread. Apps that were genuinely bridge-bound see far more.</b> Which is the honest answer, because it makes the size of the win depend on the thing it actually depends on.' },
          {
            note: [
              '<b>Know which problems this does not solve, and say so unprompted.</b> It is the fastest way to sound like you have shipped a migration rather than read about one.',
              'The New Architecture removes a <i>boundary</i> cost. If your list is janky because every row does unmemoised work, if your startup is slow because you fetch three things serially before rendering, or if the app feels slow because an API takes 800ms — none of that involves the boundary, and none of it gets better.',
              'Migrating for the platform capabilities and the ecosystem is a good reason. Migrating instead of profiling is not, and the profile usually says the problem was in your JavaScript.'
            ]
          }
        ],
        say:
          'The published figures are community benchmarks on a Pixel 6a: about 23% faster cold start, 45 to 59fps on a thousand-item list, animation latency from 32ms to 8ms. I would treat those as the shape of the win rather than a forecast, for two reasons. The headline row — 60x faster native calls — compares a 12ms async bridge call to a 0.2ms synchronous JSI call, which are different operations, and most of my calls will still be async because they should be. And the rest are one app on one device, so a 23% cold start gain on an app with forty lazily-loaded native modules says little about an app with four. The defensible number is 10 to 30% on the UI thread for a typical app, with much more if you were genuinely bridge-bound. I would also volunteer what it does not fix: it removes a boundary cost, so unmemoised list rows, serial fetches at startup or a slow API are all exactly as slow afterwards. Migrating for the capabilities and the ecosystem is a good reason; migrating instead of profiling is not.',
        traps: [
          'Quoting "60x faster" as a general speedup. It compares an async call to a sync one — two different operations.',
          'Presenting single-device community benchmarks as guaranteed figures. Cold start and scroll numbers depend mostly on what the app does.',
          'Promising a performance win to justify the migration. The durable reasons are the capabilities and the ecosystem; performance varies with how bridge-bound you were.',
          'Not naming what stays slow. Unmemoised renders, serial network calls and slow APIs are untouched, and saying so unprompted is what separates experience from reading.'
        ]
      }
    ]
  });
})(window.PREP);
