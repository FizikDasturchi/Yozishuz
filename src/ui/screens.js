/* ============================================================
   screens.js — ekranlar: bosh sahifa, maşq, natija.
   Provides: S, CL, CI, show, home, begin, problem, exit, start, paint, finish, adv, R, sh, weak, gen
   Depends: barça oldingi fayllar
   ============================================================ */
let S={},CL,CI;  // S - joriy maşq holati, CL - joriy dars, CI - joriy ekran
const R=a=>a[Math.random()*a.length|0];
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const weak=()=>Object.entries(P.keys).filter(([c,v])=>v.t>=5&&v.e/v.t>.05).sort((a,b)=>b[1].e/b[1].t-a[1].e/a[1].t).slice(0,3).map(x=>x[0]);

// Ekranlarni almaştiriş: bir paytda faqat bittasi körinadi
function show(v){curV=v=='pr'?curV:v;if(v!='pr'){try{sessionStorage.setItem('yozish.v',v)}catch(e){}}   // F5 qilinganda şu bölimda qolişi uçun
 $('#hd').hidden=v=='pr';['home','tests','add','cont','usr'].forEach(x=>$('#'+x).hidden=x!=v);$('#pr').hidden=v!='pr';$('#ft').hidden=v=='pr';
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));
 window.scrollTo(0,0)}

/* ---------- Bosh sahifa ---------- */
function tree(){
 const g=Math.min(1,P.pts/MAXP),h=10+g*66,top=92-h,w=2+g*6,cr=g*30;
 let s=`<svg viewBox="0 0 120 110" width="112" role="img" aria-label="Nihol"><circle cx="96" cy="20" r="9" fill="#ffd54a"/><ellipse cx="60" cy="106" rx="58" ry="16" fill="#8fd67a"/>`;
 if(g<0.03)s+=`<path d="M60 96 q-1 -10 -8 -13 M60 96 q1 -12 9 -14" stroke="#3fa34d" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 else{s+=`<path d="M60 96 Q${60+g*2} ${96-h/2} 60 ${top+5}" stroke="#8b5a2b" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const n=Math.round(g*14)+2;
  for(let i=0;i<n;i++){const a=i*2.4,r=cr*Math.sqrt((i+1)/n);s+=`<circle cx="${60+Math.cos(a)*r}" cy="${top+Math.sin(a)*r*.8}" r="${3+g*6}" fill="#3fa34d" fill-opacity=".9"/>`}}
 return s+'</svg>';
}
function head(){
 const stg=stage(),nx=TH[stg],dd=P.day[today()]||0,aw=avgWpm(),aa=avgAcc();
 $('#tr').innerHTML=tree()+`<div class="tt"><b>Nihol (${stg}/5)</b><br>Ball: ${P.pts}<br>${nx!=null?'Keyingi bosqiçgaça: '+(nx-P.pts):'Eng yuqori bosqiç!'}</div>`;
 $('#st').innerHTML=`<div class="chip"><b>★ ${starsTot()}</b>yulduz</div><div class="chip"><b>${aw==null?'--':aw}</b>söz/daq (örtaça)</div><div class="chip"><b>${aa==null?'--':aa+'%'}</b>aniqlik (örtaça)</div>`
  +`<div class="chip wide">Kunlik maqsad: <b style="display:inline;font-size:18px">${fmt(dd)}</b> / ${fmt(GOAL)}<div class="pb"><i style="width:${Math.min(100,dd/GOAL*100)}%"></i></div>Keyingi ekranga ötiş uçun: aniqlik kamida <b style="display:inline;font-size:15px">${PASS}%</b></div>`;
}
function home(){
 show('home');head();
 const w=weak();
 $('#wk').innerHTML=w.length?`<button class="pri" id="wkb">🎯 Problem harflar: ${w.join(' ')} — maşq qilamiz</button>`:'';
 const cur=ALL.findIndex((l,i)=>opened(i)&&!full(l));
 let n=0;
 $('#units').innerHTML=UN.map((u,ui)=>`<div class="uh u${ui%5}">${u.t}</div>`+u.ls.map(l=>{
  const i=n++,o=opened(i),d=dn(l);
  return `<div class="ls ${i==cur?'cur':''} ${o?'':'lock'}" id="L${i}"><div class="lt"><span class="no">${i+1}</span>${l.t}${l.p?' · 2:00':l.a?' · 1:00':''}${starsOfLesson(l)?`<span class="lst">★ ${starsOfLesson(l)}</span>`:''}<button class="${i==cur?'pri':''}" data-i="${i}" ${o?'':'disabled'}>${!o?'🔒':d==0?'Boşlaş':d<l.sc.length?'Davom etiş':'Qayta'}</button></div><div class="sg">${l.sc.map((_,j)=>`<i class="${j<d?'f':''}"></i>`).join('')}</div></div>`}).join('')).join('');
}

/* ---------- Maşq ---------- */
// Matn: har bir söz (iloji bö'lsa) faqat bir marta; bank kam bölsa — ençi bilan 2 marta
function gen(){
 const s=CL.sc[CI],t=s.t,K=CL.k||[];
 if(t=='T')return s.mk();   // Sinov: matn tests.js da tuziladi
 if(t=='d')return Array.from({length:8},(_,i)=>i&&s.pv.length&&Math.random()<.35?R(s.pv):s.c).join('');
 if(t=='g'){const pool=[...K,...K,...CL.lk.filter(c=>!K.includes(c)).slice(-4)];
  // uzatiş maşqi: yangi harf + shu barmoq bosadigan boşqa harf (masalan: faf)
  const reach=[];K.forEach(c=>{const f=fing(codeOf[c.toLowerCase()]);if(f)CL.lk.forEach(n=>{if(n!==c&&codeOf[n.toLowerCase()]&&fing(codeOf[n.toLowerCase()])===f)reach.push(c+n+c)})});
  const gs=Array.from({length:8},()=>Array.from({length:2+Math.random()*2|0},()=>R(pool)).join(''));
  if(reach.length)for(let i=0;i<3;i++)gs[i*2+1]=R(reach);
  return gs.join(' ')}
 if(t=='w')return wordsOf(CL.w,8).join(' ');
 if(t=='m')return wordsOf(CL.cw,10).join(' ');
 let p=CL.cw;
 if(t=='p'){const wk=weak(),f=p.filter(w=>[...w.toLowerCase()].some(c=>wk.includes(c)));if(f.length>=5)p=f}
 if(!p.length)p=CL.lk.map(c=>c+c+c);
 const u=pickN(p,120);
 return u.concat(sh(u)).join(' ');
}
function openPr(){jankStart();ac();if(document.activeElement)document.activeElement.blur();show('pr');start();if(!CL.test)handsStart()}
function begin(i){CL=ALL[i];const d=dn(CL);CI=d>=CL.sc.length?0:d;openPr()}
function problem(){const l=[...ALL].reverse().find(x=>dn(x)>0)||ALL[0];
 CL={id:'pk',pk:1,t:'Problem harflar',lk:l.lk,cw:l.cw,sc:[{t:'p'}]};CI=0;openPr()}
function gStop(){
 if(S.endTimer){clearTimeout(S.endTimer);S.endTimer=0}
 if(S.game&&S.game.stop)S.game.stop();
}
function exit(){clearInterval(S.iv);gStop();jankStop();$('#hsv').style.display='';if(CL&&CL.back)CL.back();else if(CL&&CL.test)tests();else home()}
// Sekin qurilmani aniqlaş: maşq paytida kadrlar uzoq (>60 ms) bölsa, yengil rejim özi yoqiladi
let JK={raf:0,last:0,bad:[],on:false};
function jankStart(){
 if(JK.on)return;JK.on=true;JK.last=0;JK.bad=[];
 const f=ts=>{
  if(!JK.on)return;JK.raf=requestAnimationFrame(f);
  if(JK.last){const d=ts-JK.last;if(d>60&&d<1500)JK.bad.push(ts)}
  JK.last=ts;while(JK.bad.length&&ts-JK.bad[0]>5000)JK.bad.shift();
  if(!LITE&&JK.bad.length>=10){setLite(true,true);toast('Qurilmangiz sekinroq — yengil rejim yoqildi. Xohlasangiz yuqoridagi "Yengil" tugmasi bilan öçirasiz.')}
 };
 JK.raf=requestAnimationFrame(f);
}
function jankStop(){JK.on=false;cancelAnimationFrame(JK.raf)}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),6000)}
function start(){
 clearInterval(S.iv);gStop();const s=CL.sc[CI];
 // t0 - birinçi bosiş vaqti, tl - öxirgi töğri bosiş vaqti (tezlik hisobi uçun)
 S={text:'',i:0,wr:new Set(),err:0,tot:0,t0:0,tl:0,done:false,bad:false,tm:s.tm!=null?s.tm:s.t=='p'?120:s.t=='a'?60:0,tk:!!s.tk,find:s.t=='f',fc:s.c,found:false,gm:s.t=='G',game:null,lost:false,ending:0,endAt:0,resAt:0,tg:null,lvh:''};
 if(!S.find&&!S.gm)S.text=gen();
 $('#res').hidden=true;$('#res').innerHTML='';$('#play').hidden=false;
 $('#gm').hidden=!S.gm;$('#gm').innerHTML='';
 $('#hsv').style.display=CL.test?'none':'';

 $('#kbs').hidden=!!CL.test;$('#hint').innerHTML='';   // sinovda klaviatura va qöllar körsatilmaydi
 $('#ex').textContent=CL.test?'« Sinov':'« Darslar';
 $('#txt').className=S.tk?'tk':'';   // öyinda (va yengil rejimda) qöllar çizilmaydi — yengil va silliq işlaydi
 $('#pt').textContent=CL.t;
 if(S.gm){
  S.game=GAMES[s.g](s.kn);$('#pt').textContent=CL.t+' · '+S.game.title;
 }
 $('#sg').innerHTML=CL.test?'<div class="tbar"><u id="tbf"></u></div>':CL.sc.map((_,j)=>`<i class="${j<dn(CL)?'f':j==CI?'c':''}"></i>`).join('');
 paint();
}
function paint(){
 const s=CL.sc[CI];
 $('#gm').hidden=!S.gm;
 $('#fc').hidden=!S.find;$('#txt').hidden=S.find||S.gm;$('#lv').hidden=S.find;
 if(S.gm){
  $('#fc').innerHTML='';
  const h=`<span>Aniqlik: ${S.tot?accOf(S):100}%</span>`+(S.game?`<span>${S.game.status()}</span>`:'')+`<span>★ ${starsTot()}</span><span>Ball: ${P.pts}</span>`;
  if(h!==S.lvh){S.lvh=h;$('#lv').innerHTML=h}
 }else if(S.find){
  const c=S.fc,fg=fing(codeOf[c.toLowerCase()]),up=c!==c.toLowerCase();
  $('#fc').innerHTML=S.found
   ?`<h2>Topdingiz! 🎉</h2><p>Bu <span class="kbx sm">${c}</span> tugmasi qayerdaligini eslab qoling, endi uni maşq qilamiz!</p><p class="mut">Davom etiş uçun <b>ENTER</b> bosing</p><button class="pri" id="fgo">Davom etiş</button>`
   :`<p>Salom! ${up?'<b>Shift</b> va ':''}<b>${fg}</b> bilan:</p><div class="big">Quyidagi tugmani bosing: <span class="kbx ${S.bad?'bad':''}">${c}</span></div>`;
  if(S.found)$('#fgo').onclick=adv;
 }else{
  $('#fc').innerHTML='';
  if(s.t=='d')$('#txt').innerHTML='<div class="bx">'+[...S.text].map((ch,j)=>`<span class="${j<S.i?(S.wr.has(j)?'bad':'ok'):j==S.i?'cur':''}">${ch}</span>`).join('')+'</div>';
  else if(S.tk)paintTen();
  else paintTxt();
  const left=S.t0?Math.max(0,S.tm-(Date.now()-S.t0)/1000):S.tm;
  const lh=CL.test?testLive():`<span>Tezlik: ${liveWpm(S)}</span><span>Aniqlik: ${S.tot?accOf(S):100}%</span>`+(S.tm?`<span>⏱ ${fmt(left)}</span>`:'')+`<span>★ ${starsTot()}</span><span>Ball: ${P.pts}</span>`;
  // Statistika paneli har bosişda emas, ençi bilan sekundiga ~5 marta yangilanadi (keyingi yangilanish kafolatlanadi)
  if(lh!==S.lvh){const nw=performance.now();
   if(!S.lvt||nw-S.lvt>180||S.done){S.lvt=nw;S.lvh=lh;$('#lv').innerHTML=lh}
   else if(!S.lvo)S.lvo=setTimeout(()=>{S.lvo=0;if(!S.done&&!$('#pr').hidden)paint()},200)}
 }
 const tg=S.gm?(S.game?S.game.target():''):S.find?(S.found?'':S.fc):S.text[S.i];
 // Klaviatura va qöllar faqat kerakli belgi özgarganda yangilanadi (har bosişda butun klaviatura qayta qurilmaydi)
 if(!CL.test&&(tg!==S.tg||S.find)){
  S.tg=tg;
  kbSet(tg);
  handsSet(tg);
  let h='';
  if(tg){if(tg==' ')h='Probel — bosh barmoq bilan';else{const c=codeOf[tg.toLowerCase()];h=`<b>${tg}</b> — `+(c?`<b>${cap(c)}</b> tugmasi`:'belgi')+(c&&tg!==tg.toLowerCase()?' + Shift':'')+(c?` · <span class="mut">${fing(c)}</span>`:'')}}
  $('#hint').innerHTML=h;
 }
}

// Matn: faqat özgargan belgilar yangilanadi (har bosişda 160 ta element qayta çizilmaydi)
function buildTxt(){
 const a=S.wa,fr=document.createDocumentFragment();let seg=S.text.slice(a,a+160);S.sp=[];
 if(CL.test&&a+160<S.text.length){const k=seg.lastIndexOf(' ');if(k>110)seg=seg.slice(0,k+1)}   // sinovda oxirgi yarim söz körinmasin
 for(let j=0;j<seg.length;j++){const e=document.createElement('span');e.textContent=seg[j];fr.appendChild(e);S.sp.push(e)}
 const box=$('#txt');box.textContent='';box.appendChild(fr);S.pi=a;
}
function paintTxt(){
 if(S.wa==null||!S.sp||S.i<S.wa||S.i-S.wa>=70){S.wa=Math.max(0,S.i-12);buildTxt()}
 const a=S.wa;
 for(let x=Math.min(S.pi,S.i);x<=Math.max(S.pi,S.i);x++){const e=S.sp[x-a];if(e)e.className=x<S.i?(S.wr.has(x)?'bad':'ok'):x==S.i?'cur':''}
 S.pi=S.i;
}

// Topiş ekranidan keyingisiga
function adv(){
 if(CI==dn(CL)){P.done[CL.id]=CI+1;P.pts=Math.min(MAXP,P.pts+5);save()}
 CI++;start();
}

/* ---------- Natija ---------- */
// Qoida: yutsa (yoki talabni bajarsa) — ENTER keyingisiga; yutqazsa (talabni bajarmasa) — ENTER qaytadan.
function finish(timeUp){
 if(S.done)return;S.done=true;clearInterval(S.iv);
 if(CL.test){finishTest(timeUp);return}   // Sinov natijasi — tests.js
 const s=CL.sc[CI],isG=s.t=='G',wpm=wpmOf(S,timeUp),acc=accOf(S);
 const okAcc=isG||acc>=PASS,ok=okAcc&&S.i>0&&!S.lost;
 gStop();
 const stars=!ok?0:starsOf(acc);
 addStats(S,timeUp);
 let gain=0,msg='';
 if(ok){const first=!CL.pk&&CI==dn(CL);
  gain=first?(s.t=='p'?30:s.t=='a'?50:10+stars*3):2;
  if(first){P.done[CL.id]=CI+1;if(full(CL))msg='<p class="rs"><b>Dars tugadi! 🎊</b></p>'}
  P.pts=Math.min(MAXP,P.pts+gain);
  if(!CL.pk){const a=P.st[CL.id]=P.st[CL.id]||[];a[CI]=Math.max(a[CI]||0,stars)}}
 save();
 handsSet('');
 if(ok){snd.win(stars);confetti()}else if(!isG)snd.lose();
 const d=dn(CL),stg=stage(),lo=TH[stg-1],hi=TH[stg],pct=hi?Math.round(100*(P.pts-lo)/(hi-lo)):100;
 const last=CI+1>=CL.sc.length;
 $('#play').hidden=true;
 const r=$('#res');r.hidden=false;S.resAt=Date.now();window.scrollTo(0,0);
 const title=!ok?(isG?'Yutqazdingiz 💪':'Qayta urinib köring 💪'):stars==3?R(['Ajoyib! 🌟','Zör! 🌟','Barakalla! 🌟']):stars==2?'Yaxşi! 👏':'Ötdingiz! 👍';
 const need=[];if(!okAcc)need.push(`aniqlik kamida ${PASS}% bölişi kerak`);
 const line=isG
  ?`Aniqligingiz <b>${acc}%</b>${ok?``:'<br><span class="mut">Hiç qiynalmang — yana bir urinib körasiz</span>'}`
  :`Tezligingiz <b>${wpm}</b> söz/daq, aniqligi <b>${acc}%</b>${ok?``:`<br><span class="mut">Davom etiş uçun ${need.join(', ')}</span>`}`;
 const goLbl=ok?(last?'Tugatiş':'Davom etiş'):'Qayta urinib köriş';
 r.innerHTML=`<div class="stars">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}" style="animation-delay:${.1+i*.3}s">${i<stars?'★':'☆'}</span>`).join('')}</div>
 <h2>${title}</h2>
 ${ok?`<div class="gain">+${gain} ball</div>`:''}<p class="rs">${line}</p>${msg}<p class="rs">★ ${starsTot()} yulduz · ${P.pts} ball</p>
 <div class="pg"><b>Nihol (${stg}/5)</b> · ${P.pts} ball<div class="pb"><i style="width:${pct}%"></i></div>
 <span class="mut">Kunlik maqsad: ${fmt(P.day[today()]||0)} / ${fmt(GOAL)} · Dars jarayoni: ${d}/${CL.sc.length}</span>
 <div class="sn">${CL.sc.map((_,j)=>`<i class="${j<d?'f':j==CI?'c':''}">${j+1}</i>`).join('')}</div></div>
 <p><button id="bk">« Darslarga qaytiş</button> ${ok?'<button id="rdo">Qayta</button> ':''}<button class="pri" id="go">${goLbl} <kbd>ENTER</kbd></button></p>`;
 $('#bk').onclick=exit;if(ok)$('#rdo').onclick=start;
 $('#go').onclick=()=>{if(!ok)start();else if(last)exit();else{CI++;start()}};
}
function confetti(){const e=['⭐','🎉','✨','🌟','🎈'],f=document.createDocumentFragment();for(let i=0;i<16;i++){const d=document.createElement('div');d.className='cf';d.textContent=R(e);d.style.left=Math.random()*100+'vw';d.style.animationDelay=Math.random()*.8+'s';d.style.animationDuration=2+Math.random()*1.4+'s';f.appendChild(d);setTimeout(()=>d.remove(),4600)}document.body.appendChild(f)}
// Silkinish: Web Animations — majburiy layout (offsetWidth) çaqirilmaydi, faqat transform (GPU) ishlatiladi
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function shake(el){
 if(LITE||RM||!el||!el.animate)return;
 el.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)',offset:.25},{transform:'translateX(7px)',offset:.75},{transform:'translateX(0)'}],{duration:250});
}

// Öyin tugadi (yutdi/yutqazdi): e'lon körsatiladi, keyin natija oynasi (ENTER bosilsa — darhol)
function gameEnd(win,G){
 if(S.done||S.ending)return;
 const state=S;
 S.ending=1;S.lost=!win;S.endAt=Date.now();
 S.endTimer=setTimeout(()=>{
  if(S===state&&!state.done&&state.game===G&&!$('#pr').hidden)finish();
 },win?1700:1300);
}
