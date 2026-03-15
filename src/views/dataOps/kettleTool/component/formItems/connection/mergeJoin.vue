<template>
  <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="dialogVisible = false" title="记录集连接"
    :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="100px">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="第一个步骤：">
            <el-select v-model="form.step1" placeholder="请选择">
              <el-option v-for="(item, index) in dataSourceList" :key="index" :label="item.name" :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="第二个步骤：">
            <el-select v-model="form.step2" placeholder="请选择">
              <el-option v-for="(item, index) in dataSourceList" :key="index" :label="item.name" :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="连接类型：">
            <el-select v-model="form.join_type" placeholder="请输入">
              <el-option v-for="(item, index) in joinTypeList" :key="index" :label="item.name" :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: space-between; width: 100%;">
          <div style="width: calc(50% - 10px)">
            <RightClickTable ref="mergeRowsKeysRef" :modelValue="form.fieldKeys" :columns="fieldKeysDataColumns"
              :showIndex="true" :height="300" style="width: 100%" :needSpecialFunction="true"
              :specialFunction="'获取连接字段'" @parent-function="fieldParentFunction(1)">
            </RightClickTable>
          </div>
          <div style="width: calc(50% - 10px)">
            <RightClickTable ref="mergeRowsValuesRef" :modelValue="form.fieldValues" :columns="fieldValuesDataColumns"
              :showIndex="true" :height="300" style="width: 100%" :needSpecialFunction="true" :specialFunction="'获取字段'"
              @parent-function="fieldParentFunction(2)">
            </RightClickTable>
          </div>
        </div>

        <div style="
            display: flex;
            width: 100%;
            justify-content: center;
            margin-top: 20px;
          ">
          <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
          <szycButton type="primary" @click="handleConfirm">确定</szycButton>
        </div>
      </div>
    </template>
  </SzycDialog>
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
import SzycCancel from "@/components/element/Cancel.vue";
import RightClickTable from "../tools/rightClickTable.vue";
import { previousSteps, mergejoinTypes, inputOutputFields } from "@/api/kettleApi/index";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);

const form = reactive({
  stepName: "",
  step1: "",
  step2: "",
  join_type: "",
  fieldKeys: [],
  fieldValues: [],
});
const dataSourceList = ref([]);
const joinTypeList = ref([]);
const mergeRowsKeysRef = ref(null);
const mergeRowsValuesRef = ref(null);


const fieldKeysDataColumns = [
  {
    label: "连接字段",
    prop: "key",
  },
];

const fieldValuesDataColumns = [
  {
    label: "连接字段",
    prop: "key",
  },
];


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
      const mergeRows = stepElements[0];
      console.log("mergeRows", mergeRows);
      // 填充表单字段
      form.stepName = mergeRows.getAttribute("label") || "";
      form.step1 = mergeRows.getAttribute("step1") || "";
      form.step2 = mergeRows.getAttribute("step2") || "";
      form.join_type = mergeRows.getAttribute("join_type") || "";
      form.fieldKeys = JSON.parse(mergeRows.getAttribute("key1") || "[]");
      form.fieldValues = JSON.parse(mergeRows.getAttribute("key2") || "[]");
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
      const mergeRows = stepElements[0];
      // 更新属性
      mergeRows.setAttribute("label", form.stepName);
      mergeRows.setAttribute("step1", form.step1);
      mergeRows.setAttribute("step2", form.step2);
      mergeRows.setAttribute("join_type", form.join_type);
      mergeRows.setAttribute("key1", JSON.stringify(form.fieldKeys));
      mergeRows.setAttribute("key2", JSON.stringify(form.fieldValues));


      return mxUtils.getPrettyXml(mergeRows);
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

const getPreviousSteps = async (val) => {
  let params = {
    graphXml: val,
    stepName: form.stepName,
  };
  let res = await previousSteps(params);
  // console.log("res", res);
  dataSourceList.value = res?.length ? res : [];
};

const getMergejoinTypes = async () => {
  let res = await mergejoinTypes();
  joinTypeList.value = res?.length ? res : [];
}


const promptDialogVisible = ref(false)
const promptResolve = ref(null)
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

// 显示弹窗并返回用户选择
const showPromptDialog = () => {
  return new Promise((resolve) => {
    promptDialogVisible.value = true
    promptResolve.value = resolve
  })
}

const stepName = ref("")
const fieldParentFunction = async (data) => {
  if (data == 1) {
    let params = {
      stepName: form.step1,
      graphXml: allXml,
      before: true
    };
    // 弹出提示框
    if (form.fieldKeys.length > 0) {
      const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
      let res = await inputOutputFields(params);
      // 根据用户选择处理数据
      handleFilesResult(result, res, 1);
    } else {
      let res = await inputOutputFields(params);
      nextTick(() => {
        form.fieldKeys = res.map(item => ({
          key: item.name,
        }));
      })
    }
  } else if (data == 2) {
    let params = {
      stepName: form.step2,
      graphXml: allXml,
      before: true
    };
    // 弹出提示框
    if (form.fieldValues.length > 0) {
      const result = await showPromptDialog(); // 自定义方法显示弹窗并返回用户选择
      let res = await inputOutputFields(params);
      // 根据用户选择处理数据
      handleFilesResult(result, res, 2);
    } else {
      let res = await inputOutputFields(params);
      nextTick(() => {
        form.fieldValues = res.map(item => ({
          key: item.name,
        }));
      })
    }
  }
}

const handleFilesResult = (action, newData, data) => {
  // 格式化数据以适配表格显示
  let formattedData = newData.map(item => ({
    key: item.name,
  }));
  if (data == 1) {
    switch (action) {
      case 'addNew':
        // 增加新的（这里假设是新增数据中不存在于当前数据的项）
        formattedData.forEach(item => {
          if (!form.fieldKeys.some(existingItem => existingItem.key === item.key)) {
            form.fieldKeys.push(item);
          }
        });
        break;
      case 'addAll':
        // 增加所有
        form.fieldKeys = [...form.fieldKeys, ...formattedData];
        break;
      case 'clearAndAddAll':
        // 清除并增加所有
        form.fieldKeys = formattedData;
        break;
      case 'cancel':
        // 取消
        break;
      default:
        break;
    }
  } else if (data == 2) {
    switch (action) {
      case 'addNew':
        // 增加新的（这里假设是新增数据中不存在于当前数据的项）
        formattedData.forEach(item => {
          if (!form.fieldValues.some(existingItem => existingItem.key === item.key)) {
            form.fieldValues.push(item);
          }
        });
        break;
      case 'addAll':
        // 增加所有
        form.fieldValues = [...form.fieldValues, ...formattedData];
        break;
      case 'clearAndAddAll':
        // 清除并增加所有
        form.fieldValues = formattedData;
        break;
      case 'cancel':
        // 取消
        break;
      default:
        break;
    }
  }

};

const openDialog = async (data) => {
  console.log("openDialog", data);
  // 接收节点信息
  if (data && data.cell) {
    currentCell = data.cell;
    currentGraph = data.graph;
    currentXml = data.xml;
    allXml = data.allXml;
    transName.value = data.transName;
    // 将节点当前名称设置到表单中
    form.stepName = data.cell.value || "";
    stepName.value = data.cell.value || ""
    parseStepInfoAndPopulateForm(currentXml);
  }
  await getPreviousSteps(data.allXml)
  await getMergejoinTypes()
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>