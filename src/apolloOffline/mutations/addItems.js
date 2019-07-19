/* eslint-disable no-param-reassign */
import Vue from 'vue';

const nameSeparator = '|';

const sealImageToFile = (str) => {
  const sep = str.indexOf(nameSeparator);
  const fileName = str.substring(0, sep);
  const dataURI = str.substring(sep + nameSeparator.length);
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new File([ab], fileName, { type: mimeString });
};

export default {
  storeMutate(state, query) {
    query.variables.data.createdAt = new Date().toISOString();
    const { data: list } = query.variables;
    list.forEach((data) => {
      const id = `tid_${Date.now()}_${Math.ceil(Math.random() * 100)}`;
      Vue.set(state.offlineItem.temp.ids, id, id);
      if (data.seal) {
        data.seal = `${data.seal.name}${nameSeparator}${data.seal.url}`;
      }
      data.id = id;
      const createdAt = new Date();

      const children = [];
      if (data.amount > 1) {
        for (let childId = 1; childId <= data.amount; childId += 1) {
          Vue.set(state.offlineItem.temp.ids, `${id},${childId}`, `${id},${childId}`);
          children.push({
            id: `${id},${childId}`,
            itemId: id,
            childId,
            name: null,
            room: null,
            checkedAt: null,
            createdAt,
          });
        }
      }

      state.offlineItem.items.push({
        ...data,
        createdAt,
        children,
      });
    });

    state.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { data: list } = query.variables;
    const listIds = [];
    list.forEach((data) => {
      listIds.push(data.id);
      delete data.id;
      if (data.seal) {
        data.seal = sealImageToFile(data.seal);
      }
      delete data.children;
    });
    const { data: { addItems } } = await vm.$apollo.mutate(query);
    addItems.forEach(({ item: { id } }, i) => {
      const beforeId = listIds[i];
      Vue.set(state.offlineItem.temp.ids, beforeId, id);
      const bId = `${beforeId},`;
      Object.keys(state.offlineItem.temp.ids).forEach((key) => {
        if (key.startsWith(bId)) {
          state.offlineItem.temp.ids[key] = `${id},${key.substr(bId.length)}`;
        }
      });
    });
  },
};
