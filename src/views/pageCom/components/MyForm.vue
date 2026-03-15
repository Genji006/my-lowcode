<template>
    <el-form ref="formRef" :model="formData" :label-width="propsData.labelWidth" class="my-form" @submit.prevent
        @dragover.prevent.stop @drop.stop="onDrop">
        <div class="form-layout-wrapper" :style="layoutStyle" v-if="propsData.children && propsData.children.length > 0">
            <RecursiveRenderer v-for="child in propsData.children" :key="child.id" :conf="child" :isFlow="true" />
        </div>

        <div v-if="!propsData.children || propsData.children.length === 0" class="empty-tip">
            请将表单项拖入此处
        </div>
    </el-form>
</template>

<script setup>
import { ref, provide, reactive, computed } from 'vue'; // 引入 computed
import RecursiveRenderer from '../RecursiveRenderer.vue';
import { useDesignStore } from '../demoStore';
import { createComponent } from '../componentSchema';

const props = defineProps(['propsData', 'conf']);
const store = useDesignStore();
const formRef = ref(null);
const formData = reactive({});

// === 新增：计算 Flex 布局样式 ===
const layoutStyle = computed(() => ({
    display: 'flex',
    flexDirection: props.propsData.flexDirection || 'column', // 默认垂直
    flexWrap: props.propsData.flexWrap || 'wrap',
    justifyContent: props.propsData.justifyContent || 'flex-start',
    alignItems: props.propsData.alignItems || 'stretch',
    gap: (props.propsData.gap || 0) + 'px',
    width: '100%',
    height: '100%' // 撑满高度
}));

provide('formContext', {
    formData,
    registerField: (field, defaultValue) => {
        if (field && formData[field] === undefined) {
            formData[field] = defaultValue;
        }
    },
    validate: () => formRef.value.validate()
});

const onDrop = (e) => {
    const type = e.dataTransfer.getData('componentType');
    if (type) {
        const newComp = createComponent(type);
        // 如果是水平布局，为了不让输入框挤在一起，可以默认给个宽度
        // 如果是垂直布局，通常 width: 100% (在 CompWrapper 里如果没设 px 会默认处理)
        newComp.style.position = 'relative';
        newComp.style.left = 0;
        newComp.style.top = 0;

        // 优化：如果是横向布局，默认给个 45% 宽，方便一行放两个
        if (props.propsData.flexDirection === 'row') {
            newComp.style.width = 30;
        } else {
            newComp.style.width = 40;
        }

        store.addComponent(newComp, props.conf.id);
    }
};
</script>

<style scoped>
.my-form {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    /* === 修复滚动条问题 === */
    overflow-x: hidden;
    /* 强制隐藏横向滚动条 */
    padding: 10px;
    box-sizing: border-box;
    background-color: #fff;
    /* border: 1px dashed #eee; */
}

.form-layout-wrapper {
    min-height: 100%;
}

.empty-tip {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 12px;
    /* border: 1px dashed #ccc; */
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    pointer-events: none;
    margin-top: 10px;
}
</style>