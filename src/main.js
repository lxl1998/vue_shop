import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import global from './assets/css/global.css'
import axios from 'axios'
axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
Vue.prototype.$http = axios
// Vue.use(axios)
Vue.config.productionTip = false

new Vue({
  router,
  global,
  render: h => h(App)
}).$mount('#app')
