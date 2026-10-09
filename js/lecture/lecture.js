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

export const SONS_VUS = ['ou', 'a', 'e', 'i', 'o', 'y', 'é', 'l', 'm', 'f'];
// Mots lus « globalement » (mots outils de la classe, et le nom du koala du manuel, qui contient un k non vu).
export const MOTS_CONNUS = ['dans', 'et', 'est', 'un', 'une', 'kali'];

// ---------- Outils de notation ----------
export const syllabesDe = m => m.split('-');
export const sansMarques = m => m.replace(/[-\[\]]/g, '');          // « mou-l[e] » → « moule »
export const prononce = m => m.replace(/\[[^\]]*\]/g, '').replace(/-/g, ''); // lettres dites seulement

// Un mot (ou une phrase) est-il déchiffrable ? Lettres muettes ignorées, mots connus acceptés.
export function dechiffrable(texte) {
  const mots = texte.toLowerCase().replace(/[.,!?]/g, ' ').split(/\s+/).filter(Boolean);
  return mots.every(w => {
    if (MOTS_CONNUS.includes(sansMarques(w))) return true;
    let r = prononce(w);
    while (r.length) {
      const g = SONS_VUS.find(s => r.startsWith(s));
      if (!g) return false;
      r = r.slice(g.length);
    }
    return true;
  });
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
  cote: a => `<div class="vignette">${img(a, 60)}${img('malle', 66)}</div>`
};
export function vignette(cle) { // « duo:koala+lama », « dans:loup », « seul:loup », « cote:panda »
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
  id: `l1_0${n}`, domaine: 'Lire un mot', libelle: `Lire « ${sansMarques(mot)} » → image`, mot, consigne: 'l1_c',
  attendu: mot, choix: placer(mot, autres, n - 1).map(v => ({ v, html: img(IMAGE[v]) })),
  scene: () => ecarteHtml(mot) + grandMot(motHtml(mot)),
  aide: () => grandMot(syllabesHtml(mot)) + `<div class="vignette">${img(IMAGE[mot])}</div>`
});
// L2 — Où couper ? (les coupes proposées ; la bonne = syllabes du mot)
const l2 = (n, mot, coupes) => {
  const bonne = syllabesDe(mot).join('|');
  return choixHtml({
    id: `l2_${String(n).padStart(2, '0')}`, domaine: 'Découper en syllabes', libelle: `Couper « ${sansMarques(mot)} » en syllabes`,
    mot, consigne: 'l2_c', attendu: bonne, choix: placer(bonne, coupes, n - 1).map(v => ({ v, html: coupeHtml(v) })),
    scene: () => grandMot(motHtml(mot)),
    aide: () => grandMot(syllabesHtml(mot)) + grandMot(coupeHtml(bonne))
  });
};
// L3 — Mot inventé entendu → le retrouver écrit
const l3 = (n, mot, autres) => choixHtml({
  id: `l3_${String(n).padStart(2, '0')}`, domaine: 'Mots inventés', libelle: `Entendre « ${sansMarques(mot)} » → le mot écrit`,
  mot, attendu: mot, choix: placer(mot, autres, n - 1).map(v => ({ v, html: motHtml(v) })),
  scene: () => oreille(),
  aide: () => grandMot(syllabesHtml(mot))
});
// L4 — Mot entendu → remettre les syllabes dans l'ordre (+ une syllabe en trop)
const l4 = (n, mot, enTrop, tuilesOrdre) => {
  const syl = syllabesDe(mot);
  return {
    id: `l4_${String(n).padStart(2, '0')}`, type: 'ordre', domaine: 'Construire un mot', libelle: `Construire « ${sansMarques(mot)} » avec les syllabes`,
    mot, attendu: syl.join('-'), nb: syl.length, enTrop,
    tuiles: tuilesOrdre.map(i => [...syl, enTrop][i]), // ordre d'affichage figé
    tuileHtml: t => lettresHtml(t),
    verifier: r => r === syl.join('-'),
    scene: () => (IMAGE[mot] ? `<div class="vignette">${img(IMAGE[mot], 80)}</div>` : oreille()),
    aide: () => grandMot(syllabesHtml(mot)) + (IMAGE[mot] ? `<div class="vignette">${img(IMAGE[mot], 70)}</div>` : '')
  };
};
// L5 — Lire une phrase → toucher l'image
const l5 = (n, phrase, bonne, autres) => choixHtml({
  id: `l5_${String(n).padStart(2, '0')}`, domaine: 'Lire une phrase', libelle: `Lire « ${sansMarques(phrase)} » → image`,
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

export const PARCOURS_LECTURE = {
  code: 'L', titre: 'Le jeu des mots (lecture)',
  seances: [
    { id: 'L1', objectif: 'Des syllabes au mot : lire un mot et toucher son image', items: L1 },
    { id: 'L2', objectif: 'Où couper ? Découper un mot en syllabes', items: L2 },
    { id: 'L3', objectif: 'Mots inventés : entendre un mot et le retrouver écrit (déchiffrer sans deviner)', items: L3 },
    { id: 'L4', objectif: 'Construire un mot entendu avec des syllabes (une syllabe en trop)', items: L4 },
    { id: 'L5', objectif: 'Lire une phrase et toucher la bonne image (un, une, dans, et, est)', items: L5 }
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
const REPERE_SEANCE = { l1: 'LEC-MOT', l2: 'LEC-SYL', l3: 'LEC-DEC', l4: 'LEC-ENC', l5: 'LEC-PHR' };
export const repereLecture = itemId => REPERE_SEANCE[itemId.slice(0, 2)] || null;
