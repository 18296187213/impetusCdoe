<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="title-col" @click.native="handleBack">
        <i class="el-icon-back"></i>
        <el-button type="text">{{
          routerData.name
        }}</el-button>
      </el-col>
      <el-col :span="22">
        <el-form
          :model="queryParams"
          ref="queryForm"
          size="small"
          :inline="true"
          v-show="showSearch"
          label-width="68px"
          @submit.native.prevent
        >
          <el-form-item label="模块名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入模块名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="2" style="text-align: right">
        <el-button type="primary" size="mini" @click="handleAdd"
          >新建模块</el-button
        >
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableList" stripe>
      <el-table-column label="模块名称" align="center" prop="name" />
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

    <!-- 添加或修改模块对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模块名称" />
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
  listModule,
  delModule,
  addModule,
  updateModule,
} from "@/api/projectMgt/modules";

export default {
  name: "Module",
  data() {
    return {
      routerData: {
        name: undefined,
        projectId: undefined,
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
        projectsId: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "模块名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.routerData = this.$route.query;
    if (this.routerData.projectId) {
      this.queryParams.projectsId = this.routerData.projectId;
      this.form.projectsId = this.routerData.projectId;
      this.getList();
    }
  },
  methods: {
    handleBack() {
      this.$router.push({ path: "/projectMgt/index" });
    },
    /** 查询table列表 */
    getList() {
      this.loading = true;
      listModule(this.queryParams).then((response) => {
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
        projectsId: this.routerData.projectId,
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
      this.title = "添加模块";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = { ...row };
      this.open = true;
      this.title = "修改模块";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateModule(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addModule(this.form).then((response) => {
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
        .confirm('是否确认删除模块名称为"' + row.name + '"的数据项？')
        .then(function () {
          return delModule(id);
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
