#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const Sim=require('./simulator.js');
function fail(message){console.error(message);process.exit(1);}
const file=process.argv[2];
if(!file)fail('Usage: node run.js <blueprint.json> [battle-count]');
let blueprint;
try{blueprint=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));}
catch(error){fail(`Cannot read blueprint: ${error.message}`);}
const count=Number(process.argv[3]||blueprint.runCount||1000);
const normalized=Sim.normalizeBlueprint(blueprint);
const result=count===1?Sim.runBattle(normalized,normalized.config.seed,true):Sim.runMany(normalized,count);
process.stdout.write(JSON.stringify({engineVersion:Sim.VERSION,blueprint:normalized,result},null,2)+'\n');
