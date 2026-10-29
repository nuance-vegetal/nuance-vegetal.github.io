# Notice — modifier le site Nuance végétale sans le développeur

Le site se modifie avec **Pages CMS** : des formulaires en ligne, comme sur n'importe quel site. Tu ne touches jamais au code et tu ne peux rien casser par erreur.

Adresse du site : https://nuance-vegetal.github.io

## En 5 étapes

1. Va sur **https://app.pagescms.org**, **Sign in with GitHub**, puis choisis **nuance-vegetal.github.io**.
2. À gauche, clique sur ce que tu veux changer (liste complète ci-dessous).
3. Change le texte dans les cases.
4. Clique sur **Save**, en haut à droite.
5. Attends environ **une minute** et recharge le site : c'est en ligne.

Ce qu'il te faut : ton compte GitHub, déjà ajouté au projet (c'est le cas : tu as déjà fait des modifications avec Pages CMS).

---

## Une seule fois au début

1. Crée un compte gratuit sur **https://github.com/signup** (garde bien ton identifiant et ton mot de passe).
2. Envoie ton identifiant GitHub à Alex : il t'ajoute à l'organisation « nuance-vegetal ».
3. Tu reçois une invitation par e-mail : clique sur **Join nuance-vegetal**.

## Modifier un texte

1. Va sur **https://app.pagescms.org** et clique sur **Sign in with GitHub**.
2. Choisis le projet **nuance-vegetal.github.io**.
3. À gauche, choisis ce que tu veux modifier :
   - **Textes des pages du site**
     - **Accueil – chiffres de l'enquête** : les grandes cartes de chiffres et le bandeau qui défile ;
     - **Accueil – « Sa place dans l'assiette »** : le texte de la section 05 ;
     - **Étiquette décortiquée** : l'étiquette du produit fictif, les 5 commentaires, la carte « à retenir » et l'encadré des additifs ;
     - **Les bases – fiches tofu, seitan, Quorn…** : la page « C'est fait avec quoi ? » ;
     - **Équivalences et complémentarité** : les quantités du calculateur (pour 100 g de viande), les phrases, la source et les assiettes ;
     - **À quoi ça sert ? – fiches B12, protéines, fer, additifs, allégations** : la page qui explique chaque nutriment (rôle, où le trouver, comment le repérer sur l'étiquette). Les « ? » du décodeur ouvrent directement la bonne fiche ;
     - **Études – questions et réponses** : la page « Ce que disent les études » ;
     - **Fiche PDF** : tous les titres, textes, listes et encadrés de ta fiche. La page « Ta fiche PDF » et le fichier PDF téléchargé changent ensemble ;
     - **Créateurs** : les noms (toi, Alex, tes professeur·es) et l'école. Une carte sans nom n'est pas affichée ;
   - **Réglages**
     - **Couleurs du site** : choisis une ambiance (sauge, terracotta, lavande, océan, olive, cacao, framboise) et, si tu veux, une couleur principale à toi ;
     - **Questionnaire « Donne ton avis »** : colle le lien de ton Google Form ; l'encadré « Donne ton avis » apparaît alors sur l'accueil et sous les résultats du scan ;
     - **Scanner – mots-clés végan et catégories** : les mots qui font classer un produit « non végan » (en français, néerlandais et anglais), les faux positifs (« beurre de cacao »…), les mentions « vegan » reconnues, et les catégories Open Food Facts de la viande, du poisson, des laitiers et des œufs ;
     - **Décodeur, scan et fiche PDF – repères du CSS** : les 6 seuils du Conseil Supérieur de la Santé (avis n° 9445, 2021) utilisés par le décodeur, le scan et ta fiche PDF, les seuils de l'allégation « riche en / source de protéines », et les infos « bon à savoir » affichées après un scan.
4. Change le texte dans les cases.
5. Clique sur **Save** (en haut à droite).
6. Attends environ **une minute**, puis recharge le site : ta modification est en ligne.

### Ajouter, supprimer ou déplacer une fiche

- **Ajouter** : en bas de la liste, bouton **Add an entry** (ou « + »).
- **Supprimer** : l'icône poubelle à côté de la fiche.
- **Déplacer** : attrape la fiche par la poignée et glisse-la.

### Changer une photo (fiches « C'est fait avec quoi ? »)

Dans le champ **Photo**, clique sur l'image puis **Upload** pour envoyer une nouvelle photo. Choisis une photo en format paysage, la plus légère possible (moins de 200 Ko si tu peux). Remplis aussi la case « Description de la photo » : elle est lue aux personnes aveugles.

## Changer les couleurs

**Le plus simple : une ambiance prête**
1. **Réglages** → **Couleurs du site** → **Ambiance de couleurs** : choisis dans la liste (sauge, terracotta, lavande, océan, olive, cacao, framboise).
2. **Save**, puis recharge le site après une minute.

**Tes propres couleurs, avec un nuancier et un aperçu**
1. Ouvre **https://nuance-vegetal.github.io/atelier-couleurs.html** (page cachée, réservée à toi).
2. Choisis le fond, les cartes, la couleur principale et le texte avec les nuanciers : l'aperçu du site change en direct. Un message orange te prévient si une couleur rend le texte difficile à lire (le site la corrige alors un peu tout seul).
3. Clique sur **copier** à côté de chaque couleur et colle le code dans Pages CMS : **Réglages** → **Couleurs du site** → **Couleurs personnalisées**.
4. Coche **Utiliser mes couleurs**, puis **Save**.

Pour revenir à une ambiance prête, décoche **Utiliser mes couleurs**.

Les couleurs des repères du décodeur (✓ atteint en vert sauge, ! à surveiller en rose, ? non renseigné en sable) ne changent jamais : elles ont un sens, et le symbole et le mot les accompagnent toujours.

## Bon à savoir

- **Brouillon** : sur une fiche Études, la case « Brouillon » affiche « Brouillon à valider » sur le site. Décoche-la quand le texte est validé.
- **Niveau de preuve** : 1 = faible, 2 = moyen, 3 = élevé.
- **Seuils** : pour les nombres à virgule, tape un **point** (1.5) ; le site affiche ensuite une virgule (1,5).
- **Repères du CSS** : à vérifier dans l'avis original avant de les changer. La règle « saturées ≤ 1/3 des matières grasses » est fixe dans le code (`js/evaluation.js`).
- **Infos du scan** : coche ou décoche les lignes « bon à savoir » à afficher après un scan (gluten, lait, végan…). Le fer et la B12 font partie des 6 repères.
- **Erreur ?** Tout est gardé dans l'historique : Alex peut revenir à la version d'avant à tout moment.

## Tous les autres textes (titres, sous-titres, explications…)

À gauche dans Pages CMS : **Tous les textes des pages**, puis la page voulue (**Textes – Accueil**, **Textes – Décodeur**…).

- Les textes sont rangés **par section**, dans l'ordre de la page. Chaque case montre le début du texte actuel pour le retrouver vite.
- Exemple : les explications qui s'ouvrent quand on touche un mot de l'étiquette « à toi de jouer » sont dans **Textes – Accueil** → **Section « à toi de jouer »**.
- Le pied de page (commun à toutes les pages) est dans **Textes – Pied de page**.
- Mise en forme : `*mot*` = italique élégant (dans les titres), `**mot**` = gras, `[texte](https://…)` = lien.
- Une case vidée remet le texte d'origine.

## Sources modifiables

- **Accueil – chiffres de l'enquête** → « Ligne sous les cartes de chiffres » (n = 355).
- **Accueil – « Sa place dans l'assiette »** → « Sources ».
- **Les bases** → « Sources (en bas de la page, communes à toutes les fiches) », avec un lien par source.
- **À quoi ça sert ?** → « Encadré « Pourquoi ces repères ? » ».
- **Fiche PDF** → « Ligne de sources (page et PDF) ».
- **Créateurs** : une personne dont le nom est « ?? » ou entre crochets n'est pas affichée ; une adresse web dans « Précision » devient un lien.

## Mettre en forme un texte

Dans les grandes cases de texte (étiquette, assiette, créateurs, équivalences) :

- `**mot**` met le mot en **gras** ;
- `[atteint]`, `[à surveiller]` et `[non renseigné]` deviennent les pastilles de couleur des repères ;
- une ligne vide commence un nouveau paragraphe.

## Ce qui ne se modifie pas (encore) avec les formulaires

Les autres textes de l'accueil (titres, 5 coups d'œil, « à toi de jouer ») sont dans la page elle-même : envoie les nouveaux textes à Alex. Les passages entre crochets `[à compléter]` sont ceux qui restent à rédiger.

D'autres chiffres de l'enquête sont écrits dans les textes et ne suivent pas les cartes de l'accueil : l'intro de la page Études (49 %), la fiche Études sur la B12 (13 %) et les encarts « résultat de l'enquête » des fiches Bases.

---

## Pour le développeur

- Données : `donnees/*.json` ; formulaires : `.pages.yml` ; chargement des réglages : `js/config.js`.
- Chaque « Save » dans Pages CMS crée un commit sur `main` ; GitHub Pages republie le site en une minute environ.
- Sans Pages CMS, les mêmes fichiers se modifient sur github.com (icône crayon). Attention alors aux guillemets droits `"` et aux virgules entre les éléments ; https://jsonlint.com vérifie un fichier.
