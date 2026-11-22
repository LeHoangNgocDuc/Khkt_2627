// No WebGL needed: tests the electrical model compiled in memory using TypeScript.
import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
const raw=fs.readFileSync(new URL('../src/data/circuitData.ts',import.meta.url),'utf8');
const js=ts.transpileModule(raw,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};
vm.runInNewContext(js,{exports,console}, {filename:'circuitData.transpiled.cjs'});
const errors=exports.validateCircuit();
const expected=Object.keys(exports.PARTS).length;
const header=exports.HEADER_PINS.length;
const wires=exports.WIRES.length;
console.log(`VisionBot: ${expected} bộ phận, ${header} chân header, ${wires} đường đấu nối.`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
if(expected!==14||header!==40||wires!==30){console.error('Số lượng dữ liệu không như dự kiến.');process.exit(1);}
console.log('PASS — không trùng mã dây hoặc thiếu neo chân.');
