/*
 * Couleurs du site : thème et couleur principale choisis dans Pages CMS (donnees/theme.json).
 * Chargé dans <head> pour appliquer le thème avant l'affichage. Le dernier thème est gardé
 * en mémoire dans le navigateur pour éviter un changement de couleur visible au chargement.
 */
(function () {
  var CLE = 'nuance-vegetale-theme';
  var THEMES = ['sauge', 'terracotta', 'lavande', 'ocean', 'olive', 'cacao', 'framboise'];
  var racine = document.documentElement;

  function hexValide(h) { return /^#[0-9a-fA-F]{6}$/.test(h || ''); }
  function rvb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function melange(h, avec, t) {
    var a = rvb(h), b = rvb(avec);
    return hex(a.map(function (v, i) { return v + (b[i] - v) * t; }));
  }
  function lum(h) {
    var c = rvb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  function appliquer(t) {
    if (!t) return;
    racine.setAttribute('data-theme', THEMES.indexOf(t.theme) >= 0 ? t.theme : 'sauge');
    var s = racine.style;
    ['--principal', '--principal-survol', '--sauge-clair', '--sur-fonce'].forEach(function (v) { s.removeProperty(v); });
    if (hexValide(t.couleurPrincipale)) {
      // assombrit la couleur si le texte clair des boutons ne serait pas assez lisible dessus
      var c = t.couleurPrincipale, i = 0;
      while (contraste(c, '#FDF9F1') < 4.5 && i < 25) { c = melange(c, '#000000', 0.08); i++; }
      s.setProperty('--principal', c);
      s.setProperty('--principal-survol', melange(c, '#000000', 0.3));
      s.setProperty('--sauge-clair', melange(c, '#FFFFFF', 0.85));
      s.setProperty('--sur-fonce', melange(c, '#FFFFFF', 0.72));
    }
  }

  try { appliquer(JSON.parse(localStorage.getItem(CLE))); } catch (e) { /* rien en mémoire */ }

  fetch('donnees/theme.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (t) {
      if (!t) return;
      appliquer(t);
      try { localStorage.setItem(CLE, JSON.stringify(t)); } catch (e) { /* stockage indisponible */ }
    })
    .catch(function () { /* hors ligne : on garde le thème en mémoire */ });
})();
