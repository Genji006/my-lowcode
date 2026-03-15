<template>
  <div class="indicator-analysis-platform">
    <div class="platform-header">
      <h1>指标分析平台</h1>
      <div class="header-controls">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-select v-model="selectedVersion" placeholder="请选择版本" @change="handleVersionChange">
          <el-option
            v-for="version in versionOptions"
            :key="version.value"
            :label="version.label"
            :value="version.value"
          />
        </el-select>
        <el-button type="primary" @click="refreshData">刷新数据</el-button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 关键指标概览 -->
      <div class="summary-cards">
        <el-row :gutter="20">
          <el-col :span="6" v-for="card in summaryCards" :key="card.title">
            <el-card class="summary-card">
              <div class="card-content">
                <div class="card-title">{{ card.title }}</div>
                <div class="card-value">{{ card.value }}</div>
                <div class="card-trend" :class="card.trend > 0 ? 'positive' : 'negative'">
                  <span>{{ card.trend > 0 ? '↑' : '↓' }} {{ Math.abs(card.trend) }}%</span>
                  <span class="trend-desc">较上期</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card class="chart-container">
              <div slot="header" class="chart-header">
                <span>指标趋势分析</span>
                <el-select v-model="selectedIndicator" placeholder="请选择指标" size="small">
                  <el-option
                    v-for="indicator in indicatorOptions"
                    :key="indicator.value"
                    :label="indicator.label"
                    :value="indicator.value"
                  />
                </el-select>
              </div>
              <LineChart :chart-data="trendChartData" :chart-options="trendChartOptions" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="chart-container">
              <div slot="header" class="chart-header">
                <span>指标分布</span>
              </div>
              <PieChart :chart-data="distributionChartData" :chart-options="distributionChartOptions" />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 指标明细表格 -->
      <div class="indicators-table">
        <el-card>
          <div slot="header" class="table-header">
            <span>指标明细</span>
            <div class="table-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索指标名称或编码"
                clearable
                style="width: 200px; margin-right: 10px;"
                @keyup.enter.native="searchIndicators"
              />
              <el-button type="primary" @click="searchIndicators">搜索</el-button>
            </div>
          </div>
          <el-table
            :data="indicatorsTableData"
            style="width: 100%"
            v-loading="tableLoading"
            @sort-change="handleSortChange"
          >
            <el-table-column prop="dataItemCode" label="数据项编码" sortable />
            <el-table-column prop="dataItemName" label="数据项名称" sortable />
            <el-table-column prop="productName" label="来源应用" />
            <el-table-column prop="currentValue" label="当前值" sortable align="right" />
            <el-table-column prop="previousValue" label="上期值" sortable align="right" />
            <el-table-column prop="changeRate" label="变化率" sortable align="right">
              <template #default="scope">
                <span :class="scope.row.changeRate >= 0 ? 'positive' : 'negative'">
                  {{ scope.row.changeRate >= 0 ? '+' : '' }}{{ scope.row.changeRate }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="analysisCycle" label="分析周期" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="viewIndicatorDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalIndicators"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 指标详情对话框 -->
    <el-dialog
      title="指标详情"
      v-model="detailDialogVisible"
      width="60%"
      :before-close="handleCloseDetailDialog"
    >
      <div v-if="selectedIndicatorDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="数据项编码">{{ selectedIndicatorDetail.dataItemCode }}</el-descriptions-item>
          <el-descriptions-item label="数据项名称">{{ selectedIndicatorDetail.dataItemName }}</el-descriptions-item>
          <el-descriptions-item label="来源应用">{{ selectedIndicatorDetail.productName }}</el-descriptions-item>
          <el-descriptions-item label="版本号">{{ selectedIndicatorDetail.versionNumber }}</el-descriptions-item>
          <el-descriptions-item label="分析周期">{{ selectedIndicatorDetail.analysisCycle }}</el-descriptions-item>
          <el-descriptions-item label="计量单位">{{ selectedIndicatorDetail.unitMeasurement }}</el-descriptions-item>
          <el-descriptions-item label="数据项说明" :span="2">{{ selectedIndicatorDetail.dataItemExplain }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-chart">
          <h3>历史趋势</h3>
          <LineChart :chart-data="detailChartData" :chart-options="detailChartOptions" height="300px" />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/Echarts/base/LineChart.vue'
import PieChart from '@/components/Echarts/base/PieChart.vue'

// 数据模型
const dateRange = ref([])
const selectedVersion = ref('')
const selectedIndicator = ref('')
const searchKeyword = ref('')
const tableLoading = ref(false)
const detailDialogVisible = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalIndicators = ref(0)

// 数据存储
const versionOptions = ref([
  { label: 'V1.0', value: '1.0' },
  { label: 'V2.0', value: '2.0' },
  { label: 'V3.0', value: '3.0' }
])

const indicatorOptions = ref([
  { label: '用户活跃度', value: 'user_activity' },
  { label: '收入增长率', value: 'revenue_growth' },
  { label: '客户满意度', value: 'customer_satisfaction' },
  { label: '产品销量', value: 'product_sales' }
])

const summaryCards = ref([
  { title: '总指标数', value: '128', trend: 2.5 },
  { title: '异常指标', value: '5', trend: -1.2 },
  { title: '增长指标', value: '86', trend: 5.3 },
  { title: '稳定指标', value: '37', trend: 0.1 }
])

const indicatorsTableData = ref([
  {
    id: 1,
    dataItemCode: 'IND001',
    dataItemName: '日活跃用户数',
    productName: '用户管理系统',
    currentValue: '12,340',
    previousValue: '11,890',
    changeRate: 3.78,
    analysisCycle: '每日',
    versionNumber: 'V2.0',
    unitMeasurement: '人',
    dataItemExplain: '每日登录系统的独立用户数量'
  },
  {
    id: 2,
    dataItemCode: 'IND002',
    dataItemName: '月收入',
    productName: '财务系统',
    currentValue: '¥1,250,000',
    previousValue: '¥1,180,000',
    changeRate: 5.93,
    analysisCycle: '每月',
    versionNumber: 'V2.0',
    unitMeasurement: '元',
    dataItemExplain: '当月总收入金额'
  },
  {
    id: 3,
    dataItemCode: 'IND003',
    dataItemName: '客户满意度',
    productName: '客服系统',
    currentValue: '92%',
    previousValue: '94%',
    changeRate: -2.13,
    analysisCycle: '每季度',
    versionNumber: 'V1.0',
    unitMeasurement: '%',
    dataItemExplain: '客户满意度调查平均得分'
  }
])

const selectedIndicatorDetail = ref(null)

// 图表数据
const trendChartData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '指标值',
      data: [120, 190, 130, 160, 150, 180],
      borderColor: '#409EFF',
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
      fill: true
    }
  ]
})

const distributionChartData = ref({
  labels: ['正常', '预警', '异常'],
  datasets: [
    {
      data: [85, 10, 5],
      backgroundColor: ['#67C23A', '#E6A23C', '#F56C6C']
    }
  ]
})

const detailChartData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '指标值',
      data: [120, 190, 130, 160, 150, 180],
      borderColor: '#409EFF',
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
      fill: true
    }
  ]
})

// 图表配置
const trendChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

const distributionChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

const detailChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

// 方法定义
const handleDateChange = (dates) => {
  console.log('日期范围改变:', dates)
  fetchData()
}

const handleVersionChange = (version) => {
  console.log('版本改变:', version)
  fetchData()
}

const refreshData = () => {
  ElMessage.info('正在刷新数据...')
  fetchData()
}

const fetchData = () => {
  tableLoading.value = true
  // 模拟异步数据获取
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

const handleSortChange = ({ column, prop, order }) => {
  console.log('排序字段:', prop, '排序方式:', order)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const searchIndicators = () => {
  ElMessage.info(`搜索关键字: ${searchKeyword.value}`)
  fetchData()
}

const viewIndicatorDetail = (row) => {
  selectedIndicatorDetail.value = row
  detailDialogVisible.value = true
  
  // 模拟获取详情图表数据
  setTimeout(() => {
    // 这里可以调用API获取真实的图表数据
  }, 500)
}

const handleCloseDetailDialog = (done) => {
  ElMessageBox.confirm('确认关闭详情窗口吗？')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.indicator-analysis-platform {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100%;
  
  .platform-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h1 {
      margin: 0;
      color: #303133;
    }
    
    .header-controls {
      display: flex;
      gap: 15px;
      align-items: center;
    }
  }
  
  .dashboard-content {
    .summary-cards {
      margin-bottom: 20px;
      
      .summary-card {
        .card-content {
          text-align: center;
          
          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 10px;
          }
          
          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 10px;
          }
          
          .card-trend {
            font-size: 12px;
            
            &.positive {
              color: #67C23A;
            }
            
            &.negative {
              color: #F56C6C;
            }
            
            .trend-desc {
              color: #909399;
              margin-left: 5px;
            }
          }
        }
      }
    }
    
    .charts-section {
      margin-bottom: 20px;
      
      .chart-container {
        height: 400px;
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
    
    .indicators-table {
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  
  .positive {
    color: #67C23A;
  }
  
  .negative {
    color: #F56C6C;
  }
  
  .detail-chart {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
}
</style>