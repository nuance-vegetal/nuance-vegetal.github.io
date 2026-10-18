/*
 * Les réglages du site (seuils du décodeur, infos affichées après un scan)
 * sont dans donnees/reglages.json : on les modifie avec Pages CMS (voir NOTICE.md).
 */
window.chargerReglages = async function () {
  if (window.CONFIG) return window.CONFIG;
  const rep = await fetch('donnees/reglages.json', { cache: 'no-cache' });
  if (!rep.ok) throw new Error('Réglages introuvables');
  window.CONFIG = await rep.json();
  return window.CONFIG;
};
