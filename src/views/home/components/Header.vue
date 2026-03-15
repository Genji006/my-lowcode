<template>
  <div style="display: flex; line-height: 3px; align-items: center">
    <img :src="storeTheme.logo" alt="logo" width="34px" height="34px" />
    <span style="margin-left: 10px">{{ storeTheme.systemName }}</span>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { themeStoreMenu } from "@/store/theme";

const storeTheme = themeStoreMenu();

const isCollapse = inject("isCollapse");
</script>

<style></style>
