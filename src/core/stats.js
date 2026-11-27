/* ============================================================
   stats.js — tezlik (söz/daq) va aniqlik hisobi. EN MUHIM QISM.

   Tezlik — xalqaro standart bö'yiça: 1 söz = 5 belgi (probel ham belgi).
     • Matn tugagiç yozilsa:  (yozilgan belgilar − 1) / 5  /  daqiqalar,
       vaqt = birinçi bosişdan öxirgi töğri bosişgaça.
       "−1" şuning uçun: birinçi bosiş faqat soatni yürgizadi, o'zi vaqt
       sarflamaydi. (8 belgi = 7 oraliq. Busiz qisqa maşqlarda tezlik oşib ketadi.)
     • Vaqtli maşqda (2:00 / 1:00): yozilgan belgilar / 5 / butun davr (daqiqada).
   Xato bosişlar belgi hisoblanmaydi, lekin vaqti ketadi — ya'ni tezlik "sof".
   Aniqlik = (jami bosişlar − xatolar) / jami bosişlar.
   Ustun bosib turişdan (key repeat) hisob buzilmasligi uçun input.js
   takrorlanuvçi bosişlarni umuman qabul qilmaydi.

   Provides: elapsedOf, wpmOf, accOf, liveWpm, addStats, avgWpm, avgAcc
   Depends: storage.js (P, today)
   ============================================================ */
const cn=s=>s.i-(s.wr?s.wr.size:0);   // töğri yozilgan belgilar soni (xato yozilganlari hisobga olinmaydi)
function elapsedOf(s,timeUp){return timeUp&&s.tm?s.tm:Math.max(0,(s.tl-s.t0)/1000)}
function wpmOf(s,timeUp){
 const n=cn(s);
 if(!s.t0||n<2)return 0;
 if(timeUp&&s.tm)return Math.round(n/5/(s.tm/60));
 const sec=(s.tl-s.t0)/1000;
 return sec>0.2?Math.round((n-1)/5/(sec/60)):0;
}
const accOf=s=>s.tot?Math.round(100*(s.tot-s.err)/s.tot):0;
// Yozib turgan paytdagi tezlik (juda erta, bir-ikki harfda körsatilmaydi)
const liveWpm=s=>(s.t0&&cn(s)>=3&&s.tl-s.t0>=1000)?wpmOf(s,false):0;

// Tugagan maşqni umumiy statistikaga qöşadi; ketgan vaqtni qaytaradi
function addStats(s,timeUp){
 const el=elapsedOf(s,timeUp);
 P.ch+=timeUp?cn(s):Math.max(0,cn(s)-1);
 P.ts+=el;P.kt+=s.tot;P.ke+=s.err;P.sec+=el;
 P.day[today()]=(P.day[today()]||0)+el;
 return el;
}
// Örtaça ko'rsatkiçlar: barçasi birlashtirilib hisoblanadi (tezliklar örtaçasi emas)
const avgWpm=()=>P.ts>=1?Math.round(P.ch/5/(P.ts/60)):null;
const avgAcc=()=>P.kt?Math.round(100*(P.kt-P.ke)/P.kt):null;
