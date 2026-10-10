// A deterministic articulated fall, rather than an expensive general physics solver.
// Identical seed/age yields identical poses on every peer; corpses settle permanently.
export function deathPose(seed, age) {
 const t=Math.max(0,age),side=((seed%997)/997-.5),fall=Math.min(1,Math.max(0,(t-.09)/.82));
 const ease=1-(1-fall)**2.4,bounce=t>.91?Math.sin((t-.91)*19)*Math.exp(-(t-.91)*8)*.035:0;
 return {x:side*.3*ease,y:.10+.02*ease+Math.max(0,bounce),z:.35*ease,
  tilt:ease*(Math.PI/2-.045),yaw:side*.44*ease,
  arms:.12+ease*.84,knees:.12+ease*.28,settled:t>1.65};
}

export function seededRandom(seed) {let n=seed>>>0;return ()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};}
export function deathHeight(startY,age,settledY){return Math.max(settledY,Math.max(0,startY)+settledY-4.9*age*age);}
