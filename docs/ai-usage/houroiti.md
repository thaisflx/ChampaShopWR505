# Utilisation de l'IA — Houroiti

| Date  | Outil  | Ce que j'ai demandé | Ce que j'ai gardé / modifié / rejeté, et pourquoi |
|-------|--------|---------------------|---------------------------------------------------|
| 30/09 | Claude | Audit de l'étape 0 du projet (config, CI, historique Git) par rapport au sujet | Gardé l'analyse après vérification dans le dépôt. Priorisé les corrections qui coûtent plus cher plus tard (`no-explicit-any`, Prettier en CI, branche `feature/1-catalogue` créée depuis `main`). Refusé de mettre le label `bug` sur cette issue : ce n'est pas un dysfonctionnement du code. |
| 30/09 | Claude | Pourquoi `git pull` échouait (`package-lock.json` modifié) | Compris que `npm install` réécrit le lockfile. Je restaure le fichier et j'utilise désormais `npm ci`, comme la CI. |