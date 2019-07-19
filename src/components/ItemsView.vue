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
                   :selected-items="selectedItems"
                   @select="(val, item) => {selectItem(item, val)}"
                   @remove="i => $emit('remove', i)"
                   @edit="i => $emit('edit', i)"
                   @editHistory="i => $emit('editHistory', i)"
                   @qrCode="i => $emit('qrCode', i)" />
      </div>
    </slot>
    <slot name="list" v-else>
      <v-data-table hide-actions expand class="items-view--list"
                    :headers="tableHeaderWithCheck" :items="items">
        <template v-slot:items="props">
          <tr @click="() => {$emit('click:row', props.item); props.expanded = !props.expanded}">
            <template v-for="(a) in listAttrs">
              <td v-if="a.type === 'value'" :key="a.key" class="value--column">
                {{ props.item[a.key] }}
              </td>
              <td v-else-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
                <v-checkbox hide-details color="error" @click.capture.stop
                            :input-value="selectedItems.find(({ id }) => id === props.item.id)"
                            @change="v => selectItem(props.item, v)"/>
              </td>
              <td v-else :key="a.key" class="action--column">
                <v-btn icon v-if="a.key !== 'seal' || props.item.seal || props.item.sealImage"
                       @click="a.key === 'seal' ? showSealDialog(props.item)
                                             : $emit(a.key, props.item)">
                  <v-icon v-text="$vuetify.icons[a.key]"/>
                </v-btn>
              </td>
            </template>
          </tr>
        </template>
        <template v-slot:expand="props">
          <template v-if="props.item.children.length > 0">
            <v-card class="elevation-1">
              <v-data-table hide-actions class="child-table"
                            :items="props.item.children" :headers="childTableHeaderWithCheck">
                <template v-slot:items="{ item: child }">
                  <tr @click="() => {$emit('click:row', child);}">
                    <template v-for="(a) in childListAttrs">
                      <td v-if="a.type === 'value'" :key="a.key" class="value--column">
                        {{ child[a.key] }}
                      </td>
                      <td v-else-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
                        <v-checkbox hide-details color="error"
                                    :input-value="selectedItems.find(({ id }) => id === child.id)"
                                    @change="v => selectItem(child, v)"/>
                      </td>
                      <td v-else :key="a.key" class="action--column">
                        <v-btn icon v-if="a.key !== 'seal' || child.seal || child.sealImage"
                               @click="a.key === 'seal' ? showSealDialog(child)
                                             : $emit(a.key, child)">
                          <v-icon v-text="$vuetify.icons[a.key]"/>
                        </v-btn>
                      </td>
                    </template>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </template>
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
    emptyIconSize() {
      return Math.min(
        this.$vuetify.breakpoint.width / 2,
        this.$vuetify.breakpoint.height / 3,
      );
    },
    listAttrs() {
      return this.attrs.filter(({ type, key }) => !(type === 'action' && key === 'child'));
    },
    childListAttrs() {
      return this.listAttrs.filter(({ type, key }) => type === 'action'
        || ['id', 'name', 'room', 'checkedAt', 'createdAt', 'deletedAt'].includes(key));
    },
    tableHeaderWithCheck() {
      return this.listAttrs.map(({ type, key }) => ({
        text: type === 'value' ? key : undefined,
        value: key,
        sortable: type === 'value',
        class: `${type}--column`,
      }));
    },
    childTableHeaderWithCheck() {
      return this.childListAttrs.map(({ type, key }) => ({
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
    a: console.info,
    selectItem(item, val) {
      const items = this.selectedItems.filter(({ id }) => id !== item.id);
      if (val) items.push(item);
      this.$emit('select', val, item, items);
    },
    showSealDialog(item) {
      this.$store.state.dialogs.seal.image = item.sealImage
        || `seal/${item.code}${item.seal}`;
      this.$store.state.dialogs.seal.show = true;
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
    }

    .item-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 350px);
      column-gap: 10px;
      row-gap: 10px;
      justify-content: center;
      align-items: start;
    }

    .action--column {
      padding: 0;
      width: 32px;
      max-width: 32px;
      box-sizing: border-box;
    }

    [class$="--column"] {
      white-space: nowrap;
    }

    .child-table {
      margin-left: 48px;
    }
  }
</style>

<style lang="scss">
  .items-view--list {
    .v-table__overflow {
      .v-table {
        max-width: none;
      }
    }
  }
</style>
