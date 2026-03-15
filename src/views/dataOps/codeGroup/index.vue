// 编码分组
<template>
  <div class="codeGroupCss">
    <div class="cg_header">
      <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="ListFn()" @reset="
          currentPage = 1;
          pageSize = PageListData()[0];
          ListFn();
        " :inline="true" />
    </div>
    <div class="cg_content">
      <div style="display: flex; height: 50px; align-items: center">
        <szycButton @click="addOrEditDptClick('add', '新增编码分组信息')"><el-icon class="bmr">
            <Plus />
          </el-icon>
          新增
        </szycButton>
        <szycButton @click="addOrEditDptClick('edit', '编辑编码分组信息')" :disabled="rowDataList.length == 0"><el-icon class="bmr">
            <EditPen />
          </el-icon>
          编辑</szycButton>

        <szycButton style="width: 150px" @click="groupCodeConfig"><el-icon class="bmr">
            <Setting />
          </el-icon>
          编码分组配置
        </szycButton>

        <szycButton @click="copyRow" :disabled="rowDataList.length == 0"><el-icon class="bmr">
            <CopyDocument />
          </el-icon>
          复制
        </szycButton>

        <szycButton type="delete" @click="handDelete" :disabled="rowDataList.length == 0"><el-icon class="bmr">
            <Delete />
          </el-icon>
          删除</szycButton>
      </div>
      <div style="height: calc(100% - 50px)">
        <el-table :data="tableData" ref="tableRef" style="width: 100%; height: calc(100% - 50px)" row-key="uuid" header-cell-class-name="headerTable" v-loading="loading" border highlight-current-row @rowClick="handleRowClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="groupCode" label="分组编码" width="180" show-overflow-tooltip />
          <el-table-column prop="groupName" label="分组名称" width="220" show-overflow-tooltip />
          <!-- <el-table-column prop="groupNamePinyin" label="分组名称拼音码" width="220" show-overflow-tooltip /> -->
          <el-table-column label="分组类型" width="150" show-overflow-tooltip>
            <template #default="scope">
              {{ groupTypeFn(scope.row.groupType) }}
            </template>
          </el-table-column>
          <el-table-column label="分组业务类型" width="150" show-overflow-tooltip>
            <template #default="scope">
              {{ businessTypeFn(scope.row.businessType) }}
            </template>
          </el-table-column>
          <el-table-column label="关联编码表" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ relatedCodeConfigSimpleEntityListFn(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="associationIndex" label="关联指标" width="180" show-overflow-tooltip />
          <el-table-column label="启用否" width="90" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.enabled" active-value="1" inactive-value="0" @change="handleSwitchChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="groupMeaning" label="分组意义" width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
        </el-table>
        <div class="pagination">
          <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="ListFn()" @current-change="ListFn()" :prev-text="'上一页'" :next-text="'下一页'" />
        </div>
      </div>
    </div>
    <!-- 新增/编辑 -->
    <SzycDialog :dialogVisible="showDialog" :destroy-on-close="true" width="60%" @close="
        showDialog = false;
        resetForm();
      " :title="tableTitle" :alignCenter="true">
      <template #uname>
        <SubmitForm v-model="formData" ref="submitFormRef" :items="formItems" :inline="true" :rules="rules" labelPosition="top" lastBtnName="保存并配置编码" @submit="handleSubmit" @cancel="showDialog = false" />
      </template>
    </SzycDialog>
    <!-- 编码分组配置 -->
    <SzycDialog :dialogVisible="groupDialog" :destroy-on-close="true" top="2%" class="groupDialogCss" width="95%" title="编码分组配置" @close="groupDialog = false">
      <template #uname>
        <div class="groupDialog">
          <div class="groupDialogTitleLeft" :style="`position:relative;width:${lineExper ? '52%' : '20%'}`">
            <div class="titleName">
              <p class="titleNameHeader"></p>
              <p class="titleNameText">编码分组配置</p>
            </div>
            <div>
              <div class="titleNameLeft">
                <p style="font-weight: 600; font-size: 15px">诊断编码信息</p>
                <div class="expand" v-if="isExpertMode" @click="exportOneFn(isExpertMode)">
                  <span class="expandText">收缩</span>
                  <img src="@/assets/ItemImg/expand.svg" class="expandImg" alt="" />
                </div>
                <div class="expand" v-else @click="exportOneFn(isExpertMode)">
                  <span class="expandText" style="margin-right: 8px">展开</span>
                  <img src="@/assets/ItemImg/contract.svg" style="width: 14px; height: 14px" alt="" />
                </div>
              </div>
              <treeDataRefComponent ref="treeDataRef" :lineExper="lineExper" v-show="isExpertMode" />
              <div class="titleNameLeft">
                <p style="font-weight: 600; font-size: 15px">手术编码信息</p>
                <div class="expand" v-if="isExpertModeTwo" @click="exportTwoFn(isExpertModeTwo)">
                  <span class="expandText">收缩</span>
                  <img src="@/assets/ItemImg/expand.svg" class="expandImg" alt="" />
                </div>
                <div class="expand" v-else @click="exportTwoFn(isExpertModeTwo)">
                  <span class="expandText" style="margin-right: 8px">展开</span>
                  <img src="@/assets/ItemImg/contract.svg" style="width: 14px; height: 14px" alt="" />
                </div>
              </div>
              <treeOperation ref="treeDataRefTwo" :lineExper="lineExper" v-show="isExpertModeTwo" />
            </div>
          </div>
          <div class="lineExper" :style="`left: ${lineExper ? 'calc(52% - 1px)' : 'calc(20% + 11px)'};`" @click="changeExpertMode">
            <div :class="`${lineExper?'linear-arrow':'linear-arrows'}`"></div>
          </div>
          <div class="groupDialogTitleRight" :style="`position:relative;width:${lineExper ? '47%' : '79%'}`">
            <div class="titleName">
              <p class="rightHeader"></p>
              <p class="rightText">条件规则描述</p>
            </div>
            <div>
              <el-input v-model="rowDataList[0].groupMeaning" readonly resize="none" type="textarea" rows="4" placeholder=""></el-input>
            </div>
            <div class="titleName" style="margin-top: 10px">
              <p class="rightHeader"></p>
              <p class="rightText">条件规则配置</p>
            </div>
            <div>
              <el-radio-group v-model="changeSetRadio">
                <el-radio value="1"> 规则配置 </el-radio>
                <el-radio value="2"> 脚本配置 </el-radio>
              </el-radio-group>
              <div v-if="changeSetRadio == '1'" style="height: 490px">
                <div style="display: flex; height: 50px; align-items: center">
                  <szycButton @click="addRowRule"><el-icon class="bmr">
                      <Plus />
                    </el-icon>
                    新增行
                  </szycButton>
                  <szycButton @click="deleteRowRule" type="delete">
                    <el-icon class="bmr">
                      <Delete />
                    </el-icon>
                    删除行
                  </szycButton>
                </div>
                <div style="height: calc(100% - 50px)">
                  <el-table :data="dataRule" border @row-click="handleRowClickRule" @row-contextmenu="handleRowContextmenu" row-key="keyUuid" highlight-current-row header-cell-class-name="headerTable" :style="`width: 100%;height:100%`">
                    <el-table-column label="(" width="100">
                      <template #default="{ row }">
                        <el-input v-model="row.bracketLeft" placeholder="" />
                        <!-- <el-select v-model="row.bracketLeft" clearable>
                          <el-option label="(" value="(" />
                        </el-select> -->
                      </template>
                    </el-table-column>
                    <el-table-column label="规则条件">
                      <template #default="{ row }">
                        <el-select v-model="row.conditionUUID" clearable @change="
                            row.conditionValue = '';
                            row.conditionUnit = '';
                          ">
                          <el-option v-for="item in metaDataRule" :key="item.uuid" :label="item.conditionName" :value="item.uuid" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="条件式">
                      <template #default="{ row }">
                        <!-- <el-input v-model="row.conditionExpression" />> -->
                        <el-select v-model="row.conditionOperator" clearable>
                          <el-option v-for="item in ruleMetaFn(
                              'equation',
                              row.conditionUUID
                            )" :key="item" :label="item" :value="item" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="条件值">
                      <template #default="{ row }">
                        <!-- 下拉 -->
                        <el-select v-model="row.conditionValue" v-if="
                            ruleMetaValueFn('value', row.conditionUUID) ==
                            'option'
                          " clearable>
                          <el-option v-for="item in ruleMetaFn(
                              'conditionValue',
                              row.conditionUUID
                            )" :key="item[optionKeyFn(row.conditionUUID, 'value')]" :label="
                              item[optionKeyFn(row.conditionUUID, 'name')]
                            " :value="
                              item[optionKeyFn(row.conditionUUID, 'value')]
                            " />
                        </el-select>
                        <!-- 输入 -->
                        <el-input v-model="row.conditionValue" v-else-if="
                            ruleMetaValueFn('value', row.conditionUUID) ==
                            'input'
                          " clearable />
                        <!-- 数字 -->
                        <el-input v-model="row.conditionValue" v-else-if="
                            ruleMetaValueFn('value', row.conditionUUID) ==
                            'input_number'
                          " clearable @input="(e) => handleInput(e, row)" />
                        <!-- 双击 -->
                        <div class="doubleClickCss" v-show-tip @dblclick="
                            handleDoubleClick(
                              row.conditionUUID,
                              row.keyUuid,
                              row.conditionValue
                            )
                          " v-else-if="
                            ruleMetaValueFn('value', row.conditionUUID) ==
                            'double_click'
                          ">
                          <el-tooltip effect="dark" :content="contentFn(row)" popper-style="max-width:90%;text-align:center">
                            {{
                              row.conditionValue &&
                              row.conditionValue.length > 0
                                ? contentFn(row)
                                : "双击选择"
                            }}
                          </el-tooltip>
                        </div>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column label="单位" width="100">
                      <template #default="{ row }">
                        <el-select v-model="row.conditionUnit" v-if="ruleMetaFn('unit',row.conditionUUID).length > 0" clearable>
                          <el-option v-for="item in ruleMetaFn('unit',row.conditionUUID)" :key="item" :label="item" :value="item" />
                        </el-select>
                      </template>
                    </el-table-column> -->
                    <el-table-column label=")" width="100">
                      <template #default="{ row }">
                        <el-input v-model="row.bracketRight" />
                        <!-- <el-select v-model="row.bracketRight" clearable>
                          <el-option label=")" value=")" />
                        </el-select> -->
                      </template>
                    </el-table-column>
                    <el-table-column label="条件关系">
                      <template #default="{ row, $index }">
                        <el-select v-model="row.conditionRelationOperator" clearable @change="
                            handleOperatorChange(
                              row.conditionRelationOperator,
                              $index
                            )
                          ">
                          <el-option label="并且" value="and" />
                          <el-option label="或者" value="or" />
                        </el-select>
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- 右击菜单弹窗 -->
                  <!-- <div v-if="contextMenuVisible" class="custom-context-menu" :style="{
                        left: menuPosition.x + 'px',
                        top: menuPosition.y + 'px',
                        zIndex: 9999
                      }">
                    <div class="menuS-item" @click="handleEdit">编辑</div>
                    <div class="menuS-item" @click="handleDelete">删除</div>
                    <div class="menuS-item" @click="handleView">查看详情</div>
                  </div> -->
                </div>
              </div>
              <div v-else style="height: 490px">
                <el-input v-model="textareaValue" type="textarea" style="height: 100%" rows="22" placeholder="请输入脚本配置..." resize="none" />
              </div>
            </div>
          </div>
        </div>
        <div class="footerGroup">
          <concel @click="groupDialog = false"> 取消 </concel>
          <confirm type="primary" @click="onSubmit"> 保存 </confirm>
        </div>

      </template>
    </SzycDialog>

    <SzycDialog :dialogVisible="valueDialog" :destroy-on-close="true" width="60%" top="4%" :title="titleValue" @close="valueDialog = false;queryTree = ''">
      <template #uname>
        <el-input v-model="queryTree" style="width: 350px;margin-bottom:10px;" placeholder="请输入名称..." @input="onQueryChanged" />
        <div style="height: 650px">
          <el-tree-v2 show-checkbox ref="rightTreeDataRef" :filter-method="filterMethod" :check-strictly="true" value-key="uniqueCode" :height="650" @check-change="
              (data, checked) => handleCheck(data, checked, 'right')
            " :data="lazyData" :default-checked-keys="expanedKeys" :props="{
              value: 'uniqueCode',
              label: 'name',
              children: 'children',
            }">
            <template #default="{ node, data }">
              <el-icon class="node-icon" :class="{ 'is-leaf': node.isLeaf }">
                <Document v-if="node.isLeaf" />
                <Folder v-else-if="!node.expanded" />
                <FolderOpened v-else />
              </el-icon>
              <span class="nodeLabelColor" v-show-tip>
                <el-tooltip effect="dark" :content="data.code + ' ' + node.label">
                  {{ data.code + " " + node.label }}
                </el-tooltip>
              </span>
            </template>
          </el-tree-v2>
          <!-- <TreeTable ref="addOrEditFormRef" v-model:table-data="addtableData" v-bind="{...tableObject}" @check-detail="handleSelectionChange" :lazy="true" :load-children-params="(row) => loadParamsFn(row,rowDialogData)" :load-children=" loadApi?saveCodeGroupDoubleApi: loadFn" table-style="height:100%" /> -->
        </div>
        <div style="
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
          <concel @click="valueDialog = false"> 取消 </concel>
          <confirm @click="handleConfirm"> 确定 </confirm>
        </div>
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import { PageListData } from "@/types/dict/pagination";
import {
  listCodeGroupApi,
  addCodeGroupApi,
  updateCodeGroupApi,
  deleteCodeGroupApi,
  listAppProjectApi,
  enableCodeGroupApi,
  saveCodeGroupApi,
  getConditionRuleDataApi,
  saveCodeGroupDoubleApi,
} from "@/api/tool.js";
import { dictStore } from "@/store/dict";
import { heightLight } from "@/types/rule/heightLight";
import { generateRandomId } from "@/types/dict/index";
// import treeTransfer from './component/index.vue'
import treeDataRefComponent from "./component/treeData.vue";
import treeOperation from "./component/treeDataOperation.vue";
import tableComponent from "../../../components/table/tableAndPage.vue";
import TreeTable from "../codeGroup/component/TreeTable.vue";

import { restructureTree, findObjectByUniqueCode, selectDataValueFn, childrenCheckedFn } from './index.js'

import confirm from "@/components/element/Confirm.vue";
import concel from "@/components/element/Cancel.vue";

const tableRefComponent = ref(null); // 弹窗组件实例
const addOrEditFormRef = ref(null);
const adddesignTableColumns = ref([]);
const titleValue = ref(""); // 弹窗标题

const rightTreeDataRef = ref(null);

const loadApi = ref(true);

const queryTree = ref('')

// 弹窗行数据
const rowDialogData = reactive({
  dataType: "",
  dataValue: [],
});


// 右击菜单状态
const contextMenuVisible = ref(false)
// 当前选中的行数据
const selectedRow = ref(null)
// 右击菜单位置
const menuPosition = ref({ x: 0, y: 0 })



const contentFn = (value) => {
  // return value
  // console.log(value,'val');
  if (Array.isArray(value.conditionValue)) {
    return value.conditionValue?.map((item) => item.code).join(",");
  }
};

const loadParamsFn = (row, type) => {
  if (type.dataType === "1") {
    if (type.dataName == "诊断") {
      return {
        dataType: "1",
        dataValue: fathDataFn(
          findObjectByUniqueCode(row.uniqueCode).children || []
        ),
      };
    } else {
      return {
        dataType: "1",
        dataValue: fathDataFn(
          findObjectByUniqueCode(row.uniqueCode).children || []
        ),
      };
    }
  } else {
    let obj = {
      groupUuid: rowDataList.value[0].uuid,
      meta: metaDataRule.value.find((f) => f.uuid === row.conditionUUID),
    };
    return obj;
  }
};

const addtableData = ref([]);

const tableObject = reactive({
  rowKey: "uuid", //  主键
  columns: [], //  设计表格列
  lazy: true,
  treeProps: {
    children: "children",
    hasChildren: "haveChild",
  },
});

const isExpertMode = ref(true); // 展开收起
const isExpertModeTwo = ref(false); // 展开收起

const textareaValue = ref(""); //  条件规则描述
// 树数据由组件内部管理，无需在此定义

const treeDataRef = ref(null); // 树组件引用（获取抛出的方法）
const treeDataRefTwo = ref(null);

const lineExper = ref(true); // 收缩

const submitFormRef = ref(null); //  提交表单校验

const dictList = dictStore(); //  字典接口
// console.log(dictList.dict['db_type'], '字典数据');
// console.log(dictList.dict["index_group_code_table"], 'dictList.dict["index_group_code_table"]');

const valueDialog = ref(false); //  编码表诊断弹窗
const lazyData = ref([]); //  编码表数据

//  查询值
const searchData = reactive({
  groupCode: "", //  分组编码
  groupName: "", //  分组名称
  groupTypeList: [], //  分组类型
  businessTypeList: [], //  分组业务类型
  codeList: [], //  关联编码表
});
//  查询表单
const searchItems = ref([
  {
    label: "分组编码",
    prop: "groupCode",
    component: "el-input",
    attrs: { placeholder: "请输入编码", clearable: true },
    style: { width: "200px" },
  },
  {
    label: "分组名称",
    prop: "groupName",
    component: "el-input",
    attrs: { placeholder: "请输入名称", clearable: true },
    style: { width: "200px" },
  },
  {
    label: "分组类型",
    prop: "groupTypeList",
    component: "el-select",
    options: dictList.dict["index_group_type"],
    attrs: {
      placeholder: "请选择类型",
      multiple: true,
      "collapse-tags": true,
      "collapse-tags-tooltip": true,
      clearable: true,
    },
    style: { width: "200px" },
  },
  {
    label: "分组业务类型",
    prop: "businessTypeList",
    component: "el-select",
    options: dictList.dict["index_group_business_type"],
    attrs: {
      placeholder: "请选择类型",
      multiple: true,
      "collapse-tags": true,
      "collapse-tags-tooltip": true,
      clearable: true,
    },
    style: { width: "200px" },
  },
  {
    label: "关联编码表",
    prop: "codeList",
    component: "el-select",
    options: dictList.dict["index_group_code_table"],
    attrs: {
      placeholder: "请选择编码表",
      multiple: true,
      "collapse-tags": true,
      "collapse-tags-tooltip": true,
      clearable: true,
    },
    style: { width: "200px" },
  },
]);

const formData = reactive({
  groupCode: "", //  分组编码
  groupName: "", //  分组名称
  // groupNamePinyin: '',    //  分组名称拼音码
  groupType: "", //  分组类型
  codeList: [], //  关联编码表
  associationIndex: [], //  关联指标
  businessType: "", //  分组业务类型
  projectList: [], //  关联项目
  groupMeaning: "", //  分组意义
  groupInfoSource: "", //  分组信息描述及来源
  remark: "", //  备注
  enabled: "", // 状态 0否 1是
});

const isExpertModeFn = (data, two) => {
  return data;
};

//  赋值的对象
const editDataFn = (rowData) => {
  formData.groupCode = rowData.groupCode || ""; // 分组编码
  formData.groupName = rowData.groupName || ""; // 分组名称
  formData.groupType = rowData.groupType || ""; // 分组类型
  formData.codeList = rowData.codeList || []; // 关联编码表
  formData.associationIndex = rowData.associationIndex || []; // 关联指标
  formData.businessType = rowData.businessType || ""; // 分组业务类型
  formData.projectList = rowData.projectList || []; // 关联项目
  formData.groupMeaning = rowData.groupMeaning || ""; // 分组意义
  formData.groupInfoSource = rowData.groupInfoSource || ""; // 分组信息描述及来源
  formData.remark = rowData.remark || ""; // 备注
  formData.enabled = rowData.enabled || ""; //   // 状态：0-禁用，1-启用
};

// 清空表单数据
const resetForm = () => {
  formData.groupCode = "";
  formData.groupName = "";
  formData.groupType = "";
  formData.codeList = [];
  formData.associationIndex = [];
  formData.businessType = "";
  formData.projectList = [];
  formData.groupMeaning = "";
  formData.groupInfoSource = "";
  formData.remark = "";
  formData.enabled = "1"; // 默认启用状态
};

// 新增编辑表单
const formItems = ref([
  {
    label: "分组编码：",
    prop: "groupCode",
    component: "el-input",
    attrs: { placeholder: "请输入分组编码" },
    formWidth: { width: "calc(48% - 32px)", "margin-bottom": "0px !important" },
  },
  {
    label: "分组名称：",
    prop: "groupName",
    component: "el-input",
    attrs: { placeholder: "请输入分组名称" },
    formWidth: { width: "48%", "margin-bottom": "0px !important" },
  },
  // {
  //   label: '分组名称拼音码：',
  //   prop: 'groupNamePinyin',
  //   component: 'el-input',
  //   attrs: { placeholder: '请输入分组名称拼音码' },
  //   formWidth: { width: 'calc(48% - 32px)', 'margin-bottom': '0px !important' }
  // },
  {
    label: "分组类型",
    prop: "groupType",
    component: "el-select",
    options: dictList.dict["index_group_type"],
    attrs: { placeholder: "请选择分组类型" },
    formWidth: { width: "calc(48% - 32px)", "margin-bottom": "0px !important" },
  },
  {
    label: "关联编码表：",
    prop: "codeList",
    component: "el-select",
    options: dictList.dict["index_group_code_table"],
    attrs: {
      placeholder: "请选择关联编码表",
      multiple: true,
      "collapse-tags": true,
      clearable: true,
      "collapse-tags-tooltip": true,
    },
    formWidth: { width: "48%", "margin-bottom": "0px !important" },
  },
  {
    label: "关联指标：",
    prop: "associationIndex",
    component: "el-select",
    attrs: { placeholder: "请选择关联指标" },
    formWidth: { width: "calc(48% - 32px)", "margin-bottom": "0px !important" },
  },
  {
    label: "分组业务类型：",
    prop: "businessType",
    component: "el-select",
    options: dictList.dict["index_group_business_type"],
    attrs: { placeholder: "请选择分组业务类型", clearable: true },
    formWidth: { width: "48%", "margin-bottom": "0px !important" },
  },
  {
    label: "关联项目：",
    prop: "projectList",
    component: "el-select",
    options: [],
    attrs: {
      placeholder: "请选择关联项目",
      multiple: true,
      "collapse-tags": true,
      clearable: true,
      "collapse-tags-tooltip": true,
    },
    formWidth: { width: "calc(48% - 32px)", "margin-bottom": "0px !important" },
  },
  {
    label: "启用否：",
    prop: "enabled",
    component: "el-switch",
    attrs: { "active-value": "1", "inactive-value": "0" },
    formWidth: { width: "48%", "margin-bottom": "0px !important" },
  },
  {
    label: "分组意义：",
    prop: "groupMeaning",
    component: "el-input",
    attrs: {
      placeholder: "请输入分组意义",
      type: "textarea",
      rows: 3,
      resize: "none",
    },
    formWidth: { width: "100%", "margin-bottom": "0px !important" },
  },
  {
    label: "分组信息描述及来源：",
    prop: "groupInfoSource",
    component: "el-input",
    attrs: {
      placeholder: "请输入分组信息描述及来源",
      type: "textarea",
      rows: 3,
      resize: "none",
    },
    formWidth: { width: "100%", "margin-bottom": "0px !important" },
  },
  {
    label: "备注：",
    prop: "remark",
    component: "el-input",
    attrs: {
      placeholder: "请输入备注",
      type: "textarea",
      rows: 3,
      resize: "none",
    },
    formWidth: { width: "100%", "margin-bottom": "0px !important" },
  },
]);

// 表单校验规则
const rules = {
  groupCode: [{ required: true, message: "请输入分组编码", trigger: "blur" }],
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
  groupNamePinyin: [
    { required: true, message: "请输入分组名称拼音码", trigger: "blur" },
  ],
  groupType: [{ required: true, message: "请选择分组类型", trigger: "change" }],
  associationType: [
    { required: true, message: "请选择关联编码表", trigger: "change" },
  ],
  // associationIndex: [{ required: true, message: '请选择关联指标', trigger: 'change' }],
  businessType: [
    { required: true, message: "请选择分组业务类型", trigger: "change" },
  ],
  // groupMeaning: [{ required: true, message: '请选择分组信息描述及来源', trigger: 'change' }],
  // groupInfoSource: [{ required: true, message: '请输入分组信息描述及来源', trigger: 'blur' }],
};

const tableRef = ref(null); // 表格实例

const rowDataList = ref([]); // 选中的行数据
const tableData = ref([]); // 表格数据
const loading = ref(false); // 加载状态
const tableTitle = ref(""); // 表格标题
const tableType = ref(""); // 表格类型(新增/编辑)
const showDialog = ref(false); // 弹窗状态

const currentPage = ref(1); // 当前页码
const pageSize = ref(PageListData()[0]); // 每页显示条数
const total = ref(0); // 总数据条数

const groupDialog = ref(false); //  编码分组弹窗
const metaDataRule = ref([]); //  编码分组条件规则配置表格数据

const changeSetRadio = ref("1"); //  切换条件规则配置

const dataRule = ref([]); // 编码分组条件规则配置表格
const keyUuidRow = ref("");

// 新增行规则
const addRowRule = () => {
  dataRule.value.push({
    keyUuid: generateRandomId(),
  });
};

// 删除行规则
const deleteRowRule = (index) => {
  dataRule.value = dataRule.value.filter(
    (item) => item.keyUuid !== keyUuidRow.value
  );
};

// 当前行数据
const handleRowClickRule = (row) => {
  keyUuidRow.value = row.keyUuid;
};

// 只允许输入数字
const handleInput = (e, row) => {
  row.conditionValue = e.replace(/[^\d]/g, "");
};

//  条件关系式
const handleOperatorChange = (value, index) => {
  // console.log(dataRule.value, '--');
  // console.log(index, 'index');
  if (value && index === dataRule.value.length - 1) {
    dataRule.value.push({
      keyUuid: generateRandomId(),
    });
  }
};

//  列表接口
const ListFn = (name, uuid) => {
  loading.value = true;
  let obj = {
    ...searchData,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  };
  // console.log(obj, '查询参数');
  listCodeGroupApi(obj).then((res) => {
    console.log(res, "编码分组列表");
    tableData.value = res.rows;
    total.value = res.total;
    if (res.rows.length > 0) {
      if (name) {
        rowDataList.value = [tableData.value.find((item) => item.uuid === uuid)]
        heightLight(tableRef.value, rowDataList.value);
        nextTick(() => {
          groupCodeConfig()
        })
      } else {
        rowDataList.value = [res.rows[0]];
        heightLight(tableRef.value, res?.rows[0]);
      }
    } else {
      rowDataList.value = [];
    }
    loading.value = false;
  });
};

// 点击行时间
const handleRowClick = (row) => {
  // console.log(row, '行数据');
  rowDataList.value = [row];
};

//  切换状态
const handleSwitchChange = (data) => {
  // console.log(data, "data");
  let obj = {
    uuid: data.uuid,
  };
  enableCodeGroupApi(obj).then((res) => {
    console.log(res, "操作成功！");
    ElMessage.success(res.msg);
    ListFn();
  });
};

// 新增/编辑
const addOrEditDptClick = (type, title) => {
  tableTitle.value = title;
  tableType.value = type;
  showDialog.value = true;
  if (type == "add") {
    formData.enabled = "1";
  } else {
    // console.log(rowDataList.value[0], "编辑数据");
    editDataFn(rowDataList.value[0]);
  }
};

//  提交数据
const handleSubmit = (data, name, type) => {
  // console.log(data, 'data');
  //   console.log(123);
  // console.log(data, 'data');
  // console.log(type, 'type');
  addDataSource(tableType.value, type);
};
// 分组类型
const groupTypeFn = (data) => {
  return (
    dictList.dict["index_group_type"].find((item) => item.dictValue == data)
      ?.dictLabel || ""
  );
};
// 分组业务类型
const businessTypeFn = (data) => {
  return (
    dictList.dict["index_group_business_type"].find(
      (item) => item.dictValue == data
    )?.dictLabel || ""
  );
};

// 关联编码表
const relatedCodeConfigSimpleEntityListFn = (data) => {
  if (
    data.relatedCodeConfigSimpleEntityList &&
    data.relatedCodeConfigSimpleEntityList.length > 0
  ) {
    return data.relatedCodeConfigSimpleEntityList
      .map((item) => item.relatedCodeTable)
      .join(",");
  } else {
    return "";
  }
};

//  新增数据源
const addDataSource = (type, name) => {
  if (type == "add") {
    addCodeGroupApi({ ...formData }).then((res) => {
      if (res.code == 200) {
        ElMessage.success(res.msg);
        ListFn(name, res.data);
        showDialog.value = false;
      }
    });
  } else {
    updateCodeGroupApi({ uuid: rowDataList.value[0].uuid, ...formData }).then(
      (res) => {
        if (res.code == 200) {
          ElMessage.success(res.msg);
          ListFn(name, rowDataList.value[0].uuid);
          showDialog.value = false;
        }
      }
    );
  }
};

//  编码分组配置
const groupCodeConfig = async () => {
  if (rowDataList.value.length > 0) {
    groupDialog.value = true; // 弹窗
    isExpertMode.value = true; // 展开诊断
    isExpertModeTwo.value = false; //  展开手术
    changeSetRadio.value = "1"; //   条件规则配置
    // console.log(treeDataRef.value, "treeDataRef.value");
    setTimeout(() => {
      let obj = { uuid: rowDataList.value[0].uuid };
      if (treeDataRef.value) {
        treeDataRef.value.fetchData(obj);
      }
      if (treeDataRefTwo.value) {
        treeDataRefTwo.value.fetchData(obj);
      }
    });
    getConditionRuleDataApiFn();
    // 组件会自动获取数据，无需手动调用接口
    // console.log(rowDataList.value[0], "rowDataList.value[0]");
    // testConnectApi({ id: rowDataList.value[0].id }).then(res => {
    //   if (res.code == 200) {
    //     ElMessage.success(`${rowDataList.value[0].connName}：` + res.msg)
    //   }
    // })

  } else {
    ElMessage.warning("请先选择分组!");
  }
};

//  复制
const copyRow = () => { };

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
        // console.log(list, "list");
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

//  列表接口
const ListItemFn = () => {
  loading.value = true;
  let obj = {
    projectName: searchData.projectName,
    state: searchData.state,
    // pageNum: currentPage.value,
    // pageSize: pageSize.value,
  };
  listAppProjectApi(obj).then((res) => {
    // console.log(res, '关联项目列表');
    formItems.value.forEach((e) => {
      if (e.prop === "projectList") {
        e["optionValue"] = "id";
        e["optionLabel"] = "projectName";
        e.options = res.data;
      }
    });
  });
};

// 诊断收缩
const exportOneFn = (isShow) => {
  isExpertMode.value = !isExpertMode.value;
  if (isExpertMode.value == true) {
    isExpertModeTwo.value = false;
  }
};
const exportTwoFn = (isShow) => {
  isExpertModeTwo.value = !isExpertModeTwo.value;
  if (isExpertModeTwo.value == true) {
    isExpertMode.value = false;
  }
};

// 处理规则名称
const conditionNameFn = (uuid) => {
  let dataMeta = JSON.parse(JSON.stringify(metaDataRule.value));
  return dataMeta.find((item) => item.uuid === uuid)?.conditionName || "";
};

const arrSaveList = (tree, type, childrenKey = "children") => {
  // 判断输入是否为数组
  if (!Array.isArray(tree)) {
    return [];
  }
  // 递归处理树结构
  return tree.map((item) => {
    // 创建只包含id和name的新对象
    const filteredNode = {
      code: item.code,
      uniqueCode: item.uniqueCode,
    };
    if (type == "icdLevel") {
      filteredNode["icdLevel"] = item.icdLevel;
    } else {
      filteredNode["ssczLevel"] = item.ssczLevel;
    }
    // 检查是否有子节点，如果有则递归处理
    if (
      item[childrenKey] &&
      Array.isArray(item[childrenKey]) &&
      item[childrenKey].length > 0
    ) {
      filteredNode[childrenKey] = arrSaveList(
        item[childrenKey],
        type,
        childrenKey
      );
    }
    return filteredNode;
  });
};

// 编码分组保存
const onSubmit = () => {
  // console.log(treeDataRef.value.dataEmitFn());
  // console.log(treeDataRefTwo.value.dataEmitFn());
  let obj = {
    groupUuid: rowDataList.value[0].uuid, // 分组uuid,
    icdUseList: arrSaveList(treeDataRef.value.dataEmitFn(), "icdLevel"), //  接收诊断字段信息。
    operationUseList: arrSaveList(
      treeDataRefTwo.value.dataEmitFn(),
      "ssczLevel"
    ), // 手术编码列表
    conditionRuleData: dataRule.value.map((item, index) => {
      return {
        ...item,
        conditionValue: JSON.stringify(item.conditionValue || ""),
        conditionName: conditionNameFn(item.conditionUUID),
        orderNo: index + 1,
      };
    }),
    conditionRuleScript: textareaValue.value, //  脚本配置
  };
  // console.log(obj, "obj");
  // console.log(dataRule.value, 'dataRule.value');
  saveCodeGroupApi(obj).then((res) => {
    // console.log(res, 'res');
    if (res.code == 200) {
      ListFn();
      ElMessage.success("保存成功！");
      groupDialog.value = false;
    } else {
      ElMessage.error(res.msg || "保存失败！");
    }
  });
};

//  处理初始化渲染数据
const fathDataFn = (data) => {
  let arr = JSON.parse(JSON.stringify(data));
  return arr.map((item) => {
    let obj = {
      ...item,
      haveChild: item.children && item.children.length > 0 ? true : false,
    };
    delete obj.children;
    return obj;
  });
};

const expanedKeys = ref([]);

// 双击事件
const handleDoubleClick = (uuid, keyUuid, valueList) => {
  // console.log(uuid, '双击行数据');
  let dataMeta = JSON.parse(JSON.stringify(metaDataRule.value));
  let obj = dataMeta.find((f) => f.uuid === uuid);
  valueDialog.value = true;
  loadApi.value = false;
  titleValue.value = obj.conditionName || "";
  keyUuidRow.value = keyUuid;
  // console.log(treeDataRef.value.dataEmitFn(), "treeDataRef.value.dataEmitFn()")
  if (Array.isArray(valueList)) {
    expanedKeys.value = valueList?.map((item) => item.uniqueCode);
  } else {
    expanedKeys.value = [];
  }
  // console.log(obj, 'obj');
  console.log(treeDataRef.value.dataEmitFn(), "treeDataRef.value.dataEmitFn()");

  if (obj.conditionName === "诊断编码") {
    // console.log(treeDataRef.value.dataEmitFn(), " treeDataRef.value.dataEmitFn() ");
    addtableData.value = fathDataFn(treeDataRef.value.dataEmitFn()); //  接收诊断字段信息。
    lazyData.value = treeDataRef.value.dataEmitFn()
    tableObject.rowKey = "uniqueCode";
    // console.log(lazyData.value, " lazyData.value");

    // tableObject.columns = [
    //   {
    //     columnLabel: "诊断编码",
    //     columnName: "code",
    //     // columnWidth: "250",
    //     showOverflowTooltip: true,
    //   },
    //   {
    //     columnLabel: "诊断名称",
    //     columnName: "name",
    //     // columnWidth: "250",
    //     showOverflowTooltip: true,
    //   },
    // ]
    rowDialogData.dataType = "1";
    rowDialogData.dataName = "诊断";
  } else if (obj.conditionName === "手术编码") {
    // console.log(1);

    tableObject.rowKey = "uniqueCode";
    // addtableData.value = fathDataFn(treeDataRefTwo.value.dataEmitFn())  // 手术编码列表
    lazyData.value = treeDataRefTwo.value.dataEmitFn()
    console.log(lazyData.value, " lazyData.value");
    // tableObject.columns = [
    //   {
    //     columnLabel: "诊断编码",
    //     columnName: "code",
    //     // columnWidth: "250",
    //     showOverflowTooltip: true,
    //   },
    //   {
    //     columnLabel: "诊断名称",
    //     columnName: "name",
    //     // columnWidth: "250",
    //     showOverflowTooltip: true,
    //   },
    // ]
    rowDialogData.dataType = "1";
    rowDialogData.dataName = "手术";
  } else {
    saveCodeGroupDoubleApi().then((res) => {
      if (res.code == 200) {
        lazyData.value = res.data
      }
    })
    loadApi.value = true;
  }
  // nextTick(() => {
  //   addOrEditFormRef.value.updateSelectArr()
  // })
};

const handleRowContextmenu = (row, column, event) => {
  // 阻止默认的右键菜单
  event.preventDefault()
  // 存储选中的行数据
  selectedRow.value = row
  // 设置菜单位置为鼠标点击位置
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }

  // 显示右击菜单
  contextMenuVisible.value = true
}





// 懒加载
const loadFn = (row, treeNode, resolve) => {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: [],
    });
  });
};


const handleConfirm = () => {
  // console.log(addOrEditFormRef.value.getSelectedItems(), "addOrEditFormRef.value.getSelectedItems()");
  // console.log(selectDataValueFn(addOrEditFormRef.value.getSelectedItems()), '  selectDataValueFn(addOrEditFormRef.value.getSelectedItems())');
  let index = dataRule.value.findIndex((f) => f.keyUuid === keyUuidRow.value);
  // let arr = addOrEditFormRef.value.getSelectedItems()
  // dataRule.value[index].conditionValue = (selectDataValueFn(arr) || []).map((item) => item.code).join(',')
  let arr = rightTreeDataRef.value.getCheckedNodes();
  dataRule.value[index].conditionValue = arr;
  valueDialog.value = false;
};



const changeExpertMode = () => {
  lineExper.value = !lineExper.value;
};

//  父子级
const handleCheck = (data, checked, type) => {
  // console.log(data, "data");
  // console.log(checked, "checked");
  let arr = childrenCheckedFn(data.children && data.children.length > 0 ? data.children : []);
  for (let i = 0, len = arr.length; i < len; i++) {
    rightTreeDataRef.value.setChecked(arr[i], checked);
  }
  // treeData.value
};


const onQueryChanged = () => {
  rightTreeDataRef.value.filter(queryTree.value)
}

const filterMethod = (query, node) => {
  return node.name.includes(query)
}





//  获取校验规则下拉
const getConditionRuleDataApiFn = () => {
  let obj = {
    groupUuid: rowDataList.value[0].uuid, // 分组uuid,
  };
  getConditionRuleDataApi(obj).then((res) => {
    console.log(res.data, "res");
    metaDataRule.value = res.data.meta; // 规则数组
    dataRule.value = res.data.data; // 规则数据
    textareaValue.value = res.data?.conditionRuleScript || ""; // 脚本配置
    for (let i = 0; i < dataRule.value.length; i++) {
      dataRule.value[i]["conditionValue"] = dataRule.value[i]?.conditionValue
        ? JSON.parse(dataRule.value[i]?.conditionValue || "")
        : "";
      dataRule.value[i]["keyUuid"] = generateRandomId();
    }
    // console.log(dataRule.value, " dataRule.value");
  });
};

// 规则下拉判断
const ruleMetaFn = (type, value) => {
  let dataMeta = JSON.parse(JSON.stringify(metaDataRule.value));
  //  条件式
  if (type == "equation") {
    return dataMeta.find((f) => f.uuid === value)?.conditionOperatorList || [];
  } else if (type == "unit") {
    // 单位
    return dataMeta.find((f) => f.uuid === value)?.conditionUnitList || [];
  } else if (type === "conditionValue") {
    // 条件值
    return dataMeta.find((f) => f.uuid === value)?.conditionContentList || [];
  }
};

// optionKey(条件值的key)
const optionKeyFn = (value, type) => {
  let dataMeta = JSON.parse(JSON.stringify(metaDataRule.value));
  if (type === "name") {
    return dataMeta.find((f) => f.uuid === value)?.showContentKeyName || "";
  } else {
    return dataMeta.find((f) => f.uuid === value)?.useContentKeyName || "";
  }
};

// 条件值判断
const ruleMetaValueFn = (type, value) => {
  let dataMeta = JSON.parse(JSON.stringify(metaDataRule.value));
  if (type === "value") {
    return dataMeta.find((f) => f.uuid === value)?.conditionInputType || "";
  } else {
  }
};


// 处理点击其他地方关闭菜单
const handleClickOutside = (event) => {
  // 检查是否点击在表格内但不是右击菜单
  const isClickInTable = event.target.closest('.el-table')
  const isClickInMenu = event.target.closest('.el-popover__popper')
  if (!isClickInMenu && contextMenuVisible.value) {
    contextMenuVisible.value = false
  }
}

// 处理ESC键关闭菜单
const handleEscKey = (event) => {
  if (event.key === 'Escape' && contextMenuVisible.value) {
    contextMenuVisible.value = false
  }
}


onMounted(() => {
  ListFn();
  ListItemFn();
  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside)
  // 添加ESC键监听
  document.addEventListener('keydown', handleEscKey)
});
</script>

<style lang="scss" scoped>
.codeGroupCss {
  width: 100%;
  height: 100%;
  background-color: rgba(231, 231, 233);
  .cg_header {
    height: 80px;
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
  .doubleClickCss {
    width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // height: 30px;
  }
  .groupDialog {
    display: flex;
    // justify-content: space-between;
    border-radius: 5px;
    color: black;
    .groupDialogTitleLeft {
      width: 52%;
      border: 1px solid gray;
      padding: 10px;
      box-sizing: border-box;
      border-radius: 5px;
      height: 720px;
      overflow: hidden;
      .titleNameLeft {
        display: flex;
        padding: 5px 10px 5px 10px;
        background: rgba(238, 238, 238, 1);
        margin: 5px 0 15px 0;
        justify-content: space-between;
      }
      .expand {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
      .expandText {
        margin-right: 5px;
        color: #5380fd;
      }
      .expandImg {
        width: 14px;
        height: 14px;
        rotate: 90deg;
        padding-left: 3px;
      }
    }
    .groupDialogTitleRight {
      width: 47%;
      border: 1px solid gray;
      padding: 10px;
      margin-left: 1%;
      box-sizing: border-box;
      border-radius: 5px;
      height: 720px;
      .rightHeader {
        height: 20px;
        background: #5380fd;
        width: 3px;
        border-radius: 3px;
        margin-right: 5px;
      }
      .rightText {
        font-size: 16px;
        font-weight: 600;
      }
    }
    .titleName {
      width: 100%;
      display: flex;
      padding: 5px 0;
      align-items: center;
      .titleNameHeader {
        height: 20px;
        background: #5380fd;
        width: 3px;
        border-radius: 3px;
        margin-right: 5px;
      }
      .titleNameText {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  .footerGroup {
    height: 50px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    width: 100%;
    justify-content: center;
  }
  .lineExper {
    position: absolute;
    height: 40px;
    width: 10px;
    border: 1px solid #808080;
    border-end-end-radius: 5px;
    border-top-right-radius: 5px;
    top: calc(50% - 20px);
    cursor: pointer;
  }
  .linear-arrow {
    width: 100%;
    height: 1px;
    position: relative;
  }
  .linear-arrows {
    width: 100%;
    height: 1px;
    position: relative;
  }
  .linear-arrows::before {
    content: "";
    position: absolute;
    left: 0;
    top: 20px;
    transform: translateY(-50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-left: 1px solid #000;
    border-bottom: 1px solid #000;
    transform-origin: bottom;
  }
  .linear-arrow::before {
    content: "";
    position: absolute;
    left: 0;
    top: 16px;
    transform: translateY(-50%) rotate(-135deg);
    width: 6px;
    height: 6px;
    border-left: 1px solid #000;
    border-bottom: 1px solid #000;
    transform-origin: bottom;
  }
  .custom-context-menu {
    position: fixed;
    background-color: white;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 4px 0;
    min-width: 120px;
    user-select: none;
  }

  .menuS-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  .menuS-item:hover {
    background-color: #f5f7fa;
  }
}
</style>
<style lang="scss">
.groupDialogCss {
  .el-overlay-dialog {
    overflow: hidden !important;
  }
}
</style>
