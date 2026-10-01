# Suivi d'utilisation de l'IA — Thaïs

Ce document retrace l'utilisation de l'assistant IA dans le cadre du projet ChampaShopWR505.

| Date | Outil | Ce que j'ai demandé | Ce que j'ai gardé / modifié / rejeté, et pourquoi |

| --- | --- | --- | --- |

| Semaine 1 | Claude | Initialisation du projet (Nuxt, structure de base) et mise en place de la CI (workflow GitHub Actions) | Gardé la structure du workflow, mais plusieurs erreurs ont nécessité des corrections (version de Node, synchronisation du lockfile, `tsconfig.app.json`). |

| Semaine 1 | Claude | Débogage de la CI (build et tests en échec) | Résolu les échecs liés aux dépendances, à Node, à la configuration TypeScript et à la synchronisation du `package-lock.json`. |

| Semaine 1 | opencode (Mimo) | Premier développement du moteur de promotions (squelette + tests) | Gardé comme base de départ, entièrement repris et finalisé ensuite avec Claude. |

| 30/09 | Claude | Finalisation du moteur de promotions (F4, issue #15) : 4 règles métier (remise beauté, code TROYES10, plafond 25%, livraison), arrondi commercial en centimes | Gardé l'architecture en logique pure testable (`utils/promotions.ts`). 8 scénarios imposés + plafond + 3 cas limites = 12 tests Vitest, couverture 100% lignes / 95% branches. |

| 30/09 | Claude | Vérification des règles de protection des branches main/develop | Confirmé via les captures d'écran GitHub que PR obligatoire, 1 approbation, CI verte et blocage du force-push étaient bien actifs. |

| 01/10 | Claude | Tests unitaires du panier | 10 tests dans `cart.spec.ts` sur l'ajout/suppression/quantité/comptage, sans dépendance à Nuxt. |

| 01/10 | Claude | Relecture des PR de l'équipe (#22, #24, #28, #30, #31) | Vérifié chaque diff et la CI avant de commenter, jamais de commentaire inventé. Deux problèmes concrets repérés : un `Closes # 13` cassé par une espace (PR #30) et une CI rouge dès `Format check` (PR #31). |

| 01/10 | Claude | Page `/panier` + branchement du bouton "Ajouter au panier" sur la fiche produit | Converti `Product` (prix décimal DummyJSON) en `CartItem` (centimes) via `eurosToCents`/`productToCartItem`, testés. Ajouté un retour visuel temporaire ("Ajouté ✓") sur le bouton, absent au départ et repéré en testant moi-même. |

## Bilan

- L'IA a servi à proposer, expliquer et diagnostiquer ; chaque changement a été relu et validé par moi avant d'être commité.
- Les résultats annoncés (CI verte, déploiement en production) ont toujours été vérifiés concrètement.
- L'IA a surtout accéléré le débogage et la prise en main des outils (CI, tests, formatage, déploiement), ainsi que l'implémentation des fonctionnalités (promotions, panier) et la relecture des PR de l'équipe.