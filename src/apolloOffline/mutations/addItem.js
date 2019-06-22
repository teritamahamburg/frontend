/* eslint-disable no-param-reassign */

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
    const { data } = query.variables;
    const id = `temp-id_${Date.now()}`;
    const internalId = `temp-internalId_${Date.now()}`;
    state.apollo.offlineItem.temp.ids[id] = id;
    state.apollo.offlineItem.temp.internalIds[internalId] = internalId;
    if (data.sealImage) {
      data.sealImage = `${data.sealImage.name}${nameSeparator}${data.sealImage.url}`;
    }
    data.id = id;
    data.internalId = internalId;
    data.partId = 0;
    state.apollo.offlineItem.items.push(data);
    state.apollo.offlineQueries.push(query);
  },
  async commitMutate(vm, query, state) {
    const { data } = query.variables;
    const beforeId = data.id;
    delete data.id;
    const beforeInternalId = data.internalId;
    delete data.internalId;
    delete data.partId;
    if (data.sealImage) {
      data.sealImage = sealImageToFile(data.sealImage);
    }
    const { data: { addItem: { item: { id, internalId } } } } = await vm.$apollo.mutate(query);
    state.apollo.offlineItem.temp.ids[beforeId] = id;
    state.apollo.offlineItem.temp.internalIds[beforeInternalId] = internalId;
  },
};
