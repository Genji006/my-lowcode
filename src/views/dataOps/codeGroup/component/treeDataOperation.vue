<template>
  <div style="display: flex; width: 100%" v-loading="treeLoading">
    <el-tree-v2 show-checkbox ref="leftTreeDataRef" v-show="lineExper" class="treeCss" v-loading="loadingLeft" :height="heightTree" value-key="uniqueCode" @check-change="(data, checked) => handleCheck(data, checked, 'left')" :data="leftTreeData" :props="setObj">
      <template #default="{ node, data }">
        <el-icon class="node-icon" :class="{ 'is-leaf': node.isLeaf }">
          <Document v-if="node.isLeaf" />
          <Folder v-else-if="!node.expanded" />
          <FolderOpened v-else />
        </el-icon>
        <span class="nodeLabelColor" v-show-tip>
          <el-tooltip effect="dark" :content="data.code + ' ' + node.label">
            {{ data.code + " " + node.label }}
          </el-tooltip>
        </span>
      </template>
    </el-tree-v2>
    <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
      " v-show="lineExper">
      <div @click="addAndRemoveNode('1')" class="addAndRemoveNodeCss">添加</div>
      <p @click="addAndRemoveNode('0')" class="addAndRemoveNodeCss">删除</p>
    </div>
    <el-tree-v2 show-checkbox ref="rightTreeDataRef" class="treeCss" v-loading="loadingRight" :height="heightTree" @check-change="(data, checked) => handleCheck(data, checked, 'right')" value-key="uniqueCode" :data="rightTreeData" :props="setObj">
      <template #default="{ node, data }">
        <el-icon class="node-icon" :class="{ 'is-leaf': node.isLeaf }">
          <Document v-if="node.isLeaf" />
          <Folder v-else-if="!node.expanded" />
          <FolderOpened v-else />
        </el-icon>
        <span class="nodeLabelColor" v-show-tip>
          <el-tooltip effect="dark" :content="data.code + ' ' + node.label">
            {{ data.code + " " + node.label }}
          </el-tooltip>
        </span>
      </template>
    </el-tree-v2>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Document, Folder, FolderOpened } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { codeGroupTreeOperationApi } from "@/api/tool";
import { restructureTree, childrenCheckedFn } from '../index.js'

const leftTreeDataRef = ref(null);
const rightTreeDataRef = ref(null);

const treeLoading = ref(false);

const loadingLeft = ref(false);
const loadingRight = ref(false);

const props = defineProps({
  heightTree: {
    type: Number,
    default: 570,
  },
  lineExper: {
    type: Boolean,
    default: true,
  },
});

const treeData = ref([]);

const setObj = {
  value: "uniqueCode",
  label: "name",
  children: "children",
};

// 使用计算属性缓存过滤结果，避免重复计算
const leftTreeData = computed(() => {
  return filterTreeByBind(treeData.value, "0");
});

const rightTreeData = computed(() => {
  return restructureTree(filterTreeByBind(treeData.value, "1"));
});

// 优化的过滤函数，减少深拷贝
function filterTreeByBind(data, invert = 0) {
  if (!Array.isArray(data)) return [];
  const result = [];
  const shouldKeep = (node) =>
    invert == "1" ? node.useTag == "1" : node.useTag != "1";
  for (const node of data) {
    const newNode = { ...node };
    if (shouldKeep(node)) {
      if (node.children && node.children.length > 0) {
        newNode.children = filterTreeByBind(node.children, invert);
      }
      result.push(newNode);
    } else if (node.children && node.children.length > 0) {
      const filteredChildren = filterTreeByBind(node.children, invert);
      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
        result.push(newNode);
      }
    }
  }

  return result;
}

// 优化的递归方法，减少深拷贝
function addBindToSelected(data, selectedIds, value) {
  const idList = selectedIds.map((item) => item.uniqueCode);
  if (!Array.isArray(data)) return data;

  return data.map((item) => {
    // 只在需要修改时才创建新对象
    const newItem = idList.includes(item.uniqueCode)
      ? { ...item, useTag: value }
      : item;

    if (newItem.children && newItem.children.length > 0) {
      newItem.children = addBindToSelected(
        newItem.children,
        selectedIds,
        value
      );
    }

    return newItem;
  });
}

// 添加节点 - 优化版本
const addAndRemoveNode = async (value) => {
  if (value == "1") {
    loadingRight.value = true;
  } else {
    loadingLeft.value = true;
  }
  const treeRef = value == "1" ? leftTreeDataRef.value : rightTreeDataRef.value;
  const arr = treeRef.getCheckedNodes();

  if (arr.length === 0) {
    ElMessage.warning(
      value == "1" ? "请先选择要添加的节点" : "请先选择要删除的节点"
    );
    return;
  }

  // 使用防抖，避免频繁更新
  if (updateTimer.value) {
    clearTimeout(updateTimer.value);
  }

  updateTimer.value = setTimeout(() => {
    // 批量更新数据
    const updatedData = addBindToSelected(treeData.value, arr, value);
    treeData.value = updatedData;
    // 清除选中状态
    treeRef.setCheckedKeys([]);
    loadingRight.value = false;
    loadingLeft.value = false;
  }, 100);
};

// 防抖定时器
const updateTimer = ref(null);

// 数据大小分析函数
// function analyzeDataSize(data, label) {
//   console.log(`=== ${label} 数据分析 ===`);
//   if (!Array.isArray(data) || data.length === 0) {
//     console.log('数据为空或不是数组');
//     return;
//   }

//   // 1. 基本统计
//   const totalNodes = countNodes(data);
//   console.log(`总节点数: ${totalNodes}`);

//   // 2. 字段分析
//   const sampleNode = data[0];
//   console.log('样本节点字段:', Object.keys(sampleNode));
//   console.log('样本节点:', sampleNode);

//   // 3. 数据大小
//   const size = getArraySizeInBytes(data);
//   console.log(`数据大小: ${formatDataSize(size)}`);

//   // 4. 平均每个节点大小
//   const avgNodeSize = size / totalNodes;
//   console.log(`平均节点大小: ${formatDataSize(avgNodeSize)}`);

//   // 5. 字段大小分析
//   const fieldSizes = analyzeFieldSizes(sampleNode);
//   console.log('字段大小分析:', fieldSizes);

//   return {
//     totalNodes,
//     size,
//     avgNodeSize,
//     fieldSizes,
//     sampleNode
//   };
// }

// 计算节点总数
// function countNodes(data) {
//   let count = 0;
//   function traverse(nodes) {
//     for (const node of nodes) {
//       count++;
//       if (node.children && node.children.length > 0) {
//         traverse(node.children);
//       }
//     }
//   }
//   traverse(data);
//   return count;
// }

// 分析字段大小
// function analyzeFieldSizes(node) {
//   const result = {};
//   for (const [key, value] of Object.entries(node)) {
//     const fieldSize = new Blob([JSON.stringify(value)]).size;
//     result[key] = {
//       value: value,
//       size: fieldSize,
//       formattedSize: formatDataSize(fieldSize)
//     };
//   }
//   return result;
// }

// 格式化数据大小
// function formatDataSize(bytes) {
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   if (bytes === 0) return '0 Bytes';
//   const i = Math.floor(Math.log(bytes) / Math.log(1024));
//   return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
// }

// 比较两个数据集
// function compareDataSets(data1, label1, data2, label2) {
//   console.log('=== 数据对比分析 ===');
//   const analysis1 = analyzeDataSize(data1, label1);
//   const analysis2 = analyzeDataSize(data2, label2);
//   if (analysis1 && analysis2) {
//     console.log('\n=== 对比结果 ===');
//     console.log(`数据大小差异: ${formatDataSize(analysis2.size - analysis1.size)}`);
//     console.log(`大小比例: ${(analysis2.size / analysis1.size).toFixed(2)}x`);
//     console.log(`节点数差异: ${analysis2.totalNodes - analysis1.totalNodes}`);

//     // 字段差异分析
//     const fields1 = Object.keys(analysis1.sampleNode);
//     const fields2 = Object.keys(analysis2.sampleNode);
//     const extraFields = fields2.filter(f => !fields1.includes(f));
//     const missingFields = fields1.filter(f => !fields2.includes(f));
//     console.log('额外字段:', extraFields);
//     console.log('缺失字段:', missingFields);
//   }
// }
function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// function generateTreeData(total = 50000, childrenPerNode = 5, maxDepth = 4) {
//   let id = 1
//   function createNode(depth, parentId = '0') {
//     if (id > total || depth > maxDepth) return []
//     let nodes = []
//     for (let i = 0; i < childrenPerNode && id <= total; i++) {
//       const nodeId = generateRandomId()
//       const node = {
//         uniqueCode: nodeId,
//         parentId: parentId,
//         icdTye: null,
//         isLv: '1',
//         name: `节点哈哈哈哈哈${nodeId}`,
//         children: []
//       }
//       id++
//       node.children = createNode(depth + 1, nodeId)
//       nodes.push(node)
//     }
//     return nodes
//   }
//   return createNode(1)
// }

// function getArraySizeInBytes(arr) {
//   const jsonString = JSON.stringify(arr);
//   const blob = new Blob([jsonString]);
//   return blob.size;
// }

// function remapTreeData(tree) {
//   if (!Array.isArray(tree)) {
//     return [];
//   }
//   return tree.map(node => {
//     const newNode = {
//       uniqueCode: node.uniqueCode,
//       fatherCode: node.fatherCode,
//       name: node.name,
//     };
//     if (node.children && Array.isArray(node.children)) {
//       newNode.children = remapTreeData(node.children);
//     }
//     return newNode;
//   });
// }

const fetchData = ({ uuid }) => {
  // console.log(uuid, 'params');
  treeLoading.value = true;
  let obj = {
    groupUuid: uuid,
  };
  // 生成测试数据
  // const generatedData = generateTreeData();
  // treeData.value = generatedData;
  // console.log(treeData.value, '---');
  codeGroupTreeOperationApi(obj)
    .then((res) => {
      treeData.value = res.data;
      treeLoading.value = false;
      return;
      // console.log(res, 'fetchData');
      // 分析接口数据
      const apiDataAnalysis = analyzeDataSize(res.data, "接口数据");
      // console.log(apiDataAnalysis, 'apiDataAnalysis');
      // 生成测试数据
      const generatedData = generateTreeData();
      treeData.value = generatedData;
      // const generatedDataAnalysis = analyzeDataSize(generatedData, '生成数据');
      //   // 对比分析
      //   compareDataSets(generatedData, '生成数据', res.data, '接口数据');
      // 使用优化后的数据
      // treeData.value = res.data;
      // console.log('\n=== 优化建议 ===');
      // if (apiDataAnalysis && generatedDataAnalysis) {
      //   const sizeDiff = apiDataAnalysis.size - generatedDataAnalysis.size;
      //   const sizeRatio = apiDataAnalysis.size / generatedDataAnalysis.size;
      //   console.log(`接口数据比生成数据大 ${formatDataSize(sizeDiff)}`);
      //   console.log(`大小比例: ${sizeRatio.toFixed(2)}x`);
      //   if (sizeRatio > 2) {
      //     console.log('建议: 考虑数据压缩或字段精简');
      //   }
      // }
    })
    .catch((error) => {
      console.error("获取数据失败:", error);
      ElMessage.error("获取数据失败");
    });
};

// 抛出数据(用于传给接口)
const dataEmitFn = () => {
  return rightTreeData.value;
};

const handleCheck = (data, checked, type) => {
  // console.log(data, "data");
  // console.log(checked, "checked");
  if (type === "left") {
    let arr = childrenCheckedFn(
      data.children && data.children.length > 0 ? data.children : []
    );
    for (let i = 0, len = arr.length; i < len; i++) {
      leftTreeDataRef.value.setChecked(arr[i], checked);
    }
  } else {
    let arr = childrenCheckedFn(
      data.children && data.children.length > 0 ? data.children : []
    );
    for (let i = 0, len = arr.length; i < len; i++) {
      rightTreeDataRef.value.setChecked(arr[i], checked);
    }
  }
};

// 暴露方法给父组件
defineExpose({
  fetchData,
  dataEmitFn,
  // analyzeDataSize,
  // compareDataSets,
  // generateTreeData
});
</script>

<style lang="scss">
.node-icon {
  margin-right: 5px;
  color: var(--el-color-warning);
}
.el-tree {
  width: 100%;
  height: 100%;
}
.treeCss {
  border: 1px solid #eee;
}
.addAndRemoveNodeCss {
  cursor: pointer;
  white-space: nowrap;
  margin-top: 15px;
  background: rgba(230, 228, 228, 1);
  color: rgb(151, 149, 149);
  padding: 10px 15px;
  border: 1px solid rgb(230, 226, 226);
  &:hover {
    border: 1px solid rgba(83, 128, 253, 1);
    background: rgba(255, 255, 255, 1);
    color: rgba(83, 128, 253, 1);
    border-radius: 3px;
  }
}
.nodeLabelColor {
  color: #1e1e1e;
}
</style>
