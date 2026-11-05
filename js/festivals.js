// ================= FESTIVALS: real dates, fixed in this table =================
// Window: from 3 days before a festival's first day to 7 days after its last day (birthdays: from the day itself). Inside it, Parker gives you
// that festival's card once per year — by mail if he's travelling, in person (a card in his mouth) if he's home.
const FEST_WINDOW = { before: 3, after: 7 };
const FESTIVALS = [
  // Loy Krathong: full moon of the 12th Thai lunar month. 2026 from the owner; 2027–2029 = the astronomical full moon
  // in Thai time (same rule gives the known 2025-11-05 and 2026-11-24) — NOT yet checked against an official source.
  { id: 'loykrathong', dates: { 2026: ['2026-11-24', '2026-11-25'], 2027: ['2027-11-14'], 2028: ['2028-11-02'], 2029: ['2029-11-21'] } },
  { id: 'christmas', every: ['12-25'] },
  { id: 'newyear', every: ['01-01'] },
  { id: 'cny', dates: { 2027: ['2027-02-06'], 2028: ['2028-01-26'], 2029: ['2029-02-13'], 2030: ['2030-02-03'] } },
  { id: 'songkran', every: ['04-13', '04-15'] },
  // family birthdays: the card comes on the day itself (not before), any time in the week after.
  // secret: the album shows only a "?" until the first card has come
  { id: 'bday-parker', every: ['11-13'], window: { before: 0, after: 7 }, secret: true },
  { id: 'bday-sister', every: ['05-02'], window: { before: 0, after: 7 }, secret: true },
  { id: 'bday-mom', every: ['01-25'], window: { before: 0, after: 7 }, secret: true },
];
const festCard = id => 'fest-' + id;
function festDays(f, year) { return f.dates ? f.dates[year] || null : f.every.map(md => `${year}-${md}`); }
function dayStart(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); }
// every festival whose window contains `now` (Christmas and New Year overlap), as { id, year }
function activeFestivals(now) {
  const y = new Date(now).getFullYear(), out = [];
  for (const f of FESTIVALS) for (const yr of [y - 1, y, y + 1]) {
    const ds = festDays(f, yr); if (!ds) continue;
    const w = f.window || FEST_WINDOW, a = dayStart(ds[0]) - w.before * 864e5, b = dayStart(ds[ds.length - 1]) + (w.after + 1) * 864e5;
    if (now >= a && now < b) out.push({ id: f.id, year: yr });
  }
  return out;
}
// the first day of a festival in a given year (debug: jump there)
function festFirstDay(id, year) { const ds = festDays(FESTIVALS.find(f => f.id === id), year); return ds ? dayStart(ds[0]) : null; }
