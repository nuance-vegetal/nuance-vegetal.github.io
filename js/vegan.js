/*
 * Statut végan d'un produit scanné et produits qui ne sont pas des alternatives végétales.
 * Cahier des charges du 23 octobre 2026, sections 8 et 9.
 *
 * Les listes de mots-clés et de catégories sont dans donnees/scanner.json (modifiables dans Pages CMS).
 * La détection par mots-clés n'est jamais affichée : seul le statut qui en découle l'est.
 *
 * Ordre de priorité du statut :
 *   1. mention ou label vegan (nom, nom générique, labels), sauf si elle est niée (« non vegan »)
 *   2. analyse d'Open Food Facts (ingredients_analysis_tags)
 *   3. nos mots-clés dans la liste d'ingrédients
 *   4. sinon : non spécifié (jamais « végan » par défaut)
 */
(function (racine) {
  /** Minuscules, sans accents, œ → oe, ponctuation → espaces : « Lécithine d'Œuf » → « lecithine d oeuf ». */
  function normaliser(texte) {
    return ' ' + String(texte || '')
      .toLowerCase()
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\be[\s-]?(\d{3,4}[a-z]?)\b/g, 'e$1')   // « E 120 », « E-120 » → « e120 »
      .replace(/[^a-z0-9]+/g, ' ')
      .trim() + ' ';
  }

  // Les plus longues d'abord : « presure animale » avant « presure », « pindakaas » avant « kaas »
  const parLongueur = (liste) => Array.from(new Set((liste || []).map(normaliser).map((m) => m.trim()).filter(Boolean)))
    .sort((a, b) => b.length - a.length);

  // Mot entier, avec un pluriel en -s ou -x (« oeuf » trouve « oeufs »)
  const motif = (mot) => new RegExp(' ' + mot.replace(/ /g, ' ') + '(s|x)? ', 'g');

  /** Retire du texte les expressions trouvées, pour qu'un mot plus court ne les retrouve pas. */
  function retirer(texte, mots) {
    let t = texte;
    mots.forEach((m) => { t = t.replace(motif(m), '  '); });
    return t;
  }
  function trouve(texte, mots) {
    return mots.some((m) => { const r = motif(m); r.lastIndex = 0; return r.test(texte); });
  }

  /** Réunit les listes de toutes les langues de donnees/scanner.json. */
  function preparer(config) {
    const c = config || {};
    const tout = (cle) => [].concat(...(c.motsCles || []).map((l) => l[cle] || []));
    return {
      nonVegan: parLongueur(tout('nonVegan')),
      peutEtre: parLongueur(tout('peutEtreVegan')),
      fauxPositifs: parLongueur(tout('fauxPositifs')),
      mentions: parLongueur(c.mentionsVegan),
      negations: parLongueur(c.negations),
      nonAlternatives: c.categoriesNonAlternatives || [],
      alternatives: c.categoriesAlternatives || []
    };
  }

  /** Étape 3 : mots-clés dans la liste d'ingrédients → 'non' | 'peut-etre' | null */
  function detecterIngredients(ingredients, L) {
    let t = normaliser(String(ingredients || '').replace(/_/g, ' '));
    t = retirer(t, L.fauxPositifs);
    if (trouve(t, L.nonVegan)) return 'non';
    if (trouve(t, L.peutEtre)) return 'peut-etre';
    return null;
  }

  /** Étape 1 : une mention vegan non niée dans le nom, le nom générique ou les labels ? */
  function mentionVegan(textes, L) {
    return textes.some((brut) => {
      let t = normaliser(brut);
      // Les plus longues d'abord ; une mention niée est effacée pour que « vegan » ne la retrouve pas
      // dans « not suitable for vegans »
      return L.mentions.some((m) => {
        const r = motif(m);
        let res;
        while ((res = r.exec(t))) {
          const avant = t.slice(0, res.index).trim().split(' ');
          const precedent = avant[avant.length - 1] || '';
          if (!L.negations.includes(precedent)) return true;
          t = t.slice(0, res.index) + ' '.repeat(res[0].length) + t.slice(res.index + res[0].length);
        }
        return false;
      });
    });
  }

  /** Produit de viande, poisson, laitier ou œufs qui n'est pas aussi un substitut de viande ? */
  function nonAlternative(categories, L) {
    const cats = categories || [];
    if (cats.some((c) => L.alternatives.includes(c))) return false;
    return cats.some((c) => L.nonAlternatives.includes(c));
  }

  /**
   * produit : { noms: [..], labels: [..], analyse: [..], ingredients: '', categories: [..], ingredientsAnimaux: [..] }
   * Renvoie { etat: 'oui' | 'non' | 'non-signale', texte, nonAlternative }
   */
  function statut(produit, config) {
    const L = preparer(config);
    const p = produit || {};
    const analyse = p.analyse || [];
    const horsAlternative = nonAlternative(p.categories, L);

    // Viande, poisson, laitier, œufs : non végan, quoi que disent les étapes suivantes
    if (horsAlternative) return { etat: 'non', texte: 'non végan', nonAlternative: true };

    if (mentionVegan([].concat(p.noms || [], p.labels || []), L)) return { etat: 'oui', texte: 'végan (label)', nonAlternative: false };

    if (analyse.includes('en:vegan')) return { etat: 'oui', texte: 'végan d’après les ingrédients', nonAlternative: false };
    if (analyse.includes('en:non-vegan')) {
      const liste = Array.from(new Set(p.ingredientsAnimaux || [])).filter(Boolean).slice(0, 3);
      return { etat: 'non', texte: 'non végan' + (liste.length ? ' : ' + liste.join(', ') : ''), nonAlternative: false };
    }

    if (detecterIngredients(p.ingredients, L) === 'non') return { etat: 'non', texte: 'non végan', nonAlternative: false };
    return { etat: 'non-signale', texte: 'non spécifié', nonAlternative: false };
  }

  const api = { normaliser, preparer, detecterIngredients, mentionVegan, nonAlternative, statut };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.NuanceVegan = api;
})(typeof window !== 'undefined' ? window : globalThis);
