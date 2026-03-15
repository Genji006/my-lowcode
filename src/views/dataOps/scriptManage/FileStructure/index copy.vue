<template>
  <div class="file-structure-demo">
    <div style="height:40px" class="fileTitle" @click="close">
      {{ "文件结构 <"}}
    </div>
    <!-- dataOption -->
    <FileStructure :fileTree="fileTree" :modelId="modelId" @upload="handleUpload" @create-sibling="handleCreateSibling" @create-child="handleCreateChild" @delete="handleDelete" />
  </div>
</template>

<script setup>
import { ref, provide, reactive } from 'vue';
import FileStructure from './FileStructure.vue';

const props = defineProps({
  modelId: {
    type: String,
    required: true,
    default: '',
  },
  dataOption: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close', false);
}
// 全局菜单状态管理
const globalMenuState = reactive({
  activeMenu: null,
  closeAll: () => {
    if (globalMenuState.activeMenu) {
      globalMenuState.activeMenu.close();
      globalMenuState.activeMenu = null;
    }
  }
});

provide('globalMenuState', globalMenuState);

// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 为树节点添加UUID和父级引用
const addUUIDToTree = (tree, parent = null) => {
  return tree.map(item => {
    const newItem = {
      ...item,
      uuidKey: generateUUID(),
      parent: parent
    };
    if (item.children && item.children.length > 0) {
      newItem.children = addUUIDToTree(item.children, newItem);
    }
    return newItem;
  });
};



// 模拟文件树数据
const fileTree = ref(addUUIDToTree([
  {
    "scriptId": "85d2f6b5-be97-4145-bd5b-ab3397467838",
    "scriptName": "绩效考核指标计分表+宋淑鹏.xlsx",
    "scriptFormat": "xlsx",
    "scriptSize": "17860",
    "scriptOrder": null,
    "scriptUploadUser": "admin",
    "scriptUploadTime": "2026-03-10 11:05:03",
    "scriptPath": "等级评审分析模型/ccc/bbb",
    "scriptDescribe": null,
    "scriptVersion": null,
    "scriptModel": null,
    "scriptType": "F",
    "expanded": true,
    "scriptFather": "e0de965c-9b23-4173-8028-3844023a2688",
    "children": [
      {
        "scriptId": "85d2f6b5-be97-4145-bd5b-ab3397467832",
        "scriptName": "绩效考核指标计分表+宋淑鹏.xlsx",
        "scriptFormat": "xlsx",
        "scriptSize": "17860",
        "scriptOrder": null,
        "scriptUploadUser": "admin",
        "scriptUploadTime": "2026-03-10 11:05:03",
        "scriptPath": "等级评审分析模型/ccc/bbb",
        "scriptDescribe": null,
        "scriptVersion": null,
        "scriptModel": null,
        "scriptType": "K",
        "scriptFather": "85d2f6b5-be97-4145-bd5b-ab3397467838",
      }
    ]
  },
  {
    "scriptId": "c4018d3f-f71d-48c6-92ef-d82013f05ff0",
    "scriptName": "数据库监听重启.txt",
    "scriptFormat": "txt",
    "scriptSize": "2945",
    "scriptOrder": null,
    "scriptUploadUser": "admin",
    "scriptUploadTime": "2026-03-10 11:05:03",
    "scriptPath": "等级评审分析模型/aaa/bbb",
    "scriptDescribe": null,
    "scriptVersion": null,
    "scriptModel": null,
    "scriptType": "F",
    "scriptFather": "a012c36e-fb58-4925-9b7b-9f7b3cb9cf0f"
  }
]))

// 处理上传事件
const handleUpload = (item) => {
  console.log('上传文件到:', item.name);
  // 创建文件输入元素
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;

  // 监听文件选择事件
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      // 处理选中的文件
      handleSelectedFiles(item, files);
    }
  });

  // 触发文件选择对话框
  fileInput.click();
};

// 处理选中的文件
const handleSelectedFiles = (item, files) => {
  console.log(`选择了 ${files.length} 个文件，准备上传到:`, item.name);
  // 模拟上传过程
  Array.from(files).forEach((file, index) => {
    console.log(`上传文件 ${index + 1}:`, file.name);
    // 创建新的文件节点
    const newFile = {
      name: file.scriptName,
      type: 'K',
      expanded: false,
      children: [],
      uuidKey: generateUUID(),
      parent: item
    };

    // 根据目标项类型决定添加位置
    if (item.type === 'folder') {
      // 如果目标是文件夹，添加到文件夹内
      if (!item.children) {
        item.children = [];
      }
      item.children.push(newFile);
      item.expanded = true;
    } else {
      // 如果目标是文件，添加到同级目录
      const parentTree = item.parent ? item.parent.children : fileTree.value;
      const targetIndex = parentTree.findIndex(child => child.uuidKey === item.uuidKey);
      if (targetIndex !== -1) {
        parentTree.splice(targetIndex + 1, 0, newFile);
      }
    }

    // 模拟上传完成
    setTimeout(() => {
      console.log(`文件 ${file.name} 上传完成`);
    }, 500 * (index + 1));
  });
};

// 递归查找并修改树节点
const findAndModifyTreeNode = (tree, targetItem, action, newData = null) => {
  for (let i = 0; i < tree.length; i++) {
    const currentItem = tree[i];

    if (currentItem.uuidKey === targetItem.uuidKey) {
      switch (action) {
        case 'rename':
          if (newData) {
            currentItem.name = newData;
          }
          return true;
        case 'delete':
          tree.splice(i, 1);
          return true;
        case 'add-child':
          if (!currentItem.children) {
            currentItem.children = [];
          }
          currentItem.children.push(newData);
          currentItem.expanded = true;
          return true;
      }
    } else if (currentItem.children && currentItem.children.length > 0) {
      const found = findAndModifyTreeNode(currentItem.children, targetItem, action, newData);
      if (found) {
        return true;
      }
    }
  }
  return false;
};

// 处理创建同级目录事件
const handleCreateSibling = (item, callback) => {
  console.log('在', item.name, '同级创建目录');
  // 找到父级目录
  const parentTree = item.parent ? item.parent.children : fileTree.value;
  // 创建新的同级目录
  const newSibling = {
    name: '新目录',
    type: 'folder',
    expanded: false,
    children: [],
    uuidKey: generateUUID(),
    parent: item.parent
  };

  // 找到目标项的索引并插入新目录
  const targetIndex = parentTree.findIndex(child => child.uuidKey === item.uuidKey);
  if (targetIndex !== -1) {
    parentTree.splice(targetIndex + 1, 0, newSibling);

    // 调用回调函数，启动编辑模式
    if (callback) {
      callback(newSibling);
    }
  }
};

// 处理创建下级目录事件
const handleCreateChild = (item, callback) => {
  console.log('在', item.name, '下创建目录');
  // 确保目标项是文件夹
  if (item.type !== 'folder') {
    console.warn('只能在文件夹下创建下级目录');
    return;
  }

  // 创建新的下级目录
  const newChild = {
    name: '新目录',
    type: 'folder',
    expanded: false,
    children: [],
    uuidKey: generateUUID(),
    parent: item
  };

  // 添加到目标项的子级
  if (!item.children) {
    item.children = [];
  }
  item.children.push(newChild);
  item.expanded = true;

  // 调用回调函数，启动编辑模式
  if (callback) {
    callback(newChild);
  }
};

// 处理重命名事件
const handleRename = (item) => {
  console.log('重命名:', item.name);
  // 重命名操作在子组件中直接处理，这里不需要任何操作
};

// 处理删除事件
const handleDelete = (item) => {
  console.log('删除:', item.name);

  // 弹出确认对话框
  if (confirm(`确定要删除 "${item.name}" 吗？`)) {
    // 查找并删除节点
    findAndModifyTreeNode(fileTree.value, item, 'delete');
  }
};
</script>

<style scoped>
.file-structure-demo {
  /* max-width: 400px; */
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: #fff;
}
.fileTitle {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: rgb(82, 127, 251);
  font-weight: bold;
  cursor: pointer;
}
</style>