<template>
  <v-card max-width="350" class="item-card">
    <slot name="expand:head" />
    <img :src="item.sealImage || `/seal/${item.internalId}${item.seal}`" width="350" alt="seal"
         v-if="showSealImg"/>

    <v-card-title class="item-title">
      <div class="attr">
        <div class="title">{{item.name}}</div>
        <div class="grey--text code">{{item.code}}</div>
      </div>

      <v-spacer/>
      <v-checkbox color="error" hide-details class="select-check" height="18"
                  @change="v => $emit('select', v, item)" v-if="!hideAction('select')"/>
      <v-menu offset-y v-if="!hideAction('menu')">
        <template v-slot:activator="{ on }">
          <v-btn icon small style="margin: 0" v-on="on">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <template v-for="m in menuItems">
            <v-list-tile :key="m[0]" v-if="!hideAction(m[0])"
                         @click="$emit(m[0], item)">
              <v-list-tile-title>{{ m[1] }}</v-list-tile-title>
            </v-list-tile>
          </template>
        </v-list>
      </v-menu>
      <slot name="expand:title" />
    </v-card-title>

    <template v-if="panel === 0">
      <div class="labels">
        <div class="disposed warning" v-if="showDisposed">{{$t('general.disposed')}}</div>
        <div class="depreciated error" v-if="showDepreciated">{{$t('general.depreciated')}}</div>
        <slot name="expand:labels"/>
      </div>

      <v-list>
        <v-list-tile v-for="k in Object.keys(listEntry)" :key="k">
          <v-list-tile-title :style="{width:firstColumnWidth}">
            {{ $t(`item.${k}`) }}
          </v-list-tile-title>
          <v-list-tile-sub-title>{{listEntry[k]}}</v-list-tile-sub-title>
        </v-list-tile>
        <v-btn outline small class="parts-btn"
               v-if="!hideAction('part') && item.parts && item.parts.length > 0"
               @click="incrementPanel">
          {{$t('general.parts')}}
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
        <slot name="expand:list"/>
      </v-list>
    </template>

    <template v-else-if="panel === 1">
      <v-card-text class="part-cards">
        <v-card v-for="part in item.parts" :key="part.id">
          <v-card-title class="item-title">
            <span class="title">{{ part.name }}</span>
            <v-spacer/>
            <v-checkbox color="error" hide-details class="select-check" height="18"
                        @change="v => $emit('select', v, part)" v-if="!hideAction('select')"/>
            <v-menu offset-y v-if="!hideAction('menu')">
              <template v-slot:activator="{ on }">
                <v-btn icon small style="margin: 0" v-on="on">
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile v-for="m in menuItems.slice(1)" :key="m[0]" @click="$emit(m[0], part)">
                  <v-list-tile-title>{{ m[1] }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-title>
          <v-list>
            <v-list-tile v-for="k in ['editUser', 'room', 'checkedAt']" :key="k">
              <v-list-tile-title>{{$t(`item.${k}`)}}</v-list-tile-title>
              <v-list-tile-sub-title>{{part[k]}}</v-list-tile-sub-title>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-card-text>

      <v-btn outline small class="parts-btn" @click="decrementPanel">
        <v-icon left>keyboard_arrow_left</v-icon>
        {{ $t('general.close') }}
      </v-btn>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'ItemCard',
  /*
  event:[
    select(val, { id })
    remove
  ]
  */
  props: {
    item: {
      type: Object,
      default: () => {
      },
    },
    showActions: {
      type: [Boolean, Array],
      default: true,
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
  data() {
    return {
      panel: 0,
    };
  },
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
        ['addPart', this.$t('general.addPart')],
        ['qrCode', this.$t('general.qrCode')],
        ['editHistory', this.$t('general.editHistory')],
        ['edit', this.$t('general.edit')],
        ['remove', this.$t('general.remove')],
      ];
    },
    showSealImg() {
      return (this.item.seal || this.item.sealImage) && this.panel === 0 && !this.hideAction('seal');
    },
  },
  methods: {
    incrementPanel() {
      this.panel = this.panel + 1;
    },
    decrementPanel() {
      this.panel = this.panel - 1;
    },
    hideAction(name) {
      if (typeof this.showActions === 'boolean') return !this.showActions;
      if (name === 'menu') return false;
      return !this.showActions.includes(name);
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
      padding: 8px 16px 0;

      .attr .code {
        line-height: 1.2;
      }
    }

    .select-check {
      margin: 0;
      padding: 0;
      flex: none;
    }

    .parts-btn {
      position: absolute;
      bottom: 0;
      right: 0;
    }

    .part-cards {
      overflow-y: auto;
      height: 600px; // TODO: hard coding
      .v-card + .v-card {
        margin-top: 8px;
      }
    }
  }
</style>
