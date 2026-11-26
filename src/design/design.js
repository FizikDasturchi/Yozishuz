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
body{margin:0;color:var(--ink);font:17px/1.55 "Trebuchet MS","Segoe UI",Verdana,system-ui,sans-serif;background:linear-gradient(180deg,#d4f0ff 0,#eef9ff 340px,#fff9ea 100%) fixed;min-height:100vh}
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
.hand{filter:drop-shadow(0 2px 3px rgba(110,60,30,.28))}
.palm{fill:var(--skin);fill-opacity:.55;stroke:#c68c68;stroke-opacity:.45;stroke-width:.07;stroke-linejoin:round}
.fg{opacity:.66}
.fg path{fill:none;stroke-linecap:round;stroke-linejoin:round}
.fo{stroke:#c28660}
.fs{stroke:var(--skin)}
.fh{stroke:#fff;stroke-opacity:.3}
.fc{stroke:#a9693f;stroke-opacity:.32;stroke-width:.035}
.nl{fill:#fff;fill-opacity:.5}
.fg.on{opacity:.88;filter:drop-shadow(0 0 5px var(--fc))}
.fg.on2{opacity:.8}
.fg.on .fs,.fg.on2 .fs{stroke:var(--fc)}
.fg.on .fo,.fg.on2 .fo{stroke:#2a3b4d;stroke:color-mix(in srgb,var(--fc) 60%,#000)}
.fg.on .nl,.fg.on2 .nl{fill-opacity:.65}
.col{fill:var(--fc);opacity:.2}

/* Öyinlar */
#gm{margin:0 0 12px;border-radius:22px;overflow:hidden;box-shadow:0 6px 0 #cfe3f1;background:#fff}
.gs{position:relative;height:330px;overflow:hidden;background:linear-gradient(#5db8f0,#bfe9ff 70%,#e8f8ff);border-radius:22px;user-select:none}
.gc{position:absolute;width:110px;height:32px;background:#fff;border-radius:40px;opacity:.9}
.gc:before,.gc:after{content:"";position:absolute;background:#fff;border-radius:50%}
.gc:before{width:48px;height:48px;left:16px;top:-24px}.gc:after{width:34px;height:34px;left:58px;top:-14px}
.c1{top:46px;left:-130px;animation:drift 46s linear infinite}
.c2{top:110px;left:-130px;animation:drift 70s linear -30s infinite;transform:scale(.7)}
@keyframes drift{to{transform:translateX(1200px)}}
.hill{position:absolute;left:-10%;right:-10%;bottom:-70px;height:150px;border-radius:50%;background:#8fd67a}
.gw{position:absolute;left:0;top:0;width:100%;height:720px;transition:transform .7s cubic-bezier(.4,0,.2,1)}
.pl{position:absolute;width:32%;min-width:150px;height:16px;border-radius:8px;background:linear-gradient(#b27a42,#7a4a22);box-shadow:0 3px 0 #5a3517}
.wd{position:absolute;bottom:100%;left:0;right:0;margin-bottom:6px;padding-left:44px;text-align:center;font:800 28px Consolas,"Courier New",monospace;letter-spacing:2px;white-space:nowrap;color:#fff;text-shadow:0 2px 0 #24384d,0 0 6px #24384d}
.wd span.ok{color:#58e07a}.wd span.cur{color:#ffe066;text-decoration:underline}.wd span.bad{color:#ff6b6b}
.rb{position:absolute;left:0;top:0;width:44px;height:52px;will-change:transform}
.rain{background:linear-gradient(#7f9ab5,#c4d6e6)}
.grass{position:absolute;left:0;right:0;bottom:0;height:34px;background:linear-gradient(#6fd36f,#3fa34d);border-top:4px solid #2f8f3f}
.rain.hit{animation:shake .25s}
.dr{position:absolute;top:0;padding:2px 14px;border-radius:22px;background:#fff;border:3px solid #2aa8e8;font:800 24px Consolas,"Courier New",monospace;box-shadow:0 4px 0 #1688c4;color:#24384d;white-space:nowrap;will-change:transform}
.dr.cur{border-color:#ffc933;box-shadow:0 0 0 4px #fff1bd,0 4px 0 #e0a200}
.dr span.ok{color:#2fae5f}
.dr.pop{animation:pop2 .25s forwards}
.dr.shk{animation:shk2 .2s}
@keyframes pop2{to{opacity:0;scale:1.7}}
@keyframes shk2{25%{background:#ffd5d6}75%{background:#ffd5d6}}
.race{height:auto;min-height:330px;background:linear-gradient(#cdeeff,#f3fbff)}
.trk{position:relative;margin:26px 20px 0}
.lane{position:relative;height:56px;background:#59656f;border-radius:12px;margin-bottom:10px;border-top:3px dashed rgba(255,255,255,.5)}
.cr{position:absolute;top:10px;left:0;width:64px;height:36px;transition:left .12s linear}
.fl{position:absolute;right:4px;top:-18px;font-size:28px}
.rtx{margin:16px 20px 20px;font:600 24px/1.9 Consolas,"Courier New",monospace;white-space:pre-wrap;background:#fff;border-radius:16px;padding:10px 16px;color:var(--ink);box-shadow:0 4px 0 #cfe3f1;min-height:3.4em}
.rtx .ok{color:var(--ok)}.rtx .cur{background:var(--cur);border-bottom:4px solid var(--sky);border-radius:4px}.rtx .bad{background:#ffd5d6;border-bottom:4px solid var(--err)}
.amz{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:5;overflow:hidden;background:rgba(255,255,255,.18)}
.amz i{position:absolute;width:1100px;height:1100px;background:repeating-conic-gradient(rgba(255,255,255,.55) 0 10deg,rgba(255,255,255,0) 10deg 20deg);animation:spin 7s linear infinite}
.amz b{position:relative;font:900 clamp(40px,9vw,72px) "Trebuchet MS",sans-serif;color:#ffc933;-webkit-text-stroke:7px #ff8a1f;paint-order:stroke fill;text-shadow:0 6px 0 #c25a00;transform:rotate(-6deg);animation:amz .6s both}
@keyframes amz{0%{transform:scale(0) rotate(-30deg)}70%{transform:scale(1.25) rotate(-4deg)}100%{transform:scale(1) rotate(-6deg)}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.c1,.c2,.amz i{animation:none!important}}

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
`;
const st = document.createElement('style');
st.id = 'yz-design';
st.textContent = css;
document.head.appendChild(st);
})();
