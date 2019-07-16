<template>
  <v-dialog :value="show" persistent max-width="600"
   :fullscreen="$vuetify.breakpoint.xsOnly">
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on" />
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">{{$t('general.addItem')}}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <file-input v-model="formData.seal" />
          <v-text-field :label="$t('item.name')+'*'" v-model="formData.name"
                        :rules="[rules.required($t('validation.required'))]"/>
          <v-layout>
            <v-text-field :label="$t('item.code')+'*'" v-model="formData.code"
                          :rules="[rules.required($t('validation.required'))]"/>
            <div class="amount-input">
              <v-text-field :label="$t('item.amount')+'*'" type="number" v-model="formData.amount"
                            :rules="[rules.required($t('validation.required')),
                            rules.number($t('validation.number')),
                            rules.min(1, $tc('validation.above', formData.amount, {n:1}))]"/>
            </div>
          </v-layout>
          <v-combobox :label="$t('item.admin')+'*'" v-model="formData.admin"
                      :items="users" :rules="[rules.required($t('validation.required'))]"/>
          <div class="details-grid">
            <v-combobox :label="$t('item.course')+'*'" v-model="formData.course"
                        :items="['デザイン科', '電気工学科', '機械電子工学科', '情報工学科']"
                        :rules="[rules.required($t('validation.required'))]"/>
            <v-text-field :label="$t('item.room')+'*'"
                          type="number" class="room-input" v-model="formData.room"
                          :rules="[rules.required($t('validation.required')),
                          rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', formData.room, {n:1}))]"/>
            <date-picker :label="$t('item.purchasedAt')+'*'" v-model="formData.purchasedAt"
                         :rules="[rules.required($t('validation.required'))]"/>
            <date-picker :label="$t('item.checkedAt')" v-model="formData.checkedAt"/>
            <date-picker :label="$t('item.disposalAt')" v-model="formData.disposalAt"/>
            <date-picker :label="$t('item.depreciationAt')" v-model="formData.depreciationAt"/>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="closeDialog">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickAdd">
          {{ $t('general.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import usersQuery from '@/apollo/queries/users.gql';

import DatePicker from '@/components/DatePicker.vue';
import validationRules from '@/ValidationRules';
import FileInput from '@/components/FileInput.vue';

export default {
  name: 'ItemAddDialog',
  components: { FileInput, DatePicker },
  /*
  event:[
   added
  ]
   */
  model: {
    prop: 'show',
    event: 'change',
  },
  apollo: {
    users: {
      query: usersQuery,
      update({ users }) {
        return users.map(u => u.name);
      },
    },
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      users: [],
      formData: {
        name: '',
        code: '',
        amount: 1,
        admin: '',
        course: '',
        room: undefined,
        purchasedAt: undefined,
        checkedAt: undefined,
        disposalAt: undefined,
        depreciationAt: undefined,
        seal: undefined,
      },
    };
  },
  computed: {
    rules: () => validationRules,
    defaultFormData: () => ({
      name: '',
      code: '',
      amount: 1,
      admin: '',
      course: '',
      room: undefined,
      purchasedAt: undefined,
      checkedAt: undefined,
      disposalAt: undefined,
      depreciationAt: undefined,
      seal: undefined,
    }),
  },
  watch: {
    show() {
      this.formData = this.defaultFormData;
      this.$refs.form.resetValidation();
    },
  },
  methods: {
    closeDialog() {
      this.$emit('change', false);
    },
    clickAdd() {
      if (this.$refs.form.validate()) {
        const data = { ...this.formData };
        data.amount = Number(data.amount);
        data.room = Number(data.room);
        this.$mutate('addItem', {
          variables: { data },
        }).then(({ data: { addItem: formData } }) => {
          if (formData.success) {
            this.$emit('added', formData);
            this.closeDialog();
          } else if (window.gqlError) {
            window.gqlError({
              message: formData.message,
            });
          }
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .amount-input {
    margin-left: 8px;
    width: 70px;
  }

  .edit-user-check {
    max-width: 140px;
    width: 140px;
    min-width: 140px;
    margin-right: 8px;
  }

  .room-input {
    margin-left: 8px;
  }

  .details-grid {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    row-gap: 8px;
    column-gap: 8px;
  }
</style>
