<template>
  <el-dialog
    title="修改状态"
    :visible.sync="visible"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
    >
      <el-form-item label="当前状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="实际情况" prop="actualSituation">
        <el-input
          v-model="form.actualSituation"
          type="textarea"
          :rows="4"
          placeholder="请输入实际情况"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取 消</el-button>
      <el-button size="small" type="primary" @click="handleSave" :loading="loading">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateUserTask } from "@/api/taskMgt/index";

export default {
  name: "StatusEditDialog",
  data() {
    return {
      visible: false,
      loading: false,
      form: {
        id: null,
        status: null,
        actualSituation: ''
      },
      rules: {
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        actualSituation: [
          { required: true, message: '请输入实际情况', trigger: 'blur' }
        ]
      },
      statusOptions: [
        { value: 0, label: '待测试' },
        { value: 1, label: '通过' },
        { value: 2, label: '未通过' },
        { value: 3, label: '未完成' }
      ]
    };
  },
  methods: {
    // 打开弹窗
    open(row) {
      this.form = {
        id: row.id,
        status: row.status,
        actualSituation: row.actualSituation || ''
      };
      this.visible = true;
    },
    // 关闭弹窗
    handleClose() {
      this.visible = false;
      this.resetForm();
    },
    // 重置表单
    resetForm() {
      this.$refs.form.resetFields();
      this.form = {
        id: null,
        status: null,
        actualSituation: ''
      };
    },
    // 保存
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          // 这里调用API接口保存数据
          updateUserTask(this.form).then(() => {
            this.$message.success('保存成功');
            this.$emit('success', this.form);
            this.handleClose();
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
