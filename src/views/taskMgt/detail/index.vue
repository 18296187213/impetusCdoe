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
      <el-table-column
        label="创建时间"
        align="center"
        width="160"
        prop="createTime"
      />
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handlePass(scope.row)"
            >通过</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="handleNotPass(scope.row)"
            style="color: #f56c6c"
            >未通过</el-button
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
  </div>
</template>

<script>
import { listCase, delCase } from "@/api/projectMgt/case";

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
      // 总条数
      total: 0,
      // 参数表格数据
      tableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        modulesId: undefined,
      },
      // 数据统计
      passedCount: 0,
      failedCount: 0,
      pendingCount: 0,
    };
  },
  created() {
    this.routerData = this.$route.query;
    if (this.routerData.modulesId) {
      this.queryParams.modulesId = this.routerData.modulesId;
      this.getList();
    }
  },
  methods: {
    handleBack() {
      this.$router.push({
        path: "/taskMgt/index",
      });
    },
    /** 查询table列表 */
    getList() {
      this.loading = true;
      listCase(this.queryParams).then((response) => {
        this.tableList = response.rows.map((item) => ({
          ...item,
          procedures: JSON.parse(item.procedures),
          expected: JSON.parse(item.expected),
        }));
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 修改按钮操作 */
    handlePass(row) {
      const id = row.id;
      this.$modal
        .confirm('是否确认通过标题为"' + row.content + '"的数据项？')
        .then(function () {
          // return delCase(id);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 删除按钮操作 */
    handleNotPass(row) {
      const id = row.id;
      this.$modal
        .confirm('是否确认未通过标题为"' + row.content + '"的数据项？')
        .then(function () {
          // return delCase(id);
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
    color: #14AC3D;
    background: #E3FFE6;
  }

  &.failed {
    color: #D01A1A;
    background: #FFE3E3;
  }

  &.pending {
    color: #1A5DD0;
    background: #E3EDFF;
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
