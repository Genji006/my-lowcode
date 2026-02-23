<template>
    <el-form-item label-width="0">
        <el-button :type="propsData.type" style="width: 100%" @click="handleClick">
            {{ propsData.text }}
        </el-button>
    </el-form-item>
</template>

<script setup>
import { inject } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps(['propsData']);
const emit = defineEmits(['run-event']);
const formContext = inject('formContext', null);

const handleClick = () => {
    // 触发点击事件 (用于低代码配置的交互)
    emit('run-event', { trigger: 'click', payload: {} });

    // 特殊逻辑：如果是提交按钮，且在表单内
    if (props.propsData.actionType === 'submit' && formContext) {
        formContext.validate()
            .then(() => {
                ElMessage.success('校验通过！数据已打印在控制台');
                console.log('表单提交数据:', JSON.parse(JSON.stringify(formContext.formData)));
                // 这里可以扩展：发送请求等
            })
            .catch((err) => {
                ElMessage.error('表单校验失败，请检查输入');
                console.warn(err);
            });
    }
};
</script>