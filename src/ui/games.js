/* ============================================================
   games.js — yozişni qiziqarli qiladigan öyinlar (CANVAS, 60 kadr/s).
   Harf öyinlari (söz kerak emas):
     tiles   — Harf plitkalari (Piano Tiles): har bir harf klaviaturadagi öz ustuni bö'yiça
               yuqoridan yakka-yakka tüşadi; eng pastdagisini bosing.
     climb   — Robot (harf guruhlari): harflarni yozsangiz robot platformaga yürib boradi va sakraydi.
   Söz öyinlari (faqat ma'noli sözlar):
     robot   — Sakrovçi robot : sözni yozsangiz robot keyingi platformaga sakraydi.
     race    — Poyga          : matnni tez yozib, boy mașinadan oldin finişga yetib keling.
     rocket  — Raketa         : yoqilği tugamasdan sözlarni yozib Oyga yetib boring.
   Har bir öyin obyekt qaytaradi:
     title, target() — keyingi kerakli belgi, key(c) — 1 töğri / 0 xato / -1 e'tiborsiz,
     status(), stop() — tozalaş, over
   Depends: screens.js (S, CL, R, sh, paint, gameEnd), lessons.js (BANK, pickN, ALL), sounds.js (snd)
   ============================================================ */
const GAMES={};
const TAU=Math.PI*2;
const MONO='Consolas,"Courier New",monospace',SANS='"Trebuchet MS","Segoe UI",Verdana,sans-serif';
const FC={lp:'#ff5d85',lr:'#ff9433',lm:'#f2bd00',li:'#3dbb5a',ri:'#1fb0d6',rm:'#4a86ff',rr:'#9b5cff',rp:'#ec4fbe',lt:'#ffa94d'};
const fcol=ch=>{const c=codeOf[ch.toLowerCase()],f=c&&fobj(c);return f?FC[f[0]]:'#2aa8e8'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const WINS=['Ajoyib!','Zör!','Barakalla!'];
const STARS=Array.from({length:60},()=>[Math.random(),Math.random(),.8+Math.random()*1.8]);

function rr(X,x,y,w,h,r){r=Math.min(r,w/2,h/2);X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function sky(X,W,H,a,b){const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(1,b);X.fillStyle=g;X.fillRect(0,0,W,H)}
function cloud(X,x,y,s){X.fillStyle='rgba(255,255,255,.92)';X.beginPath();X.arc(x,y,16*s,0,TAU);X.arc(x+20*s,y-9*s,20*s,0,TAU);X.arc(x+42*s,y-2*s,15*s,0,TAU);X.arc(x+22*s,y+6*s,17*s,0,TAU);X.fill()}
function clouds(X,W,H,t,dy){[[.1,.16,1.1,9],[.45,.3,.8,6],[.78,.12,1,12]].forEach(([fx,fy,s,v])=>{const x=((fx*W+t*v)%(W+160))-80;cloud(X,x,fy*H+dy,s)})}

// Öyin sözlari: faqat örganilgan harflardan tuzilgan, ma'noli sözlar (BANK dan). Xilma-xil, takrorsiz.
function gPool(kn){const s=new Set((kn||[]).map(c=>c.toLowerCase()));return BANK.filter(w=>okW(w)&&[...w].every(c=>s.has(c)))}
function gWords(kn,n){const p=gPool(kn);return pickN(p,Math.min(n,p.length))}
// Harf bö'laklari (2-4 belgi): "jfj fjf" kabi bir xil bölmasligi uçun turli naqşlar —
// ikkilanish (ffj), almaşiş (fjfj), ko'zgu (fjjf), bö'g'inga o'xşaş (sal, fak) va aralaş.
// focus — yangi harflar: ular ko'proq uçraydi.
const VOW='aeiouö';
function chunks(kn,n,focus){
 const L=[...new Set((kn||[]).map(c=>c.toLowerCase()).filter(c=>c.length==1&&c!==' '&&codeOf[c]))];
 if(!L.length)L.push('f','j');
 const fo=(focus||[]).map(c=>c.toLowerCase()).filter(c=>L.includes(c));
 const V=L.filter(c=>VOW.includes(c)),C=L.filter(c=>!VOW.includes(c));
 const pk=()=>fo.length&&Math.random()<.5?R(fo):R(L);
 const from=(A)=>{const f=fo.filter(c=>A.includes(c));return f.length&&Math.random()<.5?R(f):R(A)};
 const two=()=>{const a=pk();let b=pk(),g=0;while(L.length>1&&b===a&&g++<8)b=pk();return[a,b]};
 const mkc=()=>{
  const r=Math.random();
  if(V.length&&C.length&&r<.45){
   const len=2+(Math.random()*3|0);let w='',cv=Math.random()<.7;
   for(let i=0;i<len;i++){w+=cv?from(C):from(V);cv=!cv}
   return w}
  if(L.length<2){return L[0].repeat(2+(Math.random()*2|0))}
  const[a,b]=two();
  if(r<.58)return a+b;
  if(r<.68)return a+a+b;
  if(r<.76)return a+b+a;
  if(r<.83)return a+b+b;
  if(r<.89)return a+b+a+b;
  if(r<.94)return a+b+b+a;
  let w=a,k=1;for(let i=0;i<3+(Math.random()*2|0);i++){const c=pk();if(c===w[w.length-1]&&k>=2)continue;k=c===w[w.length-1]?k+1:1;w+=c}
  return w;
 };
 const out=[],seen=new Set();let g=0;
 while(out.length<n&&g++<n*40){const w=mkc();if(w.length>=2&&!seen.has(w)){seen.add(w);out.push(w)}}
 while(out.length<n)out.push(mkc());
 return out;
}
// Harf öyinlari uçun ketma-ketlik: yangi harflar ko'proq, bö'laklardan tuziladi
function gSeq(kn,n){
 const all=[...new Set(kn||[])].filter(c=>c.length==1&&c!==' '&&codeOf[c.toLowerCase()]);
 const out=[];
 for(const w of chunks(kn,n,all.slice(-3)))for(const c of w){if(out.length<n)out.push(c)}
 while(out.length<n)out.push(R(all.length?all:['f','j']));
 return out;
}
// Söz öyinlari uçun: ma'noli sözlar; yetmasa — harf bö'laklari bilan to'ldiriladi (öyin hamişa işlaydi)
function gItems(kn,n){
 const w=gWords(kn,n);
 if(w.length>=n)return w;
 return sh(w.concat(chunks(kn,n-w.length,(kn||[]).slice(-3))));
}

/* ---------- umumiy: canvas, sikl, zarralar, e'lon ---------- */
function gStage(){
 const gm=$('#gm');gm.innerHTML='';
 const H=clamp(Math.round(innerHeight*.44),270,400);
 const cv=document.createElement('canvas');cv.style.height=H+'px';gm.appendChild(cv);
 const X=cv.getContext('2d'),st={cv,X,W:0,H,fx:[],tx:[],dq:LITE?1:Math.min(1.5,window.devicePixelRatio||1)};
 const fit=()=>{const d=st.dq,W=gm.clientWidth||900;st.W=W;cv.width=Math.round(W*d);cv.height=Math.round(H*d);X.setTransform(d,0,0,d,0,0)};
 st.fit=fit;
 fit();addEventListener('resize',fit);
 st.off=()=>removeEventListener('resize',fit);
 return st;
}
function loop(G,st,upd,drw){
 let raf=0,last=0,fr=0,acc=0,cnt=0;
 const f=ts=>{
  raf=requestAnimationFrame(f);
  const raw=(ts-(last||ts))/1000,dt=Math.min(.05,raw);last=ts;
  // Avtomatik sifat: kadr sekin bölsa canvas aniqligi pasayadi (qotmaslik uçun)
  if(++fr>25&&raw<.25){acc+=raw;if(++cnt>=40){
   if(acc/cnt>.028){if(st.dq>.8){st.dq=Math.max(.7,st.dq-.3);st.fit()}else if(!LITE)setLite(true,true)}
   acc=0;cnt=0}}
  upd(dt);fxStep(st,dt);drw(st.X,st.W,st.H);fxDraw(st);
 };
 raf=requestAnimationFrame(f);
 G.stop=()=>{cancelAnimationFrame(raf);st.off()};
}
function burst(st,x,y,c,n){
 n=n||14;if(LITE)n=Math.ceil(n/2);if(st.fx.length>(LITE?30:90))return;
 for(let i=0;i<n;i++){const a=Math.random()*TAU,v=70+Math.random()*190;st.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,l:.5+Math.random()*.35,c,s:3+Math.random()*4})}
}
function pop(st,x,y,t,c){if(st.tx.length<12)st.tx.push({x,y,t,c:c||'#fff',l:.8})}
function fxStep(st,dt){
 for(let i=st.fx.length-1;i>=0;i--){const p=st.fx[i];p.l-=dt;if(p.l<=0){st.fx.splice(i,1);continue}p.vy+=460*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}
 for(let i=st.tx.length-1;i>=0;i--){const t=st.tx[i];t.l-=dt;if(t.l<=0)st.tx.splice(i,1);else t.y-=46*dt}
}
function fxDraw(st){
 const X=st.X;
 for(const p of st.fx){X.globalAlpha=clamp(p.l/.35,0,1);X.fillStyle=p.c;X.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
 if(st.tx.length){X.textAlign='center';X.textBaseline='alphabetic';X.font=`800 22px ${SANS}`;
  for(const t of st.tx){X.globalAlpha=clamp(t.l/.4,0,1);X.lineWidth=4;X.strokeStyle='rgba(20,30,60,.55)';X.strokeText(t.t,t.x,t.y);X.fillStyle=t.c;X.fillText(t.t,t.x,t.y)}}
 X.globalAlpha=1;
}
function banner(txt,kind,sub){
 const d=document.createElement('div');d.className='amz '+(kind||'');
 d.innerHTML=`<b>${txt}</b>${sub?`<small>${sub}</small>`:''}`;$('#gm').appendChild(d);
}
function hud(X,W,lives,max,prog,label){
 X.textBaseline='alphabetic';X.textAlign='left';X.font=`700 24px ${SANS}`;
 for(let i=0;i<max;i++){X.fillStyle=i<lives?'#ff5a5f':'rgba(255,255,255,.38)';X.fillText('♥',14+i*27,32)}
 const bw=Math.min(280,W*.34),bx=W-bw-16,by=15;
 rr(X,bx,by,bw,14,7);X.fillStyle='rgba(255,255,255,.4)';X.fill();
 if(prog>0){rr(X,bx,by,Math.max(14,bw*prog),14,7);X.fillStyle='#ffc933';X.fill()}
 X.textAlign='right';X.font=`800 15px ${SANS}`;X.lineWidth=3;X.strokeStyle='rgba(20,30,60,.5)';X.strokeText(label,bx-10,28);X.fillStyle='#fff';X.fillText(label,bx-10,28);
}
function finishGame(G,win,sub){
 if(G.over)return;G.over=true;
 setTimeout(()=>{
  if(win){const n=starsOf(accOf(S));banner(R(WINS),'win','★'.repeat(n)+'☆'.repeat(3-n));snd.amazing()}
  else{banner('Yutqazdingiz','lose',sub||'ENTER — qayta urinib körişh');snd.lose()}
  gameEnd(win);
 },win?350:200);
}
// Matnni belgi-belgi çizadi. Har bir (söz,holat) bir marta alohida rasmga çiziladi va keyin faqat
// ko'çiriladi — har kadrda strokeText çaqirilmaydi (sekin qurilmalarda qotmaslik uçun).
const WCACHE=new Map();
function wordSprite(w,size,pos,bad,dark){
 const key=w+'|'+size+'|'+pos+'|'+(bad?1:0)+'|'+(dark?1:0);
 let sp=WCACHE.get(key);if(sp)return sp;
 if(WCACHE.size>160)WCACHE.clear();
 const c=document.createElement('canvas'),X=c.getContext('2d'),SC=2,pad=8;
 X.font=`800 ${size}px ${MONO}`;
 const cw=X.measureText('M').width*1.12,Wd=Math.ceil(w.length*cw+pad*2),Hd=Math.ceil(size*1.24+pad*2);
 c.width=Wd*SC;c.height=Hd*SC;X.setTransform(SC,0,0,SC,0,0);
 X.font=`800 ${size}px ${MONO}`;X.textBaseline='middle';X.textAlign='left';
 const cy=Hd/2;
 for(let j=0;j<w.length;j++){
  const x=pad+j*cw,cur=j==pos;
  if(cur){rr(X,x-2,cy-size*.62,cw+2,size*1.24,8);X.fillStyle=bad?'rgba(255,90,95,.85)':'rgba(255,224,102,.95)';X.fill()}
  X.lineWidth=5;X.lineJoin='round';
  if(!dark||!cur){X.strokeStyle='rgba(20,30,60,.75)';X.strokeText(w[j],x+cw*.1,cy+1)}
  X.fillStyle=cur?'#24384d':j<pos?'#58e07a':'#fff';X.fillText(w[j],x+cw*.1,cy+1);
 }
 sp={c,w:Wd,h:Hd,cx:pad+w.length*cw/2};WCACHE.set(key,sp);return sp;
}
function drawWord(X,w,cx,cy,size,pos,bad,dark){
 const s=wordSprite(w,size,pos,bad,dark);
 X.drawImage(s.c,cx-s.cx,cy-s.h/2,s.w,s.h);
}

/* ---------- 1) Harf plitkalari (Piano Tiles) ---------- */
GAMES.tiles=function(kn){
 const st=gStage(),G={title:'Harf plitkalari',over:false},N=24,seq=gSeq(kn,N);
 let live=[],pops=[],sp=0,done=0,lives=3,combo=0,flash=0,t=0;
 const lane=ch=>{const c=codeOf[ch.toLowerCase()],k=c&&KEYC[c];return k?k[0]/15*st.W:st.W/2};
 const tw=()=>clamp(st.W/15*.9,38,66),th=()=>tw()*1.3,floor=()=>st.H-18;
 const speed=()=>st.H*(.26+.15*sp/N);
 function upd(dt){
  t+=dt;flash=Math.max(0,flash-dt*3);
  for(let i=pops.length-1;i>=0;i--){pops[i].a+=dt*4.5;if(pops[i].a>=1)pops.splice(i,1)}
  if(G.over)return;
  const h=th(),v=speed();
  for(const k of live){k.y+=v*dt;if(k.sh>0)k.sh-=dt}
  if(sp<N&&(!live.length||live[live.length-1].y>-h+h*1.75))live.push({ch:seq[sp++],y:-h,sh:0});
  if(live.length&&live[0].y+h>=floor()){
   const k=live.shift();lives--;combo=0;flash=1;snd.miss();
   burst(st,lane(k.ch),floor(),'#ff5a5f',10);pop(st,lane(k.ch),floor()-20,'−♥','#ff8a8e');
   if(lives<=0)finishGame(G,false);
  }
 }
 function drw(X,W,H){
  sky(X,W,H,'#1b2850','#3d68b4');
  X.fillStyle='rgba(255,255,255,.55)';
  for(const s of STARS)X.fillRect(s[0]*W,(s[1]*H+t*6*s[2])%H,s[2],s[2]);
  const w=tw(),h=th(),fy=floor();
  if(live[0]){X.fillStyle='rgba(255,255,255,.07)';X.fillRect(lane(live[0].ch)-w/2-5,0,w+10,H)}
  const g=X.createLinearGradient(0,fy-34,0,fy+18);g.addColorStop(0,'rgba(255,90,95,0)');g.addColorStop(1,`rgba(255,90,95,${.3+flash*.45})`);
  X.fillStyle=g;X.fillRect(0,fy-34,W,52);X.fillStyle='#ff5a5f';X.fillRect(0,fy,W,3);
  X.textAlign='center';X.textBaseline='middle';
  for(const p of pops){const x=lane(p.ch),s=1+p.a*.35;X.globalAlpha=1-p.a;X.fillStyle=p.c;rr(X,x-w*s/2,p.y-(s-1)*h/2,w*s,h*s,12);X.fill()}
  X.globalAlpha=1;
  live.forEach((k,i)=>{
   const x=lane(k.ch)+(k.sh>0?Math.sin(k.sh*70)*5:0),c=fcol(k.ch);
   if(i==0){rr(X,x-w/2-4,k.y-4,w+8,h+8,14);X.fillStyle='rgba(255,255,255,.9)';X.fill()}
   rr(X,x-w/2,k.y,w,h,11);X.fillStyle=c;X.fill();
   rr(X,x-w/2+3,k.y+3,w-6,h*.38,9);X.fillStyle='rgba(255,255,255,.22)';X.fill();
   X.font=`800 ${w*.64}px ${MONO}`;X.lineWidth=4;X.strokeStyle='rgba(20,30,60,.35)';X.strokeText(k.ch,x,k.y+h/2+2);X.fillStyle='#fff';X.fillText(k.ch,x,k.y+h/2+2);
   if(k.ch!==k.ch.toLowerCase()){X.font=`800 ${w*.28}px ${SANS}`;X.fillText('⇧',x-w*.32,k.y+h*.17)}
  });
  hud(X,W,lives,3,done/N,done+' / '+N);
  if(combo>=3){X.globalAlpha=.9;X.textAlign='center';X.font=`900 30px ${SANS}`;X.lineWidth=5;X.strokeStyle='rgba(20,30,60,.6)';X.strokeText('×'+combo,W/2,36);X.fillStyle='#ffe066';X.fillText('×'+combo,W/2,36);X.globalAlpha=1}
 }
 G.key=c=>{
  if(G.over)return -1;
  const k=live[0];if(!k)return -1;
  if(c===k.ch){
   live.shift();pops.push({ch:k.ch,y:k.y,a:0,c:fcol(k.ch)});
   const x=lane(k.ch);burst(st,x,k.y+th()/2,fcol(k.ch),12);
   combo++;pop(st,x,k.y,combo>=3?'×'+combo:'+1','#fff');snd.note(done);done++;
   if(done>=N)finishGame(G,true);
   return 1;
  }
  combo=0;flash=.6;k.sh=.25;return 0;
 };
 G.target=()=>live[0]?live[0].ch:'';
 G.status=()=>`${done} / ${N}`;
 loop(G,st,upd,drw);
 return G;
};

/* ---------- 3) Sakrovçi robot ---------- */
function drawRobot(X,x,y,sx,sy,t){
 X.save();X.translate(x,y);X.scale(sx,sy);
 X.fillStyle='#1d6fb5';rr(X,-12,-10,9,11,3);X.fill();rr(X,3,-10,9,11,3);X.fill();
 X.strokeStyle='#3a4a5c';X.lineWidth=2.4;X.lineCap='round';X.beginPath();X.moveTo(0,-44);X.lineTo(0,-52);X.stroke();
 X.fillStyle='#ffc933';X.beginPath();X.arc(0,-54,4,0,TAU);X.fill();
 rr(X,-18,-44,36,32,10);X.fillStyle='#2f8fe0';X.fill();X.lineWidth=2;X.strokeStyle='#1d6fb5';X.stroke();
 rr(X,-13,-39,26,20,7);X.fillStyle='#d8f0ff';X.fill();
 X.fillStyle='#24384d';X.beginPath();X.arc(-5,-30,2.6,0,TAU);X.arc(5,-30,2.6,0,TAU);X.fill();
 X.strokeStyle='#24384d';X.lineWidth=1.8;X.beginPath();X.arc(0,-26,4.5,.2,Math.PI-.2);X.stroke();
 X.restore();
}
// Robot: yuqori platformadagi belgilarni yozsangiz robot şu tomonga yürib boradi, hammasi yozilgach — platformaga sakraydi.
// robot — sözlar bilan, climb — harf guruhlari bilan (söz kerak emas).
function robotGame(kn,items,title){
 const st=gStage(),G={title,over:false},N=items.length,SP=98;
 const PX=[.14,.55,.2,.6,.12,.52,.3];
 let idx=0,pos=0,t=0,cam=0,jm=null,rx=0,ry=0,bad=0,sq=1,pf=0,fc=1,mv=false;
 const pw=()=>clamp(st.W*.3,150,250);
 const cxOf=i=>{const w=pw();return w/2+12+PX[i%7]*(st.W-w-24)};
 const syOf=i=>cam-i*SP;
 const camT=()=>st.H*.74+pf*SP;
 const wx=()=>idx>=N?cxOf(N):lerp(cxOf(idx),cxOf(idx+1),pos/items[idx].length);
 cam=camT();rx=cxOf(0);ry=0;
 function upd(dt){
  t+=dt;bad=Math.max(0,bad-dt);
  cam+=(camT()-cam)*Math.min(1,dt*5);
  if(jm){
   jm.t+=dt;const u=Math.min(1,jm.t/.55),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
   rx=lerp(jm.x0,jm.x1,e);ry=lerp(jm.y0,jm.y1,u)-Math.sin(Math.PI*u)*72;pf=lerp(jm.a,jm.b,u);
   sq=u<.12?lerp(1,.8,u/.12):u>.88?lerp(1.12,1,(u-.88)/.12):1.1;mv=false;
   if(u>=1){jm=null;sq=.78;snd.land();pf=idx;burst(st,rx,cam+ry,'#fff6c8',8);
    if(idx>=N)finishGame(G,true)}
  }else{
   const tx=wx();mv=Math.abs(tx-rx)>1.2;
   if(mv)fc=tx>rx?1:-1;
   rx+=(tx-rx)*Math.min(1,dt*7);
   sq+=(1-sq)*Math.min(1,dt*10);
  }
 }
 function drw(X,W,H){
  sky(X,W,H,'#5db8f0','#d7f1ff');
  X.fillStyle='#ffe27a';X.beginPath();X.arc(W-70,60,26,0,TAU);X.fill();
  clouds(X,W,H,t,0);
  X.fillStyle='#8fd67a';X.beginPath();X.ellipse(W*.3,cam+90,W*.8,110,0,0,TAU);X.fill();
  const w=pw();
  for(let i=0;i<=N;i++){
   const y=syOf(i);if(y<-80||y>H+90)continue;
   const x=cxOf(i)-w/2;
   rr(X,x,y,w,16,8);X.fillStyle='#a8703a';X.fill();rr(X,x,y+10,w,6,3);X.fillStyle='#7a4a22';X.fill();
   if(i==N){X.font='30px sans-serif';X.textAlign='center';X.textBaseline='alphabetic';X.fillText('⭐',x+w-16,y-4)}
   if(i>=1){const k=i-1,it=items[k];
    if(k>=idx)drawWord(X,it,cxOf(i),y-30,k==idx?clamp(W/26,22,30):20,k==idx?pos:-1,k==idx&&bad>0);
    else drawWord(X,it,cxOf(i),y-30,20,it.length,false);}
  }
  const bob=mv?Math.abs(Math.sin(t*16))*4:0;
  drawRobot(X,rx,cam+ry-bob,clamp(2-sq,.85,1.2)*fc,sq,t);
  hud(X,W,0,0,idx/N,idx+' / '+N);
 }
 G.key=c=>{
  if(G.over||jm||idx>=N)return -1;
  const w=items[idx];
  if(c===w[pos]){
   pos++;
   if(pos>=w.length){
    snd.word();idx++;pos=0;
    jm={t:0,x0:rx,y0:ry,x1:cxOf(idx),y1:-idx*SP,a:idx-1,b:idx};fc=jm.x1>=jm.x0?1:-1;snd.jump();
   }
   return 1;
  }
  bad=.3;return 0;
 };
 G.target=()=>idx<N&&!jm?items[idx][pos]:'';
 G.status=()=>`Platforma ${Math.min(idx+1,N)} / ${N}`;
 loop(G,st,upd,drw);
 return G;
}
GAMES.robot=kn=>robotGame(kn,gItems(kn,6),'Sakrovçi robot');
GAMES.climb=kn=>robotGame(kn,chunks(kn,6,(kn||[]).slice(-3)),'Sakrovçi robot');

/* ---------- 4) Poyga ---------- */
function drawCar(X,x,y,c,wa){
 X.save();X.translate(x,y);
 X.fillStyle=c;X.strokeStyle='#24384d';X.lineWidth=2;X.lineJoin='round';
 X.beginPath();X.moveTo(0,22);X.quadraticCurveTo(0,10,9,8);X.lineTo(20,0);X.quadraticCurveTo(25,-3,32,-3);X.lineTo(44,-3);X.quadraticCurveTo(52,-3,57,3);X.lineTo(62,9);X.quadraticCurveTo(70,10,70,20);X.lineTo(70,22);X.closePath();X.fill();X.stroke();
 X.fillStyle='#d8f0ff';X.beginPath();X.moveTo(24,7);X.lineTo(31,0);X.lineTo(40,0);X.lineTo(40,7);X.closePath();X.fill();X.stroke();
 X.beginPath();X.moveTo(44,7);X.lineTo(44,0);X.lineTo(50,0);X.lineTo(56,7);X.closePath();X.fill();X.stroke();
 for(const wx of [17,53]){X.save();X.translate(wx,23);X.rotate(wa);X.fillStyle='#24384d';X.beginPath();X.arc(0,0,7,0,TAU);X.fill();X.fillStyle='#cfd8e0';X.fillRect(-1.5,-5,3,10);X.fillRect(-5,-1.5,10,3);X.restore()}
 X.restore();
}
GAMES.race=function(kn){
 const st=gStage(),G={title:'Poyga',over:false},words=gItems(kn,8),text=words.join(' '),total=text.length;
 const cps=1.15+Math.min(.55,Math.max(0,ALL.indexOf(CL))*.03);
 let i=0,bad=0,bot=0,go=false,di=0,db=0,t=0,wa=0,road=0;
 function upd(dt){
  t+=dt;bad=Math.max(0,bad-dt);
  if(!G.over&&go)bot+=dt*cps*(1+Math.sin(t/1.2)*.2);
  di+=(i-di)*Math.min(1,dt*12);db+=(bot-db)*Math.min(1,dt*8);
  wa+=dt*(go?14:2);road=(road+dt*(go?260:30))%60;
  if(!G.over&&bot>=total)finishGame(G,false,'Boy mașina yutdi — ENTER bosing');
 }
 function drw(X,W,H){
  sky(X,W,H,'#aee3ff','#effaff');clouds(X,W,H,t,0);
  const L1=54,LH=58,gap=8,x0=18,x1=W-86,fl=W-52;
  for(let k=0;k<2;k++){
   const y=L1+k*(LH+gap);
   rr(X,0,y,W,LH,0);X.fillStyle='#59656f';X.fill();
   X.fillStyle='rgba(255,255,255,.55)';for(let d=-60;d<W;d+=60)X.fillRect(d+road,y+LH/2-2,30,4);
  }
  for(let r=0;r<8;r++)for(let c=0;c<2;c++){X.fillStyle=(r+c)%2?'#fff':'#24384d';X.fillRect(fl+c*10,L1+r*(2*LH+gap)/8,10,(2*LH+gap)/8)}
  const p1=Math.min(1,di/total),p2=Math.min(1,db/total);
  drawCar(X,x0+(x1-x0)*p2,L1+LH+gap+10,'#ff5a5f',wa);
  drawCar(X,x0+(x1-x0)*p1,L1+8,'#2f8fe0',wa);
  X.font=`800 14px ${SANS}`;X.fillStyle='#24384d';X.textAlign='left';X.textBaseline='alphabetic';
  X.fillText('Siz',8,L1-8);X.fillText('Boy',60,L1-8);
  // matn şeridi
  const py=H-92,ph=74;
  rr(X,14,py,W-28,ph,18);X.fillStyle='#fff';X.fill();
  X.save();rr(X,14,py,W-28,ph,18);X.clip();
  X.font=`700 30px ${MONO}`;X.textBaseline='middle';X.textAlign='left';
  const cw=X.measureText('M').width*1.08,cy=py+ph/2,half=Math.ceil(W/cw/2)+2;
  for(let j=Math.max(0,i-half);j<Math.min(total,i+half);j++){
   const x=W/2+(j-di)*cw-cw/2,ch=text[j];
   if(j==i){rr(X,x-2,cy-24,cw+2,48,7);X.fillStyle=bad>0?'#ffd5d6':'#cdeaff';X.fill();X.fillStyle=bad>0?'#ff5a5f':'#2aa8e8';X.fillRect(x,cy+19,cw-2,4)}
   X.fillStyle=j<i?'#2fae5f':'#24384d';X.fillText(ch,x+cw*.05,cy);
  }
  X.restore();
  if(!go){X.textAlign='center';X.font=`800 18px ${SANS}`;X.fillStyle='#24384d';X.fillText('Yozişni boşlang — poyga boşlanadi!',W/2,py-14)}
  X.textAlign='right';X.font=`800 15px ${SANS}`;X.fillStyle='#24384d';X.fillText(Math.round(i/total*100)+'%',W-18,L1-8);
 }
 G.key=c=>{
  if(G.over)return -1;
  go=true;
  if(c===text[i]){i++;if(i>=total)finishGame(G,true);return 1}
  bad=.3;return 0;
 };
 G.target=()=>text[i]||'';
 G.status=()=>`Poyga: ${Math.round(i/total*100)}%`;
 loop(G,st,upd,drw);
 return G;
};

/* ---------- 5) Raketa ---------- */
// Yer yulduzlar orasida ortda qoladi va kiçrayadi, Oy esa uzoqdan kichkina nuqta bölib boşlanadi,
// raketa egri yöl bilan unga yaqinlaşgan sari kattalaşadi va oxirida Oyga yetib boradi.
GAMES.rocket=function(kn){
 const st=gStage(),G={title:'Raketa',over:false},words=gItems(kn,8),N=words.length;
 const SS=Array.from({length:LITE?45:90},()=>[Math.random(),Math.random(),.7+Math.random()*1.9]);
 let wi=0,pos=0,fuel=70,t=0,alt=0,bad=0,thr=0,on=false,fall=0,lost=false,low=0,trav=0,vs=16;
 const KM=384400,ease=u=>u*u*(3-2*u);
 // yöl geometriyasi: boşlanğich S, Oy M, yetib borişi E; kubik Bezier egri çiziq
 function geo(W,H){
  const S=[W*.15,H*.62],M=[W*(W<600?.68:.76),H*.34],rmax=Math.min(W*.16,H*.25);
  const dm=[Math.cos(.5),-Math.sin(.5)];
  const E=[M[0]-dm[0]*(rmax+44),M[1]-dm[1]*(rmax+44)];
  const dist=Math.hypot(E[0]-S[0],E[1]-S[1]);
  const C1=[S[0]+(E[0]-S[0])*.04,S[1]-H*.36],C2=[E[0]-dm[0]*dist*.4,E[1]-dm[1]*dist*.4];
  return{S,M,rmax,E,C1,C2};
 }
 function bez(g,u){
  const v=1-u,a=v*v*v,b=3*v*v*u,c=3*v*u*u,d=u*u*u;
  const x=a*g.S[0]+b*g.C1[0]+c*g.C2[0]+d*g.E[0],y=a*g.S[1]+b*g.C1[1]+c*g.C2[1]+d*g.E[1];
  const tx=3*(v*v*(g.C1[0]-g.S[0])+2*v*u*(g.C2[0]-g.C1[0])+u*u*(g.E[0]-g.C2[0]));
  const ty=3*(v*v*(g.C1[1]-g.S[1])+2*v*u*(g.C2[1]-g.C1[1])+u*u*(g.E[1]-g.C2[1]));
  return{x,y,a:Math.atan2(tx,-ty)};
 }
 function upd(dt){
  t+=dt;bad=Math.max(0,bad-dt);thr=Math.max(0,thr-dt*2.2);
  const prog=(wi+(wi<N?pos/words[wi].length:0))/N;alt+=(prog-alt)*Math.min(1,dt*4);
  vs+=(((on&&!lost)?55:16)+300*thr-vs)*Math.min(1,dt*5);trav+=vs*dt;
  if(G.over){if(lost)fall+=dt*160;return}
  if(on){
   fuel-=(5+3*wi/N)*dt;
   if(fuel<14){low-=dt;if(low<=0){low=.7;snd.fuel()}}
   if(fuel<=0){fuel=0;lost=true;finishGame(G,false,'Yoqilği tugadi — ENTER bosing')}
  }
 }
 function drw(X,W,H){
  sky(X,W,H,'#070a24','#26286e');
  // yulduzlar raketa uçgan sari çapga oqib ötadi (tezlikka qarab çizig'i uzayadi)
  X.fillStyle='#fff';
  const ln=clamp(vs*.03,0,22);
  for(const s of SS){
   const x=(((s[0]*W-trav*s[2]*.55)%W)+W)%W,y=(s[1]*H+trav*s[2]*.1)%H;
   X.globalAlpha=.35+s[2]*.22;X.fillRect(x,y,s[2]+ln*s[2]*.5,s[2]);
  }
  X.globalAlpha=1;
  const g=geo(W,H),e=ease(clamp(alt,0,1));
  // Yer: boşida katta, uçgan sari kiçrayib ortda qoladi
  const er=lerp(H*.32,H*.05,e),ex=lerp(W*.07,-W*.04,e),ey=lerp(H*1.02,H*1.3,e);
  if(ey-er<H){
   X.save();X.beginPath();X.arc(ex,ey,er,0,TAU);X.fillStyle='#2f78d0';X.fill();X.clip();
   X.fillStyle='#3fae5a';
   [[-.3,-.5,.5,.3],[.35,-.2,.4,.28],[-.1,.1,.3,.2]].forEach(([a,b,c,d])=>{X.beginPath();X.ellipse(ex+a*er,ey+b*er,c*er,d*er,.4,0,TAU);X.fill()});
   X.restore();
   X.strokeStyle='rgba(140,200,255,.45)';X.lineWidth=3;X.beginPath();X.arc(ex,ey,er+1.5,0,TAU);X.stroke();
  }
  // Oy: uzoqda nuqta, yaqinlaşgan sari kattalaşadi
  const mr=lerp(6,g.rmax,Math.pow(clamp(alt,0,1),1.5)),mx=g.M[0],my=g.M[1];
  X.fillStyle='rgba(255,250,220,.08)';X.beginPath();X.arc(mx,my,mr*1.35,0,TAU);X.fill();
  X.fillStyle='#e9e6d6';X.beginPath();X.arc(mx,my,mr,0,TAU);X.fill();
  if(mr>14){X.fillStyle='#cfcbb6';[[-.3,-.2,.2],[.25,.15,.26],[-.1,.4,.14],[.45,-.35,.12]].forEach(([a,b,c])=>{X.beginPath();X.arc(mx+a*mr,my+b*mr,c*mr,0,TAU);X.fill()})}
  // raketa: egri yöl bö'yiça, burni yöl tomonga qaraydi
  const p=bez(g,clamp(alt,0,1)),hov=on?0:Math.sin(t*3)*3;
  const sh=bad>0?Math.sin(t*90)*3:0;
  X.save();X.translate(p.x+sh,p.y+hov+fall);X.rotate(p.a+(lost?Math.min(1.4,fall/150):0));
  const fl=(on&&!lost?1:.3)*(26+Math.sin(t*40)*8+thr*22);
  X.fillStyle='#ff9433';X.beginPath();X.moveTo(-9,22);X.lineTo(0,22+fl);X.lineTo(9,22);X.fill();
  X.fillStyle='#ffe066';X.beginPath();X.moveTo(-5,22);X.lineTo(0,22+fl*.6);X.lineTo(5,22);X.fill();
  X.fillStyle='#ff5a5f';X.beginPath();X.moveTo(-14,10);X.lineTo(-27,30);X.lineTo(-12,24);X.fill();X.beginPath();X.moveTo(14,10);X.lineTo(27,30);X.lineTo(12,24);X.fill();
  X.fillStyle='#f3f7fb';X.strokeStyle='#8aa0b6';X.lineWidth=2;
  X.beginPath();X.moveTo(0,-44);X.quadraticCurveTo(17,-22,15,22);X.lineTo(-15,22);X.quadraticCurveTo(-17,-22,0,-44);X.fill();X.stroke();
  X.fillStyle='#ff5a5f';X.beginPath();X.moveTo(0,-44);X.quadraticCurveTo(10,-34,12,-26);X.lineTo(-12,-26);X.quadraticCurveTo(-10,-34,0,-44);X.fill();
  X.fillStyle='#5db8f0';X.beginPath();X.arc(0,-8,7,0,TAU);X.fill();X.strokeStyle='#8aa0b6';X.stroke();
  X.restore();
  // yoqilği
  const bx=W-34,by=70,bh=H-110;
  rr(X,bx,by,18,bh,9);X.fillStyle='rgba(255,255,255,.2)';X.fill();
  const fh=bh*fuel/100;if(fh>2){rr(X,bx,by+bh-fh,18,fh,9);X.fillStyle=fuel>40?'#3dbb5a':fuel>18?'#f2bd00':'#ff5a5f';X.fill()}
  X.font=`800 13px ${SANS}`;X.textAlign='center';X.textBaseline='alphabetic';X.fillStyle='#fff';X.fillText('Yoqilği',bx+9,by-8);
  // Oygacha masofa
  const rem=Math.round(KM*(1-clamp(alt,0,1))/100)*100,txt=alt>.995?'Oyga yetdik! 🌙':'Oygacha: '+String(rem).replace(/\B(?=(\d{3})+$)/g,' ')+' km';
  X.textAlign='left';X.font=`800 14px ${SANS}`;X.lineWidth=3;X.strokeStyle='rgba(7,10,36,.7)';X.strokeText(txt,12,H-10);X.fillStyle='#cfe6ff';X.fillText(txt,12,H-10);
  // söz
  const fs=clamp(W/17,30,52),cy=H*.78;
  if(wi<N){
   drawWord(X,words[wi],W*.5,cy,fs,pos,bad>0);
   if(wi+1<N){X.font=`700 18px ${MONO}`;X.textAlign='center';X.fillStyle='rgba(255,255,255,.55)';X.fillText('keyingi: '+words[wi+1],W*.5,cy+fs*.62+20)}
  }
  if(!on){X.textAlign='center';X.font=`800 18px ${SANS}`;X.fillStyle='#ffe066';X.fillText('Yozişni boşlang — raketa uçadi!',W*.5,cy-fs*.62-14)}
  hud(X,W,0,0,(wi+(wi<N?pos/words[wi].length:0))/N,wi+' / '+N);
 }
 G.key=c=>{
  if(G.over||wi>=N)return -1;
  on=true;
  const w=words[wi];
  if(c===w[pos]){
   pos++;fuel=Math.min(100,fuel+3);thr=1;
   if(pos>=w.length){wi++;pos=0;fuel=Math.min(100,fuel+8);snd.boost();if(wi>=N){finishGame(G,true)}}
   return 1;
  }
  bad=.25;fuel=Math.max(1,fuel-3);return 0;
 };
 G.target=()=>wi<N?words[wi][pos]:'';
 G.status=()=>`Söz ${Math.min(wi+1,N)} / ${N}`;
 loop(G,st,upd,drw);
 return G;
};
