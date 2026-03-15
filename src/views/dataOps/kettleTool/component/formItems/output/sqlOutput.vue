<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="closeDialog" title="SQL文件输出" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem ">
                        <div class="dialog-content-wrapper">
                            <el-tab-pane label="一般" name="general">
                                <el-form label-position="right" label-width="180px">
                                    <el-divider content-position="left">连接</el-divider>
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
                                    <el-divider content-position="left">输出文件</el-divider>
                                    <el-form-item label="增加创建表语句">
                                        <el-checkbox v-model="form.create"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="增加清空表语句">
                                        <el-checkbox v-model="form.truncate"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="每个语句另起一行">
                                        <el-checkbox v-model="form.startnewline"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-input v-model="form.name" style="width: 100%;"></el-input>
                                            <el-button @click="openFileExplorer('name')"
                                                style="margin-left: 10px;">浏览</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="创建父目录">
                                        <el-checkbox v-model="form.create_parent_folder"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="启动时不创建文件">
                                        <el-checkbox v-model="form.DoNotOpenNewFileInit"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="拓展名">
                                        <el-input v-model="form.extention"></el-input>
                                    </el-form-item>
                                    <el-form-item label="文件名中包括步骤号">
                                        <el-checkbox v-model="form.split"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名中包含日期">
                                        <el-checkbox v-model="form.add_date"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名中包含时间">
                                        <el-checkbox v-model="form.add_time"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="追加方式">
                                        <el-checkbox v-model="form.append"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="每...行拆分">
                                        <el-input v-model="form.splitevery"></el-input>
                                    </el-form-item>
                                    <el-form-item label="将文件加入到结果文件中">
                                        <el-checkbox v-model="form.addtoresult"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="内容" name="content">
                                <el-form label-position="right" label-width="160px">
                                    <el-form-item label="日期格式：">
                                        <el-select v-model="form.dateformat" placeholder="">
                                            <el-option v-for="item in timeList" :key="item.formatName"
                                                :label="item.formatName" :value="item.formatName" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="编码：">
                                        <el-select v-model="form.encoding" placeholder="">
                                            <el-option v-for="item in charsetOptionList" :key="item.name"
                                                :label="item.name" :value="item.name" />
                                        </el-select>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                        </div>
                    </el-tabs>
                </el-form>
            </div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="closeDialog">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>

    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="15"
        :trans-Name="transName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { Encodings } from '@/api/kettleApi/index'
import { ElMessage } from 'element-plus'
import { getDatabases, getFormats, systemAvailableCharsets } from '@/api/kettleApi/index'
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import FileExplorerWindow from '../tools/FileExplorerWindow.vue'

const dialogVisible = ref(false)
const showDatabaseExplorer = ref(false)
const showFileExplorer = ref(false)
const databaseInfo = ref({})
const activeTab = ref('general')
const form = reactive({
    stepName: '',
    connection: '',
    schema: '',
    table: '',
    create: false,
    truncate: false,
    startnewline: false,
    name: '',
    create_parent_folder: false,
    DoNotOpenNewFileInit: false,
    extention: '',
    split: false,
    add_date: false,
    add_time: false,
    append: false,
    splitevery: '',
    addtoresult: false,
    dateformat: '',
    encoding: ''
})
// 新增的提示对话框相关状态
const promptDialogVisible = ref(false)
const promptResolve = ref(null)
const timeList = ref([])
const charsetOptionList = ref([])

const { mxUtils } = window.mx;
const emit = defineEmits(['update-step', 'editDataBaseSetting', 'addDataBaseSetting'])

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
        getDataBase()
        getAvailableCharsets()
        getExcelFormats()
    }
    dialogVisible.value = true
}

const closeDialog = () => {
    Object.assign(form, {
        stepName: '',
        connection: '',
        schema: '',
        table: '',
        create: false,
        truncate: false,
        startnewline: false,
        name: '',
        create_parent_folder: false,
        DoNotOpenNewFileInit: false,
        extention: '',
        split: false,
        add_date: false,
        add_time: false,
        append: false,
        splitevery: '',
        addtoresult: false,
        dateformat: '',
        encoding: ''
    });
    dialogVisible.value = false
}

const getExcelFormats = async () => {
    let res = await getFormats({})
    timeList.value = res
}

const getAvailableCharsets = () => {
    systemAvailableCharsets({}).then(res => {
        charsetOptionList.value = res
    })
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const sqlOutput = stepElements[0];
            console.log("sqlOutput", sqlOutput);
            // 填充表单字段
            form.stepName = sqlOutput.getAttribute('label') || '';
            form.connection = sqlOutput.getAttribute('connection') || '';
            form.schema = sqlOutput.getAttribute('schema') || '';
            form.table = sqlOutput.getAttribute('table') || '';
            form.create = sqlOutput.getAttribute('create') === 'Y';
            form.truncate = sqlOutput.getAttribute('truncate') === 'Y';
            form.startnewline = sqlOutput.getAttribute('startnewline') === 'Y';
            form.name = sqlOutput.getAttribute('name') || '';
            form.create_parent_folder = sqlOutput.getAttribute('create_parent_folder') === 'Y';
            form.DoNotOpenNewFileInit = sqlOutput.getAttribute('DoNotOpenNewFileInit') === 'Y';
            form.extention = sqlOutput.getAttribute('extention') || '';
            form.split = sqlOutput.getAttribute('split') === 'Y';
            form.add_date = sqlOutput.getAttribute('add_date') === 'Y';
            form.add_time = sqlOutput.getAttribute('add_time') === 'Y';
            form.append = sqlOutput.getAttribute('append') === 'Y';
            form.splitevery = sqlOutput.getAttribute('splitevery') || '';
            form.addtoresult = sqlOutput.getAttribute('addtoresult') === 'Y';
            form.dateformat = sqlOutput.getAttribute('dateformat') || '';
            form.encoding = sqlOutput.getAttribute('encoding') || '';
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
            const sqlOutput = stepElements[0];
            // 更新属性
            sqlOutput.setAttribute('label', form.stepName);
            sqlOutput.setAttribute('connection', form.connection);
            sqlOutput.setAttribute('schema', form.schema);
            sqlOutput.setAttribute('table', form.table);
            sqlOutput.setAttribute('create', form.create ? 'Y' : 'N');
            sqlOutput.setAttribute('truncate', form.truncate ? 'Y' : 'N');
            sqlOutput.setAttribute('startnewline', form.startnewline ? 'Y' : 'N');
            sqlOutput.setAttribute('name', form.name);
            sqlOutput.setAttribute('create_parent_folder', form.create_parent_folder ? 'Y' : 'N');
            sqlOutput.setAttribute('DoNotOpenNewFileInit', form.DoNotOpenNewFileInit ? 'Y' : 'N');
            sqlOutput.setAttribute('extention', form.extention);
            sqlOutput.setAttribute('split', form.split ? 'Y' : 'N');
            sqlOutput.setAttribute('add_date', form.add_date ? 'Y' : 'N');
            sqlOutput.setAttribute('add_time', form.add_time ? 'Y' : 'N');
            sqlOutput.setAttribute('append', form.append ? 'Y' : 'N');
            sqlOutput.setAttribute('splitevery', form.splitevery);
            sqlOutput.setAttribute('addtoresult', form.addtoresult ? 'Y' : 'N');
            sqlOutput.setAttribute('dateformat', form.dateformat);
            sqlOutput.setAttribute('encoding', form.encoding);
            // 返回更新后的XML
            return mxUtils.getPrettyXml(sqlOutput);
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
        form.schema = node.nodeId;
    } else if (tableType.value == 'table') {
        form.schema = node.nodeId;
        form.table = node.text;
    }
}


onMounted(() => {

})

// 暴露方法给父组件使用
defineExpose({
    openDialog
})
</script>


<style lang="scss" scoped>
.dialog-content-wrapper {
    height: 550px;
    overflow-y: auto;

    ::deep(.el-divider--horizontal) {
        margin: 15px 0 !important;
    }

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

}
</style>