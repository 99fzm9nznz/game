import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Game,supportsBridge} from '../src/rules.js';
import {Match,snapshotGame,applySnapshot} from '../src/match.js';
import {createBridgeLayout,fallPose} from '../src/bridge.js';
import {createGlassPanels,BridgeEffects} from '../src/bridge-effects.js';

const step=(game,seconds,input={})=>{for(let t=0;t<seconds;t+=1/240)game.update(1/240,input);};
const match=(random=()=>0)=>{const m=new Match('host','Alice',new Game(),random);m.add('guest','Bob');m.start();m.load(4);return m;};
const land=(game,side=1)=>{game.position={x:side?1.65:-1.65,y:1,z:-3};game.grounded=false;game.vy=-1;step(game,.35);};

test('bridge layouts use independent random draws, one safe side per row, and fresh draws per retry',()=>{
 let calls=0;const random=()=>calls++<8?.1:.9,g=new Game(random);
 g.reset(4);land(g,0);assert.equal(g.broken.size,0);
 g.reset(4);land(g,0);assert.ok(g.broken.has('0:0'));
 assert.deepEqual(createBridgeLayout(()=>.1),Array(8).fill(0));assert.deepEqual(createBridgeLayout(()=>.9),Array(8).fill(1));
 for(let i=0;i<25;i++){const layout=createBridgeLayout();assert.equal(layout.length,8);assert.ok(layout.every(s=>s===0||s===1));}
});
test('safe and fragile panes have identical physics and snapshots until descending foot contact',()=>{
 const safe=new Game(()=>0),fragile=new Game(()=>0);safe.reset(4,true,Array(8).fill(1));fragile.reset(4,true,Array(8).fill(0));
 for(const g of [safe,fragile]){g.position={x:1.65,y:0,z:-.5};g.jump();g.events.length=0;}
 let touched=false;
 for(let i=0;i<300;i++){
  const input={forward:safe.position.z>-3?1:0};safe.update(1/240,input);fragile.update(1/240,input);
  if(fragile.broken.size){touched=true;assert.equal(safe.position.y,0);assert.ok(safe.grounded);assert.equal(fragile.position.y,0);assert.equal(fragile.glassBreaks.length,1);break;}
  assert.deepEqual(snapshotGame(safe),snapshotGame(fragile));assert.equal(fragile.glassBreaks.length,0);
 }
 assert.ok(touched);step(fragile,.8);assert.equal(fragile.status,'lost');assert.ok(fragile.fall);assert.equal(safe.status,'playing');
});
test('landing, walking contact, and simultaneous visitors produce exactly one shared rupture',()=>{
 const m=match(),a=m.players.get('host').game,b=m.players.get('guest').game;
 for(const g of [a,b])g.position={x:1.65,y:0,z:-3};m.update(1/60);
 assert.equal(a.glassBreaks,b.glassBreaks);assert.equal(a.broken,b.broken);assert.equal(m.glassBreaks.length,1);
 assert.equal(m.effects.filter(e=>e.type==='glass').length,1);assert.ok(m.effects.find(e=>e.type==='glass').impact.key==='0:1');
 for(let i=0;i<180;i++)m.update(1/240);assert.ok([...m.players.values()].every(p=>p.eliminated));
 assert.equal(m.status,'finished');assert.equal(m.glassBreaks.length,1);
});
test('broken panes remain absent for survivors and cannot be jumped from or recovered below the surface',()=>{
 const m=match(),a=m.players.get('host').game,b=m.players.get('guest').game;land(b);
 assert.equal(supportsBridge(1.65,-3,a.broken),false);assert.equal(supportsBridge(-1.65,-3,a.broken),true);
 const velocity=b.vy;b.jump();assert.equal(b.vy,velocity);step(b,.7,{side:-1});assert.equal(b.status,'lost');assert.ok(a.broken.has('0:1'));
 a.position={x:-1.65,y:-.05,z:-3};a.vy=-1;a.grounded=false;step(a,.02);assert.ok(a.position.y<-.05);assert.equal(a.grounded,false);
});
test('the host shares one random layout and reveals only impacted panes, even after the effect journal expires',()=>{
 let draws=0;const m=match(()=>draws++%2===0?.1:.9);
 assert.equal(draws,8);const before=JSON.parse(JSON.stringify(m.snapshot()));
 for(const p of before.players){assert.deepEqual(p.game.glassBreaks,[]);assert.deepEqual(p.game.broken,[]);assert.ok(!Object.keys(p.game).some(k=>/layout|safe|seed|random/i.test(k)));}
 const b=m.players.get('guest').game;land(b);m.collectEffects();for(let i=0;i<40;i++)m.recordEffect({type:'step'});
 const wire=JSON.parse(JSON.stringify(m.snapshot())),client=new Game();applySnapshot(client,wire.players.find(p=>p.id==='guest').game);
 assert.ok(client.broken.has('0:1'));assert.deepEqual(client.glassBreaks,m.glassBreaks);assert.equal(client.glassBreaks.length,1);
 const world=new THREE.Group(),fx=new BridgeEffects(world);fx.update(0,client.elapsed,client.glassBreaks);assert.equal(fx.seen.size,1);assert.equal(fx.bursts.length,1);
});
test('all sixteen intact panes share the exact geometry and material, without fracture children',()=>{
 const world=new THREE.Group(),tiles=createGlassPanels(world);
 assert.equal(tiles.length,16);assert.equal(world.children.length,16);
 for(const {tile} of tiles){assert.equal(tile.geometry,tiles[0].tile.geometry);assert.equal(tile.material,tiles[0].tile.material);assert.deepEqual(tile.children,[]);assert.ok(tile.visible);assert.deepEqual(tile.scale.toArray(),[1,1,1]);}
});
test('shards and articulated falls are deterministic, generated only after impact, bounded and disposable',()=>{
 const a=new BridgeEffects(new THREE.Group()),b=new BridgeEffects(new THREE.Group());a.quality=b.quality='low';
 assert.equal(a.bursts.length,0);const impact={key:'2:1',at:4,seed:12,position:{x:1.65,y:0,z:-13}};
 a.update(0,4,[impact]);b.update(0,4,[impact]);assert.equal(a.bursts[0].shards.count,48);assert.deepEqual(a.bursts[0].pieces,b.bursts[0].pieces);
 a.update(.2,4.2,[impact]);b.update(.2,4.2,[impact]);assert.equal(a.bursts.length,1);assert.equal(a.bursts[0].cracks.visible,false);assert.deepEqual(a.bursts[0].shards.instanceMatrix.array,b.bursts[0].shards.instanceMatrix.array);
 a.update(3,7,[impact]);assert.equal(a.bursts.length,0);assert.equal(a.world.children.length,0);a.update(0,7,[impact]);assert.equal(a.bursts.length,0);
 const fall={position:{x:1,y:0,z:-3},velocity:{x:0,y:-1,z:0}};assert.deepEqual(fallPose(fall,1),fallPose(fall,1));assert.ok(fallPose(fall,1).y<-4);assert.ok(fallPose(fall,1).arms>0);
});
test('bridge has a shared 75-second deadline, pause freezes it, and replay resets holes and random draws',()=>{
 let calls=0;const m=match(()=>{calls++;return .1;});assert.equal(m.snapshot().remaining,75);
 m.paused=true;m.update(10);assert.equal(m.snapshot().remaining,75);m.paused=false;
 m.update(74.9);assert.ok(m.snapshot().remaining<.11);m.update(.2);
 assert.equal(m.snapshot().remaining,0);assert.equal(m.status,'finished');assert.ok([...m.players.values()].every(p=>p.eliminated));
 assert.ok(m.start());m.load(4);assert.equal(calls,16);assert.equal(m.broken.size,0);assert.deepEqual(m.glassBreaks,[]);
});

test('all 256 random layouts have a route traversable with real jumps within the deadline',()=>{
 for(let pattern=0;pattern<256;pattern++){
  const layout=Array.from({length:8},(_,row)=>pattern>>row&1),g=new Game();g.reset(4,true,layout);let row=-1;
  for(let tick=0;tick<240*60&&g.status==='playing';tick++){
   const current=row<0?6:-3-row*5,next=row===7?-43:-3-(row+1)*5,nextX=row===7?g.position.x:layout[row+1]?1.65:-1.65;
   if(g.grounded&&g.position.z>next+.8&&g.position.z<=current+.2)g.jump();
   g.update(1/240,{forward:g.position.z>next?1:0,side:Math.abs(g.position.x-nextX)>.04?Math.sign(nextX-g.position.x):0});
   if(g.grounded&&Math.abs(g.position.z-next)<.3)row++;
  }
  assert.equal(g.status,'transition',`layout ${pattern}: ${g.message}`);assert.equal(g.broken.size,0);assert.ok(g.remaining>0);
 }
});
