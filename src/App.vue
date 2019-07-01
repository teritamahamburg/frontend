<template>
  <v-app :dark="$store.state.dark">
    <div class="overlay--graphql"
         v-show="$route.meta.overlay !== false &&$store.state.loading !== 0">
      <!-- ignore undefined ↑-->
      <v-progress-circular
        :size="70" :width="7" color="white" indeterminate />
    </div>

    <div class="app-toolbar--overlay"></div>
    <div class="app-toolbar--offline" v-show="offline">
      <span>{{ $t('general.offlineMode') }}</span>
    </div>
    <v-snackbar :value="true" :timeout="0" top multi-line class="app-snackbar--offline"
      v-if="$store.state.online && $store.state.apollo.offlineQueries.length > 0">
      <v-btn dark outline v-html="$t('general.applyOfflineChanges')"
        @click="$store.state.dialogs.reflect.show = true" />
    </v-snackbar>

    <v-toolbar app dense class="app-toolbar"
               :class="{ offline, 'bottom--btn': paddingToolbar }">
      <template v-slot>
        <v-btn :color="$store.state.dark ? 'white black--text' : 'black white--text'"
               class="create-button--add" v-if="$route.path === '/home'"
               @click="$store.state.dialogs.add.show = true" absolute>
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

        <v-text-field v-if="$route.path === '/search'" v-model="$store.state.searchText"
                      append-icon="search" />

        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>menu</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-tile @click="$store.commit('setDark', !$store.state.dark)">
              <v-list-tile-action>
                <v-icon>brightness_{{$store.state.dark ? 7 : 3}}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{$store.state.dark ? 'Light Mode' : 'Dark Mode'}}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-show="showControl" @click="$store.state.dialogs.csv.show = true">
              <v-list-tile-action>
                <v-icon left>cloud_download</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{ $t('general.csv') }}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-show="$route.path === '/home'"
                         @click="$store.state.dialogs.restore.show = true">
              <v-list-tile-action>
                <v-icon left>restore_page</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{ $t('general.restoreItem') }}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile to="/setting">
              <v-list-tile-action>
                <v-icon left>settings</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{ $t('general.settings') }}
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:extension v-if="showControl">
        <items-view-controller
          :view-type="$store.state.itemsView.viewType"
          @change:viewType="v => $store.commit('setViewType', v)"
          :sort-type="$store.state.itemsView.sortType"
          @change:sortType="v => $store.commit('setSortType', v)"
          :sort-order="$store.state.itemsView.sortOrder"
          @change:sortOrder="v => $store.commit('setSortOrder', v)" />
      </template>
    </v-toolbar>

    <v-content :class="{expand: showControl, paddingToolbar, offline }">
      <keep-alive include="Home">
        <router-view />
      </keep-alive>
    </v-content>

    <!-- dialogs -->
    <template>
      <item-remove-dialog
          v-model="$store.state.dialogs.remove.show"
          :ids="$store.state.dialogs.selectItems.map(i => i.id)"
          @click:cancel="$store.commit('setSelectItems', [])"
          @removed="$broadcast.$emit('items:removed')" />

      <item-add-dialog
          v-model="$store.state.dialogs.add.show"
          @added="$broadcast.$emit('items:refetch')"/>

      <item-edit-dialog
          v-model="$store.state.dialogs.edit.show"
          :items="$store.state.dialogs.selectItems"
          :can-remove="$store.state.dialogs.edit.canRemove"
          @click:cancel="$store.commit('setSelectItems', [])"
          @edited="$broadcast.$emit('items:edited')"/>

      <item-edit-history-dialog
          v-model="$store.state.dialogs.editHistory.show"
          :id="$store.state.dialogs.editHistory.id"/>

      <qr-code-dialog
          v-model="$store.state.dialogs.qrCode.show"
          :verify="$store.state.dialogs.qrCode.verify"
          :text="$store.state.dialogs.qrCode.text"/>

      <part-dialog
          v-model="$store.state.dialogs.part.show"
          :item="$store.state.dialogs.part.item"
          :add="$store.state.dialogs.part.add"
          :can-remove="$store.state.dialogs.part.canRemove"
          @added="$broadcast.$emit('items:refetch')"
          @edited="$broadcast.$emit('items:refetch')"/>

      <download-csv-dialog v-model="$store.state.dialogs.csv.show" />

      <restore-item-dialog v-model="$store.state.dialogs.restore.show"
                           @restored="$broadcast.$emit('items:refetch')"/>

      <apply-offline-dialog v-model="$store.state.dialogs.reflect.show" />

      <seal-dialog v-model="$store.state.dialogs.seal.show"
        :image="$store.state.dialogs.seal.image" />
    </template>

    <v-snackbar v-model="showError" bottom>
      {{ gqlError }}
    </v-snackbar>

    <v-snackbar :value="showReloadAlert" color="error" bottom>
      <div>{{ $t('general.updateArrived') }}</div>
      <v-btn color="primary" @click="locationReload(true)">Reload</v-btn>
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
import ApplyOfflineDialog from '@/components/ApplyOfflineDialog.vue';
import SealDialog from '@/components/SealDialog.vue';

export default {
  name: 'App',
  components: {
    ApplyOfflineDialog,
    RestoreItemDialog,
    DownloadCsvDialog,
    ItemsViewController,
    ItemRemoveDialog,
    PartDialog,
    QrCodeDialog,
    ItemEditHistoryDialog,
    ItemEditDialog,
    ItemAddDialog,
    SealDialog,
  },
  data() {
    return {
      showError: false,
      gqlError: undefined,
      showReloadAlert: false,
    };
  },
  watch: {
    // eslint-disable-next-line
    '$store.state.online': function (val, oldVal) {
      if (!oldVal && val
        && this.$store.state.apollo.offlineQueries.length > 0) {
        this.$store.state.dialogs.reflect.show = true;
      }
    },
  },
  created() {
    this.$store.state.dialogs.qrCode.verify = this.$t('qrcode.verify');

    window.addEventListener('offline', () => {
      this.$store.state.online = false;
    });

    window.addEventListener('online', () => {
      this.$store.state.online = true;
    });
  },
  mounted() {
    window.gqlError = ({ message }) => {
      // eslint-disable-next-line no-console
      console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', message);
      this.gqlError = message;
      this.showError = true;
    };
    if (window.isUpdateAvailable) { // PWA用の更新処理
      window.isUpdateAvailable.then((available) => {
        this.showReloadAlert = available;
      });
    }
    this.$store.commit('setDark', this.$store.state.dark);
  },
  methods: {
    locationReload: val => window.location.reload(val),
    clickBack() {
      this.$store.state.searchText = '';
      this.$router.back();
    },
  },
  computed: {
    showBack() {
      return this.$route.meta.priority
        && this.$route.meta.priority > 1; // 1 is '/home' priority
    },
    showControl() {
      return this.$route.meta.itemsControl && this.$store.getters.itemsWithOffline.length > 0;
    },
    offline() {
      return !this.$store.state.online;
    },
    paddingToolbar() {
      return this.$route.path === '/home' && this.$vuetify.breakpoint.width <= 470;
    },
  },
};
</script>

<style lang="scss">
.application .overlay--graphql {
  z-index: 999;
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
  z-index: 5;
  bottom: -16px;
  border-radius: 18px;
  padding: 0 10px;
}

$toolbar-button-pad: 16px;

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-toolbar {
  height: auto;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);

  &.offline {
    margin-top: 24px !important;
  }

  &.bottom--btn {
    padding-bottom: $toolbar-button-pad;
  }
}

$toolbar-height: 48px;

//noinspection CssInvalidFunction, CssOverwrittenProperties
.v-content {
  padding: calc(#{$toolbar-height} + constant(safe-area-inset-top)) 0
    constant(safe-area-inset-bottom) 0 !important;
  padding: calc(#{$toolbar-height} + env(safe-area-inset-top)) 0
    env(safe-area-inset-bottom) 0 !important;

  &.expand {
    padding: calc(#{$toolbar-height * 2} + constant(safe-area-inset-top)) 0 0 !important;
    padding: calc(#{$toolbar-height * 2} + env(safe-area-inset-top)) 0 0 !important;
  }

  &.paddingToolbar {
    padding: calc(#{$toolbar-height} + #{$toolbar-button-pad}
      + constant(safe-area-inset-top)) 0 0 !important;
    padding: calc(#{$toolbar-height} + #{$toolbar-button-pad}
      + env(safe-area-inset-top)) 0 0 !important;

    &.expand {
      padding: calc(#{$toolbar-height * 2} + #{$toolbar-button-pad}
        + constant(safe-area-inset-top)) 0 0 !important;
      padding: calc(#{$toolbar-height * 2} + #{$toolbar-button-pad}
        + env(safe-area-inset-top)) 0 0 !important;
    }
  }

  &.offline {
    padding: calc(#{$toolbar-height * 1.5} + constant(safe-area-inset-top)) 0 0 !important;
    padding: calc(#{$toolbar-height * 1.5} + env(safe-area-inset-top)) 0 0 !important;

    &.expand {
      padding: calc(#{$toolbar-height * 2.5} + constant(safe-area-inset-top)) 0 0 !important;
      padding: calc(#{$toolbar-height * 2.5} + env(safe-area-inset-top)) 0 0 !important;

      &.paddingToolbar {
        padding: calc(#{$toolbar-height * 2.5} + #{$toolbar-button-pad}
        + constant(safe-area-inset-top)) 0 0 !important;
        padding: calc(#{$toolbar-height * 2.5} + #{$toolbar-button-pad}
        + env(safe-area-inset-top)) 0 0 !important;
      }
    }
  }
}

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-toolbar--overlay { /* ios bar */
  z-index: 10;
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
  width: 100%;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
}

$offline-color: purple;

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-toolbar--offline {
  z-index: 11;
  position: fixed;
  top: 0;
  width: 100%;
  height: #{$toolbar-height / 2};
  height: calc(constant(safe-area-inset-top) + #{$toolbar-height / 2});
  height: calc(env(safe-area-inset-top) + #{$toolbar-height / 2});
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-color: $offline-color;
  color: white;
}

//noinspection CssInvalidFunction, CssOverwrittenProperties
.app-snackbar--offline {
  z-index: 50;

  .v-snack__wrapper {
    width: 100%;
    max-width: 100%;
    margin: 0;
    background-color: $offline-color;
    padding-top: 35px;
    padding-top: calc(constant(safe-area-inset-top) + 35px);
    padding-top: calc(env(safe-area-inset-top) + 35px);

    .v-snack__content {
      padding-top: 36px;
      padding-bottom: 12px;
      justify-content: center;

      .v-btn {
        margin: 0;
      }
    }
  }
}

//noinspection CssInvalidFunction, CssOverwrittenProperties
.v-dialog--fullscreen {
  padding-top: constant(safe-area-inset-top) !important;
  padding-top: env(safe-area-inset-top) !important;
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
