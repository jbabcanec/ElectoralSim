#!/usr/bin/env python3
"""
Fix 1992 electoral data where Winner_Party and RunnerUp_Party are incorrect.
"""

import pandas as pd
import sys
import os

# Add the project root to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

def fix_1992_data():
    print("🔍 Fixing 1992 electoral data...")
    
    # Load the data
    csv_path = 'data/raw/electoral_enhanced.csv'
    df = pd.read_csv(csv_path)
    
    # Filter for 1992 data
    df_1992 = df[df['Year'] == 1992].copy()
    
    print(f"Found {len(df_1992)} records for 1992")
    
    # Fix the party assignments based on the actual winner
    fixes = 0
    for idx, row in df_1992.iterrows():
        winner = row['Winner']
        runner_up = row['Runner_Up']
        
        # Determine correct parties based on candidate names
        if 'Bush' in winner:
            correct_winner_party = 'Republican'
            correct_runner_up_party = 'Democratic'
        elif 'Clinton' in winner:
            correct_winner_party = 'Democratic'
            correct_runner_up_party = 'Republican'
        else:
            print(f"⚠️  Unknown winner: {winner} in {row['State']}")
            continue
            
        # Check if fix is needed
        if (row['Winner_Party'] != correct_winner_party or 
            row['RunnerUp_Party'] != correct_runner_up_party):
            
            print(f"Fixing {row['State']}: {winner} ({row['Winner_Party']} → {correct_winner_party})")
            
            # Update the main dataframe
            df.loc[idx, 'Winner_Party'] = correct_winner_party
            df.loc[idx, 'RunnerUp_Party'] = correct_runner_up_party
            fixes += 1
    
    if fixes > 0:
        print(f"✅ Fixed {fixes} records for 1992")
        
        # Save the corrected data
        df.to_csv(csv_path, index=False)
        print(f"💾 Saved corrected data to {csv_path}")
        
        # Regenerate the processed data
        print("🔄 Regenerating processed data...")
        os.system('python3 scripts/processing/processData.py')
        
    else:
        print("✅ No fixes needed for 1992")

def check_1988_data():
    print("\n🔍 Checking 1988 electoral data...")
    
    # Load the data
    csv_path = 'data/raw/electoral_enhanced.csv'
    df = pd.read_csv(csv_path)
    
    # Filter for 1988 data
    df_1988 = df[df['Year'] == 1988].copy()
    
    print(f"Found {len(df_1988)} records for 1988")
    
    # Check for any obvious issues
    issues = 0
    for idx, row in df_1988.iterrows():
        winner = row['Winner']
        runner_up = row['Runner_Up']
        
        # 1988 should be Bush (R) vs Dukakis (D)
        if 'Bush' in winner and row['Winner_Party'] != 'Republican':
            print(f"Issue in {row['State']}: Bush should be Republican, not {row['Winner_Party']}")
            issues += 1
        elif 'Dukakis' in winner and row['Winner_Party'] != 'Democratic':
            print(f"Issue in {row['State']}: Dukakis should be Democratic, not {row['Winner_Party']}")
            issues += 1
            
    if issues == 0:
        print("✅ 1988 data looks correct")
    else:
        print(f"⚠️  Found {issues} potential issues in 1988 data")

if __name__ == '__main__':
    fix_1992_data()
    check_1988_data()
    print("\n🎉 Data validation complete!")