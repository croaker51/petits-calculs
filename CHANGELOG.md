# Journal des versions — Petits Calculs

Format : `version` — date — contenu. Version affichée dans l'espace parent et inscrite dans chaque export.

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
