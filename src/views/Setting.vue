<template>
  <div class="setting">
    <div class="setting--attr-list">
      <div>
        <span>{{ $t('general.attributeList') }}</span>
        <v-list>
          <draggable :value="$state.attributes" group="attrs">
            <v-list-tile v-for="a in $state.attributes" :key="a.key">
              <v-list-tile-title>{{ $t(`item.${a.key}`) }}</v-list-tile-title>
            </v-list-tile>
          </draggable>
        </v-list>
      </div>
      <div>
        <span>{{ $t('general.actionAttributeList') }}</span>
        <v-list>
          <draggable :value="$state.attributeActions" group="attrs">
            <v-list-tile v-for="a in $state.attributeActions" :key="a.key">
              <v-list-tile-title>[ {{ $t(`general.${a.key}`) }} ]</v-list-tile-title>
            </v-list-tile>
          </draggable>
        </v-list>
      </div>
      <div>
        <span>{{ $t('general.showAttributeList') }}</span>
        <v-list>
          <draggable v-model="$state.attrs" group="attrs">
            <v-list-tile v-for="(a, i) in $state.attrs" :key="i">
              <v-list-tile-title>
                {{a.type === 'action' ? '[' : ''}}
                {{ $t(`${a.type === 'value' ? 'item' : 'general'}.${a.key}`) }}
                {{a.type === 'action' ? ']' : ''}}
              </v-list-tile-title>
            </v-list-tile>
          </draggable>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

export default {
  name: 'Setting',
  components: { Draggable },
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
