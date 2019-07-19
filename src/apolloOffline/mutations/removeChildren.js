/* eslint-disable no-param-reassign */
import Vue from 'vue';

export default {
  storeMutate(state, query) {
    const { childIds } = query.variables;
    childIds.forEach((id) => {
      Vue.set(state.offlineItem.removeIds, id, new Date().toISOString());
    });
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { childIds } = query.variables;
    query.variables.childIds = Object.keys(childIds)
      .map(id => state.offlineItem.temp.ids[id] || id);
    await vm.$apollo.mutate(query);
  },
};
