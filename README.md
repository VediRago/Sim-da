# DA Simulation Lab

Public standalone simulation tools used to test DA game systems.

## AI Entry Point

AI assistants and automated tools should begin with:

- [AI Start Here](AI_START_HERE.md)

For the current battle simulator, read:

- [Dice Simulator AI Usage Guide](tools/dicetest/AI_USAGE.md)

## Current Simulator

### Dice Difference Battle Simulator

Location:

```text
tools/dicetest/
```

Files:

- [Browser simulator](tools/dicetest/index.html)
- [Shared deterministic engine](tools/dicetest/simulator.js)
- [Node.js runner](tools/dicetest/run.js)
- [Example reproducible blueprint](tools/dicetest/example-blueprint.json)
- [AI usage instructions](tools/dicetest/AI_USAGE.md)
- `tools/dicetest/reports/` — saved experiment reports

Run from the repository root:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json
```

Run a specific number of battles:

```bash
node tools/dicetest/run.js tools/dicetest/example-blueprint.json 5000
```

GitHub Pages is not required for Node.js simulation runs.

## Structure

```text
AI_START_HERE.md
index.html
tools/
  dicetest/
    AI_USAGE.md
    simulator.js
    run.js
    example-blueprint.json
    index.html
    reports/
```

Each simulator should test one isolated design question and export reproducible reports for later AI and design discussion.

Future tools, such as village growth, should use the same pattern:

```text
tools/village-growth/
  AI_USAGE.md
  simulator.js
  run.js
  example-blueprint.json
  index.html
  reports/
```

## Public Raw Entry URL

```text
https://raw.githubusercontent.com/VediRago/Sim-da/main/AI_START_HERE.md
```
