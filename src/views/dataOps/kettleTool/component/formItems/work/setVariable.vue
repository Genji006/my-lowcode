<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="40%"
    @close="dialogVisible = false"
    title="设置变量"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="100px">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-tabs type="border-card" v-model="activeTab" class="tabItem">
            <RightClickTable
              v-model="form.fields"
              :columns="fieldDataColumns"
              :showIndex="true"
              style="width: 100%"
              :needSpecialFunction="true"
              @parent-function="fieldParentFunction()"
            >
            </RightClickTable>
          </el-tabs>
        </el-form>
        <div
          style="
            display: flex;
            width: 100%;
            justify-content: center;
            margin-top: 20px;
          "
        >
          <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
          <szycButton type="primary" @click="handleConfirm">确定</szycButton>
        </div>
      </div>
    </template>
  </SzycDialog>

  <!-- 新增的自定义提示对话框 -->
  <SzycDialog
    :dialogVisible="promptDialogVisible"
    title="提示"
    width="500px"
    @close="handlePromptCancel"
  >
    <template #uname>
      <div style="margin: 20px 0; font-size: 14px">
        表中已经有数据，如何处理新找到的数据？
      </div>
      <div
        style="
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 20px;
        "
      >
        <szycButton @click="handlePromptAction('clearAndAddAll')"
          >清除并增加所有</szycButton
        >
        <szycButton type="primary" @click="handlePromptAction('addNew')"
          >增加新的</szycButton
        >
        <szycButton type="primary" @click="handlePromptAction('addAll')"
          >增加所有</szycButton
        >
        <SzycCancel @click="handlePromptAction('cancel')">取消</SzycCancel>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import {
  variableType,
  inputOutputFields,
  getFormats,
} from "@/api/kettleApi/index";
import DatabaseExplorerDialog from "../tools/DatabaseExplorerDialog.vue";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const partitioningFieldList = ref([]);
const columnList = ref([]);

const form = reactive({
  stepName: "",
  fields: [],
});

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
// 获取完整xml
let allXml = null;
let transName = ref("");
// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
  try {
    // 使用 mxUtils 解析 XML 字符串
    let xmlDoc = mxUtils.parseXml(stepInfoXml);
    console.log("parseStepInfoAndPopulateForm", stepInfoXml, xmlDoc);
    // 查找 step 元素
    let stepElements = xmlDoc.getElementsByTagName("Step");
    console.log("stepElements", stepElements);
    if (stepElements.length > 0) {
      const setVariable = stepElements[0];
      console.log("setVariable", setVariable);
      // 填充表单字段
      form.stepName = setVariable.getAttribute("label") || "";
      form.fields = JSON.parse(setVariable.getAttribute("fields") || "[]");
    }
  } catch (error) {
    console.error("解析stepInfo XML失败:", error);
    ElMessage.error("解析stepInfo XML数据失败");
  }
};

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
  try {
    let xmlDoc = mxUtils.parseXml(stepInfoXml);
    // 查找 step 元素
    const stepElements = xmlDoc.getElementsByTagName("Step");
    if (stepElements.length > 0) {
      const setVariable = stepElements[0];
      // 更新属性
      setVariable.setAttribute("label", form.stepName);
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
    currentGraph.getModel().setValue(currentCell, form.stepName);

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
    prop: "field_name",
    label: "字段名称",
  },
  {
    prop: "variable_name",
    label: "变量名",
  },
  {
    prop: "variable_type",
    label: "变量活动类型",
    type: "select",
    options: variableTypeList.value,
    valueKey: "code",
    labelKey: "desc",
    width: 300,
  },
  {
    prop: "default_value",
    label: "默认值",
    width: 120,
  },
]);

const variableTypeList = ref([]);
const columnFormatsList = ref([]);
const getVariableType = async () => {
  let res = await variableType();
  variableTypeList.value = res;
};


const stepName = ref('')

const getPartitioningField = async () => {
  try {
    let params = {
      stepName: stepName.value,
      graphXml: allXml,
      before: true,
    };
    let res = await inputOutputFields(params);
    partitioningFieldList.value = res;
  } catch {
    ElMessage.error("获取分区字段失败");
  }
};

const fieldParentFunction = async () => {
  let params = {
    stepName: stepName.value,
    graphXml: allXml,
    before: true,
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
      form.fields = res.map((item) => ({
        field_name: item.name,
      }));
    });
  }
};

const promptDialogVisible = ref(false);
const promptResolve = ref(null);
// 处理提示对话框的按钮点击
const handlePromptAction = (action) => {
  promptDialogVisible.value = false;
  if (promptResolve.value) {
    promptResolve.value(action);
    promptResolve.value = null;
  }
};

// 处理提示对话框的取消操作
const handlePromptCancel = () => {
  promptDialogVisible.value = false;
  if (promptResolve.value) {
    promptResolve.value("cancel");
    promptResolve.value = null;
  }
};

// 显示弹窗并返回用户选择
const showPromptDialog = () => {
  return new Promise((resolve) => {
    promptDialogVisible.value = true;
    promptResolve.value = resolve;
  });
};

const handleFilesResult = (action, newData) => {
  // 格式化数据以适配表格显示
  let formattedData = newData.map((item) => ({
    field_name: item.name,
  }));
  switch (action) {
    case "addNew":
      // 增加新的（这里假设是新增数据中不存在于当前数据的项）
      formattedData.forEach((item) => {
        if (
          !form.fields.some((existingItem) => existingItem.name === item.name)
        ) {
          form.fields.push(item);
        }
      });
      break;
    case "addAll":
      // 增加所有
      form.fields = [...form.fields, ...formattedData];
      break;
    case "clearAndAddAll":
      // 清除并增加所有
      form.fields = formattedData;
      break;
    case "cancel":
      // 取消
      break;
    default:
      break;
  }
};

const openDialog = async (data) => {
  await getVariableType();
  // 接收节点信息
  if (data && data.cell) {
    currentCell = data.cell;
    currentGraph = data.graph;
    currentXml = data.xml;
    allXml = data.allXml;
    transName.value = data.transName;
    // 将节点当前名称设置到表单中
    form.stepName = data.cell.value || "";
    parseStepInfoAndPopulateForm(currentXml);
    await getPartitioningField();
  }
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>