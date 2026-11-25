// ================= DATA: shop items, destinations, trip rules =================
// food decides how long a trip lasts; charms raise the chance of a rare place; toys stay home for him to play with
const ITEMS = [
  { id: 'onigiri', cat: 'food', price: 6, hours: [2, 3] },
  { id: 'jerky', cat: 'food', price: 12, hours: [3, 5] },
  { id: 'bento', cat: 'food', price: 20, hours: [5, 8] },
  { id: 'clover', cat: 'charm', price: 15, rare: 0.12 },
  { id: 'omamori', cat: 'charm', price: 30, rare: 0.25 },
  { id: 'ball', cat: 'toy', price: 10 },
  { id: 'duck', cat: 'toy', price: 16 },
  { id: 'bone', cat: 'toy', price: 12 },
  { id: 'bubbles', cat: 'toy', price: 14 },
  { id: 'rope', cat: 'toy', price: 12 },
  { id: 'kite', cat: 'toy', price: 18, weather: 'wind' },        // only flies on windy days
  { id: 'sprinkler', cat: 'toy', price: 22, weather: 'sun' },    // only on sunny days (not in winter, not at night)
  { id: 'seed', cat: 'snack', price: 4, pal: 'sparrow' },    // snacks for the little visitors: put one out in the yard
  { id: 'nuts', cat: 'snack', price: 5, pal: 'squirrel' },
  { id: 'fish', cat: 'snack', price: 6, pal: 'cat' },
  { id: 'yarn', cat: 'toy', friend: 'cat' },          // gifts from friends (not sold): after the second time he meets them
  { id: 'temari', cat: 'toy', friend: 'kinako' },
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const CATS = ['food', 'charm', 'toy', 'snack'];

// real places; ★ rare ones are more likely with a charm
const DESTS = [
  { id: 'chiangmai' }, { id: 'pai' }, { id: 'krabi' }, { id: 'floatingmarket' }, { id: 'inthanon' }, { id: 'fuji' },
  { id: 'fushimi' }, { id: 'guilin' }, { id: 'swiss' }, { id: 'istanbul' }, { id: 'egypt' },
  { id: 'hoian' }, { id: 'bali' }, { id: 'venice' }, { id: 'santorini' }, { id: 'holland' }, { id: 'paris' },
  { id: 'furano', rare: true }, { id: 'dunhuang', rare: true }, { id: 'tekapo', rare: true }, { id: 'kenya', rare: true }, { id: 'antarctica', rare: true },
];
const TRIP = {
  baseRare: 0.08,                 // chance of a ★ place without a charm
  decideMinutes: [2, 20],         // once packed, he picks his own moment to leave within this window
  cards: { none: 0.2, two: 0.15, twoMinHours: 4 },   // postcards per trip: 0, 1 or 2
  souvenirChance: 0.6,            // only for a place whose souvenir isn't on the shelf yet
  friendChance: 0.5,              // chance he meets the friend who lives where he goes
  friendOnCard: 0.6,              // once they've met, chance a card from that place shows them together
};
// friends he can meet on his trips: each lives in one place
const FRIENDS = [
  { id: 'cat', place: 'istanbul' }, { id: 'peafowl', place: 'inthanon' }, { id: 'kinako', place: 'fushimi' }, { id: 'fennec', place: 'dunhuang' },
];
const FRIEND_TOY = { cat: 'yarn', kinako: 'temari' };     // the friend's present, brought home after they meet a second time
const friendAt = place => (FRIENDS.find(f => f.place === place) || {}).id || null;
// small visitors in the yard (stage 4): a sparrow, the neighbour's cat, a squirrel. They come mostly while he's away,
// never at night or in heavy rain, and sometimes leave a little gift on the ground (tap to pick it up).
const VISIT = {
  awayEvery: [60, 180],           // seconds between visits while he's away (game open)
  homeEvery: [300, 600],          // …and while he's home: much rarer
  rainSlow: 2,                    // light rain: visits come this many times less often (heavy rain: none)
  who: { sparrow: 4.5, cat: 3, squirrel: 2.5 },   // who comes (autumn: squirrels ×1.6; winter: squirrels ×0.5)
  stay: { sparrow: [8, 16], cat: [12, 22], squirrel: [9, 16] },
  giftChance: 0.4,                // a visitor leaves something when it goes…
  giftGap: 20,                    // …but at most one gift every this many minutes
  groundCap: 3,                   // and at most this many lying in the yard
  gifts: { sparrow: { feather: 5, flower: 3, pebble: 2 }, cat: { flower: 4, pebble: 4, feather: 2 }, squirrel: { pinecone: 6, pebble: 2, flower: 2 } },
  clover: 0.04,                   // rarely, a four-leaf clover instead
  dandChance: 0.35, dand: [2, 4], cloverDand: 5,   // some gifts come with a few dandelions
  offline: { minHours: 2, slotHours: 3, slots: 6, giftChance: 0.5, max: 2 },   // while the game was closed: 0–2 gifts waiting
  night: [22, 5],                 // nobody visits between these hours
};
// getting to know the little visitors (plan 2, stage 2). A hidden friendship for each, four levels: 0 stranger → 1 knows
// you by sight → 2 familiar → 3 good friends. It only ever grows, and only through snacks: put one out in the yard and
// the one it is for comes more often and stays longer; when it eats it, the friendship grows a step — at most `cap`
// steps a day (when it's had enough for the day it leaves the dish for tomorrow; nothing is ever wasted).
const PALS = {
  order: ['sparrow', 'squirrel', 'cat'],
  snack: { sparrow: 'seed', squirrel: 'nuts', cat: 'fish' },
  cap: { sparrow: 2, squirrel: 1, cat: 1 },               // meals that count per day
  lv: { sparrow: [3, 8, 16], squirrel: [3, 10, 22], cat: [5, 16, 40] },   // meals to reach levels 1, 2, 3
  dishPull: 3,                    // a snack waiting for it: that visitor comes this many times more often…
  eatStay: 1.5,                   // …and stays this much longer
  stayUp: 1.3,                    // from level 1 on, every visit is this much longer
  levelGift: { sparrow: 'bluefeather', squirrel: 'walnut', cat: 'yarnbit' },    // from level 2: a gift only they bring
  levelGiftW: 3,                  // its weight among their usual gifts
  rare: { sparrow: 'button', squirrel: 'goldacorn', cat: 'bell' },             // level 3: their own rare gift
  rareChance: 0.08,
  nameMax: 8,                     // a name can be this long (from level 2)
  play: { sparrow: 0.6, cat: 0.7, squirrel: 0.6 },      // level 3: chance they play with him when he's out and free
};
const DISH_SPOTS = { sparrow: [92, 196], squirrel: [330, 128], cat: [214, 214] };   // where each dish would like to go (moved if busy)
