<template>
  <div class="setting">
    <div class="setting--attr-list">
      <div>
        <span>{{ $t('general.attributeList') }}</span>
        <v-list>
          <draggable :value="attributes" group="attrs">
            <v-list-item v-for="a in attributes" :key="a.key">
              <v-list-item-title>{{ $t(`item.${a.key}`) }}</v-list-item-title>
            </v-list-item>
          </draggable>
        </v-list>
      </div>
      <div>
        <span>{{ $t('general.actionAttributeList') }}</span>
        <v-list>
          <draggable :value="attributeActions" group="attrs">
            <v-list-item v-for="a in attributeActions" :key="a.key">
              <v-list-item-title>[ {{ $t(`general.${a.key}`) }} ]</v-list-item-title>
            </v-list-item>
          </draggable>
        </v-list>
      </div>
      <div>
        <span>{{ $t('general.showAttributeList') }}</span>
        <v-list>
          <draggable v-model="attrs" group="attrs">
            <v-list-item v-for="(a, i) in attrs" :key="i">
              <v-list-item-title>
                {{a.type === 'action' ? '[' : ''}}
                {{ $t(`${a.type === 'value' ? 'item' : 'general'}.${a.key}`) }}
                {{a.type === 'action' ? ']' : ''}}
              </v-list-item-title>
            </v-list-item>
          </draggable>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

export const attributes = [
  'id',
  'name',
  'code',
  'amount',
  'admin',
  'course',
  'room',
  'purchasedAt',
  'checkedAt',
  'disposalAt',
  'depreciationAt',
  'createdAt',
  'deletedAt',
];
export const attributeActions = [
  'select',
  'qrCode',
  'editHistory',
  'edit',
  'remove',
  'child',
  'seal',
];

export default {
  name: 'Setting',
  components: { Draggable },
  computed: {
    attrs: {
      get() {
        return this.$store.state.attrs;
      },
      set(val) {
        this.$store.commit('setAttrs', val);
      },
    },
    attributes() {
      const a = this.attrs;
      return attributes
        .filter(k => !a.some(b => b.key === k))
        .map(key => ({ type: 'value', key }));
    },
    attributeActions() {
      const a = this.attrs;
      return attributeActions
        .filter(k => !a.some(b => b.key === k))
        .map(key => ({ type: 'action', key }));
    },
  },
};
</script>

<style scoped lang="scss">
  .setting {
    padding: 10px;
    height: 100%;

    .setting--attr-list {
      display: flex;

      .v-list {
        min-width: 150px;
        margin: 0 5px;
      }
    }
  }
</style>
