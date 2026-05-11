#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# This installs the necessary dependencies for Puppeteer to run on Render
# Puppeteer usually needs some system-level libraries
# Render's environment might need these if not using a Dockerfile
