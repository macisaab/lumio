#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
  npm install
fi

# Install Python dependencies if requirements files exist
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
elif [ -f "pyproject.toml" ]; then
  pip install -e .
fi

# Install Go dependencies if go.mod exists
if [ -f "go.mod" ]; then
  go mod download
fi

# Install Rust dependencies if Cargo.toml exists
if [ -f "Cargo.toml" ]; then
  cargo fetch
fi

# Install Ruby dependencies if Gemfile exists
if [ -f "Gemfile" ]; then
  bundle install
fi
