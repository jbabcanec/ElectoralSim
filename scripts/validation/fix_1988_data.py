#!/usr/bin/env python3
"""
Fix 1988 electoral data based on Wikipedia official results.
- Iowa: All 8 EVs to Dukakis (no split)
- Washington: All 10 EVs to Dukakis (no split) 
- West Virginia: 5 to Dukakis, 1 faithless elector to Bentsen
"""

import pandas as pd
import sys
import os

def fix_1988_data():
    print("🔍 Fixing 1988 electoral data based on Wikipedia...")
    
    # Load the data
    csv_path = 'data/raw/electoral_enhanced.csv'
    df = pd.read_csv(csv_path)
    
    # Define the correct 1988 results for problematic states
    corrections = {
        'Iowa': {
            'Winner_EV': 8,  # All 8 EVs to Dukakis
            'Runner_Up_EV': 0,
            'Notes': 'Dukakis Democrat'
        },
        'Washington': {
            'Winner_EV': 10,  # All 10 EVs to Dukakis  
            'Runner_Up_EV': 0,
            'Notes': 'Dukakis Democrat'
        },
        'West Virginia': {
            'Winner_EV': 5,  # 5 to Dukakis
            'Runner_Up_EV': 0,  # 0 to Bush, 1 faithless to Bentsen
            'Notes': '1 faithless elector voted Bentsen'
        }
    }
    
    fixes = 0
    
    for state, correction in corrections.items():
        # Find the 1988 record for this state
        mask = (df['Year'] == 1988) & (df['State'] == state)
        
        if mask.sum() == 0:
            print(f"⚠️  No 1988 record found for {state}")
            continue
            
        idx = df[mask].index[0]
        current = df.loc[idx]
        
        print(f"Checking {state}:")
        print(f"  Current: {current['Winner']} {current['Winner_EV']}, {current['Runner_Up']} {current['Runner_Up_EV']}")
        
        needs_fix = False
        
        if current['Winner_EV'] != correction['Winner_EV']:
            print(f"  Fixing Winner_EV: {current['Winner_EV']} → {correction['Winner_EV']}")
            df.loc[idx, 'Winner_EV'] = correction['Winner_EV']
            needs_fix = True
            
        if current['Runner_Up_EV'] != correction['Runner_Up_EV']:
            print(f"  Fixing Runner_Up_EV: {current['Runner_Up_EV']} → {correction['Runner_Up_EV']}")
            df.loc[idx, 'Runner_Up_EV'] = correction['Runner_Up_EV']
            needs_fix = True
            
        if current['Notes'] != correction['Notes']:
            print(f"  Fixing Notes: {current['Notes']} → {correction['Notes']}")
            df.loc[idx, 'Notes'] = correction['Notes']
            needs_fix = True
            
        # Fix RunnerUp_Party for Iowa and Washington (should be Republican, not Democratic)
        if state in ['Iowa', 'Washington'] and current['RunnerUp_Party'] != 'Republican':
            print(f"  Fixing RunnerUp_Party: {current['RunnerUp_Party']} → Republican")
            df.loc[idx, 'RunnerUp_Party'] = 'Republican'
            needs_fix = True
            
        if needs_fix:
            fixes += 1
            
    if fixes > 0:
        print(f"\n✅ Fixed {fixes} states for 1988")
        
        # Save the corrected data
        df.to_csv(csv_path, index=False)
        print(f"💾 Saved corrected data to {csv_path}")
        
        # Regenerate the processed data
        print("🔄 Regenerating processed data...")
        os.system('python3 scripts/processing/processData.py')
        
    else:
        print("✅ No fixes needed for 1988")

if __name__ == '__main__':
    fix_1988_data()
    print("\n🎉 1988 data validation complete!")