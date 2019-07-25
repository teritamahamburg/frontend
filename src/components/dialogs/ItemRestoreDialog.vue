<template>
  <v-dialog max-width="300" :value="show" @input="val => $emit('change', val)">
    <v-card class="item-restore--dialog">
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
        <v-btn outlined @click="$emit('change', false)">
          {{ $t('general.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import RestoreItemsQuery from '@/apollo/queries/restoreItems.gql';
import RestoreChildrenQuery from '@/apollo/queries/restoreChildren.gql';
import ItemsView from '@/components/ItemsView.vue';

export default {
  components: { ItemsView },
  apollo: {
    restoreItems: {
      skip() {
        return !this.show || !this.$store.state.online;
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
    restoreChildren: {
      skip() {
        return !this.show || !this.$store.state.online;
      },
      query: RestoreChildrenQuery,
      update({ restoreChildren }) {
        return restoreChildren.map((i) => {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          delete i.__typename;
          return i;
        });
      },
    },
  },
  name: 'ItemRestoreDialog',
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
      if (val && this.$store.state.online) {
        this.$apollo.queries.restoreItems.refetch();
        this.$apollo.queries.restoreChildren.refetch();
      }
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
        return [...(this.restoreItems || []), ...(this.restoreChildren || [])];
      }
      return this.$store.getters.itemsWithOfflineDeleted;
    },
  },
  methods: {
    restoreItem({ id }) {
      if (!id.includes(',')) {
        this.$mutate('restoreItem', {
          variables: { id },
        }).then(({ data: { restoreItem: { success, message } } }) => {
          if (success) {
            this.$emit('change', false);
            this.$emit('restored');
          } else if (window.gqlError) {
            window.gqlError({ message });
          }
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      } else {
        this.$mutate('restoreChild', {
          variables: { childId: id },
        }).then(({ data: { restoreChild: { success, message } } }) => {
          if (success) {
            this.$emit('change', false);
            this.$emit('restored');
          } else if (window.gqlError) {
            window.gqlError({ message });
          }
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
