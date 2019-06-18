import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: false, // TODO: true
  plugins: [createPersistedState({
    paths: [
      'dark',
      'itemsView.viewType',
      'itemsView.sortType',
      'itemsView.sortOrder',
      'attrs',
      'apollo',
    ],
  })],
  state: {
    dark: false, // persist
    searchText: '',
    loading: 0,
    online: window.navigator.onLine,
    itemsView: {
      showControl: false,
      viewType: 'grid', // persist
      sortType: 'id', // persist
      sortOrder: 'asc', // persist
    },
    attrs: [ // persist
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
    apollo: {
      offlineQueries: [],
      offlineItem: {
        temp: {
          internalIds: {},
          ids: {},
        },
        items: [],
      },
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
      csv: {
        show: false,
      },
      restore: {
        show: false,
      },
      reflect: {
        show: false,
      },
    },
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setDark(state, val) {
      state.dark = val;
      document.body.style.backgroundColor = val ? 'rgb(48, 48, 48)' : 'rgb(250, 250, 250)';
    },
    setViewType(state, val) {
      state.itemsView.viewType = val;
    },
    setSortType(state, val) {
      state.itemsView.sortType = val;
    },
    setSortOrder(state, val) {
      state.itemsView.sortOrder = val;
    },
    setAttrs(state, val) {
      state.attrs = val;
    },
    addOfflineQuery(state, query) {
      state.apollo.offlineQueries.push(query);
      switch (query.mutationName) {
        case 'addItem': {
          const { data } = query.variables;
          const id = `temp-id_${Date.now()}`;
          const internalId = `temp-internalId_${Date.now()}`;
          state.apollo.offlineItem.temp.ids[id] = id;
          state.apollo.offlineItem.temp.internalIds[internalId] = internalId;
          state.apollo.offlineItem.items.push({
            ...data,
            createdAt: undefined,
            id,
            internalId,
            partId: 0,
          });
          break;
        }
        default: {
          if (window.gqlError) {
            window.gqlError({
              message: 'その操作はできません',
            });
          }
        }
      }
    },
    clearOfflineQueries(state) {
      state.apollo = {
        offlineQueries: [],
        offlineItem: {
          temp: {
            internalIds: {},
            ids: {},
          },
          items: [],
        },
      };
    },
    showEditDialog(state, item) {
      if (`${item.partId}` === '0') {
        state.dialogs.edit.item = item;
        state.dialogs.edit.show = true;
      } else {
        state.dialogs.part.item = item;
        state.dialogs.part.add = false;
        state.dialogs.part.show = true;
      }
    },
    showEditHistoryDialog(state, { id }) {
      state.dialogs.editHistory.id = id;
      state.dialogs.editHistory.show = true;
    },
    showQRCodeDialog(state, { id }) {
      state.dialogs.qrCode.text = `${id}`;
      state.dialogs.qrCode.show = true;
    },
    showAddPartDialog(state, item) {
      state.dialogs.part.item = item;
      state.dialogs.part.add = true;
      state.dialogs.part.show = true;
    },
    showRemoveDialog(state, { id }) {
      state.dialogs.remove.ids = [id];
      state.dialogs.remove.show = true;
    },
  },
  getters: {
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
        addPart: item => store.commit('showAddPartDialog', item),
        edit: item => store.commit('showEditDialog', item),
        editHistory: item => store.commit('showEditHistoryDialog', item),
        qrCode: item => store.commit('showQRCodeDialog', item),
        remove: item => store.commit('showRemoveDialog', item),
      };
    },
  },
});

export default store;
