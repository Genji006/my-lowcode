<template>
  <el-table ref="tableRef" :data="tableData" :row-key="rowKey" :tree-props="treeProps" :lazy="lazy" :load="lazy ? loadTreeData : undefined" @selection-change="handleSelectionChange" :style="tableStyle" border>
    <el-table-column type="selection" width="40" align="center">
      <template #default="scope">
        <el-checkbox v-model="scope.row.checked" :indeterminate="scope.row.indeterminate" @change="handleCheckDetail(scope.row, $event)"></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column v-for="column in columns" :key="column.prop || column.columnName" :prop="column.prop || column.columnName" :label="column.label || column.columnLabel" :show-overflow-tooltip="column.showOverflowTooltip !== false" v-bind="column.attrs" />
    <slot></slot>
  </el-table>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  lazy: {
    type: Boolean,
    default: true
  },
  tableStyle: {
    type: String,
    default: 'height:600px;overflow-y: auto;'
  },
  loadChildren: {
    type: Function,
    default: null
  },
  loadChildrenParams: {
    type: Function,
    default: (row) => ({ code: row.code })
  },
  rowKey: {
    type: String,
    default: ''
  },
  treeProps: {
    type: Object,
    default: () => ({ children: 'children', hasChildren: 'hasChild' })
  },
  hasChildValue: {
    type: [String, Number],
    default: "1"
  },
})

const emit = defineEmits(['selection-change', 'check-detail', 'update:tableData'])

const tableRef = ref()
const selectArr = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

// 处理勾选详情
const handleCheckDetail = (row, event) => {
  row.checked = event
  row.indeterminate = false
  // 如果有子节点，设置所有子节点的选中状态
  if (row.children && row.children.length > 0) {
    setChildrenChecked(row.children, event)
  }

  // 更新父节点状态
  updateParentCheckedStatus(row)

  // 更新选中数组
  updateSelectArr()

  emit('check-detail', row, event)
}

// 设置子节点选中状态
const setChildrenChecked = (children, checked) => {
  children.forEach(child => {
    child.checked = checked
    child.indeterminate = false

    // 递归处理子节点的子节点
    if (child.children && child.children.length > 0) {
      setChildrenChecked(child.children, checked)
    }
  })
}

const updateParentCheckedStatus = (node) => {
  // 从当前节点开始向上更新所有祖先节点的状态
  let currentNode = node;

  while (currentNode && currentNode.parent) {
    const parent = currentNode.parent;
    const siblings = parent.children || [];

    if (siblings.length === 0) break;

    // 检查是否所有兄弟节点都被选中
    const allChecked = siblings.every(child => child.checked);
    // 检查是否有部分兄弟节点被选中
    const someChecked = siblings.some(child => child.checked || child.indeterminate);

    // 更新父节点状态
    if (allChecked) {
      parent.checked = true;
      parent.indeterminate = false;
    } else if (someChecked) {
      parent.checked = false;
      parent.indeterminate = true;
    } else {
      parent.checked = false;
      parent.indeterminate = false;
    }

    // 继续向上更新
    currentNode = parent;
  }
}

// 更新选中数组
const updateSelectArr = () => {
  const selected = []

  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.checked) {
        // 完全选中的节点直接添加
        selected.push(node)
      } else if (node.children && node.children.length > 0) {
        // 部分选中的节点，检查其子节点
        traverse(node.children)
      }
    })
  }

  traverse(props.tableData)
  selectArr.value = selected
  console.log("selectArr", selectArr.value);
}

// 加载树形数据
const loadTreeData = async (row, treeNode, resolve) => {
  // 如果没有提供加载子节点的函数，则直接返回空数组
  if (!props.loadChildren) {
    resolve([])
    return
  }

  try {
    // 调用API获取子节点数据
    const params = props.loadChildrenParams(row);
    const res = await props.loadChildren(params)
    if (res.code == 200) {
      console.log(res, 'res');
      const childrenData = params?.dataType == '1' ? params.dataValue : res.rows || res.data || []
      childrenData.forEach(item => {
        // 如果父节点被选中，则子节点也需要被选中
        item.checked = row.checked || false
        item.indeterminate = false
        // 设置父节点引用，用于更新父节点状态
        item.parent = row
        // 根据后端返回的值判断是否有子节点
        if (props.treeProps.hasChildren && item[props.treeProps.hasChildren] !== undefined) {
          // 将后端返回的1/0转换为布尔值
          item[props.treeProps.hasChildren] = item[props.treeProps.hasChildren] == props.hasChildValue
        }
      })

      // 使用 resolve 方法将子节点数据传递给表格
      resolve(childrenData)

      if (!row.children) {
        row.children = childrenData
      }

      // 更新选中数组
      nextTick(() => {
        updateSelectArr()
      })
    } else {
      // 如果没有数据或出错，传递空数组
      resolve([])
    }
  } catch (error) {
    console.error("加载子节点数据失败:", error)
    // 出错时传递空数组
    resolve([])
  }
}

// 获取选中项
const getSelectedItems = () => {
  return selectArr.value
}

// 暴露组件实例方法
defineExpose({
  tableRef,
  getSelectedItems,
  updateSelectArr
})
</script>
<style scoped>
/* 添加树形表格箭头样式的自定义 */
/* :deep(.el-table__expand-icon) {
    position: relative;
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin-right: 8px;
}

:deep(.el-table__expand-icon .el-icon) {
    display: none;
}

:deep(.el-table__expand-icon::before) {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    width: 16px;
    height: 16px;
    background-image: url("../../../assets/ItemImg/tableTreeIcon.svg");
    background-size: 16px 16px;
    background-repeat: no-repeat;
    transition: transform 0.3s ease;
}

:deep(.el-table__expand-icon--expanded::before) {
    transform: translate(-50%, -50%) rotate(-90deg);
} */

/* 可选：添加悬停效果 */
:deep(.el-table__expand-icon:hover::before) {
  filter: brightness(1.2);
}
</style>