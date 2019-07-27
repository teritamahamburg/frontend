<template>
  <div class="items-view">
    <slot name="empty" v-if="empty">
      <div class="empty">
        <v-icon class="empty--icon" v-text="$vuetify.icons.values.custom.devices" />
        <div class="headline">{{$t('general.emptyAndAdd')}}</div>
      </div>
    </slot>
    <slot name="grid" v-else-if="viewType === 'grid'">
      <div class="item-card-grid">
        <item-card v-for="item in items" :key="item.id" :item="item"
                   :show-actions="showActions" :entry="showProps.map(p => p.value)"
                   :selected-items="selectedItems"
                   @select="(val, it) => {selectItem(it, val)}"
                   @remove="i => $emit('remove', i)"
                   @edit="i => $emit('edit', i)"
                   @editHistory="i => $emit('editHistory', i)"
                   @qrCode="i => $emit('qrCode', i)" />
      </div>
    </slot>
    <slot name="list" v-else>
      <ItemsList
        :attrs="attrs"
        :items="items"
        :selected-items="selectedItems"
        @seal="showSealDialog"
        @select:item="selectItem"
        @remove="i => $emit('remove', i)"
        @edit="i => $emit('edit', i)"
        @editHistory="i => $emit('editHistory', i)"
        @qrCode="i => $emit('qrCode', i)"/>
    </slot>
  </div>
</template>

<script>
import ItemCard from '@/components/ItemCard.vue';
import ItemsList from '@/components/ItemsList.vue';

export default {
  name: 'ItemsView',
  components: { ItemsList, ItemCard },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    viewType: {
      type: String,
      default: 'grid', // list
    },
    attrs: {
      type: Array,
      default: () => [],
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  /*
  event: [
    select(val, id, [ids])
    remove(item)
    edit(item)
    editHistory(item)
    qrCode(item)
  ]
  */
  data() {
    return {
      sealDialog: {
        show: false,
        item: {},
      },
    };
  },
  computed: {
    empty() {
      return !this.items || this.items.length === 0;
    },
    showActions() {
      return this.attrs
        .filter(({ type }) => type === 'action')
        .map(({ key }) => key);
    },
    showProps() {
      return this.attrs
        .filter(({ type }) => type === 'value')
        .map(({ key }) => ({
          text: key,
          value: key,
        }));
    },
  },
  methods: {
    selectItem(item, val) {
      const items = this.selectedItems.filter(({ id }) => id !== item.id);
      if (val) items.push(item);
      this.$emit('select', val, item, items);
    },
    showSealDialog(item) {
      this.$store.state.dialogs.seal.image = `seal/${item.code}${item.seal}`;
      this.$store.state.dialogs.seal.show = true;
    },
  },
};

export const viewTypes = [
  { type: 'list', icon: 'viewList' },
  { type: 'grid', icon: 'viewModule' },
];
</script>

<style scoped lang="scss">
  .items-view {
    padding: 8px 0;

    .empty {
      width: 100%;
      height: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .headline {
        word-break: keep-all;
        text-align: center;
      }

      .empty--icon {
        font-size: 60vw;

        @media screen and (min-width: 769px) {
          font-size: 30vw;
        }
      }
    }

    .item-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 350px);
      column-gap: 10px;
      row-gap: 10px;
      justify-content: center;
      align-items: start;
    }
  }
</style>
