import * as THREE from 'three';
import {createDoll,createHuman,batchCourtyard} from './actors.js';
import {OBSTACLES} from './rules.js';
import {seededRandom} from './death-motion.js';
const m=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.86,...extra});
function mesh(parent,g,material,x=0,y=0,z=0){const o=new THREE.Mesh(g,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
const box=(p,w,h,d,mat,x,y,z)=>mesh(p,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
function branch(parent,a,b,r1,r2,mat){const delta=new THREE.Vector3().subVectors(b,a),o=mesh(parent,new THREE.CylinderGeometry(r2,r1,delta.length(),9),mat);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
function mural(){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#a5c2c8';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#ced8c6';for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(65+i*130,50+i%3*18,64,19,0,0,7);ctx.fill();}ctx.fillStyle='#749480';ctx.beginPath();ctx.moveTo(0,210);for(let x=0;x<=1024;x+=32)ctx.lineTo(x,155+Math.sin(x/160)*30+Math.sin(x/35)*10);ctx.lineTo(1024,256);ctx.lineTo(0,256);ctx.fill();ctx.fillStyle='#94ab80';for(let i=0;i<13;i++){ctx.beginPath();ctx.ellipse(i*88,255,110,60+i%3*8,0,0,7);ctx.fill();}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
export function buildCourtyard(view){
 const world=view.world;view.floor();view.exit();
 const plaster=m(0xe0cfb2),wood=m(0x785843),pale=m(0xddc39a),metal=m(0x39404a,{metalness:.6}),red=m(0xff6377,{emissive:0xc3243d,emissiveIntensity:.3});
 // Overpaint the industrial walls with a weathered pastoral false horizon.
 const art=new THREE.MeshStandardMaterial({map:mural(),roughness:.95});for(const side of [-1,1]){const panel=mesh(world,new THREE.PlaneGeometry(71,7.1),art,side*10.97,4.7,-24);panel.rotation.y=side<0?Math.PI/2:-Math.PI/2;box(world,.5,1.1,72,plaster,side*10.95,.55,-24);}
 mesh(world,new THREE.PlaneGeometry(22,7.1),art,0,4.7,-57.66);
 for(const o of OBSTACLES){box(world,o.w,o.h,o.d,wood,o.x,o.h/2,o.z);box(world,o.w,.08,o.d+.04,pale,o.x,o.h,o.z);for(let x=o.x-o.w/2+.2;x<o.x+o.w/2;x+=1.2)box(world,.045,o.h-.12,o.d+.05,metal,x,o.h/2,o.z);}
 // Painted lanes and a clearly marked finishing line.
 for(const x of [-6,-3,0,3,6])for(let z=5;z>-48;z-=3)box(world,.036,.008,.9,pale,x,.013,z);
 box(world,20,.012,.19,red,0,.02,-48);box(world,20,.012,.19,pale,0,.02,4.5);
 for(const side of [-1,1])for(let z=5;z>-56;z-=8){box(world,.1,3.8,.1,metal,side*10.4,1.9,z);box(world,.9,.15,.5,metal,side*10.15,3.7,z);box(world,.7,.035,.35,m(0xffdd9e,{emissive:0xffdd9e,emissiveIntensity:.7}),side*10.15,3.60,z);const cam=box(world,.28,.2,.42,metal,side*10.16,3.24,z);cam.rotation.y=side*.9;}
 // Dead tree, branching silhouette, and a mechanically bolted doll pedestal.
 const bark=m(0x645144),tree=new THREE.Group();world.add(tree);tree.position.set(0,0,-55.5);
 branch(tree,new THREE.Vector3(0,0,0),new THREE.Vector3(.3,8.4,0),.5,.22,bark);
 const random=seededRandom(456);for(const side of [-1,1])for(let i=0;i<4;i++){const root=new THREE.Vector3(.1,4.5+i*.9,0),end=new THREE.Vector3(side*(1.8+i*.55),6.6+i*.6,(random()-.5)*2);branch(tree,root,end,.15,.055,bark);branch(tree,end,new THREE.Vector3(end.x+side*.8,end.y+1.1,end.z-.4),.055,.014,bark);}
 mesh(world,new THREE.CylinderGeometry(1.15,1.3,.24,32),metal,0,.04,-53);for(let i=0;i<8;i++){const a=i*Math.PI/4;mesh(world,new THREE.CylinderGeometry(.04,.04,.04,6),pale,Math.cos(a)*1.12,.18,-53+Math.sin(a)*1.12);}
 const doll=createDoll(world);
 const guards=[];for(const [i,x]of[-8,8,-10.1,10.1].entries()){const actor=createHuman(world,{color:0xaf2b59,guard:true,variant:i});actor.rig.position.set(x,0,i<2?-51:-26);actor.rig.rotation.y=Math.PI;actor.arms.forEach(a=>a.rotation.x=-.8);actor.elbows.forEach(e=>e.rotation.x=-.75);guards.push(actor);}
 // One draw call for gravel, one for the sparse dried vegetation.
 for(const [geometry,mat,count,type]of[[new THREE.DodecahedronGeometry(.07),m(0x86765d),130,'stone'],[new THREE.ConeGeometry(.05,.4,4),m(0x8f9166),100,'grass']]){const instances=new THREE.InstancedMesh(geometry,mat,count),dummy=new THREE.Object3D();for(let i=0;i<count;i++){const x=(random()<.5?-1:1)*(8.3+random()*2),z=7-random()*63;dummy.position.set(x,type==='grass'?.17:.045,z);dummy.rotation.y=random()*6.28;dummy.scale.setScalar(.5+random());dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);}instances.receiveShadow=true;world.add(instances);}
 // Decorative extras only in solo; these are never presented as human peers or AI.
 const crowd=[];for(let i=0;i<12;i++){const npc=createHuman(world,{number:String(101+i),skin:[0xd5a17f,0x8d5e43,0xedc2a4][i%3],variant:i,detail:'crowd'});npc.rig.position.set((i%4-1.5)*3,0,8+Math.floor(i/4)*1.8);crowd.push(npc);}
 batchCourtyard(world);return {doll,guards,crowd};
}
