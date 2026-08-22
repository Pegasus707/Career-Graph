<template>
  <main class="container profile-page">
    <h1>Profile</h1>

    <section class="card">
      <h2>{{ auth.user?.name }}</h2>
      <p>{{ auth.user?.email }}</p>
    </section>

    <section class="card" v-if="!loading">
      <h2>Education</h2>
      <p>
        {{ profileData.profile.education?.degree || 'Not set' }}
        <span v-if="profileData.profile.education?.field"> in {{ profileData.profile.education.field }}</span>
        <span v-if="profileData.profile.education?.gradYear"> · Class of {{ profileData.profile.education.gradYear }}</span>
      </p>

      <h2 style="margin-top: 1.5rem;">Current status</h2>
      <p>
        {{ statusLabel(profileData.profile.status) }}
        <span v-if="profileData.profile.jobTitle"> — {{ profileData.profile.jobTitle }}</span>
      </p>
    </section>

    <section class="card" v-if="!loading && profileData.targetCareer">
      <h2>Target career</h2>
      <p>{{ profileData.targetCareer.name }} — {{ roadmap.overallProgress }}% complete</p>

      <h3 style="margin-top: 1rem; font-size: 0.95rem;">Declared skills</h3>
      <ul class="skill-list" v-if="profileData.skills.length">
        <li v-for="s in profileData.skills" :key="s.skill._id">
          {{ s.skill.name }}: <strong>{{ levelLabel(s.level) }}</strong>
        </li>
      </ul>
      <p v-else>No skills declared yet.</p>
    </section>

    <router-link to="/onboarding" class="btn btn-secondary">Update onboarding info</router-link>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const auth = useAuthStore();
const loading = ref(true);
const profileData = ref({ profile: {}, skills: [], targetCareer: null });
const roadmap = ref({ overallProgress: 0 });

onMounted(async () => {
  try {
    const { data } = await api.get('/users/profile');
    profileData.value = data;
    if (data.targetCareer) {
      const { data: r } = await api.get('/progress');
      roadmap.value = r;
    }
  } finally {
    loading.value = false;
  }
});

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
