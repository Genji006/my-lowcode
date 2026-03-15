<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="等待SQL"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div>
                <el-form :model="form" label-width="100px" class="mxgraphForm">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="180px">
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
                                    <el-input v-model="form.schemaname" :disabled="form.iscustomSQL"
                                        style="width: 100%;"></el-input>
                                    <el-button @click="openDatabaseExplorer('schema')" style="margin-left: 10px;"
                                        :disabled="!form.connection || form.iscustomSQL">浏览</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="目标表：">
                                <div style="display: flex; align-items: center; width: 100%;">
                                    <el-input v-model="form.tablename" style="width: 100%;" @change=""
                                        :disabled="form.iscustomSQL"></el-input>
                                    <el-button @click="openDatabaseExplorer('table')" style="margin-left: 10px;"
                                        :disabled="!form.connection || form.iscustomSQL">浏览</el-button>
                                </div>
                            </el-form-item>

                            <el-divider content-position="left">成功条件</el-divider>
                            <el-form-item label="满足成功条件行数：">
                                <el-select v-model="form.successCondition" placeholder="请选择">
                                    <el-option v-for="item in conditionList" :key="item.value" :label="item.text"
                                        :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="数值：">
                                <el-input v-model="form.rowsCountValue" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="最大超时时间：">
                                <el-input v-model="form.maximumTimeout" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="循环检查时间间隔：">
                                <el-input v-model="form.checkCycleTime" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="超时时成功:">
                                <el-checkbox v-model="form.successOnTimeout"></el-checkbox>
                            </el-form-item>

                            <el-divider content-position="left">自定义SQL</el-divider>
                            <el-form-item label="自定义SQL:">
                                <el-checkbox v-model="form.iscustomSQL"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="使用变量替换:">
                                <el-checkbox v-model="form.isUseVars" :disabled="!form.iscustomSQL"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="在执行前清空结果行列:">
                                <el-checkbox v-model="form.isClearResultList"
                                    :disabled="!form.iscustomSQL"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="在结果中添加行:">
                                <el-checkbox v-model="form.isAddRowsResult" :disabled="!form.iscustomSQL"></el-checkbox>
                            </el-form-item>
                            <div style="padding:0 20px 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>SQL脚本</span>
                                    <el-button :disabled="!form.iscustomSQL" @click="getSQL" style="margin-left: 10px;"
                                        size="small">获取SELECT SQL. .</el-button>
                                </div>
                                <sqlEditor v-model="form.customSQL" :tabSize="2" dialect="mysql" placeholder="SQL脚本"
                                    style="height: 200px;" :disabled="!form.iscustomSQL">
                                </sqlEditor>
                            </div>
                        </el-form>
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
        :trans-Name="jobName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { getDatabases, inputOutputFields, tableFields, getSuccessNumberCondition } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../../formItems/tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../../formItems/tools/rightClickTable.vue";
import sqlEditor from "../../formItems/tools/sqlEditor.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("");
const showDatabaseExplorer = ref(false)
const databaseInfo = ref({})
const form = reactive({
    stepName: "",
    connection: "",
    schemaname: "",
    tablename: "",
    successCondition: "",
    rowsCountValue: "",
    iscustomSQL: false,
    isUseVars: false,
    isClearResultList: false,
    isAddRowsResult: false,
    customSQL: "",
    maximumTimeout: "",
    checkCycleTime: "",
    successOnTimeout: false,
});


// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
// 获取完整xml
let allXml = null
let jobName = ref("")
// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        console.log("parseStepInfoAndPopulateForm", stepInfoXml, xmlDoc);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        console.log("stepElements", stepElements);
        if (stepElements.length > 0) {
            const value = stepElements[0];
            console.log("value", value);
            // 填充表单字段
            form.stepName = value.getAttribute('label') || '';
            form.connection = value.getAttribute('connection') || '';
            form.schemaname = value.getAttribute('schemaname') || '';
            form.tablename = value.getAttribute('tablename') || '';
            form.successCondition = value.getAttribute('successCondition') || '';
            form.rowsCountValue = value.getAttribute('rowsCountValue') || '';
            form.iscustomSQL = value.getAttribute('iscustomSQL') === 'Y';
            form.isUseVars = value.getAttribute('isUseVars') === 'Y';
            form.isClearResultList = value.getAttribute('isClearResultList') === 'Y';
            form.isAddRowsResult = value.getAttribute('isAddRowsResult') === 'Y';
            form.customSQL = value.getAttribute('customSQL') || '';
            form.maximumTimeout = value.getAttribute('maximumTimeout') || '';
            form.checkCycleTime = value.getAttribute('checkCycleTime') || '';
            form.successOnTimeout = value.getAttribute('successOnTimeout') === 'Y';
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
        const stepElements = xmlDoc.getElementsByTagName("JobEntry");
        if (stepElements.length > 0) {
            const value = stepElements[0];
            // 更新属性
            value.setAttribute("label", form.stepName);
            value.setAttribute("connection", form.connection);
            value.setAttribute("schemaname", form.schemaname);
            value.setAttribute("tablename", form.tablename);
            value.setAttribute("successCondition", form.successCondition);
            value.setAttribute("rowsCountValue", form.rowsCountValue);
            value.setAttribute("iscustomSQL", form.iscustomSQL ? 'Y' : 'N');
            value.setAttribute("isUseVars", form.isUseVars ? 'Y' : 'N');
            value.setAttribute("isClearResultList", form.isClearResultList ? 'Y' : 'N');
            value.setAttribute("isAddRowsResult", form.isAddRowsResult ? 'Y' : 'N');
            value.setAttribute("customSQL", form.customSQL);
            value.setAttribute("maximumTimeout", form.maximumTimeout);
            value.setAttribute("checkCycleTime", form.checkCycleTime);
            value.setAttribute("successOnTimeout", form.successOnTimeout ? 'Y' : 'N');
            // 返回更新后的XML
            return mxUtils.getPrettyXml(value);
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


const editDataBaseSetting = () => {
    emit('editDataBaseSetting', { name: form.connection })
}

const addDataBaseSetting = () => {
    emit('addDataBaseSetting')
}


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
        form.schemaname = node.nodeId;
    } else if (tableType.value == 'table') {
        form.schemaname = node.nodeId;
        form.tablename = node.text;
    }
}

const conditionList = ref([])
const getCondition = () => {
    getSuccessNumberCondition({
    }).then(res => {
        conditionList.value = res;
    })
}

const getSQL = async () => {
    let params = {
        graphXml: currentXml,
        databaseName: form.connection,
        schema: form.schemaname,
        table: form.tablename,
    }
    try {
        let res = await tableFields(params)
        if (res && Array.isArray(res)) {
            // 将 [{name:"data"}] 格式转换为 SQL 查询字段列表
            const fieldNames = res.map(item => item.name);
            const fieldsString = fieldNames.join(', ');
            // 构造 SQL 查询语句
            const sqlQuery = `SELECT ${fieldsString} FROM ${params.schema}.${params.table}`;
            // 更新编辑器中的 SQL 内容
            form.customSQL = sqlQuery;
        }
    } catch {
        ElMessage.error("获取失败")
    }
}



const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        allXml = data.allXml
        jobName.value = data.jobName
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getDataBase()
        getCondition()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped>
.mxgraphForm {
    height: 700px;
    overflow: auto;
}
</style>