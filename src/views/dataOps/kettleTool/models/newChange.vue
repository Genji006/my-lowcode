<template>
  <div class="newChange">
    <changeComponent />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import changeComponent from '../component/changeComponent.vue'   //  转换组件

</script>

<style lang="scss" scoped>
.newChange {
  width: 100%;
  height: 100%;
}
</style>