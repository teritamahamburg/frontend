<template>
  <v-app :class="{ printQR }">
    <div class="overlay--graphql"
         v-show="$route.meta.overlay !== false &&$store.state.loading !== 0">
      <!-- ignore undefined ↑-->
      <v-progress-circular
        :size="70" :width="7" color="white" indeterminate/>
    </div>

    <div class="app-toolbar--overlay"></div>
    <div class="app-toolbar--offline" v-show="offline">
      <span>{{ $t('general.offlineMode') }}</span>
    </div>
    <v-snackbar :value="true" :timeout="0" top multi-line class="app-snackbar--offline"
                v-if="$store.state.online && $store.state.apollo.offlineQueries.length > 0">
      <v-btn dark outlined v-html="$t('general.applyOfflineChanges')"
             @click="$store.state.dialogs.reflect.show = true"/>
    </v-snackbar>

    <v-app-bar app dense class="app-toolbar"
               :class="{ offline, 'bottom--btn': paddingToolbar }">
      <template v-slot>
        <v-btn :color="$store.state.dark ? 'white black--text' : 'black white--text'"
               v-if="!showControl && $route.path === '/home'"
               class="create-button--add" :class="{paddingToolbar}"
               @click="$store.state.dialogs.add.show = true" absolute>
          <v-icon v-text="$vuetify.icons.values.custom.add"/>
          {{$t('general.createItem')}}
        </v-btn>

        <v-btn icon @click="clickBack" v-show="showBack" aria-label="Back">
          <v-icon v-text="$vuetify.icons.values.custom.back"/>
        </v-btn>
        <v-spacer/>
        <v-btn outlined to="/scan" v-show="($route.meta.priority || 999) <= 1"
          style="margin-right: 8px">
          <v-icon v-text="$vuetify.icons.values.custom.scan" />
          {{ $t('general.scan') }}
        </v-btn>
        <v-btn outlined to="/search" v-show="($route.meta.priority || 999) <= 1">
          <v-icon v-text="$vuetify.icons.values.custom.search"/>
          {{ $t('general.search') }}
        </v-btn>

        <v-text-field v-if="$route.path === '/search'" v-model="$store.state.searchText"
                      hide-details :append-icon="$vuetify.icons.values.custom.search"/>

        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" aria-label="Menu">
              <v-icon v-text="$vuetify.icons.values.custom.menu" />
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="$store.commit('setDark', !$store.state.dark)">
              <v-list-item-action>
                <v-icon left
                  v-text="$vuetify.icons.values.custom.brightness($store.state.dark ? 7 : 3)"/>
              </v-list-item-action>
              <v-list-item-content>
                {{$store.state.dark ? 'Light Mode' : 'Dark Mode'}}
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-show="showControl" @click="$store.state.dialogs.csv.show = true">
              <v-list-item-action>
                <v-icon left v-text="$vuetify.icons.values.custom.download" />
              </v-list-item-action>
              <v-list-item-content>
                {{ $t('general.csv') }}
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-show="$route.path === '/home'"
                         @click="$store.state.dialogs.restore.show = true">
              <v-list-item-action>
                <v-icon left v-text="$vuetify.icons.values.custom.restore" />
              </v-list-item-action>
              <v-list-item-content>
                {{ $t('general.restoreItem') }}
              </v-list-item-content>
            </v-list-item>
            <v-list-item to="/setting">
              <v-list-item-action>
                <v-icon left v-text="$vuetify.icons.values.custom.settings" />
              </v-list-item-action>
              <v-list-item-content>
                {{ $t('general.settings') }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:extension v-if="showControl">
        <v-btn :color="$store.state.dark ? 'white black--text' : 'black white--text'"
               v-if="$route.path === '/home'"
               class="create-button--add" :class="{paddingToolbar}"
               @click="$store.state.dialogs.add.show = true" absolute>
          <v-icon v-text="$vuetify.icons.values.custom.add"/>
          {{$t('general.createItem')}}
        </v-btn>
        <v-spacer />
        <items-view-controller
          :view-type="$store.state.itemsView.viewType"
          @change:viewType="v => $store.commit('setViewType', v)"
          :sort-type="$store.state.itemsView.sortType"
          @change:sortType="v => $store.commit('setSortType', v)"
          :sort-order="$store.state.itemsView.sortOrder"
          @change:sortOrder="v => $store.commit('setSortOrder', v)"/>
      </template>
    </v-app-bar>

    <v-content :class="{expand: showControl, paddingToolbar, offline }"
      v-if="defer(3)">
      <keep-alive include="Home">
        <router-view/>
      </keep-alive>
    </v-content>

    <dialogs v-if="hasShowDialog" />

    <v-snackbar :value="showReloadAlert" :timeout="0" color="error" bottom class="reload--alert">
      <div>{{ $t('general.updateArrived') }}</div>
      <v-btn color="primary" @click="clickReload">Reload</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';
import Defer from '@/mixins/Defer';
import ItemsViewController from '@/components/ItemsViewController.vue';

export default {
  name: 'App',
  mixins: [
    Defer(5),
  ],
  components: {
    ItemsViewController,
    Dialogs: () => import(/* webpackChunkName: "dialogs", webpackPreload: true */ '@/components/dialogs/index.vue'),
  },
  data() {
    return {
      showReloadAlert: false,
      hasShowDialog: false,
      acceptCallback: undefined,
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
    // eslint-disable-next-line
    '$i18n.locale': function (val) {
      document.getElementsByTagName('html')[0].lang = val;
    },
    // eslint-disable-next-line
    '$store.state.dark': function (val) {
      this.$vuetify.theme.dark = val;
    },
    // eslint-disable-next-line
    '$store.getters.hasShowDialog': function (val) {
      if (!this.hasShowDialog) {
        this.hasShowDialog = val;
      }
    },
  },
  created() {
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
      this.$toast.error(message, 'Error');
    };
    if (window.isUpdateAvailable) { // PWA用の更新処理
      window.isUpdateAvailable.then((cb) => {
        this.showReloadAlert = true;
        this.acceptCallback = cb;
      });
    }
    this.$store.commit('setDark', this.$store.state.dark);
  },
  methods: {
    clickReload() {
      this.acceptCallback();
    },
    clickBack() {
      this.$store.state.searchText = '';
      this.$router.back();
    },
  },
  computed: {
    ...mapState(['printQR']),
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
  .v-application .overlay--graphql {
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

  $toolbar-button-pad: 16px;
  $toolbar-height: 48px;

  .create-button--add {
    z-index: 5;
    left: 16px;
    bottom: -$toolbar-button-pad;
    border-radius: 18px;
    padding: 0 10px;

    &.paddingToolbar {
      bottom: -2 * $toolbar-button-pad;
    }
  }

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

  //noinspection CssInvalidFunction, CssOverwrittenProperties
  .v-content {
    padding: calc(#{$toolbar-height} + constant(safe-area-inset-top))
      0 constant(safe-area-inset-bottom) 0 !important;
    padding: calc(#{$toolbar-height} + env(safe-area-inset-top))
      0 env(safe-area-inset-bottom) 0 !important;

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

  .reload--alert {
    z-index: 999999;
  }
</style>

<style lang="scss">
  @media print {
    .no--print {
      display: none;
    }

    body {
      background-color: white !important;
    }

    .application {
      background-color: white !important;

      &.printQR {
        .v-content {
          display: none;
        }
      }

      &:not(.printQR) {
        .v-dialog__content {
          display: none;
        }
      }

      .v-overlay--active {
        display: none;
      }

      .application--wrap {
        .v-toolbar,
        .overlay--graphql, .app-toolbar--overlay, .app-toolbar--offline {
          display: none;
        }

        .v-content {
          padding: 0 !important;
        }
      }
    }
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
