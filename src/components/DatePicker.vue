<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      full-width
      min-width="290px"
    >
      <template v-slot:activator="{ on: { click } }">
        <!-- append-outer-icon without null -->
        <v-text-field
          v-model="date"
          :label="label"
          :placeholder="placeholder"
          :append-outer-icon="$vuetify.icons.values.custom.close"
          @click:append-outer="$emit('change', undefined)"
          :append-icon="$vuetify.icons.values.custom.inputDate"
          @click:append="click"
          :disabled="disabled"
          :rules="[...rules, dateRule]"
          mask="####-##-##"
          return-masked-value
        ></v-text-field>
      </template>
      <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'DatePicker',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    label: {
      type: String,
      default: 'DatePicker',
    },
    placeholder: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: '',
    },
    appendIcon: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    date: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('change', val);
      },
    },
  },
  methods: {
    dateRule(value) {
      if (!value || value.length === 0) return true;
      if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) return this.$t('validation.date.format');
      const date = new Date(value);
      const dateValue = value.split('-');
      /* eslint-disable eqeqeq */
      if (date.getFullYear() != dateValue[0]
        || date.getMonth() != dateValue[1] - 1
        || date.getDate() != dateValue[2]
      ) {
        return this.$t('validation.date.invalid');
      }

      return true;
    },
  },
};
</script>

<style scoped lang="scss">

</style>
