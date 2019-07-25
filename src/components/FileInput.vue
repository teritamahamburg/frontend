<template>
  <div>
    <v-text-field prepend-icon="mdi-attachment" readonly :label="$t('general.seal')"
                  @click="$refs.image.click()" :value="value.name"
                  append-icon="mdi-close" @click:append="clearFile"/>
    <input
      type="file"
      style="display: none"
      ref="image"
      accept="image/*"
      @change="onFilePicked">
  </div>
</template>

<script>
export default {
  name: 'FileInput',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: [Object, File],
      default: () => ({}),
    },
  },
  methods: {
    onFilePicked(e) {
      const { files } = e.target;
      if (files[0] !== undefined) {
        const file = files[0];
        if (file.name.lastIndexOf('.') <= 0) return;
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.addEventListener('load', () => {
          file.url = fr.result;
          this.$emit('change', file);
        });
      } else {
        this.clearFile();
      }
    },
    clearFile() {
      this.$emit('change', undefined);
    },
  },
};
</script>

<style scoped>

</style>
