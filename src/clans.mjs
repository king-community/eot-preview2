// Clan labels describe nickname patterns, not verified memberships.
// Keep every pattern anchored at the beginning to avoid substring false positives.
const FOLD_CHARS={
 'ᴋ':'K','ꜱ':'S','ˢ':'S','ᴘ':'P','ᴛ':'T','ᵏ':'K',
 '𝗦':'S','𝗞':'K','𝗣':'P','𝗧':'T','ѕ':'S','Ѕ':'S',
 'к':'K','К':'K','Κ':'K','κ':'K','р':'P','Р':'P','Ρ':'P','ρ':'P',
 'т':'T','Т':'T','Τ':'T','τ':'T','Ѡ':'W','ω':'W','Ø':'O','ø':'O','Λ':'A',
 'Ƒ':'F'
};
const LEADING_DECOR=/^[\s★✦✧☆✯\u200b-\u200f\ufeff]+/u;
const SEPARATOR='(?=$|[^\\p{L}\\p{N}])';
const common=new RegExp(`^(SK|PTP|NVR|EOT|S2F|FX|MOON|UVA|WVO)${SEPARATOR}`,'u');

export function foldClanName(value){
 return [...String(value??'').normalize('NFKD')]
  .map(ch=>FOLD_CHARS[ch]||ch).join('')
  .replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f\u200b-\u200f\ufeff]/g,'')
  .normalize('NFKC').toUpperCase();
}
export function detectClan(name){
 const raw=String(name??'').trim();
 if(!raw)return null;
 const start=raw.replace(LEADING_DECOR,'');
 // Custom WVO insignia is not an alphabetic W. Treat all variants as one group.
 if(/^(?:[♆✥⛤꙰]V[ØøO]|[ѠωW]V[ØøO])(?=$|[^\p{L}\p{N}])/iu.test(start))return 'WVO';
 const folded=foldClanName(start);
 const bracket=folded.match(/^[\[{(]\s*(SK|PTP|NVR|EOT|S2F|FX|MOON|UVA|WVO)\s*[\]})]/u);
 if(bracket)return bracket[1];
 const m=folded.match(common);
 return m?m[1]:null;
}
export function clanGroups(names){
 const map=new Map();
 for(const name of names){
  const group=detectClan(name);
  if(group)map.set(group,(map.get(group)||0)+1);
 }
 return [...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
