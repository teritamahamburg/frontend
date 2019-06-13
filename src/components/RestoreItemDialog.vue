<template>
  <v-dialog max-width="300" :value="show" @input="v => $emit('change', val)">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('general.restoreItem') }}</span>
      </v-card-title>
      <items-view view-type="list" hide-actions :show-props="showProps" :items="restoreItems"
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
import RestoreItemsQuery from '@/queries/restoreItems.gql';
import RestoreItemMutation from '@/mutations/restoreItem.gql';
import ItemsView from '@/components/ItemsView.vue';

export default {
  components: { ItemsView },
  apollo: {
    restoreItems: {
      skip: true,
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
    show(val) {
      this.$apollo.queries.restoreItems.skip = !val;
      if (val) this.$apollo.queries.restoreItems.refetch();
    },
  },
  computed: {
    empty() {
      return !this.restoreItems || this.restoreItems.length === 0;
    },
    showProps() {
      if (this.empty) return [];
      return Object.keys(this.restoreItems[0])
        .map(k => ({ text: k, value: k }));
    },
  },
  methods: {
    restoreItem({ id }) {
      this.$apollo.mutate({
        mutation: RestoreItemMutation,
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
