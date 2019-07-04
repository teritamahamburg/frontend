<template>
  <v-dialog :value="value" @input="v => $emit('change', v)" max-width="300">
    <v-card>
      <template v-if="type === 'QR'">
        <qrcode v-if="text" :value="fullText" :options="{width:300}"/>
        <v-card-actions class="no--print">
          <v-spacer />
          <span style="margin-right: 8px">Print in: </span>
          <v-btn outline small @click="clickPrintBrowser">
            Browser
          </v-btn>
          <v-btn outline small @click="clickPrintMachine">
            Machine
          </v-btn>
        </v-card-actions>
      </template>
      <template v-else>
        <div class="print--card">
          <div style="width: 250px;height:250px;background-color:red" v-show="text"></div>
        </div>

        <v-card-actions>
          <v-btn icon @click="clickBack">
            <v-icon>keyboard_arrow_left</v-icon>
          </v-btn>
          <v-spacer />
          <v-btn outline v-show="text">
            Transfer
          </v-btn>
        </v-card-actions>
      </template>
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
  watch: {
    value() {
      this.type = 'QR';
    },
  },
  data() {
    return {
      type: 'QR',
    };
  },
  computed: {
    fullText() {
      if (this.verify) return `${this.verify}:${this.text}`;
      return `${this.text}`;
    },
  },
  methods: {
    clickPrintBrowser() {
      this.$store.commit('setPrintQR', true);
      this.$nextTick(() => {
        window.print();
      });
    },
    clickPrintMachine() {
      this.type = 'PRINT';
    },
    clickBack() {
      this.type = 'QR';
    },
  },
  created() {
    window.onafterprint = () => {
      this.$store.commit('setPrintQR', false);
    };
  },
};
</script>

<style scoped>
.print--card {
  display: flex;
  flex-direction: column;
  padding: 8px;
  justify-content: center;
  align-items: center;
}
</style>
