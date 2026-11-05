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
  { id: 'yarn', cat: 'toy', friend: 'cat' },          // gifts from friends (not sold): after the second time he meets them
  { id: 'temari', cat: 'toy', friend: 'kinako' },
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const CATS = ['food', 'charm', 'toy'];

// real places; ★ rare ones are more likely with a charm
const DESTS = [
  { id: 'chiangmai' }, { id: 'pai' }, { id: 'krabi' }, { id: 'floatingmarket' }, { id: 'inthanon' }, { id: 'fuji' },
  { id: 'fushimi' }, { id: 'guilin' }, { id: 'swiss' }, { id: 'istanbul' },
  { id: 'furano', rare: true }, { id: 'dunhuang', rare: true }, { id: 'tekapo', rare: true },
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
