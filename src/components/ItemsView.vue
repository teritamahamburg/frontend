<template>
  <div class="items-view">
    <slot name="empty" v-if="empty">
      <div class="empty">
        <v-icon :size="emptyIconSize">devices</v-icon>
        <div class="headline">{{$t('general.emptyAndAdd')}}</div>
      </div>
    </slot>
    <slot name="grid" v-else-if="viewType === 'grid'">
      <div class="item-card-grid">
        <item-card v-for="item in items" :key="item.id" :item="item"
          :show-actions="showActions" :entry="showProps.map(p => p.value)"
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
          <tr @click="$emit('click:row', item)">
            <template v-for="(a) in listAttrs">
              <td v-if="a.type === 'value'" :key="a.key">
                {{ item[a.key] }}
              </td>
              <template v-else>
                <td v-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
                  <v-checkbox hide-details color="error" @change="v => selectItem(item.id, v)"/>
                </td>
                <td v-else :key="a.key">
                  <v-btn icon v-if="a.key !== 'seal' || item.seal"
                         @click="a.key === 'seal' ? showSealDialog(item) : $emit(a.key, item)">
                    <v-icon v-text="$vuetify.icons[a.key]" />
                  </v-btn>
                </td>
              </template>
            </template>
          </tr>
        </template>
      </v-data-table>
    </slot>

    <v-dialog v-model="sealDialog.show" max-width="600">
      <v-card v-if="sealDialog.show">
        <v-img :src="`seal/${sealDialog.item.internalId}${sealDialog.item.seal}`" />
      </v-card>
    </v-dialog>
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
    viewType: {
      type: String,
      default: 'grid', // sort
    },
    attrs: {
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
      selectedItems: [],
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
    emptyIconSize() {
      return Math.min(
        this.$vuetify.breakpoint.width / 2,
        this.$vuetify.breakpoint.height / 3,
      );
    },
    listAttrs() {
      return this.attrs.filter(({ type, key }) => !(type === 'action' && key === 'part'));
    },
    tableHeaderWithCheck() {
      return this.listAttrs.map(({ type, key }) => ({
        text: type === 'value' ? key : undefined,
        value: key,
        sortable: type === 'value',
      }));
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
    selectItem(id, val) {
      this.selectedItems = this.selectedItems
        .filter(i => i !== id);
      if (val) {
        this.selectedItems.push(id);
      }
      this.$emit('select', val, id, this.selectedItems);
    },
    showSealDialog(item) {
      this.sealDialog.item = item;
      this.sealDialog.show = true;
    },
  },
};

export const viewTypes = [
  { type: 'list', icon: 'view_list' },
  { type: 'grid', icon: 'view_module' },
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
