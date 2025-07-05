#!/usr/bin/env python3
"""
Process electoral data for visualization
Generates JSON files optimized for frontend consumption
"""

import pandas as pd
import json
import numpy as np
from pathlib import Path

# Comprehensive party color mappings (self-contained)
def get_party_colors():
    """Return comprehensive party colors - self-contained, no external files"""
    return {
        'Democratic': '#3333FF',
        'Republican': '#E81B23',
        'Democratic-Republican': '#008000',
        'Federalist': '#EA9978',
        'Whig': '#F0DC82',
        'National Republican': '#E0CDA9',
        'Anti-Masonic': '#8B4513',
        'Free Soil': '#D2691E',
        'American': '#CD853F',
        'Know Nothing': '#CD853F',
        'Constitutional Union': '#DDA0DD',
        'Liberal Republican': '#FFD700',
        'Populist': '#ACE1AF',
        'People\'s': '#ACE1AF',
        'Greenback': '#228B22',
        'Greenback-Labor': '#228B22',
        'Prohibition': '#4B0082',
        'Liberty': '#32CD32',
        'Silver Republican': '#C0C0C0',
        'National Democratic': '#6495ED',
        'Gold Democratic': '#FFD700',
        'Progressive': '#FF7F50',
        'Bull Moose': '#FF7F50',
        'Socialist': '#DC143C',
        'Socialist Labor': '#B22222',
        'Communist': '#8B0000',
        'Farmer-Labor': '#8FBC8F',
        'Union': '#4169E1',
        'States Rights': '#DAA520',
        'States Rights Democratic': '#DAA520',
        'Dixiecrat': '#DAA520',
        'American Independent': '#808080',
        'America First': '#483D8B',
        'Reform': '#FF1493',
        'Libertarian': '#FED700',
        'Green': '#00FF00',
        'Constitution': '#800080',
        'Natural Law': '#FFB6C1',
        'American Taxpayer': '#800080',
        'Peace and Freedom': '#FF69B4',
        'Workers World': '#8B0000',
        'Socialist Workers': '#B22222',
        'Party for Socialism and Liberation': '#FF0000',
        'Socialist Party USA': '#DC143C',
        'Socialist Equality': '#8B0000',
        'Independent': '#708090',
        'Liberal Republican/Democratic': '#4682B4',
        'Rights': '#DAA520',
        'Unpledged': '#708090',
        'None': '#D3D3D3',
        'Did Not Vote': '#696969',
        'Unknown': '#C0C0C0',
    }

PARTY_COLORS = get_party_colors()

def load_data():
    """Load electoral data from single source of truth"""
    print("📊 Loading electoral data from single source...")
    
    # Single source of truth: enhanced CSV contains ALL data 1789-2024
    enhanced_df = pd.read_csv('data/raw/electoral_enhanced.csv')
    
    print(f"✅ Loaded {len(enhanced_df)} records from {enhanced_df['Year'].min()}-{enhanced_df['Year'].max()}")
    
    return enhanced_df

def extract_party_from_split_state(row):
    """Handle split electoral states like Maine and Nebraska"""
    if not ('Split by district' in str(row['Notes']) or 'split' in str(row['Notes']).lower()):
        return None
    
    # For split states, determine winner by who got more EVs
    winner_evs = int(row['Winner_EV']) if pd.notna(row['Winner_EV']) else 0
    runner_up_evs = int(row['Runner_Up_EV']) if pd.notna(row['Runner_Up_EV']) else 0
    
    # Extract candidate names and determine their parties
    winner_name = str(row['Winner']).strip()
    
    if 'Biden' in winner_name or 'Harris' in winner_name or 'Clinton' in winner_name or 'Obama' in winner_name:
        winner_party = 'Democratic'
    elif 'Trump' in winner_name or 'Pence' in winner_name or 'Romney' in winner_name or 'McCain' in winner_name:
        winner_party = 'Republican'
    else:
        # Fallback to looking at the data pattern
        winner_party = 'Unknown'
    
    return winner_party

def extract_party_from_notes(notes_str):
    """Extract party from Notes column like 'Trump Republican' or 'Biden Democrat'"""
    if pd.isna(notes_str) or notes_str == '':
        return None
    
    notes_str = str(notes_str)
    
    # Handle ONLY district-level splits (Maine/Nebraska system), not historical split votes
    if 'Split by district' in notes_str:
        return 'Split'  # Will be handled by special logic
    
    # Handle faithless elector cases - extract from pattern like "2 faithless electors"
    if 'faithless electors' in notes_str.lower():
        return None  # Will fall back to Winner_Party column
    
    # Handle disputed cases like "Disputed; awarded to Bush" - should use Winner_Party column
    if 'disputed' in notes_str.lower() and 'awarded' in notes_str.lower():
        return None  # Will fall back to Winner_Party column
    
    # Common patterns in notes
    if 'Republican' in notes_str:
        return 'Republican'
    elif 'Democrat' in notes_str:
        return 'Democratic'
    elif 'Federalist' in notes_str:
        return 'Federalist'
    elif 'Whig' in notes_str:
        return 'Whig'
    elif 'Progressive' in notes_str:
        return 'Progressive'
    elif 'Did Not Vote' in notes_str:
        return 'Did Not Vote'
    else:
        # Try to extract last word as party, but avoid common non-party words
        words = notes_str.strip().split()
        if len(words) >= 2:
            last_word = words[-1]
            # Skip words that are clearly not parties
            if last_word.lower() in ['electors', 'elector', 'vote', 'votes', 'district', 'state', 'lost', 'won', 'split', 'home']:
                return None
            return last_word
        return None

def calculate_metrics(df):
    """Calculate additional metrics for visualization"""
    print("🔧 Calculating metrics...")
    
    # Use actual party data from each state's Winner_Party and RunnerUp_Party columns
    print("🔧 Using actual party data from each row...")
    
    # Each row has its own winner and runner-up party - use them directly per state
    df['Corrected_Winner_Party'] = df['Winner_Party'].fillna('Unknown')
    df['Corrected_RunnerUp_Party'] = df['RunnerUp_Party'].fillna('Unknown')
    
    # For rows where party data might be missing, try to extract from candidate names
    missing_winner_party = df['Corrected_Winner_Party'].isin(['Unknown', '', None]) | df['Corrected_Winner_Party'].isna()
    missing_runner_party = df['Corrected_RunnerUp_Party'].isin(['Unknown', '', None]) | df['Corrected_RunnerUp_Party'].isna()
    
    if missing_winner_party.any():
        print(f"🔧 Found {missing_winner_party.sum()} rows with missing winner party data, trying candidate name inference...")
        # Try to infer from candidate names for missing data only
        for idx in df[missing_winner_party].index:
            row = df.loc[idx]
            winner_name = str(row['Winner']).strip().lower()
            
            # Infer party from well-known candidate names
            if any(name in winner_name for name in ['biden', 'harris', 'obama', 'clinton', 'gore', 'kerry', 'dukakis', 'mondale']):
                df.loc[idx, 'Corrected_Winner_Party'] = 'Democratic'
            elif any(name in winner_name for name in ['trump', 'bush', 'reagan', 'romney', 'mccain', 'dole']):
                df.loc[idx, 'Corrected_Winner_Party'] = 'Republican'
            elif 'washington' in winner_name:
                df.loc[idx, 'Corrected_Winner_Party'] = 'Independent'  # Washington was non-partisan
    
    if missing_runner_party.any():
        print(f"🔧 Found {missing_runner_party.sum()} rows with missing runner-up party data, trying candidate name inference...")
        # Try to infer from candidate names for missing data only
        for idx in df[missing_runner_party].index:
            row = df.loc[idx]
            runner_name = str(row['Runner_Up']).strip().lower() if pd.notna(row['Runner_Up']) else ''
            
            # Infer party from well-known candidate names  
            if any(name in runner_name for name in ['biden', 'harris', 'obama', 'clinton', 'gore', 'kerry', 'dukakis', 'mondale']):
                df.loc[idx, 'Corrected_RunnerUp_Party'] = 'Democratic'
            elif any(name in runner_name for name in ['trump', 'bush', 'reagan', 'romney', 'mccain', 'dole']):
                df.loc[idx, 'Corrected_RunnerUp_Party'] = 'Republican'
    
    # Initialize split state column - detect from actual split vote data
    df['Is_Split_State'] = False
    
    # Handle split states based on actual electoral vote splits (not party inference)
    print("🔧 Handling split electoral states...")
    # A state is split if winner didn't get all EVs and there are runner-up EVs
    split_mask = (df['Winner_EV'] < df['Electoral_Votes']) & (df['Runner_Up_EV'] > 0)
    df.loc[split_mask, 'Is_Split_State'] = True
    
    # Ensure population per EV is calculated
    df['Population_Per_EV'] = df['Population'] / df['Electoral_Votes']
    df['Population_Per_EV'] = df['Population_Per_EV'].replace([np.inf, -np.inf], np.nan)
    
    # Calculate national average for each year
    year_stats = df.groupby('Year').agg({
        'Population': 'sum',
        'Electoral_Votes': 'sum'
    }).reset_index()
    year_stats['National_Pop_Per_EV'] = year_stats['Population'] / year_stats['Electoral_Votes']
    
    # Merge back to main dataframe
    df = df.merge(year_stats[['Year', 'National_Pop_Per_EV']], on='Year', how='left')
    
    # Calculate representation ratio (1.0 = perfectly represented)
    df['Representation_Ratio'] = df['National_Pop_Per_EV'] / df['Population_Per_EV']
    df['Representation_Ratio'] = df['Representation_Ratio'].replace([np.inf, -np.inf], np.nan)
    
    # Calculate hypothetical equal representation EVs
    df['Hypothetical_EVs'] = (df['Population'] / df['National_Pop_Per_EV']).round()
    df['EV_Difference'] = df['Hypothetical_EVs'] - df['Electoral_Votes']
    
    return df

def create_state_timeline(df):
    """Create timeline data for each state"""
    print("📅 Creating state timelines...")
    
    states = df['State'].unique()
    timeline_data = {}
    
    for state in states:
        state_data = df[df['State'] == state].sort_values('Year')
        
        timeline_data[state] = {
            'name': state,
            'timeline': []
        }
        
        for _, row in state_data.iterrows():
            # Determine colors - NEVER grey unless state doesn't exist or doesn't vote
            winner_party = row['Corrected_Winner_Party'] if pd.notna(row['Corrected_Winner_Party']) else 'Unknown'
            runner_up_party = row['Corrected_RunnerUp_Party'] if pd.notna(row['Corrected_RunnerUp_Party']) else 'Unknown'
            
            # Get colors from party mapping
            winner_color = PARTY_COLORS.get(winner_party, '#708090')  # Default to slate gray for unknown
            runner_up_color = PARTY_COLORS.get(runner_up_party, '#708090')
            
            # ONLY use grey if the state doesn't exist or doesn't vote
            electoral_votes = int(row['Electoral_Votes']) if pd.notna(row['Electoral_Votes']) else 0
            state_exists = electoral_votes > 0
            
            # Override color to grey ONLY for non-participating states
            if not state_exists:
                if winner_party in ['Did Not Vote', 'None']:
                    winner_color = PARTY_COLORS.get(winner_party, '#696969')
                else:
                    winner_color = '#696969'  # Non-participating state
            
            # Calculate weighted stripe proportions for split states
            winner_ev = int(row['Winner_EV']) if pd.notna(row['Winner_EV']) else electoral_votes
            runner_up_ev = int(row['Runner_Up_EV']) if pd.notna(row['Runner_Up_EV']) else 0
            
            # Calculate stripe weights (percentage of total EVs)
            total_split_evs = winner_ev + runner_up_ev
            winner_weight = winner_ev / total_split_evs if total_split_evs > 0 else 1.0
            runner_up_weight = runner_up_ev / total_split_evs if total_split_evs > 0 else 0.0
            
            year_data = {
                'year': int(row['Year']),
                'electoralVotes': electoral_votes,
                'population': int(row['Population']) if pd.notna(row['Population']) else None,
                'populationPerEV': float(row['Population_Per_EV']) if pd.notna(row['Population_Per_EV']) else None,
                'representationRatio': float(row['Representation_Ratio']) if pd.notna(row['Representation_Ratio']) else None,
                'hypotheticalEVs': int(row['Hypothetical_EVs']) if pd.notna(row['Hypothetical_EVs']) else None,
                'evDifference': int(row['EV_Difference']) if pd.notna(row['EV_Difference']) else None,
                'winner': winner_party,
                'runnerUp': runner_up_party,
                'winnerColor': winner_color,
                'runnerUpColor': runner_up_color,
                'exists': state_exists,
                'isSplitState': bool(row.get('Is_Split_State', False)),
                # Add candidate names
                'winnerCandidate': str(row['Winner']).strip() if pd.notna(row['Winner']) else None,
                'runnerUpCandidate': str(row['Runner_Up']).strip() if pd.notna(row['Runner_Up']) else None,
                # Add weighted split vote details for proportional stripes
                'winnerEV': winner_ev,
                'runnerUpEV': runner_up_ev,
                'winnerWeight': round(winner_weight, 3),  # Percentage as decimal (0.0-1.0)
                'runnerUpWeight': round(runner_up_weight, 3)
            }
            timeline_data[state]['timeline'].append(year_data)
    
    return timeline_data

def create_year_summaries(df):
    """Create summary data for each election year"""
    print("📊 Creating year summaries...")
    
    years = sorted(df['Year'].unique())
    year_summaries = {}
    
    for year in years:
        year_data = df[df['Year'] == year]
        participating = year_data[year_data['Electoral_Votes'] > 0]
        
        # Calculate statistics
        if len(participating) > 0:
            pop_per_ev_values = participating['Population_Per_EV'].dropna()
            
            summary = {
                'year': int(year),
                'totalStates': len(participating),
                'totalElectoralVotes': int(participating['Electoral_Votes'].sum()),
                'totalPopulation': int(participating['Population'].sum()) if participating['Population'].notna().any() else None,
                'averagePopPerEV': float(pop_per_ev_values.mean()) if len(pop_per_ev_values) > 0 else None,
                'minPopPerEV': {
                    'state': participating.loc[participating['Population_Per_EV'].idxmin(), 'State'] if len(pop_per_ev_values) > 0 else None,
                    'value': float(pop_per_ev_values.min()) if len(pop_per_ev_values) > 0 else None,
                },
                'maxPopPerEV': {
                    'state': participating.loc[participating['Population_Per_EV'].idxmax(), 'State'] if len(pop_per_ev_values) > 0 else None,
                    'value': float(pop_per_ev_values.max()) if len(pop_per_ev_values) > 0 else None,
                },
                'parties': {
                    'winner': participating.groupby('Corrected_Winner_Party')['Electoral_Votes'].sum().to_dict() if 'Corrected_Winner_Party' in participating else {},
                    'runnerUp': participating.groupby('Corrected_RunnerUp_Party')['Electoral_Votes'].sum().to_dict() if 'Corrected_RunnerUp_Party' in participating else {},
                    'stateCount': {
                        'winner': participating['Corrected_Winner_Party'].value_counts().to_dict() if 'Corrected_Winner_Party' in participating else {},
                        'runnerUp': participating['Corrected_RunnerUp_Party'].value_counts().to_dict() if 'Corrected_RunnerUp_Party' in participating else {},
                    }
                }
            }
        else:
            summary = {
                'year': int(year),
                'totalStates': 0,
                'totalElectoralVotes': 0,
                'totalPopulation': None,
                'averagePopPerEV': None,
                'minPopPerEV': {'state': None, 'value': None},
                'maxPopPerEV': {'state': None, 'value': None},
                'parties': {'winner': {}, 'runnerUp': {}, 'stateCount': {'winner': {}, 'runnerUp': {}}}
            }
        
        year_summaries[int(year)] = summary
    
    return year_summaries

def create_state_metadata():
    """Create metadata for states including admission dates"""
    print("📋 Creating state metadata...")
    
    # State admission years (for greying out non-existent states)
    state_admission = {
        'Delaware': 1787, 'Pennsylvania': 1787, 'New Jersey': 1787, 'Georgia': 1788,
        'Connecticut': 1788, 'Massachusetts': 1788, 'Maryland': 1788, 'South Carolina': 1788,
        'New Hampshire': 1788, 'Virginia': 1788, 'New York': 1788, 'North Carolina': 1789,
        'Rhode Island': 1790, 'Vermont': 1791, 'Kentucky': 1792, 'Tennessee': 1796,
        'Ohio': 1803, 'Louisiana': 1812, 'Indiana': 1816, 'Mississippi': 1817,
        'Illinois': 1818, 'Alabama': 1819, 'Maine': 1820, 'Missouri': 1821,
        'Arkansas': 1836, 'Michigan': 1837, 'Florida': 1845, 'Texas': 1845,
        'Iowa': 1846, 'Wisconsin': 1848, 'California': 1850, 'Minnesota': 1858,
        'Oregon': 1859, 'Kansas': 1861, 'West Virginia': 1863, 'Nevada': 1864,
        'Nebraska': 1867, 'Colorado': 1876, 'North Dakota': 1889, 'South Dakota': 1889,
        'Montana': 1889, 'Washington': 1889, 'Idaho': 1890, 'Wyoming': 1890,
        'Utah': 1896, 'Oklahoma': 1907, 'New Mexico': 1912, 'Arizona': 1912,
        'Alaska': 1959, 'Hawaii': 1959, 'District of Columbia': 1961  # DC gets EVs from 23rd Amendment
    }
    
    # State abbreviations for map
    state_abbr = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL',
        'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA',
        'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
        'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR',
        'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
        'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA',
        'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    }
    
    metadata = {}
    for state, year in state_admission.items():
        metadata[state] = {
            'name': state,
            'abbreviation': state_abbr.get(state, ''),
            'admissionYear': year,
            'firstElection': year + (4 - year % 4) if year % 4 != 0 else year,  # Next election year
        }
    
    return metadata

def save_json_files(timeline_data, year_summaries, state_metadata, df):
    """Save processed data as JSON files"""
    print("💾 Saving JSON files...")
    
    output_dir = Path('data/outputs')
    output_dir.mkdir(exist_ok=True, parents=True)
    
    # Save state timeline data
    with open(output_dir / 'stateTimelines.json', 'w') as f:
        json.dump(timeline_data, f, indent=2)
    
    # Save year summaries
    with open(output_dir / 'yearSummaries.json', 'w') as f:
        json.dump(year_summaries, f, indent=2)
    
    # Save state metadata
    with open(output_dir / 'stateMetadata.json', 'w') as f:
        json.dump(state_metadata, f, indent=2)
    
    # Save party colors
    with open(output_dir / 'partyColors.json', 'w') as f:
        json.dump(PARTY_COLORS, f, indent=2)
    
    # Create a compact version for initial load
    compact_data = {
        'years': sorted(df['Year'].unique().tolist()),
        'states': sorted(df['State'].unique().tolist()),
        'partyColors': PARTY_COLORS,
        'metadata': state_metadata,
    }
    
    with open(output_dir / 'config.json', 'w') as f:
        json.dump(compact_data, f, indent=2)
    
    print("✅ All JSON files saved successfully!")

def main():
    """Main processing function"""
    print("🚀 Starting electoral data processing...")
    
    # Load data
    df = load_data()
    
    # Calculate metrics
    df = calculate_metrics(df)
    
    # Create data structures
    timeline_data = create_state_timeline(df)
    year_summaries = create_year_summaries(df)
    state_metadata = create_state_metadata()
    
    # Save files
    save_json_files(timeline_data, year_summaries, state_metadata, df)
    
    # Print summary
    print("\n📊 Processing complete!")
    print(f"  - States: {len(timeline_data)}")
    print(f"  - Years: {len(year_summaries)}")
    print(f"  - Total records: {len(df):,}")

if __name__ == "__main__":
    main()