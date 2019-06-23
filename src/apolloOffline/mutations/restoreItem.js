/* eslint-disable no-param-reassign */
import Vue from 'vue';

export default {
  storeMutate(state, query) {
    const { id } = query.variables;
    Vue.delete(state.offlineItem.removeIds, id);
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { id } = query.variables;
    query.variables.id = state.offlineItem.temp.ids[id] || id;
    await vm.$apollo.mutate(query);
  },
};
