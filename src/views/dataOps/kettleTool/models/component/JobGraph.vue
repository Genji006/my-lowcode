<!-- JobGraph.vue -->
<template>
  <div class="job-graph-container">
    <el-container class="graph-wrapper">
      <!-- 左侧组件树 -->
      <el-aside width="200px" class="component-tree">
        <div class="search-box">
          <el-input v-model="searchText" placeholder="请输入关键字检索" @input="handleSearch" clearable>
            <template #prefix>
              <i class="el-input__icon el-icon-search"></i>
            </template>
          </el-input>
        </div>

        <el-tree ref="treeRef" :data="treeData" :props="treeProps" :filter-node-method="filterNode" node-key="id" default-expand-all draggable :expand-on-click-node="false" />
      </el-aside>

      <!-- 中间图形区域 -->
      <el-main class="graph-main">
        <div ref="graphContainer" class="graph-container"></div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  path: String,
  name: String
})

const searchText = ref('')
const treeRef = ref()
const graphContainer = ref()
let graphInstance = null
const treeData = ref([])

const treeProps = {
  label: 'text',
  children: 'children',
  isLeaf: 'leaf'
}

// 搜索处理
function handleSearch(value) {
  treeRef.value.filter(value)
}

// 过滤节点
function filterNode(value, data) {
  if (!value) return true
  return data.text.includes(value)
}

// 加载组件树数据
async function loadComponentTree() {
  try {
    const response = await axios.get('/system/jobentrys.do')
    treeData.value = response.data
  } catch (error) {
    ElMessage.error('加载组件树失败')
    console.error(error)
  }
}

// 初始化图形
async function initGraph() {
  if (!graphContainer.value) return

  try {
    ElMessage.info('正在加载作业，请稍后...')

    const response = await axios.post('/repository/open.do', {
      path: props.path,
      type: 'job'
    })

    // 清空容器
    graphContainer.value.innerHTML = ''

    // 创建 mxGraph 实例
    if (typeof mxGraph !== 'undefined') {
      graphInstance = new mxGraph(graphContainer.value)

      // 解析 XML 数据
      const xmlDocument = mxUtils.parseXml(decodeURIComponent(response.data))
      const decoder = new mxCodec(xmlDocument)
      const node = xmlDocument.documentElement

      // 加载数据到图形
      decoder.decode(node, graphInstance.getModel())

      ElMessage.success('作业加载完成')
    } else {
      ElMessage.warning('mxGraph 库未加载')
    }
  } catch (error) {
    ElMessage.error('加载作业失败')
    console.error(error)
  }
}

// 组件挂载
onMounted(async () => {
  await loadComponentTree()
  await nextTick()
  initGraph()
})

// 组件卸载
onUnmounted(() => {
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }
})
</script>

<style scoped>
.job-graph-container {
  height: 100%;
}

.graph-wrapper {
  height: 100%;
}

.component-tree {
  background-color: #f5f5f5;
  padding: 10px;
  border-right: 1px solid #e6e6e6;
}

.search-box {
  margin-bottom: 10px;
}

.graph-main {
  padding: 0;
}

.graph-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
}
</style>