// 数据源
<template>
  <div class="dataSourceCss">
    <div class="ds_header">
      <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="ListFn()" @reset="currentPage = 1;pageSize = PageListData()[0];ListFn()" :inline="true" />
    </div>
    <div class="ds_content">
      <div style="display: flex;height:50px;align-items:center">
        <szycButton @click="addOrEditDptClick('add','新增数据库')"><el-icon class="bmr">
            <Plus />
          </el-icon> 新增 </szycButton>
        <szycButton @click="addOrEditDptClick('edit','编辑数据库')" :disabled="rowDataList.length == 0"><el-icon class="bmr">
            <EditPen />
          </el-icon> 编辑</szycButton>
        <szycButton type="operation" @click="handTest"><el-icon class="bmr">
            <Link />
          </el-icon> 测试连接 </szycButton>
        <szycButton type="delete" @click="handDelete" :disabled="rowDataList.length == 0"><el-icon class="bmr">
            <Delete />
          </el-icon> 删除</szycButton>
      </div>
      <div style="height:calc(100% - 50px);">
        <el-table :data="tableData" ref="tableRef" style="width: 100%;height:calc(100% - 50px)" header-cell-class-name="headerTable" v-loading="loading" border highlight-current-row @rowClick="handleRowClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="connName" label="连接名称" width="220" show-overflow-tooltip />
          <el-table-column label="数据库类型" width="150" show-overflow-tooltip>
            <template #default="scope"> {{ dbTypeFn(scope.row.dbType) }} </template>
          </el-table-column>
          <el-table-column prop="connUrl" label="数据库URL" show-overflow-tooltip />
          <el-table-column prop="username" label="用户名称" width="180" show-overflow-tooltip />
          <el-table-column prop="password" label="密码" width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="updateBy" label="操作人" width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="操作时间" width="220" show-overflow-tooltip />
        </el-table>
        <div class="pagination">
          <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" :prev-text="'上一页'" :next-text="'下一页'" />
        </div>
      </div>
    </div>

    <SzycDialog :dialogVisible="showDialog" width="40%" @close="showDialog = false" :title="tableTitle" :destroy-on-close="true" :alignCenter="true">
      <template #uname>
        <SubmitForm v-model="formData" :items="formItems" :rules="rules" :inline="false" @submit="handleSubmit" @cancel="showDialog = false" />
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import SubmitForm from '@/components/element/SubmitForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import { PageListData } from '@/types/dict/pagination'
import { listDataSourceApi, addDataSourceApi, updateDataSourceApi, deleteDataSourceApi, testConnectApi } from '@/api/tool.js'
import { dictStore } from '@/store/dict'
import { heightLight } from "@/types/rule/heightLight"

const dictList = dictStore()
// console.log(dictList.dict['db_type'], '字典数据');

//  查询值
const searchData = reactive({
  connName: '',
  dbType: ''
})
//  查询表单
const searchItems = ref([
  { label: '连接名称', prop: 'connName', component: 'el-input', attrs: { placeholder: '请输入名称' }, style: { width: '200px' } },
  { label: '数据库类型', prop: 'dbType', component: 'el-select', options: dictList.dict["db_type"], attrs: { placeholder: '请选择类型' }, style: { width: '200px' } }
])

const formData = reactive({
  connName: '',   //  连接名
  dbType: '',     //  数据库类型
  connUrl: '',    //  数据库URL
  username: '',   //  用户名
  password: ''    //  密码
})

// 新增编辑表单
const formItems = ref([
  { label: '连接名：', prop: 'connName', component: 'el-input', attrs: { placeholder: '请输入连接名' } },
  {
    label: '数据库类型：', prop: 'dbType', component: 'el-select', options: dictList.dict["db_type"], attrs: { placeholder: '请选择数据库类型' }
  },
  { label: '数据库URL：', prop: 'connUrl', component: 'el-input', attrs: { placeholder: '请输入数据库URL' } },
  { label: '用户名：', prop: 'username', component: 'el-input', attrs: { placeholder: '请输入用户名' } },
  { label: '密码：', prop: 'password', component: 'el-input', attrs: { placeholder: '请输入密码' } },
   { label: '驱动名称：', prop: 'driverClassName', component: 'el-input', attrs: { placeholder: '请输入驱动名称' } },
  
])

// 表单校验规则
const rules = {
  connName: [{ required: true, message: '请输入连接名', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  connUrl: [{ required: true, message: '请输入数据库URL', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}


const tableRef = ref(null) // 表格实例

const rowDataList = ref([]) // 选中的行数据
const tableData = ref([]) // 表格数据
const loading = ref(false) // 加载状态
const tableTitle = ref('') // 表格标题
const tableType = ref('') // 表格类型(新增/编辑)
const showDialog = ref(false) // 弹窗状态


const currentPage = ref(1) // 当前页码
const pageSize = ref(PageListData()[0]) // 每页显示条数
const total = ref(0) // 总数据条数

//  列表接口
const ListFn = () => {
  loading.value = true
  let obj = {
    connName: searchData.connName,
    dbType: searchData.dbType,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }
  console.log(obj, '查询参数');

  listDataSourceApi(obj).then(res => {
    console.log(res, '数据源列表');
    tableData.value = res.rows
    total.value = res.total
    if (res.rows.length > 0) {
      rowDataList.value = [res.rows[0]]
      heightLight(tableRef.value, res?.rows[0])
    } else {
      rowDataList.value = []
    }
    loading.value = false
  })
}

const handleRowClick = (row) => {
  console.log(row, '行数据');
  rowDataList.value = [row]
}



// 新增/编辑
const addOrEditDptClick = (type, title) => {
  tableTitle.value = title
  tableType.value = type
  showDialog.value = true
  if (type == 'add') {
    formData.connName = ''  //  连接名
    formData.dbType = ''    //  数据库类型
    formData.connUrl = ''   //  数据库URL
    formData.username = ''  //  用户名
    formData.password = ''  //  密码
     formData.driverClassName = ''
  } else {
    formData.connName = rowDataList.value[0].connName  //  连接名
    formData.dbType = rowDataList.value[0].dbType      //  数据库类型
    formData.connUrl = rowDataList.value[0].connUrl    //  数据库URL
    formData.username = rowDataList.value[0].username  //  用户名
    formData.password = rowDataList.value[0].password  //  密码
    formData.driverClassName = rowDataList.value[0].driverClassName
  }
}

//  提交数据
const handleSubmit = (data) => {
  //   console.log(data, 'data');
  //   console.log(123);
  addDataSource(tableType.value)
}

// 数据类型
const dbTypeFn = (data) => {
  return dictList.dict['db_type'].find((item) => item.dictValue == data)?.dictLabel
}


//  新增数据源
const addDataSource = (type) => {
  //   let obj = {
  //     connName: formData.connName,  //  连接名
  //     dbType: formData.dbType,      //  数据库类型
  //     connUrl: formData.connUrl,    //  数据库URL
  //     username: formData.username,  //  用户名
  //     password: formData.password,  //  密码
  //   }
  if (type == 'add') {
    addDataSourceApi({ ...formData }).then((res) => {
      if (res.code == 200) {
        ElMessage.success(res.msg)
        ListFn()
        showDialog.value = false
      }
    })
  } else {
    updateDataSourceApi({ id: rowDataList.value[0].id, ...formData }).then((res) => {
      if (res.code == 200) {
        ElMessage.success(res.msg)
        ListFn()
        showDialog.value = false
      }
    })
  }
}




//  测试连接
const handTest = () => {
  if (rowDataList.value.length > 0) {
    rowDataList.value[0]
    testConnectApi({ id: rowDataList.value[0].id }).then(res => {
      if (res.code == 200) {
        ElMessage.success(`${rowDataList.value[0].connName}：` + res.msg)
      }
    })
  } else {
    ElMessage.warning('请先选择数据源!')
  }
}

// 批量删除数据
const handDelete = () => {
  let arr = tableRef.value.getSelectionRows() || []
  if (arr.length > 0) {
    ElMessageBox.confirm(
      '是否确认删除勾选的数据源？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
      .then(async () => {
        let list = []
        for (let i = 0; i < arr.length; i++) {
          list.push(arr[i].id)
        }
        deleteDataSourceApi({ idList: list }).then((res) => {
          if (res.code == 200) {
            ElMessage.success(res.msg)
            ListFn()
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '删除取消',
        })
      })

  } else {
    ElMessage.warning('请先勾选需要删除的数据源!')
  }
}








onMounted(() => {
  ListFn()
  //   dictApi().then(res => {
  //     console.log(res, '字典数据');
  //     searchItems.value[1].options = res.data || []
  //     formItems.value[1].options = res.data || []
  //   })
})



</script>


<style lang="scss" scoped>
.dataSourceCss {
  width: 100%;
  height: 100%;
  background-color: rgba(231, 231, 233);
  .ds_header {
    height: 80px;
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
  .ds_content {
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