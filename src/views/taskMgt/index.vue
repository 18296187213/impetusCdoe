<template>
  <div class="app-container">
    <el-row>
      <el-col :span="22">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="所属项目" prop="noticeTitle">
            <el-input
              v-model="queryParams.noticeTitle"
              placeholder="请输入所属项目"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="指派人员" prop="createBy">
            <el-input
              v-model="queryParams.createBy"
              placeholder="请输入指派人员"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="任务状态" prop="noticeType">
            <el-select v-model="queryParams.noticeType" placeholder="任务状态" clearable>
              <el-option
                v-for="dict in dict.type.sys_notice_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="2" style="text-align: right;">
        <el-button type="primary" size="mini" @click="handleAdd">新建任务</el-button>
      </el-col>
    </el-row>

    <!-- 卡片列表 -->
    <div v-loading="loading" class="task-card-container">
      <div
        v-for="item in noticeList"
        :key="item.noticeId"
        class="task-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="task-info">
            <span class="task-title">{{ item.noticeTitle || '我是任务名称1' }}</span>
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
            <span class="value">{{ item.projectName || '我是长长的项目名称' }}</span>
          </div>
          <div class="info-row">
            <span class="label">指派人员</span>
            <span class="value">{{ item.createBy || '陈东西' }}</span>
          </div>
          <div class="info-row">
            <span class="label">指派用例</span>
            <span class="value">{{ item.testCase || 'XXXXXXXXXXX' }}</span>
          </div>
          <div class="info-row">
            <span class="label">完成时间</span>
            <span class="value">{{ parseTime(item.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '2025-01-01 16:21:31' }}</span>
          </div>
          <div class="info-row">
            <span class="label">任务内容</span>
            <span class="value content-text">{{ item.noticeContent || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</span>
          </div>
        </div>

        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <el-button
            size="mini"
            type="primary"
            plain
            @click.stop="handleUpdate(item)"
            v-hasPermi="['system:notice:edit']"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="primary"
            @click.stop="handleViewDetail(item)"
          >
            详情
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!noticeList.length && !loading" class="empty-state">
        <i class="el-icon-document"></i>
        <p>暂无任务数据</p>
      </div>
    </div>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入任务标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择任务类型">
                <el-option
                  v-for="dict in dict.type.sys_notice_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_notice_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice"

export default {
  name: "taskMgt",
  dicts: ['sys_notice_status', 'sys_notice_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务表格数据
      noticeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        noticeTitle: [
          { required: true, message: "任务标题不能为空", trigger: "blur" }
        ],
        noticeType: [
          { required: true, message: "任务类型不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询任务列表 */
    getList() {
      this.loading = true
      listNotice(this.queryParams).then(response => {
        this.noticeList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: undefined,
        status: "0"
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加任务"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const noticeId = row.noticeId
      getNotice(noticeId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改任务"
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.noticeId != undefined) {
            updateNotice(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addNotice(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const noticeIds = row.noticeId
      this.$modal.confirm('是否确认删除任务编号为"' + noticeIds + '"的数据项？').then(function() {
        return delNotice(noticeIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 获取状态类型 */
    getStatusType(status) {
      const statusMap = {
        '0': 'info',    // 未开始
        '1': 'warning', // 进行中
        '2': 'success'  // 已完成
      }
      return statusMap[status] || 'info'
    },
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        '0': '未开始',
        '1': '进行中',
        '2': '已完成'
      }
      return statusMap[status] || '未开始'
    },
    /** 查看详情 */
    handleViewDetail(row) {
      this.handleUpdate(row)
    }
  }
}
</script>

<style scoped>
.task-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 16px 0;
  height: calc(100vh - 230px);
  overflow: auto;
}

.task-card {
  height: 260px;
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
  border-bottom: 1px solid #D8D8D8;
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
