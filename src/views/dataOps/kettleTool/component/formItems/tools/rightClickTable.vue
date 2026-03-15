<template>
    <div class="generic-table" @contextmenu.prevent="handleTableContextMenu">
        <el-button @click="callParentFunction" v-if="needSpecialFunction" style="float: right;margin: 3px 5px 3px 0;">
            {{ props.buttonText }}</el-button>
        <el-table :data="tableData" border highlight-current-row @current-change="handleCurrentChange" ref="tableRef"
            @row-contextmenu="handleRowContextMenu" :style="{ height: height + 'px', overflow: 'auto' }"
            @selection-change="handleSelectionChange">
            <el-table-column v-if="showSelection" type="selection" width="55" align="center"></el-table-column>
            <el-table-column v-if="showIndex" type="index" width="30" align="center" label="#"></el-table-column>
            <el-table-column v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label"
                :align="column.align || 'center'" :width="column.width" show-overflow-tooltip>
                <template #default="scope">
                    <!-- 下拉框类型 -->
                    <el-select v-if="column.type === 'select'" v-model="scope.row[column.prop]"
                        :placeholder="column.placeholder || ''" :disabled="isDisabled" :style="{ width: '100%' }"
                        size="small" @change="handleCellChange(scope.row, column.prop)"
                        :filterable="column.filterable || false">
                        <el-option v-for="option in column.options" :key="getOptionKey(option, column)"
                            :label="getOptionLabel(option, column)" :value="getOptionValue(option, column)">
                        </el-option>
                    </el-select>

                    <!-- 复选框类型 -->
                    <el-checkbox v-else-if="column.type === 'checkbox'" v-model="scope.row[column.prop]"
                        :disabled="isDisabled" @change="handleCellChange(scope.row, column.prop)">
                    </el-checkbox>

                    <!-- 输入框类型（默认） -->
                    <el-input v-else v-model="scope.row[column.prop]" :placeholder="column.placeholder || ''"
                        :disabled="isDisabled" size="small" @blur="handleCellChange(scope.row, column.prop)"
                        @focus="handleCellFocus(scope.row, column.prop)">
                        <template #suffix v-if="column.showSlot">
                            <slot :name="'cell-suffix-' + column.prop" :row="scope.row" :column="column">
                                <!-- 如果没有提供具体插槽内容，但设置了showSlot，则显示默认内容 -->
                                <slot :name="'cell-suffix'" :row="scope.row" :column="column"></slot>
                            </slot>
                        </template>
                    </el-input>
                </template>
            </el-table-column>
        </el-table>

        <!-- 右键菜单 -->
        <transition name="el-zoom-in-top" v-if="!isDisabled">
            <div v-show="contextMenuVisible" class="context-menu"
                :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }">
                <ul class="menu-list">
                    <li @click="callParentFunction" :class="{ disabled: internalDisableEdit }"
                        v-if="needSpecialFunction">
                        <el-icon>
                            <Coin />
                        </el-icon>
                        <span>{{ props.buttonText }}</span>
                    </li>

                    <div class="menu-divider" v-if="needSpecialFunction"></div>

                    <li @click="addRow" :class="{ disabled: internalDisableEdit }">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        <span>新增行</span>
                    </li>
                    <li @click="insertBefore" :class="{ disabled: !currentRow || internalDisableEdit }">
                        <el-icon>
                            <Top />
                        </el-icon>
                        <span>在当前行前插入</span>
                    </li>
                    <li @click="insertAfter" :class="{ disabled: !currentRow || internalDisableEdit }">
                        <el-icon>
                            <Bottom />
                        </el-icon>
                        <span>在当前行后插入</span>
                    </li>

                    <div class="menu-divider"></div>

                    <li @click="deleteSelectedRows" :class="{ disabled: !currentRow || internalDisableEdit }"
                        class="danger-item">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>删除当前行</span>
                    </li>
                    <li @click="keepOnlyCurrentRow"
                        :class="{ disabled: !currentRow || tableData.length <= 1 || internalDisableEdit }"
                        class="danger-item">
                        <el-icon>
                            <DocumentChecked />
                        </el-icon>
                        <span>只保留选中行</span>
                    </li>
                    <li @click="deleteAllRows" :class="{ disabled: tableData.length === 0 || internalDisableEdit }"
                        class="danger-item">
                        <el-icon>
                            <CircleCloseFilled />
                        </el-icon>
                        <span>删除全部</span>
                    </li>

                    <div class="menu-divider"></div>

                    <li @click="moveUp" :class="{ disabled: !canMoveUp || internalDisableEdit }">
                        <el-icon>
                            <ArrowUp />
                        </el-icon>
                        <span>上移</span>
                    </li>
                    <li @click="moveDown" :class="{ disabled: !canMoveDown || internalDisableEdit }">
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                        <span>下移</span>
                    </li>
                </ul>
            </div>
        </transition>

        <!-- 点击表格其他区域隐藏菜单 -->
        <div v-if="contextMenuVisible" class="context-menu-overlay" @click="hideContextMenu"
            @contextmenu.prevent="hideContextMenu"></div>
    </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { Plus, Minus, ArrowUp, ArrowDown, DocumentChecked } from '@element-plus/icons-vue'

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
    },
    height: {
        type: Number,
        default: 200
    },
    // 添加禁用编辑功能的属性
    disableEdit: {
        type: Boolean,
        default: false
    },
    specialFunction: {
        type: String,
        default: ''
    },
    needSpecialFunction: {
        type: Boolean,
        default: false
    },
    // 添加控制是否显示复选框的属性
    showSelection: {
        type: Boolean,
        default: false
    },
    buttonText: {
        type: String,
        default: '获取变量'
    }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'cell-change', 'parent-function', 'selection-change'])

// 表格数据
const tableData = ref(props.modelValue)

// 表格引用
const tableRef = ref(null)

// 当前行
const currentRow = ref(null)

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)

// 当前正在编辑的单元格
const editingCell = ref({
    row: null,
    prop: null
})

// 当前选中的行
const selectedRows = ref([])

// 内部维护的编辑禁用状态
const internalDisableEdit = ref(props.disableEdit)

const callParentFunction = () => {
    // 如果禁用编辑则直接返回
    if (internalDisableEdit.value) return;

    hideContextMenu()
    emit('parent-function', currentRow.value)
}

// 计算是否可以向上移动
const canMoveUp = computed(() => {
    if (!currentRow.value) return false
    const index = tableData.value.indexOf(currentRow.value)
    return index > 0
})

// 计算是否可以向下移动
const canMoveDown = computed(() => {
    if (!currentRow.value) return false
    const index = tableData.value.indexOf(currentRow.value)
    return index < tableData.value.length - 1
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
    tableData.value = newVal
}, { deep: true })

// 监听内部数据变化并更新父组件
watch(tableData, (newVal) => {
    emit('update:modelValue', newVal)
}, { deep: true })

// 监听props.disableEdit的变化
watch(() => props.disableEdit, (newVal) => {
    internalDisableEdit.value = newVal
})

// 处理选择变化
const handleSelectionChange = (selection) => {
    selectedRows.value = selection
    emit('selection-change', selection)
}

// 获取选项的值
const getOptionValue = (option, column) => {
    if (typeof option === 'object' && option !== null) {
        return option[column.valueKey || 'value'] !== undefined ? option[column.valueKey || 'value'] : option
    }
    return option
}

// 获取选项的标签
const getOptionLabel = (option, column) => {
    if (typeof option === 'object' && option !== null) {
        return option[column.labelKey || 'label'] !== undefined ? option[column.labelKey || 'label'] : (option.toString ? option.toString() : '')
    }
    // 添加对 null 和 undefined 的检查
    if (option === null || option === undefined) {
        return ''
    }
    return option.toString ? option.toString() : ''
}

// 获取选项的键值
const getOptionKey = (option, column) => {
    if (typeof option === 'object' && option !== null) {
        return option[column.valueKey || 'value'] !== undefined ? option[column.valueKey || 'value'] : JSON.stringify(option)
    }
    // 添加对 null 和 undefined 的检查
    if (option === null || option === undefined) {
        return ''
    }
    return option
}

// 添加行的方法
const addRow = () => {
    // 如果禁用编辑则直接返回
    if (internalDisableEdit.value) return;

    hideContextMenu()
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

// 在当前行前插入新行
const insertBefore = () => {
    // 如果禁用编辑或没有选中行则直接返回
    if (internalDisableEdit.value || !currentRow.value) return;

    hideContextMenu()

    const index = tableData.value.indexOf(currentRow.value)
    if (index > -1) {
        // 深拷贝默认行数据
        const newRow = Object.assign({}, props.defaultRow)
        tableData.value.splice(index, 0, newRow)

        // 选中新增的行
        nextTick(() => {
            if (tableRef.value) {
                tableRef.value.setCurrentRow(tableData.value[index])
                currentRow.value = tableData.value[index]
            }
        })
    }
}

// 在当前行后插入新行
const insertAfter = () => {
    // 如果禁用编辑或没有选中行则直接返回
    if (internalDisableEdit.value || !currentRow.value) return;

    hideContextMenu()

    const index = tableData.value.indexOf(currentRow.value)
    if (index > -1) {
        // 深拷贝默认行数据
        const newRow = Object.assign({}, props.defaultRow)
        tableData.value.splice(index + 1, 0, newRow)

        // 选中新增的行
        nextTick(() => {
            if (tableRef.value) {
                tableRef.value.setCurrentRow(tableData.value[index + 1])
                currentRow.value = tableData.value[index + 1]
            }
        })
    }
}

// 处理当前行变化
const handleCurrentChange = (row) => {
    currentRow.value = row
}

// 处理行右键事件
const handleRowContextMenu = (row, column, event) => {
    // 不要手动设置 setCurrentRow，让 Element UI 自己处理
    // 只需要保存当前行的引用即可
    currentRow.value = row
    showContextMenu(event)
}

// 处理表格右键事件（非行）
const handleTableContextMenu = (event) => {
    // 不要清除当前行选中状态
    showContextMenu(event)
}

// 显示右键菜单
const showContextMenu = (event) => {
    // 如果禁用编辑则不显示菜单
    if (internalDisableEdit.value) return;

    contextMenuVisible.value = true
    contextMenuLeft.value = event.pageX
    contextMenuTop.value = event.pageY
    event.preventDefault()
}

// 隐藏右键菜单
const hideContextMenu = () => {
    contextMenuVisible.value = false
}

// 删除选中行的方法
const deleteSelectedRows = () => {
    // 如果禁用编辑或没有选中行则直接返回
    if (internalDisableEdit.value || !currentRow.value) return;

    hideContextMenu()

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

// 删除所有行
const deleteAllRows = () => {
    // 如果禁用编辑则直接返回
    if (internalDisableEdit.value) return;

    hideContextMenu()
    if (tableData.value.length === 0) {
        return
    }

    // 清空表格数据
    tableData.value.splice(0, tableData.value.length)
    currentRow.value = null

    // 重置表格选中状态
    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.setCurrentRow(null)
        }
    })
}

// 仅保留当前行，删除其他所有行
const keepOnlyCurrentRow = () => {
    // 如果禁用编辑、没有选中行或只有一行则直接返回
    if (internalDisableEdit.value || !currentRow.value || tableData.value.length <= 1) return;

    hideContextMenu()

    // 保存当前行
    const rowToKeep = { ...currentRow.value }; // 深拷贝当前行

    // 清空表格数据并只保留当前行
    tableData.value.splice(0, tableData.value.length);
    tableData.value.push(rowToKeep);

    // 设置当前行为保留的行
    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.setCurrentRow(tableData.value[0]);
            currentRow.value = tableData.value[0];
        }
    });
}

// 上移行
const moveUp = () => {
    // 如果禁用编辑或没有选中行则直接返回
    if (internalDisableEdit.value || !currentRow.value) return;

    hideContextMenu()
    if (!currentRow.value) return
    const index = tableData.value.indexOf(currentRow.value)
    if (index > 0) {
        const temp = tableData.value[index]
        tableData.value[index] = tableData.value[index - 1]
        tableData.value[index - 1] = temp
        nextTick(() => {
            tableRef.value.setCurrentRow(tableData.value[index - 1])
        })
    }
}

// 下移行
const moveDown = () => {
    // 如果禁用编辑或没有选中行则直接返回
    if (internalDisableEdit.value || !currentRow.value) return;

    hideContextMenu()
    if (!currentRow.value) return
    const index = tableData.value.indexOf(currentRow.value)
    if (index < tableData.value.length - 1) {
        const temp = tableData.value[index]
        tableData.value[index] = tableData.value[index + 1]
        tableData.value[index + 1] = temp
        nextTick(() => {
            tableRef.value.setCurrentRow(tableData.value[index + 1])
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

// 处理单元格值变化
const handleCellChange = (row, prop) => {
    // 如果禁用编辑则不触发事件
    if (internalDisableEdit.value) return;

    emit('cell-change', { row, prop, value: row[prop] })
    handleCellBlur()
}

// 处理单元格获得焦点
const handleCellFocus = (row, prop) => {
    // 如果禁用编辑则不处理焦点
    if (internalDisableEdit.value) return;

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

// 判断是否需要显示tooltip
const shouldShowTooltip = (value) => {
    if (typeof value === 'string' && value.length > 20) {
        return true
    }
    return false
}

// 控制编辑功能启用/禁用的方法
const toggleEdit = (disable) => {
    // 更新内部的禁用编辑状态
    internalDisableEdit.value = disable;
};

// 获取当前选中的行
const getSelectedRows = () => {
    return selectedRows.value;
};

// 暴露方法给父组件
defineExpose({
    setDefaultHighlight,
    addRow,
    // 暴露禁用编辑控制方法
    toggleEdit,
    // 暴露获取选中行的方法
    getSelectedRows
})
</script>

<style lang="scss" scoped>
.generic-table {
    :deep(.el-table .el-table__cell) {
        padding: 0 !important;
    }

    :deep(.el-table .cell) {
        padding: 0 !important;
    }

    :deep(.el-input__wrapper) {
        border: none !important;
        background-color: transparent !important;
    }

    :deep(.el-select__wrapper) {
        border: none !important;
        background-color: transparent !important;
    }
}

.context-menu {
    position: fixed;
    z-index: 9999;
    background-color: #ffffff;
    /* 更柔和的边框颜色 */
    border: 1px solid rgba(0, 0, 0, 0.06);
    /* 更大的圆角 */
    border-radius: 8px;
    /* 更有层次感的阴影 (类似 macOS/Material Design) */
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
        0 3px 6px -4px rgba(0, 0, 0, 0.12),
        0 9px 28px 8px rgba(0, 0, 0, 0.05);
    min-width: 180px;
    padding: 6px;
    /* 菜单整体内边距，让选项悬浮在中间 */
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

    .menu-list {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    /* 分割线 */
    .menu-divider {
        height: 1px;
        background-color: #f0f0f0;
        margin: 4px 6px;
    }

    li {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 13px;
        /* 稍微小一点的字体更显精致 */
        color: #333333;
        border-radius: 6px;
        /* 选项本身的圆角 */
        transition: all 0.1s ease;
        margin-bottom: 2px;
        /* 选项间距 */

        /* 图标样式 */
        .el-icon {
            margin-right: 10px;
            font-size: 16px;
            color: #606266;
        }

        span {
            flex: 1;
        }

        /* 悬停效果 */
        &:hover {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);

            .el-icon {
                color: var(--el-color-primary);
            }
        }

        /* 激活/点击效果 */
        &:active {
            background-color: var(--el-color-primary-light-8);
        }

        /* 禁用状态 */
        &.disabled {
            color: #c0c4cc;
            cursor: not-allowed;
            background-color: transparent;

            .el-icon {
                color: #dcdfe6;
            }

            &:hover {
                background-color: transparent;
                color: #c0c4cc;
            }
        }

        /* 危险操作 (删除) 的特殊样式 - 可选 */
        &.danger-item {
            &:hover:not(.disabled) {
                background-color: var(--el-color-danger-light-9);
                color: var(--el-color-danger);

                .el-icon {
                    color: var(--el-color-danger);
                }
            }
        }
    }
}

.context-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
    background: transparent;
}
</style>