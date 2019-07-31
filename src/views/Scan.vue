<template>
  <div class="check">
    <qrcode-stream @decode="onDecode" class="qrcode-stream"
                   v-show="!showApplyDialog"/>

    <div class="details-card-wrapper">
      <item-card class="details-card" :item="editItem || {}"
        :entry="showEntries" first-column-width="170px"
        :class="{ bound }" @animationend.native="bound = false"
        :show-actions="['qrCode', 'edit', 'editHistory', 'remove', 'seal']"
        v-on="$store.getters.itemsViewMenuVOn">

        <template v-slot:expand:title>
          <v-btn icon small @click="showAllEntry = !showAllEntry"
                 :aria-label="showAllEntry ? 'collapse' : 'expand'">
            <v-icon v-text="$vuetify.icons.values.custom[showAllEntry ? 'up' : 'down']" />
          </v-btn>
        </template>

        <template v-slot:expand:labels>
          <div class="success" v-show="changed">変更済み</div>
        </template>

        <template v-slot:expand:list>
          <v-list-item>
            <v-checkbox color="black" :label="$t('general.enableMutationInScan')"
                        :value="applyChange" @change="v => v ? showDialog() : clearDialog()" />
          </v-list-item>
        </template>
      </item-card>
    </div>

    <v-dialog v-model="showApplyDialog" persistent max-width="600">
      <v-card>
        <v-card-text>
          <v-layout>
            <v-checkbox :label="$t('general.change')" color="black" v-model="applyDialog.editRoom"/>
            <v-text-field :label="$t('item.room')" v-model="applyDialog.room"
                          :disabled="!applyDialog.editRoom" type="number"/>
          </v-layout>
          <v-layout>
            <v-checkbox :label="$t('general.change')" color="black"
                        v-model="applyDialog.editCheckedAt"/>
            <date-picker :label="$t('item.checkedAt')" v-model="applyDialog.checkedAt"
              :append-icon="null" :disabled="!applyDialog.editCheckedAt"/>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn outlined @click="closeDialog(false)">
            {{ $t('general.cancel') }}
          </v-btn>
          <v-btn depressed dark color="black"
                 @click="clickApplyInDialog" :disabled="!showApplyButton">
            {{ $t('general.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';

import ItemCard from '@/components/ItemCard.vue';
import DatePicker from '@/components/DatePicker.vue';
import itemQuery from '@/apollo/queries/item.gql';
import childQuery from '@/apollo/queries/child.gql';

export default {
  name: 'Scan',
  components: { DatePicker, ItemCard, QrcodeStream },
  apollo: {
    item: {
      skip() {
        return !(this.$store.state.online && this.id && !this.id.includes(','));
      },
      query: itemQuery,
      variables() {
        return {
          id: this.id,
        };
      },
      update({ item }) {
        const i = {
          ...item,
          admin: item.admin.name,
          course: item.course.name,
          room: item.room.number,
        };
        // eslint-disable-next-line no-underscore-dangle
        delete i.__typename;
        return i;
      },
    },
    child: {
      skip() {
        return !(this.$store.state.online && this.id && this.id.includes(','));
      },
      query: childQuery,
      variables() {
        return {
          childId: this.id,
        };
      },
      update({ child }) {
        /* eslint-disable no-param-reassign */
        if (!child.name) child.name = child.item.name;
        child.room = child.room ? child.room.number : !child.item.room.number;
        if (!child.checkedAt) child.checkedAt = child.item.checkedAt;
        delete child.item;
        return child;
      },
    },
  },
  data() {
    return {
      id: undefined,
      applyChange: false,
      showApplyDialog: false,
      applyDialog: {
        editRoom: false,
        room: undefined,
        editCheckedAt: false,
        checkedAt: undefined,
      },
      changed: false,
      bound: false,
      showAllEntry: false,
    };
  },
  computed: {
    showApplyButton() {
      return !(
        (this.applyDialog.editRoom === this.applyDialog.editCheckedAt && !this.applyDialog.editRoom)
        || (this.applyDialog.editRoom && !this.applyDialog.room)
        || (this.applyDialog.editCheckedAt && !this.applyDialog.checkedAt)
      );
    },
    editItem() {
      if (!this.computedItem || !this.applyChange) return this.computedItem;
      const computedItem = { ...this.computedItem };
      if (this.applyDialog.editRoom) {
        computedItem.room = `${computedItem.room} (-> ${this.applyDialog.room})`;
      }
      if (this.applyDialog.editCheckedAt) {
        computedItem.checkedAt = `${computedItem.checkedAt} (-> ${this.applyDialog.checkedAt})`;
      }
      return computedItem;
    },
    defaultDialogValue() {
      return {
        editRoom: false,
        room: undefined,
        editCheckedAt: false,
        checkedAt: undefined,
      };
    },
    showEntries() {
      if (this.showAllEntry && this.computedItem) {
        return this.$store.state.attrs
          .filter(({ type }) => type === 'value')
          .map(({ key }) => key);
      }
      return ['room', 'checkedAt'];
    },
    computedItem() {
      if (this.$store.state.online) return this.item;
      const i = this.id.toString();
      return this.$store.getters.itemsWithOfflineParanoid
        .find(({ id }) => id.toString() === i);
    },
  },
  watch: {
    computedItem() {
      this.bound = true;
    },
  },
  methods: {
    onDecode(content) {
      this.id = content;
      this.changed = false;
      this.mutateEditItem();
    },
    mutateEditItem() {
      if (!this.applyChange) return;
      const data = {};
      if (this.applyDialog.editRoom && `${this.computedItem.room}` !== `${this.applyDialog.room}`) {
        data.room = Number(this.applyDialog.room);
      }
      if (this.applyDialog.editCheckedAt
            && this.computedItem.checkedAt !== this.applyDialog.checkedAt) {
        data.checkedAt = this.applyDialog.checkedAt;
      }
      if (Object.keys(data).length <= 1) return;
      const mutateName = this.id.includes(',') ? 'editChildren' : 'editItems';
      this.$mutate(mutateName, {
        variables: {
          ids: [this.id],
          data,
        },
      }).then(({ data: { [mutateName]: results } }) => {
        const { success, message } = results[0];
        if (success) {
          this.changed = true;
        } else if (window.gqlError) window.gqlError({ message });
      }).catch((error) => {
        if (window.gqlError) window.gqlError(error);
      });
    },
    showDialog() {
      this.applyChange = true;
      this.showApplyDialog = true;
    },
    closeDialog(apply) {
      this.applyChange = !!apply;
      this.showApplyDialog = false;
      if (!this.applyChange) this.applyDialog = this.defaultDialogValue;
      else {
        this.id = undefined;
      }
    },
    clearDialog() {
      this.applyChange = false;
      this.$nextTick(() => {
        this.applyDialog = this.defaultDialogValue;
      });
    },
    clickApplyInDialog() {
      this.closeDialog(true);
    },
  },
};
</script>

<style scoped lang="scss">
.check {
  width: 100%;
  height: 100%;

  .qrcode-stream {
    width: 100%;
  }

  .details-card-wrapper {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

    .details-card {
      width: 100%;
    }
  }
}

.bound {
  animation: bound 200ms ease-in;
}

@keyframes bound {
    0% { transform: translateY(0px) }
   50% { transform: translateY(-20px) }
  100% { transform: translateY(0px) }
}
</style>
