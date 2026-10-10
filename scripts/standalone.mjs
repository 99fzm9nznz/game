import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const root=resolve('dist');
async function asset(url){const path=resolve(root,url.replace(/^\.\//,'').replace(/^\//,''));if(relative(root,path).startsWith('..'))throw new Error('Asset outside dist');return readFile(path,'utf8');}
let html=await readFile(resolve(root,'index.html'),'utf8');
const js=html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const css=html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if(!js||!css)throw new Error('Build first: expected JavaScript and stylesheet in dist/index.html');
const sounds={};
try { for(const filename of await readdir(resolve(root,'audio'))) {
 if(!filename.endsWith('.ogg'))continue;
 sounds[filename.slice(0,-4)]='data:audio/ogg;base64,'+(await readFile(resolve(root,'audio',filename))).toString('base64');
} } catch(error) { if(error.code!=='ENOENT')throw error; }
try { const credits=await readFile(resolve(root,'audio/CREDITS.md'),'utf8');html=html.replace(/<a class="credits-link"[^>]*>[^<]*<\/a>/,()=>'<details class="offline-credits"><summary>Crédits des sons et des voix</summary><pre>'+credits.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</pre></details>'); } catch(error) { if(error.code!=='ENOENT')throw error; }
const script=('globalThis.__ARENA_AUDIO__='+JSON.stringify(sounds)+';\n'+await asset(js[1])).replaceAll('</script','<\\/script');
html=html.replace(js[0],()=>`<script type="module">${script}</script>`);
const stylesheet=await asset(css[1]);
html=html.replace(css[0],()=>`<style>${stylesheet}</style>`);
await writeFile(resolve(root,'jeu-squid.html'),html);
console.log('Version autonome créée : dist/jeu-squid.html');
