// 脚本库管理
<template>
  <div class="scriptManage">
    <div class="scriptManage_header">
      <div class="left_header">
        <div style="display: flex;align-items: center;height: 40px;color:#5380fd;font-size: 18px;font-weight: bold;" v-if="showChange" @click="showChange = false">
          <p class="lineBlue"> </p>
          <p>{{ modelOptions.find((item)=>item.uuid == selectedModel)?.modelName || '' }}</p>
          <el-icon size="18" style="margin-left:10px">
            <ArrowDownBold />
          </el-icon>
        </div>
        <el-select v-else v-model="selectedModel" @change="selectHandle" placeholder="请选择评审模型">
          <el-option v-for="item in modelOptions" :key="item.uuid" :label="item.modelName" :value="item.uuid" />
        </el-select>
      </div>
      <div style="width:calc(100% - 360px);margin-left:10px;background-color: rgba(253, 253, 251);">
        <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="ListFn()" @reset="ListFn()" :inline="true" />
      </div>
    </div>
    <div class="scriptManage_content" style="position:relative;display: flex;">
      <div class="fileStructure" v-show="fileShow" @click="fileShow = false;FileStructureRef.treeDataFn(selectedModel)">
        {{ '文件结构 >'}}
      </div>
      <div :style="`height:100%;width:${fileShow == false ? 290 : 0}px;margin-right:${fileShow == false ? 10 : 0}px`" v-show="!fileShow">
        <FileStructure ref="FileStructureRef" @close="fileShow = true" @nodeClick="handleNodeClick" :modelId="selectedModel" @updateTree="updateTree" />
      </div>
      <div :style="`width:calc(100% - ${fileShow == false ? 310 : 0}px);height:100%;margin-right:${fileShow == false ? 10 : 0}px`">
        <tableList ref="tableRef" style="padding:0;" :queryParams="searchData" v-bind="configShowFn(tableBindData,fileShow)" @btnClick="tableClickBtn" @cellClick="tableColumnClick" />
      </div>
    </div>
  </div>
  <SzycDialog :dialogVisible="showDialog" width="40%" @close="showDialog = false" :title="tableTitle" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <SubmitForm v-model="formData" :items="formItems" :rules="rules" :inline="false" @submit="handleSubmit" @cancel="showDialog = false" />
    </template>
  </SzycDialog>
  <!-- 替换 -->
  <SzycDialog :dialogVisible="scriptShow" width="90%" @close="scriptShow = false" title="替换脚本" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <div class="replaceScriptCss">
        <div style="width:600px;">
          <el-form :model="formScrip" label-width="auto" style="width: 100%">
            <el-form-item label="脚本名称：">
              <div style="width: 100%;height: 100%;display: flex;align-items: center;">
                <p v-show-tip class="fontHidden">
                  <el-tooltip :content="formScrip.scriptName">
                    {{ formScrip.scriptName }}
                  </el-tooltip>
                </p>
                <el-upload v-model:file-list="fileList" action="/api/data-ops/upload" :headers="headers" :on-success="handSuccess" :show-file-list="false" style="height:100%;display: flex;align-content: center;">
                  <div style="display:flex;align-items:center;">
                    <el-icon size="20" color="#5380fd">
                      <Upload />
                    </el-icon>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="脚本格式：">
              <span>{{ formScrip.scriptFormat }}</span>
            </el-form-item>
            <el-form-item label="脚本大小：">
              <span>{{ formScrip.scriptSize }}</span>
            </el-form-item>
            <el-form-item label="脚本替换类别：" prop="scriptIsTime">
              <el-radio-group v-model="formScrip.scriptIsTime" @change="formScrip.scriptTime = ''">
                <el-radio value="1"> 即时替换 </el-radio>
                <el-radio value="2"> 预定替换 </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="预定替换时间：" prop="scriptTime">
              <el-date-picker v-model="formScrip.scriptTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :disabled="formScrip.scriptIsTime == '2'?false:true " />
            </el-form-item>
            <el-form-item label="脚本描述：">
              <el-input v-model="formScrip.scriptRemarks" type="textarea" :rows="8" resize="none" placeholder="请输入"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="historyVersion">
          <div class="titleLine">
            <p class="line"></p>
            <p>历史版本</p>
          </div>
          <example style="max-height: 500px;overflow-y: scroll;" :steps="[
              {
                status: 't_completed',
                info: [
                  { label: '脚本名称', value: '脚本1' },
                  { label: '脚本大小', value: '10KB' },
                  { label: '上传用户', value: '用户A' },
                  { label: '上传时间', value: '2024-01-01' },
                  { label: '脚本描述', value: '这是脚本1的描述' },
                ]
              },
              {
                status: '',
                info: [
                  { label: '脚本名称', value: '脚本2' },
                  { label: '脚本格式', value: '.js' },
                  { label: '脚本大小', value: '20KB' },
                  { label: '上传时间', value: '2024-01-02' },
                  { label: '脚本描述', value: '这是脚本2的描述' }
                ]
              },
              {
                status: 't_active',
                info: [
                  { label: '脚本名称', value: '脚本2' },
                  { label: '脚本格式', value: '.js' },
                  { label: '脚本大小', value: '20KB' },
                  { label: '上传时间', value: '2024-01-02' },
                  { label: '脚本描述', value: '这是脚本2的描述' }
                ]
              }
            ]" />
        </div>
        <div class="historyVersion" style="margin-left:30px;">
          <div class="titleLine">
            <p class="line"></p>
            <p>关联数据项</p>
          </div>
        </div>
      </div>
    </template>
  </SzycDialog>
  <!-- 历史版本 -->
  <SzycDialog :dialogVisible="scriptHostory" width="70%" @close="scriptHostory = false" title="历史版本" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <el-table :data="historyData" style="width: 100%" height="400" @row-click="handleHistoryRowClick" border highlight-current-row>
        <el-table-column width="50" align="center">
          <template #default="scope">
            <el-radio :value="scope.row.id" v-model="selectedVersion" />
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="scriptName" label="脚本名称" show-overflow-tooltip />
        <el-table-column prop="scriptFormat" label="脚本格式" width="100" align="center" />
        <el-table-column prop="scriptSize" label="脚本大小" width="100" align="center" />
        <el-table-column prop="userName" label="上传用户" width="100" align="center" />
        <el-table-column prop="upDataTime" label="上传时间" width="220" align="center" />
        <el-table-column prop="scriptRemarks" label="脚本描述" show-overflow-tooltip />
      </el-table>
      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <szycButton type="cancel" @click="scriptHostory = false">取消</szycButton>
        <szycButton @click="saveHistory">保存</szycButton>
      </div>
    </template>
  </SzycDialog>
  <!-- 关联数据项 -->
  <SzycDialog :dialogVisible="dataItemShow" width="70%" @close="dataItemShow = false" title="关联数据项" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <SzycFormSearch v-model="dataItemForm" :items="dataItemFormItems" labelWidth="" @searchVal="dataItemTableRef.fetchData()" @reset="dataItemTableRef.fetchData()" :inline="true" />
      <tableList ref="dataItemTableRef" style="padding:0;margin-top:20px;height:500px;" :queryParams="dataItemForm" v-bind="tableDataItemBindData" />
      <!-- <el-table :data="historyData" style="width: 100%" height="400" border>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="scriptName" label="脚本名称" show-overflow-tooltip />
        <el-table-column prop="scriptFormat" label="脚本格式" width="100" align="center" />
        <el-table-column prop="scriptSize" label="脚本大小" width="100" align="center" />
        <el-table-column prop="userName" label="上传用户" width="100" align="center" />
        <el-table-column prop="upDataTime" label="上传时间" width="220" align="center" />
        <el-table-column prop="scriptRemarks" label="脚本描述" show-overflow-tooltip />
      </el-table> -->
      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <szycButton type="cancel" @click="dataItemShow = false"> 返回 </szycButton>
      </div>
    </template>
  </SzycDialog>
  <!-- 配置数据项 -->
  <SzycDialog :dialogVisible="dataItemConfig" width="80%" @close="dataItemConfig = false" title="配置数据项" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <SzycFormSearch v-model="dataItemConfigForm" :items="dataItemConfigFormItems" labelWidth="" :inline="true" />
      <el-table :data="historyData" ref="configDataItemRef" style="width: 100%" height="400" border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="scriptName" label="脚本名称" show-overflow-tooltip />
        <el-table-column prop="scriptFormat" label="脚本格式" width="100" align="center" />
        <el-table-column prop="scriptSize" label="脚本大小" width="100" align="center" />
        <el-table-column prop="userName" label="上传用户" width="100" align="center" />
        <el-table-column prop="upDataTime" label="上传时间" width="220" align="center" />
        <el-table-column prop="scriptRemarks" label="脚本描述" show-overflow-tooltip />
      </el-table>
      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <szycButton type="cancel" @click="dataItemConfig = false"> 取消 </szycButton>
        <szycButton @click="console.log(configDataItemRef?.getSelectionRows())"> 保存 </szycButton>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { getAnalyticalModel } from "@/api/modelIndexManage/anaEngineManagement.js"
import SzycFormSearch from '@/components/element/searchForm.vue'
import SubmitForm from '@/components/element/SubmitForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import { PageListData } from "@/types/dict/pagination";
import { heightLight } from "@/types/rule/heightLight"
import { dataItemFormItems, headers, rowDisableFn, dataItemConfigFormItems, configShowFn } from './index.js'
import { scriptListApi } from '@/api/settings/scriptManage'
import example from './example.vue'
import tableList from "@/components/table/tableAndPage.vue";
import { tableBindData, tableDataItemBindData } from './index'
import FileStructure from './FileStructure/index.vue'
import { deleteScriptFolderApi } from '@/api/appManage/appRegist'

const showChange = ref(true)
const fileShow = ref(true)

const FileStructureRef = ref(null)

const selectedModel = ref('')
const modelOptions = ref([])



// 模型管理
const getAnalyticalModelFn = () => {
  let obj = { pageSize: 9999 }
  getAnalyticalModel(obj).then((res) => {
    if (res.code == 200) {
      modelOptions.value = res.rows
      if (modelOptions.value && modelOptions.value.length > 0) {
        selectedModel.value = res.rows[0].uuid
        ListFn()
      }
    }
  })
}

const updateTree = (data) => {
  // console.log(data, 'dat');
  if (data.code == 200) {
    FileStructureRef.value.treeDataFn(selectedModel.value)
    ListFn()
  }
}


const handleNodeClick = (data) => {
  console.log(data, 'data');
  searchData.scriptName = ''  // 脚本名称
  searchData.scriptFormat = ''// 脚本格式
  searchData.userName = ''    // 用户名称
  searchData.updataTime = []  // 更新时间
  searchData.scriptPath = data.scriptPath
  ListFn()
}



//  查询值
const searchData = reactive({
  scriptName: '',  // 脚本名称
  scriptFormat: '',// 脚本格式
  userName: '',    // 用户名称
  updataTime: [],  // 更新时间
})
//  查询表单
const formWidth = '180px'
const searchItems = ref([
  { label: '脚本名称：', prop: 'scriptName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  { label: '上传用户：', prop: 'userName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  {
    label: '上传时间：', prop: 'updataTime', component: 'el-date-picker',
    attrs: {
      placeholder: '请输入', "range-separator": "-",
      "start-placeholder": '开始时间',
      "end-placeholder": '结束时间',
      type: 'daterange',
      "value-format": 'YYYY-MM-DD',
    }, style: { width: '230px' }
  },
  { label: '脚本格式：', prop: 'scriptFormat', component: 'el-select', options: [], attrs: { placeholder: '请输入' }, style: { width: formWidth } },

])


const formScrip = reactive({
  scriptName: '',      // 脚本名称
  scriptFormat: '',    // 脚本格式
  scriptSize: '',      // 脚本大小
  scriptIsTime: '1',      // 脚本替换类别
  scriptTime: '',      // 预定替换时间
  scriptRemarks: '',   // 脚本描述
  url: '',   // 脚本路径
})





const tableRef = ref(null) // 表格实例
const tableTitle = ref('') // 表格标题
const showDialog = ref(false) // 弹窗状态
const scriptShow = ref(false)  // 上传脚本弹窗状态


// const currentPage = ref(1) // 当前页码
// const pageSize = ref(PageListData()[0]) // 每页显示条数
// const total = ref(0) // 总数据条数

const selectedVersion = ref(1);
const scriptHostory = ref(false)   // 历史弹窗

const dataItemShow = ref(false)
const dataItemTableRef = ref(null)
const dataItemForm = reactive({
  dataItemName: '',      // 数据项名称
  dataItemIndex: '',    // 关联指标
})

const dataItemConfig = ref(false)
const configDataItemRef = ref(null) // 配置数据项表格实例
const dataItemConfigForm = reactive({
  dataItemName: '',      // 数据项名称
  dataItemIndex: '',    // 关联指标
  bindSciptName: ''  // 绑定脚本名称
})



// 模型切换
const selectHandle = () => {
  showChange.value = true;
  nextTick(() => {
    FileStructureRef.value.treeDataFn(selectedModel.value)
  })
  ListFn()
}






const handleHistoryRowClick = (row) => {
  selectedVersion.value = row.id;
};


//  列表接口
const ListFn = () => {
  searchData.scriptModel = selectedModel.value
  if (searchData.updataTime && searchData.updataTime.length > 0) {
    searchData.createTime = searchData.updataTime[0]
    searchData.endTime = searchData.updataTime[1]
  } else {
    searchData.createTime = ''
    searchData.endTime = ''
  }
  // searchData.scriptPath =
  nextTick(() => {
    tableRef.value?.fetchData()
  })
}



//  上传
const tableClickBtn = (item, data) => {
  console.log(item, 'item');
  if (item.text == '上传') {

  } else if (item.text == '替换') {
    scriptShow.value = true

  } else if (item.text == '重置顺序') {

  } else if (item.text == '下载') {

  } else if (item.text == '配置数据项') {
    dataItemConfig.value = true

  } else if (item.text == '删除') {
    ElMessageBox.confirm(
      '是否确认删除勾选的脚本？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    )
      .then(async () => {
        let list = data?.map((item) => item.scriptId ) || []
        deleteScriptFolderApi({ scriptIds: list }).then((res) => {
          if (res.code == 200) {
            ElMessage.success('删除成功！')
            FileStructureRef.value.treeDataFn(selectedModel.value)
            ListFn()
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: 'error',
          message: '删除取消',
        })
      })
  }
}


const tableColumnClick = ({ row, column, $index }) => {
  // console.log(column.columnLabel);
  if (column.columnLabel == '关联数据项') {
    dataItemShow.value = true
  } else if (column.columnLabel == '版本管理') {
    scriptHostory.value = true
  }
}



const handSuccess = (data) => {
  // console.log(data, 'data');
  if (data.code == 200) {
    formScrip.scriptName = data.fileName
    formScrip.scriptSize = data.fileSize
  }
}
const historyData = ref([
  { id: 1, scriptName: '测试脚本', scriptFormat: '.sql', scriptSize: '10KB', userName: '管理员', upDataTime: '2026/2/25 10:23', scriptRemarks: '这是一个运算脚本' },
  { id: 2, scriptName: '测试脚本', scriptFormat: '.sql', scriptSize: '10KB', userName: '管理员', upDataTime: '2026/2/25 10:23', scriptRemarks: '这是一个运算脚本' },
  { id: 3, scriptName: '测试脚本', scriptFormat: '.sql', scriptSize: '10KB', userName: '管理员', upDataTime: '2026/2/25 10:23', scriptRemarks: '这是一个运算脚本' },
  { id: 4, scriptName: '测试脚本', scriptFormat: '.sql', scriptSize: '10KB', userName: '管理员', upDataTime: '2026/2/25 10:23', scriptRemarks: '这是一个运算脚本' },
  { id: 5, scriptName: '测试脚本', scriptFormat: '.sql', scriptSize: '10KB', userName: '管理员', upDataTime: '2026/2/25 10:23', scriptRemarks: '这是一个运算脚本' }
])




onMounted(() => {
  getAnalyticalModelFn()
})

</script>


<style lang="scss" scoped>
.scriptManage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .scriptManage_header {
    display: flex;
    align-items: center; // 垂直居中
    flex-shrink: 0;
    .left_header {
      width: 350px;
      background-color: rgba(253, 253, 251);
      height: 100%;
      padding: 10px;
      box-sizing: border-box;
    }
  }
  .scriptManage_content {
    margin-top: 10px;
    height: 10%;
    flex: 1;
    background-color: rgba(253, 253, 251);
    padding: 10px;
    box-sizing: border-box;
    .fileStructure {
      position: absolute;
      top: 10px;
      left: 15px;
      font-size: 18px;
      height: 45px;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: rgba(83, 128, 253, 1);
      font-weight: 600;
    }
  }
}
.pageCss {
  width: 100%;
  display: flex;
  justify-content: end;
  height: 50px;
}
.colorBlueFont {
  color: rgba(83, 128, 253, 1);
  cursor: pointer;
}
.lineBlue {
  width: 3px;
  height: 60%;
  margin-right: 10px;
  background: #5380fd;
}
.replaceScriptCss {
  width: 100%;
  height: 100%;
  display: flex;
  .historyVersion {
    border: 1px solid rgba(201, 201, 201, 1);
    padding: 10px;
    border-radius: 2px;
    width: 500px;
    box-sizing: border-box;
    .titleLine {
      display: flex;
      color: rgba(83, 128, 253, 1);
      font-weight: 600;
      .line {
        width: 3px;
        margin-right: 10px;
        background: #5380fd;
      }
    }
  }
  .fontHidden {
    margin-right: 10px;
    min-width: 30px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>