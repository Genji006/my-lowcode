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
                            <el-divider content-position="left">属性文件</el-divider>
                            <el-form-item label="属性文件名">
                                <el-input v-model="form.filename" />
                            </el-form-item>
                            <el-form-item label="变量有效范围">
                                <el-select v-model="form.fileVariableType" placeholder="请选择变量有效范围" style="width: 100%">
                                    <el-option v-for="item in variableTypeList" :key="item.code" :label="item.desc"
                                        :value="item.code" />
                                </el-select>
                            </el-form-item>

                            <el-divider content-position="left">设置</el-divider>
                            <el-form-item label="变量替换">
                                <el-checkbox v-model="form.replaceVars" />
                            </el-form-item>

                            <el-divider content-position="left">设置</el-divider>
                            <RightClickTable v-model="form.fields" :columns="fieldsColumns" :showIndex="true"
                                :height="200" style="width: 100%">
                            </RightClickTable>
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
import SzycCancel from "@/components/element/Cancel.vue";
import RightClickTable from "../../formItems/tools/rightClickTable.vue";
import { variableType } from "@/api/kettleApi/index";


const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");

const form = reactive({
    stepName: "",

});

const fieldsColumns = [
    { prop: "variableName", label: "变量名" },
    { prop: "variableValue", label: "值" },
    { prop: "variableType", label: "变量活动类型" },
]

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
            const setVariable = stepElements[0];
            // 填充表单字段
            form.stepName = setVariable.getAttribute('label') || '';

            form.filename = setVariable.getAttribute('filename') || '';
            form.fileVariableType = setVariable.getAttribute('fileVariableType') || '';
            form.replaceVars = setVariable.getAttribute('replaceVars') === 'Y';
            form.fields = JSON.parse(setVariable.getAttribute('fields') || '[]');

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
            const setVariable = stepElements[0];
            // 更新属性
            setVariable.setAttribute("label", form.stepName);
            setVariable.setAttribute("filename", form.filename);
            setVariable.setAttribute("fileVariableType", form.fileVariableType);
            setVariable.setAttribute("replaceVars", form.replaceVars ? 'Y' : 'N');
            setVariable.setAttribute("fields", JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(setVariable);
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
        getVariableType();
    }
    dialogVisible.value = true;
};

const variableTypeList = ref([]);
const getVariableType = async () => {
    let res = await variableType();
    variableTypeList.value = res;
};


// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>