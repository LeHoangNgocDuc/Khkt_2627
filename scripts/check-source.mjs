/** Lightweight offline check; run npm run build on a machine with installed dependencies for full type-check. */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const rootDir=path.resolve(decodeURIComponent(root.pathname));
const files=[];
function walk(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,x.name);if(x.isDirectory())walk(full);else if(/\.(tsx?|mjs)$/.test(x.name))files.push(full);}}
walk(path.join(rootDir,'src'));
for(const n of fs.readdirSync(path.join(rootDir,'scripts')))if(n.endsWith('.mjs'))files.push(path.join(rootDir,'scripts',n));
const errors=[];
for(const f of files){
  const code=fs.readFileSync(f,'utf8');
  const jsx=f.endsWith('.tsx');
  const sf=ts.createSourceFile(f,code,ts.ScriptTarget.ES2022,true,jsx?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  if(sf.parseDiagnostics.length)for(const diag of sf.parseDiagnostics)errors.push(`${path.relative(rootDir,f)}: ${ts.flattenDiagnosticMessageText(diag.messageText,' ')}`);
  const regex=/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g;
  let m;
  while((m=regex.exec(code))!==null){
    const target=path.resolve(path.dirname(f),m[1]);
    if(![target,target+'.tsx',target+'.ts',target+'.js',target+'.mjs',path.join(target,'index.ts')].some(x=>fs.existsSync(x)))errors.push(`${path.relative(rootDir,f)}: missing relative import ${m[1]}`);
  }
}
const names=['src/App.tsx','src/data/identity.ts','src/components/IntroPage.tsx','src/components/ModelPage.tsx','src/components/PrinciplePage.tsx'];
for(const rel of names)if(!fs.existsSync(path.join(rootDir,rel)))errors.push(`Missing ${rel}`);
JSON.parse(fs.readFileSync(path.join(rootDir,'package.json'),'utf8'));
console.log(`VisionBot source: ${files.length} files checked, ${errors.length} errors.`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS — TS/TSX syntax and relative imports. (Type-check and browser render require npm install.)');
