// BANQUE D'EXERCICES de maths (S2.0, décision de Simon du 10/10/2026) — séances mélangées.
// Banque COMMUNE aux deux parcours ; le sélecteur (melange.js) choisit les items selon le Suivi.
//
// Chaque item : format des séances (id, domaine, libelle, type, attendu, verifier, scene, aide)
// + famille (code), niveau (1 à 3), competence (code du référentiel, règle A13),
// + donnees : { op, args, dits } — la vérité est RECALCULÉE par tests/test_banque.mjs à partir de
//   op/args, indépendamment de « attendu » ; dits = nombres que la consigne doit prononcer,
// + textes : { c, e } — consigne et explication. Elles sont recopiées TELLES QUELLES dans
//   app/js/phrases_banque.js par outils/banque_phrases.mjs (voix pré-enregistrée, règle A11) ;
//   le test vérifie l'égalité : modifier un texte ici impose de régénérer phrases + audio.
// Les identifiants dépendent des paramètres (pas de l'ordre) : stables d'une version à l'autre.
// Règle B13 : la scène montre les données, jamais la réponse ; barres, mains, boîtes = aide.
import {
  rangee, barresCubes, boiteDe10, grand, grandLong, TROU, illustration, droiteGraduee,
  ligneAide, calculAmi, dictee, suiteATrou, mains
} from '../rendu.js';
import { L, cap, dz, un, suite } from './nombres.js';

export const VERSION_BANQUE = 'B1';

// Familles (affichage parent, sélection). titre court, competence principale indicative.
export const FAMILLES = {
  bt: 'Tables d\'addition, terme manquant, presque-doubles, passage de la dizaine',
  bdb: 'Doubles et moitiés',
  bcd: 'Complément à la dizaine',
  bdz: 'Plus ou moins dix, plus ou moins des dizaines',
  bvp: 'Valeur de position (dizaines, unités)',
  brp: 'Représentations et dictées',
  bdg: 'Droite graduée, ligne de 0 à 100',
  bad: 'Additions jusqu\'à 100',
  bso: 'Soustractions',
  bpb: 'Problèmes',
  bvf: 'Vérifier le calcul d\'un ami',
  bcs: 'Comparer, suites',
  bmu: 'Groupes égaux (multiplication)'
};

// Causes d'erreur prévues (export parent, comme les « pieges » de S1.5).
export const ADD = 'a additionné les deux nombres', SOUS = 'a soustrait au lieu d\'ajouter';
const INV = 'a écrit les chiffres à l\'envers';
const RETENUE = 'a oublié la dizaine en plus';

const B = [];
const fort = s => `<span class="signe-fort">${s}</span>`;
const eq = (a, s, b) => grand(`${a} ${fort(s)} ${b} = ${TROU}`);
const plusGroupes = (g, d) => `<div class="groupes">${g}<span class="plus">+</span>${d}</div>`;
const bc = n => barresCubes(Math.floor(n / 10), n % 10);
const parRang = n => n <= 59 ? '59' : '100';

// Ajoute un item au pavé numérique (ou d'un autre type si o.type est donné).
function item(o) {
  const it = { type: 'pave', ...o };
  if (it.type === 'pave' || it.type === 'choix') it.verifier = r => r === it.attendu;
  if (it.type === 'choix') { it.essai2PeuSignificatif = it.choix.length <= 3; if (!it.scene) it.scene = () => ''; }
  if (it.pieges) {
    // On ne garde que des pièges valides : faux, entiers, saisissables (3 chiffres au plus).
    for (const k of Object.keys(it.pieges)) {
      const v = Number(k);
      if (v === it.attendu || !Number.isInteger(v) || v < 0 || v > 999) delete it.pieges[k];
    }
    if (!Object.keys(it.pieges).length) delete it.pieges;
  }
  B.push(it);
  return it;
}

// ---------- Explications de calcul réutilisables (stratégies, jamais « compter un par un ») ----------
function stratAdd(a, b) {
  const s = a + b;
  if (a === b && a <= 10) return `${cap(L(a))} plus ${L(a)}, c'est le double de ${L(a)} : ${L(s)}.`;
  if (a < 10 && b < 10) {
    if (Math.abs(a - b) === 1) { const m = Math.min(a, b); return `${cap(L(m))} plus ${L(m)}, ça fait ${L(2 * m)}. Et encore un : ${L(s)}.`; }
    if (s > 10) { const g = Math.max(a, b), p = Math.min(a, b), k = 10 - g; return `${cap(L(g))} plus ${L(k)}, ça fait dix. Il reste ${L(p - k)} : dix plus ${L(p - k)}, ça fait ${L(s)}.`; }
    return `${cap(L(a))}, et encore ${L(b)}, ça fait ${L(s)}.`;
  }
  if (b === 9 && a % 10 !== 0) return `Plus neuf, c'est plus dix, puis moins un. ${cap(L(a))} plus dix, ${L(a + 10)}. Moins un : ${L(s)}.`;
  if (b % 10 === 0) return `${cap(L(b))}, c'est ${dz(b / 10)}. ${cap(L(a))} plus ${dz(b / 10)}, ça fait ${L(s)}. Les unités ne changent pas.`;
  if (b < 10) {
    const D = Math.ceil(a / 10) * 10;
    if (a % 10 !== 0 && s > D) return `${cap(L(a))} plus ${L(D - a)}, ça fait ${L(D)}. Il reste ${L(s - D)} : ${L(D)} plus ${L(s - D)}, ${L(s)}.`;
    return `${cap(L(a))}, et encore ${L(b)} : ${L(s)}.`;
  }
  const Da = a - a % 10, Db = b - b % 10, ua = a % 10, ub = b % 10;
  if (ua === 0 || ub === 0) return `${cap(L(Da))} plus ${L(Db)}, ça fait ${L(Da + Db)}. Et encore ${L(ua + ub)} : ${L(s)}.`;
  if (ua + ub < 10) return `${cap(L(Da))} plus ${L(Db)}, ça fait ${L(Da + Db)}. ${cap(L(ua))} plus ${L(ub)}, ça fait ${L(ua + ub)}. ${cap(L(a))} plus ${L(b)} égale ${L(s)}.`;
  return `${cap(L(Da))} plus ${L(Db)}, ça fait ${L(Da + Db)}. ${cap(L(ua))} plus ${L(ub)}, ça fait ${L(ua + ub)} : une dizaine de plus. ${cap(L(Da + Db))} plus ${L(ua + ub)} égale ${L(s)}.`;
}
function stratSub(a, b) {
  const r = a - b;
  if (a <= 10) return `${cap(L(a))}, c'est ${L(r)} plus ${L(b)}. Donc ${L(a)} moins ${L(b)} égale ${L(r)}.`;
  if (b % 10 === 0) return `${cap(L(b))}, c'est ${dz(b / 10)}. ${cap(L(a))} moins ${dz(b / 10)}, ça fait ${L(r)}. Les unités ne changent pas.`;
  if (a % 10 === 0 && b < 10) return `${cap(L(a))}, c'est ${L(a - 10)} plus dix. Dix moins ${L(b)}, ça fait ${L(10 - b)}. Donc ${L(a)} moins ${L(b)} égale ${L(r)}.`;
  if (a < 20 && b < 10 && b > a - 10) { const k = a - 10; return `${cap(L(a))} moins ${L(k)}, ça fait dix. Puis dix moins ${L(b - k)}, ça fait ${L(r)}.`; }
  if (b <= 2) return `Avant ${L(a)}, il y a ${L(a - 1)}${b === 2 ? `, puis ${L(a - 2)}` : ''}. ${cap(L(a))} moins ${L(b)} égale ${L(r)}.`;
  return `${cap(L(a))} moins ${L(b)} égale ${L(r)}, car ${L(r)} plus ${L(b)}, ça fait ${L(a)}.`;
}

// =====================================================================================
// bt — Tables d'addition : terme manquant, presque-doubles, passage de la dizaine (CP-C1 ★)
// =====================================================================================
for (const [s, b] of [[5, 2], [6, 4], [7, 3], [8, 5], [9, 4], [6, 1], [8, 3], [9, 6], [10, 7], [7, 5], [9, 2], [10, 4]]) {
  const a = s - b;
  item({ id: `bt_tm1_${s}_${b}`, famille: 'bt', niveau: 1, competence: 'CP-C1', domaine: 'Décomposition',
    libelle: `? + ${b} = ${s} (nombre manquant en premier)`, attendu: a, pieges: { [s + b]: ADD },
    donnees: { op: 'manq', args: [b, s], dits: [b, s] },
    scene: () => grand(`${TROU} + ${b} = ${s}`), aide: () => mains(s, b) + grand(`${a} + ${b} = ${s}`),
    textes: { c: `Quel nombre, plus ${L(b)}, égale ${L(s)} ?`, e: `${cap(L(s))}, c'est ${L(a)} plus ${L(b)}. Le nombre caché, c'est ${L(a)}.` } });
}
for (const [s, a] of [[7, 4], [8, 6], [9, 5], [6, 3], [10, 6], [8, 2], [9, 7], [7, 2], [10, 3], [6, 2], [9, 3], [8, 4]]) {
  const b = s - a;
  item({ id: `bt_tm2_${s}_${a}`, famille: 'bt', niveau: 1, competence: 'CP-C1', domaine: 'Décomposition',
    libelle: `${s} = ${a} + ?`, attendu: b, pieges: { [s + a]: ADD },
    donnees: { op: 'manq', args: [a, s], dits: [a, s] },
    scene: () => grand(`${s} = ${a} + ${TROU}`), aide: () => mains(s, b) + grand(`${s} = ${a} + ${b}`),
    textes: { c: `${cap(L(s))}, c'est ${L(a)} plus combien ?`, e: `${cap(L(a))}, et encore ${L(b)}, ça fait ${L(s)}. ${cap(L(s))}, c'est ${L(a)} plus ${L(b)}.` } });
}
for (const [x, y] of [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [4, 3], [6, 5], [8, 7]]) {
  const m = Math.min(x, y), s = x + y;
  item({ id: `bt_pd_${x}_${y}`, famille: 'bt', niveau: 2, competence: 'CP-C1', domaine: 'Presque-doubles',
    libelle: `${x} + ${y} (presque-double)`, attendu: s, donnees: { op: 'add', args: [x, y], dits: [x, y] },
    scene: () => eq(x, '+', y), aide: () => grand(`${m} + ${m} = ${2 * m}`) + grand(`${2 * m} + 1 = ${s}`),
    textes: { c: `Combien font ${L(x)} plus ${L(y)} ?`, e: stratAdd(x, y) } });
}
for (const [x, y] of [[8, 5], [9, 4], [8, 6], [9, 7], [9, 5], [7, 5], [8, 3], [9, 3], [8, 4], [7, 4], [5, 8], [4, 9]]) {
  const g = Math.max(x, y), s = x + y;
  item({ id: `bt_p10_${x}_${y}`, famille: 'bt', niveau: 3, competence: 'CP-C1', domaine: 'Passage de la dizaine',
    libelle: `${x} + ${y} (passer par dix)`, attendu: s, pieges: { [s - 10]: RETENUE },
    donnees: { op: 'add', args: [x, y], dits: [x, y] },
    scene: () => eq(x, '+', y), aide: () => boiteDe10(g, 10 - g) + grand(`${x} + ${y} = ${s}`),
    textes: { c: `Combien font ${L(x)} plus ${L(y)} ?`, e: stratAdd(x, y) } });
}

// =====================================================================================
// bdb — Doubles et moitiés (CP-C2 ★)
// =====================================================================================
for (const a of [6, 7, 8, 9, 10]) {
  item({ id: `bdb_dbl_${a}`, famille: 'bdb', niveau: 1, competence: 'CP-C2', domaine: 'Doubles',
    libelle: `${a} + ${a}`, attendu: 2 * a, donnees: { op: 'add', args: [a, a], dits: [a] },
    scene: () => eq(a, '+', a), aide: () => mains(2 * a) + grand(`${a} + ${a} = ${2 * a}`),
    textes: { c: `Combien font ${L(a)} plus ${L(a)} ?`, e: stratAdd(a, a) } });
}
for (const n of [8, 10, 12, 14, 16, 18, 20]) {
  const h = n / 2;
  item({ id: `bdb_moit_${n}`, famille: 'bdb', niveau: 2, competence: 'CP-C2', domaine: 'Moitiés',
    libelle: `Partager ${n} bonbons en deux parts égales`, attendu: h, pieges: { [n * 2 <= 999 ? n * 2 : 0]: 'a doublé au lieu de partager' },
    donnees: { op: 'moitie', args: [n], dits: [n] },
    scene: () => illustration('bonbon', 2, 90),
    aide: () => `<div class="probleme-aide"><div>${rangee('bonbon', h, 26)}</div><div>${rangee('bonbon', h, 26)}</div></div>` + grand(`${h} + ${h} = ${n}`),
    textes: { c: `On partage ${L(n)} bonbons entre deux amis. Chacun en a autant. Combien de bonbons pour chaque ami ?`,
      e: `${cap(L(h))} plus ${L(h)}, ça fait ${L(n)}. Chacun a ${L(h)} bonbons. La moitié de ${L(n)}, c'est ${L(h)}.` } });
}
for (const a of [20, 30, 40, 50]) {
  item({ id: `bdb_dbld_${a}`, famille: 'bdb', niveau: 3, competence: 'CP-C2', domaine: 'Doubles',
    libelle: `${a} + ${a}`, attendu: 2 * a, donnees: { op: 'add', args: [a, a], dits: [a] },
    scene: () => eq(a, '+', a), aide: () => plusGroupes(bc(a), bc(a)) + grand(`${a} + ${a} = ${2 * a}`),
    textes: { c: `Combien font ${L(a)} plus ${L(a)} ?`,
      e: `${cap(L(a))}, c'est ${dz(a / 10)}. ${cap(dz(a / 10))} plus ${dz(a / 10)}, ça fait ${dz(2 * a / 10)} : ${L(2 * a)}.` } });
}
for (const n of [40, 60, 80, 100]) {
  const h = n / 2;
  item({ id: `bdb_moitd_${n}`, famille: 'bdb', niveau: 3, competence: 'CP-C2', domaine: 'Moitiés',
    libelle: `Partager ${n} billes en deux parts égales`, attendu: h,
    donnees: { op: 'moitie', args: [n], dits: [n] },
    scene: () => illustration('bille', 2, 90), aide: () => plusGroupes(bc(h), bc(h)) + grand(`${h} + ${h} = ${n}`),
    textes: { c: `On partage ${L(n)} billes entre deux amis. Chacun en a autant. Combien de billes pour chaque ami ?`,
      e: `${cap(L(n))}, c'est ${dz(n / 10)}. La moitié, c'est ${dz(h / 10)} : ${L(h)}. ${cap(L(h))} plus ${L(h)}, ça fait ${L(n)}.` } });
}

// =====================================================================================
// bcd — Complément à la dizaine supérieure (CP-C6 ★)
// =====================================================================================
for (let a = 1; a <= 9; a++) {
  const b = 10 - a;
  item({ id: `bcd_10_${a}`, famille: 'bcd', niveau: 1, competence: 'CP-C6', domaine: 'Compléments à 10',
    libelle: `${a} + ? = 10`, attendu: b, pieges: { [a + 10]: ADD },
    donnees: { op: 'manq', args: [a, 10], dits: [a, 10] },
    scene: () => grand(`${a} + ${TROU} = 10`), aide: () => boiteDe10(a, b) + grand(`${a} + ${b} = 10`),
    textes: { c: `${cap(L(a))} plus combien égale dix ?`, e: `${cap(L(a))} et ${L(b)}, ça fait dix. Il faut ajouter ${L(b)}.` } });
}
for (const x of [13, 17, 24, 28, 31, 36, 42, 45, 19, 27, 38, 46, 53, 58, 61, 64, 67, 72, 75, 79, 83, 86, 91, 97]) {
  const d = Math.floor(x / 10), u = x % 10, D = (d + 1) * 10, r = D - x;
  item({ id: `bcd_d_${x}`, famille: 'bcd', niveau: x < 50 ? 2 : 3, competence: 'CP-C6', domaine: 'Complément à la dizaine',
    libelle: `${x} + ? = ${D}`, attendu: r, pieges: { [x + D]: ADD, [u]: 'a donné le chiffre des unités' },
    donnees: { op: 'manq', args: [x, D], dits: [x, D] },
    scene: () => grand(`${x} + ${TROU} = ${D}`),
    aide: () => barresCubes(d, u) + boiteDe10(u, r) + grand(`${x} + ${r} = ${D}`),
    textes: { c: `${cap(L(x))}, plus combien, égale ${L(D)} ?`,
      e: `${cap(L(x))}, c'est ${dz(d)} et ${un(u)}. ${cap(L(u))} plus ${L(r)}, ça fait dix. Donc ${L(x)} plus ${L(r)} égale ${L(D)}.` } });
}

// =====================================================================================
// bdz — Plus ou moins dix (CP-C4 ★), plus ou moins des dizaines entières (CP-C5)
// =====================================================================================
for (const x of [7, 15, 23, 34, 46, 52, 68, 71, 85]) {
  const r = x + 10, d = Math.floor(r / 10), u = r % 10;
  item({ id: `bdz_p10_${x}`, famille: 'bdz', niveau: 1, competence: 'CP-C4', domaine: 'Plus dix',
    libelle: `${x} + 10`, attendu: r, pieges: { [x - 10 >= 0 ? x - 10 : 1000]: SOUS },
    donnees: { op: 'add', args: [x, 10], dits: [x] },
    scene: () => eq(x, '+', 10), aide: () => barresCubes(d, u, true) + grand(`${x} + 10 = ${r}`),
    textes: { c: `Combien font ${L(x)} plus dix ?`,
      e: `Plus dix, c'est une dizaine de plus, et les unités ne changent pas. ${cap(L(x))} plus dix égale ${L(r)}.` } });
}
for (const x of [18, 25, 34, 47, 53, 60, 72, 89, 96]) {
  const r = x - 10, d = Math.floor(r / 10), u = r % 10;
  item({ id: `bdz_m10_${x}`, famille: 'bdz', niveau: 2, competence: 'CP-C4', domaine: 'Moins dix',
    libelle: `${x} − 10`, attendu: r, pieges: { [x + 10]: ADD },
    donnees: { op: 'sub', args: [x, 10], dits: [x] },
    scene: () => eq(x, '−', 10), aide: () => barresCubes(d, u, true) + grand(`${x} − 10 = ${r}`),
    textes: { c: `Combien font ${L(x)} moins dix ?`,
      e: `Moins dix, c'est une dizaine de moins, et les unités ne changent pas. ${cap(L(x))} moins dix égale ${L(r)}.` } });
}
for (const [x, k, s] of [[24, 30, '+'], [45, 20, '+'], [13, 50, '+'], [36, 40, '+'], [52, 30, '+'], [67, 20, '+'],
  [58, 30, '−'], [74, 40, '−'], [93, 50, '−'], [86, 20, '−'], [65, 30, '−'], [49, 20, '−']]) {
  const ajout = s === '+', r = ajout ? x + k : x - k;
  item({ id: `bdz_dz_${x}_${ajout ? 'p' : 'm'}${k}`, famille: 'bdz', niveau: 3, competence: 'CP-C5', domaine: ajout ? 'Plus des dizaines' : 'Moins des dizaines',
    libelle: `${x} ${s} ${k}`, attendu: r, pieges: ajout ? { [x - k >= 0 ? x - k : 1000]: SOUS } : { [x + k]: ADD },
    donnees: { op: ajout ? 'add' : 'sub', args: [x, k], dits: [x, k] },
    scene: () => eq(x, s, k), aide: () => bc(r) + grand(`${x} ${s} ${k} = ${r}`),
    textes: { c: `Combien font ${L(x)} ${ajout ? 'plus' : 'moins'} ${L(k)} ?`, e: ajout ? stratAdd(x, k) : stratSub(x, k) } });
}

// =====================================================================================
// bvp — Valeur de position (CP-N5 ★ ; forme non canonique : représentations CP-N4 ★)
// =====================================================================================
const motDz = d => `${d} dizaine${d > 1 ? 's' : ''}`, motU = u => `${u} unité${u > 1 ? 's' : ''}`;
for (const [d, u] of [[3, 7], [5, 2], [2, 9], [4, 1], [1, 6], [5, 8], [7, 3], [9, 2], [8, 6], [6, 4], [9, 8], [7, 1]]) {
  const n = 10 * d + u;
  item({ id: `bvp_du_${d}_${u}`, famille: 'bvp', niveau: n <= 59 ? 1 : 2, competence: 'CP-N5-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `${d} dizaines et ${u} unités → ${n}`, attendu: n, pieges: { [10 * u + d]: INV },
    donnees: { op: 'du', args: [d, u], dits: [d, u] },
    scene: () => `<div class="grand-texte long">${motDz(d)}<br>${motU(u)}</div>`,
    aide: () => barresCubes(d, u, true) + grand(String(n)),
    textes: { c: `${cap(dz(d))} et ${un(u)}. Quel est ce nombre ?`,
      e: `${cap(dz(d))}, c'est ${L(10 * d)}. Et encore ${L(u)} : ${L(n)}. On écrit ${L(d)}, puis ${L(u)}.` } });
}
for (const [u, D] of [[4, 20], [6, 30], [3, 50], [8, 10], [2, 40], [7, 20], [5, 60], [9, 70], [1, 80], [6, 90]]) {
  const n = u + D, d = D / 10;
  item({ id: `bvp_ud_${u}_${D}`, famille: 'bvp', niveau: 2, competence: 'CP-N5-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `${u} + ${D} (unités d'abord : piège d'inversion)`, attendu: n, pieges: { [Number(`${u}${d}`)]: INV },
    donnees: { op: 'add', args: [u, D], dits: [u, D] },
    scene: () => eq(u, '+', D), aide: () => barresCubes(d, u, true) + grand(`${u} + ${D} = ${n}`),
    textes: { c: `Combien font ${L(u)} plus ${L(D)} ?`,
      e: `${cap(L(u))} plus ${L(D)}, ça fait ${L(n)} : ${dz(d)} et ${un(u)}. On écrit ${L(d)}, puis ${L(u)}.` } });
}
for (const [d, c] of [[2, 13], [3, 15], [4, 12], [7, 12], [5, 16], [2, 18], [6, 14], [3, 19]]) {
  const n = 10 * d + c;
  item({ id: `bvp_nc_${d}_${c}`, famille: 'bvp', niveau: 3, competence: 'CP-N4-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `${d} barres + ${c} cubes = ${n} (forme non canonique)`, attendu: n, pieges: { [Number(`${d}${c}`)]: 'a écrit les barres puis les cubes' },
    donnees: { op: 'du', args: [d, c], dits: [d, c] },
    scene: () => barresCubes(d, c), aide: () => barresCubes(d + 1, c - 10, true) + grand(`${10 * d} + ${c} = ${n}`),
    textes: { c: `Il y a ${L(d)} barres de dix et ${L(c)} petits cubes. Quel nombre cela fait-il ?`,
      e: `${cap(L(d))} barres, ça fait ${L(10 * d)}. ${cap(L(c))} petits cubes, c'est encore une barre de dix et ${L(c - 10)} cubes. ${cap(L(10 * d))} plus ${L(c)} égale ${L(n)}.` } });
}
for (const n of [47, 63, 85, 29, 71]) {
  const d = Math.floor(n / 10), u = n % 10;
  item({ id: `bvp_chd_${n}`, famille: 'bvp', niveau: 1, competence: 'CP-N5-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `Combien de dizaines dans ${n} ?`, attendu: d, pieges: { [u]: 'a donné les unités' },
    donnees: { op: 'chifD', args: [n], dits: [n] },
    scene: () => grandLong(String(n)), aide: () => barresCubes(d, u, true) + grand(`${n} = ${d * 10} + ${u}`),
    textes: { c: `Voici ${L(n)}. Combien y a-t-il de dizaines ?`, e: `${cap(L(n))}, c'est ${dz(d)} et ${un(u)}. Il y a ${L(d)} dizaines.` } });
}
for (const n of [58, 34, 92, 76, 43]) {
  const d = Math.floor(n / 10), u = n % 10;
  item({ id: `bvp_chu_${n}`, famille: 'bvp', niveau: 1, competence: 'CP-N5-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `Combien d'unités dans ${n} ?`, attendu: u, pieges: { [d]: 'a donné les dizaines' },
    donnees: { op: 'chifU', args: [n], dits: [n] },
    scene: () => grandLong(String(n)), aide: () => barresCubes(d, u, true) + grand(`${n} = ${d * 10} + ${u}`),
    textes: { c: `Voici ${L(n)}. Combien y a-t-il d'unités ?`, e: `${cap(L(n))}, c'est ${dz(d)} et ${un(u)}. Il y a ${L(u)} unités.` } });
}
for (const [n, D] of [[37, 30], [52, 50], [86, 80], [74, 70], [95, 90], [28, 20]]) {
  const u = n - D, d = D / 10;
  item({ id: `bvp_sous_${n}`, famille: 'bvp', niveau: 1, competence: 'CP-N5-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `${n} = ${D} + ?`, attendu: u, pieges: { [n + D]: ADD },
    donnees: { op: 'manq', args: [D, n], dits: [n, D] },
    scene: () => grand(`${n} = ${D} + ${TROU}`), aide: () => barresCubes(d, u, true) + grand(`${n} = ${D} + ${u}`),
    textes: { c: `${cap(L(n))}, c'est ${L(D)} plus combien ?`, e: `${cap(L(n))}, c'est ${dz(d)} et ${un(u)}. ${cap(L(n))}, c'est ${L(D)} plus ${L(u)}.` } });
}

// =====================================================================================
// brp — Représentations : dictées 60-99 (valeur de position CP-N5-100, comme N6), lire et
// fabriquer avec barres et cubes (CP-N4 ★)
// =====================================================================================
for (const n of [61, 66, 70, 73, 77, 79, 80, 84, 88, 90, 93, 95, 98, 99, 71, 76]) {
  const d = Math.floor(n / 10), u = n % 10;
  const pieges = {};
  if (d === 7 || d === 9) { pieges[Number(`${d - 1}${10 + u}`)] = 'a écrit les morceaux entendus'; pieges[Number(`${d}0${u}`)] = 'a écrit un zéro en trop'; }
  if (d === 8) pieges[Number(`4${20 + u}`)] = 'a écrit les morceaux entendus';
  item({ id: `brp_dic_${n}`, famille: 'brp', niveau: n < 70 ? 1 : n < 80 ? 2 : 3, competence: 'CP-N5-100', domaine: 'Écriture des nombres',
    libelle: `Dictée : ${n}`, attendu: n, pieges, donnees: { op: 'dict', args: [n], dits: [n] },
    scene: () => dictee(), aide: () => barresCubes(d, u, true) + grand(String(n)),
    textes: { c: `Écris le nombre ${L(n)}.`,
      e: u ? `${cap(L(n))}, c'est ${dz(d)} et ${un(u)}. On écrit ${L(d)}, puis ${L(u)}.`
        : `${cap(L(n))}, c'est ${dz(d)}, sans unité. On écrit ${L(d)}, puis zéro.` } });
}
const motBarres = d => d === 1 ? 'Une barre de dix' : `${cap(L(d))} barres de dix`;
const motCubes = u => u === 1 ? 'un petit cube' : `${L(u)} petits cubes`;
for (const [d, u] of [[2, 7], [4, 3], [3, 0], [5, 9], [6, 2], [7, 5], [8, 1], [9, 6]]) {
  const n = 10 * d + u;
  item({ id: `brp_lire_${n}`, famille: 'brp', niveau: n <= 59 ? 1 : 2, competence: 'CP-N4-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `Lire ${d} barres + ${u} cubes (${n})`, attendu: n, pieges: u ? { [10 * u + d]: INV } : undefined,
    consigne: 'b_lire_c', donnees: { op: 'du', args: [d, u], dits: [] },
    scene: () => barresCubes(d, u), aide: () => barresCubes(d, u, true) + grand(String(n)),
    textes: { c: 'Quel nombre montrent ces barres de dix et ces petits cubes ?',
      e: `${motBarres(d)}, ça fait ${L(10 * d)}. ${u ? `Et ${motCubes(u)} : ${L(n)}.` : `Il n'y a pas de petit cube : ${L(n)}.`}` } });
}
for (const n of [34, 58, 47, 62, 85, 91, 73, 26]) {
  const d = Math.floor(n / 10), u = n % 10;
  item({ id: `brp_cons_${n}`, famille: 'brp', niveau: n <= 59 ? 1 : 2, competence: 'CP-N4-' + parRang(n), domaine: 'Dizaines / unités',
    libelle: `Construire ${n} avec barres et cubes`, type: 'barres', valeur: n,
    attendu: `${n} (${d} barre${d > 1 ? 's' : ''} + ${u} cube${u > 1 ? 's' : ''})`,
    verifier: r => !!r && Number.isInteger(r.barres) && Number.isInteger(r.cubes) && r.barres * 10 + r.cubes === n,
    canonique: r => !!r && r.barres === d && r.cubes === u,
    donnees: { op: 'cons', args: [n], dits: [n] },
    scene: () => grand(String(n)), aide: () => grand(String(n)) + barresCubes(d, u, true),
    textes: { c: `Fabrique le nombre ${L(n)}, avec les barres de dix et les petits cubes. Quand tu as fini, touche le bouton vert.`,
      e: `${cap(L(n))}, c'est ${motBarres(d).toLowerCase()} et ${motCubes(u)} : ${L(10 * d)}, et encore ${L(u)}.` } });
}

// =====================================================================================
// bdg — Demi-droite graduée de un en un (CP-N8 ★) ; ligne de 0 à 100 non graduée (HP-R1 ★)
// =====================================================================================
for (const [deb, fin, v] of [[0, 10, 3], [0, 10, 8], [10, 20, 13], [10, 20, 17], [0, 20, 12], [30, 40, 36], [40, 60, 48],
  [50, 60, 54], [60, 80, 73], [70, 90, 82], [80, 100, 96], [20, 40, 27], [0, 20, 19], [60, 70, 68], [90, 100, 92]]) {
  const etiq = []; for (let x = deb; x <= fin; x++) if (x % 5 === 0) etiq.push(x);
  const lo = Math.max(...etiq.filter(x => x <= v)), hi = Math.min(...etiq.filter(x => x >= v));
  const avance = v - lo <= hi - v;
  const pas = []; if (avance) for (let x = lo + 1; x <= v; x++) pas.push(x); else for (let x = hi - 1; x >= v; x--) pas.push(x);
  item({ id: `bdg_fl_${deb}_${fin}_${v}`, famille: 'bdg', niveau: fin <= 20 ? 1 : fin <= 60 ? 2 : 3, competence: 'CP-N8', domaine: 'Droite graduée',
    libelle: `Droite ${deb}–${fin} de 1 en 1 : la flèche montre ${v}`, attendu: v, consigne: 'c4_07_c',
    donnees: { op: 'fleche', args: [deb, fin, v], dits: [], etiquettes: etiq },
    scene: () => droiteGraduee(deb, fin, etiq, v), aide: () => droiteGraduee(deb, fin, [...etiq, v], v) + grand(String(v)),
    textes: { c: 'Sur cette ligne, on avance de un en un. Quel nombre est sous la flèche orange ?',
      e: `On part de ${L(avance ? lo : hi)}, et on ${avance ? 'avance' : 'recule'} : ${suite(pas)}. La flèche montre ${L(v)}.` } });
}
const PHRASE_LIGNE = {
  10: 'Dix est tout près de zéro : dix petits pas après zéro.',
  15: 'Quinze est près de zéro, un peu après dix.',
  20: 'Vingt est près de zéro, avant le milieu. Le milieu, c\'est cinquante.',
  25: 'Vingt-cinq est au milieu, entre zéro et cinquante.',
  30: 'Trente est avant cinquante, le milieu de la ligne, mais plus près du milieu que de zéro.',
  40: 'Quarante est juste avant cinquante, le milieu de la ligne.',
  60: 'Soixante est juste après cinquante, le milieu de la ligne.',
  70: 'Soixante-dix est après cinquante, le milieu, mais plus près du milieu que de cent.',
  75: 'Soixante-quinze est au milieu, entre cinquante et cent.',
  80: 'Quatre-vingts est près de cent : il ne manque que vingt.'
};
for (const cible of [10, 20, 25, 30, 40, 60, 70, 75, 80, 15]) {
  item({ id: `bdg_ln_${cible}`, famille: 'bdg', niveau: [25, 75, 15].includes(cible) ? 3 : 2, competence: 'HP-R1', domaine: 'Ligne numérique',
    libelle: `Placer ${cible} sur une ligne 0–100 (tolérance ±5)`, type: 'ligne', bornes: [0, 100], cible, tolerance: 5,
    attendu: cible, aideComplete: true, verifier: r => typeof r === 'number' && Math.abs(r - cible) <= 5,
    donnees: { op: 'ligne', args: [cible], dits: [cible] },
    scene: () => grand(String(cible)), aide: (c, r) => grand(String(cible)) + ligneAide(cible, r),
    textes: { c: `Voici une ligne qui va de zéro à cent. Touche l'endroit où se trouve ${L(cible)}.`, e: PHRASE_LIGNE[cible] } });
}

// =====================================================================================
// bad — Additions jusqu'à 100 : sans retenue (CP-C9 ★), plus 9 (CP-C8), passage de la dizaine
// avec un nombre < 10 (CP-C7), deux nombres avec retenue (CP-C9 ★)
// =====================================================================================
for (const [a, b] of [[23, 14], [32, 25], [41, 36], [52, 17], [35, 42], [61, 24], [44, 33], [16, 52], [70, 25], [53, 26]]) {
  item({ id: `bad_ssr_${a}_${b}`, famille: 'bad', niveau: 1, competence: 'CP-C9', domaine: 'Addition',
    libelle: `${a} + ${b} (sans retenue)`, attendu: a + b, pieges: { [Number(String(a + b).split('').reverse().join(''))]: INV },
    donnees: { op: 'add', args: [a, b], dits: [a, b] },
    scene: () => eq(a, '+', b), aide: () => plusGroupes(bc(a), bc(b)) + grand(`${a} + ${b} = ${a + b}`),
    textes: { c: `Combien font ${L(a)} plus ${L(b)} ?`, e: stratAdd(a, b) } });
}
for (const x of [14, 23, 36, 45, 57, 68]) {
  item({ id: `bad_p9_${x}`, famille: 'bad', niveau: 2, competence: 'CP-C8', domaine: 'Ajouter 9',
    libelle: `${x} + 9`, attendu: x + 9, pieges: { [x + 10]: 'a ajouté dix au lieu de neuf' },
    donnees: { op: 'add', args: [x, 9], dits: [x, 9] },
    scene: () => eq(x, '+', 9), aide: () => grand(`${x} + 10 = ${x + 10}`) + grand(`${x + 10} − 1 = ${x + 9}`),
    textes: { c: `Combien font ${L(x)} plus neuf ?`, e: stratAdd(x, 9) } });
}
for (const [x, u] of [[27, 5], [38, 4], [46, 7], [59, 3], [65, 8], [74, 9], [18, 6], [83, 8]]) {
  const s = x + u, D = Math.ceil(x / 10) * 10;
  item({ id: `bad_u_${x}_${u}`, famille: 'bad', niveau: 2, competence: u === 9 ? 'CP-C8' : 'CP-C7', domaine: 'Passage de la dizaine',
    libelle: `${x} + ${u} (passer par ${D})`, attendu: s, pieges: { [s - 10]: RETENUE },
    donnees: { op: 'add', args: [x, u], dits: [x, u] },
    scene: () => eq(x, '+', u), aide: () => grand(`${x} + ${D - x} = ${D}`) + grand(`${D} + ${s - D} = ${s}`),
    textes: { c: `Combien font ${L(x)} plus ${L(u)} ?`, e: u === 9 ? stratAdd(x, 9) : stratAdd(x, u) } });
}
for (const [a, b] of [[27, 15], [38, 24], [46, 37], [19, 26], [55, 28], [34, 48]]) {
  const s = a + b;
  item({ id: `bad_ac_${a}_${b}`, famille: 'bad', niveau: 3, competence: 'CP-C9', domaine: 'Addition',
    libelle: `${a} + ${b} (avec retenue)`, attendu: s, pieges: { [s - 10]: RETENUE },
    donnees: { op: 'add', args: [a, b], dits: [a, b] },
    scene: () => eq(a, '+', b), aide: () => plusGroupes(bc(a), bc(b)) + grand(`${a} + ${b} = ${s}`),
    textes: { c: `Combien font ${L(a)} plus ${L(b)} ?`, e: stratAdd(a, b) } });
}

// =====================================================================================
// bso — Soustractions : ≤ 10 (CP-C1 ★, tables dans les deux sens), dizaine moins un nombre < 10
// (CP-C11), ± 1 ou 2 (CP-C3), passage de la dizaine sous 20 (CP-C1 ★)
// =====================================================================================
for (const [a, b] of [[7, 2], [9, 4], [8, 5], [6, 3], [10, 6], [9, 7], [8, 2], [7, 4]]) {
  item({ id: `bso_s10_${a}_${b}`, famille: 'bso', niveau: 1, competence: 'CP-C1', domaine: 'Soustraction',
    libelle: `${a} − ${b}`, attendu: a - b, pieges: { [a + b]: ADD },
    donnees: { op: 'sub', args: [a, b], dits: [a, b] },
    scene: () => eq(a, '−', b), aide: () => rangee('point', a, 26, b) + grand(`${a} − ${b} = ${a - b}`),
    textes: { c: `Combien font ${L(a)} moins ${L(b)} ?`, e: stratSub(a, b) } });
}
for (const [D, u] of [[20, 3], [40, 2], [30, 5], [50, 4], [60, 1], [70, 6], [80, 3], [90, 7]]) {
  item({ id: `bso_dz_${D}_${u}`, famille: 'bso', niveau: 2, competence: 'CP-C11', domaine: 'Soustraction',
    libelle: `${D} − ${u}`, attendu: D - u, pieges: { [D + u]: ADD },
    donnees: { op: 'sub', args: [D, u], dits: [D, u] },
    scene: () => eq(D, '−', u), aide: () => bc(D - 10) + boiteDe10(10 - u) + grand(`${D} − ${u} = ${D - u}`),
    textes: { c: `Combien font ${L(D)} moins ${L(u)} ?`, e: stratSub(D, u) } });
}
for (const [x, k, s] of [[47, 1, '+'], [59, 1, '+'], [38, 2, '+'], [70, 1, '−'], [63, 2, '−'], [81, 2, '−'], [99, 1, '+'], [50, 2, '−']]) {
  const ajout = s === '+', r = ajout ? x + k : x - k;
  item({ id: `bso_v12_${x}_${ajout ? 'p' : 'm'}${k}`, famille: 'bso', niveau: 1, competence: 'CP-C3', domaine: ajout ? 'Plus 1 ou 2' : 'Moins 1 ou 2',
    libelle: `${x} ${s} ${k}`, attendu: r, pieges: ajout ? { [x - k]: SOUS } : { [x + k]: ADD },
    donnees: { op: ajout ? 'add' : 'sub', args: [x, k], dits: [x, k] },
    scene: () => eq(x, s, k), aide: () => grand(`${x} ${s} ${k} = ${r}`),
    textes: { c: `Combien font ${L(x)} ${ajout ? 'plus' : 'moins'} ${L(k)} ?`,
      e: ajout ? `Après ${L(x)}, il y a ${L(x + 1)}${k === 2 ? `, puis ${L(x + 2)}` : ''}. ${cap(L(x))} plus ${L(k)} égale ${L(r)}.` : stratSub(x, k) } });
}
for (const [a, b] of [[13, 5], [15, 7], [12, 4], [16, 7], [14, 6], [11, 3]]) {
  item({ id: `bso_t20_${a}_${b}`, famille: 'bso', niveau: 3, competence: 'CP-C1', domaine: 'Soustraction',
    libelle: `${a} − ${b} (passer par dix)`, attendu: a - b, pieges: { [a + b]: ADD },
    donnees: { op: 'sub', args: [a, b], dits: [a, b] },
    scene: () => eq(a, '−', b), aide: () => grand(`${a} − ${a - 10} = 10`) + grand(`10 − ${b - (a - 10)} = ${a - b}`),
    textes: { c: `Combien font ${L(a)} moins ${L(b)} ?`, e: stratSub(a, b) } });
}

// =====================================================================================
// bpb — Problèmes : parties-tout, ajout, retrait (CP-P1 ★) ; état initial ou transformation
// inconnus (CP-O1 ★) ; comparaison (CE1-P1 ★) ; deux étapes ≤ 30 (CP-P2 ★)
// =====================================================================================
const PERS = [['Tom', 'il'], ['Léa', 'elle'], ['Noé', 'il'], ['Zoé', 'elle']];
const niveauPb = m => m <= 10 ? 1 : m <= 20 ? 2 : 3;
// Aide : petits nombres → objets dessinés ; sinon barres et cubes du résultat.
const aideObjets = (nom, n, barres = 0) => n <= 12 ? rangee(nom, n, 24, barres) : bc(n - barres);
let kp = 0;
const pers = () => PERS[kp++ % PERS.length];

for (const [a, b] of [[4, 3], [5, 4], [6, 3], [2, 7], [8, 2], [12, 5], [14, 6], [23, 15]]) {
  const [P, il] = pers(), t = a + b;
  item({ id: `bpb_pt_${a}_${b}`, famille: 'bpb', niveau: niveauPb(t), competence: 'CP-P1', domaine: 'Problème (parties-tout)',
    libelle: `${a} billes bleues et ${b} rouges : combien en tout ?`, attendu: t, pieges: { [Math.abs(a - b)]: SOUS },
    donnees: { op: 'add', args: [a, b], dits: [a, b] },
    scene: () => illustration('bille', 1, 110), aide: () => aideObjets('bille', t) + grand(`${a} + ${b} = ${t}`),
    textes: { c: `${P} a ${L(a)} billes bleues et ${L(b)} billes rouges. Combien de billes a-t-${il} en tout ?`,
      e: `${cap(L(a))} plus ${L(b)}, ça fait ${L(t)}. ${cap(il)} a ${L(t)} billes en tout.` } });
}
for (const [t, a] of [[7, 3], [9, 5], [10, 6], [8, 2], [15, 10], [18, 8], [25, 20], [30, 12]]) {
  const r = t - a;
  item({ id: `bpb_pp_${t}_${a}`, famille: 'bpb', niveau: niveauPb(t), competence: 'CP-P1', domaine: 'Problème (parties-tout)',
    libelle: `${t} cartes dont ${a} jaunes : combien de vertes ?`, attendu: r, pieges: { [t + a]: ADD },
    donnees: { op: 'sub', args: [t, a], dits: [t, a] },
    scene: () => illustration('carte', 1, 110), aide: () => aideObjets('carte', t, a) + grand(`${t} = ${a} + ${r}`),
    textes: { c: `Dans la boîte, il y a ${L(t)} cartes. ${cap(L(a))} sont jaunes. Les autres sont vertes. Combien de cartes vertes y a-t-il ?`,
      e: `${cap(L(t))}, c'est ${L(a)} plus ${L(r)}. Il y a ${L(r)} cartes vertes.` } });
}
for (const [a, b] of [[5, 3], [7, 2], [6, 4], [11, 5], [15, 4], [24, 10]]) {
  const [P, il] = pers(), t = a + b;
  item({ id: `bpb_aj_${a}_${b}`, famille: 'bpb', niveau: niveauPb(t), competence: 'CP-P1', domaine: 'Problème (ajout)',
    libelle: `${a} cartes, on en donne ${b}`, attendu: t, pieges: { [a - b]: SOUS },
    donnees: { op: 'add', args: [a, b], dits: [a, b] },
    scene: () => illustration('carte', 1, 110), aide: () => aideObjets('carte', t) + grand(`${a} + ${b} = ${t}`),
    textes: { c: `${P} a ${L(a)} cartes. On lui en donne ${L(b)}. Combien de cartes a-t-${il} maintenant ?`,
      e: `${cap(il)} avait ${L(a)} cartes, et on lui en donne ${L(b)} de plus. ${cap(L(a))} plus ${L(b)}, ça fait ${L(t)}.` } });
}
for (const [a, b] of [[8, 3], [9, 4], [10, 7], [14, 4], [17, 5], [26, 10]]) {
  const [P, il] = pers(), r = a - b;
  item({ id: `bpb_re_${a}_${b}`, famille: 'bpb', niveau: niveauPb(a), competence: 'CP-P1', domaine: 'Problème (retrait)',
    libelle: `${a} bonbons, en manger ${b}`, attendu: r, pieges: { [a + b]: ADD },
    donnees: { op: 'sub', args: [a, b], dits: [a, b] },
    scene: () => illustration('bonbon', 1, 110), aide: () => aideObjets('bonbon', a, b) + grand(`${a} − ${b} = ${r}`),
    textes: { c: `${P} a ${L(a)} bonbons. ${cap(il)} en mange ${L(b)}. Combien de bonbons lui reste-t-il ?`,
      e: `${cap(il)} en avait ${L(a)}, ${il} en enlève ${L(b)}. ${cap(L(a))} moins ${L(b)}, ça fait ${L(r)}. Il lui reste ${L(r)} bonbons.` } });
}
for (const [b, f] of [[3, 8], [2, 9], [4, 10], [5, 12], [6, 15], [10, 24]]) {
  const [P, il] = pers(), a = f - b;
  item({ id: `bpb_ei_${b}_${f}`, famille: 'bpb', niveau: niveauPb(f), competence: 'CP-O1', domaine: 'Sens des opérations',
    libelle: `Avait ?, gagne ${b}, a maintenant ${f} : combien avant ?`, attendu: a, pieges: { [f + b]: ADD },
    donnees: { op: 'sub', args: [f, b], dits: [b, f] },
    scene: () => illustration('etoile', 1, 110), aide: () => aideObjets('etoile', f, b) + grand(`${a} + ${b} = ${f}`),
    textes: { c: `${P} avait des étoiles. ${cap(il)} en gagne ${L(b)}. Maintenant, ${il} en a ${L(f)}. Combien d'étoiles avait-${il} avant ?`,
      e: `Maintenant, ${il} en a ${L(f)}, dont ${L(b)} gagnées. Avant, ${il} en avait ${L(f)} moins ${L(b)} : ${L(a)} étoiles.` } });
}
for (const [a, f] of [[4, 7], [5, 9], [3, 10], [8, 13], [12, 18], [20, 26]]) {
  const [P, il] = pers(), g = f - a;
  item({ id: `bpb_tr_${a}_${f}`, famille: 'bpb', niveau: niveauPb(f), competence: 'CP-O1', domaine: 'Sens des opérations',
    libelle: `A ${a} billes, puis ${f} : combien gagnées ?`, attendu: g, pieges: { [a + f]: ADD },
    donnees: { op: 'sub', args: [f, a], dits: [a, f] },
    scene: () => illustration('bille', 1, 110), aide: () => aideObjets('bille', f, a) + grand(`${a} + ${g} = ${f}`),
    textes: { c: `${P} a ${L(a)} billes. Après la récréation, ${il} en a ${L(f)}. Combien de billes a-t-${il} gagnées ?`,
      e: `${cap(L(f))}, c'est ${L(a)} plus ${L(g)}. ${cap(il)} a gagné ${L(g)} billes.` } });
}
for (const [a, b] of [[5, 3], [6, 2], [7, 4], [9, 5], [12, 6], [15, 10]]) {
  const t = a + b;
  item({ id: `bpb_cp_${a}_${b}`, famille: 'bpb', niveau: niveauPb(t), competence: 'CE1-P1', domaine: 'Problème (comparaison)',
    libelle: `Tom ${a} cartes, Léa ${b} de plus`, attendu: t, pieges: { [a - b]: SOUS, [b]: 'a donné l\'écart' },
    donnees: { op: 'add', args: [a, b], dits: [a, b] },
    scene: () => illustration('carte', 2, 70),
    aide: () => `<div class="probleme-aide"><div><b>Tom</b>${aideObjets('carte', a)}</div><div><b>Léa</b>${aideObjets('carte', t)}</div></div>` + grand(`${a} + ${b} = ${t}`),
    textes: { c: `Tom a ${L(a)} cartes. Léa a ${L(b)} cartes de plus que Tom. Combien de cartes a Léa ?`,
      e: `Léa a autant de cartes que Tom, et ${L(b)} de plus. ${cap(L(a))} plus ${L(b)}, ça fait ${L(t)}.` } });
}
for (const [a, b] of [[8, 3], [10, 4], [9, 6], [13, 5], [16, 6], [20, 7]]) {
  const r = a - b;
  item({ id: `bpb_cm_${a}_${b}`, famille: 'bpb', niveau: niveauPb(a), competence: 'CE1-P1', domaine: 'Problème (comparaison)',
    libelle: `Zoé ${a} billes, Noé ${b} de moins`, attendu: r, pieges: { [a + b]: ADD, [b]: 'a donné l\'écart' },
    donnees: { op: 'sub', args: [a, b], dits: [a, b] },
    scene: () => illustration('bille', 2, 70),
    aide: () => `<div class="probleme-aide"><div><b>Zoé</b>${aideObjets('bille', a)}</div><div><b>Noé</b>${aideObjets('bille', r)}</div></div>` + grand(`${a} − ${b} = ${r}`),
    textes: { c: `Zoé a ${L(a)} billes. Noé a ${L(b)} billes de moins que Zoé. Combien de billes a Noé ?`,
      e: `Noé en a moins que Zoé. ${cap(L(a))} moins ${L(b)}, ça fait ${L(r)}. Noé a ${L(r)} billes.` } });
}
for (const [a, b] of [[5, 8], [4, 9], [6, 10], [7, 12], [10, 16], [13, 20]]) {
  const r = b - a;
  item({ id: `bpb_ec_${a}_${b}`, famille: 'bpb', niveau: niveauPb(b), competence: 'CE1-P1', domaine: 'Problème (comparaison)',
    libelle: `Tom ${a}, Léa ${b} : combien de plus ?`, attendu: r, pieges: { [a + b]: ADD },
    donnees: { op: 'sub', args: [b, a], dits: [a, b] },
    scene: () => illustration('bonbon', 2, 70),
    aide: () => `<div class="probleme-aide"><div><b>Tom</b>${aideObjets('bonbon', a)}</div><div><b>Léa</b>${aideObjets('bonbon', b)}</div></div>` + grand(`${a} + ${r} = ${b}`),
    textes: { c: `Tom a ${L(a)} bonbons. Léa en a ${L(b)}. Combien de bonbons Léa a-t-elle de plus que Tom ?`,
      e: `${cap(L(b))}, c'est ${L(a)} plus ${L(r)}. Léa a ${L(r)} bonbons de plus que Tom.` } });
}
for (const [a, b, c] of [[5, 4, 2], [6, 3, 4], [8, 5, 3], [10, 6, 5], [12, 7, 4], [15, 8, 6], [9, 9, 5], [20, 6, 8]]) {
  const [P, il] = pers(), m = a + b, r = m - c;
  item({ id: `bpb_de_${a}_${b}_${c}`, famille: 'bpb', niveau: niveauPb(m), competence: 'CP-P2', domaine: 'Problème (deux étapes)',
    libelle: `${a} billes, gagne ${b}, perd ${c}`, attendu: r, pieges: { [a + b + c]: 'a tout additionné', [m]: 'a oublié la 2e étape' },
    donnees: { op: 'deux', args: [a, b, c], dits: [a, b, c] },
    scene: () => illustration('bille', 1, 110), aide: () => grand(`${a} + ${b} = ${m}`) + grand(`${m} − ${c} = ${r}`),
    textes: { c: `${P} a ${L(a)} billes. ${cap(il)} en gagne ${L(b)}. Puis ${il} en perd ${L(c)}. Combien de billes a-t-${il} maintenant ?`,
      e: `${cap(L(a))} plus ${L(b)}, ça fait ${L(m)}. Puis ${L(m)} moins ${L(c)}, ça fait ${L(r)} billes.` } });
}

// =====================================================================================
// bvf — « Vérifie le calcul d'un ami » (précipitation) : la réponse fausse est barrée
// =====================================================================================
for (const [a, s, b, faux, comp, niv] of [
  [7, '+', 5, 11, 'CP-C1', 1], [9, '+', 6, 14, 'CP-C1', 1], [8, '+', 7, 16, 'CP-C1', 1], [6, '+', 6, 13, 'CP-C2', 1],
  [10, '−', 4, 14, 'CP-C1', 1], [9, '−', 3, 12, 'CP-C1', 1], [14, '+', 10, 25, 'CP-C4', 2], [35, '+', 20, 57, 'CP-C5', 2],
  [46, '+', 10, 47, 'CP-C4', 2], [62, '−', 10, 72, 'CP-C4', 2], [40, '+', 8, 84, 'CP-N5-100', 2], [23, '+', 14, 73, 'CP-C9', 2],
  [50, '−', 3, 53, 'CP-C11', 3], [27, '+', 5, 22, 'CP-C7', 3], [38, '+', 4, 32, 'CP-C7', 3], [19, '+', 9, 29, 'CP-C8', 3]]) {
  const ajout = s === '+', r = ajout ? a + b : a - b;
  item({ id: `bvf_${a}_${ajout ? 'p' : 'm'}${b}_${faux}`, famille: 'bvf', niveau: niv, competence: comp, domaine: 'Vérification',
    libelle: `Un ami a trouvé ${a} ${s} ${b} = ${faux} : bon résultat ?`, attendu: r, pieges: { [faux]: 'a recopié le résultat de l\'ami' },
    donnees: { op: ajout ? 'add' : 'sub', args: [a, b], dits: [a, b, faux] },
    scene: () => calculAmi(`${a} ${s} ${b}`, faux), aide: () => grand(`${a} ${s} ${b} = ${r}`),
    textes: { c: `Un ami a calculé ${L(a)} ${ajout ? 'plus' : 'moins'} ${L(b)}, et il a trouvé ${L(faux)}. Vérifie. Quel est le bon résultat ?`,
      e: `${ajout ? stratAdd(a, b) : stratSub(a, b)} Ce n'est pas ${L(faux)}.` } });
}

// =====================================================================================
// bcs — Comparer (CP-N6) ; suites régulières (HP-R2)
// =====================================================================================
for (const [nombres, sens] of [[[46, 64], 'max'], [[38, 83], 'max'], [[57, 75], 'min'], [[29, 92], 'max'], [[61, 16], 'min'],
  [[70, 67, 76], 'max'], [[89, 98, 88], 'max'], [[45, 54, 44], 'min'], [[13, 31, 30], 'min'], [[80, 79, 81], 'max']]) {
  const rep = sens === 'max' ? Math.max(...nombres) : Math.min(...nombres);
  const dRep = Math.floor(rep / 10);
  const memeDizaine = nombres.filter(n => n !== rep && Math.floor(n / 10) === dRep).length > 0;
  const grandOuPetit = sens === 'max' ? 'grand' : 'petit';
  item({ id: `bcs_cmp_${sens}_${nombres.join('_')}`, famille: 'bcs', niveau: nombres.length === 2 ? 1 : 2,
    competence: 'CP-N6-' + parRang(Math.max(...nombres)), domaine: 'Comparaison', type: 'choix', choix: nombres,
    libelle: `Le plus ${grandOuPetit} parmi ${nombres.join(', ')}`, attendu: rep, consigne: sens === 'max' ? 'c1_13_c' : 'c2_14_c',
    donnees: { op: sens, args: nombres, dits: [] },
    aide: () => `<div class="comparaison">${nombres.map(n => `<div>${grand(String(n))}${bc(n)}</div>`).join('')}</div>`,
    textes: { c: `Touche le nombre le plus ${grandOuPetit}.`,
      e: memeDizaine
        ? `On regarde d'abord les dizaines. Quand elles sont pareilles, on regarde les unités. Le plus ${grandOuPetit}, c'est ${L(rep)}.`
        : `On regarde d'abord les dizaines. ${cap(L(rep))} a ${dz(dRep)}. Le plus ${grandOuPetit}, c'est ${L(rep)}.` } });
}
for (const [a, k] of [[2, 2], [5, 5], [10, 10], [3, 2], [20, 5], [40, 10], [15, -1], [30, -2], [90, -10], [25, 5]]) {
  const ns = [a, a + k, a + 2 * k], r = a + 3 * k;
  item({ id: `bcs_sui_${a}_${k < 0 ? 'm' + -k : 'p' + k}`, famille: 'bcs', niveau: k < 0 ? 2 : 1, competence: 'HP-R2', domaine: 'Suite logique',
    libelle: `${ns.join(', ')}, … ?`, attendu: r, donnees: { op: 'suite', args: [a, k], dits: ns },
    scene: () => suiteATrou(ns), aide: () => grandLong(`${ns.join(' · ')} · ${r}`) + grand(`${k > 0 ? '+' : '−'} ${Math.abs(k)}`),
    textes: { c: `${cap(L(ns[0]))}, ${L(ns[1])}, ${L(ns[2])}. Quel nombre vient après ?`,
      e: `On ${k > 0 ? 'ajoute' : 'enlève'} ${L(Math.abs(k))} à chaque fois. Après ${L(ns[2])}, il y a ${L(r)}.` } });
}

// =====================================================================================
// bmu — Groupes égaux : problèmes multiplicatifs ≤ 30 (CP-P3) ; combien de groupes (CP-O4)
// =====================================================================================
for (const [g, k] of [[2, 5], [3, 2], [4, 2], [2, 10], [3, 5], [5, 3], [4, 5], [3, 10], [6, 2], [5, 5]]) {
  const t = g * k, cumul = Array.from({ length: g }, (_, i) => k * (i + 1));
  item({ id: `bmu_grp_${g}_${k}`, famille: 'bmu', niveau: t <= 10 ? 1 : t <= 20 ? 2 : 3, competence: 'CP-P3', domaine: 'Problème (multiplicatif)',
    libelle: `${g} boîtes de ${k} bonbons`, attendu: t, pieges: { [g + k]: ADD },
    donnees: { op: 'mul', args: [g, k], dits: [g, k] },
    scene: () => illustration('bonbon', 1, 110),
    aide: () => `<div class="groupes">${Array.from({ length: g }, () => rangee('bonbon', k, k > 5 ? 14 : 20)).join('<span class="plus">+</span>')}</div>` + grand(cumul.join(' · ')),
    textes: { c: `Il y a ${L(g)} boîtes. Dans chaque boîte, il y a ${L(k)} bonbons. Combien de bonbons y a-t-il en tout ?`,
      e: `${cap(L(k))}${', plus '.concat(L(k)).repeat(g - 1)} : ${suite(cumul)}. Il y a ${L(t)} bonbons.` } });
}
for (const [t, k] of [[10, 2], [15, 5], [20, 10], [12, 3], [8, 4]]) {
  const n = t / k, cumul = Array.from({ length: n }, (_, i) => k * (i + 1));
  item({ id: `bmu_nb_${t}_${k}`, famille: 'bmu', niveau: 2, competence: 'CP-O4', domaine: 'Groupes égaux',
    libelle: `${t} billes par paquets de ${k} : combien de paquets ?`, attendu: n, pieges: { [t - k]: SOUS },
    donnees: { op: 'grp', args: [t, k], dits: [t, k] },
    scene: () => illustration('bille', 1, 110),
    aide: () => `<div class="groupes">${Array.from({ length: n }, () => rangee('bille', k, 16)).join('')}</div>` + grand(cumul.join(' · ')),
    textes: { c: `On range ${L(t)} billes par paquets de ${L(k)}. Combien de paquets peut-on faire ?`,
      e: `On compte de ${L(k)} en ${L(k)} : ${suite(cumul)}. Ça fait ${L(n)} paquets.` } });
}

// ---------- Exports ----------
export const BANQUE = B;
export const BANQUE_PAR_ID = Object.fromEntries(B.map(it => [it.id, it]));
// Compétence de chaque item (fusionnée dans ITEM_COMPETENCE par referentiel.js).
export const COMPETENCE_BANQUE = Object.fromEntries(B.map(it => [it.id, it.competence]));
// Phrases à enregistrer : consignes propres ou partagées (it.consigne), et explications.
export function phrasesBanque() {
  const P = {};
  for (const it of B) {
    P[it.consigne || it.id + '_c'] = it.textes.c;
    P[it.id + '_e'] = it.textes.e;
  }
  return P;
}
