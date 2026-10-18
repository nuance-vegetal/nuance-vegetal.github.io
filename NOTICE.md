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
  "description": "Une phrase simple.",
  "proteines": "≈ 12 à 15 g pour 100 g",
  "allergenes": ["Soja"],
  "enquete": "XX % de bonnes réponses",
  "sources": "Auteur (année)"
}
```

- `base` doit être exactement l'une de ces valeurs pour que les filtres marchent : `Soja`, `Blé`, `Champignon`, `Pois`, `Autre`.
- `enquete` : le texte de l'encart bleu (résultat de l'enquête).

## 3. Les seuils du décodeur

Fichier : `js/config.js`

Seuls les **chiffres** sont à changer. Le décimal s'écrit avec un **point** dans ce fichier (`1.5`, pas `1,5`) ; le site l'affiche ensuite avec une virgule.
Un changement ici met à jour le décodeur **et** la fiche frigo.

## 4. Les pièges à éviter

1. Garde les **guillemets droits** `"` autour des textes (pas « » ni “ ”) — à l'intérieur d'un texte, les « » sont permis.
2. Une **virgule** entre deux fiches, mais **pas** après la dernière.
3. Pour mettre un guillemet droit dans un texte, écris `\"`.
4. En cas de doute, colle le contenu du fichier sur <https://jsonlint.com> : il te dit où est l'erreur.

Si une page affiche « Les fiches n'ont pas pu être chargées », c'est presque toujours une virgule ou un guillemet oublié.

## 5. Les autres textes

Les textes de l'accueil, de l'étiquette décortiquée et de la fiche frigo sont directement dans les fichiers `.html`.
Les passages entre crochets `[à compléter]` sont à rédiger ; on peut les remplacer en gardant tout ce qui est entre `<` et `>`.
