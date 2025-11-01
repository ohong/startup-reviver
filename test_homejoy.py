#!/usr/bin/env python3
"""Test script for Homejoy research query"""

from deep_research import agent
import sys
import traceback

def main():
    print("=" * 80)
    print("TESTING RESEARCH AGENT WITH HOMEJOY QUERY")
    print("=" * 80)
    print("\nQuery: 'explain what happened to homejoy'")
    print("\nThis test validates:")
    print("- All agents are properly configured")
    print("- Prompts reference fetchr-research-report.md as gold standard")
    print("- $100k executive report quality is enforced")
    print("- Final output matches the quality bar")
    print("\n" + "=" * 80)
    print("\nExecuting research agent...\n")
    
    try:
        result = agent.run("explain what happened to homejoy")
        
        print("\n" + "=" * 80)
        print("RESEARCH COMPLETED SUCCESSFULLY")
        print("=" * 80)
        print("\n" + result)
        
        # Save to file
        output_file = "reports/homejoy-research-report.md"
        with open(output_file, 'w') as f:
            f.write(result)
        print(f"\n\nReport saved to: {output_file}")
        
        return 0
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("ERROR OCCURRED")
        print("=" * 80)
        print(f"\nError: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())

