// Used only by the authoritative simulation. Never send the layout or its seed.
export function secureRandom(){return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;}
export function createBridgeLayout(random=secureRandom){return Object.freeze(Array.from({length:8},()=>random()<.5?0:1));}

// Public impact data drives identical, inexpensive ballistic effects on all devices.
export function fallPose(fall,age){
 const t=Math.max(0,age),v=fall.velocity;
 return {x:fall.position.x+v.x*t,y:fall.position.y+v.y*t-11*t*t,z:fall.position.z+v.z*t,tilt:Math.min(.85,t*.9),roll:Math.sin(t*3)*.25,arms:1.2+Math.sin(t*11)*.22,knees:.4+Math.sin(t*7)*.15};
}
