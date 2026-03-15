<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="dialogVisible = false" title="记录关联 (笛卡尔输出)"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder=""></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="200px">
                            <el-form-item label="临时目录：">
                                <el-input v-model="form.directory" style="width: 92%;"></el-input>
                                <el-button @click="openFileExplorer" style="margin-left: 5px;">浏览</el-button>
                            </el-form-item>
                            <el-form-item label="临时文件前缀：">
                                <el-input v-model="form.prefix" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="最大缓存大小(记录行)：">
                                <el-input v-model="form.cache_size" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="Main step to read form：">
                                <el-select v-model="form.main" style="width: 100%;" placeholder="">
                                    <el-option v-for="item in targetStepList" :key="item.name" :label="item.name"
                                        :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="条件：">
                                <filterBuilder v-model="condition" :index="-1" style="height: 500px; overflow: auto;"
                                    :field-options="fieldOptions" />
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
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { inputOutputFields, valueMeta, getTargetSteps } from "@/api/kettleApi/index";
import filterBuilder from "../tools/filterBuilder.vue";
import FileExplorerWindow from '../tools/FileExplorerWindow.vue'

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const targetStepList = ref([])
const fieldOptions = ref([])

const form = reactive({
    stepName: "",
    directory: "",
    prefix: "",
    cache_size: "",
    main: "",
});
const condition = ref({})


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
            const joinRowsElement = stepElements[0];
            console.log("joinRowsElement", joinRowsElement);
            // 填充表单字段
            form.stepName = joinRowsElement.getAttribute('label') || '';
            form.directory = joinRowsElement.getAttribute('directory') || '';
            form.prefix = joinRowsElement.getAttribute('prefix') || '';
            form.cache_size = joinRowsElement.getAttribute('cache_size') || '';
            form.main = joinRowsElement.getAttribute('main') || '';
            condition.value = JSON.parse(joinRowsElement.getAttribute('condition') || '{}');
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
            const joinRowsElement = stepElements[0];
            // 更新属性
            joinRowsElement.setAttribute("label", form.stepName);
            joinRowsElement.setAttribute("directory", form.directory);
            joinRowsElement.setAttribute("prefix", form.prefix);
            joinRowsElement.setAttribute("cache_size", form.cache_size);
            joinRowsElement.setAttribute("main", form.main);
            joinRowsElement.setAttribute("condition", JSON.stringify(condition.value));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(joinRowsElement);
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

const getTargetStep = async () => {
    try {
        let params = {
            stepName: form.stepName,
            graphXml: allXml,
            query: ""
        };
        let res = await getTargetSteps(params);
        targetStepList.value = res
    } catch {
        // ElMessage.error("获取步骤失败")
    }
}
const stepName = ref('')
const getPartitioningField = async () => {
    try {
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
            before: true,
        };
        let res = await inputOutputFields(params);
        fieldOptions.value = res.map(item => ({
            label: item.name,
            value: item.name,
        }))
    } catch {
        // ElMessage.error("获取分区字段失败")
    }
}

const showFileExplorer = ref(false)
// 打开文件浏览器窗口并设置当前字段
const openFileExplorer = () => {
    showFileExplorer.value = true
}

const handleFileSelected = (path) => {
    form.directory = path
}


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
        await getPartitioningField()
        await getTargetStep()
    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>