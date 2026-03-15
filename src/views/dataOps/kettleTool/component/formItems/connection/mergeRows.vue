<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="40%"
    @close="dialogVisible = false"
    title="合并记录"
    :destroy-on-close="true"
    :alignCenter="true"
  >
    <template #uname>
      <div class="mxgraphForm">
        <el-form :model="form" label-width="100px">
          <el-form-item label="步骤名称：">
            <el-input v-model="form.stepName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="旧数据源：">
            <el-select v-model="form.reference" placeholder="请选择">
                <el-option
                  v-for="(item, index) in dataSourceList"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
                >
                </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="新数据源：">
            <el-select v-model="form.compare" placeholder="请选择">
                <el-option
                  v-for="(item, index) in dataSourceList"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
                >
                </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标记字段：">
            <el-input v-model="form.flag_field" placeholder="请输入"></el-input>
          </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: space-between; width: 100%;">
          <div style="width: calc(50% - 10px)">
            <RightClickTable
              ref="mergeRowsKeysRef"
              :modelValue="form.fieldKeys"
              :columns="fieldKeysDataColumns"
              :showIndex="true"
              :height="300"
              style="width: 100%"
            >
            </RightClickTable>
          </div>
          <div style="width: calc(50% - 10px)">
            <RightClickTable
              ref="mergeRowsValuesRef"
              :modelValue="form.fieldValues"
              :columns="fieldValuesDataColumns"
              :showIndex="true"
              :height="300"
              style="width: 100%"
            >
            </RightClickTable>
          </div>
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
import RightClickTable from "../tools/rightClickTable.vue";
import { previousSteps } from "@/api/kettleApi/index";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);

const form = reactive({
  stepName: "",
  reference: "",
  compare: "",
  flag_field: "",
  fieldKeys: [],
  fieldValues: [],
});
const dataSourceList = ref([]);
const mergeRowsKeysRef = ref(null);
const mergeRowsValuesRef = ref(null);


const fieldKeysDataColumns = [
  {
    label: "关键字段",
    prop: "key",
  },
];

const fieldValuesDataColumns = [
  {
    label: "数据字段",
    prop: "value",
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
      form.reference = mergeRows.getAttribute("reference") || "";
      form.compare = mergeRows.getAttribute("compare") || "";
      form.flag_field = mergeRows.getAttribute("flag_field") || "";
      form.fieldKeys = JSON.parse(mergeRows.getAttribute("keys") || "[]");
      form.fieldValues = JSON.parse(mergeRows.getAttribute("values") || "[]");
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
      mergeRows.setAttribute("reference", form.reference);
      mergeRows.setAttribute("compare", form.compare);
      mergeRows.setAttribute("flag_field", form.flag_field);
      mergeRows.setAttribute("keys", JSON.stringify(form.fieldKeys));
      mergeRows.setAttribute("values", JSON.stringify(form.fieldValues));


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
    parseStepInfoAndPopulateForm(currentXml);
  }
  await getPreviousSteps(data.allXml)
  dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped></style>