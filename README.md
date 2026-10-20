# Nuance végétale

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
| `ta-fiche-pdf.html` | Ta fiche PDF : vrai PDF au format téléphone (`js/fiche-pdf.js`, jsPDF 4.2.1, licence MIT), imprimable. `fiche-frigo.html` redirige vers cette page. |

En ligne : https://nuance-vegetal.github.io (GitHub Pages, dépôt `nuance-vegetal/nuance-vegetal.github.io`).

Contenus et réglages : `donnees/*.json` (fiches Études et Bases, chiffres de l'enquête, seuils du décodeur et infos du scan), modifiables avec Pages CMS (`.pages.yml`). Voir [NOTICE.md](NOTICE.md).

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

Aucun build : GitHub Pages publie la branche `main` telle quelle. Chaque commit (y compris ceux de Pages CMS) met le site à jour en une minute environ.

## Vie privée

Aucune donnée saisie n'est envoyée ni stockée, pas de cookies. Exception : quand on scanne, le numéro du code-barres (et lui seul) est envoyé à Open Food Facts pour trouver le produit. La caméra reste sur l'appareil. Les polices (Bricolage Grotesque, DM Sans, Instrument Serif — licence SIL Open Font License) sont hébergées dans `fonts/` : aucune requête vers Google. L'encadré « Donne ton avis » renvoie vers le Google Form seulement quand on clique.

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

## Logos bio (encadré « Bio ? Voici comment le vérifier »)

Affichés à titre d'information, pour aider à reconnaître les labels sur l'emballage (`images/labels/`) :

| Fichier | Source |
|---|---|
| bio-europeen.svg | Logo bio de l'Union européenne — version vectorielle du fichier officiel de la Commission européenne ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Organic-Logo.svg), domaine public). La Commission autorise son usage pour informer le public sur le bio. |
| biogarantie.svg | Logo Biogarantie — fichier publié sur le site officiel [biogarantie.be](https://biogarantie.be) |
| ab-agriculture-biologique.svg | Logo AB — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Agriculture-biologique.svg) (domaine public) |
