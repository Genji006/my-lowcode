<template>
    <SzycDialog :dialogVisible="dialogVisible" width="30%" @close="dialogVisible = false" title="阻塞数据直到步骤都完成"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <RightClickTable ref="fileTableRef" v-model="form.steps" :columns="filedColumns"
                            :showIndex="true" :height="300" style="width: 100%" button-text="获取步骤"
                            :needSpecialFunction="true" @parent-function="getTargetStep">
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
import { inputOutputFields, valueMeta, initPreview } from "@/api/kettleApi/index";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const targetStepList = ref([])

const form = reactive({
    stepName: "",
    steps: []
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
            const value = stepElements[0];
            console.log("value", value);
            // 填充表单字段
            form.stepName = value.getAttribute('label') || '';
            form.steps = JSON.parse(value.getAttribute('steps') || '[]');
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
            const value = stepElements[0];
            // 更新属性
            value.setAttribute("label", form.stepName);
            value.setAttribute("steps", JSON.stringify(form.steps));
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

const getAllStep = async () => {
    try {
        let params = {
            graphXml: allXml,
            selectedCells: JSON.stringify([])
        };
        let res = await initPreview(params);
        targetStepList.value = res
        console.log("targetStepList.value", targetStepList.value);
    } catch {
        ElMessage.error("获取步骤失败")
    }
}

const getTargetStep = async () => {
    try {
        let params = {
            graphXml: allXml,
            selectedCells: JSON.stringify([])
        };
        let res = await initPreview(params);
        form.steps.push(...res.map(item => ({
            name: item.name,
            CopyNr: 0
        })))
    } catch {
        ElMessage.error("获取步骤失败")
    }
}

const filedColumns = computed(() => [
    {
        prop: "name",
        label: "步骤名称",
        type: "select",
        options: targetStepList.value,
        valueKey: "name",
        labelKey: "name",
        width: 200
    },
    {
        prop: "CopyNr",
        label: "复制次数",
    },
])


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
        parseStepInfoAndPopulateForm(currentXml);
        getAllStep()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>