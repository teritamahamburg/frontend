<template>
  <div class="search">
    <v-layout class="empty--no_text" v-if="!$state.searchText">
      <div class="headline">{{$t('general.searchHere')}}</div>
      <v-icon class="arrow-icon" :size="36">subdirectory_arrow_right</v-icon>
    </v-layout>
    <v-layout class="empty" v-else-if="!searchItems || searchItems.length === 0">
      <div class="headline">{{$t('general.noSearchResult')}}</div>
    </v-layout>
    <items-view v-else :items="searchItems" class="items-view"
                :hide-actions="['select', 'part']" v-on="$state.itemsViewMenuVOn" />
  </div>
</template>

<script>
import searchItemsQuery from '@/queries/searchItems.gql';
import ItemsView from '@/components/ItemsView.vue';

export default {
  name: 'Search.vue',
  components: { ItemsView },
  apollo: {
    searchItems: {
      throttle: 1000,
      query: searchItemsQuery,
      variables() {
        return {
          text: this.$state.searchText,
        };
      },
      update({ searchItems: items }) {
        if (!items) return [];
        return items.map((item) => {
          const i = {
            ...item,
            user: item.user.name,
            course: item.course.name,
            room: item.room.number,
            editUser: item.editUser.name,
          };
          // eslint-disable-next-line no-underscore-dangle
          delete i.__typename;
          return i;
        });
      },
    },
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
}
</style>
