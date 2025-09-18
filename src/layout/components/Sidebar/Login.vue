<template>
  <div class="login-container">
    <!-- 未登录状态：显示登录按钮 -->
    <div v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
      登录
    </div>

    <!-- 已登录状态：显示用户信息和自定义下拉菜单 -->
    <div v-else class="user-dropdown" @click="showDropdown = !showDropdown" v-clickOutside="hideDropdown">
      <div class="user-info">
        <img :src="avatar" class="user-avatar">
        <span class="user-nickname">{{ nickName }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </div>
      <div v-show="showDropdown" class="dropdown-menu">
        <div class="dropdown-item" @click.stop="goToProfile">
          个人中心
        </div>
        <div v-if="setting" class="dropdown-item" @click.stop="setLayout">
          布局设置
        </div>
        <div class="dropdown-item dropdown-item-divided" @click.stop="logout">
          退出登录
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

/*
 *@Date: 2025-09-10 14:55:46
 *@Description: 登录模块 - 根据登录状态显示不同内容
 */
export default {
  name: "LoginComponent",
  emits: ['setLayout'],
  data() {
    return {
      showDropdown: false
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'nickName',
      'avatar'
    ]),
    // 判断是否已登录（基于token是否存在）
    isLoggedIn() {
      return !!this.token
    },
    // 获取布局设置显示状态
    setting() {
      return this.$store.state.settings.showSettings
    }
  },
  methods: {
    // 处理登录按钮点击事件
    handleLogin() {
      // TODO: 这里将来实现登录弹窗逻辑
      console.log('点击登录按钮，将来实现登录弹窗')
      // 临时跳转到登录页面
      this.$router.push('/login')
    },

    // 跳转到个人中心
    goToProfile() {
      this.showDropdown = false
      this.$router.push('/user/profile')
    },

    // 布局设置
    setLayout() {
      this.showDropdown = false
      this.$emit('setLayout')
    },

    // 退出登录
    logout() {
      this.showDropdown = false
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index'
        })
      }).catch(() => {})
    },

    // 隐藏下拉菜单（点击外部区域时调用）
    hideDropdown() {
      this.showDropdown = false
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 60px;
  padding: 12px;

  // 登录按钮样式
  .login-btn {
    width: 176px;
    height: 36px;
    border-radius: 6px;
    opacity: 1;
    color: #fff;
    text-align: center;
    line-height: 36px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;

    /* 主要色/主要色 */
    background: #0256ff;

    &:hover {
      background: #0041cc;
    }
  }

  // 用户下拉菜单样式
  .user-dropdown {
    width: 176px;
    height: 36px;
    position: relative;

    .user-info {
      display: flex;
      align-items: center;
      justify-content: start;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: #f9f9f9;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .user-nickname {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-right: 4px;
      }

      .el-icon--right {
        font-size: 16px;
        color: #000;
        font-weight: 700;
      }
    }

    // 自定义下拉菜单样式
    .dropdown-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      width: 176px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 10px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 6px 0;
      margin-bottom: 4px;

      .dropdown-item {
        width: 100%;
        padding: 8px 16px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
          background: #f5f7fa;
          color: #409eff;
        }

        &.dropdown-item-divided {
          border-top: 1px solid #e4e7ed;
          margin-top: 6px;
          padding-top: 14px;
        }
      }
    }
  }
}
</style>
