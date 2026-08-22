<template>
  <main class="auth-page">
    <div class="auth-card card">
      <router-link to="/" class="brand-link">◆ CareerGraph</router-link>
      <h1>Build my career roadmap</h1>
      <p>Create an account to get started.</p>

      <form @submit.prevent="handleSubmit">
        <label class="label" for="name">Name</label>
        <input id="name" v-model="name" type="text" class="input-field" required autocomplete="name" />

        <label class="label" for="email" style="margin-top: 1rem;">Email</label>
        <input id="email" v-model="email" type="email" class="input-field" required autocomplete="email" />

        <label class="label" for="password" style="margin-top: 1rem;">Password</label>
        <input id="password" v-model="password" type="password" class="input-field" required minlength="6" autocomplete="new-password" />

        <label class="label" for="confirm" style="margin-top: 1rem;">Confirm password</label>
        <input id="confirm" v-model="confirm" type="password" class="input-field" required minlength="6" autocomplete="new-password" />

        <p v-if="error" class="error-text">{{ error }}</p>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="switch">Already have an account? <router-link to="/login">Log in</router-link></p>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const error = ref('');
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  error.value = '';
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value });
    router.push('/onboarding');
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
