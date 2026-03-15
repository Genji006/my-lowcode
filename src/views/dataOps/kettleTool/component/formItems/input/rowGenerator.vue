<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="生成记录"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <el-form :model="editForm" label-width="100px">
                <el-form-item label="步骤名称：">
                    <el-input v-model="editForm.stepName" placeholder=""></el-input>
                </el-form-item>
                <!-- 其他表单项 -->
                <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                    <el-form label-position="right" label-width="230px">
                        <el-form-item label="限制:">
                            <el-input v-model="editForm.rowLimit" placeholder=""></el-input>
                        </el-form-item>
                        <el-form-item label="Never stop generating rows:">
                            <el-checkbox v-model="editForm.neverEnding" placeholder=""></el-checkbox>
                        </el-form-item>
                        <el-form-item label="Interval in ms(delay):">
                            <el-input v-model="editForm.intervalInMs" placeholder="" :disabled="!editForm.neverEnding"></el-input>
                        </el-form-item>
                        <el-form-item label="Current row time field name:">
                            <el-input v-model="editForm.rowTimeField" placeholder="" :disabled="!editForm.neverEnding"></el-input>
                        </el-form-item>
                        <el-form-item label="Previous row time field name:">
                            <el-input v-model="editForm.lastTimeField" placeholder="" :disabled="!editForm.neverEnding"></el-input>
                        </el-form-item>
                    </el-form>
                    <RightClickTable v-model="logDataList" :columns="logDataColumns" :defaultRow="defaultLogDataRow"
                        :showIndex="true" :height="200">
                    </RightClickTable>
                </el-tabs>
            </el-form>
            <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import ReusableTable from "../tools/ExcelFilesTable.vue";
import RightClickTable from "../tools/rightClickTable.vue";
import { columnType, columnFormats, valueMeta, valueFormat } from "@/api/kettleApi/index";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);


const valueMetaList = ref([]);
const valueFormatList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("file");
const editForm = reactive({
    stepName: "",
    recordCount: "",
    neverEnding: false,
    intervalInMs: "",
    rowTimeField: "",
    lastTimeField: "",
    rowLimit: "",
});

// 通过调用子组件方法添加文件
const addFiles = (tableRef) => {
    if (tableRef.value) {
        tableRef.value.addRow();
    }
};

// 通过调用子组件方法删除选中文件
const deleteSelectedFile = (tableRef) => {
    if (tableRef.value) {
        tableRef.value.deleteSelectedRow();
    }
};

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
let allXmlData = null;

const logDataList = ref([]);
// 表格列配置
const logDataColumns = computed(() => [
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
    { prop: "currencyType", label: "货币类型", width: 120 },
    { prop: "decimal", label: "小数", width: 120 },
    { prop: "group", label: "分组", width: 120 },
    { prop: "value", label: "值", width: 120 },
    {
        prop: "nullable",
        label: "设为空串？",
        type: "select",
        options: [{ name: "是", value: true }, { name: "否", value: false }],
        valueKey: "value",
        labelKey: "name",
        width: 120
    },
]);

// 默认行数据
const defaultLogDataRow = ref({});

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
            const rowGeneratorInput = stepElements[0];
            console.log("rowGeneratorInput", rowGeneratorInput);
            // 填充表单字段
            editForm.stepName = rowGeneratorInput.getAttribute('label') || '';
            editForm.recordCount = rowGeneratorInput.getAttribute("recordCount") || "";
            editForm.neverEnding = rowGeneratorInput.getAttribute("neverEnding") === "Y";
            editForm.intervalInMs = rowGeneratorInput.getAttribute("intervalInMs") || "";
            editForm.rowTimeField = rowGeneratorInput.getAttribute("rowTimeField") || "";
            editForm.lastTimeField = rowGeneratorInput.getAttribute("lastTimeField") || "";
            logDataList.value = JSON.parse(rowGeneratorInput.getAttribute("fields")) || []; // 根据实际需要调整
            editForm.rowLimit = rowGeneratorInput.getAttribute("rowLimit") || "";
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
        console.log("stepElements", stepElements);
        if (stepElements.length > 0) {
            const rowGeneratorInput = stepElements[0];
            // 更新属性
            rowGeneratorInput.setAttribute("label", editForm.stepName);
            rowGeneratorInput.setAttribute("recordCount", editForm.recordCount);
            rowGeneratorInput.setAttribute("neverEnding", editForm.neverEnding ? "Y" : "N");
            rowGeneratorInput.setAttribute("intervalInMs", editForm.intervalInMs);
            rowGeneratorInput.setAttribute("rowTimeField", editForm.rowTimeField);
            rowGeneratorInput.setAttribute("lastTimeField", editForm.lastTimeField);
            rowGeneratorInput.setAttribute("fields", JSON.stringify(logDataList.value));
            rowGeneratorInput.setAttribute("rowLimit", editForm.rowLimit);
            // 返回更新后的XML
            return mxUtils.getPrettyXml(rowGeneratorInput);
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
            .setValue(currentCell, editForm.stepName);

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



const getvalueMeta = async () => {
    let res = await valueMeta({});
    valueMetaList.value = res;
};
const getvalueFormat = async () => {
    let res = await valueFormat({ valueType: 'all' });
    valueFormatList.value = res;
}
const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        // 将节点当前名称设置到表单中
        editForm.stepName = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        console.log("openDialog", data);
    }
    getvalueMeta();
    getvalueFormat();
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped>
.tabItem {
    :deep(.el-form-item__label) {
        font-size: 15px !important;
    }

    :deep(.el-form-item) {
        margin: 10px 15px !important;
    }
}
</style>