// Séances d'entraînement : configuration du moteur générique (deroule.js) + enchaînement.
// Un profil suit UN parcours (C ou N), choisi dans l'espace parent (profil.parcours).
// Les séances s'enchaînent dans l'ordre (C1 → C5, N1 → N8) ; une séance en pause est reprise.
import { PARCOURS, VERSION_SEANCES } from './parcours.js';
import { PARCOURS_LECTURE, reglerPage, seanceDisponible, PAGE_PAR_DEFAUT } from '../lecture/lecture.js';
import { classerSeance, syntheseSeance } from './ne_sait_pas.js';
import { lancerDeroule } from '../deroule.js';
import { composerSeance, itemsDepuisIds } from './melange.js';
import { VERSION_BANQUE } from './banque.js';
import * as S from '../stockage.js';

// Le jeu des mots (lecture, code L) est commun à tous les profils et se joue au choix, à côté des maths.
export const getParcours = code => PARCOURS[code] || (code === 'L' ? PARCOURS_LECTURE : null);

// code : parcours concerné (maths C / N, ou lecture L). Sans code : toutes les séances (compatibilité).
export function seanceOuverte(profilId, code) {
  return S.getPassations(profilId, 'seance').find(p => p.statut !== 'termine' && (!code || p.parcours === code)) || null;
}

export function seancesTerminees(profilId, code) {
  return S.getPassations(profilId, 'seance').filter(p => p.statut === 'termine' && (!code || p.parcours === code));
}

// Prochaine séance à jouer pour ce profil : celle en pause, sinon la première non terminée.
// null si pas de parcours, ou parcours fini.
export function prochaineSeance(profil, code = profil.parcours) {
  const parcours = getParcours(code);
  if (!parcours) return null;
  const ouverte = seanceOuverte(profil.id, parcours.code);
  if (ouverte) {
    const s = parcours.seances.find(x => x.id === ouverte.seanceId) || seanceMelangeeDe(ouverte);
    if (s) return { parcours, seance: s, passation: ouverte };
  }
  const faites = new Set(seancesTerminees(profil.id, parcours.code).map(p => p.seanceId));
  // Lecture : seulement les séances déchiffrables à la page du Calimot réglée par le parent.
  const permise = parcours.code === 'L' ? (reglerPage(pageCalimot()), x => seanceDisponible(x)) : () => true;
  const s = parcours.seances.find(x => !faites.has(x.id) && permise(x));
  if (s) return { parcours, seance: s, passation: null };
  // Maths : parcours fixe terminé → séances mélangées de la banque (S2.0), sans fin.
  if (parcours.code !== 'L') return { parcours, seance: nouvelleSeanceMelangee(profil, parcours.code), passation: null };
  return null;
}

// ---------- Séances mélangées (banque d'exercices, S2.0) ----------
export const estMelangee = seanceId => /^M\d+$/.test(seanceId || '');
export const OBJECTIF_MELANGE = 'Séance mélangée : exercices choisis selon le Suivi (compétences en cours d\'abord, quelques révisions)';

// Passations de maths du profil (toutes : test, séances fixes et mélangées), base du Suivi.
function passationsMaths(profilId) {
  return S.getPassations(profilId).filter(p => (p.items || []).length && p.parcours !== 'L');
}

function nouvelleSeanceMelangee(profil, code) {
  const deja = S.getPassations(profil.id, 'seance').filter(p => p.parcours === code && estMelangee(p.seanceId));
  const numero = deja.length + 1;
  const ps = passationsMaths(profil.id);
  // Graine : stable tant que l'historique ne change pas (l'accueil peut recalculer sans changer la séance).
  const ids = composerSeance(ps, { date: new Date(), graine: numero * 7919 + ps.length });
  return { id: 'M' + numero, objectif: OBJECTIF_MELANGE, items: itemsDepuisIds(ids), itemsChoisis: ids, melangee: true };
}

// Séance mélangée en pause : on rejoue exactement les items enregistrés dans la passation.
export function seanceMelangeeDe(pass) {
  if (!estMelangee(pass.seanceId) || !Array.isArray(pass.itemsChoisis)) return null;
  return { id: pass.seanceId, objectif: OBJECTIF_MELANGE, items: itemsDepuisIds(pass.itemsChoisis), itemsChoisis: pass.itemsChoisis, melangee: true };
}

// Page du manuel de lecture atteinte par la classe (réglage commun, espace parent).
export function pageCalimot() {
  const v = S.getReglages().pageCalimot;
  return Number.isFinite(v) ? v : PAGE_PAR_DEFAUT;
}

export function configSeance(parcours, seance) {
  return {
    type: 'seance',
    items: seance.items,
    champs: seance.melangee
      ? { parcours: parcours.code, seanceId: seance.id, versionSeances: VERSION_SEANCES, versionBanque: VERSION_BANQUE, itemsChoisis: seance.itemsChoisis }
      : { parcours: parcours.code, seanceId: seance.id, versionSeances: VERSION_SEANCES },
    classer: classerSeance,
    synthese: syntheseSeance,
    phrases: parcours.code === 'L'
      ? { intro: 'lecture_intro', reprise: 'test_reprise', pause: 'test_pause', fin: 'lecture_fin' }
      : { intro: 'seance_intro', reprise: 'test_reprise', pause: 'test_pause', fin: 'seance_fin' },
    neSaisPas: true
  };
}

export function lancerSeance(profil, onQuitter, code = profil.parcours) {
  const p = prochaineSeance(profil, code);
  if (!p) return onQuitter && onQuitter();
  return lancerDeroule(configSeance(p.parcours, p.seance), profil, p.passation, onQuitter);
}
