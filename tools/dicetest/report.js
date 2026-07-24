/**
 * DA report and download utilities.
 * UI artwork is intentionally excluded from blueprints and reports.
 */
(function attachReports(root) {
  'use strict';

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'battle';
  }

  function downloadFile(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function compositionLines(blueprint, side) {
    const composition = blueprint[`army${side}`] || {};

    const lines = Object.entries(composition)
      .filter(([, count]) => Number(count) > 0)
      .map(([unitId, count]) => {
        const unit = blueprint.roster[unitId] || {};
        return `- ${unit.name || unitId}: ${count}`;
      });

    return lines.length ? lines.join('\n') : '- No units';
  }

  function rosterLines(blueprint) {
    const lines = Object.values(blueprint.roster || {}).map((unit) =>
      `- Tier ${unit.tier} — ${unit.name}: ATK ${unit.atk}, DEF ${unit.def}`
    );

    return lines.length ? lines.join('\n') : '- No units';
  }

  function buildMarkdownReport(lastRun, notes) {
    const blueprint = lastRun.blueprint;

    return `# ${blueprint.name}

- Created: ${lastRun.created}
- Engine: ${root.DASimulator.VERSION}
- Seed: ${blueprint.config.seed}
- Dice mode: ${blueprint.config.diceMode}
- Battle stages: ${blueprint.config.numStages}

## Notes

${notes || 'No notes.'}

## Unit roster

${rosterLines(blueprint)}

## Army A

${compositionLines(blueprint, 'A')}

## Army B

${compositionLines(blueprint, 'B')}

## Results

\`\`\`text
${lastRun.text}
\`\`\`
`;
  }

  root.DAReports = {
    slug,
    downloadFile,
    buildMarkdownReport
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
