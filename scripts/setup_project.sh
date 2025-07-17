#!/bin/bash

if ! command -v cz >/dev/null; then
    git config --global push.autoSetupRemote true
    git config --global --ad safe.directory /workspaces/devops-study-app
    pip install --user pipx
    pipx install commitizen
    pre-commit install
    pre-commit install --hook-type commit-msg
fi
