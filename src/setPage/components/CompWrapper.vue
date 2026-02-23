<template>
    <div class="comp-wrapper" :class="{
        active: isActive && !isPreview,
        'is-flow': isFlow,
        'preview-mode': isPreview,
        'drag-over': isDragOver
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
    // 自动高度组件列表
    const autoHeightTypes = ['MyInput', 'MySelect', 'MyButton', 'MyText', 'MyQueryForm'];
    const isAutoHeight = autoHeightTypes.includes(props.conf.type);

    // 高度计算修复：如果是 'auto' 或 null，保持 'auto'；如果是数字，加 px
    let finalHeight = 'auto';
    let finalWidth = 'auto';
    const { width, height, isAutoFill } = props.conf.style;
    if (props.isFlow && isAutoHeight) {
        finalHeight = 'auto';
    } else {
        finalHeight = (typeof height === 'number') ? `${height}px` : (height || 'auto');
    }

    if (typeof width === 'number') {
        finalWidth = width + '%';
    } else if (typeof width === 'string' && width !== 'auto') {
        finalWidth = width;
    }

    // 基础样式
    const style = {
        width: finalWidth,
        height: finalHeight,
        boxSizing: 'border-box',
        marginBottom:'0',
        minWidth: 0,
    };
    // A. 如果开启了【自动填充】 (仅在流式布局下有效)
    if (props.isFlow) {
        // 如果开启了“自动填充”，强制占满剩余空间
        if (isAutoFill) {
            return {
                ...style,
                position: 'relative',
                flex: '1 1 0%',
                width: '100%',
                maxWidth: '100%',
                border: props.isActive ? '1px solid #409eff' : '1px dashed transparent'
            };
        }

        // 普通模式 (支持拖拽调整大小)
        return {
            ...style,
            position: 'relative',
            maxWidth: '100%',
            flexShrink: 0,
            border: props.isActive ? '1px solid #409eff' : '1px dashed transparent'
        };
    }
    // B. 否则使用【固定高度】
    else {
        let finalHeight = 'auto';
        if (props.isFlow && autoHeightTypes.includes(props.conf.type)) {
            finalHeight = 'auto';
        } else {
            finalHeight = (typeof height === 'number') ? `${height}px` : (height || 'auto');
        }

        Object.assign(style, {
            height: finalHeight,
            flex: '0 0 auto'
        });
    }

    // 预览模式
    if (isPreview.value) {
        let borderStyle = props.conf.style.border;
        // 去掉容器默认虚线
        if (props.conf.type === 'MyContainer' && borderStyle && borderStyle.includes('dashed')) {
            borderStyle = 'none';
        }
        return {
            ...style,
            position: props.isFlow ? 'relative' : 'absolute',
            left: !props.isFlow ? (props.conf.style.left || 0) + '%' : undefined,
            top: !props.isFlow ? (props.conf.style.top || 0) + '%' : undefined,
            border: borderStyle || 'none',
            pointerEvents: 'auto',
            zIndex: props.conf.style.zIndex || 'auto'
        };
    }

    // 编辑模式
    if (props.isFlow) {
        return {
            ...style,
            position: 'relative',
            maxWidth: '100%',
            border: props.isActive ? '1px solid #409eff' : '1px dashed transparent'
        };
    } else {
        return {
            ...style,
            position: 'absolute',
            left: (props.conf.style.left || 0) + '%',
            top: (props.conf.style.top || 0) + '%',
            zIndex: props.isActive ? 999 : 1,
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

    // --- 1. 获取初始宽/高数据 ---
    // 宽度处理
    let startWidthNum = 0;
    const rawWidth = props.conf.style.width;
    const wrapper = e.target.offsetParent;
    const parent = wrapper.offsetParent;
    if (!parent) return;

    const parentWidth = parent.clientWidth;
    // 获取父容器高度 (用于边界限制)
    const parentHeight = parent.clientHeight;
    // 获取当前组件距离顶部的距离 (用于计算剩余空间)
    const currentTop = wrapper.offsetTop;

    if (typeof rawWidth === 'number') {
        startWidthNum = rawWidth;
    } else {
        const currentPx = wrapper.offsetWidth;
        startWidthNum = (currentPx / parentWidth) * 100;
    }

    // 高度处理
    const startHeight = props.conf.style.height;
    let startHeightNum = 0;
    let isHeightPixel = true;

    if (typeof startHeight === 'number') {
        startHeightNum = startHeight;
    } else if (typeof startHeight === 'string' && startHeight.endsWith('%')) {
        startHeightNum = parseFloat(startHeight);
        isHeightPixel = false;
    } else {
        startHeightNum = wrapper.offsetHeight;
    }

    // --- 2. 计算缩放比例 ---
    const rect = parent.getBoundingClientRect();
    const scaleX = rect.width / parent.offsetWidth;
    const scaleY = rect.height / parent.offsetHeight;

    let animationFrameId = null;

    const move = (moveEvent) => {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(() => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // 修正缩放带来的位移偏差
            const realDeltaX = deltaX / scaleX;
            const realDeltaY = deltaY / scaleY;

            let newStyle = {};

            // ====== A. 处理宽度 ======
            if (direction.includes('r')) {
                const deltaPercent = (realDeltaX / parentWidth) * 100;
                newStyle.width = startWidthNum + deltaPercent;
            }

            // ====== B. 处理高度 ======
            if (direction.includes('b')) {
                // 1. 先算出理论上的新高度
                let targetHeight = startHeightNum + realDeltaY;

                // 2. 计算允许的最大高度 = 父容器高度 - 组件当前的 Top 值
                // 这样能保证组件底部不会超出父容器底部
                const maxAvailableHeight = parentHeight - currentTop;

                // 3. 核心限制：取较小值
                if (targetHeight > maxAvailableHeight) {
                    targetHeight = maxAvailableHeight;
                }

                // 4. 赋值
                if (props.isFlow) {
                    // 流式布局直接用 px
                    newStyle.height = targetHeight;
                } else {
                    // 绝对定位判断单位
                    if (isHeightPixel) {
                        newStyle.height = targetHeight;
                    } else {
                        // 如果原单位是 %，转换回去
                        const percentHeight = (targetHeight / parentHeight) * 100;
                        newStyle.height = percentHeight;
                    }
                }
            }

            // 最小值保护
            if (newStyle.width && newStyle.width < 1) newStyle.width = 1;
            if (newStyle.height && newStyle.height < 10) newStyle.height = 10;

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
</script>

<style scoped>
.comp-wrapper {
    box-sizing: border-box;
    user-select: none;
    transition: all 0.1s;
    padding: 0;
    margin: 0;
}

.comp-wrapper.active {
    outline: 1px solid #409eff;
    z-index: 1000 !important;
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