// Statut de chaque compétence pour un enfant (module pur, testé par tests/test_suivi.mjs).
//
//  ACQUIS (critère de Simon, session 3) : au moins 5 réussites du 1er coup sur les 6 dernières
//    observations, réparties sur au moins 3 passations (test ou séances).
//  NON ACQUIS : au moins 3 observations, et moins de la moitié des dernières (6 au plus) réussies
//    du 1er coup. [Seuil proposé par Claude, à valider par Simon.]
//  EN COURS D'ACQUISITION : observée, ni acquise ni non acquise.
//  PAS ENCORE ÉVALUÉE : travaillée dans l'appli mais jamais observée pour cet enfant.
//  NON TRAVAILLÉE DANS L'APPLI : aucun item ne la vise (on ne peut rien en dire).
// « Ne sait pas », réussite au 2e essai et non acquis comptent comme non réussis du 1er coup.
import { COMPETENCES, ITEM_COMPETENCE, TRAVAILLEES } from './referentiel.js';

export const CRITERE = { fenetre: 6, reussis: 5, passations: 3, minNonAcquis: 3 };

export const LIBELLES_STATUT = {
  'acquis': 'Acquis',
  'en-cours': 'En cours d\'acquisition',
  'non-acquis': 'Non acquis',
  'non-evaluee': 'Pas encore évaluée',
  'non-travaillee': 'Non travaillée dans l\'appli'
};

export function observations(passations) {
  const obs = [];
  for (const p of passations || []) {
    const date = p.fin || p.debut;
    (p.items || []).forEach((r, rang) => {
      const code = ITEM_COMPETENCE[r.itemId];
      if (!code || !r.classement || r.classement === 'non-passe' || r.classement === 'en-cours') return;
      obs.push({ code, itemId: r.itemId, passationId: p.id, date, rang, premier: r.classement === 'reussi-1er' });
    });
  }
  return obs.sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.rang - b.rang);
}

export function etatCompetence(obsCode, travaillee = true) {
  const fen = obsCode.slice(-CRITERE.fenetre);
  const reussis = fen.filter(o => o.premier).length;
  const nbPass = new Set(fen.map(o => o.passationId)).size;
  let statut;
  if (!obsCode.length) statut = travaillee ? 'non-evaluee' : 'non-travaillee';
  else if (fen.length >= CRITERE.fenetre && reussis >= CRITERE.reussis && nbPass >= CRITERE.passations) statut = 'acquis';
  else if (fen.length >= CRITERE.minNonAcquis && reussis * 2 < fen.length) statut = 'non-acquis';
  else statut = 'en-cours';
  return { statut, observations: obsCode.length, fenetre: fen.length, reussis, passations: nbPass };
}

export function dateAcquisition(obsCode) {
  for (let i = 0; i < obsCode.length; i++) {
    if (etatCompetence(obsCode.slice(0, i + 1)).statut === 'acquis') return obsCode[i].date;
  }
  return null;
}

// Attendu au CP à la période courante (seulement pour les compétences datées par le programme).
export function attenduMaintenant(c, periodeCourante) {
  return c.classe === 'CP' && c.periode != null && periodeCourante >= c.periode;
}

export function bilan(passations) {
  const obs = observations(passations);
  return COMPETENCES.map(c => {
    const oc = obs.filter(o => o.code === c.code);
    return { ...c, ...etatCompetence(oc, TRAVAILLEES.has(c.code)), dateAcquisition: dateAcquisition(oc) };
  });
}

// Évolution : après chaque passation, nombre de compétences par statut.
export function evolution(passations) {
  const triees = [...(passations || [])].sort((a, b) => (a.fin || a.debut || '').localeCompare(b.fin || b.debut || ''));
  return triees.map((p, i) => {
    const b = bilan(triees.slice(0, i + 1));
    const n = s => b.filter(x => x.statut === s).length;
    const ess = b.filter(x => x.essentielle);
    return { date: p.fin || p.debut, passationId: p.id, acquis: n('acquis'), enCours: n('en-cours'), nonAcquis: n('non-acquis'),
      essentiellesAcquises: ess.filter(x => x.statut === 'acquis').length };
  });
}
