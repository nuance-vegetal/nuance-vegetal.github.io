# Notice — modifier le site sans le développeur

Cette notice explique comment changer les fiches **Études**, les fiches **Bases** et les **seuils** du décodeur.
Tu n'as besoin que d'un éditeur de texte (Bloc-notes, ou directement sur GitHub avec le bouton crayon).

---

## 1. Les fiches « Ce que disent les études »

Fichier : `donnees/etudes.json`

Chaque fiche ressemble à ceci :

```json
{
  "question": "Le soja est-il mauvais pour les hormones ?",
  "brouillon": true,
  "reponse": "La réponse courte, en une ou deux phrases.",
  "points": [
    "Premier point clé.",
    "Deuxième point clé."
  ],
  "conseil": "Le conseil pratique.",
  "niveau": 2,
  "sources": [
    { "texte": "Auteur (année). Titre. Revue.", "url": "https://doi.org/..." }
  ]
}
```

| Champ | À quoi il sert |
|---|---|
| `question` | Le titre de la fiche (ce qu'on touche pour l'ouvrir) |
| `brouillon` | `true` affiche « Brouillon à valider ». Mets `false` quand le texte est validé |
| `reponse` | La réponse courte, en gras |
| `points` | Les points clés, un par ligne entre guillemets |
| `conseil` | Le conseil pratique (encart bleu) |
| `niveau` | Niveau de preuve : `1` faible, `2` moyen, `3` élevé |
| `sources` | Une ou plusieurs sources. `url` peut être vide : `""` |

**Ajouter une fiche** : copie une fiche entière, de `{` à `}`, colle-la après la dernière, et ajoute une **virgule** entre les deux `}` et `{`.

## 2. Les fiches « C'est fait avec quoi ? »

Fichier : `donnees/bases.json`

```json
{
  "nom": "Tofu",
  "base": "Soja",
  "image": "images/tofu.webp",
  "image_description": "Bloc de tofu garni d'oignons verts",
  "description": "Une phrase simple.",
  "proteines": "≈ 12 à 15 g pour 100 g",
  "allergenes": ["Soja"],
  "enquete": "XX % de bonnes réponses",
  "sources": "Auteur (année)"
}
```

- `base` doit être exactement l'une de ces valeurs pour que les filtres marchent : `Soja`, `Blé`, `Champignon`, `Pois`, `Autre`.
- `image` : la photo de la fiche, rangée dans le dossier `images/` (format paysage, idéalement en `.webp` et moins de 120 Ko). `image_description` décrit la photo pour les personnes aveugles.
- `enquete` : le texte de l'encart bleu (résultat de l'enquête).

## 3. Les chiffres de l'enquête (accueil)

Fichier : `donnees/enquete.js`

Il contient les cartes de chiffres (`chiffres`) et le bandeau qui défile (`bandeau`). Change seulement les nombres et les textes entre guillemets, puis enregistre : l'accueil se met à jour tout seul.

D'autres chiffres de l'enquête sont écrits directement dans les textes : l'intro de la page Études (52 %), la fiche Études sur la B12 (14 %) et les champs `enquete` du fichier `donnees/bases.json`.

## 4. Les seuils du décodeur

Fichier : `js/config.js`

Seuls les **chiffres** sont à changer. Le décimal s'écrit avec un **point** dans ce fichier (`1.5`, pas `1,5`) ; le site l'affiche ensuite avec une virgule.
Un changement ici met à jour le décodeur **et** la fiche frigo.

### Les infos affichées après un scan

Toujours dans `js/config.js`, la liste `scanInfos` choisit les lignes affichées après un scan et leur ordre : `b12`, `fer`, `gluten`, `lait`, `autresAllergenes`, `vegan`, `huilePalme`, `additifs`, `bio`. Pour masquer une info, supprime sa ligne (avec sa virgule).

Ces infos viennent d'Open Food Facts, une base remplie par des bénévoles : « non signalé » ne veut jamais dire « absent ». Pour la mention végan, le site distingue « végan (label) », quand le produit porte un logo, et « végan d'après les ingrédients », une déduction moins sûre.

## 5. Les pièges à éviter

1. Garde les **guillemets droits** `"` autour des textes (pas « » ni “ ”) — à l'intérieur d'un texte, les « » sont permis.
2. Une **virgule** entre deux fiches, mais **pas** après la dernière.
3. Pour mettre un guillemet droit dans un texte, écris `\"`.
4. En cas de doute, colle le contenu du fichier sur <https://jsonlint.com> : il te dit où est l'erreur.

Si une page affiche « Les fiches n'ont pas pu être chargées », c'est presque toujours une virgule ou un guillemet oublié.

## 6. Les autres textes

Les textes de l'accueil, de l'étiquette décortiquée et de la fiche frigo sont directement dans les fichiers `.html`.
Les passages entre crochets `[à compléter]` sont à rédiger ; on peut les remplacer en gardant tout ce qui est entre `<` et `>`.
