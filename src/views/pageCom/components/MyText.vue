<template>
    <div class="comp-box" :style="{ color: propsData.color, border: '1px dashed #999', padding: '5px' }">
        {{ propsData.text }}
    </div>
</template>

<script setup>
const props = defineProps(['propsData']);
console.log(props.propsData);
</script>