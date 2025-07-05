import { StateTimeline, YearSummary, Config } from '../types';

interface LoadedData {
  stateTimelines: Record<string, StateTimeline>;
  yearSummaries: Record<number, YearSummary>;
  config: Config;
}

export async function loadData(): Promise<LoadedData> {
  try {
    // Load all data files in parallel
    const [stateTimelines, yearSummaries, config] = await Promise.all([
      import('../../data/outputs/stateTimelines.json').then(module => module.default),
      import('../../data/outputs/yearSummaries.json').then(module => module.default),
      import('../../data/outputs/config.json').then(module => module.default),
    ]);

    return {
      stateTimelines,
      yearSummaries,
      config,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load electoral data. Please try refreshing the page.');
  }
}