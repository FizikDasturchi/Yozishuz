/* ============================================================
   games.js — yozişni qiziqarli qiladigan öyinlar (CANVAS, 60 kadr/s).
   Harf öyinlari (söz kerak emas):
     tiles   — Harf plitkalari (Piano Tiles): har bir harf klaviaturadagi öz ustuni bö'yiça
               yuqoridan yakka-yakka tüşadi; eng pastdagisini bosing.
     balloon — Sharlar: harfli sharlar uçadi, töğri harfni bosib portlating.
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
// Harf öyinlari uçun ketma-ketlik: yangi harflar ko'proq, ketma-ket bir xil harf kam
function gSeq(kn,n){
 const all=[...new Set(kn||[])].filter(c=>c.length==1&&c!==' '&&codeOf[c.toLowerCase()]);
 if(!all.length)all.push('f','j');
 const nw=all.slice(-3),bag=[];
 all.forEach(c=>{for(let i=0;i<(nw.includes(c)?3:1);i++)bag.push(c)});
 const out=[];let pv='';
 while(out.length<n){const c=R(bag);if(all.length>1&&c===pv&&Math.random()<.9)continue;out.push(c);pv=c}
 return out;
}

/* ---------- umumiy: canvas, sikl, zarralar, e'lon ---------- */
function stage(){
 const gm=$('#gm');gm.innerHTML='';
 const H=clamp(Math.round(innerHeight*.44),270,400);
 const cv=document.createElement('canvas');cv.style.height=H+'px';gm.appendChild(cv);
 const X=cv.getContext('2d'),st={cv,X,W:0,H,fx:[],tx:[]};
 const fit=()=>{const d=Math.min(2,window.devicePixelRatio||1),W=gm.clientWidth||900;st.W=W;cv.width=Math.round(W*d);cv.height=Math.round(H*d);X.setTransform(d,0,0,d,0,0)};
 fit();addEventListener('resize',fit);
 st.off=()=>removeEventListener('resize',fit);
 return st;
}
function loop(G,st,upd,drw){
 let raf=0,last=0;
 const f=ts=>{
  raf=requestAnimationFrame(f);
  const dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;
  upd(dt);fxStep(st,dt);drw(st.X,st.W,st.H);fxDraw(st);
 };
 raf=requestAnimationFrame(f);
 G.stop=()=>{cancelAnimationFrame(raf);st.off()};
}
function burst(st,x,y,c,n){
 n=n||14;if(st.fx.length>90)return;
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
  if(win){banner(R(WINS),'win');snd.amazing()}
  else{banner('Yutqazdingiz','lose',sub||'ENTER — qayta urinib körişh');snd.lose()}
  gameEnd(win);
 },win?350:200);
}
// Matnni belgi-belgi çizadi (so'z yozilgan/joriy/qolgan ranglari bilan)
function drawWord(X,w,cx,cy,size,pos,bad,dark){
 X.font=`800 ${size}px ${MONO}`;X.textBaseline='middle';X.textAlign='left';
 const cw=X.measureText('M').width*1.12,x0=cx-w.length*cw/2;
 for(let j=0;j<w.length;j++){
  const x=x0+j*cw,cur=j==pos;
  if(cur){rr(X,x-2,cy-size*.62,cw+2,size*1.24,8);X.fillStyle=bad?'rgba(255,90,95,.85)':'rgba(255,224,102,.95)';X.fill()}
  X.lineWidth=5;X.lineJoin='round';
  if(!dark||!cur){X.strokeStyle='rgba(20,30,60,.75)';X.strokeText(w[j],x+cw*.1,cy+1)}
  X.fillStyle=cur?'#24384d':j<pos?'#58e07a':'#fff';X.fillText(w[j],x+cw*.1,cy+1);
 }
}

/* ---------- 1) Harf plitkalari (Piano Tiles) ---------- */
GAMES.tiles=function(kn){
 const st=stage(),G={title:'Harf plitkalari',over:false},N=24,seq=gSeq(kn,N);
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

/* ---------- 2) Sharlar ---------- */
GAMES.balloon=function(kn){
 const st=stage(),G={title:'Sharlar',over:false},N=20,seq=gSeq(kn,N);
 const COL=['#ff5d85','#ff9433','#f2bd00','#3dbb5a','#1fb0d6','#4a86ff','#9b5cff','#ec4fbe'];
 let bl=[],sp=0,done=0,lives=3,t=0,since=9,flash=0;
 const rad=()=>clamp(st.W/21,27,38);
 function spawn(){
  const r=rad();let x=0,ok=false;
  for(let i=0;i<10&&!ok;i++){x=r+14+Math.random()*(st.W-2*r-28);ok=bl.every(b=>Math.abs(b.x-x)>r*2.4||b.y<st.H-r*5)}
  bl.push({ch:seq[sp],x,y:st.H+r*1.5,ph:Math.random()*6,c:COL[sp%COL.length]});sp++;
 }
 function upd(dt){
  t+=dt;flash=Math.max(0,flash-dt*3);
  if(G.over)return;
  since+=dt;
  if(sp<N&&bl.length<3&&since>=Math.max(.9,1.9-sp*.045)){since=0;spawn()}
  const v=st.H*(.15+.1*sp/N),r=rad();
  for(const b of bl)b.y-=v*dt;
  for(let i=bl.length-1;i>=0;i--){const b=bl[i];
   if(b.y-r*1.3<=0){bl.splice(i,1);lives--;flash=1;snd.miss();burst(st,b.x,10,'#ff5a5f',10);pop(st,b.x,40,'−♥','#ff8a8e');if(lives<=0)finishGame(G,false)}}
 }
 const top=()=>bl.reduce((a,b)=>!a||b.y<a.y?b:a,null);
 function drw(X,W,H){
  sky(X,W,H,'#6cc4f5','#e4f6ff');clouds(X,W,H,t,0);
  X.fillStyle='#8fd67a';X.beginPath();X.ellipse(W*.3,H+60,W*.7,90,0,0,TAU);X.ellipse(W*.85,H+70,W*.5,80,0,0,TAU);X.fill();
  const r=rad(),tp=top();
  for(const b of bl){
   const x=b.x+Math.sin(t*1.7+b.ph)*10,y=b.y,cur=b===tp;
   X.strokeStyle='rgba(60,80,100,.55)';X.lineWidth=1.5;X.beginPath();X.moveTo(x,y+r*1.18);X.quadraticCurveTo(x+Math.sin(t*2+b.ph)*8,y+r*1.9,x,y+r*2.5);X.stroke();
   if(cur){X.fillStyle='rgba(255,255,255,.55)';X.beginPath();X.ellipse(x,y,r*1.3,r*1.5,0,0,TAU);X.fill()}
   X.fillStyle=b.c;X.beginPath();X.ellipse(x,y,r,r*1.18,0,0,TAU);X.fill();
   X.beginPath();X.moveTo(x,y+r*1.12);X.lineTo(x-6,y+r*1.38);X.lineTo(x+6,y+r*1.38);X.closePath();X.fill();
   X.fillStyle='rgba(255,255,255,.35)';X.beginPath();X.ellipse(x-r*.36,y-r*.42,r*.2,r*.34,-.5,0,TAU);X.fill();
   X.font=`800 ${r*1.05}px ${MONO}`;X.textAlign='center';X.textBaseline='middle';X.lineWidth=4;X.strokeStyle='rgba(20,30,60,.45)';X.strokeText(b.ch,x,y+2);X.fillStyle='#fff';X.fillText(b.ch,x,y+2);
  }
  if(flash>0){X.fillStyle=`rgba(255,90,95,${flash*.18})`;X.fillRect(0,0,W,H)}
  hud(X,W,lives,3,done/N,done+' / '+N);
 }
 G.key=c=>{
  if(G.over)return -1;
  if(!bl.length)return -1;
  let b=null;for(const q of bl)if(q.ch===c&&(!b||q.y<b.y))b=q;
  if(!b)return 0;
  bl.splice(bl.indexOf(b),1);done++;snd.pop();
  burst(st,b.x,b.y,b.c,16);pop(st,b.x,b.y,'+1','#fff');
  if(done>=N)finishGame(G,true);
  return 1;
 };
 G.target=()=>{const b=top();return b?b.ch:''};
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
GAMES.robot=function(kn){
 const st=stage(),G={title:'Sakrovçi robot',over:false},words=gWords(kn,6),N=words.length,SP=98;
 const PX=[.14,.55,.2,.6,.12,.52,.3];
 let idx=0,pos=0,t=0,cam=0,jm=null,rx=0,ry=0,bad=0,sq=1,pf=0;
 const pw=()=>clamp(st.W*.3,150,250);
 const cxOf=i=>{const w=pw();return w/2+12+PX[i%7]*(st.W-w-24)};
 const syOf=i=>cam-i*SP;
 const camT=()=>st.H*.74+pf*SP;
 cam=camT();rx=cxOf(0);ry=0;
 function upd(dt){
  t+=dt;bad=Math.max(0,bad-dt);
  cam+=(camT()-cam)*Math.min(1,dt*5);
  if(jm){
   jm.t+=dt;const u=Math.min(1,jm.t/.55),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
   rx=lerp(jm.x0,jm.x1,e);ry=lerp(jm.y0,jm.y1,u)-Math.sin(Math.PI*u)*72;pf=lerp(jm.a,jm.b,u);
   sq=u<.12?lerp(1,.8,u/.12):u>.88?lerp(1.12,1,(u-.88)/.12):1.1;
   if(u>=1){jm=null;sq=.78;snd.land();pf=idx;burst(st,rx,cam+ry,'#fff6c8',8);
    if(idx>=N)finishGame(G,true)}
  }else sq+=(1-sq)*Math.min(1,dt*10);
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
   if(i==N){X.font='36px sans-serif';X.textAlign='center';X.textBaseline='alphabetic';X.fillText('⭐',cxOf(i),y-8)}
   else if(i>=idx)drawWord(X,words[i],cxOf(i),y-30,i==idx?clamp(W/26,22,30):20,i==idx?pos:-1,bad>0);
   else drawWord(X,words[i],cxOf(i),y-30,20,words[i].length,false);
  }
  drawRobot(X,rx,cam+ry,clamp(2-sq,.85,1.2),sq,t);
  hud(X,W,0,0,idx/N,idx+' / '+N);
 }
 G.key=c=>{
  if(G.over||jm||idx>=N)return -1;
  const w=words[idx];
  if(c===w[pos]){
   pos++;
   if(pos>=w.length){
    snd.word();idx++;pos=0;
    jm={t:0,x0:rx,y0:ry,x1:cxOf(idx),y1:-idx*SP,a:idx-1,b:idx};snd.jump();
   }
   return 1;
  }
  bad=.3;return 0;
 };
 G.target=()=>idx<N&&!jm?words[idx][pos]:'';
 G.status=()=>`Platforma ${Math.min(idx+1,N)} / ${N}`;
 loop(G,st,upd,drw);
 return G;
};

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
 const st=stage(),G={title:'Poyga',over:false},words=gWords(kn,8),text=words.join(' '),total=text.length;
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
GAMES.rocket=function(kn){
 const st=stage(),G={title:'Raketa',over:false},words=gWords(kn,8),N=words.length;
 let wi=0,pos=0,fuel=70,t=0,alt=0,bad=0,thr=0,on=false,fall=0,lost=false,low=0;
 function upd(dt){
  t+=dt;bad=Math.max(0,bad-dt);thr=Math.max(0,thr-dt*2.2);
  const prog=(wi+(wi<N?pos/words[wi].length:0))/N;alt+=(prog-alt)*Math.min(1,dt*4);
  if(G.over){if(lost)fall+=dt*160;return}
  if(on){
   fuel-=(5+3*wi/N)*dt;
   if(fuel<14){low-=dt;if(low<=0){low=.7;snd.fuel()}}
   if(fuel<=0){fuel=0;lost=true;finishGame(G,false,'Yoqilği tugadi — ENTER bosing')}
  }
 }
 function drw(X,W,H){
  sky(X,W,H,'#0a0e2c','#2a2c78');
  const sp=30+330*thr+(on?50:0);
  X.fillStyle='#fff';
  for(const s of STARS){const y=(s[1]*H+t*sp*s[2]*.4)%H;X.globalAlpha=.4+s[2]*.2;X.fillRect(s[0]*W,y,s[2],s[2]+thr*s[2]*5)}
  X.globalAlpha=1;
  const mr=34+alt*26,mx=W*.82,my=58+(1-alt)*10;
  X.fillStyle='#e9e6d6';X.beginPath();X.arc(mx,my,mr,0,TAU);X.fill();
  X.fillStyle='#cfcbb6';[[-.3,-.2,.2],[.25,.15,.26],[-.1,.4,.14]].forEach(([a,b,c])=>{X.beginPath();X.arc(mx+a*mr,my+b*mr,c*mr,0,TAU);X.fill()});
  // raketa
  const rx=W*.2,ry=H*.74-alt*H*.42+fall,sh=bad>0?Math.sin(t*90)*3:0;
  X.save();X.translate(rx+sh,ry);if(lost)X.rotate(Math.min(1.2,fall/160));
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
  // söz
  if(wi<N){
   drawWord(X,words[wi],W*.52,H*.46,clamp(W/17,30,52),pos,bad>0);
   if(wi+1<N){X.font=`700 18px ${MONO}`;X.textAlign='center';X.fillStyle='rgba(255,255,255,.55)';X.fillText('keyingi: '+words[wi+1],W*.52,H*.46+54)}
  }
  if(!on){X.textAlign='center';X.font=`800 18px ${SANS}`;X.fillStyle='#ffe066';X.fillText('Yozişni boşlang — raketa uçadi!',W*.52,H*.46-70)}
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
