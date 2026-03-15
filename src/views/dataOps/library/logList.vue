<template>
  <div class="logListCss">
    <div class="log_header">
      <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="ListFn" @reset="currentPage = 1;pageSize = PageListData()[0];ListFn()" :inline="true" />
    </div>
    <div class="log_content">
      <div style="height:65%">
        <el-table :data="tableData" style="width: 100%;height:calc(100% - 50px)" ref="tableRef" header-cell-class-name="headerTable" v-loading="loading" border highlight-current-row @rowClick="handleRowClick">
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="projectName" label="所属项目" width="258" show-overflow-tooltip />
          <el-table-column prop="tableShowName" label="表英文名" width="200" show-overflow-tooltip />
          <el-table-column prop="tableComment" label="表中文名" width="200" show-overflow-tooltip />
          <el-table-column prop="operationType" label="操作类型" width="150" show-overflow-tooltip />
          <el-table-column prop="operationDetail" label="操作详情" show-overflow-tooltip />
          <el-table-column prop="operationUser" label="操作人" width="150" align="center" />
          <el-table-column prop="operationTime" label="操作时间" width="220" align="center" />
        </el-table>
        <div class="pagination">
          <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="ListFn()" @current-change="ListFn()" :prev-text="'上一页'" :next-text="'下一页'" />
        </div>
      </div>
      <div class="logList_bottom">
        <div style="display:flex;">
          <p class="bRadius blurLine"></p>
          <p class="hTitle bml"> 数据库操作语句 </p>
        </div>
        <div style="height: calc(100% - 45px);">
          <p class="sqlContent" v-html="sqlFn(operationSql)"> </p>
          <!-- <el-input v-model="operationSql" style="margin-top:7px;height:100%" resize="none" rows="10" disabled type="textarea" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import SzycFormSearch from '@/components/element/searchForm.vue'
import { PageListData } from '@/types/dict/pagination'
import { listOperationLogApi, listTableColumnsApi } from "@/api/tool"
import { heightLight } from "@/types/rule/heightLight"
//  查询
const searchData = reactive({
  projectId: '',     //  所属项目
  EnName: '',     //  表英文名
  timeDate: [],   //  选择日期
});
const searchItems = ref([
  {
    label: '所属项目',
    prop: 'projectId',
    component: 'el-select',
    options: [],
    optionValue: "id",
    optionLabel: "projectName",
    style: { width: '200px' },
    attrs: {
      placeholder: '请选择所属项目'
    }
  },
  {
    label: '表英文名',
    prop: 'EnName',
    component: 'el-input',
    attrs: {
      placeholder: '请输入表英文名',
    }
  },
  {
    label: '操作日期',
    prop: 'timeDate',
    component: 'el-date-picker',
    style: { width: '280px' },
    attrs: {
      'start-placeholder': "开始日期",
      'end-placeholder': "结束日期",
      'value-format': 'YYYY-MM-DD',
      "type": "daterange",
      "placeholder": '请输入表英文名',
    }
  }
])



const loading = ref(false); // 表格加载状态
const currentPage = ref(1); // 当前页
const pageSize = ref(PageListData()[0]); // 每页显示条数
const total = ref(0); // 总条数
const tableData = ref([]); // 表格数据

const operationSql = ref(''); // SQL脚本内容
const rowDataList = ref([]); //  选中的行数据
const tableRef = ref(null); // 表格实例

//  转换时间函数
const timeFn = (data, type) => {
  if (data && data.length > 0) {
    if (type === 'start') {
      return data[0] + ' 00:00:00'
    } else {
      return data[1] + ' 23:59:59'
    }
  } else {
    return ''
  }
}


//  列表接口
const ListFn = () => {
  //  查询数据
  loading.value = false;
  let obj = {
    projectId: searchData.projectId,  // 项目ID
    tableShowName: searchData.EnName, //  表英文名
    startTime: timeFn(searchData.timeDate, 'start'),    //  开始时间
    endTime: timeFn(searchData.timeDate, 'end'),      //  结束时间
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }
  listOperationLogApi(obj).then((res) => {
    console.log(res, '列表数据');
    tableData.value = res.rows || [];
    loading.value = false;
    total.value = res.total || 0;
    if (res.rows.length > 0) {
      rowDataList.value = [res.rows[0]]
      operationSql.value = res.rows[0]?.operationSql || '';
      heightLight(tableRef.value, res?.rows[0])
    } else {
      rowDataList.value = []
    }
  })
}

//  所属项目
const ItemListFn = () => {
  let obj = {}
  listTableColumnsApi(obj).then((res) => {
    console.log(res, '表头数据');
    // itemList.value = res.data.projectInfo
    searchItems.value[0].options = res.data.projectInfo
  })
}

// 当前行内容
const handleRowClick = (row) => {
  // 点击行时，获取该行数据
  //   console.log(row, '点击行数据');
  rowDataList.value = [row]; // 将选中的行数据存储到 rowDataList
  operationSql.value = row.operationSql || ''; // 假设每行数据有 operationSql 字段
}




const sqlFn = (data) => {
  return data.replace(/ /g, '&nbsp;')
}


onMounted(() => {
  ListFn()
  ItemListFn()
});




</script>

<style lang="scss" scoped>
.logListCss {
  width: 100%;
  height: 100%;
  background: #fff;
  box-sizing: border-box;
  .log_header {
    height: 80px;
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
  .log_content {
    // margin-top: 10px;
    height: calc(100% - 80px);
    background-color: rgba(253, 253, 251);
    padding: 0 10px;
    box-sizing: border-box;
  }
  .logList_bottom {
    height: 35%;
    // height: calc(100% - 90px);
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }

  .blurLine {
    padding-left: 3px;
    background: rgb(83, 128, 253);
    line-height: 36px;
  }
  .sqlContent {
    margin-top: 7px;
    height: 100%;
    overflow: auto;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    white-space: pre-line;
  }
}
</style>