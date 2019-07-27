<template>
  <div class="dialogs">
    <item-remove-dialog
      v-model="$store.state.dialogs.remove.show"
      :items="$store.state.dialogs.selectItems"
      @click:cancel="$store.commit('setSelectItems', [])"
      @removed="$broadcast.$emit('items:removed')"/>

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

    <code-dialog
      v-model="$store.state.dialogs.code.show"
      :text="$store.state.dialogs.code.text"/>

    <download-csv-dialog v-model="$store.state.dialogs.csv.show"/>

    <item-restore-dialog v-model="$store.state.dialogs.restore.show"
                         @restored="$broadcast.$emit('items:refetch')"/>

    <apply-offline-dialog v-model="$store.state.dialogs.reflect.show"/>

    <seal-dialog v-model="$store.state.dialogs.seal.show"
                 :image="$store.state.dialogs.seal.image"/>
  </div>
</template>

<script>
import ApplyOfflineDialog from '@/components/dialogs/ApplyOfflineDialog.vue';
import ItemRestoreDialog from '@/components/dialogs/ItemRestoreDialog.vue';
import DownloadCsvDialog from '@/components/dialogs/DownloadCSVDialog.vue';
import ItemRemoveDialog from '@/components/dialogs/ItemRemoveDialog.vue';
import CodeDialog from '@/components/dialogs/CodeDialog.vue';
import ItemEditHistoryDialog from '@/components/dialogs/ItemEditHistoryDialog.vue';
import ItemEditDialog from '@/components/dialogs/ItemEditDialog.vue';
import ItemAddDialog from '@/components/dialogs/ItemAddDialog.vue';
import SealDialog from '@/components/dialogs/SealDialog.vue';

export default {
  name: 'Dialogs',
  components: {
    ApplyOfflineDialog,
    ItemRestoreDialog,
    DownloadCsvDialog,
    ItemRemoveDialog,
    CodeDialog,
    ItemEditHistoryDialog,
    ItemEditDialog,
    ItemAddDialog,
    SealDialog,
  },
};
</script>
