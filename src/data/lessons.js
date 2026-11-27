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
// Qöşimcha söz banki (kengaytirilgan): mavzular bö'yiça — hayvon, meva, oila, maktab, uy, rang, fasl...
const WORDS2=`
sal kal ala aka dada daf kaf lak sajda alaf falsafa sahifa jiddi silsila alif dalil tahlil taklif tafsir taşkil
tarif taraf harf kerak erk fikr sehr jar jarroh orol sahar hatto teri ter tur tor toş tiş tuş asos usta teşik
eşit eşitdi atlas adras idrok odat aslida hali hol ahli dalolat adolat hudud tirsak ketiş keliş işlaş iştirok
teşa tilak doira dastur dostlik olti sutka sirka katta tilla turiş gulli sodda sirli turli asli işlar gul boğ
toğ daryo dengiz köl yer osmon yulduz quyoş bulut yomğir qor şamol tuman havo olov suv muz qum tuproq ötloq
örmon vodiy çöl dala soy buloq şarşara sayyora koinot raketa kosmos oydin daraxt barg şox ildiz gilos olma anor
uzum nok behi şaftoli örik olxöri anjir qovun tarvuz limon banan sabzi piyoz kartoşka pomidor bodring sarimsoq
qalampir karam turp lavlagi meva mevalar sabzavot eçki qöy sigir tuya eşak muşuk quyon tulki böri ayiq şer fil
maymun zebra burgut çumçuq kaptar bulbul tovuq xöroz ördak baliq kit delfin toşbaqa qurbaqa ilon çumoli asalari
kapalak ari paşşa hayvon quş uya ota ona uka opa singil buva buvi bobo momo amaki toğa xola amma qiz bola
farzand döst qöşni öqituvçi öquvçi talaba şifokor haydovçi quruvçi dehqon oşpaz yozuvçi şoir rassom sportçi
uçuvçi kitob daftar qalam ruçka maktab sinf dars imtihon baho savol javob söz gap matn şeʼr ertak hikoya rasm
xarita doska stol stul parta sumka luğat alifbo hisob raqam son bilim ilm aql ğoya masala misol maşq yozuv öqiş
yoziş kutubxona xona eşik deraza devor tom hovli oşxona divan gilam körpa yostiq çiroq soat oyna kalit qulf
idiş kosa piyola qoşiq piçoq çoynak non şörva somsa manti palov lağmon sut qatiq qaymoq pişloq tuxum göşt asal
şakar tuz yoğ çoy şarbat şirinlik tort bugun ertaga keça ertalab kun tun tong keç hafta yil fasl bahor yoz kuz
qiş daqiqa soniya bayram navröz duşanba seşanba çorşanba payşanba juma şanba yakşanba qizil sariq yaşil kök
qora puşti binafşa kiçik uzun qisqa baland past keng yangi eski yaxşi çiroyli issiq sovuq şirin nordon aççiq
yengil oğir tez sekin toza mazali kuçli dono mard jasur mehribon aqlli sodiq halol oçiq yopiq töla böş quruq
qalin yupqa yumşoq qattiq tiniq sokin xursand baxtli soğlom yozdi öqidi kuldi işladi öynadi sakradi uçdi
yugurdi suzdi bordi kördi topdi keldi ketdi turdi öylaydi yozadi öqiydi boşla tugat davom töxta kuta yordam
vatan xalq tinçlik döstlik mehnat hunar ziyo umid orzu maqsad ğalaba kuç quvonç baxt hayot odam inson yurt
şahar qişloq mahalla köça yöl köprik bozor dökon poyezd maşina velosiped samolyot kema avtobus bekat vokzal
boğça stadion kino teatr muzey park bino minora masjid madrasa salom rahmat marhamat xayr xuş iltimos keçirasiz
mehmon mezbon dasturxon bir ikki tört beş yetti sakkiz töqqiz yuz ming yoşlik qariya bolalik yigit qizça ukam
opam akam onam otam singlim toğli dengizda kölda daryoda dalada boğda uyda maktabda yopdi içdi ekdi çizdi qöşiq
aytdi raqs öyin öyinçoq töp arğimçoq sirpançiq uçar oltin kumuş temir mis yoğoç şişa qoğoz mato igna boş köz
quloq burun oğiz til soç qöl barmoq oyoq yurak qorin yelka tirnoq qönğiroq qönğiz qöçqor buzoq eçkilar qözi
kuçuk yilqi timsoh kiyik buğu ohu jirafa kenguru eşikdan derazadan köçadan maktabdan yaxşilik mehribonlik
halollik jasorat sabr
`.split(/\s+/).filter(Boolean);
// Bosh harf bilan boşlanadigan sözlar (Bosh harflar darsidan keyin)
const CAPS='Ata Ona Özbek Ğalaba Ilm Bahor Qalam Toşkent Samarqand Buxoro Xiva Namangan Andijon Farğona Navoiy Nukus Özbekiston Vatan Zamin Qarşi Termiz Ahmad Dilnoza Aziza Sardor Jasur Nodira Bobur Madina Malika Sevara Farhod Zafar Anvar Laylo Qaşqadaryo Sirdaryo Jizzax Surxondaryo Xorazm Margʻilon Qöqon Urganç Guliston Çirçiq Angren Denov Zarafşon'.split(' ').map(w=>w.replace('ʻ','ğ'));
// Nuqta va vergulli iboralar
const PH=['Ota, ona.','Bahor keldi.','Köl, boğ.','Qalam, kitob.','Salom, dost.','Quyoş çiqdi.','Men keldim.','Biz keldik.','Toşkent, Buxoro.','Bu bahor.','Qiş keldi, qar yoğdi.','Bulut, yomğir.','Yurt, vatan.','Bugun havo issiq.','Biz maktabga bordik.','Ona, men keldim.','Gul oçildi.','Bahor keldi, gul oçildi.','Osmon moviy, quyoş yorqin.','Dostlar, salom.','Daryo, toğ, dala.','Men yozaman.','Sen öqiysan.','Quyoş çiqdi, tong otdi.','Bola öynadi.','Ona non yopdi.','Kitob, daftar, qalam.','Olma, anor, uzum.','Yoz keldi, kun issiq.','Biz dostmiz.','Ustoz, rahmat.','Maktab, sinf, dars.','Tong otdi, quş sayradi.','Men öqiyman, sen yozasan.','Ota, ona, aka, uka.','Qiş, bahor, yoz, kuz.','Non, osh, suv, çoy.'];

let XB=[];try{XB=JSON.parse(localStorage.getItem('yozish.bank'))||[]}catch(e){}
// Yoqimsiz / ma'nosiz sözlar — banka hech qaçon tüşmaydi (ustoz qöşgan sözlardan ham olib tashlanadi)
const BLOCK=new Set('kasal jasad ajal hasad jahl kesak urdi qurt öğri çirik çivin öt meʼda ahd kel şaşka gajak saf ruh qirq tuyoq tirik'.split(' '));
const BANK=[...new Set(WORDS.concat(WORDS2,CAPS,PH,XB))].filter(w=>!BLOCK.has(w.toLowerCase()));

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
 const gl=WG,off=GI++;   // söz yetarli bölmasa ham barça öyin turlari işlaydi (söz ö'rniga harf bö'laklari beriladi)
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
