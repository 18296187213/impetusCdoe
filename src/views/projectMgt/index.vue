<template>
  <div class="app-container">
    <el-row>
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
          <el-form-item label="项目名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入项目名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="2" style="text-align: right">
        <el-button type="primary" size="mini" @click="handleAdd"
          >新建项目</el-button
        >
      </el-col>
    </el-row>

    <!-- 卡片列表 -->
    <div v-loading="loading" class="task-card-container">
      <div class="card-container">
      <div v-for="item in tableList" :key="item.id" class="task-card">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="task-info">
            <svg-icon icon-class="project" style="font-size: 18px;" />
            <span class="task-title">{{ item.name }}</span>
            <el-popover
              placement="bottom-end"
              width="80"
              trigger="click"
              :ref="'popover' + item.id"
              popper-class="custom-popover"
            >
              <div class="action-menu">
                <div class="action-item" @click="handleUpdate(item)">
                  <i class="el-icon-edit"></i>
                  <span>编辑</span>
                </div>
                <div class="action-item" @click="handleDeleteWithClose(item)">
                  <i class="el-icon-delete"></i>
                  <span>删除</span>
                </div>
              </div>
              <i
                slot="reference"
                class="el-icon-more action-icon"
                style="transform: rotate(90deg)"
                @click.stop
              ></i>
            </el-popover>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="info-row">
            <span class="label">创建日期</span>
            <span class="value">{{ item.createTime }}</span>
          </div>
          <div class="info-row">
            <span class="label">用例数量</span>
            <span class="value">{{ item.testNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">负责人</span>
            <span class="value">{{ item.headName }}</span>
          </div>
        </div>

        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <el-button
            size="mini"
            type="primary"
            @click.stop="handleViewDetail(item)"
          >
            详情
          </el-button>
        </div>
      </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!tableList.length && !loading" class="empty-state">
        <i class="el-icon-document"></i>
        <p>暂无项目数据</p>
      </div>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="450px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="submitForm"
          >确 定</el-button
        >
        <el-button size="small" @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listProject,
  delProject,
  addProject,
  updateProject,
} from "@/api/projectMgt/index";

export default {
  name: "ProjectMgt",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 项目表格数据
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
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "项目名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询项目列表 */
    getList() {
      this.loading = true;
      listProject(this.queryParams).then((response) => {
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
      this.title = "添加项目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      // 关闭弹窗
      this.$refs["popover" + id][0].doClose();
        this.form.name = row.name;
        this.form.id = row.id
        this.open = true;
        this.title = "修改项目";
    },
    /** 删除按钮操作（带关闭弹窗） */
    handleDeleteWithClose(row) {
      const id = row.id;
      // 关闭弹窗
      this.$refs["popover" + id][0].doClose();
      this.handleDelete(row);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateProject(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProject(this.form).then((response) => {
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
      this.$modal
        .confirm('是否确认删除项目名称为"' + row.name + '"的数据项？')
        .then(function () {
          return delProject(row.id);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 查看详情 */
    handleViewDetail(row) {
      this.$router.push({
        path: '/projectMgt/modules/index',
        query: {
          projectId: row.id,
          name: row.name
        }
      });
    },
  },
};
</script>

<style scoped>
.task-card-container {
  height: calc(100vh - 230px);
  overflow: auto;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.task-card {
  height: 210px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px 16px 10px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.task-card.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.card-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #d8d8d8;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.status-tag {
  margin-left: auto;
}

.card-content {
  margin-top: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  font-size: 14px;
  width: 80px;
  flex-shrink: 0;
  margin-right: 8px;
}

.value {
  color: #606266;
  font-size: 14px;
  flex: 1;
  word-break: break-all;
}

.content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-card-container {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 0;
  }

  .task-card {
    padding: 12px;
  }

  .label {
    width: 70px;
    font-size: 13px;
  }

  .value {
    font-size: 13px;
  }

  .task-title {
    font-size: 15px;
  }
}

/* 操作菜单样式 */
.action-menu {
  padding: 4px 0;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 0;
}

.action-item:hover {
  background-color: #f5f7fa;
}

.action-item i {
  margin-right: 8px;
  font-size: 14px;
}

.action-item span {
  font-size: 14px;
  color: #606266;
}

.action-item:hover span {
  color: #409eff;
}

.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-icon:hover {
  background-color: #f5f7fa;
}

@media (max-width: 480px) {
  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .label {
    width: auto;
    margin-right: 0;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .el-button {
    width: 100%;
  }
}
</style>

<style>
/* 全局弹窗样式 */
.custom-popover {
  min-width: 80px !important;
  width: 80px !important;
  padding: 0 !important;
}
</style>
