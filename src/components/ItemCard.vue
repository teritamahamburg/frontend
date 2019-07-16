<template>
  <v-card max-width="350" class="item-card" ref="itemCard">
    <slot name="expand:head"/>
    <!-- <img :src="item.sealImage || `/seal/${item.internalId}${item.seal}`" width="350" alt="seal"
         v-if="showSealImg"/> -->
    <v-img :aspect-ratio="showSealImg ? 8/3 : undefined"
           :src="showSealImg ? (item.sealImage || `/seal/${item.code}${item.seal}`)
                             : undefined">
      <div class="card-title--wrapper" :class="{ image: showSealImg }" >
        <div style="height: 100%"
             @click="clickImage(item.sealImage || `/seal/${item.code}${item.seal}`)"></div>
        <v-card-title class="item-title" :class="{ image: showSealImg, dark: $store.state.dark }">
          <div class="attr">
            <div class="title">{{item.name}}</div>
            <div class="grey--text code">{{item.code}}</div>
          </div>

          <v-spacer/>
          <v-checkbox color="black" hide-details class="select-check" height="18"
                      :input-value="selectedItems.find(({ id }) => id === item.id)"
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
          <slot name="expand:title"/>
        </v-card-title>
      </div>
    </v-img>

    <template v-if="panel === 0">
      <div class="labels">
        <div class="disposed warning" v-if="showDisposed">{{$t('general.disposed')}}</div>
        <div class="depreciated error" v-if="showDepreciated">{{$t('general.depreciated')}}</div>
        <slot name="expand:labels"/>
      </div>

      <v-list ref="itemAttrList">
        <v-list-tile v-for="k in Object.keys(listEntry)" :key="k">
          <v-list-tile-title :style="{width:firstColumnWidth}">
            {{ $t(`item.${k}`) }}
          </v-list-tile-title>
          <v-list-tile-sub-title>{{listEntry[k]}}</v-list-tile-sub-title>
        </v-list-tile>

        <slot name="expand:list"/>
      </v-list>

      <v-card-actions
        v-if="!hideAction('child') && item.children && item.children.length > 0">
        <v-spacer />
        <v-btn outline small @click="incrementPanel">
          {{$t('general.children')}}
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
      </v-card-actions>
    </template>

    <template v-else-if="panel === 1">
      <v-card-text class="child-cards" :style="{ height: `${childrenHeight}px` }">
        <v-card v-for="child in item.children" :key="child.id">
          <v-card-title class="item-title">
            <span class="title">{{ child.name || item.name }}</span>
            <v-spacer/>
            <v-checkbox color="black" hide-details class="select-check" height="18"
                        :input-value="selectedItems.find(({ id }) => id === child.id)"
                        @change="v => $emit('select', v, child)" v-if="!hideAction('select')"/>
            <v-menu offset-y v-if="!hideAction('menu')">
              <template v-slot:activator="{ on }">
                <v-btn icon small style="margin: 0" v-on="on">
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile v-for="m in menuItems" :key="m[0]" @click="$emit(m[0], child)">
                  <v-list-tile-title>{{ m[1] }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-title>
          <v-list>
            <v-list-tile v-for="k in ['id', 'room', 'checkedAt']" :key="k">
              <v-list-tile-title>{{$t(`item.${k}`)}}</v-list-tile-title>
              <v-list-tile-sub-title>{{child[k]}}</v-list-tile-sub-title>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn outline small @click="decrementPanel">
          <v-icon left>keyboard_arrow_left</v-icon>
          {{ $t('general.close') }}
        </v-btn>
      </v-card-actions>
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
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      panel: 0,
      childrenHeight: 600,
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
        ['qrCode', this.$t('general.qrCode')],
        ['editHistory', this.$t('general.editHistory')],
        ['edit', this.$t('general.edit')],
      ];
    },
    showSealImg() {
      return (this.item.seal || this.item.sealImage) && this.panel === 0 && !this.hideAction('seal');
    },
  },
  methods: {
    incrementPanel() {
      let { marginBottom } = window.getComputedStyle(this.$refs.itemCard.$el);
      marginBottom = Number(marginBottom.substr(0, marginBottom.length - 2));
      this.childrenHeight = this.$refs.itemAttrList.$el.clientHeight + marginBottom;
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
    clickImage(image) {
      this.$store.state.dialogs.seal.image = image;
      this.$store.state.dialogs.seal.show = true;
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
    margin-bottom: auto;

    .card-title--wrapper.image {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .item-title {
      padding: 8px 16px 0;

      &.image {
        padding: 4px 4px;
        margin: 0 12px 8px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.8);

        &.dark {
          background-color: rgba(0, 0, 0, 0.8);
        }
      }

      .attr {
        .code {
          line-height: 1.2;
        }
      }
    }

    .select-check {
      margin: 0;
      padding: 0;
      flex: none;
    }

    .child-cards {
      overflow-y: auto;
      .v-card + .v-card {
        margin-top: 8px;
      }
    }
  }
</style>
