<!-- 组件右侧配置面板 -->
<template>
    <div class="config-panel">
        <div v-if="!activeComp" class="empty">请先选择一个组件</div>
        <div v-else>
            <h3>{{ activeComp.name }} 配置</h3>

            <div class="id-box">
                <span class="label">ID:</span>
                <el-tag type="info" class="id-tag" truncate>{{ activeComp.id }}</el-tag>
            </div>

            <!-- 组件类型特定配置 -->
            <component :is="configMap[activeComp.type] || configMap['Default']" :activeComp="activeComp" />

            <!-- 通用配置 -->
            <el-form label-width="100px" label-position="right">
                <el-divider content-position="left">
                    通用配置
                </el-divider>
                <el-form-item label="高度模式">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
                        <el-switch v-model="activeComp.style.isAutoFill" active-text="自适应填充" inactive-text="固定高度"
                            inline-prompt />
                    </div>
                </el-form-item>

                <el-form-item label="高度 (px)" v-if="!activeComp.style.isAutoFill">
                    <div style="display: flex; width: 100%; gap: 5px;">
                        <el-input-number v-model="activeHeight" :min="0" controls-position="right"
                            placeholder="自适应 (Auto)" style="flex: 1" />
                        <el-button v-if="typeof activeComp.style.height === 'number'" link type="primary" size="small"
                            @click="resetHeightToAuto">
                            设为Auto
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="宽度 (%)" v-if="!activeComp.style.isAutoFill">
                    <div style="display: flex; width: 100%; gap: 5px;">
                        <el-input-number v-model="activeWidth" :min="0" :max="100" controls-position="right"
                            placeholder="自适应 (Auto)" style="flex: 1" />
                        <el-button v-if="typeof activeComp.style.width === 'number'" link type="primary" size="small"
                            @click="resetWidthToAuto">
                            设为Auto
                        </el-button>
                    </div>
                    <div class="tip">输入 1-100 代表百分比宽度，留空代表 Auto</div>
                </el-form-item>

                <el-form-item label="抛出时机">
                    <el-select v-model="activeComp.props.triggerMode" placeholder="请选择">
                        <el-option v-for="trigger in activeComp.availableTriggers" :key="trigger.value"
                            :label="trigger.label" :value="trigger.value" />
                    </el-select>
                    <div class="tip">决定组件何时更新全局数据</div>
                </el-form-item>

                <!-- 数据依赖配置 -->
                <el-form-item label="数据依赖">
                    <el-select v-model="activeComp.dependsOn" multiple filterable placeholder="请选择依赖组件"
                        style="width: 100%" @change="initMapping">
                        <el-option v-for="comp in flatComponentList.filter(c => c.id !== activeComp.id)" :key="comp.id"
                            :label="`${comp.name} (${comp.id})`" :value="comp.id" />
                    </el-select>
                    <div class="tip">当选中的组件数据更新时，当前组件会重新请求接口。</div>
                </el-form-item>

                <div v-if="activeComp.dependsOn && activeComp.dependsOn.length > 0" class="mapping-area">
                    <div class="mapping-title">参数获取规则 (Mapping)</div>

                    <div v-for="depId in activeComp.dependsOn" :key="depId" class="mapping-group">
                        <div class="dep-label">源: {{ getCompName(depId) }}</div>
                        <div v-for="(rule, idx) in getMappingRules(depId)" :key="idx" class="rule-row">
                            <el-input v-model="rule.target" placeholder="参数名(如 id)" size="small" style="width: 40%" />
                            <span class="icon">⬅</span>
                            <el-input v-model="rule.source" placeholder="路径(如 formData.uid)" size="small"
                                style="width: 45%" />
                            <el-icon class="del-btn" @click="removeRule(depId, idx)">
                                <Close />
                            </el-icon>
                        </div>
                        <el-button link type="primary" size="small" @click="addRule(depId)">+ 添加参数</el-button>
                    </div>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { computed, defineAsyncComponent, watch } from 'vue';
import { useDesignStore } from './demoStore';
import { ElMessage } from 'element-plus';
import ScriptEditor from './components/ScriptEditor.vue';

// 配置子组件
import MyContainerConfig from './configgers/MyContainerConfig.vue';
import MyQueryFormConfig from './configgers/MyQueryFormConfig.vue';
import MyTableConfig from './configgers/MyTableConfig.vue';
import MyChartConfig from './configgers/MyChartConfig.vue';

// 默认配置组件
const DefaultConfig = { template: '<div></div>' };

const store = useDesignStore();

// === 1. 动态组件映射表 ===
const configMap = {
    'MyContainer': MyContainerConfig,
    'MyForm': MyContainerConfig, // 表单复用容器配置
    'Default': DefaultConfig,
    'MyQueryForm': MyQueryFormConfig,
    'MyTable': MyTableConfig,
    'MyChart': MyChartConfig,
};

// === 2. 递归查找当前选中的组件 ===
const findComp = (list, id) => {
    for (let item of list) {
        if (item.id === id) return item;
        if (item.props.children && item.props.children.length > 0) {
            const found = findComp(item.props.children, id);
            if (found) return found;
        }
    }
    return null;
}
const activeComp = computed(() => findComp(store.components, store.activeId));

// === 3. 获取扁平化列表 (用于联动选择目标) ===
const getFlatList = (list) => {
    let result = [];
    list.forEach(item => {
        result.push(item);
        if (item.props.children && item.props.children.length > 0) {
            result = result.concat(getFlatList(item.props.children));
        }
    });
    return result;
};
const flatComponentList = computed(() => getFlatList(store.components));

// 获取组件名称辅助函数
const getCompName = (id) => {
    const comp = flatComponentList.value.find(c => c.id === id);
    return comp ? `${comp.name} (${id})` : id;
};

// 获取映射规则数组，如果没有则初始化
const getMappingRules = (depId) => {
    if (!activeComp.value.paramsMapping) activeComp.value.paramsMapping = {};
    if (!activeComp.value.paramsMapping[depId]) {
        activeComp.value.paramsMapping[depId] = [];
    }
    return activeComp.value.paramsMapping[depId];
};

// 添加一条映射规则
const addRule = (depId) => {
    getMappingRules(depId).push({ target: '', source: '' });
};

// 删除一条规则
const removeRule = (depId, idx) => {
    activeComp.value.paramsMapping[depId].splice(idx, 1);
};

// 当依赖组件变化时，清理无用的映射
const initMapping = (newDeps) => {
    if (!activeComp.value.paramsMapping) return;
    Object.keys(activeComp.value.paramsMapping).forEach(key => {
        if (!newDeps.includes(key)) delete activeComp.value.paramsMapping[key];
    });
};

// === 1. 高度处理：兼容 'auto' 和 数字 ===
const activeHeight = computed({
    get: () => {
        const h = activeComp.value?.style?.height;
        // 如果是数字，直接返回；如果是 'auto' 或其他字符串，返回 undefined (让输入框留空)
        return typeof h === 'number' ? h : undefined;
    },
    set: (val) => {
        // 用户输入数字时，更新为数字
        if (activeComp.value?.style) {
            activeComp.value.style.height = val;
        }
    }
});

// === 2. 宽度处理：兼容 'auto' 和 数字 ===
const activeWidth = computed({
    get: () => {
        const w = activeComp.value?.style?.width;
        return typeof w === 'number' ? w : undefined;
    },
    set: (val) => {
        if (activeComp.value?.style) {
            activeComp.value.style.width = val;
        }
    }
});

// 重置高度为 Auto 的辅助函数
const resetHeightToAuto = () => {
    if (activeComp.value?.style) {
        activeComp.value.style.height = 'auto';
    }
};

// 重置宽度为 Auto 的辅助函数
const resetWidthToAuto = () => {
    if (activeComp.value?.style) {
        activeComp.value.style.width = 'auto';
    }
};

// 监听 activeComp 变化，初始化数据结构
watch(activeComp, (newVal) => {
    if (newVal) {
        // 确保 dependsOn 是数组 (兼容旧数据)
        if (!Array.isArray(newVal.dependsOn)) {
            newVal.dependsOn = [];
        }
        if (!newVal.bindKey) newVal.bindKey = '';
    }
}, { immediate: true });
</script>

<style scoped>
.config-panel {
    width: 100%;
    height: 100%;
    padding: 15px;
    background: #fff;
    border-left: 1px solid #e0e0e0;
    overflow-y: auto;
    box-sizing: border-box;

    :deep(.el-form-item__label) {
        font-size: 14px;
    }
}

.empty {
    color: #999;
    text-align: center;
    margin-top: 100px;
    font-size: 14px;
}

h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 16px;
    color: #333;
}

.event-card {
    background: #f8f9fa;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 6px;
    border: 1px solid #ebeef5;
}

.label {
    margin: 5px 0 5px;
    font-size: 12px;
    color: #606266;
    font-weight: bold;
}

.action-box {
    margin-top: 10px;
    background: #fff;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
}

.tip-text {
    color: #909399;
    font-size: 12px;
    text-align: center;
    padding: 5px;
}

.code-tip {
    font-size: 12px;
    color: #909399;
    background: #f4f4f5;
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 4px;
    line-height: 1.5;
}

code {
    background: #e9e9eb;
    padding: 2px 4px;
    border-radius: 2px;
    color: #c0392b;
}

.id-box {
    display: flex;
    align-items: center;
    background: #f4f4f5;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 10px;
}

.id-box .label {
    color: #909399;
    margin-right: 8px;
    white-space: nowrap;
}

.id-tag {
    flex: 1;
    margin-right: 5px;
    font-family: monospace;
}

.mapping-area {
    background-color: #f8f9fa;
    /* 浅灰背景 */
    padding: 10px;
    border-radius: 4px;
    margin-top: 5px;
    border: 1px solid #ebeef5;
}

.mapping-title {
    font-size: 12px;
    font-weight: bold;
    color: #606266;
    margin-bottom: 8px;
    padding-left: 4px;
    border-left: 3px solid #409eff;
    line-height: 1;
}

.mapping-group {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #e4e7ed;
}

.mapping-group:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.dep-label {
    font-size: 12px;
    color: #303133;
    margin-bottom: 6px;
    font-weight: 500;
}

.rule-row {
    display: flex;
    align-items: center;
    gap: 4px;
    /* 间距 */
    margin-bottom: 6px;
}

.icon {
    font-size: 12px;
    color: #909399;
    padding: 0 2px;
}

.del-btn {
    cursor: pointer;
    color: #f56c6c;
    margin-left: 4px;
    font-size: 14px;
    transition: color 0.2s;
}

.del-btn:hover {
    color: #d9001b;
    background-color: #fee;
    border-radius: 50%;
}

.tip {
    font-size: 12px;
    color: #999;
    line-height: 1.4;
    margin-top: 4px;
}
</style>