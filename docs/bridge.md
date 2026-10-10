# Pont de verre : correction du suspense

Les seize panneaux intacts utilisent la même géométrie et la même instance de
matériau : couleur, opacité, rugosité, métal, ombres et faces identiques. Le rendu
ne reçoit aucune information sur la résistance. Aucun objet de fissure n’existe
sur un panneau intact. L’éclairage du décor dépend de la position, jamais du
tirage. Les instructions révélant la couleur et les fissures ont été supprimées.

## Autorité et règles

À chaque chargement du pont, huit tirages indépendants déterminent le côté solide
de chaque paire. L’aléa par défaut utilise `crypto.getRandomValues`. En solo, la
simulation locale fait autorité ; en salon, l’hôte effectue un seul tirage et le
donne à toutes les simulations des joueurs. Le tableau est conservé dans un champ
privé de `Game`. Ni le tableau, ni une graine permettant de le retrouver ne sont
envoyés dans les états PeerJS. Les tests peuvent injecter un tirage déterministe.

Les supports, trajectoires et collisions sont identiques jusqu’au contact des
pieds : traverser l’espace au-dessus d’un panneau ne le révèle pas. Un contact
au sol ou une réception sur le fragile le casse. Le solide porte normalement
le joueur. La rupture est unique même si deux joueurs arrivent simultanément.
Un joueur entraîné dans la chute ne peut pas reprendre appui sous la surface
ni déclencher un autre saut pour annuler l’élimination.

Les trous et les données publiques des impacts persistent dans les états,
indépendamment du journal sonore limité à 32 événements. Une mise à jour retardée
reconstitue donc les trous et les effets encore récents. Les positions, dates et
graines des éclats concernent uniquement les panneaux **déjà touchés**. Les invités
n’exécutent pas de nouvelle simulation des panneaux. La décision reste dans le
navigateur hôte ; un serveur dédié serait nécessaire pour protéger les règles
contre un hôte qui modifie son propre programme.

## Effets et durée

Après contact : fracture lumineuse de 120 ms, disparition du panneau et projection
de 48 éclats triangulaires en qualité légère, 96 aux autres qualités. Les fragments
ont une épaisseur, des rotations, une dispersion et une chute sous gravité.
Ils sont instanciés et leurs ressources sont libérées après 2,6 secondes.
Le trou reste présent jusqu’à une nouvelle épreuve ou partie.

Le bruitage OGG de verre déjà livré est maintenant déclenché au contact réel,
spatialisé et dédupliqué par le journal de l’hôte. Les bras, coudes et genoux du
personnage bougent pendant la chute. L’avatar continue sa trajectoire après la
validation de l’élimination, au lieu de disparaître immédiatement. La caméra
d’impact du joueur précède l’observation des survivants. C’est une animation
articulée et balistique, sans simulation de ragdoll rigide.

Le chronomètre commun reste de **75 secondes**, avec alerte visuelle pendant les
15 dernières secondes. La pause commune le suspend. Les survivants qualifiés
attendent les autres ; ceux encore en jeu à zéro sont éliminés. Une nouvelle
partie restaure les panneaux et effectue un nouveau tirage. Une configuration
identique à une précédente reste possible par hasard.

Le protocole passe à v3 pour séparer les salons des anciens clients qui utilisaient
le chemin fixe. GitHub Pages et les six épreuves sont conservés. Les joueurs
doivent actualiser la page et créer un nouveau salon après publication.

## Vérifications

- `npm test` : 43 tests, dont neuf nouvelles vérifications du pont. Elles couvrent
  le tirage, les réceptions réelles, l’absence de différence avant contact, les
  matériaux identiques, les 256 parcours avec sauts, la rupture simultanée, les données réseau, les trous après
  expiration du journal, les éclats, les chutes, la pause, le délai et la revanche.
- `npm run export` : build Vite et HTML autonome ; workflow Pages conservé.
- Quatre processus Chromium séparés, dont un viewport tactile 390 × 700,
  connectés par **PeerJS/WebRTC réel** avec rendez-vous et TURN/TCP locaux :
  saut mobile sur un solide, rupture et son unique communs, trous persistants,
  spectateur avec sélection du survivant, nouvelle manche, expiration commune,
  revanche et déconnexion. Aucun fichier audio manquant ni erreur navigateur.
- Contrôle du rendu desktop/mobile des panneaux, de la fracture, des éclats et
  de la posture de chute avec un instant de simulation figé pour les captures.

- HTML autonome : les 28 fichiers audio se décodent après coupure du réseau.

Ces essais ne constituent pas une mesure de performances GPU sur un téléphone
physique ni une garantie de connexion sur tous les réseaux Internet.
