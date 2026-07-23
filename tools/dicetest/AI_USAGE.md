# AI Usage Guide — Dice Difference Battle Simulator

## Purpose

This simulator tests how two army compositions perform under configurable dice-based battle variance.

It is an isolated mechanics laboratory. Its outputs are evidence for design discussion, not automatically final game rules.

## Canonical Files

- `simulator.js` — shared deterministic simulation engine.
- `run.js` — Node.js command-line runner.
- `example-blueprint.json` — reproducible example input.
- `index.html` — browser interface.
- `reports/` — saved Markdown reports and experiment notes.

Do not duplicate the battle-resolution logic in another runner or interface. Both browser and command-line tools should use `simulator.js`.

## Requirements

- Node.js for command-line runs.
- No package installation is required.
- GitHub Pages is optional and only relevant to the browser interface.

## Basic Commands

Run the example blueprint using its configured `runCount`:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json
```

Run 5,000 battles regardless of the blueprint's stored count:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json 5000
```

Run one detailed battle with stage output:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json 1
```

The runner prints JSON containing:

- engine version;
- normalized blueprint;
- aggregate or single-battle result.

## Blueprint Structure

A valid blueprint contains:

```json
{
  "schema": "sim-da-blueprint",
  "schemaVersion": 1,
  "simulator": "dice-difference",
  "name": "Experiment name",
  "runCount": 1000,
  "roster": {},
  "armyA": {},
  "armyB": {},
  "config": {}
}
```

### `roster`

Defines each unit type's base attack and defence values.

```json
"roster": {
  "militia": {"atk": 3, "def": 2},
  "guardsman": {"atk": 8, "def": 7}
}
```

### `armyA` and `armyB`

Define how many units of each roster type belong to each army.

```json
"armyA": {"militia": 100, "guardsman": 0},
"armyB": {"militia": 0, "guardsman": 30}
```

### `config`

Important fields:

- `diceMode`: `single` or `nested`.
- `dieASides`: first die size in nested mode.
- `dieBSides`: main die size.
- `pctPerPoint`: percentage modifier per point from the die midpoint.
- `nestedPenalty`: additional penalty when the first nested roll is below its midpoint.
- `numStages`: number of battle stages.
- `aKnightBonusPct`: global percentage bonus for Army A.
- `bKnightBonusPct`: global percentage bonus for Army B.
- `seed`: deterministic starting seed.

## Reproducibility Rules

When comparing two ideas:

1. Copy the baseline blueprint.
2. Give the copy a descriptive name.
3. Keep the same seed and run count.
4. Change only the variable being tested.
5. Run both blueprints.
6. Compare win rates, draw rate, average signed margin, average absolute margin, and extreme margins.
7. Record the engine version.

Changing multiple variables at once makes causal interpretation weaker.

## Seeds

The simulator is deterministic.

The same blueprint, engine version, run count, and base seed should produce the same results.

For aggregate runs, battle seeds advance sequentially from the configured seed.

Preserve seeds in any report intended for later comparison.

## Recommended Report Format

Save experiment reports under `tools/dicetest/reports/`.

```markdown
# Experiment title

## Question
What design question is being tested?

## Baseline
- Blueprint:
- Engine version:
- Run count:
- Base seed:

## Variant
Exactly what changed?

## Results
- Army A win rate:
- Army B win rate:
- Draw rate:
- Average signed margin:
- Average absolute margin:
- Largest margin:
- Smallest margin:

## Interpretation
What does the result suggest?

## Limits
What does this simulator not model?

## Recommendation
Keep, reject, or test further.
```

## Editing the Engine

Before changing `simulator.js`:

- identify the exact design question;
- preserve deterministic behavior;
- update the engine version when outcomes can change;
- keep browser and Node compatibility;
- rerun existing baseline blueprints;
- document any changed formula or interpretation.

Do not silently change formulas and then compare new outputs against old reports as though the engine were unchanged.

## Interpreting Results

A high win rate does not automatically mean a design is good.

Also inspect:

- margin size;
- volatility;
- frequency of extreme outcomes;
- sensitivity to army composition;
- sensitivity to dice settings;
- whether the mechanic produces the intended player experience.

Simulation evidence supports design judgment; it does not replace it.

## Scope

This repository does not contain the entire DA game design. Use only the assumptions represented in the current blueprint, engine, repository documentation, or context explicitly supplied by the user.
