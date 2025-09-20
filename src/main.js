import { createApp } from 'vue'
import App from './App.vue'

const mount = () => createApp(App).mount('#app')
window.__mountApp__ = mount

if (window.__authOk__) {
  mount()
}
