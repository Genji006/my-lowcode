<template>
    <div class="my-container" :style="containerStyle" @dragover.prevent.stop="onDragOver" @drop.stop="onDrop">
        <slot></slot>
        <div v-if="isEmpty && !isPreview" class="empty-tip">
            {{ isPreview ? '' : '拖拽组件到此处' }}
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useDesignStore } from '../demoStore';
import { createComponent } from '../componentSchema';

// 1. 关键修改：定义所有可能的 Props
const props = defineProps({
    conf: Object,
    propsData: Object, // 预览模式通常传这个
    // 编辑模式或者平铺传递时可能用到下面这些
    flexDirection: String,
    justifyContent: String,
    alignItems: String,
    flexWrap: String,
    gap: [Number, String],
    padding: [Number, String]
});

const store = useDesignStore();
const isPreview = inject('isPreview', false);

const isEmpty = computed(() => {
    return !props.conf.props.children || props.conf.props.children.length === 0;
});

// 2. 关键修改：统一参数来源
// 无论 PageRender 怎么传参，这里都能抓到数据
const styleParams = computed(() => {
    if (props.propsData) return props.propsData; // 优先用 propsData
    return props; // 否则直接用 props (兼容平铺传递)
});

const containerStyle = computed(() => ({
    display: 'flex',
    // 3. 从统一的 styleParams 里取值
    flexDirection: styleParams.value.flexDirection || 'row',
    flexWrap: styleParams.value.flexWrap || 'wrap',
    justifyContent: styleParams.value.justifyContent || 'flex-start',
    alignItems: styleParams.value.alignItems || 'flex-start',
    gap: (styleParams.value.gap || 0) + 'px',
    padding: (styleParams.value.padding || 0) + 'px',

    backgroundColor: props.conf.style.backgroundColor || 'transparent',
    minHeight: '100%',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative'
}));

const onDragOver = (e) => {
    if (isPreview.value) return;
    e.dataTransfer.dropEffect = 'copy';
};

const onDrop = (e) => {
    if (isPreview.value) return;
    const type = e.dataTransfer.getData('componentType');
    if (type) {
        const newComp = createComponent(type);
        newComp.style.position = 'relative';
        newComp.style.left = 0;
        newComp.style.top = 0;
        // 简单的智能宽度
        if (['MyContainer', 'MyForm', 'MyTable', 'MyChart'].includes(type)) {
            newComp.style.width = 100;
        }
        store.addComponent(newComp, props.conf.id);
    }
};
</script>

<style scoped>
.my-container {
    transition: background-color 0.2s;
    min-height: 50px;
    overflow: hidden;
}

.empty-tip {
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 12px;
}
</style>