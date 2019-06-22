const ctx = require.context('./', false, /\.js$/);

const gql = ctx.keys().reduce((o, name) => {
  const file = name.slice(2, -3);
  // eslint-disable-next-line no-param-reassign
  if (file !== 'index') o[file] = ctx(name).default;
  return o;
}, {});

export default gql;
