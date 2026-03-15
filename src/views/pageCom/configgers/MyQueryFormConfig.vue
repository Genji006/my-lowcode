<template>
    <div class="config-item">
        <!-- <el-divider content-position="left">查询表单配置</el-divider> -->

        <!-- <el-form label-width="85px" label-position="left">
            <el-form-item label="行内模式">
                <el-switch v-model="activeComp.props.inline" />
            </el-form-item>
        </el-form> -->

        <div v-if="!activeComp.props.slot">
            <el-divider content-position="left">字段列表</el-divider>

            <div v-for="(item, idx) in activeComp.props.items" :key="idx" class="field-card">
                <div class="card-header">
                    <span>字段 {{ idx + 1 }}</span>
                    <el-icon class="del-icon" @click="activeComp.props.items.splice(idx, 1)">
                        <Delete />
                    </el-icon>
                </div>

                <el-form label-width="60px">
                    <el-form-item label="类型">
                        <el-select v-model="item.type">
                            <el-option label="输入框" value="input" />
                            <el-option label="下拉框" value="select" />
                            <el-option label="日期" value="date" />
                            <el-option label="单选组" value="radio-group" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Label">
                        <el-input v-model="item.label" />
                    </el-form-item>
                    <el-form-item label="Key">
                        <el-input v-model="item.fieldName" placeholder="绑定字段名" />
                    </el-form-item>

                    <div v-if="['select', 'radio-group'].includes(item.type)">
                        <el-form-item label="选项">
                            <div v-for="(opt, oi) in item.options" :key="oi" class="opt-row">
                                <el-input v-model="opt.label" placeholder="名" />
                                <el-input v-model="opt.value" placeholder="值" />
                                <el-icon class="del-icon" @click="item.options.splice(oi, 1)">
                                    <Delete />
                                </el-icon>
                            </div>
                            <el-button type="primary" link
                                @click="item.options ? item.options.push({ label: '新项', value: '' }) : item.options = [{ label: '新项', value: '' }]">
                                + 添加选项
                            </el-button>
                        </el-form-item>
                    </div>
                </el-form>
            </div>

            <el-button type="primary" plain style="width: 100%; margin-top: 10px" @click="addField">
                + 添加查询字段
            </el-button>
        </div>

        <el-divider content-position="left">
            自定义代码 (覆盖配置)
            <el-tooltip content="输入代码将完全接管表单渲染" placement="top"><el-icon>
                    <QuestionFilled />
                </el-icon></el-tooltip>
        </el-divider>

        <ScriptEditor v-model="activeComp.props.slot" height="500px" />
        <div class="code-tip" v-if="activeComp.props.slot">
            <el-button type="warning" link @click="activeComp.props.slot = ''">清除代码 (恢复可视化配置)</el-button>
        </div>

    </div>
</template>

<script setup>
import ScriptEditor from '../components/ScriptEditor.vue';
import { Delete, QuestionFilled } from '@element-plus/icons-vue';

const props = defineProps(['activeComp']);

const addField = () => {
    props.activeComp.props.items.push({
        type: 'input',
        label: '新字段',
        fieldName: 'newKey',
        placeholder: ''
    });
};
</script>

<style scoped>
.field-card {
    background: #f8f9fa;
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 14px;
    color: #606266;
}

.opt-row {
    display: flex;
    gap: 5px;
    margin-bottom: 5px;
    align-items: center;
}

.del-icon {
    cursor: pointer;
    color: #f56c6c;
}

.code-tip {
    text-align: right;
    margin-top: 5px;
}
</style>