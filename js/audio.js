// Couche audio : toute consigne est lue à voix haute (règle B2).
// Priorité 1 : fichiers MP3 pré-générés (voix neuronale) dans audio/<id>.mp3
// Priorité 2 (secours) : synthèse vocale de l'iPhone, meilleure voix française dispo.
import { PHRASES } from './phrases.js';

let manifeste = null;          // { voix, ids: [...] } produit par outils/generer_audio.py
const lecteur = new Audio();    // un seul élément, réutilisé (contrainte iOS)
lecteur.preload = 'auto';
let jetonEnCours = 0;           // permet d'interrompre une lecture en cours
let derniereSequence = [];
let finEnCours = null;           // résout la lecture en cours si on l'interrompt

export async function initAudio() {
  try {
    const r = await fetch('audio/manifest.json', { cache: 'no-cache' });
    if (r.ok) manifeste = await r.json();
  } catch (e) { manifeste = null; }
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
}

export function infoAudio() {
  return {
    voixFichiers: manifeste ? manifeste.voix : null,
    nbFichiers: manifeste ? manifeste.ids.length : 0,
    voixSecours: choisirVoixSecours()?.name || 'aucune'
  };
}

// iOS n'autorise le son qu'après un geste de l'utilisateur : à appeler au 1er toucher.
export function deverrouillerAudio() {
  try {
    lecteur.src = 'audio/silence.mp3';
    const p = lecteur.play();
    if (p) p.catch(() => {});
  } catch (e) {}
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0; speechSynthesis.speak(u);
  }
}

function choisirVoixSecours() {
  if (!('speechSynthesis' in window)) return null;
  const voix = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
  if (!voix.length) return null;
  const score = v => {
    let s = 0;
    if (/premium|enhanced|améliorée|amelioree/i.test(v.name)) s += 10;
    if (v.lang.toLowerCase() === 'fr-fr') s += 5;
    if (/audrey|aurélie|aurelie|marie|amélie|amelie/i.test(v.name)) s += 2;
    if (v.localService) s += 1;
    return s;
  };
  return voix.sort((a, b) => score(b) - score(a))[0];
}

function aUnFichier(id) { return manifeste && manifeste.ids.includes(id); }

function lireFichier(id, jeton) {
  return new Promise(resolve => {
    if (jeton !== jetonEnCours) return resolve();
    const garde = setTimeout(() => fin(), 20000); // garde-fou si 'ended' n'arrive jamais
    const fin = () => { clearTimeout(garde); lecteur.onended = lecteur.onerror = null; if (finEnCours === fin) finEnCours = null; resolve(); };
    finEnCours = fin;
    lecteur.onended = fin;
    lecteur.onerror = () => { lecteur.onended = lecteur.onerror = null; lireSynthese(id, jeton).then(resolve); };
    lecteur.src = 'audio/' + id + '.mp3';
    const p = lecteur.play();
    if (p) p.catch(() => { lecteur.onended = lecteur.onerror = null; lireSynthese(id, jeton).then(resolve); });
  });
}

function lireSynthese(id, jeton) {
  return new Promise(resolve => {
    if (jeton !== jetonEnCours) return resolve();
    const texte = PHRASES[id] || id;
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR';
    const v = choisirVoixSecours();
    if (v) u.voice = v;
    u.rate = 0.9;
    u.pitch = 1.05;
    // Garde-fou : certains navigateurs ne signalent jamais la fin de lecture.
    const garde = setTimeout(() => fin(), 2500 + texte.length * 90);
    const fin = () => { clearTimeout(garde); if (finEnCours === fin) finEnCours = null; resolve(); };
    finEnCours = fin;
    u.onend = u.onerror = fin;
    speechSynthesis.speak(u);
  });
}

// Lit une ou plusieurs phrases à la suite. Interrompt toute lecture en cours.
export async function dire(ids) {
  const liste = Array.isArray(ids) ? ids : [ids];
  derniereSequence = liste;
  arreter();
  const jeton = ++jetonEnCours;
  for (const id of liste) {
    if (jeton !== jetonEnCours) return;
    if (aUnFichier(id)) await lireFichier(id, jeton);
    else await lireSynthese(id, jeton);
  }
}

export function reecouter() { return dire(derniereSequence); }

export function arreter() {
  jetonEnCours++;
  try { lecteur.pause(); } catch (e) {}
  if (finEnCours) finEnCours();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
