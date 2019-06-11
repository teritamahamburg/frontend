import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import { createProvider } from './vue-apollo';
import i18n from './i18n';

Vue.config.productionTip = false;

const $state = new Vue({
  data() {
    return {
      dark: false,
      searchText: '',
      loading: 0,
      itemsView: {
        showControl: false,
        viewType: 'grid',
        sortType: 'id',
        sortOrder: 'asc',
      },
    };
  },
});

Vue.mixin({
  computed: {
    $state: () => $state,
  },
});

new Vue({
  router,
  apolloProvider: createProvider(),
  i18n,
  render: h => h(App),
}).$mount('#app');
