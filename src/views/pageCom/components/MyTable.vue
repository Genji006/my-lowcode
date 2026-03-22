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
import { useRoute } from 'vue-router';
import { queryDataPageApi } from '@/api/settings';

const isPreview = inject('isPreview', true);
const route = useRoute();
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
        const formatQueryParams = (paramsObj) => {
            if (!paramsObj) return [];

            const resultParams = [];
            // 获取当前组件配置的 mapping 规则字典 (键为依赖组件的ID，值为规则数组)
            const mappingDict = props.conf.paramsMapping || {};

            // 遍历所有上游传过来的参数 (paramsObj 的键是上游组件的 ID 或别名)
            Object.keys(paramsObj).forEach(sourceKey => {
                const sourceData = paramsObj[sourceKey];
                // 看看当前组件有没有针对这个 sourceKey (依赖组件) 配置映射规则
                const rules = mappingDict[sourceKey];

                if (rules && rules.length > 0) {
                    // --- 情况 1：配置了 Mapping 规则 ---
                    rules.forEach(rule => {
                        if (!rule.target) return;

                        let extractedValue = '';
                        // 1. 如果规则里没填源路径(source)，说明用户想直接把整个数据对象当作字符串发过去
                        if (!rule.source) {
                            extractedValue = typeof sourceData === 'object' ? JSON.stringify(sourceData) : sourceData;
                        }
                        // 2. 如果规则是简单的键名 (如 deptId)
                        else if (sourceData && sourceData[rule.source] !== undefined) {
                            extractedValue = sourceData[rule.source];
                        }
                        // 3. (高级进阶) 支持点语法深层提取 (如 user.info.id)
                        else if (rule.source.includes('.')) {
                            const keys = rule.source.split('.');
                            let temp = sourceData;
                            for (let k of keys) {
                                if (temp && typeof temp === 'object') {
                                    temp = temp[k];
                                } else {
                                    temp = undefined;
                                    break;
                                }
                            }
                            if (temp !== undefined) extractedValue = temp;
                        }

                        // 捞到值后，放入结果数组
                        resultParams.push({
                            columnName: rule.target,
                            columnValue: String(extractedValue)
                        });
                    });
                } else {
                    // --- 情况 2：没配置 Mapping 规则，走兜底逻辑 ---
                    // 默认把 sourceKey 当作参数名，把整个对象当成值 (或者提取 value 属性)
                    if (typeof sourceData === 'object' && sourceData !== null) {
                        // 如果是个对象，优先提取里面的 'value' 或自己本身的 id，如果都没有，转成 JSON 字符串
                        const fallbackVal = sourceData.value !== undefined ? sourceData.value : JSON.stringify(sourceData);
                        resultParams.push({ columnName: sourceKey, columnValue: fallbackVal });
                    } else {
                        resultParams.push({ columnName: sourceKey, columnValue: sourceData });
                    }
                }
            });

            return resultParams;
        };

        // 解析自定义参数列表
        const buildCustomParams = () => {
            const customParamsList = props.conf.props.customParams || [];
            const result = [];

            customParamsList.forEach(param => {
                if (!param.key) return; // 没填键名的跳过

                let calculatedValue = '';
                if (param.type === 'static') {
                    calculatedValue = param.value;
                } else if (param.type === 'script' && param.value) {
                    try {
                        const customFunc = new Function('route', param.value);
                        calculatedValue = customFunc(route);
                        console.log(`自定义参数[${param.key}]计算结果:`, calculatedValue);
                        console.log("当前 Vue 路由参数:", route?.query);
                    } catch (e) {
                        console.error(`自定义参数[${param.key}]脚本执行报错:`, e);
                    }
                }

                result.push({
                    columnName: param.key,
                    columnValue: calculatedValue
                });
            });
            return result;
        };

        // 将上游传来的依赖参数，和自己配置的自定义参数合并
        const finalQueryParams = [
            ...formatQueryParams(props.apiParams),
            ...buildCustomParams()
        ];

        const requestPayload = {
            componentId: props.conf.componentId,
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            queryParams: finalQueryParams
        };

        const res = await queryDataPageApi(requestPayload);

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
    /* padding: 10px; */
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