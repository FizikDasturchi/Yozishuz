/* ============================================================
   cloud.js — röyhatdan ötiş, "Qöşiş", "Musobaqa", foydalanuvçilar (Google Apps Script bilan).
   Depends: config.js (API_URL), screens.js, tests.js, converter.js (conv), sounds.js (snd)
   ============================================================ */
let U=null,TOK='',OFF=0,POLL=0,CUR=null;
try{TOK=localStorage.getItem('yozish.tok')||''}catch(e){}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const now=()=>Date.now()+OFF, p2=n=>String(n).padStart(2,'0');
const dt=ms=>{const d=new Date(ms);return `${p2(d.getDate())}.${p2(d.getMonth()+1)}.${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`};
async function api(a,o){
 if(!API_URL)throw new Error('API_URL hali qöyilmagan (src/core/config.js)');
 const r=await fetch(API_URL,{method:'POST',body:JSON.stringify(Object.assign({a,t:TOK},o))});   // Content-Type berilmaydi — CORS so'rovisiz işlaydi
 const j=await r.json();if(j.now)OFF=j.now-Date.now();
 if(!j.ok)throw new Error(j.e);return j;
}
const isAdm=()=>U&&(U.role=='admin'||U.role=='main');
function setU(j){U=j?j.u:null;if(j&&j.t){TOK=j.t;try{localStorage.setItem('yozish.tok',TOK)}catch(e){}}if(!U){TOK='';try{localStorage.removeItem('yozish.tok')}catch(e){}}authUI()}
function authUI(){
 const nav=$('#au');
 nav.innerHTML=U?`<button class="sm profile-trigger" id="profile" title="Hisob sozlamalari">👤 <span>${esc(U.name)}</span>${U.role=='main'?' ★':U.role=='admin'?' ✔':''}</button>`:`<button class="sm pri profile-trigger" id="li" title="Kirish / Röyhatdan ötiş">👤 Kirish</button>`;
 if(U)$('#profile').onclick=profilePanel;else $('#li').onclick=()=>login();
 $('#nu').hidden=true;
}
function profilePanel(){
 const d=$('#dg');
 d.innerHTML=`<h3>👤 ${esc(U.name)}</h3><p class="mut">${U.role=='main'?'Asosiy admin':U.role=='admin'?'Admin':'Foydalanuvçi'}</p><section class="card" style="padding:12px"><h3>🔑 Parolni almaştirish</h3><input id="po" type="password" placeholder="Eski parol"><input id="pn" type="password" placeholder="Yangi parol (kamida 6 belgi)"><input id="pc" type="password" placeholder="Yangi parolni qayta kiriting"><p class="mut" id="pe"></p><button class="pri" id="ps">Saqlash</button></section>${isAdm()?'<section id="profileUsers" style="margin-top:14px"><h3>Foydalanuvçilar</h3><p class="mut">Roʻyxat yuklanmoqda…</p></section>':''}<p><button id="px">Yopiş</button></p>`;
 $('#px').onclick=()=>d.close();
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
function navTo(v){curV=v;clearTimeout(POLL);CUR=null;({home,tests,addView,contView,usrView})[v==='home'?'home':v==='tests'?'tests':v==='add'?'addView':v==='cont'?'contView':'usrView']()}
function gate(v,html){show(v);if(!U){$('#'+v).innerHTML=`<section class="card"><h2>Bu bölim faqat röyhatdan ötganlar uçun</h2><p><button class="pri" id="gb">Kirish / Röyhatdan ötiş</button></p></section>`;$('#gb').onclick=()=>login();return false}return true}

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
const clean=t=>conv(t).replace(/[“”«»„]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
const picker=id=>`<input type="file" id="${id}f" accept=".pdf,.docx,.txt"><textarea id="${id}t" style="min-height:160px" placeholder="Matnni bu yerga yozing / qöying yoki PDF, DOCX fayl tanlang. Keyin kerakli qismini sişqonça bilan belgilang (belgilamasangiz — hammasi olinadi). Eski alifbodagi matn avtomatik yangi alifboga ötadi."></textarea><p class="mut" id="${id}i"></p>`;
function bindPicker(id){$('#'+id+'f').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#'+id+'i').textContent='Öqilmoqda…';
 try{$('#'+id+'t').value=(await readFile(f)).replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();$('#'+id+'i').textContent='Tayyor. Kerakli qismini belgilang.'}catch(x){$('#'+id+'i').textContent='Öqib bölmadi: '+x.message}}}
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
let CT='up';
async function contView(){
 show('cont');const el=$('#cont');
 el.innerHTML='<section class="card">Yuklanmoqda…</section>';
 let j;try{j=await api('contests')}catch(e){el.innerHTML=`<section class="card">${esc(e.message)}</section>`;return}
 const up=j.list.filter(c=>c.state!='ended'),past=j.list.filter(c=>c.state=='ended').reverse(),L=CT=='up'?up:past;
 const lab={waiting:'Admin tasdiqlaşini kutmoqda',running:'🔴 Boşlandi',ended:'Tugagan'};
 el.innerHTML=`<section class="card"><h2>Musobaqa</h2><p><button class="${CT=='up'?'pri':''}" id="c1">Kelgusi (${up.length})</button> <button class="${CT=='past'?'pri':''}" id="c2">Ötgan (${past.length})</button> ${isAdm()?'<button id="cn">＋ Yangi musobaqa</button>':''}</p><div id="cf"></div>
 ${L.map(c=>`<div class="tc" style="flex-direction:row;justify-content:space-between;margin:8px 0"><span><b>${esc(c.title)}</b><br><span class="mut">${dt(c.plan)} · ${lab[c.state]} · ${c.n} natija</span></span><span><button class="pri" data-o="${c.id}">Ochiş</button>${isAdm()?` <button data-d="${c.id}" title="Öçiriş">🗑</button>`:''}</span></div>`).join('')||'<p class="mut">Hozircha yöq</p>'}</section>`;
 $('#c1').onclick=()=>{CT='up';contView()};$('#c2').onclick=()=>{CT='past';contView()};
 if(isAdm())$('#cn').onclick=newContest;
 el.onclick=async e=>{const o=e.target.closest('[data-o]'),d=e.target.closest('[data-d]');
  if(o)contOpen(o.dataset.o);
  if(d){if(!d.dataset.s){d.dataset.s=1;d.textContent='Aniqmi?';return}d.disabled=true;try{await api('del',{id:d.dataset.d});contView()}catch(x){alert(x.message)}}};
}
function newContest(){
 const f=$('#cf'),d=new Date(Date.now()+36e5);d.setMinutes(0);
 f.innerHTML=`<div class="card" style="background:#f1faff;margin:10px 0"><input id="nt" placeholder="Musobaqa nomi" style="width:100%"><p>Boşlanişi: <input type="datetime-local" id="np" value="${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}T${p2(d.getHours())}:00"></p>${picker('n')}<button class="pri" id="ns">Saqlaş</button> <span class="mut" id="ne"></span></div>`;
 bindPicker('n');
 $('#ns').onclick=async()=>{const fl=$('#nnf').files[0],b=$('#ns');let file;
  try{if(fl&&/\.(pdf|docx)$/i.test(fl.name)){if(fl.size>4e6)throw new Error('Fayl 4 MB dan oşmasin');
    file={name:fl.name,mime:fl.type||'application/octet-stream',b64:await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.readAsDataURL(fl)})}}
   b.disabled=true;await api('create',{title:$('#nt').value,text:pickText('n'),plan:new Date($('#np').value).getTime(),dur:0,file});contView()}
  catch(x){$('#ne').textContent=x.message;b.disabled=false}};
}
async function contOpen(id){
 clearTimeout(POLL);CUR=id;const el=$('#cont');let played=false,begun=false,tk=0;
 const tick=async()=>{
  if(CUR!==id||curV!=='cont'||!$('#pr').hidden&&!begun){clearInterval(tk);return}
  let j;try{j=await api('contest',{id})}catch(e){el.innerHTML=`<section class="card">${esc(e.message)}</section>`;return}
  if(CUR!==id||$('#cont').hidden)return;
  const c=j.c,adm=isAdm();let body='';
  if(c.state=='waiting')body=`<p class="big">Musobaqa soat <b>${dt(c.plan)}</b> da Admin tasdiqlaganidan söng boşlanadi.</p>${adm?'<button class="pri" id="ap">✅ Tasdiqlaş va boşlaş</button>':'<p class="mut">Sahifada qoling — boşlanganda tovuş eşitiladi.</p>'}`;
  if(c.state=='running'){
   const left=Math.ceil((c.startAt-now())/1000);
   if(!played&&left>0){played=true;ac();snd.fanfare()}
   body=left>0?`<p class="big">Boşlanişiga: <b id="cd">${left}</b></p>`:`<p class="big">Musobaqa davom etmoqda…</p>`;
   if(adm)body+='<button id="ae">⏹ Tugatiş</button>';
  }
  if(c.state=='ended')body='<p class="big">Musobaqa tugadi.</p>';
  if(!U&&c.state!='ended')body+='<p><button class="pri" id="gb">Qatnaşiş uçun kirish / röyhatdan ötiş</button></p>';
  if(j.mine)body+='<p class="rs">✔ Natijangiz saqlangan.</p>';
  el.innerHTML=`<section class="card"><p><button id="cb">« Musobaqalar</button></p><h2>${esc(c.title)}</h2><p class="mut">${dt(c.plan)}${c.fileName?' · 📎 '+esc(c.fileName):''}</p>${body}
  <h3>Reyting</h3><table><tr><th>#</th><th>Ism</th><th>Söz/daq</th><th>Aniqlik</th><th>Ball</th></tr>${j.board.map((r,i)=>`<tr><td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td><td>${esc(r.name)}</td><td>${r.wpm}</td><td>${r.acc}%</td><td><b>${r.score}</b></td></tr>`).join('')||'<tr><td colspan="5" class="mut">Hali natija yöq</td></tr>'}</table><p class="mut">Ball = tezlik × aniqlik</p></section>`;
  $('#cb').onclick=()=>{CUR=null;clearTimeout(POLL);contView()};
  if($('#gb'))$('#gb').onclick=()=>login(()=>contOpen(id));
  if($('#ap'))$('#ap').onclick=async e=>{e.target.disabled=true;try{await api('approve',{id});snd.fanfare();tick()}catch(x){alert(x.message)}};
  if($('#ae'))$('#ae').onclick=async()=>{await api('endNow',{id});tick()};
  // Boşlanişga sanoq va öyin
  if(c.state=='running'&&U&&!j.mine&&!begun){
   const go=()=>{begun=true;const rem=0;
    playText(c.text,c.title,()=>{show('cont');contOpen(id)},{tm:rem,cb:async(r,x)=>{
     r.innerHTML='<h2>Yuborilmoqda…</h2>';
     try{const s=await api('submit',{id,n:x.n,acc:x.acc,err:x.errs,sec:x.el,tu:x.timeUp?1:0});snd.win(3);confetti();
      r.innerHTML=`<h2>Natijangiz: ${s.score} ball 🏁</h2><p class="rs">${s.wpm} söz/daq · ${s.acc}% aniqlik</p><p><button class="pri" id="go">Reytingni körişh</button></p>`}
     catch(e){r.innerHTML=`<h2>Yuborib bölmadi</h2><p>${esc(e.message)}</p><p><button class="pri" id="go">Orqaga</button></p>`}
     $('#go').onclick=exit}})};
   if(c.text&&now()>=c.startAt){go();return}
   if(left0(c)>0){clearInterval(tk);tk=setInterval(()=>{const n=Math.ceil((c.startAt-now())/1000),e=$('#cd');if(e)e.textContent=n;if(n<=2&&n>0)snd.ding()},500)}
  }
  POLL=setTimeout(tick,c.state=='ended'?10000:c.state=='running'&&c.startAt>now()?Math.min(2500,c.startAt-now()+150):2500);
 };
 const left0=c=>c.startAt-now();
 tick();
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
