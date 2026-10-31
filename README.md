# website2

Docusaurus-based frontend. Dark ("Obsidian") and light ("Porcelain") themes derived from the design reference in `ui_example.zip` (see `design/DESIGN.md`).

## Stack

- **Docusaurus 3** (React 18, TypeScript)
- **uilint** (`vendor/uilint`, vendored via `git subtree`) — declarative Galen-style layout tests
- **Playwright** — browser automation for layout/visual tests
- **sya** — git-native task tracker (`.sya/`)

## Development

```bash
npm run uilint:build # generate local @uilint/* 0.1.2 tarballs from vendor/
npm install
npm start           # dev server on :3000
npm run build       # production build
npm test            # production build (pretest), then unit/component tests (vitest)
npx vitest run      # the same tests without the build, for a fast local loop
npm run test:layout # uilint declarative layout tests
```

## Workflow (TDD)

All features and bugfixes go through sya tasks with a mandatory red-tests stage:

1. `spec` — task described, acceptance criteria fixed
2. `tests-red` — tests written FIRST and confirmed failing (1 test per 1–10 LOC of planned change)
3. `impl` — implementation until tests are green
4. `review` — tech-lead review + uilint layout check
5. `done`

## Vendored uilint

This project uses the checked-in `vendor/uilint` 0.1.2 packages instead of npm's older published 0.1.1 packages. Rebuild the vendored packages before installing from a fresh clone or after pulling upstream vendor changes:

```bash
npm run uilint:build
npm install
```

```bash
# pull upstream updates
git subtree pull --prefix vendor/uilint https://github.com/snjax/uilint main --squash
```
