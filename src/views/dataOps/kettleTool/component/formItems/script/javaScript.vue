<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="dialogVisible = false" title="JavaScript代码"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <ScriptEditor ref="scriptEditorRef" :serverTreeData="scriptTreeList"
                        style="height: 400px;overflow: auto;" :jsScripts="form.jsScripts" />
                    <el-form label-position="right" label-width="120px">
                        <!-- <el-form-item label="兼容模式：">
                            <el-checkbox v-model="form.supports_error_handing"></el-checkbox>
                        </el-form-item> -->
                        <el-form-item label="优化级别：">
                            <el-input v-model="form.optimizationLevel" placeholder=""></el-input>
                        </el-form-item>
                    </el-form>
                    <RightClickTable ref="fileTableRef" v-model="form.fields" :columns="fieldDataColumns"
                        :showIndex="true" :height="200" style="width: 100%" :needSpecialFunction="true"
                        @parent-function="fieldParentFunction()">
                    </RightClickTable>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <!-- <szycButton type="primary" @click="handleTest">测试</szycButton> -->
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>

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
import SzycCancel from "@/components/element/Cancel.vue";;
import { inputOutputFields, getScriptTree, valueMeta, scriptTest } from "@/api/kettleApi/index";
import ScriptEditor from "../tools/ScriptEditor.vue";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const scriptTreeList = ref([]);
const scriptEditorRef = ref(null);

const form = reactive({
    stepName: "",
    fields: [],
    optimizationLevel: "",
    jsScripts: []
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
            const javaStepElement = stepElements[0];
            console.log("javaStepElement", javaStepElement);
            // 填充表单字段
            form.stepName = javaStepElement.getAttribute('label') || '';
            form.optimizationLevel = javaStepElement.getAttribute('optimizationLevel') || '';
            form.fields = JSON.parse(javaStepElement.getAttribute('fields') || '[]');
            form.jsScripts = JSON.parse(javaStepElement.getAttribute('jsScripts') || '[]');

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
            const javaStepElement = stepElements[0];
            // 更新属性
            javaStepElement.setAttribute("label", form.stepName);
            javaStepElement.setAttribute("optimizationLevel", form.optimizationLevel);
            javaStepElement.setAttribute("fields", JSON.stringify(form.fields));
            javaStepElement.setAttribute("jsScripts", JSON.stringify(scriptEditorRef.value.getData()));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(javaStepElement);
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
        prop: 'name',
        label: '字段名称',
    },
    {
        prop: 'rename',
        label: '改名为',
    },
    {
        prop: 'type',
        label: '类型',
        type: "select",
        options: valueMetaList.value,
        valueKey: "name",
        labelKey: "name",
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
        prop: "replace",
        label: "替换'FieldName'或'Rename to'值",
        type: "select",
        width: 300,
        options:
            [
                { label: "是", value: "Y" },
                { label: "否", value: "N" }
            ]
    }
]);


const promptDialogVisible = ref(false)
const promptResolve = ref(null)
const stepName = ref('')
const fieldParentFunction = async (data) => {
    let params = {
        stepName: stepName.value,
        graphXml: allXml,
        before: true
    };

    // 弹出提示框
    if (form.fields.length > 0) {
        const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
        let res = await inputOutputFields(params);
        // 根据用户选择处理数据
        handleFilesResult(result, res);
    } else {
        let res = await inputOutputFields(params);
        nextTick(() => {
            form.fields = res;
        })
    }
}

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

const handleTest = async () => {
    let params = {
        stepName: form.stepName,
        graphXml: allXml,
    };
    let res = await scriptTest(params);
    if (res.code === 200) {
        ElMessage.success("测试成功")
    } else {
        ElMessage.error("测试失败")
    }
}

// 显示弹窗并返回用户选择
const showPromptDialog = () => {
    return new Promise((resolve) => {
        promptDialogVisible.value = true
        promptResolve.value = resolve
    })
}

const handleFilesResult = (action, newData) => {
    // 格式化数据以适配表格显示
    // const formattedData = newData.map(item => ({
    //     name: item.name || '',
    // }));

    switch (action) {
        case 'addNew':
            // 增加新的（这里假设是新增数据中不存在于当前数据的项）
            newData.forEach(item => {
                if (!form.fields.some(existingItem => existingItem.name === item.name)) {
                    form.fields.push(item);
                }
            });
            break;
        case 'addAll':
            // 增加所有
            form.fields = [...form.fields, ...newData];
            break;
        case 'clearAndAddAll':
            // 清除并增加所有
            form.fields = newData;
            break;
        case 'cancel':
            // 取消
            break;
        default:
            break;
    }
};

const getJsTree = async () => {
    try {
        let params = {
            stepName: form.stepName,
            graphXml: allXml,
        };
        let res = await getScriptTree(params);
        scriptTreeList.value = res
    } catch {
        ElMessage.error("获取脚本树失败")
    }
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
        await getJsTree();
        await getvalueMeta();
    }
    dialogVisible.value = true;
};
const valueMetaList = ref([])
const getvalueMeta = async () => {
    let res = await valueMeta({});
    valueMetaList.value = res;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>