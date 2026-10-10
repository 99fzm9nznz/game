// Codec/bandwidth estimates only. Synthetic rosters do not lift the playable cap.
import {Match} from '../src/match.js';
const host='arena-six-v2-ABCDEFGH',match=new Match(host,'Alice');
for(let i=1;i<4;i++)match.add(`00000000-0000-4000-8000-00000000000${i}`,'Joueur '+i);
match.start();match.phase=100;
for(let tick=0;tick<600;tick++){
 for(const p of match.players.values())match.input(p.id,{forward:0,side:tick%120<60?1:-1},tick);
 match.update(1/120);
}
const state=match.snapshot();
console.log('Synthetic serialized snapshot estimates; 12.5 updates/s, host-star fan-out. No transport/GPU benchmark.');
for(const n of [4,20,50,100]){
 const players=Array.from({length:n},(_,i)=>({...state.players[i%4],id:i?`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`:host,name:'Joueur '+i}));
 // Usual ongoing packet carries only events since the previous send, not the journal.
 const bytes=Buffer.byteLength(JSON.stringify({version:state.version,type:'state',state:{...state,players,effects:state.effects.slice(-1)}}));
 const mbps=bytes*12.5*(n-1)*8/1e6;
 console.log(JSON.stringify({players:n,snapshotBytes:bytes,hostUploadMbps:Number(mbps.toFixed(2))}));
}
