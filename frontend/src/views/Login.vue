<template>
  <main class="auth-page">
    <div class="auth-card card">
      <router-link to="/" class="brand-link">◆ CareerGraph</router-link>
      <h1>Welcome back</h1>
      <p>Log in to continue your roadmap.</p>

      <form @submit.prevent="handleSubmit">
        <label class="label" for="email">Email</label>
        <input id="email" v-model="email" type="email" class="input-field" required autocomplete="email" />

        <label class="label" for="password" style="margin-top: 1rem;">Password</label>
        <input id="password" v-model="password" type="password" class="input-field" required autocomplete="current-password" />

        <p v-if="error" class="error-text">{{ error }}</p>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>

      <p class="switch">Don't have an account? <router-link to="/signup">Sign up</router-link></p>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    const user = await auth.login({ email: email.value, password: password.value });
    if (!user.onboardingComplete) router.push('/onboarding');
    else router.push(route.query.redirect || '/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.auth-card { width: 100%; max-width: 400px; }
.brand-link {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text);
  display: inline-block;
  margin-bottom: 1.5rem;
}
h1 { font-size: 1.5rem; }
.switch { margin-top: 1.5rem; font-size: 0.9rem; text-align: center; }
</style>
