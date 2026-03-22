<template>
    <div class="chart-config">
        <el-form label-width="120px" size="small" label-position="right">

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

            <el-divider content-position="left" v-if="activeComp.props.dataType === 'sql'">字段映射</el-divider>
            <div class="mapping-box"
                v-if="activeComp.props.designChartConfigList && activeComp.props.designChartConfigList.length >= 2 && activeComp.props.dataType === 'sql'">

                <div class="tip-text" style="margin-bottom: 10px; font-weight: bold; color: #303133;">
                    1. {{ xFieldLabel }} (分类/X轴)
                </div>
                <el-form-item label="字段Key">
                    <el-input v-model="activeComp.props.designChartConfigList[1].field"
                        placeholder="数据里的英文Key,如: name" />
                </el-form-item>
                <el-form-item label="显示名称">
                    <el-input v-model="activeComp.props.designChartConfigList[1].fieldName"
                        placeholder="图表显示的中文名,如: 日期" />
                </el-form-item>

                <el-divider border-style="dashed" style="margin: 15px 0;" />

                <div class="tip-text" style="margin-bottom: 10px; font-weight: bold; color: #303133;">
                    2. {{ yFieldLabel }} (值/Y轴)
                </div>
                <el-form-item label="字段Key">
                    <el-input v-model="activeComp.props.designChartConfigList[0].field"
                        placeholder="数据里的英文Key,如: value" />
                </el-form-item>
                <el-form-item label="显示名称">
                    <el-input v-model="activeComp.props.designChartConfigList[0].fieldName"
                        placeholder="图表显示的中文名,如: 金额" />
                </el-form-item>
            </div>

            <el-divider content-position="left">自定义请求参数</el-divider>
            <div style="padding: 0 10px;">
                <div v-for="(param, index) in activeComp.props.customParams" :key="index"
                    style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #ebeef5;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: bold; color: #606266;">参数 {{ index + 1 }}</span>
                        <el-button type="danger" link size="small" @click="removeCustomParam(index)">删除</el-button>
                    </div>

                    <el-row :gutter="10" style="margin-bottom: 8px;">
                        <el-col :span="12">
                            <el-input v-model="param.key" placeholder="键名(如: deptId)" />
                        </el-col>
                        <el-col :span="12">
                            <el-select v-model="param.type" placeholder="值类型">
                                <el-option label="静态固定值" value="static" />
                                <el-option label="JS 动态脚本" value="script" />
                            </el-select>
                        </el-col>
                    </el-row>

                    <el-input v-if="param.type === 'static'" v-model="param.value" placeholder="输入固定值" />
                    <div v-if="param.type === 'script'">
                        <el-input type="textarea" :rows="3" v-model="param.value"
                            placeholder="例: return route.query.id;" style="font-family: monospace; font-size: 12px;" />
                        <div style="font-size: 12px; color: #909399; margin-top: 4px;">支持 route 对象获取路由参数</div>
                    </div>
                </div>

                <el-button type="primary" plain size="small" style="width: 100%;" @click="addCustomParam">
                    + 添加参数
                </el-button>
                <el-button link type="success" size="small" @click="addStandardParams">
                    ⚡ 导入通用指标参数
                </el-button>
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

const addCustomParam = () => {
    if (!props.activeComp.props.customParams) {
        props.activeComp.props.customParams = [];
    }
    props.activeComp.props.customParams.push({
        key: '',
        type: 'static',
        value: ''
    });
};

const removeCustomParam = (index) => {
    props.activeComp.props.customParams.splice(index, 1);
};

const addStandardParams = () => {
    // 确保数组存在
    if (!props.activeComp.props.customParams) {
        props.activeComp.props.customParams = [];
    }

    const standardParamsTemplate = [
        {
            key: 'indexDefinitionUuid',
            type: 'script',
            value: 'return route.query.indexUuid || "";'
        },
        {
            key: 'newestPatchNo',
            type: 'script',
            value: 'return route.query.processingNumber || "";'
        },
        {
            key: 'productUuid',
            type: 'script',
            value: 'return sessionStorage.getItem("menuCode") || "";'
        }
    ];

    let addedCount = 0;

    // 遍历预设模板，加入到当前图表的自定义参数中
    standardParamsTemplate.forEach(tpl => {
        // 防重复检测：如果用户已经手动加过这个 key，就不再重复加了
        const exists = props.activeComp.props.customParams.find(p => p.key === tpl.key);
        if (!exists) {
            props.activeComp.props.customParams.push(tpl);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        ElMessage.success(`成功导入 ${addedCount} 个通用指标参数！`);
    } else {
        ElMessage.warning('通用参数已存在，无需重复导入。');
    }
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

:deep(.el-select__wrapper) {
    height: 27px !important;
}
</style>