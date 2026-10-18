/* Petits outils partagés par toutes les pages. Rien n'est envoyé ni stocké. */

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

/** Accordéon : un seul <details> ouvert à la fois dans le conteneur. */
function accordeonExclusif(conteneur) {
  conteneur.addEventListener('toggle', (e) => {
    const ouvert = e.target;
    if (!(ouvert instanceof HTMLDetailsElement) || !ouvert.open) return;
    conteneur.querySelectorAll('details[open]').forEach((d) => {
      if (d !== ouvert) d.open = false;
    });
  }, true);
}

/** Échappe un texte avant de l'insérer en HTML. */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const ICONE_CHEVRON = '<svg class="icone chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
