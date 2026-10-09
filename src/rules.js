export const STAGES = [
  {name:'1, 2, 3 soleil',subtitle:'La cour des silences',time:70,kind:'run',instruction:'Avance au feu vert. Au feu rouge, immobilise-toi, même pendant un saut. Contourne les barrières pour atteindre la ligne.',controls:'ZQSD / WASD ou flèches · Espace : sauter'},
  {name:'Le Dalgona',subtitle:'Une main parfaitement calme',time:65,kind:'trace',instruction:'Maintiens le doigt ou le clic et suis le contour de l’étoile depuis le point lumineux. Tu peux relâcher pour reprendre. Trois écarts brisent le biscuit.',controls:'Souris ou doigt : tracer lentement le contour'},
  {name:'Le tir à la corde',subtitle:'Trouve le rythme',time:35,kind:'tug',instruction:'Appuie quand le curseur entre dans la zone verte. Chaque traction précise rapproche ton équipe de la victoire.',controls:'Espace ou bouton TIRER · Vise la zone verte'},
  {name:'Les billes',subtitle:'Précision sous pression',time:70,kind:'marbles',instruction:'Vise le cercle et dose la puissance en maintenant le bouton, puis relâche pour lancer. Réussis trois lancers avant cinq erreurs.',controls:'← / → ou curseur : viser · Maintenir Espace / LANCER : doser'},
  {name:'Le pont de verre',subtitle:'Choisis ton chemin',time:75,kind:'bridge',instruction:'Une dalle par paire est solide. Observe les fissures : le verre fragile est légèrement rosé. Saute entre les rangées et change de côté si nécessaire.',controls:'ZQSD / WASD ou flèches · Espace : sauter'},
  {name:'La dernière course',subtitle:'Un seul objectif : la sortie',time:65,kind:'run',instruction:'Franchis les haies et les fosses, évite les barres rouges en mouvement et rejoins la porte dorée. La victoire est au bout du parcours.',controls:'ZQSD / WASD ou flèches · Espace : sauter'},
];
export const SAFE_GLASS=[0,1,1,0,1,0,0,1];
export const OBSTACLES=[{x:-4,z:-10,w:6,d:1.2,h:.95},{x:5,z:-22,w:7,d:1.2,h:1.15},{x:-3,z:-35,w:6,d:1.2,h:.9}];
export const HURDLES=[{x:0,z:-7,w:16,d:.65,h:.85},{x:0,z:-22,w:16,d:.65,h:.95},{x:0,z:-39,w:16,d:.65,h:.9}];
export const PITS=[[-17,-14],[-35,-32]];
export const BEAMS=[{z:-25,speed:1.5,phase:0},{z:-43,speed:1.9,phase:2}];
export const CANDY_POINTS=Array.from({length:11},(_,i)=>{const a=-Math.PI/2+(i%10)*Math.PI/5,r=i%2?55:112;return {x:150+Math.cos(a)*r,y:150+Math.sin(a)*r};});
export const TRACE_PATH=[];
for(let i=0;i<CANDY_POINTS.length-1;i++){const a=CANDY_POINTS[i],b=CANDY_POINTS[i+1],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);for(let j=0;j<n;j++)TRACE_PATH.push({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n});}TRACE_PATH.push(CANDY_POINTS.at(-1));
export function supportsBridge(x,z,broken=new Set()){
 if(z>=-1&&Math.abs(x)<5 || z<=-40.5&&Math.abs(x)<5)return true;
 for(let row=0;row<8;row++){if(Math.abs(z-(-3-row*5))<1.9){for(let side=0;side<2;side++)if(Math.abs(x-(side?1.65:-1.65))<1.35&&!broken.has(`${row}:${side}`))return true;}}
 return false;
}
export function glassAt(x,z){for(let row=0;row<8;row++)if(Math.abs(z-(-3-row*5))<1.9)for(let side=0;side<2;side++)if(Math.abs(x-(side?1.65:-1.65))<1.35)return {row,side};return null;}
export function marbleLanding(aim,power){const distance=4+power*14;return {x:Math.sin(aim*.36)*distance,z:5-Math.cos(aim*.36)*distance};}
export class Game {
 constructor(){this.stage=0;this.status='intro';this.position={x:0,y:0,z:6};this.elapsed=0;this.events=[];this.reset(0,false);}
 reset(stage=this.stage,play=true){this.stage=stage;this.status=play?'playing':'intro';this.remaining=STAGES[stage].time;this.position={x:stage===4?-1.65:0,y:0,z:6};this.vy=0;this.grounded=true;this.elapsed=0;this.red=false;this.phase=3.6;this.grace=0;this.transition=0;this.message='';this.trace=0;this.strikes=0;this.pull=.5;this.lastPull=-1;this.broken=new Set();this.aim=0;this.power=0;this.charging=false;this.shot=null;this.hits=0;this.misses=0;this.targetX=-1.4;this.events.push({type:'stage',stage});}
 emit(type,extra={}){this.events.push({type,...extra});}
 lose(message){if(this.status!=='playing')return;this.status='lost';this.message=message;this.emit('lose');}
 win(){if(this.status!=='playing')return;this.status=this.stage===5?'won':'transition';this.transition=3.2;this.message=this.stage===5?'Tu as franchi les six épreuves. Tu es le dernier survivant.':'Épreuve réussie. La prochaine commence dans quelques secondes.';this.emit('win');}
 jump(){if(this.status==='playing'&&[0,4,5].includes(this.stage)&&this.grounded){this.vy=9;this.grounded=false;this.emit('jump');}}
 tracePoint(x,y){if(this.status!=='playing'||this.stage!==1)return;let best=-1,dist=Infinity;for(let i=this.trace;i<Math.min(TRACE_PATH.length,this.trace+15);i++){const p=TRACE_PATH[i],d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=i;}}if(dist<18){this.trace=Math.max(this.trace,best);if(this.trace>=TRACE_PATH.length-3)this.win();return true;}return false;}
 crack(){if(this.status!=='playing'||this.stage!==1)return;this.strikes++;this.emit('crack');if(this.strikes>=3)this.lose('Le biscuit s’est brisé. Reprends le tracé lentement, en suivant la ligne dorée.');}
 tug(){if(this.status!=='playing'||this.stage!==2||this.elapsed-this.lastPull<.2)return;this.lastPull=this.elapsed;const cycle=this.elapsed%.85/.85,good=Math.abs(cycle-.5)<.19;this.pull=Math.min(1,this.pull+(good?.082:-.026));this.emit(good?'pull':'miss');if(this.pull>=1)this.win();}
 charge(){if(this.status==='playing'&&this.stage===3&&!this.shot){this.charging=true;this.power=0;}}
 release(){if(!this.charging||this.status!=='playing')return;this.charging=false;const end=marbleLanding(this.aim,this.power);this.shot={end,age:0,start:{x:0,z:5},hit:Math.hypot(end.x-this.targetX,end.z+10)<1.1};this.emit('throw');}
 update(dt,input={}){
 if(this.status==='transition'){this.transition-=dt;if(this.transition<=0)this.reset(this.stage+1);return;}
 if(this.status!=='playing')return;
 this.elapsed+=dt;this.remaining-=dt;if(this.remaining<=0){this.remaining=0;this.lose('Le temps est écoulé. Réessaie cette épreuve.');return;}
 if(this.stage===2){this.pull-=dt*.024;if(this.pull<=0)this.lose('L’équipe adverse a pris le dessus. Tire lorsque le curseur atteint la zone verte.');return;}
 if(this.stage===3){this.aim=Math.max(-1,Math.min(1,this.aim+(input.side||0)*dt*.85));if(this.charging)this.power=(this.power+dt*.58)%1;if(this.shot){this.shot.age+=dt;if(this.shot.age>=1.15){if(this.shot.hit){this.hits++;this.emit('score');}else{this.misses++;this.emit('miss');}this.shot=null;this.targetX=[-1.4,1.1,0,1.7,-.9,.6][(this.hits+this.misses)%6];if(this.hits>=3)this.win();else if(this.misses>=5)this.lose('Cinq billes ont manqué le cercle. Ajuste la direction et la puissance.');}}return;}
 if(this.stage===1)return;
 if(this.stage===0){this.phase-=dt;this.grace=Math.max(0,this.grace-dt);if(this.phase<=0){this.red=!this.red;this.phase=this.red?1.9+Math.random()*1.3:2.6+Math.random()*1.4;this.grace=this.red?.28:0;this.emit('signal',{red:this.red});}if(this.red&&this.grace<=0&&(input.forward||input.side||Math.abs(this.vy)>.1)){this.lose('La poupée t’a vu bouger. Au feu rouge, arrête-toi et évite d’être en plein saut.');return;}}
 const speed=this.stage===4?5.8:7;const forward=input.forward||0,side=input.side||0;const norm=Math.max(1,Math.hypot(forward,side));const nx=Math.max(this.stage===4?-4:-8,Math.min(this.stage===4?4:8,this.position.x+side*speed*dt/norm));const nz=Math.min(8,this.position.z-forward*speed*dt/norm);
 const obstacles=this.stage===0?OBSTACLES:this.stage===5?HURDLES:[];
 const blocked=(x,z)=>obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.3&&Math.abs(z-o.z)<o.d/2+.25&&this.position.y<o.h);
 if(!blocked(nx,this.position.z))this.position.x=nx;if(!blocked(this.position.x,nz))this.position.z=nz;
 const oldY=this.position.y;
 let supported=true;
 if(this.stage===4)supported=supportsBridge(this.position.x,this.position.z,this.broken);
 if(this.stage===5)supported=!PITS.some(([a,b])=>this.position.z>a&&this.position.z<b);
 const surface=obstacles.filter(o=>Math.abs(this.position.x-o.x)<o.w/2+.2&&Math.abs(this.position.z-o.z)<o.d/2+.2&&oldY>=o.h-.03).reduce((h,o)=>Math.max(h,o.h),0);
 if(!this.grounded||!supported||this.position.y>surface+.03){this.grounded=false;this.vy-=22*dt;this.position.y+=this.vy*dt;if(this.position.y<=surface&&this.vy<=0&&supported&&oldY>=surface-.2){this.position.y=surface;this.vy=0;this.grounded=true;this.emit('land');}}
 if(this.stage===4&&this.grounded){const tile=glassAt(this.position.x,this.position.z);if(tile&&SAFE_GLASS[tile.row]!==tile.side){this.broken.add(`${tile.row}:${tile.side}`);this.grounded=false;this.vy=-1;this.emit('glass');}}
 if(this.position.y<-4){this.lose(this.stage===4?'La dalle a cédé ou tu as manqué ton saut. Observe les fissures avant de choisir.':'Tu es tombé dans une fosse. Saute juste avant le bord.');return;}
 if(this.stage===5&&this.position.y<1.35){for(const b of BEAMS)if(Math.abs(this.position.z-b.z)<.5&&Math.abs(this.position.x-Math.sin(this.elapsed*b.speed+b.phase)*6)<2){this.lose('Une barre mobile t’a touché. Saute au-dessus ou passe sur le côté.');return;}}
 if(this.position.z<=(this.stage===4?-43:-48)&&this.grounded)this.win();
 }
}
