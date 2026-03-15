<template>
    <div class="comp-box table-wrapper">
        <div class="table-content-box">
            <div class="absolute-fit">
                <el-table ref="tableRef" :data="tableData" v-loading="loading" style="width: 100%; height: 100%"
                    height="100%" :stripe="conf.props.stripe" :border="conf.props.border"
                    :size="conf.props.size || 'default'" :show-header="conf.props.showHeader !== false"
                    highlight-current-row @row-click="handleRowClick" @selection-change="handleSelectionChange">
                    <el-table-column v-if="conf.props.selection" type="selection" width="55" align="center"
                        fixed="left" />

                    <el-table-column type="index" width="50" label="#" align="center" fixed="left" />

                    <el-table-column v-for="col in currentColumns" :key="col.prop" :prop="col.prop" :label="col.label"
                        :width="col.width || ''" :align="col.align || 'left'" :fixed="col.fixed ? col.fixed : false"
                        show-overflow-tooltip>
                        <template #default="scope">
                            <span v-if="col.clickable" class="clickable-text"
                                @click.stop="handleCellClick(scope.row, col)">
                                {{ scope.row[col.prop] }}
                            </span>
                            <span v-else>{{ scope.row[col.prop] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <div class="pagination-box" v-if="conf.props.pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                :small="conf.props.size === 'small'" background @size-change="handleSizeChange"
                @current-change="handlePageChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, inject } from 'vue';
import { mockApi } from '@/api/mock';

const isPreview = inject('isPreview', true);

const props = defineProps({
    // 组件静态配置
    conf: {
        type: Object,
        default: () => ({ props: { columns: [] } })
    },
    // 依赖参数 (来自 PageRender)
    apiParams: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update-data']);

// === 状态定义 ===
const tableData = ref([]);
const loading = ref(false);
const tableRef = ref(null);

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);


// 获取所有数据集
const datasets = computed(() => props.conf.props.datasets || []);

// 获取当前激活的数据集 ID
const activeDatasetId = computed(() => props.conf.props.activeDatasetId);

// 计算当前生效的数据集对象
const currentDataset = computed(() => {
    if (datasets.value.length === 0) {
        return {
            sql: props.conf.props.datasets[0].sql || '',
            columns: props.conf.props.datasets[0].columns || []
        };
    }
    // 查找当前激活的
    const found = datasets.value.find(ds => ds.id === activeDatasetId.value);
    return found || datasets.value[0];
});

const currentColumns = computed(() => currentDataset.value.columns || []);

const currentSql = computed(() => currentDataset.value.sql || '');


// === 2. 数据加载逻辑 ===
const loadData = async () => {
    loading.value = true;

    // A. 编辑模式：生成假数据
    if (isPreview === false) {
        const dummy = {};
        // 使用当前视图的列生成数据
        currentColumns.value.forEach(col => {
            dummy[col.prop] = `${col.label}-演示`;
        });
        // 模拟 5 条数据
        tableData.value = Array(5).fill(dummy);
        total.value = 5;
        loading.value = false;
        return;
    }

    // B. 预览/运行模式：调用接口
    try {
        const requestParams = {
            ...props.apiParams,
            page: currentPage.value,
            pageSize: pageSize.value,
            // 关键：把当前视图的 SQL 或 ID 传给后端
            // 真实场景下，后端可能根据 viewId 查找预存的 SQL，或者接收加密的 SQL
            viewId: currentDataset.value.id,
            sql: currentSql.value
        };

        // 调用 Mock 接口
        const res = await mockApi.getUsers(requestParams);

        if (res && res.code === 200) {
            let rawList = [];
            if (Array.isArray(res.data)) {
                rawList = res.data;
                total.value = res.data.length;
            }

            tableData.value = rawList.map((row, index) => {
                const newRow = { ...row };
                console.log(newRow);
                console.log(currentColumns.value);
                currentColumns.value.forEach(col => {
                    if (newRow[col.prop] === undefined) {
                        newRow[col.prop] = `${col.label}_${index + 1}`;
                    }
                });
                return newRow;
            });

            if (tableData.value.length > 0) {
                emit('update-data', tableData.value[0]);
            }
        } else {
            tableData.value = [];
            total.value = 0;
        }
    } catch (err) {
        console.error('表格数据加载失败:', err);
        tableData.value = [];
    } finally {
        loading.value = false;
    }
};

// === 3. 监听器 ===

// 监听上游参数变化
watch(() => props.apiParams, () => {
    currentPage.value = 1;
    loadData();
}, { deep: true });

// 监听配置变化 (分页大小)
watch(() => props.conf.props.pageSize, (newVal) => {
    if (newVal) pageSize.value = newVal;
});

// 监听当视图切换时，重新加载数据
watch(activeDatasetId, () => {
    currentPage.value = 1;
    loadData();
});

// 初始化
onMounted(() => {
    if (props.conf.props.pageSize) {
        pageSize.value = props.conf.props.pageSize;
    }
    loadData();
});


const handleRowClick = (row) => emit('update-data', row);
const handleCellClick = (row, col) => console.log('点击单元格:', col.label, row);
const handleSelectionChange = (rows) => emit('update-data', rows);
const handlePageChange = (val) => {
    currentPage.value = val;
    loadData();
};
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    loadData();
};
</script>

<style scoped>
.table-wrapper {
    background: #fff;
    height: 100%;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.table-content-box {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 300px;
}

.absolute-fit {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.clickable-text {
    color: #409eff;
    cursor: pointer;
    font-weight: 500;
}

.clickable-text:hover {
    text-decoration: underline;
}

.pagination-box {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    background: #fff;
    padding-top: 5px;
}
</style>