<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="title-col">
        <i class="el-icon-back" @click="handleBack"></i>
        <el-button type="text" @click="handleBack">{{
          routerData.name
        }}</el-button>
      </el-col>
    </el-row>
    <!-- 数据统计展示 -->
    <div class="data-overview">
      <div class="stat-item">
        <span class="stat-label">已通过</span>
        <span class="stat-number passed">{{ passedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">未通过</span>
        <span class="stat-number failed">{{ failedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">未测试</span>
        <span class="stat-number pending">{{ pendingCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">未完成</span>
        <span class="stat-number incomplete">{{ incompleteCount }}</span>
      </div>
      <el-button type="primary" size="mini" @click="handleSubmit"
        >提交任务</el-button
      >
    </div>
    <el-table v-loading="loading" :data="tableList" border style="width: 100%">
      <el-table-column prop="content" label="测试标题" min-width="200">
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
      <!-- <el-table-column prop="remark" label="实际情况" min-width="200">
        <template slot-scope="scope">
          <div class="content-text">
            {{ scope.row.remark }}
          </div>
        </template>
      </el-table-column> -->
      <el-table-column label="结果" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="mini">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="结果" width="120" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
          >
            {{ getStatusLabel(scope.row.status) }}
          </el-button>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="80" align="center">
        <template slot-scope="scope">
          <i
            class="el-icon-video-play mr5"
            style="font-size: 20px; color: #0052d9;"
            @click="handleEditStatus(scope.row)"
          ></i>
          <i
            class="el-icon-tickets"
            style="font-size: 20px; color: #0052d9;"
            @click="openHistory(scope.row)"
          ></i>
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

    <!-- 状态编辑弹窗 -->
    <StatusEditDialog
      ref="statusEditDialog"
      @success="handleStatusUpdateSuccess"
    />

    <!-- 操作记录弹窗 -->
    <HistoryDialog
      :visible.sync="historyDialogVisible"
      :case-title="currentCaseTitle"
      :history-list="historyList"
      @close="handleCloseHistory"
    />
  </div>
</template>

<script>
import { listTestByTaskId, submitTask } from "@/api/taskMgt/index";
import StatusEditDialog from "./StatusEditDialog.vue";
import HistoryDialog from "./HistoryDialog.vue";

export default {
  name: "Case",
  components: {
    StatusEditDialog,
    HistoryDialog,
  },
  data() {
    return {
      routerData: {
        workId: undefined,
        name: undefined,
        modulesId: undefined,
        projectsId: undefined,
        projectName: undefined,
      },
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 参数表格数据
      tableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modulesId: undefined,
      },
      // 数据统计
      passedCount: 0,
      failedCount: 0,
      pendingCount: 0,
      incompleteCount: 0,
      // 状态选项
      statusOptions: [
        { value: 0, label: "待测试" },
        { value: 1, label: "通过" },
        { value: 2, label: "未通过" },
        { value: 3, label: "未完成" },
      ],
      // 操作记录弹窗控制
      historyDialogVisible: false,
      currentCaseTitle: '',
      // 模拟操作记录数据
      historyList: [
        {
          id: 1,
          result: '通过',
          actualSituation: '功能正常，用户可以成功登录系统',
          time: '2024-01-15 14:30:25',
          operator: '张三',
          resultType: 'success'
        },
        {
          id: 2,
          result: '未通过',
          actualSituation: '登录按钮点击后无响应，控制台报错：网络连接超时',
          time: '2024-01-15 10:15:42',
          operator: '李四',
          resultType: 'error'
        },
        {
          id: 3,
          result: '待测试',
          actualSituation: '分配给测试人员，等待执行',
          time: '2024-01-14 16:20:10',
          operator: '王五',
          resultType: 'pending'
        },
        {
          id: 4,
          result: '未完成',
          actualSituation: '测试环境异常，无法进行测试',
          time: '2024-01-14 09:45:33',
          operator: '赵六',
          resultType: 'warning'
        }
      ],
    };
  },
  created() {
    this.routerData = this.$route.query;
    if (this.routerData.workId) {
      this.queryParams.workId = this.routerData.workId;
      this.getList();
    }
  },
  methods: {
    /** 提交任务 */
    handleSubmit() {
      this.$modal
        .confirm('是否确认提交任务"' + this.routerData.name + '"？')
        .then(() => {
          return submitTask({ workId: this.routerData.workId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("提交成功");
          this.handleBack();
        })
        .catch(() => {});
    },
    handleBack() {
      this.$router.push({
        path: "/myTask/index",
      });
    },
    /** 查询table列表 */
    getList() {
      this.loading = true;
      listTestByTaskId(this.queryParams).then((response) => {
        this.tableList = response.rows.map((item) => ({
          ...item,
          procedures: JSON.parse(item.procedures),
          expected: JSON.parse(item.expected),
        }));
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取状态类型 */
    getStatusType(status) {
      const statusMap = {
        0: "", // 待测试
        1: "success", // 通过
        2: "danger", // 未通过
        3: "warning", // 未完成
      };
      return statusMap[status] || "";
    },
    /** 获取状态标签 */
    getStatusLabel(status) {
      const statusMap = {
        0: "待测试",
        1: "通过",
        2: "未通过",
        3: "未完成",
      };
      return statusMap[status] || "待测试";
    },
    /** 打开历史记录 */
    openHistory(row) {
      console.log("🚀 ~ :230 ~ openHistory ~ row:", row);
      this.currentCaseTitle = row.content;
      this.historyDialogVisible = true;
    },
    /** 关闭操作记录弹窗 */
    handleCloseHistory() {
      this.historyDialogVisible = false;
      this.currentCaseTitle = '';
    },
    /** 编辑状态 */
    handleEditStatus(row) {
      this.$refs.statusEditDialog.open(row);
    },
    /** 状态更新成功回调 */
    handleStatusUpdateSuccess(formData) {
      // 更新表格中对应行的数据
      // const index = this.tableList.findIndex((item) => item.id === formData.id);
      // if (index !== -1) {
      //   this.tableList[index].status = formData.status;
      //   this.tableList[index].remark = formData.remark;
      // }
      // 重新计算统计数据
      // this.calculateStats();
      this.getList();
    },
    // 计算统计数据
    calculateStats() {
      // 根据状态值计算统计数据
      // 0: 待测试, 1: 通过, 2: 未通过, 3: 未完成
      this.passedCount = this.tableList.filter(
        (item) => item.status === 1
      ).length;
      this.failedCount = this.tableList.filter(
        (item) => item.status === 2
      ).length;
      this.pendingCount = this.tableList.filter(
        (item) => item.status === 0
      ).length;
      this.incompleteCount = this.tableList.filter(
        (item) => item.status === 3
      ).length;

      // 如果没有status字段，初始化为待测试状态
      if (this.tableList.length > 0 && this.tableList[0].status === undefined) {
        this.tableList.forEach((item) => {
          if (item.status === undefined) {
            item.status = 0; // 默认为待测试
          }
        });
        this.pendingCount = this.tableList.length;
        this.passedCount = 0;
        this.failedCount = 0;
        this.incompleteCount = 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.title-col {
  display: flex;
  align-items: center;
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

// 数据统计样式
.data-overview {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #9e9e9e;
}

.stat-number {
  font-size: 16px;
  font-weight: 500;
  width: 30px;
  height: 26px;
  border-radius: 4px;
  opacity: 1;
  text-align: center;
  line-height: 26px;

  &.passed {
    color: #14ac3d;
    background: #e3ffe6;
  }

  &.failed {
    color: #d01a1a;
    background: #ffe3e3;
  }

  &.pending {
    color: #1a5dd0;
    background: #e3edff;
  }

  &.incomplete {
    color: #e6a23c;
    background: #fdf6ec;
  }
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


</style>
