<template>
  <div class="home">
    <template v-if="!searchText">
      <items-view
        :items="items"
        :view-type="$store.state.itemsView.viewType"
        :attrs="$store.state.attrs"
        v-on="$store.getters.itemsViewMenuVOn"
        :selected-items="$store.state.dialogs.selectItems"
        @select="(v, i, l) => $store.commit('setSelectItems', l)"/>
    </template>

    <template v-else>
      <items-view :items="searchItems"
                  class="items-view"
                  :viewType="$store.state.itemsView.viewType"
                  :attrs="$store.state.attrs.filter(({ key }) => key !== 'select')"
                  v-on="$store.getters.itemsViewMenuVOn">
        <template v-slot:empty>
          <div
            style="text-align: center;margin-top: 20%"
            class="headline"
            v-if="searchChildren.length === 0"
          >
            {{$t('general.noSearchResult')}}
          </div>
          <div v-else></div>
        </template>
      </items-view>
      <items-view :items="searchChildren"
                  class="items-view"
                  :viewType="$store.state.itemsView.viewType"
                  :attrs="childAttr"
                  v-on="$store.getters.itemsViewMenuVOn">
        <template v-slot:empty><div></div></template>
      </items-view>
    </template>

    <v-btn fab fixed right
           class="no--print bottom"
           color="green"
           dark
           v-show="$store.state.dialogs.selectItems.length > 0"
           @click="$store.commit('showEditDialog')" aria-label="Edit">
      <v-icon v-text="$vuetify.icons.values.custom.edit" />
    </v-btn>
    <v-btn fab fixed right
           class="no--print bottom"
           @click="$broadcast.$emit('items:refetch')"
           v-show="$store.state.dialogs.selectItems.length === 0"
           v-if="$store.state.online"
           :color="$store.state.dark ? 'white black--text' : 'black white--text'"
           aria-label="Refresh">
      <v-icon v-text="$vuetify.icons.values.custom.refresh" />
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { debounce } from 'lodash-es';

import ItemsView, { viewTypes } from '@/components/ItemsView.vue';

import itemsQuery from '@/apollo/queries/items.gql';
import searchItemsQuery from '@/apollo/queries/searchItems.gql';

const searchDebounce = 1000;

export default {
  name: 'Home',
  components: {
    ItemsView,
  },
  apollo: {
    items: {
      skip() {
        return !this.$store.state.online || this.searchText;
      },
      query: itemsQuery,
      variables() {
        return {
          sort: [
            [this.$store.state.itemsView.sortType, this.$store.state.itemsView.sortOrder],
          ],
        };
      },
      manual: true,
      result({ data, loading }) {
        const update = ({ items }) => {
          if (!items || items.length === 0) return [];
          return items.map((item) => {
            const i = {
              ...item,
              admin: item.admin.name,
              course: item.course.name,
              room: item.room.number,
              children: item.children.map(child => ({
                ...child,
                room: child.room ? child.room.number : item.room.number,
              })),
            };
            // eslint-disable-next-line no-underscore-dangle
            delete i.__typename;
            return i;
          });
        };
        if (!loading) this.$store.commit('setApolloItems', update(data));
      },
    },
    search: {
      skip() {
        return !this.$store.state.online || !this.searchText;
      },
      debounce: searchDebounce,
      query: searchItemsQuery,
      variables() {
        return {
          text: this.searchText,
          sort: [
            [this.$store.state.itemsView.sortType, this.$store.state.itemsView.sortOrder],
          ],
        };
      },
      update({ searchItems: items, searchChildren: children }) {
        return {
          items: items.map(item => ({
            ...item,
            admin: item.admin.name,
            course: item.course.name,
            room: item.room.number,
          })),
          children: children.map(child => ({
            ...child,
            room: child.room ? child.room.number : null,
            name: child.name ? child.name : child.item.name,
          })),
        };
      },
    },
  },
  data() {
    return {
      search: {
        items: [],
        children: [],
        offlineItems: [],
      },
    };
  },
  created() {
    this.$broadcast.$on('items:refetch', () => {
      if (this.$store.state.online && this.$apollo.queries.items) {
        this.$apollo.queries.items.refetch();
      }
    });
    this.$broadcast.$on('items:removed', () => {
      this.$store.commit('setSelectItems', []);
      if (this.$store.state.online) this.$apollo.queries.items.refetch();
    });
    this.$broadcast.$on('items:edited', () => {
      this.$store.commit('setSelectItems', []);
      if (this.$store.state.online) this.$apollo.queries.items.refetch();
    });
  },
  mounted() {
    const { hash } = window.location;
    if (hash.length === 0 || viewTypes.findIndex(v => v.type === hash.substring(1)) === -1) {
      window.location.hash = `#${this.$store.state.itemsView.viewType}`;
    } else {
      this.$store.commit('setViewType', hash.substring(1));
    }
    this.$broadcast.$emit('items:refetch');
  },
  watch: {
    // eslint-disable-next-line func-names
    '$store.state.itemsView.viewType': function (val) {
      window.location.hash = `#${val}`;
    },
    searchText() {
      if (!this.$store.state.online) this.computeSearchOfflineItems();
    },
  },
  computed: {
    ...mapState(['searchText']),
    items() {
      if (this.$store.state.online) {
        return this.$store.state.apollo.items;
      }
      const items = [...this.$store.getters.itemsWithOffline];
      const { itemsView } = this.$store.state;
      items.sort((a, b) => {
        let val = 0;
        const { sortType, sortOrder } = itemsView;
        switch (sortType) {
          default:
            val = a.id - b.id;
            break;
          // numbers
          case 'id':
          case 'amount':
            val = a[sortType] - b[sortType];
            break;
          // dates
          case 'purchasedAt':
          case 'checkedAt':
          case 'disposalAt':
          case 'depreciationAt':
            val = (a[sortType] ? Date.parse(a[sortType]) : 0)
                      - (b[sortType] ? Date.parse(b[sortType]) : 0);
            break;
        }
        if (sortOrder.toLowerCase() !== 'asc') val *= -1;
        return val;
      });
      return items;
    },
    searchItems() {
      if (this.$store.state.online) return this.search.items;
      return this.search.offlineItems;
    },
    searchChildren() {
      if (this.$store.state.online) return this.search.children;
      return [];
    },
    childAttr() {
      return this.$store.state.attrs.filter(({ type, key }) => {
        if (type === 'action' && key !== 'select') return true;
        return ['id', 'name', 'room', 'checkedAt'].includes(key);
      });
    },
  },
  methods: {
    computeSearchOfflineItems: debounce(() => {
      const text = this.text.toLowerCase();
      this.search.offlineItems = this.$store.getters.itemsWithOfflineParanoid
        .filter(item => ['name', 'code', 'admin', 'course', 'room']
          .some((k) => {
            if (!item[k]) return false;
            return item[k].toString().toLowerCase().includes(text);
          }));
    }, searchDebounce),
  },
};
</script>

<style scoped lang="scss">
  .home {
    width: 100%;
    height: 100%;
  }

  //noinspection CssInvalidFunction
  .v-btn.v-btn--fab.bottom {
    bottom: calc(64px + env(safe-area-inset-bottom));
  }
</style>
