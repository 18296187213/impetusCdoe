const state = {
  visible: false
}

const mutations = {
  SET_LOGIN_DIALOG_VISIBLE: (state, visible) => {
    state.visible = visible
  }
}

const actions = {
  // 显示登录弹窗
  showLoginDialog({ commit }) {
    commit('SET_LOGIN_DIALOG_VISIBLE', true)
  },
  // 隐藏登录弹窗
  hideLoginDialog({ commit }) {
    commit('SET_LOGIN_DIALOG_VISIBLE', false)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}