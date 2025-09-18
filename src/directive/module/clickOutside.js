/**
 * v-click-outside 指令
 * 用于检测元素外部的点击事件
 */
export default {
  bind(el, binding, vnode) {
    function documentHandler(e) {
      // 如果点击的元素是绑定指令的元素或其子元素，则不执行回调
      if (el.contains(e.target)) {
        return false
      }
      // 执行绑定的回调函数
      if (binding.expression) {
        binding.value(e)
      }
    }
    el.__vueClickOutside__ = documentHandler
    document.addEventListener('click', documentHandler)
  },
  unbind(el, binding) {
    document.removeEventListener('click', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  }
}