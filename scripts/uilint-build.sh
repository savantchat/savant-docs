#!/bin/sh
set -eu

cd "$(dirname "$0")/../vendor/uilint"
npx pnpm@10.11.0 install --frozen-lockfile
npx pnpm@10.11.0 build

# TypeScript's build cache depends on ancestor node_modules; do not ship it.
rm -f packages/*/dist/*.tsbuildinfo
mkdir -p ../../.uilint-packages
npx pnpm@10.11.0 --filter @uilint/core pack --pack-destination ../../.uilint-packages
npx pnpm@10.11.0 --filter @uilint/playwright pack --pack-destination ../../.uilint-packages
npx pnpm@10.11.0 --filter @uilint/cli pack --pack-destination ../../.uilint-packages
