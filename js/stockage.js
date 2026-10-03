// Stockage local de toutes les données (sur l'iPhone uniquement).
// Règle A6 : toute lecture/écriture est protégée ; l'appli fonctionne même si
// le stockage est vide, purgé ou indisponible (les données restent alors en mémoire).
import { APP_VERSION, SCHEMA_VERSION } from './version.js';

const CLE = 'petitsCalculs.donnees';

function etatVide() {
  return {
    schemaVersion: SCHEMA_VERSION,
    creeLe: new Date().toISOString(),
    config: { codeHash: null, sel: null },
    profils: [],      // { id, prenom, avatar, themes[], niveau{...}, creeLe }
    passations: [],   // une passation = un test (ou plus tard une séance)
    journal: []       // événements importants (versions, imports...)
  };
}

let etat = etatVide();
let stockageDisponible = true;

export function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const lu = JSON.parse(brut);
      if (lu && lu.schemaVersion === SCHEMA_VERSION) etat = lu;
      // Migrations futures : if (lu.schemaVersion === 1) { ... }
    }
  } catch (e) {
    stockageDisponible = false;
    console.warn('Stockage illisible, démarrage à vide', e);
  }
  noterVersion();
  return etat;
}

export function sauver() {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
    stockageDisponible = true;
    return true;
  } catch (e) {
    stockageDisponible = false;
    console.warn('Écriture impossible', e);
    return false;
  }
}

export function getEtat() { return etat; }
export function estStockageDisponible() { return stockageDisponible; }

// Trace chaque nouvelle version de l'appli vue sur cet appareil (suivi des versions).
function noterVersion() {
  const derniere = [...etat.journal].reverse().find(e => e.type === 'version');
  if (!derniere || derniere.version !== APP_VERSION) {
    etat.journal.push({ type: 'version', version: APP_VERSION, date: new Date().toISOString() });
    sauver();
  }
}

export function journaliser(type, details = {}) {
  etat.journal.push({ type, date: new Date().toISOString(), appVersion: APP_VERSION, ...details });
  sauver();
}

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
// il porte la version de l'appli, la version du format et la date.
export function construireExport() {
  const copie = JSON.parse(JSON.stringify(etat));
  delete copie.config; // le code parent (même haché) ne sort pas de l'iPhone
  return {
    format: 'petits-calculs-export',
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exporteLe: new Date().toISOString(),
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
