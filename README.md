# Décode ton simili

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

## Lancer en local

Les fiches sont chargées depuis des fichiers JSON : il faut un petit serveur (ouvrir le fichier directement ne charge pas les fiches).

```bash
python -m http.server 5180
```

Puis ouvrir http://localhost:5180.

## Mise en ligne

Aucun build : il suffit de publier le dossier tel quel (GitHub Pages, Netlify…).

## Vie privée

Aucune donnée saisie n'est envoyée ni stockée, pas de cookies. Les polices viennent de Google Fonts ; pour éviter tout appel à Google, on peut les héberger dans le dossier du site avant la mise en ligne.
