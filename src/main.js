import Vue from 'vue'
import App from './App.vue'

// For debugging, override the host used to retrieve data
Vue.config.overrideApiHost = process.env.NODE_ENV !== 'production'

new Vue({
  el: '#app',
  render: h => h(App)
})
