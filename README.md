# Nuance végétale

Site statique (HTML, CSS, JavaScript sans framework) du TFE en diététique de Camille, HEPH-Condorcet (Tournai).
Il apprend à lire l'étiquette d'une alternative végétale à la viande en 5 coups d'œil et 6 repères.

## Pages

| Fichier | Page |
|---|---|
| `index.html` | Accueil et étiquette interactive |
| `decodeur.html` | Décodeur : 6 repères du Conseil Supérieur de la Santé, calcul en direct (`js/evaluation.js`) |
| `etiquette.html` | Étiquette décortiquée (textes : `donnees/etiquette.json`) |
| `equivalences.html` | Équivalences et complémentarité (`donnees/equivalences.json`) |
| `createurs.html` | Les créateurs (`donnees/createurs.json`), lien dans le pied de page et le menu |
| `bases.html` | C'est fait avec quoi ? (données : `donnees/bases.json`) |
| `etudes.html` | Ce que disent les études (données : `donnees/etudes.json`) |
| `ta-fiche-pdf.html` | Ta fiche PDF : vrai PDF au format téléphone (`js/fiche-pdf.js`, jsPDF 4.2.1, licence MIT), imprimable. `fiche-frigo.html` redirige vers cette page. |

En ligne : https://nuance-vegetal.github.io (GitHub Pages, dépôt `nuance-vegetal/nuance-vegetal.github.io`).

Contenus et réglages : `donnees/*.json` (fiches Études et Bases, chiffres de l'enquête, seuils du décodeur et infos du scan), modifiables avec Pages CMS (`.pages.yml`). Voir [NOTICE.md](NOTICE.md).

## Scan de code-barres

Le décodeur peut scanner un code-barres (`js/scanner.js`) :

- détection native (`BarcodeDetector`) quand le navigateur la propose (Chrome Android), sinon la bibliothèque ZXing, copiée dans `js/vendor/zxing.min.js` (@zxing/library 0.23.0, licence Apache 2.0) et chargée seulement au moment du scan ;
- les valeurs nutritionnelles viennent de l'API d'[Open Food Facts](https://world.openfoodfacts.org) (licence ODbL). Aucune note globale n'est affichée : le scan remplit les champs du décodeur, puis chaque repère est montré séparément ;
- la caméra exige une adresse en **https** (ou localhost). On peut aussi taper le numéro du code-barres à la main.

## Évaluation (cahier des charges « scanner », 20 octobre 2026)

`js/evaluation.js` applique les critères du Conseil Supérieur de la Santé, avis n° 9445 « Alimentation végétarienne » (2021), pour 100 g :

| Repère | Atteint si |
|---|---|
| Protéines | plus de 10 g |
| Matières grasses | moins de 10 g et moins que les protéines |
| Graisses saturées | moins de 5 g et au plus 1/3 des matières grasses |
| Sel | 1,1 g maximum |
| Fer | plus de 0,8 mg |
| Vitamine B12 | plus de 0,24 µg |

Chaque repère est « atteint » (✓), « à surveiller » (!) ou « non renseigné » (?) ; une valeur absente n'est jamais comptée comme 0. L'allégation européenne « riche en protéines » (≥ 20 % de l'énergie) ou « source de protéines » (≥ 12 %) est affichée à part, comme une information. Les seuils sont dans la constante `CSS` et peuvent être remplacés depuis `donnees/reglages.json` → `css`.

Fer et B12 : le seuil est inclus (« au moins »). Protéines : « plus de 10 g », seuil exclu.

## Statut végan et produits hors alternatives (cahier des charges du 23 octobre 2026)

`js/vegan.js`, listes dans `donnees/scanner.json` (modifiables dans Pages CMS) :

- produit en catégorie viande, poisson, laitiers ou œufs (`categories_tags`) et pas en substitut de viande : « non végan » et un message à la place des 6 repères ;
- statut végan, dans l'ordre : mention ou label vegan non niée (nom, nom générique, labels ; FR, NL, DE, EN, ES, IT) → analyse d'Open Food Facts → mots-clés dans les ingrédients (FR, NL, EN ; mots entiers, accents ignorés, faux positifs retirés, expressions longues d'abord) → « non spécifié ». La détection n'est jamais affichée.
- ingrédients lus en français, sinon néerlandais, sinon anglais.

Tests :

```
node tests/evaluation.test.js
```

```
node tests/vegan.test.js
```

## Contenus modifiables

Étiquette décortiquée, « Sa place dans l'assiette », fiche PDF (page et PDF), créateurs, équivalences et mots-clés du scanner sont dans `donnees/*.json`. Dans les textes : `**gras**`, `[atteint]`, `[à surveiller]`, `[non renseigné]` (fonctions `enLigne` et `texteRiche` de `js/commun.js`).

Le site n'a qu'un thème clair : `color-scheme: only light` empêche les navigateurs en mode sombre de l'inverser.

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

Photos [Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/) et [Pixabay](https://pixabay.com/service/license-summary/) (licences libres, usage gratuit), recadrées et compressées en WebP dans `images/` :

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

## Textes des pages modifiables

Chaque texte simple des pages porte `data-texte="section.cle"` (ou `commun:pied.cle`) ; sa valeur est dans `donnees/textes/<page>.json`, appliquée par `js/textes.js` (le texte écrit dans le HTML sert de secours). Formulaires : groupe « Tous les textes des pages » de `.pages.yml`.

Pour un nouveau texte : ajouter `data-texte="sX.eN"` à la main (clé libre dans la section), la valeur dans le JSON de la page et le champ dans `.pages.yml`. Ne pas renuméroter les clés existantes : elles sont liées aux textes déjà modifiés par Camille.

