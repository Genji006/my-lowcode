<template>
    <el-form label-width="120px" size="small">
        <el-divider content-position="left">基础属性</el-divider>
        <el-form-item label="字段名">
            <el-input v-model="activeComp.props.fieldName" placeholder="用于提交接口的Key" />
        </el-form-item>
        <el-form-item label="标题">
            <el-input v-model="activeComp.props.label" />
        </el-form-item>

        <el-form-item label="选择器类型">
            <el-select v-model="activeComp.props.type" style="width: 100%;">
                <el-option label="日期 (Date)" value="date" />
                <el-option label="日期时间 (DateTime)" value="datetime" />
                <el-option label="月份 (Month)" value="month" />
                <el-option label="年份 (Year)" value="year" />
                <el-option label="日期范围 (DateRange)" value="daterange" />
                <el-option label="时间范围 (DateTimeRange)" value="datetimerange" />
                <el-option label="月份范围 (MonthRange)" value="monthrange" />
            </el-select>
        </el-form-item>

        <el-form-item label="值格式化">
            <el-input v-model="activeComp.props.valueFormat" placeholder="例: YYYY-MM-DD HH:mm:ss" />
        </el-form-item>

        <template v-if="activeComp.props.type.includes('range')">
            <el-form-item label="开始字段名">
                <el-input v-model="activeComp.props.startFieldName" placeholder="例如: startTime" />
            </el-form-item>
            <el-form-item label="结束字段名">
                <el-input v-model="activeComp.props.endFieldName" placeholder="例如: endTime" />
            </el-form-item>
            <el-form-item label="开始占位符">
                <el-input v-model="activeComp.props.startPlaceholder" />
            </el-form-item>
            <el-form-item label="结束占位符">
                <el-input v-model="activeComp.props.endPlaceholder" />
            </el-form-item>
        </template>
        <template v-else>
            <el-form-item label="字段名">
                <el-input v-model="activeComp.props.fieldName" placeholder="用于提交接口的Key" />
            </el-form-item>
            <el-form-item label="占位提示">
                <el-input v-model="activeComp.props.placeholder" />
            </el-form-item>
        </template>

        <el-divider content-position="left">默认值配置</el-divider>
        <el-form-item label="数据来源">
            <el-radio-group v-model="activeComp.props.dataType">
                <el-radio-button label="static">静态固定</el-radio-button>
                <el-radio-button label="script">JS脚本</el-radio-button>
                <!-- <el-radio-button label="api">接口动态</el-radio-button> -->
            </el-radio-group>
        </el-form-item>

        <el-form-item v-if="activeComp.props.dataType === 'static'" label="固定值">
            <el-date-picker v-model="activeComp.props.defaultValue" :type="activeComp.props.type"
                :value-format="activeComp.props.valueFormat" style="width: 100%;" />
        </el-form-item>

        <div v-if="activeComp.props.dataType === 'script'">
            <div style="font-size: 12px; color: #909399; margin-bottom: 5px; line-height: 1.5;">
                支持编写JS代码返回默认值。可使用内置对象: <br />
                <code>route</code>: 访问路由参数如 route.query.date<br />
                返回格式必须与组件类型匹配(字符串或数组)。
            </div>
            <el-input type="textarea" :rows="6" v-model="activeComp.props.script"
                placeholder="return route.query.start || '2023-01-01';" style="font-family: monospace;" />
        </div>

    </el-form>
</template>

<script setup>
defineProps({
    activeComp: Object
});
</script>