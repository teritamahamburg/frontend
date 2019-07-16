<template>
  <v-dialog :value="value" persistent max-width="600"
            :fullscreen="$vuetify.breakpoint.xsOnly">
    <v-card>
      <template v-if="hasItem">
        <v-card-title>
          <span class="headline">{{$t('general.editItem')}}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" class="input-form">
            <file-input v-if="itemList.length === 1" style="grid-column: 1 / span 2"
                        v-model="editItem.seal"/>
            <v-text-field :label="$t('item.room')"
                          type="number" class="room-input" v-model="editItem.room"
                          append-icon="clear"
                          @click:append="editItem.room = undefined"
                          :rules="`${editItem.room||''}`.length === 0 ? [] :
                        [rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', editItem.room, {n:1}))]"/>
            <date-picker :label="$t('item.checkedAt')" v-model="editItem.checkedAt"/>
            <date-picker :label="$t('item.disposalAt')" v-model="editItem.disposalAt"/>
            <date-picker :label="$t('item.depreciationAt')" v-model="editItem.depreciationAt"/>
          </v-form>
        </v-card-text>
      </template>
      <template v-if="hasChildItem">
        <v-card-title>
          <span class="headline">{{$t(`general.editChild`)}}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="childForm" class="input-form">
            <v-text-field :label="$t('item.name')" v-model="editChildItem.name"
                          style="grid-column: 1 / span 2"
                          prepend-icon="description"/>
            <v-text-field :label="$t('item.room')"
                          type="number" class="room-input" v-model="editChildItem.room"
                          prepend-icon="room" append-icon="clear"
                          @click:append="editChildItem.room = undefined"
                          :rules="`${editChildItem.room||''}`.length === 0 ? [] :
                        [rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', editChildItem.room, {n:1}))]"/>
            <date-picker :label="$t('item.checkedAt')"
                         v-model="editChildItem.checkedAt"/>
          </v-form>
        </v-card-text>
      </template>

      <v-card-actions>
        <v-btn outline color="error" v-show="canRemove" @click="clickRemove">
          {{ $t('general.remove') }}
        </v-btn>
        <v-spacer/>
        <v-btn outline @click="clickCancel">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickEditInDialog">
          {{ $t(`general.edit`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';
import FileInput from '@/components/FileInput.vue';
import validationRules from '@/ValidationRules';

export default {
  name: 'ItemEditDialog',
  components: { FileInput, DatePicker },
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
    canRemove: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editItem: {
        seal: undefined,
        room: undefined,
        checkedAt: undefined,
        disposalAt: undefined,
        depreciationAt: undefined,
      },
      editChildItem: {
        name: undefined,
        room: undefined,
        checkedAt: undefined,
      },
    };
  },
  watch: {
    value() {
      Object.keys(this.editItem).forEach((k) => {
        this.editItem[k] = undefined;
      });
      Object.keys(this.editChildItem).forEach((k) => {
        this.editChildItem[k] = undefined;
      });
    },
  },
  computed: {
    rules: () => validationRules,
    itemList() {
      return this.items.filter(({ id }) => !id.includes(','));
    },
    hasItem() {
      return this.items.some(item => !item.id.includes(','));
    },
    childList() {
      return this.items.filter(({ id }) => id.includes(','));
    },
    hasChildItem() {
      return this.items.some(item => item.id.includes(','));
    },
  },
  methods: {
    closeDialog() {
      this.$emit('change', false);
    },
    clickRemove() {
      this.closeDialog();
      this.$store.commit('showRemoveDialog', this.items);
    },
    clickCancel() {
      this.$emit('click:cancel');
      this.closeDialog();
    },
    clickEditInDialog() {
      if (this.$refs.form.validate() && this.hasItem) {
        const data = { ...this.editItem };
        if (data.room) data.room = Number(data.room);
        this.$mutate('editItems', {
          variables: {
            ids: this.itemList.map(({ id }) => id),
            data,
          },
        }).then(({ data: { editItems: { success, message } } }) => {
          if (success) {
            this.$emit('edited', { success, message });
            this.closeDialog();
          } else if (window.gqlError) window.gqlError({ message });
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }

      if (this.$refs.childForm.validate() && this.hasChildItem) {
        const data = { ...this.editChildItem };
        if (data.room) data.room = Number(data.room);
        this.$mutate('editChildren', {
          variables: {
            ids: this.childList.map(({ id }) => id),
            data,
          },
        }).then(({ data: { editChildren: { success, message } } }) => {
          if (success) {
            this.$emit('edited', { success, message });
            this.closeDialog();
          } else if (window.gqlError) window.gqlError({ message });
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .input-form {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    row-gap: 8px;
    column-gap: 8px;
  }
</style>
