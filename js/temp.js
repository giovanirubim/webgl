const a = m[ 3] - x;
const b = m[ 7] - y;
const c = m[11] - z;
const d = b*b;
const e = a*a;
const f = c*c;
const g = Math.sqrt(e + d + f);
const h = Math.sqrt(g*g - d)/g;
const i = Math.sqrt(e + f);
const j = c/-Math.abs(c)*Math.sqrt(i*i - e)/i;
const k = b/g;
const l = a/-i;
m[ 0] = j;
m[ 1] = l*k;
m[ 2] = l*h;
m[ 5] = h;
m[ 6] = -k;
m[ 8] = -l;
m[ 9] = j*k;
m[10] = j*h;
m[ 4] = m[12] = m[13] = m[14] = 0;
m[15] = 1;