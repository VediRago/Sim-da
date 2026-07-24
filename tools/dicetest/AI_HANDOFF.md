# AI Handoff — DA Battle Resolver

## Architecture

- `simulator.js`: pure deterministic battle mathematics. No DOM, downloads, artwork, or UI state.
- `ui.js`: reads fields, renders tabs/units/armies, calls the engine, and displays results.
- `report.js`: JSON and Markdown download utilities.
- `index.html`: semantic markup only.
- `styles.css`: visual styling only.
- `config/default_battle_config.json`: locked production defaults.

## Battle formula

For each stage, both sides independently roll a modifier:

```text
modified attack = base attack × (1 + modifier percent / 100)
stage power = max(0, modified attack − opponent base defense)
```

Army A and Army B must call the same function. Never add a side-specific bonus.

## Dice centering

The mathematical mean of an N-sided die is `(N + 1) / 2`.

```text
centered points = roll − ((N + 1) / 2)
modifier % = centered points × percentage per point
```

Do not change the d20 midpoint from 10.5 back to 10.

## Locked nested mode

1. Roll one d10 each stage.
2. The d10 controls only how many d20s are rolled.
3. Center every d20 around 10.5.
4. Multiply centered points by 2%.
5. Sum the d20 modifiers.
6. Do not add a separate flat d10 bonus or penalty.

## Fairness invariant

For identical armies, A and B win rates must converge and average signed margin must approach zero. Use `DASimulator.runFairnessCheck(blueprint, 10000)` after any engine change.

## Determinism invariant

The same blueprint and seed must return exactly the same result. Do not replace the seeded RNG with `Math.random()`.

## Draw handling

Never compare raw floating-point totals using only `margin === 0`. The engine rounds totals and applies `DRAW_EPSILON`.

## Data contract

Portrait paths are UI-only and must not be stored in exported blueprints or reports.
