<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="写日志"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="120px">
                            <el-form-item label="日志级别：">
                                <el-select v-model="form.loglevel" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in logLevelList" :key="item.code" :label="item.desc"
                                        :value="item.code"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="打印头：">
                                <el-checkbox v-model="form.displayHeader"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="限制行数：">
                                <el-checkbox v-model="form.limitRows"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="限制行数数值：">
                                <el-input v-model="form.limitRowsNumber" :disabled="!form.limitRows"
                                    placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="写日志：">
                                <el-input v-model="form.logmessage" placeholder="" type="textarea" rows="4"></el-input>
                            </el-form-item>
                            <el-divider content-position="left">字段</el-divider>
                            <RightClickTable ref="fileTableRef" v-model="form.fields" :columns="filedColumns"
                                :showIndex="true" :height="200" style="width: 100%">
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
import SzycCancel from "@/components/element/Cancel.vue";;
import { systemLogLevel } from "@/api/kettleApi/index";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const logLevelList = ref([])
const columnList = ref([])

const form = reactive({
    stepName: "",
    loglevel: "",
    displayHeader: false,
    limitRows: false,
    limitRowsNumber: "",
    logmessage: "",
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
            const writeToLogElement = stepElements[0];
            console.log("writeToLogElement", writeToLogElement);
            // 填充表单字段
            form.stepName = writeToLogElement.getAttribute('label') || '';
            form.loglevel = writeToLogElement.getAttribute('loglevel') || '';
            form.displayHeader = writeToLogElement.getAttribute('displayHeader') === 'Y';
            form.limitRows = writeToLogElement.getAttribute('limitRows') === 'Y';
            form.limitRowsNumber = writeToLogElement.getAttribute('limitRowsNumber') || '';
            form.logmessage = decodeURIComponent(writeToLogElement.getAttribute('logmessage') || '');
            form.fields = JSON.parse(writeToLogElement.getAttribute('fields') || '[]');
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
            const writeToLogElement = stepElements[0];
            // 更新属性
            writeToLogElement.setAttribute("label", form.stepName);
            writeToLogElement.setAttribute("loglevel", form.loglevel);
            writeToLogElement.setAttribute("displayHeader", form.displayHeader ? 'Y' : 'N');
            writeToLogElement.setAttribute("limitRows", form.limitRows ? 'Y' : 'N');
            writeToLogElement.setAttribute("limitRowsNumber", form.limitRowsNumber);
            writeToLogElement.setAttribute("logmessage", form.logmessage);
            writeToLogElement.setAttribute("fields", JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(writeToLogElement);
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
        prop: 'name',
        label: '字段',
    },
]);

const getLogLevel = async () => {
    try {
        let res = await systemLogLevel();
        logLevelList.value = res
    } catch {
        ElMessage.error("获取日志级别失败")
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


<style lang="scss" scoped></style>