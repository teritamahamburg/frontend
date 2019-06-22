/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, id } = query.variables;
    const { itemEdits } = state.apollo.offlineItem;
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
    state.apollo.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { id } = query.variables;
    query.variables.id = state.apollo.offlineItem.temp.ids[id] || id;
    await vm.$apollo.mutate(query);
  },
};
