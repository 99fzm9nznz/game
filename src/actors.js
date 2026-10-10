import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
function add(parent,geometry,material,x=0,y=0,z=0){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
const box=(p,m,w,h,d,x=0,y=0,z=0)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const ball=(p,m,r,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const o=add(p,new THREE.SphereGeometry(r,14,10),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
const tube=(p,m,r,l,x=0,y=0,z=0)=>add(p,new THREE.CapsuleGeometry(r,l,4,10),m,x,y,z);
function patch(parent,text,y,z,width=.24){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#143d35';ctx.fillRect(0,0,128,64);ctx.fillStyle='#eef5ec';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillText(text,64,47);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const o=add(parent,new THREE.PlaneGeometry(width,width/2),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),0,y,z);return o;}
// Merge static pieces within each joint, retaining the articulated hierarchy.
export function batch(rig){const groups=[];rig.traverse(o=>{if(o.isGroup)groups.push(o);});for(const group of groups){const bins=new Map();for(const o of [...group.children])if(o.isMesh&&!o.material.map&&!o.userData.dynamic){const key=o.material.uuid;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(o);}for(const list of bins.values()){if(list.length<2)continue;const geometries=list.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);});const merged=mergeGeometries(geometries);if(!merged){geometries.forEach(g=>g.dispose());continue;}const mesh=new THREE.Mesh(merged,list[0].material);mesh.castShadow=mesh.receiveShadow=true;for(const o of list){group.remove(o);o.geometry.dispose();}geometries.forEach(g=>g.dispose());group.add(mesh);}}}
export function createHuman(parent,{color=0x176b60,number='456',skin=0xd5a17f,guard=false,detail='full',variant=0}={}){
 const rig=new THREE.Group(),body=new THREE.Group();rig.add(body);parent.add(rig);
 const cloth=mat(color),flesh=mat(skin,{roughness:.65}),white=mat(0xdcded4),dark=mat(0x15171d),hair=mat([0x201b19,0x39302b,0x191a20][variant%3]),metal=mat(0x2a2d32,{metalness:.5,roughness:.38});
 const torso=tube(body,cloth,.24,.42,0,1.12);torso.scale.set(1.24,1,.78);const hips=tube(body,cloth,.2,.07,0,.79);hips.scale.x=1.27;
 box(body,white,.025,.56,.025,0,1.19,-.196);for(const x of [-.16,.16])box(body,dark,.11,.018,.018,x,.94,-.179);
 tube(body,flesh,.074,.1,0,1.56);
 const head=new THREE.Group();head.position.y=1.75;body.add(head);
 const eyes=[],brows=[];
 if(guard){
  ball(head,cloth,.24,0,0,.018,.96,1.14,.93);ball(head,dark,.217,0,-.015,-.045,.91,1.13,.9);
  const symbol=patch(head,['○','△','□'][variant%3],.01,-.248,.25);symbol.material.map.dispose();const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#161820';ctx.fillRect(0,0,64,64);ctx.strokeStyle='#eee7e2';ctx.lineWidth=3;if(variant%3===0){ctx.beginPath();ctx.arc(32,32,17,0,Math.PI*2);ctx.stroke();}else if(variant%3===1){ctx.beginPath();ctx.moveTo(32,14);ctx.lineTo(51,48);ctx.lineTo(13,48);ctx.closePath();ctx.stroke();}else ctx.strokeRect(15,15,34,34);symbol.material.map=new THREE.CanvasTexture(c);
  box(body,dark,.04,.68,.045,0,1.17,-.222);box(body,dark,.46,.055,.4,0,.85,0);
 }else{
  ball(head,flesh,.21,0,0,0,.87,1.18,.9);ball(head,hair,.214,0,.095,.025,.89,.88,.84);
  if(detail==='full'){
   for(const side of [-1,1]){ball(head,flesh,.06,side*.181,-.025,0,.4,1,.65);const eye=ball(head,white,.025,side*.072,.025,-.18,1,.5,.42);const iris=ball(head,dark,.0105,side*.072,.025,-.195,.75,1,.4);eyes.push(iris);const brow=box(head,hair,.062,.012,.012,side*.072,.064,-.186);brow.userData.dynamic=true;brows.push(brow);ball(head,flesh,.032,0,-.025,-.191,.75,.75,1);}
   box(head,mat(0x895b53),.067,.012,.014,0,-.094,-.18);
  }
 }
 const legs=[],knees=[],arms=[],elbows=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.14,.79,0);body.add(leg);tube(leg,cloth,.104,.18,0,-.16);box(leg,white,.025,.28,.014,side*.087,-.15,-.076);
  const knee=new THREE.Group();knee.position.y=-.33;leg.add(knee);tube(knee,cloth,.09,.20,0,-.17);box(knee,white,.025,.29,.014,side*.074,-.16,-.07);box(knee,guard?dark:white,.195,.12,.33,0,-.40,-.06);legs.push(leg);knees.push(knee);
  const arm=new THREE.Group();arm.position.set(side*.315,1.4,0);body.add(arm);tube(arm,cloth,.081,.16,0,-.16);box(arm,white,.022,.27,.015,side*.063,-.16,-.067);
  const elbow=new THREE.Group();elbow.position.y=-.32;arm.add(elbow);tube(elbow,cloth,.07,.15,0,-.13);ball(elbow,guard?dark:flesh,.072,0,-.32,0,.83,1.15,.85);arms.push(arm);elbows.push(elbow);
 }
 const numberSigns=guard?[]:[patch(body,number,1.29,-.208,.20),patch(body,number,1.21,.193,.3)];
 if(guard){const gun=new THREE.Group();rig.add(gun);gun.position.set(.12,1.09,-.37);gun.rotation.x=-.14;box(gun,metal,.12,.14,.68);box(gun,dark,.08,.16,.17,0,-.10,.02);tube(gun,metal,.025,.18,0,0,-.42).rotation.x=Math.PI/2;const flash=ball(gun,mat(0xffd78d,{emissive:0xffb733,emissiveIntensity:4}),.095,0,0,-.6,.8,.8,1.7);flash.visible=false;rig.userData.flash=flash;}
 batch(rig);
 const actor={rig,body,head,legs,knees,arms,elbows,eyes,brows,numberSigns,uniformColor:color,number,cloth,death:null,
  setIdentity(nextColor,nextNumber){cloth.color.setHex(nextColor);this.uniformColor=nextColor;if(this.number!==nextNumber){for(const p of numberSigns){const replacement=patch(new THREE.Group(),nextNumber,0,0);p.material.map.dispose();p.material.map=replacement.material.map;replacement.geometry.dispose();}this.number=nextNumber;}},
  animate(time,movement=0,panic=0){if(this.death)return;const stride=time*10.5;legs.forEach((l,i)=>{const angle=Math.sin(stride+i*Math.PI);l.rotation.x=angle*.62*movement;knees[i].rotation.x=Math.max(0,-angle)*.8*movement;});arms.forEach((a,i)=>{a.rotation.x=-Math.sin(stride+i*Math.PI)*.5*movement-panic*.24;elbows[i].rotation.x=-.18-movement*.2-panic*.4;});body.position.y=Math.sin(stride*2)*.019*movement+Math.sin(time*2)*.004;head.rotation.y=Math.sin(time*.8+variant)*(.03+panic*.19);brows.forEach((b,i)=>b.rotation.z=(i?1:-1)*panic*.15);},
 };
 return actor;
}

export function createDoll(parent){
 const rig=new THREE.Group();parent.add(rig);rig.position.set(0,.18,-53);rig.scale.setScalar(3.55);
 const skin=mat(0xefd0ac,{roughness:.47}),hair=mat(0x251b15,{roughness:.44}),yellow=mat(0xe9b735),orange=mat(0xdb6826),white=mat(0xdcd7c5),black=mat(0x211c19),metal=mat(0x79796b,{metalness:.55,roughness:.3});
 for(const x of [-.16,.16]){tube(rig,skin,.12,.38,x,.43);tube(rig,white,.12,.19,x,.27);box(rig,black,.25,.13,.40,x,.065,-.08);box(rig,orange,.23,.08,.37,x,.14,-.08);}
 add(rig,new THREE.CylinderGeometry(.31,.54,.72,32),orange,0,.94);tube(rig,yellow,.23,.29,0,1.36);box(rig,white,.22,.035,.19,0,1.52,-.12);box(rig,orange,.35,.31,.055,0,1.31,-.225);for(const side of [-1,1]){box(rig,orange,.06,.24,.035,side*.145,1.48,-.20);ball(rig,white,.022,side*.145,1.43,-.225);}
 for(let i=0;i<16;i++){const a=i*Math.PI/8,pleat=box(rig,mat(0xbb5626),.016,.54,.021,Math.sin(a)*.435,.90,Math.cos(a)*.435);pleat.rotation.y=a;pleat.rotation.x=Math.cos(a)*.23;pleat.rotation.z=-Math.sin(a)*.23;}
 for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.34,1.48,0);rig.add(arm);tube(arm,yellow,.10,.14,0,-.12);tube(arm,skin,.088,.25,0,-.41);ball(arm,skin,.092,0,-.64,0,.8,1.2,.8);ball(arm,metal,.043,side*.071,-.25,0);arm.rotation.z=side*.06;}
 add(rig,new THREE.CylinderGeometry(.088,.088,.21,20),metal,0,1.66);
 const head=new THREE.Group();head.position.y=1.82;rig.add(head);
 ball(head,skin,.28,0,0,0,.96,1.16,.87);ball(head,hair,.282,0,.115,.026,1,.81,.83);
 for(const side of [-1,1]){ball(head,skin,.068,side*.257,-.035,0,.4,1,.7);const braid=new THREE.Group();braid.position.set(side*.25,.10,.035);head.add(braid);for(let i=0;i<4;i++)ball(braid,hair,.067,side*i*.02,-i*.078,0,1,.92,.85);ball(braid,orange,.046,side*.08,-.31,0);box(head,hair,.104,.017,.018,side*.101,.102,-.234);}
 const eyes=[];for(const side of [-1,1]){ball(head,white,.052,side*.098,.026,-.239,1,.64,.31);const eye=new THREE.Group();eye.position.set(side*.098,.026,-.257);head.add(eye);ball(eye,mat(0x513b20),.027,0,0,0,.75,.94,.2);ball(eye,black,.014,0,0,-.006,1,1,.2);ball(eye,white,.006,-.005,.007,-.010);eyes.push(eye);}
 ball(head,skin,.040,0,-.03,-.254,.74,1,.9);const mouth=ball(head,mat(0x985747),.041,0,-.12,-.229,1,.19,.28);box(head,white,.061,.012,.012,0,-.116,-.243);batch(rig);
 return {rig,head,eyes,mouth,update(sun,dt,time,focusX=0){const progress=1-sun.phase/sun.phaseDuration,turn=sun.red?1:THREE.MathUtils.smoothstep(progress,.83,1);head.rotation.y=THREE.MathUtils.damp(head.rotation.y,turn*Math.PI,12,dt);const scan=sun.red?Math.sin(time*2.1)*.018+THREE.MathUtils.clamp(focusX*.003,-.025,.025):0;eyes.forEach(e=>e.position.x= Math.sign(e.position.x)*.098+scan);eyes.forEach(e=>e.position.y=.026+Math.sin(time*1.7)*.005);mouth.scale.y=sun.red?.3:.8+Math.sin(progress*Math.PI*16)**2*2.1;head.rotation.z=Math.sin(time*1.1)*.013;}};
}

export function batchCourtyard(world){
 const materials=new Map();for(const o of world.children)if(o.isMesh&&!o.isInstancedMesh&&!o.material.map){const m=o.material,key=[m.type,m.color?.getHex(),m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.opacity,m.transparent,m.side].join(':');if(materials.has(key)){o.material.dispose();o.material=materials.get(key);}else materials.set(key,m);}
 batch(world);
}
