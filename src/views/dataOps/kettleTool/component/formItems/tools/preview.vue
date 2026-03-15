<template>
    <SzycDialog :dialogVisible="dialogVisible" width="70%" @close="handleClose" title="转换调试窗口" :destroy-on-close="true"
        :alignCenter="true" class="kettle-dialog">
        <template #uname>
            <div class="layout-container">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <span>步骤列表</span>
                    </div>
                    <el-scrollbar>
                        <ul class="step-list">
                            <li v-for="item in steps" :key="item.index" class="step-item" :class="{
                                'is-selected': selectedIds.includes(item.index),
                                'is-active': currentEditId === item.index
                            }" @click="handleStepClick(item)">
                                <span class="item-name">{{ item.name }}</span>
                                <el-tag v-if="selectedIds.includes(item.index)" size="small" type="primary"
                                    effect="plain" class="status-tag">
                                    选中
                                </el-tag>
                            </li>
                        </ul>
                    </el-scrollbar>
                </aside>

                <main class="content">
                    <template v-if="currentStepData">
                        <div class="form-header">
                            <span class="title">配置步骤: {{ currentStepData.name }}</span>
                        </div>
                        <el-form :model="currentStepData" label-width="120px" :key="currentStepData.index"
                            size="default">
                            <el-form-item label="获取行数">
                                <el-input-number v-model="currentStepData.rowCount" :min="1" controls-position="right"
                                    style="width: 100%" />
                            </el-form-item>
                            <el-form-item label="预览模式">
                                <el-switch v-model="currentStepData.firstRows" active-text="仅获取前几行" inactive-text="全部获取"
                                    active-value="Y" inactive-value="N" />
                            </el-form-item>
                            <el-form-item label="条件暂停">
                                <el-switch v-model="currentStepData.pauseBreakPoint" active-text="满足条件时暂停转换"
                                    inactive-text="不暂停" active-value="Y" inactive-value="N" />
                            </el-form-item>
                            <el-divider />
                            <el-form-item label="过滤条件">
                                <div class="condition-box">
                                    <filterBuilder v-model="currentStepData.condition" :index="-1"
                                        style="height: 300px; overflow: auto;" :field-options="fieldOptions" />
                                </div>
                            </el-form-item>
                        </el-form>
                    </template>
                    <el-empty v-else description="请选择步骤" />
                </main>
            </div>

            <div class="dialog-footer">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleRun">快速启动</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed, defineExpose } from 'vue'
import { initPreview, inputOutputFields, previewInfo, runPreviewApi } from '@/api/kettleApi/index'
import filterBuilder from "../tools/filterBuilder.vue";
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"

const emit = defineEmits(['run'])

const dialogVisible = ref(false)
const currentEditId = ref(null)
const selectedIds = ref([])
const steps = ref([])
const fieldOptions = ref([])
const allXml = ref('')

const handleClose = () => { dialogVisible.value = false }

// 计算当前编辑的数据
const currentStepData = computed(() => {
    return steps.value.find(item => item.index === currentEditId.value)
})

const handleStepClick = (item) => {
    currentEditId.value = item.index
    getPartitioningField(item)
}

const getPreviewInfo = async (data) => {
    try {
        allXml.value = data.graphXml
        const res = await initPreview({ graphXml: data.graphXml, selectedCells: data.selectedCells })
        const autoSelectedIds = []

        // 2. 处理数据并判断选中逻辑
        steps.value = res.map(step => {
            const rawRowCount = step.rowCount
            const isValidNumber = rawRowCount !== null &&
                rawRowCount !== undefined &&
                rawRowCount !== '' &&
                !isNaN(Number(rawRowCount))

            if (isValidNumber) {
                autoSelectedIds.push(step.index)
            }
            return {
                ...step,
                rowCount: step.rowCount || 1000,
                firstRows: step.firstRows,
                pauseBreakPoint: step.pauseBreakPoint,
                condition: step.condition || {},
            }
        })
        selectedIds.value = autoSelectedIds
        if (steps.value.length > 0) {
            const firstSelected = steps.value.find(s => selectedIds.value.includes(s.index))
            const targetStep = firstSelected || steps.value[0]
            currentEditId.value = targetStep.index
            await getPartitioningField(targetStep)
        }
    } catch (error) {
        console.log(error)
    }
}
const getPartitioningField = async (item) => {
    try {
        let params = {
            stepName: item.name,
            graphXml: allXml.value,
            before: false,
        };
        let res = await inputOutputFields(params);
        fieldOptions.value = res.map(item => ({
            label: item.name,
            value: item.name,
        }))
    } catch {
        // ElMessage.error("获取分区字段失败")
    }
}

const openDialog = (data) => {
    selectedIds.value = []
    currentEditId.value = null
    getPreviewInfo(data)
    dialogVisible.value = true
}

const handleRun = async () => {
    let res = await previewInfo({
        graphXml: allXml.value,
        selectedCells: JSON.stringify(steps.value.map(item => ({
            ...item,
            condition: (JSON.stringify(item.condition) === '{}') ? null : item.condition.conditions[0],
        }))),
    })
    if (res.success == true) {
        runPreview(res.message)
    } else {
        ElMessage.error("预览失败")
    }
}
// 运行预览
const runPreview = async (val) => {
    let params = {
        executionId: val,
        action: 'askformore',
    };
    let res = await runPreviewApi(params);
    if (res.code == 500) {
        ElMessage.success("预览失败")
    } else {
        emit('run', res)
        dialogVisible.value = false
    }
};
defineExpose({ openDialog })
</script>

<style scoped lang="scss">
/* 基础布局 */
.layout-container {
    display: flex;
    height: 450px;
    /* 适当降低高度 */
    border-top: 1px solid #eee;
}

.sidebar {
    width: 240px;
    border-right: 1px solid #eee;
    background-color: #fcfcfc;
    display: flex;
    flex-direction: column;

    .sidebar-header {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #606266;
    }

    .step-list {
        padding: 8px;
        margin: 0;
        list-style: none;
    }

    .step-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 4px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #606266;
        transition: background 0.1s;

        .item-icon {
            margin-right: 8px;
            font-size: 16px;
        }

        .item-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status-tag {
            margin-left: 5px;
            transform: scale(0.9);
        }

        &:hover {
            background-color: #f2f3f5;
        }

        &.is-selected {
            background-color: #f2f3f5;
            color: #303133;
            font-weight: 500;
        }

        &.is-active {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);

            .item-icon {
                color: var(--el-color-primary);
            }
        }
    }
}

.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .form-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        font-size: 16px;
        font-weight: bold;
        color: #303133;
    }

    .condition-box {
        border: 1px dashed #dcdfe6;
        padding: 10px;
        border-radius: 4px;
        width: 100%;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #eee;
    margin-top: 10px;
}
</style>