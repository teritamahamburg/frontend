<template>
  <v-dialog :value="value" persistent max-width="600"
    :fullscreen="$vuetify.breakpoint.xsOnly">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('general.editHistory') }}</span>
        <v-spacer/>
        <v-btn depressed dark color="black" @click="$emit('change', false)">
          {{ $t('general.close') }}
        </v-btn>
      </v-card-title>
      <v-data-table hide-actions
                    :headers="headers"
                    :items="id && id.includes(',') ? childHistories : histories">
        <template v-slot:items="props">
          <tr :key="props.index">
            <td v-for="k in Object.keys(props.item)" :key="`${props.index}-${k}`">
              {{ props.item[k] }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script>
import itemHistoriesQuery from '@/apollo/queries/itemHistories.gql';
import childHistoriesQuery from '@/apollo/queries/childHistories.gql';

export default {
  name: 'ItemEditHistoryDialog',
  apollo: {
    histories: {
      skip() {
        if (!this.value) return true;
        return !this.id || this.id.includes(',');
      },
      query: itemHistoriesQuery,
      variables() {
        return {
          id: this.id,
        };
      },
      update({ item }) {
        if (!item) return [];
        return item.histories.map((it) => {
          const i = {
            ...it,
            room: it.room.number,
          };
          // eslint-disable-next-line no-underscore-dangle
          delete i.__typename;
          return i;
        });
      },
    },
    childHistories: {
      skip() {
        if (!this.value) return true;
        return !this.id || !this.id.includes(',');
      },
      query: childHistoriesQuery,
      variables() {
        return {
          childId: this.id,
        };
      },
      update({ child }) {
        if (!child) return [];
        return child.childHistories.map((item) => {
          const i = {
            ...item,
            room: item.room ? item.room.number : null,
          };
          // eslint-disable-next-line no-underscore-dangle
          delete i.__typename;
          return i;
        });
      },
    },
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
    id: {
      type: [Number, String],
      default: undefined,
    },
  },
  data() {
    return {
      histories: [],
      childHistories: [],
    };
  },
  watch: {
    value() {
      this.$nextTick(() => {
        this.$apollo.queries.histories.refetch();
      });
    },
  },
  computed: {
    headers() {
      if (!this.id) return [];
      const h = this.id.includes(',') ? this.childHistories : this.histories;
      if (!h || h.length === 0) return [];
      return Object.keys(h[0])
        .map(k => ({ value: k, text: this.$t(`item.${k}`) }));
    },
  },
};
</script>

<style scoped lang="scss">

</style>
