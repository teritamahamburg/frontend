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
    code: {
      show: false,
      text: undefined,
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
      state.edit.canRemove = canRemove;
      if (item) state.selectItems = [item];
      state.edit.show = true;
    },
    showEditHistoryDialog(state, { id }) {
      state.editHistory.id = id;
      state.editHistory.show = true;
    },
    showCodeDialog(state, { id }) {
      state.code.text = `${id}`;
      state.code.show = true;
    },
    showRemoveDialog(state, items) {
      if (items) {
        if (Array.isArray(items)) {
          state.selectItems = items;
        } else {
          state.selectItems = [items];
        }
      }
      state.remove.show = true;
    },
    setSelectItems(state, ids) {
      state.selectItems = ids;
    },
  },
};
