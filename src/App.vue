<template>
  <v-app :dark="$state.dark">
    <div class="overlay--graphql" v-show="$state.loading !== 0">
      <v-progress-circular
        :size="70" :width="7" color="white" indeterminate />
    </div>

    <v-toolbar app>
      <v-btn :color="$state.dark ? 'white black--text' : 'black white--text'"
             class="create-button--add" v-if="$route.path === '/home'"
             @click="$state.$emit('clickAdd')" absolute>
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
      <v-btn icon @click="$state.dark = !$state.dark">
        <v-icon>brightness_{{$state.dark ? 7 : 3}}</v-icon>
      </v-btn>

      <template v-slot:extension v-if="$route.path === '/home' && $state.itemsView.showControl">
        <items-view-controller
          :view-type="$state.itemsView.viewType"
          @change:viewType="v => $state.itemsView.viewType = v"
          :sort-type="$state.itemsView.sortType"
          @change:sortType="v => $state.itemsView.sortType = v"
          :sort-order="$state.itemsView.sortOrder"
          @change:sortOrder="v => $state.itemsView.sortOrder = v" />
      </template>
    </v-toolbar>

    <v-content>
      <transition :name="transitionName">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </v-content>

    <v-snackbar v-model="showError" bottom>
      {{ gqlError }}
    </v-snackbar>
  </v-app>
</template>

<script>
import ItemsViewController from '@/components/ItemsViewController.vue';

export default {
  name: 'App',
  components: { ItemsViewController },
  data() {
    return {
      showError: false,
      gqlError: undefined,
      transitionName: 'none',
    };
  },
  mounted() {
    window.gqlError = ({ message }) => {
      // eslint-disable-next-line no-console
      console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', message);
      this.gqlError = message;
      this.showError = true;
    };
  },
  watch: {
    /* $route(to, from) {
      const toPriority = to.meta.priority;
      const fromPriority = from.meta.priority;
      if (!toPriority || !fromPriority || toPriority === fromPriority) {
        this.transitionName = 'none';
      } else {
        this.transitionName = toPriority > fromPriority ? 'slide-left' : 'slide-right';
      }
    }, */
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
</style>
