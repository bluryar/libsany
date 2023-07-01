import { createApp } from 'vue-demi';
import { createPinia } from 'pinia';

import 'uno.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

if (import.meta.hot) {
  import.meta.hot.acceptExports('~naive-ui-theme', (mod) => {
    console.log('🚀 ~ file: index.vue:16 ~ mod:', mod);
  });
}
