import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import { createProvider } from './vue-apollo';
import i18n from './i18n';

Vue.config.productionTip = false;

const $state = new Vue({
  name: 'State',
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
      dialogs: {
        add: {
          show: false,
        },
        remove: {
          show: false,
          ids: [],
        },
        edit: {
          show: false,
          item: {},
        },
        editHistory: {
          show: false,
          id: undefined,
        },
        qrCode: {
          show: false,
          text: undefined,
          verify: undefined,
        },
        part: {
          show: false,
          add: true,
          item: {},
        },
      },
    };
  },
  computed: {
    courses() {
      return [
        'デザイン学科',
        '電気工学科',
        '機械電子工学科',
        '情報工学科',
      ];
    },
    itemsViewMenuVOn() {
      return {
        addPart: this.showAddPartDialog,
        edit: this.showEditDialog,
        editHistory: this.showEditHistoryDialog,
        qrCode: this.showQRCodeDialog,
        remove: this.showRemoveDialog,
      };
    },
  },
  watch: {
    dark(val) {
      this.setBGColor(val);
    },
  },
  created() {
    this.setBGColor(this.dark);
  },
  methods: {
    setBGColor(val) {
      document.body.style.backgroundColor = val ? 'rgb(48, 48, 48)' : 'rgb(250, 250, 250)';
    },
    showEditDialog(item) {
      if (`${item.partId}` === '0') {
        this.dialogs.edit.item = item;
        this.dialogs.edit.show = true;
      } else {
        this.dialogs.part.item = item;
        this.dialogs.part.add = false;
        this.dialogs.part.show = true;
      }
    },
    showEditHistoryDialog({ id }) {
      this.dialogs.editHistory.id = id;
      this.dialogs.editHistory.show = true;
    },
    showQRCodeDialog({ id }) {
      this.dialogs.qrCode.text = `${id}`;
      this.dialogs.qrCode.show = true;
    },
    showAddPartDialog(item) {
      this.dialogs.part.item = item;
      this.dialogs.part.add = true;
      this.dialogs.part.show = true;
    },
    showRemoveDialog({ id }) {
      this.dialogs.remove.ids = [id];
      this.dialogs.remove.show = true;
    },
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
