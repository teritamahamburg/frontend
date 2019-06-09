<template>
  <div class="home">
    <v-layout class="actions" align-center>
      <v-spacer/>
      <div class="button-group" v-show="viewType === 'grid' && items && items.length !== 0">
        <v-menu offset-y>
          <template v-slot:activator="{on}">
            <v-btn flat v-on="on">
              {{ $t(`item.${sort.type}`) }}
            </v-btn>
          </template>
          <v-list>
            <v-list-tile v-for="i in sortItems" :key="i" @click="sort.type = i">
              <v-list-tile-title>{{$t(`item.${i}`)}}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
        <v-btn flat :class="sort.order"
               @click="sort.order = sort.order === 'asc' ? 'desc' : 'asc'">
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </div>
      <v-btn-toggle v-model="viewType" mandatory v-show="items && items.length !== 0">
        <v-btn flat v-for="type in viewTypes" :key="type.type" :value="type.type">
          <v-icon left>{{ type.icon }}</v-icon>
          {{ type.type }}
        </v-btn>
      </v-btn-toggle>
    </v-layout>

    <div class="items-view-wrapper">
      <items-view :items="items" :view-type="viewType" :show-props="showProps"
                  @remove="removeItem"
                  @select="(v, i, l) => removeDialog.ids = l"
                  @edit="showEditDialog"
                  @editHistory="showEditHistoryDialog"
                  @qrCode="showQRCodeDialog"
                  @addPart="showAddPartDialog"/>
    </div>

    <v-dialog v-model="removeDialog.show" persistent max-width="250">
      <v-card class="remove-dialog">
        <v-card-title class="headline">
          {{ $t('general.removeConfirmText', {n:removeDialog.ids.length}) }}
        </v-card-title>
        <v-card-actions>
          <v-spacer/>
          <v-btn outline @click="closeRemoveDialog">
            {{ $t('general.cancel') }}
          </v-btn>
          <v-btn depressed dark color="black" @click="clickRemoveInDialog">
            {{ $t('general.remove') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <item-add-dialog v-model="showAddDialog" @added="$apollo.queries.items.refetch()"/>

    <item-edit-dialog v-model="editDialog.show" :item="editDialog.item"
                      @edited="$apollo.queries.items.refetch()"/>

    <item-edit-history-dialog v-model="editHistoryDialog.show" :id="editHistoryDialog.id"/>

    <qr-code-dialog v-model="qrCodeDialog.show" :text="qrCodeDialog.text"/>

    <part-dialog v-model="partDialog.show" :item="partDialog.item" :add="partDialog.add"
      @added="$apollo.queries.items.refetch()"
      @edited="$apollo.queries.items.refetch()"/>

    <v-btn fab fixed right bottom @click="$apollo.queries.items.refetch()"
           :color="$state.dark ? 'white black--text' : 'black white--text'"
           v-if="removeDialog.ids.length === 0">
      <v-icon>refresh</v-icon>
    </v-btn>
    <v-btn fab fixed right bottom color="error" @click="removeDialog.show = true"
           v-else>
      <v-icon>delete</v-icon>
    </v-btn>
  </div>
</template>

<script>
import itemsQuery from '@/queries/items.gql';
import removeItemsMutation from '@/mutations/removeItems.gql';

import ItemAddDialog from '@/components/ItemAddDialog.vue';
import ItemsView, { viewTypes } from '@/components/ItemsView.vue';
import ItemEditDialog from '@/components/ItemEditDialog.vue';
import ItemEditHistoryDialog from '@/components/ItemEditHistoryDialog.vue';
import QrCodeDialog from '@/components/QrCodeDialog.vue';
import PartDialog from '@/components/PartDialog.vue';

export default {
  name: 'Home',
  components: {
    PartDialog,
    QrCodeDialog,
    ItemEditHistoryDialog,
    ItemEditDialog,
    ItemsView,
    ItemAddDialog,
  },
  apollo: {
    items: {
      query: itemsQuery,
      variables() {
        return {
          sort: [
            [this.sort.type, this.sort.order],
          ],
        };
      },
      update({ items }) {
        if (!items) return [];
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
  data() {
    return {
      viewType: 'grid', // list
      sort: {
        type: 'id',
        order: 'asc',
      },
      showAddDialog: false,
      removeDialog: {
        show: false,
        ids: [],
      },
      editDialog: {
        show: false,
        item: {},
      },
      editHistoryDialog: {
        show: false,
        id: undefined,
      },
      qrCodeDialog: {
        show: false,
        text: undefined,
      },
      partDialog: {
        show: false,
        add: true,
        item: {},
      },
    };
  },
  created() {
    this.$broadcast.$on('clickAdd', () => {
      this.showAddDialog = true;
    });
  },
  mounted() {
    const { hash } = window.location;
    if (hash.length === 0 || this.viewTypes.findIndex(v => v.type === hash.substring(1)) === -1) {
      window.location.hash = `#${this.viewType}`;
    } else {
      this.viewType = hash.substring(1);
    }
  },
  watch: {
    viewType(val) {
      window.location.hash = `#${val}`;
      this.removeDialog.ids = [];
    },
  },
  computed: {
    viewTypes: () => viewTypes,
    nextViewType() {
      const types = this.viewTypes;
      const index = types.findIndex(({ type }) => type === this.viewType);
      return types[(index + 1) % types.length];
    },
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
    sortItems() {
      /**
       * @link {backend/src/GraphQLMiddleware.js}
       */
      return [
        'id',
        'amount',
        'purchasedAt',
        'checkedAt',
        'disposalAt',
        'depreciationAt',
      ];
    },
  },
  methods: {
    removeItem({ id }) {
      this.removeDialog.ids = [id];
      this.removeDialog.show = true;
    },
    clickRemoveInDialog() {
      this.$apollo.mutate({
        mutation: removeItemsMutation,
        variables: {
          ids: [...this.removeDialog.ids],
        },
      }).then(({ data: { removeItems: { success } } }) => {
        if (success) {
          this.closeRemoveDialog();
          this.$apollo.queries.items.refetch();
        }
      }).catch((error) => {
        if (window.gqlError) window.gqlError(error);
      });
    },
    closeRemoveDialog() {
      this.removeDialog.ids = [];
      this.removeDialog.show = false;
    },
    showEditDialog(item) {
      if (`${item.partId}` === '0') {
        this.editDialog.item = item;
        this.editDialog.show = true;
      } else {
        this.partDialog.item = item;
        this.partDialog.add = false;
        this.partDialog.show = true;
      }
    },
    showEditHistoryDialog({ id }) {
      this.editHistoryDialog.id = id;
      this.editHistoryDialog.show = true;
    },
    showQRCodeDialog({ id }) {
      this.qrCodeDialog.text = `${this.$t('qrcode.verify')}:${id}`;
      this.qrCodeDialog.show = true;
    },
    showAddPartDialog(item) {
      this.partDialog.item = item;
      this.partDialog.add = true;
      this.partDialog.show = true;
    },
  },
};
</script>

<style scoped lang="scss">
  $actions-height: 50px;
  $actions-margin: 8px;

  .home {
    width: 100%;
    height: 100%;
    padding: 10px;

    .actions {
      margin: $actions-margin 0;
      height: $actions-height;

      .button-group {
        height: 37px;
        display: inline-flex;
        /*border: solid black 1px;*/
        margin: 6px 8px;

        .v-btn {
          margin: 0;
        }

        .v-btn:nth-child(1) {
          /*border-right: solid black 1px;*/
        }

        .v-btn:nth-last-child(1) {
          min-width: 36px;
          width: 36px;
          max-width: 36px;
        }

        .v-icon {
          transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), color 1ms !important;
        }

        .desc .v-icon {
          transform: rotate(180deg);
        }
      }
    }

    .items-view-wrapper {
      overflow-y: auto;
      position: absolute;
      top: $actions-height + $actions-margin * 3;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px 0;
    }
  }

  .remove-dialog {
    .headline {
      word-break: keep-all;
    }
  }
</style>
