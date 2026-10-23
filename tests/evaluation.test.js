/*
 * Tests de validation du cahier des charges « scanner » (20 octobre 2026) :
 * les 4 produits fictifs doivent donner exactement ces résultats.
 * Lancer : node tests/evaluation.test.js
 */
const { evaluate } = require('../js/evaluation.js');

const S = { atteint: '✓', surveiller: '!', inconnu: '?' };
const PRODUITS = [
  { nom: 'Haché végétal', p: { energie: 210, proteines: 18, grasses: 11, satures: 1.2, sel: 1.3, fer: null, b12: null, ferCite: true, b12Cite: true },
    attendu: ['✓', '!', '✓', '!', '? ajouté', '? ajoutée'], allegation: '34 % riche' },
  { nom: 'Tofu nature', p: { energie: 125, proteines: 13, grasses: 7, satures: 1.1, sel: 0.02, fer: 2.2, b12: null, ferCite: false, b12Cite: false },
    attendu: ['✓', '✓', '✓', '✓', '✓', '? absente'], allegation: '42 % riche' },
  { nom: 'Burger végétal', p: { energie: 240, proteines: 16, grasses: 15, satures: 6.5, sel: 1.6, fer: 2.4, b12: 0.4 },
    attendu: ['✓', '!', '!', '!', '✓', '✓'], allegation: '27 % riche' },
  { nom: 'Nuggets végétaux', p: { energie: 195, proteines: 12, grasses: 8, satures: 0.8, sel: 1.0, fer: 1.1, b12: 0.38 },
    attendu: ['✓', '✓', '✓', '✓', '✓', '✓'], allegation: '25 % riche' }
];

let echecs = 0;
for (const { nom, p, attendu, allegation } of PRODUITS) {
  const ev = evaluate(p);
  const obtenu = ev.reperes.map((r) => S[r.statut] + (r.statut === 'inconnu' && r.detail ? ' ' + r.detail : ''));
  const alleg = ev.allegation ? ev.allegation.pct + ' % ' + ev.allegation.niveau : '-';
  const ok = JSON.stringify(obtenu) === JSON.stringify(attendu) && alleg === allegation;
  if (!ok) echecs++;
  console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom.padEnd(18) + obtenu.join(' | ') + '  →  ' + alleg + (ok ? '' : '   (attendu : ' + attendu.join(' | ') + ' → ' + allegation + ')'));
}

// Cas limites décrits dans le cahier
const cas = [
  ['graisses sans protéines : seulement < 10 g', evaluate({ grasses: 9 }).reperes[1].statut, 'atteint'],
  ['saturées sans matières grasses : seulement < 5 g', evaluate({ satures: 4 }).reperes[2].statut, 'atteint'],
  ['saturées avec graisses à 0 : seulement < 5 g', evaluate({ grasses: 0, satures: 1 }).reperes[2].statut, 'atteint'],
  ['plus d’un tiers saturées', evaluate({ grasses: 6, satures: 3 }).reperes[2].message.startsWith('Plus d’un tiers'), true],
  ['plus de graisses que de protéines', evaluate({ proteines: 6, grasses: 8 }).reperes[1].message, 'Plus de graisses que de protéines.'],
  ['valeur absente ≠ zéro', evaluate({ proteines: 0 }).reperes[0].statut, 'surveiller'],
  ['valeur absente → non renseigné', evaluate({}).reperes[0].statut, 'inconnu'],
  ['allégation 12 à 19 % → source', evaluate({ proteines: 7, energie: 200 }).allegation.niveau, 'source'],
  ['allégation < 12 % → aucune', evaluate({ proteines: 4, energie: 200 }).allegation.niveau, 'aucune'],
  ['pas d’allégation sans énergie', evaluate({ proteines: 10 }).allegation, null],
  ['fer exactement 0,8 mg → atteint', evaluate({ fer: 0.8 }).reperes[4].statut, 'atteint'],
  ['fer 0,8 mg → « Assez de fer pour un substitut de viande. »', evaluate({ fer: 0.8 }).reperes[4].message.startsWith('Assez de fer pour un substitut de viande.'), true],
  ['B12 exactement 0,24 µg → atteint', evaluate({ b12: 0.24 }).reperes[5].statut, 'atteint'],
  ['protéines exactement 10 g → à surveiller (> 10 g)', evaluate({ proteines: 10 }).reperes[0].statut, 'surveiller']
];
for (const [nom, obtenu, attendu] of cas) {
  const ok = obtenu === attendu;
  if (!ok) echecs++;
  console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' (obtenu : ' + obtenu + ')'));
}
console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTous les tests passent.');
process.exit(echecs ? 1 : 0);
