// Petites aides d'interface partagées.
export const racine = () => document.getElementById('app');

export function afficher(html, classe = '') {
  const r = racine();
  r.className = classe;
  r.innerHTML = html;
  r.scrollTop = 0;
  window.scrollTo(0, 0);
  return r;
}

export const $ = (sel, base = document) => base.querySelector(sel);
export const $$ = (sel, base = document) => Array.from(base.querySelectorAll(sel));

// Échappe un texte saisi (prénom) avant insertion dans le HTML.
export function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Icônes simples (SVG inline, aucune dépendance).
export const ICONES = {
  oreille: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M11 10a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
  valider: '<svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  effacer: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10l4 4M16 10l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  suivant: '<svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cadenas: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  maison: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="currentColor"/></svg>'
};

export const attendre = ms => new Promise(r => setTimeout(r, ms));
