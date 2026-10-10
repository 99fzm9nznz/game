import * as THREE from 'three';
import {deathPose,deathHeight,seededRandom} from './death-motion.js';
export class CourtyardEffects {
 constructor(world){this.world=world;this.bodies=new Map();this.particles=[];this.panic=0;this.shake=0;}
 start(id,actor,death,age=0,quality='high'){
  if(!death||this.bodies.has(id))return;
  actor.death=death;if(actor.tag)actor.tag.visible=false;
  this.bodies.set(id,{actor,death,age:Math.max(0,age)});this.panic=1;this.shake=.35;this.lastImpact=death.position;
  const random=seededRandom(death.seed),count=quality==='low'?16:42,positions=new Float32Array(count*3),velocity=[];
  for(let i=0;i<count;i++){positions.set([death.position.x,death.position.y+1.25,death.position.z],i*3);velocity.push(new THREE.Vector3((random()-.5)*2.5,.3+random()*2.3,1+random()*2.4));}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:0x9b2130,size:.07,transparent:true,opacity:.9,depthWrite:false}));this.world.add(points);this.particles.push({points,velocity,age:0});
  const stain=new THREE.Mesh(new THREE.CircleGeometry(.24,18),new THREE.MeshBasicMaterial({color:0x712631,transparent:true,opacity:.38,depthWrite:false}));stain.rotation.x=-Math.PI/2;stain.scale.set(1,.7,1);stain.position.set(death.position.x,.017,death.position.z+.65);this.world.add(stain);
 }
 update(dt,clock){
  this.panic=Math.max(0,this.panic-dt*.23);this.shake=Math.max(0,this.shake-dt*1.2);
  for(const entry of this.bodies.values()){
   entry.age=Math.max(entry.age+dt,clock-entry.death.at);const {actor,death,age}=entry,pose=deathPose(death.seed,age);
   actor.rig.position.set(death.position.x+pose.x,deathHeight(death.position.y,age,pose.y),death.position.z+pose.z);actor.rig.rotation.set(pose.tilt,pose.yaw,0);actor.body.position.y=0;actor.head.rotation.set(0,0,.08);actor.arms.forEach((arm,i)=>{arm.rotation.x=-.35;arm.rotation.z=(i?1:-1)*pose.arms;actor.elbows[i].rotation.x=-.24;});actor.legs.forEach((leg,i)=>{leg.rotation.x=-.10;leg.rotation.z=(i?1:-1)*.12;actor.knees[i].rotation.x=pose.knees;});
  }
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.age+=dt;const positions=p.points.geometry.attributes.position;for(let j=0;j<p.velocity.length;j++){const v=p.velocity[j];v.y-=9.8*dt;positions.setXYZ(j,positions.getX(j)+v.x*dt,Math.max(.035,positions.getY(j)+v.y*dt),positions.getZ(j)+v.z*dt);}positions.needsUpdate=true;p.points.material.opacity=Math.max(0,1-p.age/1.25);if(p.age>1.25){this.world.remove(p.points);p.points.geometry.dispose();p.points.material.dispose();this.particles.splice(i,1);}}
 }
}
