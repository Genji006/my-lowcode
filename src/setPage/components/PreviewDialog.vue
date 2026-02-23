<template>
    <el-dialog v-model="dialogVisible" title="预览" width="80%" fullscreen destroy-on-close>
        <PageRender :schema="componentList" style="height: calc(100vh - 60px); width: 100%; overflow: auto;" />
    </el-dialog>
</template>

<script setup>
import { computed,provide } from 'vue';
import PageRender from '../pageRender.vue'; // <--- 必须引入！

const props = defineProps(['modelValue', 'componentList']);
const emit = defineEmits(['update:modelValue']);
provide('isPreview', true);
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>