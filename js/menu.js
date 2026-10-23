/*
 * Menu du téléphone : barre en bas (accueil, bases, SCANNER, à quoi ça sert, plus)
 * et menu plein écran avec toutes les pages, ouvert par « plus ».
 * Sur ordinateur (≥ 1024 px), c'est le menu du haut qui s'affiche à la place.
 */
(function () {
  const PAGES = [
    ['index.html', 'accueil'],
    ['decodeur.html', 'décodeur'],
    ['etiquette.html', 'étiquette'],
    ['bases.html', 'les bases'],
    ['equivalences.html', 'équivalences'],
    ['a-quoi-ca-sert.html', 'à quoi ça sert ?'],
    ['etudes.html', 'études'],
    ['ta-fiche-pdf.html', 'ta fiche PDF'],
    ['createurs.html', 'les créateurs']
  ];
  const ic = (d) => '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  const ICONES = {
    accueil: ic('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    bases: ic('<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>'),
    scan: ic('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>'),
    aquoi: ic('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
    plus: ic('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'),
    fermer: ic('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')
  };

  const fichier = (location.pathname.split('/').pop() || 'index.html').replace('fiche-frigo.html', 'ta-fiche-pdf.html');
  const actif = (href) => (href === fichier ? ' aria-current="page"' : '');

  // ----- Barre du bas -----
  const barre = document.createElement('nav');
  barre.className = 'barre-mobile';
  barre.setAttribute('aria-label', 'Navigation');
  barre.innerHTML =
    '<a href="index.html"' + actif('index.html') + '>' + ICONES.accueil + '<span>accueil</span></a>' +
    '<a href="bases.html"' + actif('bases.html') + '>' + ICONES.bases + '<span>les bases</span></a>' +
    '<a href="decodeur.html#scanner" class="barre-scan" aria-label="Scanner un produit">' + ICONES.scan + '</a>' +
    '<a href="a-quoi-ca-sert.html"' + actif('a-quoi-ca-sert.html') + '>' + ICONES.aquoi + '<span>à quoi ?</span></a>' +
    '<button type="button" class="barre-plus" aria-haspopup="dialog" aria-expanded="false">' + ICONES.plus + '<span>plus</span></button>';

  // ----- Menu plein écran -----
  const menu = document.createElement('div');
  menu.className = 'menu-plein';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  menu.hidden = true;
  menu.innerHTML =
    '<div class="menu-plein-tete"><span class="surtitre">menu</span>' +
    '<button type="button" class="bouton-icone menu-fermer" aria-label="Fermer le menu">' + ICONES.fermer + '</button></div>' +
    '<nav aria-label="Toutes les pages"><ul>' +
    PAGES.map(([href, nom], i) => '<li style="--i:' + i + '"><a href="' + href + '"' + actif(href) + '>' + nom + '</a></li>').join('') +
    '</ul></nav>' +
    '<p class="menu-plein-pied">Outil réalisé dans le cadre d’un TFE en diététique, HEPH-Condorcet (Tournai).</p>';

  document.body.appendChild(barre);
  document.body.appendChild(menu);
  document.body.classList.add('avec-barre');

  const boutonPlus = barre.querySelector('.barre-plus');
  const boutonFermer = menu.querySelector('.menu-fermer');

  function ouvrir() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('ouvert'));
    boutonPlus.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-ouvert');
    boutonFermer.focus();
  }
  function fermer() {
    menu.classList.remove('ouvert');
    boutonPlus.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-ouvert');
    setTimeout(() => { menu.hidden = true; }, MOUVEMENT_REDUIT ? 0 : 300);
    boutonPlus.focus();
  }
  boutonPlus.addEventListener('click', ouvrir);
  boutonFermer.addEventListener('click', fermer);
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { fermer(); return; }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(menu.querySelectorAll('a, button'));
    const premier = focusables[0], dernier = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  });

  // Bouton scanner : sur la page du décodeur, ouvre directement la caméra
  barre.querySelector('.barre-scan').addEventListener('click', (e) => {
    if (typeof window.ouvrirScanner === 'function') { e.preventDefault(); window.ouvrirScanner(); }
  });
})();
