<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="检验字段的值"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>

                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-tab-pane label="常规" name="general">
                            <el-form label-position="right" label-width="200px">
                                <!-- 源部分 -->
                                <el-divider content-position="left">源</el-divider>

                                <el-form-item label="检验：">
                                    <el-select v-model="form.valuetype" placeholder="请选择">
                                        <el-option label="将上一步结果的字段" value="field"></el-option>
                                        <el-option label="变量" value="variable"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item v-if="form.valuetype === 'field'" label="字段名：">
                                    <el-input v-model="form.fieldname" placeholder="请输入字段名"></el-input>
                                </el-form-item>

                                <el-form-item v-if="form.valuetype === 'variable'" label="变量名：">
                                    <el-input v-model="form.variablename" placeholder="请输入变量名"></el-input>
                                </el-form-item>

                                <el-form-item v-if="!form.successwhenvarset && !hideFieldtype" label="类型：">
                                    <el-select v-model="form.fieldtype" placeholder="请选择">
                                        <el-option label="String" value="string"></el-option>
                                        <el-option label="Number" value="number"></el-option>
                                        <el-option label="Date Time" value="datetime"></el-option>
                                        <el-option label="Boolean" value="boolean"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item v-if="showMaskField" label="Mask：">
                                    <el-input v-model="form.mask" placeholder="请输入Mask"></el-input>
                                </el-form-item>

                                <!-- 成功条件部分 -->
                                <el-divider content-position="left">成功条件</el-divider>

                                <el-form-item label="Success when variable set：" v-if="form.valuetype === 'variable'">
                                    <el-checkbox v-model="form.successwhenvarset"></el-checkbox>
                                </el-form-item>

                                <el-form-item v-if="showCompareValueField" label="比较值：">
                                    <el-input v-model="form.comparevalue" placeholder="请输入比较值"></el-input>
                                </el-form-item>

                                <el-form-item v-if="showBooleanConditionField" label="成功条件：">
                                    <el-select v-model="form.successbooleancondition" placeholder="请选择">
                                        <el-option label="如果值是True" value="true"></el-option>
                                        <el-option label="如果值是False" value="false"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item v-if="showStringConditionField" label="成功条件：">
                                    <el-select v-model="form.successcondition" placeholder="请选择">
                                        <el-option v-for="item in conditionList" :key="item.value" :label="item.text"
                                            :value="item.value"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item v-if="showNumberConditionField" label="成功条件：">
                                    <el-select v-model="form.successnumbercondition" placeholder="请选择">
                                        <el-option v-for="item in conditionList" :key="item.value" :label="item.text"
                                            :value="item.value"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { getSuccessNumberCondition } from "@/api/kettleApi/index.js";

const { mxUtils } = window.mx;

// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("general");

const form = reactive({
    stepName: "",
    valuetype: "field",
    fieldname: "",
    variablename: "",
    fieldtype: "string",
    mask: "",
    comparevalue: "",
    successcondition: "",
    successnumbercondition: "",
    successbooleancondition: "true",
    successwhenvarset: false
});

// 计算属性来控制显示和隐藏逻辑
const hideFieldtype = computed(() => {
    return form.successwhenvarset;
});

const showMaskField = computed(() => {
    return !form.successwhenvarset && form.fieldtype === 'datetime';
});

const showCompareValueField = computed(() => {
    return !form.successwhenvarset &&
        form.fieldtype !== 'boolean' &&
        form.fieldtype !== 'unknown' &&
        form.fieldtype !== '';
});

const showBooleanConditionField = computed(() => {
    return !form.successwhenvarset &&
        form.fieldtype === 'boolean';
});

const showStringConditionField = computed(() => {
    return !form.successwhenvarset &&
        form.fieldtype === 'string';
});

const showNumberConditionField = computed(() => {
    return !form.successwhenvarset &&
        (form.fieldtype === 'number' || form.fieldtype === 'datetime');
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
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        console.log("stepElements", stepElements);
        if (stepElements.length > 0) {
            const simpleEval = stepElements[0];
            // 填充表单字段
            form.stepName = simpleEval.getAttribute('label') || '';
            form.valuetype = simpleEval.getAttribute('valuetype') || 'field';
            form.fieldname = simpleEval.getAttribute('fieldname') || '';
            form.variablename = simpleEval.getAttribute('variablename') || '';
            form.fieldtype = simpleEval.getAttribute('fieldtype') || 'string';
            form.mask = simpleEval.getAttribute('mask') || '';
            form.comparevalue = simpleEval.getAttribute('comparevalue') || '';
            form.successcondition = simpleEval.getAttribute('successcondition') || '';
            form.successnumbercondition = simpleEval.getAttribute('successnumbercondition') || '';
            form.successbooleancondition = simpleEval.getAttribute('successbooleancondition') || 'true';
            form.successwhenvarset = simpleEval.getAttribute('successwhenvarset') === 'true';
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
        const stepElements = xmlDoc.getElementsByTagName("JobEntry");
        if (stepElements.length > 0) {
            const simpleEval = stepElements[0];
            // 更新属性
            simpleEval.setAttribute("label", form.stepName);
            simpleEval.setAttribute("valuetype", form.valuetype);

            if (form.valuetype === 'field') {
                simpleEval.setAttribute("fieldname", form.fieldname);
            } else {
                simpleEval.setAttribute("variablename", form.variablename);
            }

            simpleEval.setAttribute("fieldtype", form.fieldtype);
            simpleEval.setAttribute("mask", form.mask);
            simpleEval.setAttribute("comparevalue", form.comparevalue);
            simpleEval.setAttribute("successcondition", form.successcondition);
            simpleEval.setAttribute("successnumbercondition", form.successnumbercondition);
            simpleEval.setAttribute("successbooleancondition", form.successbooleancondition);
            simpleEval.setAttribute("successwhenvarset", form.successwhenvarset ? "true" : "false");

            // 返回更新后的XML
            return mxUtils.getPrettyXml(simpleEval);
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

const conditionList = ref([])
const getCondition = () => {
    getSuccessNumberCondition({
    }).then(res => {
        conditionList.value = res;
    })
}

const openDialog = (data) => {
    // 重置表单
    Object.assign(form, {
        stepName: "",
        valuetype: "field",
        fieldname: "",
        variablename: "",
        fieldtype: "string",
        mask: "",
        comparevalue: "",
        successcondition: "",
        successnumbercondition: "",
        successbooleancondition: "true",
        successwhenvarset: false
    });

    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        allXml = data.allXml
        transName.value = data.transName
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getCondition()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
.tabItem {
    height: 500px;
    margin-top: 20px;
}
</style>