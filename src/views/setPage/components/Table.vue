<template>
  <div class="table-component">
    <!-- 表格工具栏 -->
    <div v-if="config.bind.pageName" class="table-header">
      <div
        class="table-title"
        :style="{
          fontSize: config.bind.titleFontSize,
          color: config.bind.titleFontColor,
          height: config.bind.headerHeight,
        }"
      >
        {{ config.bind.pageName }}
      </div>
      <div class="table-subtitle">
        <span class="subtitle-item"
          v-if="props.searchParams.STARTDATE && props.searchParams.ENDDATE"
          >统计范围: {{ props.searchParams.STARTDATE.substring(0, 10) }} 至
          {{ props.searchParams.ENDDATE.substring(0, 10) }}</span
        >
        <span class="subtitle-item"
          >生成日期: {{ formatDate(new Date()) }}</span
        >
      </div>
    </div>
    <!-- 表格主体 -->
    <el-table
      highlight-current-row
      v-loading="loading"
      :data="formData"
      :border="config.bind.showBorder == '1'"
      :show-header="true"
      :row-key="config.bind.primaryKey || 'id'"
      :default-sort="{ prop: config.bind.defaultSort, order: 'descending' }"
      :tree-props="
        config.bind.treeModel
          ? { children: 'children', hasChildren: 'hasChildren' }
          : {}
      "
      :header-cell-style="{
        height: config.bind.headerHeight,
        backgroundColor: config.bind.headerBgColor + '!important',
        fontSize: config.bind.headerFontSize + '!important',
        color: config.bind.headerFontColor + '!important',
      }"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
      class="custom-table"
      :class="{ 'highlight-row': config.bind.light }"
    >
      <!-- 序号列 -->
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
        v-if="config.bind.showIndex"
      />

      <!-- 复选框列 -->
      <el-table-column
        type="selection"
        width="50"
        v-if="config.bind.checkBox * 1"
      />

      <!-- 自定义列 -->
      <TableItem
        v-bind:whiteList="whiteList"
        v-bind:config="config"
        v-for="column in config.bind.designTableColumns"
        :searchParams="props.searchParams"
        :key="column.idRow || column.columnName"
        :column="column"
      />
    </el-table>

    <!-- 分页 -->
    <div
      class="pagination"
      v-if="config.bind.isPage == '1' && pagination.total > 0"
    >
      <el-pagination
        v-model:current-page="props.pagination.pageNum"
        v-model:page-size="props.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="props.pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import TableItem from "./TableItem.vue";

// 组件配置参数
const props = defineProps({
  // 表格配置
  config: {
    type: Object,
    default: () => ({}),
  },
  // 表格数据
  formData: {
    type: Array,
    default: () => [],
  },
  // 白名单
  whiteList: {
    type: Array,
    default: () => [],
  },
  // 总条数
  total: {
    type: Number,
    default: 0,
  },
  // 是否显示加载
  loading: {
    type: Boolean,
    default: false,
  },
  // 是否显示操作列
  showActionColumn: {
    type: Boolean,
    default: true,
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true,
  },
  // 搜索参数
  searchParams: {
    type: Object,
    default: () => ({}),
  },
  // 分页信息
  pagination: {
    type: Object,
    default: () => ({
      pageNum: 1,
      pageSize: 10,
      total: 0,
    }),
  },
});

// 事件
const emit = defineEmits(["handleSearch"]);

// 处理行点击
const handleRowClick = (row) => {
  emit("row-click", row);
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  emit("selection-change", selection);
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  props.pagination.pageSize = size;
  // 触发分页变化事件，传递分页信息给父组件
  emit("handleSearch");
};

// 处理页码变化
const handleCurrentChange = (current) => {
  props.pagination.pageNum = current;
  // 触发分页变化事件，传递分页信息给父组件
  emit("handleSearch");
};

// 格式化日期为年月日格式
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<style scoped lang="scss">
.table-component {
  display: flex;
  padding: 10px;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  .table-header {
    position: relative;
  }
}
.table-title {
  width: 100%;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.table-subtitle {
  min-width: 27%;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;

  top: 25%;
  right: 0;
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.subtitle-item {
  margin: 0 10px;
  font-size: 16px;
  color: #000;
  font-weight: 400;
}

.subtitle-separator {
  color: #999;
  margin: 0 5px;
}

.custom-table {
  width: 100%;
}

.custom-table.highlight-row :deep(.el-table__row:hover) {
  background-color: #ecf5ff !important;
}

:deep(.el-table--fit) {
  flex: 1;
}
.pagination {
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 树形表格样式 */
.custom-table :deep(.el-table__expand-icon) {
  color: #5380fd;
}

.custom-table :deep(.el-table__expand-icon--expanded) {
  color: #5380fd;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination {
    justify-content: center;
  }
}
::v-deep(.el-table__cell) {
  font-size: 17px !important;
  font-family: "SimSun" !important;
  border-color: #c0c0c0 !important;
  font-weight: 600 !important;
  color: #1d2129 !important;
}
</style>
