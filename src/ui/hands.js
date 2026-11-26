/* ============================================================
   hands.js — klaviatura üstidagi yarim şaffof qöllar.
   Qöllar boşlanişda "uy qatori" (ASDF  JKL;) da turadi, probelda bosh
   barmoqlar probelda. Kerakli harf körsatilganda şu harfni bosadigan barmoq
   tugmaga uzanadi (rangi bilan yonadi), harf bosilganda "bosiladi" va
   qaytib keladi. Bosh harfda qarşi qöldagi kiçik barmoq Shift ga boradi.
   Provides: handsBuild, handsSet, handsPress, handsStart
   Depends: config.js, keyboard.js (KEYC, SHIFTC, SPACEC), design.js (sinflar)
   Koordinatalar: 1 birlik = 1 tugma eni (viewBox 0 0 15 6.9)
   ============================================================ */
const MIRX=13.5; // çap qöl -> öng qöl: x' = 13.5 - x (F <-> J)
// Çap qöl: [bo'g'im x, bo'g'im y, tag eni, uç eni, tinç holatdagi uç x, uç y]
const HAND={
 p:[1.75,4.35,.78,.58,2.25,1.62],
 r:[2.95,4.00,.95,.68,3.25,1.62],
 m:[4.20,3.90,1.00,.72,4.25,1.62],
 i:[5.50,4.05,1.00,.72,5.25,1.62],
 t:[5.75,5.7,1.1,.84,5.95,3.66]
};
const PALM=[[1.2,4.5],[1.85,3.95],[3.0,3.7],[4.2,3.6],[5.45,3.75],[6.1,4.3],[6.2,5.3],[5.5,6.2],[3.0,6.5],[1.9,5.7]];
const FD={};      // barmoq id -> holati va SVG elementlari
let HT={},HA={act:'',sft:''},HR=0;

// Barmoq: tag (bo'g'im) dan uç (tip) gaça tarashlangan shakl
function fpath(kx,ky,tx,ty,wb,wt){
 const dx=tx-kx,dy=ty-ky,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
 const f=(x,y)=>x.toFixed(3)+' '+y.toFixed(3);
 const bl=f(kx+nx*wb/2,ky+ny*wb/2),br=f(kx-nx*wb/2,ky-ny*wb/2);
 const tl=f(tx+nx*wt/2,ty+ny*wt/2),tr=f(tx-nx*wt/2,ty-ny*wt/2);
 return `M${bl}L${tl}A${wt/2} ${wt/2} 0 0 0 ${tr}L${br}Z`;
}
// Kaft yumaloq körinişi uçun kontur markazga qarab sal kichraytiriladi (design.js da qalin yumaloq çiziq bilan qaytariladi)
const palmD=m=>'M'+PALM.map(([x,y])=>{const px=3.7+(x-3.7)*.88,py=5.0+(y-5.0)*.88;return (m?MIRX-px:px).toFixed(3)+' '+py.toFixed(3)}).join('L')+'Z';

function handsBuild(){
 const svg=$('#hsv');if(!svg)return;
 const ids=['lt','rt','lp','lr','lm','li','rp','rr','rm','ri'];
 let o=`<g class="hg"><path class="palm" d="${palmD(false)}"/><path class="palm" d="${palmD(true)}"/>`;
 ids.forEach(id=>o+=`<path class="hb f-${id[1]=='t'?'th':id}" data-f="${id}"/>`);
 o+='</g>';
 ids.forEach(id=>o+=`<ellipse class="nl f-${id[1]=='t'?'th':id}" data-n="${id}"/>`);
 svg.innerHTML=o;
 ids.forEach(id=>{
  const m=id[0]=='r',h=HAND[id[1]];
  FD[id]={kx:m?MIRX-h[0]:h[0],ky:h[1],wb:h[2],wt:h[3],rx:m?MIRX-h[4]:h[4],ry:h[5],pulse:0,
   body:svg.querySelector(`[data-f="${id}"]`),nail:svg.querySelector(`[data-n="${id}"]`)};
  FD[id].cx=FD[id].rx;FD[id].cy=FD[id].ry;
  FD[id].nail.setAttribute('rx',(h[3]*.3).toFixed(3));FD[id].nail.setAttribute('ry',(h[3]*.36).toFixed(3));
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
  f.body.classList.toggle('on',id==HA.act);f.body.classList.toggle('on2',id==HA.sft);
  f.nail.classList.toggle('on',id==HA.act||id==HA.sft)}
}
// Töğri tugma bosilganda: barmoq "bosadi"
function handsPress(){
 if(HA.act&&FD[HA.act])FD[HA.act].pulse=1;
 if(HA.sft&&FD[HA.sft])FD[HA.sft].pulse=.6;
}
function handsStep(){
 for(const id in FD){
  const f=FD[id],t=HT[id]||[f.rx,f.ry];
  f.cx+=(t[0]-f.cx)*.3;f.cy+=(t[1]-f.cy)*.3;f.pulse*=.8;
  const tx=f.cx,ty=f.cy+f.pulse*.16;
  // qöl uzanganda bo'g'im ham sal siljiydi — tabiiyroq körinadi
  const kx=f.kx+.3*(f.cx-f.rx),ky=f.ky+.18*(f.cy-f.ry);
  f.body.setAttribute('d',fpath(kx,ky,tx,ty,f.wb,f.wt));
  const dx=tx-kx,dy=ty-ky,L=Math.hypot(dx,dy)||1;
  f.nail.setAttribute('transform',`translate(${(tx-dx/L*f.wt*.42).toFixed(3)} ${(ty-dy/L*f.wt*.42).toFixed(3)}) rotate(${(Math.atan2(dy,dx)*180/Math.PI+90).toFixed(1)})`);
 }
}
function handsLoop(){HR=0;if($('#pr').hidden)return;handsStep();HR=requestAnimationFrame(handsLoop)}
function handsStart(){if(!HR)HR=requestAnimationFrame(handsLoop)}
