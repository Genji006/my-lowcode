// 页面列表
<template>
  <div class="pageListCss">
    <div class="pageList_header">
      <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="ListFn()" @reset="ListFn('重置')" :inline="true" />
    </div>
    <div style="flex:1;margin-top: 16px;height: 60%;">
      <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" @statusClick="statusClick" @btnClick="btnClick" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import SubmitForm from '@/components/element/SubmitForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import { yesOrNoFn, dataItemTypeList } from '@/types/dict/index'
import tableList from '@/components/table/tableAndPage.vue'
import { listAppProjectApi, deleteDataItemApi, updateDataItemUpdateStatusApi } from '@/api/tool.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const appList = ref([]) // 所属应用
//  查询值
const searchData = reactive({
  pageName: '',   // 页面名称
  projectName: '',   //  所属应用
  pageStatus: '', // 启用否
  pageCode: '', //  URL
})

//  查询表单
const searchItems = computed(() => [
  { label: '页面名称：', prop: 'pageName', component: 'el-input', attrs: { placeholder: '请输入' } },
  { label: '页面路径：', prop: 'pageCode', component: 'el-input', attrs: { placeholder: '请输入' } },
  { label: '所属应用', prop: 'projectName', component: 'el-select', options: appList.value, style: { width: '220px' }, attrs: { placeholder: '请选择' } },
  { label: '启用否：', prop: 'pageStatus', component: 'el-select', options: yesOrNoFn(), style: { width: '220px' }, attrs: { placeholder: '请选择' } },
])
// 点击某个单元格
const handDataClick = ({ row, column, $index }) => {
  console.log('row:', row);
  console.log('column:', column);
  console.log('$index:', $index);
}


const appLicationOptions = ref([])   //  来源应用选项



const statusClick = ({ row, column, value }) => {
  console.log(row, 'row');
  let obj = {
    pageId: row.pageId,
  }
  updateDataItemUpdateStatusApi(obj).then((res) => {
    tableRef.value.fetchData()
  })
}

const tableRef = ref(null)   //  表格
const bindData = reactive({
  pageOpen: '1',  //  是否需要分页
  checkBox: '1',    //  是否需要复选框
  light: '1',    //  是否需要高亮
  primaryKey: "pageId",
  btnList: [
    { btnType: 'add' },   //  新增
    { btnType: 'edit' },  //  编辑
    // { btnType: 'set', icon: 'Setting' },   //  设置
    { btnType: 'copy' },   //  复制
    { btnType: 'delete' }  //  删除
  ],  // 表格按钮
  apiUrl: '/business/design-page/page',  //  接口地址
  showBorder: true,  //  是否需要边框
  designTableColumns: [
    { columnLabel: '所属应用', columnName: 'projectName', columnWidth: '160' },
    { columnLabel: '页面名称', columnName: 'pageName', columnWidth: '300' },
    { columnLabel: 'URL', columnName: 'pageCode' },
    { columnLabel: '启用否', kyf: '1', columnName: 'pageStatus', align: 'center', columnWidth: '100', attrs: { 'active-value': "1", 'inactive-value': "0" } },
    { columnLabel: '操作人', columnName: 'updateBy', align: 'center', columnWidth: '120' },
    { columnLabel: '操作时间', columnName: 'updateTime', align: 'center', columnWidth: '180' },
  ],
})




//  列表接口
const ListFn = (type) => {
  tableRef.value.fetchData(type)
}




// 应用项目
const appLicationOptionsFn = () => {
  let obj = {}
  listAppProjectApi(obj).then((res) => {
    appLicationOptions.value = res.data.map((item) => {
      return {
        ...item, label: item.projectName, value: item.id
      }
    })
  })
}




//  表格按钮点击事件
const btnClick = (item, row) => {
  if (item.btnType == 'add') {
    router.push({ path: '/canvas', query: {} })
  } else if (item.btnType == 'edit') {
    router.push({
      path: '/canvas', query: {
        code: row?.pageCode,   //  页面路径
        pageId: row?.pageId,   //  页面id
        pageName: row?.pageName,  //  页面名称
        projectId: row?.projectId,   // 所属项目
        pageStatus: row?.pageStatus  //    启用否
      }
    })
  } else if (item.btnType == 'delete') {
    console.log(row, '删除数据');
    ElMessageBox.confirm(
      '是否确认删除勾选的数据源？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(async () => {
        deleteDataItemApi(row.map((item) => item.pageId)).then((res) => {
          if (res.code == 200) {
            ElMessage.success(res.msg)
            ListFn()
          }
        })
      })
  }
}





onMounted(() => {
  ListFn()
  appLicationOptionsFn()
})



</script>


<style lang="scss" scoped>
.pageListCss {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .pageList_header {
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
</style>