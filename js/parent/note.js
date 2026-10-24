// Note du parent sur une passation (demande de Simon du 11/10/2026).
// Ouverte depuis l'écran de fin d'une séance (avec le code parent) ou depuis les résultats de l'espace
// parent (déjà déverrouillé). Côté parent : clavier système admis (règle A4), rien n'est lu à voix haute.
// Le texte peut contenir un prénom : il reste sur l'iPhone et dans l'export (règle A9 : jamais dans le dépôt).
import * as S from '../stockage.js';
import { afficher, $, $$, esc, ICONES } from '../ui.js';
import { itemsRatesPremierEssai, estErreurToucher } from '../suivi/annotations.js';

const fmtRep = r => r == null ? '—' : typeof r === 'object' ? `${r.barres} b + ${r.cubes} c` : String(r);

// pass : passation ; items : définitions des items (libellés) ; demanderCode : true depuis l'écran de fin.
export function ouvrirNoteParent(pass, items, { demanderCode = false, onFini }) {
  if (!demanderCode) return ecranNote(pass, items, onFini);
  // Sans code parent défini (cas impossible en usage normal) : pas de note.
  if (!S.codeEstDefini()) return onFini();
  ecranCodeNote(() => ecranNote(S.getPassation(pass.id) || pass, items, onFini), onFini);
}

// Pavé du code parent (même code que l'espace parent). Annuler → retour à l'écran de fin, rien n'est écrit.
function ecranCodeNote(onOk, onAnnuler) {
  afficher(`
    <div class="parent ecran-code">
      <h1>Note du parent</h1>
      <p class="aide-texte">Entrez le code parent à 4 chiffres.</p>
      <div class="points-code" id="points">${'<span></span>'.repeat(4)}</div>
      <div class="pave pave-code">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="touche" data-n="${n}">${n}</button>`).join('')}
        <button class="touche touche-effacer" id="effacer" aria-label="Effacer">${ICONES.effacer}</button>
        <button class="touche" data-n="0">0</button>
        <button class="touche" id="annuler" aria-label="Retour">${ICONES.maison}</button>
      </div>
      <p class="message" id="message"></p>
    </div>`, 'mode-parent');
  let code = '';
  const maj = () => $$('#points span').forEach((s, i) => s.classList.toggle('plein', i < code.length));
  $$('.touche[data-n]').forEach(b => b.onclick = async () => {
    if (code.length >= 4) return;
    code += b.dataset.n; maj();
    if (code.length < 4) return;
    const c = code; code = ''; setTimeout(maj, 250);
    if (await S.verifierCode(c)) onOk();
    else $('#message').textContent = 'Code incorrect.';
  });
  $('#effacer').onclick = () => { code = code.slice(0, -1); maj(); };
  $('#annuler').onclick = () => onAnnuler();
}

function titrePassation(pass) {
  const quoi = pass.type === 'seance' ? `séance ${pass.seanceId}` : `test ${pass.versionTest || ''}`;
  return `${quoi} du ${new Date(pass.debut).toLocaleDateString('fr-FR')}`;
}

export function ecranNote(pass, items, onFini) {
  const parId = Object.fromEntries((items || []).map(it => [it.id, it]));
  const rates = itemsRatesPremierEssai(pass);
  const ann = pass.annotations || {};
  const lignes = rates.map(r => {
    const it = parId[r.itemId] || {};
    const a = ann[r.itemId] || {};
    return `<div class="note-item" data-item="${esc(r.itemId)}">
      <div><b>${esc(r.itemId)}</b> ${esc(it.libelle || '')}<br>
        <small>Attendu : ${esc(String(r.attendu ?? it.attendu ?? ''))} · réponses : ${r.essais.map(e => esc(fmtRep(e.reponse))).join(', ')}</small></div>
      <label class="case-toucher"><input type="checkbox" data-toucher${estErreurToucher(pass, r.itemId) ? ' checked' : ''}>
        <span>Erreur de toucher (ne pas compter)</span></label>
      <input type="text" class="champ-note" data-note maxlength="200" placeholder="Commentaire (facultatif)" value="${esc(a.note || '')}" autocomplete="off">
    </div>`;
  }).join('');
  afficher(`
    <div class="parent note-parent">
      <header class="entete-parent"><h1>Note du parent</h1></header>
      <p class="aide-texte">${esc(titrePassation(pass))}. L'appli ne voit que les réponses : notez ce que vous avez vu.
      Un exercice marqué « erreur de toucher » ne compte pas dans le Suivi (ni réussi, ni raté) ; la réponse saisie reste visible.</p>
      <section>
        <h2>Commentaire sur la séance</h2>
        <textarea id="commentaire" rows="4" maxlength="1000" placeholder="Ce que vous avez observé (facultatif)">${esc((pass.commentaireParent && pass.commentaireParent.texte) || '')}</textarea>
      </section>
      <section>
        <h2>Exercices ratés au 1er essai</h2>
        ${lignes || '<p class="aide-texte">Aucun exercice raté au 1er essai.</p>'}
      </section>
      <button class="btn-plein" id="enregistrer">Enregistrer</button>
      <button class="btn-texte btn-annuler-note" id="annulerNote">Annuler</button>
    </div>`, 'mode-parent');
  $('#annulerNote').onclick = () => onFini();
  $('#enregistrer').onclick = () => {
    const annotations = {};
    $$('.note-item').forEach(d => {
      annotations[d.dataset.item] = { toucher: $('[data-toucher]', d).checked, note: $('[data-note]', d).value };
    });
    S.noterPassation(pass.id, { commentaire: $('#commentaire').value, annotations });
    onFini();
  };
}
