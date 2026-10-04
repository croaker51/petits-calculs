// Référentiel de compétences pour le suivi du niveau (écran parent « Suivi » et rapport).
//
// SOURCE : Programme de mathématiques du cycle 2 (CP, CE1, CE2), annexe 4 de l'arrêté publié au
// BO n° 41 du 31 octobre 2024 (education.gouv.fr). Les libellés sont les intitulés des objectifs
// d'apprentissage relevés par lecture automatique du PDF officiel le 2026-10-03 :
// [À VÉRIFIER mot pour mot sur le PDF]. Année d'application : [À VÉRIFIER].
// Périmètre : Nombres, Calcul, Problèmes (ce que l'appli travaille). Grandeurs et mesures,
// Espace et géométrie, Données : non couverts par l'appli, non listés.
// CE2 : la liste des objectifs « Résolution de problèmes » n'a pas été relevée [À COMPLÉTER].
//
// ESSENTIELLE (choix de Simon, session 3) : ce qui construit l'aisance avec les nombres et la
// compréhension — « jongler facilement avec les nombres et comprendre vaut mieux que savoir compter
// jusqu'à mille ». Ce marquage est un CHOIX PÉDAGOGIQUE du projet, pas une mention du programme.
// Axes : sens = sens du nombre ; flex = flexibilité de calcul ; ope = sens des opérations ;
//        pb = modéliser un problème.
//
// Repères datés pour le CP (seuls donnés par le programme) : nombres jusqu'à 59 au plus tard en
// période 2, jusqu'à 100 au plus tard en période 3. Le reste : « fin de l'année » de la classe.

export const SOURCE = 'Programme de mathématiques du cycle 2 — annexe 4, BO n° 41 du 31 octobre 2024';
export const CLASSES = ['CP', 'CE1', 'CE2', 'Hors programme'];
export const DOMAINES = { N: 'Nombres', F: 'Fractions', O: 'Opérations', C: 'Calcul mental', P: 'Problèmes', R: 'Raisonnement' };
export const AXES = { sens: 'Sens du nombre', flex: 'Flexibilité de calcul', ope: 'Sens des opérations', pb: 'Modéliser un problème' };

// c : code ; cl : classe ; d : domaine ; ess : axe si essentielle (sinon null) ; per : période CP au plus tard (sinon null = fin d'année)
const K = (c, cl, d, ess, l, per = null) => ({ code: c, classe: cl, domaine: d, essentielle: !!ess, axe: ess || null, libelle: l, periode: per });

export const COMPETENCES = [
  // ---------------- CP ----------------
  K('CP-N1', 'CP', 'N', null, 'Comparer et dénombrer des collections en les organisant.'),
  K('CP-N2', 'CP', 'N', null, 'Construire des collections de cardinal donné.'),
  K('CP-N3-59', 'CP', 'N', null, 'Connaitre la suite écrite et la suite orale des nombres — jusqu\'à 59.', 2),
  K('CP-N3-100', 'CP', 'N', null, 'Connaitre la suite écrite et la suite orale des nombres jusqu\'à cent — 60 à 100.', 3),
  K('CP-N4-59', 'CP', 'N', 'sens', 'Connaitre et utiliser diverses représentations d\'un nombre et passer de l\'une à l\'autre — jusqu\'à 59.', 2),
  K('CP-N4-100', 'CP', 'N', 'sens', 'Diverses représentations d\'un nombre — 60 à 100.', 3),
  K('CP-N5-59', 'CP', 'N', 'sens', 'Connaitre la valeur des chiffres en fonction de leur position (unités, dizaines) — jusqu\'à 59.', 2),
  K('CP-N5-100', 'CP', 'N', 'sens', 'Valeur des chiffres selon leur position — 60 à 100.', 3),
  K('CP-N6-59', 'CP', 'N', null, 'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles =, < et > — jusqu\'à 59.', 2),
  K('CP-N6-100', 'CP', 'N', null, 'Comparer, encadrer, intercaler des nombres — 60 à 100.', 3),
  K('CP-N7', 'CP', 'N', null, 'Ordonner des nombres dans l\'ordre croissant ou décroissant.'),
  K('CP-N8', 'CP', 'N', 'sens', 'Savoir placer des nombres sur une demi-droite graduée de un en un.'),
  K('CP-N9', 'CP', 'N', null, 'Connaitre et utiliser les nombres ordinaux (jusqu\'à « vingtième »).'),
  K('CP-O1', 'CP', 'O', 'ope', 'Comprendre le sens de l\'addition et de la soustraction.'),
  K('CP-O2', 'CP', 'O', null, 'Comprendre et utiliser les symboles « + », « - » et « = ».'),
  K('CP-O3', 'CP', 'O', null, 'Poser et effectuer des additions en colonnes.'),
  K('CP-O4', 'CP', 'O', null, 'Comprendre le sens de la multiplication.'),
  K('CP-C1', 'CP', 'C', 'flex', 'Connaitre dans les deux sens les tables d\'addition.'),
  K('CP-C2', 'CP', 'C', 'flex', 'Connaitre les doubles et les moitiés de nombres usuels.'),
  K('CP-C3', 'CP', 'C', null, 'Ajouter ou soustraire 1 ou 2 à un nombre.'),
  K('CP-C4', 'CP', 'C', 'flex', 'Ajouter ou soustraire 10 à un nombre.'),
  K('CP-C5', 'CP', 'C', null, 'Ajouter ou soustraire 20, 30, 40, 50, 60, 70, 80 ou 90 à un nombre.'),
  K('CP-C6', 'CP', 'C', 'flex', 'Trouver le complément d\'un nombre à la dizaine supérieure.'),
  K('CP-C7', 'CP', 'C', null, 'Ajouter un nombre inférieur à 9 à un nombre.'),
  K('CP-C8', 'CP', 'C', null, 'Ajouter 9 à un nombre.'),
  K('CP-C9', 'CP', 'C', 'flex', 'Ajouter deux nombres inférieurs à 100.'),
  K('CP-C10', 'CP', 'C', null, 'Déterminer la moitié d\'un nombre pair.'),
  K('CP-C11', 'CP', 'C', null, 'Soustraire un nombre inférieur à 10 à un nombre entier de dizaines.'),
  K('CP-P1', 'CP', 'P', 'pb', 'Résoudre des problèmes additifs en une étape du type parties-tout.'),
  K('CP-P2', 'CP', 'P', 'pb', 'Résoudre des problèmes additifs en deux étapes (champ numérique inférieur ou égal à 30).'),
  K('CP-P3', 'CP', 'P', null, 'Résoudre des problèmes multiplicatifs en une étape (champ numérique inférieur ou égal à 30).'),
  // ---------------- CE1 ----------------
  K('CE1-N1', 'CE1', 'N', 'sens', 'Connaitre et utiliser la relation entre unités et dizaines, entre dizaines et centaines, entre unités et centaines.'),
  K('CE1-N2', 'CE1', 'N', null, 'Connaitre la suite écrite et la suite orale des nombres jusqu\'à mille.'),
  K('CE1-N3', 'CE1', 'N', null, 'Connaitre et utiliser diverses représentations d\'un nombre et passer de l\'une à l\'autre (jusqu\'à 1 000).'),
  K('CE1-N4', 'CE1', 'N', null, 'Connaitre la valeur des chiffres en fonction de leur position dans un nombre (jusqu\'à 1 000).'),
  K('CE1-N5', 'CE1', 'N', null, 'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles (=, <, >) (jusqu\'à 1 000).'),
  K('CE1-N6', 'CE1', 'N', 'sens', 'Savoir placer des nombres sur une demi-droite graduée.'),
  K('CE1-N7', 'CE1', 'N', null, 'Connaitre les nombres ordinaux jusqu\'à cent.'),
  K('CE1-F1', 'CE1', 'F', 'sens', 'Savoir interpréter, représenter, écrire et lire les fractions 1/2, 1/3, 1/4, 1/5, 1/6, 1/8 et 1/10.'),
  K('CE1-F2', 'CE1', 'F', null, 'Comparer des fractions ayant le même dénominateur ; dont le numérateur est 1.'),
  K('CE1-F3', 'CE1', 'F', null, 'Additionner et soustraire des fractions de même dénominateur.'),
  K('CE1-O1', 'CE1', 'O', null, 'Poser et effectuer des additions et des soustractions en colonnes.'),
  K('CE1-O2', 'CE1', 'O', null, 'Comprendre et savoir que la multiplication est commutative.'),
  K('CE1-O3', 'CE1', 'O', null, 'Connaitre la notion de parité d\'un nombre.'),
  K('CE1-C1', 'CE1', 'C', null, 'Connaitre dans les deux sens les tables de multiplication.'),
  K('CE1-C2', 'CE1', 'C', null, 'Ajouter ou soustraire un nombre entier de dizaines (de centaines) à un nombre.'),
  K('CE1-C3', 'CE1', 'C', null, 'Multiplier par 10 un nombre inférieur à 100.'),
  K('CE1-C4', 'CE1', 'C', null, 'Ajouter 9, 19 ou 29 à un nombre ; soustraire 9 à un nombre.'),
  K('CE1-C5', 'CE1', 'C', 'flex', 'Calculer le produit d\'un nombre de 11 à 19 par un nombre inférieur à 10 en décomposant (distributivité).'),
  K('CE1-P1', 'CE1', 'P', 'pb', 'Résoudre des problèmes additifs de comparaison en une étape.'),
  K('CE1-P2', 'CE1', 'P', 'pb', 'Résoudre des problèmes additifs en deux étapes.'),
  K('CE1-P3', 'CE1', 'P', null, 'Résoudre des problèmes multiplicatifs en une étape.'),
  K('CE1-P4', 'CE1', 'P', null, 'Résoudre des problèmes mixtes en deux étapes (une étape additive et une étape multiplicative).'),
  // ---------------- CE2 ----------------
  K('CE2-N1', 'CE2', 'N', 'sens', 'Connaitre et utiliser les relations entre les unités de numération.'),
  K('CE2-N2', 'CE2', 'N', null, 'Connaitre la suite écrite et la suite orale des nombres jusqu\'à dix-mille.'),
  K('CE2-N3', 'CE2', 'N', null, 'Connaitre la valeur des chiffres en fonction de leur position dans un nombre (jusqu\'à 10 000).'),
  K('CE2-F1', 'CE2', 'F', 'sens', 'Savoir établir des égalités de fractions inférieures ou égales à 1.'),
  K('CE2-F2', 'CE2', 'F', null, 'Partager une unité de longueur en fractions d\'unité et mesurer des longueurs non entières.'),
  K('CE2-O1', 'CE2', 'O', 'ope', 'Comprendre le sens de la division et utiliser le symbole « ÷ ».'),
  K('CE2-O2', 'CE2', 'O', null, 'Poser et effectuer des multiplications d\'un nombre à deux ou trois chiffres par un nombre à un ou deux chiffres.'),
  K('CE2-O3', 'CE2', 'O', null, 'Comprendre et utiliser les mots « terme », « somme », « différence », « facteur », « produit », « multiple ».'),
  K('CE2-C1', 'CE2', 'C', null, 'Multiplier un nombre entier par 10 ou 100.'),
  K('CE2-C2', 'CE2', 'C', null, 'Ajouter 8, 9, 18, 19, 28, 29, 38 ou 39 ; soustraire 9, 19, 29 ou 39.'),
  // ---------------- Hors programme (travaillé dans l'appli) ----------------
  K('HP-R1', 'Hors programme', 'R', 'sens', 'Placer approximativement un nombre sur une ligne 0–100 non graduée (estimation).'),
  K('HP-R2', 'Hors programme', 'R', null, 'Continuer une suite régulière (de 2 en 2, de 3 en 3, à rebours…).')
];

// Rattachement de chaque item (test T1 + séances S1.0) à UNE compétence.
export const ITEM_COMPETENCE = {
  // Test de positionnement T1.0
  i01: 'CP-N1', i02: 'CP-N1', i03: 'CP-N3-59', i04: 'CP-N3-100', i05: 'CP-N4-59', i06: 'CP-N4-59', i07: 'CP-N6-100',
  i08: 'HP-R1', i09: 'CP-C6', i10: 'CP-C1', i11: 'CP-C1', i12: 'CP-P1', i13: 'CP-P1', i14: 'CE1-P1', i15: 'HP-R2',
  // Parcours C
  c1_01: 'CP-N1', c1_02: 'CP-C1', c1_03: 'CP-C1', c1_04: 'CP-N4-59', c1_05: 'CP-C1', c1_06: 'CP-C1', c1_07: 'CP-N4-59',
  c1_08: 'CP-C1', c1_09: 'CP-N3-100', c1_10: 'CP-N4-59', c1_11: 'CP-P1', c1_12: 'CP-C1', c1_13: 'CP-N6-59', c1_14: 'CP-P1', c1_15: 'CP-C1',
  c2_01: 'CP-C6', c2_02: 'CP-C6', c2_03: 'CP-C1', c2_04: 'CP-N4-59', c2_05: 'CP-C6', c2_06: 'CP-C1', c2_07: 'CP-N3-100',
  c2_08: 'CP-C1', c2_09: 'CP-N4-59', c2_10: 'CP-P1', c2_11: 'CP-C1', c2_12: 'CP-N5-59', c2_13: 'CP-P1', c2_14: 'CP-N6-100', c2_15: 'CP-C6',
  c3_01: 'CP-C6', c3_02: 'CP-C1', c3_03: 'CP-N4-100', c3_04: 'CP-C1', c3_05: 'CP-N3-100', c3_06: 'CP-C1', c3_07: 'CP-P1',
  c3_08: 'CP-N4-59', c3_09: 'CP-C1', c3_10: 'CP-N6-100', c3_11: 'CP-P1', c3_12: 'CP-C1', c3_13: 'CP-N5-59', c3_14: 'CE1-P1', c3_15: 'CP-C6',
  // Parcours N
  n1_01: 'CP-N3-100', n1_02: 'CP-N3-100', n1_03: 'CP-N3-100', n1_04: 'CP-N4-100', n1_05: 'CP-N3-100', n1_06: 'CP-N4-100', n1_07: 'CE1-P1',
  n1_08: 'CP-C5', n1_09: 'CP-C1', n1_10: 'CP-N6-100', n1_11: 'CE1-P1', n1_12: 'HP-R1', n1_13: 'CP-C4', n1_14: 'HP-R2', n1_15: 'CP-P1',
  n2_01: 'CP-N3-100', n2_02: 'CP-N3-100', n2_03: 'CP-N4-59', n2_04: 'CP-N4-100', n2_05: 'CP-C1', n2_06: 'CE1-P1', n2_07: 'CP-C5',
  n2_08: 'CP-N5-100', n2_09: 'CP-C7', n2_10: 'CP-P2', n2_11: 'CP-N6-100', n2_12: 'HP-R1', n2_13: 'CE1-P1', n2_14: 'HP-R2', n2_15: 'CP-P1',
  n3_01: 'CP-N3-100', n3_02: 'CP-N3-100', n3_03: 'CP-N5-59', n3_04: 'CP-C5', n3_05: 'CE1-P1', n3_06: 'CP-N4-100', n3_07: 'CP-C5',
  n3_08: 'CP-C1', n3_09: 'CE1-P1', n3_10: 'CP-N6-100', n3_11: 'HP-R2', n3_12: 'HP-R1', n3_13: 'CP-P2', n3_14: 'CP-N5-100', n3_15: 'CP-P1',
  // Séances S1.1 (séances 4 et 5)
  c4_01: 'CP-N1', c4_02: 'CP-C1', c4_03: 'CP-C1', c4_04: 'CP-C2', c4_05: 'CP-C1', c4_06: 'CP-C2', c4_07: 'CP-N8', c4_08: 'CP-C1',
  c4_09: 'CP-C1', c4_10: 'CP-C2', c4_11: 'CP-N4-59', c4_12: 'CP-C1', c4_13: 'CP-C2', c4_14: 'CP-O1', c4_15: 'CP-C6', c5_01: 'CP-C1',
  c5_02: 'CP-C2', c5_03: 'CP-C1', c5_04: 'CP-N8', c5_05: 'CP-C2', c5_06: 'CP-C1', c5_07: 'CP-C6', c5_08: 'CP-N3-100', c5_09: 'CP-N5-100',
  c5_10: 'CP-C2', c5_11: 'CP-O1', c5_12: 'CP-C1', c5_13: 'CP-C9', c5_14: 'CP-C2', c5_15: 'CP-N4-59', n4_01: 'CP-C2', n4_02: 'CP-C1',
  n4_03: 'CP-C2', n4_04: 'CP-C2', n4_05: 'CP-N8', n4_06: 'CP-C9', n4_07: 'CP-O1', n4_08: 'CP-C2', n4_09: 'CP-C2', n4_10: 'CP-C8',
  n4_11: 'CP-C6', n4_12: 'CE1-P1', n4_13: 'CP-C11', n4_14: 'CP-C9', n4_15: 'CP-C2', n5_01: 'CP-C1', n5_02: 'CP-C2', n5_03: 'CP-C1',
  n5_04: 'CP-N8', n5_05: 'CP-C9', n5_06: 'CP-O1', n5_07: 'CP-C2', n5_08: 'CP-C5', n5_09: 'CP-C2', n5_10: 'CP-C8', n5_11: 'CP-C11',
  n5_12: 'CP-P2', n5_13: 'CP-N5-59', n5_14: 'CP-P3', n5_15: 'CP-C9'
};

// Compétences effectivement travaillées par au moins un item de l'appli.
export const TRAVAILLEES = new Set(Object.values(ITEM_COMPETENCE));

// Période scolaire APPROXIMATIVE d'après le mois (1 : sept.-oct., 2 : nov.-déc., 3 : janv.-févr.,
// 4 : mars-avr., 5 : mai-juin) ; le parent peut corriger la période dans l'écran Suivi.
export function periodeApprochee(date = new Date()) {
  const m = date.getMonth() + 1;
  if (m >= 9 && m <= 10) return 1;
  if (m >= 11) return 2;
  if (m <= 2) return 3;
  if (m <= 4) return 4;
  return 5;
}
