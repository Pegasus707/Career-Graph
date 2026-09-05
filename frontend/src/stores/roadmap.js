import { defineStore } from 'pinia';
import api from '../services/api';
import { useUserStore } from './user';

export const useRoadmapStore = defineStore('roadmap', {
  state: () => ({
    // Active career roadmap
    roadmap: {
      career: null,
      nodes: [],
      phases: [],
      overallProgress: 0,
      recommended: null
    },
    careers: [],
    loading: false,
    loadingCareers: false,
    updatingSkillId: null,
    error: null
  }),

  getters: {
    activeCareer: (state) => state.roadmap.career,
    phases: (state) => state.roadmap.phases || [],
    nodes: (state) => state.roadmap.nodes || [],
    overallProgress: (state) => state.roadmap.overallProgress || 0,
    recommendedSkill: (state) => state.roadmap.recommended,
    completedNodes: (state) => (state.roadmap.nodes || []).filter((n) => n.status === 'completed'),
    inProgressNodes: (state) => (state.roadmap.nodes || []).filter((n) => n.status === 'in_progress'),
    notStartedNodes: (state) => (state.roadmap.nodes || []).filter((n) => n.status === 'not_started'),
    isPhaseLocked: (state) => (phaseId) => {
      const p = (state.roadmap.phases || []).find((ph) => ph.id === phaseId);
      return p ? !!p.isLocked : false;
    }
  },

  actions: {
    async fetchCareers(filters = {}) {
      this.loadingCareers = true;
      this.error = null;
      try {
        const userStore = useUserStore();
        const params = {};

        if (filters.all) {
          if (filters.category) {
            params.category = filters.category;
          }
        } else {
          if (filters.stream !== undefined) {
            if (filters.stream && filters.stream.trim()) {
              params.stream = filters.stream.trim();
            }
          } else if (userStore.userStream) {
            params.stream = userStore.userStream;
          }

          if (filters.degree !== undefined) {
            if (filters.degree && filters.degree.trim()) {
              params.degree = filters.degree.trim();
            }
          } else if (userStore.userDegree) {
            params.degree = userStore.userDegree;
          }

          if (filters.category) {
            params.category = filters.category;
          }
        }

        const { data } = await api.get('/careers', { params });
        this.careers = data.careers || [];
        return this.careers;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch careers';
        throw err;
      } finally {
        this.loadingCareers = false;
      }
    },

    async fetchRoadmap(careerId = null) {
      this.loading = true;
      this.error = null;
      try {
        const url = careerId ? `/roadmap/${careerId}` : '/roadmap';
        const { data } = await api.get(url);
        this.roadmap = data;

        // Synchronize all completed skills into the global user completed skills set
        const userStore = useUserStore();
        (data.nodes || []).forEach((n) => {
          if (n.status === 'completed') {
            userStore.addCompletedSkill(n.skillId);
            userStore.addCompletedSkill(n.slug);
            if (n.explicitSkillId) userStore.addCompletedSkill(n.explicitSkillId);
          }
        });

        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load roadmap';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setSkillStatus(skillId, targetStatus) {
      this.updatingSkillId = skillId;
      this.error = null;
      try {
        const { data: updatedRoadmap } = await api.put(`/progress/skill/${skillId}/status`, { targetStatus });
        this.roadmap = updatedRoadmap;

        // Maintain global completed skills across tracks
        const userStore = useUserStore();
        const updatedNode = (updatedRoadmap.nodes || []).find(
          (n) => n.skillId === skillId || n.slug === skillId || n.explicitSkillId === skillId
        );
        if (updatedNode) {
          if (targetStatus === 'completed') {
            userStore.addCompletedSkill(updatedNode.skillId);
            userStore.addCompletedSkill(updatedNode.slug);
            if (updatedNode.explicitSkillId) userStore.addCompletedSkill(updatedNode.explicitSkillId);
          } else {
            userStore.removeCompletedSkill(updatedNode.skillId);
            userStore.removeCompletedSkill(updatedNode.slug);
            if (updatedNode.explicitSkillId) userStore.removeCompletedSkill(updatedNode.explicitSkillId);
          }
        }
        return updatedRoadmap;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update skill status';
        throw err;
      } finally {
        this.updatingSkillId = null;
      }
    },

    async fetchDashboardProgress() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get('/progress');
        this.roadmap = data;

        const userStore = useUserStore();
        (data.nodes || []).forEach((n) => {
          if (n.status === 'completed') {
            userStore.addCompletedSkill(n.skillId);
            userStore.addCompletedSkill(n.slug);
            if (n.explicitSkillId) userStore.addCompletedSkill(n.explicitSkillId);
          }
        });

        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard progress';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
