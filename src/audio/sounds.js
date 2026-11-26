/* ============================================================
   sounds.js — barça tovuşlar (Web Audio, tashqi fayl kerak emas).
   Maqsad: yumşoq, musiqiy, qulaqqa yoqimli tovuşlar (qattiq "bzzz" va şovqin yöq).
   • click()/clickUp() — yozişdagi tugma tovuşi (yumşoq "tak")
   • snd.note(n)  — öyinda töğri harf: pentatonik gamma bö'yiça yuqoriga-pastga yürib turuvçi nota
   • snd.bad()    — xato: yumşoq past "dup" (qichqiriq emas)
   • snd.win(n)   — natija: n ta yulduz uçun qö'ng'iroq notalari
   • snd.amazing()/lose() — öyin yutuqi arpeggiosi / yumşoq pasayuvçi nota
   • snd.jump/land/word/pop/miss/boost/fuel/ding — öyin tovuşlari
   Provides: SND, ac, tone, click, clickUp, snd
   ============================================================ */
let AC,OUT,NB,SND=true;
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
// Oddiy nota: yumşoq boşlanişi (8 ms) va tabiiy so'nişi
function tone(f,d,type,v,at,f2){
 if(!SND)return;const a=ac();if(!a)return;
 const t=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(OUT);o.start(t);o.stop(t+d+.03);
}
// Yumşoq "piano/marimba" notasi: uç tomon sekin yopiladigan filtr — o'tkir emas, iliq
function note(f,d,v,at){
 if(!SND)return;const a=ac();if(!a)return;
 const t=a.currentTime+(at||0),g=a.createGain(),lp=a.createBiquadFilter();
 lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(9000,f*7),t);lp.frequency.exponentialRampToValueAtTime(Math.max(700,f*1.5),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 [[f,'triangle',1],[f*2,'sine',.32],[f*3.01,'sine',.1]].forEach(([fr,ty,k])=>{
  const o=a.createOscillator(),og=a.createGain();o.type=ty;o.frequency.value=fr;og.gain.value=k;
  o.connect(og);og.connect(lp);o.start(t);o.stop(t+d+.05);
 });
 lp.connect(g);g.connect(OUT);
}
// Qö'ng'iroqça (asos + yuqori garmonikalar) — yulduz, so'z, topiş tovuşi
function bell(f,v,at){tone(f,.9,'sine',v,at);tone(f*2.01,.55,'sine',v*.35,at);tone(f*4.2,.22,'sine',v*.1,at)}
// Qisqa shovqin urilişi (past chastotali, yumşoq)
function nz(f,q,d,v,at,rate,type){
 if(!SND)return;const a=ac();if(!a)return;const t=a.currentTime+(at||0);
 const s=a.createBufferSource();s.buffer=NB;s.playbackRate.value=rate||1;
 const fl=a.createBiquadFilter();fl.type=type||'bandpass';fl.frequency.value=f;fl.Q.value=q;
 const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 s.connect(fl);fl.connect(g);g.connect(OUT);s.start(t,Math.random()*.05);s.stop(t+d+.02);
}
// Shovqinning chastotali "süpürişi" (whoosh)
function whoosh(f1,f2,d,v,at){
 if(!SND)return;const a=ac();if(!a)return;const t=a.currentTime+(at||0);
 const s=a.createBufferSource();s.buffer=NB;s.loop=true;
 const fl=a.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.1;
 fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+d);
 const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.4);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(fl);fl.connect(g);g.connect(OUT);s.start(t);s.stop(t+d+.03);
}
// Yaltirash: bir necha yuqori "tink" (eng ko'pi bilan 8 ta — yengil)
function sparkle(at,n){for(let i=0;i<n;i++)tone(2200+Math.random()*2600,.16,'sine',.05,at+i*.055)}

// Tugma bosilganda: yumşoq "tak" + past "tok"
function click(big){
 if(!SND)return;const a=ac();if(!a)return;
 const r=.92+Math.random()*.16;
 nz(big?850:1600,.8,.03,.5,0,r);
 tone(big?95:140,.06,'sine',.38,0,big?60:95);
}
// Tugma qöyvorilganda: juda yengil "tik"
function clickUp(){
 if(!SND)return;const a=ac();if(!a)return;
 nz(2600,1,.012,.14,0,1.1);
}

const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51,1567.98,1760];
const snd={
 // xato: yumşoq past "dup" (qattiq emas)
 bad:()=>{tone(175,.14,'sine',.3,0,100);nz(380,.7,.05,.2,0,.7,'lowpass')},
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
