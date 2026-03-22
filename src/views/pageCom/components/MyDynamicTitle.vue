<template>
    <div class="my-title-wrapper">
        <span class="main-title">{{ resolvedMainTitle }}</span>
        <span class="sub-title" v-if="resolvedSubTitle">{{ resolvedSubTitle }}</span>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) }
});

const isPreview = inject('isPreview', false);

// 1. 提取所有联动参数 (自动吸收 + Mapping提取)
const flatParams = computed(() => {
    const params = {};
    if (!props.apiParams || Object.keys(props.apiParams).length === 0) return params;

    const mappingDict = props.conf.paramsMapping || {};

    Object.keys(props.apiParams).forEach(sourceKey => {
        const sourceData = props.apiParams[sourceKey];
        const rules = mappingDict[sourceKey];

        if (rules && rules.length > 0) {
            rules.forEach(rule => {
                if (!rule.target) return;
                let val = '';
                if (!rule.source) val = typeof sourceData === 'object' ? JSON.stringify(sourceData) : sourceData;
                else if (sourceData && sourceData[rule.source] !== undefined) val = sourceData[rule.source];
                params[rule.target] = val;
            });
        } else {
            // 智能吸收
            if (typeof sourceData === 'object' && sourceData !== null) {
                Object.keys(sourceData).forEach(key => {
                    if (key === 'value' && Object.keys(sourceData).length > 1) return;
                    params[key] = sourceData[key];
                });
            } else {
                params[sourceKey] = sourceData;
            }
        }
    });
    return params;
});

// 2. 模板字符串替换引擎
const renderTemplate = (templateStr) => {
    if (!templateStr) return '';
    let result = templateStr;
    const params = flatParams.value;

    Object.keys(params).forEach(key => {
        const val = params[key] !== null && params[key] !== undefined ? params[key] : '';
        result = result.replace(new RegExp(`{${key}}`, 'g'), val);
    });

    // 没匹配到的占位符 {xxx} 清除掉
    result = result.replace(/\{.*?\}/g, '');
    return result;
};

// 3. 解析主标题
const resolvedMainTitle = computed(() => {
    const rawTitle = props.conf.props.title || '默认标题';
    if (!isPreview && Object.keys(flatParams.value).length === 0) return rawTitle;
    return renderTemplate(rawTitle);
});

// 4. 解析副标题
const resolvedSubTitle = computed(() => {
    const rawSub = props.conf.props.templateStr;
    if (!rawSub) {
        // 兜底：如果没配模板但传了时间参数，自动拼接
        const p = flatParams.value;
        const start = p.startDate || p.startTime || p.start;
        const end = p.endDate || p.endTime || p.end;
        if (start && end) return ` ( ${start}至${end} )`;
        return '';
    }

    if (!isPreview && Object.keys(flatParams.value).length === 0) return ' ( 动态参数区 )';

    const res = renderTemplate(rawSub);
    return (res === '()' || res === '(  )' || res === '至') ? '' : res;
});
</script>

<style scoped>
.my-title-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 固定写死的样式 */
.main-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.sub-title {
    font-size: 14px;
    font-weight: normal;
    color: #666;
    margin-left: 8px;
}
</style>