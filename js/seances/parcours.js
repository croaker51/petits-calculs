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
  suiteATrou, dictee, calculAmi, ligneAide, illustration
} from '../rendu.js';

export const VERSION_SEANCES = 'S1.0';

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
const deuxBC = (p1, a, p2, b) =>
  `<div class="comparaison"><div><b>${p1}</b>${barresCubes(Math.floor(a / 10), a % 10)}</div><div><b>${p2}</b>${barresCubes(Math.floor(b / 10), b % 10)}</div></div>`;

// =====================================================================================
// PARCOURS C — Décomposer et compléter
// =====================================================================================
const C1 = [
  pave({ id: 'c1_01', domaine: 'Quantités', libelle: 'Boîte de 10 : 7 cases pleines', attendu: 7,
    scene: () => boiteDe10(7), aide: () => boiteDe10(7) + grand('5 + 2 = 7') }),
  pave({ id: 'c1_02', domaine: 'Décomposition', libelle: 'Il en faut 5, il y en a 3 (cases vides visibles)', attendu: 2,
    scene: () => emplacements('bonbon', 3, 5), aide: () => deuxGroupes('bonbon', 3, 2) + grand('3 + 2 = 5') }),
  pave({ id: 'c1_03', domaine: 'Décomposition', libelle: 'Il en faut 6, il y en a 4 (cases vides visibles)', attendu: 2,
    scene: () => emplacements('etoile', 4, 6), aide: () => deuxGroupes('etoile', 4, 2) + grand('4 + 2 = 6') }),
  pave({ id: 'c1_04', domaine: 'Dizaines / unités', libelle: 'Lire 2 barres + 4 cubes (24)', attendu: 24,
    scene: () => barresCubes(2, 4), aide: () => barresCubes(2, 4, true) + grand('24') }),
  pave({ id: 'c1_05', domaine: 'Décomposition', libelle: 'Il en faut 7, il y en a 4 (cases vides visibles)', attendu: 3,
    scene: () => emplacements('bille', 4, 7, 36), aide: () => deuxGroupes('bille', 4, 3) + grand('4 + 3 = 7') }),
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
    scene: () => emplacements('carte', 2, 6, 40), aide: () => deuxGroupes('carte', 2, 4, 28) + grand('2 + 4 = 6') }),
  choix({ id: 'c1_13', domaine: 'Comparaison', libelle: 'Le plus grand entre 24 et 42', choix: [24, 42], attendu: 42,
    aide: () => compareBC(42, 24) }),
  pave({ id: 'c1_14', domaine: 'Problème (retrait)', libelle: '7 bonbons, on en donne 2', attendu: 5,
    scene: () => illustration('bonbon', 1, 120), aide: () => rangee('bonbon', 7, 34, 2) + grand('7 − 2 = 5') }),
  pave({ id: 'c1_15', domaine: 'Décomposition', libelle: '5 + ? = 7 (objets visibles, sans cases vides)', attendu: 2,
    scene: () => grand(`5 + ${TROU} = 7`) + rangee('bonbon', 5, 40), aide: () => deuxGroupes('bonbon', 5, 2) + grand('5 + 2 = 7') })
];

const C2 = [
  pave({ id: 'c2_01', domaine: 'Compléments à 10', libelle: 'Boîte de 10 : 8 pleines, combien de vides ?', attendu: 2,
    scene: () => boiteDe10(8), aide: () => boiteDe10(8, 2) + grand('8 + 2 = 10') }),
  pave({ id: 'c2_02', domaine: 'Compléments à 10', libelle: 'Boîte de 10 : 7 pleines, combien pour faire 10 ?', attendu: 3,
    scene: () => boiteDe10(7), aide: () => boiteDe10(7, 3) + grand('7 + 3 = 10') }),
  pave({ id: 'c2_03', domaine: 'Décomposition', libelle: 'Il en faut 8, il y en a 5 (cases vides visibles) — reprise de i10', attendu: 3,
    scene: () => emplacements('etoile', 5, 8, 36), aide: () => deuxGroupes('etoile', 5, 3) + grand('8 = 5 + 3') }),
  pave({ id: 'c2_04', domaine: 'Dizaines / unités', libelle: 'Lire 5 barres + 2 cubes (52)', attendu: 52,
    scene: () => barresCubes(5, 2), aide: () => barresCubes(5, 2, true) + grand('52') }),
  pave({ id: 'c2_05', domaine: 'Compléments à 10', libelle: '4 + ? = 10 (boîte de 10 visible)', attendu: 6,
    scene: () => grand(`4 + ${TROU} = 10`) + boiteDe10(4), aide: () => boiteDe10(4, 6) + grand('4 + 6 = 10') }),
  pave({ id: 'c2_06', domaine: 'Décomposition', libelle: '5 + ? = 9 (objets visibles)', attendu: 4,
    scene: () => grand(`5 + ${TROU} = 9`) + rangee('bille', 5, 40), aide: () => deuxGroupes('bille', 5, 4) + grand('5 + 4 = 9') }),
  pave({ id: 'c2_07', domaine: 'Suite des nombres', libelle: 'Après 88, 89, 90 : écrire 91', attendu: 91,
    scene: () => suiteATrou([88, 89, 90]), aide: () => bande(87, 93, 91) + barresCubes(9, 1) + grand('91') }),
  pave({ id: 'c2_08', domaine: 'Calcul', libelle: '3 + 4', attendu: 7,
    scene: () => grand(`3 + 4 = ${TROU}`), aide: () => grand('3 + 4 = 7') + deuxGroupes('point', 3, 4, 26) }),
  construire('c2_09', 43),
  pave({ id: 'c2_10', domaine: 'Problème (retrait)', libelle: '8 cartes, Tom en prend 3', attendu: 5,
    scene: () => illustration('carte', 2, 70), aide: () => rangee('carte', 8, 30, 3) + grand('8 − 3 = 5') }),
  pave({ id: 'c2_11', domaine: 'Décomposition', libelle: '6 + ? = 8 (objets visibles)', attendu: 2,
    scene: () => grand(`6 + ${TROU} = 8`) + rangee('etoile', 6, 40), aide: () => deuxGroupes('etoile', 6, 2) + grand('6 + 2 = 8') }),
  pave({ id: 'c2_12', domaine: 'Dizaines / unités', libelle: '47 : combien de barres de dix ? (erreur i05)', attendu: 4,
    scene: () => grand('47') + barresCubes(4, 7), aide: () => grand('47') + barresCubes(4, 7, true) }),
  pave({ id: 'c2_13', domaine: 'Problème (ajout)', libelle: 'Léa a 5 étoiles, elle en gagne 4', attendu: 9,
    scene: () => illustration('etoile', 1, 110), aide: () => deuxGroupes('etoile', 5, 4) + grand('5 + 4 = 9') }),
  choix({ id: 'c2_14', domaine: 'Comparaison', libelle: 'Le plus petit parmi 57, 75, 55', choix: [57, 75, 55], attendu: 55,
    aide: () => compareBC(55, 57) }),
  pave({ id: 'c2_15', domaine: 'Compléments à 10', libelle: '10 = 3 + ? (boîte de 10 visible)', attendu: 7,
    scene: () => grand(`10 = 3 + ${TROU}`) + boiteDe10(3), aide: () => boiteDe10(3, 7) + grand('10 = 3 + 7') })
];

const C3 = [
  pave({ id: 'c3_01', domaine: 'Compléments à 10', libelle: '5 + ? = 10 (boîte de 10 visible)', attendu: 5,
    scene: () => grand(`5 + ${TROU} = 10`) + boiteDe10(5), aide: () => boiteDe10(5, 5) + grand('5 + 5 = 10') }),
  pave({ id: 'c3_02', domaine: 'Décomposition', libelle: '8 = 5 + ? sans support (reprise de i10)', attendu: 3,
    scene: () => grand(`8 = 5 + ${TROU}`), aide: () => emplacements('point', 5, 8, 30) + grand('8 = 5 + 3') }),
  pave({ id: 'c3_03', domaine: 'Dizaines / unités', libelle: 'Lire 6 barres + 0 cube (60)', attendu: 60,
    scene: () => barresCubes(6, 0), aide: () => barresCubes(6, 0, true) + grand('60') }),
  pave({ id: 'c3_04', domaine: 'Décomposition', libelle: '9 = 7 + ? sans support', attendu: 2,
    scene: () => grand(`9 = 7 + ${TROU}`), aide: () => emplacements('point', 7, 9, 28) + grand('9 = 7 + 2') }),
  pave({ id: 'c3_05', domaine: 'Écriture des nombres', libelle: 'Dictée : 95 (erreur « 910 » au test)', attendu: 95,
    scene: () => dictee(), aide: () => barresCubes(9, 5, true) + grand('95') }),
  pave({ id: 'c3_06', domaine: 'Calcul', libelle: '6 + 2', attendu: 8,
    scene: () => grand(`6 + 2 = ${TROU}`), aide: () => grand('6 + 2 = 8') + deuxGroupes('point', 6, 2, 26) }),
  pave({ id: 'c3_07', domaine: 'Problème (complément)', libelle: 'Léa veut 10 étoiles, elle en a 7', attendu: 3,
    scene: () => illustration('etoile', 1, 110), aide: () => boiteDe10(7, 3) + grand('7 + 3 = 10') }),
  construire('c3_08', 38),
  pave({ id: 'c3_09', domaine: 'Décomposition', libelle: '7 = 3 + ? sans support', attendu: 4,
    scene: () => grand(`7 = 3 + ${TROU}`), aide: () => emplacements('point', 3, 7, 30) + grand('7 = 3 + 4') }),
  choix({ id: 'c3_10', domaine: 'Comparaison', libelle: 'Le plus grand entre 69 et 96', choix: [69, 96], attendu: 96,
    aide: () => compareBC(96, 69) }),
  pave({ id: 'c3_11', domaine: 'Problème (retrait)', libelle: '10 billes, on en perd 4', attendu: 6,
    scene: () => illustration('bille', 1, 110), aide: () => rangee('bille', 10, 28, 4) + grand('10 − 4 = 6') }),
  pave({ id: 'c3_12', domaine: 'Compléments à 10', libelle: '4 + 6 (lien avec 6 + 4 du test)', attendu: 10,
    scene: () => grand(`4 + 6 = ${TROU}`), aide: () => boiteDe10(4, 6) + grand('4 + 6 = 10') }),
  pave({ id: 'c3_13', domaine: 'Dizaines / unités', libelle: '58 : combien de petits cubes ?', attendu: 8,
    scene: () => grand('58') + barresCubes(5, 8), aide: () => grand('58') + barresCubes(5, 8, true) }),
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
  pave({ id: 'n1_13', domaine: 'Calcul (dizaines)', libelle: '47 + 10', attendu: 57,
    scene: () => grand(`47 + 10 = ${TROU}`), aide: () => barresCubes(5, 7, true) + grand('47 + 10 = 57') }),
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
  pave({ id: 'n2_07', domaine: 'Calcul (dizaines)', libelle: '70 − 20', attendu: 50,
    scene: () => grand(`70 − 20 = ${TROU}`), aide: () => barresCubes(5, 0, true) + grand('70 − 20 = 50') }),
  pave({ id: 'n2_08', domaine: 'Décomposition', libelle: '64 = 60 + ?', attendu: 4,
    scene: () => grand(`64 = 60 + ${TROU}`), aide: () => barresCubes(6, 4, true) + grand('64 = 60 + 4') }),
  pave({ id: 'n2_09', domaine: 'Vérification', libelle: 'Un ami a trouvé 40 + 5 = 90 : bon résultat ?', attendu: 45,
    scene: () => calculAmi('40 + 5', 90), aide: () => barresCubes(4, 5, true) + grand('40 + 5 = 45') }),
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
  pave({ id: 'n3_04', domaine: 'Calcul (dizaines)', libelle: '36 + 20', attendu: 56,
    scene: () => grand(`36 + 20 = ${TROU}`), aide: () => barresCubes(5, 6, true) + grand('36 + 20 = 56') }),
  pave({ id: 'n3_05', domaine: 'Problème (écart)', libelle: 'Tom 7, Léa 10 : combien de plus ?', attendu: 3,
    scene: () => illustration('bille', 2, 70), aide: () => deuxRangees('bille', 7, 10) + grand('7 + 3 = 10') }),
  construire('n3_06', 85),
  pave({ id: 'n3_07', domaine: 'Vérification', libelle: 'Un ami a trouvé 50 + 20 = 52 : bon résultat ?', attendu: 70,
    scene: () => calculAmi('50 + 20', 52), aide: () => barresCubes(7, 0, true) + grand('50 + 20 = 70') }),
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

export const PARCOURS = {
  C: {
    code: 'C', titre: 'Décomposer et compléter',
    seances: [
      { id: 'C1', objectif: 'Décomposer jusqu\'à 7 avec cases vides visibles ; lire barres + cubes ; écrire 90', items: C1 },
      { id: 'C2', objectif: 'Décomposer 8 et 9, compléments à 10 avec la boîte ; chiffre des dizaines ; écrire 91', items: C2 },
      { id: 'C3', objectif: 'Décompositions sans support (aide visuelle seulement après 2 essais) ; dictée 95', items: C3 }
    ]
  },
  N: {
    code: 'N', titre: 'Nombres jusqu\'à 100 et problèmes',
    seances: [
      { id: 'N1', objectif: 'Suite et écriture 85-97 ; avant / après ; « de plus / de moins que » ; vérifier un calcul', items: N1 },
      { id: 'N2', objectif: 'Jusqu\'à 100 ; forme non canonique ; calcul en dizaines ; problème à deux étapes', items: N2 },
      { id: 'N3', objectif: 'Comparaison inversée et écart ; décomposition ; à rebours ; deux étapes', items: N3 }
    ]
  }
};

// Tous les items, à plat (tests, écran parent).
export const TOUS_LES_ITEMS = Object.values(PARCOURS).flatMap(p => p.seances.flatMap(s => s.items));
