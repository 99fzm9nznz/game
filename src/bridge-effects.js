import * as THREE from 'three';
import {seededRandom} from './death-motion.js';
import {fallPose} from './bridge.js';

// One shared geometry and material for every intact pane: resistance is never read here.
export function createGlassPanels(world){
 const geometry=new THREE.BoxGeometry(2.7,.16,3.8);
 const material=new THREE.MeshStandardMaterial({color:0x9dcbd4,transparent:true,opacity:.5,metalness:.3,roughness:.15,side:THREE.DoubleSide});
 return Array.from({length:16},(_,i)=>{
  const row=Math.floor(i/2),side=i%2,tile=new THREE.Mesh(geometry,material);
  tile.position.set(side?1.65:-1.65,-.08,-3-row*5);tile.castShadow=tile.receiveShadow=true;world.add(tile);
  return {tile,key:`${row}:${side}`};
 });
}

export class BridgeEffects {
 constructor(world){this.world=world;this.seen=new Set();this.bursts=[];this.falls=new Map();}
 break(impact,age,quality){
  if(this.seen.has(impact.key))return;this.seen.add(impact.key);
  if(age>2.6)return; // Persistent holes survive even after the transient shards expire.
  const random=seededRandom(impact.seed),columns=quality==='low'?4:6,rows=quality==='low'?6:8;
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(1,0);shape.lineTo(0,1);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false});geometry.rotateX(Math.PI/2);
  const material=new THREE.MeshStandardMaterial({color:0xa6d4de,metalness:.35,roughness:.12,transparent:true,opacity:.8,side:THREE.DoubleSide});
  const shards=new THREE.InstancedMesh(geometry,material,columns*rows*2),pieces=[];
  shards.frustumCulled=false;shards.position.copy(new THREE.Vector3(impact.position.x,0,impact.position.z));
  const w=2.7/columns,d=3.8/rows;
  for(let z=0;z<rows;z++)for(let x=0;x<columns;x++)for(let half=0;half<2;half++){
   const px=-1.35+x*w+(half?w:0),pz=-1.9+z*d+(half?d:0);
   pieces.push({x:px,z:pz,half,w,d,vx:px*.8+(random()-.5)*1.8,vz:pz*.8+(random()-.5)*1.8,vy:.5+random()*1.6,spin:(random()-.5)*6,phase:random()*Math.PI});
  }
  // Fracture rays exist only AFTER contact, on a short-lived impact overlay.
  const points=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;points.push(new THREE.Vector3(0,.018,0),new THREE.Vector3(Math.cos(a)*1.3,.018,Math.sin(a)*1.85));}
  const cracks=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xe4f5ff,transparent:true,opacity:1}));cracks.position.copy(shards.position);
  this.world.add(shards,cracks);this.bursts.push({shards,cracks,pieces,impact,age:Math.max(0,age)});
 }
 update(dt,clock,breaks=[]){
  for(const impact of breaks)this.break(impact,Math.max(0,clock-impact.at),this.quality||'high');
  const dummy=new THREE.Object3D();
  for(let i=this.bursts.length-1;i>=0;i--){const b=this.bursts[i];b.age=Math.max(b.age+dt,clock-b.impact.at);const t=b.age;
   b.cracks.visible=t<.12;b.cracks.material.opacity=Math.max(0,1-t/.12);
   b.pieces.forEach((p,index)=>{dummy.position.set(p.x+p.vx*t,p.vy*t-7*t*t,p.z+p.vz*t);dummy.rotation.set(p.spin*t,(p.half?Math.PI:0)+p.spin*t*.5,Math.sin(t*4+p.phase)*t);dummy.scale.set(p.w,1,p.d);dummy.updateMatrix();b.shards.setMatrixAt(index,dummy.matrix);});
   b.shards.instanceMatrix.needsUpdate=true;b.shards.material.opacity=Math.min(.8,Math.max(0,(2.6-t)*.8));
   if(t>=2.6){this.world.remove(b.shards,b.cracks);b.shards.geometry.dispose();b.shards.material.dispose();b.shards.dispose();b.cracks.geometry.dispose();b.cracks.material.dispose();this.bursts.splice(i,1);}
  }
 }
 animateFall(id,actor,game,dt,clock){
  if(!game.fall)return false;
  let entry=this.falls.get(id);if(!entry){entry={fall:game.fall,age:Math.max(0,clock-game.fall.at)};this.falls.set(id,entry);}
  entry.age=Math.max(entry.age+dt,clock-entry.fall.at);const pose=fallPose(entry.fall,entry.age);
  actor.rig.visible=entry.age<2.6;
  if(game.status==='lost')actor.rig.position.set(pose.x,pose.y,pose.z);
  actor.rig.rotation.set(pose.tilt,0,pose.roll);actor.body.position.y=0;
  actor.arms.forEach((arm,i)=>{arm.rotation.x=-.4;arm.rotation.z=(i?1:-1)*pose.arms;actor.elbows[i].rotation.x=-.6;});
  actor.legs.forEach((leg,i)=>{leg.rotation.x=(i?1:-1)*.3;actor.knees[i].rotation.x=pose.knees;});
  if(actor.tag)actor.tag.visible=false;
  return true;
 }
}
