<template>
  <v-dialog :value="show" persistent max-width="600" class="add-dialog">
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on" />
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">{{$t('general.addItem')}}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <template>
            <v-text-field prepend-icon="attach_file" readonly :label="$t('general.sealImage')"
              @click="$refs.image.click()" :value="sealImage.name"
              append-icon="clear" @click:append="clearSealImage"/>
            <input
              type="file"
              style="display: none"
              ref="image"
              accept="image/*"
              @change="onFilePicked">
          </template>
          <v-text-field :label="$t('item.schoolName')+'*'" v-model="formData.schoolName"
                        :rules="[rules.required($t('validation.required'))]"/>
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
          <v-text-field :label="$t('item.user')+'*'" v-model="formData.user"
                        :rules="[rules.required($t('validation.required'))]"/>
          <v-layout>
            <v-checkbox :label="$t('general.sameAsAbove')" color="black"
                        class="edit-user-check" v-model="formData.sameUser"/>
            <v-text-field :label="$t('item.editUser')+'*'" :disabled="formData.sameUser"
                          :value="formData.sameUser ? formData.user : formData.editUser"
                          @input="s => formData.editUser = s"
                          :rules="[rules.required($t('validation.required'))]"/>
          </v-layout>
          <v-layout>
            <v-combobox :label="$t('item.course')+'*'" v-model="formData.course"
                          :items="$state.courses"
                          :rules="[rules.required($t('validation.required'))]"/>
            <v-text-field :label="$t('item.room')+'*'"
                          type="number" class="room-input" v-model="formData.room"
                          :rules="[rules.required($t('validation.required')),
                          rules.number($t('validation.number')),
                          rules.min(1, $tc('validation.above', formData.room, {n:1}))]"/>
          </v-layout>
          <v-layout>
            <date-picker :label="$t('item.purchasedAt')+'*'" v-model="formData.purchasedAt"
                         :rules="[rules.required($t('validation.required'))]"/>
            <date-picker :label="$t('item.checkedAt')" v-model="formData.checkedAt"/>
          </v-layout>
          <v-layout>
            <date-picker :label="$t('item.disposalAt')" v-model="formData.disposalAt"/>
            <date-picker :label="$t('item.depreciationAt')" v-model="formData.depreciationAt"/>
          </v-layout>
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
import addItemMutation from '@/mutations/addItem.gql';

import DatePicker from '@/components/DatePicker.vue';
import validationRules from '@/ValidationRules';

export default {
  name: 'ItemAddDialog',
  components: { DatePicker },
  /*
  event:[
   added
  ]
   */
  model: {
    prop: 'show',
    event: 'change',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sealImage: {
        name: '',
        file: undefined,
        url: '',
      },
      formData: {
        schoolName: 'ss',
        name: '',
        code: '',
        amount: 1,
        user: '',
        sameUser: true,
        editUser: '',
        course: '',
        room: undefined,
        purchasedAt: undefined,
        checkedAt: undefined,
        disposalAt: undefined,
        depreciationAt: undefined,
      },
    };
  },
  computed: {
    addItemMutation: () => addItemMutation,
    rules: () => validationRules,
    defaultFormData: () => ({
      schoolName: 'ss',
      name: '',
      code: '',
      amount: 1,
      user: '',
      sameUser: true,
      editUser: '',
      course: '',
      room: undefined,
      purchasedAt: undefined,
      checkedAt: undefined,
      disposalAt: undefined,
      depreciationAt: undefined,
    }),
  },
  methods: {
    clickAdd() {
      if (this.$refs.form.validate()) {
        const data = { ...this.formData };
        if (data.sameUser) {
          data.editUser = data.name;
        }
        delete data.sameUser;
        data.amount = Number(data.amount);
        data.room = Number(data.room);
        data.sealImage = this.sealImage.file;
        this.$apollo.mutate({
          mutation: addItemMutation,
          variables: { data },
        }).then((formData) => {
          this.$emit('added', formData);
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
        this.closeDialog();
      }
    },
    closeDialog() {
      this.$emit('change', false);
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
        this.$nextTick(() => {
          this.formData = this.defaultFormData;
          this.clearSealImage();
        });
      });
    },
    onFilePicked(e) {
      const { files } = e.target;
      if (files[0] !== undefined) {
        const file = files[0];
        this.sealImage.name = file.name;
        if (this.sealImage.name.lastIndexOf('.') <= 0) return;
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.addEventListener('load', () => {
          this.sealImage.url = fr.result;
          this.sealImage.file = file;
        });
      } else {
        this.clearSealImage();
      }
    },
    clearSealImage() {
      this.sealImage.name = '';
      this.sealImage.file = undefined;
      this.sealImage.url = '';
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
</style>
