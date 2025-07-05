#!/usr/bin/env python3
"""
Data validation script for electoral datasource
Ensures integrity of the single source of truth
"""

import pandas as pd
import json
from pathlib import Path

def validate_root_datasource():
    """Validate the root CSV datasource"""
    print("🔍 Validating root datasource...")
    
    df = pd.read_csv('data/raw/electoral_enhanced.csv')
    
    errors = []
    warnings = []
    
    # Check basic structure
    required_columns = ['Year', 'State', 'Electoral_Votes', 'Winner', 'Winner_Party', 'RunnerUp_Party']
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
    
    # Check year range
    min_year, max_year = df['Year'].min(), df['Year'].max()
    if min_year != 1789 or max_year != 2024:
        errors.append(f"Expected years 1789-2024, got {min_year}-{max_year}")
    
    # Check for duplicate state-year combinations
    duplicates = df.groupby(['Year', 'State']).size()
    duplicates = duplicates[duplicates > 1]
    if len(duplicates) > 0:
        errors.append(f"Found {len(duplicates)} duplicate state-year combinations")
    
    # Check electoral vote totals for recent elections
    for year in [2000, 2004, 2008, 2012, 2016, 2020, 2024]:
        year_data = df[df['Year'] == year]
        total_evs = year_data['Electoral_Votes'].sum()
        if total_evs != 538:
            errors.append(f"{year}: Total EVs = {total_evs}, expected 538")
    
    # Check party assignments for modern elections
    modern_elections = df[df['Year'] >= 2000]
    party_issues = []
    
    for _, row in modern_elections.iterrows():
        winner = str(row['Winner']).lower()
        winner_party = row['Winner_Party']
        
        # Check for obvious party mismatches
        if any(name in winner for name in ['bush', 'trump', 'romney', 'mccain']):
            if winner_party != 'Republican':
                party_issues.append(f"{row['Year']} {row['State']}: {row['Winner']} marked as {winner_party}")
        elif any(name in winner for name in ['obama', 'biden', 'clinton', 'gore', 'kerry']):
            if winner_party != 'Democratic':
                party_issues.append(f"{row['Year']} {row['State']}: {row['Winner']} marked as {winner_party}")
    
    if party_issues:
        errors.extend(party_issues[:5])  # Show first 5 issues
        if len(party_issues) > 5:
            errors.append(f"... and {len(party_issues) - 5} more party assignment issues")
    
    # Check for missing population data in recent years
    recent_data = df[df['Year'] >= 2000]
    missing_pop = recent_data['Population'].isna().sum()
    if missing_pop > 0:
        warnings.append(f"{missing_pop} records missing population data since 2000")
    
    return errors, warnings

def validate_processed_outputs():
    """Validate processed JSON outputs"""
    print("🔍 Validating processed outputs...")
    
    errors = []
    warnings = []
    
    output_dir = Path('data/outputs')
    required_files = ['stateTimelines.json', 'yearSummaries.json', 'stateMetadata.json', 'partyColors.json', 'config.json']
    
    # Check all required files exist
    for filename in required_files:
        filepath = output_dir / filename
        if not filepath.exists():
            errors.append(f"Missing output file: {filename}")
    
    # Validate year summaries
    try:
        with open(output_dir / 'yearSummaries.json', 'r') as f:
            year_summaries = json.load(f)
        
        # Check 2024 results specifically
        if '2024' in year_summaries:
            result_2024 = year_summaries['2024']
            expected_total_evs = 538
            actual_total_evs = result_2024['totalElectoralVotes']
            
            if actual_total_evs != expected_total_evs:
                errors.append(f"2024 total EVs: got {actual_total_evs}, expected {expected_total_evs}")
            
            # Check that Trump has more EVs than Harris
            winner_parties = result_2024['parties']['winner']
            if 'Republican' not in winner_parties or 'Democratic' not in winner_parties:
                errors.append("2024: Missing Republican or Democratic parties in results")
            elif winner_parties['Republican'] <= winner_parties['Democratic']:
                errors.append("2024: Republican should have more EVs than Democratic")
        else:
            errors.append("Missing 2024 data in year summaries")
            
    except Exception as e:
        errors.append(f"Error reading yearSummaries.json: {e}")
    
    # Validate state timelines structure
    try:
        with open(output_dir / 'stateTimelines.json', 'r') as f:
            state_timelines = json.load(f)
        
        expected_states = 51  # 50 states + DC
        actual_states = len(state_timelines)
        
        if actual_states != expected_states:
            errors.append(f"State timelines: got {actual_states} states, expected {expected_states}")
            
        # Check that each state has 2024 data
        missing_2024 = []
        for state, data in state_timelines.items():
            timeline = data.get('timeline', [])
            has_2024 = any(entry.get('year') == 2024 for entry in timeline)
            if not has_2024:
                missing_2024.append(state)
        
        if missing_2024:
            errors.append(f"States missing 2024 data: {missing_2024[:5]}")
            
    except Exception as e:
        errors.append(f"Error reading stateTimelines.json: {e}")
    
    return errors, warnings

def main():
    """Run full validation"""
    print("🚀 Starting electoral data validation...")
    
    all_errors = []
    all_warnings = []
    
    # Validate root datasource
    errors, warnings = validate_root_datasource()
    all_errors.extend(errors)
    all_warnings.extend(warnings)
    
    # Validate processed outputs
    errors, warnings = validate_processed_outputs()
    all_errors.extend(errors)
    all_warnings.extend(warnings)
    
    # Report results
    print("\n📊 Validation Results:")
    
    if all_errors:
        print(f"❌ {len(all_errors)} ERRORS found:")
        for error in all_errors:
            print(f"   • {error}")
    else:
        print("✅ No errors found!")
    
    if all_warnings:
        print(f"\n⚠️  {len(all_warnings)} warnings:")
        for warning in all_warnings:
            print(f"   • {warning}")
    
    if not all_errors and not all_warnings:
        print("\n🎉 All validation checks passed!")
    
    return len(all_errors) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)