<template>
    <div class="my-select-config">
        <el-form label-width="100px" label-position="right">
            <el-divider content-position="left">基础属性</el-divider>
            <el-form-item label="标签名称">
                <el-input v-model="activeComp.props.label" placeholder="" />
            </el-form-item>
            <el-form-item label="占位提示">
                <el-input v-model="activeComp.props.placeholder" placeholder="例如：请选择" />
            </el-form-item>
            <el-form-item label="绑定字段">
                <el-input v-model="activeComp.bindKey" placeholder="存入全局数据的key，如: id" />
                <div class="tip">其他组件依赖此Key获取数据</div>
            </el-form-item>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="可清空">
                        <el-switch v-model="activeComp.props.clearable" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="可搜索">
                        <el-switch v-model="activeComp.props.filterable" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-divider content-position="left">数据来源</el-divider>
            <el-radio-group v-model="activeComp.props.dataType" size="small" style="margin-bottom: 15px">
                <el-radio-button label="static">静态选项</el-radio-button>
                <el-radio-button label="api">API接口</el-radio-button>
                <el-radio-button label="sql">SQL查询</el-radio-button>
            </el-radio-group>

            <div v-if="activeComp.props.dataType === 'static'">
                <div v-for="(opt, index) in activeComp.props.options" :key="index" class="option-item">
                    <el-input v-model="opt.label" placeholder="显示文字" style="width: 120px; margin-right: 5px" />
                    <el-input v-model="opt.value" placeholder="值" style="width: 80px; margin-right: 5px" />
                    <el-button type="danger" icon="Delete" circle size="small" @click="removeOption(index)" />
                </div>
                <el-button type="primary" plain size="small" style="width: 100%; margin-top: 5px" @click="addOption">
                    + 添加选项
                </el-button>
            </div>

            <div v-else>
                <template v-if="activeComp.props.dataType === 'api'">
                    <el-form-item label="接口地址">
                        <el-input v-model="activeComp.props.apiConf.url" placeholder="/api/getDepts" />
                    </el-form-item>
                    <el-form-item label="请求方法">
                        <el-radio-group v-model="activeComp.props.apiConf.method" size="small">
                            <el-radio-button label="GET">GET</el-radio-button>
                            <el-radio-button label="POST">POST</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </template>

                <template v-if="activeComp.props.dataType === 'sql'">
                    <el-form-item label="SQL语句">
                        <el-input type="textarea" :rows="6" v-model="activeComp.props.sqlConf.sql" placeholder="" />
                    </el-form-item>
                </template>

                <el-alert title="数据映射：配置接口返回的字段名" type="info" :closable="false" style="margin: 10px 0;" />
                <el-form-item label="显示字段">
                    <el-input v-model="activeComp.props.mapping.label" placeholder="例如: name" />
                </el-form-item>
                <el-form-item label="值字段">
                    <el-input v-model="activeComp.props.mapping.value" placeholder="例如: id" />
                </el-form-item>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDesignStore } from '../demoStore';
import { Delete } from '@element-plus/icons-vue';

const props = defineProps({
    activeComp: Object
});

const store = useDesignStore();

// 添加静态选项
const addOption = () => {
    if (!props.activeComp.props.options) {
        props.activeComp.props.options = [];
    }
    props.activeComp.props.options.push({ label: '新选项', value: 'new' });
};

// 删除静态选项
const removeOption = (index) => {
    props.activeComp.props.options.splice(index, 1);
};
</script>

<style scoped>
.option-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.2;
    margin-top: 2px;
}
</style>