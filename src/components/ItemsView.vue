<template>
  <div class="items-view">
    <slot name="empty" v-if="!items || items.length === 0">
      <div class="empty">
        <v-icon :size="emptyIconSize">devices</v-icon>
        <div class="headline">{{$t('general.emptyAndAdd')}}</div>
      </div>
    </slot>
    <slot name="grid" v-else-if="viewType === 'grid'">
      <div class="item-card-grid">
        <item-card v-for="item in items" :key="item.id" :item="item"
          :hide-actions="hideActions" :entry="showProps.map(p => p.value)"
          @select="(val, { id }) => {selectItem(id, val)}"
          @remove="i => $emit('remove', i)"
          @edit="i => $emit('edit', i)"
          @editHistory="i => $emit('editHistory', i)"
          @qrCode="i => $emit('qrCode', i)"
          @addPart="i => $emit('addPart', i)"/>
      </div>
    </slot>
    <slot name="list" v-else>
      <v-data-table hide-actions :headers="tableHeaderWithCheck" :items="items">
        <template v-slot:items="{ item }">
          <td style="padding: 0 0 0 16px">
            <v-checkbox hide-details color="error" v-if="!hideActions"
                        @change="v => selectItem(item.id, v)"/>
          </td>
          <td v-for="{ value } in showProps" :key="value">
            {{ item[value] }}
          </td>
          <td v-if="!hideActions">
            <v-btn icon @click="$emit('edit', item)">
              <v-icon>edit</v-icon>
            </v-btn>
          </td>
          <td v-if="!hideActions">
            <v-btn icon @click="$emit('editHistory', item)">
              <v-icon>history</v-icon>
            </v-btn>
          </td>
          <td v-if="!hideActions">
            <v-btn icon @click="$emit('qrCode', item)">
              <v-icon>nfc</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </slot>
  </div>
</template>

<script>
import ItemCard from '@/components/ItemCard.vue';

export default {
  name: 'ItemsView',
  components: { ItemCard },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    showProps: {
      type: Array,
      default: () => [],
    },
    viewType: {
      type: String,
      default: 'grid', // sort
    },
    /**
     * hideActionsはviewTypeがgridの場合のみ詳細(Array)に設定可能
    */
    hideActions: {
      type: [Boolean, Array],
      default: false,
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
      selectedItems: [],
    };
  },
  computed: {
    emptyIconSize() {
      return Math.min(
        this.$vuetify.breakpoint.width / 2,
        this.$vuetify.breakpoint.height / 3,
      );
    },
    tableHeaderWithCheck() {
      if (this.hideActions) return this.showProps;
      return [
        {
          value: 'select',
          sortable: false,
        },
        ...this.showProps,
        {
          value: 'edit',
          sortable: false,
        },
        {
          value: 'history',
          sortable: false,
        },
        {
          value: 'qrcode',
          sortable: false,
        },
      ];
    },
  },
  methods: {
    selectItem(id, val) {
      this.selectedItems = this.selectedItems
        .filter(i => i !== id);
      if (val) {
        this.selectedItems.push(id);
      }
      this.$emit('select', val, id, this.selectedItems);
    },
  },
};

export const viewTypes = [
  { type: 'list', icon: 'view_list' },
  { type: 'grid', icon: 'view_comfy' },
];
</script>

<style scoped lang="scss">
  .items-view {
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
