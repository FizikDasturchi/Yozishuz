/* ============================================================
   config.js — umumiy sozlamalar, klaviatura xaritasi, barmoqlar.
   Provides: $, PASS, MIN_WPM, MAXP, GOAL, KEY, TH, KEYMAP, ROWS,
             lab, cap, codeOf, FG, fobj, fing
   ============================================================ */
const $=s=>document.querySelector(s);

const PASS=80;       // keyingi ekranga ötiş: eng kam aniqlik (%)
const MIN_WPM=25;    // keyingi ekranga ötiş: eng kam tezlik (söz/daq, 1 söz = 5 belgi)
const MAXP=2500;     // nihol uçun maksimal ball
const GOAL=900;      // kunlik maqsad (soniya)
const KEY='yozish.v3';
const TH=[0,500,1100,1700,2200]; // nihol bosqiçlari

// Yangi harflarning joyi: [oddiy, Shift bilan (US), belgi]
const KEYMAP={
 KeyW:['w','W','ş'],
 KeyC:['c','C','ç'],
 BracketLeft:['[','{','ö'],
 BracketRight:[']','}','ğ'],
 Quote:["'",'"','ʼ']
};
const ROWS=[
 ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight'],
 ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote'],
 ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']
];
const PL={Semicolon:';',Comma:',',Period:'.',Slash:'/'};
const lab=c=>KEYMAP[c]?KEYMAP[c][2]:c.startsWith('Key')?c[3].toLowerCase():PL[c];
const cap=c=>KEYMAP[c]?KEYMAP[c][0].toUpperCase():lab(c).toUpperCase();
const codeOf={};ROWS.flat().forEach(c=>codeOf[lab(c)]=c);

// Qaysi barmoq bilan bosiladi: [id, nomi, tugmalar]
const FG=[
 ['lp','çap kiçik barmoq','KeyQ KeyA KeyZ'],
 ['lr','çap halqa barmoq','KeyW KeyS KeyX'],
 ['lm','çap örta barmoq','KeyE KeyD KeyC'],
 ['li','çap körsatkiç barmoq','KeyR KeyF KeyV KeyT KeyG KeyB'],
 ['ri','öng körsatkiç barmoq','KeyY KeyH KeyN KeyU KeyJ KeyM'],
 ['rm','öng örta barmoq','KeyI KeyK Comma'],
 ['rr','öng halqa barmoq','KeyO KeyL Period'],
 ['rp','öng kiçik barmoq','KeyP Semicolon Slash BracketLeft BracketRight Quote']
];
const fobj=c=>FG.find(x=>x[2].split(' ').includes(c));
const fing=c=>{const f=fobj(c);return f?f[1]:''};
