<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="60%" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
      <el-row>
        <el-col :span="24">
          <el-form-item label="用例内容" prop="content">
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
              <el-form-item label="测试步骤" prop="procedures">
                <el-input
                  v-for="(step, index) in form.procedures"
                  :key="index"
                  v-model="form.procedures[index]"
                  type="textarea"
                  :rows="2"
                  class="step-input"
                  style="margin-bottom: 10px"
                  placeholder="请输入测试步骤"
                ></el-input>
                <el-button type="text" @click="addStep">+ 添加步骤</el-button>
                <el-button v-if="form.procedures.length > 1" type="text" @click="removeStep" style="color: #f56c6c; margin-left: 10px">- 删除步骤</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row>
            <el-col :span="24">
              <el-form-item label="预期结果" prop="expected">
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
      <el-button size="small" type="primary" @click="handleSubmit">确 定</el-button>
      <el-button size="small" @click="handleCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CaseFormDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    routerData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {
        id: undefined,
        modulesId: undefined,
        projectsId: undefined,
        procedures: [''],
        expected: [''],
        content: undefined,
      },
      rules: {
        content: [
          { required: true, message: "用例内容不能为空", trigger: "blur" },
        ],
        procedures: [
          { required: true, message: "用例步骤不能为空", trigger: "blur" },
        ],
        expected: [
          { required: true, message: "预期结果不能为空", trigger: "blur" },
        ],
      },
    }
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
    visible(newVal) {
      if (newVal) {
        this.resetForm();
        if (this.formData && Object.keys(this.formData).length > 0) {
          // 深拷贝避免数据污染
          this.form = {
            ...this.formData,
            procedures: [...this.formData.procedures],
            expected: [...this.formData.expected]
          };
        } else {
          this.form.modulesId = this.routerData.modulesId;
          this.form.projectsId = this.routerData.projectsId;
        }
      }
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      this.form = {
        id: undefined,
        modulesId: this.routerData.modulesId,
        projectsId: this.routerData.projectsId,
        procedures: [''],
        expected: [''],
        content: undefined,
      };
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },
    // 添加步骤
    addStep() {
      this.form.procedures.push("");
    },
    // 删除步骤
    removeStep() {
      if (this.form.procedures.length > 1) {
        this.form.procedures.pop();
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
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 过滤空值并转换为字符串格式
          const submitData = {
            ...this.form,
            procedures: JSON.stringify(this.form.procedures.filter(item => item.trim())),
            expected: JSON.stringify(this.form.expected.filter(item => item.trim()))
          };
          this.$emit('submit', submitData);
        }
      });
    },
    // 取消
    handleCancel() {
      this.dialogVisible = false;
    }
  }
}
</script>

<style lang="scss" scoped>
// 编辑对话框样式
.dialog-footer {
  text-align: right;
}

.step-input,
.expected-input {
  ::v-deep .el-textarea__inner {
    border-radius: 6px;
  }
}
</style>
