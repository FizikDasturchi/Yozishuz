/* ============================================================
   lessons.js — darslar röyxati va söz banki.
   k - yangi harflar (har biri alohida örgatiladi), w - sözlar,
   r - takrorlaş, p - şaxsiy maşq, a - baholaş.
   Provides: UN, ALL, mk, XB, BANK
   Depends: config.js
   ============================================================ */
const UN=[
{t:'Boşlaniş',ls:[
{t:'F, J va probel',k:['f','j']},
{t:'A va S',k:['a','s']},
{t:'D, K va L',k:['d','k','l'],w:['asal','dala','sakla','salla','kalla','kasal','dalda','alla','fasl','jasad']},
{t:'Takrorlaş 1',r:1}]},
{t:'Kengayiş',ls:[
{t:'Ş, G va H',k:['ş','g','h'],w:['şakl','şal','hasad','galla','ahd','hal']},
{t:'E va I',k:['e','i'],w:['ikki','ilk','iş','esa','dedi','kelsa','dedik','işla','gilas']},
{t:'O va U',k:['o','u'],w:['gul','olis','sol','usul','dolu','huş']},
{t:'Takrorlaş 2',r:1},
{t:'Şaxsiy maşq',p:1}]},
{t:'Yangi harflar',ls:[
{t:'R va T',k:['r','t'],w:['ota','asr','ertak','otasi','terak','turli','tuş','ketdi','keldi','sirli']},
{t:'Q, Y va P',k:['q','y','p'],w:['qayta','qaysi','pul','qop','payt','yiqildi','qarsak','qisqa','pastki','yoş','poyga']},
{t:'Ö va Ğ',k:['ö','ğ'],w:['köl','tör','yöl','köp','yöq','ötkir','ğalla','ğişt','ğayrat','ğor','töğri','öğil']},
{t:'Takrorlaş 3',r:1}]},
{t:'Pastki qator',ls:[
{t:'N, M va B',k:['n','m','b'],w:['non','ona','men','sen','bola','kitob','salom','maktab','qalam','bilan','bahor','nima','bilim','mehnat','bölim','bağ','ğalaba']},
{t:'Z, X va V',k:['z','x','v'],w:['zor','zar','xona','vaqt','uzum','yozuv','xalq','xizmat','zavq','daraxt','kuz','qiz','xazina','vazifa','zamin','bozor']},
{t:'Ç',k:['ç'],w:['çoy','çiroy','çiroq','çaman','çaqmoq','çiziq','çopon','çarx','çeçak','çöl','çorşanba']},
{t:'Tutuq belgisi ʼ',k:['ʼ'],w:['maʼno','eʼlon','maʼlum','taʼlim','maʼqul','eʼtibor','iʼtibor','saʼy','maʼnaviyat','taʼsir']},
{t:'Takrorlaş 4',r:1}]},
{t:'Yakunlaş',ls:[
{t:'Bosh harflar',k:['A','Ö'],w:['Ata','Ona','Özbek','Ötkir','Ğalaba','Ilm','Bahor','Qalam']},
{t:'Nuqta va vergul',k:['.',','],w:['Ota, ona.','Bahor keldi.','Köl, bağ.','Qalam, kitob.','Salom, dost.']},
{t:'Yakuniy takrorlaş',r:1},
{t:'Şaxsiy maşq',p:1},
{t:'Baholaş',a:1}]}
];

// Dars ekranlari: har harf avval alohida (topiş + mashq), keyin qöşib, keyin sözlar
function mk(l){
 if(l.k){const s=[];
  l.k.forEach((c,i)=>s.push({t:'f',c},{t:'d',c,pv:l.k.slice(0,i)}));
  if(l.k.length>1)s.push({t:'g'},{t:'g'});
  if(l.w&&l.w.length)s.push({t:'w'},{t:'w'},{t:'m'});else s.push({t:'g'},{t:'g'});
  return s}
 if(l.p)return[{t:'p'}];if(l.a)return[{t:'a'}];
 return[0,1,2,3,4].map(()=>({t:'m'}));
}

// Söz banki: sözlar harf bo'yiça avtomatik tanlanadi (faqat örganilgan harflardan tuzilgan sözlar)
let XB=[];try{XB=JSON.parse(localStorage.getItem('yozish.bank'))||[]}catch(e){}
const BANK=[...new Set(UN.flatMap(u=>u.ls.flatMap(l=>l.w||[])).concat(XB))];
const typ=(w,s)=>[...w].every(c=>s.has(c));
const ALL=[];let lk=[],cw=[];
UN.forEach(u=>u.ls.forEach(l=>{
 if(l.k){lk=lk.concat(l.k);const s=new Set([...lk,' ']);
  if(l.k.every(c=>/[a-zçğöşʼ]/.test(c)))l.w=BANK.filter(w=>typ(w,s)&&[...w].some(c=>l.k.includes(c)));
  cw=BANK.filter(w=>typ(w,s))}
 l.lk=lk;l.cw=cw;l.id='k'+ALL.length;l.sc=mk(l);ALL.push(l)}));
