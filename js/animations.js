/*
 * Animations au défilement : barre de progression, titres mot par mot, photos qui se dévoilent,
 * parallaxe, cartes empilées, manifeste qui s'allume, bandeau qui suit la vitesse du scroll.
 * Tout est coupé si l'appareil demande moins de mouvement (réglage d'accessibilité).
 */
(function () {
  const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));
  const borne = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Découpe d'un texte en mots (garde les balises internes) ---------- */
  function decouperMots(el, classeMot, classeInt) {
    const marcheur = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textes = [];
    while (marcheur.nextNode()) textes.push(marcheur.currentNode);
    let i = 0;
    textes.forEach((t) => {
      const frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach((morceau) => {
        if (!morceau) return;
        if (/^\s+$/.test(morceau)) { frag.appendChild(document.createTextNode(morceau)); return; }
        const mot = document.createElement('span');
        mot.className = classeMot;
        if (classeInt) {
          const int = document.createElement('span');
          int.className = classeInt;
          int.textContent = morceau;
          int.style.setProperty('--m', i);
          mot.appendChild(int);
        } else {
          mot.textContent = morceau;
          mot.style.setProperty('--m', i);
        }
        frag.appendChild(mot);
        i++;
      });
      t.replaceWith(frag);
    });
    return i;
  }

  if (MOUVEMENT_REDUIT) return;

  /* ---------- Défilement doux (ordinateur seulement) ---------- */
  let lenis = null;
  if (window.Lenis && window.matchMedia('(pointer: fine)').matches) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, autoRaf: true });
    document.documentElement.classList.add('defilement-doux');
    window.defilerVers = (el) => lenis.scrollTo(el, { offset: -120 });
    const dlg = document.querySelector('dialog');
    if (dlg) {
      new MutationObserver(() => (dlg.open ? lenis.stop() : lenis.start())).observe(dlg, { attributes: true, attributeFilter: ['open'] });
    }
  }

  /* ---------- Barre de progression ---------- */
  const barre = document.createElement('div');
  barre.className = 'progression';
  barre.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barre);

  /* ---------- Titres mot par mot ---------- */
  const titres = $$('main h1, main h2').filter((h) => !h.closest('.fiche-pdf, dialog'));
  titres.forEach((h) => {
    decouperMots(h, 'mot', 'mot-int');
    h.classList.remove('revele');
    h.classList.add('titre-anime');
  });

  /* ---------- Photos qui se dévoilent ---------- */
  const photos = $$('.accroche-visuel .photo, .bandeau .photo, .bloc-assiette .photo, .lien-photo .photo');

  /* ---------- Cartes empilées ---------- */
  const piles = $$('.pile').map((pile) => $$(':scope > li', pile));
  piles.forEach((cartes) => cartes.forEach((li, i) => {
    li.classList.remove('revele');
    li.style.setProperty('--i', i);
  }));
  const parallaxes = $$('.accroche-visuel .photo img, .bandeau .photo img, .bloc-assiette .photo img');

  /* ---------- Manifeste ---------- */
  const manifestes = $$('[data-manifeste]').map((section) => {
    const texte = section.querySelector('.manifeste-texte');
    const n = decouperMots(texte, 'mot-m');
    return { section, mots: $$('.mot-m', texte), n };
  });

  /* ---------- Observateur : déclenche les apparitions ---------- */
  const obs = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  $$('.titre-anime').concat(photos, piles.flat()).forEach((el) => obs.observe(el));
  // Les éléments .revele ajoutés ici sont suivis par animerPage (commun.js, au chargement)

  /* ---------- Bandeau défilant qui suit le scroll ---------- */
  const defilants = $$('.defilant-piste').map((piste) => ({ piste, x: 0, largeur: 0 }));

  /* ---------- Boucle principale ---------- */
  let dernierY = window.scrollY;
  let vitesse = 0;
  let sens = 1;

  function image() {
    const y = window.scrollY;
    const h = window.innerHeight;
    const delta = y - dernierY;
    dernierY = y;
    vitesse += (delta - vitesse) * 0.15;
    if (Math.abs(delta) > 0.5) sens = delta > 0 ? 1 : -1;

    // progression
    const max = document.documentElement.scrollHeight - h;
    barre.style.transform = 'scaleX(' + (max > 0 ? borne(y / max, 0, 1) : 0) + ')';

    // parallaxe
    parallaxes.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > h + 100) return;
      const decalage = (r.top + r.height / 2 - h / 2) / h;
      img.style.transform = 'translate3d(0,' + (decalage * -9).toFixed(2) + '%,0) scale(1.18)';
    });

    // cartes empilées : la carte du dessous recule un peu
    piles.forEach((cartes) => {
      cartes.forEach((li, i) => {
        const suivante = cartes[i + 1];
        if (!suivante) return;
        const d = suivante.getBoundingClientRect().top - li.getBoundingClientRect().top;
        const p = borne(1 - (d - 18) / li.offsetHeight, 0, 1);
        li.style.transform = 'scale(' + (1 - p * 0.06).toFixed(4) + ')';
        li.style.setProperty('--ombre-pile', (p * 0.35).toFixed(3));
      });
    });

    // manifeste
    manifestes.forEach(({ section, mots, n }) => {
      const r = section.getBoundingClientRect();
      const p = borne((h * 0.6 - r.top) / (r.height - h * 0.4), 0, 1);
      const actifs = Math.round(p * n);
      mots.forEach((m, i) => m.classList.toggle('allume', i < actifs));
    });

    // bandeau défilant
    defilants.forEach((d) => {
      if (!d.largeur) d.largeur = d.piste.scrollWidth / 2;
      d.x -= (0.45 + Math.min(Math.abs(vitesse) * 0.25, 9)) * sens;
      if (d.x <= -d.largeur) d.x += d.largeur;
      if (d.x > 0) d.x -= d.largeur;
      d.piste.style.transform = 'translate3d(' + d.x.toFixed(1) + 'px,0,0)';
    });

    requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
  window.addEventListener('resize', () => defilants.forEach((d) => { d.largeur = 0; }));
})();
