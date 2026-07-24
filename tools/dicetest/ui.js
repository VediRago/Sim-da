/**
 * DA Battle Resolver UI
 *
 * This file owns DOM interaction only. Battle mathematics belongs in
 * simulator.js. Report formatting belongs in report.js.
 */
(function startApp() {
  'use strict';

  const GENERIC_IMAGE = 'assets/units/generic.jpg';

  let units = [
    { id: 'militia', tier: 1, name: 'Militia', atk: 3, def: 2, image: 'assets/units/militia.jpg' },
    { id: 'spearman', tier: 1, name: 'Levy Spearman', atk: 5, def: 4, image: 'assets/units/spearman.jpg' },
    { id: 'guardsman', tier: 2, name: 'Guardsman', atk: 8, def: 7, image: 'assets/units/guardsman.jpg' },
    { id: 'menatarms', tier: 3, name: 'Men-at-Arms', atk: 12, def: 10, image: 'assets/units/menatarms.jpg' },
    { id: 'cavalry', tier: 4, name: 'Cavalry', atk: 20, def: 17, image: 'assets/units/cavalry.jpg' },
    { id: 'knight', tier: 4, name: 'Knight', atk: 24, def: 22, image: 'assets/units/knight.jpg' }
  ];

  let lastRun = null;
  const element = (id) => document.getElementById(id);

  function numberValue(id, fallback = 0) {
    const target = element(id);
    const value = target ? Number(target.value) : NaN;
    return Number.isFinite(value) ? value : fallback;
  }

  function setStatus(text) {
    element('status').textContent = text;
  }

  function unitSlug(value) {
    return DAReports.slug(value);
  }

  function uniqueId(base) {
    const root = unitSlug(base);
    let candidate = root;
    let suffix = 2;
    while (units.some((unit) => unit.id === candidate)) {
      candidate = `${root}_${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function snapshotCounts() {
    const counts = { A: {}, B: {} };
    for (const side of ['A', 'B']) {
      for (const unit of units) {
        counts[side][unit.id] = numberValue(`${side.toLowerCase()}_${unit.id}`);
      }
    }
    return counts;
  }

  function imageForUnitId(unitId) {
    return units.find((unit) => unit.id === unitId)?.image || GENERIC_IMAGE;
  }

  function renderUnitEditor() {
    element('unitEditor').innerHTML = units.map((unit) => `
      <div class="unit-row" data-id="${unit.id}">
        <img class="unit-portrait" src="${unit.image || GENERIC_IMAGE}" alt="${unit.name}">
        <label class="field"><span>Tier</span><input class="tier" type="number" min="1" value="${unit.tier}"></label>
        <label class="field name"><span>Unit name</span><input class="unit-name" value="${unit.name}"></label>
        <label class="field"><span>Attack</span><input class="attack" type="number" value="${unit.atk}"></label>
        <label class="field"><span>Defense</span><input class="defense" type="number" value="${unit.def}"></label>
        <button class="remove" type="button" aria-label="Remove ${unit.name}">×</button>
      </div>
    `).join('');

    document.querySelectorAll('.unit-row').forEach((row) => {
      const unit = units.find((candidate) => candidate.id === row.dataset.id);
      row.querySelector('.tier').addEventListener('input', (event) => {
        unit.tier = Math.max(1, Number(event.target.value) || 1);
        renderArmies(true);
      });
      row.querySelector('.unit-name').addEventListener('input', (event) => {
        unit.name = event.target.value || 'Unnamed unit';
        row.querySelector('.unit-portrait').alt = unit.name;
        renderArmies(true);
      });
      row.querySelector('.attack').addEventListener('input', (event) => {
        unit.atk = Number(event.target.value) || 0;
        renderArmies(true);
      });
      row.querySelector('.defense').addEventListener('input', (event) => {
        unit.def = Number(event.target.value) || 0;
        renderArmies(true);
      });
      row.querySelector('.remove').addEventListener('click', () => {
        units = units.filter((candidate) => candidate.id !== unit.id);
        renderAll();
      });
    });
  }

  function renderArmies(preserve = true) {
    const counts = preserve ? snapshotCounts() : { A: {}, B: {} };
    const sortedUnits = units.slice().sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));

    for (const side of ['A', 'B']) {
      element(`army${side}`).innerHTML = sortedUnits.map((unit) => `
        <label class="army-entry">
          <img class="avatar" src="${unit.image || GENERIC_IMAGE}" alt="">
          <span><strong>${unit.name}</strong><small>Tier ${unit.tier} · ATK ${unit.atk} · DEF ${unit.def}</small></span>
          <input id="${side.toLowerCase()}_${unit.id}" type="number" min="0" value="${counts[side][unit.id] ?? 0}" aria-label="${side} ${unit.name} quantity">
        </label>
      `).join('');
      for (const unit of units) {
        element(`${side.toLowerCase()}_${unit.id}`).addEventListener('input', renderPreview);
      }
    }
    renderPreview();
  }

  function renderPreview() {
    for (const side of ['A', 'B']) {
      const tokens = [];
      let totalUnits = 0;
      let totalAttack = 0;
      let totalDefense = 0;
      for (const unit of units) {
        const count = Math.max(0, Math.floor(numberValue(`${side.toLowerCase()}_${unit.id}`)));
        totalUnits += count;
        totalAttack += count * unit.atk;
        totalDefense += count * unit.def;
        for (let index = 0; index < Math.min(4, count); index += 1) {
          tokens.push(`<span class="token" title="Tier ${unit.tier} ${unit.name}" style="background-image: url('${unit.image || GENERIC_IMAGE}')"></span>`);
        }
      }
      element(`preview${side}`).innerHTML = tokens.length ? tokens.join('') : '<small>Add units below.</small>';
      element(`summary${side}`).textContent = totalUnits ? `${totalUnits} units · ATK ${totalAttack} · DEF ${totalDefense}` : 'No units selected';
    }
  }

  function renderAll() {
    renderUnitEditor();
    renderArmies(true);
  }

  function readBlueprint() {
    const roster = {};
    const armyA = {};
    const armyB = {};
    for (const unit of units) {
      roster[unit.id] = { name: unit.name, tier: unit.tier, atk: unit.atk, def: unit.def };
      armyA[unit.id] = Math.max(0, numberValue(`a_${unit.id}`));
      armyB[unit.id] = Math.max(0, numberValue(`b_${unit.id}`));
    }
    return DASimulator.normalizeBlueprint({
      name: element('name').value,
      runCount: Math.max(1, Math.floor(numberValue('runCount', 1000))),
      roster,
      armyA,
      armyB,
      config: {
        diceMode: element('diceMode').value,
        dieASides: Math.max(1, Math.floor(numberValue('dieASides', 10))),
        dieBSides: Math.max(1, Math.floor(numberValue('dieBSides', 20))),
        pctPerPoint: numberValue('pctPerPoint', 2),
        numStages: Math.max(1, Math.floor(numberValue('numStages', 10))),
        seed: Math.floor(numberValue('seed', 12345)) >>> 0
      }
    });
  }

  function applyBlueprint(input) {
    const blueprint = DASimulator.normalizeBlueprint(input);
    units = Object.entries(blueprint.roster).map(([id, unit]) => ({
      id,
      tier: Math.max(1, Number(unit.tier) || 1),
      name: unit.name || id,
      atk: Number(unit.atk) || 0,
      def: Number(unit.def) || 0,
      image: imageForUnitId(id)
    }));
    renderUnitEditor();
    renderArmies(false);
    for (const unit of units) {
      element(`a_${unit.id}`).value = blueprint.armyA[unit.id] ?? 0;
      element(`b_${unit.id}`).value = blueprint.armyB[unit.id] ?? 0;
    }
    for (const key of ['diceMode', 'dieASides', 'dieBSides', 'pctPerPoint', 'numStages', 'seed']) {
      element(key).value = blueprint.config[key];
    }
    element('name').value = blueprint.name;
    element('runCount').value = blueprint.runCount || 1000;
    renderPreview();
    setStatus('Blueprint loaded.');
  }

  function runDetailedBattle() {
    const blueprint = readBlueprint();
    const result = DASimulator.runBattle(blueprint, blueprint.config.seed, true);
    const lines = [
      `Seed=${result.seed}`,
      `A base ATK=${result.aBaseAtk.toFixed(1)} DEF=${result.aBaseDef.toFixed(1)} | B base ATK=${result.bBaseAtk.toFixed(1)} DEF=${result.bBaseDef.toFixed(1)}`,
      ''
    ];
    for (const stage of result.stages) {
      lines.push(
        `Stage ${stage.stage}: A mod=${stage.aModifierPct.toFixed(1)}% B mod=${stage.bModifierPct.toFixed(1)}% | A=${stage.aPower.toFixed(2)} B=${stage.bPower.toFixed(2)}`,
        `  A: ${stage.aRollDetail}`,
        `  B: ${stage.bRollDetail}`
      );
    }
    lines.push('', `FINAL A=${result.aTotal.toFixed(2)} B=${result.bTotal.toFixed(2)} Winner=${result.winner} Margin=${result.margin.toFixed(2)}`);
    lastRun = { blueprint, text: lines.join('\n'), created: new Date().toISOString() };
    element('log').textContent = lastRun.text;
    element('outcome').textContent = result.winner;
    element('metricA').textContent = result.aTotal.toFixed(2);
    element('metricB').textContent = result.bTotal.toFixed(2);
    element('margin').textContent = Math.abs(result.margin).toFixed(2);
    setStatus('Detailed battle complete.');
  }

  function runBatch(count) {
    const blueprint = readBlueprint();
    const result = DASimulator.runMany(blueprint, count);
    const text = [
      `Ran ${result.count} battles. Seeds ${result.baseSeed}..${result.lastSeed}`,
      '',
      `A wins: ${result.aWins} (${result.aWinPct.toFixed(2)}%)`,
      `B wins: ${result.bWins} (${result.bWinPct.toFixed(2)}%)`,
      `Draws: ${result.draws} (${result.drawPct.toFixed(2)}%)`,
      '',
      `A−B win-rate gap: ${Math.abs(result.aWinPct - result.bWinPct).toFixed(2)} percentage points`,
      `Average signed margin: ${result.averageSignedMargin.toFixed(4)}`,
      `Average absolute margin: ${result.averageMargin.toFixed(2)}`,
      `Largest margin: ${result.largestMargin.toFixed(2)}`
    ].join('\n');
    lastRun = { blueprint, text, created: new Date().toISOString() };
    element('log').textContent = text;
    element('outcome').textContent = result.aWins > result.bWins ? 'A' : result.bWins > result.aWins ? 'B' : 'Even';
    element('metricA').textContent = `${result.aWinPct.toFixed(2)}%`;
    element('metricB').textContent = `${result.bWinPct.toFixed(2)}%`;
    element('margin').textContent = `${Math.abs(result.aWinPct - result.bWinPct).toFixed(2)} pp`;
    setStatus(`${count.toLocaleString()} battles complete.`);
  }

  function runFairnessCheck() {
    const result = DASimulator.runFairnessCheck(readBlueprint(), 10000);
    const target = element('fairnessResult');
    target.classList.remove('pass', 'warn');
    target.classList.add(result.pass ? 'pass' : 'warn');
    target.textContent = [
      result.pass ? 'PASS' : 'CHECK REQUIRED',
      `A: ${result.aWinPct.toFixed(2)}%`,
      `B: ${result.bWinPct.toFixed(2)}%`,
      `Draws: ${result.drawPct.toFixed(2)}%`,
      `Decisive A/B gap: ${result.decisiveGapPct.toFixed(2)}%`,
      `Allowed diagnostic tolerance: ${result.tolerancePct.toFixed(2)}%`
    ].join('\n');
    setStatus('Identical-army fairness test complete.');
  }

  function bindTabs() {
    document.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
        element('battleTab').hidden = button.dataset.tab !== 'battle';
        element('unitsTab').hidden = button.dataset.tab !== 'units';
      });
    });
  }

  function bindActions() {
    element('addUnit').addEventListener('click', () => {
      units.push({ id: uniqueId('new_unit'), tier: 1, name: 'New Unit', atk: 1, def: 1, image: GENERIC_IMAGE });
      renderAll();
    });
    element('newSeed').addEventListener('click', () => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      element('seed').value = values[0];
      setStatus('New seed generated.');
    });
    element('runOne').addEventListener('click', runDetailedBattle);
    document.querySelectorAll('.batch').forEach((button) => button.addEventListener('click', () => runBatch(Number(button.dataset.count))));
    element('runFairness').addEventListener('click', runFairnessCheck);
    element('exportJson').addEventListener('click', () => {
      const blueprint = readBlueprint();
      DAReports.downloadFile(`${DAReports.slug(blueprint.name)}_blueprint.json`, JSON.stringify(blueprint, null, 2), 'application/json;charset=utf-8');
      setStatus('Blueprint exported.');
    });
    element('importJson').addEventListener('click', () => element('fileInput').click());
    element('fileInput').addEventListener('change', async () => {
      try {
        const file = element('fileInput').files[0];
        if (!file) return;
        applyBlueprint(JSON.parse(await file.text()));
      } catch (error) {
        setStatus(`Import failed: ${error.message}`);
      } finally {
        element('fileInput').value = '';
      }
    });
    element('downloadMd').addEventListener('click', () => {
      if (!lastRun) {
        setStatus('Run a test first.');
        return;
      }
      const markdown = DAReports.buildMarkdownReport(lastRun, element('notes').value);
      DAReports.downloadFile(`${DAReports.slug(lastRun.blueprint.name)}_report.md`, markdown, 'text/markdown;charset=utf-8');
      setStatus('Report downloaded.');
    });
  }

  function initialize() {
    if (!window.DASimulator || !window.DAReports) throw new Error('Required JavaScript files did not load.');
    element('engineVersion').textContent = DASimulator.VERSION;
    element('diceMode').value = 'nested';
    bindTabs();
    bindActions();
    renderAll();
    setStatus('Ready · modular fair-dice build.');
  }

  initialize();
}());
