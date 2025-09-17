<template>
  <!-- 保存用例对话框 -->
  <el-dialog title="保存用例" :visible.sync="dialogVisible" width="480px" @close="handleClose">
    <el-form :model="form" label-width="80px" size="small">
      <el-row>
        <el-col :span="24">
          <el-form-item label="所属项目">
            <el-select
              v-model="form.projectsId"
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
              v-model="form.modulesId"
              placeholder="请选择所属模块"
              clearable
              filterable
              style="width: 100%"
              :disabled="!form.projectsId"
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
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listProject } from "@/api/projectMgt/index";
import { listModule } from "@/api/projectMgt/modules";

export default {
  name: "SaveCaseDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    testCases: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        projectsId: undefined,
        modulesId: undefined,
      },
      // 项目列表
      projectOptions: [],
      // 模块列表
      moduleOptions: [],
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
    visible(newVal) {
      if (newVal) {
        this.resetForm();
        this.getProjectList();
      }
    }
  },
  methods: {
    /** 获取项目列表 */
    getProjectList() {
      let params = {
        pageNum: 1,
        pageSize: 9999,
      }
      listProject(params).then((response) => {
        this.projectOptions = response.rows;
      });
    },
    /** 获取模块列表 */
    getModuleList(projectsId) {
      // 如果没有传入项目ID，则使用表单中的项目ID
      const projectId = projectsId || this.form.projectsId;
      if (!projectId) {
        this.moduleOptions = [];
        return;
      }
      let params = {
        projectsId: projectId,
        pageNum: 1,
        pageSize: 9999,
      };
      listModule(params).then((response) => {
        this.moduleOptions = response.rows;
      });
    },
    /** 处理项目选择变化 */
    handleProjectChange(projectsId) {
      // 清空之前选择的模块
      this.form.modulesId = undefined;
      // 根据选择的项目获取对应的模块列表
      this.getModuleList(projectsId);
    },
    /** 重置表单 */
    resetForm() {
      this.form = {
        projectsId: undefined,
        modulesId: undefined,
      };
      this.moduleOptions = [];
    },
    /** 处理取消 */
    handleCancel() {
      this.dialogVisible = false;
    },
    /** 处理关闭 */
    handleClose() {
      this.resetForm();
    },
    /** 处理确认保存 */
    handleConfirm() {
      if (!this.form.projectsId) {
        this.$message.warning("请选择所属项目！");
        return;
      }
      if (!this.form.modulesId) {
        this.$message.warning("请选择所属模块！");
        return;
      }

      // 触发保存事件，将表单数据和测试用例传递给父组件
      this.$emit('save', {
        projectsId: this.form.projectsId,
        modulesId: this.form.modulesId,
        testCases: this.testCases
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
