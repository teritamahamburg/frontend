/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, id } = query.variables;
    const { itemEdits } = state.offlineItem;
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
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { id } = query.variables;
    query.variables.id = state.offlineItem.temp.ids[id] || id;
    await vm.$apollo.mutate(query);
  },
};
