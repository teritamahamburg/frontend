<template>
  <v-dialog :value="show" @input="v => $emit('change', v)" max-width="600">
    <v-card v-if="show">
      <v-img :src="image" />
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SealDialog',
  model: {
    prop: 'show',
    event: 'change',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>

</style>
