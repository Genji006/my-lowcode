<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="35%"
    @close="dialogVisible = false"
    title="生成随机数"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="步骤名称：">
          <el-input v-model="editForm.stepName" placeholder="请输入"></el-input>
        </el-form-item>
        <!-- 其他表单项 -->
        <el-tabs type="border-card" v-model="activeTab" class="tabItem">
          <div class="dialog-content-table-wrapper">
            <ReusableTable
              v-model="randomDataList"
              :buttons="randomDataButtons"
              :columns="randomDataColumns"
              :default-row="defaultRandomDataRow"
              ref="randomDataTableRef"
            />
          </div>
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
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import ReusableTable from "../tools/ExcelFilesTable.vue";
import {
  columnType,
  columnFormats,
  randomValueFunc,
} from "@/api/kettleApi/index";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const randomValueFuncList = ref([]);
const dialogVisible = ref(false);
const activeTab = ref("file");
const editForm = reactive({
  stepName: "",
  fileName: "",
  ruleExpression: "",
  regexExclusion: "",
  getFromFileStep: false,
  previousStepFileName: "",
  // 其他表单字段
});

// 通过调用子组件方法添加文件
const addFiles = (tableRef) => {
  if (tableRef.value) {
    tableRef.value.addRow();
  }
};

// 通过调用子组件方法删除选中文件
const deleteSelectedFile = (tableRef) => {
  if (tableRef.value) {
    tableRef.value.deleteSelectedRow();
  }
};

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
let allXmlData = null;

const randomDataTableRef = ref(null);
const randomDataList = ref([]);
const randomDataButtons = ref([
  {
    label: "新增字段",
    handler: () => addFiles(randomDataTableRef),
    marginLeft: "5px",
  },
  {
    label: "删除",
    handler: () => deleteSelectedFile(randomDataTableRef),
    // disabled: () => !currentRow.value,
    marginLeft: "5px",
  },
]);
// 表格列配置
const randomDataColumns = ref([
  { prop: "name", label: "名称", width: 150 },
  {
    prop: "type",
    label: "类型",
    minWidth: 150,
    type: "select",
    options: randomValueFuncList,
    optionLabelKey: "descrp",
    optionValueKey: "type",
  },
]);

// 默认行数据
const defaultRandomDataRow = ref({
  name: "",
  type: "",
});

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
      const randomValueInput = stepElements[0];
      console.log("randomValueInput", randomValueInput);
      // 填充表单字段
      editForm.stepName = randomValueInput.getAttribute("label") || "";
      randomDataList.value =
        JSON.parse(randomValueInput.getAttribute("fields")) || []; // 根据实际需要调整
      console.log(
        "partitioning",
        JSON.parse(randomValueInput.getAttribute("partitioning"))
      );
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
    console.log("stepElements", stepElements);
    if (stepElements.length > 0) {
      const randomValueInput = stepElements[0];
      // 更新属性
      randomValueInput.setAttribute("label", editForm.stepName);
      randomValueInput.setAttribute(
        "fields",
        JSON.stringify(randomDataList.value)
      );
      // 返回更新后的XML
      return mxUtils.getPrettyXml(randomValueInput);
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
    currentGraph.getModel().setValue(currentCell, editForm.stepName);

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

const getRandomValueFunc = async () => {
  let res = await randomValueFunc({});
  randomValueFuncList.value = res;
};
const openDialog = async (data) => {
  await getRandomValueFunc();
  // 接收节点信息
  if (data && data.cell) {
    currentCell = data.cell;
    currentGraph = data.graph;
    currentXml = data.xml;
    // 将节点当前名称设置到表单中
    editForm.stepName = data.cell.value || "";
    parseStepInfoAndPopulateForm(currentXml);
    console.log("openDialog", data);
  }
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>

<style lang="scss" scoped>
.dialog-content-table-wrapper {
  height: 550px;
  overflow-y: auto;
}

.tabItem {
  margin-top: 10px;
}
</style>


<style lang="scss" >
.dialog-content-table-wrapper {
  .el-table__body td.el-table__cell{
      padding: 0 !important;
    
  }
  th.el-table__cell{
      padding: 0 !important;
  }

  .el-input__wrapper {
    border: none !important;
  }

  .el-select__wrapper {
    border: none !important;
  }
}
</style>