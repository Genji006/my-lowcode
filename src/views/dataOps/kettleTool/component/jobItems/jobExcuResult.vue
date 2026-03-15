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

                        <el-tab-pane label="作业度量" name="result">
                            <div class="table-wrapper">
                                <el-table :data="tableData" style="width: 100%; height: 100%" border stripe
                                    highlight-current-row size="small"
                                    :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }">
                                    <el-table-column type="index" label="#" width="50" align="center" fixed />
                                    <el-table-column prop="name" label="任务/任务条目" min-width="160" fixed
                                        show-overflow-tooltip />
                                    <el-table-column prop="comment" label="注释" width="100" align="center" />
                                    <el-table-column prop="result" label="结果" width="100" align="center" />
                                    <el-table-column prop="reason" label="原因" width="100" align="center" />
                                    <el-table-column prop="fileName" label="文件名" width="100" align="center" />
                                    <el-table-column prop="number" label="数量" width="100" align="center" />
                                    <el-table-column prop="logDate" label="日志日期" width="100" align="center" />
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
import { ref, computed, onUnmounted } from 'vue';
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

    // 解码URL编码的日志内容
    let decodedLog = decodeURIComponent(logContent.value.replace(/\+/g, '%20'));

    // 将换行符转换为HTML换行，并添加高亮
    let html = decodedLog.replace(/\n/g, '<br>');
    html = html.replace(/(ERROR)/g, '<span style="color: #f56c6c; font-weight: bold;">$1</span>');
    html = html.replace(/(SUCCESS|成功)/g, '<span style="color: #67c23a; font-weight: bold;">$1</span>');
    html = html.replace(/(WARNING|WARN)/g, '<span style="color: #e6a23c; font-weight: bold;">$1</span>');
    html = html.replace(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/g, '<span style="color: #409eff;">$1</span>');
    html = html.replace(/(INFO)/g, '<span style="color: #909399; font-weight: bold;">$1</span>');
    return html;
});

const getStatusTagType = (statusStr) => {
    if (statusStr === '已完成') return 'success';
    if (statusStr === '运行中') return 'primary';
    if (statusStr === '停止') return 'danger';
    return 'info';
};

const transformData = (jobMeasure) => {
    if (!Array.isArray(jobMeasure)) return [];
    return jobMeasure.map((row) => ({
        name: row[0], comment: row[1], result: row[2], reason: row[3], fileName: row[4],
        number: row[5], logDate: row[6],
    }));
};

const open = (data) => {
    visible.value = true;
    // 仅在首次打开时设置默认标签页，后续更新不改变用户选择的标签页
    if (!activeTab.value) {
        activeTab.value = 'log';
    }
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (data) {
        isFinished.value = data.finished;
        // 保留用户选择的标签页，不根据错误类型自动切换
        logContent.value = data.log || '';
        tableData.value = transformData(data.jobMeasure);
    } else {
        logContent.value = '暂无数据';
        tableData.value = [];
    }
};

// 添加一个专门用于更新数据的方法，不改变用户当前的视图状态
const update = (data) => {
    if (data) {
        isFinished.value = data.finished;
        logContent.value = data.log || '';
        tableData.value = transformData(data.jobMeasure);
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
    padding: 10px 20px 0 20px;
    height: 100%;
    box-sizing: border-box;
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
    height: 100%;
    width: 100%;
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