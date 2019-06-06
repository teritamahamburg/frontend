<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    lazy
    transition="scale-transition"
    offset-y
    full-width
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="date"
        :label="label"
        :placeholder="placeholder"
        :prepend-icon="prependIcon"
        readonly
        v-on="on"
        :append-icon="appendIcon"
        @click:append="$emit('change', undefined)"
        :disabled="disabled"
      ></v-text-field>
    </template>
    <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
  </v-menu>
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
    prependIcon: {
      type: String,
      default: 'event',
    },
    appendIcon: {
      type: String,
      default: 'clear',
    },
    disabled: {
      type: Boolean,
      default: false,
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
};
</script>

<style scoped lang="scss">

</style>
