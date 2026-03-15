<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="增加序列"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder=""></el-input>
                    </el-form-item>
                    <el-form-item label="值的名称：">
                        <el-input v-model="form.valuename" placeholder=""></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-width="210px">
                            <el-divider content-position="left">使用数据库来生成序列</el-divider>
                            <el-form-item label="使用DB来获取sequence：">
                                <el-checkbox v-model="form.useDatabase" @change="onUseDatabaseChange"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="数据库连接：">
                                <div style="display: flex; align-items: center; width: 100%;">
                                    <el-select v-model="form.connection" style="width: 100%;" placeholder=""
                                        :disabled="!form.useDatabase">
                                        <el-option v-for="item in dataBaseList" :label="item.name"
                                            :value="item.name"></el-option>
                                    </el-select>
                                    <el-button @click="editDataBaseSetting" style="margin-left: 10px;"
                                        :disabled="!form.connection || !form.useDatabase">编辑</el-button>
                                    <el-button @click="addDataBaseSetting" style="margin-left: 10px;"
                                        :disabled="!form.useDatabase">新建</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="模式名称：">
                                <div style="display: flex; align-items: center; width: 100%;">
                                    <el-input v-model="form.schema" style="width: 100%;"
                                        :disabled="!form.useDatabase || !form.connection"></el-input>
                                    <el-button @click="openDatabaseExplorer('schema')" style="margin-left: 10px;"
                                        :disabled="!form.connection || !form.useDatabase">浏览</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="Sequence名称：">
                                <div style="display: flex; align-items: center; width: 100%;">
                                    <el-input v-model="form.seqname" style="width: 100%;" @change="getTableFields"
                                        :disabled="!form.useDatabase || !form.connection"></el-input>
                                    <el-button @click="" style="margin-left: 10px;"
                                        :disabled="!form.connection || !form.useDatabase">浏览</el-button>
                                </div>
                            </el-form-item>
                            <el-divider content-position="left">使用数转换计数器来生成序列</el-divider>
                            <el-form-item label="使用计数器来计算sequence：">
                                <el-checkbox v-model="form.use_counter" @change="onUseCounterChange"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="计数器名称（可选）：">
                                <el-input v-model="form.counter_name" style="width: 100%;"
                                    :disabled="!form.use_counter"></el-input>
                            </el-form-item>
                            <el-form-item label="起始值：">
                                <el-input v-model="form.start_at" style="width: 100%;"
                                    :disabled="!form.use_counter"></el-input>
                            </el-form-item>
                            <el-form-item label="增长根据：">
                                <el-input v-model="form.increment_by" style="width: 100%;"
                                    :disabled="!form.use_counter"></el-input>
                            </el-form-item>
                            <el-form-item label="最大值：">
                                <el-input v-model="form.max_value" style="width: 100%;"
                                    :disabled="!form.use_counter"></el-input>
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
    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="1"
        :trans-Name="transName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import ReusableTable from "../tools/ExcelFilesTable.vue";
import { getDatabases, inputOutputFields, tableFields } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const dialogVisible = ref(false);
const activeTab = ref("");
const showDatabaseExplorer = ref(false)
const databaseInfo = ref({})

const form = reactive({
    stepName: "",
    valuename: "",
    useDatabase: true,
    connection: "",
    schema: "",
    seqname: "",
    use_counter: false,
    counter_name: "",
    start_at: "",
    increment_by: "",
    max_value: "",
});


// 修改互斥逻辑处理函数
const onUseDatabaseChange = (val) => {
    if (val) {
        form.use_counter = false;
    } else {
        form.use_counter = true;
    }
};

const onUseCounterChange = (val) => {
    if (val) {
        form.useDatabase = false;
    } else {
        form.useDatabase = true;
    }
};




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
            const sequence = stepElements[0];
            console.log("sequence", sequence);
            // 填充表单字段
            form.stepName = sequence.getAttribute('label') || '';
            form.valuename = sequence.getAttribute('valuename') || '';
            form.useDatabase = sequence.getAttribute('useDatabase') === 'Y';
            form.connection = sequence.getAttribute('connection') || '';
            form.schema = sequence.getAttribute('schema') || '';
            form.seqname = sequence.getAttribute('seqname') || '';
            form.use_counter = sequence.getAttribute('use_counter') === 'Y';
            form.counter_name = sequence.getAttribute('counter_name') || '';
            form.start_at = sequence.getAttribute('start_at') || '';
            form.increment_by = sequence.getAttribute('increment_by') || '';
            form.max_value = sequence.getAttribute('max_value') || '';
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
            const sequence = stepElements[0];
            // 更新属性
            sequence.setAttribute("label", form.stepName);
            sequence.setAttribute("valuename", form.valuename);
            sequence.setAttribute("useDatabase", form.useDatabase ? 'Y' : 'N');
            sequence.setAttribute("connection", form.connection);
            sequence.setAttribute("schema", form.schema);
            sequence.setAttribute("seqname", form.seqname);
            sequence.setAttribute("use_counter", form.use_counter ? 'Y' : 'N');
            sequence.setAttribute("counter_name", form.counter_name);
            sequence.setAttribute("start_at", form.start_at);
            sequence.setAttribute("increment_by", form.increment_by);
            sequence.setAttribute("max_value", form.max_value);

            // 返回更新后的XML
            return mxUtils.getPrettyXml(sequence);
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


const tableType = ref('')
const openDatabaseExplorer = (type) => {
    showDatabaseExplorer.value = true
    tableType.value = type
    databaseInfo.value = { name: form.connection }
}

const onDatabaseNodeSelect = (node) => {
    form.schema = node.text;
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
        parseStepInfoAndPopulateForm(currentXml);
        getDataBase()
    }
    if (!form.useDatabase && !form.use_counter) {
        form.useDatabase = true;
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>