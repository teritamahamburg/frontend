<template>
  <div class="setting">
    <v-card :width="300">
      <v-card-title>Attribute Set</v-card-title>
      <v-list>
        <draggable :value="attrs" handle=".drag--handle">
          <v-list-item
            v-for="(a, i) in attrs" :key="a.key"
            :class="{ 'grey lighten-3': a.show === false}"
          >
            <v-list-item-content>
              {{a.type === 'action' ? '[' : ''}}
              {{ $t(`${a.type === 'value' ? 'item' : 'general'}.${a.key}`) }}
              {{a.type === 'action' ? ']' : ''}}
            </v-list-item-content>
            <v-btn icon small @click="toggleShown(i)">
              <v-icon>
                {{a.show === false /* undefined is true */ ? 'mdi-eye-off' : 'mdi-eye'}}
              </v-icon>
            </v-btn>
            <v-icon class="drag--handle">mdi-menu</v-icon>
          </v-list-item>
        </draggable>
      </v-list>
    </v-card>
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
        const attrs = [...this.$store.state.attrs];
        attributes.forEach((k) => {
          if (!attrs.some(a => a.type === 'value' && a.key === k)) {
            attrs.push({
              type: 'value',
              key: k,
              show: false,
            });
          }
        });
        attributeActions.forEach((k) => {
          if (!attrs.some(a => a.type === 'action' && a.key === k)) {
            attrs.push({
              type: 'action',
              key: k,
              show: false,
            });
          }
        });
        return attrs;
      },
      set(val) {
        this.$store.commit('setAttrs', val);
      },
    },
  },
  beforeMount() {
    const filtered = this.$store.state.attrs
      .filter(({ key, type }) => (type === 'value' ? attributes : attributeActions).includes(key));
    if (this.$store.state.attrs.length !== filtered.length) {
      this.attrs = filtered;
    }
  },
  methods: {
    toggleShown(i) {
      const attr = this.attrs;
      attr[i].show = attr[i].show === false;
      this.attrs = attr;
    },
  },
};
</script>

<style scoped lang="scss">
  .setting {
    padding: 10px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
