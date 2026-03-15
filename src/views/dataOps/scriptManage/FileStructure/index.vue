<template>
  <div class="file-style-container">
    <el-tree :data="fileTree" :props="defaultProps" :indent="indentNum" :expand-on-click-node="false" :default-expand-all="true" @node-click="handleNodeClick" node-key="scriptId" @node-drop="successNode" draggable :allow-drop="allowDrop">
      <template #default="{ node,data }">
        <div :style="`display:flex;width:calc(100% - ${ (node.level * indentNum) + 25 }px)`" @contextmenu.stop="handleContextMenuS(data, $event)">
          <div style="width:calc(100% - 25px);display:flex;">
            <div style="display:flex;width:25px">
              <span v-if="data.scriptType === 'F'"> 📁 </span>
              <span v-else> 📄 </span>
            </div>
            <div v-show-tip v-if="!editingItem || editingItem.scriptId !== data.scriptId" class="contentFont">
              <el-tooltip :content="data.scriptName" placement="top">
                {{data.scriptName}}
              </el-tooltip>
            </div>
            <div v-else>
              <input v-model="editName" @keyup.enter="finishEdit(data)" @input="filterSpecialChars" @keypress="preventInvalidKeys" @blur="finishEdit(data)" ref="editInput" class="edit-input" />
            </div>
          </div>
          <div style="width:25px;">
            <button @click.stop="handleContextMenuS(data, $event)" class="action-btn">
              ⋯
            </button>
          </div>
        </div>
      </template>
    </el-tree>
    <!-- 本地上下文菜单 -->
    <div v-show="contextMenu.visible" class="context-menu" :style="{ left: (contextMenu.x + 10) + 'px', top: contextMenu.y + 'px' }">
      <div class="menu-item" v-if="contextMenu.targetItem && contextMenu.targetItem.scriptType === 'F'">
        <el-upload ref="uploadRef" :action="`/api/data-ops/parseFolder?modelId=${props.modelId}`" :data="{folderPaths:contextMenu?.targetItem?.scriptPath || ''}" :show-file-list="false" :headers="headers" :multiple="true" :on-success="handleSuccess" name="files">
          <span class="menu-icon">📤</span>
          上传
        </el-upload>
      </div>
      <div class="menu-item">
        <span class="menu-icon">🛠️</span>
        替换
      </div>
      <div v-if="contextMenu.targetItem && contextMenu.targetItem.scriptType === 'F'" class="menu-item" @click="createSiblingDirectory(contextMenu.targetItem,'next')">
        <span class="menu-icon">📁</span>
        创建同级目录
      </div>
      <div v-if="contextMenu.targetItem && contextMenu.targetItem.scriptType === 'F'" class="menu-item" @click="createSiblingDirectory(contextMenu.targetItem,'inner')">
        <span class="menu-icon">📁</span>
        创建下级目录
      </div>
      <div class="menu-item" @click="renameItem">
        <span class="menu-icon">✏️</span>
        重命名
      </div>
      <div class="menu-item delete" @click="deleteItem(contextMenu.targetItem)">
        <span class="menu-icon">🗑️</span>
        删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { listScriptTreeApi, renameScriptFileApi, moveScriptFileApi, createScriptFolderApi, deleteScriptFolderApi } from '@/api/appManage/appRegist'
import { headers, defaultProps, preventInvalidKeys, findParentById, getFileId } from './index'

const props = defineProps({
  modelId: {
    type: String,
    required: true,
    default: ''
  }
});

const emits = defineEmits(['updateTree', 'nodeClick'])
const editingItem = ref(null);
const editInput = ref(null)
const editName = ref('');

const indentNum = ref(16)

// 文件树数据
const fileTree = ref([]);



const filterSpecialChars = (event) => {
  const invalidChars = /[\/:*?"<>|]/g;
  const value = event.target.value;
  const filteredValue = value.replace(invalidChars, '');
  editName.value = filteredValue;
};



// 关闭上下文菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  targetItem: null
});


// 开始编辑
const startEdit = (item) => {
  editingItem.value = item;
  editName.value = item.scriptName;
  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    if (editInput.value && typeof editInput.value.focus === 'function') {
      editInput.value.focus();
      editInput.value.select();
    }
  });
};


// 右键或者按钮点击展示操作
const handleContextMenuS = (data, event) => {
  event.preventDefault();
  event.stopPropagation();
  setTimeout(() => {
    // 显示本地菜单
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetItem: data
    };

    // 添加全局点击事件监听器
    setTimeout(() => {
      document.addEventListener('click', closeContextMenu, { once: true });
    }, 0);
  }, 50);


}


// 上传文件成功
const handleSuccess = (response, file, uploadFile) => {
  if (response.code == 200) {
    emits('updateTree', response)
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}


const handleNodeClick = (data) => {
  emits('nodeClick', data)
}


// 重命名项目
const renameItem = () => {
  startEdit(contextMenu.value.targetItem);
  closeContextMenu();
};

// 完成编辑
const finishEdit = (item) => {
  if (!item.uuidKey) {
    // console.log(item, 'item');
    if (item.scriptName == editName.value.trim()) {
      // 确保编辑状态已重置
      editingItem.value = null;
      // 确保菜单状态已重置
      contextMenu.value.visible = false;
      return
    }
    let flag = findParentById(fileTree.value, item.scriptId).children.find((f) => f.scriptName == editName.value.trim())
    if (flag) {
      ElMessage.error('当前文件名称已存在！')
      return
    }
    renameScriptFileApi({ scriptModel: props.modelId, scriptId: item.scriptId, scriptName: editName.value }).then((res) => {
      if (res.code == 200) {
        if (editName.value.trim() !== '') {
          item.scriptName = editName.value.trim();
        }
        ElMessage.success('重命名成功！')
      }
      // 确保编辑状态已重置
      editingItem.value = null;
      // 确保菜单状态已重置
      contextMenu.value.visible = false;
    })
  } else {
    let arr = findParentById(fileTree.value, item.scriptId)
    // console.log(arr, 'arr');
    if (arr.children && arr.children.length > 0 && arr.children.find((f) => f.scriptName) == editName.value.trim()) {
      ElMessage.error('请勿重复命名！')
    } else {
      let obj = {
        folderPaths: arr.scriptPath + '/' + editName.value.trim(),
        modelId: props.modelId
      }
      createScriptFolderApi(obj).then((res) => {
        if (res.code == 200) {
          // 确保编辑状态已重置
          editingItem.value = null;
          // 确保菜单状态已重置
          contextMenu.value.visible = false;
          emits('updateTree', res)
        }
      })
    }
  }
};



// draggingNode 被拖拽的节点 dropNode 目标节点  prev目标节点前，inner目标子级，next 目标节点后
const allowDrop = (draggingNode, dropNode, type) => {
  // 当目标节点的 scriptType 为 K 且拖拽类型为 'inner'（放置到子级）时，不允许拖拽
  if (dropNode.data.scriptType === 'K' && type === 'inner') {
    return false;
  }
  // 其他情况允许拖拽
  return true;
}

// 1. 被拖拽节点  2. 目标节点 3. 被拖拽节点位置
const successNode = (draggingNode, dropNode, draggingNodePosition, event) => {
  let obj = {
    scriptId: draggingNode.data.scriptId,
    scriptFather: draggingNodePosition == 'inner' ? dropNode.data.scriptId : dropNode.data.scriptFather,
  }
  moveScriptFileApi(obj).then((res) => {
    console.log(res, 'res');
    emits('updateTree', res)
  })
}


// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
// 递归查找节点并添加到其 children
function addNodeToTree(arr, targetId, newNode) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.scriptId === targetId) {
      if (!item.children) {
        item.children = [];
      }
      item.children.push(newNode);
      return true;
    }
    if (item.children && item.children.length > 0) {
      const found = addNodeToTree(item.children, targetId, newNode);
      if (found) return true;
    }
  }
  return false;
}


// 创建同级/下级目录
const createSiblingDirectory = (data, type) => {
  let newItem = {
    scriptName: '新建文件夹',
    scriptType: 'F',
    uuidKey: generateUUID(),
    scriptId: generateUUID(),
  }
  addNodeToTree(fileTree.value, type == 'next' ? data.scriptFather : data.scriptId, newItem)
  contextMenu.value.targetItem = newItem
  startEdit(contextMenu.value.targetItem, 'pre')
  closeContextMenu();
}



// 删除
const deleteItem = (data) => {
  let arr = []
  if (data.children && data.children.length > 0) {
    arr = getFileId(data.children, arr)
  }
  arr.push(data.scriptId)
  deleteScriptFolderApi({ scriptIds: arr }).then((res) => {
    if (res.code == 200) {
      ElMessage.success('删除成功！')
      emits('updateTree', res)
    }
  })
}


// 列表
const treeDataFn = (dataId) => {
  listScriptTreeApi({ scriptModel: dataId }).then((res) => {
    fileTree.value = res.data
    return new Promise((resolve, reject) => {
      resolve(res)
    })
  })
}

defineExpose({
  treeDataFn
})


</script>

<style lang="scss" scoped>
.file-style-container {
  width: 300px;
  margin: 0 auto;
  height: 100%;
}
:deep(.el-tree) {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
:deep(.el-tree-node__content) {
  height: 36px !important;
}
:deep(.el-tree-node:focus > .el-tree-node__content) {
  background: rgb(153 180 255 / 50%);
  border-radius: 4px;
}
.action-btn {
  background: none;
  border: none !important;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-tree-node__content) {
  width: 100%;
}
.contentFont {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 25px);
  color: #000;
}
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item.delete:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

.menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

.edit-input {
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #409eff;
  border-radius: 2px;
  font-size: 14px;
  outline: none;
  background-color: #ecf5ff;
  color: #409eff;
}

.edit-input:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>