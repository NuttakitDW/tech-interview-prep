/* React Native — architecture, threads, lists, animation, native. */
(function (P) {
  P.modules.push({
    id: 'rn',
    track: 'frontend',
    title: 'React Native on device',
    kicker: 'Module 06',
    blurb:
      'React Native questions separate people who shipped an app from people who ran one. Expect the threading model, list performance, and how you talk to native code.',
    concepts: [
      {
        id: 'rn-arch',
        title: 'Old bridge vs the new architecture',
        tags: ['architecture', 'hot'],
        ask: 'How does JavaScript talk to native code?',
        body: [
          { p: '<b>Old architecture:</b> JS and native ran on separate threads and communicated over an asynchronous bridge that serialised every message to JSON. Batched, async, one queue — so a fast gesture or a big list could saturate it and drop frames.' },
          { p: '<b>New architecture</b> (default since 0.76, and the only option from 0.82): JSI lets JavaScript hold references to C++ objects and call them synchronously, with no serialisation.' },
          {
            list: [
              '<b>JSI</b> — the C++ interface replacing the bridge.',
              '<b>Fabric</b> — the new renderer. The shadow tree lives in C++, shared across platforms, and supports concurrent React.',
              '<b>TurboModules</b> — native modules loaded lazily on first use instead of all at startup.',
              '<b>Codegen</b> — generates typed native interfaces from your TypeScript spec, so a signature mismatch fails at build time.',
              '<b>Hermes</b> — the default engine. Ahead-of-time bytecode, so startup does not pay a parse cost.'
            ]
          },
          { p: 'What is not different: React Native renders real native views, not a webview. <code>View</code> becomes <code>UIView</code> or <code>android.view.View</code>. It is not a hybrid framework.' }
        ],
        say:
          'The old bridge was an async JSON queue between two threads. The new architecture replaces it with JSI, which lets JS hold direct references to C++ objects, plus Fabric for rendering, TurboModules for lazy native modules, and Codegen for type-safe interfaces.',
        traps: [
          'Describing React Native as a webview.',
          'Not knowing the new architecture is now the default — this dates you immediately.',
          'Claiming the bridge made things "slow" without saying why: serialisation and a single async queue.'
        ]
      },
      {
        id: 'rn-threads',
        title: 'The three threads',
        tags: ['performance', 'hot'],
        ask: 'Why does the UI freeze when your JavaScript is busy?',
        body: [
          {
            list: [
              '<b>JS thread</b> — your React code, business logic, and by default every animation driven from JavaScript. One thread. Block it and nothing updates.',
              '<b>Main/UI thread</b> — native rendering, touch handling, native animation. Block it and the app is visibly frozen.',
              '<b>Shadow thread</b> — Yoga computes flexbox layout off the main thread.'
            ]
          },
          { p: 'A slow render, a large <code>JSON.parse</code>, or a heavy filter runs on the JS thread. Native scrolling keeps moving because it lives on the UI thread, but anything React needs to draw stalls — which is why a list can scroll to a blank area.' },
          {
            code: {
              lang: 'jsx',
              src: `// blocks the JS thread: nothing else runs, including your animation
const parsed = JSON.parse(hugePayload);

// InteractionManager: wait for animations/gestures to finish
InteractionManager.runAfterInteractions(() => {
  buildExpensiveIndex(data);
});

// Reanimated worklets run on the UI thread instead
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(offset.value) }],
}));   // survives a busy JS thread`
            }
          },
          { p: 'Two frame budgets to quote: 16 ms at 60 fps, about 8 ms on a 120 Hz screen. Miss it and the user sees a dropped frame.' }
        ],
        say:
          'JS thread for logic and React, main thread for native rendering and touch, shadow thread for layout. Anything expensive on the JS thread starves rendering, so heavy work is deferred, chunked, or moved to the UI thread with Reanimated worklets.',
        traps: [
          'Doing heavy parsing or sorting in a render or a scroll handler.',
          'Animating with <code>useNativeDriver: false</code> on a busy screen.',
          'Assuming a fast simulator means a fast device — always profile a release build on real hardware.'
        ]
      },
      {
        id: 'rn-lists',
        title: 'Lists that do not stutter',
        tags: ['performance', 'hot'],
        ask: 'The feed drops frames after a hundred items. Why?',
        body: [
          { p: '<code>ScrollView</code> mounts every child immediately — fine for a settings screen, fatal for a feed. <code>FlatList</code> virtualises: it renders a window around the viewport and unmounts what scrolls away.' },
          {
            code: {
              lang: 'jsx',
              src: `const renderItem = useCallback(({ item }) => <Row item={item} />, []);
const keyExtractor = useCallback(item => item.id, []);

<FlatList
  data={data}
  renderItem={renderItem}          // stable identity, not an inline arrow
  keyExtractor={keyExtractor}
  getItemLayout={(_, i) => (       // skips measurement — fixed heights only
    { length: ROW, offset: ROW * i, index: i }
  )}
  initialNumToRender={8}
  maxToRenderPerBatch={8}
  windowSize={7}
  removeClippedSubviews
/>

const Row = memo(function Row({ item }) { ... });   // memoise the row`
            }
          },
          {
            list: [
              'Blank space while scrolling fast means rendering cannot keep up — lower <code>maxToRenderPerBatch</code>, simplify the row, or add <code>getItemLayout</code>.',
              'Never nest a <code>VirtualizedList</code> inside a <code>ScrollView</code> on the same axis: virtualisation stops working and you get the warning.',
              'Use <code>ListHeaderComponent</code> rather than wrapping the list in a ScrollView.',
              'FlashList from Shopify recycles views and is usually a drop-in win for complex rows.'
            ]
          }
        ],
        say:
          'FlatList virtualises where ScrollView does not. The wins come from a memoised row, stable renderItem and keyExtractor references, getItemLayout when heights are fixed, and tuning the window props — or FlashList when rows are heavy.',
        traps: [
          'Inline arrow functions for <code>renderItem</code>, defeating every memo below.',
          'Anonymous inline styles in the row, allocating on every render.',
          'A ScrollView holding hundreds of items.'
        ]
      },
      {
        id: 'rn-anim',
        title: 'Animation and gestures',
        tags: ['ux'],
        ask: 'What does useNativeDriver actually do?',
        body: [
          { p: 'With the native driver, the animation definition is serialised to the native side once and driven entirely on the UI thread. Your JS thread can then be busy and the animation still runs at full frame rate. Without it, every frame is computed in JavaScript and pushed across.' },
          { p: 'The limitation: the native driver only handles properties that do not require layout — <code>transform</code>, <code>opacity</code>. Animating <code>width</code>, <code>height</code>, <code>top</code>, or <code>flex</code> forces layout, so it stays on the JS thread. Animate <code>scale</code> and <code>translate</code> instead.' },
          {
            code: {
              lang: 'jsx',
              src: `Animated.timing(fade, {
  toValue: 1,
  duration: 240,
  useNativeDriver: true,       // transform + opacity only
}).start();

// Reanimated 3: the worklet itself runs on the UI thread
const offset = useSharedValue(0);
const pan = Gesture.Pan()
  .onChange(e => { offset.value += e.changeX; })    // no round trip
  .onEnd(() => { offset.value = withSpring(0); });`
            }
          },
          { p: 'For anything gesture-driven, Reanimated plus Gesture Handler is the standard answer: gestures are recognised natively and worklets run on the UI thread, so the interaction never depends on JS thread availability.' }
        ],
        say:
          'useNativeDriver hands the animation to the UI thread so it survives a busy JS thread, but it only covers transform and opacity. Gesture-driven work goes to Reanimated worklets and Gesture Handler for the same reason.',
        traps: [
          'Animating height or margin and wondering why it stutters.',
          'Setting <code>useNativeDriver: true</code> on an unsupported property and getting a runtime error.',
          'Driving animation from React state, re-rendering on every frame.'
        ]
      },
      {
        id: 'rn-platform',
        title: 'Where React Native is not React DOM',
        tags: ['core'],
        ask: 'What surprises a web React developer on their first React Native screen?',
        body: [
          {
            list: [
              'No DOM. <code>View</code>, <code>Text</code>, <code>Image</code>, <code>Pressable</code>, <code>ScrollView</code>. Every string must sit inside a <code>Text</code>.',
              'Styles are JavaScript objects, not CSS. No cascade, no inheritance except limited text styles, no media queries, no <code>%</code> for most things.',
              '<code>flexDirection</code> defaults to <code>column</code>, and <code>flex: 1</code> means "fill the parent".',
              'Units are density-independent pixels, not CSS pixels. Use <code>Dimensions</code>, <code>useWindowDimensions</code>, and <code>PixelRatio</code>.',
              'Shadows differ: <code>shadow*</code> props on iOS, <code>elevation</code> on Android.',
              'Overflow is not clipped the same way on Android, and <code>zIndex</code> behaves differently.'
            ]
          },
          {
            code: {
              lang: 'jsx',
              src: `const styles = StyleSheet.create({
  card: {
    padding: 16,
    ...Platform.select({
      ios:     { shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
});

// platform-specific files resolve automatically:
//   Button.ios.tsx / Button.android.tsx  ->  import Button from './Button'

const { top } = useSafeAreaInsets();     // notches, dynamic island, gesture bar`
            }
          },
          { p: 'Navigation is React Navigation in practice — use the native stack, which delegates to <code>UINavigationController</code> and Fragments so transitions and gestures feel native.' }
        ],
        say:
          'No DOM and no CSS: native components with JavaScript style objects, flex defaulting to column, and real platform differences in shadows, safe areas, and back-button behaviour. Platform.select and .ios/.android files keep that divergence explicit.',
        traps: [
          'A bare string outside <code>Text</code> — a crash, not a warning.',
          'Assuming a layout that works on iOS works on Android.',
          'Ignoring safe-area insets and hiding content under the notch or gesture bar.'
        ]
      },
      {
        id: 'rn-native',
        title: 'Native modules and the release path',
        tags: ['ops'],
        ask: 'You need a capability React Native does not expose. Now what?',
        body: [
          { p: 'Check the ecosystem first, then write a TurboModule: declare a TypeScript spec, run Codegen for the typed native interface, implement it in Swift/Kotlin, and register it. For a native view, a Fabric component wraps a platform view instead.' },
          {
            code: {
              lang: 'ts',
              src: `// NativeBiometrics.ts — the spec Codegen reads
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Biometrics');`
            }
          },
          {
            list: [
              '<b>Expo vs bare</b> — Expo with config plugins and prebuild now covers most native needs; ejecting is no longer the default fate.',
              '<b>OTA updates</b> — Expo Updates or a CodePush-style service ship JS-only changes without review. Native changes still need a store build.',
              '<b>Startup</b> — Hermes bytecode, lazy TurboModules, and deferring non-critical work off the first frame.',
              '<b>Profiling</b> — always a release build on a real device. Flipper is deprecated; use the React Native DevTools, Xcode Instruments, and Android Studio profiler.'
            ]
          },
          { p: 'Secrets do not belong in the bundle. Anything shipped in JavaScript is readable — use the Keychain or Keystore for tokens and keep secrets server-side.' }
        ],
        say:
          'Look for an existing library, otherwise a TurboModule: TypeScript spec, Codegen, native implementation. Ship JS-only fixes over the air, keep native changes on the store cadence, and profile release builds on real devices.',
        traps: [
          'Benchmarking a debug build — Hermes and the JS thread behave very differently.',
          'Storing API keys or tokens in the JS bundle or AsyncStorage.',
          'Assuming OTA can ship a native dependency upgrade.'
        ]
      }
    ]
  });
})(window.PREP);
