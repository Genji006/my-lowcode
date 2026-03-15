<template>
    <SzycDialog :dialogVisible="dialogVisible" width="55%" @close="dialogVisible = false" title="Excel输出"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem ">
                        <div class="dialog-content-wrapper">
                            <el-tab-pane label="文件" name="file">
                                <el-form label-position="right" label-width="160px" :disabled="form.getFromFileStep">
                                    <el-form-item label="文件名称：">
                                        <el-input v-model="form.name" style="width: 72%;"></el-input>
                                        <el-button @click="openFileExplorer" style="margin-left: 5px;">浏览</el-button>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.create_parent_folder">是否创建父目录？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.do_not_open_newfile_init">初始化时不创建新文件？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="扩展名：">
                                        <el-input v-model="form.extention" style="width: 80%;"></el-input>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.split">文件名中是否包含步骤？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.add_date"
                                            :disabled="form.SpecifyFormat">文件名中是否包含日期？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.add_time"
                                            :disabled="form.SpecifyFormat">文件名中是否包含时间？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.SpecifyFormat">日期是否格式化？</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="时间格式：">
                                        <el-select v-model="form.time_format" :disabled="!form.SpecifyFormat"
                                            style="width: 80%;" placeholder="请选择时间格式">
                                            <el-option v-for="item in timeList" :label="item.formatName"
                                                :value="item.formatName"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-checkbox v-model="form.add_to_result_filenames">把文件名添加到结果中?</el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="字段" name="field" class="tableStyle">
                                <div style="margin: 5px 0; display:flex; flex-direction: row;">
                                    <el-button @click="getFiles" style="margin-left: 5px;">获取字段</el-button>
                                    <el-button @click="addFiles" style="margin-left: 5px;">新增字段</el-button>
                                    <el-button @click="deleteSelectedFile" :disabled="!currentRow"
                                        style="margin-left: 5px;">删除</el-button>
                                </div>
                                <el-table :data="filesList" style="width: 100%;" border
                                    @current-change="handleCurrentChange" highlight-current-row>
                                    <el-table-column type="index" width="40" align="center"></el-table-column>
                                    <el-table-column prop="name" label="字段名" min-width="100" align="center">
                                        <template #default="scope">
                                            <el-input v-model="scope.row.name" size="small">
                                            </el-input>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="type" label="类型" min-width="100" align="center">
                                        <template #default="scope">
                                            <el-select v-model="scope.row.type" size="small">
                                                <el-option v-for="item in columnTypeList" :label="item.type"
                                                    :value="item.type"></el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="format" label="格式" min-width="120" align="center">
                                        <template #default="scope">
                                            <el-select v-model="scope.row.format" size="small">
                                                <el-option v-for="item in columnFormatsList" :label="item.format"
                                                    :value="item.format"></el-option>
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

    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />

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
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import GenericTable from '../tools/GenericTable.vue'
import { Encodings } from '@/api/kettleApi/index'
import { ElMessage } from 'element-plus'
import FileExplorerWindow from '../tools/FileExplorerWindow.vue'
import { columnType, columnFormats, inputOutputFields, getFormats } from '@/api/kettleApi/index'

const dialogVisible = ref(false)
const showChange = ref(false)
const activeTab = ref('file')
const form = reactive({
    stepName: '',
    name: '',
    create_parent_folder: false,
    do_not_open_newfile_init: false,
    extention: '',
    split: false,
    add_date: false,
    add_time: false,
    SpecifyFormat: false,
    time_format: '',
    add_to_result_filenames: false
})

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
    getColumnType()
    getcolumnFormats()
    getExcelFormats()
    dialogVisible.value = true
}

const getExcelFormats = async () => {
    let res = await getFormats({})
    timeList.value = res
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const excelOutput = stepElements[0];
            console.log("excelOutput", excelOutput);
            // 填充表单字段
            form.stepName = excelOutput.getAttribute('label') || '';
            form.name = excelOutput.getAttribute('name') || '';
            form.create_parent_folder = excelOutput.getAttribute('create_parent_folder') === 'Y';
            form.do_not_open_newfile_init = excelOutput.getAttribute('do_not_open_newfile_init') === 'Y';
            form.extention = excelOutput.getAttribute('extention') || '';
            form.split = excelOutput.getAttribute('split') === 'Y';
            form.add_date = excelOutput.getAttribute('add_date') === 'Y';
            form.add_time = excelOutput.getAttribute('add_time') === 'Y';
            form.SpecifyFormat = excelOutput.getAttribute('SpecifyFormat') === 'Y';
            form.add_to_result_filenames = excelOutput.getAttribute('add_to_result_filenames') === 'Y';
            filesList.value = JSON.parse(excelOutput.getAttribute("fields")) || [];
            console.log("partitioning", JSON.parse(excelOutput.getAttribute("partitioning")));
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
            const excelOutput = stepElements[0];
            // 更新属性
            excelOutput.setAttribute('label', form.stepName);
            excelOutput.setAttribute('name', form.name);
            excelOutput.setAttribute('create_parent_folder', form.create_parent_folder ? 'Y' : 'N');
            excelOutput.setAttribute('do_not_open_newfile_init', form.do_not_open_newfile_init ? 'Y' : 'N');
            excelOutput.setAttribute('extention', form.extention);
            excelOutput.setAttribute('split', form.split ? 'Y' : 'N');
            excelOutput.setAttribute('add_date', form.add_date ? 'Y' : 'N');
            excelOutput.setAttribute('add_time', form.add_time ? 'Y' : 'N');
            excelOutput.setAttribute('SpecifyFormat', form.SpecifyFormat ? 'Y' : 'N');
            excelOutput.setAttribute('add_to_result_filenames', form.add_to_result_filenames ? 'Y' : 'N');
            excelOutput.setAttribute('fields', JSON.stringify(filesList.value));
            excelOutput.setAttribute('partitioning', JSON.stringify({ method: "none", schema_name: "" }));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(excelOutput);
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

const showFileExplorer = ref(false)
// 打开文件浏览器窗口并设置当前字段
const openFileExplorer = () => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.name = path + '\\' + form.name
}


// 选中的文件数据
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

// 处理提示对话框的取消操作
const handlePromptCancel = () => {
    promptDialogVisible.value = false
    if (promptResolve.value) {
        promptResolve.value('cancel')
        promptResolve.value = null
    }
}

// 根据用户选择处理数据
const handleFilesResult = (action, newData) => {
    switch (action) {
        case 'addNew':
            // 增加新的（这里假设是新增数据中不存在于当前数据的项）
            newData.forEach(item => {
                if (!filesList.value.some(existingItem => existingItem.name === item.name)) {
                    filesList.value.push(item);
                }
            });
            break;
        case 'addAll':
            // 增加所有
            filesList.value = [...filesList.value, ...newData];
            break;
        case 'clearAndAddAll':
            // 清除并增加所有
            filesList.value = newData;
            break;
        case 'cancel':
            // 取消
            break;
        default:
            break;
    }
};

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
        filesList.value = res;
    }
};

const addFiles = () => {
    filesList.value.push({})
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