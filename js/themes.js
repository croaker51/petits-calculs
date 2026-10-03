// Dessins originaux (SVG) des thèmes et objets. Aucun personnage protégé.
// Chaque fonction renvoie une chaîne SVG ; taille en px.

const D = {
  koala: `
    <circle cx="22" cy="30" r="17" fill="#8e9aa6"/><circle cx="22" cy="30" r="9" fill="#f2c6cf"/>
    <circle cx="78" cy="30" r="17" fill="#8e9aa6"/><circle cx="78" cy="30" r="9" fill="#f2c6cf"/>
    <ellipse cx="50" cy="55" rx="34" ry="32" fill="#a7b2bd"/>
    <ellipse cx="50" cy="68" rx="20" ry="14" fill="#c9d1d8"/>
    <circle cx="37" cy="50" r="4.5" fill="#2b2b2b"/><circle cx="63" cy="50" r="4.5" fill="#2b2b2b"/>
    <circle cx="38.5" cy="48.5" r="1.4" fill="#fff"/><circle cx="64.5" cy="48.5" r="1.4" fill="#fff"/>
    <ellipse cx="50" cy="61" rx="8" ry="11" fill="#3a3a3a"/>
    <path d="M44 76 Q50 81 56 76" stroke="#3a3a3a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  panda: `
    <circle cx="24" cy="26" r="13" fill="#222"/><circle cx="76" cy="26" r="13" fill="#222"/>
    <ellipse cx="50" cy="55" rx="35" ry="32" fill="#fff" stroke="#222" stroke-width="2"/>
    <ellipse cx="36" cy="52" rx="9" ry="11" fill="#222" transform="rotate(-20 36 52)"/>
    <ellipse cx="64" cy="52" rx="9" ry="11" fill="#222" transform="rotate(20 64 52)"/>
    <circle cx="37" cy="51" r="3.5" fill="#fff"/><circle cx="63" cy="51" r="3.5" fill="#fff"/>
    <ellipse cx="50" cy="66" rx="6" ry="4.5" fill="#222"/>
    <path d="M44 74 Q50 79 56 74" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="28" cy="66" r="5" fill="#f7c6d0" opacity=".7"/><circle cx="72" cy="66" r="5" fill="#f7c6d0" opacity=".7"/>`,
  licorne: `
    <path d="M50 4 L57 34 L43 34 Z" fill="#f6c945" stroke="#d9a520" stroke-width="1.5"/>
    <path d="M45 15 L55 19 M44 23 L56 27" stroke="#d9a520" stroke-width="1.5"/>
    <path d="M26 30 Q14 50 22 74 Q30 60 30 44 Z" fill="#c79bf2"/>
    <path d="M30 26 Q18 40 24 58 Q34 44 36 32 Z" fill="#f59ac2"/>
    <ellipse cx="54" cy="58" rx="28" ry="30" fill="#fff" stroke="#c9b8e8" stroke-width="2"/>
    <path d="M30 30 L24 16 L38 26 Z" fill="#fff" stroke="#c9b8e8" stroke-width="2"/>
    <circle cx="46" cy="54" r="4" fill="#3a2d4f"/><circle cx="66" cy="54" r="4" fill="#3a2d4f"/>
    <circle cx="47" cy="52.5" r="1.3" fill="#fff"/><circle cx="67" cy="52.5" r="1.3" fill="#fff"/>
    <ellipse cx="56" cy="74" rx="12" ry="8" fill="#fbe3ee"/>
    <circle cx="52" cy="73" r="1.6" fill="#c48aa6"/><circle cx="60" cy="73" r="1.6" fill="#c48aa6"/>`,
  chiot: `
    <ellipse cx="20" cy="46" rx="11" ry="22" fill="#8a5a33" transform="rotate(15 20 46)"/>
    <ellipse cx="80" cy="46" rx="11" ry="22" fill="#8a5a33" transform="rotate(-15 80 46)"/>
    <ellipse cx="50" cy="52" rx="30" ry="32" fill="#d9a066"/>
    <ellipse cx="50" cy="68" rx="16" ry="12" fill="#f3d6b3"/>
    <circle cx="39" cy="48" r="4.5" fill="#2b2b2b"/><circle cx="61" cy="48" r="4.5" fill="#2b2b2b"/>
    <circle cx="40.5" cy="46.5" r="1.4" fill="#fff"/><circle cx="62.5" cy="46.5" r="1.4" fill="#fff"/>
    <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#2b2b2b"/>
    <path d="M50 66 L50 71 M44 72 Q50 77 56 72" stroke="#2b2b2b" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  couronne: `
    <path d="M14 70 L18 30 L36 50 L50 22 L64 50 L82 30 L86 70 Z" fill="#f6c945" stroke="#d9a520" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="14" y="70" width="72" height="12" rx="3" fill="#f0b92c" stroke="#d9a520" stroke-width="2"/>
    <circle cx="50" cy="60" r="6" fill="#e85a9a"/><circle cx="30" cy="62" r="4.5" fill="#7cc3f0"/><circle cx="70" cy="62" r="4.5" fill="#7cc3f0"/>
    <circle cx="18" cy="28" r="4" fill="#fff6c8"/><circle cx="50" cy="20" r="4" fill="#fff6c8"/><circle cx="82" cy="28" r="4" fill="#fff6c8"/>`,
  chevalier: `
    <path d="M50 8 L84 20 L80 56 Q74 80 50 92 Q26 80 20 56 L16 20 Z" fill="#9fb3c8" stroke="#5d7389" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 16 L76 26 L73 55 Q68 74 50 84 Z" fill="#3d6fb6"/>
    <path d="M50 16 L24 26 L27 55 Q32 74 50 84 Z" fill="#e0e7ef"/>
    <path d="M50 30 L50 72 M36 46 L64 46" stroke="#f6c945" stroke-width="6" stroke-linecap="round"/>`,
  heros: `
    <path d="M20 60 Q50 98 80 60 L74 36 L26 36 Z" fill="#e2463f"/>
    <path d="M8 40 Q50 18 92 40 Q86 58 64 56 Q56 46 50 50 Q44 46 36 56 Q14 58 8 40 Z" fill="#1f3c88"/>
    <ellipse cx="32" cy="43" rx="8" ry="5" fill="#fff"/><ellipse cx="68" cy="43" rx="8" ry="5" fill="#fff"/>
    <path d="M50 64 L54 73 L64 73 L56 79 L59 88 L50 82 L41 88 L44 79 L36 73 L46 73 Z" fill="#f6c945"/>`,
  puzzle: `
    <path d="M18 30 H38 Q34 14 50 14 Q66 14 62 30 H82 V50 Q96 46 96 60 Q96 74 82 70 V88 H62 Q66 74 50 74 Q34 74 38 88 H18 V70 Q4 74 4 60 Q4 46 18 50 Z" fill="#5fbf7a" stroke="#3a8f53" stroke-width="2.5" stroke-linejoin="round"/>`,
  etoile: `<path d="M50 6 L62 38 L96 38 L68 58 L79 92 L50 71 L21 92 L32 58 L4 38 L38 38 Z" fill="#f6c945" stroke="#d9a520" stroke-width="2.5" stroke-linejoin="round"/>`,
  bille: `<circle cx="50" cy="50" r="40" fill="#4f8fe0" stroke="#2f62a8" stroke-width="3"/>
    <path d="M22 58 Q36 40 50 52 Q64 64 78 44" stroke="#f6c945" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M26 70 Q44 58 56 68 Q66 76 74 66" stroke="#e85a9a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="36" cy="30" rx="10" ry="6" fill="#fff" opacity=".85" transform="rotate(-30 36 30)"/>`,
  bonbon: `<path d="M8 32 L28 44 L28 56 L8 68 Z M92 32 L72 44 L72 56 L92 68 Z" fill="#f59ac2" stroke="#d76b9c" stroke-width="2"/>
    <ellipse cx="50" cy="50" rx="25" ry="20" fill="#e85a9a" stroke="#c0407c" stroke-width="2"/>
    <path d="M36 40 Q50 60 64 40" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`,
  carte: `<rect x="20" y="8" width="60" height="84" rx="8" fill="#fff" stroke="#3d6fb6" stroke-width="4"/>
    <path d="M50 30 L58 46 L50 70 L42 46 Z" fill="#e2463f"/>`,
  point: `<circle cx="50" cy="50" r="40" fill="#3d6fb6"/>`
};

// Liste des avatars possibles (choisis dans l'écran parent) et des thèmes décoratifs.
export const AVATARS = ['koala', 'panda', 'licorne', 'chiot'];
export const THEMES = ['koala', 'panda', 'licorne', 'chiot', 'couronne', 'chevalier', 'heros', 'puzzle', 'etoile'];
export const LIBELLES = {
  koala: 'Koala', panda: 'Panda', licorne: 'Licorne', chiot: 'Chiot', couronne: 'Princesse',
  chevalier: 'Chevalier', heros: 'Super-héros', puzzle: 'Puzzle', etoile: 'Étoile'
};

export function dessin(nom, taille = 48, extra = '') {
  const contenu = D[nom] || D.etoile;
  return `<svg class="dessin" width="${taille}" height="${taille}" viewBox="0 0 100 100" aria-hidden="true" ${extra}>${contenu}</svg>`;
}
