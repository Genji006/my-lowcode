<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();

const props = defineProps({
  column: Object,
  align: String,
});
const emits = defineEmits(["isClick", "statusClick"]);

// 单元格是否可以点击
function handleCellClick(row, column, $index) {
  if (column.jumpPath) {
    router.push({ path: column.jumpPath, query: {} });
  }
  emits("isClick", { row, column, $index });
}

const isUserInteraction = ref(false);
// 用于跟踪是否是用户交互触发的事件
const userInitiated = ref(false);

// 捕获鼠标按下事件，标记为用户交互
function handleMouseDown() {
  userInitiated.value = true;
}

// 表格中启用否事件
function handleToggleAvailable(value, row, column, event) {
  // 只有用户交互触发的事件才会被处理
  if (userInitiated.value) {
    emits("statusClick", { value, row, column });
  }
  // 重置交互状态
  userInitiated.value = false;
}
</script>

<template>
  <!-- 两个事件
      1. 是否可以点击，当前列可点击则传  isClick为1或true (在两个等号判断时，1等于true)
      2. 启用否按钮，是否是按钮 kyf 传 1， statusClick 事件触发切换 -->
  <el-table-column
    :prop="column.columnDataSourceName || column.columnName"
    :label="column.columnLabel"
    :width="column.columnWidth"
    :align="column.textAlign || props.align"
    :formatter="column.formatter"
    :colspan="column.colspan"
    :rowspan="column.rowspan"
    v-bind="fixedFn(column.fixed)"
    :sortable="column.sortable"
    :sort-method="column.sortMethod"
    :sort-by="column.sortBy"
    :sort-orders="column.sortOrders"
    :resizable="column.resizable"
    :show-overflow-tooltip="column.showOverflowTooltip || true"
    :min-width="column.minWidth"
    :max-width="column.maxWidth"
  >
    <template v-if="column.children && column.children.length > 0">
      <TableColumnRecursive
        v-for="child in column.children"
        :key="child.columnDataSourceName || child.columnName || child.label"
        :column="child"
        :align="props.align"
        @isClick="$emit('isClick', $event)"
        @statusClick="$emit('statusClick', $event)"
      >
        <template
          v-for="slotName in Object.keys($slots)"
          #[slotName]="slotProps"
        >
          <slot :name="slotName" v-bind="slotProps" />
        </template>
      </TableColumnRecursive>
    </template>
    <template
      v-if="!column.children || column.children.length === 0"
      #default="scope"
    >
      <template v-if="column.hasSlot">
        <slot
          :name="column.columnDataSourceName || column.columnName"
          :row="scope.row"
        ></slot>
      </template>
      <template v-else>
        <span
          v-if="column.isClick == 1"
          class="clickable-blue"
          @click.stop="handleCellClick(scope.row, column, scope.$index)"
        >
          {{
            column.formatter
              ? column.formatter(scope.row, scope.column, scope.$index)
              : scope.row[column.columnDataSourceName || column.columnName]
          }}
        </span>
        <!-- 启用否按钮 -->
        <span v-else-if="column.kyf == '1'">
          <el-switch
            v-model="
              scope.row[column.columnDataSourceName || column.columnName]
            "
            @mousedown="handleMouseDown"
            v-bind="column.attrs"
            @change="(e) => handleToggleAvailable(e, scope.row, column)"
          />
        </span>
        <span v-else>
          {{
            column.formatter
              ? column.formatter(scope.row, scope.column, scope.$index)
              : scope.row[column.columnDataSourceName || column.columnName]
          }}
        </span>
      </template>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: "TableColumnRecursive",
};

const fixedFn = (data) => {
  if (data) {
    return { fixed: data };
  } else {
    return {};
  }
};
</script>

<style scoped>
.clickable-blue {
  color: #5380fd;
  cursor: pointer;
}
</style>
