<template>
    <div class="comp-wrapper" :class="{
        active: isActive && !isPreview,
        'is-flow': isFlow,
        'preview-mode': isPreview,
        'drag-over': isDragOver,
        'layer-hover': isLayerHover
    }" :style="wrapperStyle" :draggable="canDrag" @dragstart.stop="handleFlowDragStart"
        @dragover.stop="handleFlowDragOver" @dragleave.stop="handleFlowDragLeave" @drop.stop="handleFlowDrop"
        @mousedown.stop="startDrag" @click.stop="onSelect">
        <div class="inner-content">
            <slot></slot>
        </div>

        <template v-if="isActive && !isPreview">
            <div class="delete-btn" @click.stop="handleDelete" title="删除组件">
                <el-icon>
                    <CloseBold />
                </el-icon>
            </div>

            <div class="resize-handle br" @mousedown.stop="startResize($event, 'br')" v-if="!conf.style.isAutoFill">
            </div>
            <div class="resize-handle r" @mousedown.stop="startResize($event, 'r')" v-if="!conf.style.isAutoFill"></div>
            <div class="resize-handle b" @mousedown.stop="startResize($event, 'b')" v-if="!conf.style.isAutoFill"></div>

            <template v-if="!isFlow">
                <div class="resize-handle t" @mousedown.stop="startResize($event, 't')"></div>
                <div class="resize-handle l" @mousedown.stop="startResize($event, 'l')"></div>
                <div class="resize-handle tl" @mousedown.stop="startResize($event, 'tl')"></div>
                <div class="resize-handle tr" @mousedown.stop="startResize($event, 'tr')"></div>
                <div class="resize-handle bl" @mousedown.stop="startResize($event, 'bl')"></div>
            </template>
        </template>
    </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { useDesignStore } from '../demoStore';
import { CloseBold } from '@element-plus/icons-vue';

const store = useDesignStore();

const isPreview = inject('isPreview', false);


const props = defineProps({
    conf: Object,
    isActive: Boolean,
    isFlow: Boolean
});

const emit = defineEmits(['update-style', 'set-active']);
const isDragOver = ref(false); // 拖拽悬停状态

const wrapperStyle = computed(() => {
    const { width, height, left, top, zIndex, isAutoFill } = props.conf.style;

    // === 辅助工具：格式化单位 ===
    const formatUnit = (val) => {
        if (val === null || val === undefined || val === '' || val === 'auto') return 'auto';
        if (typeof val === 'string' && (val.endsWith('px') || val.endsWith('%') || val.endsWith('vh') || val.startsWith('calc'))) {
            return val;
        }
        const num = Number(val);
        if (!isNaN(num)) return `${num}%`;
        return val;
    };

    // 计算最终宽高 CSS 值
    let finalWidth = formatUnit(width);
    let finalHeight = formatUnit(height);

    // === 核心判断：是否应该强制撑满剩余空间 (Flex Grow) ===
    // 只有当显式开启 isAutoFill 时，才给予 flex: 1 的权重
    // 注意：仅仅设置 height: 100% 不应该触发 flex: 1，否则会导致水平排列时宽度被平分

    // 基础样式
    const style = {
        width: finalWidth,
        height: finalHeight,
        boxSizing: 'border-box',
        marginBottom: '0',
        minWidth: 0,
    };

    // === 预览模式 (Preview) ===
    if (isPreview.value) {
        let borderStyle = props.conf.style.border;
        if (props.conf.type === 'MyContainer' && borderStyle && borderStyle.includes('dashed')) {
            borderStyle = 'none';
        }

        const previewStyle = {
            ...style,
            position: props.isFlow ? 'relative' : 'absolute',
            left: !props.isFlow ? formatUnit(left) : undefined,
            top: !props.isFlow ? formatUnit(top) : undefined,
            border: borderStyle || 'none',
            pointerEvents: 'auto',
            zIndex: zIndex || 'auto'
        };

        if (props.isFlow) {
            if (isAutoFill) {
                Object.assign(previewStyle, {
                    flex: '1 1 0%', // 强制占满剩余空间
                    width: '100%',  // 宽度通常也要撑满
                    height: '100%',
                    maxWidth: '100%'
                });
            } else {
                // 普通流式组件防止被压缩
                Object.assign(previewStyle, {
                    flexShrink: 0
                });
            }
        }
        return previewStyle;
    }

    // === 编辑模式 (Editor) ===
    if (props.isFlow) {
        if (isAutoFill) {
            return {
                ...style,
                position: 'relative',
                flex: '1 1 0%',
                width: '100%',
                maxWidth: '100%',
                // 注意：编辑模式下，选中时使用蓝色实线，未选中时如果是容器且有边框则显示，否则透明虚线
                border: props.isActive ? '1px solid #409eff' : '1px dashed transparent'
            };
        }

        // 普通流式组件
        return {
            ...style,
            position: 'relative',
            maxWidth: '100%',
            flexShrink: 0,
            border: props.isActive ? '1px solid #409eff' : '1px dashed transparent'
        };
    } else {
        // 绝对定位模式
        return {
            ...style,
            position: 'absolute',
            left: formatUnit(left),
            top: formatUnit(top),
            zIndex: props.isActive ? 999 : (zIndex || 1),
            border: props.isActive ? '1px solid #409eff' : 'none'
        };
    }
});

// === 2. 拖拽排序逻辑 (流式布局) ===
const canDrag = computed(() => props.isFlow && !isPreview.value);

const handleFlowDragStart = (e) => {
    if (!canDrag.value) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('flow-drag-id', props.conf.id);
};

const handleFlowDragOver = (e) => {
    if (!canDrag.value) return;
    e.preventDefault(); // 必须调用，否则不会触发 drop
    e.dataTransfer.dropEffect = 'move';
    isDragOver.value = true;
};

const handleFlowDragLeave = () => {
    isDragOver.value = false;
};

const handleFlowDrop = (e) => {
    if (!canDrag.value) return;
    e.preventDefault();
    e.stopPropagation();
    isDragOver.value = false;

    const srcId = e.dataTransfer.getData('flow-drag-id');
    const targetId = props.conf.id;

    // 调用 Store 移动位置
    if (srcId && targetId && srcId !== targetId) {
        store.moveComponent(srcId, targetId);
    }
};


const onSelect = () => {
    if (isPreview.value) return; // 预览模式下禁止选中
    emit('set-active', props.conf.id);
};

const handleDelete = () => {
    store.deleteComponent(props.conf.id);
};

// 拖拽逻辑 (仅绝对定位有效)
const startDrag = (e) => {
    if (isPreview.value || props.isFlow) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = Number(props.conf.style.left || 0);
    const startTop = Number(props.conf.style.top || 0);

    // === 1. 获取父容器的真实 DOM 和 缩放比例 ===
    const parent = e.currentTarget.offsetParent;
    const parentRect = parent.getBoundingClientRect(); // 获取缩放后的尺寸(屏幕尺寸)

    // 计算缩放比例： 屏幕尺寸 / 内部真实尺寸
    // 例如：屏幕上宽 800，内部宽 1000，scale 就是 0.8
    const scaleX = parentRect.width / parent.offsetWidth;
    const scaleY = parentRect.height / parent.offsetHeight;

    // 获取父容器的“原始”宽高 (不受 scale 影响的内部 px)
    const parentWidth = parent.offsetWidth;
    const parentHeight = parent.offsetHeight;

    let animationFrameId = null;

    const move = (moveEvent) => {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(() => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // === 2. 修正逻辑：先除以 scale 还原真实位移，再除以 parentWidth 算百分比 ===
            // 公式：(屏幕位移 / 缩放比例) / 父容器原始宽度 * 100

            const realDeltaX = deltaX / scaleX;
            const realDeltaY = deltaY / scaleY;

            let newLeft = startLeft + (realDeltaX / parentWidth) * 100;
            let newTop = startTop + (realDeltaY / parentHeight) * 100;

            // ... 边界限制逻辑 (保持不变) ...
            const compWidth = Number(props.conf.style.width || 0);
            if (newLeft < 0) newLeft = 0;
            if (newLeft + compWidth > 100) newLeft = 100 - compWidth;
            if (newTop < 0) newTop = 0;

            emit('update-style', { left: newLeft, top: newTop });
            animationFrameId = null;
        });
    };

    const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
};


const startResize = (e, direction) => {
    if (isPreview.value) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const wrapper = e.target.offsetParent; // 当前组件 DOM
    const parent = wrapper.offsetParent;   // 父容器 DOM
    if (!parent) return;

    // 获取父容器真实尺寸 (用于百分比换算)
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    // --- 1. 获取初始百分比数值 ---
    // 如果当前 style.width 是 "50%" 或 50，解析为 50
    // 如果是 "auto" 或空，通过 offsetWidth 反算当前占比
    const getPercentValue = (val, currentPx, totalPx) => {
        const num = parseFloat(val);
        if (!isNaN(num)) return num; // 已经是数字或 "50%"
        if (totalPx === 0) return 0;
        return (currentPx / totalPx) * 100; // 反算
    };

    let startWidthVal = getPercentValue(props.conf.style.width, wrapper.offsetWidth, parentWidth);
    let startHeightVal = getPercentValue(props.conf.style.height, wrapper.offsetHeight, parentHeight);

    // --- 2. 计算缩放比例 (适配 Canvas scale) ---
    const rect = parent.getBoundingClientRect();
    // 保护除数为0的情况
    const scaleX = parent.offsetWidth ? (rect.width / parent.offsetWidth) : 1;
    const scaleY = parent.offsetHeight ? (rect.height / parent.offsetHeight) : 1;

    let animationFrameId = null;

    const move = (moveEvent) => {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(() => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // 还原真实像素位移
            const realDeltaX = deltaX / scaleX;
            const realDeltaY = deltaY / scaleY;

            let newStyle = {};

            // ====== A. 处理宽度 (转换为百分比) ======
            if (direction.includes('r')) {
                // 计算变化的百分比
                const deltaPercent = (realDeltaX / parentWidth) * 100;
                // 结果保存为【数字】，保留2位小数
                let targetVal = Number((startWidthVal + deltaPercent).toFixed(2));

                // 限制范围 0-100
                if (targetVal > 100) targetVal = 100;
                if (targetVal < 1) targetVal = 1; // 最小宽度保护 1%

                newStyle.width = targetVal;
            }

            // ====== B. 处理高度 (转换为百分比) ======
            if (direction.includes('b')) {
                // 计算变化的百分比
                const deltaPercent = (realDeltaY / parentHeight) * 100;
                let targetVal = Number((startHeightVal + deltaPercent).toFixed(2));

                // 限制范围 0-100
                if (targetVal > 100) targetVal = 100;
                if (targetVal < 1) targetVal = 1; // 最小高度保护 1%

                newStyle.height = targetVal;
            }

            emit('update-style', newStyle);
            animationFrameId = null;
        });
    };

    const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
};

const isLayerHover = computed(() => {
    return !isPreview.value && store.hoverComponentId === props.conf.id;
});
</script>

<style scoped>
.comp-wrapper {
    box-sizing: border-box;
    user-select: none;
    transition: all 0.1s;
    padding: 0;
    margin: 0;
}

.comp-wrapper.layer-hover {
    outline: 1px solid #f56c6c !important;
    background-color: rgba(245, 108, 108, 0.05);
    z-index: 9999 !important; /* 确保浮在最上层 */
    box-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
}

.comp-wrapper.active {
    outline: 1px solid #409eff;
    z-index: 1000 !important;
}

.comp-wrapper.active.layer-hover {
    outline: 1px solid #409eff !important;
}

.comp-wrapper:hover .inner-content {
    border-color: rgba(64, 158, 255, 0.5);
}

.inner-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px dashed transparent;
}

.inner-content :deep(> *) {
    width: 100%;
    height: 100%;
    margin: 0 !important;
    box-sizing: border-box;
}

.comp-wrapper.auto-height .inner-content :deep(> *) {
    height: auto !important;
}

.resize-handle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fff;
    border: 1px solid #409eff;
    z-index: 1001;
    /* 比边框更高 */
    border-radius: 50%;
}

.br {
    bottom: -4px;
    right: -4px;
    cursor: se-resize;
}

.t {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: n-resize;
}

.b {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: s-resize;
}

.l {
    top: 50%;
    left: -4px;
    transform: translateY(-50%);
    cursor: w-resize;
}

.r {
    top: 50%;
    right: -4px;
    transform: translateY(-50%);
    cursor: e-resize;
}

.tl {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
}

.tr {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
}

.bl {
    bottom: -4px;
    left: -4px;
    cursor: sw-resize;
}

.delete-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #f56c6c;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}

.delete-btn:hover {
    background: #ff4949;
    transform: scale(1.1);
}

/* 预览模式下的特殊样式 */
.preview-mode {
    outline: none !important;
    /* 强制去掉选中框 */
    border: none !important;
    /* 强制去掉虚线框 */
}

.preview-mode .inner-content {
    border: none !important;
}
</style>