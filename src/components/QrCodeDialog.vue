<template>
  <v-dialog :value="value" @input="v => $emit('change', v)" max-width="300">
    <v-card>
      <qrcode v-if="text" :value="fullText" :options="{width:300}"/>
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
    verify: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    fullText() {
      if (this.verify) return `${this.verify}:${this.text}`;
      return `${this.text}`;
    },
  },
};
</script>

<style scoped>

</style>
