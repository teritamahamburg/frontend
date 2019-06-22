/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { ids } = query.variables;
    state.apollo.offlineItem.removeIds.push(...ids);
    state.apollo.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { ids } = query.variables;
    query.variables.ids = ids.map(id => state.apollo.offlineItem.temp.ids[id] || id);
    await vm.$apollo.mutate(query);
  },
};
