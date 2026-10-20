/*
 * Encadré « Donne ton avis » : lien vers le questionnaire d'évaluation (Google Form).
 * Le lien et les textes se règlent dans Pages CMS (donnees/avis.json).
 * Tant que le lien est vide, l'encadré ne s'affiche pas.
 */
window.Avis = (function () {
  let reglages = null;

  async function charger() {
    if (reglages) return reglages;
    try {
      const rep = await fetch('donnees/avis.json', { cache: 'no-cache' });
      reglages = rep.ok ? await rep.json() : {};
    } catch (e) {
      reglages = {};
    }
    return reglages;
  }

  const echap = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** Remplit les zones [data-avis] contenues dans « racine ». */
  async function afficher(racine) {
    const zones = (racine || document).querySelectorAll('[data-avis]');
    if (!zones.length) return;
    const r = await charger();
    const lien = String(r.lien || '').trim();
    if (!/^https:\/\/\S+$/.test(lien)) { zones.forEach((z) => { z.innerHTML = ''; }); return; }
    const html =
      '<aside class="encart-avis" aria-label="Donne ton avis">' +
      '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>' +
      '<p>' + echap(r.texte || 'Ton avis compte ! Aide-moi à améliorer Nuance végétale en répondant à un court questionnaire.') + '</p>' +
      '<a class="bouton" href="' + echap(lien) + '" target="_blank" rel="noopener">' + echap(r.bouton || 'Je donne mon avis') +
      ' <svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>' +
      '</aside>';
    zones.forEach((z) => { z.innerHTML = html; });
  }

  document.addEventListener('DOMContentLoaded', () => afficher(document));
  return { afficher };
})();
