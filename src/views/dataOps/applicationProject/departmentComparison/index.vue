<!-- 专科信息 -->
<template>
  <div class="specializedInfo-all-class">
    <div class="specializedInfo-search-class">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset" @searchVal="handleSearch">
      </searchForm>
    </div>
    <div class="specializedInfo-bottom-class">
      <div class="specializedInfo-table-class">
        <div class="specializedInfo-table-top-class">
          <div v-for="(item, index) in btnData" :key="index" :class="
              btnId == item.id
                ? 'btn-item-class btn-item-active'
                : 'btn-item-class'
            " @click="handBtn(item)">
            {{ item.text }}
          </div>
        </div>
        <tableAndPage ref="tableRef" v-if="btnId == '1'" apiUrl="/business/DEPTMAPINFO/hosDptList" :queryParams="queryParams" :light="true" :btnList="operationList" :btnAndTextStyle="btnAndTextStyle" :designTableColumns="practicalTableColumns" :showBorder="true" @btnClick="buttonClick" @statusClick="statusClick" @rowClick="rowClick" primaryKey="uuid" :defaultExpandAll="true" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }">
          <template #isQy="{ row }">
            <el-switch v-if="row.hospDptcode" v-model="row.isQy" active-value="1" inactive-value="0" @click="statusClick({row: row, column: 'isQy', value: row.isQy})" />
          </template>
        </tableAndPage>
        <tableAndPage ref="tableRef" v-else apiUrl="/business/DEPTMAPINFO/standDptList" :queryParams="queryParams" :light="true" :btnList="operationList" :btnAndTextStyle="btnAndTextStyle" :designTableColumns="standardTableColumns" :showBorder="true" @btnClick="buttonClick" @statusClick="statusClick" @rowClick="rowClick" primaryKey="uuid" :defaultExpandAll="true" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 0}">
          <template #isQy="{ row }">
            <el-switch v-if="row.hospDptcode" v-model="row.isQy" active-value="1" inactive-value="0" @click="statusClick({row: row, column: 'isQy', value: row.isQy})" />
          </template>
        </tableAndPage>
      </div>
      <div class="specializedInfo-form-class">
        <!-- <div style="display: flex; align-items: center">
          <div class="verticalLine"></div>
          <div>专科信息详情</div>
        </div> -->
        <PartTitle title="专科信息详情" no-padding :height="58"></PartTitle>
        <div class="tableInfoDetail" style="margin-left: 16px;margin-top: 30px; overflow: auto; height: calc(100% - 88px);">
          <el-form :model="detailForm" label-position="right" label-width="auto" ref="detailFormRef">
            <el-form-item label="实际科室代码：">
              {{ detailForm.hospDptcode }}
            </el-form-item>
            <el-form-item label="实际科室名称：">
              {{ detailForm.hospDptname }}
            </el-form-item>
            <el-form-item label="科室类别：">
              {{ dptTypeFn(detailForm.hospitalCodeType, "formatter") }}
            </el-form-item>
            <el-form-item label="所属机构：">
              {{ detailForm.organName }}
            </el-form-item>
            <el-form-item label="科室级别：">
              {{
                hospitalCodeLevelFn(detailForm.hospitalCodeLevel, "formatter")
              }}
            </el-form-item>
            <el-form-item label="标准科室代码：">
              {{ detailForm.standDptcode }}
            </el-form-item>
            <el-form-item label="标准科室名称：">
              {{ detailForm.standDptname }}
            </el-form-item>
            <el-form-item label="科室负责人：">
              {{ detailForm.principalName }}
            </el-form-item>
            <el-form-item label="临床重点专科级别：">
              {{ keydptClassFn(detailForm.keydptClass, "formatter") }}
            </el-form-item>
            <el-form-item label="是否手术科室：">
              {{ detailForm.isOper === null || detailForm.isOper === undefined ? "" : (detailForm.isOper == 1 ? "是" : "否") }}
            </el-form-item>
            <el-form-item label="更新时间：">
              {{ formatToStandardTime(detailForm.updateTime) }}
            </el-form-item>
            <el-form-item label="备注："> {{ detailForm.bz }} </el-form-item>
            <el-form-item label="启用否：" v-if="detailForm.hospDptcode">
              <el-switch disabled v-model="detailForm.isQy" active-value="1" inactive-value="0">
              </el-switch>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
  <!-- 新增/编辑/复制 -->
  <SzycDialog :dialogVisible="addOrEditFormDialog" width="35%" @close="addOrEditFormDialog = false" :title="addOrEditFormTitle" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <div class="specializedInfo-addOrEdit">
        <el-form :label-position="labelPosition" label-width="auto" :inline="false" :model="addOrEditForm" ref="addOrEditFormRef" :rules="addOrEditFormRules">
          <el-form-item label="实际科室名称：" prop="hospDptname">
            <el-input placeholder="请输入" v-model="addOrEditForm.hospDptname">
            </el-input>
          </el-form-item>
          <el-form-item label="实际科室代码：" prop="hospDptcode">
            <el-input placeholder="请输入" v-model="addOrEditForm.hospDptcode">
            </el-input>
          </el-form-item>
          <el-form-item label="所属机构：" prop="organNameCode">
            <el-select v-model="addOrEditForm.organNameCode" placeholder="请选择" clearable @change="organNameChange" disabled>
              <el-option v-for="(item, index) in organNameList" :key="index" :label="item.organName" :value="item.organCode18" />
            </el-select>
          </el-form-item>
          <el-form-item label="科室级别：" prop="hospitalCodeLevel">
            <el-select v-model="addOrEditForm.hospitalCodeLevel" placeholder="请选择" clearable>
              <el-option v-for="(item, index) in hospitalCodeLevelFn()" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="标准科室名称：" prop="standDptname">
            <el-select v-model="addOrEditForm.standDptname" placeholder="请选择" @change="standDptnameChange" clearable>
              <el-option v-for="item in standDptnameList" :key="item.ksCode" :label="item.ksName" :value="item.ksCode" />
            </el-select>
          </el-form-item>
          <el-form-item label="标准科室代码：" prop="standDptcode">
            <el-input v-model="addOrEditForm.standDptcode" style="width: 100%" placeholder="请输入" disabled>
            </el-input>
          </el-form-item>
          <el-form-item label="科室负责人：" prop="principalId">
            <el-select v-model="addOrEditForm.principalId" placeholder="请选择" clearable>
              <el-option v-for="item in dptLeaderList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="临床重点专科级别：" prop="keydptClass">
            <el-select v-model="addOrEditForm.keydptClass" placeholder="请选择" clearable>
              <el-option v-for="(item, index) in keydptClassFn()" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="科室类别：" prop="hospitalCodeType">
            <el-select v-model="addOrEditForm.hospitalCodeType" clearable placeholder="请选择">
              <el-option v-for="(item, index) in dptTypeFn()" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否手术科室：" prop="isOper">
            <el-select v-model="addOrEditForm.isOper" placeholder="请选择">
              <el-option v-for="(item, index) in yesOrNoFn()" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注：" prop="bz" class="textarea-class">
            <el-input placeholder="请输入" v-model="addOrEditForm.bz" type="textarea" rows="3">
            </el-input>
          </el-form-item>
          <el-form-item label="启用否：" prop="isQy">
            <el-switch v-model="addOrEditForm.isQy" active-value="1" inactive-value="0">
            </el-switch>
          </el-form-item>
        </el-form>
        <!-- <div class="el-dialog-HorizontalLine"></div> -->
        <div class="el-dialog-buttons">
          <CanCelBtn @click="addOrEditFormDialog = false"> 取消 </CanCelBtn>
          <buttonDiv @click="submitFormFn"> 保存 </buttonDiv>
        </div>
      </div>
    </template>
  </SzycDialog>

  <!-- 科室对照 -->
  <SzycDialog :dialogVisible="dptCompareDialog" width="90%" @close="dptCompareDialog = false;" title="科室对照" :destroy="true" :alignCenter="true" style="background-color: #fff;" class="specializedInfo-dptCompareDialog-class">
    <template #uname>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <div style="width:79%">
          <div style="height: 60px" class="specializedInfo-dptCompareDialog-search">
            <searchForm :modelValue="dptCompQueryParams" :items="dptCompSearchItems" :inline="true" labelWidth="" @reset="dptCompHandleReset" @searchVal="dptCompHandleSearch">
            </searchForm>
          </div>
          <div class="black-divider"></div>
          <div style="height: 620px" class="specializedInfo-dptCompareDialog-table">
            <tableAndPage ref="dptCompTableRef" apiUrl="/business/DEPTMAPINFO/hosDptList" :queryParams="dptCompQueryParams" :designTableColumns="dptCompTableColumns" @selectionChange="dptCompSelectionChange" :showBorder="true" :light="true" primaryKey="uuid" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }">
            </tableAndPage>
          </div>
        </div>
        <div style="width: 19%; background-color: #fff;">
          <div style="display: flex; align-items: center">
            <!-- <div class="verticalLine"></div> -->
            <div style="font-size: 16px;font-weight: 600; height: 60px; line-height: 60px;">绑定标准科室</div>
          </div>
          <div class="black-divider"></div>
          <div style="margin-top: 12px">
            <el-input v-model="dptNameValue" placeholder="输入标准科室名称进行查询" class="input-with-select" clearable @keydown.enter="searchClick">
              <template #suffix>
                <el-icon @click="searchClick" style="cursor: pointer; color: #1980ff">
                  <search />
                </el-icon>
              </template>
            </el-input>
          </div>
          <div style="height: 560px; overflow-y: auto">
            <el-radio-group v-model="standDptRadio" size="large" style="display: flex; flex-direction: column; align-items: start">
              <el-radio style="width: calc(100% - 10px);background: rgba(0, 115, 237, 0.05);padding-left: 10px; margin-top: 8px;" v-for="item in standDptnameLists" :key="item.ksCode" :label="item.ksCode">{{ item.ksName }}</el-radio>
              />
            </el-radio-group>
          </div>
        </div>
      </div>
      <!-- <div class="el-dialog-HorizontalLine"></div> -->
      <div class="el-dialog-buttons">
        <CanCelBtn @click="dptCompareDialog = false"> 取消 </CanCelBtn>
        <buttonDiv @click="dptCompBtnClick"> 确定 </buttonDiv>
      </div>
    </template>
  </SzycDialog>

  <!-- 导入失败明细 -->
  <SzycDialog :dialogVisible="exportFailDialog" width="60%" title="导入完成" :alignCenter="true" :before-close="closeExportFailDialog">
    <template #uname>
      <div style="width: 95%; padding-left: 2%; font-size: 16px;">
        <div style="display: flex; justify-content: space-between; background-color:rgba(237, 239, 245, 1); padding: 10px 20px;border-radius: 4px;">
          <!-- <div style="color: rgba(29, 33, 41, 1);">总条数：{{ importResData.totalCount }}条</div>
              <div style="display: flex; color: rgba(79, 190, 121, 1);"><img src="" alt=""
                      style="margin-right: 4px;"> 成功：{{ importResData.successCount }}条</div>
              <div style="display: flex; color: rgba(249, 65, 68, 1);"><img src="" alt=""
                      style="margin-right: 4px;">失败：{{ importResData.failCount }}条</div>
              <div style="color: rgba(83, 128, 253, 1) ">用时：{{ timeConsumedFn(importResData.startTime) }}
              </div> -->
          <div>总数：<span style="color: rgba(0, 115, 237, 1)">{{ importResData.totalCount }}</span>条</div>
          <div style="display: flex;"><img src="" alt="" style="margin-right: 4px;"> 成功：<span style="color: rgba(0, 156, 86, 1);">{{ importResData.successCount }}</span>条</div>
          <div style="display: flex;"><img src="" alt="" style="margin-right: 4px;">失败：<span style="color: rgba(192, 0, 0, 1);">{{ importResData.failCount }}</span>条</div>
          <div style="color: rgba(102, 102, 102, 1) ">用时：{{ timeConsumedFn(importResData.startTime) }}
          </div>
        </div>
        <div>
          <div style="color: rgba(29, 33, 41, 1); margin: 16px 0 10px; ">失败明细：</div>
          <div style="border: 1px solid #d2d3d4; border-radius: 4px; padding: 20px 24px; max-height: 500px; overflow-y: auto; ">
            <div v-for="(item, index) in importResData?.body" :key="index" class="fail-item">
              <div style="line-height: 24px; display: flex; color: #1d2129; ">
                <div style="color: rgba(249, 65, 68, 1); display: flex; min-width: 40px; height: 24px; align-items: center;font-size: 16px;">
                  <img src="/src/assets/ItemImg/failImport.svg" alt="" style="margin-right: 4px; width: 30px;">
                  <!-- 导入失败： -->
                </div>
                <!-- 失败设备：{{ item.name }}，{{ item.failReason }} -->
                <span style="color: rgba(51, 51, 51, 1);margin-right: 10px;">{{ btnId == '1' ? item.hospDptcode + ' ' + item.hospDptname : item.standDptcode + ' ' + item.standDptname }}</span>
                <span style="color: rgba(102, 102, 102, 1);">{{ item.failReason }}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; width: 100%; margin-top: 10px;">
            <CanCelBtn @click="closeExportFailDialog"> 取消 </CanCelBtn>
            <buttonDiv @click="exportFailData" class="export-btn" style=" background-color: rgba(224, 112, 0, 1) !important;"> 下载导入失败数据 </buttonDiv>
          </div>
        </div>
      </div>
    </template>

  </SzycDialog>
  <!-- 添加文件上传组件 -->
  <el-upload ref="upload" class="upload-demo" action="/api/data-ops/business/DEPTMAPINFO/import" :show-file-list="false" :pageOpen="false" :headers="{ Authorization: token }" :on-change="handleUploadChanged" :auto-upload="true" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError" accept=".xlsx,.xls" :on-progress="handleUploadProgress" :data="{ sourceType: tableNameEn }">
    <template #trigger>
      <el-button style="display: none" ref="uploadTriggerRef"></el-button>
    </template>
  </el-upload>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick, h, markRaw } from "vue";
import searchForm from "@/components/element/searchForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
// import { exportspecializedInfo } from "@/api/system/logManagement.js";
import {
  loginTypeFn,
  loginFromFn,
  dptTypeFn,
  yesOrNoFn,
  formatToStandardTime,
  debounce,
  hospitalCodeLevelFn,
  keydptClassFn
} from "@/types/dict/index";
import {
  insertHosDpt,
  updateHosDpt,
  listBmks,
  deleteHosDpt,
  updateIsQy,
  downTemplate,
  exportDpt,
  deptComp,
  importHosDpt,
  downImportError,
  listInstitutionApi,
  queryInfoDataList
} from "@/api/appManage/specializedInfo.js";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listHosDptApi, listStandDptApi, listTreeBmksApi } from "@/api/appManage/appRegist";

const upload = ref(null)
const DeleteIconComponent = {
  setup() {
    return () => h('img', {
      src: 'src/assets/image/deleteIcon.svg',
      style: {
        width: '30px',
        height: '25px'
      }
    });
  }
};

const tableRef = ref(null);
const tableRowData = ref({});
const tableSelectList = ref([]);
const lightRowData = ref({});
const organNameList = ref([]);
const standDptnameList = ref([]);
const standDptnameLists = ref([]);

//  查询条件
const queryParams = reactive({
  hospDptname: "", //  实际科室名称
  standDptname: "", //  标准科室名称
  hospitalCodeType: "", //  科室类别
  isQy: "", //  启用否
});

const searchItems = computed(() => [
  {
    component: "el-select",
    label: "实际科室：",
    prop: "hospDptname",
    options: hosDptList.value,
    optionLabel: "hospDptname",
    optionValue: "hospDptname",
    style: { width: "220px" },
    // montageName: true,
    attrs: {
      placeholder: "请选择",
      clearable: true,
      filterable: true,
    },
  },
  {
    component: "el-tree-select",
    label: "标准科室名称：",
    prop: "standDptname",
    style: { width: "220px" },
    attrs: {
      "node-key": 'standDptname',
      data: standDptList.value,
      placeholder: "请选择",
      clearable: true,
      filterable: true,
      props: {
        children: 'children',
        label: function (data, node) {
          return data.standDptcode + '/' + data.standDptname
        }
      }
    },
  },
  {
    component: "el-select",
    label: "科室类别：",
    style: { width: "220px" },
    prop: "hospitalCodeType",
    attrs: { placeholder: "请选择", clearable: true },
    options: dptTypeFn(),
  },
  {
    component: "el-select",
    label: "科室负责人：",
    style: { width: "220px" },
    prop: "principalId",
    options: dptLeaderList.value,
    optionLabel: "name",
    optionValue: "id",
    attrs: { placeholder: "请选择", clearable: true },
  },
  {
    component: "el-select",
    label: "启用否：",
    style: { width: "220px" },
    prop: "isQy",
    attrs: { placeholder: "请选择", clearable: true },
    options: yesOrNoFn(),
  },
]);
//  表格数据
const practicalTableColumns = ref([
  {
    columnLabel: "实际科室代码",
    columnName: "hospDptcode",
    columnWidth: "150",
    align: "left",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "实际科室名称",
    columnName: "hospDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "标准科室代码",
    columnName: "standDptcode",
    columnWidth: "150",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "标准科室名称",
    columnName: "standDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "科室负责人",
    columnName: "principalName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "科室类别",
    columnName: "hospitalCodeType",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return dptTypeFn(row.hospitalCodeType, "formatter");
    },
  },
  {
    columnLabel: "所属机构",
    columnName: "organName",
    columnWidth: "180",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "更新时间",
    columnName: "updateTime",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return formatToStandardTime(row.updateTime);
    },
  },
  {
    columnLabel: "启用否",
    columnName: "isQy",
    kyf: "1",
    columnWidth: "80",
    align: "center",
    attrs: { "active-value": "1", "inactive-value": "0" },
  },
]);

//  表格数据
const standardTableColumns = ref([
  {
    columnLabel: "标准科室代码",
    columnName: "standDptcode",
    columnWidth: "150",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "标准科室名称",
    columnName: "standDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "实际科室代码",
    columnName: "hospDptcode",
    columnWidth: "150",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "实际科室名称",
    columnName: "hospDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "科室负责人",
    columnName: "principalName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "科室类别",
    columnName: "hospitalCodeType",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return dptTypeFn(row.hospitalCodeType, "formatter");
    },
  },
  {
    columnLabel: "所属机构",
    columnName: "organName",
    columnWidth: "180",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "更新时间",
    columnName: "updateTime",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return formatToStandardTime(row.updateTime);
    },
  },
  {
    columnLabel: "启用否",
    columnName: "isQy",
    // kyf: "1",
    columnWidth: "80",
    align: "center",
    // attrs: { "active-value": "1", "inactive-value": "0" },
    hasSlot: true,
  },
]);

//侧边表格
const detailForm = reactive({
  hospDptcode: "", //  实际科室代码
  hospDptname: "", //  实际科室名称
  hospitalCodeType: "", //  科室类别
  organName: "", //  所属机构
  hospitalCodeLevel: "", //  科室级别
  standDptcode: "", //  标准科室代码
  standDptname: "", //  标准科室名称
  keydptClass: "", //  关键科室类别
  isOper: "", //  是否手术科室
  updateTime: "", //  更新时间
  bz: "", //  备注
  isQy: "", //  启用否
  principalId: "", //  科室负责人
  principalName: "", //  科室负责人
});

const btnId = ref("1");

//新增/编辑表单
const addOrEditFormDialog = ref(false); //  新增/编辑弹窗
const addOrEditFormTitle = ref(""); //  新增/编辑弹窗标题
const addOrEditFormRef = ref(null); //  新增/编辑表单
const addOrEditForm = reactive({
  uuid: "", //  主键
  hospDptcode: "", //  实际科室代码
  hospDptname: "", //  实际科室名称
  hospitalCodeType: "", //  科室类别
  organName: "", //  所属机构
  organNameCode: "", //  所属机构编码
  organCode: "", //  所属机构编码
  hospitalCodeLevel: "", //  科室级别
  standDptcode: "", //  标准科室代码
  standDptname: "", //  标准科室名称
  keydptClass: "", //  临床重点专科级别
  isOper: "", //  是否手术科室
  bz: "", //  备注
  isQy: "1", //  启用否
  principalId: "", //  科室负责人
  principalName: "", //  科室负责人
});
const addOrEditFormTS = reactive({
  uuid: "", //  主键
  hospDptcode: "", //  实际科室代码
  hospDptname: "", //  实际科室名称
  hospitalCodeType: "", //  科室类别
  organName: "", //  所属机构
  organNameCode: "", //  所属机构编码
  organCode: "", //  所属机构编码
  hospitalCodeLevel: "", //  科室级别
  standDptcode: "", //  标准科室代码
  standDptname: "", //  标准科室名称
  keydptClass: "", //  临床重点专科级别
  isOper: "", //  是否手术科室
  bz: "", //  备注
  isQy: "1", //  启用否
});

const addOrEditFormRules = reactive({
  organNameCode: [
    { required: true, message: "请选择所属机构", trigger: "change" },
  ],
  hospDptname: [
    { required: true, message: "请输入实际科室名称", trigger: "blur" },
  ],
  hospDptcode: [
    { required: true, message: "请输入实际科室代码", trigger: "blur" },
  ],
  standDptname: [{ required: true, message: "标准科室名称", trigger: "blur" }],
  // keydptClass: [{ required: true, message: "请选择临床重点专科级别", trigger: "change" }],
  hospitalCodeType: [
    { required: true, message: "请选择科室类别", trigger: "change" },
  ],
  principalId: [{ required: true, message: "请选择科室负责人", trigger: "change" }],
});

// 科室对照
const dptCompareDialog = ref(false);
const standDptRadio = ref("");
const dptCompTableRef = ref(null);
const dptNameValue = ref("");
const dptCompQueryParams = reactive({
  hospDptname: "", //  实际科室名称
  standDptname: "", //  标准科室名称
  hospitalCodeType: "", //  科室类别
});
const dptCompSearchItems = ref([
  {
    component: "el-input",
    label: "实际科室名称：",
    style: { width: "200px" },
    prop: "hospDptname",
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    component: "el-input",
    label: "标准科室名称：",
    style: { width: "200px" },
    prop: "standDptname",
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    component: "el-select",
    label: "科室类别：",
    style: { width: "200px" },
    prop: "hospitalCodeType",
    attrs: { placeholder: "请选择", clearable: true },
    options: dptTypeFn(),
  },
]);
//  表格数据
const dptCompTableColumns = ref([
  {
    columnLabel: "实际科室代码",
    columnName: "hospDptcode",
    columnWidth: "150",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "实际科室名称",
    columnName: "hospDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "标准科室代码",
    columnName: "standDptcode",
    columnWidth: "150",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "标准科室名称",
    columnName: "standDptname",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "科室类别",
    columnName: "hospitalCodeType",
    columnWidth: "150",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return dptTypeFn(row.hospitalCodeType, "formatter");
    },
  },
  {
    columnLabel: "所属机构",
    columnName: "organName",
    columnWidth: "180",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "更新时间",
    columnName: "updateTime",
    align: "center",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return formatToStandardTime(row.updateTime);
    },
  },
]);

const dptCompBtnList = ref([
  {
    btnType: "cancel",
  },
  {
    text: "保存",
    btnType: "add",
    typeRow: "selectType",
    icon: "",
    img: "",
  },
]);

// 导入相关
const uploadTriggerRef = ref(null);
const importResData = ref({});
const exportFailDialog = ref(false);
const token = sessionStorage.getItem("token");
const importLoading = ref(false);
const btnAndTextStyle = ref({
  float: "right",
});

const btnData = ref([
  {
    id: "1",
    text: "实际科室模式",
  },
  {
    id: "2",
    text: "标准科室模式",
  },
]);
const operationList = ref([
  {
    btnType: "add",
    // bind: { type: "baseSpecial" },
    icon: "",
    // img: "/ItemImg/ZKXZ.svg",
    permission: 'zkxx-add'
  },
  {
    btnType: "edit",
    // bind: { type: "baseSpecial" },
    icon: "",
    // img: "/ItemImg/ZKBJ.svg",
    permission: 'zkxx-edit'
  },
  {
    text: "科室对照",
    btnType: "edit",
    // bind: { type: "baseSpecial" },
    icon: "SetUp",
    // img: "/ItemImg/ksdz.svg",
    permission: 'zkxx-comparison'
  },
  // {
  //   text: "调入",
  //   btnType: "add",
  //   bind: { type: "baseSpecial" },
  //   icon: "",
  //   img: "/ItemImg/dr.svg",
  // },
  {
    text: "模板下载",
    btnType: "add",
    // bind: { type: "baseSpecial" },
    icon: "DataAnalysis",
    // img: "/ItemImg/mbxz.svg",
    permission: 'zkxx-download'
  },
  {
    text: "批量导入",
    btnType: "add",
    // bind: { type: "baseSpecial" },
    icon: "Upload",
    // img: "/ItemImg/ZKPLDR.svg",
    permission: 'zkxx-import'
  },
  {
    text: "批量导出",
    btnType: "add",
    // bind: { type: "baseSpecial" },
    icon: "Download",
    typeRow: "selectType",
    // img: "/ItemImg/ZKPLDC.svg",
    permission: 'zkxx-export'
  },
  {
    btnType: "delete",
    // bind: { type: "deleteSpecial" },
    icon: "",
    // img: "/ItemImg/ZKSC.svg",
    permission: 'zkxx-del'
  },
]);

//切换科室模式
const handBtn = (val) => {
  btnId.value = val.id;
  nextTick(async () => {
    tableRef.value?.fetchData();
  });
};
//状态变更
const statusClick = async ({ row, column, value }) => {
  let obj = {
    uuid: row.uuid,
    isQy: value,
  };
  let res = await updateIsQy(obj);
  if (res.code == 200) {
    ElMessage.success("操作成功");
    nextTick(async () => {
      tableRef.value?.fetchData();
    });
  }
};

// 按钮操作
const buttonClick = async (val, data) => {
  if (val.text == "新增") {
    addOrEditForm.principalId = "";
    addOrEditForm.principalName = "";
    addOrEditFormDialog.value = true;
    addOrEditFormTitle.value = "新增科室信息";
    Object.assign(addOrEditForm, addOrEditFormTS);
    addOrEditForm.organNameCode = organNameList.value[0].organCode18;
    addOrEditForm.organCode = organNameList.value[0].organCode18;
    addOrEditForm.organName = organNameList.value[0].organName;
    nextTick(() => {
      addOrEditFormRef.value?.resetFields();
    });
  } else if (val.text == "编辑") {
    addOrEditForm.principalId = "";
    addOrEditForm.principalName = "";
    addOrEditFormDialog.value = true;
    addOrEditFormTitle.value = "编辑科室信息";
    Object.assign(addOrEditForm, data);
    addOrEditForm.standDptname = addOrEditForm.standDptcode;
    addOrEditForm.organNameCode = addOrEditForm.organCode;
  } else if (val.text == "科室对照") {
    dptCompareDialog.value = true;
    dptCompQueryParams.hospDptname = "" //  实际科室名称
    dptCompQueryParams.standDptname = "" //  标准科室名称
    dptCompQueryParams.hospitalCodeType = "" //  科室类别
    dptNameValue.value = '';
    standDptRadio.value = ''
    searchClick()
    nextTick(async () => {
      dptCompTableRef.value?.fetchData();
    });
  } else if (val.text == "删除") {
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
    )
      .then(async () => {
        let uuidList = data.map((item) => item.uuid);
        let res = await deleteHosDpt({ uuidList });
        if (res.code == 200) {
          ElMessage.success("删除成功");
          nextTick(async () => {
            tableRef.value?.fetchData();
            tableRef.value?.clearSelection();
          });
        }
      })
      .catch(() => { });
  } else if (val.text == "模板下载") {
    let res = await downTemplate({
      fileName: btnId.value == "1" ? "实际科室模板" : "标准科室模板",
    });
  } else if (val.text == "批量导入") {
    // 触发文件选择
    if (uploadTriggerRef.value) {
      uploadTriggerRef.value.$el.click();
    }
  } else if (val.text == "批量导出") {
    let res = await exportDpt({
      uuidList: data.map((item) => item.uuid),
      fileName: btnId.value == "1" ? "实际科室信息" : "标准科室信息",
    });
  }
};

const rowClick = (val) => {
  lightRowData.value = val;
  // //  console.log("高亮行val", lightRowData.value);
  Object.assign(detailForm, val);
  console.log("detailForm", detailForm);
};

const handleSelectionChange = (val) => {
  selectRowList.value = val;
  console.log("选中行val", val);
};

const standDptnameChange = (val) => {
  addOrEditForm.standDptcode = addOrEditForm.standDptname;
};

// 新增
const organNameChange = (val) => {
  if (val) {
    addOrEditForm.organName = organNameList.value.find(
      (item) => item.organCode18 == val
    ).organName;
    addOrEditForm.organCode = val;
  } else {
    addOrEditForm.organName = "";
    addOrEditForm.organCode = "";
  }
};
const submitFormFn = debounce(async (formName) => {
  addOrEditFormRef.value.validate(async (valid) => {
    if (valid) {
      let standDptnameData = standDptnameList.value.find(
        (item) => item.ksCode == addOrEditForm.standDptcode
      ).ksName;
      if (addOrEditFormTitle.value == "新增科室信息") {
        let res = await insertHosDpt({
          ...addOrEditForm,
          standDptname: standDptnameData,
          uuid: "",
        });
        if (res.code == 200) {
          ElMessage.success("添加成功");
          addOrEditFormDialog.value = false;
          nextTick(async () => {
            tableRef.value?.fetchData();
          });
        }
      } else if (addOrEditFormTitle.value == "编辑科室信息") {
        let ress = await updateHosDpt({
          ...addOrEditForm,
          standDptname: standDptnameData,
        });
        if (ress.code == 200) {
          ElMessage.success("编辑成功");
          addOrEditFormDialog.value = false;
          nextTick(async () => {
            tableRef.value?.fetchData();
          });
        }
      }
    } else {
      ElMessage.error("请您填写必填信息");
      return;
    }
  });
}, 500);

//  查询
const handleSearch = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData();
};

const handleReset = () => {
  if (!tableRef.value) return;
  queryParams.dateTime = [];
  tableRef.value.fetchData("重置");
};

// 导入相关
const handleUploadProgress = () => {
  importLoading.value = true;
};

const handleUploadSuccess = async (data, uploadFile, uploadFiles) => {
  console.log(data?.data?.children, "导入成功");
  console.log(tableRef.value,"tableRef.value")
  if (data && data.code === 200 && data?.data?.failCount == 0) {
    ElMessage({
      type: "success",
      message: `${data?.data?.totalCount}条数据全部导入成功`,
    });
    upload.value.clearFiles();
    importLoading.value = false;
    nextTick(async () => {
      tableRef.value?.fetchData();
    });
  } else if (data && data.code === 200 && data?.data?.failCount > 0) {
    exportFailDialog.value = true;
    importResData.value = JSON.parse(JSON.stringify(data.data));
    console.log(2, data);
    if (data?.data?.children?.length) {
      let array = data?.data?.children;
      importResData.value.body = JSON.parse(JSON.stringify(array));
      console.log(
        importResData.value,
        importResData.value.body,
        array,
        "importResData.value"
      );
    }

    importLoading.value = false;
    nextTick(async () => {
      tableRef.value?.fetchData();
    });
  } else {
    ElMessage({
      type: "error",
      message: data.msg,
    });
    importLoading.value = false;
  }
};
function beforeUpload(file) {
  const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
  const whiteList = ["xls", "xlsx"];
  if (whiteList.indexOf(fileSuffix) === -1) {
    ElMessage({
      message: "上传文件只能是xls或xlsx格式",
      type: "error",
    });
    return false;
  }
}
const closeExportFailDialog = () => {
  ElMessageBox.confirm(
    "弹窗关闭后，无法下载失败数据，确认关闭弹窗吗？",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      exportFailDialog.value = false;
    })
    .catch(() => { });
};

const timeConsumedFn = (time) => {
  // 确保输入为数字
  const ms = Number(time);
  if (isNaN(ms) || ms < 0) {
    return "0秒";
  }

  // 计算小时、分钟和秒数
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  // 根据情况构建结果字符串
  let result = "";

  if (hours > 0) {
    result += `${hours}小时`;
  }

  if (minutes > 0 || (hours > 0 && seconds > 0)) {
    // 如果有小时且有秒，也要显示分钟（即使为0）
    result += `${minutes}分`;
  }

  if (seconds > 0 || ms < 60000) {
    // 如果总时间小于1分钟，即使秒数为0也显示秒
    result += `${seconds}`;
  }
  console.log(result, "result", time, seconds);
  return result != 0 ? `${result}秒` : "小于1秒";
};

const exportFailData = async () => {
  downImportError(importResData.value.body);
};

//科室对照
//  查询
const dptCompHandleSearch = () => {
  if (!dptCompTableRef.value) return;
  dptCompTableRef.value.fetchData();
};

const dptCompHandleReset = () => {
  if (!dptCompTableRef.value) return;
  dptCompTableRef.value.fetchData("重置");
};

const searchClick = async () => {
  let ress = await listBmks({ ksName: dptNameValue.value });
  if (ress.code == 200) {
    standDptnameLists.value = ress.data;
  }
};

const getorganNameList = async () => {
  let ress = await listBmks({});
  if (ress.code == 200) {
    // console.log(ress, 'res-');
    standDptnameList.value = ress.data;
    standDptnameLists.value = ress.data;
  }
  let res = await listInstitutionApi({});
  if (res.code == 200) {
    organNameList.value = [res.data];
  }

};

const dptCompBtnClick = async () => {
  if (standDptRadio.value) {
    let obj = {
      uuidList: dptCompTableRef.value.selectRowList.map((item) => item.uuid),
      standDptcode: standDptRadio.value,
      standDptname: standDptnameLists.value.find(
        (item) => item.ksCode == standDptRadio.value
      ).ksName,
    };
    let res = await deptComp(obj);
    if (res.code == 200) {
      ElMessage.success("保存成功");
      dptCompareDialog.value = false;
      nextTick(async () => {
        tableRef.value?.fetchData();
      });
    }
  } else {
    ElMessage.error("请选择标准科室");
  }
};

const dptLeaderList = ref([]);
const getDptLeader = async () => {
  try {
    let res = await queryInfoDataList({});
    dptLeaderList.value = res;
  } catch (error) {
    ElMessage.error("查询科室负责人失败");
  }
}

const hosDptList = ref([])
const standDptList = ref([])
// 实际科室
const getOptions = async () => {
  let res = await listHosDptApi({ pageSize: 99999 })
  hosDptList.value = res.rows
}

// 标准科室
const standOption = async () => {
  let res = await listStandDptApi({ pageSize: 99999 })
  standDptList.value = res.data
}

onMounted(async () => {
  await getorganNameList();
  await getDptLeader();
  await getOptions();
  await standOption();
  nextTick(async () => {
    tableRef.value?.fetchData();
  });
});
</script>

<style lang="scss" scoped>
.black-divider {
  width: 100%;
  height: 1px;
  background: #ccc;
}
.fail-item {
  line-height: 24px;
  display: flex;
  color: #1d2129;
  padding: 15px 0 10px;
  border-bottom: 1px solid rgba(227, 227, 227, 1);
}

.fail-item:last-child {
  border-bottom: none;
}
.specializedInfo-all-class {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .specializedInfo-search-class {
    width: 100%;
    /* height: 58px; */
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .specializedInfo-bottom-class {
    min-height: 0;
    margin-top: 0.5%;
    display: flex;
    justify-content: space-between;
    flex: 1;

    .specializedInfo-table-class {
      height: 100%;
      width: 75.3%;
      position: relative;
      background-color: #fff;
      border-radius: 4px;

      .specializedInfo-table-top-class {
        height: 32px;
        display: flex;
        align-items: center;
        position: absolute;
        top: 15px;
        left: 12px;
        .btn-item-class {
          width: 100px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: rgba(68, 68, 68, 1);
          border: 1px solid rgba(220, 220, 220, 1);
          cursor: pointer;
          z-index: 10;
        }

        .btn-item-class:first-child {
          border-radius: 3px 0px 0px 3px;
        }

        .btn-item-class:last-child {
          border-radius: 0px 3px 3px 0px;
        }

        .btn-item-active {
          background: rgba(0, 115, 237, 1);
          color: #fff;
          border: 1px solid rgba(0, 115, 237, 1);
        }
      }
    }

    .specializedInfo-form-class {
      width: calc(24% - 32px);
      background-color: #fff;
      padding: 12px 16px;
      border-radius: 4px;
    }
  }
}
</style>

<style lang="scss">
.specializedInfo-form-class {
  .el-form-item {
    margin: 5px;
  }
}
.specializedInfo-addOrEdit {
  width: 90%;
  .el-form {
    font-size: 16px;
    .el-form-item {
      margin: 0 0 8px !important;
      width: calc(100% - 0px);
      padding: 5px;
      .el-form-item__label {
        font-size: 16px !important;
        padding-right: 0 !important;
        color: #555 !important;
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
      background: rgba(83, 128, 253, 0.1);
      border: 1px solid rgba(83, 128, 253, 0.5);
      color: rgba(83, 128, 253, 1);
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .textarea-class {
      width: calc(100%);
    }
  }
}
.specializedInfo-dptCompareDialog-search {
  .cardShadow {
    padding: 0 !important;
  }
}
.specializedInfo-dptCompareDialog-table {
  .tableExpand {
    padding: 12px 0 0 !important;
  }
}
</style>