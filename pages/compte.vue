<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Mon compte | ChampaShop', robots: 'noindex' })

const auth = useAuthStore()
const { logout } = useAuth()
</script>

<template>
  <main class="account">
    <h1>Mon compte</h1>

    <section v-if="auth.user" class="account__card">
      <img :src="auth.user.image" alt="" width="96" height="96" />
      <div>
        <p class="account__name">
          {{ auth.user.firstName }} {{ auth.user.lastName }}
        </p>
        <p>{{ auth.user.email }}</p>
      </div>
    </section>

    <button type="button" @click="logout">Se déconnecter</button>
  </main>
</template>

<style scoped>
.account {
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
.account__card {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-block: 1.5rem;
}
.account__name {
  font-weight: 600;
}
button:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
</style>
