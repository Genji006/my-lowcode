<template>
  <div class="file-structure">
    <div v-for="item in fileTree" :key="item.uuidKey" class="file-item">
      <div class="file-item-header" :class="{ 'selected': selectedItem === item }" @click="toggleExpand(item); selectedItem = item" @contextmenu="handleContextMenu(item, $event)">
        <span class="icon-wrapper">
          <span v-if="item.scriptType === 'F' && item.children && item.children.length > 0" class="expand-icon">
            {{ item.expanded ? '📂' : '📁' }}
          </span>
          <span v-else-if="item.scriptType === 'K'" class="file-icon">📄</span>
          <span v-else class="file-icon">📁</span>
        </span>
        <span v-if="!editingItem || editingItem.uuidKey !== item.uuidKey" v-show-tip class="file-name">
          <el-tooltip :content="item.scriptName" placement="top" :show-after="300">
            {{ item.scriptName }}
          </el-tooltip>
        </span>
        <div v-else class="file-name-edit">
          <input v-model="editName" @keyup.enter="finishEdit(item)" @blur="finishEdit(item)" ref="editInput" class="edit-input" />
        </div>
        <div class="file-actions">
          <button @click.stop="handleContextMenu(item, $event)" class="action-btn">
            ⋯
          </button>
        </div>
      </div>
      <div v-if="item.scriptType === 'F' && item.expanded && item.children && item.children.length > 0" class="file-children">
        <FileStructure :modelId="modelId" :fileTree="item.children" @upload="handleUpload" @create-sibling="handleCreateSibling" @create-child="handleCreateChild" @delete="handleDelete" />
      </div>
    </div>

    <!-- 本地上下文菜单 -->
    <div v-if="contextMenu.visible" class="context-menu" :style="{ left: (contextMenu.x + 10) + 'px', top: contextMenu.y + 'px' }">
      <div class="menu-item">
        <el-upload ref="uploadRef" :action="`/api/data-ops/createFolder/${props.modelId}`" :auto-upload="true" :headers="headers" :on-change="handleChange" :multiple="false" :on-success="handleSuccess" name="file">
          <span class="menu-icon">📤</span>
          上传
        </el-upload>
      </div>
      <div class="menu-item">
        <span class="menu-icon">🛠️</span>
        替换
      </div>
      <div v-if="contextMenu.targetItem && contextMenu.targetItem.scriptType === 'F'" class="menu-item" @click="createSiblingDirectory">
        <span class="menu-icon">📁</span>
        创建同级目录
      </div>
      <div v-if="contextMenu.targetItem && contextMenu.targetItem.scriptType === 'F'" class="menu-item" @click="createChildDirectory">
        <span class="menu-icon">📁</span>
        创建下级目录
      </div>
      <div class="menu-item" @click="renameItem">
        <span class="menu-icon">✏️</span>
        重命名
      </div>
      <div class="menu-item delete" @click="deleteItem">
        <span class="menu-icon">🗑️</span>
        删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, nextTick, inject } from 'vue';

const headers = {
  Authorization: sessionStorage.getItem("token")
}

// 注入全局菜单状态
const globalMenuState = inject('globalMenuState');

const props = defineProps({
  modelId: {
    type: String,
    required: true,
    default: '',
  },
  fileTree: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['upload', 'create-sibling', 'create-child', 'delete']);

const selectedItem = ref(null);
const editingItem = ref(null);
const editName = ref('');
const editInput = ref(null);
const uploadRef = ref(null);
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  targetItem: null
});

// 切换目录展开/折叠
const toggleExpand = (item) => {
  if (item.scriptType === 'F' && item.children && item.children.length > 0) {
    item.expanded = !item.expanded;
  }
};

// 处理上下文菜单
const handleContextMenu = (item, event) => {
  event.preventDefault();
  event.stopPropagation();

  // 确保编辑状态已重置
  if (editingItem.value) {
    editingItem.value = null;
  }

  // 先关闭所有其他菜单
  if (globalMenuState) {
    globalMenuState.closeAll();
  }

  // 强制关闭当前菜单
  contextMenu.value.visible = false;

  // 短暂延迟后显示新菜单
  setTimeout(() => {
    // 更新选中项
    selectedItem.value = item;

    // 显示本地菜单
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetItem: item
    };
    // 注册当前菜单到全局状态
    if (globalMenuState) {
      globalMenuState.activeMenu = {
        close: closeContextMenu
      };
    }

    // 添加全局点击事件监听器
    setTimeout(() => {
      document.addEventListener('click', closeContextMenu, { once: true });
    }, 0);
  }, 50);
};

// 关闭上下文菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false;
  // 清除全局菜单状态
  if (globalMenuState) {
    globalMenuState.activeMenu = null;
  }
};

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


const handleSuccess = (response, uploadFile, uploadFiles) => {
  console.log("response", response);
  console.log("uploadFile", uploadFile);
  console.log("uploadFiles", uploadFiles);
}


const handleChange = (response, uploadFile, uploadFiles) => {
  console.log("response", response);
  console.log("uploadFile", uploadFile);
  console.log("uploadFiles", uploadFiles);
}





// 完成编辑
const finishEdit = (item) => {
  if (editName.value.trim() !== '') {
    item.scriptName = editName.value.trim();
  }
  // 确保编辑状态已重置
  editingItem.value = null;
  // 确保菜单状态已重置
  contextMenu.value.visible = false;
};

// 上传文件
const uploadFile = () => {
  emit('upload', contextMenu.value.targetItem);
  closeContextMenu();
};

// 创建同级目录
const createSiblingDirectory = () => {
  emit('create-sibling', contextMenu.value.targetItem, startEdit);
  closeContextMenu();
};

// 创建下级目录
const createChildDirectory = () => {
  emit('create-child', contextMenu.value.targetItem, startEdit);
  closeContextMenu();
};

// 重命名项目
const renameItem = () => {
  startEdit(contextMenu.value.targetItem);
  closeContextMenu();
};

// 删除项目
const deleteItem = () => {
  emit('delete', contextMenu.value.targetItem);
  closeContextMenu();
};

// 处理上传事件
const handleUpload = (item) => {
  emit('upload', item);
};

// 处理创建同级目录事件
const handleCreateSibling = (item) => {
  emit('create-sibling', item, startEdit);
};

// 处理创建下级目录事件
const handleCreateChild = (item) => {
  emit('create-child', item, startEdit);
};

// 处理重命名事件
const handleRename = (item) => {
  startEdit(item);
};

// 处理删除事件
const handleDelete = (item) => {
  emit('delete', item);
};
</script>

<style scoped>
.file-structure {
  font-family: Arial, sans-serif;
  padding: 10px;
  width: 100%;
  height: calc(100% - 40px);
  overflow-y: auto;
  box-sizing: border-box;
  padding-right: 0px;
}

.file-item-header {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-item-header:hover {
  background-color: #f5f7fa;
}

.file-item-header.selected {
  background-color: #ecf5ff;
  color: #409eff;
}

.file-item-header.selected .file-name {
  color: #409eff;
}

.icon-wrapper {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.expand-icon {
  font-size: 14px;
  color: #606266;
}

.file-icon {
  font-size: 14px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  /* cursor: default; */
}

/* .file-name:hover::after {
  content: attr(title);
  position: absolute;
  left: 0;
  bottom: 100%;
  margin-bottom: 5px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1001;
  pointer-events: none;
} */

.file-name-edit {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
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

.file-actions {
  margin-left: 8px;
  cursor: pointer;
}

.action-btn {
  background: none;
  border: none;
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

.file-children {
  margin-left: 18px;
  border-left: 1px solid #e4e7ed;
  box-sizing: border-box;
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
</style>