# Journal des versions — Petits Calculs

Format : `version` — date — contenu. Version affichée dans l'espace parent et inscrite dans chaque export.

## [Non publié] — séances S1.0
- Contenu de 6 séances (2 parcours × 3 × 15 items), phrases, tests `test_seances.mjs`, fiche de relecture. Moteur de séance (J2) et voix à faire.

## 0.2.3 — 2026-10-04
- Correctif : les profils disparaissaient à chaque réouverture. Double sauvegarde (localStorage + IndexedDB), plus jamais d'écriture d'un état vide au démarrage, réécriture en arrière-plan, stockage persistant demandé.
- Diagnostic du stockage dans l'espace parent et dans l'export ; restauration d'une sauvegarde proposée au démarrage si les données ont disparu.
- Contenu des séances S1.0 présent dans le code mais pas encore accessible (moteur à venir).

## 0.2.2 — 2026-10-03
- Correctif : l'étoile / le « ? » de retour ne masquent plus la zone de saisie (déplacés en haut à droite, disparition automatique).
- Correctif : l'export iPhone ne crée plus de fichier texte parasite en plus du JSON.

## 0.2.1 — 2026-10-03
- Voix : 49 phrases en voix clonée (MimikaStudio, Qwen3-TTS 1.7B), contrôlées par transcription automatique (tous les nombres conformes).
- Outils : importer_audio.py, generer_voix_mimika.py (+ .command), verifier_audio.py.

## 0.2.0 — 2026-10-03
- Première version utilisable.
- Deux profils enfants en parallèle (prénom, personnage, thèmes favoris), saisis sur l'iPhone.
- Espace parent protégé par code (stocké haché).
- Test de positionnement T1.0 : 15 items fixes, 2 essais, temps mesuré en silence, pause / reprise.
- Classement par item : réussi du 1er coup / réussi au 2e essai (précipitation) / non acquis.
- Résultats détaillés côté parent ; export JSON (version appli + format + niveau) et import.
- Audio : fichiers MP3 pré-générés (voix neuronale) avec repli sur la voix de l'iPhone.
- Fonctionnement hors-ligne (service worker).
