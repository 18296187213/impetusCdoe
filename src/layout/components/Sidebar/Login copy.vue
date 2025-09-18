<template>
  <div class="login-container">
    <!-- 未登录状态：显示登录按钮 -->
    <div v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
      登录
    </div>

    <!-- 已登录状态：显示用户信息和下拉菜单 -->
    <el-dropdown v-else class="user-dropdown" trigger="hover">
      <div class="user-info">
        <img :src="avatar" class="user-avatar">
        <span class="user-nickname">{{ nickName }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </div>
      <el-dropdown-menu slot="dropdown">
        <router-link to="/user/profile">
          <el-dropdown-item>个人中心</el-dropdown-item>
        </router-link>
        <el-dropdown-item @click.native="setLayout" v-if="setting">
          <span>布局设置</span>
        </el-dropdown-item>
        <el-dropdown-item divided @click.native="logout">
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
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

    // 布局设置
    setLayout() {
      this.$emit('setLayout')
    },

    // 退出登录
    logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index'
        })
      }).catch(() => {})
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

    // 下拉菜单样式控制
    >>> .el-dropdown-menu {
      width: 176px !important;
      min-width: 176px !important;

      .el-dropdown-menu__item {
        width: 100% !important;
        text-align: center;
        padding: 8px 16px;
      }
    }
  }
}
</style>
