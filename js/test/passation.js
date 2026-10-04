// Test de positionnement : configuration du moteur générique (deroule.js).
// Comportement identique à v0.2.x : pas d'option « Je ne sais pas » (décision de Simon).
import { ITEMS, VERSION_TEST, classer, synthese } from './items.js';
import { lancerDeroule } from '../deroule.js';
import * as S from '../stockage.js';

// Renvoie la passation de test non terminée d'un enfant, s'il y en a une.
export function passationOuverte(profilId) {
  return S.getPassations(profilId, 'positionnement').find(p => p.statut !== 'termine') || null;
}

export function testTermine(profilId) {
  return S.getPassations(profilId, 'positionnement').some(p => p.statut === 'termine');
}

export const CONFIG_TEST = {
  type: 'positionnement',
  items: ITEMS,
  champs: { versionTest: VERSION_TEST },
  classer: essais => classer(essais),
  synthese,
  phrases: { intro: 'test_intro', reprise: 'test_reprise', pause: 'test_pause', fin: 'test_fin' },
  neSaisPas: false,
  apresFin: (pass, profil) => S.definirNiveau(profil.id, { statut: 'positionne', palier: null, source: { passationId: pass.id, versionTest: pass.versionTest } })
};

export function lancerTest(profil, onQuitter) {
  return lancerDeroule(CONFIG_TEST, profil, passationOuverte(profil.id), onQuitter);
}
