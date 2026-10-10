export const MAX_BUFFERED_BYTES=64*1024;
export function statePacket(state,after=0){return {version:state.version,type:'state',state:{...state,effects:(state.effects||[]).filter(event=>event.id>after)}};}
export function shouldSendInput(input,last,age,epoch,lastEpoch){return !last||epoch!==lastEpoch||input.forward!==last.forward||input.side!==last.side||age>=300;}
export function freshEffect(event,elapsed){return event.type!=='step'||elapsed-event.at<.65;}
