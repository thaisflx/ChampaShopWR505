<script setup lang="ts">
const props = defineProps<{
  images: string[]
  title: string
}>()

const selectedIndex = ref(0)

const selectedImage = computed(() => props.images[selectedIndex.value] ?? '')
</script>

<template>
  <div class="gallery">
    <img
      :src="selectedImage"
      :alt="`${title}, image ${selectedIndex + 1} sur ${images.length}`"
      class="gallery__main"
      width="600"
      height="600"
    />

    <ul v-if="images.length > 1" class="gallery__thumbs">
      <li v-for="(image, index) in images" :key="index">
        <button
          type="button"
          class="gallery__thumb"
          :aria-label="`Afficher l'image ${index + 1} sur ${images.length}`"
          :aria-pressed="index === selectedIndex"
          @click="selectedIndex = index"
        >
          <img :src="image" alt="" width="80" height="80" loading="lazy" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.gallery__main {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
}

.gallery__thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.gallery__thumb {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  background: #fff;
  cursor: pointer;
}

.gallery__thumb[aria-pressed='true'] {
  border-color: #1a4fd8;
}

.gallery__thumb:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

.gallery__thumb img {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: contain;
}
</style>
