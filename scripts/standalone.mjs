import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const root=resolve('dist');
async function asset(url){const path=resolve(root,url.replace(/^\.\//,'').replace(/^\//,''));if(relative(root,path).startsWith('..'))throw new Error('Asset outside dist');return readFile(path,'utf8');}
let html=await readFile(resolve(root,'index.html'),'utf8');
const js=html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const css=html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if(!js||!css)throw new Error('Build first: expected JavaScript and stylesheet in dist/index.html');
const script=(await asset(js[1])).replaceAll('</script','<\\/script');
html=html.replace(js[0],()=>`<script type="module">${script}</script>`);
const stylesheet=await asset(css[1]);
html=html.replace(css[0],()=>`<style>${stylesheet}</style>`);
await writeFile(resolve(root,'jeu-squid.html'),html);
console.log('Version autonome créée : dist/jeu-squid.html');
