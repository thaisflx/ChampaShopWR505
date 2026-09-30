<!-- Carte grise affichée à la place d'un produit pendant le chargement. -->
<template>
  <div class="skeleton" aria-hidden="true">
    <div class="skeleton__block skeleton__image" />
    <div class="skeleton__block skeleton__line" />
    <div class="skeleton__block skeleton__line skeleton__line--short" />
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
  background: #fff;
}

.skeleton__block {
  border-radius: 0.25rem;
  background: #e4e4e4;
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton__image {
  aspect-ratio: 1;
}

.skeleton__line {
  height: 1rem;
}

.skeleton__line--short {
  width: 40%;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

/* Pas d'animation pour les personnes qui l'ont désactivée dans leur système. */
@media (prefers-reduced-motion: reduce) {
  .skeleton__block {
    animation: none;
  }
}
</style>
