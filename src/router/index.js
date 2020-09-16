import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/desk',
    name: 'Desk',
    component: () => import('@/views/Desk.vue')
  },
  {
    path: '/websocket',
    name: 'Websocket',
    component: () => import('@/views/Websocket.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
