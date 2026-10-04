// Option « Je ne sais pas » des SÉANCES (pas du test de départ : décision de Simon, session 3).
// L'enfant peut dire qu'il ne comprend pas au lieu de répondre faux deux fois.
// Module pur (pas de DOM) : utilisé par le moteur de séance (J2), testé sous Node.
//
// Mécanique (décidée par Simon) :
//  - le bouton apparaît À LA FIN de la consigne orale (pas pendant : évite le réflexe « je zappe ») ;
//  - il reste disponible avant le 1er essai et après un 1er essai faux ;
//  - un appui = aide visuelle + explication orale tout de suite (comme après 2 erreurs),
//    sans reproche (règle B5), puis item suivant ;
//  - classement distinct de « non acquis » : l'enfant a su repérer qu'il ne savait pas.

// Point d'interrogation dans une bulle : compréhensible sans savoir lire.
export const ICONE_NE_SAIS_PAS = `<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
  <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="4"/>
  <path d="M17.5 18a6.5 6.5 0 1 1 9.6 5.7c-2 1.1-3.1 2.4-3.1 4.6v1.2" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"/>
  <circle cx="24" cy="36" r="2.8" fill="currentColor"/></svg>`;

export const boutonNeSaisPas = () =>
  `<button class="btn-rond btn-ne-sais-pas" id="neSaisPas" aria-label="Je ne sais pas">${ICONE_NE_SAIS_PAS}</button>`;

// Peut-on afficher le bouton ? consigneFinie : la consigne a été entendue en entier au moins une fois.
export function boutonDisponible({ consigneFinie, essais, termine }) {
  return !!consigneFinie && !termine && (essais || []).length < 2 && !(essais || []).some(e => e.juste);
}

// Classement d'un item de séance.
// essais : [{ juste, ... }] ; neSaitPas : null ou { apresEssais, tempsMs }
export function classerSeance(essais, neSaitPas) {
  essais = essais || [];
  if (essais.length && essais[0].juste) return 'reussi-1er';
  if (essais.length >= 2 && essais[1].juste) return 'reussi-2e';
  if (neSaitPas) return essais.length === 0 ? 'ne-sait-pas' : 'ne-sait-pas-apres-erreur';
  if (essais.length >= 2) return 'non-acquis';
  return essais.length === 0 ? 'non-passe' : 'en-cours';
}

export const LIBELLES_SEANCE = {
  'reussi-1er': 'Réussi du 1er coup',
  'reussi-2e': 'Réussi au 2e essai (précipitation probable)',
  'ne-sait-pas': 'A dit « je ne sais pas » (sans essayer)',
  'ne-sait-pas-apres-erreur': 'A dit « je ne sais pas » après une erreur',
  'non-acquis': 'Non acquis (raté 2 fois)',
  'non-passe': 'Non passé',
  'en-cours': 'En cours'
};

export function syntheseSeance(resultats) {
  const s = Object.fromEntries(Object.keys(LIBELLES_SEANCE).map(k => [k, 0]));
  for (const r of resultats || []) s[r.classement in s ? r.classement : 'non-passe']++;
  return s;
}

// Phrases audio à ajouter à phrases.js (nombres en lettres, aucune lecture exigée).
export const PHRASES_NE_SAIS_PAS = {
  seance_intro: "C'est parti pour le jeu du jour. Écoute bien chaque question, et prends ton temps. Si tu ne comprends pas, touche le point d'interrogation : je t'explique.",
  ne_sait_pas: "D'accord. Tu as bien fait de le dire. Regarde, je t'explique."
};
