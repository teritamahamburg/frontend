export default {
  required: text => value => !!value || (text || 'Required.'),
  min: (minVal, text) => value => (value >= minVal) || (text || `Above ${minVal}`),
  number: text => (value) => {
    if (value) {
      const isNum = typeof value === 'number' || (value.length !== 0 && !Number.isNaN(Number(value)));
      if (isNum) return true;
    }
    return text || 'Required number.';
  },
};
