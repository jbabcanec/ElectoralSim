# Electoral Data Architecture

## Single Source of Truth

**Root Datasource**: `data/raw/electoral_enhanced.csv`

This CSV file contains ALL electoral data from 1789-2024 and is the single source of truth for the entire application.

## Data Schema

### CSV Columns:
- `Year` - Election year (1789-2024)
- `State` - State name (including "District of Columbia")
- `Electoral_Votes` - Number of electoral votes for this state in this year
- `Winner` - Name of winning candidate
- `Winner_EV` - Electoral votes won by winner
- `Runner_Up` - Name of runner-up candidate
- `Runner_Up_EV` - Electoral votes won by runner-up
- `Total_EV_Cast` - Total electoral votes cast nationwide
- `Notes` - Additional context about the election
- `Winner_Party` - Political party of the winner
- `RunnerUp_Party` - Political party of the runner-up
- `Population` - State population (when available)
- `Population_Per_EV` - Population divided by electoral votes

## Data Processing Pipeline

1. **Root Source**: `data/raw/electoral_enhanced.csv`
2. **Processing Script**: `scripts/processing/processData.py`
3. **Generated Outputs**: `data/outputs/`
   - `stateTimelines.json` - Timeline data for each state
   - `yearSummaries.json` - Aggregated data by election year  
   - `stateMetadata.json` - State admission dates and metadata
   - `partyColors.json` - Color mappings for political parties
   - `config.json` - Application configuration

## Key Principles

1. **Single Source**: All data derives from the enhanced CSV
2. **No Duplication**: Eliminate redundant data files
3. **Clear Lineage**: Every output can be traced to the root source
4. **Validation**: Automated checks ensure data integrity
5. **Version Control**: Changes are tracked and documented

## Maintenance

- Update only the root CSV file for data changes
- Run `processData.py` to regenerate all outputs
- All other data files are derivatives and should not be edited manually

## Data Quality Checks

- Party assignments match candidate names
- Electoral vote totals sum correctly for each year
- State population data is consistent
- No missing critical fields for modern elections (2000+)