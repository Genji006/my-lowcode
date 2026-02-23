<template>
    <div>
        <el-divider content-position="left">容器/表单布局</el-divider>
        <el-form label-width="100px" label-position="right">
            <el-form-item label="排列方向">
                <el-radio-group v-model="activeComp.props.flexDirection">
                    <el-radio-button label="row">水平</el-radio-button>
                    <el-radio-button label="column">垂直</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="自动换行">
                <el-switch v-model="activeComp.props.flexWrap" active-value="wrap" inactive-value="nowrap" />
            </el-form-item>

            <el-form-item label="主轴对齐">
                <el-select v-model="activeComp.props.justifyContent">
                    <el-option label="起点 (Start)" value="flex-start" />
                    <el-option label="居中 (Center)" value="center" />
                    <el-option label="两端 (Between)" value="space-between" />
                    <el-option label="环绕 (Around)" value="space-around" />
                </el-select>
            </el-form-item>

            <el-form-item label="交叉轴对齐">
                <el-select v-model="activeComp.props.alignItems">
                    <el-option label="拉伸 (Stretch)" value="stretch" />
                    <el-option label="起点 (Start)" value="flex-start" />
                    <el-option label="居中 (Center)" value="center" />
                </el-select>
            </el-form-item>

            <el-form-item label="间距 (Gap)">
                <el-input-number v-model="activeComp.props.gap" />
            </el-form-item>

            <el-form-item label="内边距 (Pad)">
                <el-input-number v-model="activeComp.props.padding" />
            </el-form-item>

            <el-divider content-position="left">样式</el-divider>
            <el-form-item label="背景色">
                <el-color-picker v-model="activeComp.style.backgroundColor" show-alpha />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
defineProps(['activeComp']);
</script>
<style scoped>
:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number) {
    width: 100%;
}
</style>