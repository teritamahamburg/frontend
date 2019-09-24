<template>
  <v-data-table fixed-header hide-default-footer :items-per-page="-1"
                class="items-view--list"
                :height="listHeight" ref="list"
                :headers="tableHeaderWithCheck" :items="items">
    <template v-slot:item="props">
      <tr @click="() => {$emit('click:row', props.item); props.expand(!props.isExpanded)}">
        <template v-for="(a) in listAttrs">
          <td v-if="a.type === 'value'" :key="a.key" class="value--column">
            {{ props.item[a.key] }}
          </td>
          <td v-else-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
            <v-checkbox hide-details color="black" @click.capture.stop class="item-row-checkbox"
                        :input-value="selectedItems.find(({ id }) => id === props.item.id)"
                        @change="v => $emit('select:item', props.item, v)"/>
          </td>
          <td v-else :key="a.key" class="action--column">
            <v-btn icon small v-if="a.key !== 'seal' || props.item.seal"
                   @click.capture.stop="$emit(a.key, props.item)" :aria-label="a.key">
              <v-icon v-text="$vuetify.icons.values.custom[a.key]"/>
            </v-btn>
          </td>
        </template>
      </tr>
    </template>
    <template v-slot:expanded-item="props">
      <td v-if="props.item.children.length > 0" :colspan="props.headers.length">
        <v-card class="elevation-1">
          <v-data-table hide-default-footer class="child-table" :fixed-header="false"
                        :items="props.item.children" :headers="childTableHeaderWithCheck">
            <template v-slot:item="{ item: child }">
              <tr @click="() => {$emit('click:row', child);}">
                <template v-for="(a) in childListAttrs">
                  <td v-if="a.type === 'value'" :key="a.key" class="value--column">
                    {{ child[a.key] }}
                  </td>
                  <td v-else-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
                    <v-checkbox hide-details color="black" class="item-row-checkbox"
                                :input-value="selectedItems.find(({ id }) => id === child.id)"
                                @change="v => $emit('select:item', child, v)"/>
                  </td>
                  <td v-else :key="a.key" class="action--column">
                    <v-btn icon v-if="a.key !== 'seal'"
                           @click="$emit(a.key, child)" :aria-label="a.key">
                      <v-icon v-text="$vuetify.icons.values.custom[a.key]"/>
                    </v-btn>
                  </td>
                </template>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </td>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'ItemsList',
  props: {
    attrs: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      listHeight: '100%',
    };
  },
  computed: {
    listAttrs() {
      return this.attrs.filter(({ type, key }) => !(type === 'action' && key === 'child'));
    },
    childListAttrs() {
      return this.listAttrs.filter(({ type, key }) => type === 'action'
        || ['id', 'name', 'room', 'checkedAt', 'createdAt', 'deletedAt'].includes(key));
    },
    tableHeaderWithCheck() {
      return this.listAttrs.map(({ type, key }) => ({
        text: type === 'value' ? this.$t(`item.${key}`) : undefined,
        value: key,
        sortable: type === 'value',
        class: `${type}--column`,
      }));
    },
    childTableHeaderWithCheck() {
      return this.childListAttrs.map(({ type, key }) => ({
        text: type === 'value' ? this.$t(`item.${key}`) : undefined,
        value: key,
        sortable: type === 'value',
      }));
    },
  },
  watch: {
    // eslint-disable-next-line
    '$vuetify.breakpoint.height': function (val) {
      this.calcListHeight(val);
    },
  },
  mounted() {
    this.calcListHeight(this.$vuetify.breakpoint.height);
  },
  methods: {
    calcListHeight(val) {
      if (this.$refs.list.$el.getBoundingClientRect) {
        const { top } = this.$refs.list.$el.getBoundingClientRect();
        this.listHeight = val - (top > 50 ? top : top * 2) - 16;
      }
    },
  },
};
</script>

<style lang="scss">
  .items-view--list {
    .v-table__overflow {
      .v-table {
        max-width: none;
      }
    }
  }
</style>

<style scoped lang="scss">
  .action--column {
    padding: 0;
    width: 32px;
    max-width: 32px;
    box-sizing: border-box;
  }

  [class$="--column"] {
    white-space: nowrap;
  }

  .item-row-checkbox {
    margin: 0;
  }
</style>
