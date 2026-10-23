/*
 * « Ta fiche PDF » : fabrique un vrai fichier PDF au format téléphone (90 × 160 mm), dans le navigateur.
 * Les seuils viennent des réglages, les textes de donnees/fiche-pdf.json (Pages CMS) et les couleurs du thème du site.
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

  const sansGras = (t) => String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1');

  async function generer(C, T) {
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
    doc.text(T.sousTitre || '', M, 24);
    y = 40;

    titre(T.titreReperes || 'Les 6 repères pour 100 g');
    if (T.introReperes) para(T.introReperes, { taille: 8.5 });
    const S = Object.assign({}, NuanceEvaluation.CSS, C.css || {});
    NuanceEvaluation.listeReperes(S).forEach(([nom, seuil]) => repere(nom, seuil));
    if (T.noteReperes) para(T.noteReperes, { taille: 8.5 });
    para('Repères : ' + S.reference + '.', { taille: 7.5 });

    /* ---------- Sections de donnees/fiche-pdf.json (Pages CMS → « Fiche PDF ») ---------- */
    (T.sections || []).forEach((sec) => {
      if (sec.nouvellePage) nouvellePage(); else y += 2;
      if (sec.titre) titre(sec.titre);
      if (sec.texte) para(sansGras(sec.texte), { couleur: texte });
      (sec.points || []).filter(Boolean).forEach((p) => puce(sansGras(p)));
      const e = sec.encadre || {};
      if (e.texte) { y += 2; encart(e.titre || '', sansGras(e.texte), e.couleur === 'orange' ? ORANGE : BLEU); }
    });

    /* ---------- Logos bio et QR code ---------- */
    nouvellePage();
    titre(T.titreBio || 'Bio ? Repère ces logos');
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
    if (T.noteBio) para(T.noteBio, { taille: 8.5 });
    y += 2;
    const qr = await imageEnPng('images/qr-decodeur.png', 300);
    place(36);
    doc.setFillColor('#FFFFFF'); doc.roundedRect(M, y, LARGEUR, 34, 3, 3, 'F');
    doc.addImage(qr.data, 'JPEG', M + 2, y + 2, 30, 30, undefined, 'FAST');
    doc.setFont('DMSans', 'bold'); doc.setFontSize(10); doc.setTextColor(texte);
    doc.text(doc.splitTextToSize(T.titreQr || 'Scanne pour ouvrir le décodeur', LARGEUR - 36), M + 35, y + 11);
    doc.setFont('DMSans', 'normal'); doc.setFontSize(7); doc.setTextColor(texte2);
    doc.text(doc.splitTextToSize('nuance-vegetal.github.io', LARGEUR - 36), M + 35, y + 22);
    doc.link(M, y, LARGEUR, 34, { url: URL_SITE });
    y += 38;
    if (T.piedPage) para(T.piedPage, { taille: 7 });
    pied();

    doc.setProperties({ title: 'Nuance végétale — ta fiche', subject: 'Lire l’étiquette d’une alternative végétale à la viande', creator: 'Nuance végétale' });
    return doc;
  }

  async function telecharger(C, T) {
    const doc = await generer(C, T);
    doc.save('nuance-vegetale-ta-fiche.pdf');
    return doc;
  }

  return { generer, telecharger };
})();
