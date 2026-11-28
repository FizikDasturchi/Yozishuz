/* ============================================================
   cloud.js — röyhatdan ötiş, "Qöşiş", "Musobaqa", foydalanuvçilar (Google Apps Script bilan).
   Depends: config.js (API_URL), screens.js, tests.js, converter.js (conv), sounds.js (snd)
   ============================================================ */
let U=null,TOK='',OFF=0,POLL=0,CUR=null;
try{TOK=localStorage.getItem('yozish.tok')||'';if(TOK)U=JSON.parse(localStorage.getItem('yozish.u')||'null')}catch(e){}
// Kiril, eski lotin va yangi lotin yozuvini yangi alifboga keltirish.
function toNewAlphabet(s){
 const m={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'s','ч':'ch','ш':'sh','щ':'sh','ъ':'','ь':'','ы':'i','э':'e','ю':'yu','я':'ya','ў':'oʻ','ғ':'gʻ','қ':'q','ҳ':'h'};
 let x=String(s||'').replace(/[А-ЯЁЎҒҚҲЦЧШЩЪЬЫЭЮЯа-яёўғқҳцчшщъьыэюя]/g,ch=>{const v=m[ch.toLowerCase()];if(v===undefined)return ch;return ch===ch.toUpperCase()?v.toUpperCase():v;});
 return conv(x).replace(/[oO]\s*['ʻʼ’‘`´]/g,z=>z[0]=='O'?'Ö':'ö').replace(/[gG]\s*['ʻʼ’‘`´]/g,z=>z[0]=='G'?'Ğ':'ğ');
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const now=()=>Date.now()+OFF, p2=n=>String(n).padStart(2,'0');
const dt=ms=>{const d=new Date(ms);return `${p2(d.getDate())}.${p2(d.getMonth()+1)}.${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`};
async function api(a,o){
 if(!API_URL)throw new Error('API_URL hali qöyilmagan (src/core/config.js)');
 const t0=Date.now(),ct=new AbortController(),tm=setTimeout(()=>ct.abort(),30000);let j;
 try{const r=await fetch(API_URL,{method:'POST',body:JSON.stringify(Object.assign({a,t:TOK},o)),signal:ct.signal});j=await r.json()}   // Content-Type berilmaydi — CORS so'rovisiz işlaydi
 catch(e){throw new Error(e.name=='AbortError'?'Server javob bermadi. Qayta urinib köring.':'Serverga ulanib bölmadi. Qayta urinib köring.')}
 finally{clearTimeout(tm)}
 const t1=Date.now();if(j.now)OFF=j.now+(t1-t0)/2-t1;
 if(!j.ok)throw new Error(j.e);return j;
}
const isAdm=()=>U&&(U.role=='admin'||U.role=='main');
function setU(j){
 const prev=U?U.id:'';U=j?j.u:null;
 if(j&&j.t){TOK=j.t;try{localStorage.setItem('yozish.tok',TOK)}catch(e){}}
 if(U){try{localStorage.setItem('yozish.u',JSON.stringify(U))}catch(e){}}
 else{TOK='';try{localStorage.removeItem('yozish.tok');localStorage.removeItem('yozish.u')}catch(e){}}
 if((U?U.id:'')!==prev){CQ={list:null,u:''};for(const k in MINE)delete MINE[k];for(const k in JOINED)delete JOINED[k];try{localStorage.removeItem('yozish.cl')}catch(e){}}
 authUI();
}
function logout(){
 contStop();setU(null);const d=$('#dg');if(d.open)d.close();navTo('home');
}
function authUI(){
 const nav=$('#au');
 nav.innerHTML=U?`<button class="sm profile-trigger" id="profile" title="Hisob sozlamalari">👤 <span>${esc(U.name)}</span>${U.role=='main'?' ★':U.role=='admin'?' ✔':''}</button>`:`<button class="sm pri profile-trigger" id="li" title="Kirish / Röyhatdan ötiş">👤 Kirish</button>`;
 if(U)$('#profile').onclick=profilePanel;else $('#li').onclick=()=>login();
 $('#nu').hidden=true;
}
function profilePanel(){
 const d=$('#dg');
 d.innerHTML=`<h3>👤 ${esc(U.name)}</h3><p class="mut">${U.role=='main'?'Asosiy admin':U.role=='admin'?'Admin':'Foydalanuvçi'}</p><p><button id="lo">🚪 Akkauntdan çiqiş</button></p><section class="card" style="padding:12px"><h3>🔑 Parolni almaştirish</h3><input id="po" type="password" placeholder="Eski parol"><input id="pn" type="password" placeholder="Yangi parol (kamida 6 belgi)"><input id="pc" type="password" placeholder="Yangi parolni qayta kiriting"><p class="mut" id="pe"></p><button class="pri" id="ps">Saqlash</button></section>${isAdm()?'<section id="profileUsers" style="margin-top:14px"><h3>Foydalanuvçilar</h3><p class="mut">Roʻyxat yuklanmoqda…</p></section>':''}<p><button id="px">Yopiş</button></p>`;
 $('#px').onclick=()=>d.close();$('#lo').onclick=logout;
 $('#ps').onclick=async()=>{const b=$('#ps');b.disabled=true;$('#pe').textContent='Kuting…';try{if($('#pn').value!==$('#pc').value)throw new Error('Yangi parollar bir xil emas');await api('changePass',{old:$('#po').value,p:$('#pn').value});$('#pe').textContent='Parol almaştirildi';}catch(e){$('#pe').textContent=e.message;b.disabled=false}};
 d.showModal(); if(isAdm())loadProfileUsers();
}
async function loadProfileUsers(){
 const box=$('#profileUsers');if(!box)return;let j;try{j=await api('users')}catch(e){box.innerHTML=`<p class="mut">${esc(e.message)}</p>`;return}
 const main=U.role=='main',rl={main:'Asosiy admin',admin:'Admin',user:'Foydalanuvçi'};
 box.innerHTML=`<h3>Foydalanuvçilar (${j.list.length})</h3><input id="profileSearch" placeholder="Foydalanuvchini qidiriş…"><div id="profileList" style="max-height:280px;overflow:auto"></div>`;
 const draw=()=>{$('#profileList').innerHTML=j.list.filter(x=>x.name.toLowerCase().includes($('#profileSearch').value.toLowerCase())).map(x=>`<div class="tc" style="display:flex;flex-direction:row;justify-content:space-between;text-align:left;margin:6px 0"><span><b>${esc(x.name)}</b><br><small>${rl[x.role]}</small></span><span>${main&&x.role!='main'?`${x.role=='user'?`<button class="sm" data-r="admin" data-i="${x.id}">Admin qiliş</button>`:`<button class="sm" data-r="user" data-i="${x.id}">Adminlikdan çetlatiş</button>`} <button class="sm" data-x="${x.id}">🗑 Öçiriş</button>`:''}</span></div>`).join('')||'<p>Topilmadi.</p>'};draw();$('#profileSearch').oninput=draw;
 $('#profileList').onclick=async e=>{const b=e.target.closest('[data-r],[data-x]');if(!b)return;b.disabled=true;try{if(b.dataset.r)await api('setRole',{id:b.dataset.i,role:b.dataset.r});else if(confirm('Bu foydalanuvchi va uning natijalarini öçirish?'))await api('deleteUser',{id:b.dataset.x});else b.disabled=false;loadProfileUsers()}catch(x){alert(x.message);b.disabled=false}};
}
function changePass(){profilePanel();}
function login(cb){
 const d=$('#dg');let reg=false;
 const draw=()=>{d.innerHTML=`<h3>${reg?'Röyhatdan ötiş':'Kirish'}</h3><input id="gf" placeholder="Familiya"><input id="gi" placeholder="Ism"><div style="display:flex;gap:6px;align-items:center"><input id="gp" type="password" placeholder="Parol (kamida 6 belgi)" style="flex:1"><button type="button" id="eye" class="sm">👁</button></div><p class="mut" id="ge"></p><p><button class="pri" id="gok">${reg?'Röyhatdan ötiş':'Kirish'}</button> <button id="gx">Yopiş</button></p><p><a href="#" id="gs">${reg?'Hisobim bor — kirish':'Hisobim yöq — röyhatdan ötiş'}</a></p>`;
  $('#gs').onclick=e=>{e.preventDefault();reg=!reg;draw()};$('#gx').onclick=()=>d.close();$('#eye').onclick=()=>{const p=$('#gp');p.type=p.type=='password'?'text':'password';$('#eye').textContent=p.type=='password'?'👁':'🙈'};
  $('#gok').onclick=async()=>{const b=$('#gok');b.disabled=true;$('#ge').textContent='Kuting…';
   try{const j=await api(reg?'register':'login',{fam:$('#gf').value,ism:$('#gi').value,p:$('#gp').value});setU(j);d.close();if(cb)cb();else navTo(curV)}
   catch(e){$('#ge').textContent=e.message;b.disabled=false}};
 };
 draw();d.showModal();
}
// Bölimlar
let curV='home';
function navTo(v){curV=v;contStop();({home,tests,addView,contView,usrView})[v==='home'?'home':v==='tests'?'tests':v==='add'?'addView':v==='cont'?'contView':'usrView']()}
function gate(v,html){show(v);if(!U){$('#'+v).innerHTML=`<section class="card"><h2>Bu bölim faqat röyhatdan ötganlar uçun</h2><p><button class="pri" id="gb">Kirish / Röyhatdan ötiş</button></p></section>`;$('#gb').onclick=()=>login();return false}return true}

/* ---------- Oyna (dialog): yuqori öngda ✕ tugmasi va oynadan taşqarini bosganda yopiladi ---------- */
(()=>{
 const d=$('#dg');
 const ensureX=()=>{if(d.querySelector(':scope>.dx'))return;const b=document.createElement('button');b.type='button';b.className='dx';b.textContent='✕';b.title='Yopiş';b.setAttribute('aria-label','Yopiş');b.onclick=()=>d.close();d.prepend(b)};
 new MutationObserver(ensureX).observe(d,{childList:true});   // oyna ichi qayta çizilsa ham ✕ qaytadan qöyiladi
 d.addEventListener('click',e=>{
  if(e.target!==d)return;const r=d.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();
 });
})();

/* ---------- Matn tanlaş (Qöşiş va Musobaqa uçun umumiy) ---------- */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',PDFW='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',MAM='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
const lib=u=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>no(new Error('Kutubxona yuklanmadi'));document.head.appendChild(s)});
async function readFile(f){
 const n=f.name.toLowerCase(),buf=await f.arrayBuffer();
 if(n.endsWith('.pdf')){await lib(PDFJS);pdfjsLib.GlobalWorkerOptions.workerSrc=PDFW;const d=await pdfjsLib.getDocument({data:buf}).promise;let t='';
  for(let i=1;i<=d.numPages;i++)t+=(await(await d.getPage(i)).getTextContent()).items.map(x=>x.str).join(' ')+'\n';return t}
 if(n.endsWith('.docx')){await lib(MAM);return(await mammoth.extractRawText({arrayBuffer:buf})).value}
 return f.text();
}
// Yangi alifboga ötkazadi, belgilarni klaviaturaga moslaydi
const clean=t=>toNewAlphabet(t).replace(/[“”«»„]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
const picker=id=>`<input type="file" id="${id}f" accept=".pdf,.docx,.txt"><textarea id="${id}t" style="min-height:160px" placeholder="Matnni bu yerga yozing / qöying yoki PDF, DOCX fayl tanlang. Keyin kerakli qismini sişqonça bilan belgilang (belgilamasangiz — hammasi olinadi). Eski alifbodagi matn avtomatik yangi alifboga ötadi."></textarea><p class="mut" id="${id}i"></p>`;
function bindPicker(id){$('#'+id+'f').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#'+id+'i').textContent='Öqilmoqda…';
 try{const extracted=(await readFile(f)).replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();$('#'+id+'t').value=extracted;$('#'+id+'i').textContent=extracted.length?'Tayyor — matn textarea ichiga chiqarildi. Kerakli qismini belgilang; belgilamasangiz hammasi olinadi.':'PDF ichidan matn ajratilmadi. Bu skanerlangan (rasm) PDF bo‘lishi mumkin; matnni textarea ichiga qo‘lda kiriting.'}catch(x){$('#'+id+'i').textContent='Öqib bölmadi: '+x.message}}}
function pickText(id){const t=$('#'+id+'t'),a=t.selectionStart,b=t.selectionEnd;return clean(a<b?t.value.slice(a,b):t.value)}

/* ---------- Matnni yozib körişh (umumiy öyin ekrani) ---------- */
function playText(text,title,back,o){o=o||{};
 CL={id:'x',test:1,pk:1,tid:'x',t:title,k:[],lk:[],cw:[],back,cb:o.cb,sc:[{t:'T',tm:o.tm||0,mk:()=>text}]};CI=0;openPr();
}
const tile=(v,l)=>`<div><b>${v}</b>${l}</div>`;

/* ---------- Qöşiş ---------- */
function addView(){
 if(!gate('add'))return;
 $('#add').innerHTML=`<section class="card"><h2>Qöşiş</h2><p class="mut" style="margin:0 0 6px">Özingizning matningizni kiriting (matn, PDF yoki DOCX), bir qismini belgilang va şuni yozib maşq qiling.</p>${picker('a')}<button class="pri" id="ag">▶ Belgilangan qismini yozişni boşlaş</button></section>`;
 bindPicker('a');
 $('#ag').onclick=()=>{const t=pickText('a');if(t.length<5){$('#ai').textContent='Matn juda qisqa';return}
  const go=()=>playText(t,'Qöşiş',()=>navTo('add'),{cb:(r,x)=>{snd.win(starsOf(x.acc));
   r.innerHTML=`<h2>Natija</h2><div class="tst">${tile(x.wpm,'söz/daq')}${tile(x.acc+'%','aniqlik')}${tile(x.errs,'xato')}${tile(fmt(x.el),'vaqt')}</div><p><button id="bk">« Qöşiş</button> <button class="pri" id="go">Yana <kbd>ENTER</kbd></button></p>`;$('#bk').onclick=exit;$('#go').onclick=go}});
  go()};
}

/* ---------- Musobaqa ---------- */
// Tezlik: ro'yxat xotirada (va localStorage da) saqlanadi — bölim darhol açiladi, yangilaniş fonda ketadi.
// Tugmalar serverni kutmaydi: ekran darhol özgaradi, server javobi keyin tasdiqlanadi yoki qaytariladi.
// Yangilaniş faqat ma'lumot özgargandagina DOM ni almaştiradi (bosilayotgan tugma yöqolib qolmaydi).
let CT='up',CQ={list:null,u:''},DV=null,VT=0,LP=0,CQV=0,DELC='',DELT=0;
const JOINED={},MINE={},BUSY={},CD_MS=8000;
try{const q=JSON.parse(localStorage.getItem('yozish.cl')||'null');if(q&&Array.isArray(q.list)&&q.u===(U?U.id:''))CQ=q}catch(e){}
const cSave=()=>{try{localStorage.setItem('yozish.cl',JSON.stringify({u:U?U.id:'',list:CQ.list}))}catch(e){}};
const own=c=>!!(c&&(c.owner||(U&&c.by&&String(U.id)===String(c.by))));
const canManage=c=>own(c)||!!(U&&U.role=='main');
const cFind=id=>(CQ.list||[]).find(x=>x.id===id);
const setH=(sel,h)=>{const e=$(sel);if(e&&e.dataset.h!==h){e.dataset.h=h;e.innerHTML=h}};
function contStop(){VT++;clearTimeout(POLL);clearTimeout(LP);if(DV){clearInterval(DV.iv);clearTimeout(DV.goT);DV=null}CUR=null}
function contRefreshUI(){if(curV!=='cont'||$('#cont').hidden)return;if(DV)DV.draw();else if($('#clist'))drawList()}
function contPrefetch(){if(CQ.list)return;api('contests').then(j=>{if(!CQ.list){CQ={list:j.list,u:U?U.id:''};cSave()}}).catch(()=>{})}

const rowHtml=c=>{
 const o=own(c),lab={waiting:'Admin tasdiqini kutmoqda',running:'🔴 Boşlandi',ended:'Tugagan'}[c.state];
 const main=o&&c.state=='waiting'?`<button class="pri" data-a="ap" data-id="${c.id}">✅ Tasdiqlaş</button>`:`<button class="pri" data-a="open" data-id="${c.id}">Ochiş</button>`;
 const del=canManage(c)?` <button data-a="del" data-id="${c.id}" title="Öçiriş">${DELC===c.id?'Aniqmi?':'🗑'}</button>`:'';
 return `<div class="tc" style="flex-direction:row;justify-content:space-between;margin:8px 0"><span><b>${esc(c.title)}</b><br><span class="mut">${dt(c.plan)} · ${lab} · ${c.n} natija${o?' · Siz tashkilotçisiz':''}</span></span><span>${main}${del}</span></div>`;
};
function drawList(){
 if(!$('#ctabs'))return;
 const L=CQ.list||[],up=L.filter(c=>c.state!='ended'),past=L.filter(c=>c.state=='ended').reverse(),sel=CT=='up'?up:past;
 setH('#ctabs',`<button class="${CT=='up'?'pri':''}" data-a="t1">Kelgusi (${up.length})</button> <button class="${CT=='past'?'pri':''}" data-a="t2">Ötgan (${past.length})</button> ${isAdm()?'<button data-a="new">＋ Yangi musobaqa</button>':''}`);
 setH('#clist',sel.map(rowHtml).join('')||'<p class="mut">Hozircha yöq</p>');
}
function contView(){
 contStop();show('cont');
 const el=$('#cont');el.onclick=contClick;
 el.innerHTML='<section class="card"><h2>Musobaqa</h2><p id="ctabs"></p><div id="cf"></div><div id="clist"></div></section>';
 if(CQ.list)drawList();else $('#clist').innerHTML='<p class="mut">Yuklanmoqda…</p>';
 listLoop();
}
function listLoop(){
 const t=VT;
 const run=async()=>{
  if(t!==VT)return;
  const v=CQV;let j,err='';
  try{j=await api('contests')}catch(e){err=e.message}
  if(t!==VT)return;
  if(j){if(v===CQV){CQ={list:j.list,u:U?U.id:''};cSave();drawList();autoJoin()}}
  else if(!CQ.list)$('#clist').innerHTML=`<p class="mut">${esc(err)}</p>`;
  const act=(CQ.list||[]).some(c=>c.state!='ended');
  LP=setTimeout(run,(v!==CQV?800:act?3000:8000)+Math.random()*300);
 };
 run();
}
// Qatnaşuvçi ro'yxatda tursa va musobaqa boşlansa — özi ochiladi
function autoJoin(){
 if(!U||curV!=='cont'||DV||($('#cf')&&$('#cf').innerHTML))return;
 const c=(CQ.list||[]).find(c=>c.state=='running'&&!own(c)&&!c.mine&&!MINE[c.id]&&!JOINED[c.id]&&c.startAt-now()>-6000);
 if(c)contOpen(c.id);
}
function contClick(e){
 const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
 const a=b.dataset.a,id=b.dataset.id;
 if(a=='t1'){CT='up';drawList()}
 else if(a=='t2'){CT='past';drawList()}
 else if(a=='new')newContest();
 else if(a=='open')contOpen(id);
 else if(a=='ap')approveContest(id);
 else if(a=='del')delContest(id);
 else if(a=='end')endContest(id);
 else if(a=='back')contView();
 else if(a=='login')login(()=>contOpen(id));
 else if(a=='join'&&DV){delete JOINED[DV.id];DV.begun=false;if(DV.text)DV.arm();else DV.kick()}
}
async function approveContest(id){
 const c=cFind(id);if(!c||BUSY[id]||!own(c)||c.state!='waiting')return;
 BUSY[id]=1;CQV++;const prev=Object.assign({},c);
 c.state='running';c.startAt=0;c.pending=1;   // darhol: "Tasdiqlanmoqda…" körinadi
 contOpen(id);
 try{const j=await api('approve',{id});c.startAt=j.startAt||now()+CD_MS;delete c.pending;if(DV&&DV.id===id)DV.played=true;ac();snd.fanfare()}
 catch(x){Object.assign(c,prev);delete c.pending;alert(x.message)}
 delete BUSY[id];CQV++;cSave();
 if(DV&&DV.id===id){DV.draw();DV.kick()}
}
async function endContest(id){
 const c=cFind(id)||(DV&&DV.c);if(!c||BUSY[id])return;
 BUSY[id]=1;CQV++;const prev=c.state;c.state='ended';if(DV&&DV.id===id)DV.draw();
 try{await api('endNow',{id})}catch(x){c.state=prev;alert(x.message)}
 delete BUSY[id];CQV++;cSave();if(DV&&DV.id===id){DV.draw();DV.kick()}
}
function delContest(id){
 if(DELC!==id){DELC=id;drawList();clearTimeout(DELT);DELT=setTimeout(()=>{if(DELC===id){DELC='';drawList()}},4000);return}
 DELC='';const L=CQ.list||[],i=L.findIndex(x=>x.id===id);if(i<0)return;
 const it=L.splice(i,1)[0];CQV++;cSave();drawList();
 api('del',{id}).then(()=>{CQV++}).catch(x=>{CQ.list.push(it);CQ.list.sort((a,z)=>a.plan-z.plan);CQV++;cSave();drawList();alert(x.message)});
}
function newContest(){
 const f=$('#cf');if(f.innerHTML){f.innerHTML='';return}
 const d=new Date(Date.now()+36e5);d.setMinutes(0);
 f.innerHTML=`<div class="card" style="background:#f1faff;margin:10px 0"><label for="nTitle"><b>Musobaqa nomi (majburiy)</b></label><input id="nTitle" placeholder="Musobaqa nomi" style="width:100%"><p>Boşlanişi: <input type="datetime-local" id="np" value="${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}T${p2(d.getHours())}:00"></p>${picker('n')}<button class="pri" id="ns">Saqlaş</button> <span class="mut" id="ne"></span></div>`;
 bindPicker('n');
 $('#ns').onclick=async()=>{const fl=$('#nf').files[0],b=$('#ns');let file;
  try{const title=clean($('#nTitle').value),text=pickText('n');
   if(!title)throw new Error('Musobaqa nomini kiriting.');
   if(text.length<20)throw new Error('Matn topilmadi yoki juda qisqa (kamida 20 belgi). PDF/DOCX matnini textarea ichida tekshiring.');
   if(fl&&/\.(pdf|docx)$/i.test(fl.name)){if(fl.size>4e6)throw new Error('Fayl 4 MB dan oşmasin');
    file={name:fl.name,mime:fl.type||'application/octet-stream',b64:await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.readAsDataURL(fl)})}}
   b.disabled=true;$('#ne').textContent='Saqlanmoqda…';
   const j=await api('create',{title,text,plan:new Date($('#np').value).getTime(),dur:0,file});
   if(j.c)CQ.list=(CQ.list||[]).concat(j.c).sort((a,z)=>a.plan-z.plan);
   else{const r=await api('contests');CQ.list=r.list}
   CQV++;cSave();$('#cf').innerHTML='';drawList()}
  catch(x){$('#ne').textContent=x.message;b.disabled=false}};
}

function contOpen(id){
 contStop();show('cont');CUR=id;
 const el=$('#cont'),t=VT;el.onclick=contClick;
 el.innerHTML='<section class="card"><p><button data-a="back">« Musobaqalar</button></p><div id="dh"></div><div id="db"></div><h3>Reyting</h3><div id="dr"></div></section>';
 const d=DV={id,t,begun:false,played:false,dn:0,iv:0,goT:0,c:cFind(id)||null,board:null,mine:!!MINE[id],text:''};
 d.draw=()=>{
  if(VT!==t)return;const c=d.c;
  if(!c){setH('#dh','<h2>Yuklanmoqda…</h2>');return}
  const o=own(c),left=c.startAt?c.startAt-now():0,pre=c.state=='running'&&left>0;
  setH('#dh',`<h2>${esc(c.title)}</h2><p class="mut">${dt(c.plan)}${c.fileName?' · 📎 '+esc(c.fileName):''}${o?' · Siz tashkilotçisiz':''}</p>`);
  let b='';
  if(c.pending)b='<p class="big">⏳ Tasdiqlanmoqda…</p>';
  else if(c.state=='waiting'){
   b=`<p class="big">Musobaqa soat <b>${dt(c.plan)}</b> da tashkilotçisi tasdiqlaganidan söng boşlanadi.</p>`;
   b+=o?`<button class="pri" data-a="ap" data-id="${id}">✅ Tasdiqlaş va boşlaş</button><p class="mut">Siz tashkilotçisiz — musobaqada özingiz qatnaşa olmaysiz, natijalarni şu yerda körasiz.</p>`:'<p class="mut">Sahifada qoling — boşlanganda tovuş eşitiladi.</p>';
  }else if(c.state=='running'){
   b=pre?'<p class="big">Boşlanişiga: <b id="cd"></b></p>':'<p class="big">Musobaqa davom etmoqda…</p>';
   if(o)b+='<p class="mut">Siz tashkilotçisiz — musobaqada özingiz qatnaşa olmaysiz, natijalarni şu yerda kuzatib turing.</p>';
   else if(U&&!d.mine&&!d.begun&&JOINED[id])b+=`<p><button class="pri" data-a="join" data-id="${id}">▶ Qatnaşiş</button></p>`;
   if(canManage(c))b+=`<p><button data-a="end" data-id="${id}">⏹ Tugatiş</button></p>`;
  }else b='<p class="big">Musobaqa tugadi.</p>';
  if(!U&&c.state!='ended')b+=`<p><button class="pri" data-a="login" data-id="${id}">Qatnaşiş uçun kirish / röyhatdan ötiş</button></p>`;
  if(d.mine)b+='<p class="rs">✔ Natijangiz saqlangan.</p>';
  setH('#db',b);
  const e=$('#cd');if(e&&pre)e.textContent=Math.ceil(left/1000);
  setH('#dr',d.board?`<table><tr><th>#</th><th>Ism</th><th>Söz/daq</th><th>Aniqlik</th><th>Ball</th></tr>${d.board.map((r,i)=>`<tr><td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td><td>${esc(r.name)}</td><td>${r.wpm}</td><td>${r.acc}%</td><td><b>${r.score}</b></td></tr>`).join('')||'<tr><td colspan="5" class="mut">Hali natija yöq</td></tr>'}</table><p class="mut">Ball = tezlik × aniqlik</p>`:'<p class="mut">Yuklanmoqda…</p>');
 };
 const go=()=>{
  if(d.begun||VT!==t||!d.text||!d.c)return;
  d.begun=true;JOINED[id]=1;clearTimeout(POLL);clearTimeout(d.goT);clearInterval(d.iv);
  playText(d.text,d.c.title,()=>contOpen(id),{tm:0,cb:async(r,x)=>{
   r.innerHTML='<h2>Yuborilmoqda…</h2>';
   try{const s=await api('submit',{id,n:x.n,acc:x.acc,err:x.errs,sec:x.el,tu:x.timeUp?1:0});MINE[id]=1;snd.win(3);confetti();
    r.innerHTML=`<h2>Natijangiz: ${s.score} ball 🏁</h2><p class="rs">${s.wpm} söz/daq · ${s.acc}% aniqlik</p><p><button class="pri" id="go">Reytingni körişh</button></p>`}
   catch(e){r.innerHTML=`<h2>Yuborib bölmadi</h2><p>${esc(e.message)}</p><p><button class="pri" id="go">Orqaga</button></p>`}
   $('#go').onclick=exit}});
 };
 // Qatnaşuvçi: matn kelgan bölsa, aynan boşlanış vaqtida yozişni boşlaydi
 d.arm=()=>{
  const c=d.c;if(!c||!U||own(c)||d.mine||d.begun||JOINED[id]||c.state!='running'||!d.text)return;
  const w=c.startAt-now();clearTimeout(d.goT);
  if(w<=30)go();else d.goT=setTimeout(go,w);
 };
 const run=async()=>{
  if(VT!==t)return;
  if(BUSY[id]){POLL=setTimeout(run,700);return}
  const v=CQV;let j;
  try{j=await api('contest',{id})}
  catch(e){if(VT!==t)return;if(!d.c)setH('#dh',`<p>${esc(e.message)}</p>`);POLL=setTimeout(run,5000);return}
  if(VT!==t)return;
  if(v!==CQV||BUSY[id]){POLL=setTimeout(run,500);return}
  const srv=Object.assign({},j.c);delete srv.text;
  const it=cFind(id);if(it){Object.assign(it,srv);it.n=j.board.length;it.mine=j.mine;d.c=it}else d.c=srv;
  d.board=j.board;d.mine=!!(j.mine||MINE[id]);if(j.c.text)d.text=j.c.text;
  const c=d.c;
  if(c.state=='running'&&c.startAt>now()&&!d.played){d.played=true;ac();snd.fanfare()}
  d.draw();d.arm();
  let nx=3000;
  if(c.state=='ended')nx=12000;
  else if(c.state=='running'){const w=c.startAt-now();nx=(w>0&&U&&!own(c)&&!d.mine&&!d.begun&&!JOINED[id]&&!d.text)?Math.max(400,w-3000+200):4000}
  POLL=setTimeout(run,nx+Math.random()*300);
 };
 d.kick=()=>{clearTimeout(POLL);run()};
 d.iv=setInterval(()=>{
  if(VT!==t){clearInterval(d.iv);return}
  const c=d.c;if(!c)return;d.draw();
  if(c.state=='running'&&c.startAt&&!c.pending){const w=c.startAt-now(),n=Math.ceil(w/1000);
   if(n<=2&&n>0&&d.dn!==n){d.dn=n;snd.ding()}
   if(w<=30)d.arm()}
 },250);
 d.draw();run();
}

/* ---------- Foydalanuvçilar ---------- */
async function usrView(){
 if(!isAdm()){navTo('home');return}
 show('usr');const el=$('#usr');el.innerHTML='<section class="card">Yuklanmoqda…</section>';
 let j;try{j=await api('users')}catch(e){el.innerHTML=`<section class="card">${esc(e.message)}</section>`;return}
 const rl={main:'Asosiy admin',admin:'Admin',user:'Foydalanuvçi'},mn=U.role=='main';
 el.innerHTML=`<section class="card"><h2>Foydalanuvçilar (${j.list.length})</h2><input id="us" placeholder="Qidiriş…" style="width:100%"><table id="ut"></table></section>`;
 const draw=()=>{const q=$('#us').value.toLowerCase();$('#ut').innerHTML='<tr><th>Ism</th><th>Rol</th><th>Röyhat sanasi</th>'+(mn?'<th></th>':'')+'</tr>'+j.list.filter(x=>x.name.toLowerCase().includes(q)).map(x=>`<tr><td>${esc(x.name)}</td><td>${rl[x.role]}</td><td>${dt(x.created)}</td>${mn?`<td>${x.role=='user'?`<button class="sm" data-r="admin" data-i="${x.id}">Admin qilişh</button>`:x.role=='admin'?`<button class="sm" data-r="user" data-i="${x.id}">Adminlikdan çetlatiş</button>`:''}</td>`:''}</tr>`).join('')};
 draw();$('#us').oninput=draw;
 $('#ut').onclick=async e=>{const b=e.target.closest('[data-r]');if(!b)return;b.disabled=true;
  try{await api('setRole',{id:b.dataset.i,role:b.dataset.r});usrView()}catch(x){alert(x.message)}};
}
