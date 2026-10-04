// Séances d'entraînement — contenu FIXE (même séance = mêmes items : résultats comparables,
// et chaque phrase est pré-enregistrée puis contrôlée par transcription, règle B1).
// Ce module ne touche pas au DOM : testable sous Node (tests/test_seances.mjs).
//
// Deux parcours, attribués à un profil depuis l'espace parent (aucun prénom ici, règle A9) :
//   C — « Décomposer et compléter » : décomposition ≤ 10, compléments à 10, lecture
//       dizaines / unités, écriture des nombres au-delà de 89. Rythme posé, supports visibles
//       au début puis retirés (concret → imagé → symbolique).
//   N — « Nombres jusqu'à 100 et problèmes » : suite et écriture 70-100, calcul en dizaines,
//       problèmes « de plus / de moins que », items « vérifie le calcul d'un ami » (précipitation).
//
// Format d'un item = celui du test T1 (id, domaine, libelle, type, attendu, verifier, scene, aide),
// plus pour le type 'ligne' : cible + tolerance + aideComplete (l'aide trace elle-même la ligne ;
// le moteur ne doit PAS ajouter la ligne « 50 » du test).
// Phrases audio : PHRASES[id + '_c'] (consigne) et PHRASES[id + '_e'] (explication) dans phrases.js.
import {
  rangee, barresCubes, boiteDe10, bande, grand, grandLong, TROU, emplacements,
  suiteATrou, dictee, calculAmi, ligneAide, illustration, de, deuxDes, droiteGraduee, main, mains
} from '../rendu.js';

export const VERSION_SEANCES = 'S1.4'; // S1.0 : séances 1-3 ; S1.1 : + séances 4-5 ; S1.2 : additions de dizaines du parcours N reprises avec les barres ; S1.3 : parcours C, terme manquant en 1re position, presque-doubles, signe moins ; S1.4 : parcours N, séances N6-N8 (écriture 70-99 et inversions, dizaines sans barres, suites, calculer sans compter)

// ---------- Fabriques (la vérification est toujours une égalité stricte, ou une tolérance pour la ligne) ----------
const pave = o => ({ type: 'pave', verifier: r => r === o.attendu, ...o });

const choix = o => ({
  type: 'choix', verifier: r => r === o.attendu,
  // 2 ou 3 choix : le 2e essai se joue presque au hasard → signalé au parent.
  essai2PeuSignificatif: o.choix.length <= 3, scene: () => '', ...o
});

// Construire n avec barres et cubes : TOUTE construction valant n est juste (vérité mathématique) ;
// la forme canonique (dizaines + unités) est notée à part.
const construire = (id, n, libelle) => {
  const d = Math.floor(n / 10), u = n % 10;
  return {
    id, domaine: 'Dizaines / unités', libelle: libelle || `Construire ${n} avec barres et cubes`,
    type: 'barres', valeur: n, attendu: `${n} (${d} barre${d > 1 ? 's' : ''} + ${u} cube${u > 1 ? 's' : ''})`,
    verifier: r => !!r && Number.isInteger(r.barres) && Number.isInteger(r.cubes) && r.barres * 10 + r.cubes === n,
    canonique: r => !!r && r.barres === d && r.cubes === u,
    scene: () => grand(String(n)),
    aide: () => grand(String(n)) + barresCubes(d, u, true)
  };
};

const ligne = (id, cible, tolerance = 10) => ({
  id, domaine: 'Ligne numérique', libelle: `Placer ${cible} sur une ligne 0–100 (tolérance ±${tolerance})`,
  type: 'ligne', bornes: [0, 100], cible, tolerance, attendu: cible, aideComplete: true,
  verifier: r => typeof r === 'number' && Math.abs(r - cible) <= tolerance,
  scene: () => grand(String(cible)),
  aide: (c, r) => grand(String(cible)) + ligneAide(cible, r)
});

// Deux groupes « a + b » dessinés (aide des additions et compléments).
const deuxGroupes = (nom, a, b, taille = 30) =>
  `<div class="groupes">${rangee(nom, a, taille)}<span class="plus">+</span>${rangee(nom, b, taille)}</div>`;

// Aide des problèmes de comparaison : une rangée par personnage.
const deuxRangees = (nom, n1, n2, p1 = 'Tom', p2 = 'Léa', taille = 22) =>
  `<div class="probleme-aide"><div><b>${p1}</b>${rangee(nom, n1, taille)}</div><div><b>${p2}</b>${rangee(nom, n2, taille)}</div></div>`;

// Aide de comparaison de deux nombres avec barres et cubes.
const compareBC = (a, b) =>
  `<div class="comparaison"><div>${grand(String(a))}${barresCubes(Math.floor(a / 10), a % 10)}</div><div>${grand(String(b))}${barresCubes(Math.floor(b / 10), b % 10)}</div></div>`;

// Idem avec un nom de personnage au-dessus de chaque nombre.
// Addition de dizaines MONTRÉE avec les barres (session 4 : hésitations observées sur les dizaines →
// on passe par le concret avant le calcul sans support). a + b, chaque nombre en barres + cubes.
const additionBC = (a, b) =>
  `<div class="groupes addition-bc">${barresCubes(Math.floor(a / 10), a % 10)}<span class="plus">+</span>${barresCubes(Math.floor(b / 10), b % 10)}</div>`;

const deuxBC = (p1, a, p2, b) =>
  `<div class="comparaison"><div><b>${p1}</b>${barresCubes(Math.floor(a / 10), a % 10)}</div><div><b>${p2}</b>${barresCubes(Math.floor(b / 10), b % 10)}</div></div>`;

// =====================================================================================
// PARCOURS C — Décomposer et compléter
// =====================================================================================
const C1 = [
  pave({ id: 'c1_01', domaine: 'Quantités', libelle: 'Boîte de 10 : 7 cases pleines', attendu: 7,
    scene: () => boiteDe10(7), aide: () => boiteDe10(7) + grand('5 + 2 = 7') }),
  pave({ id: 'c1_02', domaine: 'Décomposition', libelle: 'Il en faut 5, il y en a 3 (cases vides visibles)', attendu: 2,
    scene: () => emplacements('bonbon', 3, 3), aide: () => deuxGroupes('bonbon', 3, 2) + grand('3 + 2 = 5') }),
  pave({ id: 'c1_03', domaine: 'Décomposition', libelle: 'Il en faut 6, il y en a 4 (cases vides visibles)', attendu: 2,
    scene: () => emplacements('etoile', 4, 4), aide: () => deuxGroupes('etoile', 4, 2) + grand('4 + 2 = 6') }),
  pave({ id: 'c1_04', domaine: 'Dizaines / unités', libelle: 'Lire 2 barres + 4 cubes (24)', attendu: 24,
    scene: () => barresCubes(2, 4), aide: () => barresCubes(2, 4, true) + grand('24') }),
  pave({ id: 'c1_05', domaine: 'Décomposition', libelle: 'Il en faut 7, il y en a 4 (cases vides visibles)', attendu: 3,
    scene: () => emplacements('bille', 4, 4, 36), aide: () => deuxGroupes('bille', 4, 3) + grand('4 + 3 = 7') }),
  pave({ id: 'c1_06', domaine: 'Calcul', libelle: '5 + 2', attendu: 7,
    scene: () => grand(`5 + 2 = ${TROU}`), aide: () => grand('5 + 2 = 7') + deuxGroupes('point', 5, 2, 26) }),
  pave({ id: 'c1_07', domaine: 'Dizaines / unités', libelle: 'Lire 3 barres + 5 cubes (35)', attendu: 35,
    scene: () => barresCubes(3, 5), aide: () => barresCubes(3, 5, true) + grand('35') }),
  pave({ id: 'c1_08', domaine: 'Décomposition', libelle: '4 + ? = 5 (objets visibles, sans cases vides)', attendu: 1,
    scene: c => grand(`4 + ${TROU} = 5`) + rangee(c.avatar, 4, 40), aide: c => deuxGroupes(c.avatar, 4, 1, 34) + grand('4 + 1 = 5') }),
  pave({ id: 'c1_09', domaine: 'Suite des nombres', libelle: 'Après 87, 88, 89 : écrire 90 (erreur « 910 » au test)', attendu: 90,
    scene: () => suiteATrou([87, 88, 89]), aide: () => bande(86, 92, 90) + barresCubes(9, 0) + grand('90') }),
  construire('c1_10', 26),
  pave({ id: 'c1_11', domaine: 'Problème (ajout)', libelle: '4 billes, on en donne 2', attendu: 6,
    scene: () => illustration('bille', 1, 110), aide: () => deuxGroupes('bille', 4, 2) + grand('4 + 2 = 6') }),
  pave({ id: 'c1_12', domaine: 'Décomposition', libelle: 'Il en faut 6, il y en a 2 (cases vides visibles)', attendu: 4,
    scene: () => emplacements('carte', 2, 2, 40), aide: () => deuxGroupes('carte', 2, 4, 28) + grand('2 + 4 = 6') }),
  choix({ id: 'c1_13', domaine: 'Comparaison', libelle: 'Le plus grand entre 24 et 42', choix: [24, 42], attendu: 42,
    aide: () => compareBC(42, 24) }),
  pave({ id: 'c1_14', domaine: 'Problème (retrait)', libelle: '7 bonbons, on en donne 2', attendu: 5,
    scene: () => illustration('bonbon', 1, 120), aide: () => rangee('bonbon', 7, 34, 2) + grand('7 − 2 = 5') }),
  pave({ id: 'c1_15', domaine: 'Décomposition', libelle: '5 + ? = 7 (objets visibles, sans cases vides)', attendu: 2,
    scene: () => grand(`5 + ${TROU} = 7`) + rangee('bonbon', 5, 40), aide: () => deuxGroupes('bonbon', 5, 2) + grand('5 + 2 = 7') })
];

const C2 = [
  pave({ id: 'c2_01', domaine: 'Compléments à 10', libelle: 'Boîte de 10 : 8 pleines, combien de vides ?', attendu: 2,
    scene: () => grand(`8 + ${TROU} = 10`), aide: () => boiteDe10(8, 2) + grand('8 + 2 = 10') }),
  pave({ id: 'c2_02', domaine: 'Compléments à 10', libelle: 'Boîte de 10 : 7 pleines, combien pour faire 10 ?', attendu: 3,
    scene: () => grand(`7 + ${TROU} = 10`), aide: () => boiteDe10(7, 3) + grand('7 + 3 = 10') }),
  pave({ id: 'c2_03', domaine: 'Décomposition', libelle: 'Il en faut 8, il y en a 5 (cases vides visibles) — reprise de i10', attendu: 3,
    scene: () => emplacements('etoile', 5, 5, 36), aide: () => deuxGroupes('etoile', 5, 3) + grand('8 = 5 + 3') }),
  // S1.3 : terme manquant en PREMIÈRE position (erreur du cahier d'école : « __ + 3 = 5 » → 8).
  pave({ id: 'c2_04', domaine: 'Décomposition', libelle: 'Dés : ? + 3 = 5 (dé caché en premier)', attendu: 2,
    scene: () => deuxDes(null, 3), aide: () => deuxDes(2, 3) + grand('2 + 3 = 5') }),
  pave({ id: 'c2_05', domaine: 'Compléments à 10', libelle: '4 + ? = 10 (boîte de 10 visible)', attendu: 6,
    scene: () => grand(`4 + ${TROU} = 10`), aide: () => boiteDe10(4, 6) + grand('4 + 6 = 10') }),
  pave({ id: 'c2_06', domaine: 'Décomposition', libelle: '5 + ? = 9 (objets visibles)', attendu: 4,
    scene: () => grand(`5 + ${TROU} = 9`) + rangee('bille', 5, 40), aide: () => deuxGroupes('bille', 5, 4) + grand('5 + 4 = 9') }),
  pave({ id: 'c2_07', domaine: 'Décomposition', libelle: 'Dés : ? + 1 = 3 (dé caché en premier)', attendu: 2,
    scene: () => grand(`${TROU} + 1 = 3`) + deuxDes(null, 1, 64), aide: () => deuxDes(2, 1) + grand('2 + 1 = 3') }),
  pave({ id: 'c2_08', domaine: 'Calcul', libelle: '4 + 5 (presque-double)', attendu: 9,
    scene: () => grand(`4 + 5 = ${TROU}`), aide: () => deuxDes(4, 5) + grand('4 + 4 = 8') + grand('4 + 5 = 9') }),
  construire('c2_09', 43),
  pave({ id: 'c2_10', domaine: 'Problème (retrait)', libelle: '8 cartes, Tom en prend 3', attendu: 5,
    scene: () => illustration('carte', 2, 70), aide: () => rangee('carte', 8, 30, 3) + grand('8 − 3 = 5') }),
  pave({ id: 'c2_11', domaine: 'Décomposition', libelle: '6 + ? = 8 (objets visibles)', attendu: 2,
    scene: () => grand(`6 + ${TROU} = 8`) + rangee('etoile', 6, 40), aide: () => deuxGroupes('etoile', 6, 2) + grand('6 + 2 = 8') }),
  pave({ id: 'c2_12', domaine: 'Dizaines / unités', libelle: '47 : combien de barres de dix ? (erreur i05)', attendu: 4,
    scene: () => grandLong('47') + barresCubes(4, 7), aide: () => grand('47') + barresCubes(4, 7, true) }),
  pave({ id: 'c2_13', domaine: 'Problème (ajout)', libelle: 'Léa a 5 étoiles, elle en gagne 4', attendu: 9,
    scene: () => illustration('etoile', 1, 110), aide: () => deuxGroupes('etoile', 5, 4) + grand('5 + 4 = 9') }),
  choix({ id: 'c2_14', domaine: 'Comparaison', libelle: 'Le plus petit parmi 57, 75, 55', choix: [57, 75, 55], attendu: 55,
    aide: () => compareBC(55, 57) }),
  pave({ id: 'c2_15', domaine: 'Compléments à 10', libelle: '10 = 3 + ? (boîte de 10 visible)', attendu: 7,
    scene: () => grand(`10 = 3 + ${TROU}`), aide: () => boiteDe10(3, 7) + grand('10 = 3 + 7') })
];

const C3 = [
  pave({ id: 'c3_01', domaine: 'Compléments à 10', libelle: '5 + ? = 10 (boîte de 10 visible)', attendu: 5,
    scene: () => grand(`5 + ${TROU} = 10`), aide: () => boiteDe10(5, 5) + grand('5 + 5 = 10') }),
  pave({ id: 'c3_02', domaine: 'Décomposition', libelle: '8 = 5 + ? sans support (reprise de i10)', attendu: 3,
    scene: () => grand(`8 = 5 + ${TROU}`), aide: () => emplacements('point', 5, 8, 30) + grand('8 = 5 + 3') }),
  pave({ id: 'c3_03', domaine: 'Décomposition', libelle: '? + 3 = 5 sans support (terme manquant en premier)', attendu: 2,
    scene: () => grand(`${TROU} + 3 = 5`), aide: () => deuxDes(2, 3) + grand('2 + 3 = 5') }),
  pave({ id: 'c3_04', domaine: 'Décomposition', libelle: '9 = 7 + ? sans support', attendu: 2,
    scene: () => grand(`9 = 7 + ${TROU}`), aide: () => emplacements('point', 7, 9, 28) + grand('9 = 7 + 2') }),
  pave({ id: 'c3_05', domaine: 'Décomposition', libelle: '? + 2 = 6 sans support (terme manquant en premier)', attendu: 4,
    scene: () => grand(`${TROU} + 2 = 6`), aide: () => emplacements('point', 2, 6, 30) + grand('4 + 2 = 6') }),
  pave({ id: 'c3_06', domaine: 'Calcul', libelle: '5 + 4 (même résultat que 4 + 5)', attendu: 9,
    scene: () => grand(`5 + 4 = ${TROU}`), aide: () => deuxDes(5, 4) + grand('5 + 4 = 4 + 5 = 9') }),
  pave({ id: 'c3_07', domaine: 'Problème (complément)', libelle: 'Léa veut 10 étoiles, elle en a 7', attendu: 3,
    scene: () => illustration('etoile', 1, 110), aide: () => boiteDe10(7, 3) + grand('7 + 3 = 10') }),
  pave({ id: 'c3_08', domaine: 'Calcul', libelle: '8 − 2 (attention au signe moins)', attendu: 6,
    scene: () => grand(`8 <span class="signe-fort">−</span> 2 = ${TROU}`), aide: () => rangee('point', 8, 26, 2) + grand('8 − 2 = 6') }),
  pave({ id: 'c3_09', domaine: 'Décomposition', libelle: '7 = 3 + ? sans support', attendu: 4,
    scene: () => grand(`7 = 3 + ${TROU}`), aide: () => emplacements('point', 3, 7, 30) + grand('7 = 3 + 4') }),
  choix({ id: 'c3_10', domaine: 'Comparaison', libelle: 'Le plus grand entre 69 et 96', choix: [69, 96], attendu: 96,
    aide: () => compareBC(96, 69) }),
  pave({ id: 'c3_11', domaine: 'Problème (retrait)', libelle: '10 billes, on en perd 4', attendu: 6,
    scene: () => illustration('bille', 1, 110), aide: () => rangee('bille', 10, 28, 4) + grand('10 − 4 = 6') }),
  pave({ id: 'c3_12', domaine: 'Compléments à 10', libelle: '4 + 6 (lien avec 6 + 4 du test)', attendu: 10,
    scene: () => grand(`4 + 6 = ${TROU}`), aide: () => boiteDe10(4, 6) + grand('4 + 6 = 10') }),
  pave({ id: 'c3_13', domaine: 'Dizaines / unités', libelle: '58 : combien de petits cubes ?', attendu: 8,
    scene: () => grandLong('58') + barresCubes(5, 8), aide: () => grand('58') + barresCubes(5, 8, true) }),
  pave({ id: 'c3_14', domaine: 'Problème (comparaison)', libelle: 'Tom 5 cartes, Léa 2 de plus (erreur i14)', attendu: 7,
    scene: () => illustration('carte', 2, 70), aide: () => deuxRangees('carte', 5, 7) + grand('5 + 2 = 7') }),
  pave({ id: 'c3_15', domaine: 'Compléments à 10', libelle: '10 = 6 + ? sans support', attendu: 4,
    scene: () => grand(`10 = 6 + ${TROU}`), aide: () => boiteDe10(6, 4) + grand('10 = 6 + 4') })
];

// =====================================================================================
// PARCOURS N — Nombres jusqu'à 100 et problèmes (en vérifiant)
// =====================================================================================
const N1 = [
  pave({ id: 'n1_01', domaine: 'Suite des nombres', libelle: 'Après 87, 88, 89 (erreur i04)', attendu: 90,
    scene: () => suiteATrou([87, 88, 89]), aide: () => bande(86, 92, 90) + barresCubes(9, 0) }),
  pave({ id: 'n1_02', domaine: 'Suite des nombres', libelle: 'Après 94', attendu: 95,
    scene: () => grand(`94 → ${TROU}`), aide: () => bande(92, 98, 95) }),
  pave({ id: 'n1_03', domaine: 'Suite des nombres', libelle: 'AVANT 90 (piège : avant / après)', attendu: 89,
    scene: () => grand(`${TROU} ← 90`), aide: () => bande(86, 92, 89) }),
  pave({ id: 'n1_04', domaine: 'Dizaines / unités', libelle: 'Lire 9 barres + 3 cubes (93)', attendu: 93,
    scene: () => barresCubes(9, 3), aide: () => barresCubes(9, 3, true) + grand('93') }),
  pave({ id: 'n1_05', domaine: 'Écriture des nombres', libelle: 'Dictée : 97', attendu: 97,
    scene: () => dictee(), aide: () => barresCubes(9, 7, true) + grand('97') }),
  construire('n1_06', 76),
  pave({ id: 'n1_07', domaine: 'Problème (comparaison)', libelle: 'Tom 6 billes, Léa 4 de plus (erreur i14)', attendu: 10,
    scene: () => illustration('bille', 2, 70), aide: () => deuxRangees('bille', 6, 10) + grand('6 + 4 = 10') }),
  pave({ id: 'n1_08', domaine: 'Calcul (dizaines)', libelle: '40 + 30', attendu: 70,
    scene: () => grand(`40 + 30 = ${TROU}`), aide: () => barresCubes(7, 0, true) + grand('40 + 30 = 70') }),
  pave({ id: 'n1_09', domaine: 'Vérification', libelle: 'Un ami a trouvé 8 + 5 = 12 : bon résultat ?', attendu: 13,
    scene: () => calculAmi('8 + 5', 12), aide: () => boiteDe10(8, 2) + rangee('point', 3, 30) + grand('8 + 5 = 13') }),
  choix({ id: 'n1_10', domaine: 'Comparaison', libelle: 'Le plus grand parmi 79, 97, 89', choix: [79, 97, 89], attendu: 97,
    aide: () => compareBC(97, 89) }),
  pave({ id: 'n1_11', domaine: 'Problème (comparaison)', libelle: 'Léa 9 cartes, Tom 3 de MOINS', attendu: 6,
    scene: () => illustration('carte', 2, 70), aide: () => deuxRangees('carte', 6, 9) + grand('9 − 3 = 6') }),
  ligne('n1_12', 90),
  pave({ id: 'n1_13', domaine: 'Calcul (dizaines)', libelle: '47 + 10 (barres visibles)', attendu: 57,
    scene: () => grandLong(`47 + 10 = ${TROU}`) + additionBC(47, 10), aide: () => barresCubes(5, 7, true) + grand('47 + 10 = 57') }),
  pave({ id: 'n1_14', domaine: 'Suite logique', libelle: '95, 90, 85, … ? (à rebours de 5 en 5)', attendu: 80,
    scene: () => grandLong(`95 · 90 · 85 · ${TROU}`), aide: () => grand('95 · 90 · 85 · 80') }),
  pave({ id: 'n1_15', domaine: 'Problème (retrait)', libelle: '12 bonbons, on en mange 5', attendu: 7,
    scene: () => illustration('bonbon', 1, 120), aide: () => rangee('bonbon', 12, 26, 5) + grand('12 − 5 = 7') })
];

const N2 = [
  pave({ id: 'n2_01', domaine: 'Suite des nombres', libelle: 'Après 99', attendu: 100,
    scene: () => grand(`99 → ${TROU}`), aide: () => bande(96, 100, 100) + grand('100') }),
  pave({ id: 'n2_02', domaine: 'Écriture des nombres', libelle: 'Dictée : 74', attendu: 74,
    scene: () => dictee(), aide: () => barresCubes(7, 4, true) + grand('74') }),
  pave({ id: 'n2_03', domaine: 'Dizaines / unités', libelle: '3 barres + 12 cubes (42, forme non canonique)', attendu: 42,
    scene: () => barresCubes(3, 12), aide: () => barresCubes(4, 2, true) + grand('30 + 12 = 42') }),
  construire('n2_04', 60),
  pave({ id: 'n2_05', domaine: 'Calcul', libelle: '9 + 6', attendu: 15,
    scene: () => grand(`9 + 6 = ${TROU}`), aide: () => boiteDe10(9, 1) + rangee('point', 5, 30) + grand('9 + 6 = 15') }),
  pave({ id: 'n2_06', domaine: 'Problème (comparaison)', libelle: 'Tom 15 billes, Léa 5 de plus', attendu: 20,
    scene: () => illustration('bille', 2, 70), aide: () => deuxBC('Tom', 15, 'Léa', 20) + grand('15 + 5 = 20') }),
  pave({ id: 'n2_07', domaine: 'Calcul (dizaines)', libelle: '30 + 20 (barres visibles)', attendu: 50,
    scene: () => grandLong(`30 + 20 = ${TROU}`) + additionBC(30, 20), aide: () => barresCubes(5, 0, true) + grand('3 dizaines + 2 dizaines = 5 dizaines') + grand('30 + 20 = 50') }),
  pave({ id: 'n2_08', domaine: 'Décomposition', libelle: '64 = 60 + ?', attendu: 4,
    scene: () => grand(`64 = 60 + ${TROU}`), aide: () => barresCubes(6, 4, true) + grand('64 = 60 + 4') }),
  pave({ id: 'n2_09', domaine: 'Vérification', libelle: 'Un ami a trouvé 40 + 5 = 90 : bon résultat ?', attendu: 45,
    scene: () => calculAmi('40 + 5', 90) + additionBC(40, 5), aide: () => barresCubes(4, 5, true) + grand('40 + 5 = 45') }),
  pave({ id: 'n2_10', domaine: 'Problème (deux étapes)', libelle: '5 billes, + 4, puis − 2', attendu: 7,
    scene: () => illustration('bille', 1, 110), aide: () => rangee('bille', 9, 30, 2) + grand('5 + 4 = 9') + grand('9 − 2 = 7') }),
  choix({ id: 'n2_11', domaine: 'Comparaison', libelle: 'Le plus petit parmi 86, 68, 80, 66', choix: [86, 68, 80, 66], attendu: 66,
    aide: () => compareBC(66, 68) }),
  ligne('n2_12', 25),
  pave({ id: 'n2_13', domaine: 'Problème (comparaison)', libelle: 'Léa 20 cartes, Tom 4 de MOINS', attendu: 16,
    scene: () => illustration('carte', 2, 70), aide: () => deuxBC('Léa', 20, 'Tom', 16) + grand('20 − 4 = 16') }),
  pave({ id: 'n2_14', domaine: 'Suite logique', libelle: '3, 6, 9, … ?', attendu: 12,
    scene: () => grand(`3 · 6 · 9 · ${TROU}`), aide: () => bande(0, 12, 12) + grand('3 · 6 · 9 · 12') }),
  pave({ id: 'n2_15', domaine: 'Problème (complément)', libelle: 'Boîte de 20 cartes, 17 déjà dedans', attendu: 3,
    scene: () => illustration('carte', 3, 60), aide: () => bande(17, 20, 20) + grand('17 + 3 = 20') })
];

const N3 = [
  pave({ id: 'n3_01', domaine: 'Suite des nombres', libelle: 'Après 79 (passage à 80)', attendu: 80,
    scene: () => grand(`79 → ${TROU}`), aide: () => bande(76, 82, 80) + barresCubes(8, 0) }),
  pave({ id: 'n3_02', domaine: 'Écriture des nombres', libelle: 'Dictée : 91', attendu: 91,
    scene: () => dictee(), aide: () => barresCubes(9, 1, true) + grand('91') }),
  pave({ id: 'n3_03', domaine: 'Décomposition', libelle: '52 = ? + 2', attendu: 50,
    scene: () => grand(`52 = ${TROU} + 2`), aide: () => barresCubes(5, 2, true) + grand('52 = 50 + 2') }),
  pave({ id: 'n3_04', domaine: 'Calcul (dizaines)', libelle: '36 + 20 (barres visibles)', attendu: 56,
    scene: () => grandLong(`36 + 20 = ${TROU}`) + additionBC(36, 20), aide: () => barresCubes(5, 6, true) + grand('36 + 20 = 56') }),
  pave({ id: 'n3_05', domaine: 'Problème (écart)', libelle: 'Tom 7, Léa 10 : combien de plus ?', attendu: 3,
    scene: () => illustration('bille', 2, 70), aide: () => deuxRangees('bille', 7, 10) + grand('7 + 3 = 10') }),
  construire('n3_06', 85),
  pave({ id: 'n3_07', domaine: 'Vérification', libelle: 'Un ami a trouvé 50 + 20 = 52 : bon résultat ?', attendu: 70,
    scene: () => calculAmi('50 + 20', 52) + additionBC(50, 20), aide: () => barresCubes(7, 0, true) + grand('50 + 20 = 70') }),
  pave({ id: 'n3_08', domaine: 'Calcul', libelle: '15 − 6', attendu: 9,
    scene: () => grand(`15 − 6 = ${TROU}`), aide: () => rangee('point', 15, 20, 6) + grand('15 − 6 = 9') }),
  pave({ id: 'n3_09', domaine: 'Problème (comparaison inversée)', libelle: 'Léa 12 cartes, elle en a 4 de plus que Tom', attendu: 8,
    scene: () => illustration('carte', 2, 70), aide: () => deuxRangees('carte', 8, 12) + grand('12 − 4 = 8') }),
  choix({ id: 'n3_10', domaine: 'Comparaison', libelle: 'Le plus grand parmi 91, 100, 99', choix: [91, 100, 99], attendu: 100,
    aide: () => bande(96, 100, 100) + grand('100') }),
  pave({ id: 'n3_11', domaine: 'Suite logique', libelle: '100, 90, 80, … ? (à rebours de 10 en 10)', attendu: 70,
    scene: () => grandLong(`100 · 90 · 80 · ${TROU}`), aide: () => barresCubes(7, 0, true) + grand('100 · 90 · 80 · 70') }),
  ligne('n3_12', 75),
  pave({ id: 'n3_13', domaine: 'Problème (deux étapes)', libelle: '10 billes, + 4, puis − 3', attendu: 11,
    scene: () => illustration('bille', 1, 110), aide: () => rangee('bille', 14, 22, 3) + grand('10 + 4 = 14') + grand('14 − 3 = 11') }),
  pave({ id: 'n3_14', domaine: 'Dizaines / unités', libelle: '87 : combien de dizaines ?', attendu: 8,
    scene: () => grand('87'), aide: () => barresCubes(8, 7, true) + grand('87') }),
  pave({ id: 'n3_15', domaine: 'Problème (complément)', libelle: 'Il faut 50 points, Tom en a 46', attendu: 4,
    scene: () => illustration('etoile', 1, 110), aide: () => bande(46, 50, 50) + grand('46 + 4 = 50') })
];

// =====================================================================================
// S1.1 (session 4) — séances 4 et 5 de chaque parcours.
// Dés : 5 points au maximum (compléments à 5 vus en classe avec ce matériel).
// =====================================================================================
const C4 = [
  pave({ id: 'c4_01', domaine: 'Quantités', libelle: 'Dé : 4 points (reconnaître sans compter)', attendu: 4,
    scene: () => `<div class="groupes">${de(4, 110)}</div>`, aide: () => `<div class="groupes">${de(4, 110)}</div>` + grand('4') }),
  pave({ id: 'c4_02', domaine: 'Compléments à 5', libelle: 'Dés : 3 + ? = 5', attendu: 2,
    scene: () => deuxDes(3, null), aide: () => deuxDes(3, 2) + grand('3 + 2 = 5') }),
  pave({ id: 'c4_03', domaine: 'Compléments à 5', libelle: 'Dés : 1 + ? = 5', attendu: 4,
    scene: () => deuxDes(1, null), aide: () => deuxDes(1, 4) + grand('1 + 4 = 5') }),
  pave({ id: 'c4_04', domaine: 'Doubles', libelle: 'Dés : 2 et 2 (double de 2)', attendu: 4,
    scene: () => deuxDes(2, 2), aide: () => deuxDes(2, 2) + grand('2 + 2 = 4') }),
  pave({ id: 'c4_05', domaine: 'Compléments à 5', libelle: 'Dés : 4 + ? = 5', attendu: 1,
    scene: () => deuxDes(4, null), aide: () => deuxDes(4, 1) + grand('4 + 1 = 5') }),
  pave({ id: 'c4_06', domaine: 'Doubles', libelle: 'Dés : 3 et 3 (double de 3)', attendu: 6,
    scene: () => deuxDes(3, 3), aide: () => deuxDes(3, 3) + grand('3 + 3 = 6') }),
  pave({ id: 'c4_07', domaine: 'Droite graduée', libelle: 'Droite 0–10 graduée de 1 en 1 : la flèche montre 7', attendu: 7,
    scene: () => droiteGraduee(0, 10, [0, 5, 10], 7), aide: () => droiteGraduee(0, 10, [0, 5, 6, 7, 10], 7) + grand('5, 6, 7') }),
  pave({ id: 'c4_08', domaine: 'Compléments à 5', libelle: 'Dés : 2 + ? = 5', attendu: 3,
    scene: () => deuxDes(2, null), aide: () => deuxDes(2, 3) + grand('2 + 3 = 5') }),
  pave({ id: 'c4_09', domaine: 'Décomposition', libelle: 'Dés : 5 et 3 → 8 (lien avec 8 = 5 + 3, i10)', attendu: 8,
    scene: () => deuxDes(5, 3), aide: () => deuxDes(5, 3) + grand('5 + 3 = 8') }),
  pave({ id: 'c4_10', domaine: 'Doubles', libelle: 'Dés : 5 et 5 (double de 5)', attendu: 10,
    scene: () => deuxDes(5, 5), aide: () => deuxDes(5, 5) + grand('5 + 5 = 10') }),
  pave({ id: 'c4_11', domaine: 'Dizaines / unités', libelle: 'Lire 4 barres + 6 cubes (46)', attendu: 46,
    scene: () => barresCubes(4, 6), aide: () => barresCubes(4, 6, true) + grand('46') }),
  pave({ id: 'c4_12', domaine: 'Compléments à 5', libelle: '5 = 2 + ? sans dé', attendu: 3,
    scene: () => grand(`5 = 2 + ${TROU}`), aide: () => deuxDes(2, 3) + grand('5 = 2 + 3') }),
  pave({ id: 'c4_13', domaine: 'Doubles', libelle: 'Dés : 4 et 4 (double de 4)', attendu: 8,
    scene: () => deuxDes(4, 4), aide: () => deuxDes(4, 4) + grand('4 + 4 = 8') }),
  pave({ id: 'c4_14', domaine: 'Sens des opérations', libelle: '5 bonbons, elle en mange, il en reste 2 : combien mangés ?', attendu: 3,
    scene: () => illustration('bonbon', 1, 120), aide: () => rangee('bonbon', 5, 40, 3) + grand('5 − 3 = 2') }),
  pave({ id: 'c4_15', domaine: 'Compléments à 10', libelle: '6 + ? = 10 avec la boîte (reprise de i09)', attendu: 4,
    scene: () => grand(`6 + ${TROU} = 10`), aide: () => boiteDe10(6, 4) + grand('6 + 4 = 10') })
];

const C5 = [
  pave({ id: 'c5_01', domaine: 'Compléments à 5', libelle: 'Dés : 1 + ? = 5 (reprise)', attendu: 4,
    scene: () => deuxDes(1, null), aide: () => deuxDes(1, 4) + grand('1 + 4 = 5') }),
  pave({ id: 'c5_02', domaine: 'Doubles', libelle: 'Double de 3 sans dé', attendu: 6,
    scene: () => grand(`3 + 3 = ${TROU}`), aide: () => deuxDes(3, 3) + grand('3 + 3 = 6') }),
  pave({ id: 'c5_03', domaine: 'Décomposition', libelle: '7 = 5 + ? (dé de 5 visible)', attendu: 2,
    scene: () => grand(`7 = 5 + ${TROU}`) + deuxDes(5, null, 64), aide: () => deuxDes(5, 2) + grand('7 = 5 + 2') }),
  pave({ id: 'c5_04', domaine: 'Droite graduée', libelle: 'Droite 0–20 graduée de 1 en 1 : la flèche montre 13', attendu: 13,
    scene: () => droiteGraduee(0, 20, [0, 10, 20], 13), aide: () => droiteGraduee(0, 20, [0, 10, 11, 12, 13, 20], 13) + grand('10, 11, 12, 13') }),
  pave({ id: 'c5_05', domaine: 'Doubles', libelle: 'Double de 4 sans dé', attendu: 8,
    scene: () => grand(`4 + 4 = ${TROU}`), aide: () => deuxDes(4, 4) + grand('4 + 4 = 8') }),
  pave({ id: 'c5_06', domaine: 'Décomposition', libelle: '9 = 5 + ? (dé de 5 visible)', attendu: 4,
    scene: () => grand(`9 = 5 + ${TROU}`) + deuxDes(5, null, 64), aide: () => deuxDes(5, 4) + grand('9 = 5 + 4') }),
  pave({ id: 'c5_07', domaine: 'Compléments à 10', libelle: '10 = 8 + ? sans boîte', attendu: 2,
    scene: () => grand(`10 = 8 + ${TROU}`), aide: () => boiteDe10(8, 2) + grand('10 = 8 + 2') }),
  pave({ id: 'c5_08', domaine: 'Écriture des nombres', libelle: 'Dictée : 92', attendu: 92,
    scene: () => dictee(), aide: () => barresCubes(9, 2, true) + grand('92') }),
  pave({ id: 'c5_09', domaine: 'Dizaines / unités', libelle: '63 : combien de barres de dix ?', attendu: 6,
    scene: () => grandLong('63') + barresCubes(6, 3), aide: () => grand('63') + barresCubes(6, 3, true) }),
  pave({ id: 'c5_10', domaine: 'Doubles', libelle: 'Double de 5 sans dé', attendu: 10,
    scene: () => grand(`5 + 5 = ${TROU}`), aide: () => deuxDes(5, 5) + grand('5 + 5 = 10') }),
  pave({ id: 'c5_11', domaine: 'Sens des opérations', libelle: 'Tom avait 6 cartes, on lui en donne, il en a 8 : combien données ?', attendu: 2,
    scene: () => illustration('carte', 2, 70), aide: () => deuxGroupes('carte', 6, 2, 26) + grand('6 + 2 = 8') }),
  pave({ id: 'c5_12', domaine: 'Compléments à 5', libelle: '5 = 4 + ? sans dé', attendu: 1,
    scene: () => grand(`5 = 4 + ${TROU}`), aide: () => deuxDes(4, 1) + grand('5 = 4 + 1') }),
  pave({ id: 'c5_13', domaine: 'Calcul', libelle: '12 + 13 (deux nombres à deux chiffres)', attendu: 25,
    scene: () => grand(`12 + 13 = ${TROU}`), aide: () => barresCubes(2, 5, true) + grand('10 + 10 = 20') + grand('2 + 3 = 5') }),
  pave({ id: 'c5_14', domaine: 'Moitiés', libelle: '6 bonbons partagés entre 2 amis, autant chacun', attendu: 3,
    scene: () => rangee('bonbon', 6, 40), aide: () => deuxGroupes('bonbon', 3, 3) + grand('3 + 3 = 6') }),
  construire('c5_15', 59)
];

const N4 = [
  pave({ id: 'n4_01', domaine: 'Doubles', libelle: 'Dés : 4 et 4', attendu: 8,
    scene: () => deuxDes(4, 4), aide: () => deuxDes(4, 4) + grand('4 + 4 = 8') }),
  pave({ id: 'n4_02', domaine: 'Compléments à 5', libelle: 'Dés : 2 + ? = 5', attendu: 3,
    scene: () => deuxDes(2, null), aide: () => deuxDes(2, 3) + grand('2 + 3 = 5') }),
  pave({ id: 'n4_03', domaine: 'Doubles', libelle: 'Double de 6', attendu: 12,
    scene: () => grand(`6 + 6 = ${TROU}`), aide: () => deuxGroupes('point', 6, 6, 20) + grand('6 + 6 = 12') }),
  pave({ id: 'n4_04', domaine: 'Moitiés', libelle: '10 billes en deux parts égales', attendu: 5,
    scene: () => rangee('bille', 10, 30), aide: () => deuxGroupes('bille', 5, 5, 28) + grand('5 + 5 = 10') }),
  pave({ id: 'n4_05', domaine: 'Droite graduée', libelle: 'Droite 40–60 graduée de 1 en 1 : la flèche montre 47', attendu: 47,
    scene: () => droiteGraduee(40, 60, [40, 50, 60], 47), aide: () => droiteGraduee(40, 60, [40, 45, 47, 50, 60], 47) + grand('45, 46, 47') }),
  pave({ id: 'n4_06', domaine: 'Calcul', libelle: '23 + 14 (barres visibles)', attendu: 37,
    scene: () => grandLong(`23 + 14 = ${TROU}`) + additionBC(23, 14), aide: () => barresCubes(3, 7, true) + grand('20 + 10 = 30') + grand('3 + 4 = 7') }),
  pave({ id: 'n4_07', domaine: 'Sens des opérations', libelle: 'Léa avait ? cartes, elle en gagne 3, elle en a 9 : combien avant ?', attendu: 6,
    scene: () => illustration('carte', 2, 70), aide: () => deuxGroupes('carte', 6, 3, 24) + grand('9 − 3 = 6') }),
  pave({ id: 'n4_08', domaine: 'Doubles', libelle: 'Double de 20 (barres visibles)', attendu: 40,
    scene: () => grandLong(`20 + 20 = ${TROU}`) + additionBC(20, 20), aide: () => barresCubes(4, 0, true) + grand('20 + 20 = 40') }),
  pave({ id: 'n4_09', domaine: 'Vérification', libelle: 'Un ami a trouvé 6 + 6 = 13 : bon résultat ?', attendu: 12,
    scene: () => calculAmi('6 + 6', 13), aide: () => deuxGroupes('point', 6, 6, 20) + grand('6 + 6 = 12') }),
  pave({ id: 'n4_10', domaine: 'Calcul (dizaines)', libelle: '34 + 10 (barres visibles)', attendu: 44,
    scene: () => grandLong(`34 + 10 = ${TROU}`) + additionBC(34, 10), aide: () => barresCubes(4, 4, true) + grand('34 + 10 = 44') }),
  pave({ id: 'n4_11', domaine: 'Compléments à la dizaine', libelle: '63 + ? = 70', attendu: 7,
    scene: () => grand(`63 + ${TROU} = 70`), aide: () => bande(63, 70, 70) + grand('63 + 7 = 70') }),
  pave({ id: 'n4_12', domaine: 'Problème (écart)', libelle: 'Tom 12 billes, Léa 8 : combien Tom en a-t-il de plus ?', attendu: 4,
    scene: () => illustration('bille', 2, 70), aide: () => deuxRangees('bille', 12, 8) + grand('8 + 4 = 12') }),
  pave({ id: 'n4_13', domaine: 'Calcul', libelle: '40 − 3', attendu: 37,
    scene: () => grand(`40 − 3 = ${TROU}`), aide: () => bande(36, 40, 37) + grand('40 − 3 = 37') }),
  pave({ id: 'n4_14', domaine: 'Calcul', libelle: '32 + 25 (barres visibles)', attendu: 57,
    scene: () => grandLong(`32 + 25 = ${TROU}`) + additionBC(32, 25), aide: () => barresCubes(5, 7, true) + grand('30 + 20 = 50') + grand('2 + 5 = 7') }),
  pave({ id: 'n4_15', domaine: 'Moitiés', libelle: 'Moitié de 40', attendu: 20,
    scene: () => grand(`40 = ${TROU} + ${TROU}`), aide: () => barresCubes(2, 0) + '<span class="plus">+</span>' + barresCubes(2, 0) + grand('20 + 20 = 40') })
];

const N5 = [
  pave({ id: 'n5_01', domaine: 'Compléments à 5', libelle: 'Dés : 3 + ? = 5', attendu: 2,
    scene: () => deuxDes(3, null), aide: () => deuxDes(3, 2) + grand('3 + 2 = 5') }),
  pave({ id: 'n5_02', domaine: 'Doubles', libelle: 'Double de 7', attendu: 14,
    scene: () => grand(`7 + 7 = ${TROU}`), aide: () => deuxGroupes('point', 7, 7, 18) + grand('7 + 7 = 14') }),
  pave({ id: 'n5_03', domaine: 'Doubles', libelle: '7 + 8 (presque-double)', attendu: 15,
    scene: () => grand(`7 + 8 = ${TROU}`), aide: () => grand('7 + 7 = 14') + grand('14 + 1 = 15') }),
  pave({ id: 'n5_04', domaine: 'Droite graduée', libelle: 'Droite 70–90 graduée de 1 en 1 : la flèche montre 83', attendu: 83,
    scene: () => droiteGraduee(70, 90, [70, 80, 90], 83), aide: () => droiteGraduee(70, 90, [70, 80, 83, 90], 83) + grand('80, 81, 82, 83') }),
  pave({ id: 'n5_05', domaine: 'Calcul (dizaines)', libelle: '50 + 30 (sans barres)', attendu: 80,
    scene: () => grand(`50 + 30 = ${TROU}`), aide: () => barresCubes(8, 0, true) + grand('5 dizaines + 3 dizaines = 8 dizaines') }),
  pave({ id: 'n5_06', domaine: 'Sens des opérations', libelle: 'Boîte : on enlève 4 billes, il en reste 7 : combien au début ?', attendu: 11,
    scene: () => illustration('bille', 1, 110), aide: () => rangee('bille', 11, 26, 4) + grand('7 + 4 = 11') }),
  pave({ id: 'n5_07', domaine: 'Moitiés', libelle: 'Moitié de 16', attendu: 8,
    scene: () => grand(`16 = ${TROU} + ${TROU}`), aide: () => deuxGroupes('point', 8, 8, 18) + grand('8 + 8 = 16') }),
  pave({ id: 'n5_08', domaine: 'Vérification', libelle: 'Un ami a trouvé 45 + 20 = 47 : bon résultat ?', attendu: 65,
    scene: () => calculAmi('45 + 20', 47), aide: () => barresCubes(6, 5, true) + grand('45 + 20 = 65') }),
  pave({ id: 'n5_09', domaine: 'Doubles', libelle: 'Double de 50', attendu: 100,
    scene: () => grand(`50 + 50 = ${TROU}`), aide: () => barresCubes(5, 0) + '<span class="plus">+</span>' + barresCubes(5, 0) + grand('50 + 50 = 100') }),
  pave({ id: 'n5_10', domaine: 'Calcul (dizaines)', libelle: '56 + 10 (sans barres)', attendu: 66,
    scene: () => grand(`56 + 10 = ${TROU}`), aide: () => barresCubes(6, 6, true) + grand('56 + 10 = 66') }),
  pave({ id: 'n5_11', domaine: 'Calcul', libelle: '60 − 4', attendu: 56,
    scene: () => grand(`60 − 4 = ${TROU}`), aide: () => bande(55, 60, 56) + grand('60 − 4 = 56') }),
  pave({ id: 'n5_12', domaine: 'Problème (deux étapes)', libelle: '8 billes, + 7, puis − 5', attendu: 10,
    scene: () => illustration('bille', 1, 110), aide: () => grand('8 + 7 = 15') + grand('15 − 5 = 10') }),
  pave({ id: 'n5_13', domaine: 'Dizaines / unités', libelle: 'Dans 58, que vaut le chiffre 5 ?', attendu: 50,
    scene: () => grand('<u>5</u>8'), aide: () => barresCubes(5, 8, true) + grand('58 = 50 + 8') }),
  pave({ id: 'n5_14', domaine: 'Problème (multiplicatif)', libelle: '3 boîtes de 4 bonbons', attendu: 12,
    scene: () => illustration('bonbon', 1, 120), aide: () => `<div class="probleme-aide">${[1, 2, 3].map(() => `<div>${rangee('bonbon', 4, 30)}</div>`).join('')}</div>` + grand('4 + 4 + 4 = 12') }),
  pave({ id: 'n5_15', domaine: 'Calcul', libelle: '44 + 35', attendu: 79,
    scene: () => grand(`44 + 35 = ${TROU}`), aide: () => barresCubes(7, 9, true) + grand('40 + 30 = 70') + grand('4 + 5 = 9') })
];

// =====================================================================================
// S1.4 (session 5) — parcours N, séances 6 à 8, d'après le cahier d'école (inversions 10 + 4 → 41,
// « 902 » pour 92, 8 + 2 → 9) et la demande de Simon : ne plus compter un par un sur les doigts.
// Règle B13 : la scène ne montre que les données ; barres, cubes et mains sont dans l'aide.
// =====================================================================================
// « 3 dizaines 5 unités » écrit en toutes lettres (singulier / pluriel), sans barres.
const dizUnites = n => {
  const d = Math.floor(n / 10), u = n % 10;
  return grandLong(`${d} dizaine${d > 1 ? 's' : ''} ${u} unité${u > 1 ? 's' : ''}`);
};
// Aide N6-N7 : le nombre en barres de dix + cubes, puis l'écriture.
const aideBC = (n, ...lignes) => () => barresCubes(Math.floor(n / 10), n % 10, true) + lignes.map(t => (t.length > 12 ? grandLong(t) : grand(t))).join('');
// Nombre dicté (oreille seule) : la scène n'affiche rien de dénombrable.
const dicte = (id, n) => pave({ id, domaine: 'Écriture des nombres', libelle: `Dictée : ${n}`, attendu: n,
  scene: () => dictee(), aide: aideBC(n, String(n)) });
// « total = a + ? » écrit seul (scène), réponse au pavé.
const decomp = (id, domaine, libelle, total, a, attendu, aide) => pave({ id, domaine, libelle, attendu,
  scene: () => grand(`${total} = ${a} + ${TROU}`), aide });
// Calcul écrit seul (scène), réponse au pavé.
const calcul = (id, domaine, libelle, ecrit, attendu, aide) => pave({ id, domaine, libelle, attendu,
  scene: () => grand(`${ecrit} = ${TROU}`), aide });

const N6 = [
  dicte('n6_01', 72),
  dicte('n6_02', 81),
  dicte('n6_03', 92),
  dicte('n6_04', 78),
  dicte('n6_05', 97),
  dicte('n6_06', 85),
  dicte('n6_07', 71),
  dicte('n6_08', 99),
  pave({ id: 'n6_09', domaine: 'Dizaines / unités', libelle: '1 dizaine 4 unités (piège 41)', attendu: 14,
    scene: () => dizUnites(14), aide: aideBC(14, '14') }),
  pave({ id: 'n6_10', domaine: 'Dizaines / unités', libelle: '3 dizaines 5 unités (piège 53)', attendu: 35,
    scene: () => dizUnites(35), aide: aideBC(35, '35') }),
  pave({ id: 'n6_11', domaine: 'Dizaines / unités', libelle: '5 dizaines 3 unités (piège 35)', attendu: 53,
    scene: () => dizUnites(53), aide: aideBC(53, '53') }),
  calcul('n6_12', 'Dizaines / unités', '10 + 4 (piège 41, vu dans le cahier)', '10 + 4', 14, aideBC(14, '10 + 4 = 14')),
  calcul('n6_13', 'Dizaines / unités', '4 + 20 (piège 42)', '4 + 20', 24, aideBC(24, '4 + 20 = 24')),
  pave({ id: 'n6_14', domaine: 'Dizaines / unités', libelle: '8 dizaines 2 unités (piège 802)', attendu: 82,
    scene: () => dizUnites(82), aide: aideBC(82, '82') }),
  pave({ id: 'n6_15', domaine: 'Dizaines / unités', libelle: '9 dizaines 1 unité (piège 901)', attendu: 91,
    scene: () => dizUnites(91), aide: aideBC(91, '91') })
];

const N7 = [
  calcul('n7_01', 'Calcul (dizaines)', '30 + 20 (sans barres)', '30 + 20', 50, aideBC(50, '30 + 20 = 50')),
  calcul('n7_02', 'Calcul (dizaines)', '40 + 30 (sans barres)', '40 + 30', 70, aideBC(70, '40 + 30 = 70')),
  calcul('n7_03', 'Calcul (dizaines)', '50 + 40 (sans barres)', '50 + 40', 90, aideBC(90, '50 + 40 = 90')),
  calcul('n7_04', 'Calcul (dizaines)', '20 + 60 (sans barres)', '20 + 60', 80, aideBC(80, '20 + 60 = 80')),
  calcul('n7_05', 'Calcul (dizaines)', '10 + 50 (sans barres)', '10 + 50', 60, aideBC(60, '10 + 50 = 60')),
  calcul('n7_06', 'Dizaines / unités', '40 + 3 (piège 34)', '40 + 3', 43, aideBC(43, '40 + 3 = 43')),
  calcul('n7_07', 'Dizaines / unités', '3 + 50 (piège 35)', '3 + 50', 53, aideBC(53, '3 + 50 = 53')),
  calcul('n7_08', 'Dizaines / unités', '60 + 7 (piège 76)', '60 + 7', 67, aideBC(67, '60 + 7 = 67')),
  pave({ id: 'n7_09', domaine: 'Suite logique', libelle: '50, 60, 70, … ? (de 10 en 10)', attendu: 80,
    scene: () => suiteATrou([50, 60, 70]), aide: aideBC(80, '50 · 60 · 70 · 80') }),
  pave({ id: 'n7_10', domaine: 'Suite logique', libelle: '5, 10, 15, … ? (de 5 en 5)', attendu: 20,
    scene: () => suiteATrou([5, 10, 15]), aide: aideBC(20, '5 · 10 · 15 · 20') }),
  pave({ id: 'n7_11', domaine: 'Suite logique', libelle: '20, 25, 30, … ? (de 5 en 5)', attendu: 35,
    scene: () => suiteATrou([20, 25, 30]), aide: aideBC(35, '20 · 25 · 30 · 35') }),
  pave({ id: 'n7_12', domaine: 'Suite logique', libelle: '20, 15, 10, … ? (à rebours de 5 en 5)', attendu: 5,
    scene: () => suiteATrou([20, 15, 10]), aide: aideBC(5, '20 · 15 · 10 · 5') }),
  pave({ id: 'n7_13', domaine: 'Suite logique', libelle: '30, 25, 20, … ? (à rebours de 5 en 5)', attendu: 15,
    scene: () => suiteATrou([30, 25, 20]), aide: aideBC(15, '30 · 25 · 20 · 15') }),
  // « De plus que » : la scène montre seulement les billes de la donnée de départ (B13).
  pave({ id: 'n7_14', domaine: 'Problème (comparaison)', libelle: 'Tom 6 billes, Léa 3 de plus (re-test i14 / n1_07)', attendu: 9,
    scene: () => `<div class="probleme-aide"><div><b>Tom</b>${rangee('bille', 6, 30)}</div></div>`,
    aide: () => deuxRangees('bille', 6, 9) + grand('6 + 3 = 9') }),
  pave({ id: 'n7_15', domaine: 'Problème (comparaison)', libelle: 'Léa 7 billes, Tom 5 de plus', attendu: 12,
    scene: () => `<div class="probleme-aide"><div><b>Léa</b>${rangee('bille', 7, 30)}</div></div>`,
    aide: () => deuxRangees('bille', 7, 12, 'Léa', 'Tom') + grand('7 + 5 = 12') })
];

// N8 — « Calculer sans compter » : compléments à 5, passage par 5, doubles + 1.
// Scène : le calcul écrit seul, ni main ni doigts. Aide : mains (une main pleine = 5, puis les
// doigts restants), jamais des points à compter un par un ; doubles + 1 : le double, puis « + 1 ».
const N8 = [
  decomp('n8_01', 'Compléments à 5', '5 = 3 + ?', 5, 3, 2, () => mains(5, 2) + grand('3 + 2 = 5')),
  decomp('n8_02', 'Compléments à 5', '5 = 1 + ?', 5, 1, 4, () => mains(5, 4) + grand('1 + 4 = 5')),
  calcul('n8_03', 'Passage par 5', '5 + 2 (une main et deux doigts)', '5 + 2', 7, () => mains(7, 2) + grand('5 + 2 = 7')),
  calcul('n8_04', 'Passage par 5', '5 + 3', '5 + 3', 8, () => mains(8, 3) + grand('5 + 3 = 8')),
  calcul('n8_05', 'Passage par 5', '5 + 4', '5 + 4', 9, () => mains(9, 4) + grand('5 + 4 = 9')),
  decomp('n8_06', 'Passage par 5', '8 = 5 + ?', 8, 5, 3, () => mains(8, 3) + grand('8 = 5 + 3')),
  decomp('n8_07', 'Passage par 5', '7 = 5 + ?', 7, 5, 2, () => mains(7, 2) + grand('7 = 5 + 2')),
  decomp('n8_08', 'Passage par 5', '6 = 5 + ?', 6, 5, 1, () => mains(6, 1) + grand('6 = 5 + 1')),
  calcul('n8_09', 'Doubles', '3 + 3', '3 + 3', 6, () => `<div class="groupes">${main(3)}<span class="plus">+</span>${main(3)}</div>` + grand('3 + 3 = 6')),
  pave({ id: 'n8_10', domaine: 'Doubles + 1', libelle: '3 + 3 = 6, alors 3 + 4 ?', attendu: 7,
    scene: () => grandLong('3 + 3 = 6') + grand(`3 + 4 = ${TROU}`),
    aide: () => `<div class="groupes">${main(3)}<span class="plus">+</span>${main(3, 1)}</div>` + grand('3 + 3 = 6') + grand('6 + 1 = 7') }),
  calcul('n8_11', 'Doubles', '4 + 4', '4 + 4', 8, () => `<div class="groupes">${main(4)}<span class="plus">+</span>${main(4)}</div>` + grand('4 + 4 = 8')),
  pave({ id: 'n8_12', domaine: 'Doubles + 1', libelle: '4 + 4 = 8, alors 4 + 5 ?', attendu: 9,
    scene: () => grandLong('4 + 4 = 8') + grand(`4 + 5 = ${TROU}`),
    aide: () => `<div class="groupes">${main(4)}<span class="plus">+</span>${main(4, 1)}</div>` + grand('4 + 4 = 8') + grand('8 + 1 = 9') }),
  calcul('n8_13', 'Doubles + 1', '2 + 3 (double donné seulement dans l\'aide)', '2 + 3', 5,
    () => `<div class="groupes">${main(2)}<span class="plus">+</span>${main(2, 1)}</div>` + grand('2 + 2 = 4') + grand('4 + 1 = 5')),
  calcul('n8_14', 'Doubles + 1', '4 + 3 (= 3 + 3 + 1)', '4 + 3', 7,
    () => `<div class="groupes">${main(3, 1)}<span class="plus">+</span>${main(3)}</div>` + grand('3 + 3 = 6') + grand('6 + 1 = 7')),
  calcul('n8_15', 'Doubles + 1', '5 + 6 (= 5 + 5 + 1)', '5 + 6', 11,
    () => `<div class="groupes">${main(5)}<span class="plus">+</span>${main(5)}${main(0, 1)}</div>` + grand('5 + 5 = 10') + grand('10 + 1 = 11'))
];

export const PARCOURS = {
  C: {
    code: 'C', titre: 'Décomposer et compléter',
    seances: [
      { id: 'C1', objectif: 'Décomposer jusqu\'à 7 avec cases vides visibles ; lire barres + cubes ; écrire 90', items: C1 },
      { id: 'C2', objectif: 'Décomposer 8 et 9, compléments à 10 avec la boîte ; chiffre des dizaines ; écrire 91', items: C2 },
      { id: 'C3', objectif: 'Décompositions sans support (aide visuelle seulement après 2 essais) ; dictée 95', items: C3 },
      { id: 'C4', objectif: 'Compléments à 5 et doubles avec les dés ; droite graduée 0-10 ; 8 = 5 + 3 avec les dés', items: C4 },
      { id: 'C5', objectif: 'Doubles et compléments à 5 sans dé ; 7 et 9 = 5 + ? ; droite 0-20 ; moitié de 6 ; 12 + 13', items: C5 }
    ]
  },
  N: {
    code: 'N', titre: 'Nombres jusqu\'à 100 et problèmes',
    seances: [
      { id: 'N1', objectif: 'Suite et écriture 85-97 ; avant / après ; « de plus / de moins que » ; vérifier un calcul', items: N1 },
      { id: 'N2', objectif: 'Jusqu\'à 100 ; forme non canonique ; calcul en dizaines ; problème à deux étapes', items: N2 },
      { id: 'N3', objectif: 'Comparaison inversée et écart ; décomposition ; à rebours ; deux étapes', items: N3 },
      { id: 'N4', objectif: 'Doubles et moitiés ; droite graduée 40-60 ; additions sans retenue ; ajouter 9 ; état initial inconnu', items: N4 },
      { id: 'N5', objectif: 'Presque-doubles ; addition avec retenue ; droite 70-90 ; valeur du chiffre ; problème multiplicatif', items: N5 },
      { id: 'N6', objectif: 'Écrire les nombres 70-99 sous la dictée ; dizaines + unités sans inverser les chiffres (14 / 41, 92 / 902)', items: N6 },
      { id: 'N7', objectif: 'Dizaines sans barres ; dizaines + unités ; suites de 10 en 10 et de 5 en 5 ; re-test « de plus que »', items: N7 },
      { id: 'N8', objectif: 'Calculer sans compter un par un : compléments à 5, passage par 5 (une main = 5), doubles + 1', items: N8 }
    ]
  }
};

// Tous les items, à plat (tests, écran parent).
export const TOUS_LES_ITEMS = Object.values(PARCOURS).flatMap(p => p.seances.flatMap(s => s.items));
