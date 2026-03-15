<template>
    <SzycDialog :dialogVisible="dialogVisible" width="55%" @close="dialogVisible = false" title="EXCEL输入"
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
                                    <el-form-item label="表格类型（引擎）：">
                                        <el-select v-model="form.excelType">
                                            <el-option v-for="item in excelTypeList" :label="item.label"
                                                :value="item.label"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="文件或目录：">
                                        <el-input v-model="form.fileName" style="width: 81%;"></el-input>
                                        <el-button @click="addFile" style="margin:0 0 0 15px;">增加</el-button>
                                        <el-button @click="browseFile">浏览</el-button>
                                    </el-form-item>
                                    <el-form-item label="正则表达式：">
                                        <el-input v-model="form.ruleExpression" style="width: 100%;"></el-input>
                                    </el-form-item>
                                    <el-form-item label="正则表达式(排除)：">
                                        <el-input v-model="form.regexExclusion" style="width: 100%;"></el-input>
                                    </el-form-item>
                                    <el-form-item label="选中的文件：" class="tableStyle">
                                        <el-table :data="selectedFiles" style="width: 100%;" border height="250"
                                            @current-change="handleCurrentChange" highlight-current-row>
                                            <el-table-column type="index" width="40" align="center"
                                                label="#"></el-table-column>
                                            <el-table-column prop="filePath" label="文件/目录" min-width="100"
                                                align="center">
                                                <template #default="scope">
                                                    <el-input v-model="scope.row.filePath" size="small">
                                                    </el-input>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="wildcard" label="通配符号" min-width="100"
                                                align="center">
                                                <template #default="scope">
                                                    <el-input v-model="scope.row.wildcard" size="small">
                                                    </el-input>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="wildcardSymbol" label="通配符号（排除）" min-width="120"
                                                align="center">
                                                <template #default="scope">
                                                    <el-input v-model="scope.row.wildcardSymbol" size="small">
                                                    </el-input>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="requirement" label="要求" min-width="100"
                                                align="center">
                                                <template #default="scope">
                                                    <el-select v-model="scope.row.requirement" size="small">
                                                        <el-option label="是" value="是"></el-option>
                                                        <el-option label="否" value="否"></el-option>
                                                    </el-select>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="includeSubdirs" label="包含子目录" min-width="100"
                                                align="center">
                                                <template #default="scope">
                                                    <el-select v-model="scope.row.includeSubdirs" size="small">
                                                        <el-option label="是" value="是"></el-option>
                                                        <el-option label="否" value="否"></el-option>
                                                    </el-select>
                                                </template>
                                            </el-table-column>
                                        </el-table>

                                        <el-button @click="deleteSelectedFile" :disabled="!currentRow">删除</el-button>
                                    </el-form-item>
                                </el-form>
                                <el-divider content-position="left">从上一步骤获取文件</el-divider>
                                <el-form label-position="right" label-width="220px">
                                    <el-form-item label="从以前步骤接收文件名：">
                                        <el-checkbox v-model="form.getFromFileStep"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="步骤读取的文件名来自：">
                                        <el-input v-model="form.previousStepFileName" :disabled="!form.getFromFileStep"
                                            style="width: 100%;"></el-input>
                                    </el-form-item>
                                    <el-form-item label="在输入里的字段被当做文件名：">
                                        <el-input v-model="form.previousStepFileName" :disabled="!form.getFromFileStep"
                                            style="width: 100%;"></el-input>
                                    </el-form-item>
                                </el-form>
                                <el-button style="margin: 0 0 10px 20px;"
                                    :disabled="form.getFromFileStep">显示文件名称</el-button>
                            </el-tab-pane>
                            <el-tab-pane label="工作表" name="sheets">
                                <!-- <span style="padding: 20px 0;">要读取的工作表列表</span> -->
                                <GenericTable v-model="sheetsData" :columns="sheetsColumns"
                                    :default-row="sheetsDefaultRow" ref="dependencyTableRef" />
                                <el-button style="margin: 10px 0;" :disabled="form.getFromFileStep">获取工作表名称</el-button>
                            </el-tab-pane>
                            <el-tab-pane label="内容" name="content">
                                <el-form :model="form" label-width="160px">
                                    <el-form-item label="头部：">
                                        <el-checkbox v-model="form.header"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="非空记录：">
                                        <el-checkbox v-model="form.nonEmptyRecords"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="停在空记录：">
                                        <el-checkbox v-model="form.stopOnEmptyRecord"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="限制：">
                                        <el-input v-model="form.limit"></el-input>
                                    </el-form-item>
                                    <el-form-item label="编码：">
                                        <el-select v-model="form.encoding">
                                            <el-option v-for="item in encodingList" :label="item.encodingName"
                                                :value="item.encodingName"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-divider content-position="left">结果文件名</el-divider>
                                    <el-form-item label="添加文件名：">
                                        <el-checkbox v-model="form.addFileName"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="错误处理" name="error">
                                <el-form :model="form" label-width="160px">
                                    <el-form-item label="严格类型？">
                                        <el-checkbox v-model="form.strictType">严格类型</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="忽略错误？">
                                        <el-checkbox v-model="form.ignoreErrors" checked>忽略错误</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="跳过错误行？">
                                        <el-checkbox v-model="form.skipErrorRows"
                                            :disabled="!form.ignoreErrors">跳过错误行</el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="告警文件目录">
                                        <div style="display: flex;">
                                            <el-input v-model="form.warningFileDir" :disabled="!form.ignoreErrors"
                                                style="flex: 15;"></el-input>
                                            <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                                            <el-input v-model="form.warningFileName" style="flex: 4;"
                                                :disabled="!form.ignoreErrors"></el-input>
                                            <el-button @click="openFileExplorer('warningFileDir')"
                                                style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">浏览</el-button>
                                            <el-button @click="" style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">变量</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="错误文件目录" :disabled="!form.ignoreErrors">
                                        <div style="display: flex;">
                                            <el-input v-model="form.errorFileDir" style="flex: 15;"
                                                :disabled="!form.ignoreErrors"></el-input>
                                            <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                                            <el-input v-model="form.errorFileDirName" style="flex: 4;"
                                                :disabled="!form.ignoreErrors"></el-input>
                                            <el-button @click="openFileExplorer('errorFileDir')"
                                                style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">浏览</el-button>
                                            <el-button @click="" style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">变量</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="失败的记录数文件目录" :disabled="!form.ignoreErrors">
                                        <div style="display: flex;">
                                            <el-input v-model="form.failedRecordsFileDir" style="flex: 15;"
                                                :disabled="!form.ignoreErrors"></el-input>
                                            <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                                            <el-input v-model="form.failedRecordsFileName" style="flex: 4;"
                                                :disabled="!form.ignoreErrors"></el-input>
                                            <el-button @click="openFileExplorer('failedRecordsFileDir')"
                                                style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">浏览</el-button>
                                            <el-button @click="" style="margin-left: 10px; flex: 1;"
                                                :disabled="!form.ignoreErrors">变量</el-button>
                                        </div>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="字段" name="field">
                                <GenericTable v-model="fieldsData" :columns="fieldsColumns"
                                    :default-row="fieldsDefaultRow" />
                                <el-button style="margin-bottom: 10px;">获取来自头部数据的字段</el-button>
                            </el-tab-pane>
                            <el-tab-pane label="其他输出字段" name="otherField">
                                <el-form :model="form" label-width="200px">
                                    <el-form-item label="文件名称字段：">
                                        <el-input v-model="form.fileNameField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="工作表名称字段：">
                                        <el-input v-model="form.sheetNameField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="表单的行号列：">
                                        <el-input v-model="form.rowNumberColumn"></el-input>
                                    </el-form-item>
                                    <el-form-item label="行号列：">
                                        <el-input v-model="form.rowNumber"></el-input>
                                    </el-form-item>
                                    <el-form-item label="文件名字段：">
                                        <el-input v-model="form.fileName"></el-input>
                                    </el-form-item>
                                    <el-form-item label="扩展名字段：">
                                        <el-input v-model="form.extensionField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="路径字段：">
                                        <el-input v-model="form.pathField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="文件大小字段：">
                                        <el-input v-model="form.fileSizeField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="是否为隐藏文件字段：">
                                        <el-input v-model="form.isHiddenFileField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="最后修改时间字段：">
                                        <el-input v-model="form.lastModifiedDateField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Uri 字段：">
                                        <el-input v-model="form.uriField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Root uri 字段：">
                                        <el-input v-model="form.rootUriField"></el-input>
                                    </el-form-item>
                                </el-form>
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
const dialogVisible = ref(false)
const activeTab = ref('file')
const form = reactive({
    stepName: '',
    fileName: '',
    ruleExpression: '',
    regexExclusion: '',
    getFromFileStep: false,
    previousStepFileName: '',
    excelType: 'Excel 97-2003 XLS (JXL)', // 添加默认值
    header: true, // 头部
    nonEmptyRecords: true, // 非空记录
    stopOnEmptyRecord: false, // 停在空记录
    limit: '0', // 限制
    encoding: '', // 编码
    addFileName: true, // 添加文件名
    warningFileDir: '',
    warningFileName: 'warning',
    errorFileDir: '',
    errorFileDirName: 'error',
    failedRecordsFileDir: '',
    failedRecordsFileName: 'line',
    fileNameField: '',
    sheetNameField: '',
    rowNumberColumn: '',
    rowNumber: '',
    fileName: '',
    extensionField: '',
    pathField: '',
    fileSizeField: '',
    isHiddenFileField: '',
    lastModifiedDateField: '',
    uriField: '',
    rootUriField: ''
})

// 当前正在设置路径的字段
const currentField = ref('')

const excelTypeList = ref([
    { label: "Excel 97-2003 XLS (JXL)", id: 1, extension: ".xls" },
    { label: "Excel 2007 XLSX (Apache POI)", id: 2, extension: ".xlsx" },
    { label: "Excel 2007 XLSX (Apache POI Streaming)", id: 3, extension: ".xlsx" },
    { label: "Open Office ODS (ODFDOM)", id: 4, extension: ".ods" }
])

// 选中的文件数据
const selectedFiles = ref([])

// 编码数组
const encodingList = ref([])

// 工作表表格
const sheetsData = ref([
    { sheetname: '', startLine: '', startColumn: '' },
])

// 工作表表头
const sheetsColumns = ref([
    { prop: 'sheetname', label: '工作表名称' },
    { prop: 'startLine', label: '起始行' },
    { prop: 'startColumn', label: '起始列' }
])

const sheetsDefaultRow = ref({ connection: '', table: '', field: '' })

const fieldsData = ref([
    { name: '', type: '', length: '', accuracy: '', typenoSpace: '', repeat: '', format: '', currency: '', decimal: '', grouping: '' }
])

const fieldsColumns = ref([
    { prop: 'name', label: '名称' },
    { prop: 'type', label: '类型' },
    { prop: 'length', label: '长度' },
    { prop: 'accuracy', label: '精度' },
    { prop: 'typenoSpace', label: '去除空格类型' },
    { prop: 'repeat', label: '重复' },
    { prop: 'format', label: '格式' },
    { prop: 'currency', label: '货币符号' },
    { prop: 'decimal', label: '小数' },
    { prop: 'grouping', label: '分组' },
])

const fieldsDefaultRow = ref({ name: '', type: '', length: '', accuracy: '', typenoSpace: '', repeat: '', format: '', currency: '', decimal: '', grouping: '' })

// 计算属性，根据选择的excel类型获取文件扩展名
const acceptedFileExtension = computed(() => {
    if (!form.excelType) return '';
    const selectedType = excelTypeList.value.find(item => item.label === form.excelType);
    return selectedType ? selectedType.extension : '';
})

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null

const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
    }

    dialogVisible.value = true
}

const handleConfirm = () => {
    if (currentCell && currentGraph) {
        currentGraph.getModel().setValue(currentCell, form.stepName)
    }

    dialogVisible.value = false
}

const addFile = () => {
    if (form.fileName && form.fileName.trim() !== '') {
        // 如果文件或目录输入框中有值，则添加该值到表格中
        selectedFiles.value.push({
            filePath: form.fileName,
            wildcard: '',
            wildcardSymbol: '',
            requirement: '',
            includeSubdirs: ''
        });
        // 清空输入框
        form.fileName = '';
    } else {
        // 如果没有值，则添加一行空数据
        selectedFiles.value.push({
            filePath: '',
            wildcard: '',
            wildcardSymbol: '',
            requirement: '',
            includeSubdirs: ''
        });
    }
}

const browseFile = () => {
    // 创建一个隐藏的文件输入元素
    const input = document.createElement('input')
    input.type = 'file'

    // 根据选择的excel类型设置接受的文件类型
    if (acceptedFileExtension.value) {
        input.accept = acceptedFileExtension.value
    }

    input.style.display = 'none'

    // 添加change事件监听器
    input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
            form.fileName = file.name
            console.log("file", file);
        }
        // 清理创建的元素
        document.body.removeChild(input)
    }

    // 添加到DOM中并触发点击事件
    document.body.appendChild(input)
    input.click()
}

// 当前选中行
const currentRow = ref(null)

// 处理表格行选中
const handleCurrentChange = (row) => {
    currentRow.value = row
}

// 删除选中的文件
const deleteSelectedFile = () => {
    if (currentRow.value) {
        const index = selectedFiles.value.indexOf(currentRow.value)
        if (index > -1) {
            selectedFiles.value.splice(index, 1)
            currentRow.value = null
        }
    }
}

const showFileExplorer = ref(false)

// 打开文件浏览器窗口并设置当前字段
const openFileExplorer = (field) => {
    currentField.value = field
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    console.log('选中的文件路径:', path)
    // 根据currentField的值设置对应字段的值
    if (currentField.value) {
        form[currentField.value] = path
    }
}

const getencodingList = async () => {
    try {
        encodingList.value = await Encodings({})
    } catch {
        ElMessage.error("获取失败")
    }

}

onMounted(() => {
    getencodingList()
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