/* ============================================================
   lessons.js — darslar röyxati va söz banki.
   k - yangi harflar (har biri alohida örgatiladi), r - takrorlaş,
   p - şaxsiy maşq, a - baholaş.
   Har bir dars ekranlari: yozişga oid maşqlar + öyinlar.
   QOİDA: har bir darsda öyinlar ekranlarning kamida 40% ini (va kamida 4 tasini) tashkil qiladi.
   Söz banki: faqat özbek tilida ma'noli sözlar (yangi alifboda).
   Provides: UN, ALL, mk, BANK, USED, pickN, wordsOf
   Depends: config.js
   ============================================================ */
const UN=[
{t:'Boşlaniş',ls:[
{t:'F, J va probel',k:['f','j']},
{t:'A va S',k:['a','s']},
{t:'D, K va L',k:['d','k','l']},
{t:'Takrorlaş 1',r:1}]},
{t:'Kengayiş',ls:[
{t:'Ş, G va H',k:['ş','g','h']},
{t:'E va I',k:['e','i']},
{t:'O va U',k:['o','u']},
{t:'Takrorlaş 2',r:1},
{t:'Şaxsiy maşq',p:1}]},
{t:'Yangi harflar',ls:[
{t:'R va T',k:['r','t']},
{t:'Q, Y va P',k:['q','y','p']},
{t:'Ö va Ğ',k:['ö','ğ']},
{t:'Takrorlaş 3',r:1}]},
{t:'Pastki qator',ls:[
{t:'N, M va B',k:['n','m','b']},
{t:'Z, X va V',k:['z','x','v']},
{t:'Ç',k:['ç']},
{t:'Tutuq belgisi ʼ',k:['ʼ']},
{t:'Takrorlaş 4',r:1}]},
{t:'Yakunlaş',ls:[
{t:'Bosh harflar',k:['A','Ö'],cap:1},
{t:'Nuqta va vergul',k:['.',','],ph:1},
{t:'Yakuniy takrorlaş',r:1},
{t:'Şaxsiy maşq',p:1},
{t:'Baholaş',a:1}]}
];

// Söz banki. Har bir söz — özbek tilida ma'noli. Harflar tartib bilan (örganilgan harflar bö'yiça) avtomatik tanlanadi.
const WORDS=`
asal dala kalla salla alla dalda fasl
şakl hafsala halal
ikki ilk iş dedi dedik işla gilas eski elak kişi kes sel fil ekiş esdalik şişa ikkala ahil asil
gul usul dolu olis oş asos oila odil sodda kulgi duo lola şola hosil solih kulol oldi gulladi
ota asr ertak terak turli tuş keldi ketdi sirli dars sirk şahar sahro dori ertaga ketdik keldik turdi ular tola toş tur iloj rost tort dost dostlar otaş sirt tuhfa rohat
qayta qaysi pul qop payt yiqildi qarsak qisqa pastki yoş poyga qar qora yurak yer yil paşşa qişloq qirol pilla pahta pol qatiq qatra quyoş quş toy qasr sayyora şoyi paypoq pirpirak yaproq oyoq qayiq quyi ayiq qulf qiş tuya yoqa parda ayol
köl tör yöl köp yöq ötkir ğalla ğişt ğayrat ğor töğri öğil ğoya ğurur öyla qöy qöl qöşiq qöriq körpa ölka körsat öqi toğ soğ yoğ tuğ ötdi öqiş köprik yölak yöqot töqay köylak
non ona men sen bola kitob salom maktab qalam bilan bahor nima bilim mehnat bölim boğ ğalaba olma anor banan şamol baliq bulut bodom mehr maşina maşq maslahat mamlakat mehmon maydon daryo qanot bayroq bino burun beşik inson daftar sinf sinfdoş nom nur nafas namuna nihol nok olmos sabr sabab tomon tamom umid sunbula bu bir bor bil barg bekat kun tun bugun ming tong yangi qanday nega menga senga şunday mana muşuk maymun bulbul bayram baraka baland oltin kumuş aka uka opa singil bobo amaki toğa
zor xona vaqt uzum yozuv xalq xizmat zavq daraxt kuz qiz xazina vazifa zamin bozor zebra xarita xat xabar xotira xursand zehn yulduz ziyo zamon zargar varaq vatan vodiy viloyat xamir xola xayol tuz qaz tez yoz ozod izla aziz zukko zakovat buvi tovuq uzoq ovoz savol javob sovğa devor dehqon mavzu zavod ziyofat ozuqa oziq zahmat
çoy çiroy çiroq çaman çaqmoq çiziq çopon çarx çeçak çöl çorşanba çin çelak çamadon çaqaloq çiqiş çaşma çoyxona çiroyli çapan çizma çigit çodir çumçuq çanqoq çavandoz çuqur çegara
maʼno eʼlon maʼlum taʼlim maʼqul eʼtibor maʼnaviyat taʼsir maʼdan taʼm daʼvo raʼno maʼrifat meʼmor şeʼr taʼmir maʼruza jamʼiyat
`.split(/\s+/).filter(Boolean);
// Bosh harf bilan boşlanadigan sözlar (Bosh harflar darsidan keyin)
const CAPS='Ata Ona Özbek Ğalaba Ilm Bahor Qalam Toşkent Samarqand Buxoro Xiva Namangan Andijon Farğona Navoiy Nukus Özbekiston Vatan Zamin Qarşi Termiz'.split(' ');
// Nuqta va vergulli iboralar
const PH=['Ota, ona.','Bahor keldi.','Köl, boğ.','Qalam, kitob.','Salom, dost.','Quyoş çiqdi.','Men keldim.','Biz keldik.','Toşkent, Buxoro.','Bu bahor.','Qiş keldi, qar yoğdi.','Bulut, yomğir.','Yurt, vatan.'];

let XB=[];try{XB=JSON.parse(localStorage.getItem('yozish.bank'))||[]}catch(e){}
// Yoqimsiz / ma'nosiz sözlar — banka hech qaçon tüşmaydi (ustoz qöşgan sözlardan ham olib tashlanadi)
const BLOCK=new Set('kasal jasad ajal hasad jahl kesak urdi qurt öğri çirik çivin öt meʼda ahd kel şaşka gajak saf ruh qirq tuyoq tirik'.split(' '));
const BANK=[...new Set(WORDS.concat(CAPS,PH,XB))].filter(w=>!BLOCK.has(w.toLowerCase()));

// Xilma-xillik: qaysi söz necha marta berilganini eslab qoladi — kam berilganlari birinçi tanlanadi
const USED={};
function pickN(pool,n){
 const a=sh([...new Set(pool)]);
 a.sort((p,q)=>(USED[p]||0)-(USED[q]||0));
 const out=a.slice(0,Math.min(n,a.length));
 out.forEach(w=>USED[w]=(USED[w]||0)+1);
 return sh(out);
}
// n ta söz: bank yetarli bölsa hammasi bir-biridan farqli; kam bölsa — har biri ençi bilan 2 martagaça
function wordsOf(pool,n){
 const u=pickN(pool,n);
 if(u.length>=n||u.length<3)return u;
 const m=sh(u);if(m[0]===u[u.length-1])m.push(m.shift());
 return u.concat(m).slice(0,n);
}

// O'yin turlari: harf o'yinlari har doim bor; söz o'yinlari faqat söz yetarli bölganda
const WG=['tiles','robot','race','climb','rocket'],LG=['tiles','climb'];
const okW=w=>/^[a-zçğöşʼ]{3,7}$/.test(w);
let GI=0;
function mk(l,prev){
 if(l.p)return[{t:'p'}];if(l.a)return[{t:'a'}];
 const K=l.k||[],T=[];
 const hasW=(l.w||[]).length>=4,hasM=(l.cw||[]).length>=8;
 if(K.length){
  K.forEach((c,i)=>T.push({t:'f',c},{t:'d',c,pv:K.slice(0,i)}));
  if(K.length==2)T.push({t:'g'});
  T.push(hasW?{t:'w'}:{t:'g'});
  if(K.length<3&&hasM)T.push({t:'m'});
 }else T.push({t:'m'},{t:'m'},{t:'m'},{t:'m'},{t:'m'});
 // Öyinlar: kamida 4 ta va ekranlarning kamida 40% i; tekis taqsimlanadi, öxirgisi öyin bölib tugaydi
 const G=Math.max(4,Math.ceil(T.length*2/3)),tot=T.length+G;
 const gl=(l.cw||[]).filter(okW).length>=8?WG:LG,off=GI++;
 const known=prev.slice(),out=[];let ti=0,gi=0;
 for(let i=0;i<tot;i++){
  if(Math.floor((i+1)*G/tot)>Math.floor(i*G/tot)){
   let kn=known.slice();if(kn.length<2)kn=prev.concat(K);
   out.push({t:'G',g:gl[(off+gi++)%gl.length],kn});
  }else{const s=T[ti++];if(s.t=='f')known.push(s.c);out.push(s)}
 }
 return out;
}

// Söz banki harf bö'yiça avtomatik tanlanadi (faqat örganilgan harflardan tuzilgan sözlar)
const ALL=[];let lk=[],cw=[],capOn=false;
UN.forEach(u=>u.ls.forEach(l=>{
 const prev=lk.slice();
 if(l.k){
  lk=lk.concat(l.k);
  if(l.cap)capOn=true;
  const s=new Set([...lk.map(c=>c.toLowerCase()),' ']);
  const typ=w=>[...w].every(c=>s.has(c)||(capOn&&s.has(c.toLowerCase())));
  if(l.cap)l.w=BANK.filter(w=>typ(w)&&/^[A-ZÖĞŞÇ]/.test(w)&&!/[ ,.]/.test(w));
  else if(l.ph)l.w=PH.filter(typ);
  else l.w=BANK.filter(w=>typ(w)&&[...w].some(c=>l.k.includes(c)));
  cw=BANK.filter(typ);
 }
 l.lk=lk;l.cw=cw;l.id='k'+ALL.length;l.sc=mk(l,prev);ALL.push(l);
}));
