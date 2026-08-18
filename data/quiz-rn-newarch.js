/* React Native New Architecture question bank. */
(function (P) {
  P.quiz.push(
    /* ---------- Module 01: the Bridge and JSI ---------- */
    {
      id: 'n01', track: 'rn-newarch', module: 'rn-why',
      q: 'How many data conversions did a single call across the legacy bridge require?',
      choices: ['None — it passed references', 'One, on the native side', 'Two — serialise to JSON going out, parse coming back', 'Four, two per direction'],
      a: 2,
      why: 'Arguments were serialised to JSON on the JavaScript side and parsed on the native side; the result made the same trip in reverse. Two conversions and two async hops, on every call.'
    },
    {
      id: 'n02', track: 'rn-newarch', module: 'rn-why',
      q: 'Which legacy-bridge problem was <b>not</b> about speed?',
      choices: [
        'Serialisation overhead on every call',
        'The renderer could not support React 18 concurrent features',
        'JSON parsing cost on the native side',
        'Large payloads were expensive to transfer'
      ],
      a: 1,
      why: 'Interruptible rendering needs a renderer that can start work and throw it away. Once a message was posted across the bridge it could not be taken back, so <code>useTransition</code> and <code>Suspense</code> were structurally impossible rather than merely slow.'
    },
    {
      id: 'n03', track: 'rn-newarch', module: 'rn-why',
      q: 'Which of these was <b>least</b> affected by the legacy bridge?',
      choices: [
        'A gesture-driven drag that follows the finger',
        'Real-time camera frame processing',
        'A settings screen with a form and twenty rows',
        'A large list refilling while scrolling'
      ],
      a: 2,
      why: 'The bridge failed where an answer was needed before the next frame. A form has no per-frame deadline, which is why plenty of apps shipped happily on the old architecture — "the bridge was slow" is too broad a claim.'
    },
    {
      id: 'n04', track: 'rn-newarch', module: 'rn-why',
      q: 'What is JSI?',
      choices: [
        'A faster binary replacement for the JSON bridge protocol',
        'A C++ layer that installs native objects and functions directly on the JavaScript VM',
        'A background thread dedicated to native module calls',
        'A codegen tool that produces native bindings'
      ],
      a: 1,
      why: 'It removes the queue rather than speeding it up. Once a function is installed on the VM, calling it from JavaScript is an ordinary call into C++ — no serialisation and no tick to wait for.'
    },
    {
      id: 'n05', track: 'rn-newarch', module: 'rn-why',
      q: 'What is the relationship between JSI, Fabric and TurboModules?',
      choices: [
        'Three independent subsystems that shipped together',
        'JSI is the foundation; Fabric and TurboModules are built on top of it',
        'Fabric is the foundation; JSI and TurboModules build on it',
        'TurboModules wraps JSI, and Fabric wraps TurboModules'
      ],
      a: 1,
      why: 'JSI is the substrate that made the other two possible. Listing them as siblings misses the structure, and the dependency order is usually the follow-up question.'
    },
    {
      id: 'n06', track: 'rn-newarch', module: 'rn-why',
      q: 'Why is Reanimated 3 smooth even when the main JavaScript thread is busy?',
      choices: [
        'Its animations are compiled to native code ahead of time',
        'It runs a second JavaScript runtime on the UI thread, installed via JSI',
        'It raises the priority of the main JS thread',
        'It precomputes every frame before the animation starts'
      ],
      a: 1,
      why: 'JSI lets it install a separate runtime on the UI thread, so the animation is not competing with your component code. It is not compilation — it is running somewhere else.'
    },
    {
      id: 'n07', track: 'rn-newarch', module: 'rn-why',
      q: 'Now that JSI allows synchronous native calls, why do most React Native APIs stay asynchronous?',
      choices: [
        'Synchronous calls are still slower than async ones',
        'A synchronous call blocks the JavaScript thread for its whole duration',
        'CodeGen cannot generate synchronous bindings',
        'Hermes does not support synchronous host functions'
      ],
      a: 1,
      why: 'Sync became possible, not mandatory. Blocking the JS thread on a file read or a network call freezes the UI exactly like a <code>while</code> loop would, so sync is reserved for genuinely fast reads.'
    },

    /* ---------- Module 02: Fabric ---------- */
    {
      id: 'n08', track: 'rn-newarch', module: 'rn-fabric',
      q: 'What specifically moved into C++ with Fabric?',
      choices: ['The JavaScript bundle', 'The shadow tree — the layout representation Yoga runs over', 'The React reconciler', 'The Hermes bytecode compiler'],
      a: 1,
      why: 'The shadow tree used to live partly in JavaScript, so computing layout meant crossing the boundary repeatedly. In C++ it does not, and holding the tree natively is also what makes concurrent rendering possible.'
    },
    {
      id: 'n09', track: 'rn-newarch', module: 'rn-fabric',
      q: 'Why could the legacy renderer not support <code>useTransition</code>?',
      choices: [
        'It rendered too slowly for transitions to be useful',
        'It could not discard render work it had already posted across the bridge',
        'React 18 was never supported on React Native',
        '<code>useTransition</code> requires synchronous layout measurement'
      ],
      a: 1,
      why: 'Concurrent rendering means starting work, deciding it is stale, and throwing it away. Instructions already sent across the bridge could not be recalled. Fabric holds the tree itself, so it can drop the work.'
    },
    {
      id: 'n10', track: 'rn-newarch', module: 'rn-fabric',
      q: 'Does Fabric replace Yoga?',
      choices: [
        'Yes — Fabric implements its own flexbox engine',
        'No — Yoga still computes layout; the tree it walks moved out of JavaScript',
        'Yes, but only on Android',
        'No — Yoga was removed entirely and layout is now done in JavaScript'
      ],
      a: 1,
      why: 'Yoga still does the flexbox maths. What changed is that the shadow tree it operates on lives in C++ rather than partly in JavaScript, so there are no round trips per layout pass.'
    },
    {
      id: 'n11', track: 'rn-newarch', module: 'rn-fabric',
      q: 'What replaces <code>setNativeProps</code> under Fabric?',
      choices: [
        '<code>updateNativeProps</code>',
        'Nothing direct — use state, or Reanimated for animation',
        '<code>ref.current.setProps</code>',
        'It still works via the interop layer'
      ],
      a: 1,
      why: 'There is deliberately no drop-in replacement. Mutating a native view behind the renderer\'s back breaks Fabric\'s model, so the answer is state, or Reanimated, which owns its own UI-thread runtime.'
    },
    {
      id: 'n12', track: 'rn-newarch', module: 'rn-fabric',
      q: 'Under Fabric, when does a <code>ref</code> callback on a native component fire?',
      choices: [
        'After the layout pass, as before',
        'Before layout is committed, so measurements taken there are unreliable',
        'Only after the first <code>onLayout</code> event',
        'On the next frame, always'
      ],
      a: 1,
      why: 'With the shadow tree in C++, refs fire earlier — the view exists but its geometry is not committed. Measuring there yields zeros or stale values, typically only on slower devices, which makes it a miserable bug to reproduce.'
    },
    {
      id: 'n13', track: 'rn-newarch', module: 'rn-fabric',
      q: 'Which statement about <code>measureInWindow</code> under Fabric is accurate?',
      choices: [
        'It no longer takes a callback and returns values directly',
        'It still takes a callback; what changed is that it no longer needs a bridge round trip',
        'It was removed in favour of <code>onLayout</code>',
        'It only works inside a <code>ref</code> callback now'
      ],
      a: 1,
      why: 'A common write-up says callback-based measurement is gone. React Native\'s own New Architecture docs still pass a callback — the timing changed, not the API, which is what lets the measurement and its state update land in one commit inside <code>useLayoutEffect</code>.'
    },
    {
      id: 'n14', track: 'rn-newarch', module: 'rn-fabric',
      q: 'Which is the reliable way to get a view\'s committed dimensions under Fabric?',
      choices: [
        'Measure inside the <code>ref</code> callback',
        '<code>onLayout</code>, or measuring inside <code>useLayoutEffect</code>',
        '<code>findNodeHandle</code> followed by a measure call',
        'Read <code>ref.current.width</code> directly after mount'
      ],
      a: 1,
      why: '<code>onLayout</code> fires with committed geometry, and an effect runs after the commit. Both avoid the window where a ref exists but layout has not landed. <code>findNodeHandle</code> is deprecated.'
    },

    /* ---------- Module 03: TurboModules and CodeGen ---------- */
    {
      id: 'n15', track: 'rn-newarch', module: 'rn-turbo',
      q: 'What did the legacy native module system do at app startup?',
      choices: [
        'Loaded only the modules the first screen imported',
        'Initialised every native module in the app',
        'Deferred all module loading until first render',
        'Loaded modules in parallel on a background thread'
      ],
      a: 1,
      why: 'All of them, before the first screen appeared. Startup cost therefore scaled with the dependency list rather than with the screen being opened — forty modules initialised to show a login form needing two.'
    },
    {
      id: 'n16', track: 'rn-newarch', module: 'rn-turbo',
      q: 'Where does the TurboModules cold-start improvement come from?',
      choices: [
        'Each module initialises faster than before',
        'Most modules are not initialised at all on a given launch',
        'Modules are precompiled into the binary',
        'Module initialisation moved to a background thread'
      ],
      a: 1,
      why: 'Lazy loading means the camera module initialises when someone opens the camera screen, not during the splash. Nothing got individually faster — most of it simply does not run.'
    },
    {
      id: 'n17', track: 'rn-newarch', module: 'rn-turbo',
      q: 'Which app benefits <b>least</b> from TurboModule lazy loading?',
      choices: [
        'An app with thirty native modules, each used on one screen',
        'An app with three native modules, all used on the first screen',
        'An app with heavy camera and maps dependencies',
        'An app with many optional feature modules'
      ],
      a: 1,
      why: 'The saving is proportional to what you were loading and not using. If everything you ship is needed immediately, there is nothing to defer.'
    },
    {
      id: 'n18', track: 'rn-newarch', module: 'rn-turbo',
      q: 'Which direction does CodeGen run?',
      choices: [
        'It reads native code and generates TypeScript types',
        'It reads a TypeScript spec and generates the native interfaces',
        'It generates both sides from a JSON schema',
        'It validates types at runtime on each call'
      ],
      a: 1,
      why: 'The TypeScript spec is the source of truth and the input. The generated C++, Objective-C and Java interfaces are what the native side must then satisfy.'
    },
    {
      id: 'n19', track: 'rn-newarch', module: 'rn-turbo',
      q: 'What does CodeGen turn a renamed native method into?',
      choices: [
        'A runtime warning in development builds',
        'A compile error on the platform that got it wrong',
        'A silent no-op',
        'A TypeScript type error only'
      ],
      a: 1,
      why: 'That is the entire benefit: the failure moves off a user\'s device and into a compiler. Previously it surfaced as <code>undefined is not a function</code>, at runtime, often on only one platform.'
    },
    {
      id: 'n20', track: 'rn-newarch', module: 'rn-turbo',
      q: 'When should you use <code>TurboModuleRegistry.getEnforcing</code> rather than <code>get</code>?',
      choices: [
        'When the module is optional and may be absent',
        'When the app cannot function without the module',
        'When the module exposes synchronous methods',
        'When targeting Android only'
      ],
      a: 1,
      why: '<code>get</code> returns <code>null</code> for a missing module, which is right when it is genuinely optional. <code>getEnforcing</code> throws, turning a broken link into a loud startup failure instead of a null dereference three screens in.'
    },
    {
      id: 'n21', track: 'rn-newarch', module: 'rn-turbo',
      q: 'In a TurboModule spec, what does <code>getDeviceName(): string</code> declare, versus <code>Promise&lt;string&gt;</code>?',
      choices: [
        'Nothing — both generate identical native signatures',
        'A synchronous call, versus an asynchronous one',
        'A cached value, versus a fresh one',
        'An Android-only method, versus cross-platform'
      ],
      a: 1,
      why: 'The return type is a design decision that CodeGen turns into different native signatures. JSI is what makes the synchronous option available at all — which is also why it should be reserved for genuinely fast reads.'
    },

    /* ---------- Module 04: turning it on ---------- */
    {
      id: 'n22', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Since which versions has the New Architecture been the default?',
      choices: [
        'React Native 0.68 and Expo SDK 45',
        'React Native 0.76 and Expo SDK 52',
        'React Native 0.80 and Expo SDK 55',
        'It is still opt-in everywhere'
      ],
      a: 1,
      why: 'Both landed in November 2024. On a project started since then it is already on, so the useful question is how to confirm it rather than how to enable it.'
    },
    {
      id: 'n23', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Which pair of runtime globals confirms Fabric and TurboModules are active?',
      choices: [
        '<code>global.__DEV__</code> and <code>global.HermesInternal</code>',
        '<code>global.nativeFabricUIManager</code> and <code>global.__turboModuleProxy</code>',
        '<code>global.RCT_NEW_ARCH_ENABLED</code> and <code>global.newArchEnabled</code>',
        '<code>Platform.newArch</code> and <code>Platform.fabric</code>'
      ],
      a: 1,
      why: 'Check both. They are separate switches internally, and a half-applied config — Android edited, Podfile forgotten — is a real state you can end up in.'
    },
    {
      id: 'n24', track: 'rn-newarch', module: 'rn-adopt',
      q: 'What enables the New Architecture in a bare React Native iOS project?',
      choices: [
        '<code>"newArchEnabled": true</code> in app.json',
        "<code>ENV['RCT_NEW_ARCH_ENABLED'] = '1'</code> in the Podfile",
        '<code>newArchEnabled=true</code> in gradle.properties',
        '<code>--new-arch</code> passed to the bundler'
      ],
      a: 1,
      why: 'app.json is the Expo route, and gradle.properties is the Android side of a bare project. iOS is the Podfile environment variable — and editing one platform while forgetting the other is exactly why you verify at runtime.'
    },
    {
      id: 'n25', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Since React Native 0.74, how is the interop layer enabled?',
      choices: [
        'By setting <code>unstable_enableNewArchInterop: true</code> in react-native.config.js',
        'Automatically — turning on the New Architecture is enough',
        'By listing each legacy component in react-native.config.js',
        'Per package, via a flag in package.json'
      ],
      a: 1,
      why: 'It is automatic. <code>unstable_enableNewArchInterop</code> is not a real option despite appearing in several guides; the key that did exist was <code>unstable_reactLegacyComponentNames</code>, and current guidance is to delete it.'
    },
    {
      id: 'n26', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Which capability does the interop layer <b>not</b> provide to legacy components?',
      choices: [
        'Rendering inside a Fabric app at all',
        'Concurrent features such as <code>startTransition</code>, and custom shadow nodes',
        'Touch event handling',
        'Access to native modules'
      ],
      a: 1,
      why: 'You get the floor, not the ceiling: the app boots and ships while you migrate. If you moved specifically to get <code>useTransition</code> on a screen that renders through an interop component, you did not get what you came for.'
    },
    {
      id: 'n27', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Which dependency is out of scope for a New Architecture audit?',
      choices: [
        '<code>react-native-maps</code>',
        '<code>zustand</code>',
        '<code>react-native-svg</code>',
        '<code>@shopify/flash-list</code>'
      ],
      a: 1,
      why: 'Zustand is pure JavaScript, so it never crosses the boundary the New Architecture changed and cannot be incompatible. Splitting on "does this ship native code" removes most of package.json before the real audit starts.'
    },
    {
      id: 'n28', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Which two packages are effectively prerequisites rather than merely compatible?',
      choices: [
        'Redux and Redux Toolkit',
        'Reanimated 3.x and Gesture Handler 2.x',
        'Axios and React Query',
        'Lodash and date-fns'
      ],
      a: 1,
      why: 'Both are required in practice for Fabric, and both are JSI-native. The others are pure JavaScript and unaffected by the architecture entirely.'
    },
    {
      id: 'n29', track: 'rn-newarch', module: 'rn-adopt',
      q: 'What is the actual problem with <code>react-native-camera</code> in 2026?',
      choices: [
        'It is incompatible with Hermes',
        'It is unmaintained — the fix is a successor like Expo Camera or Vision Camera',
        'It requires the old bridge to be explicitly re-enabled',
        'It only works on Android under Fabric'
      ],
      a: 1,
      why: 'Several "partially compatible" entries are really abandonment rather than compatibility, and that is a different problem with a different fix. Migrating to a maintained successor beats waiting for support that is not coming.'
    },
    {
      id: 'n30', track: 'rn-newarch', module: 'rn-adopt',
      q: 'Where should per-package New Architecture status come from?',
      choices: [
        'A compatibility table in a guide',
        'React Native Directory, which is generated from the packages themselves',
        'The React Native changelog',
        'npm download counts'
      ],
      a: 1,
      why: 'Any written table is a snapshot that is current on the day it was written. The directory is generated, so it is current by construction — the guide is for the shape of the problem, the directory for the answer.'
    },

    /* ---------- Module 05: migrating and measuring ---------- */
    {
      id: 'n31', track: 'rn-newarch', module: 'rn-ship',
      q: 'What is the recommended way to de-risk the migration?',
      choices: [
        'Ship to a small percentage of production users first',
        'Run the New Architecture in a development build while production stays legacy',
        'Migrate one screen per release',
        'Disable the interop layer to surface problems early'
      ],
      a: 1,
      why: 'Same commit, both builds on the same device, and nothing pointed at a user. Mobile gives you separate distribution tracks for free, so "ship it to nobody first" costs only the build.'
    },
    {
      id: 'n32', track: 'rn-newarch', module: 'rn-ship',
      q: 'With the interop layer in place, what does a New Architecture problem usually look like?',
      choices: [
        'A hard crash on startup',
        'A white screen or one component rendering wrong',
        'A build failure',
        'A JavaScript exception in the console'
      ],
      a: 1,
      why: 'Which is why manual QA matters here. A visual, intermittent regression is precisely what an automated suite misses and a person clicking through every screen finds in an afternoon.'
    },
    {
      id: 'n33', track: 'rn-newarch', module: 'rn-ship',
      q: 'Why should the version upgrade and the architecture flip be separate releases?',
      choices: [
        'The tooling refuses to do both at once',
        'So a regression can be attributed to one change or the other',
        'Because the flag only applies after a full reinstall',
        'To avoid re-running CodeGen twice'
      ],
      a: 1,
      why: 'Land the upgrade, confirm it is healthy, then flip the architecture. Combined, any regression has two candidate causes and you get to bisect a release under pressure.'
    },
    {
      id: 'n34', track: 'rn-newarch', module: 'rn-ship',
      q: 'Why is "60x faster native module calls" a misleading figure to quote?',
      choices: [
        'The measurement was taken on a high-end device',
        'It compares a 12ms asynchronous bridge call with a 0.2ms synchronous JSI call',
        'It only applies to Android',
        'It was measured in a debug build'
      ],
      a: 1,
      why: 'Those are different operations, so the ratio is not a speedup you can apply to your app — and most of your calls will still be async, because they should be. It is the easiest claim on the whole topic to get caught on.'
    },
    {
      id: 'n35', track: 'rn-newarch', module: 'rn-ship',
      q: 'What is the defensible improvement to promise a stakeholder?',
      choices: [
        'A guaranteed 23% faster cold start',
        'Roughly 10-30% on the UI thread, with much more if the app was bridge-bound',
        '60x faster native calls',
        'No measurable change'
      ],
      a: 1,
      why: 'It makes the size of the win depend on the thing it actually depends on. The published cold start and scroll figures are one app on one device, and they are dominated by what that app happened to do.'
    },
    {
      id: 'n36', track: 'rn-newarch', module: 'rn-ship',
      q: 'Which performance problem does the New Architecture <b>not</b> fix?',
      choices: [
        'Per-frame cost of a JS-driven gesture',
        'A list that is janky because rows do unmemoised work on every render',
        'Cold start dominated by eagerly loaded native modules',
        'Animation latency from bridge round trips'
      ],
      a: 1,
      why: 'It removes a boundary cost. Unmemoised renders, serial fetches at startup and a slow API never touched that boundary and are exactly as slow afterwards — which is why profiling should come before migrating for performance.'
    }
  );
})(window.PREP);
