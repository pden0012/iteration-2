// import vue and our main app component
import { createApp } from 'vue'
import App from './App.vue'

// create a function to mount the app
const mount = () => createApp(App).mount('#app')
// make it available globally so the auth system can call it
window.__mountApp__ = mount

// if user is already authenticated, mount the app right away
if (window.__authOk__) {
  mount()
}
