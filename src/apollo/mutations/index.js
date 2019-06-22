const ctx = require.context('./', false, /\.gql$/);

const gql = ctx.keys().reduce((o, name) => {
  // eslint-disable-next-line no-param-reassign
  o[name.slice(2, -4)] = ctx(name);
  return o;
}, {});

export default gql;
