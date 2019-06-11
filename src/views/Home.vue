<template>
  <div class="home">
    <items-view
      :items="items" :view-type="$state.itemsView.viewType" :show-props="showProps"
      @remove="removeItem"
      @select="(v, i, l) => removeDialog.ids = l"
      @edit="showEditDialog"
      @editHistory="showEditHistoryDialog"
      @qrCode="showQRCodeDialog"
      @addPart="showAddPartDialog"/>

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
  data() {
    return {
      items: [],
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
    this.$state.$on('clickAdd', () => {
      this.showAddDialog = true;
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
    '$state.itemsView.viewType': function (val) {
      window.location.hash = `#${val}`;
      this.removeDialog.ids = [];
    },
    items(val) {
      this.$state.itemsView.showControl = val && val.length >= 1;
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
.home {
  width: 100%;
  height: 100%;
  padding-top: 32px;
}

.remove-dialog {
  .headline {
    word-break: keep-all;
  }
}
</style>
