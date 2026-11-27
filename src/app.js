/* ============================================================
   app.js — tugmalarni ulaş va saytni işga tuşiriş (öxirgi fayl).
   ============================================================ */
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v=='tests')tests();else home()};
$('#tl').onclick=e=>{const b=e.target.closest('button');if(b&&b.dataset.t)startTest(b.dataset.t)};
$('#units').onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)begin(+b.dataset.i)};
$('#wk').onclick=e=>{if(e.target.closest('button'))problem()};
$('#ex').onclick=exit;
$('#rd').onclick=()=>start();
$('#sn').onclick=e=>{SND=!SND;e.target.textContent='Tovuş '+(SND?'✓':'✗');if(SND){ac();snd.ding()}};
$('#rs').onclick=e=>{const b=e.target;
 if(!b.dataset.s){b.dataset.s=1;b.textContent='Aniqmi? Yana bosing';setTimeout(()=>{delete b.dataset.s;b.textContent='Boşidan'},3000);return}
 resetProgress();delete b.dataset.s;b.textContent='Boşidan';home();
};
function setLite(v,remember){
 LITE=!!v;document.documentElement.classList.toggle('lite',LITE);
 try{if(remember)localStorage.setItem('yozish.lite',LITE?'1':'0')}catch(e){}
 const b=$('#lt');if(b)b.textContent='Yengil '+(LITE?'✓':'✗');
 const h=$('#hsv');if(h&&!$('#pr').hidden){const hide=LITE||(S&&S.gm);h.style.display=hide?'none':'';}
 if(!LITE&&typeof handsStart==='function')handsStart();
}
$('#lt').onclick=()=>setLite(!LITE,true);
setLite(LITE,false);
handsBuild();
home();
