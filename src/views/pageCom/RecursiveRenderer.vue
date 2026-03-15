<!-- 递归渲染组件，支持容器嵌套 -->
<template>
    <CompWrapper :conf="conf" :isActive="store.activeId === conf.id" :isFlow="isFlow" @set-active="store.setActive"
        @update-style="updateStyle">
        <MyContainer v-if="conf.type === 'MyContainer'" :propsData="conf.props" :conf="conf" />

        <component v-else :is="compMap[conf.type]" :propsData="conf.props" :conf="conf"
            @run-event="(e) => store.handleEvent(conf.id, e.trigger, e.payload)" />
    </CompWrapper>
</template>

<script setup>
import { useDesignStore } from './demoStore';
import CompWrapper from './components/CompWrapper.vue';
import MyContainer from './components/MyContainer.vue';
import MyTable from './components/MyTable.vue';
import MyText from './components/MyText.vue';
import MyChart from './components/MyChart.vue';
import MyForm from './components/MyForm.vue';
import MyInput from './components/MyInput.vue';
import MySelect from './components/MySelect.vue';
import MyButton from './components/MyButton.vue';
import MyQueryForm from './components/MyQueryForm.vue';
import MyRadarChart from './components/MyRadarChart.vue';
import MyPieChart from './components/MyPieChart.vue';

const props = defineProps({
    conf: Object,
    isFlow: Boolean
});

const store = useDesignStore();
const compMap = {
    'MyTable': MyTable, 'MyText': MyText, 'MyChart': MyChart, 'MyForm': MyForm, 'MyInput': MyInput, 'MySelect': MySelect, 'MyButton': MyButton, 'MyQueryForm': MyQueryForm,
    'MyScatterChart': MyChart, 'MyPieChart': MyPieChart, 'MyRadarChart': MyRadarChart
};

const updateStyle = (newStyle) => {
    store.updateComponentStyle(props.conf.id, newStyle);
};
</script>