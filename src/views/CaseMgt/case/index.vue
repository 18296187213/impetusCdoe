<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="title-col" @click.native="handleBack">
        <i class="el-icon-back"></i>
        <el-button type="text">{{
          routerData.name
        }}</el-button>
      </el-col>

      <el-col :span="24" style="text-align: right">
        <el-button type="primary" size="mini" @click="handleAdd"
          >新建用例</el-button
        >
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableList" border style="width: 100%">
      <el-table-column prop="content" label="测试内容" min-width="200">
        <template slot-scope="scope">
          <div class="content-text">
            {{ scope.row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="procedures" label="测试步骤" min-width="300">
        <template slot-scope="scope">
          <div class="steps-content">
            <div
              v-for="(step, index) in scope.row.procedures"
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
      <el-table-column label="创建时间" align="center" width="160" prop="createTime" />
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="handleDelete(scope.row)"
            style="color: #f56c6c"
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
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body>
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
      form: {
        procedures: [''],
        expected: [''],
      },
      // 表单校验
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
    };
  },
  created() {
    this.routerData = this.$route.query;
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
        this.tableList = response.rows.map(item => ({
          ...item,
          procedures: JSON.parse(item.procedures),
          expected: JSON.parse(item.expected),
        }));
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
        modulesId: this.routerData.modulesId,
        projectsId: this.routerData.projectsId,
        procedures: [''],
        expected: [''],
        content: undefined,
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
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 过滤空值并转换为字符串格式
          const submitData = {
            ...this.form,
            procedures: JSON.stringify(this.form.procedures.filter(item => item.trim())),
            expected: JSON.stringify(this.form.expected.filter(item => item.trim()))
          };

          if (this.form.id != undefined) {
            updateCase(submitData).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCase(submitData).then((response) => {
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

// 表格样式
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
