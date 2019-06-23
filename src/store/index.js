import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import dialogs from './dialogs';
import apollo from './apollo';

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
  modules: {
    dialogs,
    apollo,
  },
  state: {
    dark: false,
    searchText: '',
    loading: 0,
    online: window.navigator.onLine,
    itemsView: {
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
  },
  getters: {
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
