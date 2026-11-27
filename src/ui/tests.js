/* ============================================================
   tests.js — "Sinov" bölimi (typing.com dagidek):
     • Vaqtli sinovlar: 1, 3, 5 daqiqa (uzun matn, vaqt tugaguça yoziladi)
     • Sahifa sinovlari: 1, 2, 3 sahifa (matn tugaguça yoziladi)
     • 10 Key sinovlari: 1, 3, 5 daqiqa (raqamlar, nuqta, + va Enter)
   Matnlar texts.js dagi barça biografiyalardan tasodifiy beriladi:
   "xalta" usuli — barça matnlar bir martadan ishlatilib bölmaguça takrorlanmaydi
   (xalta localStorage da saqlanadi, sahifa yangilansa ham davom etadi).
   Hisob-kitob (tezlik, aniqlik) stats.js da — darslar bilan bir xil qoida.
   Provides: TESTS, tests, startTest, testLive, finishTest, paintTen
   Depends: config.js, storage.js, stats.js, texts.js, screens.js (S, CL, CI, R, sh, show, openPr, confetti)
   ============================================================ */
const PAGE_CH=1250;   // 1 sahifa ≈ 250 söz (1 söz = 5 belgi). Sahifa uzunligini şu yerdan özgartiriş mumkin.
const ENT='\u21b5';   // ↵ — 10 key satr oxiri (Enter)

const TESTS=[
{g:'Vaqtli sinovlar',cl:'u0',nm:'Vaqtli sinov',items:[
 {id:'t1',n:'1:00',tm:60,len:1500,b:'1 daqiqalik sinov'},
 {id:'t3',n:'3:00',tm:180,len:4200,b:'3 daqiqalik sinov'},
 {id:'t5',n:'5:00',tm:300,len:7000,b:'5 daqiqalik sinov'}]},
{g:'Sahifa sinovlari',cl:'u1',nm:'Sahifa sinovi',items:[
 {id:'p1',n:'1 sahifa',pg:1,b:'1 sahifalik sinov'},
 {id:'p2',n:'2 sahifa',pg:2,b:'2 sahifalik sinov'},
 {id:'p3',n:'3 sahifa',pg:3,b:'3 sahifalik sinov'}]},
{g:'10 Key sinovlari',cl:'u2',nm:'10 Key',tk:1,items:[
 {id:'k1',n:'1:00',tm:60,lines:30,b:'1 daqiqalik 10 key'},
 {id:'k3',n:'3:00',tm:180,lines:70,b:'3 daqiqalik 10 key'},
 {id:'k5',n:'5:00',tm:300,lines:110,b:'5 daqiqalik 10 key'}]}
];

/* ---------- Matn tanlaş ---------- */
// Xalta: barça matnlar aralaştirib beriladi; hammasi ishlatilgaç yana aralaştiriladi (ketma-ket bir xil matn çiqmaydi)
function bagTake(){
 let bag=null;
 try{bag=JSON.parse(localStorage.getItem('yozish.bag'))}catch(e){}
 if(!bag||bag.n!==TEXTS.length||!Array.isArray(bag.b)||!bag.b.length){
  let last=-1;try{last=+localStorage.getItem('yozish.lastt')}catch(e){}
  const b=sh(TEXTS.map((_,i)=>i));
  if(b.length>1&&b[0]===last){const j=1+Math.random()*(b.length-1)|0;[b[0],b[j]]=[b[j],b[0]]}
  bag={n:TEXTS.length,b};
 }
 const i=bag.b.shift();
 try{localStorage.setItem('yozish.bag',JSON.stringify(bag));localStorage.setItem('yozish.lastt',String(i))}catch(e){}
 return i;
}
// Taxminan len belgili matn. Gaplar bilan tuziladi — matn her doim nuqtada tugaydi.
// near=true: uzunlik maqsadga eng yaqin gap oxirida kesiladi (sahifa sinovi);
// near=false: kamida len belgi (vaqtli sinov — matn vaqt tugamasdan öşib ketmasligi uçun).
function passage(len,near){
 const out=[];let n=0,first=true,guard=0;
 while(n<len&&guard++<20){
  const s=TEXTS[bagTake()].s;
  let a=0;
  if(first){
   // Birinçi matn tasodifiy gapdan boşlanadi (qolgan qismi yetarli bölgan gaplardan)
   const tot=s.join(' ').length,ok=[];
   s.forEach((_,i)=>{if(i==0||s.slice(i).join(' ').length>=Math.min(len,tot)*.9)ok.push(i)});
   a=R(ok);first=false;
  }
  for(let i=a;i<s.length&&n<len;i++){
   const add=s[i].length+(n?1:0);
   if(near&&n>=len*.7&&n+add-len>len-n)return out.join(' ');
   out.push(s[i]);n+=add;
  }
 }
 return out.join(' ');
}

/* ---------- 10 Key: tasodifiy satrlar ---------- */
// Son: ints ta butun raqam (birinçisi 0 emas), dec ta kasr raqam
function tkNum(ints,dec){
 const r=n=>Math.random()*n|0;
 let s=String(1+r(9));
 for(let i=1;i<ints;i++)s+=r(10);
 if(dec){s+='.';for(let i=0;i<dec;i++)s+=r(10)}
 return s;
}
function tkLine(){
 const r=n=>Math.random()*n|0,k=Math.random(),N=(a,d)=>tkNum(a,d);
 let l;
 if(k<.40)l=[N(2,2),N(2,2),N(2,2)].join('+');                                  // 74.93+24.61+38.99
 else if(k<.60)l=Array.from({length:2+r(3)},()=>N(2+r(3),0)).join('+');         // 482+1930+75
 else if(k<.80)l=Array.from({length:2+r(2)},()=>N(1+r(3),r(2)?2:1)).join('+'); // 5.4+120.75+8.06
 else if(k<.92)l=[N(3,2),N(2,2),N(2,2)].join('+');                              // 512.40+36.18+84.09
 else l=N(3,r(2)?2:0)+'-'+N(2,r(2)?2:0)+'+'+N(2,r(2)?2:0);                      // 640.25-18.90+77
 return l;
}
// n ta satr: S.rows — satrlar, S.rs — har bir satrning matndagi boşlanish o'rni
function tkText(n){
 const rows=[];
 while(rows.length<n){const l=tkLine();if(l.length<=20&&l!==rows[rows.length-1])rows.push(l)}
 let p=0;
 S.rows=rows;S.rs=rows.map(l=>{const q=p;p+=l.length+1;return q});
 return rows.map(l=>l+ENT).join('');
}

/* ---------- Menyu ---------- */
function tests(){
 show('tests');
 const tb=P.tb||{};
 $('#tl').innerHTML=TESTS.map(g=>`<section class="tg ${g.cl}"><h3>${g.g}</h3><div class="tcs">`+g.items.map(it=>{
  const b=tb[it.id];
  return `<div class="tc"><b>${it.n}</b><span class="tbest">${b?`Eng yaxşi: <b>${b.w}</b> söz/daq · ${b.a}%`:'Hali urinilmagan'}</span><button class="pri" data-t="${it.id}">▶ ${it.b}</button></div>`;
 }).join('')+`</div></section>`).join('');
 $('#tn').textContent=`Matnlar: ${TEXTS.length} ta (${TEXTS.map(t=>t.t).join(', ')}). 1 sahifa ≈ ${Math.round(PAGE_CH/5)} söz.`;
}
function startTest(id){
 let g,it;
 for(const x of TESTS){const f=x.items.find(i=>i.id===id);if(f){g=x;it=f;break}}
 if(!it)return;
 const sc={t:'T',tm:it.tm||0,tk:!!g.tk,
  mk:g.tk?()=>tkText(it.lines):()=>passage(it.pg?it.pg*PAGE_CH:it.len,!!it.pg)};
 CL={id:'test-'+id,test:1,pk:1,tid:id,t:g.nm+' · '+it.n,k:[],lk:[],cw:[],sc:[sc]};CI=0;
 openPr();
}

/* ---------- Yozib turgan paytda ---------- */
// Yuqoridagi çubuq va statistika qatori (paint() çaqiradi)
function testLive(){
 const el=S.t0?(Date.now()-S.t0)/1000:0,left=S.tm?Math.max(0,S.tm-el):el;
 const pct=S.tm?Math.min(100,el/S.tm*100):(S.text.length?S.i/S.text.length*100:0);
 const f=$('#tbf');if(f)f.style.width=pct.toFixed(1)+'%';
 return `<span>Tezlik: ${liveWpm(S)}</span><span>Aniqlik: ${S.tot?accOf(S):100}%</span><span>⏱ ${fmt(left)}</span>`+(S.tm?'':`<span>${Math.round(pct)}%</span>`);
}

// 10 Key: bir vaqtda 7 ta satr körinadi (joriy satr tepada). Faqat özgargan belgilar yangilanadi.
function tkLineOf(i){let r=S.tli||0;while(r>0&&S.rs[r]>i)r--;while(r+1<S.rows.length&&S.rs[r+1]<=i)r++;return r}
function tkCls(x){return x<S.i?(S.wr.has(x)?'bad':'ok'):x==S.i?'cur':''}
function paintTen(){
 const li=tkLineOf(Math.min(S.i,S.text.length-1));
 if(S.tli!==li||!S.tsp){
  const box=$('#txt'),fr=document.createDocumentFragment();
  S.tli=li;S.tsp={};
  for(let r=li;r<Math.min(S.rows.length,li+7);r++){
   const row=document.createElement('div'),ln=S.rows[r]+ENT;row.className='tkr';
   for(let j=0;j<ln.length;j++){const e=document.createElement('span');e.textContent=ln[j];e.className=tkCls(S.rs[r]+j);row.appendChild(e);S.tsp[S.rs[r]+j]=e}
   fr.appendChild(row);
  }
  box.textContent='';box.appendChild(fr);
 }else{
  for(let x=Math.min(S.pi,S.i);x<=Math.max(S.pi,S.i);x++){const e=S.tsp[x];if(e)e.className=tkCls(x)}
 }
 S.pi=S.i;
}

/* ---------- Natija ---------- */
function finishTest(timeUp){
 gStop();
 const wpm=wpmOf(S,timeUp),acc=accOf(S),el=elapsedOf(S,timeUp),n=cn(S),errs=S.err;
 const kph=el>0?Math.round(n*3600/el):0;
 if(CL.cb){$('#play').hidden=true;const r=$('#res');r.hidden=false;S.resAt=Date.now();window.scrollTo(0,0);CL.cb(r,{wpm,acc,errs,el,n,timeUp});return}   // Qöşiş / Musobaqa: natijani cloud.js ko'rsatadi
 // Umumiy statistika: 10 key faqat vaqtni qöşadi (raqamlar harf tezligi örtaçasini buzmasligi uçun)
 if(S.tk){P.sec+=el;P.day[today()]=(P.day[today()]||0)+el}else addStats(S,timeUp);
 const tb=P.tb=P.tb||{},rec=tb[CL.tid]||{n:0,w:0,a:0,k:0};
 const isRec=rec.n>0&&wpm>rec.w;
 rec.n++;
 if(wpm>=rec.w){rec.w=wpm;rec.a=acc;rec.k=kph}
 tb[CL.tid]=rec;save();
 const stars=starsOf(acc);
 if(wpm>0){snd.win(stars);if(isRec)confetti()}else snd.lose();
 $('#play').hidden=true;
 const r=$('#res');r.hidden=false;S.resAt=Date.now();window.scrollTo(0,0);
 const title=wpm==0?'Qayta urinib köring 💪':isRec?'Yangi rekord! 🏆':acc>=96?R(['Ajoyib! 🌟','Zör! 🌟','Barakalla! 🌟']):acc>=90?'Yaxşi! 👏':'Yaxşi uriniş! 👍';
 const tile=(v,l)=>`<div><b>${v}</b>${l}</div>`;
 r.innerHTML=`<div class="stars"><span class="on">${isRec?'🏆':'⏱'}</span></div>
 <h2>${title}</h2>
 <div class="tst">${tile(wpm,'söz/daq')}${tile(acc+'%','aniqlik')}${tile(errs,'xato')}${tile(fmt(el),'vaqt')}${S.tk?tile(kph,'KPH (bosiş/soat)'):''}</div>
 <p class="rs">Bu sinovdagi eng yaxşi natijangiz: <b>${rec.w}</b> söz/daq (${rec.a}% aniqlik)</p>
 <p class="mut">${S.tk?'KPH — bir soatda nechta töğri belgi bosilgani. ':''}Tezlik: 1 söz = 5 belgi. Xato bosişlar belgi hisoblanmaydi.</p>
 <p><button id="bk">« Sinov</button> <button class="pri" id="go">Yana urinib köriş <kbd>ENTER</kbd></button></p>`;
 $('#bk').onclick=exit;
 $('#go').onclick=()=>startTest(CL.tid);
}
