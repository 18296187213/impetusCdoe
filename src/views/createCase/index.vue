<template>
  <div class="create-case-container">
    <!-- 主要内容区域 - 动态高度，支持滚动 -->
    <div class="content-section">
      <!-- 空状态 -->
      <div v-if="testCases.length === 0" class="empty-state">
        <div class="welcome-text">
          <h3>Hi-我是AI用例助手</h3>
        </div>
      </div>

      <!-- 用例列表 -->
      <div v-else class="case-list">
        <div class="case-header">
          <span class="total-count">生成用例：{{ testCases.length }}</span>
          <el-button type="primary" size="small" @click="handleSaveAll"
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
            <el-table-column prop="content" label="测试内容" min-width="200">
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
            @keyup.enter.ctrl="handleSend"
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
    <el-dialog title="编辑用例" :visible.sync="editDialogVisible" width="60%">
      <el-form :model="editForm" label-width="80px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="测试内容">
              <el-input
                v-model="editForm.content"
                type="textarea"
                :rows="3"
                placeholder="请输入测试内容描述"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-row>
              <el-col :span="24">
                <el-form-item label="测试步骤">
                  <el-input
                    v-for="(step, index) in editForm.steps"
                    :key="index"
                    v-model="editForm.steps[index]"
                    type="textarea"
                    :rows="2"
                    class="step-input"
                    style="margin-bottom: 10px"
                    placeholder="请输入测试步骤"
                  ></el-input>
                  <el-button type="text" @click="addStep">+ 添加步骤</el-button>
                  <el-button v-if="editForm.steps.length > 1" type="text" @click="removeStep" style="color: #f56c6c; margin-left: 10px">- 删除步骤</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row>
              <el-col :span="24">
                <el-form-item label="预期结果">
                  <el-input
                    v-for="(result, index) in editForm.expected"
                    :key="index"
                    v-model="editForm.expected[index]"
                    type="textarea"
                    :rows="2"
                    class="expected-input"
                    style="margin-bottom: 10px"
                    placeholder="请输入预期结果"
                  ></el-input>
                  <el-button type="text" @click="addExpected">+ 添加预期结果</el-button>
                  <el-button v-if="editForm.expected.length > 1" type="text" @click="removeExpected" style="color: #f56c6c; margin-left: 10px">- 删除结果</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editDialogVisible = false"
          >取消</el-button
        >
        <el-button size="small" type="primary" @click="handleSaveEdit"
          >保存</el-button
        >
      </div>
    </el-dialog>

    <!-- 保存用例对话框 -->
    <el-dialog title="保存用例" :visible.sync="saveDialogVisible" width="480px">
      <el-form :model="saveForm" label-width="80px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属项目">
              <el-select
                v-model="saveForm.projectsId"
                placeholder="请选择所属项目"
                clearable
                filterable
                style="width: 100%"
                @change="handleProjectChange"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属模块">
              <el-select
                v-model="saveForm.modulesId"
                placeholder="请选择所属模块"
                clearable
                filterable
                style="width: 100%"
                :disabled="!saveForm.projectsId"
              >
                <el-option
                  v-for="item in moduleOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="saveDialogVisible = false"
          >取消</el-button
        >
        <el-button size="small" type="primary" @click="handleSave"
          >保存</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
/*
 *@Date: 2025-09-09 20:45:39
 *@Description: AI生成用例
 */

import { aiCase, saveCase } from "@/api/createCase";
import { listProject } from "@/api/projectMgt/index";
import { listModule } from "@/api/projectMgt/modules";
export default {
  name: "CreateCase",
  data() {
    return {
      inputText: "",
      testCases: [],
      editDialogVisible: false,
      editForm: {
        id: null,
        content: "",
        steps: [],
        expected: [],
      },
      editIndex: -1,
      loading: false,
      saveDialogVisible: false,
      saveForm: {
        projectsId: undefined,
        modulesId: undefined,
      },
      // 项目列表
      projectOptions: [],
      // 模块列表
      moduleOptions: [],
    };
  },
  created() {
    this.getProjectList();
  },
  mounted() {},
  methods: {
    /** 获取项目列表 */
    getProjectList() {
      listProject().then((response) => {
        this.projectOptions = response.rows;
      });
    },
    /** 获取模块列表 */
    getModuleList(projectsId) {
      // 如果没有传入项目ID，则使用表单中的项目ID
      const projectId = projectsId || this.saveForm.projectsId;
      if (!projectId) {
        this.moduleOptions = [];
        return;
      }
      let params = {
        projectsId: projectId,
      };
      listModule(params).then((response) => {
        this.moduleOptions = response.rows;
      });
    },
    /** 处理项目选择变化 */
    handleProjectChange(projectsId) {
      // 清空之前选择的模块
      this.saveForm.modulesId = undefined;
      // 根据选择的项目获取对应的模块列表
      this.getModuleList(projectsId);
    },
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
              content: item.content, // 保留测试内容描述
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
      this.editForm = {
        id: row.id,
        content: row.content || "",
        steps: [...row.steps],
        expected: [...row.expected],
      };
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
    handleSaveEdit() {
      if (this.editIndex !== -1) {
        this.$set(this.testCases, this.editIndex, {
          ...this.editForm,
        });
        this.editDialogVisible = false;
        this.$message.success("保存成功！");
      }
    },

    // 添加步骤
    addStep() {
      this.editForm.steps.push("");
    },

    // 删除步骤
    removeStep() {
      if (this.editForm.steps.length > 1) {
        this.editForm.steps.pop();
      }
    },

    // 添加预期结果
    addExpected() {
      this.editForm.expected.push("");
    },

    // 删除预期结果
    removeExpected() {
      if (this.editForm.expected.length > 1) {
        this.editForm.expected.pop();
      }
    },

    // 保存所有用例
    handleSaveAll() {
      if (this.testCases.length === 0) {
        this.$message.warning("请先生成测试用例！");
        return;
      }
      // 清空表单并打开对话框
      this.saveForm = {
        projectsId: undefined,
        modulesId: undefined,
      };
      this.moduleOptions = []; // 清空模块选项
      this.saveDialogVisible = true;
    },

    // 确认保存用例
    handleSave() {
      if (!this.saveForm.projectsId) {
        this.$message.warning("请选择所属项目！");
        return;
      }
      if (!this.saveForm.modulesId) {
        this.$message.warning("请选择所属模块！");
        return;
      }

      const saveData = {
        projectsId: this.saveForm.projectsId,
        modulesId: this.saveForm.modulesId,
        testCases: this.testCases,
      };
      console.log("🚀 ~ :407 ~ handleSave ~ saveData:", saveData);
      // 循环this.testCases,给每一项添加projectsId、modulesId
      const params = this.testCases.map((item) => {
        console.log("🚀 ~ :406 ~ handleSave ~ item:", item)
        return {
          ...item,
          procedures: JSON.stringify(item.steps),
          expected: JSON.stringify(item.expected),
          projectsId: this.saveForm.projectsId,
          modulesId: this.saveForm.modulesId,
        };
      });
      console.log("🚀 ~ params:", params);

      saveCase(params).then(res => {
        if (res.code === 200) {
          this.$message.success("用例保存成功！");
          this.saveDialogVisible = false;
          // 可以选择清空当前用例列表或保留
          // this.testCases = [];
        }
      }).catch(() => {
        this.$message.error("用例保存失败，请重试！");
      });
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
  overflow-y: auto;
  padding: 20px;
  background: white;
  margin: 20px 20px 0 20px;
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

.welcome-text h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #303133;
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
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  margin: 0 300px 20px 300px;
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

// 编辑对话框
.dialog-footer {
  text-align: right;
}

.step-input,
.expected-input {
  ::v-deep .el-textarea__inner {
    border-radius: 6px;
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
