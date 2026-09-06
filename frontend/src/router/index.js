import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/signup', name: 'signup', component: () => import('../views/Signup.vue') },
  { path: '/onboarding', name: 'onboarding', component: () => import('../views/Onboarding.vue'), meta: { auth: true } },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { auth: true } },
  { path: '/roadmap', name: 'roadmap', component: () => import('../views/Roadmap.vue'), meta: { auth: true } },
  { path: '/skills/:slug', name: 'skill-detail', component: () => import('../views/SkillDetail.vue'), meta: { auth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue'), meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // 1. Protected routes require login
  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // 2. Already logged in users shouldn't see login or signup forms
  if ((to.name === 'login' || to.name === 'signup') && auth.isAuthenticated) {
    return auth.needsOnboarding ? { name: 'onboarding' } : { name: 'dashboard' };
  }

  // 3. Authenticated users who have not completed onboarding should complete it first
  if (auth.isAuthenticated && auth.needsOnboarding && to.meta.auth && to.name !== 'onboarding') {
    return { name: 'onboarding' };
  }
});

export default router;
