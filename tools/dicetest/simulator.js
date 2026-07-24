/**
 * DA Battle Resolver Engine
 * Version 2.0.0
 *
 * AI editing contract
 * -------------------
 * This file contains battle mathematics only.
 * It must not read from or write to the DOM.
 * It must not download files or manage artwork.
 * Given the same blueprint and seed, it must always return the same result.
 *
 * Fairness invariant
 * ------------------
 * Swapping Army A and Army B must only swap their results.
 * No formula may contain an A-only or B-only bonus.
 */
(function attachSimulator(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.DASimulator = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createSimulator() {
  'use strict';

  const VERSION = '2.0.0';
  const DRAW_EPSILON = 1e-9;
  const ROUND_FACTOR = 1e9;

  function toUint32(value, fallback = 12345) {
    const number = Number(value);
    return Number.isFinite(number)
      ? Math.floor(number) >>> 0
      : Math.floor(fallback) >>> 0;
  }

  /**
   * Deterministic Mulberry32 pseudo-random generator.
   */
  function createRng(seed) {
    let state = toUint32(seed);

    return function random() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rollDie(rng, sides) {
    const safeSides = Math.max(1, Math.floor(Number(sides) || 1));
    return Math.floor(rng() * safeSides) + 1;
  }

  function roundStable(value) {
    return Math.round(value * ROUND_FACTOR) / ROUND_FACTOR;
  }

  function normalizeBlueprint(input) {
    const blueprint = JSON.parse(JSON.stringify(input || {}));

    blueprint.schema = 'sim-da-blueprint';
    blueprint.schemaVersion = 3;
    blueprint.simulator = 'dice-difference';
    blueprint.engineVersion = VERSION;
    blueprint.name = String(blueprint.name || 'Dice Difference Blueprint');
    blueprint.roster = blueprint.roster || {};
    blueprint.armyA = blueprint.armyA || {};
    blueprint.armyB = blueprint.armyB || {};

    blueprint.config = Object.assign({
      diceMode: 'single',
      dieASides: 10,
      dieBSides: 20,
      pctPerPoint: 2,
      numStages: 10,
      seed: 12345
    }, blueprint.config || {});

    blueprint.config.seed = toUint32(blueprint.config.seed);
    return blueprint;
  }

  function calculateArmyTotals(composition, roster) {
    let attack = 0;
    let defense = 0;
    let unitCount = 0;

    for (const unitId of Object.keys(roster)) {
      const count = Math.max(0, Number(composition[unitId]) || 0);
      const unit = roster[unitId] || {};

      attack += count * (Number(unit.atk) || 0);
      defense += count * (Number(unit.def) || 0);
      unitCount += count;
    }

    return { attack, defense, unitCount };
  }

  /**
   * Uses the true mathematical mean of a die: (sides + 1) / 2.
   * Therefore a fair die has an expected modifier of exactly 0%.
   */
  function centeredDiePoints(roll, sides) {
    return roll - ((sides + 1) / 2);
  }

  function rollModifier(rng, config) {
    const mainSides = Math.max(1, Math.floor(Number(config.dieBSides) || 1));
    const percentPerPoint = Number(config.pctPerPoint) || 0;

    if (config.diceMode === 'single') {
      const die = rollDie(rng, mainSides);
      const points = centeredDiePoints(die, mainSides);

      return {
        modifierPct: points * percentPerPoint,
        detail: `d${mainSides}=${die}; centered points=${points.toFixed(1)}`
      };
    }

    const outerSides = Math.max(1, Math.floor(Number(config.dieASides) || 1));
    const outerRoll = rollDie(rng, outerSides);
    const innerRolls = [];

    let points = 0;

    for (let index = 0; index < outerRoll; index += 1) {
      const die = rollDie(rng, mainSides);
      innerRolls.push(die);
      points += centeredDiePoints(die, mainSides);
    }

    /*
     * The outer die (dieASides) controls only how many main dice are rolled
     * this turn. It contributes no separate flat bonus/penalty of its own.
     * A flat ±nestedPenalty was previously applied based only on whether the
     * outer roll was above/below its mean, regardless of magnitude — that
     * meant a roll of 1 and a roll of 5 (both "below average" on a d10)
     * produced the identical adjustment. It was removed because it added
     * constant noise rather than scaled uncertainty tied to the actual roll.
     */
    return {
      modifierPct: points * percentPerPoint,
      detail:
        `d${outerSides}=${outerRoll}; ` +
        `${outerRoll}×d${mainSides}=[${innerRolls.join(', ')}]`
    };
  }

  /**
   * Resolve one side's stage score.
   *
   * Dice alter only that side's attack. Opponent defense remains fixed for
   * the stage. Both armies call this exact same function.
   */
  function resolveStagePower(attack, opponentDefense, modifierPct) {
    const modifiedAttack = attack * (1 + (modifierPct / 100));
    return Math.max(0, modifiedAttack - opponentDefense);
  }

  function runBattle(inputBlueprint, seed, includeStages = true) {
    const blueprint = normalizeBlueprint(inputBlueprint);
    const config = blueprint.config;
    const rng = createRng(seed ?? config.seed);

    const armyA = calculateArmyTotals(blueprint.armyA, blueprint.roster);
    const armyB = calculateArmyTotals(blueprint.armyB, blueprint.roster);

    let totalA = 0;
    let totalB = 0;
    const stages = [];

    const stageCount = Math.max(1, Math.floor(Number(config.numStages) || 1));

    for (let stage = 1; stage <= stageCount; stage += 1) {
      const rollA = rollModifier(rng, config);
      const rollB = rollModifier(rng, config);

      const powerA = resolveStagePower(
        armyA.attack,
        armyB.defense,
        rollA.modifierPct
      );

      const powerB = resolveStagePower(
        armyB.attack,
        armyA.defense,
        rollB.modifierPct
      );

      totalA += powerA;
      totalB += powerB;

      if (includeStages) {
        stages.push({
          stage,
          aModifierPct: rollA.modifierPct,
          bModifierPct: rollB.modifierPct,
          aRollDetail: rollA.detail,
          bRollDetail: rollB.detail,
          aPower: powerA,
          bPower: powerB
        });
      }
    }

    totalA = roundStable(totalA);
    totalB = roundStable(totalB);

    const margin = roundStable(totalA - totalB);
    const winner =
      Math.abs(margin) <= DRAW_EPSILON
        ? 'Draw'
        : margin > 0
          ? 'A'
          : 'B';

    return {
      seed: toUint32(seed ?? config.seed),
      winner,
      margin,
      aTotal: totalA,
      bTotal: totalB,
      aBaseAtk: armyA.attack,
      aBaseDef: armyA.defense,
      aUnitCount: armyA.unitCount,
      bBaseAtk: armyB.attack,
      bBaseDef: armyB.defense,
      bUnitCount: armyB.unitCount,
      stages
    };
  }

  function runMany(inputBlueprint, count = 100) {
    const blueprint = normalizeBlueprint(inputBlueprint);
    const battleCount = Math.max(1, Math.floor(Number(count) || 1));

    let aWins = 0;
    let bWins = 0;
    let draws = 0;
    let absoluteMarginTotal = 0;
    let signedMarginTotal = 0;
    let largestMargin = 0;
    let smallestMargin = Infinity;

    for (let index = 0; index < battleCount; index += 1) {
      const result = runBattle(
        blueprint,
        (blueprint.config.seed + index) >>> 0,
        false
      );

      const absoluteMargin = Math.abs(result.margin);

      if (result.winner === 'A') {
        aWins += 1;
      } else if (result.winner === 'B') {
        bWins += 1;
      } else {
        draws += 1;
      }

      absoluteMarginTotal += absoluteMargin;
      signedMarginTotal += result.margin;
      largestMargin = Math.max(largestMargin, absoluteMargin);
      smallestMargin = Math.min(smallestMargin, absoluteMargin);
    }

    return {
      count: battleCount,
      baseSeed: blueprint.config.seed,
      lastSeed: (blueprint.config.seed + battleCount - 1) >>> 0,
      aWins,
      bWins,
      draws,
      aWinPct: (aWins / battleCount) * 100,
      bWinPct: (bWins / battleCount) * 100,
      drawPct: (draws / battleCount) * 100,
      averageMargin: absoluteMarginTotal / battleCount,
      averageSignedMargin: signedMarginTotal / battleCount,
      largestMargin,
      smallestMargin: smallestMargin === Infinity ? 0 : smallestMargin
    };
  }

  /**
   * Diagnostic for equal armies.
   *
   * It copies Army A into Army B, runs many battles, and returns the
   * difference between A and B wins. The expected difference is zero.
   */
  function runFairnessCheck(inputBlueprint, count = 10000) {
    const blueprint = normalizeBlueprint(inputBlueprint);
    blueprint.armyB = JSON.parse(JSON.stringify(blueprint.armyA));

    const result = runMany(blueprint, count);
    const decisiveBattles = result.aWins + result.bWins;
    const decisiveGapPct = decisiveBattles
      ? Math.abs(result.aWins - result.bWins) / decisiveBattles * 100
      : 0;

    /*
     * A simple practical tolerance rather than a formal certification:
     * 3 percentage points for 10k runs, relaxed for smaller samples.
     */
    const tolerancePct = Math.max(3, 300 / Math.sqrt(Math.max(1, decisiveBattles)));

    return {
      ...result,
      decisiveBattles,
      decisiveGapPct,
      tolerancePct,
      pass: decisiveGapPct <= tolerancePct
    };
  }

  return {
    VERSION,
    DRAW_EPSILON,
    normalizeBlueprint,
    calculateArmyTotals,
    centeredDiePoints,
    runBattle,
    runMany,
    runFairnessCheck
  };
}));
