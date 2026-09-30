<script setup lang="ts">
useSeoMeta({ title: 'Connexion | ChampaShop', robots: 'noindex' })

const route = useRoute()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const pending = ref(false)

// On n'accepte que les chemins internes : "?redirect=https://site-pirate.com" est ignoré
function safeRedirect(value: unknown): string {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  ) {
    return value
  }
  return '/compte'
}

async function onSubmit(): Promise<void> {
  errorMessage.value = null
  pending.value = true
  try {
    await login(username.value.trim(), password.value)
    await navigateTo(safeRedirect(route.query.redirect))
  } catch {
    errorMessage.value =
      'Identifiant ou mot de passe incorrect. Vérifie tes informations et réessaie.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="login">
    <h1>Connexion</h1>

    <form novalidate @submit.prevent="onSubmit">
      <div class="login__field">
        <label for="username">Identifiant</label>
        <input
          id="username"
          v-model="username"
          type="text"
          autocomplete="username"
          required
        />
      </div>

      <div class="login__field">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <p v-if="errorMessage" class="login__error" role="alert">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="pending">
        {{ pending ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <p class="login__hint">Compte de démo : emilys / emilyspass</p>
  </main>
</template>

<style scoped>
.login {
  max-width: 24rem;
  margin: 3rem auto;
  padding: 0 1rem;
}
.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.login__field input {
  padding: 0.6rem 0.75rem;
  font: inherit;
  border: 1px solid #767676;
  border-radius: 6px;
}
.login__error {
  color: #b00020;
  margin-bottom: 1rem;
}
.login__hint {
  margin-top: 1.5rem;
  font-size: 0.9rem;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
</style>
