/* eslint-disable no-param-reassign */
import Vue from 'vue';

export default {
  storeMutate(state, query) {
    const { childId } = query.variables;
    Vue.delete(state.offlineItem.removeIds, childId);
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { childId } = query.variables;
    query.variables.childId = state.offlineItem.temp.ids[childId] || childId;
    await vm.$apollo.mutate(query);
  },
};
