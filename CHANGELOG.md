# Changelog

## v0.1.0 — Semaine 1

### Catalogue (F1)

- Liste paginée de 12 produits par page (image, titre, prix, note, badge de réduction).
- Recherche plein texte avec debounce de 300 ms, sans course entre réponses.
- Filtre par catégorie, tri par prix/note/titre, filtre prix min/max (stratégie client documentée dans le README).
- URL comme source de vérité (page, recherche, catégorie, tri, prix), SSR, fonctionne sans JavaScript.
- États chargement, aucun résultat, erreur réseau avec « Réessayer ».

### Fiche produit (F2)

- Galerie d'images, description, marque, note, stock, garantie, livraison.
- Gestion du stock (« Plus que X en stock », rupture de stock).
- SEO (useSeoMeta, Open Graph), 404 réelle pour un produit inexistant.

### Panier (F3)

- Ajout, suppression, modification de quantité, plafonnée au stock disponible.
- Persistance par cookie minimal (productId + quantité), sous la limite de 4 Ko.
- Page /panier avec récapitulatif, code promo, détail des remises, hydratation SSR sans flash.

### Moteur de promotions (F4)

- Fonction pure computeCart : remise beauté, code TROYES10, plafond 25 %, livraison.
- 8 scénarios d'acceptation couverts, 100 % lignes / 95 % branches sur utils/promotions.ts.

### Authentification (F5)

- Connexion DummyJSON, cookies accessToken/refreshToken, chargement SSR sans flash.
- Middleware de protection de route, rafraîchissement du token en single-flight.
- Déconnexion.

### Infrastructure

- Projet Nuxt 3 / Vue 3 / TypeScript strict, Pinia, Vitest, ESLint, Prettier.
- CI GitHub Actions (format, lint, typecheck, test, build) sur chaque PR.
- Déploiement Vercel automatique depuis main.
