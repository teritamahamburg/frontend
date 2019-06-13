<template>
  <v-app :dark="$state.dark">
    <div class="overlay--graphql"
         v-show="$route.meta.overlay !== false &&$state.loading !== 0">
      <!-- ignore undefined ↑-->
      <v-progress-circular
        :size="70" :width="7" color="white" indeterminate />
    </div>

    <div class="app-toolbar--overlay"></div>

    <v-toolbar app dense class="app-toolbar">
      <template v-slot>
        <v-btn :color="$state.dark ? 'white black--text' : 'black white--text'"
               class="create-button--add" v-if="$route.path === '/home'"
               @click="$state.dialogs.add.show = true" absolute>
          <v-icon>add</v-icon>
          {{$t('general.createItem')}}
        </v-btn>
        <v-btn icon @click="clickBack" v-show="showBack">
          <v-icon>keyboard_arrow_left</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn outline to="/scan" v-show="($route.meta.priority || 999) <= 1">
          <v-icon>scanner</v-icon>
          {{ $t('general.scan') }}
        </v-btn>
        <v-btn outline to="/search" v-show="($route.meta.priority || 999) <= 1">
          <v-icon>search</v-icon>
          {{ $t('general.search') }}
        </v-btn>

        <v-text-field v-if="$route.path === '/search'" v-model="$state.searchText"
                      append-icon="search" />

        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>menu</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-tile @click="$state.dark = !$state.dark">
              <v-list-tile-action>
                <v-icon>brightness_{{$state.dark ? 7 : 3}}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{$state.dark ? 'Light Mode' : 'Dark Mode'}}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-show="showControl" @click="$state.dialogs.csv.show = true">
              <v-list-tile-action>
                <v-icon left>cloud_download</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{ $t('general.csv') }}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-show="showControl" @click="$state.dialogs.restore.show = true">
              <v-list-tile-action>
                <v-icon left>restore_page</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{ $t('general.restoreItem') }}
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:extension v-if="showControl">
        <items-view-controller
          :view-type="$state.itemsView.viewType"
          @change:viewType="v => $state.itemsView.viewType = v"
          :sort-type="$state.itemsView.sortType"
          @change:sortType="v => $state.itemsView.sortType = v"
          :sort-order="$state.itemsView.sortOrder"
          @change:sortOrder="v => $state.itemsView.sortOrder = v" />
      </template>
    </v-toolbar>

    <v-content :class="{expand: showControl}">
      <keep-alive>
        <router-view />
      </keep-alive>

      <item-remove-dialog
        v-model="$state.dialogs.remove.show"
        :ids="$state.dialogs.remove.ids"
        @click:cancel="$state.dialogs.remove.ids = []"
        @removed="$state.$emit('items:removed')" />

      <item-add-dialog
        v-model="$state.dialogs.add.show"
        @added="$state.$emit('items:refetch')"/>

      <item-edit-dialog
        v-model="$state.dialogs.edit.show"
        :item="$state.dialogs.edit.item"
        @edited="$state.$emit('items:refetch')"/>

      <item-edit-history-dialog
        v-model="$state.dialogs.editHistory.show"
        :id="$state.dialogs.editHistory.id"/>

      <qr-code-dialog
        v-model="$state.dialogs.qrCode.show"
        :text="$state.dialogs.qrCode.text"/>

      <part-dialog
        v-model="$state.dialogs.part.show"
        :item="$state.dialogs.part.item"
        :add="$state.dialogs.part.add"
        @added="$state.$emit('items:refetch')"
        @edited="$state.$emit('items:refetch')"/>

      <download-csv-dialog v-model="$state.dialogs.csv.show" />

      <restore-item-dialog v-model="$state.dialogs.restore.show"
        @restored="$state.$emit('items:refetch')"/>
    </v-content>

    <v-snackbar v-model="showError" bottom>
      {{ gqlError }}
    </v-snackbar>
  </v-app>
</template>

<script>
import ItemsViewController from '@/components/ItemsViewController.vue';

import ItemAddDialog from '@/components/ItemAddDialog.vue';
import ItemEditDialog from '@/components/ItemEditDialog.vue';
import ItemEditHistoryDialog from '@/components/ItemEditHistoryDialog.vue';
import QrCodeDialog from '@/components/QrCodeDialog.vue';
import PartDialog from '@/components/PartDialog.vue';
import ItemRemoveDialog from '@/components/ItemRemoveDialog.vue';
import DownloadCsvDialog from '@/components/DownloadCSVDialog.vue';
import RestoreItemDialog from '@/components/RestoreItemDialog.vue';

export default {
  name: 'App',
  components: {
    RestoreItemDialog,
    DownloadCsvDialog,
    ItemsViewController,
    ItemRemoveDialog,
    PartDialog,
    QrCodeDialog,
    ItemEditHistoryDialog,
    ItemEditDialog,
    ItemAddDialog,
  },
  data() {
    return {
      showError: false,
      gqlError: undefined,
    };
  },
  created() {
    this.$state.dialogs.qrCode.verify = this.$t('qrcode.verify');
  },
  mounted() {
    window.gqlError = ({ message }) => {
      // eslint-disable-next-line no-console
      console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', message);
      this.gqlError = message;
      this.showError = true;
    };
  },
  methods: {
    clickBack() {
      this.$state.searchText = '';
      this.$router.push('/home');
    },
  },
  computed: {
    showBack() {
      return this.$route.meta.priority
        && this.$route.meta.priority > 1; // 1 is '/home' priority
    },
    showControl() {
      return this.$route.meta.itemsControl && this.$state.itemsView.showControl;
    },
  },
};
</script>

<style lang="scss">
.application .overlay--graphql {
  z-index: 9999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-button--add {
  z-index: 10;
  bottom: -16px;
  border-radius: 18px;
  padding: 0 10px;
}

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-toolbar {
  height: auto;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

$toolbar-height: 48px;

//noinspection CssInvalidFunction, CssOverwrittenProperties
.v-content {
  padding: calc(#{$toolbar-height} + constant(safe-area-inset-top)) 0 0 !important;
  padding: calc(#{$toolbar-height} + env(safe-area-inset-top)) 0 0 !important;

  &.expand {
    padding: calc(#{$toolbar-height * 2} + constant(safe-area-inset-top)) 0 0 !important;
    padding: calc(#{$toolbar-height * 2} + env(safe-area-inset-top)) 0 0 !important;
  }
}

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-toolbar--overlay {
  z-index: 999;
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
  width: 100%;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

<!--<style>
  .slide-left-enter-active, .slide-left-leave-active {
    transform: translate(0px, 0px);
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  }

  .slide-left-enter, .slide-left-leave-to {
    transform: translateX(-100vw) translateX(0px);
  }

  .slide-right-enter-active, .slide-right-leave-active {
    transform: translate(0px, 0px);
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  }

  .slide-right-enter, .slide-right-leave-to {
    transform: translateX(100vw) translateX(0px);
  }
</style>-->
