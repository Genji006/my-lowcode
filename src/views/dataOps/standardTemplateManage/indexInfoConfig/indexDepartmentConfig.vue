// 指标科室配置
<template>
  <div class="index-department-config">
    <div class="left-tree">
      <div class="tree-header">
        <el-input v-model="treeSearchText" placeholder="请输入关键字查询" clearable size="small">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <szycButton style="height:25px;" size="small">
          <el-icon>
            <Search />
          </el-icon>
        </szycButton>
      </div>
      <div class="tree-content">
        <el-tree ref="treeRef" :data="treeData" indent="10" :props="treeProps" node-key="id" highlight-current default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick">
          <template #default="{ node, data }">
            <span class="tree-node" :class="{ 'is-leaf': node.isLeaf }">
              <el-icon v-if="data.level === 0">
                <Menu />
              </el-icon>
              <el-icon v-else-if="data.level === 1">
                <Folder />
              </el-icon>
              <el-icon v-else-if="data.level === 2">
                <Document />
              </el-icon>
              <span v-show-tip class="node-label">
                <el-tooltip effect="dark" :content="node.label">
                  {{ node.label }}
                </el-tooltip>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="right-content">
      <div class="search-area">
        <el-form :model="searchForm" inline>
          <el-form-item label="指标名称：">
            <el-input v-model="searchForm.indexName" placeholder="请输入" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="责任科室：">
            <el-select v-model="searchForm.department" placeholder="请选择" clearable style="width: 150px">
              <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="分配状态：">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
              <el-option label="已配置" value="1" />
              <el-option label="未配置" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <szycButton type="primary" @click="handleSearch">
              <el-icon class="bmr">
                <Search />
              </el-icon>查询
            </szycButton>
          </el-form-item>
          <el-form-item>
            <szycButton type="cancel" @click="handleReset">
              <el-icon class="bmr">
                <Refresh />
              </el-icon>重置
            </szycButton>
          </el-form-item>
        </el-form>
      </div>
      <div style="background:#fff;flex:1;height:10%">
        <div class="toolbar">
          <div class="left-bnts">
            <szycButton @click="handleBatchConfig">
              <el-icon class="bmr">
                <Setting />
              </el-icon>科室配置
            </szycButton>
            <szycButton @click="handleDownloadTemplate">
              <el-icon class="bmr">
                <Download />
              </el-icon>下载模板
            </szycButton>
            <szycButton @click="handleBatchImport">
              <el-icon class="bmr">
                <Upload />
              </el-icon>批量导入
            </szycButton>
            <szycButton @click="handleExport">
              <el-icon class="bmr">
                <Document />
              </el-icon>数据导出
            </szycButton>
            <szycButton type="delete" @click="handleClearConfig">
              <el-icon class="bmr">
                <Delete />
              </el-icon>配置清空
            </szycButton>
          </div>
          <div class="right-stats">
            <span>全部指标：<strong>{{ stats.total }}</strong></span>
            <span class="green">已配置：<strong>{{ stats.configured }}</strong></span>
            <span class="red">未配置：<strong>{{ stats.unconfigured }}</strong></span>
          </div>
        </div>
        <div class="table-area">
          <el-table ref="tableRef" :data="tableData" border stripe height="100%" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :expand-row-keys="expandedRows" @expand-change="handleExpandChange">
            <el-table-column type="index" width="50" align="center" />
            <el-table-column label="指标名称" min-width="300">
              <template #default="{ row }">
                {{ row.name }}
              </template>
            </el-table-column>
            <el-table-column label="责任科室" width="150" align="center">
              <template #default="{ row }">
                {{ row.department || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="科室负责人" width="120" align="center">
              <template #default="{ row }">
                {{ row.manager || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="分配状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.status === '1'" type="success">已配置</el-tag>
                <el-tag v-else type="danger">未配置</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <span style="color:#5380fd;cursor:pointer;" @click="handleConfigRecord(row)">
                  配置记录
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import szycButton from "@/components/element/Confirm.vue"

const treeRef = ref(null)
const tableRef = ref(null)
const treeSearchText = ref('')
const expandedRows = ref([])

const searchForm = reactive({
  indexName: '',
  department: '',
  status: ''
})

const departmentOptions = ref([
  { label: 'D89医务科', value: 'D89' },
  { label: 'D90护理部', value: 'D90' },
  { label: 'D91财务科', value: 'D91' }
])

const stats = reactive({
  total: 786,
  configured: 784,
  unconfigured: 2
})

const treeProps = {
  label: 'name',
  children: 'children'
}

const treeData = ref([
  {
    id: 'all',
    name: '全部',
    level: 0,
    children: [
      {
        id: 'chapter1',
        name: '第一章 资源配置与运行数据指标',
        level: 1,
        children: [
          {
            id: 'section1',
            name: '一、床位配置',
            level: 2,
            children: [
              { id: '1.1.1.1', name: '核定床位数', level: 3 },
              { id: '1.1.2.1', name: '实际开放床位数', level: 3 },
              { id: '1.1.3.1', name: '平均床位使用率', level: 3 }
            ]
          },
          {
            id: 'section2',
            name: '二、卫生技术人员数与开放床位数比',
            level: 2,
            children: [
              { id: '1.2.1.1', name: '卫生技术人员数与开放床位数比', level: 3 },
              { id: '1.2.2.1', name: '全院护士人数与开放床位数比', level: 3 },
              { id: '1.2.3.1', name: '全院病区护士人数与开放床位数比', level: 3 },
              { id: '1.2.4.1', name: '医院感染管理专职人员数与开放床位数比', level: 3 }
            ]
          }
        ]
      },
      {
        id: 'chapter2',
        name: '第二章 医疗服务能力与医院质量安全指标',
        level: 1,
        children: [
          { id: '2.1', name: '麻醉科、儿科、重症、病理、中医医师占比', level: 2 },
          { id: '2.2', name: '从事公共卫生工作的专职人员数', level: 2 },
          { id: '2.3', name: '医护比', level: 2 },
          { id: '2.4', name: '卫生技术人员职称结构', level: 2 },
          { id: '2.5', name: '卫生技术人员数占全院总人数的比例', level: 2 },
          { id: '2.6', name: '卫生技术人员人数占全院总人数的比例', level: 2 }
        ]
      },
      {
        id: 'chapter3',
        name: '第三章 重点专业质量控制指标',
        level: 1
      },
      {
        id: 'chapter4',
        name: '第四章 单病种（术种）质量控制指标',
        level: 1
      },
      {
        id: 'chapter5',
        name: '第五章 重点医疗技术临床应用质量控制指标',
        level: 1
      },
      {
        id: 'chapter6',
        name: '第六章 经济运行指标',
        level: 1
      }
    ]
  }
])

const tableData = ref([
  {
    id: '1.1.1.1',
    code: '1.1.1.1',
    name: '核定床位数',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '1.1.2.1',
    code: '1.1.2.1',
    name: '实际开放床位数',
    department: 'D89医务科',
    manager: '王语安',
    status: '0',
    hasChildren: false
  },
  {
    id: '1.1.3.1',
    code: '1.1.3.1',
    name: '平均床位使用率',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '1.2.1.1',
    code: '1.2.1.1',
    name: '卫生技术人员数与开放床位数比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '1.2.2.1',
    code: '1.2.2.1',
    name: '全院护士人数与开放床位数比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '1.2.3.1',
    code: '1.2.3.1',
    name: '全院病区护士人数与开放床位数比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '1.2.4.1',
    code: '1.2.4.1',
    name: '医院感染管理专职人员数与开放床位数比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '2.1',
    code: '1.2.5.1',
    name: '麻醉科、儿科、重症、病理、中医医师占比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: true,
    children: [
      { id: '2.1.1', code: '1.2.5.1.1', name: '麻醉科医师占比', department: 'D89医务科', manager: '王语安', status: '1' },
      { id: '2.1.2', code: '1.2.5.1.2', name: '儿科医师占比', department: 'D89医务科', manager: '王语安', status: '1' },
      { id: '2.1.3', code: '1.2.5.1.3', name: '重症医师占比', department: 'D89医务科', manager: '王语安', status: '1' },
      { id: '2.1.4', code: '1.2.5.1.4', name: '病理科医师占比', department: 'D89医务科', manager: '王语安', status: '1' },
      { id: '2.1.5', code: '1.2.5.1.5', name: '中医科医师占比', department: 'D89医务科', manager: '王语安', status: '1' }
    ]
  },
  {
    id: '2.2',
    code: '1.2.5.2',
    name: '从事公共卫生工作的专职人员数',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '2.3',
    code: '1.2.5.3',
    name: '医护比',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '2.4',
    code: '1.2.5.4',
    name: '卫生技术人员职称结构',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '2.5',
    code: '1.2.5.5',
    name: '卫生技术人员数占全院总人数的比例',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  },
  {
    id: '2.6',
    code: '1.2.5.6',
    name: '卫生技术人员人数占全院总人数的比例',
    department: 'D89医务科',
    manager: '王语安',
    status: '1',
    hasChildren: false
  }
])

const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}

watch(treeSearchText, (val) => {
  treeRef.value?.filter(val)
})

const handleNodeClick = (data) => {
  console.log('点击节点：', data)
  handleSearch()
}

const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.indexName = ''
  searchForm.department = ''
  searchForm.status = ''
  handleSearch()
}

const handleBatchConfig = () => {
  ElMessage.info('打开科室配置对话框')
}

const handleDownloadTemplate = () => {
  ElMessage.success('模板下载中...')
}

const handleBatchImport = () => {
  ElMessage.info('打开批量导入对话框')
}

const handleExport = () => {
  ElMessage.success('数据导出中...')
}

const handleClearConfig = () => {
  ElMessageBox.confirm(
    '确定要清空所有配置吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('配置已清空')
  }).catch(() => { })
}

const handleConfigRecord = (row) => {
  console.log('查看配置记录：', row)
  ElMessage.info(`查看 ${row.name} 的配置记录`)
}

const handleExpandChange = (row, expanded) => {
  console.log('展开变化：', row, expanded)
}


</script>

<style scoped lang="scss">
.index-department-config {
  display: flex;
  width: 100%;
  height: 100%;

  .left-tree {
    width: 400px;
    background: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    .tree-header {
      padding: 15px;
      display: flex;
      gap: 8px;
      border-bottom: 1px solid #e4e7ed;
      box-sizing: border-box;
    }

    .tree-content {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      box-sizing: border-box;

      .tree-node {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 100%;
        overflow: hidden;
        .el-icon {
          color: #409eff;
          flex-shrink: 0;
        }

        .node-label {
          color: #303133;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
          min-width: 0;
        }

        &.is-leaf {
          .el-icon {
            color: #67c23a;
          }
        }
      }
    }
  }

  .right-content {
    width: calc(100% - 410px);
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .search-area {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 10px;
      box-sizing: border-box;
      .search-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        .label {
          color: #606266;
        }
      }
    }

    .toolbar {
      padding: 10px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      box-sizing: border-box;

      .left-bnts {
        display: flex;
        gap: 10px;
      }

      .right-stats {
        display: flex;
        gap: 20px;
        color: #606266;
        strong {
          color: #303133;
        }
        .green {
          color: #67c23a;
          strong {
            color: #67c23a;
          }
        }

        .red {
          color: #f56c6c;
          strong {
            color: #f56c6c;
          }
        }
      }
    }

    .table-area {
      background: #fff;
      border-radius: 4px;
      padding: 0px 10px 10px 10px;
      height: calc(100% - 50px);
      box-sizing: border-box;
      .index-code {
        color: #409eff;
        margin-right: 8px;
      }

      .index-name {
        color: #303133;
      }
    }
  }
}
</style>
