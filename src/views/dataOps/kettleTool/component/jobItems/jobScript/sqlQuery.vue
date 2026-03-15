<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="SQL"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
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
                            <el-form-item label="从文件中得到的SQL:">
                                <el-checkbox v-model="form.sqlfromfile"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="SQL文件名:">
                                <el-input v-model="form.sqlfilename" placeholder="" :disabled="!form.sqlfromfile">
                                    <template #append>
                                        <el-button @click="showFileExplorer = true" type="primary" :disabled="!form.sqlfromfile">浏览</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="将SQL脚本作为一条语句发送:">
                                <el-checkbox v-model="form.sendOneStatement"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="使用变量替换:">
                                <el-checkbox v-model="form.useVariableSubstitution"></el-checkbox>
                            </el-form-item>
                            <div style="padding:0 20px 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>SQL脚本</span>
                                </div>
                                <sqlEditor v-model="form.sql" :tabSize="2" dialect="mysql" placeholder="SQL脚本"
                                    style="height: 200px;" :disabled="form.sqlfromfile">
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
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
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
import FileExplorerWindow from '../../formItems/tools/FileExplorerWindow.vue'


const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("");
const databaseInfo = ref({})
const form = reactive({
    stepName: "",
    connection: "",
    sqlfromfile: false,
    sqlfilename: "",
    sendOneStatement: false,
    useVariableSubstitution: false,
    sql: "",
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
            // 填充表单字段
            form.stepName = value.getAttribute('label') || '';
            form.connection = value.getAttribute('connection') || '';
            form.sqlfromfile = value.getAttribute('sqlfromfile') === 'Y';
            form.sqlfilename = value.getAttribute('sqlfilename') || '';
            form.sendOneStatement = value.getAttribute('sendOneStatement') === 'Y';
            form.useVariableSubstitution = value.getAttribute('useVariableSubstitution') === 'Y';
            form.sql = value.getAttribute('sql') || '';
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
            value.setAttribute("sqlfromfile", form.sqlfromfile ? 'Y' : 'N');
            value.setAttribute("sqlfilename", form.sqlfilename);
            value.setAttribute("sendOneStatement", form.sendOneStatement ? 'Y' : 'N');
            value.setAttribute("useVariableSubstitution", form.useVariableSubstitution ? 'Y' : 'N');
            value.setAttribute("sql", form.sql);
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

const showFileExplorer = ref(false)
const openFileExplorer = (type) => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.sqlfilename = path + form.sqlfilename
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