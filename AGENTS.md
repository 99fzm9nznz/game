# Travail sur le jeu et publication

L’utilisateur a demandé que les modifications qu’il demande soient publiées automatiquement sur le même site. Cette autorisation inclut les commits et les push de ces modifications sur `main` dans `99fzm9nznz/game`, puis le déploiement GitHub Pages prévu par le workflow.

- Utiliser le checkout existant ; les tâches cloud sont déjà isolées. Ne pas créer de worktree sauf demande explicite.
- Après une modification demandée, exécuter `npm test` et `npm run export`. Vérifier les interactions affectées dans un navigateur si elles changent.
- Préserver les modifications de l’utilisateur et les fichiers locaux. Ne committer que les fichiers pertinents, sans identifiants, caches ni dépendances générées.
- Commiter les modifications vérifiées, puis les envoyer sur `main` sans force push. Si le dépôt distant a avancé, intégrer ses changements en préservant le travail existant avant de publier.
- Le workflow `.github/workflows/deploy.yml` déploie les push sur `main`. Vérifier son résultat et le site lorsque les accès sont disponibles ; signaler un blocage concret sans prétendre que le déploiement a réussi.
- La publication peut prendre quelques minutes. Conserver le même lien public et ne pas promettre une mise à jour instantanée avant la réussite du déploiement.
- Réutiliser les accès GitHub fournis par la plateforme. Ne jamais demander de jeton secret dans le chat.
