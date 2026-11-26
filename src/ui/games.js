/* ============================================================
   games.js — yozişni qiziqarli qiladigan öyinlar (dars oxirida / takrorlaşda).
   GAMES[0] — Sakrovçi robot : platformadagi sözni yozsangiz robot keyingisiga sakraydi
   GAMES[1] — Yağin           : tüşayotgan sözlarni yerga tegmasdan yozing (3 jon)
   GAMES[2] — Poyga           : matnni tez yozib, boy mașinadan oldin finişga yetib keling
   Har bir öyin obyekt qaytaradi:
     title, target() — keyingi kerakli belgi, key(c) — 1 töğri / 0 xato / -1 e'tiborsiz,
     status() — yuqoridagi yozuv, stop() — taymerlarni tözatiş, over
   Depends: screens.js (S, CL, R, sh, paint, gameEnd), sounds.js (snd)
   ============================================================ */
const GAMES=[];

// Öyin sözlari: örganilgan harflardan. Söz yetarli bölmasa — harf birikmalari (masalan: fjf)
function gWords(n,lo,hi){
 const pool=(CL.cw||[]).filter(w=>!/\s/.test(w)&&w.length>=lo&&w.length<=hi);
 if(pool.length<4){
  const K=(CL.lk&&CL.lk.length?CL.lk:['f','j']).filter(c=>c.length==1&&codeOf[c.toLowerCase()]);
  return Array.from({length:n},()=>Array.from({length:lo+Math.random()*(hi-lo+1)|0},()=>R(K)).join(''));
 }
 const out=[];let src=[];
 while(out.length<n){if(!src.length)src=sh(pool);out.push(src.pop())}
 return out;
}
function amazing(txt){
 const st=$('#gm .gs');if(!st)return;
 const d=document.createElement('div');d.className='amz';d.innerHTML=`<i></i><b>${txt}</b>`;st.appendChild(d);
}
const ROBOT=`<svg viewBox="0 0 44 52" width="44" height="52"><path d="M22 12V5" stroke="#3a4a5c" stroke-width="2.4" stroke-linecap="round"/><circle cx="22" cy="4.5" r="3.6" fill="#ffc933" stroke="#e0a200" stroke-width="1.4"/><rect x="5" y="12" width="34" height="28" rx="9" fill="#2f8fe0" stroke="#1d6fb5" stroke-width="2"/><rect x="9" y="17" width="26" height="17" rx="6" fill="#d8f0ff"/><circle cx="17" cy="25" r="2.4" fill="#24384d"/><circle cx="27" cy="25" r="2.4" fill="#24384d"/><path d="M18 30q4 3 8 0" stroke="#24384d" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="11" y="40" width="8" height="9" rx="3" fill="#1d6fb5"/><rect x="25" y="40" width="8" height="9" rx="3" fill="#1d6fb5"/></svg>`;
const CAR=c=>`<svg viewBox="0 0 64 36" width="64" height="36"><path d="M4 26q0-8 8-9l10-8q3-2 8-2h12q6 0 10 4l6 6q6 1 6 9v2H4z" fill="${c}" stroke="#24384d" stroke-width="2" stroke-linejoin="round"/><path d="M24 11h10v8H18z" fill="#d8f0ff" stroke="#24384d" stroke-width="1.6"/><path d="M37 11h6l6 8H37z" fill="#d8f0ff" stroke="#24384d" stroke-width="1.6"/><circle cx="17" cy="29" r="6" fill="#24384d"/><circle cx="17" cy="29" r="2.4" fill="#cfd8e0"/><circle cx="48" cy="29" r="6" fill="#24384d"/><circle cx="48" cy="29" r="2.4" fill="#cfd8e0"/></svg>`;

/* ---------- 1) Sakrovçi robot ---------- */
GAMES[0]=function(){
 const gm=$('#gm'),N=6,SH=330,SP=92,words=gWords(N,2,5);
 const XS=[.12,.50,.18,.54,.14,.52,.30];
 let idx=0,pos=0,raf=0,jt=0,rx=0,ry=0,jx0=0,jy0=0,jx1=0,jy1=0;
 const G={title:'Sakrovçi robot',over:false};
 let h='';
 for(let i=0;i<=N;i++)h+=`<div class="pl" id="pl${i}" style="top:${40+(N-i)*SP}px;left:${XS[i]*100}%"><div class="wd" id="wd${i}">${i<N?[...words[i]].map(c=>`<span>${c}</span>`).join(''):'⭐'}</div></div>`;
 gm.innerHTML=`<div class="gs"><div class="gc c1"></div><div class="gc c2"></div><div class="hill"></div><div class="gw" id="gw">${h}<div class="rb" id="rb">${ROBOT}</div></div></div>`;
 const gw=$('#gw'),rb=$('#rb');
 const spot=i=>{const p=$('#pl'+i);return[p.offsetLeft+30,p.offsetTop]};
 const place=()=>{rb.style.transform=`translate(${rx-22}px,${ry-50}px)`};
 const cam=i=>{gw.style.transform=`translateY(${SH-100-(40+(N-i)*SP)}px)`};
 const mark=()=>{const w=$('#wd'+idx);if(!w||idx>=N)return;[...w.children].forEach((s,j)=>s.className=j<pos?'ok':j==pos?'cur':'')};
 [rx,ry]=spot(0);place();cam(0);mark();
 function loop(ts){
  raf=requestAnimationFrame(loop);
  if(jt){
   const t=Math.min(1,(ts-jt)/520),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
   rx=jx0+(jx1-jx0)*e;ry=jy0+(jy1-jy0)*t-Math.sin(Math.PI*t)*70;place();
   if(t>=1){jt=0;snd.land()}
  }
 }
 raf=requestAnimationFrame(loop);
 G.key=c=>{
  if(G.over)return -1;
  const w=words[idx];
  if(c===w[pos]){
   pos++;mark();
   if(pos>=w.length){
    snd.word();idx++;pos=0;
    const s=$('#wd'+(idx-1));if(s)[...s.children].forEach(x=>x.className='ok');
    [jx0,jy0]=[rx,ry];[jx1,jy1]=spot(idx);jt=performance.now();snd.jump();cam(idx);
    if(idx>=N){G.over=true;setTimeout(()=>{amazing(R(['Ajoyib!','Zör!','Barakalla!']));snd.amazing();gameEnd(true)},700)}
    else mark();
   }
   return 1;
  }
  const s=$('#wd'+idx)?.children[pos];if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),250)}
  return 0;
 };
 G.target=()=>idx<N?words[idx][pos]:'';
 G.status=()=>`Platforma ${Math.min(idx+1,N)} / ${N}`;
 G.stop=()=>cancelAnimationFrame(raf);
 return G;
};

/* ---------- 2) Yağin (tüşayotgan sözlar) ---------- */
GAMES[1]=function(){
 const gm=$('#gm'),TOT=10,words=gWords(TOT,3,6);
 let lives=3,spawned=0,done=0,miss=0,pos=0,raf=0,last=0,since=99,q=[];
 const G={title:'Yağin',over:false};
 gm.innerHTML=`<div class="gs rain" id="g1"><div class="gc c1"></div><div class="gc c2"></div><div class="grass"></div></div>`;
 const st=$('#g1');
 const mark=()=>q.forEach((d,k)=>{d.el.className='dr'+(k==0?' cur':'');[...d.el.children].forEach((s,j)=>s.className=k==0&&j<pos?'ok':'')});
 function spawn(){
  const w=words[spawned++],el=document.createElement('div');
  el.innerHTML=[...w].map(c=>`<span>${c}</span>`).join('');
  st.appendChild(el);
  const x=8+Math.random()*(Math.max(10,st.clientWidth-el.offsetWidth-16));
  el.style.left=x+'px';
  const d={w,el,y:-40};q.push(d);mark();paint();
 }
 function end(win){
  if(G.over)return;G.over=true;
  setTimeout(()=>{
   if(win){amazing(R(['Ajoyib!','Zör!','Barakalla!']));snd.amazing()}
   gameEnd(win);
  },400);
 }
 function loop(ts){
  raf=requestAnimationFrame(loop);
  const dt=Math.min(.1,(ts-(last||ts))/1000);last=ts;
  if(G.over)return;
  since+=dt;
  if(spawned<TOT&&since>=Math.max(1.8,3-done*.1)){since=0;spawn()}
  const v=34+done*2.5,ground=st.clientHeight-34;
  for(const d of q){d.y+=v*dt;d.el.style.transform=`translateY(${d.y}px)`}
  if(q.length&&q[0].y+q[0].el.offsetHeight>=ground){
   const d=q.shift();d.el.remove();pos=0;lives--;miss++;snd.miss();
   st.classList.remove('hit');void st.offsetWidth;st.classList.add('hit');
   mark();paint();
  }
  if(lives<=0)end(false);
  else if(spawned>=TOT&&!q.length)end(true);
 }
 raf=requestAnimationFrame(loop);
 G.key=c=>{
  if(G.over||!q.length)return -1;
  const d=q[0];
  if(c===d.w[pos]){
   pos++;
   if(pos>=d.w.length){
    q.shift();d.el.classList.add('pop');setTimeout(()=>d.el.remove(),260);
    pos=0;done++;snd.pop();
    if(spawned>=TOT&&!q.length)end(true);
    else if(!q.length)since=99; // keyingi so'z darhol tüşsin
   }
   mark();return 1;
  }
  d.el.classList.remove('shk');void d.el.offsetWidth;d.el.classList.add('shk');
  return 0;
 };
 G.target=()=>q.length?q[0].w[pos]:'';
 G.status=()=>`${'❤️'.repeat(Math.max(0,lives))}${'🖤'.repeat(3-Math.max(0,lives))} · ${done} / ${TOT}`;
 G.stop=()=>cancelAnimationFrame(raf);
 return G;
};

/* ---------- 3) Poyga (boy mașina bilan) ---------- */
GAMES[2]=function(){
 const gm=$('#gm'),words=gWords(10,3,6),text=words.join(' '),total=text.length;
 let i=0,bad=false,started=0,bot=0,raf=0,last=0;
 const G={title:'Poyga',over:false};
 gm.innerHTML=`<div class="gs race"><div class="trk"><div class="lane"><div class="cr" id="c1">${CAR('#2f8fe0')}</div></div><div class="lane"><div class="cr" id="c2">${CAR('#ff5a5f')}</div></div><div class="fl">🏁</div></div><div class="rtx" id="rtx"></div></div>`;
 const c1=$('#c1'),c2=$('#c2'),rtx=$('#rtx');
 const pos=(el,p)=>{el.style.left=`calc((100% - 64px) * ${Math.min(1,p).toFixed(4)})`};
 function draw(){
  const a=Math.max(0,i-20),seg=text.slice(a,a+90);
  rtx.innerHTML=[...seg].map((ch,j)=>{const x=a+j;return `<span class="${x<i?'ok':x==i?(bad?'cur bad':'cur'):''}">${ch}</span>`}).join('');
  pos(c1,i/total);
 }
 draw();pos(c2,0);
 function end(win){
  if(G.over)return;G.over=true;
  setTimeout(()=>{
   if(win){amazing('Yutdingiz!');snd.amazing()}else amazing('Boy yutdi');
   gameEnd(win);
  },400);
 }
 function loop(ts){
  raf=requestAnimationFrame(loop);
  const dt=Math.min(.1,(ts-(last||ts))/1000);last=ts;
  if(G.over||!started)return;
  // boy mașina: ≈ 17 söz/daq, sal tebranib turadi (1.45 belgi/s)
  bot+=dt*(1.45+Math.sin(ts/900)*.25);
  pos(c2,bot/total);
  if(bot>=total)end(false);
 }
 raf=requestAnimationFrame(loop);
 G.key=c=>{
  if(G.over)return -1;
  started=1;
  if(c===text[i]){bad=false;i++;draw();if(i>=total)end(true);return 1}
  bad=true;draw();return 0;
 };
 G.target=()=>text[i]||'';
 G.status=()=>`Poyga: ${Math.round(i/total*100)}%`;
 G.stop=()=>cancelAnimationFrame(raf);
 return G;
};
