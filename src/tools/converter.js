/* ============================================================
   converter.js — ustoz uçun: eski lotin matnini yangi alifboga
   o'tkazuvçi va söz bankini tö'ldiruvçi vosita.
   Depends: config.js, lessons.js (XB)
   ============================================================ */
function conv(s){
 return s.replace(/[ʻʼ‘’'`´]/g,"'")
  .replace(/([oOgG])'/g,(m,c)=>({o:'ö',O:'Ö',g:'ğ',G:'Ğ'})[c])
  .replace(/sh/g,'ş').replace(/S[hH]/g,'Ş').replace(/ch/g,'ç').replace(/C[hH]/g,'Ç')
  .replace(/'/g,'ʼ');
}
$('#cb').onclick=()=>{$('#co').value=conv($('#ci').value)};
// Matndan chastota bo'yiça sözlar röyxati (yangi alifboda)
$('#wb').onclick=()=>{const c={};(conv($('#ci').value).toLowerCase().match(/[\p{L}ʼ]+/gu)||[]).forEach(w=>{if(w.length>1&&w.length<12&&/^[abdefghijklmnopqrstuvxyzçğöşʼ]+$/.test(w))c[w]=(c[w]||0)+1});$('#co').value=Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).join(' ')};
$('#sb').onclick=()=>{const n=$('#co').value.toLowerCase().split(/\s+/).filter(Boolean);try{localStorage.setItem('yozish.bank',JSON.stringify([...new Set(XB.concat(n))].slice(0,5000)));$('#bn').textContent=n.length+' söz saqlandi. Sahifani yangilang.'}catch(e){$('#bn').textContent='Saqlab bölmadi'}};
