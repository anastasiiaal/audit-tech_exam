<template>
  <div class="login-container">
    <div class="login-card card">
      <h1>TaskWatch</h1>
      <p class="subtitle">Connectez-vous pour gérer vos tâches</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" class="input" placeholder="votre@email.com" required />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="password" type="password" class="input" placeholder="••••••••" required />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="hint">
        Utilisateur de test : <strong>test@example.com</strong> / <strong>password123</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const email = ref('test@example.com')
const password = ref('password123')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    router.push('/tasks')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Une erreur est survenue lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 2rem;
}

.login-card h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.hint {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #7f8c8d;
}
</style>
