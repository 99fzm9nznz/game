# L’Arène — Les six épreuves

Jeu de survie en 3D, en solo ou en salons de 2 à 4 joueurs, inspiré des épreuves de la première saison de Squid Game. En solo, six épreuves se suivent automatiquement après chaque victoire ; une défaite permet de recommencer l’épreuve actuelle ou toute la campagne. En multijoueur, les survivants attendent que chacun termine son épreuve avant de passer ensemble à la suivante.

1. **1, 2, 3 soleil** : s’arrêter au feu rouge, contourner les barrières et atteindre la ligne.
2. **Dalgona** : découper une étoile à la souris ou au doigt sans briser le biscuit.
3. **Tir à la corde** : tirer au rythme du curseur, dans la zone verte.
4. **Billes** : ajuster la direction et la puissance pour réussir trois lancers.
5. **Pont de verre** : choisir entre des vitres identiques, mémoriser les ruptures et traverser en 75 secondes.
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

## Jouer avec des amis

1. Cliquer sur **Jouer avec des amis**, entrer un pseudo et choisir **Créer un salon**.
2. Copier le lien d’invitation ou partager le code à 8 caractères.
3. Les amis ouvrent le lien, entrent leur pseudo et cliquent sur **Rejoindre**. Un code peut aussi être collé dans le champ de salon.
4. L’hôte clique sur **Lancer les épreuves**, avec au moins deux joueurs connectés (quatre maximum).

Les vrais joueurs apparaissent dans l’arène, avec leurs pseudos et des couleurs différentes. Les feux et le chronomètre sont communs ; les dalles cassées du pont le sont aussi. Le tir à la corde se joue en coopération. Dalgona, billes et parcours se jouent individuellement, avec attente des joueurs qualifiés. Une élimination passe en mode spectateur jusqu’à la fin de la campagne ; **Rejouer ensemble** fait revenir tous les joueurs.

L’hôte calcule la simulation et reçoit uniquement les commandes des invités : les positions, sauts, collisions et qualifications sont décidés par ses règles. Il doit garder l’onglet ouvert. Quitter son onglet pendant une épreuve met la partie en pause ; seul l’hôte peut la reprendre. Fermer ou actualiser la page de l’hôte termine le salon. Les invitations ne fonctionnent plus ensuite. Il n’est pas possible de rejoindre une campagne déjà commencée.

Le multijoueur utilise PeerJS, son serveur public de rendez-vous `0.peerjs.com`, le STUN Google et les relais TURN publics de PeerJS (UDP et TCP). Il nécessite Internet et dépend de la disponibilité de ces services. Aucun compte, microphone ni serveur applicatif personnel n’est nécessaire. Un réseau qui bloque WebRTC et les relais peut empêcher une connexion ; le jeu affiche alors un message. La version HTML autonome reste utilisable en solo hors connexion.

Pour tester la connexion avec un serveur PeerJS local en développement uniquement, `VITE_PEER_HOST` et `VITE_PEER_PORT` remplacent le rendez-vous public. `VITE_TEST_TURN_PORT` permet un relais TURN/TCP de test sur `127.0.0.1`, avec les identifiants publics standards PeerJS. Ces remplacements sont ignorés par le build de production. Les tests de cette session ont utilisé deux navigateurs Chromium distincts et un rendez-vous/relais TCP locaux, sans modifier la politique WebRTC du navigateur.

## Commandes

- ZQSD, WASD ou flèches : bouger ; Espace : sauter dans les épreuves de déplacement.
- Souris ou doigt : tracer le Dalgona depuis le point lumineux. Relâcher pour reprendre sans pénalité.
- Espace ou **TIRER** : tirer à la corde lorsque le curseur traverse la zone verte.
- Flèches gauche/droite ou curseur : viser aux billes. Maintenir Espace ou **LANCER**, puis relâcher pour tirer. La bande dorée est un repère de puissance.
- P, Échap ou **PAUSE** : suspendre le jeu. Un changement d’onglet le met aussi en pause.
- Les flèches tactiles, le saut et les boutons d’action sont disponibles sur mobile.

## Refonte immersive de la première épreuve

Poupée mécanique dédiée avec tête, pupilles et bouche animées ; comptine française intégrée dont la vitesse varie avec le cycle commun. La tête se retourne avant la détection. Un tir déclenche impact, particules rouges et chute articulée ; le corps reste dans la cour. Les éliminations sont décidées par l’hôte et rejouées une seule fois sur chaque appareil. Les spectateurs peuvent choisir le survivant qu’ils observent. **POUPÉE / JOUEUR** (C) change de caméra, sans arrêter la partie.

**RÉGLAGES** propose les volumes séparés (voix, bruitages, musique) et les qualités Automatique, Élevée, Équilibrée et Légère. Le mode automatique réduit les effets si nécessaire ; le mode léger convient aux petits écrans.

Le bilan détaillé, les choix physiques, l’étude GLB/GLTF et les limites réseau sont dans [docs/immersion.md](docs/immersion.md). La capacité validée reste 4 joueurs ; l’étude de 20/50/100 ne modifie pas cette limite.

## Musique et rendu

Le jeu livre **28 fichiers OGG** : comptine et annonces françaises, exclamations, respiration, tir/impact/chute, pas sur sable/pierre/métal, biscuit, corde, billes, verre, musique originale en boucle et jingles de victoire/défaite. Ils fonctionnent sans importer de fichier. Les voix sont générées avec Piper/SIWIS (attribution CC BY 4.0) ; la musique et les bruitages sont des créations originales CC0. Aucun enregistrement de la série n’est inclus. Voir [les crédits](public/audio/CREDITS.md).

Le mixeur Web Audio spatialise les événements, suit la caméra et suspend les sons pendant la pause. Le navigateur active le son après une interaction. L’import facultatif de musique reste disponible dans le code ; les sons intégrés sont utilisés par défaut. `scripts/generate-audio.py` permet de reproduire les assets avec un modèle vocal local, NumPy/SciPy, Piper et FFmpeg ; ces outils ne sont pas nécessaires pour jouer ou construire le site.

Les personnages utilisent une hiérarchie articulée avec genoux et coudes, survêtements numérotés et identités de salon. La cour bénéficie de décors et de gardes enrichis. Les chutes sont une solution déterministe adaptée à WebGL, avec particules sous gravité ; elles ne constituent pas une simulation rigide complète. Le rendu reste stylisé. Le pont reçoit la correction décrite ci-dessous. Les quatre autres épreuves conservent leurs règles et leurs décors, tout en utilisant les nouveaux personnages et fichiers sonores. Les figurants solo restent décoratifs et ne sont pas des bots de salon.

## Pont de verre : choix sans indice

Les 16 vitres intactes partagent la même géométrie et le même matériau. Aucun trait de fissure n’est créé avant un impact. L’hôte tire huit choix indépendants avec l’aléa cryptographique du navigateur à chaque passage au pont ; le chemin reste privé dans la simulation et n’est pas envoyé aux invités.

Au premier contact avec une vitre fragile, elle disparaît pour tous : fracture éclair, 48 à 96 éclats triangulaires sous gravité, bruitage de verre intégré et chute articulée suivie par la caméra du joueur concerné. Les trous persistent après la disparition des particules. Les solides résistent ; le délai commun de 75 secondes élimine les joueurs qui n’ont pas traversé. Les éliminés peuvent observer les survivants. Le protocole v3 sépare les salons de cette version des anciens clients ; actualiser le jeu et créer un nouveau salon après la mise à jour.

Voir [le détail des règles et vérifications](docs/bridge.md).

## Validation

`npm test` exécute les tests des règles, des sauts, des collisions, des chutes, des épreuves et de la progression, ainsi que des salons (limite de joueurs, simulation commune, pause, qualification, spectateurs, déconnexions et nouvelle partie). Les parcours du pont et de la course finale sont testés avec des sauts simulés par la physique réelle du jeu.

Les tests couvrent aussi les cycles de la poupée, sa grâce de détection, les éliminations simultanées, les événements sonores dédupliqués, les corps persistants et les fichiers audio embarqués. Les validations navigateur utilisent des processus Chromium séparés avec un rendez-vous PeerJS et un TURN/TCP locaux, plus un viewport mobile et la version autonome privée de réseau après chargement. Elles ne prouvent pas une connexion sur tous les réseaux Internet.

Pour estimer le budget de diffusion JSON (projection de population, sans lever la limite jouable) : `node scripts/network-budget.mjs`. Les états sont transmis à 12,5 Hz ; les effets envoyés depuis le dernier paquet et un battement d’entrée réduisent le trafic. Un serveur dédié externe est recommandé avant de viser 50/100 joueurs ; GitHub Pages continue à servir le client statique.
