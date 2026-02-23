<template>
    <el-form-item :label="propsData.label" :prop="propsData.fieldName" :rules="validationRules">
        <el-select v-model="modelValue" :placeholder="propsData.placeholder" style="width: 100%">
            <el-option v-for="opt in propsData.options" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
    </el-form-item>
</template>

<script setup>
import { inject, computed, onMounted } from 'vue';

const props = defineProps(['propsData']);
const formContext = inject('formContext', null);
const isInsideForm = !!formContext;

onMounted(() => {
    if (isInsideForm && props.propsData.fieldName) {
        formContext.registerField(props.propsData.fieldName, ''); // 默认空字符串
    }
});

const modelValue = computed({
    get: () => isInsideForm ? formContext.formData[props.propsData.fieldName] : '',
    set: (val) => { if (isInsideForm) formContext.formData[props.propsData.fieldName] = val; }
});

const validationRules = computed(() => {
    const rules = [];
    if (props.propsData.required) {
        rules.push({ required: true, message: `请选择${props.propsData.label}`, trigger: 'change' });
    }
    return rules;
});
</script>