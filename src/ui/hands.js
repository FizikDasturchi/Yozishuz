/* ============================================================
   hands.js — klaviatura üstidagi haqiqiydek qöllar (typing.com kabi).
   • Har bir barmoq 3 bö'g'imdan (tag, örta, uç) iborat, tirnog'i va burmalari bor.
   • Qöllar boşlanişda "uy qatori" (ASDF  JKL;) da turadi, bosh barmoqlar probelda.
   • Kerakli harf körsatilganda şu harfni bosadigan barmoq tugmaga uzanadi va
     TÖLIQ RANGGA kiradi (rangi klaviaturadagi barmoq rangi bilan bir xil, sal şaffof).
     Tugma ustuni ham şu rangda yengil yoritiladi.
   • Barmoq uzanganda qöl (kaft) ham sal siljiydi — qattiq "robot" körinmaydi.
   • Bosh harfda qarşi qöldagi kiçik barmoq Shift ga boradi.
   Provides: handsBuild, handsSet, handsPress, handsStart
   Depends: config.js, keyboard.js (KEYC, SHIFTC, SPACEC), design.js (sinflar)
   Koordinatalar: 1 birlik = 1 tugma eni (viewBox 0 0 15 6.9)
   ============================================================ */
const MIRX=13.5; // çap qöl -> öng qöl: x' = 13.5 - x (F <-> J)
// Çap qöl: [bo'g'im x, bo'g'im y, tag eni, uç eni, tinç holatdagi uç x, uç y]
const HAND={
 p:[1.90,4.00,.78,.62,2.25,1.62],
 r:[3.00,4.20,.88,.68,3.25,1.62],
 m:[4.20,4.30,.92,.70,4.25,1.62],
 i:[5.40,4.15,.94,.72,5.25,1.62],
 t:[6.00,5.95,1.10,.86,6.25,3.72]
};
// Kaft + bilak + tirsak (silliq egri çiziq bilan çiziladi)
const PALM=[[1.45,4.3],[1.95,3.85],[3.0,3.95],[4.2,4.05],[5.4,3.95],[6.2,4.5],[6.5,5.4],[6.15,6.25],[5.6,7.0],[5.5,8.2],[2.7,8.2],[2.3,7.0],[1.75,5.8]];
const HIDS=['lt','lp','lr','lm','li','rt','rp','rr','rm','ri'];
const FD={};     // barmoq id -> holati va SVG elementlari
const HM={};     // qöl (l/r) -> kaftning siljişi
let HT={},HA={act:'',sft:''},HR=0;

// Yopiq silliq egri çiziq (Catmull-Rom -> Bezier)
function smoothD(pts,mir){
 const P=pts.map(([x,y])=>[mir?MIRX-x:x,y]),n=P.length,f=v=>v.toFixed(3);
 let d='M'+f(P[0][0])+' '+f(P[0][1]);
 for(let i=0;i<n;i++){
  const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n],e=P[(i+2)%n];
  d+=`C${f(b[0]+(c[0]-a[0])/6)} ${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)} ${f(c[1]-(e[1]-b[1])/6)} ${f(c[0])} ${f(c[1])}`;
 }
 return d+'Z';
}
const fingerSVG=id=>`<g class="fg f-${id[1]=='t'?'th':id}" data-f="${id}"><path class="fo"/><path class="fo"/><path class="fo"/><path class="fs"/><path class="fs"/><path class="fs"/><path class="fh"/><path class="fc"/><path class="fc"/><ellipse class="nl"/></g>`;

function handsBuild(){
 const svg=$('#hsv');if(!svg)return;
 let o='<rect class="col" id="hcol" x="0" y="0" width="1" height="1" rx=".14" style="display:none"/>';
 ['l','r'].forEach(s=>{
  o+=`<g class="hand" data-h="${s}"><path class="palm" d="${smoothD(PALM,s=='r')}"/>`;
  HIDS.filter(id=>id[0]==s).forEach(id=>o+=fingerSVG(id));
  o+='</g>';
 });
 svg.innerHTML=o;
 ['l','r'].forEach(s=>HM[s]={x:0,y:0,g:svg.querySelector(`[data-h="${s}"]`)});
 HIDS.forEach(id=>{
  const m=id[0]=='r',h=HAND[id[1]],g=svg.querySelector(`[data-f="${id}"]`);
  const f=FD[id]={kx:m?MIRX-h[0]:h[0],ky:h[1],wb:h[2],wt:h[3],rx:m?MIRX-h[4]:h[4],ry:h[5],pulse:0,g,
   fo:g.querySelectorAll('.fo'),fs:g.querySelectorAll('.fs'),fh:g.querySelector('.fh'),fc:g.querySelectorAll('.fc'),nl:g.querySelector('.nl')};
  f.cx=f.rx;f.cy=f.ry;f.L0=Math.hypot(f.rx-f.kx,f.ry-f.ky);
  f.hcx=m?9.7:3.8;
 });
 handsStep();
}

// Kerakli belgi uçun nishonlarni belgilaydi (harakat handsStep da, silliq)
function handsSet(tg){
 if(!FD.lp)return;
 const lo=tg?tg.toLowerCase():'',code=lo&&lo!==' '?codeOf[lo]:null,fo=code?fobj(code):null;
 HT={};HA={act:'',sft:''};
 if(tg===' '){HT.rt=[SPACEC[0]+.1,SPACEC[1]+.1];HA.act='rt'}
 else if(fo){
  HA.act=fo[0];const c=KEYC[code];HT[fo[0]]=[c[0],c[1]+.22];
  if(tg!==lo){HA.sft=fo[0][0]=='l'?'rp':'lp';const s=SHIFTC[HA.sft[0]];HT[HA.sft]=[s[0],s[1]+.22]}
 }
 for(const id in FD){const f=FD[id];
  f.g.classList.toggle('on',id==HA.act);f.g.classList.toggle('on2',id==HA.sft)}
 // tugma ustuni (typing.com kabi) — şu barmoq rangida
 const col=$('#hcol');
 if(col){
  if(fo&&code){const c=KEYC[code];
   col.setAttribute('x',(c[0]-.5).toFixed(2));col.setAttribute('y','0');
   col.setAttribute('height',(c[1]+.5).toFixed(2));col.setAttribute('class','col f-'+fo[0]);col.style.display='';
  }else col.style.display='none';
 }
}
// Töğri tugma bosilganda: barmoq "bosadi"
function handsPress(){
 if(HA.act&&FD[HA.act])FD[HA.act].pulse=1;
 if(HA.sft&&FD[HA.sft])FD[HA.sft].pulse=.6;
}

const S2=v=>v.toFixed(3);
function drawFinger(f){
 const kx=f.kx,ky=f.ky,tx=f.cx,ty=f.cy+f.pulse*.16;
 const dx=tx-kx,dy=ty-ky,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
 const curl=Math.max(0,Math.min(.5,(f.L0-L)/f.L0));       // qancha bükilgan
 const wt=f.wt*(1+curl*.3);                                 // bükilsa uç kameraga yaqinlaşadi
 const P=[[kx,ky],[kx+dx*.38,ky+dy*.38],[kx+dx*.70,ky+dy*.70],[tx,ty]];
 const W=[f.wb,(f.wb+f.wt)/2,wt];
 for(let i=0;i<3;i++){
  const d=`M${S2(P[i][0])} ${S2(P[i][1])}L${S2(P[i+1][0])} ${S2(P[i+1][1])}`;
  f.fo[i].setAttribute('d',d);f.fo[i].setAttribute('stroke-width',S2(W[i]+.1));
  f.fs[i].setAttribute('d',d);f.fs[i].setAttribute('stroke-width',S2(W[i]));
 }
 // yorug'lik çizig'i (yumaloqlik beradi)
 const o=-f.wb*.17;
 f.fh.setAttribute('d',`M${S2(kx+nx*o+ux*.5)} ${S2(ky+ny*o+uy*.5)}L${S2(tx+nx*o*.6-ux*wt*.45)} ${S2(ty+ny*o*.6-uy*wt*.45)}`);
 f.fh.setAttribute('stroke-width',S2(wt*.26));
 // bö'g'im burmalari
 for(let i=0;i<2;i++){const p=P[i+1],h=W[i+1>2?2:i+1]*.28;
  f.fc[i].setAttribute('d',`M${S2(p[0]-nx*h)} ${S2(p[1]-ny*h)}L${S2(p[0]+nx*h)} ${S2(p[1]+ny*h)}`)}
 // tirnoq
 f.nl.setAttribute('rx',S2(wt*.27));f.nl.setAttribute('ry',S2(wt*.33));
 f.nl.setAttribute('transform',`translate(${S2(tx-ux*wt*.36)} ${S2(ty-uy*wt*.36)}) rotate(${(Math.atan2(dy,dx)*180/Math.PI+90).toFixed(1)})`);
}
function handsStep(){
 // qöl (kaft) uzanayotgan barmoq tomon sal siljiydi
 const tg={l:[0,0],r:[0,0]};
 [[HA.act,1],[HA.sft,.5]].forEach(([id,w])=>{
  if(!id||!FD[id]||!HT[id])return;
  const f=FD[id],t=HT[id],k=(id[1]=='t'?.18:.5)*w;
  tg[id[0]]=[(t[0]-f.rx)*k*.8,(t[1]-f.ry)*k];
 });
 ['l','r'].forEach(s=>{const h=HM[s];
  h.x+=(tg[s][0]-h.x)*.2;h.y+=(tg[s][1]-h.y)*.2;
  h.g.setAttribute('transform',`translate(${S2(h.x)} ${S2(h.y)})`)});
 for(const id in FD){
  const f=FD[id],h=HM[id[0]];
  const t=HT[id]?[HT[id][0]-h.x,HT[id][1]-h.y]:[f.rx,f.ry];
  f.cx+=(t[0]-f.cx)*.3;f.cy+=(t[1]-f.cy)*.3;f.pulse*=.8;
  drawFinger(f);
 }
}
function handsLoop(){HR=0;if($('#pr').hidden)return;handsStep();HR=requestAnimationFrame(handsLoop)}
function handsStart(){if(!HR)HR=requestAnimationFrame(handsLoop)}
