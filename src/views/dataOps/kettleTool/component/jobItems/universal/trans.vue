<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="closeDialog" title="转换" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="card" class="tabItem" v-model="activeTab">
                        <div class="dialog-content-wrapper">
                            <!-- 转换设置 -->
                            <el-tab-pane label="转换设置" name="tranSettings">
                                <el-form :model="form" label-width="auto" class="job-settings-form">
                                    <div class="radio-group-wrapper">
                                        <div class="radio-input-wrapper" style="display: flex;">
                                            <el-radio label="转换文件名" v-model="exec_filename_radio"></el-radio>
                                            <el-input v-model="form.filename" placeholder="请输入转换文件名"
                                                :disabled="exec_filename_radio !== '转换文件名'" class="input-with-button">
                                                <template #append>
                                                    <el-button @click="openFileExplorer('1')"
                                                        :disabled="exec_filename_radio !== '转换文件名'">选择</el-button>
                                                </template>
                                            </el-input>
                                        </div>

                                        <div class="radio-input-wrapper">
                                            <el-radio label="通过目录与名称指定转换" v-model="exec_filename_radio">
                                            </el-radio>
                                            <el-input v-model="form.directory" placeholder="目录"
                                                :disabled="exec_filename_radio !== '通过目录与名称指定转换'" />
                                            <el-input v-model="form.transname" placeholder="转换名"
                                                :disabled="exec_filename_radio !== '通过目录与名称指定转换'"
                                                style="margin-top: 10px;">
                                                <template #append>
                                                    <el-button @click="openFileExplorer('2')"
                                                        :disabled="exec_filename_radio !== '通过目录与名称指定转换'">选择</el-button>
                                                </template>
                                            </el-input>
                                        </div>

                                        <div class="radio-input-wrapper" style="display: flex;">
                                            <el-radio label="通过引用指定转换" v-model="exec_filename_radio">
                                            </el-radio>
                                            <el-input v-model="form.referenceName" placeholder="引用名称"
                                                :disabled="exec_filename_radio !== '通过引用指定转换'"
                                                class="input-with-button">
                                                <template #append>
                                                    <el-button @click="openFileExplorer('3')"
                                                        :disabled="exec_filename_radio !== '通过引用指定转换'">选择</el-button>
                                                </template>
                                            </el-input>
                                        </div>
                                    </div>
                                </el-form>
                            </el-tab-pane>

                            <!-- 高级设置 -->
                            <el-tab-pane label="高级" name="advancedSettings">
                                <el-form :model="form" label-width="110px">
                                    <el-form-item>
                                        <el-checkbox v-model="form.arg_from_previous" label="复制上一步结果到位置参数" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.params_from_previous" label="复制上一步结果到命名参数" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.exec_per_row" label="执行每一个输入行" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.clear_rows" label="在执行前清除结果行列表" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.clear_files" label="在执行前清除结果文件列表" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.cluster" label="在集群模式下运行这个转换" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.logging_remote_work"
                                            label="Log remote execution locally" :disabled="!form.cluster" />
                                    </el-form-item>
                                    <el-form-item label="远程从服务器">
                                        <el-select v-model="form.slave_server_name" placeholder="请选择远程从服务器"
                                            style="width: 100%" :disabled="form.cluster">
                                            <el-option v-for="item in serverList" :key="item.name" :label="item.name"
                                                :value="item.name" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.wait_until_finished" label="等待远程转换执行结束"
                                            :disabled="!form.slave_server_name || form.cluster" />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox v-model="form.follow_abort_remote" label="本地转换终止时远程转换也通知终止"
                                            :disabled="!form.slave_server_name || form.cluster" />
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>

                            <!-- 日志设置 -->
                            <el-tab-pane label="日志设置" name="logSettings">
                                <el-form :model="form" label-width="110px" class="log-settings-form">
                                    <el-form-item>
                                        <el-checkbox v-model="form.set_logfile" label="指定日志文件" />
                                    </el-form-item>

                                    <el-form-item>
                                        <el-checkbox v-model="form.set_append_logfile" label="添加到日志文件尾"
                                            :disabled="!form.set_logfile" />
                                    </el-form-item>

                                    <el-form-item label="日志文件名">
                                        <el-input v-model="form.logfile" :disabled="!form.set_logfile"
                                            class="input-with-button">
                                            <template #append>
                                                <el-button @click="openFileExplorer('4')"
                                                    :disabled="!form.set_logfile">选择</el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>

                                    <el-form-item>
                                        <el-checkbox v-model="form.create_parent_folder" label="创建父文件夹"
                                            :disabled="!form.set_logfile" />
                                    </el-form-item>

                                    <el-form-item label="日志文件后缀名">
                                        <el-input v-model="form.logext" :disabled="!form.set_logfile" />
                                    </el-form-item>

                                    <el-form-item>
                                        <el-checkbox v-model="form.add_date" label="日志文件包含日期"
                                            :disabled="!form.set_logfile" />
                                    </el-form-item>

                                    <el-form-item>
                                        <el-checkbox v-model="form.add_time" label="日志文件包含时间"
                                            :disabled="!form.set_logfile" />
                                    </el-form-item>

                                    <el-form-item label="日志级别">
                                        <el-select v-model="form.loglevel" placeholder="请选择日志级别" style="width: 100%"
                                            :disabled="!form.set_logfile">
                                            <el-option v-for="item in logLevelList" :key="item.code" :label="item.desc"
                                                :value="item.code" />
                                        </el-select>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>

                            <!-- 位置参数 -->
                            <el-tab-pane label="位置参数" name="positionArguments">
                                <RightClickTable ref="fileTableRef" v-model="form.arguments" :columns="argumentsColumns"
                                    :showIndex="true" :height="200" style="width: 100%">
                                </RightClickTable>
                            </el-tab-pane>

                            <!-- 命名参数 -->
                            <el-tab-pane label="命名参数" name="namedParameters">
                                <RightClickTable v-model="form.parameters" :columns="parametersColumns"
                                    :showIndex="true" :height="200" style="width: 100%">
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
    <transOrJob v-model:visible="showTransOrJob" :loadElement="1" @ok="handleTransOrJobSelected" />

</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { ElMessage } from 'element-plus'
import FileExplorerWindow from '../../formItems/tools/FileExplorerWindow.vue'
import transOrJob from '../../formItems/tools/transOrJob.vue'
import RightClickTable from "../../formItems/tools/rightClickTable.vue";
import { systemLogLevel } from "@/api/kettleApi/index";

const dialogVisible = ref(false)
const showFileExplorer = ref(false)
const showTransOrJob = ref(false)
const showRepositoryExplorer = ref(false)
const currentFileExplorerType = ref(null)
const activeTab = ref('tranSettings')
const form = reactive({
    stepName: '',
})
const specification_method = ref("")

const charsetOptionList = ref([])
const logLevelList = ref([])

const { mxUtils } = window.mx;
const emit = defineEmits(['update-step'])

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let currentXml = null
// 获取完整xml
let allXml = null
let jobName = ref("")

const openDialog = (data) => {
    console.log("openDialog", data);
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        currentXml = data.xml
        allXml = data.allXml
        jobName.value = data.jobName
        form.stepName = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getServerList(allXml)
        getLogLevel()
    }
    dialogVisible.value = true
}

const closeDialog = () => {
    Object.assign(form, {
        stepName: '',
    });
    dialogVisible.value = false
}

const argumentsColumns = computed(() => [
    {
        prop: 'name',
        label: '位置参数',
    },
]);

const parametersColumns = computed(() => [
    {
        prop: 'name',
        label: '命名参数',
    },
    {
        prop: 'stream_name',
        label: '流列名',
    },
    {
        prop: 'value',
        label: '值',
    },
]);

const exec_filename_radio = computed({
    get: () => {
        return form.exec_filename;
    },
    set: (value) => {
        form.exec_filename = value;
        // 根据选中的值设置specification_method
        switch (value) {
            case '转换文件名':
                specification_method.value = 'filename';
                break;
            case '通过目录与名称指定转换':
                specification_method.value = 'rep_name';
                break;
            case '通过引用指定转换':
                specification_method.value = 'rep_ref';
                break;
            default:
                specification_method.value = '';
        }
    }
});

const serverList = ref([])
const getServerList = (data) => {
    let xmlDoc = mxUtils.parseXml(allXml);
    serverList.value = JSON.parse(xmlDoc.getElementsByTagName('root')[0].getElementsByTagName("Info")[0].getAttribute('slaveServers'));
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const trans = stepElements[0];
            form.stepName = trans.getAttribute('label') || '';

            specification_method.value = trans.getAttribute('specification_method') || '';
            switch (specification_method.value) {
                case 'filename':
                    form.exec_filename = '转换文件名';
                    form.filename = trans.getAttribute('filename') || '';
                    break;
                case 'rep_name':
                    form.exec_filename = '通过目录与名称指定转换';
                    form.directory = trans.getAttribute('directory') || '';
                    form.transname = trans.getAttribute('transname') || '';
                    break;
                case 'rep_ref':
                    form.exec_filename = '通过引用指定转换';
                    form.trans_object_id = trans.getAttribute('trans_object_id') || '';
                    form.referenceName = trans.getAttribute('referenceName') || '';
                    break;
                default:
                    form.exec_filename = ''; // 默认值
            }

            form.specification_method = specification_method.value
            form.arg_from_previous = trans.getAttribute('arg_from_previous') === 'Y'
            form.params_from_previous = trans.getAttribute('params_from_previous') === 'Y'
            form.exec_per_row = trans.getAttribute('exec_per_row') === 'Y'
            form.clear_rows = trans.getAttribute('clear_rows') === 'Y'
            form.clear_files = trans.getAttribute('clear_files') === 'Y'
            form.cluster = trans.getAttribute('cluster') === 'Y'
            form.logging_remote_work = trans.getAttribute('logging_remote_work') === 'Y'
            form.slave_server_name = trans.getAttribute('slave_server_name') || '';
            form.wait_until_finished = trans.getAttribute('wait_until_finished') === 'Y'
            form.follow_abort_remote = trans.getAttribute('follow_abort_remote') === 'Y'
            form.set_logfile = trans.getAttribute('set_logfile') === 'Y'
            form.set_append_logfile = trans.getAttribute('set_append_logfile') === 'Y'
            form.logfile = trans.getAttribute('logfile') || '';
            form.create_parent_folder = trans.getAttribute('create_parent_folder') === 'Y'
            form.logext = trans.getAttribute('logext') || '';
            form.add_date = trans.getAttribute('add_date') === 'Y'
            form.add_time = trans.getAttribute('add_time') === 'Y'
            form.loglevel = trans.getAttribute('loglevel') || '';
            form.arguments = JSON.parse(trans.getAttribute('arguments')) || []
            form.parameters = JSON.parse(trans.getAttribute('parameters')) || []
        }
        console.log("specification_method.value", specification_method.value, "form", form);
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
        const stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const trans = stepElements[0];
            // 更新属性
            trans.setAttribute('label', form.stepName);
            if (specification_method.value === 'filename') {
                trans.setAttribute('filename', form.filename || '');
            } else if (specification_method.value === 'rep_name') {
                trans.setAttribute('directory', form.directory || '');
                trans.setAttribute('transname', form.transname || '');
            } else if (specification_method.value === 'rep_ref') {
                trans.setAttribute('trans_object_id', form.trans_object_id || '');
                trans.setAttribute('referenceName', form.referenceName || '');
            }
            trans.setAttribute('specification_method', specification_method.value);
            trans.setAttribute('arg_from_previous', form.arg_from_previous ? 'Y' : 'N');
            trans.setAttribute('params_from_previous', form.params_from_previous ? 'Y' : 'N');
            trans.setAttribute('exec_per_row', form.exec_per_row ? 'Y' : 'N');
            trans.setAttribute('clear_rows', form.clear_rows ? 'Y' : 'N');
            trans.setAttribute('clear_files', form.clear_files ? 'Y' : 'N');
            trans.setAttribute('cluster', form.cluster ? 'Y' : 'N');
            trans.setAttribute('logging_remote_work', form.logging_remote_work ? 'Y' : 'N');
            trans.setAttribute('slave_server_name', form.slave_server_name || '');
            trans.setAttribute('wait_until_finished', form.wait_until_finished ? 'Y' : 'N');
            trans.setAttribute('follow_abort_remote', form.follow_abort_remote ? 'Y' : 'N');
            trans.setAttribute('set_logfile', form.set_logfile ? 'Y' : 'N');
            trans.setAttribute('set_append_logfile', form.set_append_logfile ? 'Y' : 'N');
            trans.setAttribute('logfile', form.logfile || '');
            trans.setAttribute('create_parent_folder', form.create_parent_folder ? 'Y' : 'N');
            trans.setAttribute('logext', form.logext || '');
            trans.setAttribute('add_date', form.add_date ? 'Y' : 'N');
            trans.setAttribute('add_time', form.add_time ? 'Y' : 'N');
            trans.setAttribute('loglevel', form.loglevel || '');
            trans.setAttribute('arguments', JSON.stringify(form.arguments));
            trans.setAttribute('parameters', JSON.stringify(form.parameters));

            // 返回更新后的XML
            return mxUtils.getPrettyXml(trans);
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
    if (type === '2') {
        showTransOrJob.value = true
        return
    }
    currentFileExplorerType.value = type
    showFileExplorer.value = true
}

const handleTransOrJobSelected = (directory, fileName) => {
    form.directory = directory
    form.transname = fileName
}


const handleFileSelected = (path) => {
    // 根据不同的类型填充不同的字段
    if (currentFileExplorerType.value === '1' && exec_filename_radio.value === '转换文件名') {
        form.filename = path
    } else if (currentFileExplorerType.value === '2' && exec_filename_radio.value === '通过目录与名称指定转换') {
        const lastSlashIndex = path.lastIndexOf('/')
        if (lastSlashIndex > 0) {
            form.directory = path.substring(0, lastSlashIndex)
            form.transname = path.substring(lastSlashIndex + 1)
        } else {
            form.transname = path
        }
    } else if (currentFileExplorerType.value === '3' && exec_filename_radio.value === '通过引用指定转换') {
        form.referenceName = path
    } else if (currentFileExplorerType.value === '4') {
        form.logfile = path
    }

    currentFileExplorerType.value = null // 清除当前类型
}

const getLogLevel = async () => {
    try {
        let res = await systemLogLevel();
        logLevelList.value = res
    } catch {
        ElMessage.error("获取日志级别失败")
    }
}

// 监听集群复选框变化，控制相关控件的启用/禁用
watch(() => form.cluster, (newValue) => {
    if (newValue) {
        // 当启用集群模式时，禁用远程服务器和相关选项
        form.logging_remote_work = true
        // 禁用远程服务器选择
    } else {
        // 当禁用集群模式时，启用远程服务器选择
        form.logging_remote_work = false
    }
})

// 监听日志文件复选框变化
watch(() => form.set_logfile, (newValue) => {
    if (!newValue) {
        // 如果不设置日志文件，则禁用相关选项
        form.set_append_logfile = false
        form.create_parent_folder = false
        form.add_date = false
        form.add_time = false
    }
})

// 监听远程服务器选择变化
watch(() => form.slave_server_name, (newValue) => {
    if (!newValue) {
        // 如果没有选择远程服务器，则禁用相关选项
        form.wait_until_finished = false
        form.follow_abort_remote = false
    }
})

watch(specification_method.value, (newValue) => {
    switch (newValue) {
        case 'filename':
            form.exec_filename = '转换文件名';
            break;
        case 'rep_name':
            form.exec_filename = '通过目录与名称指定转换';
            break;
        case 'rep_ref':
            form.exec_filename = '通过引用指定转换';
            break;
        default:
            form.exec_filename = '';
    }
}, {
    immediate: true
})

onMounted(() => {

})

// 暴露方法给父组件使用
defineExpose({
    openDialog
})
</script>

<style lang="scss" scoped>
.dialog-content-wrapper {
    height: 400px;
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

.radio-group-wrapper {
    padding: 0 10px;
}

.radio-input-wrapper {
    border: 1px solid #ccc;
    padding: 10px 20px;
    margin: 10px 0;
    border-radius: 4px;
}
</style>