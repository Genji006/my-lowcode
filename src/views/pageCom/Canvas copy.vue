<template>
    <div class="canvas-workspace" @click.self="handleClearSelect">
        <div class="root-screen" :style="screenStyle" id="root-screen" @dragover.prevent @drop="onDrop"
            @click.self="handleClearSelect">
            <!-- <RecursiveRenderer v-for="item in store.components" :key="item.id" :conf="item" :isFlow="false" /> -->
            <EditorRenderItem v-for="item in store.components" :key="item.id" :conf="item" :isFlow="false" />
        </div>
    </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue';
import { useDesignStore } from './demoStore';
// import RecursiveRenderer from './RecursiveRenderer.vue';
import { createComponent } from './componentSchema';
import CompWrapper from './components/CompWrapper.vue';
import MyButton from './components/MyButton.vue';
import MyContainer from './components/MyContainer.vue';
import MyInput from './components/MyInput.vue';
import MyQueryForm from './components/MyQueryForm.vue';
import MySelect from './components/MySelect.vue';
import MyTable from './components/MyTable.vue';
import MyChart from './components/MyChart.vue';
import MyText from './components/MyText.vue';

const compMap = {
    'MyButton': MyButton,
    'MyContainer': MyContainer,
    'MyForm': MyContainer, // MyForm 复用容器逻辑
    'MyInput': MyInput,
    'MySelect': MySelect,
    'MyQueryForm': MyQueryForm,
    'MyTable': MyTable,
    'MyChart': MyChart,
    'MyText': MyText
};


const store = useDesignStore();

// 定义屏幕尺寸
const screenConfig = {
    width: 1920,
    height: 1080,
    scale: 0.7 // 缩放比例，防止笔记本屏幕放不下 1920
};

const screenStyle = computed(() => ({
    width: screenConfig.width + 'px',
    height: screenConfig.height + 'px',
    // 简单的缩放处理，让它能完整显示在编辑器里
    transform: `scale(${screenConfig.scale})`,
    transformOrigin: 'top center',
    backgroundColor: '#ffffff',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)'
}));

const handleClearSelect = () => {
    store.setActive(null);
};

const EditorRenderItem = defineComponent({
    props: ['conf', 'isFlow'],
    setup(props) {
        return () => {
            const config = props.conf;
            const isFlow = props.isFlow;
            const Component = compMap[config.type] || 'div';

            // 1. 渲染业务组件 (作为内容)
            // 如果是容器，需要递归渲染 children 放入 slot
            let childrenVNodes = null;
            if (config.props.children && Array.isArray(config.props.children)) {
                childrenVNodes = config.props.children.map(child =>
                    h(EditorRenderItem, {
                        key: child.id,
                        conf: child,
                        isFlow: true // 容器内部强制为流式布局
                    })
                );
            }

            // 2. 创建业务组件 VNode
            const content = h(Component, {
                conf: config,
                propsData: config.props,
                style: { width: '100%', height: '100%' } // 填满 Wrapper
            }, {
                default: () => childrenVNodes // 将递归子节点放入默认插槽
            });

            // 2. 包裹 CompWrapper (提供拖拽、选中功能)
            return h(CompWrapper, {
                conf: config,
                isActive: store.activeId === config.id,
                isFlow: isFlow,
                // 事件绑定
                onSetActive: () => store.setActive(config.id),
                onUpdateStyle: (style) => store.updateComponentStyle(config.id, style)
            }, {
                default: () => content // 业务组件放入 Wrapper 插槽
            });
        };
    }
});

const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
        const newComp = createComponent(type);

        // 简单的坐标计算 (默认左上角，或者你可以根据鼠标位置计算)
        newComp.style.left = 0;
        newComp.style.top = 0;

        // 如果是流式布局组件，可能需要给个默认宽高
        if (['MyContainer', 'MyChart'].includes(type)) {
            newComp.style.width = 50; // 50%
            newComp.style.height = 300;
        }

        store.addComponent(newComp);
    }
};
</script>

<style scoped>
.canvas-workspace {
    width: 100%;
    height: 100%;
    overflow: auto;
    /* 允许滚动 */
    background-color: #e0e0e0;
    /* 灰色背景 */
    display: flex;
    justify-content: center;
    padding: 40px;
    /* 四周留白 */
    box-sizing: border-box;
}

.root-screen {
    /* 禁止系统默认的拖拽选中文字行为 */
    user-select: none;
    flex-shrink: 0;
    /* 防止被 flex 压缩 */
}
</style>