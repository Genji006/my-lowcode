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
    padding: [Number, String], // 兼容旧数据
    paddingTop: [Number, String],
    paddingRight: [Number, String],
    paddingBottom: [Number, String],
    paddingLeft: [Number, String]
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

const containerStyle = computed(() => {
    const params = styleParams.value;

    const pt = params.paddingTop !== undefined ? params.paddingTop : (params.padding || 0);
    const pr = params.paddingRight !== undefined ? params.paddingRight : (params.padding || 0);
    const pb = params.paddingBottom !== undefined ? params.paddingBottom : (params.padding || 0);
    const pl = params.paddingLeft !== undefined ? params.paddingLeft : (params.padding || 0);

    return {
        display: 'flex',
        flexDirection: params.flexDirection || 'row',
        flexWrap: params.flexWrap || 'wrap',
        justifyContent: params.justifyContent || 'flex-start',
        alignItems: params.alignItems || 'flex-start',
        gap: (params.gap || 0) + 'px',
        padding: `${pt}px ${pr}px ${pb}px ${pl}px`,

        backgroundColor: props.conf.style.backgroundColor || 'transparent',
        // minHeight: '100%',
        // width: '100%',
        width: '100%',  // 强制占满 CompWrapper 的宽
        height: '100%', // 强制占满 CompWrapper 的高
        boxSizing: 'border-box',
        position: 'relative'
    };
});
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
    min-height: 20px;
    overflow: hidden;
}

.empty-tip {
    width: 100%;
    height: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 12px;
}
</style>