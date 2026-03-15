<template>
    <div class="excel-files-table">
        <div style="margin: 5px 0; display:flex; flex-direction: row;">
            <el-button v-for="button in buttons" :key="button.label" @click="button.handler"
                :style="{ marginLeft: button.marginLeft || '5px' }"
                :disabled="button.disabled ? button.disabled() : false">
                {{ button.label }}
            </el-button>
        </div>

        <el-table :data="tableData" style="width: 100%;" border @current-change="handleCurrentChange"
            highlight-current-row ref="tableRef">
            <el-table-column type="index" width="40" align="center"></el-table-column>

            <template v-for="column in columns" :key="column.prop">
                <el-table-column :prop="column.prop" :label="column.label" :min-width="column.minWidth || 100"
                    :align="column.align || 'center'" :width="column.width">
                    <template #default="scope">
                        <!-- 普通输入框 -->
                        <el-input v-if="!column.type || column.type === 'input'" v-model="scope.row[column.prop]"
                            size="small">
                        </el-input>

                        <!-- 下拉选择框 -->
                        <el-select v-else-if="column.type === 'select'" v-model="scope.row[column.prop]" size="small">
                            <el-option v-for="option in column.options" :key="getOptionValue(option, column)"
                                :label="getOptionLabel(option, column)" :value="getOptionValue(option, column)">
                            </el-option>
                        </el-select>

                        <!-- 复选框 -->
                        <el-checkbox v-else-if="column.type === 'checkbox'" v-model="scope.row[column.prop]"
                            :true-value="column.trueValue || true" :false-value="column.falseValue || false">
                        </el-checkbox>
                    </template>
                </el-table-column>
            </template>
        </el-table>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    buttons: {
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
    }
})

// 使用 defineModel 简化 v-model 用法
const modelValue = defineModel({
    type: Array,
    default: () => []
})

const tableData = ref(modelValue.value)
const tableRef = ref(null)
const currentRow = ref(null)

// 监听modelValue变化
watch(() => modelValue.value, (newVal) => {
    tableData.value = newVal
}, { deep: true })

// 监听内部数据变化并更新父组件
watch(tableData, (newVal) => {
    modelValue.value = newVal
}, { deep: true })

// 处理当前行变化
const handleCurrentChange = (row) => {
    currentRow.value = row
}

// 添加行
const addRow = () => {
    const newRow = Object.assign({}, props.defaultRow)
    tableData.value.push(newRow)
}

// 删除选中行
const deleteSelectedRow = () => {
    if (currentRow.value) {
        const index = tableData.value.indexOf(currentRow.value)
        if (index > -1) {
            tableData.value.splice(index, 1)
            currentRow.value = null
        }
    }
}

// 获取选项的值
const getOptionValue = (option, column) => {
    // 支持自定义value字段名
    if (option && typeof option === 'object' && column.optionValueKey) {
        return option[column.optionValueKey];
    }
    // 如果option是对象且有value属性
    if (option && typeof option === 'object' && option.value !== undefined) {
        return option.value;
    }
    // 如果option是对象且有type属性（如你之前提供的数据结构）
    if (option && typeof option === 'object' && option.type !== undefined) {
        return option.type;
    }
    // 如果option是对象且有format属性（如你现在提供的数据结构）
    if (option && typeof option === 'object' && option.format !== undefined) {
        return option.format;
    }
    // 如果option是字符串或其他基本类型
    return option;
}

// 获取选项的标签
const getOptionLabel = (option, column) => {
    // 支持自定义label字段名
    if (option && typeof option === 'object' && column.optionLabelKey) {
        return option[column.optionLabelKey];
    }
    // 如果没有指定optionLabelKey但指定了optionValueKey，则使用optionValueKey作为label
    if (option && typeof option === 'object' && column.optionValueKey) {
        return option[column.optionValueKey];
    }
    // 如果option是对象且有label属性
    if (option && typeof option === 'object' && option.label !== undefined) {
        return option.label;
    }
    // 如果option是对象且有type属性（如你之前提供的数据结构）
    if (option && typeof option === 'object' && option.type !== undefined) {
        return option.type;
    }
    // 如果option是对象且有format属性（如你现在提供的数据结构）
    if (option && typeof option === 'object' && option.format !== undefined) {
        return option.format;
    }
    // 如果option是字符串或其他基本类型
    return option;
}

// 暴露方法给父组件
defineExpose({
    addRow,
    deleteSelectedRow,
    setCurrentRow: (row) => {
        if (tableRef.value) {
            tableRef.value.setCurrentRow(row)
        }
    }
})
</script>

<style lang="scss" scoped>
.excel-files-table {
    :deep(.el-table .cell) {
        padding: 0 !important;
    }

    :deep(.el-input__wrapper) {
        border: none !important;
    }

    :deep(.el-select__wrapper) {
        border: none !important;
    }
}
</style>