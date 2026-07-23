# AI Start Here — Sim-da

This repository is the public simulation workspace for the DA game project.

Its purpose is to let AI assistants and developers inspect, run, modify, and compare isolated game-system simulations without access to the private DA design repository.

## Start Here

For the current simulator, read these files in order:

1. [`tools/dicetest/AI_USAGE.md`](tools/dicetest/AI_USAGE.md)
2. [`tools/dicetest/example-blueprint.json`](tools/dicetest/example-blueprint.json)
3. [`tools/dicetest/simulator.js`](tools/dicetest/simulator.js)
4. [`tools/dicetest/run.js`](tools/dicetest/run.js)
5. [`tools/dicetest/index.html`](tools/dicetest/index.html) if browser interaction is relevant

## Current Simulator

The current tool is a deterministic dice-difference battle simulator located at:

```text
tools/dicetest/
```

Main files:

```text
tools/dicetest/simulator.js
tools/dicetest/run.js
tools/dicetest/example-blueprint.json
tools/dicetest/index.html
tools/dicetest/AI_USAGE.md
```

## Run From Node.js

From the repository root:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json
```

Override the number of battles:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json 5000
```

Use one battle when stage-by-stage output is needed:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json 1
```

## Public Raw URLs

If normal GitHub file pages are difficult to fetch, use these raw URLs:

```text
https://raw.githubusercontent.com/VediRago/Sim-da/main/AI_START_HERE.md
https://raw.githubusercontent.com/VediRago/Sim-da/main/tools/dicetest/AI_USAGE.md
https://raw.githubusercontent.com/VediRago/Sim-da/main/tools/dicetest/simulator.js
https://raw.githubusercontent.com/VediRago/Sim-da/main/tools/dicetest/run.js
https://raw.githubusercontent.com/VediRago/Sim-da/main/tools/dicetest/example-blueprint.json
```

## Simulation Contract

- The blueprint is the complete reproducible input.
- The report is the output and interpretation of a simulation run.
- Preserve all result-affecting values inside the blueprint.
- Preserve seeds when comparing versions or parameter changes.
- Change one relevant variable at a time when testing causality.
- Use the shared `simulator.js` engine rather than recreating its logic in another file.
- Record engine version, blueprint values, run count, and seeds in reports.

## Scope Boundary

This public repository contains simulation tools, not the complete private DA design documentation.

When a design assumption is not represented in the blueprint, code, or user-provided context, state it clearly as an assumption rather than presenting it as established DA design.
