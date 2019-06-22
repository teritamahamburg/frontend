/* eslint-disable no-param-reassign */

export default {
  storeMutate(state, query) {
    const { data, internalId } = query.variables;
    data.createdAt = new Date().toISOString();
    data.id = `temp-id_${Date.now()}`;
    state.apollo.offlineItem.temp.ids[data.id] = data.id;
    data.partId = Date.now();
    data.internalId = internalId;
    state.apollo.offlineItem.parts.push(data);
    state.apollo.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { data, internalId } = query.variables;
    const beforeId = data.id;
    delete data.id;
    delete data.partId;
    delete data.internalId;
    query.variables.internalId = state.apollo.offlineItem.temp.internalIds[internalId]
      || internalId;
    const { data: { addPart: { item: { id } } } } = await vm.$apollo.mutate(query);
    state.apollo.offlineItem.temp.ids[beforeId] = id;
  },
};
