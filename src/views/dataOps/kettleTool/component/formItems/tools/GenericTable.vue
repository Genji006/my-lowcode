<template>
    <div class="generic-table">
        <div style="padding: 5px 10px 0; background-color: #ecf3fd;" v-if="!isDisabled">
            <el-icon @click="addRow" style="cursor: pointer; font-size: 18px; margin-right: 10px;">
                <Plus />
            </el-icon>
            <el-icon @click="deleteSelectedRows" style="cursor: pointer; font-size: 20px;" :disabled="!currentRow">
                <Minus />
            </el-icon>
        </div>
        <el-table :data="tableData" border highlight-current-row @current-change="handleCurrentChange" ref="tableRef">
            <el-table-column v-if="showIndex" type="index" width="30" align="center" label="#"></el-table-column>
            <el-table-column v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label"
                :align="column.align || 'center'" :width="column.width" show-overflow-tooltip>
                <template #default="scope">
                    <el-tooltip
                        v-if="shouldShowTooltip(scope.row[column.prop]) && !isEditingCell(scope.row, column.prop)"
                        :content="scope.row[column.prop]" placement="top">
                        <el-checkbox v-if="column.type === 'checkbox'" v-model="scope.row[column.prop]"
                            :disabled="column.disabled"></el-checkbox>
                        <el-input v-else v-model="scope.row[column.prop]" :disabled="column.disabled"
                            @focus="handleCellFocus(scope.row, column.prop)" @blur="handleCellBlur"></el-input>
                    </el-tooltip>
                    <template v-else>
                        <el-checkbox v-if="column.type === 'checkbox'" v-model="scope.row[column.prop]"
                            :disabled="column.disabled"></el-checkbox>
                        <el-input v-else v-model="scope.row[column.prop]" :disabled="column.disabled"
                            @focus="handleCellFocus(scope.row, column.prop)" @blur="handleCellBlur"></el-input>
                    </template>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Plus, Minus } from '@element-plus/icons-vue'

// 定义组件的属性
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        default: () => []
    },
    defaultRow: {
        type: Object,
        default: () => ({})
    },
    showIndex: {
        type: Boolean,
        default: true
    },
    isDisabled: {
        type: Boolean,
        default: false
    }
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 表格数据
const tableData = ref(props.modelValue)

// 表格引用
const tableRef = ref(null)

// 当前行
const currentRow = ref(null)

// 当前正在编辑的单元格
const editingCell = ref({
    row: null,
    prop: null
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
    tableData.value = newVal
}, { deep: true })

// 监听内部数据变化并更新父组件
watch(tableData, (newVal) => {
    emit('update:modelValue', newVal)
}, { deep: true })

// 添加行的方法
const addRow = () => {
    // 深拷贝默认行数据
    const newRow = Object.assign({}, props.defaultRow)
    tableData.value.push(newRow)

    // 添加新行后，默认选中新增的行
    nextTick(() => {
        if (tableData.value.length > 0 && tableRef.value) {
            const newRow = tableData.value[tableData.value.length - 1]
            tableRef.value.setCurrentRow(newRow)
            currentRow.value = newRow
        }
    })
}

// 处理当前行变化
const handleCurrentChange = (row) => {
    currentRow.value = row
}

// 删除选中行的方法
const deleteSelectedRows = () => {
    if (!currentRow.value) {
        return
    }

    const index = tableData.value.indexOf(currentRow.value)
    if (index > -1) {
        tableData.value.splice(index, 1)
        currentRow.value = null

        // 删除行后，默认选中第一行（如果存在）
        nextTick(() => {
            if (tableData.value.length > 0 && tableRef.value) {
                tableRef.value.setCurrentRow(tableData.value[0])
                currentRow.value = tableData.value[0]
            }
        })
    }
}

// 设置默认高亮第一行
const setDefaultHighlight = () => {
    nextTick(() => {
        if (tableData.value.length > 0 && tableRef.value) {
            tableRef.value.setCurrentRow(tableData.value[0])
            currentRow.value = tableData.value[0]
        }
    })
}

// 判断是否需要显示tooltip
const shouldShowTooltip = (value) => {
    if (typeof value === 'string' && value.length > 20) {
        return true
    }
    return false
}

// 处理单元格获得焦点
const handleCellFocus = (row, prop) => {
    editingCell.value = { row, prop }
}

// 处理单元格失去焦点
const handleCellBlur = () => {
    editingCell.value = { row: null, prop: null }
}

// 判断单元格是否正在编辑
const isEditingCell = (row, prop) => {
    return editingCell.value.row === row && editingCell.value.prop === prop
}

// 暴露方法给父组件
defineExpose({
    setDefaultHighlight
})
</script>

<style lang="scss" scoped>
.generic-table {
    :deep(.el-table .el-table__cell) {
        padding: 0 !important;
    }

    :deep(.el-table .cell) {
        padding: 2px 0 !important;
    }

    :deep(.el-input__wrapper) {
        border: none !important;
    }
}
</style>