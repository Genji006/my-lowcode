<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="closeDialog" title="分组" :destroy-on-close="true"
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
                                    <el-form-item label="包括所有行?">
                                        <el-checkbox v-model="form.passAllRows"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="排序目录:">
                                        <div style="display: flex; align-items: center; width: 100%;">
                                            <el-input v-model="form.directory" style="width: 100%;"
                                                :disabled="!form.passAllRows"></el-input>
                                            <el-button @click="openFileExplorer('name')" style="margin-left: 10px;"
                                                :disabled="!form.passAllRows">浏览</el-button>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="临时文件前缀:">
                                        <el-input v-model="form.pre_fix" :disabled="!form.passAllRows"></el-input>
                                    </el-form-item>
                                    <el-form-item label="增加行号,每组重新开始:">
                                        <el-checkbox v-model="form.addingLineNrInGroup"
                                            :disabled="!form.passAllRows"></el-checkbox>
                                    </el-form-item>
                                    <el-form-item label="行号列名:">
                                        <el-input v-model="form.lineNrInGroupField"
                                            :disabled="!form.passAllRows"></el-input>
                                    </el-form-item>
                                    <el-form-item label="总返回一个结果行">
                                        <el-checkbox v-model="form.alwaysGivingBackOneRow"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="构成分组的字段" name="content">
                                <RightClickTable :modelValue="form.group_field" :columns="groupDataColumns"
                                    :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                    :specialFunction="'获取字段'" @parent-function="fieldParentFunction(1)">
                                </RightClickTable>
                            </el-tab-pane>
                            <el-tab-pane label="聚合" name="field">
                                <RightClickTable :modelValue="form.aggregate_field" :columns="fieldDataColumns"
                                    :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                    :specialFunction="'获取查询字段'" @parent-function="fieldParentFunction(2)">
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
    directory: '',
    pre_fix: '',
    addingLineNrInGroup: false,
    lineNrInGroupField: '',
    alwaysGivingBackOneRow: false,
    group_field: [],
    aggregate_field: [],
})
const promptDialogVisible = ref(false)
const promptResolve = ref(null)
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

// 显示弹窗并返回用户选择
const showPromptDialog = () => {
    return new Promise((resolve) => {
        promptDialogVisible.value = true
        promptResolve.value = resolve
    })
}


const fieldList = ref([])

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
        console.log("open", data.allXml);
        parseStepInfoAndPopulateForm(currentXml);
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
        stepName.value = data.cell.value
        getFieldList();
    }
    dialogVisible.value = true
}

const closeDialog = () => {
    Object.assign(form, {
        stepName: '',

    });
    dialogVisible.value = false
}


const getFieldList = async () => {
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };
    let res = await inputOutputFields(params);
    nextTick(() => {
        fieldList.value = res;
    })
}


const groupDataColumns = computed(() => [
    {
        prop: "name",
        label: "分组字段",
        type: "select",
        options: fieldList.value,
        valueKey: "name",
        labelKey: "name",
    },

]);

const fieldDataColumns = computed(() => [
    {
        prop: "aggregateField",
        label: "名称",
    },
    {
        prop: "subjectField",
        label: "Subject",
        type: "select",
        options: fieldList.value,
        valueKey: "name",
        labelKey: "name",
    },
    {
        prop: "aggregateType",
        label: "类型",
        type: "select",
        options: typeList.value,
        valueKey: "value",
        labelKey: "name",
        width: 300,
    },
    {
        prop: "valuefield",
        label: "值",
    },
]);

const typeList = ref([
    { name: '-', value: 0 },
    { name: '求和', value: 1 },
    { name: '平均', value: 2 },
    { name: 'Median', value: 3 },
    { name: 'Percentile', value: 4 },
    { name: '最小', value: 5 },
    { name: '最大', value: 6 },
    { name: '个数', value: 7 },
    { name: '使用 , 连接同组字符串', value: 8 },
    { name: '第一个非空值', value: 9 },
    { name: '最后一个非空值', value: 10 },
    { name: '第一个值', value: 11 },
    { name: '最后一个值', value: 12 },
    { name: '累计求和(对所有行)', value: 13 },
    { name: '累计平均(对所有行)', value: 14 },
    { name: '标准差', value: 15 },
    { name: '使用指定字符连接同组字符串', value: 16 },
    { name: 'Number of Distinct Values (N)', value: 17 },
    { name: 'Number of rows (without field argument)', value: 18 },
])

const stepName = ref("")
const fieldParentFunction = async (data) => {
    let params = {
        stepName:stepName.value,
        graphXml: allXml,
        before: true
    };

    if (data == 1) {
        // 弹出提示框
        if (form.group_field.length > 0) {
            const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
            let res = await inputOutputFields(params);
            // 根据用户选择处理数据
            handleFilesResult(result, res, 1);
        } else {
            let res = await inputOutputFields(params);
            nextTick(() => {
                form.group_field = res.map(item => ({
                    name: item.name,
                }));
            })
        }
    } else if (data == 2) {
        // 弹出提示框
        if (form.aggregate_field.length > 0) {
            const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
            let res = await inputOutputFields(params);
            // 根据用户选择处理数据
            handleFilesResult(result, res, 2);
        } else {
            let res = await inputOutputFields(params);
            nextTick(() => {
                form.aggregate_field = res.map(item => ({
                    aggregateField: item.name,
                    subjectField: '',
                    aggregateType: 0,
                    valuefield: '',
                }));
            })
        }
    }
}

const handleFilesResult = (action, newData, data) => {
    // 格式化数据以适配表格显示
    let formattedData = newData.map(item => ({
        name: item.name,
        aggregateField: item.name,
        subjectField: '',
        aggregateType: 0,
        valuefield: '',
    }));
    if (data == 1) {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!form.group_field.some(existingItem => existingItem.name === item.name)) {
                        form.group_field.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                form.group_field = [...form.group_field, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                form.group_field = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    } else if (data == 2) {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!form.aggregate_field.some(existingItem => existingItem.aggregateField === item.name)) {
                        form.aggregate_field.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                form.aggregate_field = [...form.aggregate_field, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                form.aggregate_field = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    }

};



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
            form.directory = fileOutput.getAttribute('directory') || '';
            form.passAllRows = fileOutput.getAttribute('passAllRows') === 'Y';
            form.pre_fix = fileOutput.getAttribute('pre_fix') || '';
            form.addingLineNrInGroup = fileOutput.getAttribute('addingLineNrInGroup') === 'Y';
            form.lineNrInGroupField = fileOutput.getAttribute('lineNrInGroupField') || '';
            form.alwaysGivingBackOneRow = fileOutput.getAttribute('alwaysGivingBackOneRow') === 'Y';
            form.group_field = JSON.parse(fileOutput.getAttribute('group_field') || '[]');
            form.aggregate_field = JSON.parse(fileOutput.getAttribute('aggregate_field') || '[]');
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
            fileOutput.setAttribute('directory', form.directory);
            fileOutput.setAttribute('passAllRows', form.passAllRows ? 'Y' : 'N');
            fileOutput.setAttribute('pre_fix', form.pre_fix || '');
            fileOutput.setAttribute('addingLineNrInGroup', form.addingLineNrInGroup ? 'Y' : 'N');
            fileOutput.setAttribute('lineNrInGroupField', form.lineNrInGroupField || '');
            fileOutput.setAttribute('alwaysGivingBackOneRow', form.alwaysGivingBackOneRow ? 'Y' : 'N');
            fileOutput.setAttribute('group_field', JSON.stringify(form.group_field));
            fileOutput.setAttribute('aggregate_field', JSON.stringify(form.aggregate_field));
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
    form.directory = path + form.directory
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