<template>
  <div class="create-case-container">
    <!-- 主要内容区域 - 动态高度，支持滚动 -->
    <div class="content-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <img
            src="@/assets/images/loading.gif"
            alt="加载中"
            class="loading-gif"
          />
          <span class="loading-text">正在生成用例,请稍后...</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="testCases.length === 0 && !loading" class="empty-state">
        <div class="welcome-text">
          <h3 class="ai-title">Hi-我是AI用例助手</h3>
        </div>
      </div>

      <!-- 用例列表 -->
      <div v-if="testCases.length > 0 && !loading" class="case-list">
        <div class="case-header">
          <span class="total-count">生成用例：{{ testCases.length }}</span>
          <el-button type="primary" size="mini" @click="handleSaveAll"
            >保存用例</el-button
          >
        </div>

        <div class="case-table">
          <el-table :data="testCases" border style="width: 100%">
            <el-table-column
              prop="id"
              label="序号"
              width="80"
              align="center"
            ></el-table-column>
            <el-table-column prop="content" label="测试标题" min-width="200">
              <template slot-scope="scope">
                <div class="content-text">
                  {{ scope.row.content }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="steps" label="测试步骤" min-width="300">
              <template slot-scope="scope">
                <div class="steps-content">
                  <div
                    v-for="(step, index) in scope.row.steps"
                    :key="index"
                    class="step-item"
                  >
                    {{ index + 1 }}.{{ step }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="expected" label="预期结果" min-width="300">
              <template slot-scope="scope">
                <div class="expected-content">
                  <div
                    v-for="(result, index) in scope.row.expected"
                    :key="index"
                    class="expected-item"
                  >
                    {{ result }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="handleEdit(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  @click="handleDelete(scope.$index)"
                  style="color: #f56c6c"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 - 固定高度 -->
    <div class="bottom-input-section">
      <div class="input-wrapper">
        <div class="textarea-container">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="5"
            placeholder="请详细描述功能情况"
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

    <!-- 编辑对话框 -->
    <!-- 编辑用例对话框组件 -->
    <EditCaseDialog
      :visible.sync="editDialogVisible"
      :edit-data="editIndex >= 0 ? testCases[editIndex] : {}"
      :edit-index="editIndex"
      @save="handleSaveEdit"
    />

    <!-- 保存用例对话框组件 -->
    <SaveCaseDialog
      :visible.sync="saveDialogVisible"
      :test-cases="testCases"
      @save="handleSave"
    />
  </div>
</template>

<script>
/*
 *@Date: 2025-09-09 20:45:39
 *@Description: AI生成用例
 */

import { aiCase, saveCase } from "@/api/createCase";
import SaveCaseDialog from "./components/SaveCaseDialog.vue";
import EditCaseDialog from "./components/EditCaseDialog.vue";
export default {
  name: "CreateCase",
  components: {
    SaveCaseDialog,
    EditCaseDialog,
  },
  data() {
    return {
      inputText: "",
      testCases: [],
      editDialogVisible: false,
      editIndex: -1,
      loading: false,
      saveDialogVisible: false,
    };
  },

  methods: {
    // 处理发送按钮点击
    handleSend() {
      if (!this.inputText.trim() || this.loading) return;

      this.loading = true;
      aiCase({
        query: this.inputText,
      })
        .then((res) => {
          if (res.code === 200) {
            // 转换接口返回的数据结构以匹配前端显示格式
            const convertedData = res.data.map((item) => ({
              id: item.testId,
              content: item.content, // 保留测试标题描述
              steps: item.procedures, // procedures -> steps
              expected: item.expected,
            }));
            this.testCases = convertedData;
            this.inputText = "";
            this.loading = false;
            this.$message.success("用例生成成功！");
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error("用例生成失败，请重试！");
        });
    },

    // 编辑用例
    handleEdit(row) {
      this.editIndex = this.testCases.findIndex((item) => item.id === row.id);
      this.editDialogVisible = true;
    },

    // 删除用例
    handleDelete(index) {
      this.$confirm("确认删除这个测试用例吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.testCases.splice(index, 1);
          this.$message.success("删除成功！");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },

    // 保存编辑
    handleSaveEdit(data) {
      const { editData, editIndex } = data;
      if (editIndex !== -1) {
        this.$set(this.testCases, editIndex, {
          ...editData,
        });
        this.editDialogVisible = false;
        this.$message.success("保存成功！");
      }
    },

    // 保存所有用例
    handleSaveAll() {
      if (this.testCases.length === 0) {
        this.$message.warning("请先生成测试用例！");
        return;
      }
      this.saveDialogVisible = true;
    },

    // 确认保存用例
    handleSave(saveData) {
      const { projectsId, modulesId, testCases } = saveData;

      // 循环testCases,给每一项添加projectsId、modulesId
      const params = testCases.map((item) => {
        return {
          ...item,
          procedures: JSON.stringify(item.steps),
          expected: JSON.stringify(item.expected),
          projectsId: projectsId,
          modulesId: modulesId,
        };
      });

      saveCase(params)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("用例保存成功！");
            this.saveDialogVisible = false;
            // 可以选择清空当前用例列表或保留
            // this.testCases = [];
          }
        })
        .catch(() => {
          this.$message.error("用例保存失败，请重试！");
        });
    },

    // 处理键盘事件
    handleKeydown(event) {
      // Enter键发送消息（不包含Ctrl）
      if (event.key === 'Enter' && !event.ctrlKey) {
        event.preventDefault(); // 阻止默认换行行为
        this.handleSend();
      }
      // Ctrl+Enter键换行
      else if (event.key === 'Enter' && event.ctrlKey) {
        // 手动插入换行符
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // 在光标位置插入换行符
        this.inputText = value.substring(0, start) + '\n' + value.substring(end);

        // 设置光标位置到换行符后面
        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        });

        event.preventDefault(); // 阻止默认行为
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.create-case-container {
  height: 94vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// 主要内容区域 - 动态高度，支持滚动
.content-section {
  flex: 1;
  width: 1120px;
  overflow-y: auto;
  padding: 20px;
  padding-top: 80px;
  background: white;
  margin: 0 auto;
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
  margin: 0;
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

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

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

// 用例列表
.case-list {
  .case-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .total-count {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }
}

.case-table {
  ::v-deep .el-table {
    border-radius: 8px;
    overflow: hidden;

    .el-table__header {
      background-color: #f8f9fa;

      th {
        background-color: #f8f9fa;
        color: #606266;
        font-weight: 500;
      }
    }

    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

.content-text {
  line-height: 1.5;
  color: #303133;
  font-weight: 500;
}

.steps-content,
.expected-content {
  .step-item,
  .expected-item {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #606266;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 底部输入区域 - 固定高度
.bottom-input-section {
  height: 200px;
  width: 1120px;
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  margin: 0 auto;
}

.input-wrapper {
  height: 100%;
}

.textarea-container {
  position: relative;
  height: 100%;
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
  .content-section {
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

  .case-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
