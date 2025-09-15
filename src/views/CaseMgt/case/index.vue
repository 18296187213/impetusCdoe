<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="title-col">
        <i class="el-icon-back"></i>
        <el-button type="text" @click="handleBack">{{
          routerData.name
        }}</el-button>
      </el-col>

      <el-col :span="24" style="text-align: right">
        <el-button type="primary" size="mini" @click="handleAdd"
          >新建用例</el-button
        >
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableList">
      <el-table-column label="测试内容" align="center" prop="content" />
      <el-table-column label="测试步骤" align="center" prop="procedures" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改用例对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
        <el-form-item label="用例名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入用例名称" />
        </el-form-item>
        <el-form-item label="用例步骤" prop="procedures">
          <el-input v-model="form.procedures" placeholder="请输入用例步骤" />
        </el-form-item>
        <el-form-item label="用例内容" prop="content">
          <el-input v-model="form.content" placeholder="请输入用例内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="submitForm">确 定</el-button>
        <el-button size="small" @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCase,
  delCase,
  addCase,
  updateCase,
} from "@/api/projectMgt/case";

export default {
  name: "Case",
  data() {
    return {
      routerData: {
        name: undefined,
        modulesId: undefined,
        projectsId: undefined,
        projectName: undefined,
      },
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      tableList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        modulesId: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "用例名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.routerData = this.$route.query;
    console.log("🚀 ~ :118 ~ created ~ this.routerData:", this.routerData)
    if (this.routerData.modulesId) {
      this.queryParams.modulesId = this.routerData.modulesId;
      this.form.modulesId = this.routerData.modulesId;
      this.form.projectsId = this.routerData.projectsId;
      this.getList();
    }
  },
  methods: {
    handleBack() {
      // 返回到模块页面时需要传递projectId和name参数
      this.$router.push({
        path: "/CaseMgt/caseModule/index",
        query: {
          projectsId: this.routerData.projectsId,
          name: this.routerData.projectName
        }
      });
    },
    /** 查询table列表 */
    getList() {
      this.loading = true;
      listCase(this.queryParams).then((response) => {
        this.tableList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        modulesId: this.routerData.modulesId,
        projectsId: this.routerData.projectsId,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用例";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = { ...row };
      this.open = true;
      this.title = "修改用例";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateCase(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCase(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal
        .confirm('是否确认删除用例名称为"' + row.name + '"的数据项？')
        .then(function () {
          return delCase(id);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.title-col {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  font-size: 18px;
  font-weight: bold;

  .el-icon-back {
    font-size: 20px;
    color: #0052d9;
    margin-right: 8px;
  }
}
</style>
