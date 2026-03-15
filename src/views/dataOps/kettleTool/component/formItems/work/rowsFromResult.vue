<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="40%"
    @close="dialogVisible = false"
    title="从结果获取记录"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="100px">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入"></el-input>
          </el-form-item>
        </el-form>
        <div>
          <RightClickTable
            ref="flattenTheLinesRef"
            :modelValue="form.field"
            :columns="fieldDataColumns"
            :showIndex="true"
            :height="550"
            style="width: 100%"
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
import { columnType, columnFormats } from "@/api/kettleApi/index";
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);

const form = reactive({
  stepName: "",
  field: [],
});

const columnTypeList = ref([])

const fieldDataColumns = computed(() => [
  {
    prop: "name",
    label: "字段名称",
    
  },
  { prop: "type", label: "类型", width: 180, type: "select",
    options: columnTypeList.value,
    valueKey: "type",
    labelKey: "type", },
  { prop: "length", label: "长度", width: 150 },
  { prop: "precision", label: "精度", width: 150 }
]);

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
      const rowsFromResult = stepElements[0];
      console.log("rowsFromResult", rowsFromResult);
      // 填充表单字段
      form.stepName = rowsFromResult.getAttribute("label") || "";
      form.field = JSON.parse(rowsFromResult.getAttribute("fields") || "[]");
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
      const rowsFromResult = stepElements[0];
      // 更新属性
      rowsFromResult.setAttribute("label", form.stepName);
      rowsFromResult.setAttribute("fields", JSON.stringify(form.field));
      return mxUtils.getPrettyXml(rowsFromResult);
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

const getColumnType = async () => {
  let res = await columnType({ name: "", type: "", format: "" });
  columnTypeList.value = res;
};

const openDialog = async (data) => {
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
  }
  await getColumnType();
  dialogVisible.value = true;
};



// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>