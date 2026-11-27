/* yozish.uz — backend (Google Apps Script). Ma'lumotlar: Drive papkasidagi jadval (Sheets) + fayllar.
   Ishga tushirish: 1) setup() ni bir marta yurgizing  2) Deploy > New deployment > Web app (Execute as: Me, Access: Anyone)
   3) URL ni src/core/config.js dagi API_URL ga qöying. */
const FOLDER_ID = '';            // bösh qoldirsangiz — "YozishUz" papkasi özi yaratiladi. Özingizning papkangiz bölsa ID sini yozing.
const MAIN = ['shamsiddinovmuhammadsodiq','muhammadsodiqshamsiddinov','rajabovdilshodbek','dilshodbekrajabov'];
const CD = 8000;                 // admin tasdiqlaganidan keyin boşlanişgaça sanoq (ms)
const H = {Users:['id','ism','fam','key','salt','hash','role','created'],
  Contests:['id','title','text','fileId','fileName','plan','dur','status','startAt','endAt','by','created'],
  Results:['cid','uid','name','wpm','acc','err','chars','sec','score','at']};
const PR = PropertiesService.getScriptProperties();

function setup(){
  if(PR.getProperty('SS')) return 'Allaqaçon tayyor';
  const f = FOLDER_ID ? DriveApp.getFolderById(FOLDER_ID) : DriveApp.createFolder('YozishUz');
  const ss = SpreadsheetApp.create('YozishUz-DB'); DriveApp.getFileById(ss.getId()).moveTo(f);
  Object.keys(H).forEach((n,i)=>{const s=i?ss.insertSheet(n):ss.getSheets()[0].setName(n); s.appendRow(H[n]);});
  const files = f.createFolder('fayllar');
  PR.setProperties({SS:ss.getId(), FILES:files.getId(), SECRET:Utilities.getUuid()+Utilities.getUuid()});
  return 'Tayyor';
}
function latinize(s){
  const map={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'s','ч':'ç','ш':'ş','щ':'ş','ъ':'','ь':'','ы':'i','э':'e','ю':'yu','я':'ya','ў':'ö','ғ':'ğ','қ':'q','ҳ':'h'};
  return String(s||'').replace(/[А-ЯЁЎҒҚҲЦЧШЩЪЬЫЭЮЯа-яёўғқҳцчшщъьыэюя]/g,c=>{let v=map[c.toLowerCase()];if(v===undefined)return c;return c===c.toUpperCase()?v.toUpperCase():v;})
    .replace(/[oO]\s*['ʻʼ’‘`´]/g,c=>c[0]=='O'?'Ö':'ö').replace(/[gG]\s*['ʻʼ’‘`´]/g,c=>c[0]=='G'?'Ğ':'ğ')
    .replace(/sh/gi,m=>m==='SH'?'Ş':m==='Sh'?'Ş':'ş').replace(/ch/gi,m=>m==='CH'?'Ç':m==='Ch'?'Ç':'ç');
}
function norm(s){return latinize(s).toLowerCase().replace(/[ş]/g,'sh').replace(/[ç]/g,'ch').replace(/[ö]/g,'o').replace(/[ğ]/g,'g').replace(/[ʻʼ’‘`´]/g,'').replace(/[^a-z]/g,'');}
function sheet(n){return SpreadsheetApp.openById(PR.getProperty('SS')).getSheetByName(n);}
let READ_CACHE={};
function all(n){if(READ_CACHE[n])return READ_CACHE[n];const v=sheet(n).getDataRange().getValues(),h=v.shift();return READ_CACHE[n]=v.map((r,i)=>{const o={_r:i+2};h.forEach((k,j)=>o[k]=r[j]);return o;});}
function invalidate(n){delete READ_CACHE[n];}
function put(n,o){sheet(n).appendRow(H[n].map(k=>o[k]===undefined?'':o[k]));invalidate(n);}
function setCell(n,r,k,v){sheet(n).getRange(r,H[n].indexOf(k)+1).setValue(v);invalidate(n);}
function hash(p,salt){let d=salt+p;for(let i=0;i<100;i++)d=Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,d+salt));return d;}
function sign(s){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s,PR.getProperty('SECRET')));}
function mkToken(uid){const b=uid+'.'+(Date.now()+30*864e5);return b+'.'+sign(b);}
function auth(t){
  const p=String(t||'').split('.'); if(p.length!=3||sign(p[0]+'.'+p[1])!==p[2]||+p[1]<Date.now()) return null;
  return all('Users').find(u=>u.id==p[0])||null;
}
const isAdm=u=>u&&(u.role=='admin'||u.role=='main');
const pub=u=>({id:u.id,name:u.fam+' '+u.ism,role:u.role});
function st(c,now){
  if(c.status=='running'&&c.endAt&&now>=+c.endAt){setCell('Contests',c._r,'status','ended');c.status='ended';}
  return c.status;
}
function doPost(e){
  let out,body;READ_CACHE={};
  try{body=JSON.parse(e.postData.contents);}catch(err){return ContentService.createTextOutput(JSON.stringify({ok:false,e:'JSON xato'})).setMimeType(ContentService.MimeType.JSON);}
  const writes=['register','changePass','setRole','deleteUser','create','approve','endNow','del','submit'];
  const lock=LockService.getScriptLock(),useLock=writes.includes(body.a);
  try{if(useLock)lock.waitLock(12000);out=route(body);}catch(err){out={ok:false,e:String(err.message||err)};}
  finally{if(useLock&&lock.hasLock())lock.releaseLock();}
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(){return ContentService.createTextOutput('yozish.uz API ishlayapti');}

function route(b){
  const now=Date.now(), u=auth(b.t), A=b.a;
  const need=(c,m)=>{if(!c)throw new Error(m||'Ruxsat yöq');};
  if(A=='register'){
    const ism=latinize(String(b.ism||'').trim()),fam=latinize(String(b.fam||'').trim()),p=String(b.p||'');
    need(ism&&fam,'Ism va familiyani yozing'); need(p.length>=6,'Parol kamida 6 belgi bölsin');
    const key=norm(ism)+'|'+norm(fam); need(norm(ism)&&norm(fam),'Ism-familiya notöğri');
    need(!all('Users').some(x=>x.key==key),'Bu ism-familiya allaqaçon röyhatdan ötgan');
    const salt=Utilities.getUuid(),main=MAIN.includes(norm(ism)+norm(fam))||MAIN.includes(norm(fam)+norm(ism));
    const n={id:Utilities.getUuid(),ism,fam,key,salt,hash:hash(p,salt),role:main?'main':'user',created:now};
    put('Users',n); return {ok:true,t:mkToken(n.id),u:pub(n)};
  }
  if(A=='login'){
    const key=norm(b.ism)+'|'+norm(b.fam),x=all('Users').find(r=>r.key==key);
    need(x&&x.hash===hash(String(b.p||''),x.salt),'Ism-familiya yoki parol xato');
    return {ok:true,t:mkToken(x.id),u:pub(x)};
  }
  if(A=='me') return {ok:true,u:u?pub(u):null,now};
  if(A=='changePass'){
    need(u,'Avval hisobga kiring'); const old=String(b.old||''),np=String(b.p||'');
    need(old&&u.hash===hash(old,u.salt),'Eski parol notoʻgʻri'); need(np.length>=6,'Yangi parol kamida 6 belgi boʻlsin');
    const salt=Utilities.getUuid(); setCell('Users',u._r,'salt',salt); setCell('Users',u._r,'hash',hash(np,salt)); return {ok:true};
  }
  if(A=='contests'){
    const rs=all('Results');
    return {ok:true,now,list:all('Contests').map(c=>({id:c.id,title:c.title,plan:+c.plan,dur:+c.dur,state:st(c,now),startAt:+c.startAt,endAt:+c.endAt,file:!!c.fileName,n:rs.filter(r=>r.cid==c.id).length}))
      .sort((a,z)=>a.plan-z.plan)};
  }
  if(A=='contest'){
    const c=all('Contests').find(x=>x.id==b.id); need(c,'Musobaqa topilmadi');
    const s=st(c,now),rs=all('Results').filter(r=>r.cid==c.id).sort((a,z)=>z.score-a.score);
    return {ok:true,now,c:{id:c.id,title:c.title,plan:+c.plan,dur:+c.dur,state:s,startAt:+c.startAt,endAt:+c.endAt,fileName:c.fileName,
      text:(u&&s=='running'&&now>=+c.startAt-500)?c.text:undefined},
      board:rs.map(r=>({name:r.name,wpm:r.wpm,acc:r.acc,score:r.score})),mine:!!(u&&rs.some(r=>r.uid==u.id))};
  }
  if(A=='users'){
    need(isAdm(u));
    return {ok:true,list:all('Users').map(x=>({id:x.id,name:x.fam+' '+x.ism,role:x.role,created:+x.created}))};
  }
  if(A=='setRole'){
    need(u&&u.role=='main','Faqat asosiy adminlar'); need(b.role=='admin'||b.role=='user');
    const x=all('Users').find(r=>r.id==b.id); need(x&&x.role!='main','Asosiy adminning rolini özgartirib bölmaydi');
    setCell('Users',x._r,'role',b.role); return {ok:true};
  }
  if(A=='deleteUser'){
    need(u&&u.role=='main','Faqat asosiy adminlar');
    const x=all('Users').find(r=>r.id==b.id); need(x&&x.role!='main','Asosiy adminni öçirib bölmaydi');
    const rs=all('Results').filter(r=>r.uid==x.id).map(r=>r._r).reverse(); rs.forEach(r=>sheet('Results').deleteRow(r));invalidate('Results');
    sheet('Users').deleteRow(x._r);invalidate('Users'); return {ok:true};
  }
  if(A=='create'){
    need(isAdm(u)); const title=latinize(String(b.title||'').trim()),text=latinize(String(b.text||'').trim());
    need(title&&text.length>=20,'Nom va matn (kamida 20 belgi) kerak'); need(text.length<=10000,'Matn 10 000 belgidan oşmasin');
    let fileId='',fileName='';
    if(b.file){need(b.file.b64.length<7e6,'Fayl 5 MB dan oşmasin');
      const f=DriveApp.getFolderById(PR.getProperty('FILES')).createFile(Utilities.newBlob(Utilities.base64Decode(b.file.b64),b.file.mime,b.file.name));
      fileId=f.getId();fileName=b.file.name;}
    put('Contests',{id:Utilities.getUuid(),title,text,fileId,fileName,plan:+b.plan,dur:0,status:'waiting',startAt:0,endAt:0,by:u.id,created:now});
    return {ok:true};
  }
  if(A=='approve'||A=='endNow'||A=='del'){
    need(isAdm(u)); const c=all('Contests').find(x=>x.id==b.id); need(c,'Topilmadi'); const s=st(c,now);
    if(A=='approve'){need(s=='waiting','Allaqaçon boşlangan');
      setCell('Contests',c._r,'status','running');setCell('Contests',c._r,'startAt',now+CD);setCell('Contests',c._r,'endAt',0);}
    if(A=='endNow'){need(s=='running');setCell('Contests',c._r,'status','ended');setCell('Contests',c._r,'endAt',now);}
    if(A=='del'){
      if(c.fileId){try{DriveApp.getFileById(c.fileId).setTrashed(true);}catch(e){}}
      const rs=all('Results').filter(r=>r.cid==c.id).map(r=>r._r).reverse(); rs.forEach(r=>sheet('Results').deleteRow(r));invalidate('Results');
      sheet('Contests').deleteRow(c._r);invalidate('Contests');
    }
    return {ok:true};
  }
  if(A=='submit'){
    need(u,'Avval röyhatdan öting'); const c=all('Contests').find(x=>x.id==b.id); need(c,'Topilmadi'); st(c,now);
    need(c.status=='running'&&now>=+c.startAt,'Musobaqa vaqti öçgan');
    need(!all('Results').some(r=>r.cid==c.id&&r.uid==u.id),'Natija allaqaçon saqlangan');
    const n=Math.max(0,Math.min(+b.n||0,c.text.length)),acc=Math.max(0,Math.min(100,+b.acc||0));
    const sec=Math.min(+b.sec||0,(now-+c.startAt)/1000+2);
    const wpm=b.tu?Math.round(n/5/(Math.max(1,sec)/60)):(sec>=1?Math.round(Math.max(0,n-1)/5/(sec/60)):0);
    need(wpm<=250,'Natija shubhali');
    const score=Math.round(wpm*acc);
    put('Results',{cid:c.id,uid:u.id,name:u.fam+' '+u.ism,wpm,acc,err:+b.err||0,chars:n,sec:Math.round(sec),score,at:now});
    return {ok:true,wpm,acc,score};
  }
  throw new Error('Nomaʼlum amal');
}
