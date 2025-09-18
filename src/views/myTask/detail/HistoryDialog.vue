<template>
  <!-- 操作记录弹窗 -->
  <el-dialog
    title="操作记录"
    :visible.sync="dialogVisible"
    width="800px"
    :before-close="handleClose"
  >
    <div class="history-header">
      <h4 class="case-title">{{ caseTitle }}</h4>
    </div>
    
    <div class="history-timeline">
      <div 
        v-for="(item, index) in historyList" 
        :key="item.id"
        class="timeline-item"
      >
        <div class="timeline-dot" :class="item.resultType"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="result-badge" :class="item.resultType">
              {{ item.result }}
            </span>
            <span class="timeline-time">{{ item.time }}</span>
          </div>
          <div class="timeline-body">
            <p class="actual-situation">{{ item.actualSituation }}</p>
            <div class="operator-info">
              <i class="el-icon-user"></i>
              <span>{{ item.operator }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'HistoryDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    caseTitle: {
      type: String,
      default: ''
    },
    historyList: {
      type: Array,
      default: () => []
    }
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
  methods: {
    /** 关闭弹窗 */
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
.history-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;

  .case-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.history-timeline {
  position: relative;
  padding-left: 30px;

  // 时间轴主线
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #e4e7ed, #c0c4cc);
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: -22px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.success {
    background-color: #67c23a;
  }

  &.error {
    background-color: #f56c6c;
  }

  &.warning {
    background-color: #e6a23c;
  }

  &.pending {
    background-color: #909399;
  }
}

.timeline-content {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;

  &.success {
    color: #67c23a;
    background-color: #f0f9ff;
    border: 1px solid #b3e19d;
  }

  &.error {
    color: #f56c6c;
    background-color: #fef0f0;
    border: 1px solid #fbc4c4;
  }

  &.warning {
    color: #e6a23c;
    background-color: #fdf6ec;
    border: 1px solid #f5dab1;
  }

  &.pending {
    color: #909399;
    background-color: #f4f4f5;
    border: 1px solid #d3d4d6;
  }
}

.timeline-time {
  font-size: 12px;
  color: #909399;
}

.timeline-body {
  .actual-situation {
    margin: 0 0 12px 0;
    line-height: 1.6;
    color: #606266;
    font-size: 14px;
  }

  .operator-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #909399;

    i {
      font-size: 14px;
    }
  }
}

// 弹窗底部按钮样式
.dialog-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>