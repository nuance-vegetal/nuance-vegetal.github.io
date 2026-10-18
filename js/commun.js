/* Petits outils partagés par toutes les pages. Rien n'est envoyé ni stocké. */

const MOUVEMENT_REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lit un nombre saisi : accepte la virgule ou le point. Renvoie null si vide ou invalide. */
function lireNombre(texte) {
  if (texte == null) return null;
  const propre = String(texte).trim().replace(/\s/g, '').replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(propre)) return null;
  const n = Number(propre);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Affiche un nombre à la française : 1,3 ; 26. */
function formatNombre(n, decimalesMax = 1) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimalesMax }).format(n);
}

/** Affiche un prix : 1,87 €. */
function formatPrix(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

/** Charge un fichier de données JSON (dossier donnees/). */
async function chargerDonnees(fichier) {
  const reponse = await fetch(fichier, { cache: 'no-cache' });
  if (!reponse.ok) throw new Error('Fichier introuvable : ' + fichier);
  return reponse.json();
}

/** Échappe un texte avant de l'insérer en HTML. */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Change la couleur et le mot d'une pastille, avec une petite animation. */
function majPastille(el, couleur, mot) {
  const classe = 'pastille ' + couleur;
  if (el.className.replace(' pop', '') === classe && el.textContent === mot) return;
  el.className = classe;
  el.textContent = mot;
  if (!MOUVEMENT_REDUIT && couleur !== 'gris') {
    void el.offsetWidth; // relance l'animation
    el.classList.add('pop');
  }
}

/** Accordéon animé : un seul <details> ouvert à la fois dans le conteneur. */
function accordeonExclusif(conteneur) {
  function ouvrir(d) {
    d.open = true;
    if (MOUVEMENT_REDUIT) return;
    const c = d.querySelector('.contenu');
    if (c) c.animate([{ height: '0px', opacity: 0 }, { height: c.scrollHeight + 'px', opacity: 1 }],
      { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function fermer(d) {
    const c = d.querySelector('.contenu');
    if (MOUVEMENT_REDUIT || !c) { d.open = false; return; }
    const a = c.animate([{ height: c.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 260, easing: 'ease-in' });
    a.onfinish = () => { d.open = false; };
  }
  conteneur.addEventListener('click', (e) => {
    const resume = e.target.closest('summary');
    if (!resume || !conteneur.contains(resume)) return;
    const details = resume.parentElement;
    e.preventDefault();
    if (details.open) { fermer(details); return; }
    conteneur.querySelectorAll('details[open]').forEach((d) => { if (d !== details) fermer(d); });
    ouvrir(details);
  });
  return { ouvrir: (d) => {
    conteneur.querySelectorAll('details[open]').forEach((x) => { if (x !== d) fermer(x); });
    if (!d.open) ouvrir(d);
  } };
}

/** Fait compter un nombre de 0 à sa valeur (attribut data-compteur). */
function compter(el) {
  const fin = Number(el.dataset.compteur);
  const suffixe = el.dataset.suffixe || '';
  if (MOUVEMENT_REDUIT) { el.textContent = formatNombre(fin, 0) + suffixe; return; }
  const debut = performance.now(), duree = 1400;
  (function etape(t) {
    const p = Math.min(1, (t - debut) / duree);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = formatNombre(Math.round(fin * ease), 0) + suffixe;
    if (p < 1) requestAnimationFrame(etape);
  })(debut);
}

/** Apparitions au défilement, compteurs et barre du haut. */
function animerPage(racine = document) {
  const elements = Array.from(racine.querySelectorAll('.revele, [data-compteur]')).filter((el) => !el.dataset.suivi);
  elements.forEach((el) => { el.dataset.suivi = '1'; });
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => { el.classList.add('visible'); if (el.dataset.compteur) compter(el); });
    return;
  }
  const obs = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      if (e.target.dataset.compteur) compter(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  elements.forEach((el) => obs.observe(el));
}

document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('charge'));
  animerPage();
  const barre = document.querySelector('.barre');
  if (barre) {
    const maj = () => barre.classList.toggle('defile', window.scrollY > 8);
    maj();
    window.addEventListener('scroll', maj, { passive: true });
  }
});

/** Fait défiler jusqu'à un élément (passe par le défilement doux s'il est actif). */
function defiler(el) {
  if (window.defilerVers) window.defilerVers(el);
  else el.scrollIntoView({ behavior: MOUVEMENT_REDUIT ? 'auto' : 'smooth', block: 'center' });
}

const ICONE_CHEVRON = '<svg class="icone chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
