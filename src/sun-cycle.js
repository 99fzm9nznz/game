// The host owns this clock. Voice duration, doll animation and detection use it.
export const SUN_GRACE = .28;
export const FIRST_CHANT = 3.6;
export function resetSun(state) {
  Object.assign(state, {red:false, phase:FIRST_CHANT, phaseDuration:FIRST_CHANT, cycle:0, grace:0});
}
export function advanceSun(state, dt, random=Math.random) {
  state.phase -= dt;
  state.grace = Math.max(0, state.grace-dt);
  if (state.phase > 0) return false;
  state.red = !state.red;
  state.phaseDuration = state.red ? 1.9+random()*1.3 : 2.5+random()*2.1;
  state.phase = state.phaseDuration;
  state.grace = state.red ? SUN_GRACE : 0;
  if (!state.red) state.cycle++;
  return true;
}
export function sunPose(sun) {
  const progress=Math.max(0,Math.min(1,1-sun.phase/sun.phaseDuration));
  // Face the tree while chanting; turn towards players during the final word.
  const turn=sun.red?1:Math.max(0,(progress-.83)/.17);
  return {progress, turn, warning:!sun.red&&sun.phase<.6, scanning:sun.red&&sun.grace<=0};
}
