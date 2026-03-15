<template>
    <SzycDialog :dialogVisible="dialogVisible" width="55%" @close="dialogVisible = false" title="表输出"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem " @tab-click="handleTabClick">
                        <div class="dialog-content-wrapper">
                            <el-tab-pane label="基本配置" name="basicConfig">
                                <el-form label-position="right" label-width="160px">
                                    <el-form-item label="数据库连接：">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-select v-model="form.connection" style="width: 100%;" placeholder="">
                                                <el-option v-for="item in dataBaseList" :label="item.name"
                                                    :value="item.name"></el-option>
                                            </el-select>
                                            <el-button @click="editDataBaseSetting" style="margin-left: 10px;"
                                                :disabled="!form.connection">编辑</el-button>
                                            <el-button @click="addDataBaseSetting"
                                                style="margin-left: 10px;">新建</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="目的模式：">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-input v-model="form.schema" style="width: 100%;"></el-input>
                                            <el-button @click="openDatabaseExplorer('schema')"
                                                style="margin-left: 10px;" :disabled="!form.connection">浏览</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="目标表：">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-input v-model="form.table" style="width: 100%;"></el-input>
                                            <el-button @click="openDatabaseExplorer('table')" style="margin-left: 10px;"
                                                :disabled="!form.connection">浏览</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="提交记录数量：">
                                        <el-input v-model="form.commit" style="width: 100%;"></el-input>
                                    </el-form-item>
                                    <el-form-item label="裁剪表">
                                        <el-checkbox v-model="form.truncate"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="忽略插入错误">
                                        <el-checkbox v-model="form.ignore_errors"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="指定数据库字段">
                                        <el-checkbox v-model="form.specify_fields"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="主选项" name="mainOptions">
                                <el-form label-position="right" label-width="210px">
                                    <el-form-item label="表分区数据">
                                        <el-checkbox v-model="form.partitioning_enabled"
                                            @change="getPartitioningField"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="区分字段：">
                                        <el-select v-model="form.partitioning_field" style="width: 100%;"
                                            :disabled="!form.partitioning_enabled">
                                            <el-option v-for="item in partitioningFieldList" :key="item.name"
                                                :label="item.name" :value="item.name"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-radio-group v-model="form.partitioning_type"
                                            :disabled="!form.partitioning_enabled" class="radio_tableOut">
                                            <el-radio value="partitioning_monthly">每月分区数据</el-radio>
                                            <el-radio value="partitioning_daily">每天分区数据</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item label="使用批量插入">
                                        <el-checkbox v-model="form.use_batch"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="表名定义在一个字段里">
                                        <el-checkbox v-model="form.tablename_in_field"
                                            @change="getPartitioningField"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="包含表名的字段：">
                                        <el-select v-model="form.tablename_field" style="width: 100%;"
                                            :disabled="!form.tablename_in_field">
                                            <el-option v-for="item in partitioningFieldList" :key="item.name"
                                                :label="item.name" :value="item.name"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="存储表名字段">
                                        <el-checkbox v-model="form.tablename_in_table"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="返回一个自动产生的关键字">
                                        <el-checkbox v-model="form.return_keys"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="自动产生的关键字的字段名称：">
                                        <el-input v-model="form.return_field" style="width: 100%;"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="数据库字段" name="databaseFields" class="tableStyle"
                                :disabled="!form.specify_fields">
                                <div style="margin: 5px 0; display:flex; flex-direction: row;">
                                    <el-button @click="addFiles" style="margin-left: 5px;">新增字段</el-button>
                                    <el-button @click="getFiles" style="margin-left: 5px;">获取字段</el-button>
                                    <el-button @click="deleteSelectedFile" :disabled="!currentRow"
                                        style="margin-left: 5px;">删除字段</el-button>
                                </div>
                                <el-table :data="filesList" style="width: 100%;" border
                                    @current-change="handleCurrentChange" highlight-current-row>
                                    <el-table-column type="index" width="40" align="center"></el-table-column>
                                    <el-table-column prop="column_name" label="表字段" min-width="100" align="center">
                                        <template #default="scope">
                                            <el-select v-model="scope.row.column_name" size="small" placeholder="">
                                                <el-option v-for="item in columnList" :label="item.name"
                                                    :value="item.name"></el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="stream_name" label="流字段" min-width="100" align="center">
                                        <template #default="scope">
                                            <el-select v-model="scope.row.stream_name" size="small" placeholder="">
                                                <el-option v-for="item in partitioningFieldList" :label="item.name"
                                                    :value="item.name"></el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-tab-pane>
                        </div>
                    </el-tabs>
                </el-form>
            </div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="15"
        :trans-Name="transName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />

    <!-- 新增的自定义提示对话框 -->
    <SzycDialog :dialogVisible="promptDialogVisible" title="提示" width="500px" @close="handlePromptCancel">
        <template #uname>
            <div style="margin: 20px 0; font-size: 14px;">表中已经有数据，如何处理新找到的数据？</div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <szycButton @click="handlePromptAction('clearAndAddAll')">清除并增加所有</szycButton>
                <szycButton type="primary" @click="handlePromptAction('addNew')">增加新的</szycButton>
                <szycButton type="primary" @click="handlePromptAction('addAll')">增加所有</szycButton>
                <SzycCancel @click="handlePromptAction('cancel')">取消</SzycCancel>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { getDatabases, tableFields, previewData } from '@/api/kettleApi/index'
import { ElMessage } from 'element-plus'
import { columnType, columnFormats, inputOutputFields, getFormats } from '@/api/kettleApi/index'
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'

const dialogVisible = ref(false)
const showDatabaseExplorer = ref(false)
const activeTab = ref('basicConfig')
const partitioningFieldList = ref([])
const databaseInfo = ref({})
const filesList = ref([])
const currentRow = ref(null)
// 处理表格行选中
const handleCurrentChange = (row) => {
    currentRow.value = row
}

// 删除选中的文件
const deleteSelectedFile = () => {
    if (currentRow.value) {
        const index = filesList.value.indexOf(currentRow.value)
        if (index > -1) {
            filesList.value.splice(index, 1)
            currentRow.value = null
        }
    }
}


const form = reactive({
    stepName: '',
    name: '',
    connection: '',
    schema: '',
    table: '',
    commit: '',
    truncate: false,
    ignore_errors: false,
    specify_fields: false,
    partitioning_enabled: false,
    partitioning_field: '',
    partitioning_type: '',
    use_batch: false,
    tablename_in_field: false,
    tablename_field: '',
    tablename_in_table: false,
    return_keys: false,
    return_field: ''
})

const editDataBaseSetting = () => {
    emit('editDataBaseSetting', { name: form.connection })
}

const addDataBaseSetting = () => {
    emit('addDataBaseSetting')
}


// 新增的提示对话框相关状态
const promptDialogVisible = ref(false)
const promptResolve = ref(null)
const timeList = ref([])

const { mxUtils } = window.mx;
const emit = defineEmits(['update-step'])

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let currentXml = null
// 获取完整xml
let allXml = null
let transName = ref("")

const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        currentXml = data.xml
        allXml = data.allXml
        transName.value = data.transName
        console.log("open", data.allXml);
        parseStepInfoAndPopulateForm(currentXml);
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
        stepName.value = data.cell.value || ''
    }
    getDataBase()
    dialogVisible.value = true
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const tableOutput = stepElements[0];
            console.log("tableOutput", tableOutput);
            // 填充表单字段
            form.stepName = tableOutput.getAttribute('label') || '';
            form.name = tableOutput.getAttribute('name') || '';
            form.connection = tableOutput.getAttribute('connection') || '';
            form.schema = tableOutput.getAttribute('schema') || '';
            form.table = tableOutput.getAttribute('table') || '';
            form.commit = tableOutput.getAttribute('commit') || '';
            form.truncate = tableOutput.getAttribute('truncate') === 'Y';
            form.ignore_errors = tableOutput.getAttribute('ignore_errors') === 'Y';
            form.specify_fields = tableOutput.getAttribute('specify_fields') === 'Y';
            form.partitioning_enabled = tableOutput.getAttribute('partitioning_enabled') === 'Y';
            form.partitioning_field = tableOutput.getAttribute('partitioning_field') || '';
            if (tableOutput.getAttribute('partitioning_daily') === 'Y') {
                form.partitioning_type = 'partitioning_daily'
            } else if (tableOutput.getAttribute('partitioning_monthly') === 'Y') {
                form.partitioning_type = 'partitioning_monthly'
            }
            // form.partitioning_type = tableOutput.getAttribute('partitioning_type') || '';
            form.use_batch = tableOutput.getAttribute('use_batch') === 'Y';
            form.tablename_in_field = tableOutput.getAttribute('tablename_in_field') === 'Y';
            form.tablename_field = tableOutput.getAttribute('tablename_field') || '';
            form.tablename_in_table = tableOutput.getAttribute('tablename_in_table') === 'Y';
            form.return_keys = tableOutput.getAttribute('return_keys') === 'Y';
            form.return_field = tableOutput.getAttribute('return_field') || '';
            filesList.value = JSON.parse(tableOutput.getAttribute("fields")) || [];
            console.log("partitioning", JSON.parse(tableOutput.getAttribute("partitioning")));
        }
    } catch (error) {
        console.error('解析stepInfo XML失败:', error);
        ElMessage.error("解析stepInfo XML数据失败");
    }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        const stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const tableOutput = stepElements[0];
            // 更新属性
            tableOutput.setAttribute('label', form.stepName);
            tableOutput.setAttribute('name', form.name);
            tableOutput.setAttribute('connection', form.connection);
            tableOutput.setAttribute('schema', form.schema);
            tableOutput.setAttribute('table', form.table);
            tableOutput.setAttribute('commit', form.commit);
            tableOutput.setAttribute('truncate', form.truncate ? 'Y' : 'N');
            tableOutput.setAttribute('ignore_errors', form.ignore_errors ? 'Y' : 'N');
            tableOutput.setAttribute('specify_fields', form.specify_fields ? 'Y' : 'N');
            tableOutput.setAttribute('partitioning_field', form.partitioning_field);
            tableOutput.setAttribute('partitioning_enabled', form.partitioning_enabled ? 'Y' : 'N');
            tableOutput.setAttribute('partitioning_daily', form.partitioning_type == 'partitioning_daily' ? 'Y' : 'N');
            tableOutput.setAttribute('partitioning_monthly', form.partitioning_type == 'partitioning_monthly' ? 'Y' : 'N');
            // tableOutput.setAttribute('partitioning_type', form.partitioning_type);
            tableOutput.setAttribute('use_batch', form.use_batch ? 'Y' : 'N');
            tableOutput.setAttribute('tablename_in_field', form.tablename_in_field ? 'Y' : 'N');
            tableOutput.setAttribute('tablename_field', form.tablename_field);
            tableOutput.setAttribute('tablename_in_table', form.tablename_in_table ? 'Y' : 'N');
            tableOutput.setAttribute('return_keys', form.return_keys ? 'Y' : 'N');
            tableOutput.setAttribute('return_field', form.return_field);
            tableOutput.setAttribute('fields', JSON.stringify(filesList.value));
            tableOutput.setAttribute('partitioning', JSON.stringify({ method: "none", schema_name: "" }));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(tableOutput);
        }

        return stepInfoXml; // 如果没有找到step元素，返回原始XML
    } catch (error) {
        console.error('更新stepInfo XML失败:', error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
}
const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph.getModel().setValue(currentCell, form.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        console.log("currentXml", currentXml);
        // 将更新后的 XML 数据传递回父组件
        emit('update-step', {
            cell: currentCell,
            updatedXml: currentXml
        });
    }
    dialogVisible.value = false
}

const tableType = ref('')
const openDatabaseExplorer = (type) => {
    showDatabaseExplorer.value = true
    tableType.value = type
    databaseInfo.value = { name: form.connection }
}

const onDatabaseNodeSelect = (node) => {
    if (tableType.value == 'schema') {
        form.schema = node.nodeId;
    } else if (tableType.value == 'table') {
        form.schema = node.nodeId;
        form.table = node.text;
    }
}

const columnTypeList = ref([])
const columnFormatsList = ref([])
const getColumnType = async () => {
    let res = await columnType({ name: "", type: "", format: "" })
    columnTypeList.value = res
}

const getcolumnFormats = async () => {
    let res = await columnFormats({})
    columnFormatsList.value = res
}



const getPartitioningField = async (data = false) => {
    try {
        if (form.partitioning_enabled || form.tablename_in_field || data) {
            let params = {
                stepName: stepName.value,
                graphXml: allXml,
                before: true
            };
            let res = await inputOutputFields(params);
            partitioningFieldList.value = res
        }
    } catch {
        ElMessage.error("获取分区字段失败")
    }
}

// 处理提示对话框的按钮点击
const handlePromptAction = (action) => {
    promptDialogVisible.value = false
    if (promptResolve.value) {
        promptResolve.value(action)
        promptResolve.value = null
    }
}

// 处理提示对话框的取消操作
const handlePromptCancel = () => {
    promptDialogVisible.value = false
    if (promptResolve.value) {
        promptResolve.value('cancel')
        promptResolve.value = null
    }
}

// 显示弹窗并返回用户选择
const showPromptDialog = () => {
    return new Promise((resolve) => {
        promptDialogVisible.value = true
        promptResolve.value = resolve
    })
}

// 根据用户选择处理数据
const handleFilesResult = (action, newData) => {
    // 格式化数据以适配表格显示
    const formattedData = newData.map(item => ({
        column_name: item.name || '',  // 表字段
        stream_name: item.name || ''   // 流字段
    }));

    switch (action) {
        case 'addNew':
            // 增加新的（这里假设是新增数据中不存在于当前数据的项）
            formattedData.forEach(item => {
                if (!filesList.value.some(existingItem => existingItem.stream_name === item.stream_name)) {
                    filesList.value.push(item);
                }
            });
            break;
        case 'addAll':
            // 增加所有
            filesList.value = [...filesList.value, ...formattedData];
            break;
        case 'clearAndAddAll':
            // 清除并增加所有
            filesList.value = formattedData;
            break;
        case 'cancel':
            // 取消
            break;
        default:
            break;
    }
};

const addFiles = () => {
    filesList.value.push({})
}

const stepName = ref('')
const getFiles = async () => {
    if (filesList.value.length > 0) {
        // 弹出提示框
        const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
            before: true
        };
        let res = await inputOutputFields(params);

        // 根据用户选择处理数据
        handleFilesResult(result, res);
    } else {
        // 如果没有现有数据，直接获取并添加
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
            before: true
        };
        let res = await inputOutputFields(params);
        filesList.value = res.map(item => ({
            column_name: item.name || '',  // 表字段
            stream_name: item.name || ''   // 流字段
        }));
    }
};

let dataBaseList = ref([])
const getDataBase = async () => {
    try {
        let res = await getDatabases({})
        dataBaseList.value = res
    } catch {
        ElMessage.error("获取数据库失败")
    }
}

const handleTabClick = (tab) => {
    console.log(tab.paneName);
    if (tab.paneName == 'databaseFields') {
        getPartitioningField(true)
        getColumnList()
    }
}

const columnList = ref([])
const getColumnList = async () => {
    try {
        let res = await tableFields({
            graphXml: currentXml,
            databaseName: form.connection,
            schema: form.schema,
            table: form.table,
            query: null
        })
        columnList.value = res
    } catch {
        ElMessage.error("获取字段失败")
    }
}

// 暴露方法给父组件使用
defineExpose({
    openDialog
})
</script>


<style lang="scss" scoped>
.dialog-content-wrapper {
    height: 550px;
    overflow-y: auto;
}

.tabItem {
    margin-top: 10px;

    .checkbox-input-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .checkbox-wrapper {
        display: flex;
    }

    .input-wrapper {
        display: flex;
        align-items: center;
        flex: 1;
        margin-left: 20px;
    }

    .input-label {
        margin-right: 10px;
        white-space: nowrap;
    }

    .flex-input {
        flex: 1;
    }

    .flex-input-number {
        flex: 1;
    }

    .flex-input-number.short {
        flex: 0.5;
    }

    .tableStyle {
        :deep(.el-table .cell) {
            padding: 0 !important;
        }

        :deep(.el-input__wrapper) {
            border: none !important;
        }

        :deep(.el-select__wrapper) {
            border: none !important;
        }
    }

    :deep(.el-radio__label) {
        color: #606266;
        font-weight: 500;
    }

    :deep(.el-checkbox__label) {
        font-size: 15px;
    }
}
</style>

<style>
.radio_tableOut {
    .is-disabled {
        background: transparent !important;
    }
}
</style>