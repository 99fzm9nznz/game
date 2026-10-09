# L’Arène — Les six épreuves

Jeu de survie solo en 3D, inspiré des épreuves de la première saison de Squid Game. Six épreuves se suivent automatiquement après chaque victoire. Une défaite permet de recommencer l’épreuve actuelle ou de reprendre toute la campagne.

1. **1, 2, 3 soleil** : s’arrêter au feu rouge, contourner les barrières et atteindre la ligne.
2. **Dalgona** : découper une étoile à la souris ou au doigt sans briser le biscuit.
3. **Tir à la corde** : tirer au rythme du curseur, dans la zone verte.
4. **Billes** : ajuster la direction et la puissance pour réussir trois lancers.
5. **Pont de verre** : observer les fissures et sauter sur les dalles solides.
6. **Dernière course** : franchir des haies et des fosses, éviter les barres mobiles, atteindre la sortie.

## Lancer le jeu

Node.js 20.19+ ou 22.12+ et un navigateur prenant en charge WebGL sont nécessaires pour développer.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite dans le navigateur **sur la même machine**. Le serveur cloud n’est pas un lien public accessible depuis votre ordinateur.

```sh
npm test
npm run build
npm run preview
npm run export
```

`dist/` contient le site statique à déployer. Les chemins d’assets sont relatifs, adaptés à un hébergement dans un sous-dossier. `npm run export` produit aussi `dist/jeu-squid.html`, qui regroupe JavaScript et styles dans un seul fichier et peut être ouvert dans un navigateur sans installer Node.js.

## Publication et mises à jour

Le workflow [Publier le jeu sur GitHub Pages](.github/workflows/deploy.yml) teste et publie le jeu à chaque envoi de modifications sur la branche `main`. L’adresse prévue est **https://99fzm9nznz.github.io/game/** ; elle devient disponible après un déploiement réussi.

Pour la première publication, GitHub Pages doit être activé dans les paramètres du dépôt : **Settings → Pages → Build and deployment → Source → GitHub Actions**. Cette activation peut nécessiter un administrateur du dépôt. L’onglet **Actions** permet de suivre la publication et de relancer le workflow manuellement avec **Run workflow**.

Les futures modifications du jeu demandées et autorisées sont à valider avec `npm test` et `npm run export`, puis à envoyer sur `main`. Le workflow reconstruit et publie alors automatiquement le site au même lien. La mise à jour prend généralement quelques minutes après l’envoi ; si le jeu est déjà ouvert, actualiser la page une fois le déploiement terminé. Une modification qui échoue aux tests ou à la compilation n’est pas publiée.

## Commandes

- ZQSD, WASD ou flèches : bouger ; Espace : sauter dans les épreuves de déplacement.
- Souris ou doigt : tracer le Dalgona depuis le point lumineux. Relâcher pour reprendre sans pénalité.
- Espace ou **TIRER** : tirer à la corde lorsque le curseur traverse la zone verte.
- Flèches gauche/droite ou curseur : viser aux billes. Maintenir Espace ou **LANCER**, puis relâcher pour tirer. La bande dorée est un repère de puissance.
- P, Échap ou **PAUSE** : suspendre le jeu. Un changement d’onglet le met aussi en pause.
- Les flèches tactiles, le saut et les boutons d’action sont disponibles sur mobile.

## Musique et rendu

La musique d’ambiance est une composition procédurale originale. Aucune musique officielle de Squid Game n’est incluse. **+ AUDIO** permet de choisir sur son appareil un fichier audio qu’on a le droit d’utiliser ; ce fichier reste local et n’est pas téléversé. Le navigateur active le son après une interaction.

Personnages procéduraux animés, survêtements numérotés, gardes, décors distincts, textures de sol, ombres et halos lumineux. Les figurants constituent une ambiance visuelle : ce jeu n’est pas multijoueur. Le rendu est stylisé, sans modèles photoréalistes externes. Une accélération graphique est recommandée.

## Validation

`npm test` exécute les tests des règles, des sauts, des collisions, des chutes, des épreuves et de la progression. Les parcours du pont et de la course finale sont testés avec des sauts simulés par la physique réelle du jeu.
