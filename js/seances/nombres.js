// Nombres en lettres (français, orthographe traditionnelle avec traits d'union, comme phrases.js).
// Utilisé par la banque d'exercices pour écrire les phrases dites. Les tests ont leur PROPRE copie
// (vérification indépendante).
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const D = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

export function enLettres(n) {
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error('enLettres : 0 à 100 (' + n + ')');
  if (n < 20) return U[n];
  if (n === 100) return 'cent';
  const d = Math.floor(n / 10), u = n % 10;
  if (d <= 6) return u === 0 ? D[d] : u === 1 ? `${D[d]} et un` : `${D[d]}-${U[u]}`;
  if (d === 7) return u === 1 ? 'soixante et onze' : `soixante-${U[10 + u]}`;
  if (d === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${U[u]}`;
  return `quatre-vingt-${U[10 + u]}`;
}
export const L = enLettres;
// Majuscule en début de phrase.
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// « une dizaine », « trois dizaines » ; « une unité », « quatre unités ».
export const dz = d => d === 1 ? 'une dizaine' : `${L(d)} dizaines`;
export const un = u => u === 1 ? 'une unité' : `${L(u)} unités`;
// Liste de nombres dite : « six, sept, huit ».
export const suite = ns => ns.map(L).join(', ');
