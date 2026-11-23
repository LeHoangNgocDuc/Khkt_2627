// No WebGL needed: tests the electrical model compiled in memory using TypeScript.
import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
const raw=fs.readFileSync(new URL('../src/data/circuitData.ts',import.meta.url),'utf8');
const js=ts.transpileModule(raw,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};
vm.runInNewContext(js,{exports,console}, {filename:'circuitData.transpiled.cjs'});
const errors=[...exports.validateCircuit(),...exports.validateFlatBoard()];
const actualRoutes=Object.keys(exports.FLAT_ROUTES).length;
for(const wire of exports.WIRES){
  const points=exports.FLAT_ROUTES[wire.id];if(!points)continue;
  for(let i=1;i<points.length-2;i++){
    const p=points[i],q=points[i+1];
    for(const [name,b] of Object.entries(exports.FLAT_BOUNDS)){
      const vertical=p[0]===q[0]&&p[0]>b.x+3&&p[0]<b.x+b.width-3&&Math.max(p[1],q[1])>b.y+3&&Math.min(p[1],q[1])<b.y+b.height-3;
      const horizontal=p[1]===q[1]&&p[1]>b.y+3&&p[1]<b.y+b.height-3&&Math.max(p[0],q[0])>b.x+3&&Math.min(p[0],q[0])<b.x+b.width-3;
      if(vertical||horizontal) errors.push(`${wire.id}: đường dây cắt thân ${name}`);
    }
  }
}

const expected=Object.keys(exports.PARTS).length;
const header=exports.HEADER_PINS.length;
const wires=exports.WIRES.length;
console.log(`VisionBot: ${expected} bộ phận, ${header} chân header, ${wires} đường đấu nối, ${actualRoutes} tuyến 2D.`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
if(expected!==14||header!==40||wires!==30||actualRoutes!==30){console.error('Số lượng dữ liệu không như dự kiến.');process.exit(1);}
console.log('PASS — đủ chân, đúng tâm pad, dây vuông góc, không đâm xuyên linh kiện.');
