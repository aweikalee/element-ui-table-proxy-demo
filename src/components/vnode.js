/**
 * VNode 和 cloneVNode 是 Vue 内置类和方法
 * 但是 Vue2 并没有暴露他们
 * 这边通过 Vue 实例，创建一个 VNode，从原型上获取 VNode
 * 再从源码中复制一份 cloneVNode
 */
import Vue from 'vue'

let VNode
new Vue({
  el: document.createElement('div'),
  render(h) {
    const vnode = h('div')
    VNode = Object.getPrototypeOf(vnode).constructor
    this.$destroy()
  },
})

export function cloneVNode(vnode) {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
