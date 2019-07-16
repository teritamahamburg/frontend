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
    const { data, ids } = query.variables;
    const { itemEdits } = state.offlineItem;
    ids.forEach((id) => {
      const i = itemEdits.findIndex(e => e.id === id);
      if (data.seal) {
        data.seal = `${data.seal.name}${nameSeparator}${data.seal.url}`;
      }
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
    const { data, ids } = query.variables;
    if (data.seal) {
      data.seal = sealImageToFile(data.seal);
    }
    query.variables.ids = ids.map(id => state.offlineItem.temp.ids[id] || id);
    await vm.$apollo.mutate(query);
  },
};
