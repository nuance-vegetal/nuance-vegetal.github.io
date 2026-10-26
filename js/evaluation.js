/*
 * Évaluation d'une alternative végétale selon le Conseil Supérieur de la Santé (CSS),
 * avis n° 9445 « Alimentation végétarienne » (avril 2021).
 *
 * 6 repères, chacun « atteint », « à surveiller » ou « non renseigné ».
 * Pas de note globale : c'est la personne qui décide.
 * L'allégation européenne « riche en protéines » n'est plus un critère : c'est une info.
 *
 * Les seuils sont dans CSS ci-dessous (et peuvent être remplacés par donnees/reglages.json → css).
 * À vérifier par Camille dans l'avis original avant la mise en ligne.
 */
(function (racine) {
  const CSS = {
    proteinesMin: 10,      // protéines : plus de 10 g / 100 g
    grassesMax: 10,        // matières grasses : moins de 10 g / 100 g, et moins que les protéines
    saturesMax: 5,         // graisses saturées : moins de 5 g / 100 g…
    saturesPartMax: 1 / 3, // … et au plus un tiers des matières grasses
    selMax: 1.1,           // sel : 1,1 g / 100 g au maximum
    ferMin: 0.8,           // fer : au moins 0,8 mg / 100 g (seuil inclus)
    b12Min: 0.24,          // vitamine B12 : au moins 0,24 µg / 100 g (seuil inclus)
    allegationRiche: 20,   // « riche en protéines » : au moins 20 % de l'énergie (règlement CE 1924/2006)
    allegationSource: 12,  // « source de protéines » : au moins 12 % de l'énergie
    reference: 'Conseil Supérieur de la Santé, avis n° 9445 « Alimentation végétarienne » (2021)'
  };

  const nb = (v) => (v === undefined || v === null || v === '' || isNaN(Number(v)) ? null : Number(v));
  const fr = (n, dec) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: dec === undefined ? 2 : dec }).format(n);

  /** Le fer / la B12 sont-ils cités dans la liste d'ingrédients ? */
  function citeFer(ingredients) {
    return /(^|[^a-zà-ÿ])fer([^a-zà-ÿ]|$)|fumarate ferreux|pyrophosphate ferrique/i.test(ingredients || '');
  }
  function citeB12(ingredients) {
    return /b\s?12|cobalamine/i.test(ingredients || '');
  }

  /** Convertit un produit Open Food Facts au format de l'évaluation (pour 100 g). */
  function fromOpenFoodFacts(p) {
    const n = (p && p.nutriments) || {};
    let energie = nb(n['energy-kcal_100g']);
    if (energie === null && nb(n.energy_100g) !== null) energie = nb(n.energy_100g) / 4.184;
    const ferG = nb(n.iron_100g), b12G = nb(n['vitamin-b12_100g']);
    const ingredients = (p && (p.ingredients_text_fr || p.ingredients_text_nl || p.ingredients_text_en || p.ingredients_text)) || '';
    return {
      nom: (p && (p.product_name_fr || p.product_name)) || '',
      energie: energie === null ? null : Math.round(energie),
      proteines: nb(n.proteins_100g),
      grasses: nb(n.fat_100g),
      satures: nb(n['saturated-fat_100g']),
      sel: nb(n.salt_100g),
      fer: ferG === null ? null : Math.round(ferG * 1000 * 100) / 100,        // g → mg
      b12: b12G === null ? null : Math.round(b12G * 1000000 * 100) / 100,     // g → µg
      ingredients,
      ferCite: citeFer(ingredients),
      b12Cite: citeB12(ingredients)
    };
  }

  /** Applique les 6 critères. Renvoie statut, valeur et message de chaque repère + l'allégation. */
  function evaluate(produit, seuils) {
    const S = Object.assign({}, CSS, seuils || {});
    const p = produit || {};
    const prot = nb(p.proteines), gr = nb(p.grasses), sat = nb(p.satures), sel = nb(p.sel);
    const fer = nb(p.fer), b12 = nb(p.b12), kcal = nb(p.energie);
    const NON = 'Valeur non indiquée.';
    const r = [];

    // 1. Protéines
    r.push(prot === null
      ? { cle: 'proteines', nom: 'Protéines', statut: 'inconnu', message: NON, valeur: null }
      : { cle: 'proteines', nom: 'Protéines', statut: prot > S.proteinesMin ? 'atteint' : 'surveiller',
          message: prot > S.proteinesMin ? 'Assez de protéines pour remplacer la viande.' : 'Peu de protéines pour un produit qui remplace la viande.',
          valeur: fr(prot, 1) + ' g' });
    r[0].repere = 'plus de ' + fr(S.proteinesMin) + ' g';

    // 2. Matières grasses : < 10 g et < protéines (si protéines inconnues : seulement < 10 g)
    if (gr === null) r.push({ cle: 'grasses', nom: 'Matières grasses', statut: 'inconnu', message: NON, valeur: null });
    else {
      const sousMax = gr < S.grassesMax;
      const sousProt = prot === null || gr < prot;
      r.push({ cle: 'grasses', nom: 'Matières grasses', statut: sousMax && sousProt ? 'atteint' : 'surveiller',
        message: sousMax && sousProt ? 'Moins de graisses que de protéines, et sous ' + fr(S.grassesMax) + ' g.'
          : !sousMax ? 'Plus de ' + fr(S.grassesMax) + ' g de matières grasses.' : 'Plus de graisses que de protéines.',
        valeur: fr(gr, 1) + ' g' });
    }
    r[1].repere = 'moins de ' + fr(S.grassesMax) + ' g et moins que les protéines';

    // 3. Graisses saturées : < 5 g et ≤ 1/3 des matières grasses (si graisses inconnues ou nulles : seulement < 5 g)
    if (sat === null) r.push({ cle: 'satures', nom: 'Graisses saturées', statut: 'inconnu', message: NON, valeur: null });
    else {
      const sousMax = sat < S.saturesMax;
      const partOk = gr === null || gr === 0 || sat <= gr * S.saturesPartMax + 1e-9;
      r.push({ cle: 'satures', nom: 'Graisses saturées', statut: sousMax && partOk ? 'atteint' : 'surveiller',
        message: sousMax && partOk ? 'Peu de graisses saturées.'
          : !sousMax ? 'Plus de ' + fr(S.saturesMax) + ' g de graisses saturées.' : 'Plus d’un tiers des graisses sont saturées (souvent huile de coco ou de palme).',
        valeur: fr(sat, 2) + ' g' });
    }
    r[2].repere = 'moins de ' + fr(S.saturesMax) + ' g et au plus 1/3 des graisses';

    // 4. Sel : ≤ 1,1 g
    r.push(sel === null
      ? { cle: 'sel', nom: 'Sel', statut: 'inconnu', message: NON, valeur: null }
      : { cle: 'sel', nom: 'Sel', statut: sel <= S.selMax + 1e-9 ? 'atteint' : 'surveiller',
          message: sel <= S.selMax + 1e-9 ? 'Teneur en sel raisonnable.' : 'Salé : pense à ne pas resaler le plat.',
          valeur: fr(sel, 2) + ' g' });
    r[3].repere = fr(S.selMax) + ' g maximum';

    // 5. Fer : ≥ 0,8 mg
    if (fer === null) r.push({ cle: 'fer', nom: 'Fer', statut: 'inconnu', valeur: null, detail: p.ferCite ? 'ajouté' : 'absent',
      message: p.ferCite ? 'Du fer est ajouté, mais la quantité n’est pas indiquée.' : 'Pas de quantité indiquée.' });
    else r.push({ cle: 'fer', nom: 'Fer', statut: fer >= S.ferMin ? 'atteint' : 'surveiller',
      message: fer >= S.ferMin ? 'Assez de fer pour un substitut de viande. Associe-le à de la vitamine C.' : 'Peu de fer.', valeur: fr(fer, 2) + ' mg' });
    r[4].repere = 'au moins ' + fr(S.ferMin) + ' mg';

    // 6. Vitamine B12 : ≥ 0,24 µg
    if (b12 === null) r.push({ cle: 'b12', nom: 'Vitamine B12', statut: 'inconnu', valeur: null, detail: p.b12Cite ? 'ajoutée' : 'absente',
      message: p.b12Cite ? 'De la B12 est ajoutée, mais la quantité n’est pas indiquée.' : 'Pas de B12 indiquée : pense à une autre source fiable (aliments enrichis ou complément). Parles-en à un·e diététicien·ne.' });
    else r.push({ cle: 'b12', nom: 'Vitamine B12', statut: b12 >= S.b12Min ? 'atteint' : 'surveiller',
      message: b12 >= S.b12Min ? 'Enrichi en B12.' : 'Peu de B12.', valeur: fr(b12, 2) + ' µg' });
    r[5].repere = 'au moins ' + fr(S.b12Min) + ' µg';

    // Allégation européenne (information, pas un critère)
    let allegation = null;
    if (prot !== null && kcal) {
      const pct = Math.round(prot * 4 / kcal * 100);
      const niveau = pct >= S.allegationRiche ? 'riche' : pct >= S.allegationSource ? 'source' : 'aucune';
      allegation = { pct, niveau, message: {
        riche: 'Le fabricant a le droit d’écrire « riche en protéines ».',
        source: 'Il peut écrire « source de protéines », mais pas « riche en protéines ».',
        aucune: 'Il ne peut pas mettre en avant les protéines.'
      }[niveau] };
    }

    const resume = { atteint: 0, surveiller: 0, inconnu: 0 };
    r.forEach((x) => { resume[x.statut]++; });
    return { reperes: r, resume, allegation, reference: S.reference };
  }

  /** Les 6 repères en toutes lettres, pour les tableaux (fiche PDF, page « Ta fiche »). */
  function listeReperes(seuils) {
    const S = Object.assign({}, CSS, seuils || {});
    return [
      ['Protéines', 'plus de ' + fr(S.proteinesMin) + ' g'],
      ['Matières grasses', 'moins de ' + fr(S.grassesMax) + ' g, et moins que les protéines'],
      ['Graisses saturées', 'moins de ' + fr(S.saturesMax) + ' g, et au plus 1/3 des graisses'],
      ['Sel', fr(S.selMax) + ' g maximum'],
      ['Fer', 'au moins ' + fr(S.ferMin) + ' mg'],
      ['Vitamine B12', 'au moins ' + fr(S.b12Min) + ' µg']
    ];
  }

  /* ---------- Affichage ---------- */
  const SYMBOLES = { atteint: '✓', surveiller: '!', inconnu: '?' };
  const MOTS = { atteint: 'atteint', surveiller: 'à surveiller', inconnu: 'non renseigné' };
  const LIENS = { proteines: 'proteines', fer: 'fer', b12: 'b12' };
  const echap = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function pluriel(n, mot) {
    if (mot === 'atteint') return n + ' ' + (n > 1 ? 'atteints' : 'atteint');
    if (mot === 'inconnu') return n + ' ' + (n > 1 ? 'non renseignés' : 'non renseigné');
    return n + ' à surveiller';
  }

  /** HTML du résultat : résumé, 6 repères, allégation, source. */
  function rendre(ev, options) {
    const o = options || {};
    const resume = ['atteint', 'surveiller', 'inconnu'].map((s) =>
      '<span class="eval-compte ' + s + '"><span class="eval-symbole" aria-hidden="true">' + SYMBOLES[s] + '</span>' + pluriel(ev.resume[s], s) + '</span>').join('');
    const reperes = ev.reperes.map((x, i) =>
      '<li class="eval-repere ' + x.statut + '" style="--i:' + i + '">' +
      '<span class="eval-symbole" aria-hidden="true">' + SYMBOLES[x.statut] + '</span>' +
      '<div class="eval-corps">' +
      '<p class="eval-tete"><b>' + x.nom + '</b>' +
      (LIENS[x.cle] ? ' <a class="lien-info" href="a-quoi-ca-sert.html#' + LIENS[x.cle] + '" aria-label="À quoi ça sert ?">?</a>' : '') +
      '<span class="eval-mot">' + MOTS[x.statut] + '</span></p>' +
      '<p class="eval-message">' + echap(x.message) + '</p>' +
      '<p class="eval-chiffres">' + (x.valeur ? '<b>' + x.valeur + '</b> · ' : '') + 'repère : ' + x.repere + '</p>' +
      '</div></li>').join('');
    const a = ev.allegation;
    const allegation = a
      ? '<div class="eval-allegation"><p class="eval-allegation-titre">Allégation « riche en protéines »</p>' +
        '<p><b>' + a.pct + ' %</b> de l’énergie vient des protéines. ' + echap(a.message) + '</p>' +
        '<p class="petit">C’est une règle européenne pour l’emballage, pas un critère de qualité. <a href="a-quoi-ca-sert.html#allegations">En savoir plus</a></p></div>'
      : '';
    return '<div class="evaluation">' +
      (o.titre ? '<p class="fp-section">' + o.titre + '</p>' : '') +
      '<div class="eval-resume" aria-label="Résumé">' + resume + '</div>' +
      '<ul class="eval-reperes">' + reperes + '</ul>' +
      allegation +
      '<p class="eval-source">Repères : ' + echap(ev.reference) + '.' + (o.source ? ' ' + o.source : '') + '</p>' +
      '</div>';
  }

  const api = { CSS, evaluate, fromOpenFoodFacts, rendre, listeReperes, citeFer, citeB12 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.NuanceEvaluation = api;
})(typeof window !== 'undefined' ? window : globalThis);
