<template>
  <v-dialog :value="value" @input="v => $emit('change', v)" max-width="300">
    <v-card>
      <template v-if="type === 'QR'">
        <div style="display: flex; justify-content: center">
          <barcode v-if="text" :value="text" />
        </div>
        <v-card-actions class="no--print">
          <v-spacer/>
          <span style="margin-right: 8px">Print in: </span>
          <v-btn outlined small @click="clickPrintBrowser">
            Browser
          </v-btn>
          <v-btn outlined small @click="clickPrintMachine" style="margin-left: 8px">
            Machine
          </v-btn>
        </v-card-actions>
      </template>
      <template v-else>
        <div class="print--card">
          <canvas width="250" height="250" ref="transferCanvas"></canvas>
          <v-text-field v-model="time" type="number" :disabled="transferring" />
        </div>

        <v-card-actions>
          <v-btn icon @click="clickBack" :disabled="transferring">
            <v-icon v-text="$vuetify.icons.values.custom.back" />
          </v-btn>
          <v-spacer/>
          <v-btn outlined v-show="text" @click="clickTransfer" :disabled="transferring">
            Transfer
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script>
import Barcode from '@/components/Barcode.vue';

export default {
  name: 'CodeDialog',
  components: {
    Barcode,
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
      time: '35',
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
      const time = Number(this.time);
      requestAnimationFrame((startTime) => {
        let start = startTime;
        const bin = `32${this.text
          .split('')
          .map(c => Number(c).toString(2).padStart(4, '0'))
          .join('')
          .split('')
          .join('2')
        }23`;
        const canvas = this.$refs.transferCanvas;
        const ctx = canvas.getContext('2d');

        let i = 0;
        let b = 0;
        const render = (timestamp) => {
          if (timestamp - start >= time) {
            start = timestamp;
            if (bin.length === i) {
              this.transferring = false;
              return;
            }
            if (b % 5 === 0) {
              ctx.fillStyle = ['#00F', '#0F0', '#000', '#F00'][bin[i]];
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              i += 1;
            }
            b += 1;
          }
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
