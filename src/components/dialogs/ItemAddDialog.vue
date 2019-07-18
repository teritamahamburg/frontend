<template>
  <v-dialog :value="show" persistent max-width="600"
   :fullscreen="$vuetify.breakpoint.xsOnly">
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on" />
    </template>

    <v-card v-if="panel === 0" class="item-add--dialog">
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
        <v-btn outline color="success" @click="clickBulkAdd">
          {{ $t('general.bulkAdd') }}
        </v-btn>
        <v-spacer/>
        <v-btn outline @click="closeDialog">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickAdd">
          {{ $t('general.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else>
      <v-card-actions style="flex-wrap: wrap">
        <v-btn outline @click="clickBack">
          <v-icon left>keyboard_arrow_left</v-icon>
          {{ $t('general.back') }}
        </v-btn>
        <v-spacer/>
        <v-btn outline @click="clickCSVDownload">
          {{ $t('general.csvTemplate.download') }}
        </v-btn>
        <v-btn outline @click="clickCSVImport">
          {{ $t('general.csvTemplate.import') }}
          <input style="display: none"
            type="file" ref="file"
            accept="text/csv,.csv"
            @change="onImportFile">
        </v-btn>
      </v-card-actions>
      <v-data-table hide-actions :headers="bulkAddTableHeader" :items="bulkAdd">
        <template v-slot:items="props">
          <tr>
            <th v-for="(k, i) in bulkAddTableHeader"
                :key="`${props.index}-${k.value}-${props.item[i]}`">
              {{props.item[i]}}
            </th>
          </tr>
        </template>
      </v-data-table>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="closeDialog">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickBulkAdd">
          {{ $t('general.bulkAdd') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { parse } from 'papaparse';
import usersQuery from '@/apollo/queries/users.gql';

import DatePicker from '@/components/DatePicker.vue';
import FileInput from '@/components/FileInput.vue';

import validationRules from '@/ValidationRules';
import { csvDownload } from '@/util';

const columns = {
  required: ['name', 'code', 'amount', 'admin', 'course', 'purchasedAt', 'room'],
  optional: ['checkedAt', 'disposalAt', 'depreciationAt'],
};

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
      skip() {
        return !this.$store.state.online || !this.show;
      },
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
      panel: 0,
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
      bulkAdd: [],
    };
  },
  computed: {
    rules: () => validationRules,
    bulkAddTableHeader() {
      return [...columns.required, ...columns.optional].map(k => ({ text: this.$t(`item.${k}`), value: k }));
    },
  },
  watch: {
    show() {
      const form = ['', '', 1, '', ''];
      Object.keys(this.formData).forEach((k, i) => {
        this.formData[k] = form[i];
      });

      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
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
    clickBulkAdd() {
      if (this.panel === 0) {
        this.panel = 1;
      } else {
        if (this.bulkAdd.length === 0) {
          this.$toast.error(this.$t('validation.requiredData'), 'Error');
        }
        const props = this.bulkAddTableHeader.map(h => h.value);
        const data = this.bulkAdd.map((arr) => {
          const obj = {};
          props.forEach((k, i) => {
            if (k === 'room' || k === 'amount') {
              obj[k] = Number(arr[i]);
            } else {
              obj[k] = arr[i];
            }
          });
          return obj;
        });
        this.$mutate('addItems', {
          variables: { data },
        }).then(({ data: { addItems } }) => {
          let hasError = false;
          addItems.forEach(({ success, message }) => {
            if (success) {
              this.$emit('added', { success, message });
            } else {
              hasError = true;
              if (window.gqlError) {
                window.gqlError({
                  message,
                });
              }
            }
          });
          if (!hasError) {
            this.closeDialog();
          }
        }).catch((error) => {
          if (window.gqlError) window.gqlError(error);
        });
      }
    },
    clickBack() {
      this.panel = 0;
      this.bulkAdd = [];
    },
    clickCSVDownload() {
      csvDownload(`${columns.required.map(k => `${this.$t(`item.${k}`)}*`).join(',')},${columns.optional.map(k => this.$t(`item.${k}`)).join(',')}`, 'template.csv');
    },
    clickCSVImport() {
      this.$refs.file.click();
    },
    onImportFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const fr = new FileReader();
      fr.readAsText(file);
      fr.addEventListener('load', () => {
        this.processCSV(fr.result);
      });
    },
    processCSV(csvString) {
      const { data } = parse(csvString);
      if (data.length > 0) data.shift();
      this.bulkAdd = data;
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
