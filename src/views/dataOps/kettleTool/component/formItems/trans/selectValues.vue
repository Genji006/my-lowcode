<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="dialogVisible = false" title="字段选择"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder=""></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-tab-pane label="选中和修改" name="selectConfig">
                            <el-divider content-position="left">字段：</el-divider>
                            <RightClickTable ref="searchTableRef" v-model="form.fields" :columns="selectDataColumns"
                                :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction('select')">
                            </RightClickTable>
                        </el-tab-pane>
                        <el-tab-pane label="移除" name="removeConfig">
                            <el-divider content-position="left">移除的字段：</el-divider>
                            <RightClickTable ref="updateTableRef" v-model="form.remove" :columns="removeDataColumns"
                                :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction('remove')">
                            </RightClickTable>
                        </el-tab-pane>
                        <el-tab-pane label="元数据" name="mateConfig">
                            <el-divider content-position="left">需要改变元数据的字段：</el-divider>
                            <RightClickTable ref="mateTableRef" v-model="form.meta" :columns="mateDataColumns"
                                :showIndex="true" :height="500" style="width: 100%" :needSpecialFunction="true"
                                @parent-function="fieldParentFunction('meta')">
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
    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="15"
        :trans-Name="transName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />
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
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import ReusableTable from "../tools/ExcelFilesTable.vue";
import { inputOutputFields, columnType, columnFormats } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("selectConfig");
const showDatabaseExplorer = ref(false)
const databaseInfo = ref({})
const form = reactive({
    stepName: "",
    fields: [],
    remove: [],
    meta: [],
});

const stepName = ref("")


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
            const selectValues = stepElements[0];
            console.log("selectValues", selectValues);
            // 填充表单字段
            form.stepName = selectValues.getAttribute('label') || '';
            form.fields = JSON.parse(selectValues.getAttribute('fields') || '[]');
            form.remove = JSON.parse(selectValues.getAttribute('remove') || '[]');
            form.meta = JSON.parse(selectValues.getAttribute('meta') || '[]');
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
            const selectValues = stepElements[0];
            // 更新属性
            selectValues.setAttribute("label", form.stepName);
            selectValues.setAttribute("fields", JSON.stringify(form.fields));
            selectValues.setAttribute("remove", JSON.stringify(form.remove));
            selectValues.setAttribute("meta", JSON.stringify(form.meta));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(selectValues);
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

const fieldParentFunction = async (type) => {
    let params = {
        stepName: encodeURIComponent(stepName.value),
        graphXml: allXml,
        before: true
    };
    if (type === 'select') {
        // 弹出提示框
        if (form.fields.length > 0) {
            const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
            let res = await inputOutputFields(params);
            // 根据用户选择处理数据
            handleFilesResult(result, res, 'select');
        } else {
            let res = await inputOutputFields(params);
            nextTick(() => {
                form.fields = res
            })
        }
    } else if (type === 'remove') {
        // 弹出提示框
        if (form.remove.length > 0) {
            const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
            let res = await inputOutputFields(params);
            // 根据用户选择处理数据
            handleFilesResult(result, res, 'remove');
        } else {
            let res = await inputOutputFields(params);
            nextTick(() => {
                form.remove = res
            })
        }
    } else if (type === 'meta') {
        // 弹出提示框
        if (form.meta.length > 0) {
            const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
            let res = await inputOutputFields(params);
            // 根据用户选择处理数据
            handleFilesResult(result, res, 'meta');
        } else {
            let res = await inputOutputFields(params);
            nextTick(() => {
                form.meta = res
            })
        }
    }
}

const yesOrNoList = ref([
    {
        label: "是",
        value: "Y",
    },
    {
        label: "否",
        value: "N",
    },
]);

const dateFormatList = ref([
    { value: 'none', label: '不去除字符串首位空字符' },
    { value: 'left', label: '去除字符串首部空字符' },
    { value: 'right', label: '去除字符串尾部空字符' },
    { value: 'both', label: '去除字符串首尾空字符' }
])

const nameList = ref([])
const selectDataColumns = computed(() => [
    {
        prop: 'name',
        label: '字段名称',
    },
    {
        prop: "rename",
        label: "改名为",
    },
    {
        prop: 'length',
        label: '长度',
    },
    {
        prop: 'precision',
        label: '精度',
    },
]);

const removeDataColumns = computed(() => [
    {
        prop: 'name',
        label: '字段名称',
    },
])

const mateDataColumns = computed(() => [
    {
        prop: 'name',
        label: '字段名称',
    },
    {
        prop: "rename",
        label: "改名为",
    },
    {
        prop: "type",
        label: "类型",
        type: "select",
        options: columnTypeList.value,
        valueKey: "type",
        labelKey: "type",
        width: 120
    },
    {
        prop: 'length',
        label: '长度',
    },
    {
        prop: 'precision',
        label: '精度',
    },
    {
        prop: "storage_type",
        label: "Binary to Normal?",
        type: "select",
        options: yesOrNoList.value,
        width: 160
    },
    {
        prop: "conversion_mask",
        label: "格式",
        type: "select",
        options: [
            { value: 'yyyy-MM-dd HH:mm:ss', label: 'yyyy-MM-dd HH:mm:ss' },
            { value: 'yyyy/MM/dd HH:mm:ss', label: 'yyyy/MM/dd HH:mm:ss' },
            { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
            { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd' },
            { value: 'yyyyMMdd', label: 'yyyyMMdd' },
            { value: 'yyyyMMddHHmmss', label: 'yyyyMMddHHmmss' }
        ],
    },
    {
        prop: "date_format_lenient",
        label: "Date Format Lenient?",
        type: "select",
        options: yesOrNoList.value,
        width: 180
    },
    {
        prop: "date_format_locale",
        label: "Date Local",
        type: "select",
        options: dateFormatList.value,
        width: 160
    },
    {
        prop: "date_format_timezone",
        label: "Date Time Zone",
        type: "select",
        options: dateFormatList.value,
        width: 160
    },
    {
        prop: "lenient_string_to_number",
        label: "Lenient number conversion?",
        type: "select",
        options: yesOrNoList.value,
        width: 220
    },
    {
        prop: "encoding",
        label: "Encoding",
        type: "select",
        options: dateFormatList.value,
    },
    {
        prop: 'decimal_symbol',
        label: '十进制',
    },
    {
        prop: 'grouping_symbol',
        label: '分组',
    },
    {
        prop: 'currency_symbol',
        label: '货币',
    },
])


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

const handleFilesResult = (action, newData, type) => {
    // 格式化数据以适配表格显示
    let formattedData = newData
    if (type == 'select') {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!form.fields.some(existingItem => existingItem.name === item.name)) {
                        form.fields.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                form.fields = [...form.fields, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                form.fields = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    } else if (type == 'remove') {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!form.remove.some(existingItem => existingItem.name === item.name)) {
                        form.remove.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                form.remove = [...form.remove, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                form.remove = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    } else if (type == 'meta') {
        switch (action) {
            case 'addNew':
                // 增加新的（这里假设是新增数据中不存在于当前数据的项）
                formattedData.forEach(item => {
                    if (!form.meta.some(existingItem => existingItem.name === item.name)) {
                        form.meta.push(item);
                    }
                });
                break;
            case 'addAll':
                // 增加所有
                form.meta = [...form.meta, ...formattedData];
                break;
            case 'clearAndAddAll':
                // 清除并增加所有
                form.meta = formattedData;
                break;
            case 'cancel':
                // 取消
                break;
            default:
                break;
        }
    }

};


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
        stepName.value = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getColumnType()
        getcolumnFormats()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped>
:deep(.el-divider--horizontal) {
    margin: 15px 0 !important;
}
</style>
