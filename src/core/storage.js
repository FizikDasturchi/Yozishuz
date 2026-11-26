/* ============================================================
   storage.js — progress (bu qurilmada, localStorage).
   Provides: P, save, resetProgress, dn, full, opened, stage, today, fmt
   Depends: config.js; ALL (lessons.js) — faqat funksiya çaqirilganda
   ============================================================ */
const newProgress=()=>({
 done:{},          // dars -> tugatilgan ekranlar soni
 pts:0,            // nihol balli
 sec:0,            // jami yozilgan vaqt (soniya)
 day:{},           // kun -> yozilgan soniya
 keys:{},          // harf -> {t: bosilgan, e: xato}
 ch:0,ts:0,        // tezlik uçun: jami töğri belgilar va jami vaqt
 kt:0,ke:0         // aniqlik uçun: jami bosişlar va xatolar
});
let P;try{P=JSON.parse(localStorage.getItem(KEY))}catch(e){}
P=Object.assign(newProgress(),P||{});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const resetProgress=()=>{P=newProgress();save()};

const dn=l=>P.done[l.id]||0;
const full=l=>dn(l)>=l.sc.length;
const opened=i=>i==0||full(ALL[i-1]);
const stage=()=>TH.filter(t=>P.pts>=t).length;
const today=()=>new Date().toISOString().slice(0,10);
const fmt=s=>String(s/60|0).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
