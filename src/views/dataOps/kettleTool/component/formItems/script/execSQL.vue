<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="执行SQL脚本"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder=""></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-tab-pane label="基本配置" name="baseConfig" style="height: 500px;overflow-y: auto;">
                            <el-form label-position="right" label-width="100px">
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
                                <sqlEditor v-model="form.sql" :tabSize="2" dialect="mysql"
                                    placeholder="SQL语句，多个语句之间请用;分割">
                                </sqlEditor>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="细节" name="advancedConfig" style="height: 500px;overflow-y: auto;">
                            <el-form label-position="right" label-width="250px">
                                <el-form-item label="执行每一行：">
                                    <el-checkbox v-model="form.executedEachInputRow"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="Execute as a single statement：">
                                    <el-checkbox v-model="form.singleStatement"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="变量替换：">
                                    <el-checkbox v-model="form.replaceVariables"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="绑定参数：">
                                    <el-checkbox v-model="form.setParams"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="Quote String：">
                                    <el-checkbox v-model="form.quoteString"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="包含插入状态的字段：">
                                    <el-input v-model="form.insert_field" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="包含更新状态的字段：">
                                    <el-input v-model="form.update_field" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="包含删除状态的字段：">
                                    <el-input v-model="form.delete_field" placeholder=""></el-input>
                                </el-form-item>
                                <el-form-item label="包含插入状态的字段：">
                                    <el-input v-model="form.read_field" placeholder=""></el-input>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="参数" name="queryConfig" style="height: 500px;overflow-y: auto;">
                            <RightClickTable ref="updateTableRef" v-model="form.arguments" :columns="updateDataColumns"
                                :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction" buttonText="获取参数">
                            </RightClickTable>
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
import { getDatabases, inputOutputFields, tableFields } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";
import sqlEditor from "../tools/sqlEditor.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("baseConfig");
const promptDialogVisible = ref(false);
const promptResolve = ref(null)

const form = reactive({
    stepName: "",
    connection: "",
    sql: "",
    arguments: [],
    executedEachInputRow: false,
    singleStatement: false,
    replaceVariables: false,
    setParams: false,
    quoteString: false,
    insert_field: "",
    update_field: "",
    delete_field: "",
    read_field: "",
});

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
            const ExecSQL = stepElements[0];
            console.log("ExecSQL", ExecSQL);
            // 填充表单字段
            form.stepName = ExecSQL.getAttribute('label') || '';
            form.connection = ExecSQL.getAttribute('connection') || '';
            form.sql = decodeURIComponent(ExecSQL.getAttribute('sql') || '');
            form.executedEachInputRow = ExecSQL.getAttribute('executedEachInputRow') === 'Y';
            form.singleStatement = ExecSQL.getAttribute('singleStatement') === 'Y';
            form.replaceVariables = ExecSQL.getAttribute('replaceVariables') === 'Y';
            form.setParams = ExecSQL.getAttribute('setParams') === 'Y';
            form.quoteString = ExecSQL.getAttribute('quoteString') === 'Y';
            form.insert_field = ExecSQL.getAttribute('insert_field') || '';
            form.update_field = ExecSQL.getAttribute('update_field') || '';
            form.delete_field = ExecSQL.getAttribute('delete_field') || '';
            form.read_field = ExecSQL.getAttribute('read_field') || '';
            form.arguments = JSON.parse(ExecSQL.getAttribute('arguments') || '[]');
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
            const ExecSQL = stepElements[0];
            // 更新属性
            ExecSQL.setAttribute("label", form.stepName);
            ExecSQL.setAttribute("connection", form.connection);
            ExecSQL.setAttribute("sql", form.sql);
            ExecSQL.setAttribute("executedEachInputRow", form.executedEachInputRow ? 'Y' : 'N');
            ExecSQL.setAttribute("singleStatement", form.singleStatement ? 'Y' : 'N');
            ExecSQL.setAttribute("replaceVariables", form.replaceVariables ? 'Y' : 'N');
            ExecSQL.setAttribute("setParams", form.setParams ? 'Y' : 'N');
            ExecSQL.setAttribute("quoteString", form.quoteString ? 'Y' : 'N');
            ExecSQL.setAttribute("insert_field", form.insert_field);
            ExecSQL.setAttribute("update_field", form.update_field);
            ExecSQL.setAttribute("delete_field", form.delete_field);
            ExecSQL.setAttribute("read_field", form.read_field);
            ExecSQL.setAttribute("arguments", JSON.stringify(form.arguments));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(ExecSQL);
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

// 处理提示对话框的按钮点击
const handlePromptAction = (action) => {
    promptDialogVisible.value = false
    if (promptResolve.value) {
        promptResolve.value(action)
        promptResolve.value = null
    }
}

const handleFilesResult = (action, newData) => {
    // 格式化数据以适配表格显示
    let formattedData = newData.map(item => ({
        name: item.name,
    }))

    switch (action) {
        case 'addNew':
            // 增加新的（这里假设是新增数据中不存在于当前数据的项）
            formattedData.forEach(item => {
                if (!form.arguments.some(existingItem => existingItem.name === item.name)) {
                    form.arguments.push(item);
                }
            });
            break;
        case 'addAll':
            // 增加所有
            form.arguments = [...form.arguments, ...formattedData];
            break;
        case 'clearAndAddAll':
            // 清除并增加所有
            form.arguments = formattedData
            break;
        case 'cancel':
            // 取消
            break;
        default:
            break;
    }
};

const updateDataColumns = computed(() => [
    {
        prop: 'name',
        label: '作为参数的字段',
    },
])

const editDataBaseSetting = () => {
    emit('editDataBaseSetting', { name: form.connection })
}

const addDataBaseSetting = () => {
    emit('addDataBaseSetting')
}

const stepName = ref("")
const fieldParentFunction = async (data) => {
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };
    // 弹出提示框
    if (form.arguments.length > 0) {
        const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
        let res = await inputOutputFields(params);
        // 根据用户选择处理数据
        handleFilesResult(result, res);
    } else {
        let res = await inputOutputFields(params);
        nextTick(() => {
            form.arguments = res.map(item => ({
                name: item.name,
            }))
        })
    }
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

const openDialog = async (data) => {
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
        await getDataBase()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>
