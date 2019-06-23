<template>
  <div class="search">
    <v-layout class="empty--no_text" v-if="!text">
      <div class="headline">{{$t('general.searchHere')}}</div>
      <v-icon class="arrow-icon" :size="36">subdirectory_arrow_right</v-icon>
    </v-layout>
    <v-layout class="empty" v-else-if="!items || items.length === 0">
      <div class="headline">{{$t('general.noSearchResult')}}</div>
    </v-layout>
    <items-view v-else :items="items" class="items-view"
                :attrs="$store.state.attrs" v-on="$store.getters.itemsViewMenuVOn"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { throttle } from 'lodash-es';

import searchItemsQuery from '@/apollo/queries/searchItems.gql';
import ItemsView from '@/components/ItemsView.vue';

const throttleWait = 1000;
export default {
  name: 'Search.vue',
  components: { ItemsView },
  apollo: {
    searchItems: {
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
  data() {
    return {
      offlineItems: [],
    };
  },
  watch: {
    text() {
      this.computeOfflineItems();
    },
  },
  methods: {
    // eslint-disable-next-line func-names
    computeOfflineItems: throttle(function () {
      const text = this.text.toLowerCase();
      this.offlineItems = this.$store.getters.itemsWithOfflineParanoid
        .filter(item => ['name', 'code', 'schoolName', 'user', 'editUser', 'course', 'room']
          .some((k) => {
            if (!item[k]) return false;
            return item[k].toString().toLowerCase().includes(text);
          }));
    }, throttleWait),
  },
  computed: {
    ...mapState({
      text: 'searchText',
    }),
    items() {
      if (this.$store.state.online) return this.searchItems;
      return this.offlineItems;
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
