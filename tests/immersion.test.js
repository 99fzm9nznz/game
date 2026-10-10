import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {Game} from '../src/rules.js';
import {Match,applySnapshot,snapshotGame} from '../src/match.js';
import {resetSun,advanceSun,sunPose,SUN_GRACE} from '../src/sun-cycle.js';
import {deathPose,deathHeight} from '../src/death-motion.js';
import {statePacket,shouldSendInput,freshEffect} from '../src/network-sync.js';
const step=(match,time)=>{for(let t=0;t<time;t+=1/120)match.update(1/120);};
test('network packets send each new effect and idle input retains a safe heartbeat',()=>{
 const state={version:2,elapsed:12,players:[],effects:[{id:8,type:'lose',at:10},{id:9,type:'step',at:11.8}]};
 assert.deepEqual(statePacket(state,8).state.effects,[state.effects[1]]);assert.equal(statePacket(state,9).state.effects.length,0);assert.equal(state.effects.length,2);
 assert.equal(shouldSendInput({side:0,forward:0},{side:0,forward:0},50,2,2),false);assert.equal(shouldSendInput({side:0,forward:0},{side:0,forward:0},300,2,2),true);assert.equal(shouldSendInput({side:0,forward:1},{side:0,forward:0},50,2,2),true);assert.equal(shouldSendInput({side:0,forward:0},{side:0,forward:0},50,3,2),true);
 assert.equal(freshEffect({type:'step',at:10},12),false);assert.equal(freshEffect({type:'lose',at:10},12),true);
});
test('shared chant duration varies; doll turns before detection and gets a grace window',()=>{
 const sun={};resetSun(sun);assert.equal(sunPose(sun).turn,0);advanceSun(sun,3.3,()=>0);assert.ok(sunPose(sun).turn>.4);assert.equal(sunPose(sun).scanning,false);advanceSun(sun,.31,()=>0);assert.ok(sun.red);assert.equal(sun.grace,SUN_GRACE);assert.equal(sunPose(sun).scanning,false);advanceSun(sun,.3);assert.equal(sunPose(sun).scanning,true);advanceSun(sun,2,()=>0);assert.equal(sun.phaseDuration,2.5);advanceSun(sun,3,()=>1);advanceSun(sun,4,()=>1);assert.equal(sun.phaseDuration,4.6);assert.equal(sun.cycle,2);
});
test('red light detects actual movement, not pushing into a barrier; a jump is still movement',()=>{
 const game=new Game();game.reset();game.red=true;game.phase=10;game.position.x=8;game.update(.05,{side:1});assert.equal(game.status,'playing');game.jump();game.update(.01);assert.equal(game.status,'lost');assert.equal(game.death.cause,'shot');
});
test('one host elimination has one immutable death record and one effect on the wire',()=>{
 const match=new Match('host','Alice');match.add('guest','Bob');match.start();match.red=true;match.phase=10;match.grace=0;
 match.input('guest',{forward:1,side:0},1);step(match,.04);
 const first=JSON.parse(JSON.stringify(match.snapshot())),death=first.players.find(p=>p.id==='guest').game.death;
 assert.ok(death);assert.equal(first.players.find(p=>p.id==='guest').eliminated,true);assert.equal(first.effects.filter(e=>e.type==='lose').length,1);
 const id=first.effects.find(e=>e.type==='lose').id;step(match,.5);const later=match.snapshot();assert.deepEqual(later.players.find(p=>p.id==='guest').game.death,death);assert.equal(later.effects.find(e=>e.type==='lose').id,id);
 const guest=new Game();assert.ok(applySnapshot(guest,first.players.find(p=>p.id==='guest').game));assert.deepEqual(guest.death,death);assert.equal(match.command('guest','jump'),false);
});
test('simultaneous eliminations have distinct IDs and corpses survive a missed effect packet',()=>{
 const match=new Match('host','A');match.add('b','B');match.add('c','C');match.add('d','D');match.start();match.red=true;match.phase=10;
 for(const [i,p]of[...match.players.values()].entries())match.input(p.id,{side:1,forward:0},i+1);step(match,.02);
 const state=match.snapshot();assert.equal(match.status,'finished');assert.equal(state.effects.filter(e=>e.type==='lose').length,4);assert.equal(new Set(state.effects.map(e=>e.id)).size,state.effects.length);for(const p of state.players)assert.ok(p.game.death);
 match.start();assert.ok(match.snapshot().players.every(p=>!p.game.death&&!p.eliminated));assert.equal(match.effects.length,0);
});
test('footstep journal is bounded and belongs to the correct stage and participant',()=>{
 const match=new Match('host','A');match.add('guest','B');match.start();match.phase=200;for(let i=0;i<200;i++){match.input('guest',{forward:0,side:i%2?1:-1},i);match.update(.1);}
 const state=match.snapshot();assert.ok(state.effects.length<=32);assert.ok(state.effects.some(e=>e.type==='step'));assert.ok(state.effects.every(e=>e.stage===0&&e.epoch===match.epoch&&e.playerId==='guest'));assert.equal(state.sun.phase,match.phase);
});
test('articulated falls are deterministic, settle permanently and stay close to the ground',()=>{
 assert.deepEqual(deathPose(456,.6),deathPose(456,.6));assert.notDeepEqual(deathPose(456,.6),deathPose(700,.6));assert.ok(deathPose(456,2).settled);assert.ok(deathPose(456,2).tilt>1.5);assert.ok(deathPose(456,4).y<.15);assert.deepEqual(deathPose(456,10),deathPose(456,20));
 assert.ok(deathHeight(1.5,.1,.12)>1);assert.equal(deathHeight(1.5,2,.12),.12);
});
test('all declared audio is bundled Ogg, including voice, shot and original music',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../src/audio-manifest.json',import.meta.url),'utf8'));const files=await readdir(new URL('../public/audio/',import.meta.url));assert.equal(Object.keys(catalog).length,28);
 for(const [name,clip]of Object.entries(catalog)){assert.ok(files.includes(clip.file),name);const data=await readFile(new URL('../public/audio/'+clip.file,import.meta.url));assert.equal(data.subarray(0,4).toString(),'OggS',name);assert.ok(clip.duration>0&&clip.duration<=20);}
 assert.equal(catalog['doll-chant'].category,'voices');assert.ok(catalog['doll-chant'].duration>3);assert.equal(catalog['courtyard-score'].category,'music');assert.equal(catalog.shot.category,'effects');
});
