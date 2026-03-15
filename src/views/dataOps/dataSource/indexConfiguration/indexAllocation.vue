<!-- 指标配置 -->
<template>
  <div class="indexAllocation-all">
    <div class="indexAllocation-list" v-if="patternId == '1'">
      <div class="indexAllocation-top-class">
        <div class="indexAllocation-top-title">
          <div class="indexAllocation-title-head">
            指标配置
          </div>
          <div class="indexAllocation-title-body">
            <div v-for="mode in modes" :key="mode.value" class="toggle-item"
              :class="{ active: currentMode === mode.value }" @click="currentMode = mode.value">
              {{ mode.label }}
            </div>
          </div>
        </div>
        <div class="indexAllocation-top-search">
          <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="auto"
            @reset="handleReset" @searchVal="handleSearch">
          </searchForm>
        </div>
      </div>
      <div class="indexAllocation-bottom-class">
        <div class="radioList">
          <el-radio-group v-model="patternRadio" fill="#0073ED" size="default " @change="patternClick">
            <el-radio-button label="1">列表模式</el-radio-button>
            <el-radio-button label="2">详情模式</el-radio-button>
          </el-radio-group>
        </div>
        <tableAndPage ref="tableRef" apiUrl="/business/ZbConfig/pageList" :queryParams="queryParams"
          :btnList="operationList" :designTableColumns="designTableColumns" :showBorder="true" :light="true"
          @btnClick="buttonClick" @selectionChange="handleSelectionChange" @rowClick="rowClick"
          @rowDbClick="handleRowDbClick" @statusClick="switchChange" primaryKey="uuid" :reserveSelection="true"
          v-bind="{ showBorder: 1, pageOpen: 1 }">
        </tableAndPage>
      </div>
    </div>
    <div :style="{ height: disabledForm ? '100%' : '90%' }" style="
        width: 100%;
        display: flex;
        justify-content: space-between;
      " v-else>
      <div class="indexAllocation-left">
        <!-- <div class="indexAllocation-top-btnSelect">
          <div
            v-for="(item, index) in patternList"
            :key="index"
            @click="patternClick(item)"
            :class="
              item.id == patternId
                ? 'indexAllocation-btn-active indexAllocation-btn-item'
                : 'indexAllocation-btn-item'
            "
          >
            <img
              v-if="item.id == '1'"
              src="/src/assets/ItemImg/lbmr.svg"
              alt=""
              class="one-image"
              style="cursor: pointer"
            />
            <div style="height: 24px;line-height: 24px">{{ item.label }}</div>
            <img
              v-if="item.id == '2'"
              src="/src/assets/ItemImg/xqmr.svg"
              alt=""
              class="one-images"
              style="cursor: pointer"
            />
          </div>
        </div> -->
        <div style="
            height: 48px;
            width: calc(100% - 15px);
            margin: 0 0px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
          <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-weight: 500;
            ">
            <div class="blue-vertical-line"></div>指标项列表
          </div>
          <div style="display: flex;">
            <buttonDiv @click="openDataItem" type="baseSpecial" v-permission="'yzk-add'">
              <el-icon style="margin-right: 4px;">
                <Plus />
              </el-icon>新增指标
            </buttonDiv>
            <buttonDiv v-if="disabledForm" @click="disabledFormFn" type="baseSpecial" v-permission="'yzk-add'">
              <el-icon style="margin-right: 4px;">
                <EditPen />
              </el-icon>编辑
            </buttonDiv>
          </div>

        </div>
        <div class="black-divider"></div>
        <div style="width: clac(100% - 30px); margin: 0 15px">
          <el-input v-model="indexName" placeholder="指标名称" style="width: 369px !important" clearable
            @keyup.enter="handleSearchList">
            <template #prefix>
              <el-icon @click="handleSearchList" style="cursor: pointer">
                <Search />
              </el-icon>
            </template>
            <template #suffix>
              <el-icon @click="handleResetList" style="cursor: pointer">
                <RefreshRight />
              </el-icon>
            </template>
          </el-input>
          <el-select v-model="fxmxUuidData" @change="fxmxUuidChange" style="margin-top: 15px;">
            <el-option v-for="item in bndAnlzModList" :key="item.uuid" :label="item.modelName" :value="item.uuid">
            </el-option>
          </el-select>
        </div>
        <div style="height: calc(100% - 180px); width: 100%" v-if="loading">
          <el-card v-loading="loading" style="
              height: 640px;
              width: 100%;
              background-color: #fff;
              border: none;
              box-shadow: none;
            "></el-card>
        </div>

        <div style="height: calc(100% - 180px); overflow-y: auto; margin: 15px 0" v-else>
          <div v-for="(item, index) in tableList" :key="index" :class="item?.zbUuid == indexId && item?.fxmxUuid == analysisId
            ? 'dataItemSelected dataItemDefault'
            : 'dataItemDefault'
            " @click="handleIndexClick(item)">
            <el-tooltip :disabled="item.zbName?.length <= 22" :content="item.zbName">
              {{
                item.zbName?.length <= 22 ? item.zbName : item.zbName?.substring(0, 21) + "..." }} </el-tooltip>
          </div>
        </div>
      </div>
      <div class="indexAllocation-right" v-if="loading">
        <el-card v-loading="loadings" style="
            height: 100%;
            width: 100%;
            background-color: #fff;
            border: none;
            box-shadow: none;
          "></el-card>
      </div>
      <div class="indexAllocation-right" v-else>
        <div class="indexAllocation-addOrEdit" style="padding: 0">
          <indexForm ref="detailRef" :disabledForm="disabledForm" :zbVerNumList="zbVerNumList"
            :scriptTypeList="scriptTypeList" :zbTypeList="zbTypeList" :zbAttrList="zbAttrList" :zbDirList="zbDirList"
            :respDptList="respDptList" :analPerList="analPerList" :dataFmtList="dataFmtList" :unitList="unitList"
            :zbSourceList="zbSourceList" :dataSrcOptions="dataSrcOptions" :formData="formData" :addOrEditTitle="详情"
            :resetFlag="resetFlag" :sysTypeList="sysTypeList" :bndAnlzModList="bndAnlzModList"
            :zbDefineList="zbDefineList" @pattern-click-type="patternClickType"></indexForm>
        </div>

      </div>
    </div>

    <div class="indexAllocation-bottom" :style="{ display: disabledForm ? 'none' : 'flex' }">
      <div style="display: flex; width: 100%; justify-content: center;margin-top: 5px;align-items: center;"
        v-if="!disabledForm">
        <buttonDiv style="background: rgb(247, 210, 210) !important;
    color: rgb(192, 0, 0) !important;

    box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84), 1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);"
          @click="deleteIndexs" type="delete" v-if="detailTitle != '新增指标'">
          删除
        </buttonDiv>
        <CanCelBtn style="background: rgba(242, 243, 245, 1);" @click="closeIndex"> 取消 </CanCelBtn>
        <buttonDiv @click="submitIndex"> 保存 </buttonDiv>
      </div>
    </div>
  </div>
  <!-- 新增-->
  <SzycDialog :dialogVisible="addOrEditShow" destroy-on-close :close-on-click-modal="false" :title="addOrEditTitle"
    width="79%" top="20px" @close="closeAddOrEdit()" class="indexAllocation-Dialog-addOrEdit">
    <template #uname>
      <div class="indexAllocation-addOrEdit">
        <indexForm ref="addOrEditRef" :disabledForm="false" :zbVerNumList="zbVerNumList"
          :scriptTypeList="scriptTypeList" :zbTypeList="zbTypeList" :zbAttrList="zbAttrList" :zbDirList="zbDirList"
          :respDptList="respDptList" :analPerList="analPerList" :dataFmtList="dataFmtList" :unitList="unitList"
          :zbSourceList="zbSourceList" :sysTypeList="sysTypeList" :dataSrcOptions="dataSrcOptions" :formData="formData"
          :addOrEditTitle="addOrEditTitle" :bndAnlzModList="bndAnlzModList" :zbDefineList="zbDefineList"
          :isDialog="true"></indexForm>
        <div class="el-dialog-HorizontalLine"></div>
        <div class="el-dialog-buttons">
          <CanCelBtn @click="closeAddOrEdit">
            {{ addOrEditTitle == "指标详情" ? "返回" : "取消" }}
          </CanCelBtn>
          <buttonDiv @click="addOrEditSubmit" v-if="addOrEditTitle != '指标详情'">
            保存
          </buttonDiv>
        </div>
      </div>
    </template>
  </SzycDialog>

  <!-- 回收站-->
  <SzycDialog :dialogVisible="recycleBinShow" :close-on-click-modal="false" destroy-on-close title="回收站" width="85%"
    top="30px" class="indexAllocation--indRuleExpr-dialog" @close="closeRecycleBin()">
    <template #uname>
      <div
        style="width: 100%; border-radius: 4px; background: #fff; display: flex; flex-direction: column; height: 750px;">
        <div style="flex-shrink: 0;">
          <searchForm :modelValue="recycleBinParams" :items="recycleBinItems" :inline="true" labelWidth=""
            @reset="recycleBinReset" @searchVal="recycleBinSearch">
          </searchForm>
        </div>
        <div style="min-height: 0px; flex-grow: 1;">
          <tableAndPage ref="recycleBinRef" apiUrl="/business/ZbConfig/pageList" :queryParams="recycleBinParams"
            :designTableColumns="recycleBinTableColumns" :bottomBtnList="recycleBinBtnList" :showBorder="true"
            :light="true" @btnBottomClick="recycleBinBtnClick" @selectionChange="drecycleBinSelectChange"
            primaryKey="uuid" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }">
          </tableAndPage>
        </div>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch, h, markRaw } from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import indexForm from "./indexForm.vue";
import {
  colTypeFn,
  statPerFn,
  yesOrNoFn,
  isNationFn,
  sourceAppFn,
} from "@/types/dict/index.js";
import {
  listModel,
  changeState,
  getZbType,
  saveInfo,
  updateInfo,
  deleteIndex,
  deleteRecover,
  deleteForce,
  selectSourceApp,
  pageSearch,
  listZb,
  listZbDefine,
  dptList,
} from "@/api/modelIndexManage/indexAllocation.js";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { dictStore } from "@/store/dict";

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
// 从pinia store中获取数据
const dictStoreInstance = dictStore();
const zbVerNumList = computed(() => dictStoreInstance.dict?.indexDefineLevel || []);
const zbDirList = computed(() => dictStoreInstance.dict?.indexOrientation || []);
const zbAttrList = computed(() => dictStoreInstance.dict?.indexAttribute || []);
const scriptTypeList = computed(() => dictStoreInstance.dict?.scriptExecutionType || []);
const zbTypeList = computed(() => dictStoreInstance.dict?.indexType || []);
const analPerList = computed(() => dictStoreInstance.dict?.statisticalPeriod || []);
const dataFmtList = computed(() => dictStoreInstance.dict?.dataFormat || []);
const unitList = computed(() => dictStoreInstance.dict?.unitOfMeasurement);
const sysTypeList = computed(() => dictStoreInstance.dict?.sysTypeList);
const bndAnlzModList = ref([])
const respDptList = ref([]);
const disabledForm = ref(true);

const zbDefineList = ref([]);
const formData = ref({});
const tableRef = ref(null);
const tableRowData = ref({});
const tableSelectList = ref([]);
const addOrEditShow = ref(false);
const addOrEditTitle = ref("");
const zbSourceList = ref([]);
const tableList = ref([]);
const addOrEditRef = ref(null);

const detailTitle = ref("");
const detailRef = ref(null);
const indexName = ref("");
const fxmxUuidData = ref([]);
const indexId = ref("");
const analysisId = ref("");
const loading = ref(false);
const loadings = ref(false);
const resetFlag = ref(0);

const recycleBinShow = ref(false);
const recycleBinRef = ref(null);

const drecycleBinSelectList = ref([]);
const patternRadio = ref("1");

// 当前激活的模式，默认为 'list'
const currentMode = ref('list')

// 定义可供切换的选项
const modes = [
  { label: '列表模式', value: 'list' },
  { label: '详细模式', value: 'detail' }
]

//来源应用转换
const zbSourceFn = (val) => {
  return zbSourceList.value.find((item) => item.value == val)?.label || "";
};

//计量单位转换
const unitFn = (val) => {
  return unitList.value.find((item) => item.value == val)?.label || "";
};

//指标导向转换
const zbDirFn = (val) => {
  return zbDirList.value.find((item) => item.dictValue == val)?.dictLabel || "";
};

//指标类型转换
// const zbTypeFn = (val) => {
//   return zbTypeList.value.find((item) => item.value == val)?.label || "";
// }

//责任科室转换
// const respDptFn = (val) => {

//   const findInTree = (nodes, targetValue) => {
//     if (!Array.isArray(nodes)) return null;
//     for (const node of nodes) {
//       if (node.hospDptcode == targetValue) {
//         return node;
//       }
//       if (node.children && node.children.length > 0) {
//         const found = findInTree(node.children, targetValue);
//         if (found) {
//           return found;
//         }
//       }
//     }

//     return null;
//   };

//   const foundItem = findInTree(respDptList.value, val);
//   return foundItem ? foundItem?.label : "";
// };
// 优化后的责任科室转换函数
const respDptFn = (val) => {
  if (!val) return "";

  const findLabel = (nodes) => {
    if (!Array.isArray(nodes)) return null;

    for (const node of nodes) {
      if (node.value == val) {
        return node.label;
      }

      if (node.children && node.children.length > 0) {
        const childResult = findLabel(node.children);
        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  };

  const result = findLabel(respDptList.value);
  return result || "";
};

const detailForm = reactive({
  zbUuid: "",
  zbName: "", // 指标名称
  zbNameList: "", // 指标英文名称
  zbCode: "", // 指标编码
  version: "", // 指标版本号
  // scriptType: "", // 脚本执行类型
  colType: "", // 采集方式
  isNation: "", // 国家监测否
  zbType: "", // 指标类型
  zbTypeUuid: "", // 指标类型
  zbAttr: "", // 指标属性
  zbAttrUuid: "", // 指标属性
  zbDir: "", // 指标导向
  zbDirUuid: "", // 指标导向
  statPer: "", // 统计周期
  respDpt: "", // 责任科室
  // analPer: "", // 分析周期
  isZbExt: "", // 延伸指标否
  dataFmt: "", // 数据格式
  dataFmtUuid: "", // 数据格式
  // unit: "", // 计量单位
  decSc: 0, // 小数保留位数
  // zbSource: "", // 来源应用
  dataSrc: "", // 数据来源
  state: 1, // 启用否
  isAppl: 1, // 适用否
  zbDefine: "", // 指标定义
  bndAnlzMod: "", // 已绑分析模型
  applHospType: [], // 适用医院类别
  applHospName: "", // 适用医院名称
  indRuleExpr: [], // 指标运算配置
  indRuleName: "", // 指标运算配置
  indRule: "", //
  zbFather: "", // 绑定父级指标
  zbFatherName: "",
  indJmpPath: [], // 指标跳转路径
  selectedJmpPath: "", // 选中的指标跳转路径
  scoRuleCfg: "", // 赋分规则配置
  calcMethod: "", // 计算方法
  zbDesc: "", // 指标说明
  zbMeaning: "", // 指标意义
  // zbExplain: "", // 计算解释
  scPrinciple: "", // 赋分原则
  zbyj: "", // 分析脚本，
  sjxInfoList: [], // 数据项信息
});

const fxmxUuidTs = ref("");

//  查询条件
const queryParams = reactive({
  isForce: "1", //  是否回收站
  systemCode: "", //  系统标识
  zbName: "", //  指标名称
  // zbVerNum: "", //  版本
  sgtbf: "", //  采集方式
  zbdxuuid: "", //  指标导向
  zrdeptname: "", //  责任科室
  zbsxuuid: "", //  指标属性
  isGjjc: "", //  国家监测指标
  // sjly: "", //  数据来源
  fxmxUuid: "", //  已绑分析模型
  // zbSource: "", //  来源应用
});

const searchItems = computed(() => [
  {
    component: "el-input",
    label: "指标名称：",
    style: { width: "300px" },
    prop: "zbName",
    attrs: { placeholder: "", clearable: true },
  },
  // {
  //   component: "el-select",
  //   label: "版本号：",
  //   style: { width: "186px" },
  //   prop: "zbVerNum",
  //   optionValue: "label",
  //   attrs: { placeholder: "请选择", clearable: true },
  //   options: zbVerNumList.value,
  // },
  {
    component: "el-select",
    label: "采集方式：",
    style: { width: "300px" },
    prop: "sgtbf",
    attrs: { placeholder: "请选择", clearable: true },
    options: colTypeFn(),
  },
  {
    component: "el-select",
    label: "指标导向：",
    style: { width: "300px" },
    prop: "zbDir",
    attrs: { placeholder: "请选择", clearable: true },
    options: zbDirList.value,
    optionValue: "dictValue",
    optionLabel: "dictLabel",
  },
  {
    component: "el-tree-select",
    label: "责任科室：",
    style: { width: "300px" },
    prop: "zrdeptname",
    optionValue: "value",
    optionLabel: "label",
    attrs: { placeholder: "请选择", },
    clearable: true,
    options: respDptList.value,
    filterable: true,
    checkStrictly: true,
    nodeKey: "value",
  },
  {
    component: "el-select",
    label: "指标属性：",
    style: { width: "300px" },
    prop: "zbsxuuid",
    attrs: { placeholder: "请选择", clearable: true },
    options: zbAttrList.value,
    optionValue: "uuid",
    optionLabel: "name",
  },
  {
    component: "el-select",
    label: "国家监测指标：",
    style: { width: "300px" },
    prop: "isGjjc",
    attrs: { placeholder: "请选择", clearable: true },
    options: isNationFn(),
  },
  // {
  //   component: "el-select",
  //   label: "数据来源：",
  //   style: { width: "186px" },
  //   prop: "sjly",
  //   attrs: { placeholder: "请选择", clearable: true },
  //   options: [],
  // },
  {
    component: "el-select",
    label: "已绑分析模型：",
    style: { width: "300px" },
    prop: "fxmxUuid",
    attrs: { placeholder: "请选择", clearable: false },
    options: bndAnlzModList.value,
    optionValue: "uuid",
    optionLabel: "modelName",
  },
  // {
  //   component: "el-select",
  //   label: "来源应用：",
  //   style: { width: "186px" },
  //   prop: "zbSource",
  //   attrs: { placeholder: "请选择", clearable: true },
  //   options: zbSourceList.value,
  // },
]);
const patternId = ref("1");
const patternList = ref([
  {
    label: "列表",
    id: "1",
  },
  {
    label: "详请",
    id: "2",
  },
]);

//  表格数据
const designTableColumns = ref([
  {
    columnLabel: "指标名称",
    columnName: "zbName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标编码",
    columnName: "zbCode",
    columnWidth: "180",
    align: "left",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "采集方式",
    columnName: "colType",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return colTypeFn(row.colType, "formatter");
    },
  },
  // {
  //   columnLabel: "计量单位",
  //   columnName: "unitMeasurement",
  //   columnWidth: "100",
  //   showOverflowTooltip: true,
  //   formatter: (row, cloumn, index) => {
  //     return unitFn(row.unitMeasurement, "label");
  //   },
  // },
  {
    columnLabel: "指标导向",
    columnName: "zbDir",
    columnWidth: "100",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标属性",
    columnName: "zbAttr",
    columnWidth: "100",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "统计周期",
    columnName: "statPer",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return statPerFn(row.statPer, "formatter");
    },
  },
  {
    columnLabel: "指标类型",
    columnName: "zbType",
    columnWidth: "100",
    showOverflowTooltip: true,
    // formatter: (row, cloumn, index) => {
    //   return zbTypeFn(row.zbType);
    // },
  },
  {
    columnLabel: "责任科室",
    columnName: "respDpt",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return respDptFn(row.respDpt);
    },
  },
  {
    columnLabel: "数据来源",
    columnName: "dataSrc",
    columnWidth: "200",
    align: "left",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return sourceAppFn(row.dataSrc, "formatter");
    },
  },
  // {
  //   columnLabel: "来源应用",
  //   columnName: "zbSource",
  //   columnWidth: "100",
  //   showOverflowTooltip: true,
  //   formatter: (row, cloumn, index) => {
  //     return zbSourceFn(row.zbSource);
  //   },
  // },
  {
    columnLabel: "启用否",
    columnName: "state",
    kyf: "1",
    columnWidth: "80",
    align: "center",
    attrs: { "active-value": 1, "inactive-value": 0 },
  },
  {
    columnLabel: "适用否",
    columnName: "isAppl",
    kyf: "1",
    columnWidth: "80",
    align: "center",
    attrs: { "active-value": 1, "inactive-value": 0 },
  },
]);


const pageSearchFn = async () => {
  formData.value = JSON.parse(JSON.stringify(detailForm));
  loading.value = true;
  loadings.value = true;
  let res = await pageSearch({
    zbName: indexName.value,
    isForce: "1",
    pageNum: 1,
    pageSize: 9999,
    fxmxUuid: queryParams.fxmxUuid
  });
  if (res.code == 200) {
    tableList.value = res.rows;
    indexId.value = res.rows[0]?.zbUuid;
    analysisId.value = res.rows[0]?.fxmxUuid;
    formData.value = res.rows?.length ? res.rows[0] : [];
    formData.value.zbNameList = res.rows?.length ? res.rows[0].zbUuid : '';
    loading.value = false;
  } else {
    tableList.value = [];
  }
};

const patternClickType = async (item) => {
  patternId.value = item.id;
  if (item.id == "1") {
    patternRadio.value = "1"
    nextTick(() => {
      tableRef.value?.fetchData("重置");
    });
  }
};

const patternClick = async (item) => {
  patternId.value = item.id;
  if (item == "2") {
    fxmxUuidData.value = JSON.parse(JSON.stringify(queryParams.fxmxUuid))
    await pageSearchFn();
    detailTitle.value = "编辑指标";
  } else if (item == "1") {
    nextTick(() => {
      tableRef.value?.fetchData("重置");
    });
  }
};

const openDataItem = () => {
  detailTitle.value = "新增指标";
  detailForm.bndAnlzMod = queryParams.fxmxUuid

  indexId.value = "";
  analysisId.value = "";
  console.log("detailForm", detailForm, 新增指标);
  formData.value = JSON.parse(JSON.stringify(detailForm));
};

const handleSearchList = async () => {
  await pageSearchFn();
};

const fxmxUuidChange = async (val) => {
  queryParams.fxmxUuid = JSON.parse(JSON.stringify(fxmxUuidData.value))
  await pageSearchFn();
  detailTitle.value = "编辑指标";
}

const handleResetList = async () => {
  indexName.value = "";
  await pageSearchFn();
};

const handleIndexClick = async (val) => {
  indexId.value = val?.zbUuid;
  analysisId.value = val?.fxmxUuid;
  formData.value = val;
  formData.value.zbNameList = val.zbUuid
  loadings.value = true;
  detailTitle.value = "编辑指标";
};

//  查询
const handleSearch = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData();
};

const handleReset = () => {
  if (!tableRef.value) return;
  queryParams.fxmxUuid = JSON.parse(JSON.stringify(fxmxUuidTs.value))
  tableRef.value.fetchData("",);
};

const operationList = ref([
  {
    btnType: "add",
    bind: { type: "baseSpecial" }
    , permission: 'zbk-add'
  },
  {
    text: "编辑",
    btnType: "edit",
    bind: { type: "baseSpecial" },
    permission: 'zbk-edit'
  },
  {
    btnType: "delete",
    // bind: { type: "deleteSpecial" },
    permission: 'zbk-del'
  },
  {
    btnType: "recycleBin",
    bind: { type: "recycleBinSpecial" },
    permission: 'zbk-recycle'
  },
]);

const handleRowDbClick = (val) => {
  // tableRowData.value = val;
  console.log("高亮行val11", val);
  Object.assign(formData.value, val);
  addOrEditTitle.value = "指标详情";
  addOrEditShow.value = true;
};

const handleSelectionChange = (val) => {
  tableSelectList.value = val;
  console.log("选中行val", val);
};

const switchChange = (e) => {
  console.log("switchChange", e);
  changeState({
    uuid: e.row.uuid,
    state: e.row.state,
    isAppl: e.row.isAppl,
    bndAnlzMod: e.row.bndAnlzMod,
  }).then((res) => {
    if (res.code == 200) {
      if (
        (e.column.columnLabel == "启用否" && e.row.state == "1") ||
        (e.column.columnLabel == "适用否" && e.row.isAppl == 1)
      ) {
        ElMessage.success("已启用");
      } else if (
        (e.column.columnLabel == "启用否" && e.row.state == "0") ||
        (e.column.columnLabel == "适用否" && e.row.isAppl == 0)
      ) {
        ElMessage.success("已禁用");
      }
    }
  });
};

// 使用 Object.assign 方式（注意：这会覆盖 addOrEditForm 中的所有同名属性）
const assignTableRowDataToForm = () => {
  console.log("tableRowData.value", tableRowData.value);
  Object.assign(formData.value, tableRowData.value);
  formData.value.zbNameList = tableRowData.value.zbUuid
};
// 按钮事件
const buttonClick = async (val, lightOrSelect) => {
  console.log("val11", val);
  if (val.btnType === "add") {
    detailForm.bndAnlzMod = queryParams.fxmxUuid
    formData.value = JSON.parse(JSON.stringify(detailForm));
    addOrEditShow.value = true;
    addOrEditTitle.value = "新增指标";
  } else if (val.btnType === "edit") {
    tableRowData.value = lightOrSelect;
    addOrEditShow.value = true;
    addOrEditTitle.value = "编辑指标";
    assignTableRowDataToForm();
  } else if (val.btnType === "recycleBin") {
    recycleBinShow.value = true;
    nextTick(() => {
      recycleBinRef.value?.fetchData('', { fxmxUuid: queryParams.fxmxUuid });
    });
  } else if (val.btnType === "delete") {
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
      let uuidList = [];
      uuidList = lightOrSelect.map((item) => item.uuid);
      let res = await deleteIndex({
        uuids: uuidList,
      });
      if (res.code == 200) {
        ElMessage.success("删除成功");
        tableRef.value?.fetchData();
        tableRef.value?.clearSelection();
      }
    })
      .catch(() => { });
  }
};
const disabledFormFn = () => {
  disabledForm.value = false;
};
const deleteIndexs = async (params) => {
  ElMessageBox.confirm(
    `此操作将删除所选指标，您可在回收站中找回该指标。确定删除吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      let uuidList = [];
      uuidList.push(formData.value.uuid);
      let res = await deleteIndex({
        uuids: uuidList,
      });
      if (res.code == 200) {
        formData.value = JSON.parse(JSON.stringify(detailForm));
        ElMessage.success("删除成功");
        disabledForm.value = true;
        handleResetList();
      }
    })
    .catch(() => { });
};

// 新增/编辑弹窗

const closeAddOrEdit = () => {
  addOrEditShow.value = false;
};
const isSubmitting = ref(false);

const submitFn = async (ref, title) => {
  try {
    isSubmitting.value = true;
    // 调用子组件的验证方法
    await ref.validateForm();
    if (title == "新增指标") {
      // 验证通过后执行保存操作
      let res = await saveInfo({
        ...ref?.addOrEditForm,
      });
      if (res.code == 200) {
        ElMessage.success("操作成功");
        if ((ref = addOrEditRef.value)) {
          addOrEditShow.value = false;
          tableRef.value?.fetchData();
        } else {
          detailTitle.value = "编辑指标";
          await pageSearchFn();
        }
      }
    } else if (title == "编辑指标") {
      let res = await updateInfo({
        ...ref?.addOrEditForm,
      });
      if (res.code == 200) {
        ElMessage.success("操作成功");
        if ((ref = addOrEditRef.value)) {
          addOrEditShow.value = false;
          tableRef.value?.fetchData();
        } else {
          detailTitle.value = "编辑指标";
          await pageSearchFn();
        }
      }
    }
  } catch (error) {
    // 验证失败的处理
    ElMessage.error("请您填写必填信息");
    console.log("验证失败的字段:", error);
  } finally {
    // 重置提交状态
    isSubmitting.value = false;
  }
};

const addOrEditSubmit = async () => {
  // 如果正在提交中，则直接返回，防止重复提交
  if (isSubmitting.value) {
    ElMessage.warning("正在提交中，请勿重复点击");
    return;
  }

  await submitFn(addOrEditRef.value, addOrEditTitle.value);
};

// 回收站
const recycleBinParams = reactive({
  isForce: "0", // 回收站否
  zbName: "", // 指标名称
  zbVerNum: "", // 版本号
  zrdeptname: "", //  责任科室
});

const recycleBinItems = computed(() => [
  {
    component: "el-input",
    label: "指标名称：",
    style: { width: "300px" },
    prop: "zbName",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-select",
    label: "版本号：",
    style: { width: "300px" },
    prop: "zbVerNum",
    optionValue: "label",
    attrs: { placeholder: "请选择", clearable: true },
    options: zbVerNumList.value,
  },
  {
    component: "el-select",
    label: "责任科室：",
    style: { width: "300px" },
    prop: "zrdeptname",
    optionValue: "hospDptcode",
    optionLabel: "hospDptname",
    attrs: { placeholder: "请选择", clearable: true },
    options: respDptList.value,
  },
]);

const recycleBinTableColumns = ref([
  {
    columnLabel: "版本号",
    columnName: "zbVerNum",
    columnWidth: "100",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标名称",
    columnName: "zbName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标编码",
    columnName: "zbCode",
    columnWidth: "220",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "采集方式",
    columnName: "sgtbf",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return colTypeFn(row.sgtbf, "formatter");
    },
  },
  {
    columnLabel: "计量单位",
    columnName: "unitMeasurement",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return unitFn(row.unitMeasurement, "label");
    },
  },
  {
    columnLabel: "指标导向",
    columnName: "zbdxuuid",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbDirFn(row.zbdxuuid);
    },
  },
  {
    columnLabel: "指标属性",
    columnName: "zbsxuuid",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbAttrFn(row.zbsxuuid);
    },
  },
  {
    columnLabel: "统计周期",
    columnName: "statPer",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return statPerFn(row.statPer, "formatter");
    },
  },
  {
    columnLabel: "指标类型",
    columnName: "zbType",
    columnWidth: "100",
    showOverflowTooltip: true,
    // formatter: (row, cloumn, index) => {
    //   return zbTypeFn(row.zbType);
    // },
  },
  {
    columnLabel: "责任科室",
    columnName: "respDpt",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return respDptFn(row.respDpt);
    },
  },
  {
    columnLabel: "数据来源",
    columnName: "sjly",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "来源应用",
    columnName: "zbSource",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbSourceFn(row.zbSource);
    },
  },
]);

const recycleBinBtnList = ref([
  {
    btnType: "cancel",
  },
  {
    text: "永久删除",
    btnType: "delete",
    typeRow: "selectType",
    icon: "",
    img: "",
    bind: { type: "delautoWidth", style: "background: rgba(192, 0, 0, 1) !important;" },
  },
  {
    text: "还原",
    btnType: "reduction",
    icon: "",
    img: "",
    typeRow: "selectType",
    bind: { type: "base", },
  },
]);

const drecycleBinSelectChange = (val) => {
  drecycleBinSelectList.value = val;
};

const recycleBinBtnClick = async (val) => {
  console.log("val", val);
  if (val.text === "取消") {
    recycleBinShow.value = false;
  } else if (val.text === "永久删除") {
    ElMessageBox.confirm(
      `此操作将永久删除所选指标，无法找回。确定删除吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    )
      .then(async () => {
        let uuidList = [];
        uuidList = drecycleBinSelectList.value.map((item) => item.uuid);
        let res = await deleteForce({ uuids: uuidList });
        if (res.code == 200) {
          ElMessage.success("永久删除成功");
          recycleBinRef.value?.fetchData('', { fxmxUuid: queryParams.fxmxUuid });
          recycleBinRef.value?.clearSelection();
          // recycleBinShow.value = false;
        }
      })
      .catch(() => { });
  } else if (val.text === "还原") {
    let uuidList = [];
    uuidList = drecycleBinSelectList.value.map((item) => item.uuid);
    let res = await deleteRecover({ uuids: uuidList });
    if (res.code == 200) {
      ElMessage.success("还原成功");
      tableRef.value?.fetchData("重置");
      tableRef.value?.clearSelection();
      recycleBinShow.value = false;
    }
  }
};

const recycleBinReset = () => {
  recycleBinRef.value?.fetchData('重置', { fxmxUuid: queryParams.fxmxUuid });
};

const recycleBinSearch = () => {
  recycleBinRef.value?.fetchData("", { fxmxUuid: queryParams.fxmxUuid });
};

const closeRecycleBin = () => {
  recycleBinShow.value = false;
};

//详情模式
const closeIndex = async () => {
  resetFlag.value = resetFlag.value + 1;
  disabledForm.value = true;
};

const submitIndex = async () => {
  if (isSubmitting.value) {
    ElMessage.warning("正在提交中，请勿重复点击");
    return;
  }

  await submitFn(detailRef.value, detailTitle.value);
};

// 初始化
const zbAttrFn = (val) => {
  return zbAttrList.value.find((item) => item.value == val)?.label;
};

// const getZbTypeFn = async () => {
//   // 定义配置数组，包含所有需要获取的字典类型
//   const dictConfig = [
//     { parentCode: "indexDefineLevel", target: zbVerNumList.value },
//     { parentCode: "indexOrientation", target: zbDirList.value },
//     { parentCode: "department", target: respDptList.value },
//     { parentCode: "indexAttribute", target: zbAttrList.value },
//     { parentCode: "scriptExecutionType", target: scriptTypeList.value },
//     { parentCode: "indexType", target: zbTypeList.value },
//     { parentCode: "statisticalPeriod", target: analPerList.value },
//     { parentCode: "dataFormat", target: dataFmtList.value },
//     { parentCode: "unitOfMeasurement", target: unitList.value },
//     { parentCode: "sys_show_type", target: sysTypeList.value },
//   ];
//   // 使用for...of循环，代码更简洁
//   for (const config of dictConfig) {
//     try {
//       const res = await getZbType({ parentCode: config.parentCode });
//       // 正确更新目标数组（清空后添加新数据，保持引用不变）
//       if (res.code === 200 && Array.isArray(res.data)) {
//         config.target.length = 0; // 清空数组
//         config.target.push(...res.data); // 添加新数据
//       } else {
//         config.target.length = 0; // 接口异常时清空
//       }
//     } catch (err) {
//       config.target.length = 0; // 错误时清空
//     }
//   }
// };

const selectSourceFn = async () => {
  let res = await selectSourceApp();
  if (res.length) {
    zbSourceList.value = res;
  } else {
    zbSourceList.value = [];
  }
};

const getListZbDefine = async () => {
  let res = await listZbDefine();
  if (res.code == 200) {
    zbDefineList.value = res.data;
  } else {
    zbDefineList.value = [];
  }
}

const getdptList = async () => {
  let res = await dptList({});
  respDptList.value = res.data;
}

const getListModel = async () => {
  let res = await listModel({});
  if (res.code == 200) {
    bndAnlzModList.value = res.data;
    queryParams.fxmxUuid = res.data[0].uuid;
  }
}

watch(() => queryParams.fxmxUuid, async (newVal, oldVal) => {
  if (newVal) {
    const dataTs = newVal
    fxmxUuidTs.value = dataTs;
  }
})

onMounted(async () => {
  nextTick(async () => {
    await getListModel()
    await selectSourceFn();
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
    // await getListZbDefine()
    await getdptList();
  });
});
</script>

<style scoped lang="less">
.indexAllocation-all {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .black-divider {
    width: 100%;
    height: 1px;
    background: #ccc;
    margin-bottom: 15px;
  }

  .indexAllocation-bottom {
    width: 102%;
    height: 8%;
    background: #fff;
    margin-top: 10px;
    display: flex;
    overflow: visible;
    margin-left: -1%;
  }

  .indexAllocation-list {
    width: 100%;
    height: calc(100% - 1px);
    display: flex;
    flex-direction: column;
    gap: 15px;

    .indexAllocation-top-class {
      display: flex;
      // flex-direction: column;
      justify-content: space-between;
      width: 100%;
      flex-shrink: 0;

      .indexAllocation-top-search {
        width: 79%;
        background-color: #fff;
      }

      .indexAllocation-top-title {
        width: 20%;
        display: flex;
        flex-direction: column;

        .indexAllocation-title-head {
          height: 48%;
          background-color: #ffffff;
        }

        .indexAllocation-title-body {
          margin-top: 10px;
          height: 48%;
          display: inline-flex;
          align-items: center;
          gap: 20px;
          background-color: #ffffff;
          padding: 12px 24px;

          /* 单个选项的基础样式 (未激活状态) */
          .toggle-item {
            position: relative;
            padding: 6px 12px;
            font-size: 16px;
            color: #3b82f6;
            text-decoration: underline;
            text-underline-offset: 4px;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
          }

          /* 激活状态样式 */
          .toggle-item.active {
            color: #a855f7;
            background-color: #f5edff;
            text-decoration: none;
            background-image:
              linear-gradient(#c084fc, #c084fc), linear-gradient(#c084fc, #c084fc),
              linear-gradient(#c084fc, #c084fc), linear-gradient(#c084fc, #c084fc),
              linear-gradient(#c084fc, #c084fc), linear-gradient(#c084fc, #c084fc),
              linear-gradient(#c084fc, #c084fc), linear-gradient(#c084fc, #c084fc);
            background-repeat: no-repeat;

            background-size:
              10px 2px, 2px 10px,
              10px 2px, 2px 10px,
              10px 2px, 2px 10px,
              10px 2px, 2px 10px;

            background-position:
              0 0, 0 0,
              100% 0, 100% 0,
              0 100%, 0 100%,
              100% 100%, 100% 100%;
          }
        }
      }
    }

    .indexAllocation-bottom-class {
      width: 100%;
      position: relative;
      display: flex;
      min-height: 0;
      flex: 1;

      .radioList {
        margin-left: 10px;
        position: absolute;
        top: 10px;
        right: 20px;
        z-index: 100;
      }
    }
  }

  .indexAllocation-left {
    background-color: #fff;
    width: 21%;
    height: 100%;
  }

  .indexAllocation-top-btnSelect {
    width: 108px;
    height: 24px;
    display: flex;
    border-radius: 4px;
    margin: 10px 0 0 16px;
    border: 1px solid rgba(166, 166, 166, 1);
    cursor: pointer;

    .indexAllocation-btn-item {
      width: 54px;
      border-radius: 2px;
      height: 24px;
      background: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-size: 12px;

      img {
        width: 12px;
        height: 12px;
      }
    }

    .indexAllocation-btn-active {
      background: rgba(83, 128, 253, 1);
      color: rgba(255, 255, 255, 1);

      .one-image {
        content: url("/src/assets/ItemImg/lbxz.svg");
      }

      .one-images {
        content: url("/src/assets/ItemImg/xqxz.svg");
      }
    }
  }

  .dataItemDefault {
    padding-left: 15px;
    height: 29px;
    border-left: 3px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin: 5px;
  }

  .dataItemSelected {
    border-left: 3px solid rgba(0, 115, 237, 1);
    background: rgba(0, 115, 237, 0.1);
  }

  .indexAllocation-right {
    width: calc(79% - 12px);
    background-color: #fff;
  }
}
</style>

<style lang="scss">
.blue-vertical-line {
  width: 2px;
  height: 26px;
  background: rgba(83, 128, 253, 1);
  border-radius: 1px;
  margin-right: 4px;
}

.indexAllocation-addOrEdit {

  .el-form {
    font-size: 16px;

    .el-form-item-class {
      display: flex;
      flex-wrap: wrap;
      gap: 18px 25px;
    }

    .el-form-item {
      margin: 0 !important;
      width: calc(25% - 20px);

      .el-form-item__label {
        font-size: 16px !important;
        padding-right: 0 !important;
      }
    }

    .el-input {
      width: 100%;
    }

    .el-select {
      width: 100%;
    }

    .el-cascader {
      width: 100%;
    }

    .el-input-number {
      width: 100%;
    }

    .el-input-botton {
      background: #F0F7FF;
      border: 1px solid #0073ED;
      color: #0073ED;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .textarea-class {
      width: calc(50% - 12.5px);
    }
  }

}

.indexAllocation-checkbox-group {
  .el-checkbox__label {
    width: 100%;
  }
}

.el-input-bottons {
  display: flex;
  align-items: center;
  background: rgba(249, 65, 68, 0.1);
  border: 1px solid rgba(249, 65, 68, 0.5);
  color: rgba(249, 65, 68, 1);
}

.indexAllocation--indRuleExpr-dialog {
  .formContentCss {
    padding: 0 !important;

    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 0;
    }

    .el-form-item {
      margin-bottom: 0 !important;
    }
  }

  .tableExpand {
    padding: 16px 0 !important;
  }
}
</style>