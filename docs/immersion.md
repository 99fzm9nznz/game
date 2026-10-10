# Refonte de la première épreuve

## Ce qui est réellement intégré

La cour de « 1, 2, 3 soleil » possède un nouvel habillage mural, un arbre sec
ramifié, une poupée mécanique dédiée (tête indépendante, pupilles mobiles,
bouche animée, couettes, robe, chaussettes, souliers et articulations), quatre
gardes masqués avec armes et flash de bouche, une ligne d’arrivée, des caméras,
des lampadaires et une végétation/graviers instanciés. La géométrie statique
compatible est fusionnée pour limiter les appels de rendu.

La comptine française est un fichier vocal OGG, chanté/scandé sur quatre notes
originales à partir de Piper/SIWIS. L’hôte décide de la durée aléatoire des
comptines suivantes (2,5–4,6 s) et des pauses rouges (1,9–3,2 s). La vitesse
du fichier, la tête et les sous-titres suivent ce même cycle. La première
comptine dure 3,6 s. La tête commence à tourner pendant le dernier mot ; les
joueurs disposent d’une grâce de 280 ms après le rouge. Le déplacement réel
et les sauts déclenchent la détection ; pousser une barrière sans bouger ne
provoque plus une élimination.

Une élimination conserve sa position, sa date et sa graine dans l’état de jeu.
Elle provoque tir, impact, particules rouges, chute articulée déterministe,
petite marque au sol, bruit de corps, exclamation et annonce. Les bras des
survivants réagissent à la panique. Le corps reste dans la cour jusqu’au
changement d’épreuve ou à la revanche. La chute est une animation paramétrique
avec gravité pour les particules et amortissement de l’impact, **pas un moteur
ragdoll avec collisions entre corps**. Elle n’empêche pas les survivants de
passer et coûte beaucoup moins qu’une simulation rigide complète sur mobile.

Une caméra d’impact précède le mode spectateur. Les joueurs éliminés peuvent
choisir le survivant qu’ils regardent. Le bouton POUPÉE / JOUEUR (C au clavier)
permet d’observer la poupée de près. Il ne met pas la simulation en pause.

## Audio livré

28 fichiers OGG, environ 0,4 Mo au total : voix françaises, comptine,
exclamations, musique originale en boucle, victoire/défaite, tirs, impacts,
chute, respiration, pas sur trois surfaces, verre, corde, billes, biscuit et
lancer. Le mixeur Web Audio possède des bus voix, musique, bruitages et volume
général, avec réglages persistants. Les événements positionnés passent par un
PannerNode ; l’écoute suit la caméra. La pause commune suspend aussi le son.
Les événements sont numérotés par l’hôte et dédupliqués ; les fichiers se
chargent une fois depuis GitHub Pages, sans service TTS à l’exécution.

Les sons des cinq autres épreuves sont désormais des fichiers, avec annonces
françaises. La correction ultérieure du pont est décrite dans [bridge.md](bridge.md) ;
les quatre autres épreuves conservent leurs règles et décors.
Les musiques/bruitages sont des créations synthétisées puis rendues en fichiers,
pas des enregistrements de la série. Les exclamations sont des voix neuronales,
pas des cris joués par un comédien. Voir `public/audio/CREDITS.md` et la fiche
SIWIS. Le HTML autonome embarque ces fichiers en data URI pour le solo.

## Graphismes et performances

Les avatars conservent leur identité multijoueur et utilisent désormais une
hiérarchie articulée : cuisses, genoux, bras et coudes. Le rendu reste stylisé.
Trois niveaux sont proposés : élevé (ombres et bloom), équilibré (ombres,
résolution réduite), léger (rendu direct, sans ombres dynamiques ni bloom).
Le mode automatique commence léger sur petit écran et réduit la qualité si la
fréquence observée tombe sous 30 images/s. Cette adaptation ne garantit pas
une fréquence particulière sur tous les téléphones.

GLB/GLTF et `SkinnedMesh`/`AnimationMixer` sont compatibles avec Three.js et
GitHub Pages. Ils n’ont pas été intégrés dans ce lot : il faut choisir un jeu
d’assets sous licence vérifiée avec un même squelette pour locomotion et chutes,
puis tester leur coût. Cible à vérifier : 8–12k triangles par avatar principal,
LOD de 2k pour les silhouettes éloignées, textures partagées de 1k maximum,
chargement anticipé avant le salon. Pour beaucoup de joueurs, animations
squelettiques GPU et instanciation seraient préférables à des dizaines de rigs
complets. Éviter de simuler tous les ragdolls pendant toute la partie : simuler
l’impact, puis figer les corps. Aucun modèle extérieur non licencié n’est inclus.

## Réseau : quatre joueurs réellement pris en charge

Le protocole v3 garde PeerJS et l’autorité de l’hôte : simulation à 60 Hz,
commandes normalisées, états environ toutes les 80 ms, mouvements des invités
au plus toutes les 50 ms avec battement lorsqu’ils sont inchangés. Les effets
sont transmis depuis le dernier envoi de chaque connexion ; l’hôte garde un
journal borné de 32 événements. La mort persiste aussi dans l’état, donc le
corps peut être reconstitué même si le journal a avancé. Une connexion encombrée
ne reçoit pas une nouvelle série d’états périmés ; l’état récent est envoyé
quand son tampon se libère. Les actions discrètes restent fiables.

La limite jouable reste **4**. `node scripts/network-budget.mjs` mesure la
taille JSON d’états issus de la simulation réelle à quatre joueurs puis projette
une population synthétique de 20/50/100. Cela estime l’ordre de grandeur de
l’envoi montant en étoile ; ce n’est ni un test de charge WebRTC ni une preuve
que ces populations sont jouables. Les résultats illustrent le coût quadratique
de l’envoi de tout le monde à tout le monde par un hôte navigateur.

Pour 20 joueurs, il faudrait séparer état statique de salon et état dynamique,
quantifier/encoder les positions, transmettre les différences, ajouter un
acquittement d’entrées et une interpolation de 100–150 ms, puis faire un test
multi-appareils avec pertes et latence. L’hôte exécute encore la simulation :
sa fermeture termine le salon, son manque de puissance ralentit la partie.

Pour 50/100 joueurs, un **serveur dédié faisant autorité** est recommandé :
simulation fixe à 30–60 Hz, diffusion à 15–20 Hz, positions binaires, zones
d’intérêt, quotas de commandes, métriques de temps de tick et vérification
des mouvements. Le navigateur garde le rendu ; GitHub Pages continue à servir
le client au même lien. Le serveur WebSocket sécurisé / WebRTC doit être
hébergé ailleurs, avec salons, reconnexion et identités de session. Aucun serveur
payant ou abonnement n’a été créé. Les futurs bots devraient être contrôlés
par cette autorité et affichés explicitement comme IA. Les figurants actuels
sont décoratifs, visibles seulement en solo, et ne remplissent pas les salons.

## Vérifications

Tests des règles conservés et tests supplémentaires pour la grâce, les cycles,
les déplacements bloqués, l’unicité des effets, les éliminations simultanées,
la persistance des corps, les chutes déterministes et la présence des fichiers
OGG. `npm test`, `npm run build` et `npm run export` restent les commandes de
validation. GitHub Pages publie uniquement les push sur `main` ; la branche
de travail permet de terminer ces contrôles avant la publication.

Vérification de cette livraison : **34 tests unitaires réussis**, compilation et
export réussis ; une campagne dans quatre processus Chromium séparés a
vérifié les déplacements, la pause du chronomètre et des fichiers audio,
l’élimination commune, le tir unique, le corps persistant, la sélection du
spectateur, le changement d’épreuve et la revanche. Une régression à deux
navigateurs a aussi vérifié Dalgona, lancer de billes, saut, verre partagé et
déconnexion de l’hôte. Un écran tactile 390 × 844 a vérifié les réglages, la
poupée et l’impact sans débordement horizontal. Le HTML autonome a décodé
les 28 fichiers audio après coupure du réseau. Ces essais utilisent un
rendez-vous et un relais TURN/TCP locaux, en respectant la politique WebRTC
du navigateur. Le rendu logiciel du cloud ne constitue pas une mesure des
performances GPU d’un PC ou d’un téléphone.

Projection obtenue avec le script, pour un événement récent par paquet :

| Population synthétique | Octets par état JSON | Débit montant total de l’hôte estimé |
| --- | ---: | ---: |
| 4 | 2 668 | 0,80 Mbit/s |
| 20 | 11 334 | 21,53 Mbit/s |
| 50 | 27 594 | 135,21 Mbit/s |
| 100 | 54 694 | 541,47 Mbit/s |

Hors surcoût SCTP/DTLS/IP, retransmissions et messages de salon. Ce tableau
est une projection de la structure JSON actuelle, pas un test de charge de
ces populations. Le cas de mesure ne contient pas les impacts cumulés du pont.
