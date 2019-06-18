import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import apolloProvider, { waitOnCache } from './vue-apollo';
import i18n from './i18n';
import store from './store';

import './mutations/index';

Vue.config.productionTip = false;

const $broadcast = new Vue();
Vue.mixin({
  computed: {
    $broadcast: () => $broadcast,
  },
});

waitOnCache.then(() => {
  new Vue({
    router,
    apolloProvider,
    i18n,
    store,
    render: h => h(App),
  }).$mount('#app');
});

// TODO: mutate hook
// TODO: graphql mutation cache
// TODO: mutation emulate
