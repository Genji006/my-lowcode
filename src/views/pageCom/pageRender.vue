<template>
    <div class="page-render" :style="pageStyle">
        <div v-if="!componentList || componentList.length === 0" class="empty-tip">
            <el-empty description="暂无页面内容" />
        </div>

        <template v-else>
            <div v-for="comp in componentList" :key="comp.id" class="root-component-wrapper" :style="getPosStyle(comp)">
                <RenderItem :config="comp" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, h, defineComponent, nextTick, inject } from 'vue';
import { ElSkeleton, ElEmpty } from 'element-plus';
import MyButton from './components/MyButton.vue';
import MyContainer from './components/MyContainer.vue';
import MyInput from './components/MyInput.vue';
import MyQueryForm from './components/MyQueryForm.vue';
import MySelect from './components/MySelect.vue';
import MyTable from './components/MyTable.vue';
import MyChart from './components/MyChart.vue';
import MyText from './components/MyText.vue';
import MyPieChart from './components/MyPieChart.vue';
import MyRadarChart from './components/MyRadarChart.vue';
import MyDatePicker from './components/MyDatePicker.vue';
import DashBoard from './components/DashBoard.vue';
import calCard from './components/calCard.vue';
import MyTree from './components/MyTree.vue';
import MyDynamicTitle from './components/MyDynamicTitle.vue';
import MySpChart from './components/mySpChart.vue';

import { useRouter } from 'vue-router'; // 引入路由

const router = useRouter();

const props = defineProps({
    schema: { type: [Array, String], default: () => [] }, // 页面 JSON 数据
    pageConf: { type: Object, default: () => ({}) }       // 页面级配置(背景色等)
});

// 注入预览状态 (MyContainer等组件可能需要用到)
const isPreview = inject('isPreview', true);

// === 2. 解析 Schema ===
const componentList = computed(() => {
    try {
        const list = typeof props.schema === 'string' ? JSON.parse(props.schema) : props.schema;
        return list;
    } catch (e) {
        console.error('JSON 解析挂了:', e);
        return [];
    }
});

// 组件树扁平化
const flatComponentMap = computed(() => {
    const map = {};
    const traverse = (list) => {
        if (!list || !Array.isArray(list)) return;
        list.forEach(comp => {
            map[comp.id] = comp;
            // 递归查找子组件 (子组件通常存在 props.children 中)
            if (comp.props && comp.props.children) {
                traverse(comp.props.children);
            }
        });
    };
    traverse(componentList.value);
    return map;
});

// === 3. 全局数据池 ===
const globalDataStore = ref({});

// === 4. 组件映射表 ===
const compMap = {
    'MyButton': MyButton,
    'MyContainer': MyContainer,
    'MyForm': MyContainer, // 表单通常也是一个容器
    'MyInput': MyInput,
    'MySelect': MySelect,
    'MyQueryForm': MyQueryForm,
    'MyTable': MyTable,
    'MyChart': MyChart,
    'MyText': MyText,
    'MyScatterChart': MyChart,  // 散点图 -> 复用 MyChart (通过策略模式渲染)
    'MyPieChart': MyPieChart,   // 饼图
    'MyRadarChart': MyRadarChart, // 雷达图
    'MyDatePicker': MyDatePicker,
    'DashBoard': DashBoard,
    'calCard': calCard,
    'MyTree': MyTree,
    'MyDynamicTitle': MyDynamicTitle,
    'MySpChart': MySpChart,
};

const getPathValue = (obj, path) => {
    if (!path || !obj) return obj;
    // 如果没有点号，直接取值
    if (!path.includes('.')) return obj[path];
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
};

// === 5. 核心逻辑：依赖解析 ===
const resolveLinkage = (config) => {
    // A. 无依赖：直接放行
    if (!config.dependsOn || (Array.isArray(config.dependsOn) && config.dependsOn.length === 0)) {
        return { canRender: true, params: {} };
    }

    const dependencies = Array.isArray(config.dependsOn) ? config.dependsOn : [config.dependsOn];
    let combinedParams = {};
    let isReady = false;

    // 检查所有依赖是否在 Store 里有数据
    const readyCount = dependencies.filter(depId => globalDataStore.value[depId] !== undefined).length;
    if (readyCount === dependencies.length) {
        isReady = true;
    }

    if (!isReady) {
        return { canRender: false, params: {} };
    }

    dependencies.forEach(depId => {
        const sourceCompConfig = flatComponentMap.value[depId];
        const sourceData = globalDataStore.value[depId];

        // 如果上游没数据，视为未就绪
        if (sourceData === undefined || sourceData === null) {
            isReady = false;
            return;
        }

        // === 核心逻辑：参数映射 ===
        const mappings = config.paramsMapping ? config.paramsMapping[depId] : [];

        if (mappings && mappings.length > 0) {
            // A. 精准模式：按配置取值
            mappings.forEach(rule => {
                if (rule.target && rule.source) {
                    const val = getPathValue(sourceData, rule.source);
                    combinedParams[rule.target] = val;
                }
            });
        } else {
            const apiKey = sourceCompConfig?.bindKey || depId;
            // B. 懒人模式：没有配置映射，尝试全量合并
            if (sourceData.value !== undefined) {
                combinedParams[apiKey] = sourceData.value; // 简单值
            } else if (sourceData.formData) {
                Object.assign(combinedParams, sourceData.formData); // 表单数据
            } else {
                Object.assign(combinedParams, sourceData); // 其他对象
            }
        }
    });
    if (isReady && Object.keys(combinedParams).length > 0) {
        console.log(
            `%c[依赖解析] 目标组件: ${config.name} (${config.id})`,
            'color: #fff; background: #67c23a; padding: 2px 6px; border-radius: 3px;',
            '\n  ├─ 依赖源:', dependencies,
            '\n  └─ 最终参数:', combinedParams
        );
    }
    return { canRender: true, params: combinedParams };

};
// === 6. 数据更新函数 ===
const updateData = (id, data) => {
    if (!id) return;
    console.log(
        `%c[数据更新] 源组件: ${id}`,
        'color: #fff; background: #409eff; padding: 2px 6px; border-radius: 3px;',
        data
    );
    nextTick(() => {
        try {
            globalDataStore.value[id] = JSON.parse(JSON.stringify(data));
        } catch (e) {
            console.error('数据非JSON格式，直接赋值', e);
            globalDataStore.value[id] = data;
        }
    });
};

// 预览样式转换辅助函数
const getComponentStyle = (config) => {
    const { width, height, isAutoFill } = config.style || {};

    let style = {
        position: 'relative',
        boxSizing: 'border-box',
        minWidth: 0,
    };

    // 1. 处理宽度
    if (typeof width === 'number') {
        style.width = width + '%';
        style.flex = '0 0 auto';

    } else if (width === 'auto') {
        style.width = 'auto';
        style.flex = '0 0 auto';
    } else if (typeof width === 'string') {
        style.width = width;
        style.flex = '0 0 auto';
    }

    // 2. 处理高度
    if (typeof height === 'number') {
        style.height = height + '%';
    } else if (height) {
        style.height = height;
    }

    // 3. 处理自动填充 (Flex 布局)
    if (isAutoFill) {
        style.flex = '1 1 0%'; // 强制占满剩余空间
        style.width = '100%';  // 宽度通常也要撑满
        style.height = '100%'; // 高度撑满
        style.maxWidth = '100%';
    }

    return style;
};

// === 7. 内部递归渲染组件 ===
const RenderItem = defineComponent({
    name: 'RenderItem',
    props: ['config'],
    setup(innerProps) {
        return () => {
            const config = innerProps.config;
            const { canRender, params } = resolveLinkage(config);
            // --- 普通组件 (依赖未就绪) ---
            if (!canRender) {
                return h('div', {
                    style: {
                        width: '100%', height: '100%',
                        background: '#f9f9f9', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        border: '1px dashed #e0e0e0', padding: '10px', boxSizing: 'border-box',
                        color: '#909399', fontSize: '12px'
                    }
                }, [
                    h(ElSkeleton, { animated: true, rows: 1 }),
                    h('div', { style: 'margin-top:5px' },
                        `等待依赖: ${Array.isArray(config.dependsOn) ? config.dependsOn.join(', ') : config.dependsOn}`
                    )
                ]);
            }

            // --- 普通组件 (正常渲染) ---
            const TargetComponent = compMap[config.type] || 'div';
            const dynamicStyle = getComponentStyle(config);
            let childrenSlot = null;
            if (config.props.children && Array.isArray(config.props.children)) {
                childrenSlot = {
                    default: () => config.props.children.map(child =>
                        h(RenderItem, { config: child, key: child.id })
                    )
                };
            }
            return h(TargetComponent, {
                key: config.id, // 关键：依赖变了可能导致 key 变了从而重绘
                conf: config,   // 传递组件原始配置
                // 传递合并后的动态参数
                apiParams: params,
                // 传递绑定键 (供组件内部提取 targetId)
                bindKey: config.bindKey,
                // 传递静态 Props (如 placeholder, label 等)
                propsData: config.props,
                // 传递预览样式
                style: dynamicStyle,
                // 事件监听：将组件内部事件统一映射到 updateData
                // 表单提交 -> 触发 'submit' 事件类型
                // onSubmit: (data) => {
                //     handleInteraction(config.id, 'submit', data);
                // },
                // onLoad: (data) => handleInteraction(config.id, 'load', data), // 对应 ConfigPanel 里的 'load'
                // // 表格点击 -> 触发 'click' 或 'row-click'
                // onRowClick: (data) => handleInteraction(config.id, 'click', data), // 对应 ConfigPanel 里的 'click'
                // // 输入改变 -> 触发 'change'
                // onChange: (data) => handleInteraction(config.id, 'change', data),
                // // 按钮点击
                // onClick: (data) => handleInteraction(config.id, 'click', data)
                onUpdateData: (payload) => {
                    // 存入全局 Store
                    updateData(config.id, payload);
                },
            }, childrenSlot);
        };
    }
});

// === 8. 样式处理 ===
// 仅用于根节点的绝对定位，子节点由容器 Flex 控制
const getPosStyle = (comp) => {
    return {
        position: 'absolute',
        left: (comp.style.left || 0) + '%',
        top: (comp.style.top || 0) + '%',
        width: comp.style.width + '%',
        height: typeof comp.style.height === 'number' ? comp.style.height + '%' : (comp.style.height || 'auto'),
        zIndex: comp.style.zIndex || 1
    };
};

const pageStyle = computed(() => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: props.pageConf.backgroundColor || '#f5f7fa',
    backgroundImage: props.pageConf.backgroundImage ? `url(${props.pageConf.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'auto' // 允许页面滚动
}));

</script>

<style scoped>
.page-render {
    box-sizing: border-box;
}

.empty-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.root-component-wrapper {
    /* 确保 wrapper 不会影响内部组件布局 */
    box-sizing: border-box;
    /* 根节点通常是绝对定位，不需要 flex */
}
</style>