// Séances d'entraînement : configuration du moteur générique (deroule.js) + enchaînement.
// Un profil suit UN parcours (C ou N), choisi dans l'espace parent (profil.parcours).
// Les séances s'enchaînent dans l'ordre (C1 → C5, N1 → N8) ; une séance en pause est reprise.
import { PARCOURS, VERSION_SEANCES } from './parcours.js';
import { PARCOURS_LECTURE } from '../lecture/lecture.js';
import { classerSeance, syntheseSeance } from './ne_sait_pas.js';
import { lancerDeroule } from '../deroule.js';
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
    const s = parcours.seances.find(x => x.id === ouverte.seanceId);
    if (s) return { parcours, seance: s, passation: ouverte };
  }
  const faites = new Set(seancesTerminees(profil.id, parcours.code).map(p => p.seanceId));
  const s = parcours.seances.find(x => !faites.has(x.id));
  return s ? { parcours, seance: s, passation: null } : null;
}

export function configSeance(parcours, seance) {
  return {
    type: 'seance',
    items: seance.items,
    champs: { parcours: parcours.code, seanceId: seance.id, versionSeances: VERSION_SEANCES },
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
