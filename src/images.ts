// Which photos each page shows (files live in public/images, filled by `npm run images`).
export type Img = { f: string; alt: string };
export type Layout = { k: 'hero' | 'duo' | 'collage'; imgs: Img[] };
const I = (f: string, alt: string): Img => ({ f, alt });
export const LAYOUT: Record<string, Layout> = {
  welcome: { k: 'collage', imgs: [I('waterfront', 'Kochi waterfront'), I('nets', 'Chinese fishing nets, Fort Kochi'), I('backwaters', 'Kerala backwaters')] },
  morning: { k: 'hero', imgs: [I('beach', 'Fort Kochi beach')] },
  fortkochi: { k: 'collage', imgs: [I('nets', 'Chinese fishing nets'), I('stfrancis', 'St. Francis Church'), I('santacruz', 'Santa Cruz Basilica')] },
  watermetro: { k: 'collage', imgs: [I('watermetro', 'Kochi Water Metro boat'), I('marine', 'Marine Drive, Kochi'), I('waterfront', 'Kochi harbour')] },
  mattancherry: { k: 'collage', imgs: [I('palace', 'Mattancherry Palace'), I('jewtown', 'Jew Town'), I('synagogue', 'Paradesi Synagogue')] },
  food: { k: 'collage', imgs: [I('food', 'Kerala fish curry'), I('meals', 'Kerala meal on a banana leaf'), I('biryani', 'Malabar biryani')] },
  waterfront: { k: 'duo', imgs: [I('marine', 'Marine Drive, Kochi'), I('backwaters', 'Kerala backwaters')] },
  homestay: { k: 'duo', imgs: [I('homestay', 'Kerala homestay'), I('kitchen', 'Home kitchen')] },
  night: { k: 'duo', imgs: [I('cooking', 'Friends cooking together'), I('kitchen', 'Shared kitchen')] },
  wonderla: { k: 'hero', imgs: [I('wonderla', 'Wonderla Kochi water rides')] },
  train: { k: 'hero', imgs: [I('train', 'Sleeper class train journey')] },
  checklist: { k: 'hero', imgs: [I('backwaters', 'Kerala backwaters')] },
};
export const PHOTO: Record<string, string> = { beach: 'beach', nets: 'nets', stfrancis: 'stfrancis', santacruz: 'santacruz',
  jewtown: 'jewtown', palace: 'palace', marine: 'marine', 'wm-hc': 'watermetro', 'wm-fk': 'watermetro', 'wm-wi': 'watermetro',
  'wm-mt': 'watermetro', stay: 'homestay', wonderla: 'wonderla' };
export const DARK = ['morning', 'night', 'wonderla'];   // dark editorial pages
export const PIC_BOTTOM = ['food', 'homestay', 'night', 'train']; // photos below text
// Left-hand pages: full-bleed photo + big headline ('^' = large line). Right-hand pages keep the story layout.
export const HERO: Record<string, { label: string; head: string[] }> = {
  welcome: { label: 'WELCOME TO KOCHI', head: ['^Spice,', 'sea & stories', '^of Kochi'] },
  morning: { label: 'DAY 1 · EARLY MORNING', head: ['^Quiet', 'mornings by', '^the water'] },
  watermetro: { label: 'MUST-DO · WATER METRO', head: ['^Gliding', 'across the', '^backwaters'] },
  food: { label: 'THE KOCHI FOOD TRAIL', head: ['^Fish curry,', 'appam &', '^banana-leaf', 'feasts'] },
  homestay: { label: 'OUR PRIVATE HOMESTAY', head: ['^One roof,', 'nine friends,', '^one kitchen'] },
  wonderla: { label: 'DAY 2 · WONDERLA KOCHI', head: ['^Splash,', 'scream &', '^repeat'] },
  checklist: { label: 'BEFORE WE GO', head: ['^Pack light,', 'travel', '^together'] },
};
