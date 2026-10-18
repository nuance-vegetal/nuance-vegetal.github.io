/*
 * Seuils du décodeur et de la fiche frigo — À VALIDER PAR CAMILLE.
 * Toutes les valeurs sont pour 100 g. Modifier un chiffre ici le change
 * partout sur le site (décodeur, fiche frigo).
 */
window.CONFIG = {
  proteines: {
    // % de l'énergie apportée par les protéines = protéines × 4 ÷ kcal × 100
    vertMin: 20,   // ≥ 20 % → « Riche »
    orangeMin: 12, // 12 à 20 % → « Source » ; en dessous → « Faible »
    reference: 'Règlement (CE) n° 1924/2006'
  },
  sel: {
    vertMax: 0.3,   // ≤ 0,3 g → « Faible »
    orangeMax: 1.5, // 0,3 à 1,5 g → « Moyen » ; au-dessus → « Élevé »
    reference: 'Food Standards Agency (UK)'
  },
  satures: {
    vertMax: 1.5, // ≤ 1,5 g → « Faible »
    orangeMax: 5, // 1,5 à 5 g → « Moyen » ; au-dessus → « Élevé »
    reference: 'Food Standards Agency (UK)'
  },
  portionGrammes: 150,   // portion utilisée pour le sel par portion
  selRepereJour: 6,      // repère de sel par jour, en g (apport de référence UE ; l'OMS conseille moins de 5 g)

  // Infos affichées après un scan, dans cet ordre. Enlève une ligne pour la masquer.
  // Possibles : b12, fer, gluten, lait, autresAllergenes, vegan, huilePalme, additifs, bio
  scanInfos: [
    'b12',
    'fer',
    'gluten',
    'lait',
    'autresAllergenes',
    'vegan',
    'huilePalme',
    'additifs',
    'bio'
  ]
};
