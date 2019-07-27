<template>
  <div class="error--page">
    <v-icon class="error--icon" v-text="$vuetify.icons.values.custom.close" />

    <span class="headline">Error</span>

    <v-btn outlined large to="/">
      {{ $t('general.backTop') }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Error',
};
</script>

<style scoped lang="scss">
.error--page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .error--icon {
    font-size: 60vw;

    @media screen and (min-width: 769px) {
      font-size: 30vw;
    }
  }
}
</style>
