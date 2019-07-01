<template>
  <v-dialog :value="value" persistent max-width="600"
    :fullscreen="$vuetify.breakpoint.xsOnly">
    <v-card>
      <v-card-title>
        <span class="headline">{{$t('general.editItem')}}</span>
      </v-card-title>
      <v-card-text>
        <template v-if="filteredItems.length === 0">
          <div class="headline" style="text-align: center">no item</div>
        </template>
        <template v-else-if="filteredItems.length === 1">
          <v-form ref="form">
            <v-text-field :label="$t('item.editUser')+'*'" v-model="editItem.editUser"
                          prepend-icon="person" :placeholder="item.editUser" />
            <v-layout>
              <v-text-field :label="$t('item.room')" :placeholder="''+item.room"
                            type="number" class="room-input" v-model="editItem.room"
                            prepend-icon="room" append-icon="clear"
                            @click:append="editItem.room = undefined"
                            :rules="`${editItem.room||''}`.length === 0 ? [] :
                        [rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', editItem.room, {n:1}))]"/>
              <date-picker :label="$t('item.checkedAt')" :placeholder="item.checkedAt"
                           v-model="editItem.checkedAt"/>
            </v-layout>
            <v-layout>
              <date-picker :label="$t('item.disposalAt')" :placeholder="item.disposalAt"
                           v-model="editItem.disposalAt"/>
              <date-picker :label="$t('item.depreciationAt')" :placeholder="item.depreciationAt"
                           v-model="editItem.depreciationAt"/>
            </v-layout>
          </v-form>
        </template>
        <template v-else>
          <v-form ref="form">
            <v-text-field :label="$t('item.editUser')+'*'" v-model="editItem.editUser"
                          prepend-icon="person"/>
            <v-layout>
              <v-text-field :label="$t('item.room')"
                            type="number" class="room-input" v-model="editItem.room"
                            prepend-icon="room" append-icon="clear"
                            @click:append="editItem.room = undefined"
                            :rules="`${editItem.room||''}`.length === 0 ? [] :
                        [rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', editItem.room, {n:1}))]"/>
              <date-picker :label="$t('item.checkedAt')" v-model="editItem.checkedAt"/>
            </v-layout>
            <v-layout>
              <date-picker :label="$t('item.disposalAt')" v-model="editItem.disposalAt"/>
              <date-picker :label="$t('item.depreciationAt')" v-model="editItem.depreciationAt"/>
            </v-layout>
          </v-form>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="clickCancel">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black"
               v-show="filteredItems.length > 0"
               @click="clickEditInDialog" :disabled="hasDiff">
          {{ $t('general.edit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';
import validationRules from '@/ValidationRules';

export default {
  name: 'ItemEditDialog',
  components: { DatePicker },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editItem: {
        editUser: '',
        checkedAt: undefined,
        depreciationAt: undefined,
        disposalAt: undefined,
        room: undefined,
      },
    };
  },
  watch: {
    filteredItems(v) {
      if (v.length === 1) {
        const val = v[0];
        Object.keys(this.editItem)
          .forEach((k) => { this.editItem[k] = val[k]; });
      } else {
        this.editItem = this.defaultEditItem;
      }
    },
  },
  computed: {
    filteredItems() {
      return this.items.filter(({ partId }) => `${partId}` === '0');
    },
    rules: () => validationRules,
    editedItem() {
      const item = {};
      Object.keys(this.editItem)
        .forEach((k) => { item[k] = this.editItem[k] || this.item[k]; });
      return item;
    },
    hasDiff() {
      if (this.filteredItems.length > 1 && this.editItem.editUser.length === 0) {
        return true;
      }
      return !Object.keys(this.editItem)
        .some(k => ((k === 'editUser') ? false
          : `${this.editedItem[k]}` !== `${this.item[k]}`));
    },
    item() {
      return this.filteredItems[0] || {};
    },
    defaultEditItem: () => ({
      editUser: '',
      checkedAt: undefined,
      depreciationAt: undefined,
      disposalAt: undefined,
      room: undefined,
    }),
  },
  methods: {
    closeDialog() {
      this.$emit('change', false);
    },
    clickCancel() {
      this.$emit('click:cancel');
      this.closeDialog();
    },
    clickEditInDialog() {
      if (this.$refs.form.validate() && this.filteredItems.length > 0) {
        if (this.filteredItems.length === 1) {
          const data = {};
          Object.keys(this.editItem)
            .forEach((k) => {
              if (this.item[k] !== this.editItem[k]) {
                if (k === 'room') {
                  data.room = Number(this.editItem.room);
                } else {
                  data[k] = this.editItem[k];
                }
              }
            });
          if (!data.editUser) data.editUser = this.item.editUser;
          this.$mutate('editItem', {
            variables: {
              id: this.item.id,
              data,
            },
          }).then((d) => {
            this.$emit('edited', d);
          }).catch((error) => {
            if (window.gqlError) window.gqlError(error);
          });
          this.closeDialog();
        } else {
          this.$mutate('editItems', {
            variables: {
              ids: this.filteredItems.map(({ id }) => id),
              data: this.editItem,
            },
          }).then((d) => {
            this.$emit('edited', d);
          }).catch((error) => {
            if (window.gqlError) window.gqlError(error);
          });
          this.closeDialog();
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
