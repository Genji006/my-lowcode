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

                    <el-table-column v-for="col in conf.props.columns" :key="col.prop" :prop="col.prop"
                        :label="col.label" :width="col.width || ''" :align="col.align || 'left'"
                        :fixed="col.fixed ? col.fixed : false" show-overflow-tooltip>
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
import { mockApi } from '../../api/mock'; // 假设你的 mock 路径在这里

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

// === 1. 数据加载逻辑 (核心增强) ===
const loadData = async () => {
    loading.value = true;
    // 编辑模式下，不加载真实数据，而是生成假数据
    if (isPreview === false) {
        // 根据列配置，生成 3 行假数据
        const dummy = {};
        props.conf.props.columns.forEach(col => {
            dummy[col.prop] = `${col.label}-演示`;
        });

        tableData.value = [dummy, dummy, dummy];
        total.value = 3;
        loading.value = false;
        return;
    }
    try {
        // 构造最终参数：合并 上游参数(apiParams) + 分页参数
        const requestParams = {
            ...props.apiParams,
            page: currentPage.value,
            pageSize: pageSize.value
        };

        // 调用 Mock 接口
        const res = await mockApi.getUsers(requestParams);

        if (res && res.code === 200) {
            // 兼容两种返回格式：
            // 1. 直接返回数组 (res.data = [])
            // 2. 返回分页对象 (res.data = { list: [], total: 100 })
            if (Array.isArray(res.data)) {
                tableData.value = res.data;
                total.value = res.data.length; // 如果是纯数组，total 就是长度
            } else if (res.data && Array.isArray(res.data.list)) {
                tableData.value = res.data.list;
                total.value = res.data.total || 0;
            }

            // 保留你原有的逻辑：加载完默认选中第一行抛出
            if (tableData.value.length > 0) {
                emit('update-data', tableData.value[0]);
                // 注意：这里建议谨慎开启，因为可能导致死循环（表格更新->抛出->表单更新->表格更新）
                // 只有当业务确实需要“默认选中第一行”时才开
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

// === 2. 监听器 ===
// 监听上游参数变化 (例如查询表单点击查询)
watch(() => props.apiParams, (newParams) => {
    // 参数变了，通常重置回第一页
    currentPage.value = 1;
    loadData();
}, { deep: true });

// 监听配置变化 (例如右侧面板改了每页条数)
watch(() => props.conf.props.pageSize, (newVal) => {
    if (newVal) pageSize.value = newVal;
});

// === 3. 初始化 ===
onMounted(() => {
    // 初始化分页
    if (props.conf.props.pageSize) {
        pageSize.value = props.conf.props.pageSize;
    }
    loadData();
});

// === 4. 交互处理 ===

// 行点击
const handleRowClick = (row) => {
    // 抛出当前行数据
    emit('update-data', row);
};

// 单元格特定点击 (你原有的逻辑)
const handleCellClick = (row, col) => {
    console.log('点击了单元格:', col.label, row);
    // 可以在这里做特殊跳转逻辑
};

// 多选变化
const handleSelectionChange = (rows) => {
    // 抛出选中行数组
    emit('update-data', rows);
};

// 页码变化
const handlePageChange = (val) => {
    currentPage.value = val;
    loadData();
};

// 每页条数变化
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1; // 重置回第一页
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

/* 表格主体区域：占满剩余空间 */
.table-content-box {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 300px;
}

/* 2. 绝对定位层：强行填满父级，不许撑开 */
.absolute-fit {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

/* 自定义可点击文本样式 */
.clickable-text {
    color: #409eff;
    cursor: pointer;
    font-weight: 500;
}

.clickable-text:hover {
    text-decoration: underline;
}

/* 分页栏样式 */
.pagination-box {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    /* 防止被挤压 */
    background: #fff;
    padding-top: 5px;
}
</style>