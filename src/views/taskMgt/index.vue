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
        >
          <el-form-item label="所属项目" prop="projectsId">
            <el-select
              v-model="queryParams.projectsId"
              placeholder="请选择所属项目"
              clearable
              filterable
              @change="handleQuery"
            >
              <el-option
                v-for="item in projectOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指派人员" prop="workUserId">
            <el-select
              v-model="queryParams.workUserId"
              placeholder="请选择指派人员"
              clearable
              filterable
              @change="handleQuery"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.nickName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="任务状态"
              clearable
              @change="handleQuery"
            >
              <el-option label="未开始" :value="0" />
              <el-option label="进行中" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取消" :value="3" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="2" style="text-align: right">
        <el-button type="primary" size="mini" @click="handleAdd"
          >新建任务</el-button
        >
      </el-col>
    </el-row>

    <!-- 卡片列表 -->
    <div v-loading="loading" class="task-card-container">
      <div class="card-container">
        <div v-for="item in tableList" :key="item.noticeId" class="task-card">
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="task-info">
              <svg-icon icon-class="task-title" style="font-size: 18px" />
              <span class="task-title title-ellipsis">{{ item.name }}</span>
              <el-tag
                :type="getStatusType(item.status)"
                size="mini"
                class="status-tag"
              >
                {{ getStatusText(item.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 卡片内容 -->
          <div class="card-content">
            <div class="info-row">
              <span class="label">所属项目</span>
              <span class="value">{{ item.projectsName }}</span>
            </div>
            <div class="info-row">
              <span class="label">指派人员</span>
              <span class="value">{{ item.workUserName }}</span>
            </div>
            <div class="info-row">
              <span class="label">所属模块</span>
              <span class="value">{{ item.modulesName }}</span>
            </div>
            <div class="info-row">
              <span class="label">完成时间</span>
              <span class="value">{{ item.deadline }}</span>
            </div>
            <div class="info-row">
              <span class="label">任务内容</span>
              <span class="value content-text title-ellipsis-single">{{
                item.content
              }}</span>
            </div>
          </div>

          <!-- 卡片操作按钮 -->
          <div class="card-actions">
            <div class="actions-left">
              <svg-icon
                icon-class="delete-task"
                @click.stop="handleDelete(item)"
              />
            </div>
            <div class="actions-right">
              <el-button
                size="mini"
                type="primary"
                plain
                @click.stop="handleUpdate(item)"
              >
                编辑
              </el-button>
              <!-- <el-button
                size="mini"
                type="primary"
                @click.stop="handleViewDetail(item)"
              >
                详情
              </el-button> -->
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!tableList.length && !loading" class="empty-state">
        <i class="el-icon-document"></i>
        <p>暂无任务数据</p>
      </div>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :page-sizes="[12, 24, 36]"
      @pagination="getList"
    />

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="small"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="任务标题" prop="name">
              <el-input v-model="form.name" placeholder="请输入任务标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指派人员" prop="workUserId">
              <el-select
                v-model="form.workUserId"
                placeholder="请选择指派人员"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="deadline">
              <el-date-picker
                v-model="form.deadline"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择截止时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属项目" prop="projectsId">
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
            <el-form-item label="所属模块" prop="modulesId">
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
          <el-col :span="24">
            <el-form-item label="任务内容" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                placeholder="请输入任务内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" size="small"
          >确 定</el-button
        >
        <el-button @click="cancel" size="small">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTask, delTask, addTask, updateTask } from "@/api/taskMgt/index";
import { listProject } from "@/api/projectMgt/index";
import { listUser } from "@/api/system/user";
import { listModule } from "@/api/projectMgt/modules";

export default {
  name: "taskMgt",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务表格数据
      tableList: [],
      // 项目列表
      projectOptions: [],
      // 用户列表
      userOptions: [],
      // 模块列表
      moduleOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 12,
        projectsId: undefined,
        workUserId: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "任务标题不能为空", trigger: "blur" },
        ],
        workUserId: [
          { required: true, message: "指派人员不能为空", trigger: "change" },
        ],
        deadline: [
          { required: true, message: "截止时间不能为空", trigger: "change" },
        ],
        projectsId: [
          { required: true, message: "请选择所属项目", trigger: "change" },
        ],
        modulesId: [
          { required: true, message: "请选择所属模块", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getProjectList();
    this.getUserList();
  },
  methods: {
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
    /** 获取用户列表 */
    getUserList() {
      listUser().then((response) => {
        this.userOptions = response.rows;
      });
    },
    /** 获取项目列表 */
    getProjectList() {
      listProject().then((response) => {
        this.projectOptions = response.rows;
      });
    },
    /** 查询任务列表 */
    getList() {
      this.loading = true;
      listTask(this.queryParams).then((response) => {
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
        name: undefined,
        projectsId: undefined,
        workUserId: undefined,
        modulesId: undefined,
        status: "0",
        deadline: undefined,
        content: undefined,
      };
      this.resetForm("form");
      // 重置时清空模块选项
      this.moduleOptions = [];
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
      this.title = "添加任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = { ...row };
      // 如果有项目ID，加载对应的模块列表
      if (this.form.projectsId) {
        this.getModuleList(this.form.projectsId);
      }
      this.open = true;
      this.title = "修改任务";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTask(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTask(this.form).then((response) => {
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
        .confirm('是否确认删除任务名称为"' + row.name + '"的数据项？')
        .then(function () {
          return delTask(row.id);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 获取状态类型 */
    getStatusType(status) {
      const statusMap = {
        0: "info", // 未开始
        1: "warning", // 进行中
        2: "success", // 已完成
        3: "danger", // 已取消
      };
      return statusMap[status] || "info";
    },
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        0: "未开始",
        1: "进行中",
        2: "已完成",
        3: "已取消",
      };
      return statusMap[status] || "未开始";
    },
    /** 查看详情 */
    handleViewDetail(row) {
      this.handleUpdate(row);
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
  /* height: 260px; */
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
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.actions-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 26px;
  opacity: 1;
  background: #f1f1f1;
}

.actions-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 200px 20px;
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

/* 标题文本限制一行显示 */
.title-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 1.4em; /* 1行的高度 */
  word-break: break-word;
}

/* 内容文本限制一行显示 */
.title-ellipsis-single {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 1.4em; /* 1行的高度 */
  word-break: break-word;
  white-space: nowrap;
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
