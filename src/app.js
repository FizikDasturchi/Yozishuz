/* ============================================================
   app.js — tugmalarni ulaş va saytni işga tuşiriş (öxirgi fayl).
   ============================================================ */
$('#units').onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)begin(+b.dataset.i)};
$('#wk').onclick=e=>{if(e.target.closest('button'))problem()};
$('#ex').onclick=exit;
$('#rd').onclick=()=>start();
$('#sn').onclick=e=>{SND=!SND;e.target.textContent='Tovuş '+(SND?'✓':'✗');if(SND){ac();snd.ding()}};
$('#rs').onclick=e=>{const b=e.target;
 if(!b.dataset.s){b.dataset.s=1;b.textContent='Aniqmi? Yana bosing';setTimeout(()=>{delete b.dataset.s;b.textContent='Boşidan'},3000);return}
 resetProgress();delete b.dataset.s;b.textContent='Boşidan';home();
};
handsBuild();
home();
