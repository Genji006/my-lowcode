<template>
    <SzycDialog :dialogVisible="dialogVisible" width="30%" @close="dialogVisible = false" title="增加校验列"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-width="100px">
                            <el-form-item label="类型：">
                                <el-select v-model="form.checksumtype" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in typeList" :label="item.code"
                                        :value="item.code"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="结果类型：">
                                <el-select v-model="form.resultType" style="width: 100%;" placeholder="" :disabled="form.checksumtype != 'MD5' && form.checksumtype != 'SHA-1'">
                                    <el-option v-for="item in resultList" :label="item.code"
                                        :value="item.code"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="结果字段：">
                                <el-input v-model="form.resultfieldName" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="兼容模式：">
                                <el-checkbox v-model="form.compatibilityMode" :disabled="form.resultType != 'hexadecimal'"></el-checkbox>
                            </el-form-item>
                        </el-form>
                        <el-divider content-position="left">校验使用的字段</el-divider>
                        <RightClickTable v-model="form.fields" :columns="fieldDataColumns" :showIndex="true"
                            style="width: 100%">
                        </RightClickTable>

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
import { columnType, columnFormats, inputOutputFields, getFormats, checkSumTypes,checkSumResultTypes } from '@/api/kettleApi/index'
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const partitioningFieldList = ref([])
const typeList = ref([])
const resultList = ref([])

const form = reactive({
    stepName: "",
    checksumtype: "",
    resultType: "",
    resultfieldName: "",
    compatibilityMode: false,
    fields: []
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
            const checkSum = stepElements[0];
            console.log("checkSum", checkSum);
            // 填充表单字段
            form.stepName = checkSum.getAttribute('label') || '';
            form.checksumtype = checkSum.getAttribute('checksumtype') || '';
            form.resultType = checkSum.getAttribute('resultType') || '';
            form.resultfieldName = checkSum.getAttribute('resultfieldName') || '';
            form.compatibilityMode = checkSum.getAttribute('compatibilityMode') === 'Y';
            form.fields = JSON.parse(checkSum.getAttribute('fields') || '[]');
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
            const checkSum = stepElements[0];
            // 更新属性
            checkSum.setAttribute("label", form.stepName);
            checkSum.setAttribute("checksumtype", form.checksumtype);
            checkSum.setAttribute("resultType", form.resultType);
            checkSum.setAttribute("resultfieldName", form.resultfieldName);
            checkSum.setAttribute("compatibilityMode", form.compatibilityMode ? 'Y' : 'N');
            checkSum.setAttribute("fields", JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(checkSum);
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

const fieldDataColumns = computed(() => [
    {
        prop: "name",
        label: "字段",
        type: "select",
        options: partitioningFieldList.value,
        valueKey: "name",
        labelKey: "name",
    },
]);


const stepName = ref('')
const getPartitioningField = async () => {
    try {
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
            before: true
        };
        let res = await inputOutputFields(params);
        partitioningFieldList.value = res
    } catch {
        ElMessage.error("获取分区字段失败")
    }
}

const getCheckSumTypes = async () => {
    try {
        let res = await checkSumTypes({});
        typeList.value = res
    } catch {
        ElMessage.error("获取校验类型失败")
    }
}

const getCheckSumResultTypes = async () => { 
    try {
        let res = await checkSumResultTypes({});
        resultList.value = res
    } catch {
        ElMessage.error("获取校验结果类型失败")
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
        getCheckSumTypes()
        getCheckSumResultTypes()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>