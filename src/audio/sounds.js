/* ============================================================
   sounds.js — barça tovuşlar (Web Audio, tashqi fayl kerak emas).
   Tovuşlar typing.com videosining audio izidan örganilgan (tezlik spektri,
   davomiyligi, ritmi) va şunga qarab qaytadan sintez qilingan:
   • click()     — tugma bosilganda: ikki urilişli "tak" (yuqori) + past "tok" (~130 Hz)
   • clickUp()   — tugma qöyvorilganda: yengil, kiçik "tik"
   • snd.bad()   — xato: ~140 ms past "bzzz" (130 Hz va garmonikalari)
   • snd.win(n)  — natija oynasida har bir yulduz uçun qö'ng'iroqça: Mi–Fa#–Sol# (E5, F#5, G#5)
   • snd.amazing()— öyin yutuqi fanfarasi (Fa–Sol–Do, keyin Do-major akkord)
   • snd.jump/land/word/pop/miss — öyin tovuşlari
   Provides: SND, ac, tone, click, clickUp, snd
   ============================================================ */
let AC,OUT,NB,SND=true;
function ac(){
 try{
  if(!AC){
   AC=new(window.AudioContext||window.webkitAudioContext)();
   const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=6;
   const master=AC.createGain();master.gain.value=1.25;
   comp.connect(master);master.connect(AC.destination);OUT=comp;
   const n=AC.sampleRate*.2|0;NB=AC.createBuffer(1,n,AC.sampleRate);
   const d=NB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  }
  if(AC.state!=='running')AC.resume();
  return AC;
 }catch(e){return null}
}
function tone(f,d,type,v,at,f2){
 if(!SND)return;const a=ac();if(!a)return;
 const t=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(OUT);o.start(t);o.stop(t+d+.03);
}
// Qisqa shovqin urilişi: markaziy tezlik f, davomiyligi d
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
 const fl=a.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.2;
 fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+d);
 const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.4);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(fl);fl.connect(g);g.connect(OUT);s.start(t);s.stop(t+d+.03);
}
// Tugma bosilganda: ikki urilişli "tak" (0 va ~12 ms) + past "tok" (~130 Hz, ~70 ms)
function click(big){
 if(!SND)return;const a=ac();if(!a)return;
 const r=.9+Math.random()*.25,f=(big?1500:2000)+Math.random()*900;
 nz(f,.9,.03,big?1.5:1.25,0,r);
 nz(f*1.25,1.2,.02,.7,.012,r);
 tone(big?105:130,.075,'sine',.75,0,big?60:90);
 tone(big?210:260,.04,'sine',.18,0,150);
}
// Tugma qöyvorilganda: yengil "tik"
function clickUp(){
 if(!SND)return;const a=ac();if(!a)return;
 nz(3200+Math.random()*900,1,.014,.5,0,1.1);
 tone(210,.03,'sine',.12,0,150);
}
// Qö'ng'iroqça (asos + oktava + 2 oktava) — yulduz tovuşi
function chime(f,at,v){
 v=v||.2;
 tone(f,.75,'sine',v*.5,at);tone(f*2,.6,'sine',v,at);tone(f*4,.3,'sine',v*.3,at);
}
// Mis nafasli cholg'u (fanfara uçun)
function brass(f,d,at,v){
 if(!SND)return;const a=ac();if(!a)return;const t=a.currentTime+at;
 const o=a.createOscillator(),o2=a.createOscillator(),fl=a.createBiquadFilter(),g=a.createGain();
 o.type='sawtooth';o2.type='square';o.frequency.value=f;o2.frequency.value=f*1.004;
 fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.linearRampToValueAtTime(3200,t+.08);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.03);g.gain.setValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(OUT);
 o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05);
}
// Bitta qarsak / yaltirash
function grain(at,v){nz(1000+Math.random()*3000,.6,.03,v,at,.6+Math.random())}

const snd={
 // xato: ~140 ms "bzzz" — 130 Hz va garmonikalari (262, 382)
 bad:()=>{tone(130,.15,'sawtooth',.28);tone(131.5,.15,'sawtooth',.2);tone(262,.12,'square',.07);tone(382,.1,'sawtooth',.05);nz(1800,.8,.02,.5,0,1)},
 // töğri tugmani topganda
 ding:()=>chime(659,0,.18),
 // natija: n ta yulduz — har biri alohida qö'ng'iroqça (Mi, Fa#, Sol#), ~0.85 s oralig'ida
 win:n=>{
  [659,740,831].slice(0,Math.max(1,n)).forEach((f,i)=>{chime(f,.15+i*.85,.22);whoosh(800,3500,.25,.25,.1+i*.85)});
  if(n>=3)for(let i=0;i<45;i++)grain(2.0+Math.random()*1.4,.3);
 },
 lose:()=>{tone(392,.22,'triangle',.3);tone(294,.4,'triangle',.3,.2)},
 // öyin yutuqi ("AMAZING!"): Fa–Sol–Do, keyin Do-major akkord
 amazing:()=>{
  whoosh(300,3000,.5,.3,0);
  [[349,.16,0],[392,.16,.17],[524,.22,.34]].forEach(([f,d,a])=>brass(f,d,a,.1));
  [523,659,784,1047].forEach(f=>brass(f,1.0,.62,.085));
  [1047,1319,1568].forEach((f,i)=>tone(f,.5,'sine',.12,.7+i*.06));
  for(let i=0;i<40;i++)grain(.6+Math.random()*1.3,.3);
 },
 // robot sakraydi: past "tuk" + yuqoriga "boing" + shamol
 jump:()=>{tone(110,.08,'sine',.5,0,60);tone(330,.15,'sine',.3,.02,760);whoosh(500,1800,.3,.18,.04)},
 land:()=>{tone(130,.1,'sine',.6,0,70);nz(900,.8,.04,.5,0,.8)},
 word:()=>{tone(880,.16,'triangle',.2);tone(1319,.26,'sine',.2,.08)},
 // so'z portladi / yerga tüşdi
 pop:()=>{tone(900,.08,'sine',.3,0,300);nz(2500,.8,.05,.7,0,1.2);tone(1319,.2,'sine',.15,.05)},
 miss:()=>{tone(95,.24,'sine',.7,0,50);nz(500,.8,.08,.6,0,.7)}
};
