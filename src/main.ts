import Vue from "vue"

import ElCheckbox from "element-ui/lib/checkbox"

import App from "./App.vue"

// FIXME: unplugin-vue-components 引入 ElCheckbox 无法渲染，手动引入
Vue.use(ElCheckbox)

new Vue({
  el: "#app",
  render: (h) => h(App),
})
