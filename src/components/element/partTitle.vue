<template>
    <div class="part-title" :class="{ 'no-padding': noPadding, 'no-border': noBorder }" :style="[
        { height: height + 'px' },
        noPadding ? { margin: `-${paddingValue / 2}px -${paddingValue}px`, width: `calc(100% + ${paddingValue * 2}px)` } : {}
    ]">
        <div class="title-line" :style="{ height: 26 + 'px' }"></div>
        <div class="title-content">
            <slot>{{ title }}</slot>
        </div>
        <div class="title-right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    noPadding: {
        type: Boolean,
        default: false
    },
    paddingValue: {
        type: Number,
        default: 16
    },
    height: {
        type: Number,
        default: 30
    },
    noBorder: {
        type: Boolean,
        default: false
    },
})
</script>

<style scoped>
.part-title {
    display: flex;
    width: 100%;
    border-bottom: 1px solid rgba(201, 201, 201, 1);
    align-items: center;
}

.no-border {
    border-bottom: none;
}

.title-line {
    width: 2px;
    opacity: 1;
    border-radius: 0px 1px 1px 0px;
    background-color: rgb(83, 128, 253);
    margin-right: 8px;
}

.title-content {
    font-size: 16px;
    font-weight: 500;
    flex: 1;
}

.title-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    margin-right: 16px;
}
</style>