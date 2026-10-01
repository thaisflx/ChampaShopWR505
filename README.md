# ChampaShop

Vitrine en ligne de la boutique fictive **ChampaShop** : catalogue, fiche produit, panier avec moteur de promotions et authentification. Projet fil rouge du cours de développement front avancé (WR505), construit sur trois semaines par itérations.

- **Site déployé** : https://champa-shop-wr-505.vercel.app
- **API** : [DummyJSON](https://dummyjson.com) (produits, authentification, paniers)

## Stack

| Outil                             | Rôle                                  |
| --------------------------------- | ------------------------------------- |
| Nuxt 3 / Vue 3 (`<script setup>`) | Framework, rendu côté serveur (SSR)   |
| TypeScript (mode strict)          | Typage, vérifié par `nuxi typecheck`  |
| Pinia                             | Gestion d'état (panier, utilisateur)  |
| Vitest + `@vitest/coverage-v8`    | Tests unitaires et couverture         |
| ESLint (`@nuxt/eslint`)           | Qualité du code, `any` interdit       |
| Prettier                          | Formatage automatique                 |
| GitHub Actions                    | Intégration continue sur chaque PR    |
| Vercel                            | Déploiement automatique depuis `main` |

## Installation

Prérequis : **Node.js 22** et **npm 10**.

```bash
git clone https://github.com/thaisflx/ChampaShopWR505.git
cd ChampaShopWR505
npm ci
npm run dev
```

Le site est alors disponible sur http://localhost:3000.

> Utilisez `npm ci` et non `npm install` : `npm ci` installe exactement les versions du `package-lock.json` sans le modifier, comme la CI.

## Scripts

| Commande                | Rôle                                            |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Serveur de développement                        |
| `npm run build`         | Build de production                             |
| `npm run preview`       | Prévisualisation du build de production         |
| `npm run lint`          | Analyse ESLint                                  |
| `npm run format`        | Formate tout le projet avec Prettier            |
| `npm run format:check`  | Vérifie le formatage sans modifier les fichiers |
| `npm run typecheck`     | Vérification des types TypeScript               |
| `npm run test`          | Tests unitaires Vitest                          |
| `npm run test:coverage` | Tests avec rapport de couverture                |

Avant d'ouvrir une PR, lancez les mêmes vérifications que la CI :

```bash
npm run format:check && npm run lint && npm run typecheck && npm run test
```

## Conventions Git (GitFlow)

### Branches

| Branche               | Créée depuis | Mergée dans        | Règle                                                                        |
| --------------------- | ------------ | ------------------ | ---------------------------------------------------------------------------- |
| `main`                | —            | —                  | Production, protégée. Merge uniquement depuis `release/*` ou `hotfix/*`      |
| `develop`             | `main`       | —                  | Intégration, protégée, branche par défaut. Merge uniquement par PR approuvée |
| `feature/<n°>-<desc>` | `develop`    | `develop`          | Une issue = une branche = une PR. Ex. : `feature/14-filtres-url`             |
| `release/vX.Y.Z`      | `develop`    | `main` + `develop` | Gel des fonctionnalités : corrections, version, CHANGELOG. Tag annoté        |
| `hotfix/<desc>`       | `main`       | `main` + `develop` | Correction urgente de production, incrémente le patch                        |

Le numéro dans le nom d'une branche `feature/` est celui de l'**issue GitHub** correspondante.

### Commits

Format [Conventional Commits](https://www.conventionalcommits.org/fr/) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `refactor:` réécriture sans changement de comportement
- `test:` ajout ou modification de tests
- `docs:` documentation
- `chore:` configuration, outillage, maintenance

### Workflow

1. Chaque fonctionnalité a une **issue** assignée à une seule personne, avec des critères d'acceptation, un label et la milestone de la semaine.
2. Créer la branche depuis `develop` à jour :

```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<n°>-<desc>
```

3. Ouvrir la PR vers `develop` en remplissant le template (`Closes #<n°>`). La CI doit être verte.
4. Au moins **une review approuvée** d'un coéquipier, avec des commentaires argumentés.
5. Merge avec **« Create a merge commit »** (équivalent de `--no-ff`) pour garder la trace de la branche, puis suppression de la branche.
6. En fin de semaine : branche `release/vX.Y.Z`, merge dans `main` et `develop`, tag et GitHub Release.

### Labels

`feature`, `bug`, `bug-prod`, `a11y`, `test`, `docs`

## Intégration continue

Le workflow `.github/workflows/ci.yml` s'exécute sur chaque PR et chaque push vers `develop` et `main` :

1. Installation (`npm ci`) et préparation Nuxt
2. Vérification du formatage (Prettier)
3. Lint (ESLint)
4. Typecheck
5. Tests avec couverture
6. Build
   Une PR ne peut pas être mergée si une étape échoue.

## Équipe et répartition

| Membre    | Semaine 1                                                               |
| --------- | ----------------------------------------------------------------------- |
| Houroiti  | F1 Catalogue (pagination, états, recherche, filtres, tri, prix)         |
| Thaïs     | F3 Panier, F4 Moteur de promotions, mise en place du projet et de la CI |
| Sherazade | F2 Fiche produit, F5 Authentification DummyJSON                         |

## Choix techniques

### Filtre prix min/max

**Problème.** DummyJSON ne propose aucun filtre par prix : `/products`, `/products/search` et `/products/category/<slug>` ne connaissent que `limit`, `skip`, `select`, `sortBy` et `order`. L'API ne sait pas non plus combiner une recherche et une catégorie.

**Stratégie retenue : deux modes, choisis par `buildCatalogRequest` (`utils/catalog.ts`).**

- **Mode `server`** (cas courant : aucun filtre, recherche seule ou catégorie seule) : l'API filtre, trie et pagine elle-même. On demande uniquement la page affichée (`limit=12&skip=…`).
- **Mode `client`** (fourchette de prix, ou recherche + catégorie) : on fait **un seul appel** à l'endpoint le plus restrictif possible (`/products/search` s'il y a une recherche, sinon `/products/category/<slug>`, sinon `/products`) avec `limit=0` pour obtenir **tous** les candidats, déjà triés par l'API grâce à `sortBy` / `order`. La fonction pure `paginateLocally` garde ensuite ceux qui respectent la catégorie et le prix, recalcule le total et découpe la page de 12.

**Appels.** Un seul appel par changement de filtre, quel que soit le mode. Le filtrage est fait dans l'option `transform` de `useFetch`, qui s'exécute là où la requête a lieu : **sur le serveur** au premier rendu. Le serveur reçoit tous les candidats, mais **seuls les 12 produits de la page** sont envoyés au navigateur dans le HTML et le payload. Le rendu reste SSR, et l'URL (`?minPrice=…&maxPrice=…`) reproduit exactement la même vue.

**Performance.** Le catalogue compte 194 produits. Grâce à `select`, on ne télécharge que 7 champs par produit (dont l'URL de la miniature) : la réponse complète reste de l'ordre de quelques dizaines de ko. Partir de l'endpoint le plus restrictif (catégorie ou recherche) réduit encore ce volume.

**Pagination.** Le total et le nombre de pages sont calculés **après** le filtrage : chaque page contient bien 12 produits (sauf la dernière) et « Page X sur Y » est exact.

**Alternatives écartées.**

- _Filtrer seulement la page renvoyée par l'API_ : un appel léger, mais des pages incomplètes (voire vides alors qu'il existe des résultats plus loin) et un total faux.
- _Charger les pages une par une jusqu'à en avoir 12 qui correspondent_ : plusieurs appels successifs, donc plus lent, et le total reste inconnu, ce qui rend la pagination impossible à afficher.
- _Tout charger une fois dans le navigateur et tout filtrer côté client_ : perd le rendu côté serveur et envoie tout le catalogue au navigateur à chaque visite.

**Limite.** Cette stratégie suppose un catalogue de taille modeste. Avec des dizaines de milliers de produits, il faudrait un filtre prix côté serveur : une route serveur Nuxt (`server/api/`) qui mettrait en cache le catalogue, ou une API qui supporte le filtre.

## Utilisation de l'IA

L'usage de l'IA est autorisé et documenté par chaque membre dans `docs/ai-usage/<prenom>.md`.
