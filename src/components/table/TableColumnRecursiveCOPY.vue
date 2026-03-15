<script setup>

const props = defineProps({
  column: Object
});
const emits = defineEmits(['isClick', 'statusClick']);


// 单元格是否可以点击
function handleCellClick(row, column, $index) {
  emits('isClick', { row, column, $index });
}

// 表格中启用否事件
function handleToggleAvailable(value, row, column) {
  emits('statusClick', { value, row, column });
}
</script>

<template>
  <el-table-column :prop="column.columnName" :label="column.columnLabel" :width="column.width" :align="column.align" :formatter="column.formatter" :colspan="column.colspan" :rowspan="column.rowspan" :fixed="column.fixed" :sortable="column.sortable" :sort-method="column.sortMethod" :sort-by="column.sortBy" :sort-orders="column.sortOrders" :resizable="column.resizable" :show-overflow-tooltip="column.showOverflowTooltip" :min-width="column.minWidth" :max-width="column.maxWidth">
    <template v-if="column.children && column.children.length > 0">
      <TableColumnRecursive v-for="child in column.children" :key="child.columnName || child.label" :column="child" @cellClick="$emit('cellClick', $event)" @statusClick="$emit('statusClick', $event)" />
    </template>
    <template v-if="!column.children || column.children.length === 0" #default="scope">
      <template v-if="column.hasSlot">
        <slot :name="column.columnName" :row="scope.row"></slot>
      </template>
      <template v-else>
        <span v-if="column.isClick === 1" class="clickable-blue" @click.stop="handleCellClick(scope.row, column, scope.$index)">
          {{ column.formatter ? column.formatter(scope.row, scope.column, scope.$index) : scope.row[column.columnName] }}
        </span>
        <!-- 启用否按钮 -->
        <span v-else-if="column.kyf == '1'">
          <el-switch v-model="scope.row[column.columnName]" v-bind="column.attrs" @change="(e) => handleToggleAvailable(e, scope.row,column)" />
        </span>
        <span v-else>
          {{ column.formatter ? column.formatter(scope.row, scope.column, scope.$index) : scope.row[column.columnName] }}
        </span>
      </template>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'TableColumnRecursive',
};

</script>

<style scoped>
.clickable-blue {
  color: #1976d2;
  cursor: pointer;
}
</style>
