<template>
  <v-dialog :value="show" persistent max-width="250">
    <v-card class="remove--dialog">
      <v-card-title class="headline" style="flex-direction:column;align-items:flex-start;">
        <div v-show="itemList.length !== 0">
          {{ $t('general.removeText.items', {n: itemList.length}) }}
        </div>
        <div v-show="childList.length !== 0">
          {{ $t('general.removeText.children', {n: childList.length}) }}
        </div>
        <div>{{ $t('general.removeText.confirm') }}</div>
      </v-card-title>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="clickCancel">
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
    items: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    itemList() {
      return this.items.filter(item => !item.id.includes(','));
    },
    childList() {
      return this.items.filter(item => item.id.includes(','));
    },
  },
  methods: {
    closeDialog() {
      this.$emit('change', false);
    },
    clickCancel() {
      this.$emit('click:cancel');
      this.closeDialog();
    },
    clickRemoveInDialog() {
      if (this.itemList.length > 0) {
        this.$mutate('removeItems', {
          variables: {
            ids: [...this.itemList.map(({ id }) => id)],
          },
        }).then(({ data: { removeItems: { success } } }) => {
          if (success) {
            this.$emit('removed');
            this.closeDialog();
          } else if (window.gqlError) {
            window.gqlError({
              message: '削除失敗',
            });
          }
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }
      if (this.childList.length > 0) {
        this.$mutate('removeChildren', {
          variables: {
            childIds: [...this.childList.map(({ id }) => id)],
          },
        }).then(({ data: { removeChildren: { success } } }) => {
          if (success) {
            this.$emit('removed');
            this.closeDialog();
          } else if (window.gqlError) {
            window.gqlError({
              message: '削除失敗',
            });
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
  .remove-dialog {
    .headline {
      word-break: keep-all;
    }
  }
</style>
