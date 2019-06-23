/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, id } = query.variables;
    const { partEdits } = state.offlineItem;
    const i = partEdits.findIndex(e => e.id === id);
    if (i === -1) {
      partEdits.push({
        ...data,
        id,
      });
    } else {
      partEdits[i] = {
        ...data,
        id,
      };
    }
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { id } = query.variables;
    query.variables.id = state.offlineItem.temp.ids[id] || id;
    await vm.$apollo.mutate(query);
  },
};
