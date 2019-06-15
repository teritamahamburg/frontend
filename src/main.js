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
      attrs: [
        { type: 'action', key: 'select' },
        { type: 'value', key: 'id' },
        { type: 'value', key: 'schoolName' },
        { type: 'value', key: 'name' },
        { type: 'value', key: 'code' },
        { type: 'value', key: 'amount' },
        { type: 'value', key: 'purchasedAt' },
        { type: 'value', key: 'user' },
        { type: 'value', key: 'course' },
        { type: 'value', key: 'checkedAt' },
        { type: 'value', key: 'room' },
        { type: 'value', key: 'disposalAt' },
        { type: 'value', key: 'depreciationAt' },
        { type: 'value', key: 'createdAt' },
        { type: 'value', key: 'deletedAt' },
        { type: 'action', key: 'addPart' },
        { type: 'action', key: 'qrCode' },
        { type: 'action', key: 'editHistory' },
        { type: 'action', key: 'edit' },
        { type: 'action', key: 'remove' },
        { type: 'action', key: 'part' },
        { type: 'action', key: 'seal' },
      ],
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
        csv: {
          show: false,
        },
        restore: {
          show: false,
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
    attributes() {
      return [
        'id',
        'internalId',
        'partId',
        'schoolName',
        'name',
        'code',
        'amount',
        'user',
        'course',
        'room',
        'editUser',
        'purchasedAt',
        'checkedAt',
        'disposalAt',
        'depreciationAt',
        'createdAt',
        'deletedAt',
      ].filter(k => !this.attrs.some(a => a.key === k))
        .map(key => ({ type: 'value', key }));
    },
    attributeActions() {
      return [
        'select',
        'addPart',
        'qrCode',
        'editHistory',
        'edit',
        'remove',
        'part',
        'seal',
      ].filter(k => !this.attrs.some(a => a.key === k))
        .map(key => ({ type: 'action', key }));
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
