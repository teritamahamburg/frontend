<template>
  <div class="home">
    <items-view
        :items="items" :view-type="$store.state.itemsView.viewType"
        :attrs="$store.state.attrs"
        v-on="$store.getters.itemsViewMenuVOn"
        :selected-items="$store.state.dialogs.selectItems"
        @select="(v, i, l) => $store.commit('setSelectItems', l)"/>

    <v-btn fab fixed right bottom
           color="green" dark class="no--print"
           v-show="$store.state.dialogs.selectItems.length > 0"
           @click="$store.commit('showEditDialog')">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-btn fab fixed right bottom @click="$broadcast.$emit('items:refetch')"
           v-show="$store.state.dialogs.selectItems.length === 0"
           v-if="$store.state.online"
           :color="$store.state.dark ? 'white black--text' : 'black white--text'"
           class="no--print">
      <v-icon>refresh</v-icon>
    </v-btn>
  </div>
</template>

<script>
import itemsQuery from '@/apollo/queries/items.gql';

import ItemsView, { viewTypes } from '@/components/ItemsView.vue';

export default {
  name: 'Home',
  components: {
    ItemsView,
  },
  apollo: {
    items: {
      skip() {
        return !this.$store.state.online;
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
  },
  computed: {
    items() {
      if (this.$store.state.online) {
        return this.$store.state.apollo.items;
      }
      const items = [...this.$store.getters.itemsWithOffline];
      items.sort((a, b) => {
        let val = 0;
        const { sortType, sortOrder } = this.$store.state.itemsView;
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
  },
};
</script>

<style scoped lang="scss">
  //noinspection CssInvalidFunction, CssOverwrittenProperties
  .home {
    width: 100%;
    height: 100%;
    padding: 16px 0;
  }
</style>
