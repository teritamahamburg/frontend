<template>
  <v-data-table fixed-header hide-default-footer class="items-view--list"
                :headers="tableHeaderWithCheck" :items="items">
    <template v-slot:item="props">
      <tr @click="() => {$emit('click:row', props.item); props.expand(!props.isExpanded)}">
        <template v-for="(a) in listAttrs">
          <td v-if="a.type === 'value'" :key="a.key" class="value--column">
            {{ props.item[a.key] }}
          </td>
          <td v-else-if="a.key === 'select'" :key="a.key" style="padding: 0 0 0 16px">
            <v-checkbox hide-details color="error" @click.capture.stop
                        :input-value="selectedItems.find(({ id }) => id === props.item.id)"
                        @change="v => $emit('select:item', props.item, v)"/>
          </td>
          <td v-else :key="a.key" class="action--column">
            <v-btn icon small v-if="a.key !== 'seal' || props.item.seal"
                   @click.capture.stop="$emit(a.key, props.item)">
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
                    <v-checkbox hide-details color="error"
                                :input-value="selectedItems.find(({ id }) => id === child.id)"
                                @change="v => $emit('select:item', child, v)"/>
                  </td>
                  <td v-else :key="a.key" class="action--column">
                    <v-btn icon v-if="a.key !== 'seal'"
                           @click="$emit(a.key, child)">
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
</style>
