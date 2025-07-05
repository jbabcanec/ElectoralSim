import { StateTimeline, YearSummary, Config } from '../types';

interface LoadedData {
  stateTimelines: Record<string, StateTimeline>;
  yearSummaries: Record<number, YearSummary>;
  config: Config;
}

export async function loadData(): Promise<LoadedData> {
  try {
    console.log('Loading data files...');
    // Load all data files in parallel
    const [stateTimelines, yearSummaries, config] = await Promise.all([
      import('../../data/outputs/stateTimelines.json').then(module => {
        console.log('Loaded stateTimelines:', Object.keys(module.default).length);
        return module.default;
      }),
      import('../../data/outputs/yearSummaries.json').then(module => {
        console.log('Loaded yearSummaries:', Object.keys(module.default).length);
        return module.default;
      }),
      import('../../data/outputs/config.json').then(module => {
        console.log('Loaded config:', Object.keys(module.default));
        return module.default;
      }),
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