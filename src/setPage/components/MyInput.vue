<template>
    <el-form-item :label="propsData.label" :prop="propsData.fieldName" :rules="validationRules">
        <el-input v-model="modelValue" :placeholder="propsData.placeholder" />
    </el-form-item>
</template>

<script setup>
import { inject, computed, onMounted } from 'vue';

const props = defineProps(['propsData']);
const formContext = inject('formContext', null);

// 如果不在 MyForm 里，就是一个普通输入框，不绑定数据
const isInsideForm = !!formContext;

// 注册初始值
onMounted(() => {
    if (isInsideForm && props.propsData.fieldName) {
        formContext.registerField(props.propsData.fieldName, props.propsData.defaultValue);
    }
});

// 双向绑定代理
const modelValue = computed({
    get: () => isInsideForm ? formContext.formData[props.propsData.fieldName] : '',
    set: (val) => {
        if (isInsideForm) {
            formContext.formData[props.propsData.fieldName] = val;
        }
    }
});

// 构造 Element Plus 校验规则
const validationRules = computed(() => {
    const rules = [];
    if (props.propsData.required) {
        rules.push({ required: true, message: `${props.propsData.label} 不能为空`, trigger: 'blur' });
    }
    // 这里可以继续把 propsData.rules 里的正则加进去
    return rules;
});
</script>