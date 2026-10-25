// Point d'entrée : choix de l'enfant, accueil de l'enfant, accès parent.
import * as S from './stockage.js';
import { initAudio, dire, arreter, deverrouillerAudio, reecouter } from './audio.js';
import { afficher, $, $$, esc, ICONES } from './ui.js';
import { dessin } from './themes.js';
import { lancerTest, passationOuverte, testTermine } from './test/passation.js';
import { lancerSeance, prochaineSeance } from './seances/seance.js';
import { ouvrirParent } from './parent/parent.js';

let audioDeverrouille = false;

// Mise à jour (v0.4.1) : une PWA iOS restée en arrière-plan gardait l'ancienne version
// plusieurs jours (0.3.7 utilisée 8 jours après la publication de 0.3.8). On demande donc
// au navigateur de vérifier sw.js à chaque ouverture / retour au premier plan, et on recharge
// dès qu'une nouvelle version a pris la main — seulement sur les écrans « Qui joue ? » et
// accueil de l'enfant, jamais pendant le test, une séance ou l'espace parent.
let ecranSansRisque = false;
let rechargementEnAttente = false;
function marquerEcran(sansRisque) {
  ecranSansRisque = sansRisque;
  if (sansRisque && rechargementEnAttente) recharger();
}
function recharger() {
  if (S.aDesDonnees()) S.sauver();
  location.reload();
}
function surveillerMisesAJour(reg) {
  const verifier = () => { reg.update().catch(() => {}); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verifier(); });
  // Sans contrôleur au départ (1re installation), la prise de contrôle n'est pas une mise à jour.
  if (!navigator.serviceWorker.controller) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (rechargementEnAttente) return;
    rechargementEnAttente = true;
    if (ecranSansRisque) recharger();
  });
}
function premierToucher() {
  if (audioDeverrouille) return;
  audioDeverrouille = true;
  deverrouillerAudio();
}

// Écran 1 : « Qui joue ? » — un grand bouton par enfant.
function choixEnfant() {
  arreter();
  marquerEcran(true);
  const profils = S.getProfils();
  if (!profils.length) { marquerEcran(false); return ouvrirParent(choixEnfant); }
  afficher(`
    <div class="ecran-choix">
      <div class="liste-enfants">
        ${profils.map(p => `<button class="carte-enfant fond-${p.avatar}" data-id="${p.id}">
            ${dessin(p.avatar, 120)}<span class="prenom">${esc(p.prenom)}</span></button>`).join('')}
      </div>
      <button class="btn-rond btn-oreille" id="ecouter" aria-label="Écouter">${ICONES.oreille}</button>
      <button class="btn-parent" id="parent" aria-label="Espace parent">${ICONES.cadenas}</button>
    </div>`, 'fond-neutre');
  $$('.carte-enfant').forEach(b => b.onclick = () => { premierToucher(); accueilEnfant(S.getProfil(b.dataset.id)); });
  $('#parent').onclick = () => { premierToucher(); marquerEcran(false); ouvrirParent(choixEnfant); };
  $('#ecouter').onclick = () => { premierToucher(); dire('qui_joue'); };
  if (audioDeverrouille) dire('qui_joue');
}

// Écran 2 : accueil de l'enfant, avec ses thèmes en décor.
function accueilEnfant(p) {
  marquerEcran(true);
  // 1. Le test de départ d'abord (ou sa reprise). 2. Puis les séances du parcours choisi par le parent.
  const testOuvert = passationOuverte(p.id);
  const testFini = testTermine(p.id);
  const enTest = testOuvert || !testFini;
  const seance = enTest ? null : prochaineSeance(p);
  let suite, jouer = null;
  if (enTest) { suite = testOuvert ? 'accueil_reprise' : 'accueil_test'; jouer = () => lancerTest(p, retour); }
  else if (seance) { suite = seance.passation ? 'accueil_reprise' : 'accueil_seance'; jouer = () => lancerSeance(p, retour); }
  else suite = p.parcours ? 'accueil_tout_fini' : 'accueil_fini';
  // Le jeu des mots (lecture) : au choix, indépendant du test de maths (décision de Simon, 09/10).
  const lecture = prochaineSeance(p, 'L');
  const lire = lecture ? () => lancerSeance(p, retour, 'L') : null;
  if (lire && jouer) suite = 'accueil_choix';
  else if (lire && !jouer) suite = 'accueil_lecture';
  function retour() { accueilEnfant(S.getProfil(p.id)); }

  const decor = (p.themes || []).filter(t => t !== p.avatar).slice(0, 6)
    .map((t, i) => `<span class="deco deco-${i}">${dessin(t, 54)}</span>`).join('');
  afficher(`
    <div class="ecran-centre accueil">
      ${decor}
      <button class="btn-retour" id="retour" aria-label="Retour">${ICONES.maison}</button>
      <div class="avatar-geant">${dessin(p.avatar, 170)}</div>
      <div class="prenom-grand">${esc(p.prenom)}</div>
      <button class="btn-rond btn-oreille" id="ecouter" aria-label="Réécouter">${ICONES.oreille}</button>
      <div class="choix-jeux">
        ${jouer ? `<button class="btn-grand btn-vert" id="jouer" aria-label="Jouer avec les nombres">${ICONES.valider}</button>` : ''}
        ${lire ? `<button class="btn-grand btn-livre" id="lire" aria-label="Jouer avec les mots">${ICONES.livre}</button>` : ''}
      </div>
    </div>`, 'fond-' + p.avatar);
  $('#retour').onclick = choixEnfant;
  $('#ecouter').onclick = () => reecouter();
  const j = $('#jouer');
  if (j) j.onclick = () => { arreter(); marquerEcran(false); jouer(); };
  const l = $('#lire');
  if (l) l.onclick = () => { arreter(); marquerEcran(false); lire(); };
  dire(['bonjour_' + p.avatar, suite]);
}

async function demarrer() {
  await S.charger();
  // iOS peut tuer l'appli sans prévenir : on réécrit l'état quand elle passe en arrière-plan.
  const ecrireAvantSortie = () => { if (S.aDesDonnees()) S.sauver(); };
  addEventListener('pagehide', ecrireAvantSortie);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') ecrireAvantSortie(); });
  await initAudio();
  // Enregistrement du service worker (hors-ligne). Ignoré si non disponible.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    try {
      const reg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      surveillerMisesAJour(reg);
      reg.update().catch(() => {});
    } catch (e) { console.warn('SW', e); }
  }
  document.addEventListener('touchstart', premierToucher, { once: true, passive: true });
  document.addEventListener('click', premierToucher, { once: true });
  choixEnfant();
}

demarrer();
