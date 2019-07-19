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
    if (item.seal) {
      item.seal = item.seal.substring(item.seal.indexOf('|') + 1); // apolloOffline/mutations/addItem#nameSeparator
    }
    return item;
  })];

  /* 削除 */
  const ids = Object.keys(offlineItem.removeIds);
  const pItems = [];
  patchItems.forEach((item) => {
    const removed = ids.includes(item.id);
    let listIn = false;
    switch (paranoidType) {
      case 'ONLY_DELETED':
        if (removed) {
          item.deletedAt = new Date().toISOString();
          pItems.push(item);
        }
        break;
      // eslint-disable-next-line no-fallthrough
      case 'ALL':
        item.deletedAt = new Date().toISOString();
        listIn = true;
        break;
      case 'NORMAL':
      default:
        if (!removed) listIn = true;
        break;
    }
    if (!listIn && paranoidType !== 'ONLY_DELETED') return;
    const pChildren = [];
    item.children.forEach((child) => {
      const childRemoved = ids.includes(child.id);
      let childListIn = false;
      switch (paranoidType) {
        case 'ONLY_DELETED':
          if (childRemoved) {
            child.deletedAt = new Date().toISOString();
            pItems.push(child);
          }
          break;
        case 'ALL':
          child.deletedAt = new Date().toISOString();
          childListIn = true;
          break;
        case 'NORMAL':
        default:
          if (!childRemoved) childListIn = true;
          break;
      }
      if (childListIn) pChildren.push(child);
    });
    if (paranoidType !== 'ONLY_DELETED') {
      pItems.push({
        ...item,
        children: pChildren,
      });
    }
  });
  patchItems = pItems;

  /* 編集 */
  if (paranoidType !== 'ONLY_DELETED') {
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
  } else {
    [...offlineItem.itemEdits, ...offlineItem.childEdits].forEach((edit) => {
      const i = patchItems.findIndex(({ id }) => id === edit.id);
      if (i !== -1) {
        patchItems[i] = {
          ...patchItems[i],
          ...edit,
        };
      }
    });
  }
  return patchItems;
};

export default {
  state: {
    offlineQueries: [],
    offlineItem: {
      temp: {
        ids: {},
      },
      items: [],
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
            ids: {},
          },
          items: [],
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
