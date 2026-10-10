import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,TRACE_PATH,supportsBridge,marbleLanding} from '../src/rules.js';
const SAFE_GLASS=[0,1,1,0,1,0,0,1];
const step=(g,seconds,input={})=>{for(let t=0;t<seconds;t+=1/120)g.update(1/120,input);};
test('six consecutive wins advance automatically, retries retain the current stage',()=>{const g=new Game();g.reset(0);for(let i=0;i<6;i++){assert.equal(g.stage,i);g.win();if(i<5){assert.equal(g.status,'transition');step(g,3.3);assert.equal(g.status,'playing');}}assert.equal(g.status,'won');g.reset(4);g.lose('test');g.reset();assert.equal(g.stage,4);assert.equal(g.status,'playing');});
test('red light detects movement, while standing still stays alive',()=>{const g=new Game();g.reset();g.red=true;g.phase=2;step(g,.5);assert.equal(g.status,'playing');step(g,.05,{forward:1});assert.equal(g.status,'lost');});
test('jump returns to the ground and cannot be triggered twice in mid-air',()=>{const g=new Game();g.reset(5);g.jump();step(g,.2);assert.ok(g.position.y>1);const v=g.vy;g.jump();assert.equal(g.vy,v);step(g,.7);assert.equal(g.position.y,0);assert.ok(g.grounded);});
test('hurdles stop walking and allow a correctly timed jump',()=>{const g=new Game();g.reset(5);g.position.z=-5;step(g,.4,{forward:1});assert.ok(g.position.z>-6.5);g.jump();step(g,.65,{forward:1});assert.ok(g.position.z<-8);assert.equal(g.status,'playing');});
test('a pit causes a fall and a jump spans its width',()=>{const g=new Game();g.reset(5);g.position.z=-13.5;step(g,1,{forward:1});assert.equal(g.status,'lost');g.reset(5);g.position.z=-13.4;g.jump();step(g,.9,{forward:1});assert.equal(g.status,'playing');assert.ok(g.grounded);assert.ok(g.position.z<-17);});
test('candy requires the full ordered contour, not a jump to the end',()=>{const g=new Game();g.reset(1);assert.equal(g.tracePoint(150,260),false);assert.equal(g.trace,0);for(const p of TRACE_PATH)g.tracePoint(p.x,p.y);assert.equal(g.status,'transition');g.reset(1);g.crack();g.crack();assert.equal(g.status,'playing');g.crack();assert.equal(g.status,'lost');});
test('rhythmic pulls win, missed beats and inactivity lose',()=>{const g=new Game();g.reset(2);for(let i=0;i<12&&g.status==='playing';i++){while(g.elapsed<i*.85+.425)g.update(1/120);g.tug();}assert.equal(g.status,'transition');g.reset(2);step(g,23);assert.equal(g.status,'lost');});
test('three precisely aimed marble throws win; five misses lose',()=>{const g=new Game();g.reset(3);for(let i=0;i<3;i++){const x=g.targetX;g.aim=Math.atan2(x,15)/.36;g.charge();g.power=(Math.hypot(x,15)-4)/14;g.release();step(g,1.2);}assert.equal(g.hits,3);assert.equal(g.status,'transition');g.reset(3);for(let i=0;i<5;i++){g.charge();g.release();step(g,1.2);}assert.equal(g.misses,5);assert.equal(g.status,'lost');assert.deepEqual(marbleLanding(0,0),{x:0,z:1});});
test('glass panels support feet, gaps do not, fragile glass breaks',()=>{assert.ok(supportsBridge(-1.65,-3));assert.equal(supportsBridge(0,-3),false);const g=new Game();g.reset(4,true,SAFE_GLASS);g.position.x=SAFE_GLASS[0]? -1.65:1.65;g.position.z=-3;step(g,.1);assert.equal(g.broken.size,1);step(g,.8);assert.equal(g.status,'lost');});
test('safe glass route is traversable with actual jumps',()=>{const g=new Game();g.reset(4,true,SAFE_GLASS);let row=-1;const dt=1/240;for(let tick=0;tick<240*60&&g.status==='playing';tick++){
 const current=row<0?6:-3-row*5;
 const next=row===7?-43:-3-(row+1)*5;
 const nextX=row===7?g.position.x:SAFE_GLASS[row+1]?1.65:-1.65;
 if(g.grounded&&g.position.z>next+.8&&g.position.z<=current+.2){g.jump();}
 const forward=g.position.z>next?1:0;
 const side=Math.abs(g.position.x-nextX)>.04?Math.sign(nextX-g.position.x):0;
 g.update(dt,{forward,side});
 if(g.grounded&&Math.abs(g.position.z-next)<.3){row++;}
 }
 assert.equal(g.status,'transition',`position ${JSON.stringify(g.position)}: ${g.message}`);
});
test('timeout ends every playable stage',()=>{for(let i=0;i<6;i++){const g=new Game();g.reset(i);g.remaining=.01;g.update(.02);assert.equal(g.status,'lost');}});
test('red-light courtyard is traversable by stopping for every red phase',()=>{const g=new Game();g.reset(0);g.position.x=.8;for(let i=0;i<120*65&&g.status==='playing';i++)g.update(1/120,{forward:g.red?0:1});assert.equal(g.status,'transition');});
test('final course can be completed with jumps over hurdles and pits',()=>{const g=new Game();g.reset(5);g.position.x=8;const jumpZones=[-5.8,-13.4,-20.8,-31.4,-37.8];for(let i=0;i<240*20&&g.status==='playing';i++){if(g.grounded&&jumpZones.some(z=>g.position.z<=z&&g.position.z>z-.12))g.jump();g.update(1/240,{forward:1});}assert.equal(g.status,'won',g.message);});
