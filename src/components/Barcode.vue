<template>
  <div>
    <canvas ref="canvas"></canvas>
    <slot></slot>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';

export default {
  name: 'Barcode',
  props: {
    format: {
      type: String,
      default: 'CODE39',
    },
    width: {
      type: Number,
      default: 2,
    },
    value: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.renderBarcode(this.$props);
  },
  watch: {
    $props: {
      deep: true,
      handler: 'renderBarcode',
    },
  },
  methods: {
    renderBarcode(val) {
      JsBarcode(this.$refs.canvas, this.value, Object.entries(val).reduce((obj, [k, v]) => {
        // eslint-disable-next-line no-param-reassign
        if (v && k !== 'value') obj[k] = v;
        return obj;
      }));
    },
  },
};
</script>

<style scoped>

</style>
