<template>
  <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.meta?.title">
    <template #title>
      <!-- <img :src="`/svg/${item.meta.icon}.svg`" class="icon-class" alt="" /> -->
      <span> {{ item.meta?.title }} </span>
    </template>
    <my-menu v-for="child in item.children" :key="child.menuId" :item="child" :theme-layout="themeLayout" />
  </el-sub-menu>
  <el-menu-item v-else :index="item.path" v-show="!item.hidden" @click="addRouter(item.meta.title, item.path, item.icon)" >
    <!-- <img :src="`/svg/${item.meta.icon}.svg`" alt="" class="icon-class" /> -->
    <span> {{ item.meta.title }} </span>
  </el-menu-item>
</template>

<script>
import { defineComponent } from "vue";
import { themeStoreMenu } from "@/store/theme";
export default defineComponent({
  name: "MyMenu",
  props: {
    item: {
      type: Object,
      required: true,
    },
    themeLayout: {
      type: String,
      required: true,
    },
  },
  setup() {
    const tabsStore = themeStoreMenu();
    const { addTab, setCurrentTab } = tabsStore.tabsFn;
    const addRouter = (menuName, path, icon) => {
      addTab(menuName, path, icon);
      setCurrentTab(menuName, path, icon);
    };
    return { addRouter };
  },
});
</script>
<style lang="less">
.el-menu-item.is-active > span {
  color: rgb(83, 128, 253) !important;
}
.el-menu-item.is-active .el-icon {
  color: rgb(83, 128, 253) !important;
}
.icon-class {
  width: 15px;
  margin-right: 10px;
  // transform: translateY(-50px) !important;
  // filter: drop-shadow(#5380fd 0 50px) !important;
}

// 菜单下每个item
.el-menu--horizontal {
  ul li {
    width: 94%;
    margin: 0 3%;
  }
}

//  修改有子级的样式
.el-menu--horizontal .el-menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: rgb(84, 129, 252) !important;
}
.el-menu--horizontal .el-menu .el-sub-menu.is-active > .el-menu .el-icon {
  color: rgb(83, 128, 253) !important;
}

// 修改选中时的样式
.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background: rgba(83, 128, 253, 0.15) !important;
  color: rgb(83, 128, 253) !important;
  border-radius: 5px;
}
</style>
