<template>
    <SzycDialog :dialogVisible="dialogVisible" width="50%" @close="dialogVisible = false" title="转换属性"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <!-- 其他表单项 -->
            <el-tabs type="border-card" v-model="activeTab" class="tabItem mxgraphForm" @tab-click="handleTabClick">
                <div class="dialog-content-wrapper">
                    <el-tab-pane label="转换" name="transform" class="transform">
                        <el-form :model="transform" label-width="130px">
                            <el-form-item label="转换名称：">
                                <el-input v-model="transform.name" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="转换文件：">
                                <el-input v-model="transform.fileName" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="描述：">
                                <el-input v-model="transform.description" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="扩展描述：">
                                <el-input type="textarea" v-model="transform.extended_description"
                                    placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="状态：">
                                <el-select v-model="transform.trans_status" placeholder="请选择">
                                    <el-option label=" " :value=-1></el-option>
                                    <el-option label="草案" :value=1></el-option>
                                    <el-option label="产品" :value=2></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="版本：">
                                <el-input v-model="transform.trans_version" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="目录：">
                                <el-input v-model="transform.directory" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="创建者：">
                                <el-input v-model="transform.created_user" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="创建时间：">
                                <el-input v-model="transform.created_date" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="最近修改的用户：">
                                <el-input v-model="transform.modified_user" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="最近修改时间：">
                                <el-input v-model="transform.modified_date" placeholder="请输入"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="命名参数" name="parameters" class="parameters">
                        <GenericTable v-model="tableData" :columns="parameterColumns" :default-row="parameterDefaultRow"
                            ref="parameterTableRef" />
                    </el-tab-pane>
                    <el-tab-pane label="日志" name="log">
                        <div class="logContent">
                            <el-menu default-active="transform" @select="handleMenuSelect" class="log-menu">
                                <el-menu-item index="transform">转换</el-menu-item>
                                <el-menu-item index="steps">步骤</el-menu-item>
                                <el-menu-item index="run">运行</el-menu-item>
                                <el-menu-item index="logChannel">日志通道</el-menu-item>
                                <el-menu-item index="Metrics">Metrics</el-menu-item>
                            </el-menu>
                            <div style="flex: 1; margin-left: 20px;overflow-y: auto;" class="log-form-container">
                                <el-form :model="activeFormModel" label-width="180px">
                                    <el-form-item label="日志数据库连接：" v-if="shouldShowField('connection')">
                                        <el-input v-model="activeFormModel.connection"></el-input>
                                    </el-form-item>
                                    <el-form-item label="日志表模式：" v-if="shouldShowField('schema')">
                                        <el-input v-model="activeFormModel.schema"></el-input>
                                    </el-form-item>
                                    <el-form-item label="日志表：" v-if="shouldShowField('table')">
                                        <el-input v-model="activeFormModel.table"></el-input>
                                    </el-form-item>
                                    <el-form-item label="日志记录间隔时间(秒)：" v-if="shouldShowField('interval')">
                                        <el-input v-model="activeFormModel.interval"></el-input>
                                    </el-form-item>
                                    <el-form-item label="日志记录过时时间(天)：" v-if="shouldShowField('timeout_days')">
                                        <el-input v-model="activeFormModel.timeout_days"></el-input>
                                    </el-form-item>
                                    <el-form-item label="在内存中保存的日志行数：" v-if="shouldShowField('size_limit_lines')">
                                        <el-input v-model="activeFormModel.size_limit_lines"></el-input>
                                    </el-form-item>
                                </el-form>
                                <GenericTable v-model="activeFormModel.field" :columns="logColumns"
                                    :default-row="logDefaultRow" ref="dependencyTableRef" :show-index="false" />
                            </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="日期" name="date">
                        <el-form :model="dateform" label-width="160px">
                            <el-form-item label="最大日期数据库连接：">
                                <el-input v-model="dateform.connection"></el-input>
                            </el-form-item>
                            <el-form-item label="最大日期表：">
                                <el-input v-model="dateform.table"></el-input>
                            </el-form-item>
                            <el-form-item label="最大日期字段：">
                                <el-input v-model="dateform.field"></el-input>
                            </el-form-item>
                            <el-form-item label="最大日期偏移(秒)：">
                                <el-input v-model="dateform.offset"></el-input>
                            </el-form-item>
                            <el-form-item label="最大日期区别(秒)：">
                                <el-input v-model="dateform.maxdiff"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="依赖" name="dependence" class="parameters">
                        <GenericTable v-model="detableData" :columns="dependencyColumns"
                            :default-row="dependencyDefaultRow" ref="dependencyTableRef" />
                    </el-tab-pane>
                    <el-tab-pane label="杂项" name="miscellaneous" class="miscellaneous">
                        <el-form :model="miscellaneous" label-width="225px">
                            <el-form-item label="记录集合里的记录数：">
                                <el-input v-model="miscellaneous.size_rowset"></el-input>
                            </el-form-item>
                            <el-form-item label="转换时是否在日志中记录反馈行？">
                                <el-checkbox v-model="miscellaneous.feedback_shown"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="每个反馈行的处理记录数：">
                                <el-input v-model="miscellaneous.feedback_size"></el-input>
                            </el-form-item>
                            <el-form-item label="使用唯一连接：">
                                <el-checkbox v-model="miscellaneous.unique_connections"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="共享对象文件：">
                                <el-input v-model="miscellaneous.shared_objects_file"></el-input>
                            </el-form-item>
                            <el-form-item label="管理线程优先级：">
                                <el-checkbox v-model="miscellaneous.using_thread_priorities"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="转换引擎类型：">
                                <el-input v-model="miscellaneous.trans_type"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="监控" name="monitor" class="miscellaneous">
                        <el-form :model="monitor" label-width="200px">
                            <el-form-item label="开启步骤性能监控？">
                                <el-checkbox v-model="monitor.capture_step_performance"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="步骤性能测量间隔（毫秒）：">
                                <el-input v-model="monitor.step_performance_capturing_delay"
                                    placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="内存中最大的快照数量：">
                                <el-input v-model="monitor.step_performance_capturing_size_limit"
                                    placeholder="请输入"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </div>
            </el-tabs>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>


    </SzycDialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import GenericTable from './tools/GenericTable.vue'

const dialogVisible = ref(false)
const activeTab = ref('transform')

// 添加响应式变量来存储当前活动的表单model
const activeFormModel = ref({});

// 日志-转换表单
const transLogTable = reactive({
    connection: "",
    schema: "",
    table: "",
    interval: "",
    timeout_days: "",
    size_limit_lines: "",
    field: []
})

// 日志-步骤表单
const stepLogTable = reactive({
    connection: "",
    schema: "",
    table: "",
    timeout_days: "",
    field: []
})

// 日志-运行表单
const performanceLogTable = reactive({
    connection: "",
    schema: "",
    table: "",
    interval: "",
    timeout_days: "",
    field: []
})

// 日志-日志通道
const channelLogTable = reactive({
    connection: "",
    schema: "",
    table: "",
    timeout_days: "",
    field: []
})

// 日志-Metrics
const metricsLogTable = reactive({
    connection: "",
    schema: "",
    table: "",
    timeout_days: "",
    field: []
})

// 计算属性，用于判断字段是否存在，从而决定是否显示对应输入框
const shouldShowField = computed(() => {
    return (fieldName) => {
        return fieldName in activeFormModel.value;
    }
});

const handleMenuSelect = (index) => {
    // 根据菜单项索引切换表单绑定的model对象
    switch (index) {
        case 'transform':
            // 使用转换相关的model数据
            activeFormModel.value = transLogTable;
            logColumns.value = logColumnsdefault.value
            break;
        case 'steps':
            // 使用步骤相关的model数据
            activeFormModel.value = stepLogTable;
            logColumns.value = logColumnsWithoutSubject.value
            break;
        case 'run':
            // 使用运行相关的model数据
            activeFormModel.value = performanceLogTable;
            logColumns.value = logColumnsWithoutSubject.value
            break;
        case 'logChannel':
            // 使用日志通道相关的model数据
            activeFormModel.value = channelLogTable;
            logColumns.value = logColumnsWithoutSubject.value
            break;
        case 'Metrics':
            // 使用Metrics相关的model数据
            activeFormModel.value = metricsLogTable;
            logColumns.value = logColumnsWithoutSubject.value
            break;
        default:
            activeFormModel.value = transLogTable;
            logColumns.value = logColumnsdefault.value
            break;
    }
}

// 转换模块的表单
const transform = reactive({
    name: '',
    fileName: '',
    description: '',
    extended_description: '',
    trans_status: 0,
    trans_version: '',
    directory: '',
    created_user: '',
    created_date: '',
    modified_user: '',
    modified_date: ''
})

// 日期表单
const dateform = reactive({
    connection: '',
    table: '',
    field: '',
    offset: '',
    maxdiff: ''
})

// 杂项表单
const miscellaneous = reactive({
    size_rowset: 10000,
    feedback_shown: 'N',
    feedback_size: 50000,
    unique_connections: 'N',
    shared_objects_file: '',
    using_thread_priorities: 'N',
    trans_type: ''
})

// 监控
const monitor = reactive({
    capture_step_performance: 'N',
    step_performance_capturing_delay: 1000,
    step_performance_capturing_size_limit: 100
})

// 命名参数的表格
const tableData = ref([
    { name: '', default_value: '', description: '' },
])

// 依赖表格
const detableData = ref([
    { connection: '', table: '', field: '' },
])

// 表格列配置
const parameterColumns = ref([
    { prop: 'name', label: '命名参数', width: '180' },
    { prop: 'default_value', label: '默认值', width: '180' },
    { prop: 'description', label: '描述' }
])

const dependencyColumns = ref([
    { prop: 'connection', label: '数据库连接', width: '180' },
    { prop: 'table', label: '表', width: '180' },
    { prop: 'field', label: '字段' }
])

const logColumns = ref([])

const logColumnsdefault = ref([
    { prop: 'enabled', label: '启用', width: '50', type: 'checkbox' },
    { prop: 'name', label: '字段名称', width: '150' },
    { prop: 'subject', label: '步骤名称', width: '150' },
    { prop: 'description', label: '字段描述' }
])

const logColumnsWithoutSubject = ref([
    { prop: 'enabled', label: '启用', width: '50', type: 'checkbox' },
    { prop: 'name', label: '字段名称', width: '200' },
    { prop: 'description', label: '字段描述' }
])

// 默认行数据
const parameterDefaultRow = ref({ name: '', default_value: '', description: '' })
const dependencyDefaultRow = ref({ connection: '', table: '', field: '' })
const logDefaultRow = ref({ enabled: false, name: '', subject: '', description: '' })

// 解码字段项中的URL编码字符（如%20）
const decodeFieldItem = (item) => {
    if (typeof item === 'object' && item !== null) {
        const decodedItem = {};
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                if (typeof item[key] === 'string') {
                    try {
                        // 解码URL编码的字符，如%20等
                        decodedItem[key] = decodeURIComponent(item[key]);
                    } catch (e) {
                        // 如果解码失败，保留原始值
                        decodedItem[key] = item[key];
                    }
                } else {
                    decodedItem[key] = item[key];
                }
            }
        }
        return decodedItem;
    }
    return item;
};

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let onSaveCallback = null

// 添加从XML数据填充表单的方法（不打开对话框）
const populateFromXml = (xmlDocument) => {
    // 查找Info元素
    const infoElements = xmlDocument.getElementsByTagName('Info');
    if (infoElements.length > 0) {
        const infoElement = infoElements[0];

        // 填充转换表单数据
        transform.name = infoElement.getAttribute('name') || '';
        transform.fileName = infoElement.getAttribute('fileName') || '';
        transform.description = infoElement.getAttribute('description') || '';
        transform.extended_description = infoElement.getAttribute('extended_description') || '';
        transform.trans_status = parseInt(infoElement.getAttribute('trans_status')) || 0;
        transform.trans_version = infoElement.getAttribute('trans_version') || '';
        transform.directory = infoElement.getAttribute('directory') || '';
        transform.created_user = infoElement.getAttribute('created_user') || '';
        transform.created_date = infoElement.getAttribute('created_date') || '';
        transform.modified_user = infoElement.getAttribute('modified_user') || '';
        transform.modified_date = infoElement.getAttribute('modified_date') || '';
        transform.clusterSchemas = JSON.parse(infoElement.getAttribute('clusterSchemas')) || [];
        transform.partitionSchemas = JSON.parse(infoElement.getAttribute('partitionSchemas')) || [];
        console.log("fdddd",transform);
        // 填充日期表单数据
        const maxdateAttr = infoElement.getAttribute('maxdate');
        if (maxdateAttr) {
            try {
                const maxdateData = JSON.parse(maxdateAttr);
                Object.assign(dateform, maxdateData);
            } catch (e) {
                console.warn('解析maxdate属性失败:', e);
            }
        }

        // 填充监控表单数据
        monitor.capture_step_performance = infoElement.getAttribute('capture_step_performance') === 'Y' ? 'Y' : 'N';
        monitor.step_performance_capturing_delay = infoElement.getAttribute('step_performance_capturing_delay') || 1000;
        monitor.step_performance_capturing_size_limit = infoElement.getAttribute('step_performance_capturing_size_limit') || 100;

        // 填充杂项表单数据
        miscellaneous.size_rowset = infoElement.getAttribute('size_rowset') || 10000;
        miscellaneous.feedback_shown = infoElement.getAttribute('feedback_shown') === 'Y' ? 'Y' : 'N';
        miscellaneous.feedback_size = infoElement.getAttribute('feedback_size') || 50000;
        miscellaneous.unique_connections = infoElement.getAttribute('unique_connections') === 'Y' ? 'Y' : 'N';
        miscellaneous.shared_objects_file = infoElement.getAttribute('shared_objects_file') || '';
        miscellaneous.using_thread_priorities = infoElement.getAttribute('using_thread_priorities') === 'Y' ? 'Y' : 'N';
        miscellaneous.trans_type = infoElement.getAttribute('trans_type') || '';

        // 填充日志表格数据（如果存在）
        try {
            if (infoElement.getAttribute('transLogTable')) {
                transLogTable.field = JSON.parse(infoElement.getAttribute('transLogTable')).fields || [];
                transLogTable.field = transLogTable.field.map(item => {
                    return decodeFieldItem(item);
                });
            }
            if (infoElement.getAttribute('stepLogTable')) {
                stepLogTable.field = JSON.parse(infoElement.getAttribute('stepLogTable')).fields || [];
                stepLogTable.field = stepLogTable.field.map(item => {
                    return decodeFieldItem(item);
                });
            }
            if (infoElement.getAttribute('performanceLogTable')) {
                performanceLogTable.field = JSON.parse(infoElement.getAttribute('performanceLogTable')).fields || [];
                performanceLogTable.field = performanceLogTable.field.map(item => {
                    return decodeFieldItem(item);
                });
            }
            if (infoElement.getAttribute('channelLogTable')) {
                channelLogTable.field = JSON.parse(infoElement.getAttribute('channelLogTable')).fields || [];
                channelLogTable.field = channelLogTable.field.map(item => {
                    return decodeFieldItem(item);
                });
            }
            if (infoElement.getAttribute('metricsLogTable')) {
                metricsLogTable.field = JSON.parse(infoElement.getAttribute('metricsLogTable')).fields || [];
                metricsLogTable.field = metricsLogTable.field.map(item => {
                    return decodeFieldItem(item);
                });
            }
        } catch (e) {
            console.warn('解析日志表格数据出错:', e);
        }
    }

    // 查找Parameter元素（命名参数）
    const parameterElements = xmlDocument.getElementsByTagName('Parameter');
    if (parameterElements.length > 0) {
        const parameters = [];
        for (let i = 0; i < parameterElements.length; i++) {
            const param = parameterElements[i];
            parameters.push({
                name: param.getAttribute('name') || '',
                default_value: param.getAttribute('defaultValue') || '',
                description: param.getAttribute('description') || ''
            });
        }
        tableData.value = parameters;
    } else {
        // 如果没有Parameter元素，检查Info元素中是否有相关属性
        const infoElements = xmlDocument.getElementsByTagName('Info');
        if (infoElements.length > 0) {
            const infoElement = infoElements[0];
            try {
                if (infoElement.getAttribute('parameters')) {
                    tableData.value = JSON.parse(infoElement.getAttribute('parameters')) || [];
                }
            } catch (e) {
                console.warn('解析参数数据出错:', e);
            }
        }
    }

    // 查找Dependency元素（依赖）
    const dependencyElements = xmlDocument.getElementsByTagName('Dependency');
    if (dependencyElements.length > 0) {
        const dependencies = [];
        for (let i = 0; i < dependencyElements.length; i++) {
            const dep = dependencyElements[i];
            dependencies.push({
                connection: dep.getAttribute('connection') || '',
                table: dep.getAttribute('table') || '',
                field: dep.getAttribute('field') || ''
            });
        }
        detableData.value = dependencies;
    } else {
        // 如果没有Dependency元素，检查Info元素中是否有相关属性
        const infoElements = xmlDocument.getElementsByTagName('Info');
        if (infoElements.length > 0) {
            const infoElement = infoElements[0];
            try {
                if (infoElement.getAttribute('dependencies')) {
                    detableData.value = JSON.parse(infoElement.getAttribute('dependencies')) || [];
                }
            } catch (e) {
                console.warn('解析依赖数据出错:', e);
            }
        }
    }
}

const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
    }
    // 保存回调函数
    if (data && data.onSave) {
        onSaveCallback = data.onSave
    }

    // 如果传入了XML数据，则填充表单
    if (data && data.xmlData) {
        populateFromXml(data.xmlData);
    }

    dialogVisible.value = true
}

const handleConfirm = () => {
    if (currentCell && currentGraph) {
        currentGraph.getModel().setValue(currentCell, form.stepName)
    }
    // 如果有保存回调函数，则调用它来处理info元素的创建
    if (onSaveCallback) {
        onSaveCallback(transform)
    }

    dialogVisible.value = false
}

// 创建带有参数的info元素
const createInfoElementWithParams = (doc, params, databases = []) => {
    const infoElement = doc.createElement('Info')
    transform.name = params.transName
    // 设置属性
    // 转换的属性
    infoElement.setAttribute('id', "1")
    infoElement.setAttribute('name', transform.name)
    infoElement.setAttribute('fileName', transform.fileName)
    infoElement.setAttribute('description', transform.description)
    infoElement.setAttribute('extended_description', transform.extended_description)
    infoElement.setAttribute('trans_status', transform.trans_status)
    infoElement.setAttribute('trans_version', transform.trans_version)
    infoElement.setAttribute('directory', transform.directory)
    infoElement.setAttribute('created_user', transform.created_user)
    infoElement.setAttribute('created_date', transform.created_date)
    infoElement.setAttribute('modified_user', transform.modified_user)
    infoElement.setAttribute('modified_date', transform.modified_date)

    infoElement.setAttribute('clusterSchemas', JSON.stringify(transform.clusterSchemas))
    infoElement.setAttribute('partitionSchemas', JSON.stringify(transform.partitionSchemas))

    // 日期属性
    infoElement.setAttribute('maxdate', JSON.stringify(dateform))
    // 命名参数的属性

    // 监控属性
    infoElement.setAttribute('capture_step_performance', monitor.capture_step_performance)
    infoElement.setAttribute('step_performance_capturing_delay', monitor.step_performance_capturing_delay)
    infoElement.setAttribute('step_performance_capturing_size_limit', monitor.step_performance_capturing_size_limit)

    // 杂项属性
    infoElement.setAttribute('size_rowset', miscellaneous.size_rowset)
    infoElement.setAttribute('feedback_shown', miscellaneous.feedback_shown)
    infoElement.setAttribute('feedback_size', miscellaneous.feedback_size)
    infoElement.setAttribute('unique_connections', miscellaneous.unique_connections)
    infoElement.setAttribute('shared_objects_file', miscellaneous.shared_objects_file)
    infoElement.setAttribute('using_thread_priorities', miscellaneous.using_thread_priorities)
    infoElement.setAttribute('trans_type', miscellaneous.trans_type)

    // 日志表格数组
    infoElement.setAttribute('transLogTable', JSON.stringify({ fields: transLogTable.field }))
    infoElement.setAttribute('stepLogTable', JSON.stringify({ fields: stepLogTable.field }))
    infoElement.setAttribute('performanceLogTable', JSON.stringify({ fields: performanceLogTable.field }))
    infoElement.setAttribute('channelLogTable', JSON.stringify({ fields: channelLogTable.field }))
    infoElement.setAttribute('metricsLogTable', JSON.stringify({ fields: metricsLogTable.field }))

    infoElement.setAttribute('databases', JSON.stringify(databases))

    // 创建mxCell子元素
    const infoMxCell = doc.createElement('mxCell')
    infoMxCell.setAttribute('parent', "0")
    infoElement.appendChild(infoMxCell)

    return infoElement
}

// 处理 tab 点击事件，获取激活的 tab 名称
const handleTabClick = (tabPane, event) => {
    console.log('激活的 tab 名称:', tabPane.props.name);
    if (tabPane.props.name == "log") {
        activeFormModel.value = transLogTable
        logColumns.value = logColumnsdefault.value
        console.log(activeFormModel.value);
    }
}

// 暴露方法给父组件使用
defineExpose({
    openDialog,
    createInfoElementWithParams,
    populateFromXml  // 暴露新的方法，用于仅填充数据不打开对话框
})
</script>

<style lang="scss" scoped>
.dialog-content-wrapper {
    height: 550px;
    overflow-y: auto;
}

.tabItem {
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

    .parameters {
        :deep(.el-table .el-table__cell) {
            padding: 0 !important;
        }

        :deep(.el-table .cell) {
            padding: 0 !important;
        }

        :deep(.el-input__wrapper) {
            border: none !important;
        }
    }

    .logContent {
        display: flex;
        height: 550px;

        .log-menu {
            height: 100%;
            overflow-y: auto;
        }

        .log-form-container {
            height: 100%;
            overflow-y: auto;
        }

        :deep(.el-menu) {
            font-size: 14px !important;
        }

        :deep(.el-menu-item) {
            font-size: 14px !important;
            height: 30px;
        }

        :deep(.el-form) {
            font-size: 14px !important;
        }
    }
}
</style>