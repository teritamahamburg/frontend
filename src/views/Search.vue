<template>
  <div class="search">
    <v-layout class="empty--no_text" v-if="!text">
      <div class="headline">{{$t('general.searchHere')}}</div>
      <v-icon class="arrow-icon" :size="36" v-text="$vuetify.icons.values.custom.searchArrow" />
    </v-layout>
    <v-layout class="empty" v-else-if="!items || items.length === 0
                                        || !children || children.length === 0">
      <div class="headline">{{$t('general.noSearchResult')}}</div>
    </v-layout>
    <template v-else>
      <div class="control">
        <v-spacer />
        <v-btn-toggle :value="viewType" @change="v => { viewType = v }" mandatory>
          <v-btn text v-for="type in viewTypes" :key="type.type" :value="type.type">
            <v-icon left v-text="$vuetify.icons.values.custom[type.icon]" />
            {{ type.type }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <items-view :items="items" class="items-view" :viewType="viewType"
                  :attrs="$store.state.attrs.filter(({ key }) => key !== 'select')"
                  v-on="$store.getters.itemsViewMenuVOn"/>
      <items-view :items="children" class="items-view" :viewType="viewType"
                  :attrs="childAttr" v-on="$store.getters.itemsViewMenuVOn"/>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { throttle } from 'lodash-es';

import searchItemsQuery from '@/apollo/queries/searchItems.gql';
import ItemsView, { viewTypes } from '@/components/ItemsView.vue';

const throttleWait = 1000;
export default {
  name: 'Search',
  components: { ItemsView },
  apollo: {
    list: {
      skip() {
        return !this.$store.state.online;
      },
      throttle: throttleWait,
      query: searchItemsQuery,
      variables() {
        return {
          text: this.text,
        };
      },
      update({ searchItems: items, searchChildren: children }) {
        return {
          /* eslint-disable no-param-reassign */
          items: items.map((item) => {
            item.admin = item.admin.name;
            item.course = item.course.name;
            item.room = item.room.number;
            return item;
          }),
          children: children.map((child) => {
            if (child.room) child.room = child.room.number;
            if (!child.name) child.name = child.item.name;
            return child;
          }),
        };
      },
    },
  },
  data() {
    return {
      viewType: viewTypes[0].type,
      offlineItems: [],
      list: {
        items: [],
        children: [],
      },
    };
  },
  computed: {
    viewTypes: () => viewTypes,
    ...mapState({
      text: 'searchText',
    }),
    items() {
      if (this.$store.state.online) return this.list.items;
      return this.offlineItems;
    },
    children() {
      if (this.$store.state.online) return this.list.children;
      return [];
    },
    childAttr() {
      return this.$store.state.attrs.filter(({ type, key }) => {
        if (type === 'action' && key !== 'select') return true;
        return ['id', 'name', 'room', 'checkedAt'].includes(key);
      });
    },
  },
  watch: {
    text() {
      if (!this.$store.state.online) this.computeOfflineItems();
    },
  },
  methods: {
    // eslint-disable-next-line func-names
    computeOfflineItems: throttle(function () {
      const text = this.text.toLowerCase();
      this.offlineItems = this.$store.getters.itemsWithOfflineParanoid
        .filter(item => ['name', 'code', 'admin', 'course', 'room']
          .some((k) => {
            if (!item[k]) return false;
            return item[k].toString().toLowerCase().includes(text);
          }));
    }, throttleWait),
  },
};
</script>

<style scoped lang="scss">
  .search {
    width: 100%;
    height: 100%;

    .empty {
      height: 100%;
      justify-content: center;
      align-items: center;
    }

    .empty--no_text {
      justify-content: flex-end;
      align-items: center;

      .headline {
        margin-top: 16px;
      }

      .arrow-icon {
        transform: rotate(-90deg);
        margin-right: 96px;
      }
    }

    .items-view {
      padding: 16px 0;
    }

    .control {
      display: flex;
      margin: 8px 8px 0 0;
    }
  }
</style>
