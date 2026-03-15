<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="Multiway Merge Join"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="110px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <div v-for="(inputStep, index) in inputSteps" :key="index"
                        style="display: flex; align-items: center;">
                        <el-form-item :label="`Input Step ${index + 1}：`">
                            <el-select v-model="inputStep.stepnames" placeholder="" style="width: 190px;">
                                <el-option v-for="item in stepList" :key="item.name" :label="item.name"
                                    :value="item.name"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Join Keys：" label-width="90px">
                            <div style="display: flex; align-items: center;">
                                <el-input v-model="inputStep.keys" placeholder="" style="width: 190px;"></el-input>
                                <el-button plain style="margin-left: 10px;" @click="openJoinKeysDialog(index)">Select
                                    Keys</el-button>
                            </div>
                        </el-form-item>
                    </div>
                    <el-form-item label="Join Type：">
                        <el-select v-model="form.join_type" placeholder="" style="width: 190px;">
                            <el-option v-for="item in joinTypes" :key="item.name" :label="item.name"
                                :value="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
    <SzycDialog :dialogVisible="joinKeysDialogVisible" width="20%" @close="joinKeysDialogVisible = false"
        title="Join Keys" :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <RightClickTable ref="joinKeyTableRef" v-model="joinKeyList" :columns="fieldDataColumns" :showIndex="true"
                :height="300" style="width: 100%" :showSelection="true">
            </RightClickTable>
            <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="joinKeysDialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleJoinKeysConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { multijointype, previousSteps, inputOutputFields } from "@/api/kettleApi/index.js";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;

// 定义事件
const emit = defineEmits(["update-step"]);

const joinKeyTableRef = ref(null)
const dialogVisible = ref(false);
const joinKeysDialogVisible = ref(false);
const inputSteps = ref([
    { stepnames: "", keys: "" }
]);
const joinTypes = ref([])
const stepList = ref([])
const joinKeyList = ref([])

// 记录当前编辑的是哪一行
const currentEditingRowIndex = ref(-1)

const form = reactive({
    stepName: "",
    join_type: "",
    keys: [],
    stepnames: []
});

const stepName = ref('')
const openJoinKeysDialog = async (index) => {
    currentEditingRowIndex.value = index
    joinKeysDialogVisible.value = true;

    // 获取字段数据
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };

    let res = await inputOutputFields(params);
    nextTick(() => {
        joinKeyList.value = res;
    })
}

// 存储传入边数据
const incomingEdgesData = ref(0);
const refreshIncomingEdges = () => {
    if (currentCell && currentGraph) {
        // 使用 mxGraph 的 getIncomingEdges 方法获取传入当前节点的所有边
        const incomingEdges = currentGraph.getIncomingEdges(currentCell);
        incomingEdgesData.value = incomingEdges.length;

        inputSteps.value = Array.from({ length: incomingEdges.length || 1 }, (_, i) => {
            return inputSteps.value[i] || { stepnames: "", keys: "" };
        });
    }
}


const handleJoinKeysConfirm = () => {
    if (joinKeyTableRef.value && currentEditingRowIndex.value >= 0) {
        const selectedRows = joinKeyTableRef.value.getSelectedRows();
        const selectedFieldNames = selectedRows.map(row => row.name).join(',');

        // 更新当前编辑行的keys字段
        if (currentEditingRowIndex.value < inputSteps.value.length) {
            inputSteps.value[currentEditingRowIndex.value].keys = selectedFieldNames;
        }
    }

    joinKeysDialogVisible.value = false;
}

const fieldDataColumns = [
    {
        label: "Key field",
        prop: "name",
    },
]

const getJoinTypes = async () => {
    try {
        const res = await multijointype({})
        joinTypes.value = res
    } catch (error) {
        console.error("获取多表合并连接类型失败:", error);
    }
}

const getSteps = async () => {
    try {
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
        };
        let res = await previousSteps(params);
        stepList.value = res
    } catch (error) {
        console.error("获取步骤失败:", error);
    }
}




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
            const multiwayMergeJoin = stepElements[0];
            console.log("multiwayMergeJoin", multiwayMergeJoin);
            // 填充表单字段
            form.stepName = multiwayMergeJoin.getAttribute('label') || '';
            form.join_type = multiwayMergeJoin.getAttribute('join_type') || '';
            // 从XML中获取stepnames和keys数组数据并更新inputSteps
            const stepnames = JSON.parse(multiwayMergeJoin.getAttribute('stepnames')) || [];
            const keys = JSON.parse(multiwayMergeJoin.getAttribute('keys')) || [];
            // 根据stepnames和keys的长度来重建inputSteps数组
            const maxLength = Math.max(stepnames.length, keys.length, 1);
            inputSteps.value = Array.from({ length: maxLength }, (_, i) => ({
                stepnames: stepnames[i] || "",
                keys: keys[i] || ""
            }));
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
            const multiwayMergeJoin = stepElements[0];
            // 更新属性
            multiwayMergeJoin.setAttribute("label", form.stepName);
            multiwayMergeJoin.setAttribute("join_type", form.join_type);

            // 将inputSteps中的数据合并为数组形式再存储到XML中
            const stepnames = inputSteps.value.map(item => item.stepnames).filter(name => name !== "");
            const keys = inputSteps.value.map(item => item.keys).filter(key => key !== "");
            console.log(stepnames, keys);
            // // 更新stepnames和keys属性
            multiwayMergeJoin.setAttribute("stepnames", JSON.stringify(stepnames));
            multiwayMergeJoin.setAttribute("keys", JSON.stringify(keys));

            return mxUtils.getPrettyXml(multiwayMergeJoin);
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




const openDialog = async (data) => {
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
        refreshIncomingEdges()
        await getJoinTypes()
        await getSteps()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>