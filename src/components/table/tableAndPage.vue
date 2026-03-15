<template>
  <div class="tableExpand cardShadow">
    <div class="headDiv" :style="btnAndTextStyle" v-if="
        (btnList && btnList.length > 0) ||
        Object.keys(searchList)?.length > 0 ||
        textList?.length > 0
      ">
      <div v-if="Object.keys(searchList).length > 0" style="margin-right: 10px">
        <template v-if="$slots[searchList.prop]">
          <slot :name="searchList.prop" v-bind="searchList" />
        </template>
        <template v-else-if="searchList.component == 'el-select'">
          <el-select v-model="modelValue[searchList.prop]" v-bind="searchList.attrs" :style="searchList.style">
            <el-option v-for="opt in searchList.options || []" :key="getOptionValue(opt, searchList)" :label="getOptionLabel(opt, searchList)" :value="getOptionValue(opt, searchList)" />
          </el-select>
        </template>
        <template v-else-if="searchList.component == 'el-input'">
          <el-input v-model="searchList.SearchText" v-bind="searchList.attrs" clearable style="width: 214px">
            <template #suffix>
              <el-icon class="el-input__icon">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </template>
        <template v-else>
          <component :is="searchList.component" v-model="modelValue[searchList.prop]" v-bind="searchList.attrs" :style="searchList.style" />
        </template>
      </div>
      <div style="height: 100%; display: flex; align-items: center" v-if="btnList && btnList.length > 0">
        <!-- btnList里面的btnType必传 -->
        <configBtn v-for="(item, index) in btnFn(btnList)" v-bind="item.bind" :key="index" :disabled="item.isDisabled ? item?.disabledEvent({ item: item, lightData: lightRowData, selectList: selectRowList }) : disabledFn(item?.typeRow, lightRowData, selectRowList, item.special)" @click="handBtn(item)">
          <template #icon>
            <el-icon v-if="item.icon" class="icon-class">
              <component :is="item.icon" />
            </el-icon>
            <img v-if="!item.icon && item.img" :src="`/src/assets${item.img}`" class="icon-class" />
          </template>
          {{ item.text }}
        </configBtn>
      </div>
      <!-- 如果表格上方有文字展示 -->
      <div v-if="textList && textList.length > 0" style="height: 30px">
        <span v-for="(item, index) in textList" :style="item.style" style="margin: 0 12px" :key="index">{{ item.label }}:&nbsp;&nbsp;&nbsp;{{ item.value }}</span>
      </div>
    </div>
    <!--  :border="booleanFn(showBorder)" -->
    <el-table ref="elTableRef" :data="SearchTextFn(tableData)" border v-loading="tableLoading" :stripe="booleanFn(stripeRows)" header-cell-class-name="headerTable" :row-class-name="setRowClassName" :highlight-current-row="booleanFn(light)" v-bind="bindRowKey(primaryKey, isKey, apiUrl)" @rowClick="handleRowClick" @rowDblclick="handleRowDblclick" @selectionChange="handleSelectionChange" :style="`width: (100%); height: calc(100% - ${tablePageBtn(
        pageOpen,
        btnList,
        bottomBtnList,
        textList
      )}px)`" :tree-props="treeProps" :default-expand-all="defaultExpandAll" :expand-row-keys="expandRowKeys" @expandChange="handleExpandChange" class="tableAndPage-table-class">
      <el-table-column v-if="booleanFn(checkBox)" :selectable="checkBoxDisabled" type="selection" width="40" :reserve-selection="reserveSelection" align="center" fixed="left" />
      <el-table-column v-if="booleanFn(showIndex)" type="index" label="序号" width="70" align="center" fixed="left" />
      <template v-for="item in designTableColumns" :key="item.columnDataSourceName || item.columnName">
        <TableColumnRecursive :column="item" :align="props.align" @isClick="handleCellClick" @statusClick="handleToggleAvailable">
          <template v-for="slotName in Object.keys($slots)" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps" />
          </template>
        </TableColumnRecursive>
      </template>
      <el-table-column v-if="showActionColumn" label="操作" width="180">
        <template #default="scope">
          <slot name="action" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </el-table>
    <div style="
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 50px;
      " v-if="selectShowFlag || booleanFn(pageOpen)">
      <div v-if="selectShowFlag">已选：{{ selectRowList.length }} 条记录</div>
      <el-pagination v-if="booleanFn(pageOpen)" class="pSelect pageStyle" v-model:current-page="currentPage" v-model:page-size="pageSizes" :page-sizes="pageArr" :total="total" :prev-text="'上一页'" :next-text="'下一页'" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>
    <div style="
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
      " v-if="bottomBtnList && bottomBtnList.length > 0">
      <configBtn v-for="(item, index) in btnFn(bottomBtnList)" v-bind="item.bind" :key="index" :disabled="disabledFn(item?.typeRow, lightRowData, selectRowList)" @click="handBottomBtn(item)">
        <template #icon>
          <el-icon v-if="item.icon && item.iconType == 'icon'" class="icon-class">
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
import http from "@/utils/request"; // 引入封装的请求工具
import TableColumnRecursive from "./TableColumnRecursive.vue";
import configBtn from "@/components/element/Confirm.vue";
import { heightLight } from "@/types/rule/heightLight";
import {
  btnListArr,
  disabledFn,
  btnFn,
  booleanFn,
  tablePageBtn,
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
  // 当前行内容
  rowData: {
    type: Object,
    default: () => ({}),
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
    type: Boolean,
    default: true,
  },
  checkBoxDisabled: {
    type: Function,
    default: () => true,
  },
  showIndex: {
    // 是否显示序号列，默认 true
    type: Boolean,
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
  pageOpen: {
    type: Boolean,
    default: false,
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
]);


// 表格数据
const tableData = ref([]); // 存储表格数据
const currentPage = ref(1); // 当前页码
const pageSizes = ref(props.Sizes); // 默认每页条数
const total = ref(0); // 存储总数据条数

const SearchTextFn = (data) => {
  if (props.searchList?.SearchText) {
    const datalist = data.filter((item) =>
      item[props.searchList.prop]?.includes(props.searchList.SearchText)
    );
    return datalist;
  } else {
    return data;
  }
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
      (row) => row.hasOwnProperty(val.key) && row[val.key] == val.label
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
    // console.log(baseParams, "baseParams");
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
      if (props.pageOpen) {
        total.value = props.apiUrl.length;
      }
      if (props.pageOpen) {
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
    const shouldPaginate = props.pageOpen == 1 || props.pageOpen == true;
    if (!shouldPaginate) {
      currentPage.value = 1;
      pageSizes.value = 99999;
    }
    // 构建请求参数
    const baseParams = { ...props.queryParams, ...obj };
    const requestParams = queryParamsFn(
      props.interfaceType?.parameterType,
      baseParams,
      props.apiParms
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

    // console.log(requestParams, "requestParams");

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
      // console.log(requestParams, "requestParams");

      // 普通参数类型请求
      res = await (props.method == "get"
        ? http.get(props.apiUrl, { params: requestParams })
        : http.post(props.apiUrl, requestParams));
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
          (item) => item[props.selectKey]
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
    }else{
      lightRowData.value = null;
    }
    return new Promise((resolve) => {
      resolve(rows);
    });
  } catch (error) {
    // console.error("获取数据失败:", error);
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
      item[props.searchList.prop]?.includes(props.searchList.SearchText)
    );
    targetRow = filteredData[0];
  } else if (rows.length > 0) {
    targetRow = rows[0];
  }

  if (targetRow && elTableRef.value) {
    heightLight(elTableRef.value, targetRow);
    lightRowData.value = targetRow;
    emits("rowClick", lightRowData.value);
  }
};

//  设置
// const setRowClassName = ({ rowIndex }) => {
//   if (rowIndex == 0 && props.rowClassName) {
//     return "fixed-first-row"
//   }
// }

// // 组件挂载后加载数据
onMounted(() => {
  // console.log("checkBoxDisabled", props.checkBoxDisabled);
});

// 行点击事件处理
const handleRowClick = (row) => {
  lightRowData.value = row;
  // elTableRef.value?.setCurrentRow(row)
  heightLight(elTableRef.value, row);
  emits("rowClick", row); // 将事件传递给父组件
  // console.log("row行点击", row);
};

const handleRowDblclick = (row) => {
  emits("rowDbClick", row); // 将事件传递给父组件
  // console.log("row行点击", row);
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
  emits("btnBottomClick", item, selectRowList.value, lightRowData.value);
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
  // console.log("删除:", row);
};

// 新增单元格点击事件处理
const handleCellClick = ({ row, column, $index }) => {
  // 这里可以自定义处理逻辑，也可以通过emits传递给父组件
  emits("cellClick", { row, column, $index });
  // 示例：打印点击内容
  // console.log("row：", row);
  // console.log("column：", column);
  // console.log("$index：", $index);
  // console.log('点击单元格', row, column, $index);
};

// 新增statusClick事件处理
const handleToggleAvailable = ({ value, row, column }) => {
  emits("statusClick", { value, row, column });
};

// 监听分页相关数据变化，当传入的是数组且启用分页时需要重新计算数据
watch([currentPage, pageSizes], () => {
  if (Array.isArray(props.apiUrl) && props.pageOpen) {
    fetchData();
  }
});

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
  }
);

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

// 暴露方法给父组件
defineExpose({
  fetchData,
  clearSelection,
  tableData,
  selectRowList,
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
</style>

<style lang="scss">
.tableExpand {
  width: 100%;
  height: 100%;
  padding: 12px 16px 0px 16px;
  box-sizing: border-box;
}
.tableAndPage-table-class {
  .el-table__row > td.el-table__cell {
    color: #1d2129;
    background-color: #fff !important;
  }

  .el-table__row--striped > td.el-table__cell {
    background-color: #f5f6ff !important;
  }

  .el-table__body tr:hover > td {
    background-color: #f6f9ff !important;
  }

  // 树形表格展开行的样式调整 - 移除左边距
  // .el-table__indent {
  //   padding-left: 0 !important;
  // }

  // 处理展开行的所有单元格的左边距
  // .el-table__row.expanded > td:first-child .cell,
  // .el-table__row--expanded > td:first-child .cell {
  //   padding-left: 0 !important;
  // }

  // // 树形表格子行的全局样式 - 移除所有缩进
  // .el-table__row[class*="level-"] {
  //   .el-table__cell:first-child {
  //     .cell {
  //       padding-left: 0 !important;
  //     }
  //   }
  // }
}
</style>
