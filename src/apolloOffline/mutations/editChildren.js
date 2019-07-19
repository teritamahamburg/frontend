/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, ids } = query.variables;
    const { childEdits } = state.offlineItem;
    ids.forEach((id) => {
      const i = childEdits.findIndex(e => e.id === id);
      if (i === -1) {
        childEdits.push({
          ...data,
          id,
        });
      } else {
        childEdits[i] = {
          ...data,
          id,
        };
      }
    });
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { ids } = query.variables;
    query.variables.ids = ids.map(id => state.offlineItem.temp.ids[id] || id);
    await vm.$apollo.mutate(query);
  },
};
