# Journal des versions — Petits Calculs

Format : `version` — date — contenu. Version affichée dans l'espace parent et inscrite dans chaque export.

## 0.3.5 — 2026-10-04
- Séances S1.4 (parcours N), d'après le cahier d'école (10 + 4 écrit 41, 92 écrit « 902 », 8 + 2 → 9) : trois séances ajoutées après N5, items existants inchangés.
  - N6 : écrire sous la dictée les nombres 70-99 ; « 3 dizaines 5 unités » ; 10 + 4, 4 + 20 (pièges d'inversion 14 / 41, 35 / 53, 24 / 42).
  - N7 : dizaines entières sans barres (30 + 20 …), dizaines + unités (40 + 3, 3 + 50, 60 + 7), suites de 10 en 10 et de 5 en 5 (aussi à rebours), re-test « de plus que ».
  - N8 : calculer sans compter un par un : compléments à 5, passage par 5 (« une main = 5 »), doubles + 1.
- Nouveau dessin d'aide : la main (une main pleine marquée 5, puis les doigts restants ; partie cherchée en orange), seulement dans l'aide.
- Espace parent : temps du 1er essai sous chaque exercice, avec une barre qui le compare aux autres exercices de la passation, et temps médian des réussites du 1er coup (rien n'est montré à l'enfant).
- Voix : 121 nouvelles phrases en voix clonée (90 de S1.4 + 31 en attente depuis 0.3.2-0.3.4), contrôlées par transcription. 3 phrases refusées au contrôle (n4_10_c, n7_12_c : nombres absents ; n8_04_e : mots ajoutés) restent en voix de secours, texte légèrement modifié pour une nouvelle prise.

## 0.3.4 — 2026-10-04
- La scène ne dessine plus la réponse : plus d'emplacements vides (c1_02, c1_03, c1_05, c1_12, c2_03 : seuls les objets présents restent), plus de boîte de 10 dont les cases vides sont le nombre cherché (c2_01, c2_02, c2_05, c2_15, c3_01, c4_15 : calcul écrit seul). Ces supports passent dans l'aide, après 2 erreurs ou « ? ».
- Consignes c2_01, c2_02, c2_05, c2_15, c4_15 réécrites (plus de renvoi à la boîte) ; voix de secours en attendant la génération.
- Test automatique : aucune scène ne peut contenir d'emplacement vide ni de boîte qui donne la réponse.

## 0.3.3 — 2026-10-04
- Séances S1.3 (parcours C), d'après le cahier d'école : nombre manquant en PREMIÈRE position (« ? + 3 = 5 » avec un dé caché, puis sans support), presque-doubles dans les deux sens (4 + 5 puis 5 + 4), attention au signe moins (8 − 2). Remplacent c2_04, c2_07, c2_08, c3_03, c3_05, c3_06, c3_08 (lecture et écriture de nombres déjà réussies en classe).
- 29 phrases en voix de secours en attendant leur génération.

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
