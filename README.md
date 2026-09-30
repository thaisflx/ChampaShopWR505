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

| Membre    | Semaine 1                                                    |
| --------- | ------------------------------------------------------------ |
| Houroiti  | F1 Catalogue, F2 Fiche produit, F3 Panier                    |
| Thaïs     | F4 Moteur de promotions, mise en place du projet et de la CI |
| Sherazade | F5 Authentification DummyJSON                                |

## Choix techniques

### Filtre prix min/max

_À compléter avec la fonctionnalité F1 : DummyJSON ne propose pas de filtre par prix, la stratégie retenue (appels, performance, pagination) sera justifiée ici._

## Utilisation de l'IA

L'usage de l'IA est autorisé et documenté par chaque membre dans `docs/ai-usage/<prenom>.md`.
