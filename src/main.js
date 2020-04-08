import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import global from './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
// Vue.use(axios)
Vue.config.productionTip = false

// Vue.use(TreeTable);
Vue.component('tree-table',TreeTable)
new Vue({
  router,
  global,
  render: h => h(App)
}).$mount('#app')
