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
