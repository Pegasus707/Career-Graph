<template>
  <header class="navbar">
    <div class="navbar-inner container">
      <router-link :to="auth.isAuthenticated ? '/dashboard' : '/'" class="brand">
        <span class="brand-mark">◆</span> CareerGraph
      </router-link>
      <nav v-if="auth.isAuthenticated" class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/roadmap">Roadmap</router-link>
        <router-link to="/profile">Profile</router-link>
        <button class="btn btn-logout" @click="handleLogout">Log out</button>
      </nav>
      <nav v-else class="nav-links">
        <router-link to="/login">Log in</router-link>
        <router-link to="/signup" class="btn btn-primary btn-sm">Get started</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.navbar {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 20;
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.brand-mark { color: var(--accent); }
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a:not(.btn) {
  color: var(--text-dim);
  font-weight: 500;
  font-size: 0.9rem;
}
.nav-links a:not(.btn).router-link-active { color: var(--accent); }
.nav-links a.btn-primary { color: #ffffff; }
.btn-sm { padding: 0.5rem 1.1rem; font-size: 0.85rem; }
</style>
