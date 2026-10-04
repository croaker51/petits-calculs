# Journal des versions — Petits Calculs

Format : `version` — date — contenu. Version affichée dans l'espace parent et inscrite dans chaque export.

## 0.3.2 — 2026-10-04
- Séances S1.2 (parcours N) : additions de dizaines reprises pas à pas. N1 à N4 : barres de dix visibles à l'écran (47 + 10, 30 + 20, 36 + 20, 23 + 14, 34 + 10, 32 + 25, 20 + 20, vérifications). N5 seulement sans barres (50 + 30, 56 + 10). Retirés pour plus tard : 70 − 20, 27 + 15 (retenue), ajouter 9.
- 15 phrases en voix de secours en attendant leur génération (11 nouvelles + 4 refusées au contrôle).

## 0.3.1 — 2026-10-04
- Correctif : l'oreille redit la consigne de l'exercice à tout moment, y compris après une 1re erreur (elle ne redisait que « Vérifie »). Pendant l'aide, elle redit l'explication.

## 0.3.0 — 2026-10-04
- Séances d'entraînement : 2 parcours (C « Décomposer et compléter », N « Nombres jusqu'à 100 et problèmes ») de 5 séances × 15 exercices, choisis par enfant dans l'espace parent ; enchaînement automatique, pause et reprise.
- Moteur commun au test et aux séances (deroule.js) ; le test reste identique.
- Option « Je ne sais pas » (séances) : bouton « ? » après la consigne, aide et explication immédiates, classement à part.
- Dés à 5 points (compléments à 5, doubles), droite graduée de 1 en 1.
- Voix : 350 phrases en voix clonée, contrôlées par transcription ; 4 phrases en voix de secours en attendant leur regénération (c2_01_e, n3_11_c, n3_12_c, n5_05_c).
- Espace parent : parcours par enfant, liste et résultats des séances, écran « Suivi » (compétences CP → CE2, acquis / en cours / non acquis, ★ essentielles, période).

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
