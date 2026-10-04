// Espace parent : protégé par code, configuration des profils, résultats, export.
import * as S from '../stockage.js';
import { afficher, $, $$, esc, ICONES } from '../ui.js';
import { dessin, AVATARS, THEMES, LIBELLES } from '../themes.js';
import { ITEMS, LIBELLES_CLASSEMENT, synthese } from '../test/items.js';
import { PARCOURS } from '../seances/parcours.js';
import { LIBELLES_SEANCE, syntheseSeance } from '../seances/ne_sait_pas.js';
import { prochaineSeance, seancesTerminees } from '../seances/seance.js';
import { APP_VERSION, SCHEMA_VERSION } from '../version.js';
import { infoAudio, dire, arreter, deverrouillerAudio } from '../audio.js';
import { CLASSES, DOMAINES, AXES, SOURCE, periodeApprochee } from '../suivi/referentiel.js';
import { bilan, evolution, attenduMaintenant, CRITERE, LIBELLES_STATUT } from '../suivi/maitrise.js';

let retourEnfants = null;

export function ouvrirParent(onRetour) {
  retourEnfants = onRetour;
  arreter();
  if (!S.codeEstDefini()) return ecranCreationCode();
  ecranCode();
}

// ---------- Code ----------
function paveCode(titre, sousTitre, onComplet, complement = '') {
  afficher(`
    <div class="parent ecran-code">
      <h1>${titre}</h1>
      <p class="aide-texte">${sousTitre}</p>
      ${complement}
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

// Diagnostic du stockage (v0.2.3) : sert à comprendre une perte de données sur l'iPhone.
function texteDiagnostic() {
  const d = S.getDiagnostic();
  const h = iso => iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
  return `Lancement n° ${d.lancement} · écran d'accueil : ${d.ecranAccueil ? 'oui' : 'non'} · stockage protégé : ${esc(d.persistant)}<br>
    Au démarrage — localStorage : ${esc(d.localStorage)} · IndexedDB : ${esc(d.indexedDB)} · source : ${esc(d.source)}<br>
    Dernière écriture : ${h(d.derniereEcriture)} (localStorage ${esc(d.ecritureLS || '—')}, IndexedDB ${esc(d.ecritureIDB || '—')})
    ${d.alertes.map(a => `<br><b>${esc(a)}</b>`).join('')}`;
}

function ecranCreationCode() {
  const d = S.getDiagnostic();
  // Démarrage à vide alors que l'appli a déjà servi : on le dit, et on propose de restaurer.
  const perte = !S.getProfils().length && d.lancementsPrecedents > 0;
  const complement = perte ? `
      <div class="alerte alerte-perte">Les données ont disparu (ouverture n° ${d.lancement} sur cet iPhone).
      <label class="btn-texte btn-fichier">Restaurer une sauvegarde (.json)<input type="file" id="restaurer" accept=".json,application/json" hidden></label></div>` : '';
  paveCode('Bienvenue', 'Choisissez un code parent à 4 chiffres.', c1 => {
    paveCode('Confirmation', 'Entrez le même code une 2e fois.', async c2 => {
      if (c1 !== c2) { ecranCreationCode(); $('#message').textContent = 'Les deux codes sont différents. Recommencez.'; return; }
      await S.definirCode(c1);
      S.journaliser('code-defini');
      if (!S.getProfils().length) return editerProfil(null);
      tableauDeBord();
    });
  }, complement);
  const r = $('#restaurer');
  if (r) r.onchange = e => lireFichier(e, () => {
    ecranCreationCode();
    $('#message').textContent = 'Sauvegarde restaurée. Choisissez maintenant le code parent.';
  }, err => { $('#message').textContent = 'Restauration impossible : ' + err.message; });
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

function etatSeances(p) {
  const parcours = PARCOURS[p.parcours];
  if (!parcours) return 'Parcours : à choisir (Modifier)';
  const faites = new Set(seancesTerminees(p.id).map(x => x.seanceId)).size;
  const pro = prochaineSeance(p);
  const ouverte = pro && pro.passation;
  return `Parcours ${parcours.code} · ${faites}/${parcours.seances.length} séances` +
    (ouverte ? ` · ${pro.seance.id} en pause (${ouverte.items.length}/${pro.seance.items.length})` : pro ? ` · prochaine : ${pro.seance.id}` : ' · parcours terminé');
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
            <div class="cp-tete">${dessin(p.avatar, 52)}<div><b>${esc(p.prenom)}</b><br><small>${e.libelle}</small><br><small>${etatSeances(p)}</small></div></div>
            <div class="cp-actions">
              ${e.pass ? `<button class="btn-texte" data-res="${e.pass.id}">Test</button>` : ''}
              ${p.parcours ? `<button class="btn-texte" data-seances="${p.id}">Séances</button>` : ''}
              <button class="btn-texte" data-suivi="${p.id}">Suivi</button>
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
      <section>
        <h2>Stockage (diagnostic)</h2>
        <p class="aide-texte">${texteDiagnostic()}</p>
      </section>
    </div>`, 'mode-parent');

  $('#sortir').onclick = () => retourEnfants();
  $('#ajouter').onclick = () => editerProfil(null);
  $$('[data-edit]').forEach(b => b.onclick = () => editerProfil(b.dataset.edit));
  $$('[data-res]').forEach(b => b.onclick = () => resultats(b.dataset.res));
  $$('[data-suivi]').forEach(b => b.onclick = () => suivi(b.dataset.suivi));
  $$('[data-seances]').forEach(b => b.onclick = () => listeSeances(b.dataset.seances));
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
  const p = id ? S.getProfil(id) : { prenom: '', avatar: AVATARS[0], themes: [], parcours: null };
  let avatar = p.avatar, themes = [...p.themes], parcours = p.parcours || null;
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
        <h2>Parcours de séances</h2>
        <p class="aide-texte">Les séances commencent après le test de départ. Un parcours se suit dans l'ordre.</p>
        <div class="choix-parcours" id="parcours">
          ${Object.values(PARCOURS).map(pc => `<button class="case-choix large ${pc.code === parcours ? 'choisi' : ''}" data-pc="${pc.code}">
            <b>Parcours ${pc.code}</b><small>${esc(pc.titre)} · ${pc.seances.length} séances</small></button>`).join('')}
          <button class="case-choix large ${!parcours ? 'choisi' : ''}" data-pc=""><b>Aucun pour l'instant</b></button>
        </div>
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
  $$('#parcours .case-choix').forEach(b => b.onclick = () => {
    parcours = b.dataset.pc || null; $$('#parcours .case-choix').forEach(x => x.classList.toggle('choisi', x === b));
  });
  $('#enregistrer').onclick = () => {
    const prenom = $('#prenom').value.trim();
    if (!prenom) { $('#message').textContent = 'Indiquez un prénom.'; return; }
    if (id) S.modifierProfil(id, { prenom, avatar, themes, parcours });
    else { const n = S.ajouterProfil({ prenom, avatar, themes }); S.modifierProfil(n.id, { parcours }); }
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

// Items, libellés et synthèse d'une passation (test ou séance).
function contexteResultats(pass) {
  if (pass.type === 'seance') {
    const pc = PARCOURS[pass.parcours];
    const se = pc && pc.seances.find(x => x.id === pass.seanceId);
    return { items: se ? se.items : [], libelles: LIBELLES_SEANCE, syn: syntheseSeance(pass.items),
      titre: `séance ${pass.seanceId}`, objectif: se ? se.objectif : '' };
  }
  return { items: ITEMS, libelles: LIBELLES_CLASSEMENT, syn: synthese(pass.items), titre: `test ${pass.versionTest}`, objectif: '' };
}

function resultats(passId, retour = tableauDeBord) {
  const pass = S.getPassation(passId);
  const p = S.getProfil(pass.profilId);
  const ctx = contexteResultats(pass);
  const syn = ctx.syn;
  const lignes = ctx.items.map(it => {
    const r = pass.items.find(x => x.itemId === it.id);
    const cl = r ? r.classement : 'non-passe';
    const e1 = r && r.essais[0], e2 = r && r.essais[1];
    const notes = [];
    if (r && r.essais.some(e => e.avantFinConsigne)) notes.push('a répondu pendant la consigne');
    if (r && r.essai2PeuSignificatif && cl === 'reussi-2e') notes.push('2e essai peu significatif (choix)');
    if (r && it.canonique && r.essais.some(e => e.juste && e.canonique === false)) notes.push('juste mais pas sous la forme dizaines + unités');
    if (r && r.neSaitPas) notes.push(`« je ne sais pas » après ${fmtTemps(r.neSaitPas.tempsMs)}`);
    return `<tr class="cl-${cl}">
      <td><b>${esc(it.id)}</b> ${esc(it.libelle)}<br><small>${esc(it.domaine)}</small>${notes.length ? `<br><small class="note">${notes.join(' · ')}</small>` : ''}</td>
      <td>${esc(String(it.attendu))}</td>
      <td>${e1 ? `${fmtRep(e1.reponse)}<br><small>${fmtTemps(e1.tempsMs)}</small>` : ''}</td>
      <td>${e2 ? `${fmtRep(e2.reponse)}<br><small>${fmtTemps(e2.tempsMs)}</small>` : ''}</td>
      <td><span class="pastille"></span>${ctx.libelles[cl] || cl}</td></tr>`;
  }).join('');
  const total = ctx.items.length;
  const faits = pass.items.length;
  const nsp = (syn['ne-sait-pas'] || 0) + (syn['ne-sait-pas-apres-erreur'] || 0);
  afficher(`
    <div class="parent">
      <header class="entete-parent"><h1>${esc(p.prenom)} — ${esc(ctx.titre)}</h1>
        <button class="btn-texte" id="retour">Retour</button></header>
      ${ctx.objectif ? `<p class="aide-texte">${esc(ctx.objectif)}</p>` : ''}
      <section class="synthese">
        <div class="kpi cl-reussi-1er"><b>${syn['reussi-1er']}</b><small>du 1er coup</small></div>
        <div class="kpi cl-reussi-2e"><b>${syn['reussi-2e']}</b><small>au 2e essai</small></div>
        <div class="kpi cl-non-acquis"><b>${syn['non-acquis']}</b><small>non acquis</small></div>
        ${pass.type === 'seance' ? `<div class="kpi cl-ne-sait-pas"><b>${nsp}</b><small>« je ne sais pas »</small></div>` : ''}
        <div class="kpi"><b>${faits}/${total}</b><small>passés</small></div>
      </section>
      <p class="aide-texte">Commencé le ${new Date(pass.debut).toLocaleString('fr-FR')}${pass.fin ? ' · fini le ' + new Date(pass.fin).toLocaleString('fr-FR') : ''} · appli ${esc(pass.appVersion)}.
      « Réussi au 2e essai » = l'enfant savait mais s'est précipité. Le temps est compté depuis la fin de la consigne orale.</p>
      <div class="table-defile"><table class="resultats">
        <thead><tr><th>Item</th><th>Attendu</th><th>1er essai</th><th>2e essai</th><th>Bilan</th></tr></thead>
        <tbody>${lignes}</tbody></table></div>
    </div>`, 'mode-parent');
  $('#retour').onclick = () => retour();
}

// Liste des séances du parcours d'un enfant, avec leur état et l'accès aux résultats.
function listeSeances(profilId) {
  const p = S.getProfil(profilId);
  const pc = PARCOURS[p.parcours];
  const passations = S.getPassations(profilId, 'seance');
  const lignes = pc.seances.map(se => {
    const ps = passations.filter(x => x.seanceId === se.id);
    const fini = ps.filter(x => x.statut === 'termine').pop();
    const ouvert = ps.find(x => x.statut !== 'termine');
    const pass = fini || ouvert;
    const syn = pass ? syntheseSeance(pass.items) : null;
    const etat = fini ? `Terminée le ${new Date(fini.fin).toLocaleDateString('fr-FR')} · ${syn['reussi-1er']}/${se.items.length} du 1er coup`
      : ouvert ? `En pause (${ouvert.items.length}/${se.items.length})` : 'Pas encore faite';
    return `<div class="carte-profil"><div><b>${se.id}</b> <small>${esc(se.objectif)}</small><br><small>${etat}</small></div>
      ${pass ? `<div class="cp-actions"><button class="btn-texte" data-res="${pass.id}">Résultats</button></div>` : ''}</div>`;
  }).join('');
  afficher(`
    <div class="parent">
      <header class="entete-parent"><h1>${esc(p.prenom)} — parcours ${pc.code}</h1>
        <button class="btn-texte" id="retour">Retour</button></header>
      <p class="aide-texte">${esc(pc.titre)}. Les séances s'enchaînent dans l'ordre ; une séance en pause est reprise là où elle s'est arrêtée.</p>
      <section>${lignes}</section>
    </div>`, 'mode-parent');
  $('#retour').onclick = tableauDeBord;
  $$('[data-res]').forEach(b => b.onclick = () => resultats(b.dataset.res, () => listeSeances(profilId)));
}

// ---------- Suivi du niveau : compétences CP → CE2, statut, essentielles ----------
function suivi(profilId) {
  const p = S.getProfil(profilId);
  const reg = S.getReglages();
  const periode = reg.periode || periodeApprochee();
  const essSeules = !!reg.essentiellesSeules;
  const passations = S.getPassations(profilId).filter(x => (x.items || []).length);
  const tout = bilan(passations);
  const lignes = essSeules ? tout.filter(l => l.essentielle) : tout;
  const ess = tout.filter(l => l.essentielle);
  const cp = tout.filter(l => l.classe === 'CP');
  const compte = (ls, st) => ls.filter(l => l.statut === st).length;
  const enRetard = cp.filter(l => attenduMaintenant(l, periode) && l.statut !== 'acquis');
  const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
  const ev = evolution(passations);

  const ligne = l => `
    <div class="ligne-suivi st-${l.statut}${l.essentielle ? ' essentielle' : ''}">
      <span class="pastille" aria-hidden="true"></span>
      <div><div class="lib-comp">${l.essentielle ? `<span class="etoile-ess" title="Essentielle">★</span> ` : ''}${esc(l.libelle)}</div>
        <small class="statut">${LIBELLES_STATUT[l.statut]}${l.dateAcquisition ? ` le ${fmtDate(l.dateAcquisition)}` : ''}</small>
        <small>${l.observations ? `${l.reussis}/${l.fenetre} au 1er coup (dernières obs.) · ${l.passations} passation(s) · ` : ''}${
          l.essentielle ? esc(AXES[l.axe]) + ' · ' : ''}${l.classe === 'CP' ? (l.periode ? `attendu au plus tard en P${l.periode}` : 'attendu en fin de CP') : l.classe === 'Hors programme' ? 'hors programme' : 'attendu en fin de ' + l.classe}${
          attenduMaintenant(l, periode) && l.statut !== 'acquis' ? ' · <b class="rouge">attendue maintenant</b>' : ''}</small></div>
    </div>`;

  const blocs = CLASSES.map(cl => {
    const lc = lignes.filter(l => l.classe === cl);
    if (!lc.length) return '';
    const tc = tout.filter(l => l.classe === cl);
    const contenu = Object.entries(DOMAINES).map(([d, nom]) => {
      const ld = lc.filter(l => l.domaine === d);
      return ld.length ? `<h4>${nom}</h4>${ld.map(ligne).join('')}` : '';
    }).join('');
    return `<details class="bloc-classe" ${cl === 'CP' ? 'open' : ''}>
      <summary><b>${cl}</b> <small>${compte(tc, 'acquis')} acquis · ${compte(tc, 'en-cours')} en cours · ${compte(tc, 'non-acquis')} non acquis · ${tc.length} compétences</small></summary>
      ${contenu}</details>`;
  }).join('');

  afficher(`
    <div class="parent">
      <header class="entete-parent">
        <h1>Suivi — ${esc(p.prenom)}</h1>
        <button class="btn-texte" id="retour-tdb">${ICONES.maison} Retour</button>
      </header>
      <section>
        <div class="resume-suivi">
          <div class="ess"><b>${compte(ess, 'acquis')}<span>/${ess.length}</span></b><small>★ essentielles acquises</small></div>
          <div><b>${compte(cp, 'acquis')}<span>/${cp.length}</span></b><small>compétences CP acquises</small></div>
          <div class="alerte-num"><b>${enRetard.length}</b><small>attendues maintenant, non acquises</small></div>
        </div>
        <p class="aide-texte">★ <b>Essentielle</b> = aisance avec les nombres et compréhension (sens du nombre, flexibilité de calcul,
          sens des opérations, modéliser un problème). C'est un choix du projet, pas une mention du programme.</p>
        <div class="choix-periode">
          <button class="btn-texte ${essSeules ? 'actif' : ''}" id="filtre-ess">★ Essentielles seulement</button>
        </div>
        <p class="aide-texte">Période actuelle ${reg.periode ? '(choisie)' : '(approximation d\'après le mois)'} :</p>
        <div class="choix-periode">${[1, 2, 3, 4, 5].map(n =>
          `<button class="btn-texte ${n === periode ? 'actif' : ''}" data-per="${n}">P${n}</button>`).join('')}</div>
      </section>
      <section>${blocs}</section>
      <section>
        <h2>Évolution</h2>
        ${ev.length ? `<table class="resultats tab-evolution"><thead><tr><th>Date</th><th>★ acquises</th><th>Acquis</th><th>En cours</th><th>Non acquis</th></tr></thead><tbody>
          ${ev.map(x => `<tr><td>${fmtDate(x.date)}</td><td>${x.essentiellesAcquises}</td><td>${x.acquis}</td><td>${x.enCours}</td><td>${x.nonAcquis}</td></tr>`).join('')}</tbody></table>`
          : '<p class="aide-texte">Aucune passation terminée.</p>'}
        <p class="aide-texte"><b>Acquis</b> : au moins ${CRITERE.reussis} réussites du 1er coup sur les ${CRITERE.fenetre} dernières observations,
          sur au moins ${CRITERE.passations} passations. <b>Non acquis</b> : au moins ${CRITERE.minNonAcquis} observations et moins de la moitié
          réussies du 1er coup. <b>En cours</b> : entre les deux.</p>
        <p class="aide-texte">Référence : ${esc(SOURCE)}. Au CP, le programme ne date que deux étapes (nombres jusqu'à 59 au plus tard
          en P2, jusqu'à 100 au plus tard en P3) ; le reste est attendu en fin d'année.</p>
      </section>
    </div>`, 'mode-parent');
  $('#retour-tdb').onclick = tableauDeBord;
  $('#filtre-ess').onclick = () => { S.definirReglage('essentiellesSeules', !essSeules); suivi(profilId); };
  $$('[data-per]').forEach(b => b.onclick = () => { S.definirReglage('periode', +b.dataset.per); suivi(profilId); });
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

function lireFichier(e, onSucces, onErreur) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try { S.importer(JSON.parse(lecteur.result)); onSucces(); }
    catch (err) { onErreur(err); }
  };
  lecteur.readAsText(f);
}

function importer(e) {
  lireFichier(e, () => {
    tableauDeBord();
    $('#msg-export').textContent = 'Sauvegarde importée.';
  }, err => { $('#msg-export').textContent = 'Import impossible : ' + err.message; });
}
