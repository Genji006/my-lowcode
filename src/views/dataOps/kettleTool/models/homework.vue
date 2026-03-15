<template>
  <div class="newChange">
    <jobComponent />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jobComponent from '../component/jobComponent.vue'   //  转换组件

</script>

<style lang="scss" scoped>
.newChange {
  width: 100%;
  height: 100%;
}
</style>