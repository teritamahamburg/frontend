<template>
  <v-dialog :value="value" @input="v => $emit('change', v)" max-width="300">
    <v-card>
      <template v-if="type === 'QR'">
        <qrcode v-if="text" :value="text" :options="{width:300}"/>
        <v-card-actions class="no--print">
          <v-spacer/>
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
          <canvas width="250" height="250" ref="transferCanvas"></canvas>
        </div>

        <v-card-actions>
          <v-btn icon @click="clickBack" :disabled="transferring">
            <v-icon>keyboard_arrow_left</v-icon>
          </v-btn>
          <v-spacer/>
          <v-btn outline v-show="text" @click="clickTransfer" :disabled="transferring">
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
  name: 'CodeDialog',
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
  watch: {
    value() {
      this.type = 'QR';
    },
  },
  data() {
    return {
      type: 'QR',
      transferring: false,
    };
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
      this.$nextTick(() => {
        const canvas = this.$refs.transferCanvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#F00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    },
    clickBack() {
      this.type = 'QR';
    },
    clickTransfer() {
      requestAnimationFrame(() => {
        const bin = `32${this.text
          .split('').map(c => c.charCodeAt(0).toString(2)).join('')
          .split('')
          .join('2')
        }23`;
        const canvas = this.$refs.transferCanvas;
        const ctx = canvas.getContext('2d');

        const a = Date.now();
        let i = 0;
        let b = 0;
        const render = () => {
          if (bin.length === i) {
            const c = Date.now();
            console.log(c - a);
            this.transferring = false;
            return;
          }
          if (b % 5 === 0) {
            ctx.fillStyle = ['#00F', '#0F0', '#000', '#F00'][bin[i]];
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            i += 1;
          }
          b += 1;
          requestAnimationFrame(render);
        };
        this.transferring = true;
        render();
      });
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
