<!-- 数据项配置 -->
<template>
  <div class="dataItemCss">
    <div class="dataItem_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        @searchVal="ListFn()"
        @reset="ListFn('重置')"
        :inline="true"
        label-width="auto"
      />
    </div>
    <div style="flex: 1; margin-top: 16px; height: 60%">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        @statusClick="statusClick"
        @btnClick="btnClick"
        @cellClick="handDataClick"
        :justBtn='true'
      />
    </div>
  </div>
  <!-- 新增/编辑/复制 -->
  <SzycDialog
    :dialogVisible="showDialog"
    :destroy-on-close="true"
    width="90%"
    @close="showDialog = false"
    :title="showTitle"
    :alignCenter="true"
  >
    <template #uname>
      <div class="dataItemConfig-addOrEdit">
        <el-form
          :label-position="labelPosition"
          label-width="auto"
          :inline="true"
          :model="addOrEditForm"
          ref="addOrEditFormRef"
          :rules="addOrEditFormRules"
        >
          <div>
            <div
              style="
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                border-bottom: 1px solid rgba(219, 219, 219, 1);
                color: rgba(0, 0, 0, 1);
                font-weight: 700;
                padding-bottom: 10px;
              "
            >
              <!-- <img
                src="/src/assets/ItemImg/zbjcxx.svg"
                style="margin-right: 4px"
              /> -->
              基本信息
            </div>
            <div class="el-form-item-class">
              <el-form-item label="数据项名称：" prop="dataItemName">
                <el-input
                  v-model="addOrEditForm.dataItemName"
                  placeholder=""
                  clearable
                >
                </el-input>
              </el-form-item>
              <el-form-item label="数据项编码：" prop="dataItemCode">
                <el-input
                  placeholder=""
                  v-model="addOrEditForm.dataItemCode"
                >
                </el-input>
              </el-form-item>
              <el-form-item label="版本号：" prop="version">
                <el-select v-model="addOrEditForm.version" placeholder="请选择">
                  <el-option
                    v-for="item in zbVerNumList"
                    :key="item.code"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据项英文名：" prop="dataItemEnName">
                <el-input
                  v-model="addOrEditForm.dataItemEnName"
                  placeholder=""
                  clearable
                >
                </el-input>
              </el-form-item>
              <el-form-item label="来源应用：" prop="productUuid">
                <el-select
                  v-model="addOrEditForm.productUuid"
                  placeholder="请选择"
                  collapse-tags
                  collapse-tags-tooltip
                  multiple
                  disabled
                >
                  <el-option
                    v-for="(item, index) in sourceAppFn()"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="分子/分母：" prop="numeratorAndDenominator">
                <el-select
                  v-model="addOrEditForm.numeratorAndDenominator"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="(item, index) in dataItemTypeList()"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item> -->
              <el-form-item
                label="所属指标："
                prop="paramName"
                style="width: calc(50% - 15px)"
              >
                <el-input
                  v-model="addOrEditForm.paramName"
                  style="width: 100%; background: #fff !important"
                  disabled
                >
                  <template #suffix>
                    <a
                      style="
                        color: #0073ed !important;
                        cursor: pointer;
                        text-decoration: underline;
                      "
                      @click="addIndex()"
                    >
                      添加指标
                    </a>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </div>
          <div>
            <div
              style="
                display: flex;
                align-items: center;
                margin: 20px 0 10px;
                border-bottom: 1px solid rgba(219, 219, 219, 1);
                color: rgba(0, 0, 0, 1);
                font-weight: 700;
                padding-bottom: 10px;
              "
            >
              <!-- <img
                src="/src/assets/ItemImg/zbpzxx.svg"
                style="margin-right: 4px"
              /> -->
              其他配置信息
            </div>
            <div class="el-form-item-class">
              <el-form-item label="计量单位：" prop="unitMeasurementUuid">
                <el-select
                  v-model="addOrEditForm.unitMeasurementUuid"
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in unitList"
                    :key="index.diatValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="采集方式：" prop="craftFilling">
                <el-select
                  v-model="addOrEditForm.craftFilling"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in colTypeFn()"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="分析周期：" prop="analysisCycle">
                <el-select
                  v-model="addOrEditForm.analysisCycle"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in analPerList"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item> -->
              <!-- <el-form-item label="脚本执行类型：" prop="scriptExecutionType">
                <el-select v-model="addOrEditForm.scriptExecutionType">
                  <el-option
                    v-for="(item, index) in scriptTypeList"
                    :key="index"
                    :label="item.label"
                    :value="item.key"
                  />
                </el-select>
              </el-form-item> -->
              <el-form-item label="数据项频次：" prop="statisticalPeriod">
                <el-select
                  v-model="addOrEditForm.statisticalPeriod"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in statPerFn()"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="小数保留位数："
                prop="displayAccuracy"
                style="display: flex; align-items: start; width: 15%"
              >
                <el-input-number
                  v-model="addOrEditForm.displayAccuracy"
                  :min="0"
                  :max="10"
                  @change="handleChange"
                />
              </el-form-item>
              <el-form-item label="数据项类型：" prop="dataItemType">
                <el-select v-model="addOrEditForm.dataItemType">
                  <el-option
                    v-for="(item, index) in dataItemTypeFn()"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="数据项为空默认值："
                prop="defaultValue"
                style="display: flex; align-items: start"
              >
                <el-input
                  v-model="addOrEditForm.defaultValue"
                  placeholder=""
                >
                </el-input>
              </el-form-item>
            </div>
            <div class="el-form-item-class">
              <el-form-item
                label="数据项说明："
                prop="dataItemExplain"
                style="width: 100%; margin: 20px 0 !important"
              >
                <el-input
                  placeholder=""
                  v-model="addOrEditForm.dataItemExplain"
                  type="textarea"
                  style="width: 100%"
                  rows="3"
                >
                </el-input>
              </el-form-item>
            </div>
            <div class="el-form-item-class">
              <el-form-item
                label="分析脚本："
                prop="ktrPath"
                style="width: 100%"
              >
                <el-input
                  placeholder=""
                  v-model="addOrEditForm.ktrPath"
                  style="width: 100%"
                  type="textarea"
                  rows="3"
                >
                </el-input>
              </el-form-item>
            </div>
            <div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  margin: 20px 0 10px;
                  border-bottom: 1px solid rgba(219, 219, 219, 1);
                  color: rgba(0, 0, 0, 1);
                  font-weight: 700;
                  padding-bottom: 10px;
                "
              >
                <!-- <img
                  src="/src/assets/ItemImg/zbpzxx.svg"
                  style="margin-right: 4px"
                /> -->
                别名信息
              </div>
              <div class="el-form-item-class">
                <el-table
                  :data="
                    dataItemAliTableData?.filter(
                      (item) => item?.isSourceData == '0'
                    )
                  "
                  border
                  height="220"
                  header-cell-class-name="headerTable"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    align="center"
                    width="100"
                  />
                  <el-table-column
                    label="数据项别名编号"
                    width="300"
                    prop="dataItemCode"
                  >
                    <template #default="scoped">
                      <p
                        @click="valueCodeIndex = scoped.$index"
                        v-if="valueCodeIndex != scoped.$index"
                        style="width: 100%; height: 25px"
                      >
                        {{ scoped.row.dataItemCode }}
                      </p>
                      <el-input
                        v-model="scoped.row.dataItemCode"
                        v-else
                        @blur="valueCodeIndex = -1"
                        style="height: 40px"
                        clearable
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="数据项别名"
                    width="300"
                    prop="dataItemName"
                  >
                    <template #default="scoped">
                      <p
                        @click="valueNameIndex = scoped.$index"
                        v-if="valueNameIndex != scoped.$index"
                        style="width: 100%; height: 25px"
                      >
                        {{ scoped.row.dataItemName }}
                      </p>
                      <el-input
                        v-model="scoped.row.dataItemName"
                        v-else
                        @blur="valueNameIndex = -1"
                        style="height: 40px"
                        clearable
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="来源应用"
                    width="200"
                    prop="productUuid"
                  >
                    <template #default="scoped">
                      <p
                        @click="productUuidIndex = scoped.$index"
                        v-if="productUuidIndex != scoped.$index"
                        style="width: 100%; height: 25px"
                      >
                        {{ sourceAppFn("1", "formatter") }}
                      </p>
                      <el-select
                        v-model="scoped.row.productUuid"
                        placeholder="请选择"
                        v-else
                        style="line-height: 40px"
                        clearable
                      >
                        <el-option
                          v-for="item in appLicationOptions"
                          :key="item.value"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="所属指标编号" prop="zbbh">
                  </el-table-column>
                  <el-table-column label="所属指标名称" prop="zbmc">
                  </el-table-column>
                  <!-- <el-table-column
                    label="分子/分母"
                    width="200"
                    prop="numeratorAndDenominator"
                  >
                    <template #default="scoped">
                      <p
                        @click="valueIndex = scoped.$index"
                        v-if="valueIndex != scoped.$index"
                        style="width: 100%; height: 25px"
                      >
                        {{
                          dataItemTypeList(
                            scoped.row.numeratorAndDenominator,
                            "formatter"
                          )
                        }}
                      </p>
                      <el-select
                        v-model="scoped.row.numeratorAndDenominator"
                        placeholder="请选择"
                        v-else
                        style="line-height: 40px"
                        clearable
                      >
                        <el-option
                          v-for="item in dataItemTypeList()"
                          :key="item.value"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                    </template>
                  </el-table-column> -->
                  <el-table-column
                    label="启用否"
                    prop="kyf"
                    width="90"
                    align="center"
                  >
                    <template #default="scoped">
                      <el-switch
                        v-model="scoped.row.kyf"
                        active-value="1"
                        inactive-value="0"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="90" align="center">
                    <template #default="scoped">
                      <div @click="deleteRow(scoped.row)">
                        <img src="/src/assets/ItemImg/shanchured.svg" alt="" />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-form>
        <div class="el-dialog-HorizontalLine"></div>
        <div class="el-dialog-buttons">
          <CanCelBtn @click="showDialog = false"> 取消 </CanCelBtn>
          <buttonDiv @click="submitFormFn"> 确定 </buttonDiv>
        </div>
      </div>
    </template>
  </SzycDialog>
  <!-- 添加指标-->
  <SzycDialog
    :dialogVisible="addIndexShow"
    :destroy-on-close="true"
    title="添加指标"
    width="56%"
    :alignCenter="true"
    class="whiteDialog"
    @close="addIndexShow = false"
  >
    <template #uname>
      <div v-if="tableLoading">
        <el-card
          v-loading="tableLoading"
          style="
            height: 746px;
            background-color: #fff;
            box-shadow: none;
            border: none;
          "
        ></el-card>
      </div>
      <div v-else>
        <div
          class="index-add-box"
          style="
            width: 100%;
            display: flex;
            justify-content: space-between;
            border-radius: 4px;
          "
        >
          <div style="width: 45%">
            <div
              style="
                font-weight: 500;
                color: rgba(0, 0, 0, 1);
                font-size: 16px;
                margin-bottom: 10px;
                height: 24px;
                line-height: 24px;
              "
            >
              选择指标
            </div>
            <div
              style="
                height: 666px;
                width: calc(100% - 40px);
                padding: 0 20px;
                background-color: rgba(204, 204, 204, 0.15);
              "
            >
              <div
                style="
                  height: 48px;
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <el-input
                  v-model="indexNameOne"
                  placeholder="输入指标名称进行搜索"
                  style="
                    width: 100% !important;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 1);
                  "
                  clearable
                  @keydown.enter="handleSearchList"
                >
                  <template #suffix>
                    <el-icon @click="handleSearchList" style="cursor: pointer"
                      ><Search
                    /></el-icon>
                  </template>
                </el-input>
              </div>
              <div style="height: calc(100% - 48px); overflow-y: auto">
                <el-tree
                  :data="dataIndexSource"
                  show-checkbox
                  ref="treeRef"
                  node-key="uuid"
                  :default-checked-keys="selectIndexArr"
                  :props="defaultSourceProps"
                />
              </div>
            </div>
          </div>

          <div
            style="
              width: 7%;
              height: 700px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 10px;
            "
          >
            <buttonDiv
              @click="indexSubmit"
              style="width: 75px"
              type="baseSpecial"
            >
              <img
                src="/src/assets/ItemImg/ZKXZ.svg"
                alt=""
                style="margin-right: 4px"
              />添加</buttonDiv
            >
            <buttonDiv
              @click="indexDelete"
              type="deleteSpecial"
              style="margin-left: 0; color: rgba(192, 0, 0, 1); width: 75px"
              :disabled="!selectedLsit?.length"
            >
              <img
                src="/src/assets/ItemImg/yichu.svg"
                alt=""
                style="margin-right: 4px"
              />移除
            </buttonDiv>
          </div>
          <div style="width: 45%">
            <div
              style="
                font-weight: 500;
                color: rgba(0, 0, 0, 1);
                font-size: 16px;
                margin-bottom: 10px;
                height: 24px;
                line-height: 24px;
              "
            >
              已添加指标
            </div>
            <div
              style="
                height: 666px;
                width: calc(100% - 40px);
                padding: 0 20px;
                background-color: rgba(204, 204, 204, 0.15);
              "
            >
              <div
                style="
                  height: 48px;
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <el-input
                  v-model="indexNameTwo"
                  placeholder="输入指标名称进行搜索"
                  style="width: 100% !important"
                  clearable
                  @keydown.enter="handleSearchLists"
                >
                  <template #suffix>
                    <el-icon @click="handleSearchLists" style="cursor: pointer"
                      ><Search
                    /></el-icon>
                  </template>
                </el-input>
              </div>
              <div
                style="height: calc(100% - 48px); overflow-y: auto"
                class="dataIndexSourceList-table-class"
              >
                <el-table
                  :data="dataIndexSourceList"
                  :tree-props="treeProps"
                  row-key="uuid"
                  default-expand-all
                  @selection-change="handleSelectionChange"
                >
                  <el-table-column type="selection" width="55" align="center" />
                  <el-table-column prop="zbmc" show-overflow-tooltip />
                  <el-table-column
                    prop="isSourceData"
                    label="源指标"
                    align="center"
                    width="80"
                  >
                    <template #default="scoped">
                      <el-switch
                        v-model="scoped.row.isSourceData"
                        active-value="1"
                        inactive-value="0"
                        @change="handleSwitchChange(scoped.row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            width: 103.8%;
            margin-top: 10px;
          " class="lineColorCss_Dialog"
        >
          <CanCelBtn @click="closeAddIndex"> 取消 </CanCelBtn>
          <buttonDiv @click="submitTable"> 确定 </buttonDiv>
        </div>
      </div>
    </template>
  </SzycDialog>
  <!-- 关联指标详情-->
  <SzycDialog
    :dialogVisible="indexDetailShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="关联指标详情"
    width="80%"
    class="whiteDialog"
    @close="indexDetailShow = false"
  >
    <template #uname>
      <div>
        <tableList
          ref="indexDetailTableRef"
          v-bind="bindIndexDetailData"
          :apiUrl="indexDetailTableData"
          class="tableList-ref-class"
        />
      </div>
      <div
          style="
            display: flex;
            justify-content: center;
            width: 102.7%;
            margin-top: 10px;
          "
          class="lineColorCss_Dialog"
        >
          <CanCelBtn @click="btnIndexDetailClick"> 返回 </CanCelBtn>
        </div>

    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick ,h ,markRaw} from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import {
  statusFn,
  dataItemTypeList,
  colTypeFn,
  statPerFn,
  dataItemTypeFn,
  sourceAppFn,
} from "@/types/dict/index";
import { selectSourceApp } from "@/api/modelIndexManage/indexAllocation.js";
import tableList from "@/components/table/tableAndPage.vue";
import { listAppProjectApi, updateDataItemStatusApi } from "@/api/tool.js";
import {
  deleteDataItem,
  insertDataItem,
  getIndexTree,
  updateDataItem,
  copyCodyDataItem,
} from "@/api/modelIndexManage/dataItemConfig.js";
import submitData from "@/components/element/SubmitForm.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { dictStore } from "@/store/dict";
import { fa } from "element-plus/es/locales.mjs";

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
const unitList = computed(() => dictStoreInstance.dict.unitOfMeasurement || []);

//新增/编辑表单
const showDialog = ref(false); //  新增/编辑弹窗
const showTitle = ref(""); //  新增/编辑弹窗标题
const addOrEditFormRef = ref(null); //  新增/编辑表单
// 关联指标详情
const indexDetailShow = ref(false);
const indexDetailTableRef = ref(null);
const indexDetailTableData = ref([]);
//  查询值
const searchData = reactive({
  version: "", //  版本号
  dataItemCode: "", //  数据项编号
  dataItemName: "", //  数据项名称
  dataItemType: "", //  数据项类型
  // productUuid: "", //  来源应用
  // numeratorAndDenominator: "", //  分子/分母
  valid: "", // 启用否
});
//  查询表单
const searchItems = computed(() => [
  {
    label: "版本号：",
    prop: "version",
    component: "el-select",
    options: zbVerNumList.value,
    attrs: { placeholder: "请选择", clearable: true },
    style: { width: "300px" },
  },
  {
    label: "数据项编码：",
    prop: "dataItemCode",
    component: "el-input",
    attrs: { placeholder: "", clearable: true },
    style: { width: "300px" },
  },
  {
    label: "数据项名称：",
    prop: "dataItemName",
    component: "el-input",
    attrs: { placeholder: "", clearable: true },
    style: { width: "300px" },
  },
  {
    label: "来源应用：",
    prop: "",
    component: "el-select",
    options: sourceAppFn(),
    attrs: { placeholder: "请选择", clearable: true },
    style: { width: "300px" },
  },
  {
    label: "数据项类型：",
    prop: "dataItemType",
    component: "el-select",
    options: dataItemTypeFn(),
    attrs: { placeholder: "请选择", clearable: true },
    style: { width: "300px" },
  },
  {
    label: "启用否：",
    prop: "valid",
    component: "el-select",
    options: statusFn(),
    attrs: { placeholder: "请选择", clearable: true },
    style: { width: "300px" },
  },
]);

//新增/编辑表单
const addOrEditForm = reactive({
  uuid: "", //  主键
  version: "", //  版本号
  dataItemCode: "", //  数据项编码
  dataItemName: "", //  数据项名称
  dataItemEnName: "", //  数据项英文名
  productUuid: ["1"], //  来源应用
  // numeratorAndDenominator: "", //  分子/分母
  paramName: "", //  所属指标回显
  paramTs: [], //  所属指标
  unitMeasurement: "", //  计量单位
  unitMeasurementUuid: "", //  计量单位
  craftFilling: "", //  采集方式
  statisticalPeriod: "", //  数据项频次
  // analysisCycle: "", //  分析周期
  // scriptExecutionType: "", //  脚本执行类型
  dataItemType: "", //  数据项类型
  defaultValue: "", //  数据项为空默认值
  displayAccuracy: "", //  小数保留位数
  dataItemExplain: "", //  数据项说明
  ktrPath: "", //  分析脚本
});
const addOrEditFormTS = reactive({
  uuid: "", //  主键
  version: "", //  版本号
  dataItemCode: "", //  数据项编码
  dataItemName: "", //  数据项名称
  dataItemEnName: "", //  数据项英文名
  productUuid: ["1"], //  来源应用
  // numeratorAndDenominator: "", //  分子/分母
  paramTs: [], //  所属指标
  paramName: "", //  所属指标回显
  unitMeasurement: "", //  计量单位
  unitMeasurementUuid: "", //  计量单位
  craftFilling: "", //  采集方式
  statisticalPeriod: "", //  数据项频次
  // analysisCycle: "", //  分析周期
  // scriptExecutionType: "", //  脚本执行类型
  dataItemType: "", //  数据项类型
  defaultValue: "", //  数据项为空默认值
  displayAccuracy: "", //  小数保留位数
  dataItemExplain: "", //  数据项说明
  ktrPath: "", //  分析脚本
});

const addOrEditFormRules = reactive({
  version: [{ required: true, message: "请选择版本号", trigger: "change" }],
  dataItemName: [
    { required: true, message: "请输入数据项名称", trigger: "blur" },
  ],
  dataItemCode: [
    { required: true, message: "请输入数据项编码", trigger: "blur" },
  ],
  dataItemEnName: [
    { required: true, message: "请输入数据项英文名", trigger: "blur" },
  ],
  // numeratorAndDenominator: [
  //   { required: true, message: "请选择分子/分母", trigger: "change" },
  // ],
  paramName: [{ required: true, message: "请选择所属指标", trigger: "blur" }],
  craftFilling: [
    { required: true, message: "请选择采集方式", trigger: "change" },
  ],
  dataItemType: [
    { required: true, message: "请选择数据项类型", trigger: "change" },
  ],
  productUuid: [
    { required: true, message: "请选择所属指标", trigger: "change" },
  ],
});
const dataItemAliTableData = ref([]); //  数据项别名表
const valueCodeIndex = ref(-1);
const valueNameIndex = ref(-1);
const valueIndex = ref(-1);
const productUuidIndex = ref(-1);

const formRules = reactive({});
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const deleteRow = (row) => {
  ElMessageBox.confirm("确定要移出该别名吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 从数据项别名表中删除对应的行
      const index = dataItemAliTableData.value?.findIndex(
        (item) => item === row
      );
      if (index > -1) {
        dataItemAliTableData.value.splice(index, 1);
        console.log("删除的行：", row, dataIndexSourceList.value);

        // 如果需要同步更新到 dataIndexSourceList（如果它们是关联的）
        const sourceIndex = dataIndexSourceListTs.value?.findIndex(
          (item) => item.uuid === row.uuid
        );
        if (sourceIndex > -1) {
          dataIndexSourceListTs.value.splice(sourceIndex, 1);
          dataIndexSourceList.value = JSON.parse(
            JSON.stringify(dataIndexSourceListTs.value)
          );
        }

        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const submitFormFn = debounce(async (formName) => {
  addOrEditFormRef.value.validate(async (valid) => {
    if (valid) {
      let indexDataItemsTs = [];
      let aliasDataItemEntitiesTs = [];
      // addOrEditForm.paramTs.forEach((item, index) => {
      //   indexDataItemsTs.push({
      //     indexUuid: item.uuid,
      //     isSourceData: item.isSourceData || "0",
      //   });
      // });
      dataItemAliTableData?.value?.forEach((item, index) => {
        indexDataItemsTs.push({
          indexUuid:
            showTitle.value == "新增数据项"
              ? item.uuid
              : item.indexUuid || item.uuid,
          isSourceData: item.isSourceData || "0",
        });
        aliasDataItemEntitiesTs.push({
          uuid: "",
          indexUuid:
            showTitle.value == "新增数据项"
              ? item.uuid
              : item.indexUuid || item.uuid,
          sourceDataItemUuid:
            showTitle.value == "新增数据项" ? "" : addOrEditForm.id,
          dataItemName: item.dataItemName,
          dataItemCode: item.dataItemCode,
          productUuid: item.productUuid,
          zbbh: item.zbbh,
          zbmc: item.zbmc,
          // numeratorAndDenominator: item.numeratorAndDenominator || "0",
          kyf: item.kyf || "0",
        });
      });
      addOrEditForm.unitMeasurement =
        unitList.value?.find(
          (item) => item.diatValue == addOrEditForm.unitMeasurementUuid
        )?.dictLabel || "";
      let obj = {
        ...addOrEditForm,
        indexDataItems: indexDataItemsTs,
        aliasDataItemEntities: aliasDataItemEntitiesTs,
        uuid:
          showTitle.value == "新增数据项" || showTitle.value == "复制数据项"
            ? ""
            : addOrEditForm.uuid,
      };
      if (showTitle.value == "新增数据项") {
        let res = await insertDataItem(obj);
        if (res.code == 200) {
          ElMessage.success("操作成功");
          showDialog.value = false;
          tableRef.value.fetchData();
        }
      } else if (showTitle.value == "编辑数据项") {
        let res = await updateDataItem(obj);
        if (res.code == 200) {
          ElMessage.success("操作成功");
          showDialog.value = false;
          tableRef.value.fetchData();
        }
      } else if (showTitle.value == "复制数据项") {
        let res = await copyCodyDataItem(obj);
        if (res.code == 200) {
          ElMessage.success("操作成功");
          showDialog.value = false;
          tableRef.value.fetchData();
        }
      }
    } else {
      ElMessage.error("请您填写必填信息");
      return;
    }
  });
}, 500);

//添加指标
const addIndexShow = ref(false);
const tableLoading = ref(false);
const indexNameOne = ref("");
const indexNameTwo = ref("");
const selectedLsit = ref([]);
const dataIndexSourceList = ref([]);
const dataIndexSourceListTs = ref([]);
const handleSearchList = async () => {
  tableLoading.value = true;
  let res = await getIndexTree({ zbmc: indexNameOne.value });
  if (res.code == 200) {
    dataIndexSource.value = res.data;
    console.log(res, "res11");
    if (dataIndexSourceListTs.value?.length) {
      selectIndexArr.value = [];
      dataIndexSourceListTs?.value?.forEach((item) => {
        selectIndexArr.value.push(item.indexUuid);
      });
      dataIndexSourceList.value = JSON.parse(
        JSON.stringify(dataIndexSourceListTs.value)
      );
    } else {
      selectIndexArr.value = [];
      dataIndexSourceList.value = [];
      dataIndexSourceListTs.value = [];
    }
    tableLoading.value = false;
  } else {
    dataIndexSource.value = [];
  }
};

const handleSearchLists = async () => {
  if (dataIndexSourceListTs.value?.length) {
    dataIndexSourceList.value = dataIndexSourceListTs.value?.filter((item) => {
      return item.zbmc.indexOf(indexNameTwo.value) > -1;
    });
  } else {
    dataIndexSourceList.value = [];
  }
};
// 点击某个单元格
const handDataClick = ({ row, column, $index }) => {
  // console.log("row:", row);
  // console.log("column:", column);
  // console.log("$index:", $index);
  indexDetailShow.value = true;
  indexDetailTableData.value = row.aliasDataItemEntities || [];
  nextTick(() => {
    indexDetailTableRef.value?.fetchData();
  });
};

const appLicationOptions = ref([]); //  来源应用选项

const statusClick = ({ row, column, value }) => {
  let obj = {
    uuid: row.uuid,
    valid: value,
  };
  updateDataItemStatusApi(obj).then((res) => {
    if (res.code == 200) {
      ElMessage.success("操作成功");
      tableRef.value.fetchData();
    }
  });
};

const tableRef = ref(null); //  表格
// 表格配置项
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1",
  btnList: [
    { btnType: "add", bind: { type: "baseSpecial" }, permission: "sjx-add" },
    {
      btnType: "edit",
      bind: { type: "baseSpecial" },
      permission: "sjx-edit",
    },
    {
      text: "复制",
      btnType: "edit",
      icon: "DocumentCopy",
      bind: { type: "baseSpecial" },
      permission: "sjx-copy",
    },
    {
      text: "删除",
      btnType: "delete",
      // bind: { type: "deleteSpecial" },
      permission: "sjx-del",
    },
    // { text: "来源配置", icon: "Connection" },
  ], // 表格按钮
  apiUrl: "/business/dataItem/page", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "版本号",
      columnName: "version",
      columnWidth: "160",
      showOverflowTooltip: true,
      formatter: (row, cloumn, index) => {
        return zbVerNumList.value?.find((item) => item.dictValue == row.version)?.dictLabel || "";
      }
    },
    {
      columnLabel: "数据项编码",
      columnName: "dataItemCode",
      columnWidth: "160",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "数据项名称",
      columnName: "dataItemName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "数据项类型",
      columnName: "dataItemType",
      columnWidth: "120",
      showOverflowTooltip: true,
      formatter: (row, cloumn, index) => {
        return dataItemTypeFn(row.dataItemType, "formatter");
      },
    },
    {
      columnLabel: "来源应用",
      columnName: "productName",
      align: "left",
      columnWidth: "240",
      formatter: (row, cloumn, index) => {
        return "临床专科能力监测评价系统";
      },
      showOverflowTooltip: true,
    },
    {
      columnLabel: "关联指标",
      columnName: "aliasDataItemEntities",
      align: "center",
      columnWidth: "100",
      isClick: true,
      formatter: (row, cloumn, index) => {
        return row?.aliasDataItemEntities?.length || 0;
      },
      showOverflowTooltip: true,
    },
    // {
    //   columnLabel: "分子/分母",
    //   columnName: "numeratorAndDenominator",
    //   align: "center",
    //   columnWidth: "100",
    //   formatter: (row, cloumn, index) => {
    //     return dataItemTypeList(row.numeratorAndDenominator, "formatter");
    //   },
    // },
    {
      columnLabel: "别名数据量",
      columnName: "uuid",
      align: "center",
      columnWidth: "120",
      formatter: (row, cloumn, index) => {
        return row?.aliasDataItemEntities?.length - 1 || 0;
      },
      showOverflowTooltip: true,
    },
    {
      columnLabel: "启用否",
      kyf: "1",
      columnName: "valid",
      align: "center",
      columnWidth: "100",
      attrs: { "active-value": "1", "inactive-value": "0" },
      showOverflowTooltip: true,
    },
  ],
});

//  列表接口
const ListFn = (type) => {
  tableRef.value.fetchData(type);
};

//  表格按钮
const btnClick = async (item, val) => {
  console.log(item, val, "item-val");
  // 新增
  if (item.text == "新增") {
    showTitle.value = "新增数据项";
    showDialog.value = true;
    Object.assign(addOrEditForm, addOrEditFormTS);
    dataIndexSourceList.value = [];
    dataIndexSourceListTs.value = [];
    dataItemAliTableData.value = [];
  } else if (item.text == "编辑" || item.text == "复制") {
    showTitle.value = item.text == "编辑" ? "编辑数据项" : "复制数据项";
    Object.assign(addOrEditForm, val);
    addOrEditForm.paramTs =
      val.indexInfo?.find((item) => item.isSourceData == "1") || [];
    addOrEditForm.paramName = addOrEditForm.paramTs.zbmc || "";
    addOrEditForm.productUuid = ["1"];
    val?.aliasDataItemEntities?.forEach((item) => {
      item.isSourceData =
        item.indexUuid && item.indexUuid == addOrEditForm?.paramTs?.uuid
          ? "1"
          : "0";
    });
    dataItemAliTableData.value = val.aliasDataItemEntities;
    dataIndexSourceList.value = val.aliasDataItemEntities;

    showDialog.value = true;
    dataIndexSourceListTs.value = JSON.parse(
      JSON.stringify(dataIndexSourceList.value)
    );
  } else if (item.text == "删除") {
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
        // 删除
        const dataItemIds = val?.map((item) => item.uuid);
        let res = await deleteDataItem({ dataItemIds });
        if (res.code == 200) {
          ElMessage.success("删除成功");
          ListFn("重置");
        }
      })
      .catch(() => {});
  }
};

//  复制
const copyRow = () => {};

// 批量删除数据
const handDelete = () => {
  let arr = tableRef.value.getSelectionRows() || [];
  if (arr.length > 0) {
    ElMessageBox.confirm("是否确认删除勾选的数据源？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        let list = [];
        for (let i = 0; i < arr.length; i++) {
          list.push(arr[i].uuid);
        }
        deleteCodeGroupApi(list).then((res) => {
          if (res.code == 200) {
            ElMessage.success(res.msg);
            ListFn();
          }
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "删除取消",
        });
      });
  } else {
    ElMessage.warning("请先勾选需要删除的数据源!");
  }
};

const selectIndexArr = ref([]);
const treeRef = ref(null);

//添加指标
const dataIndexSource = ref([]);
const defaultSourceProps = ref({
  children: "children",
  label: "zbmc",
});
const treeProps = ref({
  checkStrictly: false,
});
const uuidFlag = ref("");

const dataIndexSourceFn = async () => {
  console.log(2211);
  nextTick(() => {
    // 获取选中节点的详细信息
    const checkedNodes = treeRef.value?.getCheckedNodes();

    // 处理选中节点，只保留叶子节点
    const leafNodes = checkedNodes
      ?.filter((node) => {
        // 判断是否为叶子节点（没有子节点或子节点为空）
        return !node.children || node.children.length === 0;
      })
      ?.map((node) => ({
        ...node,
        indexUuid: node.uuid,
        isSourceData:
          node.isSourceData == 1 ||
          (uuidFlag.value && node.uuid == uuidFlag.value)
            ? "1"
            : "0",
      }));
    dataIndexSourceList.value = leafNodes || [];
    let flag = false;
    for (const items of dataIndexSourceList.value) {
      if (items.isSourceData == "1") {
        flag = true;
        break; // 跳出循环
      }
    }
    if (!flag && dataIndexSourceList.value?.length) {
      dataIndexSourceList.value[0].isSourceData = "1";
    }
    dataIndexSourceListTs.value = JSON.parse(
      JSON.stringify(dataIndexSourceList.value)
    );
    console.log(
      dataIndexSourceList.value,
      dataIndexSourceListTs.value,
      "dataIndexSourceList.value"
    );
  });
};

const addIndex = async () => {
  tableLoading.value = true;
  addIndexShow.value = true;
  indexNameOne.value = "";
  indexNameTwo.value = "";
  let res = await getIndexTree();
  if (res.code == 200) {
    dataIndexSource.value = res.data;
    console.log(res, "res11", dataIndexSourceListTs.value);
    dataIndexSourceListTs.value = JSON.parse(
      JSON.stringify(dataItemAliTableData.value)
    );
    if (dataIndexSourceListTs.value?.length) {
      selectIndexArr.value = [];
      dataIndexSourceListTs?.value?.forEach((item) => {
        selectIndexArr.value.push(item.indexUuid);
      });
      dataIndexSourceList.value = JSON.parse(
        JSON.stringify(dataIndexSourceListTs.value)
      );
      console.log(1122, dataIndexSourceList.value);
    } else {
      selectIndexArr.value = [];
      dataIndexSourceList.value = [];
      dataIndexSourceListTs.value = [];
    }
    tableLoading.value = false;
  } else {
    dataIndexSource.value = [];
    selectIndexArr.value = [];
    dataIndexSourceList.value = [];
    dataIndexSourceListTs.value = JSON.parse(
      JSON.stringify(dataIndexSourceList.value)
    );
    tableLoading.value = false;
  }
};

const handleSwitchChange = (row) => {
  if (row.isSourceData === "1") {
    dataIndexSourceList?.value?.forEach((item) => {
      if (item.uuid !== row.uuid) {
        item.isSourceData = "0";
      }
    });
    dataIndexSourceListTs?.value?.forEach((items) => {
      if (items.uuid !== row.uuid) {
        items.isSourceData = "0";
      } else {
        items.isSourceData = "1";
      }
    });
  } else if (row.isSourceData === "0") {
    ElMessage.warning("至少需要一个源指标");
    row.isSourceData = "1";
  }
};

const handleSelectionChange = (val) => {
  selectedLsit.value = val;
};

const indexSubmit = async () => {
  uuidFlag.value = "";
  for (const items of dataIndexSourceListTs.value) {
    if (items.isSourceData == "1") {
      uuidFlag.value = items.indexUuid;
      break; // 跳出循环
    }
  }
  await dataIndexSourceFn();
};

const indexDelete = () => {
  dataIndexSourceList.value = dataIndexSourceList.value?.filter((item) => {
    return !selectedLsit.value?.some(
      (selectedItem) => selectedItem.uuid === item.uuid
    );
  });
  dataIndexSourceListTs.value = JSON.parse(
    JSON.stringify(dataIndexSourceList.value)
  );
  // 获取当前树中所有选中的节点
  const allCheckedNodes = treeRef.value.getCheckedNodes();

  // 过滤出叶子节点（没有子节点或子节点为空的节点）
  const leafCheckedNodes = allCheckedNodes?.filter((node) => {
    return !node.children || node.children.length === 0;
  });

  // 获取叶子节点的key
  const leafCheckedKeys = leafCheckedNodes?.map((node) => node.uuid);

  // 从选中的叶子节点中移除selectedLsit.value中的项
  const newCheckedKeys = leafCheckedKeys?.filter((key) => {
    return !selectedLsit.value?.some((item) => item.uuid === key);
  });

  // 更新树的选中状态
  treeRef.value?.setCheckedKeys(newCheckedKeys);

  // 清空已选择列表
  selectedLsit.value = [];

  ElMessage.success("移出成功");
};
const submitFlag = ref(false);

const closeAddIndex = () => {
  addIndexShow.value = false;
  console.log(closeAddIndex, "closeAddIndex");
};
const submitTable = () => {
  submitFlag.value = false;

  dataIndexSourceListTs?.value?.forEach((item) => {
    if (item.isSourceData == "1") {
      submitFlag.value = true;
      addOrEditForm.paramTs = [item];
    }
    dataItemAliTableData?.value?.forEach((items) => {
      if (items.indexUuid == item.uuid) {
        item.dataItemCode = items.dataItemCode;
        item.dataItemName = items.dataItemName;
        item.kyf = items.kyf;
        // if(items.numeratorAndDenominator){
        //   item.numeratorAndDenominator = items.numeratorAndDenominator;
        // }
        item.productUuid = items.productUuid;
      }
    });
  });
  if (!submitFlag.value) {
    ElMessage.warning("请您选择一个源指标");
    return;
  }
  addOrEditForm.paramName = addOrEditForm.paramTs[0]?.zbmc;
  dataItemAliTableData.value = JSON.parse(
    JSON.stringify(dataIndexSourceListTs.value)
  );
  addIndexShow.value = false;
};

// 关联指标详情

const bindIndexDetailData = reactive({
  pageOpen: "0", //  是否需要分页
  checkBox: "0", //  是否需要复选框
  light: "1",
  // bottomBtnList: [{ btnType: "cancel", text: "返回" }], // 表格按钮
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "数据项别名编码",
      columnName: "dataItemCode",
      columnWidth: "200",
      showOverflowTooltip: true,
    },
    { columnLabel: "数据项别名", columnName: "dataItemName" },
    {
      columnLabel: "来源应用",
      columnName: "productUuid",
      columnWidth: "250",
      showOverflowTooltip: true,
      formatter: (row, cloumn, index) => {
        return "临床专科能力监测评价系统";
      },
    },
    {
      columnLabel: "所属指标编号",
      columnName: "zbbh",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "所属指标名称",
      columnName: "zbmc",
      showOverflowTooltip: true,
    },
    // {
    //   columnLabel: "分子/分母",
    //   columnName: "numeratorAndDenominator",
    //   align: "center",
    //   columnWidth: "120",
    //   formatter: (row, cloumn, index) => {
    //     return dataItemTypeList(row.numeratorAndDenominator, "formatter");
    //   },
    // },
    {
      columnLabel: "启用否",
      kyf: "1",
      columnName: "kyf",
      align: "center",
      columnWidth: "100",
      showOverflowTooltip: true,
      attrs: { "active-value": "1", "inactive-value": "0", disabled: true },
    },
  ],
});

const btnIndexDetailClick = (val) => {
  // if (val.text == "返回") {
    indexDetailShow.value = false;
  // }
};

//  应用列表
const appLicationOptionsFn = () => {
  let obj = {};
  selectSourceApp(obj).then((res) => {
    appLicationOptions.value = res?.data?.length
      ? res.data?.map((item) => {
          return {
            ...item,
            label: item.label,
            value: item.value,
          };
        })
      : [];
  });
};

onMounted(() => {
  ListFn();
  appLicationOptionsFn();
});
</script>


<style lang="scss" scoped>
.dataItemCss {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .dataItem_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
  .cg_content {
    margin-top: 10px;
    height: calc(100% - 90px);
    background-color: rgba(253, 253, 251);
    padding: 10px;
    box-sizing: border-box;
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }
}
</style>
<style lang="scss">
.groupDialogCss {
  .el-overlay-dialog {
    overflow: hidden !important;
  }
}
.dataItemConfig-addOrEdit {
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
      background: rgba(83, 128, 253, 0.1);
      border: 1px solid rgba(83, 128, 253, 0.5);
      color: rgba(83, 128, 253, 1);
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .textarea-class {
      width: calc(50% - 12.5px);
    }
  }
}
.tableList-ref-class {
  box-shadow: none !important;
  .el-switch.is-disabled {
    background: none !important;
  }
}
.dataIndexSourceList-table-class {
  background-color: rgba(204, 204, 204, 0.15);
  .el-table__row > td {
    /* 去除表格线 */
    border: none;
  }
  .el-table__inner-wrapper::before {
    /* 去除下边框 */
    height: 0;
  }
  .el-table {
    border: 1px solid transparent !important;
    background-color: transparent !important;
  }
  .el-table .el-table__cell {
    padding: 0 !important;
  }
  .el-table th {
    background: none !important;
    border: none !important;
    font-size: 14px;
  }
  .el-table__header th {
    color: #101010 !important;
  }
  .el-table__body .cell {
    color: #606266 !important;
  }
  .el-table thead tr {
    background-color: transparent !important;
  }
  .el-table__body {
    border-collapse: separate;
    border-spacing: 0 5px; // 水平间距0，垂直间距5px
  }
  .el-table tbody tr {
    border-radius: 4px;
    background: rgba(0, 115, 237, 0.05) !important;
    border-radius: 4px !important;
  }
}
.index-add-box {
  .el-tree {
    background-color: rgba(204, 204, 204, 0.15);
  }

  .el-tree-node {
    border-radius: 4px;
    background: rgba(0, 115, 237, 0.05);
    margin-bottom: 5px;
  }
}
</style>