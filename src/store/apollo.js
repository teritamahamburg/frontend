/* eslint-disable no-param-reassign */

import { storeMutate } from '@/vue-apollo';

/**
 * @param state
 * @param paranoidType ['NORMAL', 'ONLY_DELETED', 'ALL']
 */
const patchOfflineChanges = (state, paranoidType = 'NORMAL') => {
  const { offlineItem, items } = state;
  /* 追加 */
  let patchItems = [...(items || []), ...offlineItem.items.map((item) => {
    if (item.sealImage) {
      item.sealImage = item.sealImage.substring(item.sealImage.indexOf('|') + 1); // apolloOffline/mutations/addItem#nameSeparator
    }
    return item;
  })];
  offlineItem.children.forEach((child) => {
    const i = patchItems.findIndex(item => item.internalId === child.internalId);
    if (i !== -1) {
      const item = patchItems[i];
      if (!patchItems.children) item.children = [];
      item.children.push(child);
    }
  });

  /* 削除 */
  const ids = Object.keys(offlineItem.removeIds);
  if (paranoidType === 'ONLY_DELETED') {
    const pItems = [];
    patchItems.forEach((item) => {
      if (ids.includes(item.id)) {
        item.deletedAt = new Date().toISOString();
        const pChildren = [];
        item.children.forEach((child) => {
          if (ids.includes(child.id)) {
            child.deletedAt = new Date().toISOString();
            pChildren.push(child);
          }
        });
        pItems.push({
          ...item,
          children: pChildren,
        });
      }
    });
    patchItems = pItems;
  } else {
    ids.filter((id) => {
      const i = patchItems.findIndex(item => item.id === id);
      if (i !== -1) {
        if (paranoidType === 'NORMAL') {
          patchItems.splice(i, 1);
        } else if (paranoidType === 'ALL') {
          patchItems[i].deletedAt = offlineItem.removeIds[id];
          patchItems[i].children.forEach((child) => {
            child.deletedAt = offlineItem.removeIds[id];
          });
        }
      }
      return i !== -1;
    }).forEach((id) => {
      patchItems.forEach((item) => {
        const i = item.children.findIndex(child => child.id === id);
        if (i !== -1) {
          if (paranoidType === 'NORMAL') {
            item.children.splice(i, 1);
          } else if (paranoidType === 'ALL') {
            item.children[i].deletedAt = offlineItem.removeIds[id];
          }
        }
      });
    });
  }

  /* 編集 */
  offlineItem.itemEdits.forEach((edit) => {
    const i = patchItems.findIndex(({ id }) => id === edit.id);
    if (i !== -1) {
      patchItems[i] = {
        ...patchItems[i],
        ...edit,
      };
    }
  });
  offlineItem.childEdits.forEach((edit) => {
    patchItems.forEach(({ children }) => {
      const i = children.findIndex(({ id }) => id === edit.id);
      if (i !== -1) {
        children[i] = {
          ...children[i],
          ...edit,
        };
      }
    });
  });
  return patchItems;
};

export default {
  state: {
    offlineQueries: [],
    offlineItem: {
      temp: {
        internalIds: {},
        ids: {},
      },
      items: [],
      children: [],
      itemEdits: [],
      childEdits: [],
      removeIds: {},
    },
    items: [],
  },
  mutations: {
    addOfflineQuery(state, query) {
      storeMutate(state, query);
    },
    clearOfflineQueries(state) {
      const { items } = state;
      state = {
        offlineQueries: [],
        offlineItem: {
          temp: {
            internalIds: {},
            ids: {},
          },
          items: [],
          children: [],
          itemEdits: [],
          childEdits: [],
          removeIds: {},
        },
        items,
      };
    },
    setApolloItems(state, val) {
      state.items = val;
    },
  },
  getters: {
    itemsWithOffline(state) {
      return patchOfflineChanges(state);
    },
    itemsWithOfflineParanoid(state) {
      return patchOfflineChanges(state, 'ALL');
    },
    itemsWithOfflineDeleted(state) {
      return patchOfflineChanges(state, 'ONLY_DELETED');
    },
  },
};
