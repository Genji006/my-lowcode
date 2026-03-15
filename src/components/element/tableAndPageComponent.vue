<template>
  <div class="tableExpand cardShadow">
    <div style="height:50px;display:flex;align-items: center; ">
      <div v-if="Object.keys(searchInput).length > 0 ">
        <el-input v-model="searchInput.SearchText" placeholder="searchInput.placeholder" clearable>
          <template #suffix>
            <el-icon class="el-input__icon">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div style="height:100%;display:flex;align-items: center; " v-if="btnList && btnList.length > 0">
        <configBtn v-for="item,index in btnList" v-bind="item.bind" :key="index" @click="handBtn(item)">
          <template #icon>
            <el-icon v-if="item.iconType && item.iconType == 'icon'" class="icon-class">
              <component :is="item.icon" />
            </el-icon>
            <img v-if="item.iconType && item.iconType == 'img'" :src="item.icon" class="icon-class" />
          </template>
          {{item.text}}
        </configBtn>
      </div>
    </div>
    <el-table :data="tableData" :border="booleanFn(showBorder)" v-loading="tableLoading" :stripe="booleanFn(stripeRows)" header-cell-class-name="headerTable" :row-class-name="setRowClassName" :highlight-current-row="booleanFn(light)" v-bind="bindRowKey(primaryKey)" @rowClick="handleRowClick" @selectionChange="handleSelectionChange" :style="`width: 100%; height: calc(100% - ${tablePageBtn(pageOpen,btnList)}px)`" :tree-props="treeProps" :default-expand-all="defaultExpandAll" :expand-row-keys="expandRowKeys" @expandChange="handleExpandChange">
      <el-table-column v-if="booleanFn(checkBox)" type="selection" width="40" align="center" />
      <el-table-column v-if="booleanFn(showIndex)" type="index" label="序号" width="50" align="center" fixed />
      <template v-for="item in designTableColumns" :key="item.columnName">
        <TableColumnRecursive :column="item" @cellClick="handleCellClick" @statusClick="handleToggleAvailable">
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
    <el-pagination v-if="booleanFn(pageOpen)" class="pSelect pageStyle" v-model:current-page="currentPage" v-model:page-size="pageSizes" :page-sizes="pageArr" :total="total" :prev-text="'上一页'" :next-text="'下一页'" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handlePageChange" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import http from "@/utils/request"; // 引入封装的请求工具
import TableColumnRecursive from './TableColumnRecursive.vue';
import configBtn from '@/components/element/Confirm.vue'
// import { list } from "./index.js"; // 模拟数据（开发阶段使用）

const pageArr = [10, 15, 30, 45, 60, 75, 90]   //  每页显示数量
const tableLoading = ref(false)   //  表格加载中

// 定义组件接收的 Props
const props = defineProps({
  btnList: {
    type: Array,
    default: () => []
  },
  apiUrl: {
    // 接口地址，必填
    type: String,
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
  checkBox: {
    // 是否显示复选框列，默认 true
    type: Boolean,
    default: true,
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
      children: 'children',
      hasChildren: 'hasChildren'
    })
  },
  defaultExpandAll: {
    // 是否默认展开所有行
    type: Boolean,
    default: false
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
    default: () => []
  },
  // 新增多级表头相关配置
  headerRowSpan: {
    // 表头行合并配置
    type: Object,
    default: () => ({})
  },
  headerColSpan: {
    // 表头列合并配置
    type: Object,
    default: () => ({})
  },
  // pageSize: {
  //   type: Number,
  //   default: 2  0,
  // }
  searchInput: {
    type: Object,
    default: () => ({}),
  },
  apiParms: {
    type: Object,
  },
});
// 定义组件对外暴露的事件
const emits = defineEmits([
  "rowClick", "selectionChange", "expandChange", "statusClick"
]);




// 表格数据
const tableData = ref([]); // 存储表格数据
const currentPage = ref(1); // 当前页码
const pageSizes = ref(pageArr[2]); // 默认每页条数
const total = ref(0); // 存储总数据条数

// 定义一个函数，用于从 props.queryParams 中提取时间范围参数
const extractTimeRangeParams = (params) => {
  let timeRangeParams = {};
  //  key 为当前数组参数的变量名拼接Start/End
  for (let key in params) {
    if (Array.isArray(params[key]) && params[key].length === 2) {
      timeRangeParams[`${key}Start`] = params[key][0];
      timeRangeParams[`${key}End`] = params[key][1];
    }
  }
  return timeRangeParams;
};

// 生成唯一ID
function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 递归为树形数据每一行加keyRowId
function addKeyRowIdRecursive(data, childrenKey = 'children') {
  if (!Array.isArray(data)) return [];
  return data.map(row => {
    const newRow = { ...row, keyRowId: row.keyRowId || generateRandomId() };
    if (Array.isArray(newRow[childrenKey]) && newRow[childrenKey].length > 0) {
      newRow[childrenKey] = addKeyRowIdRecursive(newRow[childrenKey], childrenKey);
    }
    return newRow;
  });
}

// 获取远程数据
const fetchData = async () => {
  tableLoading.value = true;
  const timeRangeParams = extractTimeRangeParams(props.queryParams);
  const params = {
    ...props.queryParams,
    ...timeRangeParams,
    pageNum: currentPage.value,
    pageSize: pageSizes.value
  };
  // 删除原有的数组参数
  for (let key in props.queryParams) {
    if (Array.isArray(props.queryParams[key])) {
      delete params[key];
    }
  }
  // console.log(params, 'params');
  try {
    // 发起请求获取数据
    const res = await http.post(props.apiUrl, { ...params, ...props.apiParms });
    console.log(res, 'res');
    // 递归为每一行加keyRowId，兼容树形结构
    const rows = addKeyRowIdRecursive(res.rows || [], props.treeProps.children || 'children');
    tableData.value = rows;
    total.value = res.total || 0;
    tableLoading.value = false
  } catch (error) {
    console.error('获取数据失败:', error);
    tableLoading.value = false
  }
};


//  设置
const setRowClassName = ({ rowIndex }) => {
  if (rowIndex === 0 && props.rowClassName) {
    return "fixed-first-row"
  }
}


//  数字类型转boolean  0 false  1 true
const booleanFn = (data) => {
  if (data == 1) {
    return true
  } else {
    return false
  }
}

// 分页样式布局
const tablePageBtn = (pageOpen, btnList) => {
  if (pageOpen == 1) {
    if (btnList && btnList.length > 0) {
      return 100
    } else {
      return 50
    }
  } else {
    if (btnList && btnList.length > 0) {
      return 60
    } else {
      return 10
    }
  }
}

// rowKey 处理
const bindRowKey = (value) => {
  if (value) {
    return { 'row-key': value }
  } else {
    return { 'row-key': 'keyRowId' }
  }
}



// // 组件挂载后加载数据
onMounted(() => {
  // fetchData();
});

// 行点击事件处理
const handleRowClick = (row) => {
  emits("rowClick", row); // 将事件传递给父组件
};

// 多选变更事件处理
const handleSelectionChange = (selection) => {
  emits("selectionChange", selection); // 将事件传递给父组件
};

// 展开/收起行事件处理
const handleExpandChange = (row, expandedRows) => {
  emits("expandChange", row, expandedRows); // 将事件传递给父组件
};

//  点击按钮事件
const handBtn = (item) => {
  emits('btnClick', item)
}

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
  // emits('cellClick', { row, column, $index });
  // 示例：打印点击内容
  console.log('row：', row);
  console.log('column：', column);
  console.log('$index：', $index);
  // console.log('点击单元格', row, column, $index);
};

// 新增statusClick事件处理
const handleToggleAvailable = ({ value, row, column }) => {
  emits('statusClick', { value, row, column });
};

// 暴露方法给父组件
defineExpose({
  fetchData
});


</script>

<style lang="scss" scoped>
.icon-class {
  margin-right: 4px;
}
.pageStyle {
  height: 50px; /* 分页区域高度 */
  display: flex; /* 使用 Flex 布局 */
  justify-content: end; /* 内容右对齐 */
  padding-right: 15px; /* 右侧内边距 */
  box-sizing: border-box; /* 盒模型设置 */
  text-align: right; /* 文字右对齐 */
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
  padding: 10px;
  box-sizing: border-box;
  /* 只在全局样式或 <style> 不加 scoped 时有效,展示的树形收缩 */
  .el-table__expand-icon {
    font-style: normal !important;
    color: #5380fd;
  }
  .el-table__expand-icon .el-icon {
    display: none !important;
  }
  .el-table__expand-icon::after {
    content: " + " !important;
    font-size: 18px;
    display: inline-block;
    line-height: 1;
    transition: all 0.2s;
  }
  .el-table__expand-icon.el-table__expand-icon--expanded::after {
    padding-left: 8px;
    padding-bottom: 3px;
    content: " | " !important;
  }
  /* 表格样式 */
  .el-table th {
    /* 表头字体 */
    .cell {
      font-size: 16px;
      font-family: "noto sanssc";
      font-weight: 400;
      padding: 0px;
    }
  }
  /* 表格内容字体 */
  .el-table {
    .cell {
      font-size: 14px;
      font-family: "noto sanssc";
      font-weight: 400;
      padding: 0 10px;
    }
    /* 隐藏排序图标 */
    .caret-wrapper {
      display: none;
    }
  }
}
</style>