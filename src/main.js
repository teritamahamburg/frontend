import 'roboto-fontface/css/roboto/roboto-fontface.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@mdi/font/css/materialdesignicons.css';
import 'izitoast/dist/css/iziToast.css';

import Vue from 'vue';
import VueIziToast from 'vue-izitoast';

import App from './App.vue';
import router from './router';
import apolloProvider from './vue-apollo';
import i18n from './i18n';
import store from './store';
import vuetify from './plugins/vuetify';
import './registerServiceWorker';

import './apollo/mutations/index';

Vue.config.productionTip = false;

const $broadcast = new Vue();
Vue.mixin({
  computed: {
    $broadcast: () => $broadcast,
  },
});

Vue.use(VueIziToast);

if (window.Cypress) {
  window.store = store;
  window.broadcast = $broadcast;
}

new Vue({
  router,
  apolloProvider,
  i18n,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
