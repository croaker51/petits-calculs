// Stockage local de toutes les données (sur l'iPhone uniquement).
// Règle A6 : toute lecture/écriture est protégée ; l'appli fonctionne même si
// le stockage est vide, purgé ou indisponible (les données restent alors en mémoire).
//
// v0.2.3 — suite à une perte des profils à chaque réouverture (iPhone, mode écran d'accueil) :
//  1. DOUBLE écriture : localStorage + IndexedDB. Au démarrage, on prend la copie la plus récente.
//  2. On n'écrit JAMAIS un état vide au démarrage (avant : un état vide écrasait les données
//     si la lecture échouait une seule fois).
//  3. Un contenu illisible ou d'un autre format est mis de côté (clé « secours »), jamais écrasé.
//  4. Une « sonde » compte les lancements (dans les deux stockages) : si elle survit mais pas
//     les données, ce n'est pas iOS qui purge ; si tout disparaît, c'est le stockage entier.
//  5. Demande de stockage persistant (navigator.storage.persist).
//  6. Diagnostic affiché dans l'espace parent et joint à l'export.
import { APP_VERSION, SCHEMA_VERSION } from './version.js';

const CLE = 'petitsCalculs.donnees';
const CLE_SECOURS = 'petitsCalculs.secours';
const CLE_SONDE = 'petitsCalculs.sonde';
const BASE = 'petitsCalculs', TABLE = 'kv';

function etatVide() {
  return {
    schemaVersion: SCHEMA_VERSION,
    creeLe: new Date().toISOString(),
    majLe: null,
    config: { codeHash: null, sel: null },
    profils: [],      // { id, prenom, avatar, themes[], niveau{...}, creeLe }
    passations: [],   // une passation = un test (ou plus tard une séance)
    journal: []       // événements importants (versions, imports...)
  };
}

let etat = etatVide();
let stockageDisponible = true;
const diag = {
  lancement: 0, lancementsPrecedents: 0, source: 'vide',
  localStorage: '?', indexedDB: '?', persistant: '?', ecranAccueil: false,
  derniereEcriture: null, ecritureLS: null, ecritureIDB: null, alertes: []
};

// ---------- IndexedDB (promesses, toujours protégées, avec délai maximal) ----------
let basePromesse = null;
function ouvrirBase() {
  if (basePromesse) return basePromesse;
  basePromesse = new Promise((ok, ko) => {
    try {
      if (!('indexedDB' in self)) return ko(new Error('indexedDB absent'));
      const req = indexedDB.open(BASE, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(TABLE);
      req.onsuccess = () => ok(req.result);
      req.onerror = () => ko(req.error);
      setTimeout(() => ko(new Error('délai dépassé')), 2000);
    } catch (e) { ko(e); }
  });
  basePromesse.catch(() => { basePromesse = null; });
  return basePromesse;
}
async function idbLire(cle) {
  const db = await ouvrirBase();
  return new Promise((ok, ko) => {
    const req = db.transaction(TABLE, 'readonly').objectStore(TABLE).get(cle);
    req.onsuccess = () => ok(req.result ?? null);
    req.onerror = () => ko(req.error);
  });
}
async function idbEcrire(cle, valeur) {
  const db = await ouvrirBase();
  return new Promise((ok, ko) => {
    const tx = db.transaction(TABLE, 'readwrite');
    tx.objectStore(TABLE).put(valeur, cle);
    tx.oncomplete = () => ok(true);
    tx.onerror = () => ko(tx.error);
    tx.onabort = () => ko(tx.error);
  });
}

function lsLire(cle) { return localStorage.getItem(cle); }

// Analyse d'un contenu brut : renvoie l'état s'il est valide, sinon null (et le met de côté).
function analyser(brut, origine) {
  if (!brut) return null;
  try {
    const lu = JSON.parse(brut);
    if (lu && lu.schemaVersion === SCHEMA_VERSION && Array.isArray(lu.profils)) return lu;
    // Migrations futures : if (lu.schemaVersion === 1) { ... }
    diag.alertes.push(`Données ${origine} d'un autre format (${lu && lu.schemaVersion}) : mises de côté.`);
  } catch (e) {
    diag.alertes.push(`Données ${origine} illisibles : mises de côté.`);
  }
  try { if (!localStorage.getItem(CLE_SECOURS)) localStorage.setItem(CLE_SECOURS, brut); } catch (e) { /* rien */ }
  return null;
}

const date = e => (e && (e.majLe || e.creeLe)) || '';
export const aDesDonnees = (e = etat) => !!(e.profils.length || e.passations.length || (e.config && e.config.codeHash));

export async function charger() {
  let brutLS = null, brutIDB = null, sondeLS = 0, sondeIDB = 0;
  try { brutLS = lsLire(CLE); sondeLS = parseInt(lsLire(CLE_SONDE) || '0', 10) || 0; diag.localStorage = brutLS ? 'données trouvées' : 'vide'; }
  catch (e) { diag.localStorage = 'erreur : ' + e.name; }
  try { brutIDB = await idbLire('donnees'); sondeIDB = (await idbLire('sonde')) || 0; diag.indexedDB = brutIDB ? 'données trouvées' : 'vide'; }
  catch (e) { diag.indexedDB = 'erreur : ' + (e && (e.name || e.message)); }

  const parLS = analyser(brutLS, 'localStorage');
  const parIDB = analyser(brutIDB, 'IndexedDB');
  const choisi = [parLS, parIDB].filter(Boolean).sort((a, b) => date(b).localeCompare(date(a)))[0] || null;
  if (choisi) {
    etat = choisi;
    diag.source = choisi === parLS ? 'localStorage' : 'IndexedDB';
    if (!parLS || !parIDB || date(parLS) !== date(parIDB)) {
      diag.alertes.push(`Copies différentes : reprise depuis ${diag.source}, l'autre copie est resynchronisée.`);
      sauver();
    }
  } else {
    etat = etatVide();
    stockageDisponible = !String(diag.localStorage).startsWith('erreur') || !String(diag.indexedDB).startsWith('erreur');
  }

  // Sonde de lancements (écrite à chaque démarrage, même sans données : elle est minuscule).
  diag.lancementsPrecedents = Math.max(sondeLS, sondeIDB);
  diag.lancement = diag.lancementsPrecedents + 1;
  try { localStorage.setItem(CLE_SONDE, String(diag.lancement)); } catch (e) { /* diagnostic seulement */ }
  idbEcrire('sonde', diag.lancement).catch(() => {});
  if (!choisi && diag.lancementsPrecedents > 0) {
    diag.alertes.push(`Aucune donnée alors que l'appli a déjà été ouverte ${diag.lancementsPrecedents} fois sur cet appareil.`);
  }

  // Stockage persistant (iOS / Safari peuvent l'accorder ou non) et mode écran d'accueil.
  try {
    diag.ecranAccueil = !!(navigator.standalone || (self.matchMedia && matchMedia('(display-mode: standalone)').matches));
    if (navigator.storage && navigator.storage.persist) {
      diag.persistant = (await navigator.storage.persisted()) || (await navigator.storage.persist()) ? 'oui' : 'non';
    } else diag.persistant = 'non pris en charge';
  } catch (e) { diag.persistant = 'erreur'; }

  noterVersion();
  return etat;
}

// Écrit l'état dans les DEUX stockages. N'écrit jamais un état vide (rien à protéger,
// et cela pourrait écraser une copie valide qu'on n'a pas réussi à lire).
export function sauver() {
  if (!aDesDonnees()) return true;
  etat.majLe = new Date().toISOString();
  const texte = JSON.stringify(etat);
  let okLS = false;
  try { localStorage.setItem(CLE, texte); okLS = true; diag.ecritureLS = 'ok'; }
  catch (e) { diag.ecritureLS = 'erreur : ' + e.name; console.warn('Écriture localStorage impossible', e); }
  idbEcrire('donnees', texte)
    .then(() => { diag.ecritureIDB = 'ok'; stockageDisponible = true; })
    .catch(e => { diag.ecritureIDB = 'erreur : ' + (e && (e.name || e.message)); stockageDisponible = okLS; });
  diag.derniereEcriture = etat.majLe;
  if (okLS) stockageDisponible = true;
  return okLS;
}

export function getEtat() { return etat; }
export function estStockageDisponible() { return stockageDisponible; }
export function getDiagnostic() { return JSON.parse(JSON.stringify(diag)); }

// Trace chaque nouvelle version de l'appli vue sur cet appareil (suivi des versions).
function noterVersion() {
  const derniere = [...etat.journal].reverse().find(e => e.type === 'version');
  if (!derniere || derniere.version !== APP_VERSION) {
    etat.journal.push({ type: 'version', version: APP_VERSION, date: new Date().toISOString() });
    sauver(); // sans effet si l'état est vide
  }
}

export function journaliser(type, details = {}) {
  etat.journal.push({ type, date: new Date().toISOString(), appVersion: APP_VERSION, ...details });
  sauver();
}

// ---------- Réglages (exportés ; sans donnée sensible) ----------
export function getReglages() { if (!etat.reglages) etat.reglages = {}; return etat.reglages; }
export function definirReglage(cle, valeur) { getReglages()[cle] = valeur; sauver(); }

// ---------- Identifiants ----------
export function nouvelId(prefixe) {
  return prefixe + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---------- Profils ----------
export function getProfils() { return etat.profils; }
export function getProfil(id) { return etat.profils.find(p => p.id === id) || null; }

export function ajouterProfil({ prenom, avatar, themes }) {
  const p = {
    id: nouvelId('enfant'),
    prenom: prenom.trim(),
    avatar,
    themes: themes || [],
    niveau: { statut: 'test-a-faire', palier: null, historique: [] },
    creeLe: new Date().toISOString()
  };
  etat.profils.push(p);
  journaliser('profil-cree', { profilId: p.id });
  return p;
}

export function modifierProfil(id, champs) {
  const p = getProfil(id);
  if (!p) return null;
  Object.assign(p, champs);
  sauver();
  return p;
}

// Change le niveau en gardant l'historique (suivi du niveau dans le temps).
export function definirNiveau(profilId, nouveau) {
  const p = getProfil(profilId);
  if (!p) return;
  p.niveau.historique.push({
    date: new Date().toISOString(),
    appVersion: APP_VERSION,
    statut: nouveau.statut,
    palier: nouveau.palier ?? null,
    source: nouveau.source || null
  });
  p.niveau.statut = nouveau.statut;
  if ('palier' in nouveau) p.niveau.palier = nouveau.palier;
  sauver();
}

// ---------- Passations ----------
export function getPassations(profilId, type) {
  return etat.passations.filter(x => x.profilId === profilId && (!type || x.type === type));
}
export function getPassation(id) { return etat.passations.find(x => x.id === id) || null; }
export function ajouterPassation(pass) { etat.passations.push(pass); sauver(); return pass; }
export function supprimerPassation(id) {
  etat.passations = etat.passations.filter(x => x.id !== id);
  journaliser('passation-supprimee', { passationId: id });
}

// ---------- Code parent ----------
// Le code n'est jamais stocké en clair : empreinte SHA-256 salée.
// (Protection contre un enfant curieux, pas contre un adulte déterminé.)
async function empreinte(code, sel) {
  const octets = new TextEncoder().encode(sel + ':' + code);
  if (crypto && crypto.subtle) {
    const h = await crypto.subtle.digest('SHA-256', octets);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Repli (contexte non sécurisé, ex. tests locaux en http) : hachage simple.
  let h = 0; for (const b of octets) h = (h * 31 + b) >>> 0;
  return 'x' + h.toString(16);
}

export function codeEstDefini() { return !!etat.config.codeHash; }

export async function definirCode(code) {
  const sel = Math.random().toString(36).slice(2) + Date.now().toString(36);
  etat.config.sel = sel;
  etat.config.codeHash = await empreinte(code, sel);
  sauver();
}

export async function verifierCode(code) {
  if (!etat.config.codeHash) return false;
  return (await empreinte(code, etat.config.sel)) === etat.config.codeHash;
}

// ---------- Export / import ----------
// Le fichier exporté est conçu pour être relu par Claude lors des mises à jour :
// il porte la version de l'appli, la version du format, la date et le diagnostic du stockage.
export function construireExport() {
  const copie = JSON.parse(JSON.stringify(etat));
  delete copie.config; // le code parent (même haché) ne sort pas de l'iPhone
  return {
    format: 'petits-calculs-export',
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exporteLe: new Date().toISOString(),
    diagnosticStockage: getDiagnostic(),
    donnees: copie
  };
}

export function importer(objet) {
  if (!objet || objet.format !== 'petits-calculs-export') throw new Error('Fichier non reconnu');
  if (objet.schemaVersion !== SCHEMA_VERSION) throw new Error('Version de format incompatible (' + objet.schemaVersion + ')');
  const config = etat.config; // on garde le code parent actuel
  etat = { ...objet.donnees, config };
  journaliser('import', { depuisVersion: objet.appVersion, exporteLe: objet.exporteLe });
  sauver();
}

export function toutEffacer() {
  const config = etat.config;
  etat = etatVide();
  etat.config = config;
  journaliser('remise-a-zero');
}
