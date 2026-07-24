# DA Battle Resolver — Modular Build

Open `index.html` directly in Chrome, Edge, or Firefox.

No installation or local server is required.

## File structure

- `index.html` — semantic UI markup only
- `styles.css` — interface styling only
- `simulator.js` — deterministic battle mathematics
- `ui.js` — tabs, fields, roster editing, rendering, imports, and runs
- `report.js` — JSON/Markdown download utilities
- `tests/simulator.test.html` — browser-based automated tests
- `AI_HANDOFF.md` — editing rules and formulas for AI coding tools
- `BATTLE_SYSTEM_HANDOFF.md` — design rationale and locked game values
- `config/default_battle_config.json` — production battle defaults

## Locked game defaults

- Nested dice mode
- Outer die: d10
- Main die: d20
- 2% per centered d20 point
- 10 internal battle stages
- One battle resolves inside one three-week game tick
- The d10 controls only how many d20s are rolled; it adds no separate flat bonus or penalty

## Important fixes

1. Army A and Army B call the exact same stage formula.
2. Dice are centered using the true die mean: `(sides + 1) / 2`.
3. Tiny floating-point differences are treated as draws.
4. The old low-roll-only nested penalty was removed.
5. Portraits are excluded from JSON and Markdown reports.
6. The Units tab is standard DOM code in `ui.js`.
7. A built-in identical-army fairness diagnostic is available in the app.

## Tests

Open `tests/simulator.test.html`.

The test runner checks determinism, identical-army symmetry, average signed margin, and whether a materially stronger army wins more often.
