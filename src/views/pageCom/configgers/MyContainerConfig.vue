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

            <el-form-item label="内边距">
                <div class="padding-grid">
                    <div class="p-item">
                        <span class="label">上</span>
                        <el-input-number v-model="activeComp.props.paddingTop" :min="0" controls-position="right" />
                    </div>
                    <div class="p-item">
                        <span class="label">右</span>
                        <el-input-number v-model="activeComp.props.paddingRight" :min="0" controls-position="right" />
                    </div>
                    <div class="p-item">
                        <span class="label">下</span>
                        <el-input-number v-model="activeComp.props.paddingBottom" :min="0" controls-position="right" />
                    </div>
                    <div class="p-item">
                        <span class="label">左</span>
                        <el-input-number v-model="activeComp.props.paddingLeft" :min="0" controls-position="right" />
                    </div>
                </div>
            </el-form-item>
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

.padding-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
}

.p-item {
    display: flex;
    align-items: center;
}

.p-item .label {
    font-size: 12px;
    color: #909399;
    margin-right: 5px;
    white-space: nowrap;
}
</style>