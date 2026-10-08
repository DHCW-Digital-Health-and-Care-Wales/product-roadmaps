import type { Roadmap } from './types';
import snapshot from '../data/roadmaps.json';

// Nightly snapshot of the Google Sheet, written and schema-checked by
// scripts/sync-roadmaps.ts.
export const roadmaps = snapshot as Roadmap[];
