<template>
    <Teleport to="body">
        <transition name="slide-up">
            <div v-if="visible" class="custom-drawer" :style="{ height: panelHeight + 'px' }">
                <div class="resize-handle" @mousedown="startDrag">
                    <div class="handle-bar"></div>
                </div>

                <div class="close-btn" @click="close">
                    <el-icon>
                        <Close />
                    </el-icon>
                </div>

                <div class="result-container">
                    <div class="status-bar">
                        <div class="status-left">
                            <div class="status-item">
                                <span class="label">执行状态：</span>
                                <el-tag :type="statusType" effect="dark" size="small">{{ statusText }}</el-tag>
                            </div>
                            <div class="status-item">
                                <span class="label">记录时间：</span>
                                <span class="value">{{ currentTime }}</span>
                            </div>
                        </div>
                    </div>

                    <el-tabs v-model="activeTab" class="custom-tabs" type="card" tab-position="top">
                        <el-tab-pane label="运行日志 (Log)" name="log">
                            <div class="log-wrapper">
                                <div class="log-content">
                                    <pre v-html="highlightedLog"></pre>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="步骤度量 (Metrics)" name="result">
                            <div class="table-wrapper">
                                <el-table :data="tableData" style="width: 100%;" height="100%" border stripe
                                    highlight-current-row size="small"
                                    :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }">
                                    <el-table-column type="index" label="#" width="50" align="center" fixed />
                                    <el-table-column prop="stepName" label="步骤名称" min-width="160" fixed
                                        show-overflow-tooltip />
                                    <el-table-column prop="copy" label="复制" width="100" align="center" />
                                    <el-table-column prop="read" label="读" width="100" align="center" />
                                    <el-table-column prop="written" label="写" width="100" align="center" />
                                    <el-table-column prop="input" label="输入" width="100" align="center" />
                                    <el-table-column prop="output" label="输出" width="100" align="center" />
                                    <el-table-column prop="updated" label="更新" width="100" align="center" />

                                    <el-table-column prop="rejected" label="拒绝" width="100" align="center">
                                        <template #default="scope">
                                            <span :class="{ 'text-danger': parseInt(scope.row.rejected) > 0 }">{{
                                                scope.row.rejected }}</span>
                                        </template>
                                    </el-table-column>

                                    <el-table-column prop="errors" label="错误" width="100" align="center">
                                        <template #default="scope">
                                            <span :class="{ 'text-error-bold': parseInt(scope.row.errors) > 0 }">{{
                                                scope.row.errors }}</span>
                                        </template>
                                    </el-table-column>

                                    <el-table-column prop="status" label="状态" width="100" align="center">
                                        <template #default="scope">
                                            <el-tag size="small" :type="getStatusTagType(scope.row.status)">{{
                                                scope.row.status }}</el-tag>
                                        </template>
                                    </el-table-column>

                                    <el-table-column prop="time" label="耗时" width="100" align="center" />
                                    <el-table-column prop="speed" label="速度 (r/s)" width="160" align="center"
                                        show-overflow-tooltip />
                                    <el-table-column prop="priority" label="Pri/in/out" width="160" align="center"
                                        show-overflow-tooltip />
                                </el-table>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { Close } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const visible = ref(false);
const activeTab = ref('log');
const logContent = ref('');
const tableData = ref([]);
const isFinished = ref(false);
const currentTime = ref('');

// ============ 拖拽高度控制 ============
const panelHeight = ref(400); // 默认高度改小一点，避免遮挡太多
const minHeight = 150;
const maxHeight = window.innerHeight - 100;

let isDragging = false;
let startY = 0;
let startHeight = 0;

const startDrag = (e) => {
    isDragging = true;
    startY = e.clientY;
    startHeight = panelHeight.value;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
};

const onDrag = (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    let newHeight = startHeight + deltaY;
    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;
    panelHeight.value = newHeight;
};

const stopDrag = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
};

onUnmounted(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
});


const statusText = computed(() => {
    if (isFinished.value) {
        if (logContent.value && logContent.value.includes('ERROR')) return '执行完成 (有错误)';
        return '执行成功';
    }
    return '运行中...';
});

const statusType = computed(() => {
    if (statusText.value.includes('错误') || statusText.value.includes('失败')) return 'danger';
    if (statusText.value === '执行成功') return 'success';
    return 'primary';
});

const highlightedLog = computed(() => {
    if (!logContent.value) return '暂无日志...';
    let html = logContent.value;
    html = html.replace(/(ERROR)/g, '<span style="color: #f56c6c; font-weight: bold;">$1</span>');
    html = html.replace(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/g, '<span style="color: #409eff;">$1</span>');
    return html;
});

const getStatusTagType = (statusStr) => {
    if (statusStr === '已完成') return 'success';
    if (statusStr === '运行中') return 'primary';
    if (statusStr === '停止') return 'danger';
    return 'info';
};

const transformData = (stepMeasure) => {
    if (!Array.isArray(stepMeasure)) return [];
    return stepMeasure.map((row) => ({
        stepName: row[0], copy: row[1], read: row[2], written: row[3],
        input: row[4], output: row[5], updated: row[6], rejected: row[7],
        errors: row[8], status: row[9], time: row[10], speed: row[11], priority: row[12],
    }));
};

// const open = (data) => {
//     visible.value = true;
//     // 仅在首次打开时设置默认标签页，后续更新不改变用户选择的标签页
//     if (!activeTab.value) {
//         activeTab.value = 'log';
//     }
//     currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');

//     if (data) {
//         isFinished.value = data.finished;
//         // 保留用户选择的标签页，不根据错误类型自动切换
//         logContent.value = data.log || '';
//         tableData.value = transformData(data.stepMeasure);
//     } else {
//         logContent.value = '暂无数据';
//         tableData.value = [];
//     }
// };

const open = (data) => {
    visible.value = true;
    
    // 如果没有传新数据，直接返回，保留之前的值
    if (!data) return; 

    // 只有传入了新数据（比如开始新任务），才更新
    if (!activeTab.value) {
        activeTab.value = 'log';
    }
    
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    isFinished.value = data.finished;
    logContent.value = data.log || '';
    tableData.value = transformData(data.stepMeasure);
};

// 添加一个专门用于更新数据的方法，不改变用户当前的视图状态
const update = (data) => {
    if (data) {
        isFinished.value = data.finished;
        logContent.value = data.log || '';
        tableData.value = transformData(data.stepMeasure);
        // 只更新时间，不改变标签页
        currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
};

const close = () => {
    visible.value = false;
};

defineExpose({ open, close, update });
</script>

<style lang="scss" scoped>
/* 移除了 .drawer-mask 样式
*/

.custom-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 2001;
    /* 增加阴影深度，因为没有遮罩层了，需要更明显的边界感 */
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
    border-top: 1px solid #ebeef5;
    /* 增加顶部边框 */
    // border-top-left-radius: 12px;
    // border-top-right-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    /* 关键点：确保面板本身可以接收点击，而不会因为没有 mask 而点透 */
    pointer-events: auto;
}

/* 拖拽手柄 */
.resize-handle {
    width: 100%;
    height: 14px;
    cursor: row-resize;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #f2f2f2;
    flex-shrink: 0;

    &:hover .handle-bar {
        background-color: #999;
    }
}

.handle-bar {
    width: 40px;
    height: 4px;
    background-color: #dcdfe6;
    border-radius: 2px;
    transition: background-color 0.2s;
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    z-index: 10;
    transition: color 0.2s;

    &:hover {
        color: #333;
        transform: scale(1.1);
    }
}

.result-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 20px 15px 20px; /* 底部增加 15px 的留白，视觉上更完整 */
    height: 100%;
    box-sizing: border-box;
    overflow: hidden; /* 防止外层出现双滚动条 */
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    flex-shrink: 0;

    .status-left {
        display: flex;
        gap: 25px;
    }

    .status-item {
        font-size: 16px;
        display: flex;
        align-items: center;

        .label {
            color: #909399;
            margin-right: 8px;
        }

        .value {
            font-family: monospace;
            font-weight: 600;
            color: #303133;
        }
    }
}

.custom-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
        order: 0 !important;
        margin: 0 0 10px 0 !important;
        border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-tabs__content) {
        order: 1 !important;
        flex: 1;
        overflow: hidden;
        padding: 0;
    }

    :deep(.el-tab-pane) {
        height: 100%;
    }
}

.table-wrapper {
    flex: 1;        /* 让容器占据剩余所有空间 */
    height: 100%;   /* 配合父级 flex 保证高度撑满 */
    width: 100%;
    position: relative; /* 建立定位上下文 */
}

/* 确保 tab 窗格也是 flex 布局 */
:deep(.el-tab-pane) {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.log-wrapper {
    height: 100%;
    background-color: #1e1e1e;
    border-radius: 4px;
    overflow: hidden;
}

.log-content {
    height: 100%;
    overflow: auto;
    padding: 15px;
    box-sizing: border-box;

    pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #e6e6e6;
    }
}

.text-danger {
    color: #f56c6c;
    font-weight: bold;
}

.text-error-bold {
    color: #f56c6c;
    font-weight: 900;
    font-size: 1.1em;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>