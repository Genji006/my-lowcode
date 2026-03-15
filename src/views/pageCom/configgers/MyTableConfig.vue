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

                <div class="column-list">
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
                </div>
            </div>

            <div v-else>
                <el-empty description="请点击右上角 + 号添加视图" :image-size="60" />
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

// 5. 列操作
const addCol = () => {
    if (!currentDataset.value) return;
    if (!currentDataset.value.columns) currentDataset.value.columns = [];

    currentDataset.value.columns.push({
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

.column-list {
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
}

.col-item {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.col-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    border-bottom: 1px dashed #eee;
    padding-bottom: 5px;
}

.col-title {
    font-weight: bold;
    font-size: 12px;
    color: #606266;
}

.col-detail {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
}
</style>