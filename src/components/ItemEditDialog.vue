<template>
  <v-dialog :value="value" persistent max-width="600">
    <v-card>
      <v-card-title>
        <span class="headline">{{$t('general.editItem')}}</span>
      </v-card-title>
      <v-card-text>
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
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="closeDialog">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickEditInDialog" :disabled="hasDiff">
          {{ $t('general.edit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';
import validationRules from '@/ValidationRules';
import editItemMutation from '@/mutations/editItem.gql';

export default {
  name: 'ItemEditDialog',
  components: { DatePicker },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    item: {
      type: Object,
      default: () => {},
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
    item(val) {
      Object.keys(this.editItem)
        .forEach((k) => { this.editItem[k] = val[k]; });
    },
  },
  computed: {
    rules: () => validationRules,
    editedItem() {
      const item = {};
      Object.keys(this.editItem)
        .forEach((k) => { item[k] = this.editItem[k] || this.item[k]; });
      return item;
    },
    hasDiff() {
      return !Object.keys(this.editItem)
        .some(k => ((k === 'editUser') ? false
          : `${this.editedItem[k]}` !== `${this.item[k]}`));
    },
  },
  methods: {
    closeDialog() {
      Object.keys(this.editItem)
        .forEach((k) => { this.editItem[k] = this.item[k]; });
      this.$emit('change', false);
    },
    clickEditInDialog() {
      if (this.$refs.form.validate()) {
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
        this.$apollo.mutate({
          mutation: editItemMutation,
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
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
