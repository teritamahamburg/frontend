import Vue from 'vue';
import VueApollo from 'vue-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client';

import gql from '@/mutations/index';

Vue.use(VueApollo);

Vue.mixin({
  methods: {
    $mutate(mutationName, options) {
      if (this.$store.state.online) {
        return this.$apollo.mutate({
          ...options,
          mutation: gql[mutationName],
        });
      }
      this.$store.commit('addOfflineQuery', {
        ...options,
        mutationName,
        mutation: gql[mutationName],
      });
      return Promise.resolve({
        success: true,
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
  switch (query.mutationName) {
    case 'addItem': {
      query.variables.data.createdAt = new Date().toISOString();
      const { data } = query.variables;
      const id = `temp-id_${Date.now()}`;
      const internalId = `temp-internalId_${Date.now()}`;
      state.apollo.offlineItem.temp.ids[id] = id;
      state.apollo.offlineItem.temp.internalIds[internalId] = internalId;
      state.apollo.offlineItem.items.push({
        ...data,
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
};

export const commitMutate = async () => {
  const {
    offlineQueries,
    /* offlineItem: {
      temp: {
        ids,
        internalIds,
      },
      items,
    }, */
  } = this.$store.state.apollo;
  // eslint-disable-next-line no-restricted-syntax
  for (const query of offlineQueries) {
    delete query.mutationName;
    // eslint-disable-next-line no-await-in-loop
    await this.$apollo.mutate(query);
  }
  this.$store.commit('clearOfflineQueries');
  this.$broadcast.$emit('items:refetch');
};
