/* eslint-disable no-param-reassign */

import { storeMutate } from '@/vue-apollo';

const patchOfflineChanges = (state, paranoid = false) => {
  const { offlineItem, items } = state;
  const patchItems = [...(items || []), ...offlineItem.items.map((item) => {
    if (item.sealImage) {
      // eslint-disable-next-line no-param-reassign
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
  Object.keys(offlineItem.removeIds).filter((id) => {
    const i = patchItems.findIndex(item => item.id === id);
    if (i !== -1) {
      if (paranoid) {
        patchItems[i].deletedAt = offlineItem.removeIds[id];
      } else {
        patchItems.splice(i, 1);
      }
    }
    return i !== -1;
  }).forEach((id) => {
    patchItems.forEach((item) => {
      const i = item.parts.findIndex(part => part.id === id);
      if (i !== -1) {
        if (paranoid) {
          item.parts[i].deletedAt = offlineItem.removeIds[id];
        } else {
          delete item.parts[i];
        }
      }
    });
  });
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
      return patchOfflineChanges(state, true);
    },
  },
};
