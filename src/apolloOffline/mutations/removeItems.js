/* eslint-disable no-param-reassign */
import Vue from 'vue';

export default {
  storeMutate(state, query) {
    const { ids } = query.variables;
    if (Array.isArray(state.offlineItem.removeIds)) {
      state.offlineItem.removeIds = state.offlineItem.removeIds.reduce((o, i) => {
        o[i] = new Date().toISOString();
        return o;
      }, {});
    }
    ids.forEach((id) => {
      Vue.set(state.offlineItem.removeIds, id, new Date().toISOString());
    });
    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { ids } = query.variables;
    query.variables.ids = Object.keys(ids).map(id => state.offlineItem.temp.ids[id] || id);
    await vm.$apollo.mutate(query);
  },
};
