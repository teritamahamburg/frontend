<template>
  <v-card max-width="350" class="item-card">
    <v-card-title class="item-title">
      <span class="title">{{item.name}}</span>
      <span class="grey--text" style="margin-left: 16px">{{item.code}}</span>
      <v-spacer />
      <v-checkbox color="error" hide-details class="select-check" height="18"
        @change="v => $emit('select', v)" v-if="!hideActions"/>
      <v-menu offset-y v-if="!hideActions">
        <template v-slot:activator="{ on }">
          <v-btn icon small style="margin: 0" v-on="on">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile v-for="m in menuItems" :key="m[0]" @click="$emit(m[0], item.id)">
            <v-list-tile-title>{{ m[1] }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-card-title>

    <div class="labels">
      <div class="disposed warning" v-if="showDisposed">{{$t('general.disposed')}}</div>
      <div class="depreciated error" v-if="showDepreciated">{{$t('general.depreciated')}}</div>
      <slot name="expand:labels" />
    </div>

    <v-list>
      <v-list-tile v-for="k in Object.keys(listEntry)" :key="k">
        <v-list-tile-title :style="{width:firstColumnWidth}">
          {{ $t(`item.${k}`) }}
        </v-list-tile-title>
        <v-list-tile-sub-title>{{listEntry[k]}}</v-list-tile-sub-title>
      </v-list-tile>
      <slot name="expand:list" />
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: 'ItemCard',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    hideActions: {
      type: Boolean,
      default: false,
    },
    entry: {
      type: Array,
      default: () => [],
    },
    firstColumnWidth: {
      type: [String, Number],
      default: undefined,
    },
  },
  /*
  event:[
   select
   remove
  ]
 */
  computed: {
    listEntry() {
      let item = {};
      if (this.entry.length > 0) {
        this.entry.forEach((k) => {
          item[k] = this.item[k];
        });
      } else {
        item = { ...this.item };
      }
      delete item.name;
      delete item.code;
      return item;
    },
    showDisposed() {
      return !(!this.item.disposalAt || new Date(this.item.disposalAt) >= Date.now());
    },
    showDepreciated() {
      return !(!this.item.depreciationAt || new Date(this.item.depreciationAt) >= Date.now());
    },
    menuItems() {
      return [
        ['qrCode', this.$t('general.qrCode')],
        ['editHistory', this.$t('general.editHistory')],
        ['edit', this.$t('general.edit')],
        ['remove', this.$t('general.remove')],
      ];
    },
  },
};
</script>

<style lang="scss">
.item-card {
  .labels {
    position: absolute;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    div {
      margin: 4px;
      padding: 5px;
      color: white;
      border-radius: 8px;
    }
  }
}
</style>

<style scoped lang="scss">
.item-card {
  .item-title {
    padding: 16px 16px 0;
  }

  .select-check {
    margin: 0;
    padding: 0;
    flex: none;
  }
}
</style>
