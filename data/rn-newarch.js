/* React Native New Architecture — the runtime half.
   Source: "React Native New Architecture: Fabric & Expo 2026" (PkgPulse,
   9 March 2026). Sections: the legacy bridge, JSI, Fabric, TurboModules.

   The article is a good map. Three places where it is wrong or loose are
   corrected on the cards and called out under "Where candidates lose it";
   each was checked against React Native's own docs, linked on the card:

     - "measure() is now synchronous, no more callback-based measurement"
       The API still takes a callback. What changed is when that callback
       runs, which is what makes useLayoutEffect work.
     - JSI framed as making native calls synchronous, full stop
       It makes them *possible*. A sync call blocks the JS thread, so most
       of the API surface stays async deliberately.
     - The performance table read as measurements of the same operation
       The 60x row compares an async bridge call to a sync JSI call. */
(function (P) {
  P.modules.push({
    id: 'rn-why',
    track: 'rn-newarch',
    title: 'The Bridge, and what replaced it',
    kicker: 'Module 01',
    blurb:
      'Everything in the New Architecture follows from one problem: the old boundary between JavaScript and native was a postbox, and a postbox cannot answer you this frame. Understand that and the rest is consequence.',
    concepts: [
      {
        id: 'rn-bridge',
        title: 'Six steps to call one native function',
        tags: ['architecture', 'hot'],
        ask: 'What was actually wrong with the old React Native bridge?',
        read: 'the-legacy-architecture-whats-being-replaced',
        body: [
          { p: 'In the legacy architecture JavaScript and native code could not call each other. They could only send each other messages, and every message took the same six steps.' },
          {
            diagram: `JavaScript thread                         Native thread
       │                                         │
   1   serialise the arguments to JSON           │
       │                                         │
   2   post the string across ─────────────────> │
       │              (async — you get no answer │
       │               on this tick)             │
       │                                     3   parse the JSON
       │                                         │
       │                                     4   run the native code
       │                                         │
       │                                     5   serialise the result
       │                                         │
       │ <───────────────────────────────────    │
   6   parse it back                    (async again)

  Two JSON conversions and two async hops, for every single call.`,
            caption: 'The old bridge, end to end'
          },
          { p: 'That produced three problems, and they are worth separating because the New Architecture attacks them with three different pieces.' },
          {
            list: [
              '<b>Cost.</b> Serialising and parsing on both sides, on every call. Fine once. Ruinous sixty times a second.',
              '<b>Asynchrony.</b> Nothing native could be read synchronously. You could not ask "how wide is this element" and use the answer on the same line.',
              '<b>Concurrency.</b> The old renderer could not support React 18 features like <code>useTransition</code> and <code>Suspense</code>, because interruptible rendering needs a renderer that can start work and throw it away. The bridge could not take that back once a message was posted.'
            ]
          },
          { p: 'Now the honest part, because an interviewer will push here. <b>The bridge was fine for most screens.</b> A form, a settings page, a list of twenty rows — the async round trip is invisible, and plenty of successful apps shipped on it for years.' },
          { p: 'It failed at the edges, and the edges all have one thing in common: <b>they need an answer before the next frame is drawn.</b> A gesture that follows your finger. An animation driven from JS. A large list refilling as it scrolls. A camera frame being processed. Sixteen milliseconds is the entire budget, and two JSON conversions plus two async hops do not fit inside it.' },
          { p: 'So the correct framing is not "the bridge was slow". It is that the bridge <b>could not make a timing promise</b>, and the whole class of features that needs one was therefore out of reach — or had to be rebuilt in native code, per app, by hand.' }
        ],
        say:
          'The old bridge was a message queue, not a function call. Every crossing serialised the arguments to JSON, posted them asynchronously, parsed them on the other side, ran the code, then serialised the result back and posted it again — two conversions and two async hops per call. That gave three problems: the serialisation cost, the fact that nothing native could be read synchronously, and that the renderer could not support React 18 concurrent features, because interruptible rendering needs to be able to throw work away and you cannot un-post a message. I would be careful not to say the bridge was simply slow, though — it was fine for most screens. It failed specifically where you need an answer before the next frame: gestures, animation, big lists, camera frames. It could not make a timing promise, and that is what ruled those features out.',
        traps: [
          'Saying "the bridge was slow" and stopping. The specific failure is that it could not answer within a frame, which is why gestures and animation were the pain points and a settings screen never was.',
          'Forgetting the concurrency half. Two of the three problems are about performance; the third is that React 18 features were structurally impossible, and that is the one people miss.',
          'Describing the bridge as a thread. It is a queue between threads — the JS thread, the native thread and the shadow thread are what actually exist.',
          'Implying every app was suffering. Most were not, and claiming otherwise makes the rest of the answer sound rehearsed.'
        ]
      },
      {
        id: 'rn-jsi',
        title: 'JSI: a handshake instead of a postbox',
        tags: ['architecture', 'hot'],
        ask: 'What is JSI, and why is it the foundation rather than just an optimisation?',
        read: 'jsi-javascript-interface',
        body: [
          { p: 'JSI — the JavaScript Interface — is a thin C++ layer sitting between the JavaScript engine and native code. It lets native code install real objects and functions <b>directly onto the JavaScript VM</b>.' },
          { p: 'Once a function is installed that way, calling it from JavaScript is an ordinary function call into C++. No JSON. No queue. No waiting for the next tick.' },
          {
            code: {
              lang: 'js',
              src: `// Native side, C++ — expose a function on the JS global
auto multiply = jsi::Function::createFromHostFunction(
  runtime,
  jsi::PropNameID::forAscii(runtime, "multiply"),
  2,
  [](jsi::Runtime& rt, const jsi::Value& thisVal,
     const jsi::Value* args, size_t count) -> jsi::Value {
    double a = args[0].asNumber();
    double b = args[1].asNumber();
    return jsi::Value(a * b);          // returned directly
  });

runtime.global().setProperty(runtime, "nativeMultiply",
                             std::move(multiply));`
            }
          },
          {
            code: {
              lang: 'js',
              src: `// JavaScript side — no await, no callback
const result = global.nativeMultiply(5, 10);
// => 50`
            }
          },
          { p: 'The reason this is the foundation and not a tweak: <b>Fabric and TurboModules are both built on top of it.</b> JSI is the new substrate, and the other two are what got rebuilt once the substrate existed. If you can only remember the relationship between the three pieces, remember that one.' },
          { p: 'It also explains a set of libraries that felt like magic when they arrived. Each of them is doing the same thing — taking a job that used to need a bridge crossing per frame and doing it in C++ instead:' },
          {
            list: [
              '<b>Reanimated 3</b> runs your animation and gesture logic on the UI thread, in a separate JS runtime installed via JSI. That is why the animation keeps running smoothly even when the main JS thread is busy.',
              '<b>MMKV</b> reads synchronously — <code>storage.getString(key)</code> returns a value, where <code>AsyncStorage</code> returns a promise.',
              '<b>Vision Camera</b> runs frame processors on camera frames in real time, which is impossible if every frame has to be serialised.',
              '<b>WatermelonDB</b> and the JSI SQLite drivers query the database without a round trip per statement.'
            ]
          },
          {
            note: [
              '<b>JSI makes synchronous calls possible. It does not make them the default, and it should not.</b>',
              'A synchronous native call blocks the JavaScript thread for its whole duration — the same thread that runs your components and your event handlers. Doing a file read or a network call that way would freeze the UI just as surely as a <code>while</code> loop would.',
              'So most of the API surface stays asynchronous on purpose. Sync is for things that are genuinely fast and genuinely needed now: reading a stored value, measuring a view, checking a device constant. Saying "JSI made everything synchronous" in an interview invites exactly the follow-up you do not want.'
            ]
          }
        ],
        say:
          'JSI is a C++ layer between the JavaScript engine and native code that lets native install real objects and functions straight onto the JS VM, so calling them is an ordinary function call — no JSON, no queue, no waiting for the next tick. The thing I would stress is that it is the foundation, not an optimisation: Fabric and TurboModules are both built on top of it, so JSI is the substrate and the other two are what got rebuilt once it existed. It also explains the libraries that felt like magic — Reanimated 3 running animations on the UI thread in its own runtime, MMKV reading synchronously where AsyncStorage returns a promise, Vision Camera processing frames in real time. One thing I would be careful about: JSI makes sync calls possible, not mandatory. A synchronous call blocks the JS thread, so most APIs stay async deliberately, and sync is reserved for things that are genuinely fast and needed on the spot.',
        traps: [
          'Calling JSI "the new bridge". It is the removal of the bridge — a direct call path, not a faster queue.',
          'Saying JSI made native calls synchronous, full stop. It made them <i>possible</i>. A sync call blocks the JS thread, so most of the surface stays async on purpose.',
          'Not knowing the dependency order. JSI is the foundation; Fabric and TurboModules sit on it. Listing the three as siblings misses the structure.',
          'Thinking Reanimated is fast because it is "compiled". It is fast because JSI lets it run a second JS runtime on the UI thread, so a busy main thread does not stall the animation.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'rn-fabric',
    track: 'rn-newarch',
    title: 'Fabric, the new renderer',
    kicker: 'Module 02',
    blurb:
      'Fabric is the renderer rebuilt in C++ on top of JSI. Most of it you never notice. The parts you do notice are a small set of behaviours that changed, and they are the ones that break an app on migration day.',
    concepts: [
      {
        id: 'rn-fabric-what',
        title: 'The shadow tree moved into C++',
        tags: ['rendering'],
        ask: 'What is Fabric, and what does moving the shadow tree to C++ actually buy you?',
        read: 'fabric-the-new-ui-renderer',
        body: [
          { p: 'React Native keeps a <b>shadow tree</b> — the layout representation of your components, the thing Yoga runs its flexbox calculations over. It sits between your React elements and the real native views.' },
          { p: 'It used to live partly in JavaScript. Fabric moves it into C++, and re-implements every core component — <code>View</code>, <code>Text</code>, <code>ScrollView</code> — on top of it.' },
          {
            diagram: `LEGACY                            FABRIC

React elements  (JS)              React elements  (JS)
      │                                 │
shadow tree     (JS ⇄ native)     shadow tree     (C++)
      │   round trips per layout        │   no crossing
Yoga layout     (C++)             Yoga layout     (C++)
      │                                 │
native views                      native views

  Layout used to cross the boundary. Now it does not.`,
            caption: 'Where layout is computed'
          },
          { p: 'Two things follow, and the second matters more than the first.' },
          { p: '<b>Layout gets faster</b>, because computing it no longer means crossing between JavaScript and native repeatedly. That is the obvious win and it is real, but it is incremental.' },
          { p: '<b>Concurrent React starts working</b>, and that is a capability you did not have at all. React 18\'s concurrent features depend on the renderer being able to begin rendering, decide the work is now stale, and discard it. The old renderer could not, because it had already posted the instructions across the bridge. Fabric can, because it holds the tree itself.' },
          {
            code: {
              lang: 'jsx',
              src: `import { useState, useTransition, Suspense } from 'react';

function ProductSearch() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  function handleSearch(text) {
    // Marked low priority — React may interrupt this render to keep
    // the keystrokes responsive, and Fabric can honour that.
    startTransition(() => setQuery(text));
  }

  return (
    <>
      <TextInput onChangeText={handleSearch} />
      {isPending && <ActivityIndicator />}
      <Suspense fallback={<LoadingSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </>
  );
}`
            }
          },
          { p: 'That is the honest framing of Fabric: a modest across-the-board speedup, and one genuinely new capability. In an interview, lead with the capability.' }
        ],
        say:
          'Fabric is the renderer rewritten in C++ on top of JSI. The specific change is that the shadow tree — the layout tree Yoga runs flexbox over — moved out of JavaScript into C++, and all the core components were re-implemented against it. Two things follow. Layout gets faster, because computing it no longer crosses the JS-native boundary repeatedly, though that is incremental. The bigger one is that concurrent React starts working: useTransition and Suspense need a renderer that can start a render, decide it is stale and throw it away, and the old renderer could not do that because it had already posted the instructions across the bridge. Fabric holds the tree itself, so it can. I would lead with the capability rather than the speedup, because the speedup is a percentage and the capability is something you simply could not do before.',
        traps: [
          'Describing Fabric as "the fast renderer" only. The concurrent React support is the part that was impossible before, not merely slower.',
          'Confusing the shadow tree with the virtual DOM. The virtual DOM is React\'s element tree; the shadow tree is React Native\'s layout tree, and Yoga is what runs over it.',
          'Thinking Fabric replaces Yoga. Yoga still does the flexbox maths — what changed is that the tree it walks no longer lives partly in JavaScript.',
          'Assuming <code>useTransition</code> works the moment you upgrade React. It needs Fabric underneath, which is why an app on the interop layer for a given component does not get concurrent behaviour there.'
        ]
      },
      {
        id: 'rn-fabric-breaks',
        title: 'Three behaviours that change the day you switch',
        tags: ['rendering', 'migration', 'hot'],
        ask: 'What actually breaks in your components when Fabric is turned on?',
        read: 'new-native-components',
        body: [
          { p: 'Almost nothing about writing components changes. The exceptions are few, specific, and all about <b>reaching around React to touch a native view directly</b> — which is exactly what Fabric stopped allowing.' },
          { p: '<b>One. <code>setNativeProps</code> is gone.</b>' },
          { p: 'It let you mutate a native view without re-rendering, which was the old escape hatch for cheap animation. It is not supported under Fabric and there is no direct replacement, because it breaks the model: Fabric owns the tree, and a value written behind its back is a value it does not know about.' },
          {
            code: {
              lang: 'jsx',
              src: `// Gone
ref.current?.setNativeProps({ style: { opacity: 0.5 } });

// Put it in state, or hand it to Reanimated, which owns its own
// UI-thread runtime and is the intended answer for animation.
const opacity = useSharedValue(1);
opacity.value = withTiming(0.5, { duration: 300 });`
            }
          },
          { p: '<b>Two. <code>findNodeHandle</code> is deprecated.</b> It existed to turn a component into an opaque native tag you could pass to imperative APIs. Use the ref directly.' },
          { p: '<b>Three — and this is the one that produces real bugs — <code>ref</code> callbacks now fire before layout is committed.</b>' },
          { p: 'Under the old renderer a ref callback ran after the layout pass, so measuring inside it gave you real numbers. With the shadow tree in C++, refs fire earlier: the view exists, but its position and size have not been committed yet. Measure there and you get zeros, or stale values from the previous layout.' },
          {
            code: {
              lang: 'jsx',
              src: `// Unreliable under Fabric — the layout is not committed yet
<View ref={(node) => { node?.measureInWindow(readSize); }} />

// Reliable — onLayout fires with the committed geometry
<View onLayout={(e) => setBox(e.nativeEvent.layout)} />

// Also reliable — measure in an effect, after the commit
useLayoutEffect(() => {
  ref.current?.measureInWindow((x, y, width, height) => {
    setBox({ x, y, width, height });
  });
}, []);`
            }
          },
          { p: 'The nasty part is the failure mode. It is not a crash and it is not consistent — it is a layout that is subtly wrong sometimes, usually on a slower device, and usually not on the machine where you are debugging it.' },
          {
            note: [
              '<b>One correction to how this is often written up.</b> You will read that under Fabric "<code>measure()</code> is now synchronous" and that callback-based measurement is gone. That overstates it.',
              '<code>measure</code> and <code>measureInWindow</code> <b>still take a callback</b> — React Native\'s own documentation uses exactly that shape in its New Architecture examples.',
              'What changed is <i>when</i> the callback runs. It no longer needs an async round trip over the bridge, so the measurement and the state update it triggers can land in the same commit. That is what makes the <code>useLayoutEffect</code> pattern above work without a visible jump — and it is a timing change, not an API change.',
              'Worth getting right, because "the API changed" and "the timing changed" lead to different migrations.'
            ]
          }
        ],
        say:
          'Very little about writing components changes. What breaks is code that reaches around React to touch a native view. setNativeProps is gone with no direct replacement — it let you mutate a view without re-rendering, and Fabric cannot allow a value written behind its back — so that becomes state, or Reanimated for animation. findNodeHandle is deprecated in favour of using the ref. And the one that causes real bugs: ref callbacks now fire before layout is committed, because the shadow tree is in C++, so measuring inside a ref callback gives you zeros or stale numbers. The fix is onLayout, or measuring inside useLayoutEffect. I would add one precision — people say measure became synchronous and callbacks are gone, but the API still takes a callback; what changed is that it no longer needs a bridge round trip, so the measurement and the state update land in the same commit. It is a timing change, not an API change.',
        traps: [
          'Saying <code>measure()</code> lost its callback. It did not. React Native\'s own New Architecture docs still pass one — what changed is when it fires.',
          'Looking for a drop-in replacement for <code>setNativeProps</code>. There is not one, deliberately. The answer is state, or Reanimated.',
          'Measuring in a <code>ref</code> callback and assuming the numbers are good. They are not committed yet, and the bug only shows on slower devices.',
          'Treating this as a performance regression. It is a correctness change — the values were always racy, and Fabric stopped hiding it.'
        ]
      }
    ]
  });

  P.modules.push({
    id: 'rn-turbo',
    track: 'rn-newarch',
    title: 'TurboModules and CodeGen',
    kicker: 'Module 03',
    blurb:
      'The third piece, and the one with the clearest single benefit: native modules stopped being loaded all at once, and their shape stopped being a promise nobody checked.',
    concepts: [
      {
        id: 'rn-turbomodules',
        title: 'Loaded when you touch them, not at startup',
        tags: ['native', 'performance'],
        ask: 'What do TurboModules change, and where does the cold start win come from?',
        read: 'lazy-loading',
        body: [
          { p: 'Under the legacy system, every native module in the app was initialised <b>at startup</b>. All of them, before the first screen appeared, whether or not that launch would ever use them.' },
          { p: 'That means startup cost scaled with your dependency list rather than with the screen you were opening. An app with forty native modules paid for forty on every cold start to show a login form that needed two.' },
          { p: 'TurboModules load on first access instead.' },
          {
            code: {
              lang: 'ts',
              src: `// Legacy — the whole registry was already initialised at boot
import { NativeModules } from 'react-native';
const { MyCamera } = NativeModules;

// TurboModule — nothing native happens until this line runs
import { TurboModuleRegistry } from 'react-native';
const MyCamera = TurboModuleRegistry.get('MyCamera');`
            }
          },
          { p: 'So the camera module is initialised when the user opens the camera screen, not while they are looking at a splash screen. <b>That is where the cold start improvement in the benchmarks comes from</b> — not from any single module being faster, but from most of them not running yet.' },
          { p: 'Which also tells you who benefits. An app with a handful of native dependencies will barely notice. An app carrying thirty of them, most used on one screen each, is the case this was designed for.' }
        ],
        say:
          'The legacy system initialised every native module at startup, so cold start cost scaled with the dependency list rather than with the screen being opened — forty modules initialised to show a login form that needed two. TurboModules load on first access through TurboModuleRegistry.get, so the camera module initialises when someone opens the camera screen, not during the splash. That is where the cold start numbers come from: not any module being faster, just most of them not running yet. It also tells you who benefits — an app with a few native dependencies barely notices, an app with thirty of them each used on one screen is exactly the case it was built for.',
        traps: [
          'Saying TurboModules are "faster". Individual calls are faster because of JSI; the TurboModule contribution specifically is that most modules never initialise at all on a given launch.',
          'Expecting a cold start win on an app with few native dependencies. The saving is proportional to what you were loading and not using.',
          'Forgetting the first-access cost has to land somewhere. It moves to the screen that needs the module, which is usually the right trade but is worth saying rather than glossing.'
        ]
      },
      {
        id: 'rn-codegen',
        title: 'CodeGen makes the TypeScript spec the contract',
        tags: ['native', 'tooling'],
        ask: 'How does CodeGen work, and what does it actually prevent?',
        read: 'type-safety-via-codegen',
        body: [
          { p: 'Under the legacy system, a native module\'s shape was an informal agreement. JavaScript believed whatever the module claimed. If the native method was renamed, or returned a string where the JS expected a number, nothing complained until it ran — as <code>undefined is not a function</code>, on a device, usually only on one platform.' },
          { p: 'CodeGen inverts that. You write a TypeScript spec, and it <b>generates the native interfaces both platforms have to implement</b>.' },
          {
            code: {
              lang: 'ts',
              src: `// NativeDeviceInfo.ts — the spec is the source of truth
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getDeviceName(): string;                        // synchronous
  requestCameraPermission(): Promise<boolean>;    // async
  capturePhoto(quality: number): Promise<string>; // file URI
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfo');`
            }
          },
          { p: 'At build time CodeGen reads that file and emits the C++, Objective-C and Java interfaces. The native side must now satisfy a generated interface, so a rename or a wrong return type is a <b>compile error on the platform that got it wrong</b>, rather than a crash on a user\'s phone.' },
          { p: 'The return types carry real meaning too. <code>getDeviceName(): string</code> declares a synchronous call; <code>requestCameraPermission(): Promise&lt;boolean&gt;</code> declares an async one. The spec is where you decide which, and JSI is what makes the synchronous option available at all.' },
          { p: 'One detail worth knowing because it shows up in real modules: the lookup has two forms.' },
          {
            list: [
              '<code>TurboModuleRegistry.get(name)</code> returns <code>null</code> if the module is absent. Use it when the module is genuinely optional.',
              '<code>TurboModuleRegistry.getEnforcing(name)</code> throws instead. Use it for a module your code cannot function without, so a broken link fails loudly at startup rather than as a null dereference three screens in.'
            ]
          }
        ],
        say:
          'A legacy native module had no enforced shape — JavaScript trusted whatever it claimed, so a renamed method or a wrong return type surfaced as undefined is not a function, on a device, often on only one platform. CodeGen inverts that: you write a TypeScript spec extending TurboModule, and at build time it generates the C++, Objective-C and Java interfaces the native side has to implement. So a mismatch becomes a compile error on the platform that got it wrong instead of a runtime crash. The spec also declares which calls are synchronous and which return promises, and JSI is what makes the synchronous option possible in the first place. I would also mention the two lookups — get returns null for a genuinely optional module, getEnforcing throws, which is what you want for a module the app cannot run without.',
        traps: [
          'Describing CodeGen as generating TypeScript types <i>from</i> native code. It runs the other way: the TypeScript spec is the input, and the native interfaces are the output.',
          'Thinking it is a runtime validator. It is a build-time contract — the whole benefit is that the failure moves from a device to a compiler.',
          'Using <code>get</code> everywhere. If the app cannot work without the module, <code>getEnforcing</code> turns a confusing null into a clear startup failure.',
          'Ignoring what the return type declares. <code>string</code> and <code>Promise&lt;string&gt;</code> generate different native signatures — that choice is a design decision, not a formality.'
        ]
      }
    ]
  });
})(window.PREP);
