/* ============================================================
   keyboard.js — ekrandagi klaviatura (barmoq ranglari bilan).
   Provides: KEYC, SHIFTC, SPACEC, kbHTML
   Lüğat: 1 birlik = 1 tugma eni. Qöllar (hands.js) şu birlikda çiziladi.
   Depends: config.js
   ============================================================ */
// Har bir tugma markazi [x, y] birlikda (y: 0..4 qator)
const KEYC={};
ROWS.forEach((r,ri)=>{const off=[1.5,1.75,2.25][ri];r.forEach((c,i)=>KEYC[c]=[off+i+.5,ri+.5])});
const SHIFTC={l:[1.125,2.5],r:[13.625,2.5]};
const SPACEC=[7.5,3.5];

function kbHTML(tg){
 const lo=tg?tg.toLowerCase():'',ac=lo&&lo!==' '?codeOf[lo]:null,fo=ac?fobj(ac):null;
 const shiftSide=fo&&tg!==lo?(fo[0][0]=='l'?'r':'l'):null;
 const ns=new Set(CL.k?CL.k.map(c=>c.toLowerCase()):[]);
 const key=c=>`<i class="k f-${fobj(c)[0]} ${ns.has(lab(c))?'n':''} ${c=='KeyF'||c=='KeyJ'?'hm':''} ${ac==c?'x':''}">${lab(c)}</i>`;
 const dk=(t,s)=>`<i class="k d" style="grid-column:span ${s}">${t}</i>`;
 const sk=(side,s)=>`<i class="k sh f-${side=='l'?'lp':'rp'} ${shiftSide==side?'x':''}" style="grid-column:span ${s}">shift</i>`;
 return `<div class="r">${dk('tab',6)}${ROWS[0].map(key).join('')}${dk('\\',6)}</div><div class="r">${dk('caps',7)}${ROWS[1].map(key).join('')}${dk('enter',9)}</div><div class="r">${sk('l',9)}${ROWS[2].map(key).join('')}${sk('r',11)}</div><div class="r"><i class="k sp f-th ${tg==' '?'x':''}">probel</i></div>`;
}
