/* ============================================================
   sounds.js — barça tovuşlar (Web Audio, tashqi fayl kerak emas).
   Provides: SND, ac, tone, click, snd {bad, ding, win, lose}
   • click(big)  — har bir tugma bosilganda mexanik klaviatura "tak" i
   • snd.bad()   — xato bosilganda
   • snd.ding()  — tugmani topganda
   • snd.win(n)  — natija oynasida tantanali fanfara (n = yulduzlar)
   • snd.lose()  — muvaffaqiyatsizlikda
   ============================================================ */
let AC,OUT,NB,SND=true;
function ac(){
 try{
  if(!AC){
   AC=new(window.AudioContext||window.webkitAudioContext)();
   const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=6;
   const master=AC.createGain();master.gain.value=1.25;
   comp.connect(master);master.connect(AC.destination);OUT=comp;
   const n=AC.sampleRate*.08|0;NB=AC.createBuffer(1,n,AC.sampleRate);
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
// Klaviatura tugmasi: qisqa shovqin "tak" + past "tuk". Har safar sal boşqaçaroq.
function click(big){
 if(!SND)return;const a=ac();if(!a)return;const t=a.currentTime;
 const s=a.createBufferSource();s.buffer=NB;s.playbackRate.value=.85+Math.random()*.35;
 const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=(big?1500:2600)+Math.random()*700;f.Q.value=.8;
 const g=a.createGain();g.gain.setValueAtTime(big?1.5:1.2,t);g.gain.exponentialRampToValueAtTime(.001,t+(big?.06:.04));
 s.connect(f);f.connect(g);g.connect(OUT);s.start(t);s.stop(t+.075);
 tone(big?120:190,big?.08:.055,'sine',.6,0,big?70:120);
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
// Bitta qarsak
function grain(at,v){
 if(!SND)return;const a=ac();if(!a)return;const t=a.currentTime+at;
 const s=a.createBufferSource();s.buffer=NB;s.playbackRate.value=.6+Math.random();
 const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1000+Math.random()*3000;f.Q.value=.6;
 const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.03);
 s.connect(f);f.connect(g);g.connect(OUT);s.start(t,Math.random()*.03);s.stop(t+.04);
}
function fanfare(n){
 [[392,.1,0],[392,.1,.14],[392,.1,.28],[523,.55,.42]].forEach(([f,d,a])=>brass(f,d,a,.11));
 let t=1.0;
 if(n>=3){[523,659,784,1047].forEach((f,i)=>brass(f,.12,t+i*.09,.1));t+=.45}
 [523,659,784,1047].forEach(f=>brass(f,n>=3?1.1:.8,t,.085));
 [1047,1319,1568].forEach((f,i)=>tone(f,.5,'sine',.12,t+.05+i*.06));
 if(n>=2)for(let i=0;i<(n>=3?70:35);i++)grain(t+Math.random()*(n>=3?1.6:1),.35);
}
const snd={
 bad:()=>tone(220,.28,'square',.3,0,110),
 ding:()=>{tone(784,.16,'sine',.3);tone(1175,.3,'sine',.3,.12)},
 win:fanfare,
 lose:()=>{tone(392,.22,'triangle',.3);tone(294,.4,'triangle',.3,.2)}
};
