// Run: node finances/tools/dark-palette.js <out.json> [anchor] [hueMax]
// Solves the dark-mode category palette that finances/v2/ledger-charts.js
// ships in DARK_CATS. Deterministic — the same arguments give the same
// palette every run — so a regenerated set can be diffed.
//
// Shipped with: node finances/tools/dark-palette.js /tmp/p.json 15 0.11
// then two hand corrections recorded in ledger-charts.js: "Salaries & HR" was
// deepened to #7fa3cf to restore the lightness split against the pale
// "Software & IT" blue, and "Other" is pinned to a neutral grey.
//
// Do not tune this by eye. validate.js check 11 enforces the result.
const KEYS = Object.keys(C).filter(k => k !== '__rest');

// rank categories by total spend: the top of this list is what a reader
// actually sees in a bar chart or a distribution strip
const spend = {};
D.entries.forEach(e => { spend[e[2]] = (spend[e[2]] || 0) + e[3]; });
const RANKED = KEYS.slice().sort((a, b) => (spend[b] || 0) - (spend[a] || 0));
const TOP = new Set(RANKED.slice(0, 8));

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const h2r=h=>{h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16));};
const r2h=([r,g,b])=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function rgb2hsl([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return[h,s,l];}
function hsl2rgb([h,s,l]){const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
 if(s===0)return[l*255,l*255,l*255];const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255];}
const lin=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
const lum=hex=>{const [r,g,b]=h2r(hex);return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);};
const contrast=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
const fl=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
function lab(hex){let [r,g,b]=h2r(hex).map(v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
 const X=(r*0.4124+g*0.3576+b*0.1805)/0.95047,Y=r*0.2126+g*0.7152+b*0.0722,Z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
 return [116*fl(Y)-16,500*(fl(X)-fl(Y)),200*(fl(Y)-fl(Z))];}
const dE=(a,b)=>{const A=lab(a),B=lab(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};

let seed=20260820; const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;

const GROUND='#16150f', MINC=4.5;
const ORIG = KEYS.map(k=>rgb2hsl(h2r(C[k].color)));
const ANCHOR = Number(process.argv[3]||20), HUE_MAX = Number(process.argv[4]||0.075);
// "Other" is a residual bucket, not a subject: it stays a neutral grey so it
// never competes for attention with a real category.
const PIN = { 'Other': '#9c948b' };
// Categories whose hue IS their identity - a yellow grant line must not drift
// into the orange the contracts line already owns.
const TIGHT = new Set(['Subsidies & community', 'Legal — external counsel', 'Salaries & HR']);
const bound = k => TIGHT.has(k) ? 0.03 : HUE_MAX;
const LBAND=[0.52,0.78], SBAND=[0.34,0.72];   // moderate sat: a newspaper, not neon

function score(hsl){
  const hex = hsl.map(v => r2h(hsl2rgb(v)));
  let topMin=Infinity, allMin=Infinity;
  for(let i=0;i<hex.length;i++)for(let j=i+1;j<hex.length;j++){
    const d=dE(hex[i],hex[j]);
    if(d<allMin) allMin=d;
    if(TOP.has(KEYS[i])&&TOP.has(KEYS[j])&&d<topMin) topMin=d;
  }
  let pen=0;
  hex.forEach((h,i)=>{
    const c=contrast(h,GROUND); if(c<MINC) pen+=(MINC-c)*30;
    // Each category must stay in its own colour FAMILY: a reader toggling the
    // theme should recognise the same category, not meet a new one.
    let dh=Math.abs(hsl[i][0]-ORIG[i][0]); dh=Math.min(dh,1-dh);
    const b=bound(KEYS[i]);
    pen += dh*ANCHOR*(TIGHT.has(KEYS[i])?3:1) + (dh>b ? (dh-b)*900 : 0);
  });
  // the dominant categories carry the weight; the tail only has to be pleasant
  return topMin*1.0 + allMin*0.45 - pen;
}

// seed: hues spread evenly round the wheel, alternating lightness so
// neighbouring hues also differ in value (which is what survives at 8px)
let cur = KEYS.map((k, i) => {
  const o = rgb2hsl(h2r(C[k].color));
  return [o[0], clamp(o[1], SBAND[0], SBAND[1]), i % 2 ? LBAND[0] + 0.06 : LBAND[1] - 0.06];
});
let best=cur.map(v=>v.slice()), bestS=score(cur);
for(let it=0; it<160000; it++){
  const T=1-it/160000;
  const i=Math.floor(rnd()*cur.length);
  const t=cur.map(v=>v.slice());
  t[i]=[ (t[i][0]+(rnd()-0.5)*0.16*T+1)%1,
         clamp(t[i][1]+(rnd()-0.5)*0.30*T,SBAND[0],SBAND[1]),
         clamp(t[i][2]+(rnd()-0.5)*0.26*T,LBAND[0],LBAND[1]) ];
  const s=score(t);
  if(s>bestS){bestS=s;best=t.map(v=>v.slice());cur=t;}
  else if(rnd()<0.03*T) cur=t;
}
const hex = best.map(v=>r2h(hsl2rgb(v)));
KEYS.forEach((k,i)=>{ if(PIN[k]) hex[i]=PIN[k]; });
const out = Object.fromEntries(KEYS.map((k,i)=>[k,hex[i]]));

let topMin=Infinity,allMin=Infinity,wp=null,ap=null;
for(let i=0;i<hex.length;i++)for(let j=i+1;j<hex.length;j++){
  const d=dE(hex[i],hex[j]);
  if(d<allMin){allMin=d;ap=[KEYS[i],KEYS[j]];}
  if(TOP.has(KEYS[i])&&TOP.has(KEYS[j])&&d<topMin){topMin=d;wp=[KEYS[i],KEYS[j]];}
}
console.log('top-8 min ΔE  ' + topMin.toFixed(1) + '   (' + wp[0] + ' vs ' + wp[1] + ')');
console.log('all-pairs min ΔE ' + allMin.toFixed(1) + '   (' + ap[0] + ' vs ' + ap[1] + ')');
console.log('min contrast on #16150f ' + Math.min(...hex.map(h=>contrast(h,GROUND))).toFixed(2) + ':1\n');
RANKED.forEach(k=>{
  const i=KEYS.indexOf(k);
  console.log((TOP.has(k)?'* ':'  ') + C[k].en.slice(0,32).padEnd(34) + C[k].color + ' -> ' + hex[i] +
    '   ' + contrast(hex[i],GROUND).toFixed(1) + ':1');
});
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
