import Vue from 'vue';
import Router from 'vue-router';
import Error from '@/views/Error.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      component: Error,
    },
    {
      path: '/index.html',
      redirect: '/',
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      meta: {
        priority: 1,
        itemsControl: true,
      },
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import(/* webpackChunkName: "scan" */ '@/views/Scan.vue'),
      meta: {
        priority: 2,
      },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue'),
      meta: {
        priority: 2,
        overlay: false,
      },
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import(/* webpackChunkName: "setting" */ '@/views/Setting.vue'),
      meta: {
        priority: 3,
        overlay: false,
      },
    },
  ],
});
