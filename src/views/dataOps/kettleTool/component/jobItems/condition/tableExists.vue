<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="检查表是否存在"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="130px">
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
                                    <el-input v-model="form.schemaname" style="width: 100%;"></el-input>
                                    <el-button @click="openDatabaseExplorer('schema')" style="margin-left: 10px;"
                                        :disabled="!form.connection">浏览</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="目标表：">
                                <div style="display: flex; align-items: center; width: 100%;">
                                    <el-input v-model="form.tablename" style="width: 100%;" @change=""></el-input>
                                    <el-button @click="openDatabaseExplorer('table')" style="margin-left: 10px;"
                                        :disabled="!form.connection">浏览</el-button>
                                </div>
                            </el-form-item>
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
import { getDatabases, inputOutputFields, tableFields } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../../formItems/tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../../formItems/tools/rightClickTable.vue";

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
            const columnsExits = stepElements[0];
            console.log("columnsExits", columnsExits);
            // 填充表单字段
            form.stepName = columnsExits.getAttribute('label') || '';
            form.connection = columnsExits.getAttribute('connection') || '';
            form.schemaname = columnsExits.getAttribute('schemaname') || '';
            form.tablename = columnsExits.getAttribute('tablename') || '';
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
            const columnsExits = stepElements[0];
            // 更新属性
            columnsExits.setAttribute("label", form.stepName);
            columnsExits.setAttribute("connection", form.connection);
            columnsExits.setAttribute("schemaname", form.schemaname);
            columnsExits.setAttribute("tablename", form.tablename);
            // 返回更新后的XML
            return mxUtils.getPrettyXml(columnsExits);
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
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>