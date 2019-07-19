import Vue from 'vue';
import VueApollo from 'vue-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
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

      const excludePlural = ['removeItems', 'removeChildren'];
      const pluralSuffix = ['Items', 'Children'];
      if (!excludePlural.includes(mutationName)
        && pluralSuffix.some(p => mutationName.endsWith(p))) {
        const len = Object.values(options.variables)
          .map(value => (Array.isArray(value) ? value.length : 0));
        return Promise.resolve({
          data: {
            [mutationName]: [...Array(len)].map(() => ({
              success: true,
            })),
          },
        });
      }
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
    }, self.$store.state.apollo),
  ), Promise.resolve());
  self.$store.commit('clearOfflineQueries');
  self.$broadcast.$emit('items:refetch');
};
