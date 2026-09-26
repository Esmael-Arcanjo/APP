#!/bin/sh
# Start the LEAMSE Marketplace frontend on port 3001.
# The SaaS frontend keeps running on 3000 — they share the same backend.
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  yarn install --frozen-lockfile
fi
exec yarn start
