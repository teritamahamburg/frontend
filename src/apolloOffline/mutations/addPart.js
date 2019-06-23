/* eslint-disable no-param-reassign */
import Vue from 'vue';

export default {
  storeMutate(state, query) {
    const { data, internalId } = query.variables;
    data.createdAt = new Date().toISOString();
    data.id = `temp-id_${Date.now()}`;
    Vue.set(state.offlineItem.temp.ids, data.id, data.id);
    data.partId = Date.now();
    data.internalId = internalId;
    state.offlineItem.parts.push(data);
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { data, internalId } = query.variables;
    const beforeId = data.id;
    delete data.id;
    delete data.partId;
    delete data.internalId;
    query.variables.internalId = state.offlineItem.temp.internalIds[internalId]
      || internalId;
    const { data: { addPart: { item: { id } } } } = await vm.$apollo.mutate(query);
    Vue.set(state.offlineItem.temp.ids, beforeId, id);
  },
};
