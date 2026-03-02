#!/usr/bin/env python3
# /// script
# dependencies = [
#   "dacite",
# ]
# ///
import json
import subprocess
import sys
import os
import dacite
from dataclasses import dataclass

@dataclass
class Command:
    name: str
    command: str
    cwd: str
    forceInline: bool | None = None

@dataclass
class Commands:
    commands: list[Command]

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
HELPER_JSON_PATH = os.path.join(ROOT_DIR, "commands.json")

def load_helpers() -> list[Command]:
    if not os.path.exists(HELPER_JSON_PATH):
        print(f"Error: {HELPER_JSON_PATH} not found.")
        sys.exit(1)
    with open(HELPER_JSON_PATH, "r") as f:
        try:
            raw_data = json.load(f)
            parsed = dacite.from_dict(data_class=Commands, data={"commands": raw_data})
            return parsed.commands
        except Exception as e:
            print(f"Error parsing commands.json: {e}")
            sys.exit(1)

def run_cmd(command: Command, inline=False):
    cwd = os.path.join(ROOT_DIR, command.cwd)
    print(f"==> Running: {command.command}\n    in: {cwd}")

    # We use shell=True since command strings are provided directly from configuration
    try:
        if inline or (command.forceInline is not None and command.forceInline):
            # Run in the current terminal instance
            subprocess.run(command.command, cwd=cwd, check=True, shell=True)
        else:
            # open the new intsance of terminal first
            if os.name == "posix":
                subprocess.run(f"gnome-terminal --working-directory={cwd} -- {command.command}", shell=True)
            elif os.name == "nt":
                subprocess.run(f"cmd /k cd /d {cwd} && {command.command}", shell=True)
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
        print("Usage: uv run helper.py [--inline] <command_name>")
        print("\nAvailable commands in commands.json:")
        for h in helpers:
            print(f"  - {h.name}")
        sys.exit(1)
        
    target_args = sys.argv[1:]
    
    inline = False
    if "--inline" in target_args:
        inline = True
        target_args.remove("--inline")
        
    target_name = " ".join(target_args)
    
    for h in helpers:
        if h.name == target_name:
            run_cmd(h, inline=inline)
            return
            
    print(f"Error: Command '{target_name}' not found in commands.json.")
    print("\nAvailable commands:")
    for h in helpers:
        print(f"  - {h.name}")
    sys.exit(1)

if __name__ == "__main__":
    main()
