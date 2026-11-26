/* ============================================================
   input.js — klaviatura bosişlarini qayta işlaş (maşq paytida).
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
  if(e.repeat)return;
  const b=!$('#res').hidden?$('#go'):(S.find&&S.found?$('#fgo'):null);
  if(b&&!b.disabled){e.preventDefault();b.click()}return}
 if(S.done||(S.find&&S.found))return;
 const c=charOf(e);if(c===null)return;
 e.preventDefault();
 // Tugmani bosib turişda (key repeat) takroriy hodisalar tezlikni sun'iy oşirmasligi uçun rad etiladi
 if(e.repeat)return;
 const now=Date.now();
 click(c===' ');
 if(S.find){
  if(c===S.fc){S.found=true;S.bad=false;handsPress();snd.ding()}else{S.bad=true;snd.bad();shake($('#fc'))}
  paint();return}
 if(!S.t0){S.t0=now;S.tl=now;if(S.tm)S.iv=setInterval(()=>{paint();if(Date.now()-S.t0>=S.tm*1000)finish(true)},500)}
 const tg=S.text[S.i],okk=c===tg;
 S.tot++;
 if(tg!==' '){const k=tg.toLowerCase(),v=P.keys[k]=P.keys[k]||{t:0,e:0};v.t++;if(!okk)v.e++}
 if(okk){S.bad=false;S.i++;S.tl=now;handsPress();if(S.i>=S.text.length){finish();return}}
 else{S.err++;S.bad=true;snd.bad();shake($('#txt'))}
 paint();
});
