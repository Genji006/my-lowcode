<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="closeDialog" title="文本文件输出" :destroy-on-close="true"
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
                            <el-tab-pane label="文件" name="general">
                                <el-form label-position="right" label-width="180px">
                                    <el-form-item label="文件名称">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-input v-model="form.file_name" style="width: 100%;"></el-input>
                                            <el-button @click="openFileExplorer('name')"
                                                style="margin-left: 10px;">浏览</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="结果输送至命令行或脚本">
                                        <el-checkbox v-model="form.is_command"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="输出传递到Servlet">
                                        <el-checkbox v-model="form.servlet_output"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="创建父目录">
                                        <el-checkbox v-model="form.create_parent_folder"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="启动时不创建文件">
                                        <el-checkbox v-model="form.do_not_open_new_file_init"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="从字段中获取文件名">
                                        <el-checkbox v-model="form.fileNameInField"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名字段">
                                        <el-input v-model="form.fileNameField"></el-input>
                                    </el-form-item>
                                    <el-form-item label="拓展名">
                                        <el-input v-model="form.extention"></el-input>
                                    </el-form-item>
                                    <el-form-item label="文件名里包含步骤数">
                                        <el-checkbox v-model="form.split"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名里包含数据分区号">
                                        <el-checkbox v-model="form.haspartno"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名中包含日期">
                                        <el-checkbox v-model="form.add_date"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="文件名中包含时间">
                                        <el-checkbox v-model="form.add_time"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="指定日期时间格式">
                                        <el-checkbox v-model="form.SpecifyFormat"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="指定日期时间格式">
                                        <el-select v-model="form.date_time_format" placeholder="">
                                            <el-option v-for="item in timeList" :key="item.formatName"
                                                :label="item.formatName" :value="item.formatName" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="结果中添加文件名">
                                        <el-checkbox v-model="form.add_to_result_filenames"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="内容" name="content">
                                <el-form label-position="right" label-width="180px">
                                    <el-form-item label="追加方式">
                                        <el-checkbox v-model="form.append"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="分隔符">
                                        <div style="display: flex;align-items: center; width: 100%;">
                                            <el-input v-model="form.separator" style="width: 100%;"></el-input>
                                            <el-button @click="insertTab" style="margin-left: 10px;">插入TAB</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="封闭符">
                                        <el-input v-model="form.enclosure"></el-input>
                                    </el-form-item>
                                    <el-form-item label="强制在字段周围加封闭符">
                                        <el-checkbox v-model="form.enclosure_forced"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="禁用封闭符修复">
                                        <el-checkbox v-model="form.enclosure_fix_disabled"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="头部">
                                        <el-checkbox v-model="form.header"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="尾部">
                                        <el-checkbox v-model="form.footer"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="格式">
                                        <el-select v-model="form.format" placeholder="">
                                            <el-option v-for="item in lineTerminatorOptions" :key="item.name"
                                                :label="item.name" :value="item.name"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="压缩">
                                        <el-select v-model="form.compression" placeholder="">
                                            <el-option v-for="item in compressionOptions" :key="item.name"
                                                :label="item.name" :value="item.name"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="编码">
                                        <el-select v-model="form.encoding" placeholder="">
                                            <el-option v-for="item in charsetOptionList" :key="item.name"
                                                :label="item.name" :value="item.name" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="字段右填充或裁剪">
                                        <el-checkbox v-model="form.pad"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="快速存储数据(无格式)">
                                        <el-checkbox v-model="form.fast_dump"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="每...行拆分">
                                        <el-input v-model="form.splitevery"></el-input>
                                    </el-form-item>
                                    <el-form-item label="添加文件结束行">
                                        <el-input v-model="form.endedLine"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="字段" name="field">
                                <RightClickTable ref="fieldDataTableRef" :modelValue="form.fields"
                                    :columns="fieldDataColumns" :showIndex="true" :height="550" style="width: 100%"
                                    :needSpecialFunction="true" :specialFunction="'获取变量'"
                                    @parent-function="fieldParentFunction">
                                </RightClickTable>
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

    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { ElMessage } from 'element-plus'
import { Encodings, getDatabases, getFormats, systemAvailableCharsets, systemFormatMapperLineTerminator, systemFormatMapperCompression, inputOutputFields, valueMeta, valueFormat } from '@/api/kettleApi/index'
import FileExplorerWindow from '../tools/FileExplorerWindow.vue'
import RightClickTable from "../tools/rightClickTable.vue";

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
    file_name: '',
    create_parent_folder: false,
    do_not_open_new_file_init: false,
    extention: '',
    split: false,
    haspartno: false,
    add_date: false,
    add_time: false,
    SpecifyFormat: false,
    date_time_format: '',
    add_to_result_filenames: false,
    dateformat: '',
    encoding: '',
    fields: [],
    is_command: false,
    servlet_output: false,
    fileNameInField: false,
    fileNameField: '',
    separator: '',
    enclosure: '',
    enclosure_forced: false,
    enclosure_fix_disabled: false,
    header: false,
    footer: false,
    format: '',
    compression: '',
    pad: false,
    fast_dump: false,
    splitevery: '',
    endedLine: ''
})
// 新增的提示对话框相关状态
const promptDialogVisible = ref(false)
const promptResolve = ref(null)
const timeList = ref([])
const charsetOptionList = ref([])
const lineTerminatorOptions = ref([])
const compressionOptions = ref([])
const valueMetaList = ref([]);
const valueFormatList = ref([]);

const insertTab = () => {
    form.separator = '\t' + form.separator
}

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
        stepName.value = data.cell.value || ''
        console.log("open", data.allXml);
        parseStepInfoAndPopulateForm(currentXml);
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
        getAvailableCharsets()
        getExcelFormats()
        getLineTerminatorOptions()
        getCompressionOptions()
        getvalueMeta()
        getvalueFormat()
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
        file_name: '',
        create_parent_folder: false,
        do_not_open_new_file_init: false,
        extention: '',
        split: false,
        haspartno: false,
        add_date: false,
        add_time: false,
        SpecifyFormat: false,
        date_time_format: '',
        add_to_result_filenames: false,
        dateformat: '',
        encoding: '',
        fields: [],
        is_command: false,
        servlet_output: false,
        fileNameInField: false,
        fileNameField: '',
        separator: '',
        enclosure: '',
        enclosure_forced: false,
        enclosure_fix_disabled: false,
        header: false,
        footer: false,
        format: '',
        compression: '',
        pad: false,
        fast_dump: false,
        splitevery: '',
        endedLine: ''
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

const getLineTerminatorOptions = () => {
    systemFormatMapperLineTerminator({}).then(res => {
        lineTerminatorOptions.value = res
    })
}

const getCompressionOptions = () => {
    systemFormatMapperCompression({}).then(res => {
        compressionOptions.value = res
    })
}

const stepName = ref('')
const fieldParentFunction = async (data) => {
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };
    let res = await inputOutputFields(params);
    nextTick(() => {
        form.fields = res;
    })
}

const fieldDataColumns = computed(() => [
    { prop: "name", label: "名称", width: 120 },
    {
        prop: "type",
        label: "类型",
        type: "select",
        options: valueMetaList.value,
        valueKey: "name",
        labelKey: "name",
        width: 120
    },
    {
        prop: "format",
        label: "格式",
        type: "select",
        options: valueFormatList.value,
        valueKey: "name",
        labelKey: "name",
        width: 200
    },
    { prop: "length", label: "长度", width: 120 },
    { prop: "precision", label: "精度", width: 120 },
    { prop: "currency", label: "货币", width: 120 },
    { prop: "decimal", label: "小数", width: 120 },
    { prop: "group", label: "分组", width: 120 },
    {
        prop: "trim_type",
        label: "去除空字符串方式",
        type: "select",
        options: [{ name: "不去掉空格" }, { name: "去掉左空格" }, { name: "去掉右空格" }, { name: "去掉左右两端空格" }],
        valueKey: "name",
        labelKey: "name",
        width: 200
    },
    { prop: "Null", label: "nullif", width: 120 },

]);

const getvalueMeta = async () => {
    let res = await valueMeta({});
    valueMetaList.value = res;
};
const getvalueFormat = async () => {
    let res = await valueFormat({ valueType: 'all' });
    valueFormatList.value = res;
}


// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const fileOutput = stepElements[0];
            console.log("fileOutput", fileOutput);
            // 填充表单字段
            form.stepName = fileOutput.getAttribute('label') || '';
            form.connection = fileOutput.getAttribute('connection') || '';
            form.schema = fileOutput.getAttribute('schema') || '';
            form.table = fileOutput.getAttribute('table') || '';
            form.create = fileOutput.getAttribute('create') === 'Y';
            form.truncate = fileOutput.getAttribute('truncate') === 'Y';
            form.startnewline = fileOutput.getAttribute('startnewline') === 'Y';
            form.file_name = fileOutput.getAttribute('file_name') || '';
            form.create_parent_folder = fileOutput.getAttribute('create_parent_folder') === 'Y';
            form.do_not_open_new_file_init = fileOutput.getAttribute('do_not_open_new_file_init') === 'Y';
            form.extention = fileOutput.getAttribute('extention') || '';
            form.split = fileOutput.getAttribute('split') === 'Y';
            form.haspartno = fileOutput.getAttribute('haspartno') === 'Y';
            form.add_date = fileOutput.getAttribute('add_date') === 'Y';
            form.add_time = fileOutput.getAttribute('add_time') === 'Y';
            form.SpecifyFormat = fileOutput.getAttribute('SpecifyFormat') === 'Y';
            form.date_time_format = fileOutput.getAttribute('date_time_format') || '';
            form.add_to_result_filenames = fileOutput.getAttribute('add_to_result_filenames') === 'Y';
            form.append = fileOutput.getAttribute('append') === 'Y';
            form.splitevery = fileOutput.getAttribute('splitevery') || '';
            form.dateformat = fileOutput.getAttribute('dateformat') || '';
            form.encoding = fileOutput.getAttribute('encoding') || '';
            form.is_command = fileOutput.getAttribute('is_command') === 'Y';
            form.servlet_output = fileOutput.getAttribute('servlet_output') === 'Y';
            form.fileNameInField = fileOutput.getAttribute('fileNameInField') === 'Y';
            form.fileNameField = fileOutput.getAttribute('fileNameField') || '';
            form.separator = fileOutput.getAttribute('separator') || '';
            form.enclosure = fileOutput.getAttribute('enclosure') || '';
            form.enclosure_forced = fileOutput.getAttribute('enclosure_forced') === 'Y';
            form.enclosure_fix_disabled = fileOutput.getAttribute('enclosure_fix_disabled') === 'Y';
            form.header = fileOutput.getAttribute('header') === 'Y';
            form.footer = fileOutput.getAttribute('footer') === 'Y';
            form.format = fileOutput.getAttribute('format') || '';
            form.compression = fileOutput.getAttribute('compression') || '';
            form.pad = fileOutput.getAttribute('pad') === 'Y';
            form.fast_dump = fileOutput.getAttribute('fast_dump') === 'Y';
            form.endedLine = fileOutput.getAttribute('endedLine') || '';
            form.fields = JSON.parse(fileOutput.getAttribute('fields')) || [];
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
            const fileOutput = stepElements[0];
            // 更新属性
            fileOutput.setAttribute('label', form.stepName);
            fileOutput.setAttribute('connection', form.connection);
            fileOutput.setAttribute('schema', form.schema);
            fileOutput.setAttribute('table', form.table);
            fileOutput.setAttribute('create', form.create ? 'Y' : 'N');
            fileOutput.setAttribute('truncate', form.truncate ? 'Y' : 'N');
            fileOutput.setAttribute('startnewline', form.startnewline ? 'Y' : 'N');
            fileOutput.setAttribute('file_name', form.file_name);
            fileOutput.setAttribute('create_parent_folder', form.create_parent_folder ? 'Y' : 'N');
            fileOutput.setAttribute('do_not_open_new_file_init', form.do_not_open_new_file_init ? 'Y' : 'N');
            fileOutput.setAttribute('extention', form.extention);
            fileOutput.setAttribute('split', form.split ? 'Y' : 'N');
            fileOutput.setAttribute('haspartno', form.haspartno ? 'Y' : 'N');
            fileOutput.setAttribute('add_date', form.add_date ? 'Y' : 'N');
            fileOutput.setAttribute('add_time', form.add_time ? 'Y' : 'N');
            fileOutput.setAttribute('SpecifyFormat', form.SpecifyFormat ? 'Y' : 'N');
            fileOutput.setAttribute('date_time_format', form.date_time_format);
            fileOutput.setAttribute('add_to_result_filenames', form.add_to_result_filenames ? 'Y' : 'N');
            fileOutput.setAttribute('append', form.append ? 'Y' : 'N');
            fileOutput.setAttribute('splitevery', form.splitevery);
            fileOutput.setAttribute('dateformat', form.dateformat);
            fileOutput.setAttribute('encoding', form.encoding);
            fileOutput.setAttribute('is_command', form.is_command ? 'Y' : 'N');
            fileOutput.setAttribute('servlet_output', form.servlet_output ? 'Y' : 'N');
            fileOutput.setAttribute('fileNameInField', form.fileNameInField ? 'Y' : 'N');
            fileOutput.setAttribute('fileNameField', form.fileNameField);
            fileOutput.setAttribute('separator', form.separator);
            fileOutput.setAttribute('enclosure', form.enclosure);
            fileOutput.setAttribute('enclosure_forced', form.enclosure_forced ? 'Y' : 'N');
            fileOutput.setAttribute('enclosure_fix_disabled', form.enclosure_fix_disabled ? 'Y' : 'N');
            fileOutput.setAttribute('header', form.header ? 'Y' : 'N');
            fileOutput.setAttribute('footer', form.footer ? 'Y' : 'N');
            fileOutput.setAttribute('format', form.format);
            fileOutput.setAttribute('compression', form.compression);
            fileOutput.setAttribute('pad', form.pad ? 'Y' : 'N');
            fileOutput.setAttribute('fast_dump', form.fast_dump ? 'Y' : 'N');
            fileOutput.setAttribute('endedLine', form.endedLine);
            fileOutput.setAttribute('fields', JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(fileOutput);
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


const openFileExplorer = (type) => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.name = path + form.name
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