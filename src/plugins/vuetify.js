import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
    values: {
      custom: {
        add: 'mdi-plus',
        next: 'mdi-chevron-right',
        back: 'mdi-chevron-left',
        up: 'mdi-chevron-up',
        down: 'mdi-chevron-down',
        scan: 'mdi-scanner',
        search: 'mdi-magnify',
        menu: 'mdi-menu',
        brightness: n => `mdi-brightness-${n}`, /* 7 or 3 */
        download: 'mdi-cloud-download',
        restore: 'mdi-file-restore',
        settings: 'mdi-settings',
        cardMenu: 'mdi-dots-vertical',
        devices: 'mdi-cellphone-link',
        viewList: 'mdi-view-list',
        viewModule: 'mdi-view-module',
        close: 'mdi-close',
        edit: 'mdi-pencil',
        refresh: 'mdi-refresh',
        searchArrow: 'mdi-subdirectory-arrow-right',
        qrCode: 'mdi-barcode',
        editHistory: 'mdi-history',
        remove: 'mdi-delete',
        seal: 'mdi-image',
        inputDate: 'mdi-calendar-text',
        name: 'mdi-file-document-box',
        room: 'mdi-map-marker',
      },
    },
  },
});
