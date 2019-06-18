<template>
  <div class="home">
    <items-view
      :items="itemsInOffline" :view-type="$store.state.itemsView.viewType"
      :attrs="$store.state.attrs"
      v-on="$store.getters.itemsViewMenuVOn"
      @select="(v, i, l) => $store.state.dialogs.remove.ids = l"/>

    <v-btn fab fixed right bottom @click="$broadcast.$emit('items:refetch')"
           :color="$store.state.dark ? 'white black--text' : 'black white--text'"
           v-if="$store.state.dialogs.remove.ids.length === 0 && $store.state.online">
      <v-icon>refresh</v-icon>
    </v-btn>
    <v-btn fab fixed right bottom color="error" v-if="$store.state.dialogs.remove.ids.length > 0"
           @click="$store.state.dialogs.remove.show = true">
      <v-icon>delete</v-icon>
    </v-btn>
  </div>
</template>

<script>
import itemsQuery from '@/queries/items.gql';

import ItemsView, { viewTypes } from '@/components/ItemsView.vue';

export default {
  name: 'Home',
  components: {
    ItemsView,
  },
  apollo: {
    items: {
      query: itemsQuery,
      variables() {
        return {
          sort: [
            [this.$store.state.itemsView.sortType, this.$store.state.itemsView.sortOrder],
          ],
        };
      },
      update({ items }) {
        if (!items || items.length === 0) return [];
        return items.map((item) => {
          const i = {
            ...item,
            user: item.user.name,
            course: item.course.name,
            room: item.room.number,
            editUser: item.editUser.name,
            parts: item.parts.map(part => ({
              ...part,
              room: part.room.number,
              editUser: part.editUser.name,
            })),
          };
          // eslint-disable-next-line no-underscore-dangle
          delete i.__typename;
          return i;
        });
      },
    },
  },
  created() {
    this.$broadcast.$on('items:refetch', () => {
      if (this.$store.state.online) this.$apollo.queries.items.refetch();
    });
    this.$broadcast.$on('items:removed', () => {
      this.$store.state.dialogs.remove.ids = [];
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
  },
  watch: {
    // eslint-disable-next-line func-names
    '$store.state.itemsView.viewType': function (val) {
      window.location.hash = `#${val}`;
      this.$store.state.dialogs.remove.ids = [];
    },
    items(val) {
      this.$store.state.itemsView.showControl = (val && val.length >= 1);
    },
  },
  computed: {
    itemsInOffline() {
      return [...this.items, ...this.$store.state.apollo.offlineItem.items];
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;
  padding-top: 32px;
}
</style>
