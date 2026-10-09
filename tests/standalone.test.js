import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
test('standalone export preserves dollar expressions and escapes closing script tags',async()=>{
 const root=await mkdtemp(join(tmpdir(),'arena-export-'));
 try{
  await mkdir(join(root,'dist/assets'),{recursive:true});
  const source='const text = '+JSON.stringify("$& $` $' </script>")+';';
  const css='body::after { content: "$&"; }';
  await writeFile(join(root,'dist/assets/game.js'),source);
  await writeFile(join(root,'dist/assets/game.css'),css);
  await writeFile(join(root,'dist/index.html'),'<html><head><script type="module" src="./assets/game.js"></script><link rel="stylesheet" href="./assets/game.css"></head><body></body></html>');
  execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/standalone.mjs',import.meta.url))],{cwd:root});
  const html=await readFile(join(root,'dist/jeu-squid.html'),'utf8');
  assert.equal(html.match(/<script/g).length,1);
  assert.ok(html.includes(source.replaceAll('</script','<\\/script')));
  assert.ok(html.includes(css));
  assert.ok(!html.includes('src="./assets'));
 }finally{await rm(root,{recursive:true,force:true});}
});
