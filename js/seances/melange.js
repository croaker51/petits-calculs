// Séances MÉLANGÉES (S2.0, décision de Simon du 10/10/2026) : 15 items piochés dans la banque
// commune (banque.js) selon le Suivi de l'enfant. Module pur (sans DOM), testé par tests/test_melange.mjs.
//
// Règles (proposées par Claude, validées par Simon le 10/10) :
//  - Niveau ouvert par famille : le niveau 1 est toujours ouvert ; le niveau suivant s'ouvre quand le
//    niveau courant est MAÎTRISÉ (au moins 5 réussites du 1er coup sur les 6 dernières observations
//    des items de ce niveau, règle B6). Raccourci : si les compétences du niveau 1 sont déjà solides
//    dans le Suivi (statut « acquis », ou au moins 4 observations dont 80 % réussies du 1er coup),
//    le niveau 2 est ouvert d'emblée. Le niveau 3 exige toujours la maîtrise du niveau 2.
//  - 12 items « travail » au niveau ouvert de chaque famille, tirés au sort avec un poids selon le
//    statut de la compétence (non acquise > en cours, pas encore évaluée > acquise ; essentielle ★ ×1,5 ;
//    item manqué la dernière fois ×2) ; 3 items « révision » aux niveaux déjà franchis.
//    Au moins un problème par séance, jamais en premier.
//  - Au plus 3 items de la même famille par séance ; deux items de la même famille ne se suivent pas
//    (sauf impossibilité).
//  - Un item n'est pas reproposé avant 14 jours ; si la banque ne suffit plus, le plus anciennement vu.
//  - Tirage déterministe (graine) : même historique → même séance.
import { BANQUE, BANQUE_PAR_ID, FAMILLES } from './banque.js';
import { bilan } from '../suivi/maitrise.js';
import { estErreurToucher } from '../suivi/annotations.js';

export const TAILLE = 15, NB_REVISION = 3, MAX_PAR_FAMILLE = 3, DELAI_JOURS = 14;
const POIDS_STATUT = { 'non-acquis': 4, 'en-cours': 3, 'non-evaluee': 3, 'non-travaillee': 3, 'acquis': 1 };
const JOUR = 86400000;

// Générateur pseudo-aléatoire reproductible (mulberry32).
export function aleatoire(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Observations des items de la banque : { itemId: [{ date, premier }] } (ordre chronologique).
export function historiqueBanque(passations) {
  const h = {};
  const triees = [...(passations || [])].sort((a, b) => (a.fin || a.debut || '').localeCompare(b.fin || b.debut || ''));
  for (const p of triees) for (const r of p.items || []) {
    if (!BANQUE_PAR_ID[r.itemId] || !r.classement || r.classement === 'en-cours' || r.classement === 'non-passe') continue;
    if (estErreurToucher(p, r.itemId)) continue; // erreur de toucher (parent) : ni maîtrise, ni « manqué la dernière fois »
    (h[r.itemId] = h[r.itemId] || []).push({ date: p.fin || p.debut, premier: r.classement === 'reussi-1er' });
  }
  return h;
}

export function etatsCompetences(passations) {
  return Object.fromEntries(bilan(passations).map(c => [c.code, c]));
}

// Niveau maîtrisé : ≥ 5 réussites du 1er coup sur les 6 dernières observations (famille, niveau).
function maitrise(famille, niveau, hist) {
  const obs = BANQUE.filter(i => i.famille === famille && i.niveau === niveau)
    .flatMap(i => hist[i.id] || [])
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(-6);
  return obs.length >= 6 && obs.filter(o => o.premier).length >= 5;
}

// Compétence « solide » d'après le Suivi.
function solide(etat) {
  if (!etat) return false;
  return etat.statut === 'acquis' || (etat.fenetre >= 4 && etat.reussis / etat.fenetre >= 0.8);
}

// Niveau ouvert de chaque famille.
export function niveauxOuverts(passations, hist = historiqueBanque(passations), etats = etatsCompetences(passations)) {
  const ouverts = {};
  for (const f of Object.keys(FAMILLES)) {
    let n = 1;
    for (let k = 1; k < 3; k++) {
      if (!BANQUE.some(i => i.famille === f && i.niveau === k + 1)) break;
      const items = BANQUE.filter(i => i.famille === f && i.niveau === k);
      const franchi = !items.length || maitrise(f, k, hist) || (k === 1 && items.every(i => solide(etats[i.competence])));
      if (!franchi) break;
      n = k + 1;
    }
    ouverts[f] = n;
  }
  return ouverts;
}

// Compose une séance : renvoie la liste ordonnée des identifiants d'items.
export function composerSeance(passations, { date = new Date(), graine = 1 } = {}) {
  const hasard = aleatoire(graine);
  const hist = historiqueBanque(passations);
  const etats = etatsCompetences(passations);
  const ouverts = niveauxOuverts(passations, hist, etats);
  const maintenant = date.getTime();
  const dernierVu = id => { const o = hist[id]; return o && o.length ? new Date(o[o.length - 1].date).getTime() : null; };
  const recent = id => { const t = dernierVu(id); return t !== null && maintenant - t < DELAI_JOURS * JOUR; };
  const poids = it => {
    const e = etats[it.competence], o = hist[it.id];
    const rate = o && o.length && !o[o.length - 1].premier ? 2 : 1; // manqué la dernière fois : à revoir
    return (POIDS_STATUT[e ? e.statut : 'non-evaluee'] || 3) * (e && e.essentielle ? 1.5 : 1) * (o ? 1 : 1.2) * rate;
  };

  const choisis = [], parFamille = {};
  const peutPrendre = it => !choisis.includes(it) && (parFamille[it.famille] || 0) < MAX_PAR_FAMILLE;
  const prendre = it => { choisis.push(it); parFamille[it.famille] = (parFamille[it.famille] || 0) + 1; };
  // Tirage pondéré parmi les items « frais » (pas vus depuis 14 jours) ; accepteRecent : à défaut,
  // le plus anciennement vu.
  function tirer(reserve, accepteRecent = false) {
    const dispo = reserve.filter(peutPrendre);
    if (!dispo.length) return null;
    const frais = dispo.filter(i => !recent(i.id));
    if (!frais.length) return accepteRecent ? dispo.sort((a, b) => (dernierVu(a.id) || 0) - (dernierVu(b.id) || 0))[0] : null;
    const total = frais.reduce((s, i) => s + poids(i), 0);
    let x = hasard() * total;
    for (const i of frais) { x -= poids(i); if (x <= 0) return i; }
    return frais[frais.length - 1];
  }

  const travail = BANQUE.filter(i => i.niveau === ouverts[i.famille]);
  const revision = BANQUE.filter(i => i.niveau < ouverts[i.famille]);
  const deja = BANQUE.filter(i => i.niveau <= ouverts[i.famille]);
  // 1. Au moins un problème (modéliser un problème ★).
  const pbs = deja.filter(i => i.famille === 'bpb');
  const pb = tirer(travail.filter(i => i.famille === 'bpb')) || tirer(pbs) || tirer(pbs, true);
  if (pb) prendre(pb);
  // 2. Révisions.
  for (let k = 0; k < NB_REVISION; k++) { const it = tirer(revision); if (it) prendre(it); }
  // 3. Travail jusqu'à 15 ; réserve épuisée : révisions, puis items vus récemment (le plus ancien).
  while (choisis.length < TAILLE) {
    const it = tirer(travail) || tirer(revision) || tirer(travail, true) || tirer(deja, true) || tirer(BANQUE, true);
    if (!it) break;
    prendre(it);
  }
  return ordonner(choisis, hasard, ouverts).map(i => i.id);
}

// Ordre : un item facile d'abord (niveau le plus bas par rapport au niveau ouvert, pas un problème),
// puis à chaque pas la famille qui a le plus d'items restants, différente de la précédente.
function ordonner(items, hasard, ouverts) {
  const reste = [...items];
  for (let i = reste.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [reste[i], reste[j]] = [reste[j], reste[i]]; }
  const ecart = i => i.niveau - (ouverts[i.famille] || 1);
  const facile = reste.filter(i => i.famille !== 'bpb').sort((a, b) => ecart(a) - ecart(b))[0];
  const res = [];
  if (facile) res.push(reste.splice(reste.indexOf(facile), 1)[0]);
  while (reste.length) {
    const derniere = res.length ? res[res.length - 1].famille : null;
    const restants = f => reste.filter(i => i.famille === f).length;
    const candidats = reste.filter(i => i.famille !== derniere);
    const pool = candidats.length ? candidats : reste;
    const max = Math.max(...pool.map(i => restants(i.famille)));
    res.push(reste.splice(reste.indexOf(pool.find(i => restants(i.famille) === max)), 1)[0]);
  }
  return res;
}

// Items d'une séance mélangée à partir des identifiants enregistrés dans la passation.
export const itemsDepuisIds = ids => (ids || []).map(id => BANQUE_PAR_ID[id]).filter(Boolean);
