// BANQUE v0.5 — domaines encodage (E), phonologie (P), grandeurs et mesures (M), espace et géométrie (G).
// Décisions de Simon du 10/10/2026 : on fait les 3 domaines ; voix générées dans le même lot que la v0.4.0 ;
// encodage avec étiquettes de GRAPHÈMES ; la monnaie n'est pas commencée en classe (verrou parent).
// Source programme : annexes 3 (français) et 4 (maths) du programme du cycle 2 (version 2024, PDF
// déposés dans le dossier du projet). Cadrage : claude/plan_encodage_phono_grandeurs.md.
//
// STATUT : DONNÉES + TEXTES seulement. Ni rendu ni branchement sur les séances (prévu v0.5). Les textes
// sont figés dès que les voix sont générées : modifier un texte = régénérer la phrase.
// Vérifications : tests/test_banque_v05.mjs (vérité recalculée, pages du Calimot, pas de chiffres).
//
// Types d'écran prévus (à coder en v0.5) :
//  encode    : étiquettes de graphèmes à poser dans l'ordre (bonnes + intrus) ; muettes fournies en gris
//              sauf si muetteAChoisir (l'enfant choisit la lettre muette parmi des étiquettes).
//  syllabes  : P1, 1 à 4 mains à toucher.
//  cases     : P2 (une case par syllabe orale, toucher la bonne) ; P3 (cases 1, 2, 3 = mots entendus).
//  pave      : pavé numérique existant.
//  choixHtml : choix existant (porte-monnaie, formes, solides, positions, grandeurs).
//  ordre     : bandes à ranger.
//  horloge   : toucher le chiffre où va la petite aiguille.
//  grille    : toucher une case (déplacement lu) ou des nœuds (compléter une figure).
//  programme : composer une suite d'instructions A (avancer d'une case), D / G (pivoter d'un quart de
//              tour à droite / à gauche) ; vérifiée par simulation.
import { L, cap } from './nombres.js';

export const VERSION_BANQUE_V05 = 'B2-donnees';

export const FAMILLES_V05 = {
  enc: 'Encoder : écrire des syllabes et des mots avec des étiquettes',
  pho: 'Entendre les syllabes et les sons (oral)',
  mon: 'La monnaie (euros)',
  heu: "Lire l'heure (heures entières)",
  lon: 'Les longueurs',
  dep: 'Se repérer, coder un déplacement',
  fpl: 'Les formes planes',
  sol: 'Les solides'
};

// Compétences : codes provisoires ; libellés à recopier MOT POUR MOT des annexes 3 et 4 dans
// referentiel.js lors du branchement.
export const COMPETENCES_V05 = {
  'CP-FR-ENC': 'Encoder des syllabes simples puis des mots selon la progression des CGP (annexe 3, CP).',
  'CP-FR-MUE': 'Écrire des mots dictés avec des lettres muettes apprises (annexe 3, CP, dès la fin de la 2e période).',
  'CP-FR-PHO': 'Segmenter la chaine orale : les mots en syllabes et phonèmes (annexe 3, CP, exemples de réussite).',
  'CP-M-MON': 'La monnaie (annexe 4, CP ; introduite en période 2 ou 3).',
  'CP-M-HEU': 'Le repérage dans le temps : heures entières (annexe 4, CP).',
  'CP-M-LON': 'Les longueurs (annexe 4, CP).',
  'CP-G-REP': "Le repérage dans l'espace (annexe 4, CP).",
  'CP-G-PLA': 'La géométrie plane (annexe 4, CP).',
  'CP-G-SOL': 'Les solides (annexe 4, CP).'
};

const B = [];
const ajoute = o => { B.push(o); return o; };

// ======================= DOMAINE 1 — ENCODAGE =======================
// g : graphèmes DITS, dans l'ordre, séparés par « | » ; syl : syllabes écrites (notation du module
// lecture : lettres muettes entre crochets) ; intrus : étiquettes en trop ; ex : mot d'exemple (oral).
// La page minimale du Calimot est recalculée par le test avec dechiffrable() ; pageMin ne peut
// qu'être PLUS tardive (verrou volontaire).
const sylDites = syl => syl.split('-').map(s => s.replace(/\[[^\]]*\]/g, '')).filter(Boolean);
const sylLues = syl => syl.split('-').map(s => s.replace(/[\[\]]/g, ''));
const muettesDe = syl => [...syl.matchAll(/\[([^\]]*)\]/g)].map(m => m[1]);
const motDe = syl => syl.replace(/[-\[\]]/g, '');

function enc(niveau, syl, g, intrus, o = {}) {
  const mot = motDe(syl);
  const id = `e_${mot.normalize('NFD').replace(/[̀-ͯ]/g, '')}`;
  const muettes = muettesDe(syl);
  const lues = sylLues(syl);
  const estSyllabe = !!o.ex;
  const c = estSyllabe
    ? `Écris la syllabe ${mot}, comme dans ${o.ex}.`
    : o.muetteAChoisir
      ? `Écris le mot ${mot}. Attention à la fin du mot.`
      : `Écris le mot ${mot}.`;
  let e;
  if (estSyllabe) e = `${cap(mot)}, comme dans ${o.ex}. On écrit ${mot} avec ces étiquettes.`;
  else {
    e = lues.length === 1 ? (muettes.length ? `${cap(mot)}.` : `${cap(mot)}. On écrit ${mot} avec ces étiquettes.`) : `${cap(mot)} : ${lues.join(', ')}.`;
    for (const m of muettes) {
      e += !o.muetteAChoisir ? ` Le ${m}, en gris, ne se dit pas.` : ` Le ${m}, à la fin, ne se dit pas, mais il s'écrit.`;
      if (o.famille_de) e += ` Comme dans ${o.famille_de}.`;
    }
  }
  return ajoute({
    id, famille: 'enc', niveau, competence: o.muetteAChoisir ? 'CP-FR-MUE' : 'CP-FR-ENC', type: 'encode',
    syl, mot, graphemes: g.split('|'), muettes, muetteAChoisir: !!o.muetteAChoisir,
    intrus, pageMin: o.pageMin || null,
    attendu: g.split('|').join('|') + (o.muetteAChoisir ? '|' + muettes.join('|') : ''),
    textes: { c, e }
  });
}

// Niveau 1 — syllabes consonne-voyelle.
enc(1, 'ma', 'm|a', ['l', 'o'], { ex: 'matin' });
enc(1, 'ri', 'r|i', ['l', 'u'], { ex: 'rideau' });
enc(1, 'lu', 'l|u', ['ou', 'r'], { ex: 'lune' });
enc(1, 'fo', 'f|o', ['m', 'a'], { ex: 'forêt' });
enc(1, 'mé', 'm|é', ['f', 'i'], { ex: 'météo' });
enc(1, 'ra', 'r|a', ['l', 'o'], { ex: 'radis' });
enc(1, 'va', 'v|a', ['f', 'o'], { ex: 'vacances' });
enc(1, 'chi', 'ch|i', ['j', 'u'], { ex: 'chiffre' });
enc(1, 'jo', 'j|o', ['ch', 'a'], { ex: 'joli' });
enc(1, 'nu', 'n|u', ['m', 'ou'], { ex: 'nuit' });
enc(1, 'pa', 'p|a', ['b', 'o'], { ex: 'papa' });
enc(1, 'to', 't|o', ['p', 'a'], { ex: 'tomate' });
// Niveau 2 — syllabes inversées ou consonne-voyelle-consonne (découpage de Liam).
enc(2, 'ar', 'a|r', ['l', 'o'], { ex: 'arbre' });
enc(2, 'or', 'o|r', ['l', 'a'], { ex: 'orange' });
enc(2, 'il', 'i|l', ['r', 'u'], { ex: 'île' });
enc(2, 'our', 'ou|r', ['u', 'l'], { ex: 'four' });
enc(2, 'mar', 'm|a|r', ['l', 'o'], { ex: 'mardi' });
enc(2, 'tor', 't|o|r', ['p', 'l'], { ex: 'tortue' });
enc(2, 'mur', 'm|u|r', ['ou', 'l']);
enc(2, 'fil', 'f|i|l', ['v', 'r']);
enc(2, 'sol', 's|o|l', ['ch', 'r']);
enc(2, 'bal', 'b|a|l', ['p', 'r']);
// Niveau 2 — mots de graphèmes simples (lettres muettes finales fournies, en gris).
enc(2, 'la-ma', 'l|a|m|a', ['r', 'o']);
enc(2, 'ma-ri', 'm|a|r|i', ['l', 'u']);
enc(2, 'a-mi', 'a|m|i', ['r', 'o']);
enc(2, 'ri-r[e]', 'r|i|r', ['l', 'u']);
enc(2, 'mu-l[e]', 'm|u|l', ['ou', 'r']);
enc(2, 'vé-lo', 'v|é|l|o', ['f', 'r']);
enc(2, 'na-vi-r[e]', 'n|a|v|i|r', ['m', 'f']);
enc(2, 'ju-p[e]', 'j|u|p', ['ou', 'b']);
enc(2, 'to-ma-t[e]', 't|o|m|a|t', ['n', 'p']);
enc(2, 'pi-ra-t[e]', 'p|i|r|a|t', ['b', 'l']);
enc(2, 'do-mi-no', 'd|o|m|i|n|o', ['t', 'u']);
enc(2, 'sa-la-d[e]', 's|a|l|a|d', ['ch', 'r']);
// Niveau 3 — graphèmes de plusieurs lettres.
enc(3, 'mou-l[e]', 'm|ou|l', ['u', 'r']);
enc(3, 'four-mi', 'f|ou|r|m|i', ['u', 'l']);
enc(3, 'a-mour', 'a|m|ou|r', ['u', 'l']);
enc(3, 'va-ch[e]', 'v|a|ch', ['f', 'j']);
enc(3, 'pou-l[e]', 'p|ou|l', ['u', 'b']);
enc(3, 'mou-ton', 'm|ou|t|on', ['u', 'n']);
enc(3, 'sa-von', 's|a|v|on', ['ch', 'f']);
enc(3, 'cha-ton', 'ch|a|t|on', ['j', 'ou']);
enc(3, 'our-son', 'ou|r|s|on', ['u', 'ch']);
enc(3, 'pi-qué', 'p|i|qu|é', ['c', 'b']);
enc(3, 'ba-teau', 'b|a|t|eau', ['au', 'on']);
enc(3, 'cha-peau', 'ch|a|p|eau', ['au', 'b']);
enc(3, 'cha-meau', 'ch|a|m|eau', ['au', 'n']);
enc(3, 'ca-deau', 'c|a|d|eau', ['au', 't']);
// Niveau 3 — lettre muette finale À CHOISIR (BO : « dès la fin de la 2e période »).
// Verrou : p. 38 au plus tôt (fin d'unité 2 estimée vers Noël, estimation non vérifiée).
enc(3, 'cha[t]', 'ch|a', ['s', 'p'], { muetteAChoisir: true, famille_de: 'chaton', pageMin: 38 });
enc(3, 'ra[t]', 'r|a', ['s', 'p'], { muetteAChoisir: true, pageMin: 38 });
enc(3, 'li[t]', 'l|i', ['s', 'p'], { muetteAChoisir: true, pageMin: 38 });
enc(3, 'ro-bo[t]', 'r|o|b|o', ['s', 'p'], { muetteAChoisir: true, pageMin: 38 });
enc(3, 'lou[p]', 'l|ou', ['t', 's'], { muetteAChoisir: true, pageMin: 38 });
enc(3, 'ta-pi[s]', 't|a|p|i', ['e', 'd'], { muetteAChoisir: true, pageMin: 41 });
enc(3, 'ra-di[s]', 'r|a|d|i', ['t', 'p'], { muetteAChoisir: true, pageMin: 41 });
enc(3, 'sou-ri[s]', 's|ou|r|i', ['t', 'p'], { muetteAChoisir: true, pageMin: 38 });
enc(3, 'ba-var[d]', 'b|a|v|a|r', ['t', 's'], { muetteAChoisir: true, famille_de: 'bavarde', pageMin: 41 });
enc(3, 'ca-nar[d]', 'c|a|n|a|r', ['t', 's'], { muetteAChoisir: true, pageMin: 41 });

// ======================= DOMAINE 2 — PHONOLOGIE (ORAL, SANS ÉCRIT) =======================
// Syllabes ORALES, écrites ici pour la voix (« pa, pi, yon »). Aucun mot terminé par un e muet en P1-P2
// (conflit avec le comptage écrit du Calimot). Rien n'est montré à l'écrit.
const nomSyl = n => ['', 'une seule syllabe', 'deux syllabes', 'trois syllabes', 'quatre syllabes'][n];
function p1(mot, sylOrales) {
  const n = sylOrales.length;
  return ajoute({
    id: `p1_${mot.normalize('NFD').replace(/[̀-ͯ]/g, '')}`, famille: 'pho', niveau: n <= 2 ? 1 : 2,
    competence: 'CP-FR-PHO', type: 'syllabes', mot, sylOrales, attendu: n,
    textes: {
      c: `Écoute : ${mot}. Combien de syllabes entends-tu ?`,
      e: n === 1 ? `${cap(mot)} : on entend une seule syllabe.` : `${cap(mot)} : ${sylOrales.join(', ')}. On entend ${nomSyl(n)}.`
    }
  });
}
for (const [m, s] of [
  ['chat', ['chat']], ['loup', ['loup']], ['train', ['train']], ['nez', ['nez']],
  ['lapin', ['la', 'pin']], ['vélo', ['vé', 'lo']], ['ballon', ['ba', 'lon']], ['panda', ['pan', 'da']],
  ['gâteau', ['gâ', 'teau']], ['mouton', ['mou', 'ton']],
  ['koala', ['ko', 'a', 'la']], ['chocolat', ['cho', 'co', 'lat']], ['papillon', ['pa', 'pi', 'yon']],
  ['kangourou', ['kan', 'gou', 'rou']], ['pyjama', ['py', 'ja', 'ma']], ['toboggan', ['to', 'bo', 'gan']],
  ['ordinateur', ['or', 'di', 'na', 'teur']], ['alligator', ['a', 'li', 'ga', 'tor']],
  ['harmonica', ['ar', 'mo', 'ni', 'ca']], ['caméléon', ['ca', 'mé', 'lé', 'on']]
]) p1(m, s);

// P2 — où est le son ? sylOrales + index (0 = première case) de la syllabe qui contient le son.
const SONS = {
  r: 'le son r, comme dans rat', l: 'le son l, comme dans lit', u: 'le son u, comme dans lune',
  ou: 'le son ou, comme dans loup', ch: 'le son ch, comme dans chat', f: 'le son f, comme dans fée'
};
function p2(mot, sylOrales, cible, son) {
  return ajoute({
    id: `p2_${mot.normalize('NFD').replace(/[̀-ͯ]/g, '')}`, famille: 'pho', niveau: sylOrales.length <= 2 ? 2 : 3,
    competence: 'CP-FR-PHO', type: 'cases', mot, sylOrales, son, attendu: cible,
    textes: {
      c: `Écoute : ${mot}. Touche la syllabe où tu entends ${SONS[son]}.`,
      e: `${cap(mot)} : ${sylOrales.join(', ')}. On entend le son ${son} dans ${sylOrales[cible]}.`
    }
  });
}
p2('souris', ['sou', 'ri'], 1, 'r'); p2('radis', ['ra', 'di'], 0, 'r'); p2('lézard', ['lé', 'zar'], 1, 'r');
p2('macaron', ['ma', 'ca', 'ron'], 2, 'r'); p2('rideau', ['ri', 'deau'], 0, 'r');
p2('lapin', ['la', 'pin'], 0, 'l'); p2('vélo', ['vé', 'lo'], 1, 'l'); p2('chocolat', ['cho', 'co', 'lat'], 2, 'l');
p2('balai', ['ba', 'lai'], 1, 'l');
p2('lutin', ['lu', 'tin'], 0, 'u'); p2('écureuil', ['é', 'cu', 'reuil'], 1, 'u'); p2('salut', ['sa', 'lut'], 1, 'u');
p2('muguet', ['mu', 'guet'], 0, 'u');
p2('hibou', ['hi', 'bou'], 1, 'ou'); p2('caribou', ['ca', 'ri', 'bou'], 2, 'ou'); p2('poulet', ['pou', 'let'], 0, 'ou');
p2('bijou', ['bi', 'jou'], 1, 'ou');
p2('cochon', ['co', 'chon'], 1, 'ch'); p2('artichaut', ['ar', 'ti', 'chaut'], 2, 'ch');
p2('café', ['ca', 'fé'], 1, 'f');

// P3 — trouver l'intrus parmi 3 mots entendus. attendu = index (0, 1, 2).
const SON_COURT = { r: 'le son r', l: 'le son l', u: 'le son u', ou: 'le son ou', ch: 'le son ch', s: 'le son s' };
const SON_LONG = { ...SONS, s: 'le son s, comme dans soupe' };
function p3son(mots, intrus, son, id) {
  const autres = mots.filter((_, i) => i !== intrus);
  return ajoute({
    id: `p3_${id}`, famille: 'pho', niveau: 2, competence: 'CP-FR-PHO', type: 'cases', mots, son, attendu: intrus,
    textes: {
      c: `Écoute bien : ${mots.join(', ')}. Quel mot n'a pas ${SON_LONG[son]} ?`,
      e: `${cap(autres[0])} et ${autres[1]} ont ${SON_COURT[son]}. ${cap(mots[intrus])} ne l'a pas.`
    }
  });
}
function p3rime(mots, intrus, rime, id) {
  const autres = mots.filter((_, i) => i !== intrus);
  return ajoute({
    id: `p3_${id}`, famille: 'pho', niveau: 3, competence: 'CP-FR-PHO', type: 'cases', mots, rime, attendu: intrus,
    textes: {
      c: `Écoute bien : ${mots.join(', ')}. Quel mot ne rime pas avec les autres ?`,
      e: `${cap(autres[0])} et ${autres[1]} finissent pareil : ${rime}. ${cap(mots[intrus])} ne rime pas.`
    }
  });
}
p3son(['tortue', 'mouton', 'hibou'], 0, 'ou', 'ou_tortue');
p3son(['lune', 'loup', 'plume'], 1, 'u', 'u_loup');
p3son(['poule', 'roue', 'jupe'], 2, 'ou', 'ou_jupe');
p3son(['genou', 'tutu', 'musique'], 0, 'u', 'u_genou');
p3son(['bijou', 'statue', 'kangourou'], 1, 'ou', 'ou_statue');
p3son(['voiture', 'mur', 'cou'], 2, 'u', 'u_cou');
p3son(['rat', 'lapin', 'lune'], 0, 'l', 'l_rat');
p3son(['radis', 'lit', 'robot'], 1, 'r', 'r_lit');
p3son(['rose', 'rideau', 'lavabo'], 2, 'r', 'r_lavabo');
p3son(['renard', 'lion', 'lait'], 0, 'l', 'l_renard');
p3son(['chat', 'serpent', 'chien'], 1, 'ch', 'ch_serpent');
p3son(['sac', 'soleil', 'chou'], 2, 's', 's_chou');
p3rime(['gâteau', 'lapin', 'bateau'], 1, 'eau', 'rime_lapin');
p3rime(['souris', 'radis', 'ballon'], 2, 'i', 'rime_ballon');
p3rime(['vélo', 'cochon', 'mouton'], 0, 'on', 'rime_velo');
p3rime(['chapeau', 'tapis', 'râteau'], 1, 'eau', 'rime_tapis');
p3rime(['lapin', 'sapin', 'hibou'], 2, 'in', 'rime_hibou');
p3rime(['chameau', 'pantalon', 'ballon'], 0, 'on', 'rime_chameau');
p3rime(['tortue', 'laitue', 'robot'], 2, 'u', 'rime_robot');
p3rime(['bonbon', 'fourmi', 'crayon'], 1, 'on', 'rime_fourmi');

// ======================= DOMAINE 3 — GRANDEURS ET MESURES =======================
// ---- Monnaie (VERROU : réglage parent « monnaie commencée en classe », désactivé par défaut) ----
const eur = n => n === 1 ? 'un euro' : `${L(n)} euros`;
const somme = a => a.reduce((s, x) => s + x, 0);
const BILLETS = [50, 20, 10, 5], PIECES = [2, 1];

function monVal(billets, pieces) {
  const sb = somme(billets), sp = somme(pieces), t = sb + sp;
  let e = '';
  if (billets.length && pieces.length) e = `Les billets font ${eur(sb)}. Les pièces font ${eur(sp)}. En tout, ${eur(t)}.`;
  else if (billets.length) e = `Les billets font ${eur(sb)} en tout.`;
  else e = `Les pièces font ${eur(sp)} en tout.`;
  return ajoute({
    id: `m_val_${[...billets, ...pieces].join('_')}`, famille: 'mon', niveau: t <= 30 ? 1 : 2, competence: 'CP-M-MON',
    type: 'pave', verrou: 'monnaie', billets, pieces, attendu: t,
    textes: { c: 'm_val_c', e }
  });
}
monVal([10, 10], [1, 1, 1]); monVal([5, 5], [1, 1, 1]); monVal([20, 10], [2, 1, 1]);
monVal([10, 10, 10, 10, 10], [1, 1]); monVal([10, 10, 10, 10, 10, 10], [2, 2]); monVal([50, 20, 5], [2]);

function monCmp(gauche, droite, id) {
  const g = somme(gauche), d = somme(droite);
  const att = g > d ? 'gauche' : g < d ? 'droite' : 'pareil';
  const fin = att === 'pareil' ? "C'est pareil : ils ont autant d'argent."
    : `C'est à ${att} qu'il y a le plus d'argent, même s'il y a ${(att === 'gauche' ? gauche : droite).length < (att === 'gauche' ? droite : gauche).length ? 'moins' : 'autant'} de pièces et de billets.`;
  return ajoute({
    id: `m_cmp_${id}`, famille: 'mon', niveau: 2, competence: 'CP-M-MON', type: 'choixHtml', verrou: 'monnaie',
    gauche, droite, attendu: att,
    textes: { c: 'm_cmp_c', e: `À gauche : ${eur(g)}. À droite : ${eur(d)}. ${fin}` }
  });
}
monCmp([1, 1, 1, 1, 1, 1, 1, 1], [10], 'huit_dix');
monCmp([1, 1, 1, 1, 1, 1], [5, 2], 'six_sept');
monCmp([10], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 'dix_dix');
monCmp([20, 1], [10, 5, 2, 2, 1], 'vingtetun_vingt');

// Payer une somme avec le moins de billets et de pièces. propositions : listes de valeurs ; la première
// est l'optimale (le test vérifie qu'elle est la seule minimale) ; l'ordre d'affichage est figé par rang.
function monMin(total, propositions, rang, sansUn = false) {
  const opt = propositions[0];
  const dit = opt.map(L).join(', plus ');
  return ajoute({
    id: `m_min_${total}${sansUn ? '_sans1' : ''}`, famille: 'mon', niveau: 3, competence: 'CP-M-MON', type: 'choixHtml',
    verrou: 'monnaie', total, propositions, sansUn, rang, attendu: opt.join('+'),
    textes: {
      c: sansUn
        ? `Il faut payer ${eur(total)}, sans pièce de un euro. Quel porte-monnaie utilise le moins de billets et de pièces ?`
        : `Il faut payer ${eur(total)}. Quel porte-monnaie utilise le moins de billets et de pièces ?`,
      e: `${cap(dit)} : ${eur(total)}, avec seulement ${L(opt.length)} billets et pièces.`
    }
  });
}
monMin(15, [[10, 5], [5, 5, 5], [10, 2, 2, 1]], 1);
monMin(34, [[20, 10, 2, 2], [10, 10, 10, 2, 2], [20, 5, 5, 2, 2]], 2);
monMin(48, [[20, 20, 5, 2, 1], [10, 10, 10, 10, 5, 2, 1], [20, 20, 2, 2, 2, 2]], 0);
monMin(56, [[50, 2, 2, 2], [20, 20, 10, 2, 2, 2], [10, 10, 10, 10, 10, 2, 2, 2]], 1, true);
monMin(70, [[50, 20], [20, 20, 20, 10], [50, 10, 10]], 2);

function monRend(objet, prix, paye, n) {
  const r = paye - prix;
  return ajoute({
    id: `m_rend_${prix}_${paye}`, famille: 'mon', niveau: paye <= 20 ? 2 : 3, competence: 'CP-M-MON', type: 'pave',
    verrou: 'monnaie', prix, paye, attendu: r,
    textes: {
      c: `${cap(objet)} coûte ${eur(prix)}. Tu paies avec un billet de ${eur(paye)}. Combien d'euros le marchand te rend-il ?`,
      e: `De ${L(prix)} pour aller à ${L(paye)}, il faut ${L(r)}. Le marchand te rend ${eur(r)}.`
    }
  });
}
monRend('un livre', 7, 10); monRend('un ballon', 8, 10); monRend('un puzzle', 15, 20);
monRend('une peluche de koala', 12, 20); monRend('un jeu', 35, 50);

// ---- Heure (heures entières seulement, BO CP) ----
const heureDite = h => h === 12 ? 'midi' : h === 1 ? 'une heure' : `${L(h)} heures`;
function heuLire(h) {
  return ajoute({
    id: `h_lire_${h}`, famille: 'heu', niveau: 1, competence: 'CP-M-HEU', type: 'pave', heure: h, attendu: h,
    textes: {
      c: 'h_lire_c',
      e: h === 12 ? 'Les deux aiguilles sont sur le douze. Il est midi.'
        : `La petite aiguille montre le ${L(h)}. La grande aiguille est sur le douze. Il est ${heureDite(h)}.`
    }
  });
}
[3, 9, 6, 1, 12].forEach(heuLire);
function heuPlacer(h) {
  return ajoute({
    id: `h_placer_${h}`, famille: 'heu', niveau: 2, competence: 'CP-M-HEU', type: 'horloge', heure: h, attendu: h,
    textes: {
      c: h === 12 ? "À la cantine, on mange à midi. Place la petite aiguille pour qu'il soit midi."
        : `Place la petite aiguille pour qu'il soit ${heureDite(h)}.`,
      e: h === 12 ? 'À midi, les deux aiguilles sont sur le douze.'
        : `À ${heureDite(h)}, la petite aiguille montre le ${L(h)}, et la grande aiguille est sur le douze.`
    }
  });
}
[4, 8, 2, 11, 12].forEach(heuPlacer);

// ---- Longueurs ----
// Ranger des bandes (longueurs en unités d'affichage ; écarts ≥ 1 unité = « aucun doute »).
[[3, 7, 5, 9], [6, 2, 8, 4, 5], [5, 6, 4, 7, 8]].forEach((bandes, i) => ajoute({
  id: `l_ranger_${i + 1}`, famille: 'lon', niveau: i === 2 ? 2 : 1, competence: 'CP-M-LON', type: 'ordre', bandes,
  attendu: [...bandes].sort((a, b) => a - b).join('-'),
  textes: { c: 'l_ranger_c', e: 'l_ranger_e' }
}));
// Mesurer par report d'un étalon (trombones posés bout à bout, dessinés).
[['le crayon', 4], ['le pinceau', 6], ['la ficelle', 7]].forEach(([objet, n]) => ajoute({
  id: `l_etalon_${n}`, famille: 'lon', niveau: 1, competence: 'CP-M-LON', type: 'pave', objet, attendu: n,
  textes: {
    c: `Combien de trombones mesure ${objet} ?`,
    e: `On compte les trombones posés bout à bout : ${L(n)}. ${cap(objet)} mesure ${L(n)} trombones.`
  }
}));
// Lire une règle graduée en centimètres (dessinée ; « centimètres » prononcé en entier).
[[0, 8], [0, 12], [2, 9]].forEach(([de, a]) => ajoute({
  id: `l_regle_${de}_${a}`, famille: 'lon', niveau: de === 0 ? 2 : 3, competence: 'CP-M-LON', type: 'pave', de, a, attendu: a - de,
  textes: {
    c: 'l_regle_c',
    e: de === 0 ? `Le trait part du zéro et s'arrête au ${L(a)}. Il mesure ${L(a)} centimètres.`
      : `Attention, le trait part du ${L(de)}, pas du zéro. De ${L(de)} à ${L(a)}, il y a ${L(a - de)} centimètres.`
  }
}));
// Ordres de grandeur (exemple du BO : la trousse).
ajoute({
  id: 'l_grandeur_trousse', famille: 'lon', niveau: 2, competence: 'CP-M-LON', type: 'choixHtml',
  choix: ['2 cm', '20 cm', '1 m'], attendu: '20 cm',
  textes: {
    c: 'Une trousse mesure-t-elle deux centimètres, vingt centimètres, ou un mètre ?',
    e: "Une trousse mesure à peu près vingt centimètres, comme une règle d'écolier."
  }
});
ajoute({
  id: 'l_grandeur_porte', famille: 'lon', niveau: 2, competence: 'CP-M-LON', type: 'choixHtml',
  choix: ['20 cm', '2 m', '20 m'], attendu: '2 m',
  textes: {
    c: 'Une porte mesure-t-elle vingt centimètres, deux mètres, ou vingt mètres ?',
    e: "Une porte mesure à peu près deux mètres : un peu plus qu'un grand adulte."
  }
});

// ======================= DOMAINE 3 — ESPACE ET GÉOMÉTRIE =======================
// ---- Déplacements (BO CP : avancer d'une case, pivoter d'un quart de tour ; ≤ 10 instructions, ≤ 2 virages) ----
// Grille 5 × 5 ; x de 0 (gauche) à 4, y de 0 (haut) à 4 ; direction : N, E, S, O.
export const GRILLE = 5;
export function simule(depart, prog) {
  let { x, y, dir } = depart;
  const D = ['N', 'E', 'S', 'O'], dx = { N: 0, E: 1, S: 0, O: -1 }, dy = { N: -1, E: 0, S: 1, O: 0 };
  for (const i of prog) {
    if (i === 'A') { x += dx[dir]; y += dy[dir]; if (x < 0 || y < 0 || x >= GRILLE || y >= GRILLE) return null; }
    else if (i === 'D') dir = D[(D.indexOf(dir) + 1) % 4];
    else if (i === 'G') dir = D[(D.indexOf(dir) + 3) % 4];
  }
  return { x, y, dir };
}
// Programme dit : « avance de deux cases, pivote d'un quart de tour à droite, puis avance d'une case ».
export function progDit(prog) {
  const morceaux = [];
  for (let i = 0; i < prog.length;) {
    if (prog[i] === 'A') { let n = 0; while (prog[i] === 'A') { n++; i++; } morceaux.push(n === 1 ? "avance d'une case" : `avance de ${L(n)} cases`); }
    else { morceaux.push(`pivote d'un quart de tour à ${prog[i] === 'D' ? 'droite' : 'gauche'}`); i++; }
  }
  if (morceaux.length === 1) return morceaux[0];
  return morceaux.slice(0, -1).join(', ') + ', puis ' + morceaux[morceaux.length - 1];
}
function depLire(n, depart, prog) {
  const arr = simule(depart, prog);
  return ajoute({
    id: `g_dep_lire_${n}`, famille: 'dep', niveau: Math.min(3, [...prog].filter(i => i !== 'A').length + 1),
    competence: 'CP-G-REP', type: 'grille', depart, prog: prog.split(''), attendu: arr ? `${arr.x},${arr.y}` : null,
    textes: { c: 'g_dep_lire_c', e: `Le koala ${progDit(prog)}. Il arrive sur cette case.` }
  });
}
depLire(1, { x: 0, y: 2, dir: 'E' }, 'AAA');
depLire(2, { x: 2, y: 4, dir: 'N' }, 'AA');
depLire(3, { x: 0, y: 4, dir: 'N' }, 'AADA');
depLire(4, { x: 1, y: 4, dir: 'N' }, 'AGA');
depLire(5, { x: 0, y: 0, dir: 'E' }, 'ADAAGA');
depLire(6, { x: 4, y: 4, dir: 'N' }, 'AAAGAA');
depLire(7, { x: 0, y: 0, dir: 'E' }, 'ADAGAAA');
depLire(8, { x: 0, y: 4, dir: 'N' }, 'AAADAADAA');
// Écrire le programme : toute suite qui amène le koala sur la feuille est juste (vérifiée par simulation),
// dans les limites du BO. solution : une solution donnée dans l'explication.
function depEcrire(n, depart, cible, solution) {
  return ajoute({
    id: `g_dep_ecrire_${n}`, famille: 'dep', niveau: n === 1 ? 2 : 3, competence: 'CP-G-REP', type: 'programme',
    depart, cible, solution: solution.split(''), maxInstructions: 10, maxVirages: 2, attendu: `${cible.x},${cible.y}`,
    textes: { c: 'g_dep_ecrire_c', e: `Une solution : ${progDit(solution)}.` }
  });
}
depEcrire(1, { x: 0, y: 2, dir: 'E' }, { x: 3, y: 2 }, 'AAA');
depEcrire(2, { x: 0, y: 4, dir: 'N' }, { x: 2, y: 2 }, 'AADAA');
depEcrire(3, { x: 0, y: 4, dir: 'E' }, { x: 3, y: 1 }, 'AGAAADAA');
// Positions (vocabulaire du BO : gauche, droite, sur, sous, entre…). Gauche / droite de l'ENFANT.
[
  ['sous', 'Touche le ballon qui est sous la table.', 'Le ballon sous la table, le voici. Les autres sont sur la table ou à côté.'],
  ['entre', 'Touche le ballon qui est entre les deux boîtes.', 'Entre les deux boîtes : il y a une boîte de chaque côté du ballon.'],
  ['gauche', 'Touche le ballon qui est à gauche de la boîte.', "À gauche, c'est du côté de ta main gauche."],
  ['droite', 'Touche le ballon qui est à droite de la boîte.', "À droite, c'est du côté de ta main droite."]
].forEach(([mot, c, e]) => ajoute({
  id: `g_pos_${mot}`, famille: 'dep', niveau: mot === 'sous' || mot === 'entre' ? 1 : 2, competence: 'CP-G-REP', type: 'choixHtml',
  position: mot, attendu: mot, textes: { c, e }
}));

// ---- Formes planes ----
[
  ['triangle', 'Touche le triangle.', 'Le triangle a trois côtés, même quand il a la pointe en bas.'],
  ['carre_penche', 'Touche le carré.', 'Même penché, c\'est un carré : quatre côtés de la même longueur.'],
  ['rectangle', 'Touche le rectangle.', "Le rectangle a quatre côtés : deux longs et deux courts. Le carré, lui, a ses quatre côtés pareils."]
].forEach(([f, c, e]) => ajoute({
  id: `g_fpl_${f}`, famille: 'fpl', niveau: f === 'triangle' ? 1 : 2, competence: 'CP-G-PLA', type: 'choixHtml', forme: f, attendu: f,
  textes: { c, e }
}));
// Pièces d'un assemblage (pièces de couleurs différentes : comptage sans ambiguïté).
[['bateau', 2], ['fusee', 3]].forEach(([dessin, n]) => ajoute({
  id: `g_fpl_compte_${dessin}`, famille: 'fpl', niveau: 2, competence: 'CP-G-PLA', type: 'pave', dessin, attendu: n,
  textes: { c: 'g_fpl_compte_c', e: `On compte les pièces qui ont trois côtés : ${L(n)} triangles.` }
}));
[
  ['triangle', 'cotes', 3, 'Combien de côtés a ce triangle ?', 'Un triangle a trois côtés.'],
  ['rectangle', 'sommets', 4, 'Combien de sommets a ce rectangle ?', 'Un rectangle a quatre sommets : ce sont ses quatre coins.'],
  ['polygone5', 'cotes', 5, 'Combien de côtés a cette forme ?', 'On compte les côtés en faisant le tour : cinq côtés.']
].forEach(([forme, quoi, n, c, e]) => ajoute({
  id: `g_fpl_${quoi}_${forme}`, famille: 'fpl', niveau: 1, competence: 'CP-G-PLA', type: 'pave', forme, attendu: n, textes: { c, e }
}));
// Compléter sur quadrillage (nœuds). rectangle : 2 côtés consécutifs tracés ; carré : 1 côté tracé
// (les deux carrés possibles, de part et d'autre du trait, sont acceptés).
ajoute({
  id: 'g_fpl_completer_rectangle', famille: 'fpl', niveau: 3, competence: 'CP-G-PLA', type: 'grille',
  traces: [[1, 1], [4, 1], [4, 3]], attendu: '1,3',
  textes: { c: 'Termine le rectangle : touche le point où il manque un sommet.', e: 'Un rectangle a quatre sommets. Il manquait celui-ci.' }
});
ajoute({
  id: 'g_fpl_completer_carre', famille: 'fpl', niveau: 3, competence: 'CP-G-PLA', type: 'grille',
  traces: [[1, 2], [3, 2]], attendu: ['1,0|3,0', '1,4|3,4'],
  textes: { c: 'Termine le carré : touche les deux points qui manquent.', e: 'Un carré a quatre côtés de la même longueur. Il manquait ces deux sommets.' }
});

// ---- Solides (au CP, le cube n'est PAS considéré comme un pavé — BO) ----
[
  ['cube', 'Touche le cube.', 'Le cube a six faces, toutes des carrés. La boîte à côté est un pavé : elle a des faces rectangles.'],
  ['pave', 'Touche le pavé.', 'Le pavé a des faces rectangles, comme une boîte à chaussures. Le cube, lui, n\'a que des carrés.'],
  ['cylindre', 'Touche le cylindre.', 'Le cylindre est rond, avec deux faces plates en forme de disque, comme une boîte de conserve.'],
  ['conserve', 'Une boîte de conserve a la forme de quel solide ? Touche-le.', 'Une boîte de conserve a la forme d\'un cylindre.']
].forEach(([s, c, e]) => ajoute({
  id: `g_sol_${s}`, famille: 'sol', niveau: 1, competence: 'CP-G-SOL', type: 'choixHtml', solide: s,
  attendu: s === 'conserve' ? 'cylindre' : s, textes: { c, e }
}));
ajoute({
  id: 'g_sol_faces_cube', famille: 'sol', niveau: 2, competence: 'CP-G-SOL', type: 'pave', attendu: 6,
  textes: { c: 'Combien de faces a un cube ?', e: 'Un cube a six faces : une dessus, une dessous, et quatre autour.' }
});

// ======================= CONSIGNES ET EXPLICATIONS PARTAGÉES =======================
export const PHRASES_PARTAGEES_V05 = {
  m_val_c: "Combien d'euros en tout ? Tape le nombre.",
  m_cmp_c: "Qui a le plus d'argent ? Touche le porte-monnaie qui a le plus, ou le signe égal s'ils ont pareil.",
  h_lire_c: 'Quelle heure est-il ? Tape le nombre.',
  l_ranger_c: 'Range les bandes de la plus courte à la plus longue, puis touche le bouton vert.',
  l_ranger_e: "Pour comparer, on regarde où chaque bande s'arrête. La plus courte d'abord, la plus longue à la fin.",
  l_regle_c: 'Combien de centimètres mesure le trait ? Tape le nombre.',
  g_dep_lire_c: 'Le koala suit le programme. Touche la case où il arrive.',
  g_dep_ecrire_c: 'Construis le programme pour que le koala arrive sur la feuille, puis touche le bouton vert.',
  g_fpl_compte_c: 'Ce dessin est fait de pièces de couleur. Combien de pièces sont des triangles ? Tape le nombre.'
};

export const BANQUE_V05 = B;

// Toutes les phrases à enregistrer : id_c / id_e pour chaque item (sauf textes partagés, référencés par
// leur identifiant), plus les phrases partagées.
export function phrasesV05() {
  const P = { ...PHRASES_PARTAGEES_V05 };
  for (const it of B) {
    for (const k of ['c', 'e']) {
      const t = it.textes[k];
      if (t in PHRASES_PARTAGEES_V05) continue;
      P[`${it.id}_${k}`] = t;
    }
  }
  return P;
}
