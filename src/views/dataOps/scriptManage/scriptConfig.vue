<template>
  <div class="scriptConfig">
    <div class="scriptConfigTop">
      <div class="headerConfig">
        <div style="height:40px;display:flex; align-items:center;">
          <div style="display: flex;align-items: center;height: 100%;color:#5380fd;font-size: 18px;font-weight: bold;" v-if="showChange" @click="showChange = false">
            <p class="lineBlue"> </p>
            <p>{{ modelOptions.find((item)=>item.value == selectedModel)?.label || '' }}</p>
            <el-icon size="18" style="margin-left:10px">
              <ArrowDownBold />
            </el-icon>
          </div>
          <el-select v-else v-model="selectedModel" @change="showChange = true" placeholder="请选择评审模型">
            <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="status-info">
          <p class="completed"> 已完成配置 </p>
          <p> 指标数：<span> {{ 999 }} </span> </p>
          <p> 数据项数：<span> {{ 998 }} </span> </p>
        </div>
      </div>
      <div style="width:calc(100% - 360px);margin-left:10px;">
        <SzycFormSearch style="box-shadow:none" v-model="searchData" :items="searchItems" labelWidth="auto" @searchVal="ListFn()" @reset="ListFn()" :inline="true" />
      </div>
    </div>
    <div class="scriptConfigBottom">
      <div style="display: flex;height:50px;align-items:center">
        <szycButton><el-icon class="bmr">
            <Upload />
          </el-icon> 配置脚本 </szycButton>
        <szycButton><el-icon class="bmr">
            <Switch />
          </el-icon> 配置关联表 </szycButton>
        <szycButton type="delete"><el-icon class="bmr">
            <Delete />
          </el-icon> 解绑脚本 </szycButton>
        <szycButton type="delete"><el-icon class="bmr">
            <Delete />
          </el-icon> 解绑关联表 </szycButton>
      </div>
      <div style="height: calc(100% - 100px);">
        <el-table :data="tableData" ref="tableRef" style="width: 100%;height:100%" header-cell-class-name="headerTable" v-loading="loading" border highlight-current-row @rowClick="handleRowClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="" label="数据项名称" show-overflow-tooltip />
          <el-table-column prop="" label="数据项编号" align="center" />
          <el-table-column prop="" label="版本号" align="center" />
          <el-table-column prop="" label="来源应用" align="center" />
          <el-table-column prop="" label="数据项类型" align="center" />
          <el-table-column prop="" label="关联指标" show-overflow-tooltip />
          <el-table-column prop="" label="绑定脚本名称" show-overflow-tooltip />
          <el-table-column prop="" label="关联表名称" show-overflow-tooltip />
          <el-table-column prop="" label="更新人" show-overflow-tooltip />
          <el-table-column prop="" label="更新时间" show-overflow-tooltip />
          <el-table-column prop="" label="配置状态" width="120" align="center">
            <template>
              <span style="color:rgba(83, 128, 253,1);cursor:pointer;"> 历史版本 </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pageCss">
          <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="ListFn()" @current-change="ListFn()" :prev-text="'上一页'" :next-text="'下一页'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import { PageListData } from "@/types/dict/pagination";

const searchData = reactive({
  dataItemName: '',         //  数据项名称
  associationIndex: '',     //  关联指标
  bindScriptName: '',       //  绑定脚本名称
  AssociatedTableName: '',  //  关联表名称
  configStatus: '',         //  配置状态
})
const formWidth = '250px'
const searchItems = computed(() => [
  { label: '数据项名称', prop: 'dataItemName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  { label: '关联指标', prop: 'associationIndex', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  { label: '绑定脚本名称', prop: 'bindScriptName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  { label: '关联表名称', prop: 'AssociatedTableName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
  {
    label: '配置状态',
    prop: 'configStatus',
    component: 'el-select',
    attrs: {
      clearable: true,
      multiple: true,
      "collapse-tags": true,
      "collapse-tags-tooltip": true,
      placeholder: '请选择',
    },
    options: [
      { label: '已配置', value: 'configured' },
      { label: '未配置', value: 'unconfigured' }
      // 可根据实际状态值调整
    ],
    style: { width: formWidth }
  },
])
const selectedModel = ref('hospital') // 当前选中的模型值
const showChange = ref(true)
const modelOptions = [
  { label: '等级医院评审模型', value: 'hospital' },
  { label: '临床路径管理模型', value: 'clinicalPath' },
  { label: '医疗质量控制模型', value: 'qualityControl' }
]

const tableRef = ref(null) // 表格实例
const tableData = ref([])  // 表格数据

const currentPage = ref(1) // 当前页
const pageSize = ref(PageListData()[0]) // 每页条数
const total = ref(0)








</script>

<style lang="scss" scoped>
.scriptConfig {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .scriptConfigTop {
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    min-height: 100px;
    .headerConfig {
      width: 350px;
      padding: 10px;
      background: #ffff;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .status-info {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      color: #666;
      padding: 10px 0;
      box-sizing: border-box;
      p {
        margin: 0;
        font-weight: 400;
      }

      .completed {
        color: #409eff;
        font-weight: 500;
        padding: 4px 8px;
        background-color: rgba(64, 158, 239, 0.1);
        border-radius: 4px;
        margin-right: 20px;
        box-sizing: border-box;
      }

      span {
        color: #333;
        font-weight: 500;
      }
    }
  }
  .scriptConfigBottom {
    height: 10%;
    flex: 1;
    margin-top: 10px;
    background: #ffffff;
    padding: 10px;
    box-sizing: border-box;
    .pageCss {
      width: 100%;
      display: flex;
      justify-content: end;
      height: 50px;
    }
  }
}
.lineBlue {
  width: 3px;
  height: 60%;
  margin-right: 10px;
  background: #5380fd;
}
</style>