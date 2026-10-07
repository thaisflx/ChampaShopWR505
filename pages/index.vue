<script setup lang="ts">
useSeoMeta({
  title: 'ChampaShop',
  description:
    'ChampaShop, votre boutique en ligne : beauté, maison, épicerie et plus encore.',
})
</script>

<template>
  <section>
    <h1>Bienvenue sur ChampaShop</h1>
    <p>
      <NuxtLink to="/produits">Découvrir le catalogue</NuxtLink>
    </p>

    <RecentlyViewed />
  </section>
</template>
