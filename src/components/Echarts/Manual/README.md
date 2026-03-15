# ECharts 组件库

这是一个基于 Vue 3 和 ECharts 的图表组件库，提供了多种常用的图表组件，使用简单，配置灵活。

## 安装依赖

```bash
npm install echarts
# 或者
yarn add echarts
```

## 组件列表

### 基础图表
- **BaseChart**: 基础图表组件，提供通用的 ECharts 功能

### 常用图表
- **BarChart**: 柱形图
- **LineChart**: 折线图
- **PieChart**: 饼图
- **AreaChart**: 面积图
- **ScatterChart**: 散点图
- **RadarChart**: 雷达图
- **GaugeChart**: 仪表盘
- **FunnelChart**: 漏斗图

### 高级图表
- **HeatmapChart**: 热力图
- **TreeChart**: 树图
- **SunburstChart**: 旭日图
- **TreemapChart**: 矩形树图
- **CandlestickChart**: K线图
- **MapChart**: 地图
- **LiquidChart**: 水球图
- **WordCloudChart**: 词云图

## 使用方法

### 1. 导入组件

```vue
<template>
  <div>
    <!-- 柱形图 -->
    <BarChart
      :data="barData"
      :x-axis="barXAxis"
      title="销售数据"
      height="300px"
      @chart-click="handleClick"
    />

    <!-- 饼图 -->
    <PieChart
      :data="pieData"
      title="市场份额"
      height="300px"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BarChart, PieChart } from '@/components/Echarts'

// 柱形图数据
const barData = ref([120, 200, 150, 80, 70, 110])
const barXAxis = ref(['1月', '2月', '3月', '4月', '5月', '6月'])

// 饼图数据
const pieData = ref([
  { name: '苹果', value: 35 },
  { name: '三星', value: 25 },
  { name: '华为', value: 20 },
  { name: '小米', value: 15 },
  { name: '其他', value: 5 }
])

// 事件处理
const handleClick = (params) => {
  console.log('图表点击:', params)
}
</script>
```

### 2. 全局注册

在 `main.js` 中全局注册所有组件：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import * as ECharts from '@/components/Echarts'

const app = createApp(App)

// 注册所有图表组件
Object.keys(ECharts).forEach(key => {
  app.component(key, ECharts[key])
})

app.mount('#app')
```

## 组件属性

### 通用属性

所有图表组件都支持以下通用属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | String | '100%' | 容器宽度 |
| height | String | '400px' | 容器高度 |
| theme | String | '' | 主题名称 |
| autoResize | Boolean | true | 是否自动调整大小 |
| renderer | String | 'canvas' | 渲染器类型 (canvas/svg) |
| title | String | '' | 图表标题 |
| subtitle | String | '' | 图表副标题 |
| showLegend | Boolean | true | 是否显示图例 |
| showToolbox | Boolean | true | 是否显示工具箱 |
| colors | Array | 默认颜色数组 | 颜色配置 |

### 事件

所有图表组件都支持以下事件：

| 事件名 | 说明 | 参数 |
|--------|------|------|
| chart-ready | 图表初始化完成 | chartInstance |
| chart-click | 图表点击事件 | params |
| chart-dblclick | 图表双击事件 | params |
| chart-mouseover | 鼠标悬停事件 | params |
| chart-mouseout | 鼠标离开事件 | params |

## 数据格式

### 柱形图/折线图/面积图
```javascript
// 简单数组
const data = [120, 200, 150, 80, 70, 110]

// X轴数据
const xAxis = ['1月', '2月', '3月', '4月', '5月', '6月']
```

### 饼图/漏斗图
```javascript
const data = [
  { name: '苹果', value: 35 },
  { name: '三星', value: 25 },
  { name: '华为', value: 20 }
]
```

### 散点图
```javascript
// 数组格式
const data = [[170, 65], [175, 70], [180, 75]]

// 对象格式
const data = [
  { x: 170, y: 65 },
  { x: 175, y: 70 },
  { x: 180, y: 75 }
]
```

### 雷达图
```javascript
const data = [
  { name: '技术能力', value: 85 },
  { name: '沟通能力', value: 70 },
  { name: '学习能力', value: 90 }
]
```

### 树图
```javascript
const data = {
  name: '公司',
  children: [
    {
      name: '技术部',
      children: [
        { name: '前端组' },
        { name: '后端组' }
      ]
    }
  ]
}
```

### K线图
```javascript
// 数组格式 [开盘, 收盘, 最低, 最高]
const data = [
  [20, 34, 10, 38],
  [40, 35, 30, 50],
  [31, 38, 31, 44]
]

// 对象格式
const data = [
  { open: 20, close: 34, lowest: 10, highest: 38 },
  { open: 40, close: 35, lowest: 30, highest: 50 }
]
```

## 主题配置

组件库支持 ECharts 的主题配置：

```javascript
// 使用内置主题
<BarChart
  :data="data"
  theme="dark"
  title="销售数据"
/>

// 使用自定义主题
<BarChart
  :data="data"
  :theme="customTheme"
  title="销售数据"
/>
```

## 响应式设计

所有组件都支持响应式设计，会自动适应容器大小变化：

```vue
<template>
  <div class="chart-container">
    <BarChart
      :data="data"
      :auto-resize="true"
      width="100%"
      height="300px"
    />
  </div>
</template>

<style>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

## 自定义配置

如果需要更复杂的配置，可以通过 `option` 属性直接传入 ECharts 配置：

```vue
<template>
  <BaseChart
    :option="customOption"
    width="100%"
    height="400px"
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseChart from '@/components/Echarts/BaseChart.vue'

const customOption = ref({
  title: {
    text: '自定义图表'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    type: 'line'
  }]
})
</script>
```

## 注意事项

1. 确保已安装 ECharts 依赖
2. 某些图表（如地图、水球图、词云图）可能需要额外的 ECharts 扩展
3. 大数据量时建议使用 Canvas 渲染器以获得更好的性能
4. 组件会自动处理数据格式转换，但建议使用标准格式以获得最佳效果

## 示例

查看 `example.vue` 文件获取完整的使用示例。
