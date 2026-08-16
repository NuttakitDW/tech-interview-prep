/* Event loop simulator — hand-authored frames, not a real interpreter.

   Each frame is a snapshot of the four things worth watching: the call stack,
   the two queues, and what has been printed. A frame inherits every field it
   does not set from the frame before it, so the authoring below only records
   what actually changed at that step.

   phase is one of:
     task    step 1 — run ONE task to completion
     drain   step 2 — empty the microtask queue, all of it
     render  step 3 — style, layout, paint, composite
     frozen  the render step that never arrives

   Three runs, each isolating one rule:
     order   microtasks beat tasks, and nesting does not defer
     starve  draining to exhaustion is what lets a promise loop kill a frame
     polite  the same infinite loop, one task at a time, stays paintable */
(function (P) {
  P.sims = P.sims || {};

  P.sims.eventloop = {
    title: 'Run the loop yourself',
    caption: 'Three runs of the same machine',

    runs: [
      {
        id: 'order',
        label: 'Ordering',
        blurb:
          'The timer is queued <b>before</b> the promise, and still prints last. Watch which queue each callback lands in.',
        code: [
          "console.log('1 sync');",
          "setTimeout(() => console.log('5 task'), 0);",
          'Promise.resolve().then(() => {',
          "  console.log('3 microtask');",
          "  Promise.resolve().then(() => console.log('4 nested'));",
          '});',
          "console.log('2 sync');"
        ],
        frames: [
          {
            phase: 'task', line: null, stack: ['(script)'], micro: [], macro: [], out: [],
            note: 'The script is itself a task. It goes on the stack and runs top to bottom. Nothing else can happen until it finishes.'
          },
          {
            line: 0, stack: ['(script)', "log('1 sync')"],
            note: 'A function call goes on the stack.'
          },
          {
            stack: ['(script)'], out: ['1 sync'],
            note: 'It returns and pops off. Printed immediately, because this is ordinary synchronous code.'
          },
          {
            line: 1, stack: ['(script)', 'setTimeout(fn, 0)'],
            note: 'setTimeout is called. It does <b>not</b> run fn — it hands fn to the browser and returns straight away.'
          },
          {
            stack: ['(script)'], macro: ["fn - '5 task'"],
            note: 'Even at 0ms the callback is queued as a <b>task</b>. It is first in line, and it will still go last.'
          },
          {
            line: 2, stack: ['(script)', '.then(fn)'],
            note: 'The promise is already resolved, so .then registers its callback right now.'
          },
          {
            stack: ['(script)'], micro: ['then #1'],
            note: 'But it lands in the <b>microtask</b> queue — a different queue, with a different priority.'
          },
          {
            line: 6, stack: ['(script)', "log('2 sync')"],
            note: 'Execution never paused at the promise. It carried straight on to the last line.'
          },
          {
            stack: ['(script)'], out: ['1 sync', '2 sync'],
            note: 'Both synchronous logs are done. Neither queue has been touched yet.'
          },
          {
            line: null, stack: [],
            note: 'The script finishes and the stack empties. <b>This is the moment the event loop takes over</b> — not a moment earlier.'
          },
          {
            phase: 'drain', stack: ['then #1'], micro: [],
            note: 'Step 2 of the turn: drain the microtask queue. Not one of them — all of them.'
          },
          {
            line: 3, stack: ['then #1', "log('3 microtask')"],
            note: 'Inside the microtask now.'
          },
          {
            stack: ['then #1'], out: ['1 sync', '2 sync', '3 microtask'],
            note: 'Prints third — ahead of the timer, even though the timer was queued two lines earlier.'
          },
          {
            line: 4, stack: ['then #1', '.then(fn)'],
            note: 'This microtask queues another microtask.'
          },
          {
            stack: ['then #1'], micro: ['then #2'],
            note: 'then #2 joins the queue that is <b>currently being drained</b>.'
          },
          {
            stack: [],
            note: 'then #1 returns. The queue is not empty, so the drain keeps going — in the same turn, before anything else.'
          },
          {
            stack: ['then #2'], micro: [], line: 4,
            note: 'then #2 runs now. It does not wait for the next turn, and it does not wait for the timer.'
          },
          {
            stack: [], out: ['1 sync', '2 sync', '3 microtask', '4 nested'],
            note: 'Prints fourth. Only now is the microtask queue actually empty.'
          },
          {
            phase: 'render', line: null,
            note: 'Step 3: the browser may paint. This is its first opportunity since the turn began.'
          },
          {
            phase: 'task', stack: ["fn - '5 task'"], macro: [],
            note: 'Step 4: back to the top. Take exactly ONE task off the queue and run it.'
          },
          {
            line: 1, stack: ["fn - '5 task'", "log('5 task')"],
            note: 'The timer callback finally executes.'
          },
          {
            stack: [], line: null, out: ['1 sync', '2 sync', '3 microtask', '4 nested', '5 task'],
            note: 'Queued first, printed last. A task always waits for every pending microtask — that is the whole lesson.'
          }
        ]
      },

      {
        id: 'starve',
        label: 'Starvation',
        blurb:
          'An endless <b>promise</b> chain. The queue is drained to exhaustion, and it never reaches exhaustion — so the frame never comes.',
        code: [
          'function starve() {',
          '  Promise.resolve().then(starve);',
          '}',
          '',
          'starve();'
        ],
        frames: [
          {
            phase: 'task', line: 4, stack: ['(script)', 'starve()'], micro: [], macro: [], out: [],
            note: 'The first call runs as part of the script.'
          },
          {
            line: 1, stack: ['(script)', 'starve()', '.then(fn)'],
            note: 'It queues itself as a microtask.'
          },
          {
            stack: [], micro: ['starve #1'], line: null,
            note: 'The script finishes. One microtask is waiting.'
          },
          {
            phase: 'drain', stack: ['starve #1'], micro: [],
            note: 'Step 2 begins: drain the microtask queue.'
          },
          {
            line: 1, stack: ['starve #1', '.then(fn)'],
            note: 'But running it queues another one.'
          },
          {
            stack: [], micro: ['starve #2'],
            note: 'The queue is not empty, so the drain continues. Step 3 is not reached.'
          },
          {
            stack: ['starve #2'], micro: [],
            note: 'Same again.'
          },
          {
            stack: [], micro: ['starve #3'],
            note: 'And again. Every microtask adds its own replacement before returning.'
          },
          {
            phase: 'frozen', stack: ['starve #4'], micro: ['starve #5'],
            note: 'The drain can never complete, so <b>the render step never runs</b>. The tab stops painting, scrolling and responding — permanently.'
          }
        ]
      },

      {
        id: 'polite',
        label: 'One at a time',
        blurb:
          'The <b>same</b> infinite loop, written with setTimeout. Identical logic, and the page stays perfectly responsive.',
        code: [
          'function polite() {',
          '  setTimeout(polite, 0);',
          '}',
          '',
          'polite();'
        ],
        frames: [
          {
            phase: 'task', line: 4, stack: ['(script)', 'polite()'], micro: [], macro: [], out: [],
            note: 'Same shape as the last run: a function that schedules itself forever.'
          },
          {
            line: 1, stack: ['(script)', 'setTimeout(fn, 0)'],
            note: 'This time it schedules itself as a task, not a microtask.'
          },
          {
            stack: [], macro: ['polite #1'], line: null,
            note: 'The script finishes and the stack empties.'
          },
          {
            phase: 'drain', micro: [],
            note: 'Step 2 runs and finds the microtask queue already empty. It completes instantly.'
          },
          {
            phase: 'render',
            note: 'Step 3 is reached. <b>The browser paints.</b> This is the difference.'
          },
          {
            phase: 'task', stack: ['polite #1'], macro: [],
            note: 'Step 4: take ONE task and run it. Only one, however many are waiting.'
          },
          {
            line: 1, stack: ['polite #1', 'setTimeout(fn, 0)'],
            note: 'It queues its replacement — for the next turn, not this one.'
          },
          {
            stack: [], macro: ['polite #2'], line: null,
            note: 'The task returns. The turn is over.'
          },
          {
            phase: 'drain', note: 'Microtasks: still empty.' },
          {
            phase: 'render',
            note: 'And the browser paints again. An infinite loop that never blocks a frame, because each iteration is a separate task.'
          }
        ]
      }
    ]
  };
})(window.PREP);
