// Toutes les phrases dites par l'appli. Identifiant -> texte.
// Les MP3 sont générés à partir de ce fichier (outils/generer_audio.py).
// Les nombres sont écrits en LETTRES pour que la voix les lise correctement.
// Toute modification d'un texte impose de régénérer l'audio.
export const PHRASES = {
  // --- Accueil ---
  qui_joue: "Qui joue aujourd'hui ? Touche ton image.",
  bonjour_koala: "Bonjour petit koala !",
  bonjour_panda: "Bonjour petit panda !",
  bonjour_licorne: "Bonjour petite licorne !",
  bonjour_chiot: "Bonjour petit chiot !",
  accueil_test: "Aujourd'hui, on fait le grand jeu de départ. Touche le bouton vert pour commencer.",
  accueil_reprise: "Ton jeu t'attend. Touche le bouton vert pour continuer.",
  accueil_fini: "Tu as fini le grand jeu de départ. Bravo ! Les prochains jeux arrivent bientôt.",

  // --- Test : cadre ---
  test_intro: "On va faire un petit jeu, pour voir tout ce que tu sais déjà. Écoute bien chaque question. Prends ton temps : ce n'est pas une course. Si tu veux réécouter, touche l'oreille.",
  test_reprise: "On reprend là où on s'était arrêtés.",
  test_pause: "On fait une pause. À tout à l'heure !",
  test_fin: "Bravo, le jeu est fini ! Tu as très bien travaillé. Tu peux aller le dire à un grand.",

  // --- Retours (règle B5 : neutres sur l'erreur, valorisants sur la démarche) ---
  verifie: "Hum… vérifie bien. Regarde encore, et essaie une autre fois.",
  bravo_1: "Bravo !",
  bravo_2: "Très bien !",
  bravo_3: "Oui, c'est ça !",
  bravo_verifie: "Bravo, tu as vérifié, et tu as trouvé !",
  aide_intro: "Ce n'est pas grave. Regarde, je t'explique.",
  suivant: "Touche la flèche pour continuer.",

  // --- Items du test de positionnement (T1) ---
  i01_c: "Regarde bien. Combien y en a-t-il ? Tape le nombre, puis touche le bouton vert.",
  i01_e: "Il y en a cinq, comme sur un dé.",
  i02_c: "Compte bien. Combien y en a-t-il en tout ?",
  i02_e: "Il y en a quatorze. Pour bien compter, on touche chaque image une seule fois.",
  i03_c: "Quel nombre vient juste après trente-neuf ?",
  i03_e: "Après trente-neuf, il y a quarante.",
  i04_c: "Quel nombre vient juste après quatre-vingt-neuf ?",
  i04_e: "Après quatre-vingt-neuf, il y a quatre-vingt-dix.",
  i05_c: "Chaque grande barre a dix cubes. Combien y a-t-il de cubes en tout ?",
  i05_e: "Quatre barres de dix, ça fait quarante. Plus sept petits cubes : quarante-sept.",
  i06_c: "Montre le nombre cinquante-trois, avec des barres de dix et des petits cubes. Puis touche le bouton vert.",
  i06_e: "Cinquante-trois, c'est cinq barres de dix, et trois petits cubes.",
  i07_c: "Touche le nombre le plus grand.",
  i07_e: "Le plus grand, c'est quatre-vingt-trois : il a huit dizaines. Trente-huit n'en a que trois.",
  i08_c: "Voici une ligne qui va de zéro à cent. Touche l'endroit où se trouve cinquante.",
  i08_e: "Cinquante est juste au milieu, entre zéro et cent.",
  i09_c: "Six, plus combien, égale dix ?",
  i09_e: "Six plus quatre égale dix. Regarde : il manque quatre cases pour remplir la boîte.",
  i10_c: "Huit, c'est cinq plus combien ?",
  i10_e: "Huit, c'est cinq plus trois.",
  i11_c: "Combien font six plus trois ?",
  i11_e: "Six plus trois égale neuf.",
  i12_c: "Tu as cinq billes. On t'en donne trois de plus. Combien de billes as-tu maintenant ?",
  i12_e: "Cinq billes, plus trois billes : ça fait huit billes.",
  i13_c: "Tu as neuf bonbons. Tu en manges trois. Combien de bonbons te reste-t-il ?",
  i13_e: "Neuf bonbons, moins les trois que tu as mangés : il en reste six.",
  i14_c: "Tom a sept cartes. Léa a trois cartes de plus que Tom. Combien de cartes a Léa ?",
  i14_e: "Léa a trois cartes de plus que Tom : sept plus trois, ça fait dix cartes.",
  i15_c: "Écoute bien : deux… quatre… six… Quel nombre vient après ?",
  i15_e: "On avance de deux en deux : deux, quatre, six, huit."
};
