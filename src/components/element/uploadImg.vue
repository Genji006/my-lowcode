<template>
  <el-upload v-model:file-list="fileList" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" list-type="picture-card" :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([])

const handlePictureCardPreview = (file) =>{

}


const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}



</script>

<style>
</style>