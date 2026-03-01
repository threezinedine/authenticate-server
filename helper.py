#!/usr/bin/env python3
import json
import subprocess
import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
HELPER_JSON_PATH = os.path.join(ROOT_DIR, "commands.json")

def load_helpers():
    if not os.path.exists(HELPER_JSON_PATH):
        print(f"Error: {HELPER_JSON_PATH} not found.")
        sys.exit(1)
    with open(HELPER_JSON_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error parsing helper.json: {e}")
            sys.exit(1)

def run_cmd(cmd_str, cwd_rel):
    cwd = os.path.join(ROOT_DIR, cwd_rel) if cwd_rel else ROOT_DIR
    print(f"==> Running: {cmd_str}\n    in: {cwd}")
    
    # We use shell=True since command strings are provided directly from configuration
    try:
        subprocess.run(cmd_str, cwd=cwd, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"==> Error: Command failed with return code {e.returncode}")
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        print("\n==> Process interrupted by user")
        sys.exit(1)
    except FileNotFoundError:
        print(f"==> Error: Working directory {cwd} not found.")
        sys.exit(1)

def main():
    helpers = load_helpers()
    
    if len(sys.argv) < 2:
        print("Usage: python helper.py <command_name>")
        print("\nAvailable commands in helper.json:")
        for h in helpers:
            print(f"  - {h.get('name')}")
        sys.exit(1)
        
    target_args = sys.argv[1:]
    target_name = " ".join(target_args)
    
    for h in helpers:
        if h.get("name") == target_name:
            run_cmd(h.get("command"), h.get("cwd", ""))
            return
            
    print(f"Error: Command '{target_name}' not found in helper.json.")
    print("\nAvailable commands:")
    for h in helpers:
        print(f"  - {h.get('name')}")
    sys.exit(1)

if __name__ == "__main__":
    main()
