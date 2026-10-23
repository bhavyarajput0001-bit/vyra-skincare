import type { Category } from './types';

export const COLLECTIONS: { category: Category; title: string; line: string; image: string; ritual: string }[] = [
  { category: 'Cleanse', title: 'Cleanse', ritual: 'Step 01', line: 'Start soft. Remove the day without stripping the mood.', image: '/images/cloud-cleanse.jpg' },
  { category: 'Treat', title: 'Treat', ritual: 'Step 02', line: 'Targeted layers and weekly resets, built around texture.', image: '/images/glass-skin.jpg' },
  { category: 'Hydrate', title: 'Hydrate', ritual: 'Step 03', line: 'Morning bounce, midnight melt. Moisture for both shifts.', image: '/images/dew-theory.jpg' },
  { category: 'Protect', title: 'Protect', ritual: 'Step 04', line: 'The non-negotiable last step. Sheer, weightless, daily.', image: '/images/sun-veil.jpg' },
];
