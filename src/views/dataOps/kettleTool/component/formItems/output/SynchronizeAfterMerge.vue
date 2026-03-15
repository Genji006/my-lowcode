<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="数据同步"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder=""></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-tab-pane label="一般" name="baseConfig" style="height: 600px;overflow-y: auto;">
                            <el-form label-position="right" label-width="200px">
                                <el-form-item label="数据库连接：">
                                    <div style="display: flex; align-items: center; width: 100%;">
                                        <el-select v-model="form.connection" style="width: 100%;" placeholder="">
                                            <el-option v-for="item in dataBaseList" :label="item.name"
                                                :value="item.name"></el-option>
                                        </el-select>
                                        <el-button @click="editDataBaseSetting" style="margin-left: 10px;"
                                            :disabled="!form.connection">编辑</el-button>
                                        <el-button @click="addDataBaseSetting" style="margin-left: 10px;">新建</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="目的模式：">
                                    <div style="display: flex; align-items: center; width: 100%;">
                                        <el-input v-model="form.schema" style="width: 100%;"></el-input>
                                        <el-button @click="openDatabaseExplorer('schema')" style="margin-left: 10px;"
                                            :disabled="!form.connection">浏览</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="目标表：">
                                    <div style="display: flex; align-items: center; width: 100%;">
                                        <el-input v-model="form.table" style="width: 100%;"
                                            @change="getTableFields"></el-input>
                                        <el-button @click="openDatabaseExplorer('table')" style="margin-left: 10px;"
                                            :disabled="!form.connection">浏览</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="提交记录数量：">
                                    <el-input v-model="form.commit" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="批量更新：">
                                    <el-checkbox v-model="form.use_batch"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="表名在字段里定义：">
                                    <el-checkbox v-model="form.tablename_in_field"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="表名字段：">
                                    <el-input v-model="form.tablename_field" placeholder=""
                                        :disabled="!form.tablename_in_field"></el-input>
                                </el-form-item>
                            </el-form>
                            <el-divider content-position="left">用来查询的关键字</el-divider>
                            <RightClickTable ref="searchTableRef" v-model="searchFields" :columns="searchDataColumns"
                                :showIndex="true" :height="150" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction('table', 'search')"
                                :defaultRow="defaultSearchRow">
                            </RightClickTable>
                            <el-divider content-position="left">更新字段</el-divider>
                            <RightClickTable ref="updateTableRef" v-model="updateFields" :columns="updateDataColumns"
                                :showIndex="true" :height="150" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction('table', 'update')"
                                :defaultRow="defaultUpdateRow">
                            </RightClickTable>
                        </el-tab-pane>
                        <el-tab-pane label="高级" name="advancedConfig" style="height: 600px;overflow-y: auto;">
                            <el-form label-position="right" label-width="200px">
                                <el-form-item label="操作字段名：">
                                    <el-input v-model="form.operation_order_field" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="当值相等时插入：">
                                    <el-input v-model="form.order_insert" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="当值相等时更新：">
                                    <el-input v-model="form.order_update" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="当值相等时删除：">
                                    <el-input v-model="form.order_delete" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="执行查询：">
                                    <el-checkbox v-model="form.perform_lookup"></el-checkbox>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
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
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import ReusableTable from "../tools/ExcelFilesTable.vue";
import { getDatabases, inputOutputFields, tableFields } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("baseConfig");
const showDatabaseExplorer = ref(false)
const databaseInfo = ref({})
const defaultSearchRow = {
    field: "",
    condition: "=",
    name: "",
    name2: ""
}

const defaultUpdateRow = {
    name: "",
    rename: "",
    update: "Y",
}
const form = reactive({
    stepName: "",
    connection: "",
    schema: "",
    table: "",
    commit: "",
    use_batch: false,
    tablename_in_field: false,
    tablename_field: "",
    order_delete: "",
    order_insert: "",
    order_update: "",
    perform_lookup: false,
    operation_order_field: "",
});
const searchFields = ref([])
const updateFields = ref([])

// 监听表名变化，在第一次获取到值时也执行getTableFields
watch(
    () => form.table,
    (newVal, oldVal) => {
        if (newVal) {
            // 等待下一个tick确保DOM已更新后再执行
            nextTick(() => {
                getTableFields();
                fieldParentFunction('columnList')
            });
        }
    }
);
// 通过调用子组件方法添加文件
const addFiles = (tableRef) => {
    if (tableRef.value) {
        tableRef.value.addRow();
    }
};

// 通过调用子组件方法删除选中文件
const deleteSelectedFile = (tableRef) => {
    if (tableRef.value) {
        tableRef.value.deleteSelectedRow();
    }
};

const columnList = ref([])
const getTableFields = async () => {
    try {
        if (!form.table) {
            return;
        }
        let res = await tableFields({
            graphXml: currentXml,
            databaseName: form.connection,
            schema: form.schema,
            table: form.table,
        })
        columnList.value = res
    } catch {
        ElMessage.error("获取字段失败")
    }
}

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
// 获取完整xml
let allXml = null
let transName = ref("")
// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        console.log("parseStepInfoAndPopulateForm", stepInfoXml, xmlDoc);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        console.log("stepElements", stepElements);
        if (stepElements.length > 0) {
            const SynchronizeAfterMerge = stepElements[0];
            console.log("SynchronizeAfterMerge", SynchronizeAfterMerge);
            // 填充表单字段
            form.stepName = SynchronizeAfterMerge.getAttribute('label') || '';
            form.connection = SynchronizeAfterMerge.getAttribute('connection') || '';
            form.schema = SynchronizeAfterMerge.getAttribute('schema') || '';
            form.table = SynchronizeAfterMerge.getAttribute('table') || '';
            form.commit = SynchronizeAfterMerge.getAttribute('commit') || '';
            form.use_batch = SynchronizeAfterMerge.getAttribute('use_batch') === 'Y';
            form.tablename_in_field = SynchronizeAfterMerge.getAttribute('tablename_in_field') === 'Y';
            form.tablename_field = SynchronizeAfterMerge.getAttribute('tablename_field') || '';
            form.operation_order_field = SynchronizeAfterMerge.getAttribute('operation_order_field') || '';
            form.order_insert = SynchronizeAfterMerge.getAttribute('order_insert') || '';
            form.order_update = SynchronizeAfterMerge.getAttribute('order_update') || '';
            form.order_delete = SynchronizeAfterMerge.getAttribute('order_delete') || '';
            form.perform_lookup = SynchronizeAfterMerge.getAttribute('perform_lookup') === 'Y';

            // 解析搜索字段
            searchFields.value = JSON.parse(SynchronizeAfterMerge.getAttribute('searchFields') || '[]');

            // 解析更新字段
            updateFields.value = JSON.parse(SynchronizeAfterMerge.getAttribute('updateFields') || '[]');
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
        const stepElements = xmlDoc.getElementsByTagName("Step");
        if (stepElements.length > 0) {
            const SynchronizeAfterMerge = stepElements[0];
            // 更新属性
            SynchronizeAfterMerge.setAttribute("label", form.stepName);
            SynchronizeAfterMerge.setAttribute("connection", form.connection);
            SynchronizeAfterMerge.setAttribute("schema", form.schema);
            SynchronizeAfterMerge.setAttribute("table", form.table);
            SynchronizeAfterMerge.setAttribute("commit", form.commit);
            SynchronizeAfterMerge.setAttribute("use_batch", form.use_batch ? 'Y' : 'N');
            SynchronizeAfterMerge.setAttribute("tablename_in_field", form.tablename_in_field ? 'Y' : 'N');
            SynchronizeAfterMerge.setAttribute("tablename_field", form.tablename_field);
            SynchronizeAfterMerge.setAttribute("operation_order_field", form.operation_order_field);
            SynchronizeAfterMerge.setAttribute("order_insert", form.order_insert);
            SynchronizeAfterMerge.setAttribute("order_update", form.order_update);
            SynchronizeAfterMerge.setAttribute("order_delete", form.order_delete);
            SynchronizeAfterMerge.setAttribute("perform_lookup", form.perform_lookup ? 'Y' : 'N');
            SynchronizeAfterMerge.setAttribute("searchFields", JSON.stringify(searchFields.value));
            SynchronizeAfterMerge.setAttribute("updateFields", JSON.stringify(updateFields.value));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(SynchronizeAfterMerge);
        }

        return stepInfoXml; // 如果没有找到step元素，返回原始XML
    } catch (error) {
        console.error("更新stepInfo XML失败:", error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
};
const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph
            .getModel()
            .setValue(currentCell, form.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        console.log("currentXml", currentXml);
        // 将更新后的 XML 数据传递回父组件
        emit("update-step", {
            cell: currentCell,
            updatedXml: currentXml,
        });
    }
    dialogVisible.value = false;
};

const stepName = ref('')
const fieldParentFunction = async (data, type) => {
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };

    if (data === 'columnList') {
        let res = await inputOutputFields(params);
        nextTick(() => {
            nameList.value = res
        })
    } else if (data === 'table') {
        if (type === 'search') {
            // 弹出提示框
            if (searchFields.value.length > 0) {
                const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
                let res = await inputOutputFields(params);
                // 根据用户选择处理数据
                handleFilesResult(result, res, 'search');
            } else {
                let res = await inputOutputFields(params);
                nextTick(() => {
                    searchFields.value = res.map(item => ({
                        field: "",
                        condition: '=',
                        name: item.name,
                        name2: "",
                    }));
                })
            }
        } else if (type === 'update') {
            // 弹出提示框
            if (updateFields.value.length > 0) {
                const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
                let res = await inputOutputFields(params);
                // 根据用户选择处理数据
                handleFilesResult(result, res, 'update');
            } else {
                let res = await inputOutputFields(params);
                nextTick(() => {
                    updateFields.value = res.map(item => ({
                        field: "",
                        rename: item.name,
                        update: 'N',
                    }));
                })
            }
        }
    }
}

const nameList = ref([])
const searchDataColumns = computed(() => [
    {
        prop: 'field',
        label: '表字段',
        type: "select",
        options: columnList.value,
        valueKey: "name",
        labelKey: "name",
    },
    {
        prop: "condition",
        label: "比较符",
        type: "select",
        options: [{ value: '=', text: '=' },
        { value: '<>', text: '<>' },
        { value: '<', text: '<' },
        { value: '<=', text: '<=' },
        { value: '>', text: '>' },
        { value: '>=', text: '>=' },
        { value: 'LIKE', text: 'LIKE' },
        { value: 'BETWEEN', text: 'BETWEEN' },
        { value: 'IS NULL', text: 'IS NULL' },
        { value: 'IS NOT NULL', text: 'IS NOT NULL' }],
        valueKey: "value",
        labelKey: "text",
        width: 120
    },
    {
        prop: 'name',
        label: '流里的字段1',
        type: "select",
        options: nameList.value,
        valueKey: "name",
        labelKey: "name",
    },
    {
        prop: 'name2',
        label: '流里的字段2',
        type: "select",
        options: nameList.value,
        valueKey: "name",
        labelKey: "name",
    },
]);

const updateDataColumns = computed(() => [
    {
        prop: 'name',
        label: '表字段',
        type: "select",
        options: columnList.value,
        valueKey: "name",
        labelKey: "name",
    },
    {
        prop: 'rename',
        label: '流字段',
        type: "select",
        options: nameList.value,
        valueKey: "name",
        labelKey: "name",
    },
    {
        prop: 'update',
        label: '更新',
        type: "select",
        options:
            [
                { value: 'Y', label: '是' },
                { value: 'N', label: '否' }
            ],
    },
])

const editDataBaseSetting = () => {
    emit('editDataBaseSetting', { name: form.connection })
}

const addDataBaseSetting = () => {
    emit('addDataBaseSetting')
}

const promptDialogVisible = ref(false)
const promptResolve = ref(null)
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

const handleFilesResult = (action, newData, type) => {
    // 格式化数据以适配表格显示
    let formattedData = newData.map(item => ({
        field: "",
        condition: '=',
        name: item.name,
        name2: "",
        rename: item.name,
        update: "N",
    }));
    if (type == 'search') {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!searchFields.value.some(existingItem => existingItem.name === item.name)) {
                        searchFields.value.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                searchFields.value = [...searchFields.value, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                searchFields.value = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    } else if (type == 'update') {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!updateFields.value.some(existingItem => existingItem.name === item.name)) {
                        updateFields.value.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                updateFields.value = [...updateFields.value, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                updateFields.value = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
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

const openFileExplorer = (type) => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.name = path + form.name
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


const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        allXml = data.allXml
        transName.value = data.transName
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || "";
        stepName.value = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getDataBase()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped>
.tabItem {
    :deep(.el-divider__text) {
        font-size: 16px !important;
    }
}
</style>
