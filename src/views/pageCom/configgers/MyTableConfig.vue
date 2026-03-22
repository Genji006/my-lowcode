<template>
    <div class="table-config">
        <el-form label-width="100px" label-position="right" inline size="small">
            <el-divider content-position="left">外观设置</el-divider>
            <el-form-item label="显示边框">
                <el-switch v-model="props.activeComp.props.border" />
            </el-form-item>
            <el-form-item label="斑马纹">
                <el-switch v-model="props.activeComp.props.stripe" />
            </el-form-item>
            <el-form-item label="显示表头">
                <el-switch v-model="props.activeComp.props.showHeader" />
            </el-form-item>
            <el-form-item label="开启多选">
                <el-switch v-model="props.activeComp.props.selection" />
            </el-form-item>
            <el-form-item label="表格尺寸">
                <el-radio-group v-model="props.activeComp.props.size">
                    <el-radio-button label="large">大</el-radio-button>
                    <el-radio-button label="default">中</el-radio-button>
                    <el-radio-button label="small">小</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="显示分页">
                <el-switch v-model="props.activeComp.props.pagination" />
            </el-form-item>
            <el-form-item label="每页条数" v-if="props.activeComp.props.pagination">
                <el-input-number v-model="props.activeComp.props.pageSize" :min="1" style="width: 100%" />
            </el-form-item>

            <el-divider content-position="left">多视图数据配置</el-divider>

            <div class="dataset-manager">
                <el-tabs v-model="props.activeComp.props.activeDatasetId" type="card" editable @edit="handleTabsEdit"
                    class="compact-tabs">
                    <el-tab-pane v-for="(item, index) in datasets" :key="item.id" :label="item.name" :name="item.id">
                    </el-tab-pane>
                </el-tabs>
            </div>

            <div v-if="currentDataset" class="current-ds-area">
                <el-form-item label="视图名称" style="width: 100%" label-width="90px">
                    <el-input v-model="currentDataset.name" placeholder="" />
                </el-form-item>

                <el-form-item label="查询 SQL" style="width: 100%; margin-right: 0; display: block;" label-width="90px">
                    <el-input v-model="currentDataset.sql" type="textarea" :rows="15" />
                    <div style="text-align: right; margin-top: 8px;">
                        <el-button type="primary" plain style="width: 100%" :loading="loading" @click="cereteCode">
                            {{ loading ? '解析中...' : '解析并生成列配置' }}
                        </el-button>
                    </div>
                </el-form-item>

                <!-- <div class="column-list">
                    <div v-for="(col, index) in currentDataset.columns" :key="index" class="col-item">
                        <div class="col-header">
                            <span class="col-title">#{{ index + 1 }} {{ col.label }}</span>
                            <div class="col-ops">
                                <el-button link size="small" :disabled="index === 0" @click="moveCol(index, -1)">
                                    <el-icon>
                                        <Top />
                                    </el-icon>
                                </el-button>
                                <el-button link size="small" :disabled="index === currentDataset.columns.length - 1"
                                    @click="moveCol(index, 1)">
                                    <el-icon>
                                        <Bottom />
                                    </el-icon>
                                </el-button>
                                <el-button link type="danger" size="small" @click="removeCol(index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>

                        <div class="col-detail">
                            <div class="detail-row">
                                <el-input v-model="col.label" placeholder="列名" size="small" style="width: 48%" />
                                <el-input v-model="col.prop" placeholder="字段Key" size="small" style="width: 48%" />
                            </div>
                            <div class="detail-row">
                                <el-input v-model="col.width" placeholder="宽度(px)" size="small" style="width: 48%" />
                                <el-select v-model="col.align" placeholder="对齐" size="small" style="width: 48%">
                                    <el-option label="左对齐" value="left" />
                                    <el-option label="居中" value="center" />
                                    <el-option label="右对齐" value="right" />
                                </el-select>
                            </div>
                            <div class="detail-row">
                                <el-checkbox v-model="col.fixed" label="固定列" size="small" />
                                <el-checkbox v-model="col.clickable" label="可点击" size="small" />
                            </div>
                        </div>
                    </div>

                    <el-button type="primary" plain size="small" style="width: 100%; margin-top: 10px" @click="addCol">
                        + 添加列
                    </el-button>
                </div> -->
                <div class="column-table-box" style="margin-top: 10px;">
                    <div
                        style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 13px; font-weight: bold; color: #606266;">数据列配置</span>
                        <el-button type="primary" plain size="small" @click="addCol" icon="Plus">添加列</el-button>
                    </div>

                    <el-table :data="currentDataset.columns" row-key="_id" border size="small" style="width: 100%;"
                        max-height="400px">
                        <el-table-column type="index" label="#" width="45" align="center" fixed="left" />

                        <el-table-column label="列名 (Label)" min-width="110">
                            <template #default="{ row }">
                                <el-input v-model="row.label" placeholder="显示名称" />
                            </template>
                        </el-table-column>

                        <el-table-column label="字段Key (Prop)" min-width="130">
                            <template #default="{ row }">
                                <el-input v-model="row.prop" placeholder="数据字段" />
                            </template>
                        </el-table-column>

                        <el-table-column label="宽度" width="80">
                            <template #default="{ row }">
                                <el-input v-model="row.width" placeholder="px" />
                            </template>
                        </el-table-column>

                        <el-table-column label="对齐" width="85">
                            <template #default="{ row }">
                                <el-select v-model="row.align">
                                    <el-option label="左" value="left" />
                                    <el-option label="中" value="center" />
                                    <el-option label="右" value="right" />
                                </el-select>
                            </template>
                        </el-table-column>

                        <el-table-column label="特性" width="170" align="center">
                            <template #default="{ row }">
                                <el-tooltip content="固定列" placement="top" :show-after="500">
                                    <el-checkbox v-model="row.fixed" label="固定列" />
                                </el-tooltip>
                                <el-tooltip content="可点击" placement="top" :show-after="500">
                                    <el-checkbox v-model="row.clickable" style="margin-left: 8px;" label="可点击" />
                                </el-tooltip>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="120" align="center" fixed="right">
                            <template #default="{ $index }">
                                <el-button link type="primary" :disabled="$index === 0" @click="moveCol($index, -1)"
                                    style="padding: 2px;">
                                    <el-icon>
                                        <Top />
                                    </el-icon>
                                </el-button>
                                <el-button link type="primary" :disabled="$index === currentDataset.columns.length - 1"
                                    @click="moveCol($index, 1)" style="padding: 2px;">
                                    <el-icon>
                                        <Bottom />
                                    </el-icon>
                                </el-button>
                                <el-button link type="danger" @click="removeCol($index)"
                                    style="padding: 2px; margin-left: 5px;">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

            </div>

            <div v-else>
                <el-empty description="请点击右上角 + 号添加视图" :image-size="60" />
            </div>

            <el-divider content-position="left">自定义请求参数</el-divider>
            <div style="padding: 0 10px;">
                <div v-for="(param, index) in activeComp.props.customParams" :key="index"
                    style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #ebeef5;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: bold; color: #606266;">参数 {{ index + 1 }}</span>
                        <el-button type="danger" link size="small" @click="removeCustomParam(index)">删除</el-button>
                    </div>

                    <el-row :gutter="10" style="margin-bottom: 8px;">
                        <el-col :span="12">
                            <el-input v-model="param.key" placeholder="键名(如: deptId)" />
                        </el-col>
                        <el-col :span="12">
                            <el-select v-model="param.type" placeholder="值类型">
                                <el-option label="静态固定值" value="static" />
                                <el-option label="JS 动态脚本" value="script" />
                            </el-select>
                        </el-col>
                    </el-row>

                    <el-input v-if="param.type === 'static'" v-model="param.value" placeholder="输入固定值" />
                    <div v-if="param.type === 'script'">
                        <el-input type="textarea" :rows="3" v-model="param.value"
                            placeholder="例: return route.query.id;" style="font-family: monospace; font-size: 12px;" />
                        <div style="font-size: 12px; color: #909399; margin-top: 4px;">支持 route 对象获取路由参数</div>
                    </div>
                </div>

                <el-button type="primary" plain size="small" style="width: 100%;" @click="addCustomParam">
                    + 添加参数
                </el-button>
                <el-button link type="success" size="small" @click="addStandardParams">
                    ⚡ 导入通用指标参数
                </el-button>
            </div>

        </el-form>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Top, Bottom, Delete } from '@element-plus/icons-vue';
import { mockApi } from '@/api/mock';
import { parseColumns } from "@/api/tool.js";

const props = defineProps(['activeComp']);
const loading = ref(false);

// 2. 初始化数据逻辑 (重要：防止旧组件报错)
const initData = () => {
    if (!props.activeComp || !props.activeComp.props) return;

    if (!props.activeComp.props.datasets) {
        const defaultId = 'ds_' + Date.now();
        props.activeComp.props.datasets = [{
            id: defaultId,
            name: '默认视图',
            sql: props.activeComp.props.sql || '',
            columns: props.activeComp.props.columns || []
        }];
        props.activeComp.props.activeDatasetId = defaultId;
    }
};

// 监听组件ID变化，确保切换组件时初始化数据
watch(() => props.activeComp.id, initData, { immediate: true });

// 3. 计算属性
const datasets = computed(() => {
    return props.activeComp.props.datasets || [];
});

const currentDataset = computed(() => {
    const activeId = props.activeComp.props.activeDatasetId;
    return datasets.value.find(ds => ds.id === activeId) || datasets.value[0];
});

// 4. Tabs 操作
const handleTabsEdit = (targetName, action) => {
    const compProps = props.activeComp.props; // 获取引用

    if (action === 'add') {
        const newId = `ds_${Date.now()}`;
        compProps.datasets.push({
            id: newId,
            name: `视图 ${compProps.datasets.length + 1}`,
            sql: '',
            columns: []
        });
        compProps.activeDatasetId = newId;
    } else if (action === 'remove') {
        if (compProps.datasets.length <= 1) {
            ElMessage.warning('至少保留一个视图');
            return;
        }

        const tabs = compProps.datasets;
        let activeName = compProps.activeDatasetId;

        if (activeName === targetName) {
            tabs.forEach((tab, index) => {
                if (tab.id === targetName) {
                    const nextTab = tabs[index + 1] || tabs[index - 1];
                    if (nextTab) {
                        activeName = nextTab.id;
                    }
                }
            });
        }

        compProps.activeDatasetId = activeName;
        // 过滤掉删除的
        compProps.datasets = tabs.filter(tab => tab.id !== targetName);
    }
};

const generateColId = () => 'col_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// 5. 列操作
const addCol = () => {
    if (!currentDataset.value) return;
    if (!currentDataset.value.columns) currentDataset.value.columns = [];

    currentDataset.value.columns.push({
        _id: generateColId(), // 【关键新增】唯一ID
        label: '新列',
        prop: 'new_key',
        width: '',
        align: 'left',
        fixed: false,
        clickable: false
    });
};

const removeCol = (index) => {
    if (!currentDataset.value) return;
    currentDataset.value.columns.splice(index, 1);
};

const moveCol = (index, step) => {
    if (!currentDataset.value) return;
    const arr = currentDataset.value.columns;
    if (index + step < 0 || index + step >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[index + step];
    arr[index + step] = temp;
};

// 6. SQL 解析
const handleParseSql = async () => {
    if (!currentDataset.value) return;
    const sql = currentDataset.value.sql?.trim();
    if (!sql) {
        ElMessage.warning('请输入 SQL 语句');
        return;
    }

    loading.value = true;

    try {
        const res = await mockApi.parseSql({ sql: sql });

        if (res.code === 200) {
            const newCols = res.data;
            ElMessageBox.confirm(
                `接口返回成功！解析到 ${newCols.length} 个字段。是否覆盖当前配置？`,
                '解析完成',
                { type: 'success' }
            ).then(() => {
                // 覆盖列配置
                currentDataset.value.columns = newCols;
                ElMessage.success('列配置已更新');
            });
        } else {
            ElMessage.error(res.msg || '解析失败');
        }
    } catch (err) {
        console.error(err);
        ElMessage.error('解析请求出错');
    } finally {
        loading.value = false;
    }
};

const cereteCode = async () => {
    loading.value = true;
    if (currentDataset.value.sql != "") {
        try {
            let res = await parseColumns({ bash: currentDataset.value.sql });
            if (res.length > 0) {
                const newCols = res;
                ElMessageBox.confirm(
                    `接口返回成功！解析到 ${newCols.length} 个字段。是否覆盖当前配置？`,
                    '解析完成',
                    { type: 'success' }
                ).then(() => {
                    currentDataset.value.columns = res.map((item) => {
                        return {
                            _id: generateColId(),
                            label: item.columnLabel || item.columnName,      // 用于表单显示的标签
                            prop: item.columnName,                          // 用于表格绑定的字段名
                            width: item.columnWidth || "",                  // 用于表单和表格的宽度
                            align: item.textAlign || "left",                // 用于表单和表格的对齐方式
                            fixed: item.fixed || false,                     // 是否固定列
                            clickable: item.clickable || false,             // 是否可点击
                            columnName: item.columnName,
                            columnDataSourceName: item.columnDataSourceName || "",
                            columnLabel: item.columnLabel,
                            columnWidth: item.columnWidth || "",
                            textAlign: item.textAlign || "left",
                            children: item.children ? item.children : [],
                        };
                    });
                });
            }
        } catch (err) {
            console.error(err);
            ElMessage.error('解析请求出错');
        } finally {
            loading.value = false;
        }
    } else {
        ElMessage.warning("请输入SQL");
    }
};

const addCustomParam = () => {
    if (!props.activeComp.props.customParams) {
        props.activeComp.props.customParams = [];
    }
    props.activeComp.props.customParams.push({
        key: '',
        type: 'static',
        value: ''
    });
};

const removeCustomParam = (index) => {
    props.activeComp.props.customParams.splice(index, 1);
};

const addStandardParams = () => {
    // 确保数组存在
    if (!props.activeComp.props.customParams) {
        props.activeComp.props.customParams = [];
    }

    const standardParamsTemplate = [
        {
            key: 'indexDefinitionUuid',
            type: 'script',
            value: 'return route.query.indexUuid || "";'
        },
        {
            key: 'newestPatchNo',
            type: 'script',
            value: 'return route.query.processingNumber || "";'
        },
        {
            key: 'productUuid',
            type: 'script',
            value: 'return sessionStorage.getItem("menuCode") || "";'
        }
    ];

    let addedCount = 0;

    // 遍历预设模板，加入到当前图表的自定义参数中
    standardParamsTemplate.forEach(tpl => {
        // 防重复检测：如果用户已经手动加过这个 key，就不再重复加了
        const exists = props.activeComp.props.customParams.find(p => p.key === tpl.key);
        if (!exists) {
            props.activeComp.props.customParams.push(tpl);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        ElMessage.success(`成功导入 ${addedCount} 个通用指标参数！`);
    } else {
        ElMessage.warning('通用参数已存在，无需重复导入。');
    }
};

</script>

<style scoped>
.compact-tabs :deep(.el-tabs__header) {
    margin-bottom: 5px;
}

.compact-tabs :deep(.el-tabs__item) {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    padding: 0 10px !important;
}

.compact-tabs :deep(.el-tabs__new-tab) {
    margin: 8px 5px 0 5px;
}

.current-ds-area {
    background-color: #fcfcfc;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
}

.column-table-box :deep(.el-input__wrapper),
.column-table-box :deep(.el-select__wrapper) {
    box-shadow: none;
    background-color: transparent;
    padding: 0 5px;
}

.column-table-box :deep(.el-input__wrapper:hover),
.column-table-box :deep(.el-input__wrapper.is-focus),
.column-table-box :deep(.el-select__wrapper:hover),
.column-table-box :deep(.el-select__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #409eff inset;
    background-color: #fff;
}

:deep(.el-select__wrapper) {
    height: 27px !important;
}
</style>