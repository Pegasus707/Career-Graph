<template>
  <main class="container profile-page">
    <h1>Profile</h1>

    <div v-if="userStore.loading" class="loading">
      <span class="loading-spinner"></span>
      <p>Loading profile…</p>
    </div>

    <div v-else-if="userStore.error" class="card error-card">
      <p>{{ userStore.error }}</p>
      <button class="btn btn-secondary" @click="loadProfile">Retry</button>
    </div>

    <template v-else>
      <section class="card">
        <h2>{{ auth.user?.name }}</h2>
        <p>{{ auth.user?.email }}</p>
      </section>

      <section class="card">
        <h2>Education</h2>
        <p>
          {{ userStore.profile.education?.degree || 'Not set' }}
          <span v-if="userStore.profile.education?.field"> in {{ userStore.profile.education.field }}</span>
          <span v-if="userStore.profile.education?.gradYear"> · Class of {{ userStore.profile.education.gradYear }}</span>
        </p>

        <h2 style="margin-top: 1.5rem;">Current status</h2>
        <p>
          {{ statusLabel(userStore.profile.status) }}
          <span v-if="userStore.profile.jobTitle"> — {{ userStore.profile.jobTitle }}</span>
        </p>
      </section>

      <section class="card" v-if="userStore.targetCareer">
        <h2>Target career</h2>
        <p>{{ userStore.targetCareer.name }} — {{ roadmapStore.overallProgress }}% complete</p>

        <h3 style="margin-top: 1rem; font-size: 0.95rem;">Declared skills</h3>
        <ul class="skill-list" v-if="userStore.declaredSkills.length">
          <li v-for="s in userStore.declaredSkills" :key="s.skill?._id || s.skill">
            {{ s.skill?.name || s.skill }}: <strong>{{ levelLabel(s.level) }}</strong>
          </li>
        </ul>
        <p v-else>No skills declared yet.</p>
      </section>

      <router-link to="/onboarding" class="btn btn-secondary">Update onboarding info</router-link>
    </template>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useRoadmapStore } from '../stores/roadmap';

const auth = useAuthStore();
const userStore = useUserStore();
const roadmapStore = useRoadmapStore();

async function loadProfile() {
  try {
    const data = await userStore.fetchProfile();
    if (data.targetCareer) {
      await roadmapStore.fetchDashboardProgress();
    }
  } catch (err) {
    // Handled in stores
  }
}

onMounted(loadProfile);

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}
function statusLabel(status) {
  return { student: 'Student', fresher: 'Fresher / recently graduated', employed: 'Currently employed' }[status] || 'Not set';
}
</script>

<style scoped>
.profile-page { padding: 2.5rem 1.5rem 4rem; max-width: 680px; display: flex; flex-direction: column; gap: 1.25rem; }
.profile-page h1 { font-size: 1.6rem; }
.skill-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
</style>
