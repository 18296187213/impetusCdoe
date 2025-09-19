<template>
  <div class="chat-container">
    <!-- 对话内容区域 - 动态高度，支持滚动 -->
    <div class="chat-content" ref="chatContent">
      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="welcome-text">
          <h3 class="ai-title">Hi-我是AI助手</h3>
        </div>
      </div>

      <!-- 对话消息列表 -->
      <div v-else class="message-list">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-item', message.type]"
        >
          <div class="message-content">
            <div class="message-text">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ message.time }}
            </div>
          </div>
        </div>

        <!-- 加载状态  -->
        <div v-if="loading" class="message-item">
          <div class="loading-content">
            <img
              src="@/assets/images/loading.gif"
              alt="加载中"
              class="loading-gif"
            />
            <span class="loading-text">正在回答中,请稍后...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 - 固定高度 -->
    <div class="bottom-input-section">
      <div class="input-wrapper">
        <div class="textarea-container">
          <div class="select-container">
            <el-select v-model="agreement" size="small" placeholder="请选择">
              <el-option
                v-for="item in agreementOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-select v-model="env" size="small" placeholder="请选择">
              <el-option
                v-for="item in envOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              size="small"
              v-model="device"
              placeholder="输入设备号，多个号码逗号分隔"
            ></el-input>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="5"
            placeholder="请发送接口内容"
            class="input-textarea"
            @keydown.native="handleKeydown"
          ></el-input>
          <div
            @click="handleSend"
            :class="['send-btn', { disabled: !inputText.trim() || loading }]"
          >
            <svg-icon icon-class="case-send" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 *@Date: 2025-09-09 20:45:39
 *@Description: AI生成用例
 */

import { aiStream } from "@/api/aiStream";
export default {
  name: "AiStream",
  data() {
    return {
      device: "",
      env: "测试环境:",
      envOptions: [
        { value: "测试环境:", label: "测试环境" },
        { value: "生产环境:", label: "生产环境" },
      ],
      agreementOptions: [
        { value: "JT808协议:", label: "部标协议" },
        { value: "2929协议:", label: "2929协议" },
        { value: "V3协议:", label: "V3协议" },
        { value: "穿戴类设备:", label: "穿戴类设备" },
        { value: "接口测试:", label: "接口测试" },
      ],
      agreement: "JT808协议:",
      inputText: "",
      messages: [], // 对话消息列表
      loading: false,
    };
  },

  methods: {
    // 格式化时间
    formatTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const chatContent = this.$refs.chatContent;
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight;
        }
      });
    },

    // 处理键盘事件
    handleKeydown(event) {
      // Enter键发送消息（不包含Ctrl）
      if (event.key === "Enter" && !event.ctrlKey) {
        event.preventDefault(); // 阻止默认换行行为
        this.handleSend();
      }
      // Ctrl+Enter键换行
      else if (event.key === "Enter" && event.ctrlKey) {
        // 手动插入换行符
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // 在光标位置插入换行符
        this.inputText =
          value.substring(0, start) + "\n" + value.substring(end);

        // 设置光标位置到换行符后面
        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        });

        event.preventDefault(); // 阻止默认行为
      }
    },

    // 处理发送按钮点击
    handleSend() {
      if (!this.inputText.trim() || this.loading) return;

      const userMessage = {
        type: "user",
        content: this.agreement + this.inputText,
        time: this.formatTime(),
      };

      // 添加用户消息
      this.messages.push(userMessage);
      const currentInput = this.agreement + this.inputText;
      this.inputText = "";
      this.scrollToBottom();

      this.loading = true;
      aiStream({
        content: currentInput,
      })
        .then((res) => {
          if (res.code === 200) {
            // 添加AI回复消息
            let content = "抱歉，我没有收到有效的回复。";

            if (res.data.body) {
              if (typeof res.data.body === "string") {
                // 尝试解析是否为JSON字符串
                try {
                  const parsedJson = JSON.parse(res.data.body);
                  // 如果解析成功且是对象，则格式化展示
                  if (typeof parsedJson === "object" && parsedJson !== null) {
                    content = JSON.stringify(parsedJson, null, 2);
                  } else {
                    // 如果解析成功但不是对象，直接展示原字符串
                    content = res.data.body;
                  }
                } catch (e) {
                  // 如果解析失败，说明是普通字符串，直接展示
                  content = res.data.body;
                }
              } else if (typeof res.data.body === "object") {
                // 如果直接是对象，格式化展示
                content = JSON.stringify(res.data.body, null, 2);
              }
            }

            const aiMessage = {
              type: "ai",
              content: content,
              time: this.formatTime(),
            };
            this.messages.push(aiMessage);
            this.loading = false;
            this.scrollToBottom();
          }
        })
        .catch(() => {
          this.loading = false;
          // 添加错误消息
          const errorMessage = {
            type: "ai",
            content: "抱歉，服务暂时不可用，请稍后重试。",
            time: this.formatTime(),
          };
          this.messages.push(errorMessage);
          this.scrollToBottom();
          this.$message.error("发送失败，请重试！");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-container {
  height: 94vh;
  display: flex;
  flex-direction: column;
}

// 对话内容区域 - 动态高度，支持滚动
.chat-content {
  flex: 1;
  width: 1120px;
  margin: 0 auto;
  overflow-y: auto;
  padding: 20px;
  margin-top: 50px;
  border-radius: 8px 8px 0 0;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #909399;
}

.welcome-text {
  text-align: center;

  h3 {
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: 500;
    color: #303133;
  }

  .ai-title {
    font-size: 30px;
    font-weight: 600;
    background: linear-gradient(135deg, #69e4e5 0%, #9a37ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px 0;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: #909399;
  }
}

// 消息列表
.message-list {
  padding-bottom: 20px;
}

.message-item {
  margin-bottom: 20px;
  display: flex;

  &.user {
    justify-content: flex-end;

    .message-content {
      background: #edf3fe;
      border-radius: 18px 18px 4px 18px;
      max-width: 70%;
    }
  }

  &.ai {
    justify-content: flex-start;

    .message-content {
      background: white;
      color: #303133;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e4e7ed;
      max-width: 70%;
    }
  }
}

.message-content {
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}

// 加载状态
.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-gif {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.loading-text {
  color: #909399;
  font-size: 14px;
}

// 底部输入区域 - 固定高度
.bottom-input-section {
  height: 248px;
  width: 1120px;
  margin: 0 auto;
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 20px;
}

.input-wrapper {
  height: 100%;
}

.textarea-container {
  position: relative;
  height: 100%;

  .select-container {
    display: flex;
    gap: 10px;
  }

  .el-select {
    margin-bottom: 12px;
  }
}

.input-textarea {
  width: 100%;
  height: 100%;

  ::v-deep .el-textarea__inner {
    border-radius: 10px;
    border: 1px solid #dcdfe6;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    height: 170px !important;
    padding-right: 50px; // 为按钮预留空间

    &:focus {
      border-color: #409eff;
    }
  }
}

.send-btn {
  position: absolute;
  right: 8px;
  bottom: 0;
  width: 36px;
  height: 36px;
  background: #0256ff;
  border: none;
  border-radius: 25%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #66b1ff;
    transform: scale(1.05);
  }

  &.disabled {
    background: #c0c4cc;
    cursor: not-allowed;
    pointer-events: none;
  }

  ::v-deep .svg-icon {
    color: white;
    font-size: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-content {
    margin: 10px 10px 0 10px;
    padding: 15px;
  }

  .bottom-input-section {
    margin: 0 10px 10px 10px;
    padding: 15px;
    height: 120px;
  }

  .input-textarea {
    ::v-deep .el-textarea__inner {
      height: 80px !important;
      padding-right: 45px; // 移动端稍微减少右边距
    }
  }

  .send-btn {
    width: 32px;
    height: 32px;
    right: 6px;
    bottom: 6px;

    ::v-deep .svg-icon {
      font-size: 14px;
    }
  }

  .message-item {
    &.user .message-content,
    &.ai .message-content {
      max-width: 85%; // 移动端增加最大宽度
    }
  }

  .welcome-text h3 {
    font-size: 20px; // 移动端减小标题字体
  }
}
</style>
