<template>
    <div class="title-config-container">
        <el-form label-width="130px" size="small" label-position="left">

            <el-divider content-position="left">内容配置</el-divider>

            <el-form-item>
                <template #label>
                    主标题
                    <el-tooltip content="支持填入动态变量" placement="top">
                        <el-icon style="margin-left: 4px; cursor: pointer; color: #909399;">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <el-input v-model="activeComp.props.title" placeholder="请输入" clearable />
            </el-form-item>

            <el-form-item>
                <template #label>
                    副标题模板
                    <el-tooltip content="支持填入动态变量" placement="top">
                        <el-icon style="margin-left: 4px; cursor: pointer; color: #909399;">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <el-input v-model="activeComp.props.templateStr" placeholder="请输入"
                    clearable />
            </el-form-item>

        </el-form>
    </div>
</template>

<script setup>
import { QuestionFilled } from '@element-plus/icons-vue';

const props = defineProps({
    activeComp: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
.title-config-container {
    padding: 10px;
}
</style>