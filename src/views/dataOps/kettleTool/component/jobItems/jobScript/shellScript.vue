<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="SQL"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div>
                <el-form :model="form" label-width="100px" class="mxgraphForm">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-tab-pane label="General" name="general">
                            <el-form label-position="right" label-width="200px">
                                <el-form-item label="Insert Script:">
                                    <el-checkbox v-model="form.insertScript"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="脚本文件名:">
                                    <el-input v-model="form.fileName" placeholder="" :disabled="!form.insertScript">
                                        <template #append>
                                            <el-button @click="showFileExplorer = true" type="primary"
                                                :disabled="!form.insertScript">浏览</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="工作路径:">
                                    <el-input v-model="form.work_directory" placeholder=""></el-input>
                                </el-form-item>
                                <el-divider content-position="left">日志设置</el-divider>
                                <el-form-item label="指定日志文件:">
                                    <el-checkbox v-model="form.set_logfile"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="追加日志文件:">
                                    <el-checkbox v-model="form.set_append_logfile"
                                        :disabled="!form.set_logfile"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="日志文件名称:">
                                    <el-input v-model="form.logfile" placeholder=""
                                        :disabled="!form.set_logfile"></el-input>
                                </el-form-item>
                                <el-form-item label="日志文件扩展名:">
                                    <el-input v-model="form.logext" placeholder=""
                                        :disabled="!form.set_logfile"></el-input>
                                </el-form-item>
                                <el-form-item label="日志文件中包含日期:">
                                    <el-checkbox v-model="form.add_date" :disabled="!form.set_logfile"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="日志文件中包含时间:">
                                    <el-checkbox v-model="form.add_time" :disabled="!form.set_logfile"></el-checkbox>
                                </el-form-item>
                                <el-form-item label='日志级别'>
                                    <el-select v-model="form.loglevel" placeholder="请选择">
                                        <el-option v-for="item in logLevelList" :key="item.code" :label="item.desc"
                                            :value="item.code" />
                                    </el-select>
                                </el-form-item>

                                <el-divider></el-divider>
                                <el-form-item label="将上一个结果作为参数:">
                                    <el-checkbox v-model="form.arg_from_previous"
                                        :disabled="form.insertScript"></el-checkbox>
                                </el-form-item>
                                <el-form-item label="对每个输入行执行一次:">
                                    <el-checkbox v-model="form.exec_per_row"
                                        :disabled="form.insertScript"></el-checkbox>
                                </el-form-item>
                                <RightClickTable ref="fileTableRef" v-model="form.args" :columns="argumentsColumns"
                                    :showIndex="true" :height="200" style="width: 100%" :isDisabled="form.insertScript">
                                </RightClickTable>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="Script" name="script">
                            <el-input v-model="form.script" style="width: 100%" :autosize="{ minRows: 20}"
                                type="textarea" placeholder="" />
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
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { systemLogLevel } from "@/api/kettleApi/index";
import FileExplorerWindow from '../../formItems/tools/FileExplorerWindow.vue';
import RightClickTable from "../../formItems/tools/rightClickTable.vue";



const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("general");
const databaseInfo = ref({})
const logLevelList = ref([])

const form = reactive({
    stepName: "",
    script: "",
    insertScript: false,
    args: [],
    loglevel: "",
    set_logfile: false,
    add_date: false,
    add_time: false,
    logfile: "",
    logext: "",
    arg_from_previous: false,
    exec_per_row: false,
    set_append_logfile: false,
    fileName: "",
    work_directory: "",
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
            form.script = value.getAttribute('script') || '';
            form.insertScript = value.getAttribute('insertScript') === 'Y';
            form.args = JSON.parse(value.getAttribute('args') || '[]');
            form.loglevel = value.getAttribute('loglevel') || '';
            form.set_logfile = value.getAttribute('set_logfile') === 'Y';
            form.add_date = value.getAttribute('add_date') === 'Y';
            form.add_time = value.getAttribute('add_time') === 'Y';
            form.logfile = value.getAttribute('logfile') || '';
            form.logext = value.getAttribute('logext') || '';
            form.arg_from_previous = value.getAttribute('arg_from_previous') === 'Y';
            form.exec_per_row = value.getAttribute('exec_per_row') === 'Y';
            form.set_append_logfile = value.getAttribute('set_append_logfile') === 'Y';
            form.fileName = value.getAttribute('fileName') || '';
            form.work_directory = value.getAttribute('work_directory') || '';
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
            value.setAttribute("script", form.script);
            value.setAttribute("insertScript", form.insertScript ? 'Y' : 'N');
            value.setAttribute("args", JSON.stringify(form.args));
            value.setAttribute("loglevel", form.loglevel);
            value.setAttribute("set_logfile", form.set_logfile ? 'Y' : 'N');
            value.setAttribute("add_date", form.add_date ? 'Y' : 'N');
            value.setAttribute("add_time", form.add_time ? 'Y' : 'N');
            value.setAttribute("logfile", form.logfile);
            value.setAttribute("logext", form.logext);
            value.setAttribute("arg_from_previous", form.arg_from_previous ? 'Y' : 'N');
            value.setAttribute("exec_per_row", form.exec_per_row ? 'Y' : 'N');
            value.setAttribute("set_append_logfile", form.set_append_logfile ? 'Y' : 'N');
            value.setAttribute("fileName", form.fileName);
            value.setAttribute("work_directory", form.work_directory);
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

const getLogLevel = async () => {
    try {
        let res = await systemLogLevel();
        logLevelList.value = res
    } catch {
        ElMessage.error("获取日志级别失败")
    }
}


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


const showFileExplorer = ref(false)
const openFileExplorer = (type) => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.fileName = path + form.fileName
}

const argumentsColumns = [
    {
        prop: 'argument',
        label: '字段',
    },
]




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
        getLogLevel()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped>
.mxgraphForm {
    height: 600px;
    overflow-y: auto;
}
</style>