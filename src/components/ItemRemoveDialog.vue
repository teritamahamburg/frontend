<template>
  <v-dialog :value="show" persistent max-width="250">
    <v-card class="remove-dialog">
      <v-card-title class="headline">
        {{ $t('general.removeConfirmText', {n:ids.length}) }}
      </v-card-title>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="cancel">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickRemoveInDialog">
          {{ $t('general.remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import removeItemsMutation from '@/mutations/removeItems.gql';

export default {
  name: 'ItemRemoveDialog',
  model: {
    prop: 'show',
    event: 'change',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    ids: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    cancel() {
      this.$emit('change', false);
      this.$emit('click:cancel');
    },
    clickRemoveInDialog() {
      this.$apollo.mutate({
        mutation: removeItemsMutation,
        variables: {
          ids: [...this.ids],
        },
      }).then(({ data: { removeItems: { success } } }) => {
        if (success) {
          this.$emit('change', false);
          this.$emit('removed');
        } else if (window.gqlError) {
          window.gqlError({
            message: '削除失敗',
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
  .remove-dialog {
    .headline {
      word-break: keep-all;
    }
  }
</style>
