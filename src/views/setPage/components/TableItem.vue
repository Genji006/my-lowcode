<template>
  <el-table-column
    v-if="!props.column.children || props.column.children.length === 0"
    :prop="props.column.columnName"
    :label="props.column.columnLabel"
    :width="props.column.columnWidth+'px'"
    :align="props.column.textAlign || props.column.align || 'center'"
    :sortable="props.column.sortable || false"
  >
    <template #default="scope">
      <slot
        :name="`column-${props.column.columnName}`"
        :row="scope.row"
        :column="props.column"
      >
        <div
          v-if="hasJumpPermission()"
          :style="{
            cursor: 'pointer',
            color: '#409eff',
          }"
          @click="jump(scope.row)"
        >
          {{ scope.row[props.column.columnName] }}
        </div>
        <span v-else>
          {{ scope.row[props.column.columnName] }}
        </span>
      </slot>
    </template>
  </el-table-column>
  <!-- 多级表头 -->
  <el-table-column
    v-else
    :label="props.column.columnLabel"
    :width="props.column.width || props.column.columnWidth"
    :align="props.column.textAlign || props.column.align || 'center'"
  >
    <template #default="scope">
      <slot
        :name="`column-${props.column.columnName}`"
        :row="scope.row"
        :column="props.column"
      >
        {{ scope.row[props.column.columnName] }}
      </slot>
      <TableItem
        v-for="childColumn in props.column.children"
        :key="childColumn.idRow || childColumn.columnName"
        :column="childColumn"
        :config="props.config"
      />
    </template>
    <!-- 递归渲染子表头 -->
  </el-table-column>
</template>

<script setup>
import TableItem from "./TableItem.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 定义组件属性
const props = defineProps({
  // 表头配置
  column: {
    type: Object,
    required: true,
  },
  // 表格配置
  config: {
    type: Object,
    default: () => ({}),
  },
  // 白名单
  whiteList: {
    type: Array,
    default: () => [],
  },
  // 搜索参数
  searchParams: {
    type: Object,
    default: () => ({}),
  },
});

// 检查是否有跳转权限
const hasJumpPermission = () => {
  return props.column.clickWord && props.column.keyWord;
};

// 跳转
const jump = (row) => {
  if (hasJumpPermission()) {
    try {
      router.push({
        path: props.column.jumpPath,
        query: {
          ...props.searchParams,
          [props.column.keyWord]: props.whiteList.includes(
            row[props.column.keyWord],
          )
            ? ""
            : row[props.column.keyWord],
        },
      });
    } catch (error) {
      console.error("跳转失败:", error);
    }
  }
};
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>
