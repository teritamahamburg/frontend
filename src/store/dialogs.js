/* eslint-disable no-param-reassign */

export default {
  state: {
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
    seal: {
      show: false,
      image: '',
    },
  },
  mutations: {
    showEditDialog(state, item) {
      if (`${item.partId}` === '0') {
        state.edit.item = item;
        state.edit.show = true;
      } else {
        state.part.item = item;
        state.part.add = false;
        state.part.show = true;
      }
    },
    showEditHistoryDialog(state, { id }) {
      state.editHistory.id = id;
      state.editHistory.show = true;
    },
    showQRCodeDialog(state, { id }) {
      state.qrCode.text = `${id}`;
      state.qrCode.show = true;
    },
    showAddPartDialog(state, item) {
      state.part.item = item;
      state.part.add = true;
      state.part.show = true;
    },
    showRemoveDialog(state, { id }) {
      state.remove.ids = [id];
      state.remove.show = true;
    },
  },
};
