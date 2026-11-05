// Downloads real, openly-licensed photos from Wikimedia Commons into public/images + credits.json
// Run once:  npm run images      (re-download everything: npm run images -- --force)
import fs from 'node:fs/promises';
const UA = 'KochiGangGetaway/1.0 (personal trip magazine)';
const force = process.argv.includes('--force');
const JOBS = [
  ['cover', ['Chinese fishing nets Fort Kochi sunset', 'Chinese fishing nets Fort Kochi', 'Chinese fishing nets Kochi']],
  ['nets', ['Chinese fishing nets Kochi', 'Chinese fishing nets Cochin']],
  ['beach', ['Fort Kochi beach', 'Fort Cochin beach']],
  ['waterfront', ['Kochi waterfront skyline', 'Kochi harbour backwaters']],
  ['backwaters', ['Kerala backwaters', 'Alleppey backwaters houseboat']],
  ['marine', ['Marine Drive Kochi', 'Marine Drive Ernakulam']],
  ['watermetro', ['Kochi Water Metro boat', 'Kochi Water Metro']],
  ['stfrancis', ['St. Francis Church Fort Kochi', 'Saint Francis Church Cochin']],
  ['santacruz', ['Santa Cruz Basilica Kochi', 'Santa Cruz Cathedral Basilica Fort Kochi']],
  ['palace', ['Mattancherry Palace', 'Dutch Palace Mattancherry']],
  ['jewtown', ['Jew Town Mattancherry', 'Jew Street Kochi antique shops']],
  ['synagogue', ['Paradesi Synagogue', 'Paradesi Synagogue Kochi']],
  ['food', ['Kerala fish curry', 'Kerala seafood meal']],
  ['meals', ['Kerala sadya banana leaf', 'Kerala meals banana leaf']],
  ['biryani', ['Malabar biryani', 'Kerala biryani']],
  ['homestay', ['Kerala homestay', 'Kerala traditional house']],
  ['kitchen', ['Kerala traditional kitchen', 'Indian home kitchen']],
  ['cooking', ['friends cooking together', 'group cooking dinner']],
  ['wonderla', ['Wonderla Kochi', 'Wonderla water park']],
  ['train', ['Indian Railways sleeper class coach', 'Indian train window Kerala']],
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const val = x => strip(x && typeof x === 'object' ? x.value : x); // Commons metadata fields are {value: ...}
const strip = s => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
async function search(q) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: 6, gsrlimit: 20,
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: 2000 }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await sleep(4000 * (t + 1)); continue; }
    if (!r.ok) throw new Error('Wikimedia API HTTP ' + r.status);
    const j = await r.json();
    return Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index).map(p => ({ title: p.title, ...p.imageinfo?.[0] }));
  }
  return [];
}
await fs.mkdir('public/images', { recursive: true });
let credits = {}; try { credits = JSON.parse(await fs.readFile('public/images/credits.json', 'utf8')); } catch {}
const failed = [];
for (const [f, queries] of JOBS) {
  const out = `public/images/${f}.jpg`;
  if (!force && await fs.stat(out).then(() => true, () => false)) { console.log('skip', f); continue; }
  let pick = null;
  try {
  for (const q of queries) {
    const hits = await search(q); await sleep(1200);
    const ok = hits.filter(h => h.mime === 'image/jpeg' && h.width >= 1600 && h.height >= 900 &&
      !/map|logo|flag|icon|diagram|poster|stamp|drawing/i.test(h.title) && val(h.extmetadata?.LicenseShortName)).slice(0, 6);
    pick = ok.sort((a, b) => b.width * b.height - a.width * a.height)[0]; // best of the top matches = largest
    if (pick) break;
  }
  if (!pick) { failed.push(f); console.log('NO MATCH', f); continue; }
  const dl = await fetch(pick.thumburl, { headers: { 'User-Agent': UA } });
  if (!dl.ok) throw new Error('download HTTP ' + dl.status);
  const buf = Buffer.from(await dl.arrayBuffer());
  await fs.writeFile(out, buf);
  const m = pick.extmetadata || {};
  credits[f] = `${val(m.Artist).slice(0, 36) || 'Wikimedia Commons'} · ${val(m.LicenseShortName)}`;
  console.log('ok  ', f.padEnd(11), pick.title);
  await sleep(1200);
  } catch (e) { failed.push(f); console.log('ERROR', f, '-', e.message); }
}
await fs.writeFile('public/images/credits.json', JSON.stringify(credits, null, 1));
console.log(failed.length ? `\nNo suitable photo for: ${failed.join(', ')} — drop your own ${failed[0]}.jpg into public/images/` : '\nAll photos downloaded. Check titles above look relevant.');
