import Vue from 'vue';
import VueApollo from 'vue-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client';

import mutations from '@/apollo/mutations';
import offlineMutations from '@/apolloOffline/mutations';

Vue.use(VueApollo);

Vue.mixin({
  methods: {
    $mutate(mutationName, options) {
      if (this.$store.state.online) {
        return this.$apollo.mutate({
          ...options,
          mutation: mutations[mutationName],
        });
      }
      this.$store.commit('addOfflineQuery', {
        ...options,
        mutationName,
      });
      return Promise.resolve({
        data: {
          [mutationName]: {
            success: true,
          },
        },
      });
    },
  },
});

// INFO: https://github.com/Akryum/vue-apollo/issues/631
const cache = new InMemoryCache({ freezeResults: false });

export const waitOnCache = persistCache({
  cache,
  key: 'apollo',
  storage: window.localStorage,
});


const { apolloClient, wsClient } = createApolloClient({
  httpEndpoint: `${window.location.protocol}//${window.location.host}/graphql`,
  cache,
});
apolloClient.wsClient = wsClient;

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
    },
  },
  errorHandler(error) {
    if (window.gqlError) window.gqlError(error);
  },
  watchLoading(isLoading, countModifier) {
    this.$store.state.loading += countModifier;
  },
});

export default apolloProvider;

/* eslint-disable no-param-reassign */
// TODO: <OFFLINE> all mutation support
export const storeMutate = (state, query) => {
  if (offlineMutations[query.mutationName]) {
    offlineMutations[query.mutationName].storeMutate(state, query);
  } else if (window.gqlError) {
    window.gqlError({
      message: 'その操作はできません',
    });
  }
};

export const commitMutate = async (self) => {
  const { offlineQueries } = self.$store.state.apollo;
  await offlineQueries.reduce((promise, query) => promise.then(
    () => offlineMutations[query.mutationName].commitMutate(self, {
      ...query,
      mutation: mutations[query.mutationName],
    }, self.$store.state),
  ), Promise.resolve());
  self.$store.commit('clearOfflineQueries');
  self.$broadcast.$emit('items:refetch');
};

export const patchOfflineChanges = (self, items) => {
  const { offlineItem } = self.$store.state.apollo;
  const patchItems = [...items, ...offlineItem.items.map((item) => {
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
  offlineItem.removeIds.filter((id) => {
    const i = patchItems.findIndex(item => item.id === id);
    if (i !== -1) {
      patchItems.splice(i, 1);
    }
    return i !== -1;
  }).forEach((id) => {
    patchItems.forEach((item) => {
      const i = item.parts.findIndex(part => part.id === id);
      if (i !== -1) delete item.parts[i];
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
