<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="30%"
    @close="dialogVisible = false"
    title="行扁平化"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="auto">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入" clearable></el-input>
          </el-form-item>
          
          <el-form-item label="需要扁平化的字段：">
            <el-select v-model="form.field_name" placeholder="请选择" clearable filterable>
              <el-option
                v-for="item in nameColumnList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 其他表单项 -->
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
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const partitioningFieldList = ref([]);
const columnList = ref([]);
const flattenTheLinesRef = ref(null);

const form = reactive({
  stepName: "",
  field_name: "field_name",
  field: [],
});

const nameColumnList = ref([]);

const fieldDataColumns = computed(() => [
  { prop: "name", label: "目标字段",  },
]);

const stepName = ref('')
const fieldParentFunction = async (data) => {
  let params = {
    stepName: stepName.value,
    graphXml: allXml,
    before: true,
  };
  let res = await inputOutputFields(params);
  nextTick(() => {
    nameColumnList.value = JSON.parse(JSON.stringify(res));
  });
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
    console.log("parseStepInfoAndPopulateForm", stepInfoXml, '-', xmlDoc,1212);
    // 查找 step 元素
    let stepElements = xmlDoc.getElementsByTagName("Step");
    console.log("stepElements", stepElements);
    if (stepElements.length > 0) {
      const flattenTheLines = stepElements[0];
      console.log("flattenTheLines", flattenTheLines);
      // 填充表单字段
      form.stepName = flattenTheLines.getAttribute("label") || "";
      form.field_name = flattenTheLines.getAttribute("field_name") || "";
      form.field = JSON.parse(flattenTheLines.getAttribute("fields") || "[]");
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
      const flattenTheLines = stepElements[0];
      // 更新属性
      flattenTheLines.setAttribute("label", form.stepName);
      flattenTheLines.setAttribute("field_name", form.field_name);
      flattenTheLines.setAttribute("fields", JSON.stringify(form.field));
      // 返回更新后的XML
      return mxUtils.getPrettyXml(flattenTheLines);
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



const getPartitioningField = async () => {
  try {
    let params = {
      stepName: form.stepName,
      graphXml: allXml,
      before: true,
    };
    let res = await inputOutputFields(params);
    partitioningFieldList.value = res;
  } catch {
    ElMessage.error("获取分区字段失败");
  }
};

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
    nextTick(() => {
      fieldParentFunction()
    })
    
  }
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>