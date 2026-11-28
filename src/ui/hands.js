/* ============================================================
   hands.js — klaviatura üstidagi qöllar (typing.com kabi), bitta yaxlit haqiqiy qöl körinişida.
   • Har bir qöl BITTA shakl: kaft va barmoqlar bir xil teri rangida qo'şilib ketadi, tashqi çizig'i yagona
     (barmoqlar orasida faqat tabiiy tirqiş körinadi). Barmoq tuzilişi: asos keng, uç sal tor, yumaloq uç.
   • Tirnoq barmoq uçida, barmoq yönalişiga qarab buriladi.
   • Boşlanişda \"uy qatori\" (ASDF  JKL;) da turadi, bosh barmoqlar probelda.
   • Kerakli harf körsatilganda şu harfni bosadigan barmoq tugmaga uzanadi va rangga kiradi.
   • Yengil: filter, şaffoflik va og'ir gradientlar yöq — zaif qurilmada ham qotmaydi, Yengil rejimda ham körinadi.
   Provides: handsBuild, handsSet, handsPress, handsStart
   Depends: config.js, keyboard.js (KEYC, SHIFTC, SPACEC), design.js (sinflar)
   Koordinatalar: 1 birlik = 1 tugma eni (viewBox 0 0 15 8.2)
   ============================================================ */
const MIRX=13.5; // çap qöl -> öng qöl: x' = 13.5 - x (F <-> J)
// Çap qöl: [bo'g'im x, bo'g'im y, tag eni, uç eni, tinç holatdagi uç x, uç y]
const HAND={
 p:[2.00,4.30,.96,.82,2.15,1.55],
 r:[3.10,4.20,1.04,.88,3.20,1.30],
 m:[4.20,4.15,1.08,.90,4.25,1.20],
 i:[5.30,4.30,1.06,.90,5.30,1.45],
 t:[5.80,6.00,1.20,.98,6.40,3.80]
};
// Kaft + bilak: barmoq asoslari ostida yaxlit (barmoqlar şu shaklga qo'şilib ketadi)
const PALM=[[1.45,4.3],[1.55,3.7],[2.3,3.45],[3.1,3.4],[4.2,3.35],[5.3,3.45],[6.0,3.9],[6.45,4.8],[6.35,5.8],[5.9,6.8],[5.7,8.2],[2.4,8.2],[2.2,6.8],[1.6,5.5]];
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
const NAILD='M-.5 .34Q-.5 .5 -.34 .5L.34 .5Q.5 .5 .5 .34L.5 -.12C.5 -.42 .28 -.5 0 -.5C-.28 -.5 -.5 -.42 -.5 -.12Z';
const fingerSVG=id=>`<g class="fg f-${id}" data-f="${id}"><path class="fs"/><path class="fa"/><path class="fc"/><path class="fc"/><path class="nail" d="${NAILD}"/></g>`;

function handsBuild(){
 const svg=$('#hsv');if(!svg)return;
 let o='<defs><linearGradient id="skinGrad" gradientUnits="userSpaceOnUse" x1="0" y1="1" x2="0" y2="8.2"><stop offset="0" stop-color="#f4d2b8"/><stop offset=".5" stop-color="#ebb996"/><stop offset="1" stop-color="#d99b78"/></linearGradient><linearGradient id="nailGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeee8"/><stop offset="1" stop-color="#efc3b3"/></linearGradient></defs><rect class="col" id="hcol" x="0" y="0" width="1" height="1" rx=".14" style="display:none"/>';
 ['l','r'].forEach(s=>{
  const fl=HIDS.filter(id=>id[0]==s),pd=smoothD(PALM,s=='r');
  // .ol — yagona tashqi kontur (barmoqlar va kaft birlashgan), .fl — ustidan bir xil teri rangi
  o+=`<g class="hand" data-h="${s}"><g class="ol"><path class="po" d="${pd}"/>${fl.map(id=>`<path class="fo f-${id}" data-o="${id}"/>`).join('')}</g><g class="fl"><path class="palm" d="${pd}"/>${fl.map(fingerSVG).join('')}</g></g>`;
 });
 svg.innerHTML=o;
 ['l','r'].forEach(s=>HM[s]={x:0,y:0,g:svg.querySelector(`[data-h="${s}"]`)});
 HIDS.forEach(id=>{
  const m=id[0]=='r',h=HAND[id[1]],g=svg.querySelector(`[data-f="${id}"]`);
  const f=FD[id]={kx:m?MIRX-h[0]:h[0],ky:h[1],wb:h[2],wt:h[3],rx:m?MIRX-h[4]:h[4],ry:h[5],pulse:0,bs:m?-1:1,g,
   fs:g.querySelector('.fs'),fa:g.querySelector('.fa'),o:svg.querySelector('[data-o="'+id+'"]'),fc:g.querySelectorAll('.fc'),na:g.querySelector('.nail')};
  f.cx=f.rx;f.cy=f.ry;f.L0=Math.hypot(f.rx-f.kx,f.ry-f.ky);
  f.hcx=m?9.7:3.8;
 });
 for(const id in FD)drawFinger(FD[id]);
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
  f.g.classList.toggle('on',id==HA.act);f.g.classList.toggle('on2',id==HA.sft);f.o.classList.toggle('on',id==HA.act||id==HA.sft)}
 // tugma ustuni (typing.com kabi) — şu barmoq rangida
 const col=$('#hcol');
 if(col){
  if(fo&&code){const c=KEYC[code];
   col.setAttribute('x',(c[0]-.5).toFixed(2));col.setAttribute('y','0');
   col.setAttribute('height',(c[1]+.5).toFixed(2));col.setAttribute('class','col f-'+fo[0]);col.style.display='';
  }else col.style.display='none';
 }
 handsStart();
}
// Töğri tugma bosilganda: barmoq "bosadi"
function handsPress(){
 if(HA.act&&FD[HA.act])FD[HA.act].pulse=1;
 if(HA.sft&&FD[HA.sft])FD[HA.sft].pulse=.6;
 handsStart();
}

const S2=v=>v.toFixed(3);
function drawFinger(f){
 const kx=f.kx,ky=f.ky,tx=f.cx,ty=f.cy+f.pulse*.16,dx=tx-kx,dy=ty-ky,L=Math.hypot(dx,dy)||1;
 const curl=Math.max(0,Math.min(.5,(f.L0-L)/f.L0)),wt=f.wt*(1+curl*.2),bd=f.bs*(.06+curl*.8);   // bükilsa uç sal yo'ğonlaşadi va egiladi
 const qx=(kx+tx)/2-dy/L*bd,qy=(ky+ty)/2+dx/L*bd,N=8,A=[],B=[],M=[];
 for(let i=0;i<=N;i++){const t=i/N,u=1-t,x=u*u*kx+2*u*t*qx+t*t*tx,y=u*u*ky+2*u*t*qy+t*t*ty;
  let ex=2*u*(qx-kx)+2*t*(tx-qx),ey=2*u*(qy-ky)+2*t*(ty-qy);const e=Math.hypot(ex,ey)||1;ex/=e;ey/=e;
  const w=(f.wb+(wt-f.wb)*Math.pow(t,.8))/2;   // asosdan uçga bir tekis ingichkalaşadi
  A.push(S2(x-ey*w)+' '+S2(y+ex*w));B.push(S2(x+ey*w)+' '+S2(y-ex*w));M.push([x,y,ex,ey,w])}
 const r=S2(wt/2),arc='A'+r+' '+r+' 0 0 0 '+B[N],rb=S2(f.wb/2),d='M'+A.join('L')+arc+'L'+B.slice(0,N).reverse().join('L')+'A'+rb+' '+rb+' 0 0 0 '+A[0]+'Z';   // asosi ham yumaloq — kaftga silliq qo'şiladi
 f.fs.setAttribute('d',d);f.o.setAttribute('d',d);
 f.fa.setAttribute('d','M'+A.slice(5).join('L')+arc+'L'+B.slice(5,N).reverse().join('L')+'Z');   // faqat barmoq uçi rangga kiradi (qölning qolgan qismi teri rangida)
 // Tirnoq: uçda, barmoq yönalişi bo'yicha (bükilganda barmoq bilan birga buriladi)
 const ang=Math.atan2(dy,dx)*180/Math.PI+90,nw=wt*.58,nh=wt*.66,nx=tx-dx/L*(wt*.5-nh*.42),ny=ty-dy/L*(wt*.5-nh*.42);
 f.na.setAttribute('transform',`translate(${S2(nx)} ${S2(ny)}) rotate(${S2(ang)}) scale(${S2(nw)} ${S2(nh)})`);
 // Bo'g'im burmalari: ikkita kiçik, yengil çiziq
 [3,6].forEach((i,k)=>{const m=M[i],h=m[4]*.42;
  f.fc[k].setAttribute('d',`M${S2(m[0]-m[3]*h)} ${S2(m[1]+m[2]*h)}L${S2(m[0]+m[3]*h)} ${S2(m[1]-m[2]*h)}`)});
}
function handsStep(){
 // qöl (kaft) uzanayotgan barmoq tomon sal siljiydi. Qaytaradi: harakat davom etyaptimi
 let mv=false;
 const tg={l:[0,0],r:[0,0]};
 [[HA.act,1],[HA.sft,.5]].forEach(([id,w])=>{
  if(!id||!FD[id]||!HT[id])return;
  const f=FD[id],t=HT[id],k=(id[1]=='t'?.18:.5)*w;
  tg[id[0]]=[(t[0]-f.rx)*k*.8,(t[1]-f.ry)*k];
 });
 ['l','r'].forEach(s=>{const h=HM[s];
  const dx=tg[s][0]-h.x,dy=tg[s][1]-h.y;
  if(Math.abs(dx)>.002||Math.abs(dy)>.002){mv=true;h.x+=dx*.25;h.y+=dy*.25;h.g.setAttribute('transform',`translate(${S2(h.x)} ${S2(h.y)})`)}});
 for(const id in FD){
  const f=FD[id],h=HM[id[0]];
  const t=HT[id]?[HT[id][0]-h.x,HT[id][1]-h.y]:[f.rx,f.ry];
  const dx=t[0]-f.cx,dy=t[1]-f.cy,busy=Math.abs(dx)>.003||Math.abs(dy)>.003||f.pulse>.01;
  if(busy||f.dr){
   f.cx+=dx*.3;f.cy+=dy*.3;f.pulse=f.pulse>.01?f.pulse*.8:0;
   drawFinger(f);f.dr=busy;
  }
  if(busy)mv=true;
 }
 return mv;
}
function handsLoop(){HR=0;if($('#pr').hidden||$('#hsv').style.display=='none')return;if(handsStep())HR=requestAnimationFrame(handsLoop)}
function handsStart(){if(!HR&&$('#hsv').style.display!='none')HR=requestAnimationFrame(handsLoop)}
