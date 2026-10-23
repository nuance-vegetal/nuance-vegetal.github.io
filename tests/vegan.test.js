/*
 * Tests du statut végan et des produits hors alternatives (cahier des charges du 23 octobre 2026, sections 8, 9 et 13).
 * Lancer : node tests/vegan.test.js
 */
const fs = require('fs');
const path = require('path');
const V = require('../js/vegan.js');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../donnees/scanner.json'), 'utf8'));

const cas = [
  // Section 8 : catégories
  ['tofu : les 6 repères s’affichent', { categories: ['en:plant-based-foods', 'en:meat-alternatives', 'xx:tofu'], analyse: ['en:vegan'] }, 'oui', false],
  ['jambon (Open Food Facts dit « vegan ») : non végan + message', { categories: ['en:meats-and-their-products', 'en:prepared-meats', 'en:hams'], analyse: ['en:vegan'] }, 'non', true],
  ['yaourt : non végan + message', { categories: ['en:dairies', 'en:yogurts'] }, 'non', true],
  ['Quorn à l’œuf : non végan + les 6 repères', { categories: ['en:meat-analogues', 'en:eggs'], ingredients: 'Mycoprotéine (86 %), blanc d’œuf de poules élevées en plein air, arôme' }, 'non', false],
  // Section 9 : mots-clés
  ['beurre de cacao : pas non végan', { ingredients: 'Sucre, beurre de cacao, noisettes' }, 'non-signale', false],
  ['sans lactose : pas non végan', { ingredients: 'Eau, protéines de pois. Sans lactose.' }, 'non-signale', false],
  ['lactosérum : non végan', { ingredients: 'Protéines de soja, LACTOSÉRUM en poudre' }, 'non', false],
  ['allergène souligné « _lait_ » : non végan', { ingredients: 'Blé, _lait_ écrémé en poudre' }, 'non', false],
  ['œufs (pluriel) : non végan', { ingredients: 'Farine, Œufs frais, sel' }, 'non', false],
  ['présure seule : non spécifié', { ingredients: 'Lait de soja, présure' }, 'non-signale', false],
  ['présure animale : non végan', { ingredients: 'Ferments, présure animale' }, 'non', false],
  ['E 120 écrit avec espace : non végan', { ingredients: 'Colorant : E 120' }, 'non', false],
  ['aucun mot-clé ni info : non spécifié', { ingredients: 'Eau, protéines de pois, huile de colza, sel' }, 'non-signale', false],
  ['fromage végétal : pas non végan', { ingredients: 'Fromage végétal (eau, huile de coco, amidon)' }, 'non-signale', false],
  ['néerlandais « melk » : non végan', { ingredients: 'Water, tarwebloem, MELK, zout' }, 'non', false],
  ['néerlandais « pindakaas » seul : pas non végan', { ingredients: 'Pindakaas, zout' }, 'non-signale', false],
  ['néerlandais « eiwit » seul : pas non végan', { ingredients: 'Erwteneiwit, water, zout' }, 'non-signale', false],
  ['néerlandais « visueel » : pas non végan', { ingredients: 'Water, visueel aantrekkelijke kleurstof' }, 'non-signale', false],
  ['anglais « peanut butter » : pas non végan', { ingredients: 'Peanut butter, salt' }, 'non-signale', false],
  ['anglais « whey » : non végan', { ingredients: 'Soy protein, whey powder' }, 'non', false],
  // Section 9 : mention vegan
  ['label « veganistisch » : végan', { noms: ['Plantaardige burger'], labels: ['nl:veganistisch'] }, 'oui', false],
  ['nom « vegano » : végan', { noms: ['Hamburguesa vegana'] }, 'oui', false],
  ['« végétarien » seul : pas végan', { noms: ['Burger végétarien'] }, 'non-signale', false],
  ['« non vegan » : pas classé végan', { noms: ['Burger non vegan'] }, 'non-signale', false],
  ['« not suitable for vegans » : pas classé végan', { noms: ['Not suitable for vegans'] }, 'non-signale', false],
  ['« niet veganistisch » : pas classé végan', { labels: ['Niet veganistisch'] }, 'non-signale', false],
  ['« Veganistische burger » : végan', { noms: ['Veganistische burger'] }, 'oui', false],
  ['« niet veganistische » : pas classé végan', { noms: ['Burger, niet veganistische'] }, 'non-signale', false],
  // Ordre de priorité
  ['label vegan avant mots-clés', { labels: ['en:vegan'], ingredients: 'miel' }, 'oui', false],
  ['analyse Open Food Facts avant mots-clés', { analyse: ['en:non-vegan'], ingredients: 'Eau' }, 'non', false],
  ['« maybe-vegan » d’Open Food Facts → mots-clés', { analyse: ['en:maybe-vegan'], ingredients: 'Soja, caséinate de sodium' }, 'non', false]
];

let echecs = 0;
for (const [nom, produit, etat, horsAlternative] of cas) {
  const r = V.statut(produit, config);
  const ok = r.etat === etat && r.nonAlternative === horsAlternative;
  if (!ok) echecs++;
  console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : '  (obtenu : ' + r.etat + ', hors alternative : ' + r.nonAlternative + ')'));
}
console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTous les tests passent.');
process.exit(echecs ? 1 : 0);
