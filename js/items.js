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
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const CATS = ['food', 'charm', 'toy'];

// real places; ★ rare ones are more likely with a charm
const DESTS = [
  { id: 'chiangmai' }, { id: 'pai' }, { id: 'krabi' }, { id: 'floatingmarket' }, { id: 'inthanon' }, { id: 'fuji' },
  { id: 'fushimi' }, { id: 'guilin' }, { id: 'swiss' },
  { id: 'furano', rare: true }, { id: 'dunhuang', rare: true }, { id: 'tekapo', rare: true },
];
const TRIP = {
  baseRare: 0.08,                 // chance of a ★ place without a charm
  decideMinutes: [2, 20],         // once packed, he picks his own moment to leave within this window
  cards: { none: 0.2, two: 0.15, twoMinHours: 4 },   // postcards per trip: 0, 1 or 2
  souvenirChance: 0.6,            // only for a place whose souvenir isn't on the shelf yet
  birdEvery: [60, 180],           // seconds between bird visits while he's away (game open)
};
