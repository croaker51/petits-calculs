// Module LECTURE (S1.5) — « le jeu des mots », commun aux deux enfants, jeu au choix (décisions de Simon, 09/10).
// Contenu FIXE, comme les séances de maths (résultats comparables). Testable sous Node (tests/test_lecture.mjs).
//
// Règles propres à la lecture :
//  - 100 % déchiffrable avec les sons vus en classe (SONS_VUS) + mots connus globalement (MOTS_CONNUS) ;
//    les lettres muettes sont GRISÉES (convention de la classe) : notées [x] dans les données.
//  - L'enfant répond en TOUCHANT (pas de reconnaissance vocale : données d'enfant, fiabilité à 6 ans).
//  - La voix ne lit JAMAIS le mot ou la phrase à lire avant la réponse (sinon on teste l'écoute) :
//    elle le lit seulement dans l'explication (après 2 erreurs ou « ? »). Exceptions voulues : L3 et L4,
//    où l'enfant ENTEND le mot et doit retrouver ou construire sa forme écrite.
//  - 4 choix (sauf « où couper ? » sur un mot de 2 syllabes : 3 coupes possibles, signalé au parent).
//
// Notation des mots : syllabes séparées par « - », lettres muettes entre crochets. Ex. « mou-l[e] », « lou[p] ».
import { dessin } from '../themes.js';

// ---------- Progression du manuel de la classe (Calimot, « Décoder et encoder ») ----------
// Source : programmation annuelle du manuel (p. 4) et pages 18 à 25, photographiées par Simon le 09/10.
// Seul l'ORDRE des sons et des mots outils est repris (aucun texte ni dessin du manuel).
// sons : graphèmes déchiffrables à partir de cette page ; outils : mots outils lus globalement.
// Mots outils avant la p. 18 : non connus page par page → rattachés à la p. 20, où la classe les « relit »
// (choix prudent : jamais plus tôt que ce qui est attesté).
export const PROGRESSION_CALIMOT = [
  { page: 12, sons: ['a'] }, { page: 13, sons: ['o'] },
  { page: 14, sons: ['é'] }, { page: 15, sons: ['i', 'y'] },
  { page: 16, sons: ['u'] }, { page: 17, sons: ['e'] },
  { page: 18, sons: ['l'], outils: ['elle', 'là', 'sur'] },
  { page: 19, sons: ['r'], outils: ['est', 'et'] },
  { page: 20, outils: ['à', 'un', 'une'] },                       // révision : « je relis les mots outils »
  { page: 21, sons: ['f'], outils: ['dans'] },
  { page: 22, sons: ['m'] },
  { page: 23, sons: ['ou'], outils: ['avec', "c'est"] },
  { page: 24, outils: ['les', 'des'] },                          // syllabes consonne-voyelle-consonne
  // Unité 2
  { page: 26, sons: ['v'] }, { page: 27, sons: ['ch'] },
  { page: 28, sons: ['j'] }, { page: 29, sons: ['s', 'ss'] },
  { page: 30, sons: ['n'] }, { page: 31, sons: ['p'] },
  { page: 32, sons: ['t'] },
  { page: 34, sons: ['b'] }, { page: 35, sons: ['on', 'om'] },
  { page: 36, sons: ['c', 'k'] }, { page: 37, sons: ['q', 'qu'] },
  { page: 38, sons: ['au', 'eau'] },
  // Unité 3 (début ; la suite du sommaire n'a pas été transmise)
  { page: 40, sons: ['z'] }, { page: 41, sons: ['d'] },
  { page: 42, sons: ['an', 'am'] }, { page: 43, sons: ['en', 'em'] }
  // p. 44-45 : fl / bl, fr / br… = enchaînements de consonnes déjà vues (rien de nouveau à déchiffrer).
];
export const PAGE_MIN = 11, PAGE_MAX = 45;
export const PAGE_PAR_DEFAUT = 25; // classe en fin d'unité 1 au 09/10 (Simon)
// Mots toujours acceptés : le nom du koala du manuel (k non vu au début).
const TOUJOURS_CONNUS = ['kali'];

// Page réglée dans l'espace parent (réglage commun aux enfants : même classe).
let pageCourante = PAGE_PAR_DEFAUT;
export function reglerPage(page) {
  const n = Math.round(Number(page));
  pageCourante = Number.isFinite(n) ? Math.min(PAGE_MAX, Math.max(PAGE_MIN, n)) : PAGE_PAR_DEFAUT;
  return pageCourante;
}
export const pageReglee = () => pageCourante;

// Sons et mots outils vus jusqu'à la page incluse.
export function acquisALaPage(page = pageCourante) {
  const vus = PROGRESSION_CALIMOT.filter(e => e.page <= page);
  return {
    sons: vus.flatMap(e => e.sons || []),
    outils: [...TOUJOURS_CONNUS, ...vus.flatMap(e => e.outils || [])]
  };
}
// Compatibilité (fiches, tests) : état au réglage par défaut.
export const SONS_VUS = acquisALaPage(PAGE_PAR_DEFAUT).sons;
export const MOTS_CONNUS = acquisALaPage(PAGE_PAR_DEFAUT).outils;

// ---------- Outils de notation ----------
export const syllabesDe = m => m.split('-');
export const sansMarques = m => m.replace(/[-\[\]]/g, '');          // « mou-l[e] » → « moule »
export const prononce = m => m.replace(/\[[^\]]*\]/g, '').replace(/-/g, ''); // lettres dites seulement

// Graphèmes de plusieurs lettres. Tant qu'un graphème n'est pas vu, un mot qui le contient n'est PAS
// déchiffrable, même si ses lettres le sont une à une (« moule » avant « ou » se lirait « mo-u-le »).
// Ceux qui ne figurent pas dans la progression connue (ai, oi, eu, in…) sont toujours refusés.
const VOYELLES = 'aeiouyéèêëàâîïôûù';
const NASALES = ['an', 'am', 'en', 'em', 'on', 'om', 'in', 'im', 'un', 'um', 'ain', 'ein', 'oin', 'ien'];
const COMPLEXES = ['eau', 'ain', 'ein', 'oin', 'ien', 'ill', 'œu', 'ou', 'au', 'ai', 'ei', 'oi', 'eu', 'ch', 'qu', 'ss', 'gn', 'ph',
  'an', 'am', 'en', 'em', 'on', 'om', 'in', 'im', 'un', 'um'];
// Le graphème g commence-t-il vraiment à la position i ? (une nasale suivie d'une voyelle ou d'un
// n / m doublé se lit lettre à lettre : « a-mi », « u-ne », « co-mme »)
function graphemeIci(r, i, g) {
  if (!r.startsWith(g, i)) return false;
  if (!NASALES.includes(g)) return true;
  const suivant = r[i + g.length];
  return !(suivant && (VOYELLES.includes(suivant) || suivant === g[g.length - 1]));
}
// Un mot (ou une phrase) est-il déchiffrable à la page donnée ? Lettres muettes ignorées, mots outils
// acceptés. Règles : 1) aucun graphème complexe non vu ; 2) avant la p. 40 (« z / s »), pas de « s »
// seul entre deux voyelles (il se dit [z]) ; pas de « er » / « ez » final (se dit [é]) ; pas de c / g
// doux ; 3) découpage complet en graphèmes vus (avec retour arrière).
export function dechiffrable(texte, page = pageCourante) {
  const { sons, outils } = acquisALaPage(page);
  const decoupable = r => !r.length || sons.some(g => r.startsWith(g) && decoupable(r.slice(g.length)));
  // w : mot noté (« lu-n[e] »). r = lettres complètes (« lune ») pour le contexte ; muet[i] = lettre grisée.
  const lisible = w => {
    const sansTiret = w.replace(/-/g, '');
    let r = '', muet = [], dedans = false;
    for (const ch of sansTiret) {
      if (ch === '[') { dedans = true; continue; }
      if (ch === ']') { dedans = false; continue; }
      r += ch; muet.push(dedans);
    }
    for (let i = 0; i < r.length; i++) {
      if (muet[i]) continue;
      const g = COMPLEXES.find(c => graphemeIci(r, i, c));
      if (g && !sons.includes(g)) return false;
      if (r[i] === 's' && r[i + 1] !== 's' && r[i - 1] !== 's' && i > 0 && VOYELLES.includes(r[i - 1]) && VOYELLES.includes(r[i + 1] || '') && !sons.includes('z')) return false;
      if ('cg'.includes(r[i]) && 'eiyéèê'.includes(r[i + 1] || '')) return false;
    }
    const dit = prononce(w);
    return !/(er|ez)$/.test(dit) && decoupable(dit);
  };
  const mots = texte.toLowerCase().replace(/[.,!?]/g, ' ').split(/\s+/).filter(Boolean);
  return mots.every(w => outils.includes(sansMarques(w)) || lisible(w));
}

// ---------- Rendu (HTML) ----------
const lettresHtml = t => t.replace(/\[([^\]]*)\]/g, '<span class="muette">$1</span>');
// Mot écrit normalement (lettres muettes grisées, sans repère de syllabes).
export const motHtml = m => `<span class="mot">${lettresHtml(m.replace(/-/g, ''))}</span>`;
// Aide : syllabes en couleurs alternées, avec un arc sous chacune.
export const syllabesHtml = m => `<span class="mot mot-syllabes">${syllabesDe(m).map((s, i) => `<span class="syl syl-${i % 2 ? 'b' : 'a'}">${lettresHtml(s)}</span>`).join('')}</span>`;
// Syllabes écartées (L1 : de la syllabe au mot).
const ecarteHtml = m => `<div class="syllabes-ecartees">${syllabesDe(m).map(s => `<span>${lettresHtml(s)}</span>`).join('')}</div>`;
// Une coupe proposée (« la|ma ») : barre orange entre les morceaux.
const coupeHtml = c => `<span class="mot mot-coupe">${c.split('|').map(lettresHtml).join('<span class="coupe"></span>')}</span>`;
const grandMot = h => `<div class="lecture-grand">${h}</div>`;
const phraseHtml = p => `<div class="lecture-phrase">${lettresHtml(p)}</div>`;
const oreille = () => `<div class="lecture-oreille" aria-hidden="true"><svg viewBox="0 0 24 24" width="90" height="90"><path d="M8 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.7" fill="none" stroke="#3d6fb6" stroke-width="2.2" stroke-linecap="round"/><path d="M11 10a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3" fill="none" stroke="#3d6fb6" stroke-width="2" stroke-linecap="round"/></svg></div>`;

// Mots illustrés → dessin (Kali = le koala, Mila = le panda de l'appli).
export const IMAGE = {
  'la-ma': 'lama', 'lou[p]': 'loup', 'fé[e]': 'fee', 'mou-l[e]': 'moule', 'fil': 'pelote',
  'mal-l[e]': 'malle', 'mo-mi[e]': 'momie', 'Ka-li': 'koala', 'Mi-la': 'panda'
};
const img = (nom, t = 92) => dessin(nom, t);
// Scènes composées (L5)
const SCENES = {
  duo: (a, b) => `<div class="vignette">${img(a, 66)}${img(b, 66)}</div>`,
  seul: a => `<div class="vignette">${img(a, 92)}</div>`,
  dans: a => `<div class="vignette"><span class="dans-malle"><span class="tete">${img(a, 56)}</span>${img('malle', 80)}</span></div>`,
  cote: a => `<div class="vignette">${img(a, 60)}${img('malle', 66)}</div>`,
  // S1.6 : « sur » la malle (un ou deux personnages), « des » = trois objets.
  sur: (...a) => `<div class="vignette"><span class="sur-malle"><span class="dessus">${a.map(x => img(x, a.length > 1 ? 46 : 56)).join('')}</span>${img('malle', 80)}</span></div>`,
  trois: a => `<div class="vignette">${img(a, 50)}${img(a, 50)}${img(a, 50)}</div>`,
  groupe: (a, b) => `<div class="vignette">${img(a, 64)}${img(b, 40)}${img(b, 40)}${img(b, 40)}</div>`
};
export function vignette(cle) { // « duo:koala+lama », « dans:loup », « seul:loup », « cote:panda », « sur:koala+panda », « trois:moule », « groupe:loup+moule »
  const [type, reste] = cle.split(':');
  return SCENES[type](...reste.split('+'));
}

// ---------- Fabriques d'items ----------
// Ordre des choix figé (séances fixes) : la bonne réponse change de place d'un item à l'autre.
function placer(bonne, autres, rang) {
  const l = [...autres];
  l.splice(rang % (autres.length + 1), 0, bonne);
  return l;
}
const choixHtml = o => ({ type: 'choixHtml', verifier: r => r === o.attendu, essai2PeuSignificatif: o.choix.length <= 3, ...o });

// L1 — Lire le mot → toucher l'image (syllabes écartées, puis le mot entier).
const l1 = (n, mot, autres) => choixHtml({
  id: `l1_0${n}`, jeu: 'l1', domaine: 'Lire un mot', libelle: `Lire « ${sansMarques(mot)} » → image`, mot, consigne: 'l1_c',
  attendu: mot, choix: placer(mot, autres, n - 1).map(v => ({ v, html: img(IMAGE[v]) })),
  scene: () => ecarteHtml(mot) + grandMot(motHtml(mot)),
  aide: () => grandMot(syllabesHtml(mot)) + `<div class="vignette">${img(IMAGE[mot])}</div>`
});
// L2 — Où couper ? (les coupes proposées ; la bonne = syllabes du mot)
const l2 = (n, mot, coupes, pre = 'l2') => {
  const bonne = syllabesDe(mot).join('|');
  return choixHtml({
    id: `${pre}_${String(n).padStart(2, '0')}`, jeu: 'l2', domaine: 'Découper en syllabes', libelle: `Couper « ${sansMarques(mot)} » en syllabes`,
    mot, consigne: 'l2_c', attendu: bonne, choix: placer(bonne, coupes, n - 1).map(v => ({ v, html: coupeHtml(v) })),
    scene: () => grandMot(motHtml(mot)),
    aide: () => grandMot(syllabesHtml(mot)) + grandMot(coupeHtml(bonne))
  });
};
// L3 — Mot inventé entendu → le retrouver écrit
const l3 = (n, mot, autres, pre = 'l3') => choixHtml({
  id: `${pre}_${String(n).padStart(2, '0')}`, jeu: 'l3', domaine: 'Mots inventés', libelle: `Entendre « ${sansMarques(mot)} » → le mot écrit`,
  mot, attendu: mot, choix: placer(mot, autres, n - 1).map(v => ({ v, html: motHtml(v) })),
  scene: () => oreille(),
  aide: () => grandMot(syllabesHtml(mot))
});
// L4 — Mot entendu → remettre les syllabes dans l'ordre (+ une syllabe en trop)
const l4 = (n, mot, enTrop, tuilesOrdre, pre = 'l4') => {
  const syl = syllabesDe(mot);
  return {
    id: `${pre}_${String(n).padStart(2, '0')}`, jeu: 'l4', type: 'ordre', domaine: 'Construire un mot', libelle: `Construire « ${sansMarques(mot)} » avec les syllabes`,
    mot, attendu: syl.join('-'), nb: syl.length, enTrop,
    tuiles: tuilesOrdre.map(i => [...syl, enTrop][i]), // ordre d'affichage figé
    tuileHtml: t => lettresHtml(t),
    verifier: r => r === syl.join('-'),
    scene: () => (IMAGE[mot] ? `<div class="vignette">${img(IMAGE[mot], 80)}</div>` : oreille()),
    aide: () => grandMot(syllabesHtml(mot)) + (IMAGE[mot] ? `<div class="vignette">${img(IMAGE[mot], 70)}</div>` : '')
  };
};
// L5 — Lire une phrase → toucher l'image
const l5 = (n, phrase, bonne, autres, pre = 'l5') => choixHtml({
  id: `${pre}_${String(n).padStart(2, '0')}`, jeu: 'l5', domaine: 'Lire une phrase', libelle: `Lire « ${sansMarques(phrase)} » → image`,
  phrase, consigne: 'l5_c', attendu: bonne, choix: placer(bonne, autres, n - 1).map(v => ({ v, html: vignette(v) })),
  scene: () => phraseHtml(phrase),
  aide: () => phraseHtml(phrase) + vignette(bonne)
});

const L1 = [
  l1(1, 'la-ma', ['mal-l[e]', 'mo-mi[e]', 'lou[p]']),
  l1(2, 'mal-l[e]', ['la-ma', 'mou-l[e]', 'fil']),
  l1(3, 'mo-mi[e]', ['fil', 'la-ma', 'fé[e]']),
  l1(4, 'lou[p]', ['mou-l[e]', 'fil', 'mal-l[e]']),
  l1(5, 'mou-l[e]', ['lou[p]', 'mal-l[e]', 'mo-mi[e]']),
  l1(6, 'fé[e]', ['fil', 'mo-mi[e]', 'la-ma']),
  l1(7, 'fil', ['fé[e]', 'mo-mi[e]', 'lou[p]']),
  l1(8, 'Ka-li', ['Mi-la', 'la-ma', 'lou[p]']),
  l1(9, 'Mi-la', ['Ka-li', 'mal-l[e]', 'mo-mi[e]'])
];
const L2 = [
  l2(1, 'la-ma', ['l|ama', 'lam|a']),
  l2(2, 'Ka-li', ['K|ali', 'Kal|i']),
  l2(3, 'Mi-la', ['M|ila', 'Mil|a']),
  l2(4, 'Lo-la', ['L|ola', 'Lol|a']),
  l2(5, 'mé-mé', ['m|émé', 'mém|é']),
  l2(6, 'fa-li-mo', ['fal|i|mo', 'f|ali|mo', 'fa|lim|o']),
  l2(7, 'lo-mi-fa', ['l|omi|fa', 'lom|i|fa', 'lo|mif|a']),
  l2(8, 'mou-la-fi', ['mo|ula|fi', 'moul|a|fi', 'mou|laf|i']),
  l2(9, 'é-mi-lo', ['ém|i|lo', 'é|mil|o', 'émi|lo']),
  l2(10, 'fi-lou-mé', ['fil|ou|mé', 'fi|lo|umé', 'fi|loum|é'])
];
const L3 = [
  l3(1, 'la-mi', ['ma-li', 'li-ma', 'mi-la']),
  l3(2, 'fi-lo', ['li-fo', 'fo-li', 'fi-la']),
  l3(3, 'mo-la', ['lo-ma', 'ma-la', 'mo-lé']),
  l3(4, 'fou-mi', ['mou-fi', 'fa-mi', 'fou-la']),
  l3(5, 'lou-fa', ['fou-la', 'la-fou', 'lou-fé']),
  l3(6, 'mé-la', ['lé-ma', 'mi-la', 'mé-lo']),
  l3(7, 'fou-li', ['lou-fi', 'fou-lé', 'fi-li']),
  l3(8, 'li-fé', ['fi-lé', 'li-fa', 'lo-fé']),
  l3(9, 'mou-li', ['li-mou', 'mou-la', 'mi-lou']),
  l3(10, 'lo-mi', ['mo-li', 'li-mo', 'lo-mé'])
];
// tuilesOrdre : indices dans [syllabes..., en trop] (jamais l'ordre du mot).
const L4 = [
  l4(1, 'la-ma', 'mi', [1, 2, 0]),
  l4(2, 'mo-mi[e]', 'la', [2, 1, 0]),
  l4(3, 'ma-mi[e]', 'fou', [1, 2, 0]),
  l4(4, 'fi-lou', 'mi', [1, 0, 2]),
  l4(5, 'a-mi', 'lo', [2, 1, 0]),
  l4(6, 'fa-li-mo', 'mi', [2, 3, 0, 1]),
  l4(7, 'lo-mi-fa', 'lou', [1, 3, 2, 0]),
  l4(8, 'mou-la-fi', 'fé', [2, 0, 3, 1]),
  l4(9, 'é-mi-lo', 'ma', [3, 2, 0, 1]),
  l4(10, 'fi-lou-mé', 'la', [1, 2, 3, 0])
];
const L5 = [
  l5(1, 'Kali a un lama.', 'duo:koala+lama', ['duo:panda+lama', 'duo:koala+loup', 'duo:panda+loup']),
  l5(2, 'Mila a un lou[p].', 'duo:panda+loup', ['duo:koala+loup', 'duo:panda+lama', 'duo:koala+lama']),
  l5(3, 'La fé[e] a un fil.', 'duo:fee+pelote', ['duo:fee+moule', 'duo:koala+pelote', 'duo:koala+moule']),
  l5(4, 'La momi[e] a un lama.', 'duo:momie+lama', ['duo:momie+loup', 'duo:fee+lama', 'duo:fee+loup']),
  l5(5, 'Le lou[p] est dans la mall[e].', 'dans:loup', ['dans:lama', 'cote:loup', 'cote:lama']),
  l5(6, 'Mila est dans la mall[e].', 'dans:panda', ['dans:koala', 'cote:panda', 'cote:koala']),
  l5(7, 'Le lama a une moul[e].', 'duo:lama+moule', ['duo:lama+pelote', 'duo:loup+moule', 'duo:loup+pelote']),
  l5(8, 'Mila et Kali.', 'duo:panda+koala', ['seul:panda', 'seul:koala', 'duo:panda+lama']),
  l5(9, 'La fé[e] est dans la mall[e].', 'dans:fee', ['cote:fee', 'dans:loup', 'cote:loup']),
  l5(10, 'Il y a un lou[p].', 'seul:loup', ['seul:lama', 'seul:fee', 'seul:moule'])
];

// =====================================================================================
// S1.6 (09/10) — classe en fin d'unité 1 (p. 24-25) : u, r, syllabes consonne-voyelle-consonne (CVC),
// mots outils sur, avec, c'est, les, des. Priorité : le découpage (l'un des enfants lit les syllabes mais ne
// découpe pas les mots) et la différence u / ou, ar / ra.
// =====================================================================================
// L6 — Où couper ? Mots avec une syllabe CVC (4 choix ; les coupes fausses gardent toutes les lettres).
const L6 = [
  l2(1, 'four-mi', ['fou|rmi', 'f|ourmi', 'fourm|i'], 'l6'),
  l2(2, 'lar-m[e]', ['la|rm[e]', 'l|arm[e]', 'l|ar|m[e]'], 'l6'),
  l2(3, 'for-m[e]', ['fo|rm[e]', 'f|orm[e]', 'f|or|m[e]'], 'l6'),
  l2(4, 'a-mour', ['am|our', 'a|m|our', 'amo|ur'], 'l6'),
  l2(5, 'mur-mu-r[e]', ['mu|rmu|r[e]', 'm|urmu|r[e]', 'murm|u|r[e]'], 'l6'),
  l2(6, 'fou-lar[d]', ['foul|ar[d]', 'f|oular[d]', 'fou|l|ar[d]'], 'l6'),
  l2(7, 'mar-mi-fo', ['ma|rmi|fo', 'm|armi|fo', 'marm|i|fo'], 'l6'),
  l2(8, 'lour-fa', ['lou|rfa', 'l|ourfa', 'lourf|a'], 'l6'),
  l2(9, 'ral-mou', ['ra|lmou', 'r|almou', 'ralm|ou'], 'l6'),
  l2(10, 'fir-lu-mo', ['fi|rlu|mo', 'f|irlu|mo', 'firl|u|mo'], 'l6')
];
// L7 — Mots inventés entendus : u / ou, ar / ra, syllabe CVC ou non.
const L7 = [
  l3(1, 'ru-mi', ['rou-mi', 'mu-ri', 'ru-ma'], 'l7'),
  l3(2, 'lou-ra', ['lu-ra', 'ra-lou', 'lou-la'], 'l7'),
  l3(3, 'mur-fa', ['mour-fa', 'fa-mur', 'mu-fa'], 'l7'),
  l3(4, 'lir-mo', ['li-mo', 'mo-lir', 'lir-ma'], 'l7'),
  l3(5, 'fu-lo', ['fou-lo', 'lu-fo', 'fu-la'], 'l7'),
  l3(6, 'ar-fi', ['ra-fi', 'a-fi', 'ar-fé'], 'l7'),
  l3(7, 'or-lu', ['ro-lu', 'or-lou', 'o-lu'], 'l7'),
  l3(8, 'rou-fé', ['ru-fé', 'fé-rou', 'rou-fa'], 'l7'),
  l3(9, 'mal-ru', ['ma-ru', 'ru-mal', 'mal-rou'], 'l7'),
  l3(10, 'fur-mi', ['fu-mi', 'four-mi', 'fur-ma'], 'l7')
];
// L8 — Mot entendu → syllabes dans l'ordre, avec une syllabe en trop qui ressemble (fou / four…).
const L8 = [
  l4(1, 'ra-m[e]', 'mi', [1, 2, 0], 'l8'),
  l4(2, 'fu-mé', 'mou', [2, 1, 0], 'l8'),
  l4(3, 'ma-ri', 'ra', [1, 2, 0], 'l8'),
  l4(4, 'four-mi', 'fou', [2, 1, 0], 'l8'),
  l4(5, 'a-mour', 'mou', [1, 2, 0], 'l8'),
  l4(6, 'lar-m[e]', 'la', [2, 1, 0], 'l8'),
  l4(7, 'ri-r[e]', 'ru', [1, 2, 0], 'l8'),
  l4(8, 'mur-mu-r[e]', 'mou', [2, 3, 0, 1], 'l8'),
  l4(9, 'fou-lar[d]', 'la', [1, 2, 0], 'l8'),
  l4(10, 'ar-mu-r[e]', 'ra', [3, 2, 1, 0], 'l8')
];
// L9 — Phrases avec les mots outils sur, avec, c'est, les, des, là.
const L9 = [
  l5(1, 'Le lama est sur la mall[e].', 'sur:lama', ['dans:lama', 'sur:loup', 'dans:loup'], 'l9'),
  l5(2, 'Kali est avec Mila.', 'duo:koala+panda', ['duo:koala+lama', 'duo:panda+loup', 'seul:koala'], 'l9'),
  l5(3, "C'est un lou[p].", 'seul:loup', ['seul:lama', 'seul:fee', 'seul:momie'], 'l9'),
  l5(4, 'Il y a des moul[es].', 'trois:moule', ['seul:moule', 'trois:pelote', 'seul:pelote'], 'l9'),
  l5(5, 'Mila est sur la mall[e].', 'sur:panda', ['dans:panda', 'sur:koala', 'dans:koala'], 'l9'),
  l5(6, 'La fé[e] est là, avec le lou[p].', 'duo:fee+loup', ['duo:fee+lama', 'duo:momie+loup', 'seul:fee'], 'l9'),
  l5(7, 'Le lou[p] a des moul[es].', 'groupe:loup+moule', ['duo:loup+moule', 'groupe:lama+moule', 'duo:lama+moule'], 'l9'),
  l5(8, 'La momi[e] est sur la mall[e].', 'sur:momie', ['dans:momie', 'sur:fee', 'dans:fee'], 'l9'),
  l5(9, 'Kali est sur la mall[e] avec Mila.', 'sur:koala+panda', ['sur:koala', 'sur:panda', 'duo:koala+panda'], 'l9'),
  l5(10, 'Il y a des lama[s].', 'trois:lama', ['seul:lama', 'trois:loup', 'seul:loup'], 'l9')
];

export const PARCOURS_LECTURE = {
  code: 'L', titre: 'Le jeu des mots (lecture)',
  seances: [
    { id: 'L1', objectif: 'Des syllabes au mot : lire un mot et toucher son image', items: L1 },
    { id: 'L2', objectif: 'Où couper ? Découper un mot en syllabes', items: L2 },
    { id: 'L3', objectif: 'Mots inventés : entendre un mot et le retrouver écrit (déchiffrer sans deviner)', items: L3 },
    { id: 'L4', objectif: 'Construire un mot entendu avec des syllabes (une syllabe en trop)', items: L4 },
    { id: 'L5', objectif: 'Lire une phrase et toucher la bonne image (un, une, dans, et, est)', items: L5 },
    { id: 'L6', objectif: 'Où couper ? Mots avec une syllabe consonne-voyelle-consonne (four-mi, lar-me)', items: L6 },
    { id: 'L7', objectif: 'Mots inventés : u ou « ou » ? « ar » ou « ra » ?', items: L7 },
    { id: 'L8', objectif: 'Construire un mot entendu (four ou fou ?) avec une syllabe en trop', items: L8 },
    { id: 'L9', objectif: 'Lire une phrase avec sur, avec, c\'est, les, des, là', items: L9 }
  ]
};
export const ITEMS_LECTURE = PARCOURS_LECTURE.seances.flatMap(s => s.items);

// Repères du PROJET (pas des libellés du programme de français, non vérifiés : règle C1).
export const REPERES_LECTURE = {
  'LEC-MOT': 'Lire un mot déchiffrable et le relier à son sens',
  'LEC-SYL': 'Découper un mot écrit en syllabes',
  'LEC-DEC': 'Déchiffrer un mot inconnu (mot inventé)',
  'LEC-ENC': 'Écrire un mot entendu avec des syllabes',
  'LEC-PHR': 'Lire et comprendre une phrase courte'
};
const REPERE_JEU = { l1: 'LEC-MOT', l2: 'LEC-SYL', l3: 'LEC-DEC', l4: 'LEC-ENC', l5: 'LEC-PHR' };
export const repereLecture = itemId => {
  const it = ITEMS_LECTURE.find(x => x.id === itemId);
  return it ? REPERE_JEU[it.jeu] || null : null;
};

// ---------- Page du manuel nécessaire ----------
// Tous les textes que l'enfant doit lire dans un item (mot, phrase, mots proposés, coupes, tuiles).
export function textesItem(it) {
  return [it.mot, it.phrase, ...(it.tuiles || []),
    ...(it.type === 'choixHtml' && ['l2', 'l3'].includes(it.jeu) ? it.choix.map(c => c.v.replace(/\|/g, '-')) : [])].filter(Boolean);
}
// Première page du Calimot à partir de laquelle TOUTE la séance est déchiffrable (null : jamais).
export function pageSeance(seance) {
  for (let p = PAGE_MIN; p <= PAGE_MAX; p++) if (seance.items.every(it => textesItem(it).every(t => dechiffrable(t, p)))) return p;
  return null;
}
export const seanceDisponible = (seance, page = pageCourante) => { const p = pageSeance(seance); return p !== null && p <= page; };

