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
      component: () => import(/* webpackChunkName: "home", webpackPreload: true */ '@/views/Home.vue'),
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import(/* webpackChunkName: "scan", webpackPreload: true */ '@/views/Scan.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import(/* webpackChunkName: "setting", webpackPreload: true */ '@/views/Setting.vue'),
    },
  ],
});
