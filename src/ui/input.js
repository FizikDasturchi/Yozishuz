/* ============================================================
   input.js — klaviatura bosişlarini qayta işlaş (maşq paytida).
   ENTER qoidasi: natija oynasida — yutsangiz keyingisiga, yutqazsangiz qaytadan.
   Öyin tugagan paytda (e'lon körinib turganda) ENTER natijani kutmay şuni darhol bajaradi.
   Depends: config.js, stats.js, sounds.js, hands.js, screens.js
   ============================================================ */
function charOf(e){
 if(e.ctrlKey||e.metaKey||e.altKey)return null;
 const m=KEYMAP[e.code];
 if(m&&(e.key===m[0]||e.key===m[1]))return e.key===m[1]?m[2].toUpperCase():m[2];
 const k=e.key;if(k.length!==1)return null;
 return "'’ʻ".includes(k)?'ʼ':k;
}
addEventListener('keydown',e=>{
 if(e.target.tagName=='TEXTAREA'||$('#pr').hidden)return;
 if(e.key=='Escape'){exit();return}
 if(e.key=='Enter'){
  e.preventDefault();if(e.repeat)return;
  const now=Date.now();
  if(!$('#res').hidden){
   if(now-S.resAt<800)return;   // yulduz va ballarni körişga ulgurişi uçun / tasodifiy qo'şa bosişdan saqlaş
   const b=$('#go');if(b&&!b.disabled)b.click();
  }else if(S.gm&&S.ending&&!S.done){
   if(now-S.endAt<350)return;
   finish();   // faqat natija oynasini körsatadi (yulduz va ballar körinadi); keyingisiga — yana ENTER
  }else if(S.find&&S.found){const b=$('#fgo');if(b)b.click()
  }else if(S.tk&&!S.done&&!S.gm&&!S.find){typeKey('\u21b5',now)}   // 10 key: Enter — satr oxiridagi belgi (↵)
  return}
 if(e.key=='Backspace'){
  e.preventDefault();
  if(S.done||S.find||S.gm||S.i<=0)return;
  S.i--;S.wr.delete(S.i);paint();return}
 if(S.done||(S.find&&S.found))return;
 const c=charOf(e);if(c===null)return;
 e.preventDefault();
 // Tugmani bosib turişda (key repeat) takroriy hodisalar tezlikni sun'iy oşirmasligi uçun rad etiladi
 if(e.repeat)return;
 const now=Date.now();
 if(S.gm){gameKey(c,now);return}
 typeKey(c,now);
});

// Bitta belgi yozildi (oddiy matn, topiş ekrani, sinov va 10 key uçun umumiy)
function typeKey(c,now){
 click(c===' '||c==='\u21b5');
 if(S.find){
  if(c===S.fc){S.found=true;S.bad=false;handsPress();snd.ding()}else{S.bad=true;snd.bad();shake($('#fc'))}
  paint();return}
 if(!S.t0){S.t0=now;S.tl=now;if(S.tm||CL.test)S.iv=setInterval(()=>{paint();if(S.tm&&Date.now()-S.t0>=S.tm*1000)finish(true)},250)}
 // Vaqt tugagan bö'lsa, taymer hali işlamagan bö'lsa ham bu bosiş hisobga olinmaydi (aks holda tezlik sun'iy oşadi)
 if(S.tm&&now-S.t0>=S.tm*1000){finish(true);return}
 const tg=S.text[S.i],okk=c===tg;
 S.tot++;
 if(tg!==' '&&!S.tk){const k=tg.toLowerCase(),v=P.keys[k]=P.keys[k]||{t:0,e:0};v.t++;if(!okk)v.e++}
 if(okk){S.tl=now;if(!CL.test)handsPress()}
 else{S.err++;S.wr.add(S.i);snd.bad();shake($('#txt'))}
 S.i++;
 if(S.i>=S.text.length){S.tl=now;finish();return}   // öxirgi bosiş (töğri bö'lsa ham, xato bö'lsa ham) vaqtga kiradi
 paint();
}

// Öyin paytida tugma: öyin özi töğri/xatoni hal qiladi, bu yerda statistika yuritiladi.
// (Öyinda tugma "tak" tovuşi yöq — öyinning özi musiqiy tovuş çiqaradi.)
function gameKey(c,now){
 const g=S.game;if(!g||g.over)return;
 const tg=g.target(),r=g.key(c);
 if(r===-1)return;
 if(!S.t0){S.t0=now;S.tl=now}
 S.tot++;
 if(tg&&tg!==' '){const k=tg.toLowerCase(),v=P.keys[k]=P.keys[k]||{t:0,e:0};v.t++;if(r===0)v.e++}
 if(r===1){S.i++;S.tl=now}else{S.err++;snd.bad()}
 paint();
}
// Tugma qöyvorilganda yengil tovuş (öyinda yöq)
addEventListener('keyup',e=>{
 if(e.target.tagName=='TEXTAREA'||$('#pr').hidden||$('#res').hidden===false||S.gm)return;
 if(charOf(e)===null)return;
 clickUp();
});
