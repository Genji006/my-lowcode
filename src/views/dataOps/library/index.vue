<template>
  <div class="container_home">
    <div class="containerTop">
      <div class="containerTopLeft">
        <el-input v-model="outside" @keydown.enter="treeListFn()" placeholder="请输入查询表名称" clearable />
        <div class="Title">
          <div class="title_icon" @click="handleAddTable">
            <el-icon class="bmr" size="18">
              <CirclePlus />
            </el-icon>
            <span>新建表</span>
          </div>
          <div class="title_icon" style="margin-left: 20px;" @click="openDialog">
            <el-icon class="bmr" size="18">
              <FolderOpened />
            </el-icon>
            <span> 导入 </span>
          </div>
        </div>
        <div class="Content">
          <el-tree :data="treeData" :default-expanded-keys="[]" :props="{ label: 'projectName', children: 'children' }" node-key="id" ref="treeRef" :filter-node-method="filterNode" style="overflow: auto;font-size: 15px;font-family: bold;">
            <template #default="{ node, data }">
              <img src="@/assets/ItemImg/bloak.svg" alt="" v-if="data.children" style="margin-right: 5px;" />
              <el-tooltip :disabled="!isTextOverflow(node.label + ((data.nameShow!='[项]' && data.tableComment) ?`（${data.tableComment || ''}）`:'') + ' ')" :content="node.label + ((data.nameShow!='[项]' && data.tableComment) ?`（${data.tableComment || ''}）`:'')" placement="top" :show-after="500" :hide-after="0">
                <p @click="handDbNode(data)" style="width:100%;" class="nodeP">{{ node.label + ((data.nameShow!='[项]' && data.tableComment) ?`（${data.tableComment || ''}）`:'')}}</p>
              </el-tooltip>
            </template>
          </el-tree>
          <!-- <a-tree :show-line="true" :show-icon="true" :default-expanded-keys="[]" style="width:100%;height:100%;" :tree-data="treeData" @select="onSelect">
            <template #title="{ dataRef }">
              <template v-if="dataRef.nameShow === '[项]'">
                <span> {{ dataRef.nameShow + dataRef.projectName}} </span>
              </template>
              <template v-if="dataRef.nameShow === '[表]'">
                <span @dblclick="onDoubleClick(dataRef)">{{`${dataRef.nameShow} ${dataRef.projectName}` }}</span>
              </template>
            </template>
          </a-tree> -->
        </div>
      </div>
      <div class="containerTopRight">
        <div class="right_header">
          <div class="rightHead">
            <span :class="tabPosition == 'first' ? 'backGroundBlue' : ''" @click="tabPosition='first'">
              库表结构管理 </span>
            <span :class="tabPosition == 'second' ? 'backGroundBlue' : ''" @click="tabPosition='second'">
              建表用脚本 </span>
          </div>
          <!-- <el-radio-group v-model="tabPosition" style="margin-bottom: 10px">
            <el-radio-button value="first"> 表结构管理 </el-radio-button>
            <el-radio-button value="second"> 建表用脚本 </el-radio-button>
          </el-radio-group> -->
          <div>
            <div style="display:flex;" v-show="tabPosition == 'first'">
              <SubmitForm ref="submitFormRef" v-model="formData" :items="formItems" :rules="rules" :showAction="false" style="width:45%" />
              <SubmitForm v-model="formTextarea" :items="formItemTextarea" :showAction="false" style="width:55%" />
            </div>
            <div v-show="tabPosition == 'second'" style="margin-top: 20px;" class="library_script">
              <!-- <p v-html="SqlScript"></p> -->
              <el-input v-model="SqlScript" :rows="7" disabled resize="none" type="textarea" />
            </div>
          </div>
        </div>
        <div class="right_footer">
          <div style="display:flex;height:45px;justify-content:space-between;">
            <div style="display:flex;">
              <szycButton @click="add_field"> <el-icon class="bmr">
                  <Plus />
                </el-icon> 新增字段 </szycButton>
              <szycButton @click="downFile"> <el-icon class="bmr">
                  <MostlyCloudy />
                </el-icon> 下载模板 </szycButton>
              <el-upload ref="upload" v-if="tableID" v-model:file-list="fileList" style="padding:0 12px" action="/api/data-ops/schema-manager/datasource/importTemplate" :data="{tableId:tableID}" :headers="headers" multiple :on-preview="handlePreview" :show-file-list="false" :on-success="handleUploadSuccess" :on-remove="handleRemove">
                <szycButton> <el-icon class="bmr">
                    <Upload />
                  </el-icon> 批量导入 </szycButton>
              </el-upload>
              <szycButton v-else @click="ElMessage.warning('请先选择需要导入的表!')"> <el-icon class="bmr">
                  <Upload />
                </el-icon> 批量导入 </szycButton>
              <szycButton @click="importTableFile"> <el-icon class="bmr">
                  <Download />
                </el-icon> 批量导出 </szycButton>
              <szycButton @click="tableSyncFile"> <el-icon class="bmr">
                  <Refresh />
                </el-icon> 表同步 </szycButton>
              <el-tooltip effect="dark" content="当前删除操作只能是对未入表的字段操作！" :disabled="tableFielID?false:true" placement="top">
                <szycButton type="delete" @click="handDelete" :disabled="tableFielID?true:false" :style="`opacity:${tableFielID?0.5:1}`"> <el-icon class="bmr">
                    <Delete />
                  </el-icon> 删除 </szycButton>
              </el-tooltip>

            </div>
            <div style="display:flex;">
              <szycButton @click="tableSave('保存')"> 保存 </szycButton>
              <szycButton @click="tableSave('应用')"> 保存并应用 </szycButton>
            </div>
          </div>
          <!-- highlight-current-row -->
          <!-- :row-class-name="tableRowClassName"  -->
          <el-table :data="tableData" ref="tableRef" style="height:calc(100% - 45px)" row-key="keyID" highlight-current-row header-cell-class-name="headerTable" v-loading="fieldLoading" border @rowClick="handleRowClick">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="" label="字段英文名" show-overflow-tooltip>
              <template #default="scope">
                {{ fnData(scope.row) }}
                <el-input v-model="scope.row.fieldName" placeholder="请输入" v-if="scope.$index === showIndex && scope.row.applyState != '1'" />
                <span v-else> {{ scope.row.fieldName }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="" label="字段中文名" show-overflow-tooltip>
              <template #default="scope">
                <el-input v-model="scope.row.fieldComment" placeholder="请输入" v-if="scope.$index === showIndex" />
                <span v-else> {{ scope.row.fieldComment }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="" label="字段类型" width="150" align="center">
              <template #default="scope">
                <el-select v-model="scope.row.fieldType" clearable placeholder="请选择" style="width:100px" v-if="scope.$index === showIndex">
                  <el-option v-for="item in fieldTypeFn" :key="item.dictValue" :label="item.dictValue" :value="item.dictValue" />
                </el-select>
                <span v-else> {{ scope.row.fieldType }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="" label="长度" width="100" align="center">
              <template #default="scope">
                <el-input v-model="scope.row.fieldLength" placeholder="请输入" @input="scope.row.fieldLength = scope.row.fieldLength.replace(/\D/g, '')" v-if="scope.$index === showIndex" />
                <span v-else> {{ scope.row.fieldLength }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="" label="主键" width="70" align="center">
              <template #default="scope">
                <!-- {{ scope.row.primaryPk }} -->
                <!-- <span v-if="scope.row.position"> {{ scope.row.position }} </span> -->
                <!-- <div :style="`width:100%;height:100%;background:${scope.row.primaryPk == '0'?'':'#000'}`" @click="handKey(scope.row)">{{ scope.row.position }}</div> -->
                <div :style="`display: flex;line-height:30px;justify-content:space-between;`">
                  <el-checkbox v-model="scope.row.primaryPk" true-value="1" false-value="0" @change="(e)=>handKey(e,scope.$index)" /> <span v-if="scope.row.position"> {{ scope.row.position }} </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="" label="非空" width="70" align="center">
              <template #default="scope">
                <el-checkbox v-model="scope.row.fieldNotNull" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column prop="applyState" label="应用否" width="100" align="center" :formatter="(e) => yesOrNoFn(e.applyState, 'formatter')" />
            <!-- <template #default="scope">
                <el-switch v-model="scope.row.state" active-value="1" inactive-value="0" />
              </template> !-->
            <el-table-column prop="" label="注释说明" width="180">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="请输入" v-if="scope.$index === showIndex" />
                <span v-else> {{ scope.row.remark }} </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <SzycDialog :dialogVisible="showDialog" width="1280px" @close="showDialog = false" :title="`导入数据库表`" :destroy-on-close="true" :alignCenter="true">
      <template #uname>
        <div style="display:flex;">
          <p class="bRadius blurLine"></p>
          <p class="hTitle bml"> 基础信息 </p>
        </div>
        <SubmitForm v-model="dialogForm" :items="dialogFormItems" :rules="dialogRule" :showAction="false" />
        <div style="display:flex;">
          <p class="bRadius blurLine"></p>
          <p class="hTitle bml"> 导入表数据 </p>
        </div>
        <SzycFormSearch v-model="dialogSearch" :inline="true" labelWidth="" :items="dialogItem" @searchVal="allTableSourceFn()" @reset="currentPage = 1;pageSize = PageListData()[0];allTableSourceFn()"></SzycFormSearch>
        <div style="height: 500px;">
          <el-table :data="sourceDataList" style="height: calc(100% - 45px);width:100%" ref="dialogTableRef" row-key="tableName" header-cell-class-name="headerTable" v-loading="dilogLoading" border>
            <el-table-column type="selection" width="50" align="center" :reserve-selection="true" />
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="tableName" label="表英文名" />
            <el-table-column prop="tableShowName" label="表中文名" />
          </el-table>
          <div class="pagination" style="height: 45px;">
            <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="allTableSourceFn()" @current-change="allTableSourceFn()" :prev-text="'上一页'" :next-text="'下一页'" />
          </div>
        </div>
        <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
          <SzycCancel @click="showDialog = false"> 取消 </SzycCancel>
          <szycButton style="margin-left: 50px;" @click="handAddTable"> 确定 </szycButton>
        </div>
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  reactive,
  nextTick
} from 'vue'
import {
  listAllTablesApi,
  listTableColumnsApi,
  listDataSourceApi,
  listTableColumnsDetailApi,
  importTableApi,
  saveTableStructureApi,
  saveAndApplyTableStructureApi,
  listTableStructureApi,
  downloadTemplateApi,
  tableSyncApi,
  createTableScriptApi
} from "@/api/tool"
// import { ElMessage, Modal } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import SubmitForm from '@/components/element/SubmitForm.vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import {
  PageListData
} from '@/types/dict/pagination'
import { yesOrNoFn } from '@/types/dict/index'

import Sortable from 'sortablejs'

//  添加token
const headers = {
  Authorization: `Bearer ${sessionStorage.getItem("token")}`
}

const fnData = (data) => {
  console.log(data, 'data');

}
const outside = ref("") //   查询表名称

const treeData = ref([]) //   应用信息树形结构
const dialogTableRef = ref(null) //  导入表数据弹窗的表格ref

//  字段类型
const fieldTypeFn = ref([])

const tableRef = ref(null)

const tabPosition = ref('first') //   控制表结构管理和建表用脚本的显示

const currentPage = ref(1) // 每页
const pageSize = ref(PageListData()[0])
const total = ref(0)

const applyState = ref('')   //  判断是否可以修改


// const tableRowClassName = ({ row, rowIndex }) => {
//   row.index = rowIndex
// }


//  主键
const handKey = (e, index) => {
  // console.log(e,'e');
  // console.log(tableData.value[index],"tableData.value[index]");
  if (e === '1') {
    // 只有当原来不是主键，才赋新 position
    if (!tableData.value[index].primaryPk || tableData.value[index].position == undefined || tableData.value[index].position == 0) {
      const arr = tableData.value.filter(row => row.primaryPk === '1' && row.position != undefined)
      const maxPos = arr.length > 0 ? Math.max(...arr.map(row => row.position || 0)) : 0
      tableData.value[index].position = maxPos + 1
    }
    // 如果原来就有 position，保持不变
  } else {
    // 取消主键，清空 position
    tableData.value[index].position = undefined
    // 重新排序所有主键的 position，保持连续
    const pkRows = tableData.value
      .map((row, i) => ({ ...row, _idx: i }))
      .filter(row => row.primaryPk === '1')
      .sort((a, b) => (a.position || 0) - (b.position || 0))
    pkRows.forEach((row, i) => {
      tableData.value[row._idx].position = i + 1
    })
  }
}

const nodeP = document.querySelectorAll('.nodeP');
console.log(nodeP, 'nodeP');

// 检测文本是否溢出
const isTextOverflow = (text) => {
  if (!text) return false;
  // 创建一个临时的 span 元素来测量文本宽度
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  span.style.fontSize = '15px';
  span.style.fontWeight = 'bold';
  span.style.fontFamily = 'Arial, sans-serif';
  span.textContent = text;
  document.body.appendChild(span);

  const textWidth = span.offsetWidth;
  document.body.removeChild(span);

  // 根据实际容器宽度调整这个值
  const containerWidth = 180; // 树节点的实际宽度

  return textWidth > containerWidth;
}


// {
//   fieldName: 'app_getInfo', // 字段英文名
//   fieldComment: '用户信息表', //  字段中文名
//   fieldType: 'String', //  字段类型
//   fieldLength: '50', //  字段长度
//   primaryPk: '1', //  主键 0否 1是
//   fieldNotNull: '0', //  字段非空 0否 1是
//   state: '1', //  字段启用否  0 否  1是
//   remark: '', // 字段说明
// }

const tableData = ref([]) // 表字段列表
const fieldLoading = ref(false) //  字段列表加载状态

const submitFormRef = ref(null) //  提交表单的ref
//  表结构管理
const formData = reactive({
  belongToItem: "", //  所属项目
  EnglishName: "", //  表英文名
  ChineseName: "", //  表中文名
})




const formItems = ref([{
  label: "所属项目：",
  prop: "belongToItem",
  component: "el-select",
  attrs: {
    placeholder: "请选择所属项目",
    onChange: (val) => {
      // 这里写你的逻辑
      console.log('所属项目 change:', val)
      // 例如：根据项目切换刷新表格
      // treeListFn()
      fieldListFn(val)
    }
  },
  optionValue: "id",
  optionLabel: "projectName",
  options: []
},
{
  label: "表英文名：",
  prop: "EnglishName",
  component: "el-input",
  attrs: {
    placeholder: "请输入表英文名"
  },
},
{
  label: "表中文名：",
  prop: "ChineseName",
  component: "el-input",
  attrs: {
    placeholder: "请输入表中文名"
  },
}
])
const rules = reactive({
  belongToItem: [{
    required: true,
    message: '请选择所属项目',
    trigger: 'change'
  }],
  EnglishName: [{
    required: true,
    message: '请输入表英文名',
    trigger: 'blur'
  }],
  ChineseName: [{
    required: true,
    message: '请输入表中文名',
    trigger: 'blur'
  }]
})

//  备注
const formTextarea = reactive({
  remark: "", //  备注
})
const formItemTextarea = ref([{
  label: "备注：",
  prop: "remark",
  component: "el-input",
  attrs: {
    type: "textarea",
    rows: 6,
    resize: "none",
  }
}])

const SqlScript = ref("") //  建表用脚本的值

const showDialog = ref(false) //  新建表弹窗的显示状态
const sourceDataList = ref([]) //  所有表
const dilogLoading = ref(false)  //  新建表弹窗的加载状态

//  弹窗表单
const dialogForm = reactive({
  belongToItem: "", //  所属项目
})

const dialogFormItems = ref([{
  label: "所属项目：",
  prop: "belongToItem",
  component: "el-select",
  attrs: {
    placeholder: "请选择所属项目",
    clearable: true, // 让输入框可清除
    onChange: (val, item) => {
      // 这里写你的逻辑
      console.log('选中值:', val, item)
      dialogTableRef.value?.clearSelection()
      allTableSourceFn()
    }
  },
  optionValue: "id",
  optionLabel: "projectName",
  style: {
    width: '50%'
  },
  options: []
}])
const dialogRule = reactive({
  belongToItem: [{
    required: true,
    message: '请选择所属项目',
    trigger: 'change'
  }],
})


const tableDataCopy = ref([])   //  用来判断是否修改过表格的数据

//  排序
const sortFn = (data) => {
  return data.map((item, index) => {
    return {
      ...item,
      sortOrder: index
    }
  }).sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })
}



//  弹窗查询
const dialogSearch = reactive({
  sourceDataId: "", //  所属数据源
  belongToItem: "", //  所属项目
  tableName: "", //  表名
})

const dialogItem = ref([{
  label: "所属数据源：",
  prop: "sourceDataId",
  component: "el-select",
  optionLabel: 'connName',
  optionValue: 'id',
  style: {
    width: '200px'
  },
  attrs: {
    placeholder: "请选择所属数据源",
  },
  options: []
},
// {
//   label: "所属项目：",
//   prop: "belongToItem",
//   component: "el-select",
//   attrs: {
//     placeholder: "请选择所属项目",
//   },
//   style: {
//     width: '200px'
//   },
//   optionValue: "id",
//   optionLabel: "projectName",
//   options: []
// },
{
  label: '表名称：',
  prop: 'tableName',
  component: 'el-input',
  attrs: {
    placeholder: '请输入表中文或英文名'
  }
}])


const showIndex = ref(-1)
const tableID = ref("") //  当前表的ID
const tableNameFile = ref("") //  当前表的英文名

const tableFielID = ref("")   //  表格当前行的ID


// 所属数据源
const listSourceFn = () => {
  let obj = {
    pageSize: 9999,
  }
  listDataSourceApi(obj).then(res => {
    // console.log(res, 'res');
    dialogItem.value[0].options = res.rows || [] // 所属数据源
  })
}

//  只能删除新增的字段（没有id的行）
const handDelete = () => {
  if (!tableFielID.value) {
    tableData.value = tableData.value.filter((f, i) => i !== showIndex.value)
  } else {
    ElMessage.error('只能对未入表的字段进行删除操作！')
  }
}

//  忽略大小写判断
const isEqualIgnoreCase = (a, b) => {
  return a.toLowerCase() === b.toLowerCase()
}

//  左边树接口
const treeListFn = (type, success, EnName) => {
  let obj = {
    tableName: outside.value, // 表名称。模糊查询。英文名和中文名称。
  }
  listTableColumnsApi(obj).then(res => {
    if (res.code == 200) {
      console.log(res, 'data');
      let curAppInfoRows = res.data.projectInfo //  项目信息表
      let curTableRows = res.data.projectTable || [] // 	表信息表
      console.log(curAppInfoRows, '项目信息表');
      console.log(curTableRows, '表信息表');

      // 创建一个以ID为键的对象，用于快速查找
      let tableMap = {};
      curTableRows.forEach(table => {
        tableMap[table.id] = table;
      });
      // 合并成树形结构
      treeData.value = curAppInfoRows.map(app => {
        return {
          ...app,
          icon: "",
          nameShow: "[项]",
          children: curTableRows.filter(table => table.projectId === app.id).map((e) => {
            return {
              ...e,
              icon: "",
              nameShow: "[表]",
              projectName: e.tableShowName
            }
          })
        };
      });
      showIndex.value = -1 //  当前选中行的索引
      console.log(treeData.value, 'treeData.value');
      listSourceFn()
      formItems.value[0].options = curAppInfoRows || [] // 所属项目
      dialogFormItems.value[0].options = curAppInfoRows || [] // 所属项目
      // dialogItem.value[1].options = curAppInfoRows || [] // 所属数据源
      // console.log(treeData.value, "treeData.value");
      // treeData.value = res.data
      if (type == '保存' && success == 200) {
        // console.log(EnName.EnName, "EnName.EnName");
        // console.log(EnName.projectID, "EnName.projectID");
        // console.log(curTableRows.find((f) => f.tableShowName === EnName.EnName && f.projectId === EnName.projectID), "curTableRows.find((f) => f.tableShowName === EnName.EnName && f.projectId === EnName.projectID)");
        tableID.value = curTableRows.find((f) => isEqualIgnoreCase(f.tableShowName, EnName.EnName) && f.projectId === EnName.projectID)?.id || "" //  当前表的ID
        tableFnTree(tableID.value) // 刷新表字段
      }
    }
  })
}


//  获取所有字段类型
const fieldListFn = (id) => {
  let obj = {
    projectId: id
  }
  listTableStructureApi(obj).then((res) => {
    console.log(res, '获取所有字段类型');
    fieldTypeFn.value = res.data
  })
}


// 新建表
const handleAddTable = () => {
  submitFormRef.value?.resetFields() // 重置表单
  formData.belongToItem = formItems.value[0].options[0].id //  默认所属项目
  formTextarea.remark = "" // 表备注
  SqlScript.value = "" //  建表用脚本
  tableData.value = []  // 字段数组
  tableID.value = "" //  当前表的ID
  showIndex.value = -1 //  当前选中行的索引
  applyState.value = "0"
  formItems.value[1].attrs.disabled = applyState.value == '1' ? true : false
  fieldListFn(formData.belongToItem)
}



// 所有数据源表接口
const allTableSourceFn = () => {
  dilogLoading.value = true
  let obj = {
    targetProjectId: dialogForm.belongToItem, //  所属项目的id
    datasourceId: dialogSearch.sourceDataId, //  导入表数据/所属数据源的id
    projectId: dialogSearch.belongToItem, //  导入表数据/所属项目的id
    tableName: dialogSearch.tableName,  //表名称。模糊查询。
    pageNum: currentPage.value, // 页码
    pageSize: pageSize.value, //  每页条数
  }
  listAllTablesApi(obj).then((res) => {
    console.log(res, 'res')
    sourceDataList.value = res.rows || []
    total.value = res.total
    dilogLoading.value = false
  })
}


// 点击行数据
const handleRowClick = (row, column, e) => {
  console.log(row, 'row');
  tableFielID.value = row?.id || ''
  console.log(tableData.value)
  console.log(row.keyID, 'row.keyID')
  showIndex.value = tableData.value.findIndex(item => item.keyID === row.keyID)
}


//  下载模板
const downFile = () => {
  let obj = {
    id: tableID.value
  }
  if (!tableID.value) {
    ElMessage.warning('请先选择表！')
  } else {
    downloadTemplateApi(obj, '/schema-manager/datasource/downTemplate', { name: tableNameFile.value })
  }
}

//  批量导出
const importTableFile = () => {
  let obj = {
    id: tableID.value
  }
  if (!tableID.value) {
    ElMessage.warning('请先选择表！')
  } else {
    downloadTemplateApi(obj, '/schema-manager/datasource/exportTable', { name: tableNameFile.value, type: '.xlsx' })
  }
}


//  表同步
const tableSyncFile = () => {
  let obj = {
    id: tableID.value
  }
  if (!tableID.value) {
    ElMessage.warning('请先选择表！')
  } else {
    tableSyncApi(obj).then((res) => {
      console.log(res, 'res');
      if (res.code == 200) {
        ElMessage.success('同步成功！')
      } else {
        ElMessage.error(res.msg)
      }
      tableFnTree(tableID.value)
    })
  }
}

// 导入成功
const handleUploadSuccess = (response) => {
  // console.log(response, "response");
  if (response.code == 200) {
    ElMessage.success(response.msg)
  } else {
    ElMessage.error(response.msg)
  }
  tableFnTree(tableID.value)
};



//  点击导入表
const openDialog = () => {
  showDialog.value = true
  dialogForm.belongToItem = '' // 所属项目
  dialogSearch.sourceDataId = dialogItem.value[0].options[0]?.id || ''
  currentPage.value = 1
  pageSize.value = PageListData()[0]
  total.value = 0
  allTableSourceFn()
}



// 随机生成指定长度的字符串（包含字母和数字）
function randomString(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


//  获取字段的表格接口
const tableFnTree = (id) => {
  fieldLoading.value = true
  let obj = {
    tableId: id
  }
  listTableColumnsDetailApi(obj).then(res => {
    tableData.value = res.data.sort((a, b) => a.sortOrder - b.sortOrder)
    //  生成一个随机唯一值
    for (let i = 0; i < tableData.value.length; i++) {
      tableData.value[i]['keyID'] = randomString(12)
    }
    tableDataCopy.value = JSON.parse(JSON.stringify(tableData.value))   //  复制处理一份数据，用来对比是否修改过
    fieldLoading.value = false
  })
}

//  建表用脚本
const createScriptFn = (tableId) => {
  let obj = {
    id: tableId
  }
  createTableScriptApi(obj).then((res) => {
    console.log(res, 'res');
    SqlScript.value = res.data.ddl
  })
}

//  双节节点
const handDbNode = (rowData) => {
  if (rowData.nameShow === '[表]') {
    // console.log(rowData, "dataRow")
    // 判断是否
    // console.log(tableDataCopy.value, 'tableDataCopy.value');
    // console.log(tableData.value, 'tableData.value');
    // console.log(JSON.stringify(tableDataCopy.value), 'tableDataCopy.value');
    // console.log(JSON.stringify(tableData.value), 'tableData.value');
    if (JSON.stringify(tableDataCopy.value) != JSON.stringify(tableData.value)) {
      ElMessageBox.confirm(
        '当前字段数据未保存，是否确认切换?',
        '警告',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          applyState.value = rowData?.applyState || ''
          formItems.value[1].attrs.disabled = applyState.value == '1' ? true : false    //  根据字段判断是否当前form 表单禁用
          tableID.value = rowData.id //  当前表的ID
          tableNameFile.value = JSON.parse(JSON.stringify(rowData.tableShowName || ""))
          formData.belongToItem = rowData.projectId || "" //  所属项目
          formData.EnglishName = rowData.tableShowName || "" //  表英文名
          formData.ChineseName = rowData.tableComment || "" //  表中文名
          formTextarea.remark = rowData.remark || "" // 表备注
          // SqlScript.value = rowData.SqlScript || "" //  建表用脚本
          showIndex.value = -1 //  当前选中行的索引
          tableFnTree(rowData.id)
          fieldListFn(rowData.projectId)
          createScriptFn(rowData.id)
        })
    } else {
      applyState.value = rowData?.applyState || ''
      formItems.value[1].attrs.disabled = applyState.value == '1' ? true : false    //  根据字段判断是否当前form 表单禁用
      tableID.value = rowData.id //  当前表的ID
      tableNameFile.value = JSON.parse(JSON.stringify(rowData.tableShowName || ""))
      formData.belongToItem = rowData.projectId || "" //  所属项目
      formData.EnglishName = rowData.tableShowName || "" //  表英文名
      formData.ChineseName = rowData.tableComment || "" //  表中文名
      formTextarea.remark = rowData.remark || "" // 表备注
      // SqlScript.value = rowData.SqlScript || "" //  建表用脚本
      showIndex.value = -1 //  当前选中行的索引
      tableFnTree(rowData.id)
      fieldListFn(rowData.projectId)
      createScriptFn(rowData.id)
    }
  }
}

// 添加字段
const add_field = () => {
  tableData.value.push({
    keyID: randomString(12),  //  随机生成的keyID 作为唯一标识
    fieldName: '', // 字段英文名
    fieldComment: '', //  字段中文名
    fieldType: '', //  字段类型
    fieldLength: '', //  字段长度
    primaryPk: '', //  主键 0否 1是
    fieldNotNull: '', //  字段非空 0否 1是
    // state: '', //  字段启用否  0 否  1是
    applyState: '0',  //  字段启用否  0 否  1是
    remark: '', // 字段说明
  })
}

/**
 *@retutns boolean: true：不存在； false：存在重复
 */
function isRepeat(arr, key) {
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (obj[arr[i][key]]) {
      return false;    // 存在
    } else {
      obj[arr[i][key]] = arr[i];
    }
  }
  return true;
}

//  点击保存或应用
const tableSave = (type) => {
  for (let i = 0, len = tableData.value.length; i < len; i++) {
    tableData.value[i].sortOrder = i
  }
  let obj = {
    id: tableID.value,  //  表ID
    projectId: formData.belongToItem, //  所属项目ID
    tableShowName: formData.EnglishName, //  表英文名
    tableComment: formData.ChineseName, //  表中文名
    fieldEntityList: tableData.value, //  字段列表
    remark: formTextarea.remark, //  表备注
  }
  if (type === '保存') {
    // console.log(tableData.value, '--')
    // if (obj.fieldEntityList)
    if (!isRepeat(tableData.value, 'fieldName')) {
      ElMessage.error('字段英文名不能重复！')
      return
    }
    saveTableStructureApi(obj).then(res => {
      console.log(res, 'res');
      if (res.code == 200) {
        ElMessage.success('保存成功！')
      }
      treeListFn('保存', res.code, { EnName: formData.EnglishName, projectID: formData.belongToItem }) // 刷新左侧树
      createScriptFn(tableID.value)  //  建表语句
    })
  } else {
    saveAndApplyTableStructureApi(obj).then((res) => {
      console.log(res, '应用');
      if (res.code == 200) {
        ElMessage.success('应用成功！')
        applyState.value = res.data?.applyState || ''
        formItems.value[1].attrs.disabled = applyState.value == '1' ? true : false    //  根据字段判断是否当前form 表单禁用
        treeListFn('保存', 200, { EnName: formData.EnglishName, projectID: formData.belongToItem }) // 刷新左侧树
        createScriptFn(tableID.value)   //  建表语句
      } else {
        if (res.data.tableId) {
          applyState.value = res.data?.applyState || ''
          formItems.value[1].attrs.disabled = applyState.value == '1' ? true : false    //  根据字段判断是否当前form 表单禁用
          treeListFn('保存', 200, { EnName: formData.EnglishName, projectID: formData.belongToItem }) // 刷新左侧树
          createScriptFn(tableID.value)   //  建表语句
        }
      }
      // if (res.code == 500) {
      //   tableData.value = res.data.fieldEntityList.sort((a, b) => a.sortOrder - b.sortOrder)
      //   //  生成一个随机唯一值
      //   for (let i = 0; i < tableData.value.length; i++) {
      //     tableData.value[i]['keyID'] = randomString(12)
      //   }
      // }
    })
  }
}

const handAddTable = () => {
  // console.log(dialogTableRef.value.getSelectionRows(), '勾选的项');
  let arr = dialogTableRef.value?.getSelectionRows() || []
  let tableNameList = []
  for (let i = 0; i < arr.length; i++) {
    tableNameList.push(arr[i].tableName)
  }
  if (arr.length > 0) {
    let obj = {
      targetProjectId: dialogForm.belongToItem,   //  	导入的目标项目id
      datasourceId: dialogSearch.sourceDataId,   //  		选择的数据源id
      selectedTableNames: tableNameList,   //  	选择的表名列表（英文名）
    }
    importTableApi(obj).then((res) => {
      if (res.code == 200) {
        ElMessage.success('导入成功！')
        showDialog.value = false
        treeListFn()
      }
    })
  } else {
    ElMessage.info('请先勾选需要导入的表！')
  }
}



onMounted(() => {
  treeListFn()
  nextTick(() => {
    const tbody = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
    if (tbody) {
      Sortable.create(tbody, {
        // handle: '.drag-handle',
        animation: 200,
        onEnd({ newIndex, oldIndex }) {
          if (newIndex == oldIndex) return;
          tableData.value.splice(
            newIndex,
            0,
            tableData.value.splice(oldIndex, 1)[0]
          );
          const newArray = tableData.value.slice(0);
          // console.log(newArray, "newArray");
          tableData.value = [];
          tableData.value = newArray;
        },
      })
    }
  })
})
</script>

<style lang="scss" scoped>
.container_home {
  width: 100%;
  height: 100%;
  // padding: 10px;
  font-size: 15px;
  background-color: rgba(238, 238, 238, 1);
  box-sizing: border-box;
  height: 100%;

  .containerTop {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .containerTopLeft {
      width: 25%;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 15px 20px;
      box-sizing: border-box;
      // border: 1px solid #ccc;
      background: rgba(255, 253, 253, 1);

      .Title {
        display: flex;
        height: 40px;
        color: rgb(83, 128, 253);
        font-weight: bold;

        .title_icon {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      }
    }

    .containerTopRight {
      width: 74.5%;
      display: flex;
      flex-direction: column;
      height: 100%;
      // border: 1px solid #ccc;
      box-sizing: border-box;

      .right_header {
        width: 100%;
        height: 260px;
        padding: 15px 20px;
        box-sizing: border-box;
        background: rgba(255, 253, 253, 1);
      }

      .right_footer {
        width: 100%;
        margin-top: 10px;
        height: calc(100% - 270px);
        padding: 15px 15px;
        box-sizing: border-box;
        background: rgba(255, 253, 253, 1);
      }
    }

    .Content {
      width: 100%;
      height: 100%;
      overflow: auto;
    }

    .rightHead {
      width: 100%;
      margin-bottom: 10px;
    }

    .rightHead span {
      padding: 5px 10px 5px 10px;
      margin-right: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .backGroundBlue {
      background: #edf2fe;
      color: rgb(83, 128, 253);
      padding: 5px 10px 5px 10px;
      margin-right: 5px;
    }
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
  .treeCssHover {
    background: gray;
  }

  .nodeP {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
}
</style>
<style lang="scss">
.library_script {
  .el-textarea.is-disabled .el-textarea__inner {
    color: #000 !important;
  }
}
</style>