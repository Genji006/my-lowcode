<template>
  <div style="display: flex">
    <div
      :style="{
        left: componentDiv.c_left + '%',
        top: componentDiv.c_top + '%',
        width: componentDiv.width + '%',
        height: componentDiv.height + '%',
      }"
    >
      <divLabel :listPath="componentDiv.bind?.listPath || []" />
    </div>
    <div class="drop-container">
      <div
        v-for="item in droppedComponents"
        :key="item.uuidC"
        class="dropped-item-wrapper-css"
        :style="{
          left: item.c_left + '%',
          top: item.c_top + '%',
          width: item.width + '%',
          height: item.height + '%',
        }"
      >
        <div class="dropped-item-css">
          <component
            :is="isComponent(item)"
            v-bind="item.bind"
            :ref="(el) => setComponentRef(item.componentType, el, item)"
            @searchVal="handleSearch"
            @reset="resetSearch"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from "vue";
import TableComponent from "@/components/table/tableAndPage.vue";
import searchFormComponent from "@/components/element/SearchFormC.vue";
import divLabel from "@/components/table/divLabel.vue";
import { pageDetailApi } from "@/api/settings/index";
import { useRoute } from "vue-router";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
} from "@/components/Echarts/index"; //  图表配置
const route = useRoute();

// 添加组件类型映射关系
const componentMap = {
  TABLE: TableComponent,
  searchform: searchFormComponent,
  DIV_TAB: divLabel, //  侧边栏
  CHART: {
    BAR: BarChart, //  柱形图
    LINE: LineChart, //  折线图
    SCATTER: ScatterChart, //  散点图
    RADAR: RadarChart, //  雷达图
    PIE: PieChart, //  饼图
  },
};

const droppedComponents = ref([]);

// 将componentRefs初始化为Map对象，用于存储组件引用
const componentRefs = new Map();

const componentDiv = reactive({});

// 设置组件引用
const setComponentRef = (type, el, item) => {
  if (el) {
    // 使用组件的uuidC作为唯一键来存储引用
    componentRefs.set(`${type}-${item.uuidC}`, el);
    console.log(`已存储组件引用: ${type}-${item.uuidC}`);
    // console.log(componentRefs.get(),"componentRefs");
    // 默认进来调表格接口
    if (el.fetchData) {
      el.fetchData();
    }
  }
};

// 处理搜索事件
const handleSearch = (searchParams) => {
  console.log("搜索参数:", searchParams);
  // 遍历所有表格组件引用并调用fetchData方法
  // 实际应用中，你可能需要根据特定条件筛选要触发的表格组件
  componentRefs.forEach((ref, key) => {
    if (key.startsWith("TABLE-") && ref.fetchData) {
      ref.fetchData("search", searchParams);
      console.log(`已调用表格组件 ${key} 的fetchData方法`);
    }
  });
};

const resetSearch = (searchParams) => {
  componentRefs.forEach((ref, key) => {
    if (key.startsWith("TABLE-") && ref.fetchData) {
      ref.fetchData("重置", searchParams);
    }
  });
};

//  处理渲染组件
//  处理渲染组件
const isComponent = (item) => {
  if (item.componentType == "CHART") {
    // 图表类型（例：柱形图、折线图、饼图等）
    return componentMap.CHART[item.chartType];
  } else {
    return componentMap[item.componentType];
  }
};

//  处理每个类型的数据
function pageDetailShowFn(arr) {
  let dataList = []; //  定义一个空数组
  let queryDataForm = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let type = arr[i].componentType; //  组件类型
    let objRow = arr[i]; //  当前行内容
    let objPush = JSON.parse(objRow.extendAttr); //  解析组件配置
    objPush.bind["apiParms"] = { componentId: objRow.componentId }; //  给接口传参（额外参数）
    // 是否存在数据来源
    if (objRow.dsType) {
      objPush.bind["dsConfig"] = JSON.parse(objRow?.dsConfig)?.bash;
      objPush.bind["dsType"] = objRow.dsType;
    }
    // 判断组件类型
    if (type == "CHART") {
      // 确保图表配置正确回显
      objPush.bind["title"] = objPush.bind.title || "";
      objPush.bind["subtitle"] = objPush.bind.subtitle || "";
      objPush.bind["theme"] = objPush.bind.theme || "";
      objPush.bind["showLegend"] = objPush.bind.showLegend || false;
      objPush.bind["showToolbox"] = objPush.bind.showToolbox || false;
      objPush.bind["showGrid"] = objPush.bind.showGrid || false;
      objPush.bind["rowClickData"] = objPush.bind.rowClickData || '';
      objPush.bind["colors"] = objPush.bind.colors || [
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
      ];
    } else if (type == "TABLE") {
      // 表格组件接口路径
      objPush.bind["apiUrl"] = "/business/design-data/queryDataPage";
    } else if (type == "searchform") {
      queryDataForm = objPush.bind?.items || [];
    }
    if (type == "DIV_TAB") {
      Object.assign(componentDiv, objPush);
      console.log(componentDiv, "componentDiv");
    } else {
      dataList.push(objPush);
    }
  }
  nextTick(() => {
    for (let i = 0, len = dataList.length; i < len; i++) {
      let type = arr[i].componentType; //  组件类型
      if (type == "TABLE") {
        dataList[i].bind.apiParms["queryDataForm"] = queryDataForm;
      }
    }
  });
  return dataList;
}
//  页面详情
const pageDetailApiFn = (code) => {
  let obj = {
    pageCode: code,
  };
  pageDetailApi(obj).then((res) => {
    if (res.code == 200) {
      console.log(res, "页面详情");
      let arr = res.data?.designPageComponentResult || [];
      droppedComponents.value = [];
      droppedComponents.value = pageDetailShowFn(arr);
      // 组件加载完成后，延迟设置配置确保DOM已更新
      // setTimeout(() => {
      //   if (styleConfigRef.value && selectedComponent.value && typeKey.value === 'CHART') {
      //     styleConfigRef.value.setConfig(currentConfig);
      //   }
      // }, 100);
    }
  });
};

onMounted(() => {
  pageDetailApiFn(route.path);
  // 组件挂载后，可以访问组件引用
  console.log("组件引用:", componentRefs);
});
</script>

<style scoped>
/* 简化样式，移除flex相关配置 */
.content-area {
  width: 100%;
  height: 100vh;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.area-header {
  padding: 10px;
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
}

.drop-container {
  background-color: #ece9e9;
  width: 100%;
  height: 100%;
  position: relative;
}

.dropped-item-wrapper-css {
  position: absolute;
}

.dropped-item-css {
  /* border: 1px dashed #ccc; */
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
