/* eslint-disable no-param-reassign */

export default {
  state: {
    add: {
      show: false,
    },
    selectItems: [],
    remove: {
      show: false,
    },
    edit: {
      show: false,
      canRemove: true,
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
      canRemove: true,
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
    showEditDialog(state, item, canRemove = true) {
      if (!item) {
        state.edit.canRemove = true;
        state.edit.show = true;
      } else if (`${item.partId}` === '0') {
        state.edit.canRemove = canRemove;
        state.selectItems = [item];
        state.edit.show = true;
      } else {
        state.part.canRemove = canRemove;
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
      state.selectItems = [id];
      state.remove.show = true;
    },
    setSelectItems(state, ids) {
      state.selectItems = ids;
    },
  },
};
