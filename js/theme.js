/*
 * Couleurs du site, réglées dans Pages CMS (donnees/theme.json) :
 *  - une ambiance prête (theme) ;
 *  - ou 4 couleurs personnalisées (fond, cartes, principale, texte), choisies dans atelier-couleurs.html.
 * Chargé dans <head> pour appliquer les couleurs avant l'affichage. La dernière version est gardée
 * en mémoire dans le navigateur pour éviter un changement de couleur visible au chargement.
 */
(function () {
  var CLE = 'nuance-vegetale-theme';
  var THEMES = ['sauge', 'terracotta', 'lavande', 'ocean', 'olive', 'cacao', 'framboise'];
  var VARIABLES = ['--fond', '--fond-2', '--carte', '--contour', '--contour-doux', '--pastille', '--pastille-texte',
    '--texte', '--texte-2', '--principal', '--principal-survol', '--sauge-clair', '--sur-fonce'];
  var racine = document.documentElement;
  // Couleurs de base de chaque ambiance (pour compléter une couleur personnalisée laissée vide)
  var BASES = {"sauge": {"fond": "#F6EFE3", "carte": "#FDF9F1", "principal": "#2F6B4F", "texte": "#1F2D25"}, "terracotta": {"fond": "#F7EEE6", "carte": "#FDF8F3", "principal": "#9C4325", "texte": "#2E211B"}, "lavande": {"fond": "#F3F0F6", "carte": "#FBF9FD", "principal": "#5B4B8A", "texte": "#221E2E"}, "ocean": {"fond": "#EEF3F3", "carte": "#F9FCFC", "principal": "#1F5F75", "texte": "#17262B"}, "olive": {"fond": "#F5F2E4", "carte": "#FCFAF1", "principal": "#58641C", "texte": "#24261A"}, "cacao": {"fond": "#F4EBE0", "carte": "#FBF6EF", "principal": "#74482F", "texte": "#33241B"}, "framboise": {"fond": "#F8F0F0", "carte": "#FDF8F8", "principal": "#953A59", "texte": "#2B1D22"}};

  /* ---------- Outils couleur ---------- */
  function hexValide(h) { return /^#[0-9a-fA-F]{6}$/.test(h || ''); }
  function rvb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function melange(h, avec, t) {
    var a = rvb(h), b = rvb(avec);
    return hex(a.map(function (v, i) { return v + (b[i] - v) * t; }));
  }
  function lum(h) {
    var c = rvb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  /** Fonce (ou éclaircit si les fonds sont foncés) une couleur jusqu'au contraste demandé. */
  function assurer(c, fonds, mini) {
    var vers = lum(fonds[0]) > 0.35 ? '#000000' : '#FFFFFF', i = 0;
    var ok = function () { return fonds.every(function (f) { return contraste(c, f) >= mini; }); };
    while (!ok() && i < 30) { c = melange(c, vers, 0.07); i++; }
    return c;
  }

  /** Calcule toutes les couleurs du site à partir des 4 couleurs de base. */
  function paletteDepuis(fond, carte, principal, texte) {
    var p = {};
    p['--fond'] = fond;
    p['--carte'] = carte;
    p['--texte'] = assurer(texte, [fond, carte], 7);
    p['--texte-2'] = assurer(melange(p['--texte'], fond, 0.3), [fond, carte], 4.5);
    p['--fond-2'] = melange(fond, p['--texte'], 0.05);
    p['--contour'] = melange(fond, p['--texte'], 0.12);
    p['--contour-doux'] = melange(fond, p['--texte'], 0.07);
    p['--pastille'] = melange(fond, p['--texte'], 0.06);
    p['--pastille-texte'] = assurer(melange(p['--texte'], fond, 0.2), [p['--pastille']], 4.5);
    p['--principal'] = assurer(principal, [carte, fond], 4.5);
    p['--principal-survol'] = melange(p['--principal'], '#000000', 0.3);
    p['--sauge-clair'] = melange(p['--principal'], '#FFFFFF', 0.85);
    p['--sur-fonce'] = assurer(melange(p['--principal'], '#FFFFFF', 0.72), [p['--principal-survol']], 4.5);
    return p;
  }

  /** Liste des ajustements faits pour garder le site lisible (affichée dans l'atelier). */
  function verifier(fond, carte, principal, texte) {
    var alertes = [];
    if (lum(fond) < 0.35) alertes.push('Le fond est foncé : le site est prévu pour un fond clair, certains éléments peuvent mal ressortir.');
    if (contraste(texte, fond) < 7) alertes.push('Le texte manque de contraste avec le fond : il sera foncé automatiquement.');
    if (contraste(principal, carte) < 4.5 || contraste(principal, fond) < 4.5) alertes.push('La couleur principale est trop claire pour le texte des boutons : elle sera foncée automatiquement.');
    if (contraste(carte, fond) < 1.03) alertes.push('Les cartes et le fond sont presque identiques : les cartes se verront moins.');
    return alertes;
  }

  function nettoyer() {
    VARIABLES.forEach(function (v) { racine.style.removeProperty(v); });
  }

  function appliquer(t) {
    if (!t) return;
    nettoyer();
    racine.setAttribute('data-theme', THEMES.indexOf(t.theme) >= 0 ? t.theme : 'sauge');
    var perso = t.personnalise;
    var base = BASES[racine.getAttribute('data-theme')] || BASES.sauge;
    var choix = function (cle) { return perso && hexValide(perso[cle]) ? perso[cle] : base[cle]; };
    if (perso && perso.actif && ['fond', 'carte', 'principal', 'texte'].some(function (k) { return hexValide(perso[k]); })) {
      var p = paletteDepuis(choix('fond'), choix('carte'), choix('principal'), choix('texte'));
      Object.keys(p).forEach(function (v) { racine.style.setProperty(v, p[v]); });
      return;
    }
    if (hexValide(t.couleurPrincipale)) {
      var c = assurer(t.couleurPrincipale, ['#FDF9F1'], 4.5);
      racine.style.setProperty('--principal', c);
      racine.style.setProperty('--principal-survol', melange(c, '#000000', 0.3));
      racine.style.setProperty('--sauge-clair', melange(c, '#FFFFFF', 0.85));
      racine.style.setProperty('--sur-fonce', melange(c, '#FFFFFF', 0.72));
    }
  }

  // Outils réutilisés par la page atelier-couleurs.html
  window.NuanceCouleurs = { paletteDepuis: paletteDepuis, verifier: verifier, contraste: contraste, hexValide: hexValide, VARIABLES: VARIABLES };

  // Dans l'aperçu de l'atelier, c'est l'atelier qui pilote les couleurs
  if (/[?&]atelier=1/.test(location.search)) return;

  try { appliquer(JSON.parse(localStorage.getItem(CLE))); } catch (e) { /* rien en mémoire */ }

  fetch('donnees/theme.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (t) {
      if (!t) return;
      appliquer(t);
      try { localStorage.setItem(CLE, JSON.stringify(t)); } catch (e) { /* stockage indisponible */ }
    })
    .catch(function () { /* hors ligne : on garde les couleurs en mémoire */ });
})();
