<template>
  <div class="home">
    <items-view
      :items="items" :view-type="$state.itemsView.viewType"
      :show-props="showProps"
      v-on="$state.itemsViewMenuVOn"
      @select="(v, i, l) => $state.dialogs.remove.ids = l"/>

    <v-btn fab fixed right bottom @click="$apollo.queries.items.refetch()"
           :color="$state.dark ? 'white black--text' : 'black white--text'"
           v-if="$state.dialogs.remove.ids.length === 0">
      <v-icon>refresh</v-icon>
    </v-btn>
    <v-btn fab fixed right bottom color="error" @click="$state.dialogs.remove.show = true"
           v-else>
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
            [this.$state.itemsView.sortType, this.$state.itemsView.sortOrder],
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
    this.$state.$on('items:refetch', () => {
      this.$apollo.queries.items.refetch();
    });
    this.$state.$on('items:removed', () => {
      this.$state.dialogs.remove.ids = [];
      this.$apollo.queries.items.refetch();
    });
  },
  mounted() {
    const { hash } = window.location;
    if (hash.length === 0 || viewTypes.findIndex(v => v.type === hash.substring(1)) === -1) {
      window.location.hash = `#${this.$state.itemsView.viewType}`;
    } else {
      this.$state.itemsView.viewType = hash.substring(1);
    }
  },
  watch: {
    // eslint-disable-next-line func-names
    '$state.itemsView.viewType': function (val) {
      window.location.hash = `#${val}`;
      this.$state.dialogs.remove.ids = [];
    },
    items(val) {
      this.$state.itemsView.showControl = (val && val.length >= 1);
    },
  },
  computed: {
    showProps() {
      const { item } = this.$i18n.messages[this.$i18n.locale];
      return Object.entries(item)
        .filter(([k]) => k !== 'parts')
        .reduce((p, [key, value]) => {
          p.push({
            text: value,
            value: key,
          });
          return p;
        }, []);
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
