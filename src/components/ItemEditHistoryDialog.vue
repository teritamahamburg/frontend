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
      <v-data-table hide-actions v-if="histories"
                    :headers="headers"
                    :items="histories">
        <template v-slot:items="{ item }">
          <td v-for="k in Object.keys(item)" :key="k">
            {{ item[k] }}
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script>
import itemHistoriesQuery from '@/queries/itemHistories.gql';

export default {
  name: 'ItemEditHistoryDialog',
  apollo: {
    histories: {
      skip: true,
      query: itemHistoriesQuery,
      variables() {
        return {
          id: this.id,
        };
      },
      update({ item: { histories } }) {
        return histories.map((item) => {
          const i = {
            ...item,
            room: item.room.number,
            editUser: item.editUser.name,
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
  watch: {
    value(val) {
      this.$apollo.queries.histories.skip = !val;
      this.$nextTick(() => {
        if (this.$store.state.online) this.$apollo.queries.histories.refetch();
      });
    },
  },
  computed: {
    headers() {
      if (!this.histories || this.histories.length === 0) return [];
      return Object.keys(this.histories[0])
        .map(k => ({ value: k, text: this.$t(`item.${k}`) }));
    },
  },
};
</script>

<style scoped lang="scss">

</style>
