<template>
  <div class="echarts-example">
    <h1>ECharts 组件库使用示例</h1>

    <!-- 柱形图示例 -->
    <div class="chart-section">
      <h2>柱形图</h2>
      <BarChart
        :data="barData"
        :x-axis="barXAxis"
        title="销售数据"
        subtitle="2024年各月销售情况"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 折线图示例 -->
    <div class="chart-section">
      <h2>折线图</h2>
      <LineChart
        :data="lineData"
        :x-axis="lineXAxis"
        title="趋势分析"
        subtitle="用户增长趋势"
        height="300px"
        :smooth="true"
        :show-area="true"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 饼图示例 -->
    <div class="chart-section">
      <h2>饼图</h2>
      <PieChart
        :data="pieData"
        title="市场份额"
        subtitle="各品牌市场占有率"
        height="300px"
        :show-label="true"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 面积图示例 -->
    <div class="chart-section">
      <h2>面积图</h2>
      <AreaChart
        :data="areaData"
        :x-axis="areaXAxis"
        title="收入统计"
        subtitle="各季度收入情况"
        height="300px"
        :stack="true"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 散点图示例 -->
    <div class="chart-section">
      <h2>散点图</h2>
      <ScatterChart
        :data="scatterData"
        title="身高体重分布"
        subtitle="人群身高体重关系"
        height="300px"
        :x-name="'身高(cm)'"
        :y-name="'体重(kg)'"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 雷达图示例 -->
    <div class="chart-section">
      <h2>雷达图</h2>
      <RadarChart
        :data="radarData"
        :indicators="radarIndicators"
        title="能力评估"
        subtitle="各项技能评分"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 仪表盘示例 -->
    <div class="chart-section">
      <h2>仪表盘</h2>
      <GaugeChart
        :value="gaugeValue"
        title="完成率"
        subtitle="项目进度"
        height="300px"
        :min="0"
        :max="100"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 漏斗图示例 -->
    <div class="chart-section">
      <h2>漏斗图</h2>
      <FunnelChart
        :data="funnelData"
        title="销售漏斗"
        subtitle="客户转化流程"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 热力图示例 -->
    <div class="chart-section">
      <h2>热力图</h2>
      <HeatmapChart
        :data="heatmapData"
        :x-axis="heatmapXAxis"
        :y-axis="heatmapYAxis"
        title="访问热力图"
        subtitle="24小时访问分布"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 树图示例 -->
    <div class="chart-section">
      <h2>树图</h2>
      <TreeChart
        :data="treeData"
        title="组织架构"
        subtitle="公司部门结构"
        height="400px"
        :layout="'orthogonal'"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 旭日图示例 -->
    <div class="chart-section">
      <h2>旭日图</h2>
      <SunburstChart
        :data="sunburstData"
        title="文件系统"
        subtitle="磁盘空间占用"
        height="400px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 矩形树图示例 -->
    <div class="chart-section">
      <h2>矩形树图</h2>
      <TreemapChart
        :data="treemapData"
        title="销售分布"
        subtitle="各地区销售情况"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 蜡烛图示例 -->
    <div class="chart-section">
      <h2>蜡烛图</h2>
      <CandlestickChart
        :data="candlestickData"
        title="股票走势"
        subtitle="某股票价格变化"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 地图示例 -->
    <div class="chart-section">
      <h2>地图</h2>
      <MapChart
        :data="mapData"
        title="人口分布"
        subtitle="各省份人口数量"
        height="400px"
        :map-name="'china'"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 水波图示例 -->
    <div class="chart-section">
      <h2>水波图</h2>
      <LiquidChart
        :value="liquidValue"
        title="水位指示"
        subtitle="水库水位状态"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>

    <!-- 词云图示例 -->
    <div class="chart-section">
      <h2>词云图</h2>
      <WordCloudChart
        :data="wordCloudData"
        title="热门词汇"
        subtitle="搜索关键词分布"
        height="300px"
        @chart-click="handleChartClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  HeatmapChart,
  TreeChart,
  SunburstChart,
  TreemapChart,
  CandlestickChart,
  MapChart,
  LiquidChart,
  WordCloudChart
} from '../index'

// 柱形图数据
const barData = ref([120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220])
const barXAxis = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

// 折线图数据
const lineData = ref([820, 932, 901, 934, 1290, 1330, 1320, 1450, 1200, 1100, 1300, 1400])
const lineXAxis = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

// 饼图数据
const pieData = ref([
  { name: '苹果', value: 35 },
  { name: '三星', value: 25 },
  { name: '华为', value: 20 },
  { name: '小米', value: 15 },
  { name: '其他', value: 5 }
])

// 面积图数据
const areaData = ref([
  { name: 'Q1', value: 1200 },
  { name: 'Q2', value: 1800 },
  { name: 'Q3', value: 1600 },
  { name: 'Q4', value: 2200 }
])
const areaXAxis = ref(['Q1', 'Q2', 'Q3', 'Q4'])

// 散点图数据
const scatterData = ref([
  [170, 65], [175, 70], [160, 50], [180, 80], [165, 55],
  [185, 85], [155, 45], [190, 90], [150, 40], [195, 95]
])

// 雷达图数据
const radarData = ref([80, 90, 70, 85, 75, 95])
const radarIndicators = ref([
  { name: '技术能力', max: 100 },
  { name: '沟通能力', max: 100 },
  { name: '学习能力', max: 100 },
  { name: '团队协作', max: 100 },
  { name: '创新能力', max: 100 },
  { name: '执行力', max: 100 }
])

// 仪表盘数据
const gaugeValue = ref(75)

// 漏斗图数据
const funnelData = ref([
  { name: '访问', value: 1000 },
  { name: '咨询', value: 800 },
  { name: '订单', value: 600 },
  { name: '付款', value: 400 },
  { name: '成交', value: 200 }
])

// 热力图数据
const heatmapData = ref([
  [0, 0, 5], [0, 1, 7], [0, 2, 3], [0, 3, 5], [0, 4, 2], [0, 5, 6],
  [1, 0, 6], [1, 1, 2], [1, 2, 4], [1, 3, 8], [1, 4, 1], [1, 5, 7],
  [2, 0, 1], [2, 1, 9], [2, 2, 4], [2, 3, 6], [2, 4, 3], [2, 5, 2],
  [3, 0, 7], [3, 1, 3], [3, 2, 5], [3, 3, 1], [3, 4, 8], [3, 5, 4],
  [4, 0, 2], [4, 1, 6], [4, 2, 3], [4, 3, 7], [4, 4, 5], [4, 5, 1]
])
const heatmapXAxis = ref(['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'])
const heatmapYAxis = ref(['周一', '周二', '周三', '周四', '周五'])

// 树图数据
const treeData = ref({
  name: '公司',
  children: [
    {
      name: '技术部',
      children: [
        { name: '前端组', value: 10 },
        { name: '后端组', value: 15 },
        { name: '测试组', value: 8 }
      ]
    },
    {
      name: '产品部',
      children: [
        { name: '产品组', value: 12 },
        { name: '设计组', value: 6 }
      ]
    },
    {
      name: '运营部',
      children: [
        { name: '市场组', value: 8 },
        { name: '客服组', value: 5 }
      ]
    }
  ]
})

// 旭日图数据
const sunburstData = ref([
  {
    name: '系统文件',
    value: 20,
    children: [
      { name: 'Windows', value: 15 },
      { name: 'Program Files', value: 5 }
    ]
  },
  {
    name: '用户文件',
    value: 80,
    children: [
      { name: '文档', value: 30 },
      { name: '图片', value: 25 },
      { name: '视频', value: 15 },
      { name: '其他', value: 10 }
    ]
  }
])

// 矩形树图数据
const treemapData = ref([
  { name: '北京', value: 100 },
  { name: '上海', value: 80 },
  { name: '广州', value: 60 },
  { name: '深圳', value: 70 },
  { name: '杭州', value: 50 },
  { name: '成都', value: 40 }
])

// 蜡烛图数据
const candlestickData = ref([
  [20, 34, 10, 38],
  [40, 35, 30, 50],
  [31, 38, 31, 44],
  [38, 15, 5, 42],
  [48, 28, 20, 64],
  [38, 40, 38, 42]
])

// 地图数据
const mapData = ref([
  { name: '北京', value: 2154 },
  { name: '上海', value: 2424 },
  { name: '广东', value: 12601 },
  { name: '江苏', value: 8475 },
  { name: '浙江', value: 6468 }
])

// 水波图数据
const liquidValue = ref(0.6)

// 词云图数据
const wordCloudData = ref([
  { name: 'Vue', value: 100 },
  { name: 'React', value: 80 },
  { name: 'Angular', value: 60 },
  { name: 'JavaScript', value: 90 },
  { name: 'TypeScript', value: 70 },
  { name: 'Node.js', value: 85 },
  { name: 'Python', value: 75 },
  { name: 'Java', value: 65 },
  { name: 'Go', value: 55 },
  { name: 'Rust', value: 45 }
])

// 事件处理
const handleChartClick = (params) => {
  console.log('图表点击事件:', params)
}
</script>

<style scoped>
.echarts-example {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.chart-section h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style>
