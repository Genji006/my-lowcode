<template>
  <div class="div-label cardShadow">
    <div v-for="(item, index) in listPath" :key="index" :class="indexShow == index ? 'div-item' : 'div-items'"
      @contextmenu.prevent="showContextMenu($event, item, index)">
      <p @click="handItemTab(item, index)">{{ item.label }}</p>
      <!-- 为每个菜单添加唯一的 ref -->
      <div
        :ref="el => { if (el) contextMenuRefs[index] = el }"
        class="context-menu"
        v-if="isShow && clickIndex == index"
        tabindex="-1"
        @blur="isShow = false">
        <h3>添加组件</h3>
        <p v-for="tab in componentsList" :key="tab.id" class="menu-item" @click="addComponent(tab, item, index)">
          {{ tab.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { componentsList } from "../../views/tool/setPage/index.js";

const emit = defineEmits(["addTab", "changTab"]);
// 创建一个映射来存储所有菜单 refs
const contextMenuRefs = {};
const indexShow = ref(0);
const clickIndex = ref(0);
const isShow = ref(false);

const prop = defineProps({
  listPath: {
    type: Array,
    default: () => [],
  },
});

const handItemTab = (item, index) => {
  indexShow.value = index;
  emit("changTab", { item, index });
};

const showContextMenu = (event, item, index) => {
  // 先设置为 false 再设置为 true，确保触发 watch
  isShow.value = false;
  nextTick(() => {
    clickIndex.value = index;
    isShow.value = true;
  });
};

// 监听 isShow 变化并在为 true 时聚焦
watch(isShow, (newVal) => {
  if (newVal) {
    nextTick(() => {
      // 获取当前显示的菜单并聚焦
      const targetMenu = contextMenuRefs[clickIndex.value];
      if (targetMenu) {
        targetMenu.focus();
      }
    });
  }
});

// 确定添加组件
const addComponent = (tab, item, index) => {
  isShow.value = false;
  emit("addTab", { tab, item, index });
};

// 处理点击外部区域关闭菜单
const handleClickOutside = (event) => {
  if (!isShow.value) return;

  // 检查点击的元素是否在当前菜单内
  const currentMenu = contextMenuRefs[clickIndex.value];
  if (currentMenu && !currentMenu.contains(event.target)) {
    isShow.value = false;
  }
};

// 挂载时添加事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scope>
.div-label {
  width: 100%;
  height: 100%;
  padding: 10px 5px;
  box-sizing: border-box;
  overflow-y: auto;

  .div-item {
    width: 100%;
    background-color: rgb(232, 242, 255);
    border-radius: 3px;
    position: relative;

    p {
      color: rgb(25, 128, 255);
      padding: 10px 15px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }

  .div-items {
    width: 100%;
    position: relative;
    border-radius: 3px;

    p {
      padding: 10px 15px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }

  // 添加右键菜单样式
  .context-menu {
    position: absolute;
    width: 150px;
    background-color: #ffffff;
    left: 10px;
    top: 20px;
    z-index: 99;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    border: 1px solid #e4e7ed;
    outline: none;

    h3 {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      padding: 8px 16px;
      margin: 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .menu-item {
      color: #303133;
      font-size: 14px;
      padding: 10px 16px;
      margin: 0;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }
    }
  }
}
</style>
