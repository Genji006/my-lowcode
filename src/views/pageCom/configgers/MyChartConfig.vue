<template>
    <div class="chart-config">
        <el-form label-width="90px" size="small" label-position="right">

            <el-divider content-position="left">基础信息</el-divider>
            <el-form-item label="图表标题">
                <el-input v-model="activeComp.props.title" />
            </el-form-item>

            <el-form-item label="图表子类型" v-if="activeComp.type === 'MyChart'">
                <el-radio-group v-model="activeComp.props.chartType">
                    <el-radio-button label="bar">柱状</el-radio-button>
                    <el-radio-button label="line">折线</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="自定义配色">
                <div class="color-list">
                    <div v-for="(c, index) in colors" :key="index" class="color-item">
                        <el-color-picker v-model="colors[index]" show-alpha size="small" />
                        <el-button link type="danger" icon="Delete" @click="removeColor(index)" />
                    </div>
                    <el-button size="small" style="width: 100%" icon="Plus" @click="addColor">添加颜色</el-button>
                </div>
            </el-form-item>

            <template v-if="isCartesian">
                <el-divider content-position="left">坐标轴</el-divider>
                <el-form-item label="X轴名称">
                    <el-input v-model="activeComp.props.xAxisName" placeholder="例如：日期" />
                </el-form-item>
                <el-form-item label="Y轴名称">
                    <el-input v-model="activeComp.props.yAxisName" placeholder="例如：金额" />
                </el-form-item>
                <el-form-item label="单位后缀">
                    <el-input v-model="activeComp.props.unit" placeholder="例如：元" />
                </el-form-item>
            </template>

            <template v-if="isRadar">
                <el-divider content-position="left">雷达指标</el-divider>
                <el-form-item label="指标定义">
                    <el-input v-model="activeComp.props.radarIndicators" type="textarea" :rows="5" placeholder='JSON格式: 
[
    {"name": "维度A", "max": 100}, 
    {"name": "维度B", "max": 100}
]' />
                    <div class="tip-text">请按JSON格式配置各个维度的名称和最大值</div>
                </el-form-item>
            </template>

            <el-divider content-position="left">数据源配置</el-divider>

            <el-form-item label="数据来源">
                <el-radio-group v-model="activeComp.props.dataType">
                    <el-radio-button label="api">接口</el-radio-button>
                    <el-radio-button label="sql">SQL</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <div v-if="activeComp.props.dataType === 'api'" class="source-box">
                <el-form-item label="接口地址">
                    <el-input v-model="activeComp.props.apiConf.url" placeholder="" />
                </el-form-item>
                <el-form-item label="请求方式">
                    <el-radio-group v-model="activeComp.props.apiConf.method">
                        <el-radio-button label="GET">GET</el-radio-button>
                        <el-radio-button label="POST">POST</el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </div>

            <div v-if="activeComp.props.dataType === 'sql'" class="source-box">
                <el-form-item label="SQL语句">
                    <el-input v-model="activeComp.props.sqlConf.sql" type="textarea" :rows="5" placeholder="请输入SQL语句" />
                </el-form-item>
            </div>

            <el-divider content-position="left">字段映射</el-divider>
            <div class="mapping-box">
                <div class="tip-text" style="margin-bottom: 10px;">告诉组件后端返回数据中对应的字段Key</div>

                <el-form-item :label="xFieldLabel">
                    <el-input v-model="activeComp.props.mapping.xField" placeholder="默认为 name 或 x" />
                </el-form-item>

                <el-form-item :label="yFieldLabel">
                    <el-input v-model="activeComp.props.mapping.yField" placeholder="默认为 value 或 y" />
                </el-form-item>
            </div>

        </el-form>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['activeComp']);

// 获取当前图表类型
const currentType = computed(() => {
    return props.activeComp.props.chartType;
});

// 判断是否为直角坐标系
const isCartesian = computed(() => {
    return ['bar', 'line', 'scatter'].includes(currentType.value);
});

// 判断是否为雷达图
const isRadar = computed(() => {
    return currentType.value === 'radar';
});

// 判断是否为饼图
const isPie = computed(() => {
    return currentType.value === 'pie';
});

// === 动态计算映射字段的标签名称 ===
const xFieldLabel = computed(() => {
    if (isPie.value) return '分类字段';   // 饼图: 扇区名称
    if (isRadar.value) return '系列字段'; // 雷达图: 系列名称
    if (currentType.value === 'scatter') return 'X轴字段'; // 散点图: X坐标
    return '维度字段(X)'; // 默认: X轴类目
});

const yFieldLabel = computed(() => {
    if (isPie.value) return '数值字段';
    if (isRadar.value) return '数据数组'; // 雷达图通常映射到一个数值数组
    if (currentType.value === 'scatter') return 'Y轴字段'; // 散点图: Y坐标
    return '指标字段(Y)'; // 默认: Y轴数值
});


// 使用计算属性代理，确保 colors 始终是一个数组
const colors = computed({
    get: () => {
        const c = props.activeComp.props.colors;
        if (Array.isArray(c)) return c;
        if (props.activeComp.props.color) return [props.activeComp.props.color];
        return ['#409EFF']; // 默认兜底
    },
    set: (val) => {
        props.activeComp.props.colors = val;
    }
});

const addColor = () => {
    // 每次添加一个随机亮色，或者默认蓝色
    props.activeComp.props.colors.push('#409EFF');
};

const removeColor = (index) => {
    props.activeComp.props.colors.splice(index, 1);
};
</script>

<style scoped>
.chart-config {
    padding-bottom: 20px;
}

.tip-text {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
    margin-top: 4px;
}

.mapping-box {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
}

.source-box {
    margin-bottom: 10px;
}

.color-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 2px;
}

.tip-text {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
    margin-top: 4px;
}

:deep(.el-form-item--small.el-form-item) {
    margin-bottom: 14px;
}
</style>