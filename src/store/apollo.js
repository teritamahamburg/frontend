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
  offlineItem.parts.forEach((part) => {
    const i = patchItems.findIndex(item => item.internalId === part.internalId);
    if (i !== -1) {
      const item = patchItems[i];
      if (!patchItems.parts) item.parts = [];
      item.parts.push(part);
    }
  });

  /* 削除 */
  const ids = Object.keys(offlineItem.removeIds);
  if (paranoidType === 'ONLY_DELETED') {
    const pItems = [];
    patchItems.forEach((item) => {
      if (ids.includes(item.id)) {
        item.deletedAt = new Date().toISOString();
        const pParts = [];
        item.parts.forEach((part) => {
          if (ids.includes(part.id)) {
            part.deletedAt = new Date().toISOString();
            pParts.push(part);
          }
        });
        pItems.push({
          ...item,
          parts: pParts,
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
          patchItems[i].parts.forEach((part) => {
            part.deletedAt = offlineItem.removeIds[id];
          });
        }
      }
      return i !== -1;
    }).forEach((id) => {
      patchItems.forEach((item) => {
        const i = item.parts.findIndex(part => part.id === id);
        if (i !== -1) {
          if (paranoidType === 'NORMAL') {
            item.parts.splice(i, 1);
          } else if (paranoidType === 'ALL') {
            item.parts[i].deletedAt = offlineItem.removeIds[id];
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
  offlineItem.partEdits.forEach((edit) => {
    patchItems.forEach(({ parts }) => {
      const i = parts.findIndex(({ id }) => id === edit.id);
      if (i !== -1) {
        parts[i] = {
          ...parts[i],
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
      parts: [],
      itemEdits: [],
      partEdits: [],
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
          parts: [],
          itemEdits: [],
          partEdits: [],
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
