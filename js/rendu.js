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
