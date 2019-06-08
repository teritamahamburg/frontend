import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import { createProvider } from './vue-apollo';
import i18n from './i18n';

Vue.config.productionTip = false;

const $state = Vue.observable({
  dark: false,
  searchText: '',
});
const $broadcast = new Vue();

Vue.mixin({
  computed: {
    $state: () => $state,
    $broadcast: () => $broadcast,
  },
});

new Vue({
  router,
  apolloProvider: createProvider(),
  i18n,
  render: h => h(App),
}).$mount('#app');
