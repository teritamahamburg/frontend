<template>
  <v-dialog :value="value" @input="v => $emit('change', v)" max-width="300">
    <v-card>
      <qrcode v-if="text" :value="text" :options="{width:300}"/>
    </v-card>
  </v-dialog>
</template>

<script>
import VueQrCode from '@chenfengyuan/vue-qrcode';

export default {
  name: 'QrCodeDialog',
  components: {
    qrcode: VueQrCode,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: undefined,
    },
  },
};
</script>

<style scoped>

</style>
