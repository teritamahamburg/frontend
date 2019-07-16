<template>
  <v-dialog :value="show" @input="v => $emit('change', v)" max-width="250">
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on"/>
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('general.csvDownload') }}</span>
      </v-card-title>
      <v-card-text>
        <v-checkbox color="black" :label="$t('general.includeDeleted')" v-model="paranoid"/>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="$emit('change', false)">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickDownloadInDialog">
          {{ $t('general.download') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import csvQuery from '@/apollo/queries/csv.gql';

const csvDownload = (csv, filename = 'items.csv') => {
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.target = '_blank';
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  /* a.click(); // <- not working in firefox */
  const event = document.createEvent('MouseEvents');
  event.initEvent('click', true, true);
  a.dispatchEvent(event);
};

const csvColumns = [
  'id',
  'seal',
  'name',
  'code',
  'amount',
  'admin',
  'course',
  'room',
  'purchasedAt',
  'checkedAt',
  'disposalAt',
  'depreciationAt',
  'createdAt',
  'deletedAt',
];

export default {
  name: 'DownloadCsvDialog',
  model: {
    prop: 'show',
    event: 'change',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      paranoid: false,
    };
  },
  methods: {
    clickDownloadInDialog() {
      if (this.$store.state.online) {
        this.$apollo.query({
          query: csvQuery,
          variables: {
            paranoid: this.paranoid,
          },
          fetchPolicy: 'network-only',
        }).then(({ data: { csv: { columns, rows } } }) => {
          this.queryResult(columns, rows);
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      } else {
        const items = this.paranoid
          ? this.$store.getters.itemsWithOfflineParanoid
          : this.$store.getters.itemsWithOffline;
        const rows = items.map(item => csvColumns.map(k => `"${item[k] || ''}"`).join(',')).join('\n');
        this.queryResult(csvColumns, rows);
      }
    },
    queryResult(columns, rows) {
      csvDownload(`${columns.map(s => this.$t(`item.${s}`)).join(',')}\n${rows}`);
      this.$emit('change', false);
    },
  },
};
</script>

<style scoped>
  .headline {
    word-break: keep-all;
  }
</style>
