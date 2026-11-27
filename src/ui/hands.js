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
 p:[2.00,3.70,.78,.66,2.15,1.35],
 r:[3.05,3.50,.88,.74,3.20,1.15],
 m:[4.20,3.45,.92,.76,4.25,1.05],
 i:[5.30,3.60,.94,.78,5.30,1.30],
 t:[6.10,5.70,1.08,.86,6.40,3.70]
};
// Kaft + bilak + bilak ustuni (silliq egri çiziq bilan çiziladi)
const PALM=[[1.5,4.2],[1.7,3.6],[2.6,3.4],[3.7,3.3],[4.8,3.3],[5.7,3.55],[6.3,4.2],[6.55,5.0],[6.3,6.0],[5.8,6.9],[5.6,8.2],[2.5,8.2],[2.3,6.8],[1.8,5.5]];
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
const fingerSVG=id=>`<g class="fg f-${id[1]=='t'?'th':id}" data-f="${id}"><path class="fs"/><path class="fh"/><path class="fc"/><path class="fc"/></g>`;

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
  const f=FD[id]={kx:m?MIRX-h[0]:h[0],ky:h[1],wb:h[2],wt:h[3],rx:m?MIRX-h[4]:h[4],ry:h[5],pulse:0,bs:m?-1:1,g,
   fs:g.querySelector('.fs'),fh:g.querySelector('.fh'),fc:g.querySelectorAll('.fc')};
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
  f.g.classList.toggle('on',id==HA.act);f.g.classList.toggle('on2',id==HA.sft)}
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
 const curl=Math.max(0,Math.min(.5,(f.L0-L)/f.L0)),wt=f.wt*(1+curl*.25),bd=f.bs*(.1+curl*.9);   // bükilsa uç yo'ğonlaşadi va egiladi
 const qx=(kx+tx)/2-dy/L*bd,qy=(ky+ty)/2+dx/L*bd,N=10,A=[],B=[],M=[];
 for(let i=0;i<=N;i++){const t=i/N,u=1-t,x=u*u*kx+2*u*t*qx+t*t*tx,y=u*u*ky+2*u*t*qy+t*t*ty;
  let ex=2*u*(qx-kx)+2*t*(tx-qx),ey=2*u*(qy-ky)+2*t*(ty-qy);const e=Math.hypot(ex,ey)||1;ex/=e;ey/=e;
  const w=(f.wb+(wt-f.wb)*t)/2;
  A.push(S2(x-ey*w)+' '+S2(y+ex*w));B.push(S2(x+ey*w)+' '+S2(y-ex*w));M.push([x,y,ex,ey,w])}
 const r=S2(wt/2);
 f.fs.setAttribute('d','M'+A.join('L')+'A'+r+' '+r+' 0 0 0 '+B[N]+'L'+B.slice(0,N).reverse().join('L')+'Z');
 f.fh.setAttribute('d','M'+M.slice(1,8).map(m=>S2(m[0]+m[3]*m[4]*.38)+' '+S2(m[1]-m[2]*m[4]*.38)).join('L'));
 [4,7].forEach((i,k)=>{const m=M[i],h=m[4]*.55;
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
function handsLoop(){HR=0;if(LITE||$('#pr').hidden||$('#hsv').style.display=='none')return;if(handsStep())HR=requestAnimationFrame(handsLoop)}
function handsStart(){if(!HR&&!LITE&&$('#hsv').style.display!='none')HR=requestAnimationFrame(handsLoop)}
