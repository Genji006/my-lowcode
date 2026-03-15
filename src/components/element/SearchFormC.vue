<template>
  <div class="formExpand cardShadow">
    <el-form :model="modelValue" ref="formRef" :label-width="labelWidth" v-bind="formProps">
      <template v-for="item in items" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <template v-if="
              item.component === 'el-date-picker' &&
              (item.datePickerType == 'quarter' ||
                item.datePickerType == 'quarterrange')
            ">
            <el-quarter-picker @change="getQuart" ref="quaRef" v-model="modelValue[item.prop]" :datePickerType="item.datePickerType" />
          </template>
          <template v-else-if="item.component === 'el-radio-date'">
            <radioData v-model="modelValue[item.prop]" :defaultType="item.defaultType" :attrs="item.attrs" :ref="(el) => setRadioDataRef(el, item.prop)"></radioData>
          </template>
          <template v-else-if="item.component === 'el-select'">
            <el-select v-model="modelValue[item.prop]" v-bind="item.attrs" filterable :style="item.style">
              <el-option v-for="opt in item.options || []" :key="getOptionValue(opt, item)" :label="item.montageName ? ( getOptionValue(opt, item) + '/' + getOptionLabel(opt, item)) :getOptionLabel(opt, item) " :value="getOptionValue(opt, item)" />
            </el-select>
          </template>
          <template v-else-if="item.component === 'el-select-v2'">
            <el-select-v2 v-model="modelValue[item.prop]" v-bind="item.attrs" :style="item.style" filterable clearable :options="item.options || []" />
          </template>
          <template v-else>
            <component :is="item.component || 'el-input'" v-model="modelValue[item.prop]" v-bind="item.attrs" :style="item.style" />
          </template>
          <slot :name="item.prop"></slot>
        </el-form-item>
      </template>
      <el-form-item>
        <confirm type="primary" @click="onSearch">
          <el-icon>
            <Search />
          </el-icon>
          查询
        </confirm>
        <concel @click="onReset">
          <el-icon>
            <RefreshRight />
          </el-icon>
          重置
        </concel>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from "vue";
import confirm from "./Confirm.vue";
import concel from "./Cancel.vue";
import ElQuarterPicker from "./ElQuarterPicker.vue";
import radioData from "./radioData.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  items: { type: Array, required: true }, // [{ label, prop, component, attrs, options, style }]
  formProps: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: "" },
});

const quaRef = ref(null);

const getQuart = (date) => {
  // console.log(date,"<====v-date");
};

const items = computed(() => props.items); // 监听

const emit = defineEmits(["update:modelValue", "searchVal", "reset"]);

const formRef = ref(null);

function onSearch() {
  console.log(props.modelValue, "props.modelValue查询");
  emit("searchVal", { ...props.modelValue, timeDate: "1" });
}

// 使用数组存储所有 radioData 组件的引用
const radioDataRefs = ref([]);
const setRadioDataRef = (el) => {
  if (el) {
    radioDataRefs.value.push(el);
  }
};

function onReset() {
  formRef.value?.resetFields();
  nextTick(() => {
    radioDataRefs.value.forEach((ref) => {
      if (ref && typeof ref.resetData === "function") {
        ref.resetData();
      }
    });
    // 清空引用数组，为下次渲染做准备
    radioDataRefs.value = [];
  });
  emit("reset");
}

// 获取 option 的 value，优先用 item.optionValue，再用 value、dictValue
function getOptionValue(opt, item) {
  if (item.optionValue && opt[item.optionValue] !== undefined)
    return opt[item.optionValue];
  return opt.value ?? opt.dictValue ?? opt.label ?? opt.dictLabel;
}
// 获取 option 的 label，优先用 item.optionLabel，再用 label、dictLabel
function getOptionLabel(opt, item) {
  if (item.optionLabel && opt[item.optionLabel] !== undefined)
    return opt[item.optionLabel];
  return opt.label ?? opt.dictLabel ?? opt.value ?? opt.dictValue;
}
</script>

<style lang="scss" scoped>
.formExpand {
  width: 100%;
  height: 100%;
  // padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
</style>
