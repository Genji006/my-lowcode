<template>
  <div class="tableExpand cardShadow">
    <div
      class="headDiv"
      :style="btnAndTextStyle"
      v-if="
        (btnList && btnList.length > 0) ||
        Object.keys(searchList)?.length > 0 ||
        textList?.length > 0
      "
    >
      <div v-if="Object.keys(searchList).length > 0" style="margin-right: 10px">
        <template v-if="$slots[searchList.prop]">
          <slot :name="searchList.prop" v-bind="searchList" />
        </template>
        <template v-else-if="searchList.component == 'el-select'">
          <el-select
            v-model="modelValue[searchList.prop]"
            v-bind="searchList.attrs"
            :style="searchList.style"
          >
            <el-option
              v-for="opt in searchList.options || []"
              :key="getOptionValue(opt, searchList)"
              :label="getOptionLabel(opt, searchList)"
              :value="getOptionValue(opt, searchList)"
            />
          </el-select>
        </template>
        <template v-else-if="searchList.component == 'el-input'">
          <el-input
            v-model="searchList.SearchText"
            v-bind="searchList.attrs"
            clearable
            style="width: 214px"
          >
            <template #suffix>
              <el-icon class="el-input__icon">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </template>
        <template v-else>
          <component
            :is="searchList.component"
            v-model="modelValue[searchList.prop]"
            v-bind="searchList.attrs"
            :style="searchList.style"
          />
        </template>
      </div>
      <div
        style="height: 100%; display: flex; align-items: center"
        v-if="btnList && btnList.length > 0"
      >
        <!-- btnList里面的btnType必传 -->
        <configBtn
          v-for="(item, index) in btnFn(btnList)"
          v-bind="item.bind"
          :key="index"
          :disabled="disabledFn(item?.typeRow, lightRowData, selectRowList)"
          @click="handBtn(item)"
        >
          <template #icon>
            <el-icon v-if="item.icon" class="icon-class">
              <component :is="item.icon" />
            </el-icon>
            <img
              v-if="!item.icon && item.img"
              :src="`/src/assets${item.img}`"
              class="icon-class"
            />
          </template>
          {{ item.text }}
        </configBtn>
      </div>
      <!-- 如果表格上方有文字展示 -->
      <div v-if="textList && textList.length > 0" style="height: 30px">
        <span
          v-for="(item, index) in textList"
          :style="item.style"
          style="margin: 0 12px"
          :key="index"
          >{{ item.label }}:&nbsp;&nbsp;&nbsp;{{ item.value }}</span
        >
      </div>
    </div>
    <div :style="titleStyle" v-if="booleanFn(props.showTitle)">
      <div :style="mainTitleStyle" v-if="props.title">{{ props.title }}</div>
      <!-- <span :style="connectCharStyle" v-if="props.title && props.subtitle">{{
        props.titleConnectChar
      }}</span> -->
      <div :style="subTitleStyle" v-if="props.subtitle">
        {{ props.subtitle }}
      </div>
    </div>
    <el-table
      ref="elTableRef"
      :data="SearchTextFn(tableData)"
      :border="booleanFn(showBorder)"
      v-loading="tableLoading"
      :stripe="booleanFn(stripeRows)"
      header-cell-class-name="headerTable"
      :row-class-name="setRowClassName"
      :highlight-current-row="booleanFn(light)"
      v-bind="bindRowKey(primaryKey, isKey, apiUrl)"
      @rowClick="handleRowClick"
      @rowDblclick="handleRowDblclick"
      @selectionChange="handleSelectionChange"
      @mousedown="handleTableMouseDown($event)"
      @dragstart="handleTableDragStart($event)"
      :header-row-style="headerRowStyle"
      :header-cell-style="headerCellStyle"
      :style="`width: (100%); height: calc(100% - ${tablePageBtnC(
        pageOpen,
        btnList,
        bottomBtnList,
        textList,
      )}px)`"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      @expandChange="handleExpandChange"
      :show-summary="booleanFn(columnTotalAlways)"
      :summary-method="getSummaries"
    >
      <el-table-column
        v-if="booleanFn(checkBox)"
        :selectable="checkBoxDisabled"
        type="selection"
        width="57"
        :reserve-selection="reserveSelection"
        align="center"
        fixed="left"
      />
      <el-table-column
        v-if="booleanFn(showIndex)"
        type="index"
        label="序号"
        width="70"
        align="center"
        fixed="left"
      />
      <template
        v-for="item in designTableColumns"
        :key="item.columnDataSourceName || item.columnName"
      >
        <TableColumnRecursiveCOPY
          :column="item"
          :align="item.textAlign || props.align"
          :width="item.columnWidth || props.columnWidth"
          @isClick="handleCellClick"
          @statusClick="handleToggleAvailable"
        >
          <template
            v-for="slotName in Object.keys($slots)"
            #[slotName]="slotProps"
          >
            <slot :name="slotName" v-bind="slotProps" />
          </template>
        </TableColumnRecursiveCOPY>
      </template>
      <el-table-column
        label="排序"
        width="80"
        class-name="drag-column"
        align="center"
        fixed="right"
        v-if="booleanFn(manualSorting)"
      >
        <template #default>
          <div class="drag-handle" @mousedown.stop @touchstart.stop>
            <span class="drag-icon">≡</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="showActionColumn" label="操作" width="180">
        <template #default="scope">
          <slot name="action" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </el-table>
    <div
      style="
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 50px;
      "
      v-if="selectShowFlag || booleanFn(pageOpen)"
    >
      <div v-if="selectShowFlag">已选：{{ selectRowList.length }} 条记录</div>

      <el-pagination
        v-if="booleanFn(pageOpen)"
        class="pSelect pageStyle"
        v-model:current-page="currentPage"
        v-model:page-size="pageSizes"
        :page-sizes="pageArr"
        :total="total"
        :prev-text="'上一页'"
        :next-text="'下一页'"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    <div
      style="
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
      "
      v-if="bottomBtnList && bottomBtnList.length > 0"
    >
      <configBtn
        v-for="(item, index) in btnFn(bottomBtnList)"
        v-bind="item.bind"
        :key="index"
        :disabled="disabledFn(item?.typeRow, lightRowData, selectRowList)"
        @click="handBottomBtn(item)"
      >
        <template #icon>
          <el-icon
            v-if="item.icon && item.iconType == 'icon'"
            class="icon-class"
          >
            <component :is="item.icon" />
          </el-icon>
          <img v-if="item.icon" :src="item.icon" class="icon-class" />
        </template>
        {{ item.text }}
      </configBtn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import Sortable from "sortablejs";
import http from "@/utils/request"; // 引入封装的请求工具
import TableColumnRecursiveCOPY from "./TableColumnRecursiveCOPY.vue";
import configBtn from "@/components/element/Confirm.vue";
import { heightLight } from "@/types/rule/heightLight";
import {
  btnListArr,
  disabledFn,
  btnFn,
  booleanFn,
  tablePageBtnC,
  bindRowKey,
  extractTimeRangeParams,
  generateRandomId,
  addKeyRowIdRecursive,
} from "@/components/table/table.js";

const pageArr = [10, 15, 30, 45, 60, 75, 90]; //  每页显示数量
const tableLoading = ref(false); //  表格加载中
const elTableRef = ref(null); //  表格实例
const lightRowData = ref({});
const selectRowList = ref([]); //  选中的行

// 定义组件接收的 Props
const props = defineProps({
  method: {
    type: String,
    default: "post",
  },
  // 表头样式相关属性
  headerHeight: {
    type: String,
    default: "36px",
  },
  headerBgColor: {
    type: String,
    default: "#5380fd",
  },
  headerFontSize: {
    type: String,
    default: "16px",
  },
  headerFontColor: {
    type: String,
    default: "#fff",
  },
  // 当前行内容
  rowData: {
    type: Object,
    default: () => ({}),
  },
  // 是否开启合计功能
  columnTotalAlways: {
    type: String,
    default: "0",
  },
  // 是否开启手动排序
  manualSorting: {
    type: String,
    default: "0",
  },
  // 是否开启标题
  showTitle: {
    type: String,
    default: "1",
  },
  // 表格标题
  title: {
    type: String,
    default: "",
  },
  // 主标题背景颜色
  titleBgColor: {
    type: String,
    default: "",
  },
  // 主标题字体大小
  titleFontSize: {
    type: String,
    default: "20px",
  },
  // 主标题字体颜色
  titleFontColor: {
    type: String,
    default: "#303133",
  },
  // 副标题内容
  subtitle: {
    type: String,
    default: "",
  },
  // 副标题字体大小
  subtitleFontSize: {
    type: String,
    default: "18px",
  },
  // 副标题字体颜色
  subtitleFontColor: {
    type: String,
    default: "#606266",
  },
  mainTitleAlign: {
    type: String,
    default: "center",
  },
  subTitleAlign: {
    type: String,
    default: "center",
  },
  // 主副标题连接字符
  titleConnectChar: {
    type: String,
    default: "-",
  },
  // 标题样式
  titleStyle: {
    type: Object,
    default: () => ({
      width: "100%",
      fontSize: "16px",
      boxSizing: "border-box",
      fontWeight: "bold",
      color: "#303133",
    }),
  },
  btnList: {
    type: Array,
    default: () => [],
  },
  bottomBtnList: {
    //表格底按钮
    type: Array,
    default: () => [],
  },
  apiUrl: {
    // 接口地址，必填
    type: [String, Array],
    required: true,
  },
  queryParams: {
    // 请求参数对象，默认空对象
    type: Object,
    default: () => ({}),
  },
  designTableColumns: {
    // 表格列配置数组，默认空数组
    type: Array,
    default: () => [],
  },
  lazy: {
    type: Boolean,
    default: false,
  },
  load: {
    type: Function,
    default: undefined,
  },
  showBorder: {
    // 是否显示边框，默认 false
    type: Boolean,
    default: false,
  },
  stripeRows: {
    // 是否开启斑马纹，默认 false
    type: Boolean,
    default: false,
  },
  light: {
    // 是否高亮当前行，默认 false
    type: Boolean,
    default: false,
  },
  primaryKey: {
    // 行唯一标识字段名，默认 'id'
    type: String,
    default: "",
  },
  isKey: {
    type: Boolean,
    default: false,
  },
  reserveSelection: {
    type: Boolean,
    default: false,
  },
  checkBox: {
    // 是否显示复选框列，默认 true
    type: [Boolean, String],
    default: true,
  },
  checkBoxDisabled: {
    type: Function,
    default: () => true,
  },
  showIndex: {
    // 是否显示序号列，默认 true
    type: [Boolean, String],
    default: true,
  },
  showActionColumn: {
    // 是否显示操作列，默认 false
    type: Boolean,
    default: false,
  },
  // 新增树形表格相关配置
  treeProps: {
    // 树形表格配置
    type: Object,
    default: () => ({
      children: "children",
      hasChildren: "hasChildren",
    }),
  },
  defaultExpandAll: {
    // 是否默认展开所有行
    type: Boolean,
    default: false,
  },
  //  是否需要分页
  isPage: {
    type: String,
    default: "1",
  },
  //  是否需要固定第一行
  rowClassName: {
    type: Boolean,
    default: false,
  },
  expandRowKeys: {
    // 展开行的 keys 数组
    type: Array,
    default: () => [],
  },
  // 新增多级表头相关配置
  headerRowSpan: {
    // 表头行合并配置
    type: Object,
    default: () => ({}),
  },
  headerColSpan: {
    // 表头列合并配置
    type: Object,
    default: () => ({}),
  },
  // 表格内容对齐方式
  align: {
    type: String,
    default: "",
  },
  // pageSize: {
  //   type: Number,
  //   default: 2  0,
  // }
  searchList: {
    type: Object,
    default: () => ({}),
  },
  textList: {
    type: Array,
    default: () => [],
  },
  btnAndTextStyle: {
    type: String,
    default: "",
  },
  interfaceType: {
    //type: 'POST', 'GET', 'PUT', 'DELETE'; 接口类型
    // parameterType: 'normal','special'； 传参类型(后续可添加)
    type: Object,
    default: () => ({}),
  },
  selectSettings: {
    // key:判断的参数，label:选中时得值，
    type: Object,
    default: () => ({}),
  },
  selectShowFlag: {
    type: Boolean,
    default: false,
  },
  apiParms: {
    type: Object,
  },
  Sizes: {
    type: Number,
    default: 15,
  },
  // 默认选中的行
  selectList: {
    type: Array,
    default: () => [],
  },
  // 选中时判断的key
  selectKey: {
    type: String,
    default: "",
  },
});
// 定义组件对外暴露的事件
const emits = defineEmits([
  "rowClick",
  "rowDbClick",
  "selectionChange",
  "expandChange",
  "statusClick",
  "update:rowData",
  "sortChange",
]);

const slotFn = (data) => {
  console.log(data, "data");
};
const pageOpen = ref(false);
// 表格数据
const tableData = ref([
  {
    uuid: 1,
    versionNumber: `versionNumber1`,
    dataItemCode: 1,
    dataItemName: `dataItemName1`,
    productName: `productName1`,
  },
  {
    uuid: 2,
    versionNumber: `versionNumber2`,
    dataItemCode: 2,
    dataItemName: `dataItemName2`,
    productName: `productName2`,
  },
  {
    uuid: 3,
    versionNumber: `versionNumber3`,
    dataItemCode: 3,
    dataItemName: `dataItemName3`,
    productName: `productName3`,
  },
  {
    uuid: 4,
    versionNumber: `versionNumber4`,
    dataItemCode: 4,
    dataItemName: `dataItemName4`,
    productName: `productName4`,
  },
  {
    uuid: 5,
    versionNumber: `versionNumber5`,
    dataItemCode: 5,
    dataItemName: `dataItemName5`,
    productName: `productName5`,
  },
]); // 存储表格数据

const currentPage = ref(1); // 当前页码
const pageSizes = ref(props.Sizes); // 默认每页条数
const total = ref(0); // 存储总数据条数

// // // 初始化模拟数据
total.value = tableData.value.length;

// 表头行样式计算属性
const headerRowStyle = computed(() => {
  return {
    height: props.headerHeight,
    lineHeight: props.headerHeight,
  };
});

// 表头单元格样式计算属性
const headerCellStyle = computed(() => {
  return {
    backgroundColor: props.headerBgColor
      ? props.headerBgColor + "!important"
      : "#5380fd",
    fontSize: props.headerBgColor
      ? props.headerFontSize + "!important"
      : "16px !important",
    color: props.headerFontColor + "!important",
  };
});

// 标题样式计算属性
const titleStyle = computed(() => {
  const baseStyle = {
    width: "100%",
    padding: "8px 16px",
    borderRadius: "4px",
    // display: "flex",
    // alignItems: "center",
    // justifyContent: "flex-start",
    boxSizing: "border-box",
    flexWrap: "wrap",
    gap: "4px",
  };

  if (props.titleBgColor) {
    baseStyle.backgroundColor = props.titleBgColor;
  }

  return baseStyle;
});

// 主标题样式计算属性
const mainTitleStyle = computed(() => {
  return {
    fontSize: props.titleFontSize,
    fontWeight: "bold",
    color: props.titleFontColor,
    textAlign: props.mainTitleAlign,
  };
});

// 副标题样式计算属性
const subTitleStyle = computed(() => {
  return {
    fontSize: props.subtitleFontSize,
    color: props.subtitleFontColor,
    textAlign: props.subTitleAlign,
  };
});

// 连接字符样式计算属性
const connectCharStyle = computed(() => {
  return {
    margin: "0 4px",
  };
});

const SearchTextFn = (data) => {
  if (props.searchList?.SearchText) {
    const datalist = data.filter((item) =>
      item[props.searchList.prop]?.includes(props.searchList.SearchText),
    );
    return datalist;
  } else {
    return data;
  }
};

// 获取列合计配置映射
const getColumnTotalConfig = (columns) => {
  const configMap = new Map();

  const processColumn = (column) => {
    const prop = column.columnDataSourceName || column.columnName;
    configMap.set(prop, column.columnTotal === "1");

    if (column.children && column.children.length > 0) {
      column.children.forEach(processColumn);
    }
  };

  columns.forEach(processColumn);
  return configMap;
};

// 合计方法
const getSummaries = (param) => {
  const { columns, data } = param;
  const columnTotalConfig = getColumnTotalConfig(props.designTableColumns);
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = "合计";
      return;
    }

    const prop = column.property;
    // 检查该列是否启用了合计
    if (columnTotalConfig.get(prop)) {
      // 计算合计
      const values = data.map((item) => {
        const value = item[prop];
        // 尝试转换为数字
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      });

      // 求和
      const sum = values.reduce((prev, curr) => prev + curr, 0);
      sums[index] = sum;
    } else {
      // 未启用合计，返回空字符串
      sums[index] = "";
    }
  });

  return sums;
};

// 根据 isContainsTask 参数设置默认选中行
const setDefaultSelectionByIsContainsTask = (rows, val) => {
  if (!elTableRef.value) {
    return;
  }
  nextTick(() => {
    rows.forEach((row) => {
      // 检查行数据是否包含指定的字段，并且值匹配
      if (row.hasOwnProperty(val.key) && row[val.key] == val.label) {
        // 使用 toggleRowSelection 方法勾选该行
        elTableRef.value.toggleRowSelection(row, true);
      }
    });

    // 触发 selectionChange 事件，确保父组件能获取到选中行
    const selectedRows = rows.filter(
      (row) => row.hasOwnProperty(val.key) && row[val.key] == val.label,
    );
    if (selectedRows.length > 0) {
      selectRowList.value = selectedRows;
      emits("selectionChange", selectedRows);
    }
  });
};

const clearSelection = () => {
  if (elTableRef.value) {
    elTableRef.value.clearSelection();
  }
};
//  type类型  baseParams 参数值  apiParms额外参数
const queryParamsFn = (type, baseParams = {}, apiParms = {}) => {
  if (type == "special") {
    return {
      ...baseParams,
      start: (currentPage.value - 1) * pageSizes.value,
      limit: pageSizes.value,
    };
  } else {
    //  处理配置页面的传参
    let arr = [];
    let obj = { componentId: apiParms.componentId };
    console.log(baseParams, "baseParams");
    if (apiParms?.queryDataForm && apiParms?.queryDataForm.length > 0) {
      for (let i = 0, len = apiParms?.queryDataForm.length; i < len; i++) {
        let row = apiParms?.queryDataForm[i];
        // console.log(row, 'row');
        if (row.component === "el-date-picker") {
          let value = baseParams[row.prop] || [];
          arr.push({
            columnName: row.prop, // key 值
            from: value && value.length > 0 ? value[0] : "", //   开始时间
            to: value && value.length > 0 ? value[1] : "", //   结束时间
            queryModel: row.queryType, //  查询类型
          });
        } else {
          arr.push({
            columnName: row.prop, // key 值
            columnValue: baseParams[row.prop] || "", // value 值
            queryModel: row.queryType, //  查询类型
          });
        }
      }
      obj.queryParams = arr;
    }
    return {
      ...baseParams,
      pageNum: currentPage.value,
      pageSize: pageSizes.value,
      ...obj,
    };
  }
};
// 获取远程数据type：类型； obj: 特殊的传参
const fetchData = async (type, obj) => {
  if (!(obj && Object.keys(obj).length)) {
    obj = {};
  }
  tableLoading.value = true;
  try {
    // 处理重置逻辑
    if (type == "重置") {
      currentPage.value = 1;
      pageSizes.value = props.Sizes;
    }
    // 处理数组类型API URL（静态数据）
    if (Array.isArray(props.apiUrl)) {
      if (pageOpen.value) {
        total.value = props.apiUrl.length;
      }
      if (pageOpen.value) {
        // 如果启用分页，则只显示当前页的数据
        const start = (currentPage.value - 1) * pageSizes.value;
        const end = start + pageSizes.value;
        tableData.value = props.apiUrl.slice(start, end);
      } else {
        // 如果未启用分页，则显示全部数据
        tableData.value = props.apiUrl;
      }
      tableLoading.value = false;
      if (tableData.value?.length) {
        handleSearchHighlight(tableData.value);
      }
      // 处理默认选中
      if (props.selectSettings?.key) {
        setDefaultSelectionByIsContainsTask(props.apiUrl, props.selectSettings);
      }
      return;
    }
    // 处理分页设置
    const shouldPaginate = pageOpen.value == 1 || pageOpen.value == true;
    if (!shouldPaginate) {
      currentPage.value = 1;
      pageSizes.value = 99999;
    }
    // 构建请求参数
    const baseParams = { ...props.queryParams, ...obj };
    const requestParams = queryParamsFn(
      props.interfaceType?.parameterType,
      baseParams,
      props.apiParms,
    );
    // const requestParams =  props.interfaceType?.parameterType == "special"
    //     ? {
    //         ...baseParams,
    //         start: (currentPage.value - 1) * pageSizes.value,
    //         limit: pageSizes.value,
    //       }
    //     : {
    //         ...baseParams,
    //         pageNum: currentPage.value,
    //         pageSize: pageSizes.value,
    //         ...props.apiParms,
    //       };

    console.log(requestParams, "requestParams");

    // let queryParams = {

    // }

    // 执行请求
    let res;
    if (props.interfaceType?.parameterType == "special") {
      // 特殊参数类型请求（FormData）
      const formData = new FormData();
      Object.keys(requestParams).forEach((key) => {
        formData.append(key, requestParams[key]);
      });
      res = await http.post(props.apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      console.log(requestParams, "requestParams");

      // 普通参数类型请求
      res = await (props.method == "get"
        ? http.get(props.apiUrl, { params: requestParams })
        : http.post(props.apiUrl, requestParams));
    }
    console.log(res);

    if (res.code != 200) {
      throw new Error(res.msg || "获取数据失败");
    }
    // 处理响应数据
    props.rowData = null;

    // 递归为每一行加keyRowId，兼容树形结构
    const rawData = res.rows || res.data || res.root || res || [];
    const rows = props.isKey
      ? addKeyRowIdRecursive(rawData, props.treeProps.children || "children")
      : rawData;

    tableData.value = rows;
    total.value = res.total || res.totalProperty || rawData.length || 0;

    // 处理默认选中
    if (props.selectSettings?.key) {
      setDefaultSelectionByIsContainsTask(rows, props.selectSettings);
    }
    if (props.selectList && props.selectList.length && props.selectKey) {
      if (elTableRef.value) {
        const rowlistUuid = props.selectList.map(
          (item) => item[props.selectKey],
        );
        tableData.value.forEach((row) => {
          if (rowlistUuid.includes(row[props.selectKey])) {
            elTableRef.value.toggleRowSelection(row, true);
          }
        });
      }
    }

    // 处理搜索高亮
    if (rows?.length) {
      handleSearchHighlight(rows);
    }
  } catch (error) {
    tableLoading.value = false;
    console.error("获取数据失败:", error);
    tableData.value = [];
    total.value = 0;
  } finally {
    tableLoading.value = false;
  }
};

// 处理搜索高亮逻辑
const handleSearchHighlight = (rows) => {
  // console.log("rows1122", rows);
  let targetRow = null;

  if (props.searchList?.SearchText) {
    const filteredData = rows.filter((item) =>
      item[props.searchList.prop]?.includes(props.searchList.SearchText),
    );
    targetRow = filteredData[0];
  } else if (rows.length > 0) {
    targetRow = rows[0];
  }

  if (targetRow && elTableRef.value) {
    heightLight(elTableRef.value, targetRow);
    lightRowData.value = targetRow;
  }
};

// 设置行类名
const setRowClassName = ({ rowIndex }) => {
  if (rowIndex == 0 && props.rowClassName) {
    return "fixed-first-row";
  }
};

// 组件挂载后初始化拖拽功能
onMounted(() => {
  console.log("checkBoxDisabled", props.checkBoxDisabled);
  initSortable();
});

// 初始化拖拽功能
const initSortable = () => {
  nextTick(() => {
    console.log("initSortable called");
    if (!elTableRef.value) {
      console.log("elTableRef.value is null");
      return;
    }

    // 改进DOM选择，使用更可靠的方式获取表格body
    let tableBody = null;
    try {
      // 首先尝试直接从表格实例获取tbody
      const tableWrapper = elTableRef.value.$el.querySelector(
        ".el-table__body-wrapper",
      );
      if (tableWrapper) {
        tableBody = tableWrapper.querySelector("tbody");
      }

      // 如果没找到，尝试更通用的选择器
      if (!tableBody) {
        tableBody = elTableRef.value.$el.querySelector("tbody");
      }

      // 如果还是没找到，打印错误信息
      if (!tableBody) {
        console.error("Table body not found");
        console.log("elTableRef structure:", elTableRef.value.$el);
        return;
      }

      console.log("Table body found:", tableBody);
    } catch (error) {
      console.error("Error finding table body:", error);
      return;
    }

    // 初始化Sortable实例
    try {
      // 如果已经存在Sortable实例，先销毁
      if (window.sortableInstance) {
        window.sortableInstance.destroy();
      }

      const sortable = Sortable.create(tableBody, {
        handle: ".drag-handle", // 只有按住drag-handle才可以拖动
        animation: 150, // 动画时间
        ghostClass: "sortable-ghost", // 拖拽时的占位符类名
        chosenClass: "sortable-chosen", // 选中项的类名
        dragClass: "sortable-drag", // 拖拽元素的类名
        forceFallback: true, // 强制使用回退模式，避免浏览器默认拖拽行为
        fallbackOnBody: true, // 将拖拽元素添加到body上，避免样式冲突
        fallbackTolerance: 3, // 拖拽阈值，避免轻微移动就触发拖拽
        // 移除filter，避免影响正常的拖拽功能
        // filter: ":not(tr)",
        // 配置拖拽组，允许在当前表格内拖拽
        group: {
          name: "table-drag",
        },

        // 开始拖拽时的回调
        onStart: (evt) => {
          console.log("Drag started:", evt);
          // 阻断外部的拖动功能
          document.body.style.userSelect = "none";
          // 隐藏其他可能的拖拽元素，防止出现重复表格
          const otherTables = document.querySelectorAll(
            ".el-table__body-wrapper tbody",
          );
          otherTables.forEach((table, index) => {
            if (table !== tableBody) {
              table.style.visibility = "hidden";
            }
          });
        },

        // 结束拖拽时的回调
        onEnd: (evt) => {
          console.log("Drag ended:", evt);
          // 恢复页面交互
          document.body.style.userSelect = "";
          // 恢复其他表格的可见性
          const otherTables = document.querySelectorAll(
            ".el-table__body-wrapper tbody",
          );
          otherTables.forEach((table) => {
            table.style.visibility = "visible";
          });

          // 处理排序逻辑
          handleSort(evt.oldIndex, evt.newIndex);
        },

        // 移动时的回调
        onMove: (evt) => {
          console.log("Drag moving:", evt);
        },
      });

      // 保存Sortable实例到全局，方便调试和销毁
      window.sortableInstance = sortable;
      console.log("Sortable initialized successfully:", sortable);
    } catch (error) {
      console.error("Error initializing Sortable:", error);
    }
  });
};

// 处理拖拽排序后的逻辑
const handleSort = (oldIndex, newIndex) => {
  if (oldIndex === newIndex) return;

  // 获取当前表格显示的数据（经过SearchTextFn过滤后的数据）
  const displayedData = SearchTextFn(tableData.value);

  // 检查索引是否在有效范围内
  if (
    oldIndex < 0 ||
    oldIndex >= displayedData.length ||
    newIndex < 0 ||
    newIndex >= displayedData.length
  ) {
    console.error("Invalid index for sorting:", {
      oldIndex,
      newIndex,
      displayedDataLength: displayedData.length,
    });
    return;
  }

  // 获取要移动的行
  const rowToMove = displayedData[oldIndex];

  // 创建原始数据的副本
  const newData = [...tableData.value];

  // 找到要移动的行在原始数据中的位置
  const originalPosition = newData.findIndex((row) => row === rowToMove);

  // 如果找不到要移动的行，直接返回
  if (originalPosition === -1) {
    console.error("Could not find row to move in original data:", rowToMove);
    return;
  }

  // 从原始位置移除该行
  newData.splice(originalPosition, 1);

  // 计算新的插入位置 - 更简单直接的方法
  // 1. 先创建一个过滤后的新数据数组
  const filteredDataCopy = [...displayedData];
  // 2. 在过滤后的数组中移动元素
  filteredDataCopy.splice(oldIndex, 1);
  filteredDataCopy.splice(newIndex, 0, rowToMove);

  // 3. 重建完整数据数组，保持过滤数据的新顺序
  // 分离过滤数据和非过滤数据
  const nonFilteredData = newData.filter((row) => !displayedData.includes(row));

  // 4. 合并过滤后的数据（新顺序）和非过滤数据
  const mergedData = [...filteredDataCopy, ...nonFilteredData];

  // 更新表格数据 - 使用Vue.set或重新赋值整个数组来触发响应式更新
  // 先清空数组，再重新添加元素，确保Vue能够检测到变化
  tableData.value = [];
  nextTick(() => {
    tableData.value = [...mergedData];
  });

  // 通知父组件排序发生了变化
  emits("sortChange", {
    oldIndex,
    newIndex,
    newData: mergedData,
    movedRow: rowToMove,
  });
};

// 行点击事件处理
const handleRowClick = (row) => {
  lightRowData.value = row;
  // elTableRef.value?.setCurrentRow(row)
  heightLight(elTableRef.value, row);
  emits("rowClick", row); // 将事件传递给父组件
  console.log("row行点击", row);
};

const handleRowDblclick = (row) => {
  emits("rowDbClick", row); // 将事件传递给父组件
  console.log("row行点击", row);
};

// 多选变更事件处理
const handleSelectionChange = (selection) => {
  selectRowList.value = selection;
  emits("selectionChange", selection); // 将事件传递给父组件
};

// 展开/收起行事件处理
const handleExpandChange = (row, expandedRows) => {
  emits("expandChange", row, expandedRows); // 将事件传递给父组件
};

//  点击按钮事件
const handBtn = (item) => {
  if (item.typeRow == "noneType") {
    emits("btnClick", item);
  } else if (item.typeRow == "rowType") {
    emits("btnClick", item, lightRowData.value);
  } else if (item.typeRow == "selectType") {
    emits("btnClick", item, selectRowList.value);
  }
};

//  点击底部按钮事件
const handBottomBtn = (item) => {
  emits("btnBottomClick", item, selectRowList.value);
};

// 页码切换事件
const handlePageChange = (page) => {
  currentPage.value = page; // 更新当前页码
  fetchData(); // 重新加载数据
};

// 每页条数变更事件
const handleSizeChange = (size) => {
  pageSizes.value = size; // 更新每页条数
  fetchData(); // 重新加载数据
};

// 示例删除方法（可移除或扩展）
const handleDelete = (row) => {
  console.log("删除:", row);
};

// 新增单元格点击事件处理
const handleCellClick = ({ row, column, $index }) => {
  // 这里可以自定义处理逻辑，也可以通过emits传递给父组件
  emits("cellClick", { row, column, $index });
  // 示例：打印点击内容
  console.log("row：", row);
  console.log("column：", column);
  console.log("$index：", $index);
  // console.log('点击单元格', row, column, $index);
};

// 新增statusClick事件处理
const handleToggleAvailable = ({ value, row, column }) => {
  emits("statusClick", { value, row, column });
};

// 处理表格的mousedown事件，防止整个表格被拖动
const handleTableMouseDown = (event) => {
  // 只有点击drag-handle元素时才允许拖拽
  if (!event.target.closest(".drag-handle")) {
    // 不是点击拖拽手柄时，可以添加其他处理逻辑
  }
  // 添加事件监听器来防止表格被意外拖动
  const preventDrag = (e) => {
    // 对于selectstart事件，如果不是点击拖拽手柄，则阻止文本选择
    if (e.type === "selectstart" && !e.target.closest(".drag-handle")) {
      e.preventDefault();
    }
    // 对于dragstart事件，已经有专门的handleTableDragStart函数处理
    // 移除临时事件监听器
    document.removeEventListener("dragstart", preventDrag);
    document.removeEventListener("selectstart", preventDrag);
  };

  // 添加临时事件监听器
  document.addEventListener("dragstart", preventDrag, { once: true });
  document.addEventListener("selectstart", preventDrag, { once: true });
};

// 阻止表格的默认拖拽行为
const handleTableDragStart = (event) => {
  // 只有当拖拽不是从drag-handle开始时，才阻止默认行为
  if (!event.target.closest(".drag-handle")) {
    event.preventDefault();
  }
};

// 监听分页相关数据变化，当传入的是数组且启用分页时需要重新计算数据
watch([currentPage, pageSizes], () => {
  if (Array.isArray(props.apiUrl) && pageOpen.value) {
    fetchData();
  }
});

// 监听tableData变化，当数据更新时重新初始化Sortable
watch(
  () => tableData.value,
  (newVal) => {
    console.log("tableData changed, reinitializing Sortable:", newVal);
    // 延迟一点时间，确保DOM已经更新
    nextTick(() => {
      initSortable();
    });
  },
  {
    deep: true, // 深度监听，确保数组元素变化也能触发
  },
);

watch(
  () => props.defaultExpandAll,
  (newVal) => {
    // 处理展开/折叠逻辑
    if (!elTableRef.value) return;

    // 递归获取所有行数据（包括嵌套的子节点）
    const getAllRows = (data) => {
      let rows = [];
      data.forEach((item) => {
        rows.push(item);
        if (item.children && item.children.length > 0) {
          rows = rows.concat(getAllRows(item.children));
        }
      });
      return rows;
    };

    // 获取所有行
    const allRows = getAllRows(tableData.value || []);

    // 展开或收起所有行
    allRows.forEach((row) => {
      elTableRef.value.toggleRowExpansion(row, newVal);
    });
  },
  {
    immediate: true,
  },
);
// 计算是否开启标题
const showTitle = computed(() => {
  return props.showTitle == "1";
});

// 递归获取所有节点的 key
const getAllNodeKeys = (data, childrenKey = "children") => {
  const keys = [];

  function traverse(nodes) {
    if (!Array.isArray(nodes)) return;

    nodes.forEach((node) => {
      // 确保节点有主键
      if (node[props.primaryKey || "id"] !== undefined) {
        keys.push(node[props.primaryKey || "id"]);
      }

      // 递归处理子节点
      if (
        node[childrenKey] &&
        Array.isArray(node[childrenKey]) &&
        node[childrenKey].length > 0
      ) {
        traverse(node[childrenKey]);
      }
    });
  }

  traverse(data);
  return keys;
};
// 监听isPage变化，设置pageOpen状态
watch(
  () => props.isPage,
  (newValue) => {
    console.log(newValue,'newValue56745645645645645645')
    if (newValue == "1") {
      pageOpen.value = '1';
      console.log("props.pageOpen1111", pageOpen.value);
    } else {
      pageOpen.value = '0';
       console.log("props.pageOpen000", pageOpen.value);
    }
  },
  { immediate: true },
);
// 暴露方法给父组件
defineExpose({
  fetchData,
  clearSelection,
  tableData,
  //默认选中
});
</script>

<style lang="scss" scoped>
.icon-class {
  margin-right: 4px;
}

.headDiv {
  height: 50px;
  display: flex;
  align-items: center;
}

.pageStyle {
  height: 50px;
  /* 分页区域高度 */
  display: flex;
  /* 使用 Flex 布局 */
  justify-content: end;
  /* 内容右对齐 */
  padding-right: 15px;
  /* 右侧内边距 */
  box-sizing: border-box;
  /* 盒模型设置 */
  text-align: right;
  /* 文字右对齐 */
  position: absolute;
  right: 0;
  top: 0;
}

.clickable-blue {
  color: #1976d2;
  cursor: pointer;
}

.headerTable {
  /* 样式将通过headerRowStyle动态设置 */
  font-weight: 500;
}

/* 拖拽手柄样式 */
.drag-handle {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  pointer-events: auto;
  user-select: none;
  /* 增加点击区域，确保鼠标事件能被正确捕获 */
  padding: 8px;
  box-sizing: border-box;
}

/* 拖拽图标样式 */
.drag-icon {
  font-size: 16px;
  color: #909399;
  line-height: 1;
}

/* 拖拽时的占位符样式 */
:deep(.sortable-ghost) {
  opacity: 0.5;
  background: #f0f9eb;
}

/* 拖拽选中项样式 */
:deep(.sortable-chosen) {
  background: #ecf5ff;
}

/* 拖拽元素样式 */
:deep(.sortable-drag) {
  opacity: 0.8;
}
</style>

<style lang="scss">
.tableExpand {
  width: 100%;
  height: 100%;
  padding: 12px 16px 0px 16px;
  box-sizing: border-box;
}
</style>
