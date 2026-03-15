<template>
    <SzycDialog :dialogVisible="dialogVisible" width="80%" @close="handleClose" title="预览数据" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="preview-container">
                <!-- 数据源选择区域 -->
                <div class="selection-panel" v-if="availableDataSets.length > 0 && showTags">
                    <h4>请选择要预览的数据源：</h4>
                    <el-tag v-for="(dataset, index) in availableDataSets" :key="index"
                        :type="selectedDatasetIndex === index ? 'primary' : 'info'" effect="light" :closable="false"
                        disable-transitions @click="selectDataSet(index)" class="dataset-tag"
                        :class="{ 'selected': selectedDatasetIndex === index }">
                        {{ dataset.name }}
                    </el-tag>
                </div>

                <!-- 表格展示区域 -->
                <div class="table-container"
                    v-if="previewData && ((previewData.firstRecords && Array.isArray(previewData.firstRecords)) || (availableDataSets.length > 0 && availableDataSets[selectedDatasetIndex]))">
                    <tableList ref="tableRef" v-bind="bindData">
                    </tableList>
                </div>

                <!-- 当没有可用数据时的提示 -->
                <div
                    v-if="!hasLastPreviewResults && (!previewData || !previewData.firstRecords || !Array.isArray(previewData.firstRecords)) && availableDataSets.length === 0">
                    <p>暂无预览数据</p>
                </div>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive, computed } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import tableList from "@/components/table/tableAndPage.vue";
import { reactive as reactiveVue } from 'vue';

const previewData = ref({})
const lastPreviewResults = ref([])
const availableDataSets = ref([])
const selectedDatasetIndex = ref(0)
const hasLastPreviewResults = ref(false)
const dialogVisible = ref(false)
const tableRef = ref(null)

// 定义组件属性
const props = defineProps({
})

// 定义事件发射
const emit = defineEmits(['add', 'close'])

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

const selectDataSet = (index) => {
    selectedDatasetIndex.value = index;
    previewData.value = availableDataSets.value[index];

    // 更新表格数据
    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.fetchData();
        }
    });
};

const showTags = ref(false)
const getPreviewData = async (data) => {
    // 检查是否有lastPreviewResults数据
    if (data.lastPreviewResults && Array.isArray(data.lastPreviewResults) && data.lastPreviewResults.length > 0) {
        showTags.value = true;
        hasLastPreviewResults.value = true;
        lastPreviewResults.value = data.lastPreviewResults;
        availableDataSets.value = data.lastPreviewResults.map((item, index) => ({
            ...item,
            originalIndex: index
        }));

        // 默认显示第一个数据集
        if (availableDataSets.value.length > 0) {
            previewData.value = availableDataSets.value[0];
            selectedDatasetIndex.value = 0;
        }
    }
    // 如果没有lastPreviewResults，则使用原有的逻辑
    else if (data.previewData && data.previewData.firstRecords && Array.isArray(data.previewData.firstRecords)) {
        showTags.value = false;
        hasLastPreviewResults.value = false;
        previewData.value = data.previewData;
        availableDataSets.value = [data.previewData];
        selectedDatasetIndex.value = 0;

        if (previewData.value.firstRecords && Array.isArray(previewData.value.firstRecords)) {
            previewData.value.firstRecords.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (row[key] === '&lt;null&gt;' || row[key] === null || row[key] === undefined) {
                        row[key] = 'null';
                    }
                });
            });
        }
    } else {
        console.log(data.lastPreviewResults);
        hasLastPreviewResults.value = false;
        availableDataSets.value = [];
    }

    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.fetchData();
        }
    });
};

const openDialog = (data) => {
    getPreviewData(data);
    dialogVisible.value = true;
    // 在对话框打开后，确保表格数据被更新
    nextTick(() => {
        if (tableRef.value) {
            tableRef.value.fetchData();
        }
    });
}

const bindData = reactiveVue({
    pageOpen: "1", //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "CHARGE_PROJ_ID",
    btnList: [], // 表格按钮
    apiUrl: computed(() => {
        if (previewData.value && previewData.value.firstRecords && Array.isArray(previewData.value.firstRecords)) {
            // 处理数据中的特殊字符
            return previewData.value.firstRecords.map(row => {
                const newRow = {};
                Object.keys(row).forEach(key => {
                    if (row[key] === '&lt;null&gt;' || row[key] === null || row[key] === undefined) {
                        newRow[key] = 'null';
                    } else {
                        newRow[key] = row[key];
                    }
                });
                return newRow;
            });
        }
        return [];
    }),
    showBorder: true, //  是否需要边框
    designTableColumns: computed(() => {
        if (previewData.value && previewData.value.columns) {
            if (Array.isArray(previewData.value.columns)) {
                return previewData.value.columns.map(columnInfo => {
                    return {
                        columnLabel: columnInfo.header || columnInfo.dataIndex,
                        columnName: columnInfo.dataIndex || columnInfo.header,
                        // columnWidth: columnInfo.width || "150",
                        showOverflowTooltip: true,
                        align: "center",
                    }
                });
            } else if (typeof previewData.value.columns === 'object') {
                // 如果是对象格式的列定义
                return Object.keys(previewData.value.columns).map(key => {
                    const columnInfo = previewData.value.columns[key];
                    return {
                        columnLabel: columnInfo.header || key,
                        columnName: columnInfo.header,
                        // columnWidth: "150",
                        showOverflowTooltip: true,
                        align: "center",
                    }
                });
            }
        }
        return [];
    }),
});

// 暴露方法给父组件
defineExpose({
    openDialog,
})

// 组件初始化时调用
onMounted(() => {
})
</script>

<style scoped lang="less">
.preview-container {
    height: 600px;
    display: flex;
    flex-direction: column;
}

.selection-panel {
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 1px solid #eee;

    h4 {
        margin-top: 0;
        margin-bottom: 10px;
    }

    .dataset-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .dataset-tag {
        cursor: pointer;
        margin: 0 5px;
    }
}

.table-container {
    flex: 1;
    overflow: auto;
    height: calc(600px - 80px); // 调整高度以适应选择面板
}

.userIndex-operate-btn {
    color: rgba(0, 115, 237, 1);
    cursor: pointer;
    text-decoration: underline;
}
</style>