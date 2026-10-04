// Moteur de déroulé générique (v0.3.0) : utilisé par le test de positionnement ET par les séances.
// Un item par écran, 2 essais (règle B4), temps mesuré en silence (règle B3), pause et reprise
// à l'item non validé, option « Je ne sais pas » (règle B10, séances seulement).
//
// config = {
//   type: 'positionnement' | 'seance',
//   items: [...],                         // items au format de test/items.js
//   champs: { ... },                      // champs propres ajoutés à la passation (versionTest, parcours…)
//   classer(essais, neSaitPas), synthese(resultats),
//   phrases: { intro, reprise, pause, fin },
//   neSaisPas: true | false,
//   apresFin(passation, profil)           // facultatif (ex. niveau « positionné »)
// }
import { dire, arreter, reecouter } from './audio.js';
import { afficher, $, $$, ICONES, attendre } from './ui.js';
import { dessin } from './themes.js';
import * as S from './stockage.js';
import { APP_VERSION } from './version.js';
import { barresCubes } from './rendu.js';
import { boutonNeSaisPas, boutonDisponible } from './seances/ne_sait_pas.js';

let session = null; // { config, passation, profil, item, essais, tFinConsigne, reponseCourante, onQuitter }

export function deroulementEnCours() { return !!session; }

// Démarre (ou reprend) une passation. passationExistante : passation non terminée à reprendre.
export async function lancerDeroule(config, profil, passationExistante, onQuitter) {
  let pass = passationExistante;
  const reprise = !!pass;
  if (!pass) {
    pass = S.ajouterPassation({
      id: S.nouvelId('pass'),
      type: config.type,
      ...config.champs,
      appVersion: APP_VERSION,
      profilId: profil.id,
      debut: new Date().toISOString(),
      fin: null,
      statut: 'en-cours',
      pauses: [],
      items: []
    });
  } else {
    pass.statut = 'en-cours';
    pass.pauses.push({ reprise: new Date().toISOString(), appVersion: APP_VERSION });
    S.sauver();
  }
  session = { config, passation: pass, profil, onQuitter };
  await ecranIntro(reprise);
}

async function ecranIntro(reprise) {
  const p = session.profil;
  afficher(`
    <div class="ecran-centre">
      <div class="avatar-geant">${dessin(p.avatar, 150)}</div>
      <button class="btn-rond btn-oreille" id="ecouter" aria-label="Réécouter">${ICONES.oreille}</button>
      <button class="btn-grand btn-vert" id="go" aria-label="Commencer">${ICONES.valider}</button>
    </div>`, 'fond-' + p.avatar);
  $('#go').onclick = () => { arreter(); itemSuivant(); };
  $('#ecouter').onclick = () => reecouter();
  const ph = session.config.phrases;
  dire(reprise ? [ph.reprise] : [ph.intro]);
}

function indexProchainItem() {
  const faits = new Set(session.passation.items.map(r => r.itemId));
  return session.config.items.findIndex(it => !faits.has(it.id));
}

async function itemSuivant() {
  const i = indexProchainItem();
  if (i === -1) return terminer();
  session.item = session.config.items[i];
  session.essais = [];
  session.neSaitPas = null;
  session.itemTermine = false;
  afficherItem(i);
}

// ---------- Affichage d'un item ----------
function afficherItem(index) {
  const it = session.item;
  const ctx = { avatar: session.profil.avatar };
  const progression = session.config.items.map((_, k) => `<span class="${k < index ? 'fait' : (k === index ? 'actuel' : '')}"></span>`).join('');
  afficher(`
    <div class="barre-haut">
      <button class="btn-pause" id="pause" aria-label="Pause">${ICONES.pause}</button>
      <div class="progression">${progression}</div>
      <button class="btn-rond btn-oreille" id="ecouter" aria-label="Réécouter">${ICONES.oreille}</button>
    </div>
    <div class="scene" id="scene">${it.scene(ctx)}</div>
    <div class="saisie" id="saisie"></div>
    ${session.config.neSaisPas ? `<div class="zone-nsp" id="zone-nsp" hidden>${boutonNeSaisPas()}</div>` : ''}
    <div class="retour" id="retour"></div>`, 'ecran-item fond-' + session.profil.avatar);
  $('#pause').onclick = mettreEnPause;
  // L'oreille redit TOUJOURS la consigne de l'item (avant : elle redisait la dernière phrase
  // entendue, donc seulement « Vérifie » après une 1re erreur — bug signalé par Simon, v0.3.1).
  session.aEcouter = [it.consigne || it.id + '_c'];
  $('#ecouter').onclick = () => { if (session) dire(session.aEcouter); };
  construireSaisie(it);
  if (session.config.neSaisPas) $('#neSaisPas').onclick = neSaisPas;
  session.tFinConsigne = null;
  session.consigneFinie = false;
  session.tDebut = performance.now();
  dire(it.consigne || it.id + '_c').then(() => {
    if (session && session.item === it) {
      if (!session.tFinConsigne) session.tFinConsigne = performance.now();
      session.consigneFinie = true;
      majBoutonNeSaisPas();
    }
  });
}

// Affiche le bouton « ? » seulement quand la consigne a été entendue en entier (règle B10).
function majBoutonNeSaisPas() {
  const z = $('#zone-nsp');
  if (!z || !session) return;
  z.hidden = !boutonDisponible({ consigneFinie: session.consigneFinie, essais: session.essais, termine: !!session.itemTermine });
}

// ---------- Zones de saisie selon le type d'item ----------
function construireSaisie(it) {
  const z = $('#saisie');
  session.reponseCourante = null;
  if (it.type === 'pave') {
    z.innerHTML = `
      <div class="affichage-nombre" id="affichage"><span class="curseur"></span></div>
      <div class="pave">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="touche" data-n="${n}">${n}</button>`).join('')}
        <button class="touche touche-effacer" id="effacer" aria-label="Effacer">${ICONES.effacer}</button>
        <button class="touche" data-n="0">0</button>
        <button class="touche touche-valider" id="valider" aria-label="Valider">${ICONES.valider}</button>
      </div>`;
    let saisie = '';
    const maj = () => {
      $('#affichage').innerHTML = saisie ? saisie : '<span class="curseur"></span>';
      session.reponseCourante = saisie === '' ? null : parseInt(saisie, 10);
    };
    $$('.touche[data-n]', z).forEach(b => b.onclick = () => { if (saisie.length < 3) { saisie += b.dataset.n; maj(); } });
    $('#effacer').onclick = () => { saisie = saisie.slice(0, -1); maj(); };
    $('#valider').onclick = () => { if (session.reponseCourante !== null) valider(); };
    session.reinitialiser = () => { saisie = ''; maj(); };
  }

  if (it.type === 'choix') {
    z.innerHTML = `<div class="choix">${it.choix.map(v => `<button class="btn-choix" data-v="${v}">${v}</button>`).join('')}</div>`;
    $$('.btn-choix', z).forEach(b => b.onclick = () => {
      if (b.disabled) return;
      session.reponseCourante = parseInt(b.dataset.v, 10);
      session.boutonChoisi = b;
      valider();
    });
    session.reinitialiser = () => { if (session.boutonChoisi) { session.boutonChoisi.disabled = true; session.boutonChoisi.classList.add('ecarte'); } };
  }

  if (it.type === 'barres') {
    let barres = 0, cubes = 0;
    z.innerHTML = `
      <div class="construction" id="construction"></div>
      <div class="commandes-barres">
        <div class="groupe-cmd"><span class="lib-cmd"><span class="mini-barre"></span></span>
          <button class="touche" id="bMoins" aria-label="Enlever une barre">−</button>
          <button class="touche" id="bPlus" aria-label="Ajouter une barre">+</button></div>
        <div class="groupe-cmd"><span class="lib-cmd"><span class="mini-cube"></span></span>
          <button class="touche" id="cMoins" aria-label="Enlever un cube">−</button>
          <button class="touche" id="cPlus" aria-label="Ajouter un cube">+</button></div>
      </div>
      <button class="btn-grand btn-vert" id="valider" aria-label="Valider">${ICONES.valider}</button>`;
    const maj = () => {
      $('#construction').innerHTML = barresCubes(barres, cubes);
      session.reponseCourante = { barres, cubes };
    };
    $('#bPlus').onclick = () => { if (barres < 9) { barres++; maj(); } };
    $('#bMoins').onclick = () => { if (barres > 0) { barres--; maj(); } };
    $('#cPlus').onclick = () => { if (cubes < 19) { cubes++; maj(); } };
    $('#cMoins').onclick = () => { if (cubes > 0) { cubes--; maj(); } };
    $('#valider').onclick = () => { if (barres + cubes > 0) valider(); };
    session.reinitialiser = () => { barres = 0; cubes = 0; maj(); };
    maj();
  }

  if (it.type === 'ligne') {
    z.innerHTML = `
      <div class="ligne-num" id="ligne">
        <div class="trait"></div>
        <span class="borne g">0</span><span class="borne d">100</span>
        <div class="repere" id="repere" hidden></div>
      </div>
      <button class="btn-grand btn-vert" id="valider" aria-label="Valider">${ICONES.valider}</button>`;
    const ligne = $('#ligne');
    ligne.onclick = e => {
      const r = ligne.getBoundingClientRect();
      const marge = 24; // le trait commence et finit à 24 px des bords (voir CSS)
      const x = Math.min(Math.max(e.clientX - r.left - marge, 0), r.width - 2 * marge);
      const v = Math.round(x / (r.width - 2 * marge) * 100);
      session.reponseCourante = v;
      const rep = $('#repere'); rep.hidden = false; rep.style.left = `calc(24px + (100% - 48px) * ${v / 100})`;
    };
    $('#valider').onclick = () => { if (session.reponseCourante !== null) valider(); };
    session.reinitialiser = () => { session.reponseCourante = null; $('#repere').hidden = true; };
  }
}

// ---------- Validation d'un essai ----------
let verrou = false;
async function valider() {
  if (verrou) return;
  verrou = true;
  const it = session.item;
  const maintenant = performance.now();
  const reponse = session.reponseCourante;
  const juste = it.verifier(reponse);
  const debut = session.tFinConsigne || session.tDebut;
  session.essais.push({
    reponse,
    juste,
    tempsMs: Math.round(maintenant - debut),
    avantFinConsigne: !session.tFinConsigne, // a répondu pendant la consigne (indice de précipitation)
    ...(it.canonique ? { canonique: it.canonique(reponse) } : {})
  });
  arreter();

  if (juste) {
    session.itemTermine = true; majBoutonNeSaisPas();
    $('#saisie').classList.add('fige');
    $('#retour').innerHTML = `<div class="bulle bulle-bravo">${dessin('etoile', 56)}</div>`;
    enregistrerItem(); // enregistré AVANT l'audio : une pause pendant le « bravo » ne perd rien
    const premier = session.essais.length === 1;
    await dire(premier ? ['bravo_' + (1 + Math.floor(Math.random() * 3))] : ['bravo_verifie']);
    verrou = false;
    if (!session || session.item !== it) return; // pause pendant le bravo
    await attendre(300);
    if (!session || session.item !== it) return;
    return itemSuivant();
  }

  if (session.essais.length === 1) {
    // 1er échec : « Vérifie », sans indice de réponse (règle B4).
    $('#retour').innerHTML = `<div class="bulle bulle-verifie">?</div>`;
    setTimeout(() => { const r = $('#retour'); if (r) r.innerHTML = ''; }, 1800);
    session.reinitialiser();
    session.tFinConsigne = null;
    session.tDebut = performance.now();
    verrou = false;
    majBoutonNeSaisPas();
    await dire(['verifie']);
    if (session && session.item === it && session.essais.length === 1) session.tFinConsigne = performance.now();
    return;
  }

  // 2e échec : aide visuelle + explication, puis on continue.
  verrou = false;
  montrerAide(reponse, 'aide_intro');
}

// « Je ne sais pas » : aide + explication tout de suite, sans reproche (règle B10).
function neSaisPas() {
  if (!session || verrou || session.itemTermine) return;
  arreter();
  const debut = session.tFinConsigne || session.tDebut;
  session.neSaitPas = { apresEssais: session.essais.length, tempsMs: Math.round(performance.now() - debut) };
  montrerAide(null, 'ne_sait_pas');
}

function montrerAide(reponse, phraseIntro) {
  const it = session.item;
  session.itemTermine = true;
  enregistrerItem();
  const ctx = { avatar: session.profil.avatar };
  let aide = it.aide(ctx, reponse);
  // Ligne 0-100 du test (cible 50, aide sans ligne) ; les items de séance tracent leur propre ligne.
  if (it.type === 'ligne' && !it.aideComplete) aide += aideLigne(reponse, it.cible ?? 50);
  $('#scene').innerHTML = `<div class="aide">${aide}</div>`;
  $('#saisie').innerHTML = `<button class="btn-grand btn-bleu" id="suite" aria-label="Continuer">${ICONES.suivant}</button>`;
  const z = $('#zone-nsp'); if (z) z.hidden = true;
  $('#retour').innerHTML = '';
  $('#suite').onclick = () => { arreter(); itemSuivant(); };
  session.aEcouter = [it.explication || it.id + '_e', 'suivant']; // pendant l'aide : l'oreille redit l'explication
  dire([phraseIntro, it.explication || it.id + '_e', 'suivant']);
}

function aideLigne(reponse, cible) {
  return `<div class="ligne-num ligne-aide"><div class="trait"></div>
    <span class="borne g">0</span><span class="borne d">100</span>
    <div class="repere repere-juste" style="left:calc(24px + (100% - 48px) * ${cible / 100})"><b>${cible}</b></div>
    ${typeof reponse === 'number' ? `<div class="repere repere-enfant" style="left:calc(24px + (100% - 48px) * ${reponse / 100})"></div>` : ''}
  </div>`;
}

function enregistrerItem() {
  const it = session.item;
  session.passation.items.push({
    itemId: it.id,
    domaine: it.domaine,
    attendu: it.attendu,
    essais: session.essais,
    classement: session.config.classer(session.essais, session.neSaitPas),
    ...(session.neSaitPas ? { neSaitPas: session.neSaitPas } : {}),
    ...(it.essai2PeuSignificatif ? { essai2PeuSignificatif: true } : {})
  });
  S.sauver();
}

// ---------- Pause / fin ----------
function mettreEnPause() {
  arreter();
  // L'item en cours (non validé) sera reproposé en entier à la reprise.
  session.passation.statut = 'pause';
  session.passation.pauses.push({ pause: new Date().toISOString(), itemEnCours: session.item ? session.item.id : null });
  S.sauver();
  dire([session.config.phrases.pause]);
  const q = session.onQuitter; session = null;
  q && q();
}

async function terminer() {
  const pass = session.passation;
  pass.statut = 'termine';
  pass.fin = new Date().toISOString();
  pass.synthese = session.config.synthese(pass.items);
  S.sauver();
  if (session.config.apresFin) session.config.apresFin(pass, session.profil);
  const p = session.profil;
  afficher(`
    <div class="ecran-centre">
      <div class="etoiles">${dessin('etoile', 54)}${dessin('etoile', 70)}${dessin('etoile', 54)}</div>
      <div class="avatar-geant">${dessin(p.avatar, 160)}</div>
      <button class="btn-grand btn-vert" id="fin" aria-label="Terminer">${ICONES.maison}</button>
    </div>`, 'fond-' + p.avatar);
  const q = session.onQuitter; const phraseFin = session.config.phrases.fin; session = null;
  $('#fin').onclick = () => { arreter(); q && q(); };
  dire([phraseFin]);
}
