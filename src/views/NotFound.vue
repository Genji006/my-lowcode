<template>
  <el-result icon="warning" title="404提示" sub-title="你找的页面走丢了~">
    <template #extra>
      <el-button type="primary" @click="$router.push(findFirstItemInNestedArray(storeMenu.showMenu))">回到首页</el-button>
    </template>
  </el-result>
</template>

<script setup>
import { useStoreMenu } from "@/store/user";

const storeMenu = useStoreMenu();
// showMenu

//  找到最后一级
function findFirstItemInNestedArray(arr) {
  // 基础情况：如果数组为空，返回null或抛出错误
  if (arr.length === 0) {
    return null; // 或者抛出错误：throw new Error("Array is empty");
  }
  // 获取第一项
  const firstItem = arr[0];
  // console.log(firstItem,"firstItem");

  // 检查第一项是否是一个对象且该对象有子级数组
  if (firstItem && firstItem.children && firstItem.children.length > 0) {
    // 递归调用，查找子级数组的第一项
    return findFirstItemInNestedArray(firstItem.children);
  } else {
    // 如果没有子级数组，返回第一项的值
    return firstItem;
  }
}
</script>

<style>
</style>