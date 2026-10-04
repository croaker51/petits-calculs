// Aides de rendu partagées (chaînes HTML, sans DOM : testables sous Node).
// Utilisées par le test de positionnement (test/items.js) et par les séances (seances/).
import { dessin } from './themes.js';

// Objets placés librement (en % du cadre). numeros = petite pastille 1, 2, 3… (aide au comptage).
export function objetsPlaces(nom, positions, taille, numeros = false) {
  return `<div class="champ-objets">` + positions.map(([x, y], i) =>
    `<div class="objet" style="left:${x}%;top:${y}%">${dessin(nom, taille)}${numeros ? `<span class="num-objet">${i + 1}</span>` : ''}</div>`
  ).join('') + `</div>`;
}

// Rangée de n dessins ; les « barres » premiers sont barrés (retirés, mangés…).
export function rangee(nom, n, taille = 40, barres = 0) {
  let h = '<div class="rangee">';
  for (let i = 0; i < n; i++) h += `<span class="${i < barres ? 'barre-objet' : ''}">${dessin(nom, taille)}</span>`;
  return h + '</div>';
}

// Barres de dix et cubes d'unité. etiquettes = 10, 20, 30… sous les barres.
export function barresCubes(barres, cubes, etiquettes = false) {
  let h = '<div class="dizaines-unites">';
  for (let b = 0; b < barres; b++) {
    h += '<div class="barre">' + '<i></i>'.repeat(10) + (etiquettes ? `<b>${(b + 1) * 10}</b>` : '') + '</div>';
  }
  h += '<div class="cubes">';
  for (let c = 0; c < cubes; c++) h += '<div class="cube"></div>';
  return h + '</div></div>';
}

// Boîte de 10 (2 lignes de 5) : « pleines » cases pleines, puis « surlignees » cases à compléter.
export function boiteDe10(pleines, surlignees = 0) {
  let h = '<div class="boite10">';
  for (let i = 0; i < 10; i++) {
    const cls = i < pleines ? 'pleine' : (i < pleines + surlignees ? 'manque' : '');
    h += `<span class="${cls}"></span>`;
  }
  return h + '</div>';
}

// Bande numérique de debut à fin ; la case « cible » est mise en valeur.
export function bande(debut, fin, cible) {
  let h = '<div class="bande">';
  for (let n = debut; n <= fin; n++) h += `<span class="${n === cible ? 'cible' : ''}">${n}</span>`;
  return h + '</div>';
}

export const grand = t => `<div class="grand-texte">${t}</div>`;
export const TROU = '<span class="trou">?</span>';
// Expression longue (suites, calcul d'un ami) : police réduite pour tenir sur une ligne à 375 px.
export const grandLong = t => `<div class="grand-texte long">${t}</div>`;

// « Il en faut total, il y en a presents » : dessins présents + emplacements vides en pointillés.
export function emplacements(nom, presents, total, taille = 40) {
  let h = '<div class="rangee">';
  for (let i = 0; i < total; i++) {
    h += i < presents
      ? `<span class="present">${dessin(nom, taille)}</span>`
      : `<span class="emplacement-vide" style="width:${taille}px;height:${taille}px"></span>`;
  }
  return h + '</div>';
}

// Suite affichée avec une case à trouver à la fin : 87 · 88 · 89 · ?
export const suiteATrou = nombres => grandLong(nombres.join(' · ') + ' · ' + TROU);

// Nombre dicté (rien à lire : l'enfant écoute puis tape).
export const dictee = () => `<div class="dictee">${grand(TROU)}</div>`;

// Calcul d'un « ami » à vérifier : la réponse fausse est barrée, jamais affichée comme vraie.
export const calculAmi = (gauche, faux) => grandLong(`${gauche} = <s class="faux">${faux}</s> ${TROU}`);

// Ligne numérique 0–100 de l'aide : position juste (+ position donnée par l'enfant).
export function ligneAide(cible, reponse) {
  return `<div class="ligne-num ligne-aide"><div class="trait"></div>
    <span class="borne g">0</span><span class="borne d">100</span>
    <div class="repere repere-juste" style="left:calc(24px + (100% - 48px) * ${cible / 100})"><b>${cible}</b></div>
    ${typeof reponse === 'number' ? `<div class="repere repere-enfant" style="left:calc(24px + (100% - 48px) * ${reponse / 100})"></div>` : ''}
  </div>`;
}

// Illustration d'un problème : k dessins côte à côte.
export const illustration = (nom, k = 1, taille = 100) =>
  `<div class="illustration">${Array.from({ length: k }, () => dessin(nom, taille)).join('')}</div>`;

// ---------- Séances S1.1 : dés (1 à 5 points) et demi-droite graduée ----------
// Dé à points, constellations classiques du dé, 5 points MAXIMUM (comme en classe pour les
// compléments à 5). n = null → dé « ? » (face cachée à trouver).
const POINTS_DE = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]]
};
export function de(n, taille = 76) {
  if (n !== null && !(n in POINTS_DE)) throw new Error('dé : 1 à 5 points seulement');
  const contenu = n === null
    ? `<text x="50" y="68" text-anchor="middle" font-size="52" font-weight="800" fill="#f29e4c">?</text>`
    : POINTS_DE[n].map(([x, y]) => `<circle class="pip" cx="${x}" cy="${y}" r="9" fill="#2d2a32"/>`).join('');
  return `<svg class="de${n === null ? ' de-cache' : ''}" width="${taille}" height="${taille}" viewBox="0 0 100 100" aria-hidden="true">
    <rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="${n === null ? '#f29e4c' : '#2d2a32'}" stroke-width="5" ${n === null ? 'stroke-dasharray="10 7"' : ''}/>${contenu}</svg>`;
}
// Deux dés côte à côte (b = null : le second est à trouver), avec « + » entre eux.
export const deuxDes = (a, b, taille = 76) =>
  `<div class="groupes">${de(a, taille)}<span class="plus">+</span>${de(b, taille)}</div>`;

// Demi-droite graduée de un en un, de debut à fin (≤ 20 graduations), étiquettes aux nombres
// listés, flèche au-dessus de « fleche ». Largeur fixe 320 px (tient à 375 px).
export function droiteGraduee(debut, fin, etiquettes, fleche, montrerFleche = true) {
  const W = 320, m = 16, n = fin - debut;
  if (n < 1 || n > 20) throw new Error('droite graduée : 1 à 20 graduations');
  const x = v => m + (v - debut) * (W - 2 * m) / n;
  let h = `<svg class="droite-graduee" width="${W}" height="96" viewBox="0 0 ${W} 96" role="img" aria-label="Droite graduée" data-fleche="${fleche}">
    <line x1="${m - 6}" y1="56" x2="${W - 4}" y2="56" stroke="#2d2a32" stroke-width="3"/>
    <path d="M${W - 4} 56 l-10 -6 v12 z" fill="#2d2a32"/>`;
  for (let v = debut; v <= fin; v++) {
    const grand = etiquettes.includes(v);
    h += `<line class="graduation" x1="${x(v)}" y1="${grand ? 44 : 49}" x2="${x(v)}" y2="${grand ? 68 : 63}" stroke="#2d2a32" stroke-width="${grand ? 3 : 2}"/>`;
    if (grand) h += `<text x="${x(v)}" y="88" text-anchor="middle" font-size="17" font-weight="700" fill="#2d2a32">${v}</text>`;
  }
  if (montrerFleche) h += `<path class="fleche" data-x="${x(fleche).toFixed(2)}" d="M${x(fleche)} 40 l-9 -14 h18 z" fill="#f29e4c"/>`;
  return h + '</svg>';
}
// Abscisse attendue d'une valeur (utilisée par les tests pour vérifier la position de la flèche).
export const abscisseDroite = (debut, fin, v) => 16 + (v - debut) * (320 - 32) / (fin - debut);
