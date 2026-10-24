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
  livre: '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M3 5.5C5.5 4.5 8.5 4.5 12 6.5c3.5-2 6.5-2 9-1V19c-2.5-1-5.5-1-9 1-3.5-2-6.5-2-9-1z" fill="#fff" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 6.5V20" stroke="currentColor" stroke-width="1.8"/></svg>',
  maison: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="currentColor"/></svg>',
  crayon: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 20l1-4L16 5l3 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/></svg>',
  doigt: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l5 1.2c1 .3 1.6 1.2 1.4 2.2L17.6 19a2 2 0 0 1-2 1.6H11a2 2 0 0 1-1.6-.8L6 15.5a1.4 1.4 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
};

// Réponse au TOUCHER, robuste aux frôlements (11/10, erreurs de toucher signalées par Simon en L3).
// Un clic n'est accepté que si le doigt s'est posé SUR ce bouton (pointerdown), n'a presque pas bougé
// (≤ GLISSE_MAX px) et s'est relevé à l'intérieur du bouton. Un doigt qui glisse d'un bouton à l'autre
// n'envoie donc rien. Les clics sans pointeur (clavier, lecteur d'écran : detail = 0) restent acceptés.
export const GLISSE_MAX = 12;
export function surToucher(el, action) {
  let depart = null;
  el.addEventListener('pointerdown', e => { depart = { x: e.clientX, y: e.clientY }; });
  el.addEventListener('pointercancel', () => { depart = null; });
  el.onclick = e => {
    if (e.detail !== 0) {
      const d = depart; depart = null;
      if (!d) return;                                                     // doigt posé ailleurs
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > GLISSE_MAX) return; // doigt qui a glissé
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return; // relevé hors du bouton
    }
    action(e);
  };
}

export const attendre = ms => new Promise(r => setTimeout(r, ms));
