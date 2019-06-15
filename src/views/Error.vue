<template>
  <div class="error--page">
    <v-icon class="error--text" :size="iconSize">clear</v-icon>

    <span class="headline">Error</span>

    <v-btn outline large to="/">
      {{ $t('general.backTop') }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Error',
  computed: {
    iconSize() {
      return Math.min(
        this.$vuetify.breakpoint.width / 2,
        this.$vuetify.breakpoint.height / 3,
      );
    },
  },
};
</script>

<style scoped>
.error--page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
