/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, ids } = query.variables;
    const { itemEdits } = state.offlineItem;
    ids.forEach((id) => {
      const i = itemEdits.findIndex(e => e.id === id);
      if (i === -1) {
        itemEdits.push({
          ...data,
          id,
        });
      } else {
        itemEdits[i] = {
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
