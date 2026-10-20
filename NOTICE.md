# Notice — modifier le site Nuance végétale sans le développeur

Le site se modifie avec **Pages CMS** : des formulaires en ligne, comme sur n'importe quel site. Tu ne touches jamais au code et tu ne peux rien casser par erreur.

Adresse du site : https://nuance-vegetal.github.io

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
     - **Les bases – fiches tofu, seitan, Quorn…** : la page « C'est fait avec quoi ? » ;
     - **À quoi ça sert ? – fiches B12, protéines, fer, additifs** : la page qui explique chaque nutriment (rôle, où le trouver, comment le repérer sur l'étiquette). Les « ? » du décodeur ouvrent directement la bonne fiche ;
     - **Études – questions et réponses** : la page « Ce que disent les études » ;
   - **Réglages**
     - **Couleurs du site** : choisis une ambiance (sauge, terracotta, lavande, océan, olive, cacao, framboise) et, si tu veux, une couleur principale à toi ;
     - **Questionnaire « Donne ton avis »** : colle le lien de ton Google Form ; l'encadré « Donne ton avis » apparaît alors sur l'accueil et sous les résultats du scan ;
     - **Décodeur, scan et fiche PDF – seuils des feux** : les limites vert / orange / rouge (utilisées par le décodeur, le scan et ta fiche PDF) et les infos affichées après un scan.
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

Les feux vert / orange / rouge du décodeur ne changent jamais : ils ont un sens et restent lisibles pour les personnes daltoniennes.

## Bon à savoir

- **Brouillon** : sur une fiche Études, la case « Brouillon » affiche « Brouillon à valider » sur le site. Décoche-la quand le texte est validé.
- **Niveau de preuve** : 1 = faible, 2 = moyen, 3 = élevé.
- **Seuils** : pour les nombres à virgule, tape un **point** (1.5) ; le site affiche ensuite une virgule (1,5).
- **Infos du scan** : coche ou décoche les lignes à afficher après un scan (B12, fer, gluten, lait, végan…).
- **Erreur ?** Tout est gardé dans l'historique : Alex peut revenir à la version d'avant à tout moment.

## Ce qui ne se modifie pas (encore) avec les formulaires

Les textes de l'accueil, les 5 commentaires de l'étiquette décortiquée et les listes de ta fiche PDF sont dans les pages elles-mêmes : envoie les nouveaux textes à Alex. Les passages entre crochets `[à compléter]` sont ceux qui restent à rédiger.

D'autres chiffres de l'enquête sont écrits dans les textes et ne suivent pas les cartes de l'accueil : l'intro de la page Études (52 %), la fiche Études sur la B12 (14 %) et les encarts « résultat de l'enquête » des fiches Bases.

---

## Pour le développeur

- Données : `donnees/*.json` ; formulaires : `.pages.yml` ; chargement des réglages : `js/config.js`.
- Chaque « Save » dans Pages CMS crée un commit sur `main` ; GitHub Pages republie le site en une minute environ.
- Sans Pages CMS, les mêmes fichiers se modifient sur github.com (icône crayon). Attention alors aux guillemets droits `"` et aux virgules entre les éléments ; https://jsonlint.com vérifie un fichier.
