// Espace parent : protégé par code, configuration des profils, résultats, export.
import * as S from '../stockage.js';
import { afficher, $, $$, esc, ICONES } from '../ui.js';
import { dessin, AVATARS, THEMES, LIBELLES } from '../themes.js';
import { ITEMS, LIBELLES_CLASSEMENT, synthese } from '../test/items.js';
import { APP_VERSION, SCHEMA_VERSION } from '../version.js';
import { infoAudio, dire, arreter, deverrouillerAudio } from '../audio.js';

let retourEnfants = null;

export function ouvrirParent(onRetour) {
  retourEnfants = onRetour;
  arreter();
  if (!S.codeEstDefini()) return ecranCreationCode();
  ecranCode();
}

// ---------- Code ----------
function paveCode(titre, sousTitre, onComplet) {
  afficher(`
    <div class="parent ecran-code">
      <h1>${titre}</h1>
      <p class="aide-texte">${sousTitre}</p>
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
    if (code.length === 4) { const c = code; code = ''; setTimeout(maj, 250); onComplet(c); }
  });
  $('#effacer').onclick = () => { code = code.slice(0, -1); maj(); };
  $('#annuler').onclick = () => { if (S.getProfils().length) retourEnfants(); };
}

function ecranCode() {
  let echecs = 0;
  paveCode('Espace parent', 'Entrez le code à 4 chiffres.', async c => {
    if (await S.verifierCode(c)) return tableauDeBord();
    echecs++;
    $('#message').textContent = echecs >= 3 ? 'Code incorrect. (Oubli : voir « Code oublié » dans le README.)' : 'Code incorrect.';
  });
}

function ecranCreationCode() {
  paveCode('Bienvenue', 'Choisissez un code parent à 4 chiffres.', c1 => {
    paveCode('Confirmation', 'Entrez le même code une 2e fois.', async c2 => {
      if (c1 !== c2) { ecranCreationCode(); $('#message').textContent = 'Les deux codes sont différents. Recommencez.'; return; }
      await S.definirCode(c1);
      S.journaliser('code-defini');
      if (!S.getProfils().length) return editerProfil(null);
      tableauDeBord();
    });
  });
}

// ---------- Tableau de bord ----------
function etatTest(profilId) {
  const ps = S.getPassations(profilId, 'positionnement');
  const fini = ps.filter(p => p.statut === 'termine').pop();
  const ouvert = ps.find(p => p.statut !== 'termine');
  if (ouvert) return { libelle: `Test en ${ouvert.statut === 'pause' ? 'pause' : 'cours'} (${ouvert.items.length}/${ITEMS.length})`, pass: ouvert };
  if (fini) return { libelle: `Test terminé le ${new Date(fini.fin).toLocaleDateString('fr-FR')}`, pass: fini };
  return { libelle: 'Test à faire', pass: null };
}

function tableauDeBord() {
  const profils = S.getProfils();
  afficher(`
    <div class="parent">
      <header class="entete-parent">
        <h1>Espace parent</h1>
        <button class="btn-texte" id="sortir">${ICONES.maison} Enfants</button>
      </header>
      ${S.estStockageDisponible() ? '' : '<p class="alerte">Attention : le stockage de l\'iPhone est indisponible. Les résultats seront perdus à la fermeture. Exportez-les.</p>'}
      <section>
        <h2>Enfants</h2>
        ${profils.map(p => {
          const e = etatTest(p.id);
          return `<div class="carte-profil">
            <div class="cp-tete">${dessin(p.avatar, 52)}<div><b>${esc(p.prenom)}</b><br><small>${e.libelle}</small></div></div>
            <div class="cp-actions">
              ${e.pass ? `<button class="btn-texte" data-res="${e.pass.id}">Résultats</button>` : ''}
              <button class="btn-texte" data-edit="${p.id}">Modifier</button>
            </div></div>`;
        }).join('')}
        <button class="btn-plein" id="ajouter">+ Ajouter un enfant</button>
      </section>
      <section>
        <h2>Sauvegarde et suivi</h2>
        <p class="aide-texte">L'export crée un fichier avec tous les résultats, la version de l'appli et le niveau de chaque enfant.
        Enregistrez-le dans le dossier <b>resultats</b> du projet (iCloud Drive) : Claude pourra le lire pour les mises à jour.</p>
        <button class="btn-plein" id="exporter">Exporter les résultats</button>
        <label class="btn-texte btn-fichier">Importer une sauvegarde<input type="file" id="importer" accept=".json,application/json" hidden></label>
        <p class="message" id="msg-export"></p>
      </section>
      <section>
        <h2>Réglages</h2>
        <button class="btn-texte" id="voix">Tester la voix</button>
        <button class="btn-texte" id="changer-code">Changer le code</button>
        <p class="aide-texte" id="info-version">Version ${APP_VERSION} · format de données ${SCHEMA_VERSION}</p>
      </section>
    </div>`, 'mode-parent');

  $('#sortir').onclick = () => retourEnfants();
  $('#ajouter').onclick = () => editerProfil(null);
  $$('[data-edit]').forEach(b => b.onclick = () => editerProfil(b.dataset.edit));
  $$('[data-res]').forEach(b => b.onclick = () => resultats(b.dataset.res));
  $('#exporter').onclick = exporter;
  $('#importer').onchange = importer;
  $('#changer-code').onclick = ecranCreationCode;
  $('#voix').onclick = () => {
    deverrouillerAudio();
    const i = infoAudio();
    $('#info-version').innerHTML = `Version ${APP_VERSION} · format ${SCHEMA_VERSION}<br>Voix fichiers : ${i.voixFichiers || 'aucune'} (${i.nbFichiers} phrases) · secours : ${esc(i.voixSecours)}`;
    dire(['bonjour_koala', 'i14_c']);
  };
}

// ---------- Profil ----------
function editerProfil(id) {
  const p = id ? S.getProfil(id) : { prenom: '', avatar: AVATARS[0], themes: [] };
  let avatar = p.avatar, themes = [...p.themes];
  afficher(`
    <div class="parent">
      <header class="entete-parent"><h1>${id ? 'Modifier' : 'Nouvel enfant'}</h1></header>
      <section>
        <label class="champ">Prénom (affiché à l'écran, jamais prononcé)
          <input type="text" id="prenom" value="${esc(p.prenom)}" maxlength="20" autocomplete="off"></label>
        <h2>Son personnage</h2>
        <div class="grille-choix" id="avatars">${AVATARS.map(a =>
          `<button class="case-choix ${a === avatar ? 'choisi' : ''}" data-a="${a}">${dessin(a, 56)}<small>${LIBELLES[a]}</small></button>`).join('')}</div>
        <h2>Ce qu'il/elle aime (décor)</h2>
        <div class="grille-choix" id="themes">${THEMES.map(t =>
          `<button class="case-choix ${themes.includes(t) ? 'choisi' : ''}" data-t="${t}">${dessin(t, 44)}<small>${LIBELLES[t]}</small></button>`).join('')}</div>
        <p class="message" id="message"></p>
        <button class="btn-plein" id="enregistrer">Enregistrer</button>
        ${id ? '<button class="btn-texte danger" id="raz-test">Effacer le test de positionnement de cet enfant</button>' : ''}
        <button class="btn-texte" id="annuler">Annuler</button>
      </section>
    </div>`, 'mode-parent');
  $$('#avatars .case-choix').forEach(b => b.onclick = () => {
    avatar = b.dataset.a; $$('#avatars .case-choix').forEach(x => x.classList.toggle('choisi', x === b));
  });
  $$('#themes .case-choix').forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    themes = themes.includes(t) ? themes.filter(x => x !== t) : [...themes, t];
    b.classList.toggle('choisi', themes.includes(t));
  });
  $('#enregistrer').onclick = () => {
    const prenom = $('#prenom').value.trim();
    if (!prenom) { $('#message').textContent = 'Indiquez un prénom.'; return; }
    if (id) S.modifierProfil(id, { prenom, avatar, themes });
    else S.ajouterProfil({ prenom, avatar, themes });
    tableauDeBord();
  };
  $('#annuler').onclick = () => S.getProfils().length ? tableauDeBord() : editerProfil(null);
  const raz = $('#raz-test');
  if (raz) raz.onclick = () => {
    if (raz.dataset.confirme !== '1') { raz.dataset.confirme = '1'; raz.textContent = 'Toucher encore pour confirmer (définitif)'; return; }
    S.getPassations(id, 'positionnement').forEach(x => S.supprimerPassation(x.id));
    S.definirNiveau(id, { statut: 'test-a-faire', palier: null, source: 'remise-a-zero-parent' });
    tableauDeBord();
  };
}

// ---------- Résultats ----------
function fmtTemps(ms) { return ms == null ? '' : (ms / 1000).toFixed(1).replace('.', ',') + ' s'; }
function fmtRep(r) {
  if (r == null) return '—';
  if (typeof r === 'object') return `${r.barres} b + ${r.cubes} c`;
  return String(r);
}

function resultats(passId) {
  const pass = S.getPassation(passId);
  const p = S.getProfil(pass.profilId);
  const syn = synthese(pass.items);
  const lignes = ITEMS.map(it => {
    const r = pass.items.find(x => x.itemId === it.id);
    const cl = r ? r.classement : 'non-passe';
    const e1 = r && r.essais[0], e2 = r && r.essais[1];
    const notes = [];
    if (r && r.essais.some(e => e.avantFinConsigne)) notes.push('a répondu pendant la consigne');
    if (r && r.essai2PeuSignificatif && cl === 'reussi-2e') notes.push('2e essai peu significatif (choix)');
    if (r && it.canonique && r.essais.some(e => e.juste && e.canonique === false)) notes.push('juste mais sans la forme 5 barres + 3 cubes');
    return `<tr class="cl-${cl}">
      <td><b>${it.id.slice(1)}</b> ${esc(it.libelle)}<br><small>${esc(it.domaine)}</small>${notes.length ? `<br><small class="note">${notes.join(' · ')}</small>` : ''}</td>
      <td>${esc(String(it.attendu))}</td>
      <td>${e1 ? `${fmtRep(e1.reponse)}<br><small>${fmtTemps(e1.tempsMs)}</small>` : ''}</td>
      <td>${e2 ? `${fmtRep(e2.reponse)}<br><small>${fmtTemps(e2.tempsMs)}</small>` : ''}</td>
      <td><span class="pastille"></span>${LIBELLES_CLASSEMENT[cl]}</td></tr>`;
  }).join('');
  const faits = syn.total - syn['non-passe'];
  afficher(`
    <div class="parent">
      <header class="entete-parent"><h1>${esc(p.prenom)} — test ${esc(pass.versionTest)}</h1>
        <button class="btn-texte" id="retour">Retour</button></header>
      <section class="synthese">
        <div class="kpi cl-reussi-1er"><b>${syn['reussi-1er']}</b><small>du 1er coup</small></div>
        <div class="kpi cl-reussi-2e"><b>${syn['reussi-2e']}</b><small>au 2e essai</small></div>
        <div class="kpi cl-non-acquis"><b>${syn['non-acquis']}</b><small>non acquis</small></div>
        <div class="kpi"><b>${faits}/${syn.total}</b><small>passés</small></div>
      </section>
      <p class="aide-texte">Commencé le ${new Date(pass.debut).toLocaleString('fr-FR')}${pass.fin ? ' · fini le ' + new Date(pass.fin).toLocaleString('fr-FR') : ''} · appli ${esc(pass.appVersion)}.
      « Réussi au 2e essai » = l'enfant savait mais s'est précipité. Le temps est compté depuis la fin de la consigne orale.</p>
      <div class="table-defile"><table class="resultats">
        <thead><tr><th>Item</th><th>Attendu</th><th>1er essai</th><th>2e essai</th><th>Bilan</th></tr></thead>
        <tbody>${lignes}</tbody></table></div>
    </div>`, 'mode-parent');
  $('#retour').onclick = tableauDeBord;
}

// ---------- Export / import ----------
async function exporter() {
  const donnees = S.construireExport();
  const d = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const nom = `petits-calculs_export_${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}.json`;
  const texte = JSON.stringify(donnees, null, 2);
  const fichier = new File([texte], nom, { type: 'application/json' });
  const msg = $('#msg-export');
  try {
    // iPhone : feuille de partage → « Enregistrer dans Fichiers » → iCloud Drive.
    if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
      await navigator.share({ files: [fichier] }); // sans titre : sinon iOS enregistre aussi un fichier texte
      S.journaliser('export', { fichier: nom });
      msg.textContent = 'Export prêt : ' + nom;
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') { msg.textContent = 'Export annulé.'; return; }
  }
  // Repli (ordinateur) : téléchargement direct.
  const url = URL.createObjectURL(fichier);
  const a = document.createElement('a');
  a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  S.journaliser('export', { fichier: nom });
  msg.textContent = 'Fichier téléchargé : ' + nom;
}

function importer(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try {
      S.importer(JSON.parse(lecteur.result));
      tableauDeBord();
      $('#msg-export').textContent = 'Sauvegarde importée.';
    } catch (err) {
      $('#msg-export').textContent = 'Import impossible : ' + err.message;
    }
  };
  lecteur.readAsText(f);
}
