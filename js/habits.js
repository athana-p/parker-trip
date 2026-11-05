// ================= PARKER'S HABITS (edit me) =================
// Everything about how Parker behaves at home lives here, so his personality can be tuned without touching
// the game code. Durations are in seconds. Weights are relative.
//
// Who he is (from his family):
//  - sighs when he's happy                         → 'sigh' (idle, after being tapped, after a belly rub)
//  - loves belly rubs                              → hold or rub on him: he rolls over, paws up; lets out a sigh after
//  - runs over to nose-boop hair being blow-dried  → when you gather a fluffy puff, he trots over to boop the flying seeds
//  - loves playing ball                            → stage 2: ball toy (shop)
//  - shakes his plush toy side to side             → stage 2: plush toy (shop)
//  - comes running at the sound of a plastic bag   → stage 2: opening the shop / backpack brings him over
//  - weather (stage 3): watches the rain from under the eave (and dashes out, gets wet, shakes off), naps in the
//    sun then rolls belly-up, chases a blown leaf or petal, snaps at snowflakes (snow on his nose, paw prints),
//    lies flat in the shade on a hot summer afternoon, wanders slowly sniffing in the fog
const HABITS = {
  // what he does next when he's free, per time of day
  idle: {
    morning: { sit: 3, trot: 4, sniff: 2, look: 2, lie: 1, nap: 0.5, sigh: 1 },
    day:     { sit: 3, trot: 3, sniff: 2, look: 2, lie: 2, nap: 1, sigh: 1 },
    dusk:    { sit: 4, trot: 2, sniff: 1, look: 2, lie: 3, nap: 1, sigh: 1.5 },
    evening: { sit: 3, lie: 3, look: 2, sniff: 1, trot: 1, sigh: 2, nap: 1 },   // 19:00–22:00: night sky, but he's still up
    company: { sit: 3, lie: 3, sigh: 2, look: 1 },                   // woken up at night to keep you company: stays close
    night:   { sleep: 1 },            // from bedtime he goes to his door and sleeps
  },
  bedtime: [22, 5],                    // he sleeps from 22:00 to 05:00 (real time)
  duration: { sit: [5, 10], sniff: [2, 4], look: [2.5, 4], lie: [8, 16], nap: [15, 30], sleep: [60, 120], chew: [8, 14], eat: [3, 5], pant: [14, 22] },
  trotSpeed: 62,                       // scene units per second
  blinkEvery: [2.5, 5],                // a blink now and then while his eyes are open
  // tapped while awake: one of these (never the same twice in a row)
  reactions: ['wag', 'tilt', 'hop'],
  reactionTime: { wag: 1.6, tilt: 1.5, hop: 1.0 },
  sighAfterHappy: 0.5,                 // chance of a contented sigh once a happy moment ends
  sighTime: 2.4,                       // breathe in… (held) …and out
  bellyRub: { hold: 0.55, rubDistance: 40, endTime: 0.5 },   // press this long, or rub this far, to start
  fluffChase: 0.8,                     // chance he runs over to boop the seeds of a puff you gathered
  // toys he owns join his free-time choices (not at night), plus a snack at his bowl
  toys: { ball: 2.5, duck: 2, bone: 1.5 }, eat: 0.8,
  ballRounds: 3,                       // pushes of the ball before he flops down for a sigh
  // throw and fetch (you drag the ball and let go)
  fetchSpeed: 112,                     // he runs faster after a thrown ball
  waitThrow: 12,                       // seconds he sits wagging, waiting for the next throw
  fetchTire: 6,                        // after this many throws he lies down to catch his breath (pant), then wants to play again
  shakeTime: 2.4,                      // shaking the plush duck side to side
  expectTime: 6,                       // sitting in front of you after hearing the bag
  // tapped while asleep: he stirs, sighs, and keeps sleeping
  stirTime: 1.4,
  wakeTaps: 3,                         // tap him this many times quickly while he sleeps and he gets up to keep you company
  companyTime: 150,                    // …for this many seconds, then back to bed
  // weather: extra free-time choices on top of the usual ones; `calm` scales the usual ones (not at night)
  weather: {
    rain:  { add: { shelter: 7, splash: 1.2 }, calm: 0.25 },   // under the eave watching; now and then a dash out into it
    sunny: { add: { sunbathe: 1.6 }, calm: 1 },                // a nap in the sun, then belly-up (morning and day only)
    wind:  { add: { chase: 2.6 }, calm: 0.8 },                 // chases a leaf or petal blowing past
    snow:  { add: { snap: 2.6, snowwalk: 2.2 }, calm: 0.6 },   // snaps at flakes; walks about leaving paw prints
    hot:   { add: { flat: 5 }, calm: 0.35 },                    // hot summer afternoon: flat out in the shade
    fog:   { add: { fogsniff: 4.5 }, calm: 0.4 },              // wanders slowly, sniffing
    cloudy: { add: {}, calm: 1 },
  },
  wxTime: { shelter: [10, 20], wet: [2.5, 4], shakeOff: 1.3, sunnap: [10, 18], sunbelly: 4.5, chase: [2.4, 3.4], snap: 2.6, flat: [14, 24] },
  slowSpeed: 24,                       // walking in the fog
  chaseSpeed: 108,                     // after a blown leaf
  noseSnow: 9,                         // seconds the snow stays on his nose
  giftSniff: 1.2,
  // the neighbour's cat comes by while he's home: they say hello (nose boop / he play-bows, she pats his nose / sit side by side)
  catPlay: { boop: 3, bow: 2, side: 2 }, catPlayChance: 0.8,                      // a visitor's gift lying in the yard: he goes over to sniff it (stage 4)
  printEvery: 13,                      // a paw print every this many scene units walked in snow
};

