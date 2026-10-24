// Note du parent sur une passation (demande de Simon du 11/10/2026). Module pur (sans DOM), testé par
// tests/test_note_parent.mjs.
//
// Pourquoi : l'appli ne voit que les réponses. Exemple de Simon : en L3, Ambre a fait 2 erreurs en
// frôlant le mauvais mot alors qu'elle avait la bonne réponse. Une erreur de toucher n'est pas une
// erreur de raisonnement : le parent peut la signaler, et elle ne compte plus.
//
// Données dans la passation (SCHEMA_VERSION 2, champs facultatifs) :
//   commentaireParent : null | { texte, date }
//   annotations       : { idItem: { toucher: true/false, note: "…" } }
// Effet : un exercice marqué « toucher » est RETIRÉ des observations du Suivi (maitrise.js) et de
// l'historique du sélecteur des séances mélangées (melange.js). Il n'est pas compté comme réussi : il ne
// compte pas. La réponse saisie reste dans la passation (on peut décocher la case).

// L'exercice itemId de cette passation est-il marqué « erreur de toucher » ?
export function estErreurToucher(pass, itemId) {
  const a = pass && pass.annotations && pass.annotations[itemId];
  return !!(a && a.toucher === true);
}

// Exercices ratés au 1er essai (seuls ceux-là peuvent être une erreur de toucher).
export function itemsRatesPremierEssai(pass) {
  return ((pass && pass.items) || []).filter(r => Array.isArray(r.essais) && r.essais[0] && r.essais[0].juste === false);
}

// Annotations propres : seulement des exercices ratés au 1er essai de la passation, et seulement
// celles qui disent quelque chose (case cochée ou note non vide).
export function nettoyerAnnotations(pass, brutes) {
  const permis = new Set(itemsRatesPremierEssai(pass).map(r => r.itemId));
  const res = {};
  for (const [id, a] of Object.entries(brutes || {})) {
    if (!permis.has(id) || !a) continue;
    const toucher = a.toucher === true;
    const note = String(a.note || '').trim().slice(0, 200);
    if (toucher || note) res[id] = { toucher, note };
  }
  return res;
}

// Commentaire propre : null si vide.
export function nettoyerCommentaire(texte, date = new Date()) {
  const t = String(texte || '').trim().slice(0, 1000);
  return t ? { texte: t, date: date.toISOString() } : null;
}

export const nbErreursToucher = pass => Object.values((pass && pass.annotations) || {}).filter(a => a && a.toucher === true).length;
