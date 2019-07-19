<template>
  <v-dialog :value="show" persistent max-width="300">
    <v-card>
      <v-card-title>
        <span class="headline">{{$t('general.applyOfflineChanges')}}</span>
      </v-card-title>
      <v-card-text>
        {{$t('general.askOfflineChange')}}
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outline @click="closeDialog">
          {{ $t('general.cancel') }}
        </v-btn>
        <v-btn depressed dark color="black" @click="clickReflectInDialog">
          {{ $t('general.reflect') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { commitMutate } from '@/vue-apollo';

export default {
  name: 'ApplyOfflineDialog',
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
  methods: {
    closeDialog() {
      this.$emit('change', false);
    },
    clickReflectInDialog() {
      commitMutate(this).then(() => {
        this.closeDialog();
      }).catch((e) => {
        if (window.gqlError) window.gqlError(e);
      });
    },
  },
};
</script>

<style scoped>

</style>
