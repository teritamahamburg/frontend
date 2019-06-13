import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Scan from '@/views/Scan.vue';
import Search from '@/views/Search.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
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
      component: Home,
      meta: {
        priority: 1,
        itemsControl: true,
      },
    },
    {
      path: '/scan',
      name: 'scan',
      component: Scan,
      meta: {
        priority: 2,
      },
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      meta: {
        priority: 2,
        overlay: false,
      },
    },
  ],
});
