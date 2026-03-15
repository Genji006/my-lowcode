<template>
  <div class="anaEngineManagement-all-class">
    <div class="anaEngineManagement-search-class">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset"
        @searchVal="handleSearch">
      </searchForm>
    </div>
    <div class="anaEngineManagement-table-class">
      <tableAndPage ref="tableRef" apiUrl="/business/dataAnalysisEngineInfo/page" :queryParams="queryParams"
        :btnList="operationList" :designTableColumns="designTableColumns" :showBorder="true" @btnClick="buttonClick"
        :light="true" @selection-change="handleSelectionChange" @row-click="rowClick" primaryKey="uuid"
        :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }" @statusClick="switchChange" :justBtn="true">
        <template #executeStatus="{ row }">
          <div :class="getExecuteStatusClass(row.executeStatus)" class="execute-default">{{
            executeStatusFn(row.executeStatus, "formatter") }}
          </div>
        </template>
        <template #scriptConfig="{ row }">
          <div style="margin: auto;" :class="row.scriptConfig === '1' ? 'status1' : 'status2'">{{
            scriptConfigFn(row.scriptConfig,
              "formatter") }}
          </div>
        </template>
        <template #analysisPeriod="{ row }">
          <div v-if="row.analysisPeriod">{{ row.analysisPeriod }}年</div>
        </template>
      </tableAndPage>
    </div>
  </div>
  <!-- 新增-->
  <SzycDialog :dialogVisible="addOrEditShow" :close-on-click-modal="false" :title="addOrEditTitle" width="70%"
    @close="closeAddOrEdit()">
    <template #uname>
      <div class="anaEngineManagement-addOrEdit">
        <el-form :label-position="labelPosition" label-width="auto" :inline="true" :model="addOrEditForm"
          ref="addOrEditFormRef" :rules="addOrEditFormRules">
          <div>
            <div
              style="display: flex; align-items: center; margin-bottom: 10px; color: rgba(0, 0, 0, 1); border-bottom: 1px solid rgba(201, 201, 201, 1); padding-bottom: 10px;font-weight: 500;">
              <!-- <img src="/src/assets/ItemImg/peizhi.svg" style="margin-right: 4px" width="16px" /> -->
              基础信息
            </div>
            <div class="el-form-item-class">
              <el-form-item label="分析引擎名称：" prop="analysisName">
                <el-input v-model="addOrEditForm.analysisName" placeholder="" />
              </el-form-item>

              <el-form-item label="分析引擎编码：" prop="analysisCode">
                <div style="display: flex;">
                  <el-input v-model="addOrEditForm.analysisCode" disabled>
                    <!-- <template #suffix>
                    <span @click="cereteCode()" v-if="addOrEditTitle == '新增'"
                      style="padding: 0 5px; margin-right: -5px; height: auto;cursor: pointer;color: #5380FD;">
                      生成编码
                    </span>
                  </template> -->
                  </el-input>
                  <el-button class="custom-button" @click="cereteCode()" style="margin-left: 5px;">
                    <img src="/src/assets/ItemImg/shengchengbianma.svg" style="margin-right: 5px;" /> 生成编码
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="关联模型：" prop="modelUuid">
                <el-select v-model="addOrEditForm.modelUuid" placeholder="请选择" @change="changeModel">
                  <el-option v-for="(item, index) in modelList" :key="item.uuid" :label="item.modelName"
                    :value="item.uuid" />
                </el-select>
              </el-form-item>
              <el-form-item label="模型版本号：" prop="modelVersion">
                <el-input placeholder="" v-model="addOrEditForm.modelVersion" disabled>
                </el-input>
              </el-form-item>
              <el-form-item label="模型类别：" prop="modelType" disabled>
                <el-select v-model="addOrEditForm.modelType" placeholder="请选择" disabled>
                  <el-option v-for="item in modelTypeList" :key="item.dictCode" :label="item.dictLabel"
                    :value="item.dictValue" />
                </el-select>
              </el-form-item>
              <el-form-item label="分析周期：" prop="modelPeriod" disabled label-width="217px">
                <el-input v-model="addOrEditForm.modelPeriod" placeholder="" disabled>
                  <template #suffix>
                    <span>年</span>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="分析引擎说明：" prop="analysisDescription">
                <el-input v-model="addOrEditForm.analysisDescription" placeholder="" style="width: 628px" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="可用否：" prop="available" label-width="217px">
                <el-switch v-model="addOrEditForm.available" :active-value="'1'" :inactive-value="'0'" />
              </el-form-item>
            </div>
          </div>
          <div>
            <div>
              <div
                style="display: flex; align-items: center; margin: 20px 0 10px;  color: rgba(0, 0, 0, 1); border-bottom: 1px solid rgba(201, 201, 201, 1); padding-bottom: 10px;font-weight: 500;">
                <!-- <img src="/src/assets/ItemImg/zxyqmx.svg" style="margin-right: 4px" /> -->
                执行引擎明细
              </div>
              <div class="el-form-item-class" style="height:300px;overflow-y: auto;">
                <tableAndPage ref="engineDetailstableRef" apiUrl="/business/scriptInfo/listScriptInfoAnalysisEngine"
                  :queryParams="engineDetailsQueryParam" primaryKey="uuid" :designTableColumns="engineDetailsColumns"
                  @selection-change="engineDetailsSelectionChange" :light="true" v-bind="{ showBorder: 1, pageOpen: 0 }"
                  :selectSettings="{ key: 'allocationSign', label: '1' }">
                  <template #indexCount="{ row }">
                    <div class="clickable-blue-class" @click.stop="indexDetail(row)">
                      {{ row.indexCount }}
                    </div>
                  </template>
                </tableAndPage>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="closeAddOrEdit"> 取消 </CanCelBtn>
        <buttonDiv @click="addOrEditSubmit"> 保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <!-- 指标明细 -->
  <SzycDialog :dialogVisible="indexDetailShow" :close-on-click-modal="false" title="指标明细" width="60%"
    @close="closeIndexDetail()">
    <template #uname>
      <div class="anaEngineManagement-search-class changeSearch">
        <searchForm :modelValue="indexDetailParams" :items="indexDetailItems" :inline="true" labelWidth=""
          @reset="zbhandleReset" @searchVal="zbhandleSearch">
        </searchForm>
      </div>
      <div class="anaEngineManagement-table-class">
        <tableAndPage ref="zbtableRef" apiUrl="/business/scriptInfo/listIndex" :queryParams="indexDetailParams"
          :designTableColumns="indexDetailTableColumns" :showBorder="true" primaryKey="uuid" :checkBox="false"
          :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }" style="height: 500px;">
        </tableAndPage>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="indexDetailBtnClick"> 返回 </CanCelBtn>
      </div>
    </template>
  </SzycDialog>
  <SzycDialog :dialogVisible="engineShow" :close-on-click-modal="false" destroy-on-close title="执行进度" width="80%"
    @close="closeEngineExecution" :alignCenter="true">
    <template #uname>
      <EngineExecution :engine-name="engineinfo.engineName" :model="engineinfo.model" :model-type="engineinfo.modelType"
        :model-category="engineinfo.modelCategory" :uuid="propsUuid" ref="engineExecutionRef" />
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="closeEngineExecution">返回 </CanCelBtn>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch, h, markRaw } from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import {
  yesOrNoFn,
  isStandardModelFn,
  analysisCycleTypeFn,
  scriptConfigFn,
  executeStatusFn
} from "@/types/dict/index.js";
import {
  genCode,
  getAnalyticalModel,
  insertEngine,
  deleteEngine,
  updateEngine,
  copyDataAnalysisEngineInfo,
  analysisEngineExecute
} from "@/api/modelIndexManage/anaEngineManagement.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { dictStore } from '@/store/dict'
import EngineExecution from "./engineExecution.vue";

const DeleteIconComponent = {
  setup() {
    return () => h('img', {
      src: '/src/assets/ItemImg/deleteIcon.svg',
      style: {
        width: '30px',
        height: '25px'
      }
    });
  }
};

const dictKey = dictStore()
const router = useRouter();

const engineShow = ref(false)
const engineExecutionRef = ref(null)

const tableRef = ref(null);
const zbtableRef = ref(null);
const engineDetailstableRef = ref(null)

const addOrEditShow = ref(false);
const addOrEditFormRef = ref(null);
const addOrEditTitle = ref("");
const engineDetailsTableData = ref([
  {
    indexNum: 1,
  },
]);

const indexDetailShow = ref(false);

//  查询条件
const queryParams = reactive({
  modelVersion: "", //  版本号
  analysisName: "", //  引擎名称
  executeStatus: "", //  引擎状态
  modelUuid: "", //  关联模型
});

const searchItems = computed(() => [
  {
    component: "el-input",
    label: "模型版本号：",
    style: { width: "250px" },
    prop: "modelVersion",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-input",
    label: "引擎名称：",
    style: { width: "250px" },
    prop: "analysisName",
    attrs: { placeholder: "请选择", clearable: true },
  },
  {
    component: "el-select",
    label: "引擎状态：",
    style: { width: "250px" },
    prop: "executeStatus",
    attrs: { placeholder: "请选择", clearable: true },
    options: executeStatusFn(),
  },
  {
    component: "el-select",
    label: "关联模型：",
    style: { width: "250px" },
    prop: "modelUuid",
    optionLabel: "modelName",
    optionValue: "uuid",
    attrs: { placeholder: "请选择", clearable: true },
    options: modelList.value,
  },
]);

//  查询
const handleSearch = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData();
};

const handleReset = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("重置");
};

const getExecuteStatusClass = (status) => {
  switch (status) {
    case '0': // 未分析
      return 'execute_status0';
    case '1': // 已分析
      return 'execute_status1';
    case '2': // 分析中
      return 'execute_status2';
    case '4': // 暂停中
      return 'execute_status3';
    case '9': // 异常
      return 'execute_status0';
    default:
      return '';
  }
}

const engineArray = ref([])
// 获取选择的数据
const handleSelectionChange = (val) => {
  engineArray.value = val
}

//  表格数据
const designTableColumns = ref([
  {
    columnLabel: "模型版本号",
    columnName: "modelVersion",
    align: "center",
    columnWidth: "100",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "引擎编号",
    columnName: "analysisCode",
    align: "left",
    columnWidth: "180",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "引擎名称",
    columnName: "analysisName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "关联模型",
    columnName: "modelName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "模型类型",
    columnName: "standardModel",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return isStandardModelFn(row.standardModel, "formatter");
    },
  },
  {
    columnLabel: "模型类别",
    columnName: "modelClass",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return modelTypeList.value.find(item => item.dictValue === row.modelType)?.dictLabel || "";
    },
  },

  {
    columnLabel: "分析周期",
    columnName: "analysisPeriod",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
    hasSlot: true,
  },
  {
    columnLabel: "引擎状态",
    columnName: "executeStatus",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
    hasSlot: true,
  },
  {
    columnLabel: "脚本配置情况",
    columnName: "scriptConfig",
    columnWidth: "150",
    align: "center",
    hasSlot: true,
  },
  {
    columnLabel: "启用否",
    columnName: "available",
    columnWidth: "100",
    align: "center",
    kyf: "1",
    attrs: {
      "active-value": "1",
      "inactive-value": "0",
    },
  },
]);

const operationList = ref([
  {
    btnType: "add",
    bind: { type: "baseSpecial" },
    permission: "fxyq-add",
  },
  {
    text: "编辑",
    btnType: "edit",
    icon: "",
    // bind: { type: "baseSpecial" },
    permission: "fxyq-edit",
  },
  {
    text: "引擎执行",
    btnType: "add",
    icon: "",
    typeRow: "rowType",
    img: "/ItemImg/yinqingzhixing.svg",
    bind: { type: "baseSpecial" },
    permission: "fxyq-yqzx",
  },
  {
    text: "分析日志",
    btnType: "add",
    icon: "",
    img: "/ItemImg/fenxirizhi.svg",
    bind: { type: "baseSpecial" },
    permission: "fxyq-fxrz",
  },
  {
    text: "复制",
    btnType: "deit",
    bind: { type: "baseSpecial" },
    icon: "",
    img: "/ItemImg/fuzhi.svg",
    typeRow: "rowType",
    permission: "fxyq-copy",
  },
  {
    btnType: "delete",
    // bind: { type: "deleteSpecial" },
    permission: "fxyq-del",
  },
]);

// 按钮事件
const buttonClick = async (val, lightVal) => {
  console.log("val11", lightVal);
  if (val.text === "新增") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "新增";
    cereteCode()
    nextTick(() => {
      if (engineDetailstableRef.value) {
        engineDetailstableRef.value.fetchData();
        engineDetailstableRef.value.clearSelection();
      }
    });
  } else if (val.text === "编辑") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "编辑";
    Object.assign(addOrEditForm, lightVal);
    engineDetailsQueryParam.analysisEngineUuid = lightVal.uuid
    indexDetailParams.analysisEngineUuid = lightVal.uuid
    nextTick(() => {
      if (engineDetailstableRef.value) {
        engineDetailstableRef.value.fetchData();
        engineDetailstableRef.value.clearSelection();
      }
    });
  } else if (val.text === "引擎执行") {
    runItem(lightVal.uuid)
    engineinfo.engineName = lightVal.analysisName
    engineinfo.model = lightVal.modelName
    engineinfo.modelType = isStandardModelFn(lightVal.standardModel, "formatter")
    engineinfo.modelCategory = modelTypeList.value.find(item => item.dictValue === lightVal.modelType)?.dictLabel || ""
    console.log(engineinfo);
  } else if (val.text === "分析日志") {
    router.push({
      path: "/executionLog",
    });
  } else if (val.text === "复制") {
    cereteCode()
    addOrEditShow.value = true;
    addOrEditTitle.value = "复制";
    Object.assign(addOrEditForm, lightVal);
    engineDetailsQueryParam.analysisEngineUuid = lightVal.uuid
    indexDetailParams.analysisEngineUuid = lightVal.uuid
    nextTick(() => {
      if (engineDetailstableRef.value) {
        engineDetailstableRef.value.fetchData();
        engineDetailstableRef.value.clearSelection();
      }
    });
  } else if (val.text === "删除") {
    deleteItem(engineArray.value)
  }
};

// 表单校验规则
const addOrEditFormRules = reactive({
  analysisName: [
    {
      required: true,
      message: '请输入引擎名称',
      trigger: 'blur',
    },
  ],
  analysisCode: [
    {
      required: true,
      message: '请输入分析引擎编码',
      trigger: 'blur',
    },
  ],
  modelUuid: [
    {
      required: true,
      message: '请选择关联模型',
      trigger: 'blur',
    },
  ],
});

const cereteCode = async () => {
  let res = await genCode({});
  if (res.code == 200) {
    addOrEditForm.analysisCode = res.data
  } else {
    ElMessage.error("生成失败")
  }
};

const changeModel = (val) => {
  console.log("model", val);
  // 根据选中的值从 modelList 中找到对应的项
  const selectedItem = modelList.value.find(item => item.uuid === val);
  if (selectedItem) {
    console.log("model", selectedItem);
    // 将选中项的信息填充到表单中
    addOrEditForm.modelVersion = selectedItem.version; // 模型版本号
    addOrEditForm.modelType = selectedItem.modelType; // 模型类别
    addOrEditForm.modelPeriod = selectedItem.modelPeriod; // 分析周期
  }
}

// 删除引擎
const deleteItem = async (val) => {
  ElMessageBox.confirm(
    `确定删除吗？`,
    "删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      customClass: 'custom-confirm-box',
      icon: markRaw(DeleteIconComponent),
    }
  ).then(async () => {
    let params = {
      uuidList: val.map(item => {
        return item.uuid
      })
    }
    let res = await deleteEngine(params)
    if (res.code == 200) {
      ElMessage.success("删除成功")
      if (tableRef.value) {
        tableRef.value.fetchData();
        tableRef.value?.clearSelection();
      }
    }
  })
}

const runItem = async (val) => {
  ElMessageBox.confirm(
    `确定要执行该引擎吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    let params = {
      implementType: "0",
      uuid: val
    }
    let res = await analysisEngineExecute(params)
    if (res.code == 200) {
      ElMessage.success("执行成功")
      showProgress(res.data.uuid)
    }
  })
}

//  新增编辑
const addOrEditForm = reactive({
  analysisName: "", //  分析引擎名称
  analysisCode: "", //  分析引擎编码
  modelUuid: "", //  关联模型
  modelVersion: "", //  模型版本号
  modelType: "", //  模型类别
  modelPeriod: "", //  分析周期
  analysisDescription: "", //  分析引擎说明
  available: "1", //  启用否
  onlyUpdateAvailable: "0" // 切换状态场合(1 表示仅更新可用否字段。0 表示对话框中的更新)
});

const engineDetailsQueryParam = reactive({
  analysisEngineUuid: ""
})

const engineDetailsColumns = ref([
  {
    columnLabel: "脚本名称",
    columnName: "name",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标数量",
    columnName: "indexCount",
    columnWidth: "80",
    hasSlot: "true",
    showOverflowTooltip: true,
  },
])

const selectedScript = ref([])
const engineDetailsSelectionChange = (val) => {
  selectedScript.value = val
}

// 切换模型状态
const switchChange = async (val) => {
  let params = {
    ...val.row,
    onlyUpdateAvailable: "1"
  }
  let res = await updateEngine(params)
  if (res.code == 200) {
    ElMessage.success(val.value == '1' ? "已启用" : "已禁用")
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  } else {
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
    return
  }
}

const closeAddOrEdit = () => {
  addOrEditShow.value = false;
  selectedScript.value = [];
  engineDetailsQueryParam.analysisEngineUuid = ""
  // 重置表单数据
  addOrEditFormRef.value?.resetFields();
  // 清空表单数据
  Object.keys(addOrEditForm).forEach(key => {
    if (key !== 'available' && key !== 'onlyUpdateAvailable') {
      addOrEditForm[key] = ''
    }
  })
  addOrEditForm.available = '1'
  addOrEditForm.onlyUpdateAvailable = '0'
  // 清空表格选择
  if (engineDetailstableRef.value) {
    engineDetailstableRef.value.clearSelection();
  }
};

const addOrEditSubmit = async () => {
  addOrEditFormRef.value.validate(async (valid) => {
    if (valid) {
      if (addOrEditTitle.value == "新增") {
        let params = {
          ...addOrEditForm,
          scriptInfoList: selectedScript.value.map(item => {
            return {
              uuid: item.uuid,
              sort: item.sort
            }
          })
        }
        let res = await insertEngine(params)
        if (res.code == 200) {
          ElMessage.success("新增成功")
          closeAddOrEdit()
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        } else {
          ElMessage.error("新增失败")
        }
      } else if (addOrEditTitle.value == "编辑") {
        let params = {
          ...addOrEditForm,
          scriptInfoList: selectedScript.value.map(item => {
            return {
              uuid: item.uuid,
              sort: item.sort
            }
          })
        }
        console.log("修改", params);
        let res = await updateEngine(params)
        if (res.code == 200) {
          ElMessage.success("修改成功")
          closeAddOrEdit()
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        } else {
          ElMessage.error("修改失败")
        }
      } else if (addOrEditTitle.value == "复制") {
        let params = {
          ...addOrEditForm,
          scriptInfoList: selectedScript.value.map(item => {
            return {
              uuid: item.uuid,
              sort: item.sort
            }
          })
        }
        console.log("复制", params);
        let res = await copyDataAnalysisEngineInfo(params)
        if (res.code == 200) {
          ElMessage.success("复制成功")
          closeAddOrEdit()
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        } else {
          ElMessage.error("复制失败")
        }
      }
    }
  })
};
const indexDetail = async (val) => {
  indexDetailParams.scriptUuid = val.uuid
  indexDetailShow.value = true;
  nextTick(() => {
    if (zbtableRef.value) {
      zbtableRef.value.fetchData();
    }
  });
};

// 指标明细
const indexDetailParams = reactive({
  zbmc: "", //  指标名称
  scriptUuid: "",
  analysisEngineUuid: ""
});

//  查询
const zbhandleSearch = () => {
  if (!zbtableRef.value) return;
  zbtableRef.value.fetchData();
};

const zbhandleReset = () => {
  if (!zbtableRef.value) return;
  zbtableRef.value.fetchData("重置");
};

const indexDetailItems = ref([
  {
    label: "指标名称",
    prop: "indexName",
    style: { width: "250px" },
    component: "el-input",
    attrs: { placeholder: "", clearable: true },
  },
]);

const indexDetailTableColumns = ref([
  {
    columnLabel: "指标名称",
    columnName: "zbmc",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标编码",
    columnName: "zbbh",
    align: "center",
    showOverflowTooltip: true,
  },
]);

const indexDetailBtnList = ref([
  { text: "返回", btnType: "cancel", icon: "", img: "" },
]);

const closeIndexDetail = () => {
  indexDetailShow.value = false;
};

const indexDetailBtnClick = () => {
  // if (val.text === "返回") {
  indexDetailShow.value = false;
  // }
};

const modelList = ref([])
const modelTypeList = ref([])
const getModel = async () => {
  let params = {
    pageNum: 1,
    pageSize: 9999
  }
  let res = await getAnalyticalModel(params)
  if (res.code == 200) {
    modelList.value = res.rows
  }
}


// 查看进度
const propsUuid = ref("")
const engineinfo = reactive({})
const showProgress = async (val) => {
  // let res = await analysisEngineExecuteDetail({ uuid: val.uuid })
  engineShow.value = true
  propsUuid.value = val
}

// 关闭执行进度弹窗时的处理
const closeEngineExecution = () => {
  engineExecutionRef.value.stopPolling();
  engineShow.value = false
  // 重置当前执行的引擎信息
  propsUuid.value = ""
}

watch(
  () => addOrEditForm.modelUuid,
  (newVal) => {
    if (newVal) {
      changeModel(newVal);
    }
  },
  { immediate: true }
)


onMounted(async () => {
  if (tableRef.value) {
    tableRef.value.fetchData();
  }
  getModel()
  modelTypeList.value = dictKey.dict.fxmx_category
});
</script>
<style scoped lang="scss">
.anaEngineManagement-all-class {
  width: 100%;
  height: 100%;

  .anaEngineManagement-search-class {
    width: 100%;
    // height: 58px;
    display: flex;
    align-items: center;
  }

  .anaEngineManagement-table-class {
    height: calc(99% - 58px);
    margin-top: 0.5%;

    .status1 {
      // background-color: rgba(165, 214, 63, 0.15);
      color: rgba(17, 17, 17, 1);
      height: 26px;
      width: 58px;
      text-align: center;
      line-height: 26px;
      border-radius: 2px;
    }

    .status2 {
      // background-color: rgba(128, 128, 128, 0.15);
      color: rgba(192, 0, 0, 1);
      height: 26px;
      width: 58px;
      text-align: center;
      line-height: 26px;
      border-radius: 2px;
    }

    .analysisStyle {


      height: 26px;
      width: 44px;
      border-radius: 2px;
      text-align: center;
      line-height: 26px;
    }

    .execute-default {
      height: 26px;
      width: 44px;
      border-radius: 2px;
      text-align: center;
      line-height: 26px;
      margin: auto;
    }

    .execute_status0 {
      // background-color: rgba(128, 128, 128, 0.15);
      color: rgba(17, 17, 17, 1);
    }

    .execute_status1 {
      // background-color: rgba(0, 186, 173, 0.15);
      color: rgba(0, 186, 173, 1);
    }

    .execute_status2 {
      // background-color: rgba(83, 128, 253, 0.15);
      color: rgba(0, 115, 237, 1);
    }

    .execute_status3 {
      // background-color: rgba(128, 128, 128, 0.15);
      color: rgba(224, 112, 0, 1);
    }

  }
}
</style>
<style lang="scss">
.anaEngineManagement-addOrEdit {
  .el-form {
    font-size: 16px;

    .el-form-item-class {
      display: flex;
      flex-wrap: wrap;
      gap: 18px 25px;

      .clickable-blue-class {
        color: #5380fd;
        cursor: pointer;
        text-decoration: underline;
        text-decoration-color: rgba(83, 128, 253, 1);
        text-decoration-style: solid;
        text-underline-offset: 4px;
        text-align: center;
        /* 添加下划线与文字的间距 */
      }
    }

    .el-form-item {
      margin: 0 !important;

      .el-form-item__label {
        font-size: 16px !important;
        padding-right: 0 !important;
      }

      .el-form-item__content {
        min-width: 240px;
      }
    }

    .el-input {
      width: 240px;
    }

    .el-select {
      width: 240px;
    }

    .el-input-botton {
      background: rgba(83, 128, 253, 0.1);
      border: 1px solid rgba(83, 128, 253, 0.5);
      color: rgba(83, 128, 253, 1);
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}

.changeSearch {
  .cardShadow {
    border-bottom: 1px solid rgba(201, 201, 201, 1) !important;
    border-radius: 0 !important;
  }
}

.anaEngineManagement-table-class {
  .noborderShadow {
    box-shadow: none !important;
  }
}
</style>
