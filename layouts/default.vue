<script setup lang="ts">
const cartStore = useCartStore()
</script>

<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink to="/" class="layout__brand">ChampaShop</NuxtLink>
      <nav aria-label="Navigation principale">
        <ul class="layout__nav">
          <li><NuxtLink to="/">Accueil</NuxtLink></li>
          <li><NuxtLink to="/produits">Catalogue</NuxtLink></li>
          <li>
            <NuxtLink to="/panier">
              Panier<span v-if="cartStore.itemCount > 0">
                ({{ cartStore.itemCount }})</span
              >
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="layout__main">
      <slot />
    </main>

    <CompareBar />
  </div>
</template>

<style scoped>
/* Colonne pleine hauteur : la barre de comparaison (sticky) reste
   collée en bas de l'écran, même sur une page courte. */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid #d0d0d0;
}

.layout__brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: inherit;
  text-decoration: none;
}

.layout__nav {
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.layout__nav a.router-link-active {
  font-weight: 700;
}

.layout__main {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
</style>
