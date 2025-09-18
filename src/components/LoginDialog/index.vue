<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="400px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="false"
    @close="handleClose"
    class="login-dialog"
  >
    <div class="login-container">
      <div class="login-header">
        <div class="welcome-text">欢迎使用</div>
        <div class="app-title">AI测试项目工具</div>
      </div>

      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        size="small"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            auto-complete="off"
            placeholder="账号"
            class="login-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            auto-complete="off"
            placeholder="密码"
            class="login-input"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="code" v-if="captchaEnabled" class="code-form-item">
          <el-input
            v-model="loginForm.code"
            auto-complete="off"
            placeholder="验证码"
            class="code-input"
            @keyup.enter.native="handleLogin"
          />
          <div class="captcha-image">
            <img :src="codeUrl" @click="getCode" class="captcha-img" />
          </div>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
          @click="handleLogin"
          class="login-button"
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </el-button>

        <div class="login-options">
          <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">
            记住密码
          </el-checkbox>
          <span class="forgot-password">忘记密码请联系管理员</span>
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";

export default {
  name: "LoginDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.getCode();
          this.getCookie();
        } else {
          this.resetForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 显示弹窗
    show() {
      this.$emit("update:visible", true);
    },
    // 隐藏弹窗
    hide() {
      this.$emit("update:visible", false);
    },
    // 关闭弹窗
    handleClose() {
      this.hide();
    },
    // 重置表单
    resetForm() {
      this.loading = false;
      if (this.$refs.loginForm) {
        this.$refs.loginForm.resetFields();
      }
      this.loginForm.code = "";
    },
    // 获取验证码
    getCode() {
      getCodeImg().then((res) => {
        this.captchaEnabled =
          res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    // 获取Cookie中的记住密码信息
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        ...this.loginForm,
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    // 登录处理
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$message.success("登录成功");
              this.hide();
              // 登录成功后刷新页面以加载动态路由
              this.$router.go(0);
            })
            .catch(() => {
              this.loading = false;
              if (this.captchaEnabled) {
                this.getCode();
              }
            });
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.login-dialog {
  ::v-deep .el-dialog {
    border-radius: 10px;
    top: 20vh;
    margin-top: 0 !important;
    background: #f5f7fa;
  }

  ::v-deep .el-dialog__header {
    display: none;
  }

  ::v-deep .el-dialog__body {
    padding: 30px 40px 40px 40px;
    background: linear-gradient(180deg, #D6E0FF 0%, #FFFFFF 40%);
    border-radius: 10px;
  }
}

.login-container {
  text-align: center;
}

.login-header {
  margin-bottom: 50px;

  .welcome-text {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
  }

  .app-title {
    font-size: 20px;
    font-weight: 600;
    color: #0256ff;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 16px;
  }

  .login-input {
    ::v-deep .el-input__inner {
      height: 45px;
      line-height: 45px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      background: #fff;
      font-size: 14px;
      padding: 0 15px;

      &::placeholder {
        color: #bfbfbf;
      }

      &:focus {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }
  }

  .code-form-item {
    ::v-deep .el-form-item__content {
      display: flex;
      align-items: center;
    }

    .code-input {
      flex: 1;
      margin-right: 10px;
      ::v-deep .el-input__inner {
        height: 45px;
        line-height: 45px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: #fff;
        font-size: 14px;
        padding: 0 15px;

        &::placeholder {
          color: #bfbfbf;
        }

        &:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }
    }

    .captcha-image {
      width: 120px;
      height: 45px;

      .captcha-img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #d9d9d9;
      }
    }
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;

    .remember-checkbox {
      ::v-deep .el-checkbox__label {
        font-size: 12px;
        color: #666;
      }
    }

    .forgot-password {
      color: #999;
    }
  }

  .login-button {
    width: 100%;
    height: 45px;
    font-size: 16px;
    border-radius: 4px;
    background: #0256ff;
    border-color: #0256ff;
    margin-bottom: 16px;

    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }

    &:active {
      background: #096dd9;
      border-color: #096dd9;
    }
  }
}
</style>
