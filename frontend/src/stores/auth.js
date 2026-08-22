import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('cg_token') || null,
    user: JSON.parse(localStorage.getItem('cg_user') || 'null')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    needsOnboarding: (state) => state.user && !state.user.onboardingComplete
  },
  actions: {
    setSession(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('cg_token', token);
      localStorage.setItem('cg_user', JSON.stringify(user));
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      this.setSession(data.token, data.user);
      return data.user;
    },
    async login(payload) {
      const { data } = await api.post('/auth/login', payload);
      this.setSession(data.token, data.user);
      return data.user;
    },
    async refreshUser() {
      const { data } = await api.get('/auth/me');
      this.user = data.user;
      localStorage.setItem('cg_user', JSON.stringify(data.user));
      return data.user;
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('cg_token');
      localStorage.removeItem('cg_user');
    }
  }
});
