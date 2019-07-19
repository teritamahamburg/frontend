import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';

Vue.use(Vuetify, {
  iconfont: 'md',
  icons: {
    qrCode: 'nfc',
    editHistory: 'history',
    remove: 'delete',
    seal: 'image',
  },
});
