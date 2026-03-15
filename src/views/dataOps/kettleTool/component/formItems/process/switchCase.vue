<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="Switch / Case"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="180px">
                            <el-form-item label="Switch字段：">
                                <el-select v-model="form.fieldname" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in partitioningFieldList" :key="item.name" :label="item.name"
                                        :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="使用字符串包含比较符：">
                                <el-checkbox v-model="form.use_contains"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="Case值数据类型：">
                                <el-select v-model="form.case_value_type" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in dataTypeList" :key="item.id" :label="item.name"
                                        :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Case值转换掩码：">
                                <el-input v-model="form.case_value_format" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="Case值小数点符号：">
                                <el-input v-model="form.case_value_decimal" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="Case值分组标志：">
                                <el-input v-model="form.case_value_group" placeholder=""></el-input>
                            </el-form-item>
                            <el-divider content-position="left">Case值映射</el-divider>
                            <RightClickTable ref="fileTableRef" v-model="form.cases" :columns="filedColumns"
                                :showIndex="true" :height="200" style="width: 100%">
                            </RightClickTable>
                            <el-form-item label="默认目标步骤：">
                                <el-select v-model="form.default_target_step" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in targetStepList" :key="item.name" :label="item.name"
                                        :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-tabs>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";;
import { inputOutputFields, valueMeta, getTargetSteps } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const columnList = ref([])
const dataTypeList = ref([])
const targetStepList = ref([])
const partitioningFieldList = ref([])

const form = reactive({
    stepName: "",
    fieldname: "",
    use_contains: false,
    case_value_type: "",
    case_value_format: "",
    case_value_decimal: "",
    case_value_group: "",
    cases: [],
    default_target_step: "",
});

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
            const switchCaseElement = stepElements[0];
            console.log("switchCaseElement", switchCaseElement);
            // 填充表单字段
            form.stepName = switchCaseElement.getAttribute('label') || '';
            form.fieldname = switchCaseElement.getAttribute('fieldname') || '';
            form.use_contains = switchCaseElement.getAttribute('use_contains') === 'Y';
            form.case_value_type = switchCaseElement.getAttribute('case_value_type') || '';
            form.case_value_format = switchCaseElement.getAttribute('case_value_format') || '';
            form.case_value_decimal = switchCaseElement.getAttribute('case_value_decimal') || '';
            form.case_value_group = switchCaseElement.getAttribute('case_value_group') || '';
            form.cases = JSON.parse(switchCaseElement.getAttribute('cases') || '[]');
            form.default_target_step = switchCaseElement.getAttribute('default_target_step') || '';
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
            const switchCaseElement = stepElements[0];
            // 更新属性
            switchCaseElement.setAttribute("label", form.stepName);
            switchCaseElement.setAttribute("fieldname", form.fieldname);
            switchCaseElement.setAttribute("use_contains", form.use_contains ? 'Y' : 'N');
            switchCaseElement.setAttribute("case_value_type", form.case_value_type);
            switchCaseElement.setAttribute("case_value_format", form.case_value_format);
            switchCaseElement.setAttribute("case_value_decimal", form.case_value_decimal);
            switchCaseElement.setAttribute("case_value_group", form.case_value_group);
            switchCaseElement.setAttribute("cases", JSON.stringify(form.cases));
            switchCaseElement.setAttribute("default_target_step", form.default_target_step);
            // 返回更新后的XML
            return mxUtils.getPrettyXml(switchCaseElement);
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


const filedColumns = computed(() => [
    {
        prop: 'value',
        label: '值',
    },
    {
        prop: 'target_step',
        label: '目标步骤',
        type: "select",
        options: targetStepList.value,
        valueKey: "name",
        labelKey: "name",
    },
]);


const stepName = ref('')
const getPartitioningField = async () => {
    try {
        let params = {
            stepName: encodeURIComponent(stepName.value),
            graphXml: allXml,
            before: true,
        };
        let res = await inputOutputFields(params);
        partitioningFieldList.value = res
        getTargetStep()
    } catch {
        ElMessage.error("获取分区字段失败")
    }
}

const getTargetStep = async () => {
    try {
        let params = {
            stepName: encodeURIComponent(stepName.value),
            graphXml: allXml,
        };
        let res = await getTargetSteps(params);
        targetStepList.value = res
    } catch {
        ElMessage.error("获取目标步骤失败")
    }
}

const getDataType = async () => {
    try {
        let res = await valueMeta({});
        dataTypeList.value = res.map(item => ({
            id: item.id.toString(),
            name: item.name
        }))
    } catch {
        ElMessage.error("获取类型失败")
    }
}


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
        getPartitioningField()
        getDataType()
        // getTargetStep()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>