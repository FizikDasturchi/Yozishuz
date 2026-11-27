/* ============================================================
   sounds.js — barça tovuşlar (Web Audio, tashqi fayl kerak emas).
   Maqsad: yumşoq, musiqiy, qulaqqa yoqimli tovuşlar (qattiq "bzzz" va şovqin yöq).
   • click()/clickUp() — yozişdagi tugma tovuşi (yumşoq "tak")
   • snd.note(n)  — öyinda töğri harf: pentatonik gamma bö'yiça yuqoriga-pastga yürib turuvçi nota
   • snd.bad()    — xato: yumşoq past "dup" (qichqiriq emas)
   • snd.win(n)   — natija: n ta yulduz uçun qö'ng'iroq notalari
   • snd.amazing()/lose() — öyin yutuqi arpeggiosi / yumşoq pasayuvçi nota
   • snd.jump/land/word/pop/miss/boost/fuel/ding — öyin tovuşlari
   Qotmaslik uçun:
   • Har bir tovuş birinçi marta çalinganda OfflineAudioContext da BIR MARTA tayyorlanib (keşlanib) saqlanadi,
     keyingi çalişlarda faqat bitta tugun ishlatiladi (oldin 5–8 ta tugun yaratilardi — bu axlat yig'iş qotişini keltirardi).
   • Bir paytdagi tovuşlar soni vaqt bö'yiça hisoblanadi (onended ga tayanilmaydi — tab yashirilganda ham "tiqilib" qolmaydi).
   Provides: SND, ac, tone, click, clickUp, snd
   ============================================================ */
let AC,OUT,NB,SND=true,ENDS=[];
// Bir paytda çalinayotgan tovuşlar soni çegaralanadi (tugaş vaqti bö'yiça hisoblanadi)
const busy=n=>{const t=performance.now();ENDS=ENDS.filter(e=>e>t);return ENDS.length>=n};
const reg=d=>{ENDS.push(performance.now()+d*1000+80)};
function ac(){
 try{
  if(!AC){
   AC=new(window.AudioContext||window.webkitAudioContext)();
   const comp=AC.createDynamicsCompressor();
   comp.threshold.value=-18;comp.knee.value=24;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
   const m=AC.createGain();m.gain.value=.95;comp.connect(m);m.connect(AC.destination);OUT=comp;
   const n=AC.sampleRate*.3|0;NB=AC.createBuffer(1,n,AC.sampleRate);
   const d=NB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  }
  if(AC.state!=='running')AC.resume();
  return AC;
 }catch(e){return null}
}

/* ---------- Tovuş "keşi": bir marta tayyorlanadi, keyin bitta tugun bilan çaliniadi ---------- */
const BC=new Map();
function cached(key,dur,build){
 const e=BC.get(key);
 if(e)return e.b;
 if(BC.size>=160||typeof OfflineAudioContext==='undefined'||!AC)return null;
 const ent={b:null};BC.set(key,ent);
 try{
  const sr=AC.sampleRate,oc=new OfflineAudioContext(1,Math.max(1,Math.ceil(sr*dur)),sr);
  build(oc,oc.destination,0);
  oc.startRendering().then(b=>{ent.b=b}).catch(()=>{BC.delete(key)});
 }catch(x){BC.delete(key)}
 return null;   // tayyor bölmaguça bu safar eski usulda (jonli) çaliniadi
}
function play(b,at,rate){
 const s=AC.createBufferSource();s.buffer=b;if(rate)s.playbackRate.value=rate;
 s.connect(OUT);s.start(AC.currentTime+(at||0));
}

/* ---------- Tovuş "qurilmalari" (jonli ham, keşga tayyorlaşda ham bir xil) ---------- */
function bTone(c,o,t,f,d,type,v,f2){
 const os=c.createOscillator(),g=c.createGain();
 os.type=type||'sine';os.frequency.setValueAtTime(f,t);if(f2)os.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 os.connect(g);g.connect(o);os.start(t);os.stop(t+d+.03);
}
function bNote(c,o,t,f,d,v){
 const g=c.createGain(),lp=c.createBiquadFilter();
 lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(9000,f*7),t);lp.frequency.exponentialRampToValueAtTime(Math.max(700,f*1.5),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 [[f,'triangle',1],[f*2,'sine',.32],[f*3.01,'sine',.1]].forEach(([fr,ty,k])=>{
  const os=c.createOscillator(),og=c.createGain();os.type=ty;os.frequency.value=fr;og.gain.value=k;
  os.connect(og);og.connect(lp);os.start(t);os.stop(t+d+.05);
 });
 lp.connect(g);g.connect(o);
}
function bNz(c,o,t,f,q,d,v,rate,type,off){
 const s=c.createBufferSource();s.buffer=NB;s.playbackRate.value=rate||1;
 const fl=c.createBiquadFilter();fl.type=type||'bandpass';fl.frequency.value=f;fl.Q.value=q;
 const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 s.connect(fl);fl.connect(g);g.connect(o);s.start(t,off||0);s.stop(t+d+.02);
}
function bWhoosh(c,o,t,f1,f2,d,v){
 const s=c.createBufferSource();s.buffer=NB;s.loop=true;
 const fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.1;
 fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+d);
 const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.4);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(fl);fl.connect(g);g.connect(o);s.start(t);s.stop(t+d+.03);
}

// Oddiy nota: yumşoq boşlanişi (8 ms) va tabiiy so'nişi
function tone(f,d,type,v,at,f2){
 if(!SND||busy(LITE?10:22))return;const a=ac();if(!a)return;
 const b=cached('t|'+[f,d,type||'',v||'',f2||''].join(),d+.06,(c,o)=>bTone(c,o,0,f,d,type,v,f2));
 reg((at||0)+d+.03);
 if(b)play(b,at);else bTone(a,OUT,a.currentTime+(at||0),f,d,type,v,f2);
}
// Yumşoq "piano/marimba" notasi: uç tomon sekin yopiladigan filtr — o'tkir emas, iliq
function note(f,d,v,at){
 if(!SND||busy(LITE?8:18))return;const a=ac();if(!a)return;
 const b=cached('n|'+[f,d,v].join(),d+.07,(c,o)=>bNote(c,o,0,f,d,v));
 reg((at||0)+d+.05);
 if(b)play(b,at);else bNote(a,OUT,a.currentTime+(at||0),f,d,v);
}
// Qö'ng'iroqça (asos + yuqori garmonikalar) — yulduz, so'z, topiş tovuşi
function bell(f,v,at){tone(f,.9,'sine',v,at);tone(f*2.01,.55,'sine',v*.35,at);tone(f*4.2,.22,'sine',v*.1,at)}
// Qisqa shovqin urilişi (past chastotali, yumşoq)
function nz(f,q,d,v,at,rate,type){
 if(!SND||busy(LITE?10:22))return;const a=ac();if(!a)return;
 const b=cached('z|'+[f,q,d,v,rate||1,type||''].join(),d+.05,(c,o)=>bNz(c,o,0,f,q,d,v,rate,type,0));
 reg((at||0)+d+.02);
 if(b)play(b,at);else bNz(a,OUT,a.currentTime+(at||0),f,q,d,v,rate,type,Math.random()*.05);
}
// Shovqinning chastotali "süpürişi" (whoosh)
function whoosh(f1,f2,d,v,at){
 if(!SND||busy(LITE?10:22))return;const a=ac();if(!a)return;
 const b=cached('w|'+[f1,f2,d,v].join(),d+.06,(c,o)=>bWhoosh(c,o,0,f1,f2,d,v));
 reg((at||0)+d+.03);
 if(b)play(b,at);else bWhoosh(a,OUT,a.currentTime+(at||0),f1,f2,d,v);
}
// Yaltirash: bir necha yuqori "tink" (qayd etilgan chastotalar — keşlanadi; yengil rejimda kamroq)
const SPK=[2300,2700,3100,3500,3900,4300,4700,5100];
function sparkle(at,n){if(LITE)n=Math.min(n,3);for(let i=0;i<n;i++)tone(SPK[Math.random()*SPK.length|0],.16,'sine',.05,at+i*.055)}

// Tugma bosilganda: yumşoq "tak" + past "tok" — keşdan bitta tugun bilan (har safar sal boşqaça tovuş)
function click(big){
 if(!SND||busy(LITE?10:22))return;const a=ac();if(!a)return;
 const r=.92+Math.random()*.16,f=big?850:1600,g=big?95:140,g2=big?60:95;
 const b=cached('c'+(big?1:0),.14,(c,o)=>{bNz(c,o,0,f,.8,.03,.5,1,'bandpass',0);bTone(c,o,0,g,.06,'sine',.38,g2)});
 reg(.1);
 if(b)play(b,0,r);else{const t=a.currentTime;bNz(a,OUT,t,f,.8,.03,.5,r,'bandpass',Math.random()*.05);bTone(a,OUT,t,g,.06,'sine',.38,g2)}
}
// Tugma qöyvorilganda: juda yengil "tik" (yengil rejimda yöq)
function clickUp(){
 if(!SND||LITE||busy(12))return;const a=ac();if(!a)return;
 const b=cached('u',.05,(c,o)=>bNz(c,o,0,2600,1,.012,.14,1.1,'bandpass',0));
 reg(.04);
 if(b)play(b,0);else bNz(a,OUT,a.currentTime,2600,1,.012,.14,1.1,'bandpass',Math.random()*.05);
}

const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51,1567.98,1760];
const snd={
 // xato: yumşoq past "dup" (qattiq emas)
 bad:()=>{
  if(!SND||busy(LITE?10:22))return;const a=ac();if(!a)return;
  const b=cached('bad',.22,(c,o)=>{bTone(c,o,0,175,.14,'sine',.3,100);bNz(c,o,0,380,.7,.05,.2,.7,'lowpass',0)});
  reg(.16);
  if(b)play(b,0);else{const t=a.currentTime;bTone(a,OUT,t,175,.14,'sine',.3,100);bNz(a,OUT,t,380,.7,.05,.2,.7,'lowpass',Math.random()*.05)}
 },
 // töğri tugmani topganda
 ding:()=>{bell(880,.16,0);bell(1318.5,.12,.07)},
 // öyinda töğri harf: gamma bö'yiça yuqoriga va pastga — har bir bosiş navbatdagi nota
 note:n=>{const p=n%18,i=p<10?p:18-p;note(PENTA[i],.6,.22,0);if(n>0&&n%8==0)sparkle(.03,3)},
 // natija: n ta yulduz — har biri alohida qö'ng'iroqça (Mi, Sol, Do)
 win:n=>{
  [659.25,783.99,1046.5].slice(0,Math.max(1,n)).forEach((f,i)=>bell(f,.2,.1+i*.3));
  if(n>=3)sparkle(1.0,8);
 },
 lose:()=>{note(392,.4,.2,0);note(329.6,.4,.2,.24);note(261.6,.7,.2,.48)},
 // öyin yutuqi: yuqoriga arpeggio + akkord + yaltirash
 amazing:()=>{
  [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>note(f,.55,.2,i*.09));
  [523.25,659.25,783.99,1046.5].forEach(f=>bell(f,.08,.55));
  sparkle(.55,8);
 },
 // robot sakraydi / qo'nadi
 jump:()=>{tone(300,.2,'sine',.2,0,660);whoosh(400,1400,.26,.07,0)},
 land:()=>{tone(120,.1,'sine',.4,0,60);nz(700,.8,.04,.22,0,.8,'lowpass')},
 word:()=>{bell(784,.15,0);bell(1174.7,.13,.08);bell(1568,.09,.16)},
 // shar portladi
 pop:()=>{nz(3200,.7,.05,.55,0,1.2,'highpass');tone(820,.09,'sine',.24,0,230)},
 // jon yöqotildi
 miss:()=>{tone(150,.24,'sine',.45,0,70);note(311,.32,.13,.05)},
 // raketa tezlaşdi
 boost:()=>{whoosh(300,2200,.4,.13,0);note(880,.25,.13,.05)},
 fuel:()=>tone(520,.07,'triangle',.07)
};
