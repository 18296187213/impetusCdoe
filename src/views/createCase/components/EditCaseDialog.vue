<template>
  <!-- 编辑用例对话框 -->
  <el-dialog title="编辑用例" :visible.sync="dialogVisible" width="60%" @close="handleClose">
    <el-form :model="form" label-width="80px" size="small">
      <el-row>
        <el-col :span="24">
          <el-form-item label="测试内容">
            <el-input
              v-model="form.content"
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
                  v-for="(step, index) in form.steps"
                  :key="index"
                  v-model="form.steps[index]"
                  type="textarea"
                  :rows="2"
                  class="step-input"
                  style="margin-bottom: 10px"
                  placeholder="请输入测试步骤"
                ></el-input>
                <el-button type="text" @click="addStep">+ 添加步骤</el-button>
                <el-button v-if="form.steps.length > 1" type="text" @click="removeStep" style="color: #f56c6c; margin-left: 10px">- 删除步骤</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row>
            <el-col :span="24">
              <el-form-item label="预期结果">
                <el-input
                  v-for="(result, index) in form.expected"
                  :key="index"
                  v-model="form.expected[index]"
                  type="textarea"
                  :rows="2"
                  class="expected-input"
                  style="margin-bottom: 10px"
                  placeholder="请输入预期结果"
                ></el-input>
                <el-button type="text" @click="addExpected">+ 添加预期结果</el-button>
                <el-button v-if="form.expected.length > 1" type="text" @click="removeExpected" style="color: #f56c6c; margin-left: 10px">- 删除结果</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "EditCaseDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: () => ({
        id: null,
        content: "",
        steps: [],
        expected: []
      })
    },
    editIndex: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      form: {
        id: null,
        content: "",
        steps: [],
        expected: []
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    editData: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.form = {
            id: newVal.id,
            content: newVal.content || "",
            steps: [...(newVal.steps || [])],
            expected: [...(newVal.expected || [])]
          };
        }
      },
      deep: true,
      immediate: true
    },
    visible(newVal) {
      if (newVal && this.editData) {
        this.form = {
          id: this.editData.id,
          content: this.editData.content || "",
          steps: [...(this.editData.steps || [])],
          expected: [...(this.editData.expected || [])]
        };
      }
    }
  },
  methods: {
    // 添加步骤
    addStep() {
      this.form.steps.push("");
    },

    // 删除步骤
    removeStep() {
      if (this.form.steps.length > 1) {
        this.form.steps.pop();
      }
    },

    // 添加预期结果
    addExpected() {
      this.form.expected.push("");
    },

    // 删除预期结果
    removeExpected() {
      if (this.form.expected.length > 1) {
        this.form.expected.pop();
      }
    },

    /** 处理取消 */
    handleCancel() {
      this.dialogVisible = false;
    },

    /** 处理关闭 */
    handleClose() {
      // 重置表单数据
      this.form = {
        id: null,
        content: "",
        steps: [],
        expected: []
      };
    },

    /** 处理确认保存 */
    handleConfirm() {
      // 触发保存事件，将编辑后的数据和索引传递给父组件
      this.$emit('save', {
        editData: { ...this.form },
        editIndex: this.editIndex
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

.step-input {
  .el-textarea__inner {
    border: 1px dashed #d9d9d9;
    &:focus {
      border-color: #409eff;
    }
  }
}

.expected-input {
  .el-textarea__inner {
    border: 1px dashed #d9d9d9;
    &:focus {
      border-color: #409eff;
    }
  }
}
</style>