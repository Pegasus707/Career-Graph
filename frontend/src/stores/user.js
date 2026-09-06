import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {
      education: {},
      status: null,
      jobTitle: ''
    },
    targetCareer: null,
    declaredSkills: [],
    // Global set of completed skill identifiers (IDs, slugs) across all tracks
    globalCompletedSkills: [],
    streamPreference: localStorage.getItem('cg_stream_preference') || '',
    degreePreference: localStorage.getItem('cg_degree_preference') || '',
    loading: false,
    error: null
  }),

  getters: {
    isSkillCompleted: (state) => (skillIdOrSlug) => {
      if (!skillIdOrSlug) return false;
      const target = skillIdOrSlug.toString();
      return state.globalCompletedSkills.includes(target);
    },
    userStream: (state) => state.streamPreference || state.profile?.education?.field || '',
    userDegree: (state) => state.degreePreference || state.profile?.education?.degree || '',
    completedCount: (state) => state.globalCompletedSkills.length
  },

  actions: {
    setStreamPreference(stream) {
      this.streamPreference = stream || '';
      if (stream) {
        localStorage.setItem('cg_stream_preference', stream);
      } else {
        localStorage.removeItem('cg_stream_preference');
      }
    },

    setDegreePreference(degree) {
      this.degreePreference = degree || '';
      if (degree) {
        localStorage.setItem('cg_degree_preference', degree);
      } else {
        localStorage.removeItem('cg_degree_preference');
      }
    },

    addCompletedSkill(skillIdentifier) {
      if (!skillIdentifier) return;
      const str = skillIdentifier.toString();
      if (!this.globalCompletedSkills.includes(str)) {
        this.globalCompletedSkills.push(str);
      }
    },

    removeCompletedSkill(skillIdentifier) {
      if (!skillIdentifier) return;
      const str = skillIdentifier.toString();
      this.globalCompletedSkills = this.globalCompletedSkills.filter((s) => s !== str);
    },

    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get('/users/profile');
        this.profile = data.profile || {};
        this.targetCareer = data.targetCareer || null;
        this.declaredSkills = data.skills || [];

        // Derive stream/degree preferences from profile education if not set
        if (!this.streamPreference && data.profile?.education?.field) {
          this.setStreamPreference(data.profile.education.field);
        }
        if (!this.degreePreference && data.profile?.education?.degree) {
          this.setDegreePreference(data.profile.education.degree);
        }

        // Initialize global completed skills set from declared skills (level >= 3 or progress complete)
        (data.skills || []).forEach((s) => {
          if (s.level >= 3 && s.skill) {
            if (s.skill._id) this.addCompletedSkill(s.skill._id);
            if (s.skill.slug) this.addCompletedSkill(s.skill.slug);
            if (s.skill.skillId) this.addCompletedSkill(s.skill.skillId);
          }
        });

        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load user profile';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(payload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.put('/users/profile', payload);
        if (payload.education?.field) {
          this.setStreamPreference(payload.education.field);
        }
        if (payload.education?.degree) {
          this.setDegreePreference(payload.education.degree);
        }
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update profile';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateTargetCareer(careerId) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.put('/users/target-career', { careerId });
        this.targetCareer = data.career || null;
        if (data.career?.streams?.[0]) {
          this.setStreamPreference(data.career.streams[0]);
        }
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update target career';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
