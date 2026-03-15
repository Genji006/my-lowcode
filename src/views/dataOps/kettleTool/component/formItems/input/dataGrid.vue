<!-- 自定义常量数据 -->
<template>
  <SzycDialog
    :dialogVisible="dialogVisible"
    width="70%"
    @close="dialogVisible = false"
    title="自定义常量数据"
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
            <el-tab-pane label="元数据" name="file">
              <ReusableTable
                v-model="meteDataList"
                :buttons="meteDataButtons"
                :columns="meteDataColumns"
                :default-row="defaultMeteDataRow"
                ref="meteDataTableRef"
              />
            </el-tab-pane>
            <el-tab-pane label="数据" name="content">
              <ReusableTable
                v-model="dataList"
                :buttons="dataButtons"
                :columns="dataColumns"
                 :default-row="defaultDataRow"
                ref="dataTableRef"
              />
            </el-tab-pane>
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
import { columnType, columnFormats } from "@/api/kettleApi/index";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(['update-step'])


const columnTypeList = ref([]);
const columnFormatsList = ref([]);
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

const meteDataTableRef = ref(null);
const meteDataList = ref([]);
const meteDataButtons = ref([
  {
    label: "新增字段",
    handler: () => addFiles(meteDataTableRef),
    marginLeft: "5px",
  },
  {
    label: "删除",
    handler: () => deleteSelectedFile(meteDataTableRef),
    // disabled: () => !currentRow.value,
    marginLeft: "5px",
  },
]);
// 表格列配置
const meteDataColumns = ref([
  { prop: "name", label: "名称", minWidth: 100 },
  {
    prop: "type",
    label: "类型",
    minWidth: 150,
    type: "select",
    options: columnTypeList,
  },
  {
    prop: "format",
    label: "格式",
    minWidth: 150,
    type: "select",
    options: columnFormatsList,
  },
  {
    prop: "length",
    label: "长度",
    minWidth: 120,
  },
  {
    prop: "precision",
    label: "精度",
    minWidth: 120,
  },
  {
    prop: "currencyType",
    label: "货币类型",
    minWidth: 120,
  },
  {
    prop: "decimal",
    label: "小数",
    minWidth: 120,
  },
  {
    prop: "group",
    label: "分组",
    minWidth: 120,
  },
  {
    prop: "nullable",
    label: "设为空串",
    minWidth: 120,
    type: 'select',
    options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' }
    ]
  },
]);

// 默认行数据
const defaultMeteDataRow = ref({
  name: "",
  type: "",
  format: "",
  length: "",
  precision: "",
});

const dataTableRef = ref(null);
const dataList = ref([]);
const dataButtons = ref([
  {
    label: "新增字段",
    handler: () => addFiles(dataTableRef),
    marginLeft: "5px",
  },
  {
    label: "删除",
    handler: () => deleteSelectedFile(dataTableRef),
    // disabled: () => !currentRow.value,
    marginLeft: "5px",
  },
]);
const dataColumns = computed(() => {
  return meteDataList.value.map((item) => ({
    prop: item.name,
    label: item.name,
    minWidth: 100
  }));
});

const defaultDataRow = computed(() => {
  return meteDataList.value.map((item) => {
    let defaultValue = undefined;
    return {
      [item.name]: defaultValue,
    };
  });
});

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
            const dataGridInput = stepElements[0];
            console.log("dataGridInput", dataGridInput);
            // 填充表单字段
            editForm.stepName = dataGridInput.getAttribute('label') || '';
            meteDataList.value = JSON.parse(dataGridInput.getAttribute("fields")) || []; // 根据实际需要调整
            console.log("partitioning", meteDataList.value);
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
    console.log("stepElements", stepElements);
    if (stepElements.length > 0) {
      const dataGridInput = stepElements[0];
      // 更新属性
      dataGridInput.setAttribute("label", editForm.stepName);
      dataGridInput.setAttribute("fields", JSON.stringify(meteDataList.value));
      // 返回更新后的XML
      return mxUtils.getPrettyXml(dataGridInput);
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

const getColumnType = async () => {
  let res = await columnType({ name: "", type: "", format: "" });
  columnTypeList.value = res;
};

const getcolumnFormats = async () => {
  let res = await columnFormats({});
  columnFormatsList.value = res;
};
const openDialog = (data) => {
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
  getColumnType();
  getcolumnFormats();
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