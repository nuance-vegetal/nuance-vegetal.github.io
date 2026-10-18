# Nuance végétal

Site statique (HTML, CSS, JavaScript sans framework) du TFE en diététique de Camille, HEPH-Condorcet (Tournai).
Il apprend à lire l'étiquette d'une alternative végétale à la viande en 5 coups d'œil.

## Pages

| Fichier | Page |
|---|---|
| `index.html` | Accueil et étiquette interactive |
| `decodeur.html` | Décodeur (calcul en direct) |
| `etiquette.html` | Étiquette décortiquée |
| `bases.html` | C'est fait avec quoi ? (données : `donnees/bases.json`) |
| `etudes.html` | Ce que disent les études (données : `donnees/etudes.json`) |
| `fiche-frigo.html` | Fiche frigo imprimable |

Seuils du décodeur : `js/config.js`. Modifier les contenus : voir [NOTICE.md](NOTICE.md).

## Scan de code-barres

Le décodeur peut scanner un code-barres (`js/scanner.js`) :

- détection native (`BarcodeDetector`) quand le navigateur la propose (Chrome Android), sinon la bibliothèque ZXing, copiée dans `js/vendor/zxing.min.js` (@zxing/library 0.23.0, licence Apache 2.0) et chargée seulement au moment du scan ;
- les valeurs nutritionnelles viennent de l'API d'[Open Food Facts](https://world.openfoodfacts.org) (licence ODbL). Aucune note n'est affichée : le scan remplit seulement les champs du décodeur ;
- la caméra exige une adresse en **https** (ou localhost). On peut aussi taper le numéro du code-barres à la main.

Le scan était « hors périmètre » dans le cahier des charges : il a été ajouté à la demande et reste à valider par Camille.

## Animations

`js/animations.js` gère les animations au défilement : barre de progression, titres qui apparaissent mot par mot, photos qui se dévoilent avec parallaxe, cartes « 5 coups d'œil » empilées, manifeste dont les mots s'allument, bandeau de chiffres qui suit la vitesse du scroll. Sur ordinateur, le défilement est adouci par Lenis (`js/vendor/lenis.min.js`, version 1.3.26, licence MIT).

Tout est désactivé quand l'appareil demande moins de mouvement (réglage d'accessibilité « réduire les animations ») : le contenu s'affiche alors directement.

Les titres et textes d'interface ont un ton plus « réseaux sociaux » (minuscules, mot d'accent en italique Instrument Serif). Les contenus scientifiques n'ont pas été modifiés. Ce changement de ton est à valider par Camille.

## Lancer en local

Les fiches sont chargées depuis des fichiers JSON : il faut un petit serveur (ouvrir le fichier directement ne charge pas les fiches).

```bash
python -m http.server 5180
```

Puis ouvrir http://localhost:5180.

## Mise en ligne

Aucun build : il suffit de publier le dossier tel quel (GitHub Pages, Netlify…).

## Vie privée

Aucune donnée saisie n'est envoyée ni stockée, pas de cookies. Exception : quand on scanne, le numéro du code-barres (et lui seul) est envoyé à Open Food Facts pour trouver le produit. La caméra reste sur l'appareil. Les polices viennent de Google Fonts ; pour éviter tout appel à Google, on peut les héberger dans le dossier du site avant la mise en ligne.

## Photos

Photos [Unsplash](https://unsplash.com/license) (licence libre, usage gratuit), recadrées et compressées en WebP dans `images/` :

| Fichier | Auteur·e (Unsplash) |
|---|---|
| hero.webp | @riosamba |
| tofu.webp | @leongsan |
| tempeh.webp | @vovkapanda |
| seitan.webp | @murpaz |
| quorn.webp | @rifje |
| pois.webp | @chimp_9608 |
| quinoa.webp | @bamin |
| etudes.webp | @fotoinshadows |
| assiette.webp | @nadineprimeau |
| decodeur.webp | @thomaskinto |
