<template>
  <el-menu
    :default-active="$route.path"
    router
    :mode="themeStore.menuLayout"
    unique-opened
  >
    <menu-item
      class="top-menu-item"
      style="background-color: #ffffff"
      v-for="item in menus"
      :item="item"
      :key="item"
      :theme-layout="themeStore.menuLayout"
    />
  </el-menu>
</template>
<script setup>
import { inject } from "vue";
import { useStoreMenu } from "@/store/user";
import { themeStoreMenu } from "@/store/theme";
import MenuItem from "./menuItem.vue";

const storMenu = useStoreMenu();
const themeStore = themeStoreMenu();

const menus = storMenu.showMenu; //  展示是菜单
</script>

<style lang="less" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 10px 0;
  img {
    margin-right: -10px;
  }
  h1 {
    color: #000;
    margin-left: 10px;
    font-size: 22px;
  }
}
.el-menu {
  border-right: none;
}
</style>
<style lang="less" scoped>
::v-deep(.top-menu-item .el-menu-item:hover),
::v-deep(.top-menu-item .el-sub-menu__title:hover) {
  color: #5481fc;
}
</style>
