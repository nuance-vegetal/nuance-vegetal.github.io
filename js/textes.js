/*
 * Textes des pages modifiables dans Pages CMS (« Textes de chaque page »).
 * Chaque texte de la page porte data-texte="section.cle" (ou "commun:pied.cle" pour le pied de page) ;
 * sa valeur est dans donnees/textes/<page>.json. Le texte écrit dans la page sert de secours.
 *
 * Mise en forme dans Pages CMS : *mot* = italique du titre, **mot** = gras, [texte](lien) = lien,
 * [atteint] / [à surveiller] / [non renseigné] = pastilles, retour à la ligne = retour à la ligne.
 * À charger avant js/animations.js.
 */
(function () {
  const PAGES = {
    '': 'accueil', 'index.html': 'accueil', 'decodeur.html': 'decodeur', 'etiquette.html': 'etiquette', 'bases.html': 'bases',
    'equivalences.html': 'equivalences', 'a-quoi-ca-sert.html': 'a-quoi-ca-sert', 'etudes.html': 'etudes',
    'ta-fiche-pdf.html': 'ta-fiche-pdf', 'createurs.html': 'createurs'
  };
  const page = PAGES[location.pathname.split('/').pop()];
  const elements = Array.from(document.querySelectorAll('[data-texte]'));
  if (!page || !elements.length) return;

  // Le texte d'origine, avant que les titres soient découpés mot par mot
  const originaux = new Map(elements.map((el) => [el, el.innerHTML]));

  function rendre(texte) {
    return echapper(texte)
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|[\w-]+\.html)[^\s)]*)\)/g, (m, t, url) =>
        '<a href="' + url + '"' + (/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<em class="serif">$1</em>')
      .replace(/\[(atteint|à surveiller|non renseigné)\]/gi, (m, mot) => PASTILLES_TEXTE[mot.toLowerCase()])
      .replace(/\n/g, '<br>');
  }
  // Compare deux morceaux de HTML tels que le navigateur les lit (espaces et entités mis à part)
  const tampon = document.createElement('div');
  const normal = (h) => { tampon.innerHTML = h; return tampon.innerHTML.replace(/\s+/g, ' ').trim(); };

  const lire = (nom) => chargerDonnees('donnees/textes/' + nom + '.json').catch(() => ({}));
  Promise.all([lire(page), lire('commun')]).then(([textesPage, textesCommuns]) => {
    elements.forEach((el) => {
      const ref = el.dataset.texte;
      const commun = ref.startsWith('commun:');
      const [section, cle] = ref.replace('commun:', '').split('.');
      const valeur = ((commun ? textesCommuns : textesPage)[section] || {})[cle];
      if (typeof valeur !== 'string' || !valeur.trim()) return; // case vide : on garde le texte de la page
      const html = rendre(valeur.trim());
      if (normal(html) === normal(originaux.get(el))) return;
      el.innerHTML = html;
      if (el.classList.contains('titre-anime') && window.decouperTitre) window.decouperTitre(el);
    });
  });
})();
