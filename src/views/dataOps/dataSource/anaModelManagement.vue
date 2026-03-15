<!-- 分析模型管理 -->
<template>
  <div class="anaModelManagement-list">
    <div class="anaModelManagement-top-class">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="auto" @reset="handleReset"
        @searchVal="handleSearch">
      </searchForm>
    </div>
    <div class="anaModelManagement-bottom-class">
      <tableAndPage ref="tableRef" apiUrl="/business/analyticalModel/page" :queryParams="queryParams"
        :btnList="operationList" :designTableColumns="tableColumns" :showBorder="true" :light="true"
        @btnClick="buttonClick" @selectionChange="handleSelectionChange" @rowClick="rowClick"
        @rowDbClick="handleRowDbClick" @statusClick="switchChange" @cellClick="tableCellClick" primaryKey="uuid"
        :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }" :justBtn="true">
        <template #modelPeriod="{ row }">
          <div class="analysisStyle" v-if="row.modelPeriod">
            {{ row.modelPeriod }}年
          </div>
        </template>
        <template #configStatus="{ row }">
          <div :class="row.configStatus === '0' ? status1 : status2">
            {{ configStatusFn(row.configStatus, "formatter") }}
          </div>
        </template>
      </tableAndPage>
    </div>
  </div>
  <!-- 新增-->
  <SzycDialog :dialogVisible="addOrEditShow" :close-on-click-modal="false" destroy-on-close :title="addOrEditTitle"
    width="35.5%" @close="closeAddOrEdit()">
    <template #uname>
      <div class="anaModelManagement-addOrEdit">
        <el-form :label-position="labelPosition" label-width="150" :inline="false" :model="addOrEditForm"
          ref="addOrEditFormRef" :rules="addOrEditFormRules">
          <div>
            <!-- <div
              style="display: flex; align-items: center; margin-bottom: 10px"
            >
              <img
                src="/src/assets/ItemImg/peizhi.svg"
                style="margin-right: 4px"
                width="16px"
              />基础信息
            </div> -->
            <div class="el-form-item-class">
              <el-form-item label="模型名称：" prop="modelName" style="width: 85%">
                <el-input placeholder="" v-model="addOrEditForm.modelName">
                </el-input>
              </el-form-item>
              <el-form-item label="模型版本号：" prop="version" style="width: 85%">
                <el-input v-model="addOrEditForm.version" placeholder="" />
              </el-form-item>
              <!-- <el-form-item label="模型编号：" prop="modelCode" style="width: 100%">
                <div style="display: flex; align-items: center; width: 100%">
                  <el-input v-model="addOrEditForm.modelCode" disabled>
                  </el-input>
                  <el-button class="custom-button" @click="cereteCode()" style="margin-left: 5px">
                    <img src="/src/assets/ItemImg/shengchengbianma.svg" style="margin-right: 5px" />
                    生成编码
                  </el-button>
                </div>
              </el-form-item> -->
              <el-form-item label="模型拼音码：" prop="modelPym" style="width: 85%">
                <el-input placeholder="" v-model="switchModelPym" disabled>
                </el-input>
              </el-form-item>
              <el-form-item label="关联条款组：" prop="termGroupUuid" style="width: 85%">
                <el-select v-model="addOrEditForm.termGroupUuid" placeholder="请选择" clearable @change="handleTermChange">
                  <el-option v-for="item in clauseArr" :key="item.uuid" :label="item.tkmc" :value="item.uuid" />
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="模型类别：" prop="modelType" style="width: 85%">
                <el-select v-model="addOrEditForm.modelType" placeholder="请选择" clearable>
                  <el-option v-for="item in modelTypeList" :key="item.dictCode" :label="item.dictLabel"
                    :value="item.dictValue" />
                </el-select>
              </el-form-item> -->
              <el-form-item label="关联应用：" prop="appLink" style="width: 85%">
                <el-select v-model="addOrEditForm.appLink" placeholder="请选择" clearable @change="handleAppLinkChange">
                  <el-option v-for="item in appLinkList" :key="item.uuid" :label="item.cpmc"
                    :value="item.uuid" />
                </el-select>
              </el-form-item>
              <el-form-item label="脚本文件路径：" prop="scriptFilePath" style="width: 85%">
                <el-input placeholder="" v-model="addOrEditForm.scriptFilePath" disabled>
                  <template #suffix>
                    <img src="@/assets/ItemImg/folder.svg" alt="选择文件夹" style="width: 20px; height: 20px; cursor: pointer;" @click="handleScriptFileSelect" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="分析周期：" prop="modelPeriod" style="width: 85%">
                <el-input-number v-model="addOrEditForm.modelPeriod" :min="1" :max="10" @change="handleChange" />
                <!-- <span style="margin-left: 10px; font-size: 16px;">年</span> -->
              </el-form-item>
              <!-- <el-form-item label="启用否：" prop="valid">
                <el-switch v-model="addOrEditForm.valid" :active-value="'1'" :inactive-value="'0'" />
              </el-form-item> -->
              <el-form-item label="模型说明：" prop="modelExplain" style="width: 85%">
                <el-input v-model="addOrEditForm.modelExplain" placeholder="" rows="3" type="textarea" clearable
                  style="width: 529px">
                </el-input>
              </el-form-item>
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
  <!-- 模型结构配置-->
  <SzycDialog :dialogVisible="modelStruShow" :close-on-click-modal="false" destroy-on-close title="模型结构配置" width="85%"
    @close="closeModelStru()" :alignCenter="true">
    <template #uname>
      <div class="anaModelManagement-top-class changeSearch">
        <searchForm :modelValue="modelStruParams" :items="modelStruItems" :inline="true" labelWidth="auto"
          @reset="modelStruReset" @searchVal="modelStruSearch">
        </searchForm>
      </div>
      <div class="anaModelManagement-bottom-class changeStyle" style="height: 650px; overflow-y: auto">
        <tableAndPage ref="modelStruRef" apiUrl="/business/analyticalModel/listTkzDetailIndex"
          :queryParams="modelStruParams" :designTableColumns="modelStruTableColumns" :textList="modelStruTextList"
          :showBorder="true" :checkBox="false" @selectionChange="modelStruSelectionChange" @rowClick="modelStruRowClick"
          @statusClick="clauseSwitchChange" primaryKey="uuid" :reserveSelection="true"
          v-bind="{ showBorder: 1, pageOpen: 0 }" :defaultExpandAll="true" :specialtextBg="true">
          <template #action="{ row }">
            <div class="clickable-blue-class" @click.stop="openAllocation(row)">
              配置指标
            </div>
          </template>
          <template #tkmc="{ row }">
            <div v-if="!row.editing" @dblclick="enableEdit(row)" class="editable-cell">
              <span v-if="row.modelTermName">{{ row.modelTermName }}</span><span v-else>{{ row.tkmc }}</span>
            </div>
            <el-input v-else v-model="row.modelTermName" @blur="saveEdit(row)" @keyup.enter="saveEdit(row)" />
          </template>
        </tableAndPage>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="modelStruBtnClick({ text: '返回' })">返回
        </CanCelBtn>
        <buttonDiv @click="indexAllSubmit">保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <!-- 配置指标-->
  <SzycDialog :dialogVisible="indexAllShow" :close-on-click-modal="false" destroy-on-close title="配置指标" width="95%"
    @close="closeindexAll()" :alignCenter="true">
    <template #uname>
      <div style="
          width: 100%;
          border-radius: 4px;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 16px;
        ">
        <div style="
            display: flex;
            align-items: center;
            padding: 12px 16px;
            margin: 0 0px 20px 0px;
            border-bottom: 1px solid rgba(201, 201, 201, 1);
            flex-shrink: 0;
            flex-wrap: wrap;
            gap: 10px;
          ">
          <div style="margin-right: 10px">指标名称：</div>
          <div>
            <el-input v-model="indexAllParams.indexName" placeholder="" clearable
              style="width: 250px; margin-right: 10px" />
          </div>
          <div style="margin-right: 10px">采集方式：</div>
          <div>
            <el-select v-model="indexAllParams.sgtbf" placeholder="请选择" clearable
              style="width: 250px; margin-right: 10px">
              <el-option v-for="item in colTypeFn()" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </div>
          <div style="margin-right: 10px">分析周期：</div>
          <div>
            <el-select v-model="indexAllParams.tjzq" placeholder="请选择" clearable
              style="width: 250px; margin-right: 10px">
              <el-option v-for="item in statPerFn()" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </div>
          <div style="margin-right: 10px">指标版本号：</div>
          <div>
            <el-select v-model="indexAllParams.zbVersion" placeholder="请选择" clearable
              style="width: 250px; margin-right: 10px">
              <el-option v-for="item in zbVerNumList" :key="item.dictValue" :label="item.dictLabel"
                :value="item.dictValue"></el-option>
            </el-select>
          </div>
          <div style="display: flex">
            <buttonDiv type="primary" @click="indexAllSearch">
              <el-icon>
                <Search />
              </el-icon>
              查询
            </buttonDiv>
            <CanCelBtn @click="indexAllReset">
              <el-icon>
                <RefreshRight />
              </el-icon>
              重置
            </CanCelBtn>
          </div>
        </div>
        <div style="
            padding: 0 16px;
            width: calc(100% - 32px);
            flex: 1;
            min-height: 0;
          " class="normalTable">
          <el-table :data="indexTableData" border header-cell-class-name="headerTable" style="width: 100%" height="600"
            max-height="600">
            <el-table-column width="80" align="center" label="选择">
              <template #default="scope">
                <el-radio v-model="scope.row.fjxz" label="1"
                  @input="clickChanges(scope.row, scope.$index)">{{}}</el-radio>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" align="center" width="100" />
            <el-table-column label="指标名称" prop="zbName" min-width="200" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="采集方式" prop="colType" width="100">
              <template #default="scope">
                {{ colTypeFn(scope.row.colType, "formatter") }}
              </template>
            </el-table-column>
            <el-table-column label="分析周期" prop="statPer" width="100">
              <template #default="scope">
                {{ statPerFn(scope.row.statPer, "formatter") }}
              </template>
            </el-table-column>
            <el-table-column label="指标版本号" prop="version" align="center" width="200">
            </el-table-column>
            <el-table-column label="指标编码" prop="zbCode" align="center" width="200">
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="indexAllBtnClick({ text: '取消' })">取消 </CanCelBtn>
        <buttonDiv @click="indexAllBtnClick({ text: '保存' })">保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <!-- 指标配置-->
  <SzycDialog :dialogVisible="indicatorSetShow" :close-on-click-modal="false" destroy-on-close title="指标配置" width="85%"
    @close="closeIndicatorSet()" :alignCenter="true">
    <template #uname>
      <div class="anaModelManagement-top-class changeSearch">
        <searchForm :modelValue="indicatorSetParams" :items="indicatorSetItems" :inline="true" labelWidth="auto"
          @reset="indicatorSetSearch" @searchVal="indicatorSetSearch">
        </searchForm>
      </div>
      <div class="anaModelManagement-bottom-class normalTable changeStyle" style="height: 600px; overflow-y: auto">
        <tableAndPage ref="indicatorSetRef" :apiUrl="selectedIndexWithModel" :queryParams="indicatorSetParams"
          :btnList="indicatorSetBtnList" :designTableColumns="indicatorSetTableColumns" :textList="indicatorSetTextList"
          :btnAndTextStyle="indicatorSetBtnAndTextStyle" :showBorder="true" :checkBox="true" :specialtextBg="true"
          @btnClick="indicatorSetBtnClick" @selectionChange="indicatorSetSelectionChange"
          @statusClick="indicatorSetChange" primaryKey="uuid" :reserveSelection="true"
          v-bind="{ showBorder: 1, pageOpen: 1 }">
        </tableAndPage>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="indicatorSetBtmBtnClick({ text: '取消' })">
          取消
        </CanCelBtn>
        <buttonDiv @click="indicatorSetBtmBtnClick({ text: '保存' })">
          保存
        </buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <!-- 添加指标 -->
  <SzycDialog :dialogVisible="addindicatorShow" :close-on-click-modal="false" destroy-on-close title="添加指标" width="85%"
    @close="closeAddIndicator()" :alignCenter="true">
    <template #uname>
      <div class="anaModelManagement-top-class changeSearch">
        <searchForm :modelValue="addindicatorParams" :items="addindicatorItems" :inline="true" labelWidth="auto"
          @reset="addindicatorReset" @searchVal="addindicatorSearch">
        </searchForm>
      </div>
      <div class="anaModelManagement-bottom-class normalTable" style="height: 600px; overflow-y: auto">
        <tableAndPage ref="addindicatorRef" :apiUrl="allIndexWithModel" :queryParams="addindicatorParams"
          :designTableColumns="addindicatorTableColumns" :showBorder="true" :checkBox="true"
          @selectionChange="addindicatorSelectionChange" @statusClick="addindicatorChange"
          :selectSettings="{ key: 'isCheck', label: '1' }" primaryKey="uuid" :reserveSelection="true"
          v-bind="{ showBorder: 1, pageOpen: 1 }">
        </tableAndPage>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="addindicatorBtmBtnClick({ text: '取消' })">
          取消
        </CanCelBtn>
        <buttonDiv @click="addindicatorBtmBtnClick({ text: '添加' })">
          添加
        </buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <!-- 条款明细-->
  <SzycDialog :dialogVisible="clauseDetailShow" :close-on-click-modal="false" destroy-on-close title="条款明细" width="85%"
    @close="clauseDetailShow = false" :alignCenter="true">
    <template #uname>
      <div class="anaModelManagement-top-class changeSearch">
        <searchForm :modelValue="clauseDetailParams" :items="clauseDetailItems" :inline="true" labelWidth="auto"
          @reset="clauseDetailReset" @searchVal="clauseDetailSearch">
        </searchForm>
      </div>
      <div class="anaModelManagement-bottom-class" style="height: 600px; overflow-y: auto">
        <tableAndPage ref="clauseDetailRef" apiUrl="/business/TKXXB/listTkzDetail" :queryParams="clauseDetailParams"
          :designTableColumns="clauseDetailTableColumns" :showBorder="true" :checkBox="false" :light="true"
          @selectionChange="clauseDetailSelectionChange" @rowClick="clauseDetailRowClick"
          @statusClick="clauseSwitchChange" primaryKey="uuid" :reserveSelection="true" :defaultExpandAll="true"
          v-bind="{ showBorder: 1, pageOpen: 0 }">
        </tableAndPage>
      </div>
      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="clauseCancel"> 返回 </CanCelBtn>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  nextTick,
  watch,
  h,
  markRaw,
} from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import {
  statusFn,
  isStandardModelFn,
  analysisCycleTypeFn,
  configStatusFn,
  colTypeFn,
  isNationFn,
  statPerFn,
} from "@/types/dict/index.js";
import {
  returnPinYin,
  insertFxmx,
  deleteFxmx,
  updateFxmx,
  copyFxmx,
  listTermGroupUseInfo,
  listAllIndexWithTerm,
  updateTermIndexRelation,
  listAllIndexWithModel,
  updateIndexModelRelation,
  updateTk,
  updateTermName,
} from "@/api/modelIndexManage/anaModelManagement.js";
import { selectSourceApp } from "@/api/modelIndexManage/indexAllocation.js";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listGroup, listTkzDetail } from "@/api/clauseManage/index.js";
import { dictStore } from "@/store/dict";
import { changeState } from "@/api/modelIndexManage/indexAllocation.js";
import { listIdxCpxxb } from "@/api/appManage/appRegist";
import { pinyin } from "pinyin-pro";

const DeleteIconComponent = {
  setup() {
    return () =>
      h("img", {
        src: "/src/assets/ItemImg/deleteIcon.svg",
        style: {
          width: "30px",
          height: "25px",
        },
      });
  },
};

const dictKey = dictStore();

const tableRef = ref(null);
const addOrEditShow = ref(false);
const addOrEditFormRef = ref(null);
const addOrEditTitle = ref("");
const modelStruShow = ref(false);
const modelStruRef = ref(null);
const indexAllShow = ref(false);
const indexAllRef = ref(null);
const indicatorSetShow = ref(false);
const indicatorSetRef = ref(null);
const clauseDetailShow = ref(false);
const clauseDetailRef = ref(null);
const modelTypeList = ref([]);
const addindicatorShow = ref(false);
const addindicatorRef = ref(null);
const indicatorSetUuid = ref("");

// 配置指标表格
const indexTableData = ref([]);
// const currentPage = ref(1);
// const pageSizes = ref(10);
// const total = ref(0);
// const pageArr = [10, 15, 30, 45, 60, 75, 90]; //  每页显示数量

const status1 = ref("status1");
const status2 = ref("status2");
const appLinkList = ref([]);

// 从pinia store中获取数据
const dictStoreInstance = dictStore();
const analPerList = computed(
  () => dictStoreInstance.dict?.statisticalPeriod || []
);
const zbVerNumList = computed(
  () => dictStoreInstance.dict?.indexDefineLevel || []
);
const zbAttrList = computed(() => dictStoreInstance.dict?.indexAttribute || []);
const respDptList = computed(() => dictStoreInstance?.respDptList || []);
const unitList = computed(() => dictStoreInstance.dict?.unitOfMeasurement);
const zbDirList = computed(
  () => dictStoreInstance.dict?.indexOrientation || []
);
console.log("analPerList", analPerList.value);

// 首页表格

//  查询条件
const queryParams = reactive({
  modelName: "", //  模型名称
  appLink: "", //  关联应用
  version: "", //  版本号
  valid: "", //  启用否
});

const searchItems = computed(() => [
  {
    component: "el-input",
    label: "模型名称：",
    style: { width: "200px" },
    prop: "modelName",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-select",
    label: "关联应用：",
    style: { width: "200px" },
    prop: "appLink",
    optionValue: "uuid",
    optionLabel: "cpmc",
    attrs: { placeholder: "请选择", clearable: true },
    options: appLinkList.value,
  },
  {
    component: "el-input",
    label: "模型版本号：",
    style: { width: "200px" },
    prop: "version",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-select",
    label: "启用否：",
    style: { width: "200px" },
    prop: "valid",
    optionValue: "value",
    attrs: { placeholder: "请选择", clearable: true },
    options: statusFn(),
  },
]);

// const termNameListFn = (data,) => {
//   return data?.map((item) => item).join("、");
// };

//  表格数据
const tableColumns = ref([
  {
    columnLabel: "版本号",
    columnName: "version",
    columnWidth: "120",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "模型编号",
    columnName: "modelCode",
    columnWidth: "100",
    align: "left",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "模型名称",
    columnName: "modelName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "模型名称拼音码",
    columnName: "modelPym",
    columnWidth: "150",
    align: "left",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "模型类型",
    columnName: "isStandardModel",
    columnWidth: "120",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return isStandardModelFn(row.isStandardModel, "formatter");
    },
  },
  // {
  //   columnLabel: "模型类别",
  //   columnName: "modelType",
  //   columnWidth: "180",
  //   align: "left",
  //   showOverflowTooltip: true,
  //   formatter: (row, cloumn, index) => {
  //     return (
  //       modelTypeList.value.find((item) => item.dictValue === row.modelType)
  //         ?.dictLabel || ""
  //     );
  //   },
  // },
  {
    columnLabel: "关联应用",
    columnName: "appLink",
    columnWidth: "180",
    align: "left",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return (
        appLinkList.value.find((item) => item.uuid === row.appLink)
          ?.cpmc || ""
      );
    },
  },
  {
    columnLabel: "分析周期",
    columnName: "modelPeriod",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
    hasSlot: true,
  },
  {
    columnLabel: "模型说明",
    columnName: "modelExplain",
    columnWidth: "100",
    align: "left",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "关联条款组",
    columnName: "termGroupName",
    align: "left",
    showOverflowTooltip: true,
    isClick: true,
    // formatter: (row, cloumn, index) => {
    //   return termNameListFn(row.termGroupName, "formatter");
    // },
  },
  {
    columnLabel: "指标配置情况",
    columnName: "configStatus",
    columnWidth: "140",
    showOverflowTooltip: true,
    hasSlot: true,
    formatter: (row, cloumn, index) => {
      return configStatusFn(row.configStatus, "formatter");
    },
  },
  // {
  //   columnLabel: "启用否",
  //   columnName: "valid",
  //   kyf: "1",
  //   columnWidth: "80",
  //   align: "center",
  //   attrs: { "active-value": "1", "inactive-value": "0" },
  // },
]);

const operationList = ref([
  {
    btnType: "add",
    bind: { type: "baseSpecial" },
    permission: "fxmxgl-add",
  },
  {
    text: "编辑",
    btnType: "edit",
    bind: { type: "baseSpecial" },
    permission: "fxmxgl-edit",
  },

  {
    text: "结构配置",
    btnType: "edit",
    icon: "Connection",
    typeRow: "rowType",
    bind: { type: "baseSpecial" },
    permission: "fxmxgl-jgpz",
  },
  {
    text: "指标配置",
    btnType: "edit",
    // img: "/ItemImg/zhibiaopeizhi1.svg",
    icon: "Setting",
    typeRow: "rowType",
    bind: { type: "baseSpecial" },
    permission: "fxmxgl-jbpz",
  },
  {
    text: "复制",
    btnType: "edit",
    icon: "DocumentCopy",
    typeRow: "rowType",
    bind: { type: "baseSpecial" },
    permission: "fxmxgl-copy",
  },
  {
    btnType: "delete",
    // bind: { type: "deleteSpecial" },
    permission: "fxmxgl-del",
  },
]);

//  查询
const handleSearch = () => {
  if (!tableRef.value) return;
  // specialHandle(queryParams.createDate);
  tableRef.value.fetchData("重置");
};

const handleReset = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("重置");
};

const selectionList = ref();
const handleSelectionChange = (val) => {
  selectionList.value = val.map((item) => {
    return item.uuid;
  });
};
// 按钮事件
const buttonClick = async (val, lightVal) => {
  console.log("val11", val);
  console.log("lightVal", lightVal);
  if (val.text === "新增") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "新增分析模型";
    cereteCode();
  } else if (val.text === "编辑") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "编辑分析模型";
    Object.assign(addOrEditForm, lightVal);
  } else if (val.text === "结构配置") {
    console.log("lightVal", lightVal);
    modelStruShow.value = true;
    editLine.value = [];
    modelStruTextList.value[0].value =
      modelTypeList.value.find((item) => item.dictValue === lightVal.modelType)
        ?.dictLabel || "";
    modelStruTextList.value[1].value = lightVal.modelCode;
    modelStruTextList.value[2].value = lightVal.modelName;
    modelStruTextList.value[3].value = lightVal.termGroupName;
    indexAllParams.fxmxUuid = lightVal.uuid;
    modelStruParams.uuid = lightVal.termGroupUuid;
    nextTick(() => {
      modelStruRef.value?.fetchData();
    });
  } else if (val.text === "指标配置") {
    indicatorSetShow.value = true;
    indicatorSetTextList.value[0].value =
      modelTypeList.value.find((item) => item.dictValue === lightVal.modelType)
        ?.dictLabel || "";
    indicatorSetTextList.value[1].value = lightVal.modelCode;
    indicatorSetTextList.value[2].value = lightVal.modelName;
    getAllIndexWithModel(lightVal.uuid);
    indicatorSetUuid.value = lightVal.uuid;
  } else if (val.text === "复制") {
    addOrEditShow.value = true;
    cereteCode();
    Object.assign(addOrEditForm, lightVal);
    addOrEditTitle.value = "复制分析模型";
  } else if (val.text === "删除") {
    deleteItem(selectionList.value);
  }
};

// 单元格点击事件
const tableCellClick = async (row, column, $index) => {
  clauseDetailParams.uuid = row.row.termGroupUuid;
  clauseDetailShow.value = true;
  nextTick(async () => {
    if (clauseDetailRef.value) {
      clauseDetailRef.value.fetchData();
    }
  });
};

// 切换模型状态
const switchChange = async (val) => {
  console.log(val);
  let params = {
    ...val.row,
  };
  let res = await updateFxmx(params);
  if (res.code == 200) {
    ElMessage.success(val.value == 1 ? "已启用" : "已禁用");
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  } else {
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
    return;
  }
};

//新增编辑弹窗
const addOrEditForm = reactive({
  version: "", //  模型版本号
  modelName: "", //  模型名称
  modelCode: "", //  模型编号
  modelPym: "", //  模型拼音码
  // modelType: "", //  模型类别
  appLink: "", //  关联应用
  appLinkName: "", //  关联应用名称
  modelPeriod: 1, //  周期
  analysisCycleType: "1",
  isStandardModel: "0", // 模型类型(默认自定义)
  modelExplain: "", //  模型说明
  valid: "1", //  启用否
  termGroupUuid: "", // 关联条款组uuid
  termGroupName: "", // 关联条款组名称
});

const addOrEditFormRules = reactive({
  version: [
    {
      required: true,
      message: "请输入模型版本号",
      trigger: "blur",
    },
  ],
  modelName: [
    {
      required: true,
      message: "请输入模型名称",
      trigger: "blur",
    },
  ],
  modelCode: [
    {
      required: true,
      message: "请输入模型编码",
      trigger: "blur",
    },
  ],
  // modelPym: [
  //   {
  //     required: true,
  //     message: "请输入模型拼音码",
  //     trigger: "blur",
  //   },
  // ],
  // modelType: [
  //   {
  //     required: true,
  //     message: "请输入模型类别",
  //     trigger: "blur",
  //   },
  // ],
  termGroupUuid: [
    {
      required: true,
      message: "请选择关联条款组",
      trigger: "change",
    },
  ],
  appLink: [
    {
      required: true,
      message: "请选择关联应用",
      trigger: "change",
    }
  ]
});

const cereteCode = async () => {
  let res = await returnPinYin({});
  addOrEditForm.modelCode = res.data;
};

// 新增模型
const addOrEditSubmit = async () => {
  addOrEditFormRef.value.validate(async (valid) => {
    if (valid) {
      addOrEditForm.modelPym = switchModelPym.value;
      if (addOrEditTitle.value == "新增分析模型") {
        let params = {
          ...addOrEditForm,
        };
        console.log("新增", params);
        let res = await insertFxmx(params);
        if (res.code == 200) {
          ElMessage.success("新增成功");
          addOrEditShow.value = false;
          closeAddOrEdit();
          getlistGroup();
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        }
      } else if (addOrEditTitle.value == "编辑分析模型") {
        let params = {
          ...addOrEditForm,
        };
        console.log("编辑", params);
        let res = await updateFxmx(params);
        if (res.code == 200) {
          ElMessage.success("编辑成功");
          addOrEditShow.value = false;
          closeAddOrEdit();
          getlistGroup();
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        }
      } else if (addOrEditTitle.value == "复制分析模型") {
        let params = {
          ...addOrEditForm,
        };
        let res = await copyFxmx(params);
        if (res.code == 200) {
          ElMessage.success("复制成功");
          addOrEditShow.value = false;
          closeAddOrEdit();
          getlistGroup();
          if (tableRef.value) {
            tableRef.value.fetchData();
          }
        }
      }
    }
  });
};

// 删除模型
const deleteItem = async (val) => {
  ElMessageBox.confirm(`确定删除吗？`, "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    customClass: "custom-confirm-box",
    icon: markRaw(DeleteIconComponent),
  }).then(async () => {
    let res = await deleteFxmx({ uuidList: val });
    if (res.code == 200) {
      ElMessage.success("删除成功");
      if (tableRef.value) {
        tableRef.value.fetchData();
        tableRef.value?.clearSelection();
      }
    }
  });
};

const closeAddOrEdit = () => {
  addOrEditShow.value = false;

  // 定义应该存在于 addOrEditForm 中的字段
  const validFields = [
    "version",
    "modelName",
    "modelCode",
    "modelPym",
    // "modelType",
    "appLink",
    "appLinkName",
    "modelPeriod",
    "analysisCycleType",
    "isStandardModel",
    "modelExplain",
    "valid",
    "termGroupUuid",
    "termGroupName",
  ];

  // 清理对象：删除无效字段
  Object.keys(addOrEditForm).forEach((key) => {
    if (!validFields.includes(key)) {
      delete addOrEditForm[key];
    }
  });

  // 重置有效字段为默认值
  validFields.forEach((key) => {
    if (key === "valid") {
      addOrEditForm[key] = "1"; // 启用状态默认为1
    } else if (key === "modelPeriod") {
      addOrEditForm[key] = 1; // 分析周期默认为1年
    } else if (key === "isStandardModel") {
      addOrEditForm[key] = "0"; // 模型类型默认为自定义('0')
    } else if (key === "analysisCycleType") {
      addOrEditForm[key] = "1"; // 分析周期类型默认为'1'
    } else {
      addOrEditForm[key] = ""; // 其他字段重置为空字符串
    }
  });
};

// 修改 handleTermChange 方法
const handleTermChange = (val) => {
  if (val) {
    let selectedItem = clauseArr.value.find((item) => item.uuid === val);
    if (selectedItem) {
      addOrEditForm.termGroupName = selectedItem.tkmc;
    }
  }
};
const handleAppLinkChange = (val) => {
  if (val) {
    let selectedItem = appLinkList.value.find((item) => item.uuid === val);
    if (selectedItem) {
      addOrEditForm.appLinkName = selectedItem.cpmc;
    }
  } else {
    addOrEditForm.appLinkName = '';
  }
};

//模型结构配置
//  查询条件
const modelStruParams = reactive({
  uuid: "",
  tkmc: "", //  条款名称
  tkbm: "", //  条款编码
  valid: null, //  状态
});

const modelStruItems = computed(() => [
  {
    component: "el-input",
    label: "条款名称：",
    style: { width: "200px" },
    prop: "tkmc",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-input",
    label: "条款编码：",
    style: { width: "200px" },
    prop: "tkbm",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-select",
    label: "启用否：",
    style: { width: "200px" },
    prop: "valid",
    optionValue: "value",
    attrs: { placeholder: "请选择", clearable: true },
    options: statusFn(),
  },
]);

//  表格数据
const modelStruTableColumns = ref([
  {
    columnLabel: "条款编码",
    columnName: "tkbm",
    columnWidth: "200",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "条款名称",
    columnName: "tkmc",
    columnWidth: "250",
    showOverflowTooltip: true,
    hasSlot: true,
  },
  {
    columnLabel: "关联指标名称",
    columnName: "indexName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "启用否",
    columnName: "isQy",
    kyf: "1",
    columnWidth: "100",
    align: "center",
    attrs: { "active-value": "1", "inactive-value": "0" },
  },
  {
    columnLabel: "操作",
    columnName: "action",
    columnWidth: "100",
    hasSlot: true,
  },
]);

const modelStruTextList = ref([
  {
    label: "模型类别",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7); font-size: 16px",
  },
  {
    label: "模型版本号",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7); font-size: 16px",
  },
  {
    label: "模型名称",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7); font-size: 16px",
  },
  {
    label: "条款组名称",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7); font-size: 16px",
  },
]);

//  查询
const modelStruReset = () => {
  if (!modelStruRef.value) return;
  // specialHandle(queryParams.createDate);
  modelStruRef.value.fetchData("重置");
};

const modelStruSearch = () => {
  if (!modelStruRef.value) return;
  modelStruRef.value.fetchData("重置");
};

const closeModelStru = () => {
  modelStruShow.value = false;
};

const modelStruBtnClick = async (val) => {
  if (val.text === "返回") {
    modelStruShow.value = false;
    modelStruParams.uuid = "";
    modelStruParams.tkmc = "";
    modelStruParams.tkbm = "";
    modelStruParams.valid = "";
  } else if (val.text === "保存") {
  }
};

const editLine = ref([]);
// 双击进入编辑状态
const enableEdit = (row) => {
  row.editing = true;
  nextTick(() => {
    const input = document.querySelector(
      ".editable-cell + .el-input__wrapper input"
    );
    if (input) {
      input.focus();
    }
  });
};

// 保存编辑内容
const saveEdit = async (row) => {
  row.editing = false;
  // 检查是否已存在相同项，避免重复添加
  const existingIndex = editLine.value.findIndex(
    (item) => item.termGroupUuid === row.uuid
  );
  const newItem = {
    termGroupUuid: row.uuid,
    termGroupName: row.modelTermName,
    uuid: indexAllParams.modelUuid,
  };

  if (existingIndex >= 0) {
    // 如果已存在，更新该项
    editLine.value[existingIndex] = newItem;
  } else {
    // 如果不存在，添加新项
    editLine.value.push(newItem);
  }
};

const indexAllSubmit = async () => {
  // 确保所有正在编辑的行都已完成编辑
  const editingRows = modelStruRef.value?.tableData?.filter(
    (row) => row.editing
  );
  if (editingRows && editingRows.length > 0) {
    // 自动保存所有正在编辑的行
    for (const row of editingRows) {
      await saveEdit(row);
    }
  }

  // 确保editLine中有数据再调用接口
  if (editLine.value && editLine.value.length > 0) {
    console.log("保存修改:", editLine.value);
    let res = await updateTermName(editLine.value);
    if (res.code == 200) {
      ElMessage.success("保存成功");
      modelStruSearch();
      editLine.value = [];
    } else {
      ElMessage.error(res.msg || "保存失败");
    }
  } else {
    ElMessage.info("没有需要保存的修改");
  }
};

//结构配置-配置指标

// 查询参数
const indexAllParams = reactive({
  indexName: "", //  指标名称
  sgtbf: "", //  采集方式
  tjzq: "", // 分析周期
  zbVersion: "", // 指标版本号
  fxmxUuid: "", // 模型uuid
  termUuid: "", // 条款uuid
});

const openAllocation = (val) => {
  indexAllShow.value = true;
  indexAllParams.termUuid = val.uuid;
  indexAllSearch();
};

const indexAllReset = () => {
  indexAllParams.indexName = "";
  indexAllParams.sgtbf = "";
  indexAllParams.tjzq = "";
  indexAllParams.zbVersion = "";
  indexAllSearch();
};

const handleSizeChange = (val) => {
  currentPage.value = 1; // 重置为第一页
  pageSizes.value = val; // 更新每页条数
  indexAllSearch();
};
const handlePageChange = (val) => {
  currentPage.value = val;
  indexAllSearch();
};

const indexAllSearch = async () => {
  let params = {
    ...indexAllParams,
    pageNum: 1,
    pageSize: 9999,
  };
  let res = await listAllIndexWithTerm(params);
  if (res.code == 200) {
    // 根据isCheck字段设置默认选中项
    const data = res.data.map((item) => ({
      ...item,
      fjxz: item.isCheck === "1" ? "1" : "0",
    }));

    indexTableData.value = data;

    // 设置zbData为默认选中的项
    const checkedItem = data.find((item) => item.fjxz === "1");
    if (checkedItem) {
      zbData.value = checkedItem;
    }
  } else {
    indexTableData.value = [];
  }
};

// 获取单选的信息
const zbData = ref({});
const clickChanges = (item, index) => {
  indexTableData.value?.forEach((e, i) => {
    if (i == index) {
      e.fjxz = "1";
      zbData.value = e;
    } else {
      e.fjxz = "0";
    }
  });
};

const indexAllBtnClick = async (val) => {
  if (val.text === "取消") {
    indexAllShow.value = false;
  } else if (val.text === "保存") {
    let params = {
      uuid: indexAllParams.termUuid,
      indexUuid: zbData.value.uuid,
    };
    console.log("保存", params);
    let res = await updateTermIndexRelation(params);
    if (res.code == 200) {
      ElMessage.success("保存成功");
      nextTick(() => {
        modelStruRef.value?.fetchData();
      });
      indexAllShow.value = false;
    }
  }
};

const closeindexAll = () => {
  indexAllParams.indexName = "";
  indexAllParams.sgtbf = "";
  indexAllParams.tjzq = "";
  indexAllParams.zbVersion = "";
  indexAllShow.value = false;
};

const allIndexWithModel = ref([]);
const allIndexWithModelFull = ref([]);
const selectedIndexWithModel = ref([]);
const selectedAddIndicators = ref([]);
const fxmxUuid = ref("");
const getAllIndexWithModel = async (val) => {
  fxmxUuid.value = val;
  let res = await listAllIndexWithModel({ fxmxUuid: val });
  if (res.code == 200) {
    allIndexWithModel.value = res.data;
    allIndexWithModelFull.value = [...res.data];
    selectedIndexWithModel.value = res.data.filter((item) => {
      return item.isCheck === "1";
    });
    nextTick(async () => {
      if (indicatorSetRef.value) {
        indicatorSetRef.value.fetchData();
      }
    });
  }
};
//指标配置
const indicatorSetParams = reactive({
  zbName: "", //  指标名称
  indexCode: "", //  指标显示名称
  kyf: "", //  启用否
});

const indicatorSetItems = computed(() => [
  {
    component: "el-input",
    label: "指标名称：",
    style: { width: "200px" },
    prop: "zbName",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-input",
    label: "指标显示名称：",
    style: { width: "200px" },
    prop: "indexCode",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-select",
    label: "启用否：",
    style: { width: "200px" },
    prop: "kyf",
    optionValue: "value",
    attrs: { placeholder: "请选择", clearable: true },
    options: statusFn(),
  },
]);

const indicatorSetBtnList = ref([
  {
    text: "添加",
    btnType: "add",
    bind: { type: "baseSpecial" },
  },
  {
    text: "删除",
    btnType: "delete",
    bind: { type: "deleteSpecial" },
  },
]);

const indicatorSetTextList = ref([
  {
    label: "模型类型",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7);font-size:16px",
  },
  {
    label: "模型版本号",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7);font-size:16px",
  },
  {
    label: "模型名称",
    value: "",
    style: "color:rgba(29, 33, 41, 0.7);font-size:16px",
  },
]);

const indicatorSetBtnAndTextStyle = ref(
  "display:flex;align-items:center;justify-content:space-between;"
);

const indicatorSetSearch = (val) => {
  console.log(val);

  // 根据传入的参数过滤selectedIndexWithModel数组
  if (!val) {
    // 如果没有传入参数，重置为所有已配置的指标
    selectedIndexWithModel.value = allIndexWithModel.value.filter((item) => {
      return item.isCheck === "1";
    });
  } else {
    // 根据传入的参数过滤
    selectedIndexWithModel.value = allIndexWithModel.value.filter((item) => {
      // 检查isCheck是否为1（已配置）
      if (item.isCheck !== "1") return false;

      // 根据指标名称过滤
      if (val.zbName && !item.zbName.includes(val.zbName)) return false;

      // 根据指标编码过滤
      if (val.indexCode && !item.indexCode.includes(val.indexCode))
        return false;

      // 根据启用状态过滤
      if (
        val.kyf !== "" &&
        val.kyf !== undefined &&
        val.kyf !== null &&
        item.kyf != val.kyf
      )
        return false;

      return true;
    });
  }

  // 如果表格组件存在，则刷新显示
  nextTick(() => {
    if (indicatorSetRef.value && indicatorSetRef.value.fetchData) {
      indicatorSetRef.value.fetchData();
    }
  });
};

//  表格数据
const indicatorSetTableColumns = ref([
  {
    columnLabel: "指标编码",
    columnName: "zbCode",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标名称",
    columnName: "zbName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "指标显示名称",
    columnName: "modelName",
    columnWidth: "150",
    showOverflowTooltip: true,
  },
  // {
  //   columnLabel: "指标版本号",
  //   columnName: "zbVerNum",
  //   columnWidth: "150",
  //   align: "center",
  //   showOverflowTooltip: true,
  // },
  {
    columnLabel: "采集方式",
    columnName: "colType",
    columnWidth: "120",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return colTypeFn(row.colType, "formatter");
    },
  },
  {
    columnLabel: "指标属性",
    columnName: "zbAttr",
    columnWidth: "150",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbAttrFn(row.zbAttr);
    },
  },
  // {
  //   columnLabel: "统计周期",
  //   columnName: "statPer",
  //   columnWidth: "100",
  //   align: "center",
  //   showOverflowTooltip: true,
  //   formatter: (row, cloumn, index) => {
  //     return statPerFn(row.statPer, "formatter");
  //   },
  // },
  {
    columnLabel: "指标类型",
    columnName: "zbType",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "责任科室",
    columnName: "respDpt",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      console.log(row);
      return respDptList.value.find((item) => item.hospDptcode == row.respDpt)
        ?.hospDptname;
    },
  },
  {
    columnLabel: "启用否",
    columnName: "kyf",
    kyf: "1",
    columnWidth: "80",
    align: "center",
    attrs: { "active-value": "1", "inactive-value": "0" },
  },
]);

const closeIndicatorSet = () => {
  indicatorSetShow.value = false;
};

const deleteIndexWithModel = ref([]);
const indicatorSetSelectionChange = (val) => {
  deleteIndexWithModel.value = val.map((item) => {
    return item.uuid;
  });
  console.log(deleteIndexWithModel.value);
};
const indicatorSetBtnClick = async (val) => {
  if (val.text === "添加") {
    addindicatorShow.value = true;
    allIndexWithModel.value = allIndexWithModelFull.value.filter((item) => {
      // 检查该项是否已经在selectedIndexWithModel中（已选中）
      return !selectedIndexWithModel.value.some(
        (selected) => selected.uuid === item.uuid
      );
    });
    nextTick(() => {
      if (addindicatorRef.value) {
        addindicatorRef.value.fetchData();
      }
    });
  } else if (val.text === "删除") {
    if (deleteIndexWithModel.value.length === 0) {
      ElMessage.warning("请先选择要删除的指标");
      return;
    }
    // 将allIndexWithModel中对应zbUuid的对象的isCheck设置为0
    allIndexWithModel.value = allIndexWithModel.value.map((item) => {
      if (deleteIndexWithModel.value.includes(item.uuid)) {
        return { ...item, isCheck: "0" };
      }
      return item;
    });

    // 同时更新完整数据副本
    allIndexWithModelFull.value = allIndexWithModelFull.value.map((item) => {
      if (deleteIndexWithModel.value.includes(item.uuid)) {
        return { ...item, isCheck: "0" };
      }
      return item;
    });

    // 重新筛选selectedIndexWithModel（isCheck为1的项）
    selectedIndexWithModel.value = allIndexWithModel.value.filter(
      (item) => item.isCheck === "1"
    );
    // 清空选中项
    deleteIndexWithModel.value = [];

    // 更新表格显示
    nextTick(() => {
      if (indicatorSetRef.value && indicatorSetRef.value.fetchData) {
        indicatorSetRef.value.fetchData();
        indicatorSetRef.value?.clearSelection();
      }
    });

    ElMessage.success("删除成功");
  }
};

const indicatorSetChange = async (row) => {
  console.log(row);

  // 切换当前行的kyf属性
  const newValue = row.value; // 新的kyf值（0或1）
  const uuid = row.row.uuid; // 当前行的指标UUID

  // 更新allIndexWithModel数组中对应项的kyf值
  allIndexWithModel.value = allIndexWithModel.value.map((item) => {
    if (item.uuid === uuid) {
      return { ...item, kyf: newValue };
    }
    return item;
  });

  // 同时更新完整数据副本
  allIndexWithModelFull.value = allIndexWithModelFull.value.map((item) => {
    if (item.uuid === uuid) {
      return { ...item, kyf: newValue };
    }
    return item;
  });

  // 更新selectedIndexWithModel数组中对应项的kyf值
  selectedIndexWithModel.value = selectedIndexWithModel.value.map((item) => {
    if (item.uuid === uuid) {
      return { ...item, kyf: newValue };
    }
    return item;
  });

  let params = {
    zbUuid: uuid,
    state: newValue,
    modelUuid: fxmxUuid.value,
  };
  let res = await changeState(params);
  if (res.code == 200) {
    // 显示操作成功消息
    ElMessage.success(newValue == 1 ? "已启用" : "已禁用");
  }
};

const indicatorSetBtmBtnClick = async (val) => {
  if (val.text === "取消") {
    indicatorSetShow.value = false;
    indicatorSetParams.zbName = "";
    indicatorSetParams.indexCode = "";
    indicatorSetParams.kyf = "";
  } else if (val.text === "保存") {
    let params = {
      uuid: indicatorSetUuid.value,
      indexIds: selectedIndexWithModel.value.map((item) => {
        return {
          zbdyxxbuuid: item.uuid,
          isKy: item.kyf,
        };
      }),
    };
    console.log("保存", params);
    let res = await updateIndexModelRelation(params);
    if (res.code == 200) {
      ElMessage.success("保存成功");
      indicatorSetShow.value = false;
    }
  }
};

//条款明细
const clauseDetailParams = reactive({
  uuid: "",
  tkbm: "", //  明细编码
  tkmc: "", //  明细名称
  isQy: "", //  启用否
});

const clauseDetailItems = computed(() => [
  {
    component: "el-input",
    label: "条款组明细编码：",
    style: { width: "200px" },
    prop: "tkbm",
    attrs: { placeholder: "" },
  },
  {
    component: "el-input",
    label: "条款组明细名称：",
    style: { width: "200px" },
    prop: "tkmc",
    attrs: { placeholder: "" },
  },
  {
    component: "el-select",
    label: "启用否：",
    style: { width: "200px" },
    prop: "isQy",
    attrs: { placeholder: "请选择" },
    options: statusFn(),
  },
]);

const clauseDetailBtnList = ref([
  {
    label: "取消",
    btnType: "cancel",
  },
]);

const clauseDetailTableColumns = ref([
  {
    columnLabel: "条款组明细编码",
    columnName: "tkbm",
    columnWidth: "200",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "条款组明细名称",
    columnName: "tkmc",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "条款组明细拼音码",
    columnName: "tkmcpy",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "条款级别",
    columnName: "bz",
    columnWidth: "180",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "可用否",
    columnName: "isQy",
    columnWidth: "180",
    align: "center",
    showOverflowTooltip: true,
    kyf: 1,
    attrs: {
      "active-value": "1",
      "inactive-value": "0",
    },
  },
]);

// 修改条款明细
const clauseSwitchChange = async (val) => {
  let params = {
    id: val.row.id,
    uuid: val.row.uuid,
    tkmc: val.row.tkmc,
    tkbm: val.row.tkbm,
    bz: val.row.bz,
    showindex: val.row.showindex,
    isQy: val.value,
    fjuuid: val.row.fjuuid,
  };
  let res = await updateTk(params);
  if (res.code == 200) {
    ElMessage.success(val.value == 1 ? "已启用" : "已禁用");
    if (clauseDetailRef.value) {
      clauseDetailRef.value.fetchData();
    }
    if (!modelStruRef.value) return;
    modelStruRef.value.fetchData();
  }
};

const clauseCancel = () => {
  clauseDetailShow.value = false;
  clauseDetailParams.uuid = "";
  clauseDetailParams.tkbm = ""; //  明细编码
  clauseDetailParams.tkmc = ""; //  明细名称
  clauseDetailParams.isQy = ""; //  启用否
};

//  查询
const clauseDetailSearch = () => {
  if (clauseDetailRef.value) {
    clauseDetailRef.value.fetchData();
  }
};
// 重置
const clauseDetailReset = () => {
  console.log("重置");
  if (clauseDetailRef.value) {
    clauseDetailRef.value.fetchData("重置");
  }
};

const clauseArr = ref([]);
// 查询条款组
const getlistGroup = async () => {
  let res = await listTermGroupUseInfo({});
  if (res.code == 200) {
    clauseArr.value = res.data;
  }
};

// 添加指标
const closeAddIndicator = () => {
  addindicatorShow.value = false;
};

const addindicatorParams = reactive({
  zbName: "", //  指标名称
  zbCode: "", //  指标显示名称
  // kyf: "", //  启用否
});
const addindicatorItems = computed(() => [
  {
    component: "el-input",
    label: "指标名称：",
    style: { width: "200px" },
    prop: "zbName",
    attrs: { placeholder: "", clearable: true },
  },
  {
    component: "el-input",
    label: "指标编码：",
    style: { width: "200px" },
    prop: "zbCode",
    attrs: { placeholder: "", clearable: true },
  },
  // {
  //   component: "el-select",
  //   label: "启用否：",
  //   style: { width: "200px" },
  //   prop: "kyf",
  //   optionValue: "value",
  //   attrs: { placeholder: "请选择", clearable: true },
  //   options: statusFn()
  // },
]);

const addindicatorTableColumns = ref([
  // {
  //   columnLabel: "版本号",
  //   columnName: "zbVerNum",
  //   columnWidth: "100",
  //   align: "center",
  //   showOverflowTooltip: true,
  // },
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
    columnName: "colType",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return colTypeFn(row.colType, "formatter");
    },
  },
  {
    columnLabel: "计量单位",
    columnName: "unit",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return unitFn(row.unit, "label");
    },
  },
  {
    columnLabel: "指标导向",
    columnName: "zbDir",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbDirFn(row.zbDir);
    },
  },
  {
    columnLabel: "指标属性",
    columnName: "zbAttr",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return zbAttrFn(row.zbAttr);
    },
  },
  // {
  //   columnLabel: "统计周期",
  //   columnName: "statPer",
  //   columnWidth: "100",
  //   showOverflowTooltip: true,
  //   formatter: (row, cloumn, index) => {
  //     return statPerFn(row.statPer, "formatter");
  //   },
  // },
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
      return respDptList.value.find((item) => item.hospDptcode == row.respDpt)
        ?.hospDptname;
    },
  },
  {
    columnLabel: "数据来源",
    columnName: "dataSrc",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
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
  // {
  //   columnLabel: "启用否",
  //   columnName: "kyf",
  //   kyf: "1",
  //   columnWidth: "80",
  //   align: "center",
  //   attrs: { "active-value": "1", "inactive-value": "0" },
  // },
]);

const addindicatorSelectionChange = (val) => {
  selectedAddIndicators.value = val.map((item) => item.uuid);
  console.log(selectedAddIndicators.value);
};

const addindicatorChange = (row) => {
  // 获取当前行的信息
  const newValue = row.value;
  const uuid = row.row.uuid;

  // 更新allIndexWithModel数组中对应项的kyf值
  allIndexWithModel.value = allIndexWithModel.value.map((item) => {
    if (item.uuid === uuid) {
      return { ...item, kyf: newValue };
    }
    return item;
  });

  // 同时更新完整数据副本
  allIndexWithModelFull.value = allIndexWithModelFull.value.map((item) => {
    if (item.uuid === uuid) {
      return { ...item, kyf: newValue };
    }
    return item;
  });

  ElMessage.success(newValue == 1 ? "已启用" : "已禁用");
};
const addindicatorBtmBtnClick = async (val) => {
  if (val.text === "取消") {
    addindicatorShow.value = false;
    addindicatorParams.zbName = "";
    addindicatorParams.zbCode = "";
  } else if (val.text === "添加") {
    if (selectedAddIndicators.value.length === 0) {
      ElMessage.warning("请先选择要添加的指标");
      return;
    }
    // 将选中的指标添加到指标配置中
    // 更新allIndexWithModel中对应zbUuid的对象的isCheck设置为1
    allIndexWithModel.value = allIndexWithModel.value.map((item) => {
      if (selectedAddIndicators.value.includes(item.uuid)) {
        return { ...item, isCheck: "1" };
      }
      return item;
    });

    // 更新完整数据副本
    allIndexWithModelFull.value = allIndexWithModelFull.value.map((item) => {
      if (selectedAddIndicators.value.includes(item.uuid)) {
        return { ...item, isCheck: "1" };
      }
      return item;
    });

    // 重新筛选selectedIndexWithModel（isCheck为1的项）
    const newSelectedItems = allIndexWithModel.value.filter(
      (item) =>
        selectedAddIndicators.value.includes(item.uuid) && item.isCheck === "1"
    );

    const existingSelectedItems = selectedIndexWithModel.value.filter(
      (existingItem) =>
        !newSelectedItems.some((newItem) => newItem.uuid === existingItem.uuid)
    );

    selectedIndexWithModel.value = [
      ...existingSelectedItems,
      ...newSelectedItems,
    ];

    // 清空选中项
    selectedAddIndicators.value = [];

    // 关闭添加指标弹窗
    addindicatorShow.value = false;

    // 更新指标配置表格显示
    nextTick(() => {
      if (indicatorSetRef.value && indicatorSetRef.value.fetchData) {
        indicatorSetRef.value.fetchData();
        indicatorSetRef.value?.clearSelection();
      }
    });

    ElMessage.success("添加成功");
  }
};

const addindicatorSearch = (val) => {
  // 根据传入的参数过滤allIndexWithModel数组
  if (!val) {
    // 如果没有传入参数，过滤掉已选中的数据
    allIndexWithModel.value = allIndexWithModelFull.value.filter((item) => {
      // 检查该项是否已经在selectedIndexWithModel中（已选中）
      return !selectedIndexWithModel.value.some(
        (selected) => selected.uuid === item.uuid
      );
    });
  } else {
    // 根据传入的参数过滤
    const filteredData = allIndexWithModelFull.value.filter((item) => {
      // 首先过滤掉已选中的数据
      if (
        selectedIndexWithModel.value.some(
          (selected) => selected.uuid === item.uuid
        )
      ) {
        return false;
      }

      // 根据指标名称过滤
      if (val.zbName && !item.zbName.includes(val.zbName)) return false;

      // 根据指标编码过滤
      if (val.zbCode && !item.zbCode.includes(val.zbCode)) return false;

      // 根据启用状态过滤
      if (
        val.kyf !== "" &&
        val.kyf !== undefined &&
        val.kyf !== null &&
        item.kyf != val.kyf
      )
        return false;

      return true;
    });

    // 更新过滤后的数据
    allIndexWithModel.value = filteredData;
  }

  // 如果表格组件存在，则刷新显示
  nextTick(() => {
    if (addindicatorRef.value && addindicatorRef.value.fetchData) {
      addindicatorRef.value.fetchData();
    }
  });
};
const addindicatorReset = () => {
  // 清空搜索参数
  addindicatorParams.zbName = "";
  addindicatorParams.zbCode = "";

  // 恢复所有数据，但过滤掉已选中的数据
  allIndexWithModel.value = allIndexWithModelFull.value.filter((item) => {
    // 检查该项是否已经在selectedIndexWithModel中（已选中）
    return !selectedIndexWithModel.value.some(
      (selected) => selected.uuid === item.uuid
    );
  });

  // 刷新表格显示
  nextTick(() => {
    if (addindicatorRef.value && addindicatorRef.value.fetchData) {
      addindicatorRef.value.fetchData();
    }
  });
};

const zbSourceList = ref([]);
const selectSourceFn = async () => {
  let res = await selectSourceApp();
  if (res.length) {
    zbSourceList.value = res;
  } else {
    zbSourceList.value = [];
  }
};
// 初始化
const zbAttrFn = (val) => {
  return zbAttrList.value.find((item) => item.value == val)?.label;
};
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
  return zbDirList.value.find((item) => item.value == val)?.label || "";
};
//责任部门转换
const respDptFn = (val) => {
  const findInTree = (nodes, targetValue) => {
    if (!Array.isArray(nodes)) return null;
    for (const node of nodes) {
      if (node.value == targetValue) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findInTree(node.children, targetValue);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const foundItem = findInTree(respDptList.value, val);
  return foundItem ? foundItem?.label : "";
};

const getApp = async () => {
  let res = await listIdxCpxxb({
    pageNum: 1,
    pageSize: 1000,
  });
  if (res.code == 200) {
    appLinkList.value = res.rows || [];
  } else {
    appLinkList.value = [];
  }
};

const switchModelPym = computed(() => {
  if (!addOrEditForm.modelName) return '';
  return pinyin(addOrEditForm.modelName, {
    pattern: 'first', // 核心配置：只提取首字母
    toneType: 'none', // 不需要声调
    type: 'array',
  }).join("");
});

watch(
  () => addOrEditForm.appLink,
  (newValue) => {
    if (newValue) {
      const selectedItem = appLinkList.value.find(item => item.uuid === newValue);
      if (selectedItem) {
        addOrEditForm.appLinkName = selectedItem.cpmc;
      }
    } else {
      addOrEditForm.appLinkName = '';
    }
  }
);

const handleScriptFileSelect = () => {

};

onMounted(async () => {
  nextTick(async () => {
    await selectSourceFn();
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  });
  getlistGroup();
  getApp();
  modelTypeList.value = dictKey.dict.fxmx_category;
});
</script>

<style lang="scss" scoped>
.anaModelManagement-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .anaModelManagement-top-class {
    width: 100%;
    // height: 58px;
    display: flex;
    align-items: center;
  }

  .anaModelManagement-bottom-class {
    height: calc(99% - 58px);
    margin-top: 0.5%;

    .analysisStyle {
      height: 26px;
      width: 44px;
      border-radius: 2px;
      text-align: center;
      line-height: 26px;
    }

    .status1 {
      color: rgba(17, 17, 17, 1);
      height: 26px;
      width: 58px;
      text-align: center;
      line-height: 26px;
      border-radius: 2px;
    }

    .status2 {
      color: rgba(192, 0, 0, 1);
      height: 26px;
      width: 58px;
      text-align: center;
      line-height: 26px;
      border-radius: 2px;
    }
  }
}

.clickable-blue-class {
  color: rgba(0, 115, 237, 1);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(83, 128, 253, 1);
  text-decoration-style: solid;
  text-underline-offset: 4px;
  /* 添加下划线与文字的间距 */
}

.normalTable {
  :deep(.el-table__body td.el-table__cell) {
    font-size: 14px !important;
    font-family: "SimSun" !important;
    border-color: #c0c0c0 !important;
    font-weight: 700 !important;
    color: #1d2129 !important;
  }
}
</style>

<style lang="scss">
.anaModelManagement-bottom-class {
  .btnList-style {
    flex-flow: row-reverse;
  }
}

.anaModelManagement-addOrEdit {
  .el-form {
    font-size: 16px;

    .el-form-item-class {
      display: flex;
      flex-wrap: wrap;
      gap: 18px 25px;
    }

    .el-form-item {
      margin: 0 !important;

      .el-form-item__label {
        font-size: 16px !important;
        padding-right: 0 !important;
      }
    }

    .el-input {
      width: 529px;
    }

    .el-select {
      width: 529px;
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

.changeStyle {
  .headDiv {
    border-bottom: none !important;
    margin-bottom: 0 !important;
  }
}

.changeSearch {
  .cardShadow {
    border-bottom: 1px solid rgba(201, 201, 201, 1) !important;
    border-radius: 0 !important;
  }
}
</style>