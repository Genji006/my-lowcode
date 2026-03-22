<template>
    <div>
        <card type="base">
            <div class="jisuanguize" style="font-family: none">计算规则</div>
            <div class="itemStyle" style="font-family: none">
                {{ operationExpressionExt }}
            </div>
        </card>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) }
});
const operationExpressionExt = computed(() => {
    return props.apiParams.operationExpressionExt || ''
})

</script>

<style lang="scss" scoped>
.itemStyle {
    color: #1d2129;
    font-family: SimSun;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
}
</style>