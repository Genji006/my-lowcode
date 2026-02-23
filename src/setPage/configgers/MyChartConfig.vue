<template>
    <div class="chart-config">
        <el-form label-width="100px" label-position="right">

            <el-divider content-position="left">图表设置</el-divider>

            <el-form-item label="图表标题">
                <el-input v-model="activeComp.props.title" placeholder="请输入标题" clearable />
            </el-form-item>

            <el-form-item label="数据来源">
                <el-radio-group v-model="activeComp.props.dataType">
                    <el-radio-button label="api">接口</el-radio-button>
                    <el-radio-button label="sql">SQL</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <template v-if="activeComp.props.dataType === 'api'">
                <el-form-item label="接口地址">
                    <el-input v-model="activeComp.props.apiConf.url" placeholder="/api/..." />
                </el-form-item>
                <el-form-item label="请求方式">
                    <el-select v-model="activeComp.props.apiConf.method">
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                    </el-select>
                </el-form-item>
            </template>
            <template v-if="activeComp.props.dataType === 'sql'">
                <el-form-item label="SQL语句">
                    <el-input v-model="activeComp.props.sqlConf.sql" type="textarea" :rows="4" placeholder="" />
                </el-form-item>
            </template>
            <el-form-item label="X轴字段">
                <el-input v-model="activeComp.props.mapping.xField" placeholder="" />
            </el-form-item>
            <el-form-item label="Y轴字段">
                <el-input v-model="activeComp.props.mapping.yField" placeholder="" />
            </el-form-item>
            <el-form-item label="图表类型">
                <el-radio-group v-model="activeComp.props.chartType">
                    <el-radio-button label="bar">柱状图</el-radio-button>
                    <el-radio-button label="line">折线图</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="主题颜色">
                <el-color-picker v-model="activeComp.props.color" show-alpha />
            </el-form-item>
            <el-form-item label="X轴名称">
                <el-input v-model="activeComp.props.xAxisName" placeholder="例如: 日期" />
            </el-form-item>
            <el-form-item label="Y轴单位">
                <el-input v-model="activeComp.props.unit" placeholder="例如: 个/元" />
            </el-form-item>

            <!-- <el-divider content-position="left">数据联动</el-divider>

            <el-form-item label="绑定参数Key">
                <el-input v-model="activeComp.bindKey" placeholder="例如: userId">
                    <template #prefix>
                        <el-icon>
                            <Link />
                        </el-icon>
                    </template>
                </el-input>
                <div class="tip">
                    当上游组件(如表格)点击时，图表会自动提取参数中名为此Key的值进行查询。
                </div>
                <div class="code-tip" v-if="activeComp.bindKey">
                    当前监听: <code>apiParams.{{ activeComp.bindKey }}</code>
                </div>
            </el-form-item> -->

        </el-form>
    </div>
</template>

<script setup>
defineProps(['activeComp']);
</script>

<style scoped>
.tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
    margin-top: 5px;
}

.code-tip {
    font-size: 12px;
    background: #f4f4f5;
    padding: 4px;
    border-radius: 4px;
    margin-top: 5px;
    color: #606266;
}

code {
    color: #c0392b;
    font-family: monospace;
    font-weight: bold;
}
</style>