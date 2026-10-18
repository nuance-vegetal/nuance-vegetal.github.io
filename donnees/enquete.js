/*
 * Chiffres de l'enquête affichés sur l'accueil.
 * À mettre à jour quand l'enquête est close : change seulement les nombres et les textes entre guillemets.
 * (Voir NOTICE.md, section « Les chiffres de l'enquête ».)
 */
window.ENQUETE = {

  // Les cartes « ce que l'enquête a révélé ». misEnAvant: true = la grande carte verte.
  chiffres: [
    { valeur: 14, unite: " %", misEnAvant: true, texte: "regardent la B12 et le fer sur l'étiquette. C'est pourtant l'enjeu principal d'une alimentation végétarienne." },
    { valeur: 56, unite: " %", texte: "citent le prix comme premier frein." },
    { valeur: 30, unite: " %", texte: "pensent que le quinoa contient du blé." },
    { valeur: 75, unite: " %", texte: "trouvent qu'un outil comme celui-ci est utile." }
  ],

  // Le bandeau qui défile sous l'accroche.
  bandeau: [
    { chiffre: "8 sur 10", texte: "aiment le goût" },
    { chiffre: "12 %", texte: "les trouvent « naturels »" },
    { chiffre: "52 %", texte: "se méfient des industriels" },
    { chiffre: "56 %", texte: "citent le prix comme frein" },
    { chiffre: "14 %", texte: "regardent la B12 et le fer" }
  ]
};
