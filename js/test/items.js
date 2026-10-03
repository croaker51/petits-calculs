// Test de positionnement T1 — 15 items FIXES (identiques pour les deux enfants
// et d'une passation à l'autre : les résultats restent comparables).
// Ce module ne touche pas au DOM : il est testable sous Node (tests/test_items.mjs).
//
// Chaque item :
//   id, domaine, libelle (pour l'écran parent), type ('pave'|'choix'|'barres'|'ligne'),
//   consigne / explication (identifiants de phrases audio),
//   attendu (valeur affichée au parent), verifier(reponse) -> booléen,
//   scene(ctx) / aide(ctx, reponse) -> HTML.
import { dessin } from '../themes.js';

export const VERSION_TEST = 'T1.0';

// ---------- Aides de rendu (chaînes HTML) ----------
function objetsPlaces(nom, positions, taille, numeros = false) {
  return `<div class="champ-objets">` + positions.map(([x, y], i) =>
    `<div class="objet" style="left:${x}%;top:${y}%">${dessin(nom, taille)}${numeros ? `<span class="num-objet">${i + 1}</span>` : ''}</div>`
  ).join('') + `</div>`;
}

function rangee(nom, n, taille = 40, barres = 0) {
  let h = '<div class="rangee">';
  for (let i = 0; i < n; i++) h += `<span class="${i < barres ? 'barre-objet' : ''}">${dessin(nom, taille)}</span>`;
  return h + '</div>';
}

export function barresCubes(barres, cubes, etiquettes = false) {
  let h = '<div class="dizaines-unites">';
  for (let b = 0; b < barres; b++) {
    h += '<div class="barre">' + '<i></i>'.repeat(10) + (etiquettes ? `<b>${(b + 1) * 10}</b>` : '') + '</div>';
  }
  h += '<div class="cubes">';
  for (let c = 0; c < cubes; c++) h += '<div class="cube"></div>';
  return h + '</div></div>';
}

function boiteDe10(pleines, surlignees = 0) {
  let h = '<div class="boite10">';
  for (let i = 0; i < 10; i++) {
    const cls = i < pleines ? 'pleine' : (i < pleines + surlignees ? 'manque' : '');
    h += `<span class="${cls}"></span>`;
  }
  return h + '</div>';
}

function bande(debut, fin, cible) {
  let h = '<div class="bande">';
  for (let n = debut; n <= fin; n++) h += `<span class="${n === cible ? 'cible' : ''}">${n}</span>`;
  return h + '</div>';
}

const grand = t => `<div class="grand-texte">${t}</div>`;

// Constellation du dé (5) et nuage de 14 objets : positions fixes en %.
const DE_CINQ = [[18, 18], [62, 18], [40, 40], [18, 62], [62, 62]];
const NUAGE_14 = [
  [4, 6], [28, 2], [52, 8], [76, 4], [14, 30], [40, 28], [66, 30],
  [86, 26], [2, 56], [26, 54], [52, 52], [78, 58], [36, 76], [64, 78]
];

// ---------- Les 15 items ----------
export const ITEMS = [
  {
    id: 'i01', domaine: 'Quantités', libelle: 'Reconnaître 5 (constellation du dé)',
    type: 'pave', attendu: 5, verifier: r => r === 5,
    scene: c => `<div class="cadre-de">${objetsPlaces(c.avatar, DE_CINQ, 64)}</div>`,
    aide: c => `<div class="cadre-de">${objetsPlaces(c.avatar, DE_CINQ, 64, true)}</div>${grand('5')}`
  },
  {
    id: 'i02', domaine: 'Dénombrement', libelle: 'Compter 14 objets dispersés',
    type: 'pave', attendu: 14, verifier: r => r === 14,
    scene: c => `<div class="cadre-nuage">${objetsPlaces(c.avatar, NUAGE_14, 50)}</div>`,
    aide: c => `<div class="cadre-nuage">${objetsPlaces(c.avatar, NUAGE_14, 50, true)}</div>`
  },
  {
    id: 'i03', domaine: 'Suite des nombres', libelle: 'Nombre après 39',
    type: 'pave', attendu: 40, verifier: r => r === 40,
    scene: () => grand('39 → <span class="trou">?</span>'),
    aide: () => bande(36, 42, 40)
  },
  {
    id: 'i04', domaine: 'Suite des nombres', libelle: 'Nombre après 89 (au-delà de l\'acquis)',
    type: 'pave', attendu: 90, verifier: r => r === 90,
    scene: () => grand('89 → <span class="trou">?</span>'),
    aide: () => bande(86, 92, 90)
  },
  {
    id: 'i05', domaine: 'Dizaines / unités', libelle: 'Lire 4 barres + 7 cubes (47)',
    type: 'pave', attendu: 47, verifier: r => r === 47,
    scene: () => barresCubes(4, 7),
    aide: () => barresCubes(4, 7, true) + grand('47')
  },
  {
    id: 'i06', domaine: 'Dizaines / unités', libelle: 'Construire 53 avec barres et cubes',
    type: 'barres', attendu: '53 (5 barres + 3 cubes)',
    // Toute construction valant 53 est JUSTE (ex. 4 barres + 13 cubes) : c'est mathématiquement vrai.
    // La forme canonique (5 + 3) est notée à part pour le parent.
    verifier: r => !!r && r.barres * 10 + r.cubes === 53,
    canonique: r => !!r && r.barres === 5 && r.cubes === 3,
    scene: () => grand('53'),
    aide: () => grand('53') + barresCubes(5, 3, true)
  },
  {
    id: 'i07', domaine: 'Comparaison', libelle: 'Le plus grand parmi 38, 83, 48',
    type: 'choix', choix: [38, 83, 48], attendu: 83, verifier: r => r === 83,
    // Avec 3 choix, le 2e essai se joue entre 2 réponses : il pèse moins (signalé au parent).
    essai2PeuSignificatif: true,
    scene: () => '',
    aide: () => `<div class="comparaison"><div>${grand('83')}${barresCubes(8, 3)}</div><div>${grand('38')}${barresCubes(3, 8)}</div></div>`
  },
  {
    id: 'i08', domaine: 'Ligne numérique', libelle: 'Placer 50 sur une ligne 0–100 (tolérance ±10)',
    type: 'ligne', attendu: 50, tolerance: 10,
    verifier: r => typeof r === 'number' && Math.abs(r - 50) <= 10,
    scene: () => grand('50'),
    aide: (c, r) => grand('50')
  },
  {
    id: 'i09', domaine: 'Compléments à 10', libelle: '6 + ? = 10',
    type: 'pave', attendu: 4, verifier: r => r === 4,
    scene: () => grand('6 + <span class="trou">?</span> = 10'),
    aide: () => grand('6 + 4 = 10') + boiteDe10(6, 4)
  },
  {
    id: 'i10', domaine: 'Décomposition', libelle: '8 = 5 + ?',
    type: 'pave', attendu: 3, verifier: r => r === 3,
    scene: () => grand('8 = 5 + <span class="trou">?</span>'),
    aide: c => grand('8 = 5 + 3') + `<div class="groupes">${rangee(c.avatar, 5, 34)}<span class="plus">+</span>${rangee(c.avatar, 3, 34)}</div>`
  },
  {
    id: 'i11', domaine: 'Calcul', libelle: '6 + 3',
    type: 'pave', attendu: 9, verifier: r => r === 9,
    scene: () => grand('6 + 3 = <span class="trou">?</span>'),
    aide: () => grand('6 + 3 = 9') + `<div class="groupes">${rangee('point', 6, 26)}<span class="plus">+</span>${rangee('point', 3, 26)}</div>`
  },
  {
    id: 'i12', domaine: 'Problème (ajout)', libelle: '5 billes, on en donne 3',
    type: 'pave', attendu: 8, verifier: r => r === 8,
    scene: () => `<div class="illustration">${dessin('bille', 110)}</div>`,
    aide: () => `<div class="groupes">${rangee('bille', 5, 30)}<span class="plus">+</span>${rangee('bille', 3, 30)}</div>` + grand('5 + 3 = 8')
  },
  {
    id: 'i13', domaine: 'Problème (retrait)', libelle: '9 bonbons, on en mange 3',
    type: 'pave', attendu: 6, verifier: r => r === 6,
    scene: () => `<div class="illustration">${dessin('bonbon', 120)}</div>`,
    aide: () => `<div class="rangee barre-fin">${Array.from({ length: 9 }, (_, i) =>
      `<span class="${i >= 6 ? 'barre-objet' : ''}">${dessin('bonbon', 34)}</span>`).join('')}</div>` + grand('9 − 3 = 6')
  },
  {
    id: 'i14', domaine: 'Problème (comparaison)', libelle: 'Tom 7 cartes, Léa 3 de plus',
    type: 'pave', attendu: 10, verifier: r => r === 10,
    scene: () => `<div class="illustration">${dessin('carte', 70)}${dessin('carte', 70)}</div>`,
    aide: () => `<div class="probleme-aide"><div><b>Tom</b>${rangee('carte', 7, 24)}</div><div><b>Léa</b>${rangee('carte', 10, 24)}</div></div>` + grand('7 + 3 = 10')
  },
  {
    id: 'i15', domaine: 'Suite logique', libelle: '2, 4, 6, … ?',
    type: 'pave', attendu: 8, verifier: r => r === 8,
    scene: () => grand('2 · 4 · 6 · <span class="trou">?</span>'),
    aide: () => bande(0, 10, 8) + grand('2 · 4 · 6 · 8')
  }
];

// ---------- Classement d'un item (cœur du diagnostic « l'exercice répond à la question ») ----------
// essais : [{ juste: bool, ... }, ...]
export function classer(essais) {
  if (!essais || essais.length === 0) return 'non-passe';
  if (essais[0].juste) return 'reussi-1er';
  if (essais.length >= 2 && essais[1].juste) return 'reussi-2e';
  if (essais.length >= 2) return 'non-acquis';
  return 'en-cours';
}

export const LIBELLES_CLASSEMENT = {
  'reussi-1er': 'Réussi du 1er coup',
  'reussi-2e': 'Réussi au 2e essai (précipitation probable)',
  'non-acquis': 'Non acquis (raté 2 fois)',
  'non-passe': 'Non passé',
  'en-cours': 'En cours'
};

// Synthèse pour le parent et pour le suivi du niveau.
export function synthese(resultats) {
  const s = { total: ITEMS.length, 'reussi-1er': 0, 'reussi-2e': 0, 'non-acquis': 0, 'non-passe': 0 };
  for (const it of ITEMS) {
    const r = resultats.find(x => x.itemId === it.id);
    const c = r ? r.classement : 'non-passe';
    s[c in s ? c : 'non-passe']++;
  }
  return s;
}
