/* ============================================================
   design.js — saytning butun dizayni (ranglar, şrift, joylaşuv).
   index.html ning <head> ida yuklanadi va <style> qilib qöşiladi,
   şuning uçun sahifa çizilganda dizayn tayyor bölib turadi.
   Dizaynni özgartiriş uçun faqat şu fayl tahrir qilinadi.
   ============================================================ */
(function () {
const css = `
*{box-sizing:border-box}
[hidden]{display:none!important}
:root{color-scheme:light;--ink:#24384d;--mut:#62788d;--sky:#2aa8e8;--skyd:#1688c4;--sun:#ffc933;--sund:#e0a200;--bd:#d6e8f4;--ok:#2fae5f;--err:#ff5a5f;--cur:#cdeaff;--card:#fff;--skin:#f1c3a5}
html{scroll-behavior:smooth}
body{margin:0;color:var(--ink);font:17px/1.55 "Trebuchet MS","Segoe UI",Verdana,system-ui,sans-serif;background:linear-gradient(180deg,#d4f0ff 0,#eef9ff 340px,#fff9ea 100%);min-height:100vh}
main{max-width:960px;margin:0 auto;padding:16px 20px 48px}
h2{margin:0 0 10px;font-size:22px}

/* Yuqori panel */
#hd{background:var(--sky);color:#fff;box-shadow:0 4px 0 var(--skyd)}
#hd .in{max-width:960px;margin:0 auto;padding:12px 20px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.logo{font-size:30px;font-weight:800;letter-spacing:.5px}
.logo span{color:var(--sun)}
#hd small{font-size:16px;opacity:.95}

/* Tugmalar */
button{font:inherit;font-weight:700;color:var(--ink);background:#fff;border:2px solid var(--bd);border-radius:999px;padding:6px 18px;cursor:pointer;box-shadow:0 3px 0 var(--bd);transition:transform .06s}
button:hover:not(:disabled){border-color:var(--sky)}
button:active:not(:disabled){transform:translateY(2px);box-shadow:none}
button:focus-visible{outline:3px solid var(--skyd);outline-offset:2px}
button:disabled{opacity:.5;cursor:default;box-shadow:none}
button.pri{background:var(--sun);border-color:var(--sund);box-shadow:0 4px 0 var(--sund);padding:10px 26px;font-size:18px}
button.sm{padding:4px 14px;font-size:15px}

.card{background:var(--card);border-radius:22px;padding:20px;box-shadow:0 6px 0 #cfe3f1}

/* Bosh sahifa: nihol va statistika */
.hero{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:20px 0}
#tr{display:flex;gap:16px;align-items:center}
#tr svg{background:linear-gradient(#bfe8ff,#eaf8ff);border-radius:50%;flex:none}
#tr .tt{font-size:15px;color:var(--mut)}
#tr .tt b{font-size:19px;color:var(--ink)}
.chips{display:flex;gap:10px;flex-wrap:wrap;flex:1;min-width:240px}
.chip{background:#f1faff;border-radius:14px;padding:8px 14px;flex:1;min-width:120px;font-size:14px;color:var(--mut)}
.chip b{display:block;font-size:24px;line-height:1.2;color:var(--skyd)}
.chip.wide{flex-basis:100%}
.pb{height:12px;background:#e3eef6;border-radius:6px;overflow:hidden;margin:6px 0}
.pb i{display:block;height:100%;background:linear-gradient(90deg,#6fd36f,#2fae5f);border-radius:6px}
#wk{margin:0 0 16px}

/* Darslar */
.uh{display:inline-block;margin:22px 0 10px;padding:4px 16px;border-radius:999px;color:#fff;font-size:19px;font-weight:800}
.u0{background:#2aa8e8}.u1{background:#2fae5f}.u2{background:#ff9433}.u3{background:#9b5cff}.u4{background:#ec4fbe}
.ls{background:#fff;border:2px solid var(--bd);border-radius:18px;padding:12px 16px;margin-bottom:10px}
.ls.cur{border-color:var(--sun);box-shadow:0 0 0 4px #fff1bd}
.ls.lock{background:#f3f7fa;color:#8da0b1}
.lt{display:flex;align-items:center;gap:10px;font-weight:700}
.lt button{margin-left:auto}
.no{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;border-radius:50%;background:#e4f4ff;color:var(--skyd);font-size:14px}
.sg{display:flex;gap:3px;margin-top:8px}
.sg i{flex:1;height:8px;background:#e3eef6;border-radius:4px}
.sg i.f{background:var(--ok)}
.sg i.c{background:var(--sun)}

/* Maşq ekrani */
.pbar{display:flex;align-items:center;gap:10px;background:var(--sky);color:#fff;border-radius:18px;padding:10px 14px;box-shadow:0 4px 0 var(--skyd);margin:6px 0 12px}
.pbar b{flex:1;text-align:center;font-size:19px}
.pbar button{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.65);box-shadow:none}
.pbar button:hover:not(:disabled){background:rgba(255,255,255,.32);border-color:#fff}
#fc{text-align:center;padding:26px 16px}
#fc .big{font-size:24px;margin:14px 0}
.kbx{display:inline-block;min-width:84px;padding:4px 20px;background:#fff;border:3px solid var(--sky);border-radius:18px;box-shadow:0 6px 0 var(--skyd);font-size:64px;font-weight:800;line-height:1.3;vertical-align:middle;margin-left:10px}
.kbx.bad{background:var(--err);border-color:#d63c41;box-shadow:0 6px 0 #d63c41;color:#fff}
.kbx.sm{font-size:40px;min-width:56px;box-shadow:0 4px 0 var(--skyd)}
.bx{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.bx span{width:clamp(36px,9vw,76px);height:clamp(54px,12vw,100px);display:flex;align-items:center;justify-content:center;font:700 clamp(28px,6vw,52px) "Consolas","Courier New",monospace;background:#f1faff;border:2px solid var(--bd);border-radius:14px}
.bx .ok{background:var(--ok);border-color:var(--ok);color:#fff}
.bx .cur{background:var(--sky);border-color:var(--skyd);color:#fff;box-shadow:0 5px 0 var(--skyd)}
.bx .bad{background:var(--err);border-color:#d63c41;color:#fff}
#txt{font:600 28px/2 "Consolas","Courier New",monospace;white-space:pre-wrap;background:#fff;border-radius:22px;padding:18px 22px;min-height:5.5em;box-shadow:0 6px 0 #cfe3f1}
#txt:has(.bx){text-align:center}
#txt .ok{color:var(--ok)}
#txt .cur{background:var(--cur);border-bottom:4px solid var(--sky);border-radius:4px}
#txt .bad{background:#ffd5d6;border-bottom:4px solid var(--err);border-radius:4px}
#lv{display:flex;gap:10px;justify-content:center;margin:14px 0 4px;flex-wrap:wrap}
#lv span{background:#fff;border-radius:999px;padding:3px 16px;font-weight:700;color:var(--skyd);box-shadow:0 3px 0 #cfe3f1}
#hint{margin:8px 0;min-height:1.6em;text-align:center;font-size:18px}
.shake{animation:shake .25s}
@keyframes shake{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}

/* Barmoq ranglari: klaviatura va qöllar uçun ortaq */
.f-lp{--fc:#ff5d85;--fp:#ffe1e9}
.f-lr{--fc:#ff9433;--fp:#ffebd2}
.f-lm{--fc:#f2bd00;--fp:#fff4c4}
.f-li{--fc:#3dbb5a;--fp:#d9f6df}
.f-ri{--fc:#1fb0d6;--fp:#d3f1f9}
.f-rm{--fc:#4a86ff;--fp:#dae6ff}
.f-rr{--fc:#9b5cff;--fp:#eadcff}
.f-rp{--fc:#ec4fbe;--fp:#fcdcf1}
.f-th{--fc:#ffa94d;--fp:#ffe8cc}

/* Klaviatura. Qator balandligi eniga bog'langan (1 tugma = 1 birlik), qöllar şu birlikda çiziladi */
#kbs{position:relative;width:min(100%,900px);margin:18px auto 0}
#kbw{background:#e3f1fb;border-radius:20px;padding:10px}
.r{display:grid;grid-template-columns:repeat(60,1fr);grid-template-rows:1fr;aspect-ratio:15/1}
.k{grid-column:span 4;margin:2px;position:relative;display:flex;align-items:center;justify-content:center;border-radius:9px;font-style:normal;font-weight:800;font-size:clamp(11px,2.4vw,22px);text-transform:uppercase;color:var(--ink);background:var(--fp);border:2px solid var(--fc)}
.k.d{background:#f1f6fa;border-color:transparent;color:#a3b3c2;font-size:11px;font-weight:600;text-transform:none}
.k.sh,.k.sp{font-size:clamp(10px,1.8vw,15px);text-transform:none}
.k.sp{grid-column:17/span 28}
.k.n{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--fc)}
.k.hm::after{content:"";position:absolute;bottom:14%;width:28%;height:3px;border-radius:2px;background:var(--fc)}
.k.x{background:var(--fc);color:#fff;transform:translateY(-3px) scale(1.1);box-shadow:0 6px 0 rgba(0,0,0,.18),0 0 18px var(--fc);position:relative;z-index:2}
.kbsp{aspect-ratio:15/3.2}

/* Qöllar (klaviatura üstida, yarim şaffof, haqiqiydek). Faol barmoq töliq rangga kiradi */
#hsv{position:absolute;left:10px;top:10px;width:calc(100% - 20px);height:auto;aspect-ratio:15/6.9;overflow:visible;pointer-events:none;z-index:5}
.hand{opacity:.72}
.po,.fo{fill:none;stroke:#b07a58;stroke-width:.14;stroke-linejoin:round}
.fo.on{stroke:#2a3b4d;stroke:color-mix(in srgb,var(--fc) 55%,#000)}
.palm,.fg .fs{fill:var(--skin);stroke:none}
.tn{fill:none;stroke:#b07a58;stroke-opacity:.2;stroke-width:.05;stroke-linecap:round}
.fg .fa{fill:var(--fc);opacity:0}
.fg.on .fa,.fg.on2 .fa{opacity:.9}
.fg .fh{fill:none;stroke:#fff;stroke-opacity:.35;stroke-width:.1;stroke-linecap:round;stroke-linejoin:round}
.fg .fc{fill:none;stroke:#a9693f;stroke-opacity:.33;stroke-width:.03;stroke-linecap:round}
.col{fill:var(--fc);opacity:.2}

/* Öyinlar (canvas — DOM animatsiyasi yöq, şuning uçun qotmaydi) */
#gm{position:relative;margin:0 0 12px;border-radius:22px;overflow:hidden;box-shadow:0 6px 0 #cfe3f1;background:#bfe9ff;user-select:none;-webkit-user-select:none}
#gm canvas{display:block;width:100%}
.amz{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:5;background:rgba(14,28,56,.4);animation:amzbg .25s both}
.amz b{font:900 clamp(38px,8vw,66px) "Trebuchet MS",sans-serif;color:#ffc933;-webkit-text-stroke:6px #ff8a1f;paint-order:stroke fill;text-shadow:0 5px 0 #c25a00;animation:amz .5s both}
.amz.lose b{color:#e8f1fa;-webkit-text-stroke:6px #4a6786;text-shadow:0 5px 0 #2d4258}
.amz small{font:800 clamp(15px,2.4vw,20px) "Trebuchet MS",sans-serif;color:#fff;background:rgba(0,0,0,.38);padding:4px 18px;border-radius:999px;animation:amzbg .5s .3s both}
@keyframes amz{0%{transform:scale(0) rotate(-20deg)}70%{transform:scale(1.15) rotate(-3deg)}100%{transform:scale(1) rotate(-4deg)}}
@keyframes amzbg{from{opacity:0}to{opacity:1}}
kbd{font:800 12px "Trebuchet MS",sans-serif;background:rgba(255,255,255,.65);border:1px solid rgba(0,0,0,.18);border-radius:6px;padding:1px 7px;margin-left:6px;vertical-align:middle}

/* Natija */
#res{text-align:center;position:relative;overflow:hidden}
.stars span{display:inline-block;font-size:60px;line-height:1;color:#d3dee8}
.stars span.on{color:var(--sun);text-shadow:0 4px 0 var(--sund);animation:pop .55s both}
@keyframes pop{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.3) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
.rs{font-size:19px;margin:8px 0}
.rs b{color:var(--skyd)}
.pg{text-align:left;max-width:560px;margin:16px auto}
.sn{display:flex;gap:3px;margin:8px 0}
.sn i{flex:1;text-align:center;font-style:normal;font-size:12px;background:#e3eef6;border-radius:5px;padding:2px 0}
.sn i.f{background:var(--sun)}
.sn i.c{outline:2px solid var(--sky)}
.cf{position:fixed;top:-40px;font-size:26px;pointer-events:none;z-index:50;animation:fall 2.6s linear forwards}
@keyframes fall{to{transform:translateY(112vh) rotate(420deg)}}

details{margin:16px 0;background:#fff;border-radius:16px;padding:10px 16px;box-shadow:0 4px 0 #cfe3f1}
summary{cursor:pointer;font-weight:700;color:var(--skyd)}
textarea{width:100%;min-height:70px;font:inherit;background:#f7fbfe;color:var(--ink);border:2px solid var(--bd);border-radius:12px;padding:8px;margin:6px 0}
td,th{padding:2px 12px;text-align:left}
.mut{color:var(--mut)}
@media(prefers-reduced-motion:reduce){.shake,.stars span.on{animation:none!important}.cf{display:none}}
.cf{will-change:transform}
.lst{margin-left:6px;font-size:14px;color:var(--sund);font-weight:800}
.gain{font:900 36px "Trebuchet MS",sans-serif;color:var(--sund);margin:4px 0}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:92vw;background:#24384d;color:#fff;padding:10px 18px;border-radius:14px;z-index:60;font-size:15px;box-shadow:0 4px 0 rgba(0,0,0,.25)}
/* Yuqori panel: bölimlar (Darslar / Sinov) */
#nav{margin-left:auto;display:flex;gap:8px;align-self:center}
#nav button{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.65);box-shadow:none;padding:6px 22px;font-size:17px}
#nav button:hover:not(:disabled){background:rgba(255,255,255,.32);border-color:#fff}
#nav button.on,#nav button.on:hover:not(:disabled){background:#fff;color:var(--skyd);border-color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.15)}

/* Sinov bölimi */
.tg{border-radius:22px;padding:18px 20px;margin:18px 0;color:#fff;box-shadow:0 6px 0 rgba(0,0,0,.15)}
.tg h3{margin:0 0 12px;font-size:22px}
.tg.u0{background:#2aa8e8}.tg.u1{background:#2fae5f}.tg.u2{background:#ff9433}
.tcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.tc{background:#fff;color:var(--ink);border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.tc>b{font-size:28px;line-height:1.2}
.tbest{font-size:14px;color:var(--mut);min-height:1.4em}
.tbest b{color:var(--skyd)}
.tc button{padding:8px 14px;font-size:16px;width:100%}
.tbar{flex:1;height:10px;background:#e3eef6;border-radius:6px;overflow:hidden}
.tbar u{display:block;height:100%;width:0;text-decoration:none;background:linear-gradient(90deg,#6fd36f,#2fae5f)}
#txt.tk{padding:6px 22px;font-size:40px;line-height:1.5;min-height:0}
.tkr{border-bottom:2px solid var(--bd);padding:4px 0;white-space:pre}
.tkr:last-child{border-bottom:0}
.tkr:first-child{background:#f7fbfe}
.tkr span{display:inline-block;min-width:.62em;text-align:center;border-radius:6px;padding:0 1px}
#txt.tk .ok{background:#d6f3df}
.tst{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:14px 0}
.tst div{background:#f1faff;border-radius:16px;padding:10px 20px;min-width:120px;color:var(--mut);font-size:14px}
.tst b{display:block;font-size:36px;line-height:1.2;color:var(--skyd)}


/* Pastki panel: mualliflar va kanallar */
#ft{margin-top:8px;background:#fff;border-top:4px solid var(--sky);box-shadow:0 -4px 0 #cfe3f1}
#ft .in{max-width:960px;margin:0 auto;padding:22px 20px 18px}
#ft h3{margin:0 0 4px;font-size:20px}
#ft p{margin:0 0 16px;font-size:15px}

/* Mualliflar — bitta ixcham panel, ichida yonma-yon profil qatorlari */
.ppl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0 0 16px;background:#f8fcff;border:1px solid var(--bd);border-radius:18px;overflow:hidden}
.pp{display:flex;align-items:center;gap:13px;min-width:0;padding:13px 17px;background:transparent;border:0;border-radius:0}
.pp+.pp{border-left:1px solid var(--bd)}
.pp img{width:58px;height:58px;border-radius:50%;object-fit:cover;flex:none;background:#fff;border:2px solid #fff;box-shadow:0 0 0 2px var(--sky)}
.pp small{display:block;font-size:13px;color:var(--mut);line-height:1.35;margin-bottom:2px}
.pp b{display:block;font-size:16px;line-height:1.35;color:var(--ink);overflow-wrap:anywhere}
@media(max-width:600px){
 .ppl{grid-template-columns:1fr}
 .pp{padding:12px 14px}
 .pp+.pp{border-left:0;border-top:1px solid var(--bd)}
 .pp img{width:52px;height:52px}
}
.lnk{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.tgl{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 3px 0 rgba(0,0,0,.18);transition:transform .06s}
.tgl svg{width:20px;height:20px;flex:none}
.tgl:hover{filter:brightness(1.08)}
.tgl:active{transform:translateY(2px);box-shadow:none}
.tgl:focus-visible{outline:3px solid var(--skyd);outline-offset:2px}
.tgl.a1{background:#a3202f}.tgl.a2{background:#1688c4}.tgl.a3{background:#e62117}
.cp{border-top:2px solid var(--bd);padding-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:14px;color:var(--mut)}
.cp b{color:var(--ink)}

/* Yengil rejim */
html.lite{scroll-behavior:auto}
.lite *{transition:none!important}
.lite #hsv,.lite .col{display:none!important}
.lite .cf{display:none}
.lite .k.x{transform:none;box-shadow:none}
.lite .shake{animation:none}
`;
const st = document.createElement('style');
st.id = 'yz-design';
st.textContent = css;
document.head.appendChild(st);
})();
