/*
 * « Ta fiche PDF » : fabrique un vrai fichier PDF au format téléphone (90 × 160 mm), dans le navigateur.
 * Les seuils viennent des réglages (Pages CMS) et les couleurs du thème du site.
 * jsPDF et les polices ne sont chargés qu'au moment du clic.
 */
window.FichePDF = (function () {
  const L = 90, H = 160, M = 7, LARGEUR = L - 2 * M;
  const FEUX = { vert: ['#DCEFE3', '#1E6B42'] };
  const BLEU = ['#E3EEF2', '#1E4350'];
  const ORANGE = ['#FBE6CC', '#8A4B0F'];
  const URL_SITE = 'https://nuance-vegetal.github.io/decodeur.html';

  function chargerScript(src) {
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = () => ko(new Error('script ' + src));
      document.head.appendChild(s);
    });
  }
  async function enBase64(url) {
    const octets = new Uint8Array(await (await fetch(url)).arrayBuffer());
    let bin = '';
    for (let i = 0; i < octets.length; i += 0x8000) bin += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function imageEnPng(url, hauteurPx) {
    return new Promise((ok, ko) => {
      const img = new Image();
      img.onload = () => {
        const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const c = document.createElement('canvas');
        c.height = hauteurPx; c.width = Math.round(hauteurPx * ratio);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        ok({ data: c.toDataURL('image/jpeg', 0.88), ratio });
      };
      img.onerror = () => ko(new Error('image ' + url));
      img.src = url;
    });
  }
  function couleurTheme(variable, defaut) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : defaut;
  }

  async function generer(C) {
    if (!window.jspdf) await chargerScript('js/vendor/jspdf.umd.min.js?v=4.2.1');
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: [L, H], orientation: 'portrait', compress: true });

    // Polices du site (fichiers TTF hébergés dans fonts/)
    const polices = [
      ['DMSans-normal-400.ttf', 'DMSans', 'normal'], ['DMSans-normal-700.ttf', 'DMSans', 'bold'],
      ['BricolageGrotesque-normal-600.ttf', 'Bricolage', 'bold'], ['InstrumentSerif-italic-400.ttf', 'Instrument', 'italic']
    ];
    for (const [f, nom, style] of polices) {
      doc.addFileToVFS(f, await enBase64('fonts/' + f));
      doc.addFont(f, nom, style);
    }

    const principal = couleurTheme('--principal', '#2F6B4F');
    const survol = couleurTheme('--principal-survol', '#1F4A36');
    const clair = couleurTheme('--sur-fonce', '#BFE3C9');
    const texte = couleurTheme('--texte', '#1F2D25');
    const texte2 = couleurTheme('--texte-2', '#4A574E');
    const fond = couleurTheme('--fond', '#F6EFE3');

    let y = M;
    let page = 1;
    const pied = () => {
      doc.setFont('DMSans', 'normal'); doc.setFontSize(6.5); doc.setTextColor(texte2);
      doc.text('nuance végétale · ' + page, L / 2, H - 4, { align: 'center' });
    };
    const fondPage = () => { doc.setFillColor(fond); doc.rect(0, 0, L, H, 'F'); };
    const nouvellePage = () => { pied(); doc.addPage([L, H], 'portrait'); page++; fondPage(); y = M + 2; };
    const place = (h) => { if (y + h > H - 10) nouvellePage(); };

    const titre = (t) => {
      place(11);
      doc.setFont('Bricolage', 'bold'); doc.setFontSize(15); doc.setTextColor(texte);
      doc.text(t, M, y + 6); y += 10;
    };
    const lignes = (t, taille, largeur) => { doc.setFontSize(taille); return doc.splitTextToSize(t, largeur); };
    const para = (t, opts = {}) => {
      const taille = opts.taille || 9.5, gras = opts.gras, couleur = opts.couleur || texte2;
      doc.setFont('DMSans', gras ? 'bold' : 'normal');
      const ls = lignes(t, taille, LARGEUR);
      const h = ls.length * taille * 0.42 + 1.5;
      place(h);
      doc.setTextColor(couleur); doc.text(ls, M, y + taille * 0.36, { lineHeightFactor: 1.2 });
      y += h;
    };
    const puce = (t) => {
      doc.setFont('DMSans', 'normal');
      const ls = lignes(t, 9.5, LARGEUR - 4);
      const h = ls.length * 9.5 * 0.42 + 1.8;
      place(h);
      doc.setFillColor(principal); doc.circle(M + 1, y + 2.1, 0.75, 'F');
      doc.setTextColor(texte); doc.text(ls, M + 4, y + 3.4, { lineHeightFactor: 1.2 });
      y += h;
    };
    const encart = (titreEncart, t, couleurs) => {
      doc.setFont('DMSans', 'normal');
      const ls = lignes(t, 9, LARGEUR - 8);
      const h = 8 + ls.length * 9 * 0.42 + 4;
      place(h + 2);
      doc.setFillColor(couleurs[0]); doc.roundedRect(M, y, LARGEUR, h, 3, 3, 'F');
      doc.setTextColor(couleurs[1]);
      doc.setFont('DMSans', 'bold'); doc.setFontSize(9.5); doc.text(titreEncart, M + 4, y + 6);
      doc.setFont('DMSans', 'normal'); doc.setFontSize(9); doc.text(ls, M + 4, y + 10.5, { lineHeightFactor: 1.2 });
      y += h + 3;
    };
    // Un repère : rond sauge avec ✓ (dessiné, la police n'a pas ce signe), nom, puis seuil
    const repere = (nom, seuil) => {
      doc.setFont('DMSans', 'normal');
      const ls = lignes(seuil, 8.5, LARGEUR - 9);
      const h = 5 + ls.length * 8.5 * 0.42 + 3;
      place(h);
      const [bg, fg] = FEUX.vert;
      doc.setFillColor(bg); doc.circle(M + 2.8, y + 3, 2.8, 'F');
      doc.setDrawColor(fg); doc.setLineWidth(0.5);
      doc.lines([[0.9, 0.9], [1.8, -2]], M + 1.5, y + 3.1);
      doc.setFont('DMSans', 'bold'); doc.setFontSize(10); doc.setTextColor(texte);
      doc.text(nom, M + 8, y + 4);
      doc.setFont('DMSans', 'normal'); doc.setFontSize(8.5); doc.setTextColor(texte2);
      doc.text(ls, M + 8, y + 8, { lineHeightFactor: 1.2 });
      y += h;
    };

    /* ---------- Page 1 : couverture et seuils ---------- */
    fondPage();
    doc.setFillColor(survol); doc.rect(0, 0, L, 32, 'F');
    doc.setFont('Bricolage', 'bold'); doc.setFontSize(20); doc.setTextColor('#FDF9F1');
    doc.text('nuance', M, 15);
    const largeurNuance = doc.getTextWidth('nuance');
    doc.setFont('Instrument', 'italic'); doc.setFontSize(23); doc.setTextColor(clair);
    doc.text('végétale', M + largeurNuance + 2, 15);
    doc.setFont('DMSans', 'normal'); doc.setFontSize(9); doc.setTextColor('#FDF9F1');
    doc.text('Ta fiche pour lire une étiquette en magasin.', M, 24);
    y = 40;

    titre('Les 6 repères pour 100 g');
    para('Atteint si :', { taille: 8.5 });
    const S = Object.assign({}, NuanceEvaluation.CSS, C.css || {});
    NuanceEvaluation.listeReperes(S).forEach(([nom, seuil]) => repere(nom, seuil));
    para('Pas de note globale : regarde chaque repère et décide.', { taille: 8.5 });
    para('Repères : ' + S.reference + '.', { taille: 7.5 });

    /* ---------- B12, fer, ingrédients, bon réflexe ---------- */
    nouvellePage();
    titre('B12 et fer');
    puce('B12 : cherche « vitamine B12 », « cobalamine » ou « cyanocobalamine » dans les ingrédients.');
    puce('Fer : cherche « fer » ou un sel de fer (pyrophosphate ferrique, fumarate ferreux).');
    puce('Si le produit est enrichi, la quantité est aussi dans le tableau nutritionnel.');
    puce('Le fer des végétaux est mieux absorbé avec de la vitamine C (poivron, agrumes, kiwi).');
    y += 2;
    titre('Les ingrédients');
    puce('Le premier ingrédient (après l’eau) est la base : soja, blé, pois, champignon…');
    puce('Les allergènes sont mis en évidence, le plus souvent en gras.');
    y += 2;
    encart('Le bon réflexe', 'Compare le prix pour 20 g de protéines : prix au kilo × 2 ÷ protéines. Exemple : 14 €/kg et 15 g de protéines = 1,87 €.', BLEU);

    /* ---------- Pièges végan et gluten ---------- */
    nouvellePage();
    titre('Pièges végan');
    puce('Ingrédients d’origine animale moins évidents : lactosérum, caséine, gélatine, miel, carmin (E120).');
    puce('« Peut contenir des traces de lait » = contamination possible en usine, pas un vrai ingrédient laitier.');
    puce('Le lait et les œufs sont obligatoirement mis en évidence dans les ingrédients (le plus souvent en gras).');
    y += 2;
    titre('Gluten caché');
    para('Le blé est mis en évidence en gras dans la liste d’ingrédients. Attention au gluten caché dans les céréales :', { couleur: texte });
    encart('Contient du gluten', 'seigle, avoine (si contamination croisée), blé, orge, triticale, épeautre, kamut.', ORANGE);

    /* ---------- Logos bio et QR code ---------- */
    nouvellePage();
    titre('Bio ? Repère ces logos');
    const logos = [
      ['images/labels/bio-europeen.svg', 'Logo bio européen', 'Obligatoire sur tout produit bio préemballé de l’UE'],
      ['images/labels/biogarantie.svg', 'Biogarantie', 'Label belge'],
      ['images/labels/ab-agriculture-biologique.svg', 'AB (Agriculture Biologique)', 'Label français, fréquent en Belgique']
    ];
    for (const [src, nom, ou] of logos) {
      const img = await imageEnPng(src, 180);
      const h = 13, w = Math.min(22, h * img.ratio);
      place(h + 3);
      doc.setFillColor('#FFFFFF'); doc.roundedRect(M, y, 24, h + 2, 2, 2, 'F');
      doc.addImage(img.data, 'JPEG', M + 12 - w / 2, y + 1, w, h, undefined, 'FAST');
      doc.setFont('DMSans', 'bold'); doc.setFontSize(9); doc.setTextColor(texte);
      doc.text(doc.splitTextToSize(nom, LARGEUR - 28), M + 27, y + 5);
      doc.setFont('DMSans', 'normal'); doc.setFontSize(7.5); doc.setTextColor(texte2);
      doc.text(doc.splitTextToSize(ou, LARGEUR - 28), M + 27, y + 10);
      y += h + 5;
    }
    para('Le logo européen est accompagné d’un code de l’organisme de contrôle (ex. BE-BIO-01) et de l’origine des ingrédients (Agriculture UE / non UE).', { taille: 8.5 });
    y += 2;
    const qr = await imageEnPng('images/qr-decodeur.png', 300);
    place(36);
    doc.setFillColor('#FFFFFF'); doc.roundedRect(M, y, LARGEUR, 34, 3, 3, 'F');
    doc.addImage(qr.data, 'JPEG', M + 2, y + 2, 30, 30, undefined, 'FAST');
    doc.setFont('DMSans', 'bold'); doc.setFontSize(10); doc.setTextColor(texte);
    doc.text(doc.splitTextToSize('Scanne pour ouvrir le décodeur', LARGEUR - 36), M + 35, y + 11);
    doc.setFont('DMSans', 'normal'); doc.setFontSize(7); doc.setTextColor(texte2);
    doc.text(doc.splitTextToSize('nuance-vegetal.github.io', LARGEUR - 36), M + 35, y + 22);
    doc.link(M, y, LARGEUR, 34, { url: URL_SITE });
    y += 38;
    para('Outil réalisé dans le cadre d’un TFE en diététique, HEPH-Condorcet (Tournai). Il ne remplace pas l’avis d’un·e diététicien·ne.', { taille: 7 });
    pied();

    doc.setProperties({ title: 'Nuance végétale — ta fiche', subject: 'Lire l’étiquette d’une alternative végétale à la viande', creator: 'Nuance végétale' });
    return doc;
  }

  async function telecharger(C) {
    const doc = await generer(C);
    doc.save('nuance-vegetale-ta-fiche.pdf');
    return doc;
  }

  return { generer, telecharger };
})();
