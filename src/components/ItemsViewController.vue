<template>
  <v-layout class="actions" align-center>
    <v-spacer/>
    <div class="button-group" v-show="viewType === 'grid'">
      <v-menu offset-y>
        <template v-slot:activator="{on}">
          <v-btn text v-on="on">
            {{ $t(`item.${sortType}`) }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="i in sortItems" :key="i" @click="$emit('change:sortType', i)">
            <v-list-item-title>{{$t(`item.${i}`)}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn text :class="sortOrder"
             @click="$emit('change:sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')">
        <v-icon v-text="$vuetify.icons.values.custom.down" />
      </v-btn>
    </div>
    <v-btn-toggle :value="viewType" @change="v => $emit('change:viewType', v)" mandatory>
      <v-btn text v-for="type in viewTypes" :key="type.type" :value="type.type" :height="32">
        <v-icon left v-text="$vuetify.icons.values.custom[type.icon]" />
        {{ type.type }}
      </v-btn>
    </v-btn-toggle>
  </v-layout>
</template>

<script>
import { viewTypes } from '@/components/ItemsView.vue';

export default {
  name: 'ItemsViewController',
  props: {
    viewTypes: {
      type: Array,
      default: () => viewTypes,
    },
    sortItems: {
      type: Array,
      default: () => [
        'id',
        'amount',
        'purchasedAt',
        'checkedAt',
        'disposalAt',
        'depreciationAt',
      ],
    },
    viewType: {
      type: String,
      default: 'grid',
    },
    sortType: {
      type: String,
      default: 'id',
    },
    sortOrder: {
      type: String,
      default: 'asc',
    },
  },
};
</script>

<style scoped lang="scss">
  $actions-height: 50px;
  $actions-margin: 8px;

  .actions {
    margin: $actions-margin 0;
    height: $actions-height;

    .button-group {
      height: 37px;
      display: inline-flex;
      margin: 6px 8px;

      .v-btn {
        margin: 0;
      }

      .v-btn:nth-last-child(1) {
        min-width: 36px;
        width: 36px;
        max-width: 36px;
      }

      .v-icon {
        transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), color 1ms !important;
      }

      .desc .v-icon {
        transform: rotate(180deg);
      }
    }
  }
</style>
