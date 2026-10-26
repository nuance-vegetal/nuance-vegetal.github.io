/*
 * Scan de code-barres → Open Food Facts → valeurs du décodeur.
 * La caméra reste dans le navigateur : rien n'est filmé ni enregistré.
 * Seul le numéro du code-barres est envoyé à Open Food Facts pour trouver le produit.
 * À charger après js/evaluation.js et js/vegan.js.
 */
const Scanner = (() => {
  const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
  let flux = null;
  let minuterie = null;
  let lecteurZxing = null;
  let actif = false;

  function chargerZxing() {
    if (window.ZXing) return Promise.resolve();
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = 'js/vendor/zxing.min.js?v=0.23.0';
      s.onload = ok;
      s.onerror = () => ko(new Error('zxing'));
      document.head.appendChild(s);
    });
  }

  async function detecteurNatif() {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const formats = await BarcodeDetector.getSupportedFormats();
      const utiles = FORMATS.filter((f) => formats.includes(f));
      return utiles.length ? new BarcodeDetector({ formats: utiles }) : null;
    } catch (e) {
      return null;
    }
  }

  /** Démarre la caméra dans <video> et appelle surCode(code) au premier code lu. */
  async function demarrer(video, surCode) {
    arreter();
    actif = true;
    const contraintes = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false };
    const natif = await detecteurNatif();

    if (natif) {
      flux = await navigator.mediaDevices.getUserMedia(contraintes);
      video.srcObject = flux;
      await video.play();
      const boucle = async () => {
        if (!actif) return;
        try {
          const codes = await natif.detect(video);
          if (codes.length && actif) { const c = codes[0].rawValue; arreter(); surCode(c); return; }
        } catch (e) { /* image pas encore prête */ }
        minuterie = setTimeout(boucle, 180);
      };
      boucle();
      return;
    }

    await chargerZxing();
    const Z = window.ZXing;
    const indices = new Map();
    indices.set(Z.DecodeHintType.POSSIBLE_FORMATS,
      [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
    lecteurZxing = new Z.BrowserMultiFormatReader(indices, 250);
    await lecteurZxing.decodeFromConstraints(contraintes, video, (resultat) => {
      if (resultat && actif) { const c = resultat.getText(); arreter(); surCode(c); }
    });
  }

  function arreter() {
    actif = false;
    clearTimeout(minuterie);
    if (lecteurZxing) { try { lecteurZxing.reset(); } catch (e) { /* déjà arrêté */ } lecteurZxing = null; }
    if (flux) { flux.getTracks().forEach((t) => t.stop()); flux = null; }
  }

  // Mots-clés végan et catégories, chargés une seule fois (sans eux : label et analyse d'Open Food Facts seulement)
  let promesseListes = null;
  function chargerListesVegan() {
    if (!promesseListes) promesseListes = chargerDonnees('donnees/scanner.json').catch(() => ({}));
    return promesseListes;
  }

  function codeValide(code) {
    return /^\d{8,14}$/.test(String(code).trim());
  }

  /** Cherche le produit sur Open Food Facts. Renvoie null s'il n'existe pas. */
  async function chercherProduit(code) {
    const champs = 'product_name,product_name_fr,product_name_nl,product_name_en,generic_name,generic_name_fr,brands,nutriments,' +
      'ingredients_text_fr,ingredients_text_nl,ingredients_text_en,ingredients_text,allergens_tags,traces_tags,labels_tags,labels,' +
      'categories_tags,ingredients_analysis_tags,ingredients,additives_tags,image_front_small_url';
    const listesVegan = chargerListesVegan();
    const url = 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code.trim()) + '.json?fields=' + champs;
    const rep = await fetch(url, { headers: { Accept: 'application/json' } });
    if (rep.status === 404) return null;
    if (!rep.ok) throw new Error('Open Food Facts : ' + rep.status);
    const data = await rep.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};
    const ev = NuanceEvaluation.fromOpenFoodFacts(p);
    const nombre = (v) => (v === undefined || v === null || v === '' || isNaN(Number(v)) ? null : Number(v));
    let kcal = nombre(n['energy-kcal_100g']);
    if (kcal === null && nombre(n.energy_100g) !== null) kcal = nombre(n.energy_100g) / 4.184;

    // Ingrédients dans la langue disponible : français, sinon néerlandais, sinon anglais
    const ingredients = p.ingredients_text_fr || p.ingredients_text_nl || p.ingredients_text_en || p.ingredients_text || '';
    const allergenes = p.allergens_tags || [];
    const traces = p.traces_tags || [];
    const labels = p.labels_tags || [];

    // Open Food Facts stocke vitamines et minéraux en grammes pour 100 g
    const b12Ug = nombre(n['vitamin-b12_100g']) > 0 ? nombre(n['vitamin-b12_100g']) * 1e6 : null;
    const ferMg = nombre(n.iron_100g) > 0 ? nombre(n.iron_100g) * 1000 : null;

    const b12 = b12Ug !== null ? { etat: 'quantite', texte: formatNombre(b12Ug, 2) + ' µg / 100 g' }
      : /b\s?12|cobalamin/i.test(ingredients) ? { etat: 'ingredients', texte: 'dans les ingrédients' }
      : { etat: 'non-signale', texte: 'non signalée' };
    const fer = ferMg !== null ? { etat: 'quantite', texte: formatNombre(ferMg, 1) + ' mg / 100 g' }
      : /\bfer\b|ferreux|ferrique|\biron\b/i.test(ingredients) ? { etat: 'ingredients', texte: 'dans les ingrédients' }
      : { etat: 'non-signale', texte: 'non signalé' };

    function allergene(tag, labelsSans, motSans) {
      if (allergenes.includes(tag)) return { etat: 'present', texte: 'présent' };
      if (traces.includes(tag)) return { etat: 'traces', texte: 'traces possibles' };
      if (labelsSans.some((l) => labels.includes(l))) return { etat: 'sans', texte: motSans };
      return { etat: 'non-signale', texte: 'non signalé' };
    }

    const analyse = p.ingredients_analysis_tags || [];

    // Végan et produits hors alternatives : voir js/vegan.js (listes dans donnees/scanner.json)
    const config = await listesVegan;
    const statutVegan = NuanceVegan.statut({
      noms: [p.product_name_fr, p.product_name, p.product_name_nl, p.product_name_en, p.generic_name_fr, p.generic_name].filter(Boolean),
      labels: labels.concat(p.labels ? [p.labels] : []),
      analyse,
      ingredients,
      categories: p.categories_tags || [],
      ingredientsAnimaux: (p.ingredients || []).filter((i) => i.vegan === 'no').map((i) => (i.text || '').replace(/_/g, '').trim().toLowerCase())
    }, config);
    const vegan = { etat: statutVegan.etat, texte: statutVegan.texte };

    const huilePalme = analyse.includes('en:palm-oil') ? { etat: 'present', texte: 'contient' }
      : analyse.includes('en:may-contain-palm-oil') ? { etat: 'traces', texte: 'peut contenir' }
      : analyse.includes('en:palm-oil-free') ? { etat: 'sans', texte: 'sans' }
      : { etat: 'non-signale', texte: 'non signalé' };

    const codes = (p.additives_tags || []).map((t) => t.replace(/^en:/, '').toUpperCase());
    const additifs = codes.length
      ? { etat: 'present', texte: codes.map((c) => (NOMS_ADDITIFS[c] ? c + ' ' + NOMS_ADDITIFS[c] : c)).join(', ') }
      : { etat: 'non-signale', texte: 'aucun signalé' };

    const autres = allergenes.filter((t) => t !== 'en:gluten' && t !== 'en:milk' && NOMS_ALLERGENES[t]).map((t) => NOMS_ALLERGENES[t]);
    const autresTraces = traces.filter((t) => t !== 'en:gluten' && t !== 'en:milk' && NOMS_ALLERGENES[t] && !allergenes.includes(t)).map((t) => NOMS_ALLERGENES[t]);
    const autresAllergenes = autres.length || autresTraces.length
      ? { etat: 'present', texte: [autres.join(', '), autresTraces.length ? 'traces : ' + autresTraces.join(', ') : ''].filter(Boolean).join(' · ') }
      : { etat: 'non-signale', texte: 'aucun signalé' };

    const bio = labels.some((l) => /organic|agriculture-biologique|bio/.test(l))
      ? { etat: 'oui', texte: 'bio (label)' } : { etat: 'non-signale', texte: 'non signalé' };

    return {
      nom: p.product_name_fr || p.product_name || 'Produit sans nom',
      marque: (p.brands || '').split(',')[0].trim(),
      photo: /^https:\/\/images\.openfoodfacts\.org\//.test(p.image_front_small_url || '') ? p.image_front_small_url : null,
      // Viande, poisson, laitier ou œufs (et pas un substitut de viande) : les repères du CSS ne s'appliquent pas
      nonAlternative: statutVegan.nonAlternative,
      messageNonAlternative: config.messageNonAlternative || 'Ce produit n’est pas une alternative végétale : les repères du CSS ne s’appliquent pas.',
      ingredients,
      kcal: kcal === null ? null : Math.round(kcal),
      proteines: nombre(n.proteins_100g),
      satures: nombre(n['saturated-fat_100g']),
      sel: nombre(n.salt_100g),
      // Pour les 6 repères du CSS (js/evaluation.js) : valeur absente = null, jamais 0
      grasses: ev.grasses,
      fer: ev.fer,
      b12: ev.b12,
      ferCite: ev.ferCite,
      b12Cite: ev.b12Cite,
      infos: {
        b12,
        fer,
        gluten: allergene('en:gluten', ['en:no-gluten', 'en:gluten-free'], 'sans gluten'),
        lait: allergene('en:milk', ['en:no-lactose', 'en:lactose-free', 'en:no-milk'], 'sans lactose'),
        autresAllergenes,
        vegan,
        huilePalme,
        additifs,
        bio
      }
    };
  }

  /* Noms des allergènes et des additifs fréquents dans les alternatives végétales */
  const NOMS_ALLERGENES = {
    'en:soybeans': 'soja', 'en:eggs': 'œuf', 'en:celery': 'céleri', 'en:mustard': 'moutarde',
    'en:nuts': 'fruits à coque', 'en:peanuts': 'arachide', 'en:sesame-seeds': 'sésame', 'en:lupin': 'lupin',
    'en:fish': 'poisson', 'en:crustaceans': 'crustacés', 'en:molluscs': 'mollusques',
    'en:sulphur-dioxide-and-sulphites': 'sulfites'
  };
  const NOMS_ADDITIFS = {
    E100: 'curcumine', E101: 'riboflavine', E120: 'carmin', E150A: 'caramel', E150C: 'caramel', E160A: 'caroténoïdes',
    E160C: 'extrait de paprika', E162: 'rouge de betterave', E170: 'carbonate de calcium', E202: 'sorbate de potassium',
    E262: 'acétates de sodium', E270: 'acide lactique', E300: 'acide ascorbique', E301: 'ascorbate de sodium',
    E304: "esters d'acide ascorbique", E306: 'tocophérols', E322: 'lécithines', E325: 'lactate de sodium', E326: 'lactate de potassium', E330: 'acide citrique',
    E331: 'citrates de sodium', E401: 'alginate de sodium', E407: 'carraghénanes', E410: 'farine de caroube',
    E412: 'gomme guar', E415: 'gomme xanthane', E417: 'gomme tara', E440: 'pectines', E450: 'diphosphates', E451: 'triphosphates',
    E460: 'cellulose', E461: 'méthylcellulose', E464: 'hydroxypropylméthylcellulose', E466: 'carboxyméthylcellulose',
    E471: 'mono- et diglycérides', E500: 'carbonates de sodium', E503: "carbonates d'ammonium", E509: 'chlorure de calcium',
    E511: 'chlorure de magnésium', E516: 'sulfate de calcium', E621: 'glutamate monosodique', E1404: 'amidon oxydé',
    E1414: 'phosphate de diamidon acétylé', E1420: 'amidon acétylé', E1422: 'adipate de diamidon acétylé', E1442: 'phosphate de diamidon hydroxypropylé'
  };

  return { demarrer, arreter, codeValide, chercherProduit };
})();
