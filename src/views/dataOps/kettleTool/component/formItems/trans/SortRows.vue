<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="40%"
    @close="dialogVisible = false"
    title="排序记录"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="auto">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="排序目录：">
            <el-input
              v-model="form.directory"
              placeholder="请输入"
              style="width: calc(100% - 70px); margin-right: 10px"
            ></el-input>
            <el-button @click="showFileExplorer = true">浏览</el-button>
          </el-form-item>
          <el-form-item label="临时文件前缀：">
            <el-input v-model="form.prefix" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="排序缓存大小（内存里存放的记录数）：">
            <el-input v-model="form.sort_size" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="未使用内存限值（%）：">
            <el-input
              v-model="form.free_memory"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="压缩临时文件？：">
            <el-checkbox v-model="form.compress" value="Y" size="large" />
          </el-form-item>
          <el-form-item label="仅仅传递非重复的记录？（仅仅校验关键字）：">
            <el-checkbox v-model="form.unique_rows" value="Y" size="large" />
          </el-form-item>
          <!-- 其他表单项 -->
        </el-form>
        <div>
          <RightClickTable
            ref="rowtoColumnRef"
            :modelValue="form.fields"
            :columns="fieldDataColumns"
            :showIndex="true"
            :height="300"
            style="width: 100%"
            :needSpecialFunction="true"
            :specialFunction="'获取变量'"
            @parent-function="fieldParentFunction"
          >
          </RightClickTable>
        </div>
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

  <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import {
  getDatabases,
  inputOutputFields,
  tableFields,
} from "@/api/kettleApi/index";
import RightClickTable from "../tools/rightClickTable.vue";
import FileExplorerWindow from '../tools/FileExplorerWindow.vue'

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const partitioningFieldList = ref([]);
const columnList = ref([]);
const rowtoColumnRef = ref(null);
const showFileExplorer = ref(false);

const form = reactive({
  stepName: "",
  directory: "",
  prefix: "",
  sort_size: "",
  free_memory: "",
  compress: "",
  unique_rows: "",
  fields: [],
});

const nameColumnList = ref([]);

const fieldDataColumns = computed(() => [
  {
    prop: "name",
    label: "字段名称",
    type: "select",
    width: 200,
    options: partitioningFieldList.value,
    valueKey: "name",
    labelKey: "name",
  },
  {
    prop: "ascending",
    label: "升序",
    type: "select",
    options: [
      { value: "Y", label: "是" },
      { value: "N", label: "否" },
    ],
    valueKey: "value",
    labelKey: "label",
  },
  {
    prop: "case_sensitive",
    label: "大小写敏感",
    type: "select",
    width: 200,
    options: [
      { value: "Y", label: "是" },
      { value: "N", label: "否" },
    ],
    valueKey: "value",
    labelKey: "label",
  },
  // {
  //   prop: "value",
  //   label: "Sort based on current locale?",
  //   type: "select",
  //   width: 200,
  //   options: [
  //     { value: "Y", label: "是" },
  //     { value: "N", label: "否" },
  //   ],
  //   valueKey: "value",
  //   labelKey: "label",

  // },
  // {
  //   prop: "value",
  //   label: "Collator Strength",
  //    type: "select",
  //   width: 200,
  //   options: [
  //     { value: "1", label: "1" },
  //     { value: "2", label: "2" },
  //     { value: "3", label: "3" },
  //     { value: "4", label: "4" },
  //   ],
  //   valueKey: "value",
  //   labelKey: "label",

  // },
  {
    prop: "presorted",
    label: "presorted?",
    type: "select",
    width: 200,
    options: [
      { value: "Y", label: "是" },
      { value: "N", label: "否" },
    ],
    valueKey: "value",
    labelKey: "label",
  },
]);

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
    name: item.name,
    ascending: item.ascending,
    case_sensitive: item.case_sensitive,
    presorted: item.presorted,
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

const fieldParentFunction = async (data) => {
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
        name: item.name,
        ascending: item.ascending,
        case_sensitive: item.case_sensitive,
        presorted: item.presorted,
      }));
    });
  }
};

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
    console.log("parseStepInfoAndPopulateForm", stepInfoXml, "-", xmlDoc, 1212);
    // 查找 step 元素
    let stepElements = xmlDoc.getElementsByTagName("Step");
    console.log("stepElements", stepElements);
    if (stepElements.length > 0) {
      const rowtoColumn = stepElements[0];
      console.log("rowtoColumn", rowtoColumn);
      // 填充表单字段
      form.stepName = rowtoColumn.getAttribute("label") || "";
      form.directory = rowtoColumn.getAttribute("directory") || "";
      form.prefix = rowtoColumn.getAttribute("prefix") || "";
      form.sort_size = rowtoColumn.getAttribute("sort_size") || "";
      form.free_memory = rowtoColumn.getAttribute("free_memory") || "";
      form.compress =
        rowtoColumn.getAttribute("compress") == "Y" ? true : false;
      form.unique_rows =
        rowtoColumn.getAttribute("unique_rows") == "Y" ? true : false;
      form.fields = JSON.parse(rowtoColumn.getAttribute("fields") || "[]");
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
      const rowtoColumn = stepElements[0];
      // 更新属性
      rowtoColumn.setAttribute("label", form.stepName);
      rowtoColumn.setAttribute("directory", form.directory);
      rowtoColumn.setAttribute("prefix", form.prefix);
      rowtoColumn.setAttribute("sort_size", form.sort_size);
      rowtoColumn.setAttribute("free_memory", form.free_memory);
      rowtoColumn.setAttribute("compress", form.compress == true ? "Y" : "N");
      rowtoColumn.setAttribute(
        "unique_rows",
        form.unique_rows == true ? "Y" : "N"
      );

      rowtoColumn.setAttribute("fields", JSON.stringify(form.fields));
      // 返回更新后的XML
      return mxUtils.getPrettyXml(rowtoColumn);
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
const stepName = ref("");
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

const handleFileSelected = (filePath) => {
  form.directory = filePath + form.directory;
  showFileExplorer.value = false;
}

const openDialog = (data) => {
  // 接收节点信息
  if (data && data.cell) {
    currentCell = data.cell;
    currentGraph = data.graph;
    currentXml = data.xml;
    allXml = data.allXml;
    transName.value = data.transName;
    // 将节点当前名称设置到表单中
    form.stepName = data.cell.value || "";
    stepName.value = data.cell.value || "";
    parseStepInfoAndPopulateForm(currentXml);
    getPartitioningField();
  }
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>