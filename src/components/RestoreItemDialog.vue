<template>
  <v-dialog max-width="300" :value="show" @input="v => $emit('change', val)">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('general.restoreItem') }}</span>
      </v-card-title>
      <items-view view-type="list" :attrs="attrs" :items="items"
                  @click:row="restoreItem" >
        <template v-slot:empty>
          <v-layout justify-center >
            <span class="headline">{{ $t('general.empty') }}</span>
          </v-layout>
        </template>
      </items-view>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="$emit('change', false)">
          {{ $t('general.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import RestoreItemsQuery from '@/apollo/queries/restoreItems.gql';
import ItemsView from '@/components/ItemsView.vue';

export default {
  components: { ItemsView },
  apollo: {
    restoreItems: {
      skip() {
        return !(this.show && this.$store.state.online);
      },
      query: RestoreItemsQuery,
      update({ restoreItems }) {
        return restoreItems.map((i) => {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          delete i.__typename;
          return i;
        });
      },
    },
  },
  name: 'RestoreItemDialog',
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
  watch: {
    show() {
      this.$apollo.queries.restoreItems.refetch();
    },
  },
  computed: {
    empty() {
      return !this.items || this.items.length === 0;
    },
    attrs() {
      return ['id', 'name', 'code'].map(key => ({ type: 'value', key }));
    },
    items() {
      if (this.$store.state.online) {
        return this.restoreItems;
      }
      return this.$store.getters.itemsWithOfflineDeleted;
    },
  },
  methods: {
    restoreItem({ id }) {
      this.$mutate('restoreItem', {
        variables: { id },
      }).then(({ data: { restoreItem: { success } } }) => {
        if (success) {
          this.$emit('change', false);
          this.$emit('restored');
        } else if (window.gqlError) {
          window.gqlError({
            message: '復元失敗',
          });
        }
      }).catch((error) => {
        if (window.gqlError) window.gqlError(error);
      });
    },
  },
};
</script>

<style scoped lang="scss">

</style>
