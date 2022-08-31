import Vue from 'vue'

export function useKeepScroll(instance: Vue) {
  let scrollTop = 0
  let scrollLeft = 0
  let el: HTMLElement

  function save() {
    if (!el) return

    scrollTop = el.scrollTop
    scrollLeft = el.scrollLeft
  }
  function restore() {
    if (!el) return

    el.scrollTop = scrollTop
    el.scrollLeft = scrollLeft
  }

  let listenedEl: HTMLElement | null = null
  function removeEventListener() {
    listenedEl?.removeEventListener('scroll', save)
    listenedEl = null
  }
  function addEventListener() {
    if (!el) return
    if (listenedEl === el) return
    removeEventListener()

    listenedEl = el
    listenedEl?.addEventListener('scroll', save)
  }

  instance.$on('hook:activated', addEventListener)
  instance.$on('hook:deactivated', removeEventListener)

  instance.$on('hook:activated', restore)

  return {
    setElement(value: HTMLElement) {
      el = value
      addEventListener()
    },
  }
}
