<template>
  <div class="showPageCss">
    <!-- 错误信息显示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loadingExport" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <div
      v-for="item in droppedComponents"
      :key="item.uuidC"
      class="dropped-item-wrapper-css"
      :style="{
        left: item.c_left + '%',
        top: item.c_top + '%',
        width: item.width + '%',
        height: item.height + '%',
        'z-index': item.componentType === 'YLsearchform' ? 1 : 0,
      }"
    >
      <component
        :is="computedComponent(item.componentType)"
        v-bind:config="item"
        v-bind:btnType="btnType"
        v-bind:loading="loading"
        v-bind:formData="formData"
        v-bind:whiteList="whiteList"
        v-bind:searchParams="searchParams"
        v-bind:pagination="pagination"
        @export="handleExport"
        @handleSearch="handleSearch"
      ></component>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { queryComponentApi, commonQueryApi, commonExportApi } from "@/api/tool";
import { useRoute } from "vue-router";
import { ref, onMounted, defineAsyncComponent, watch, nextTick } from "vue";

const Table = defineAsyncComponent(
  () => import("@/views/setPage/components/Table.vue"),
);
const Form = defineAsyncComponent(
  () => import("@/views/setPage/components/Form.vue"),
);
const route = useRoute();

const whiteList = ref(["合计"]);
// 数据源配置
const dataSourceConfig = ref({});
const droppedComponents = ref([]);
// 加载状态
const loading = ref(false);
const loadingExport = ref(false);
const loadingText = ref("加载中...");
const formData = ref([]);
const btnType = ref([]);
// 错误信息
const errorMessage = ref("");

// 搜索参数
const searchParams = ref({});

// 分页信息
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 防抖定时器
let searchTimer = null;

// 计算组件
const computedComponent = (type) => {
  if (type === "YLsearchform") {
    return Form;
  } else if (type === "YLTABLE") {
    return Table;
  } else {
    return null;
  }
};

// 处理组件函数
const handleComponent = () => {
  if (dataSourceConfig.value.mrmsDesignCompoentEntitys) {
    droppedComponents.value = dataSourceConfig.value.mrmsDesignCompoentEntitys
      .map((item) => {
        if (item.componentType === "YLTABLE") {
          btnType.value = JSON.parse(item.extendAttr).bind.exportbtn;
        }
        try {
          return {
            ...JSON.parse(item.extendAttr),
            keyWord: dataSourceConfig.value.keyWord,
          };
        } catch (error) {
          ElMessage.error(`解析组件配置失败: ${error.message || "未知错误"}`);
          return {};
        }
      })
      .filter((item) => Object.keys(item).length > 0);
  }
};

// 导出
const handleExport = async () => {
  try {
    loadingExport.value = true;
    loadingText.value = "导出中...";
    errorMessage.value = "";
    let params = {
      pageId: dataSourceConfig.value.pageId,
      commonParams: [
        {
          ...searchParams.value,
          ...pagination.value,
          pageSize: 9999999,
          ...route.query,
        },
      ],
    };
    delete params.commonParams.timeData;
    const res = await commonExportApi(params);

    // 处理二进制流，导出为 Excel 文件
    const link = document.createElement("a");
    const blob = new Blob([res], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    // 生成文件名，包含当前日期
    const fileName = `${dataSourceConfig.value.pageName}_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    errorMessage.value = `导出数据失败: ${error.message || "未知错误"}`;
    ElMessage.error(errorMessage.value);
  } finally {
    loadingExport.value = false;
  }
};
// 获取页面信息
const getPageInfo = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";
    const res = await queryComponentApi({
      pageAddr: route.path,
    });
    if (res.code === 200) {
      dataSourceConfig.value = res.data;
      handleComponent();
      await handleSearch(searchParams.value);
    } else {
      errorMessage.value = `获取页面信息失败: ${res.message || "未知错误"}`;
    }
  } catch (error) {
    errorMessage.value = `获取页面信息异常: ${error.message || "网络错误"}`;
  } finally {
    loading.value = false;
  }
};

// 防抖函数
const debounce = (func, wait) => {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(searchTimer);
      func(...args);
    };
    clearTimeout(searchTimer);
    searchTimer = setTimeout(later, wait);
  };
};
// 处理搜索
const handleSearch = debounce(async () => {
  // 设置加载状态为true
  loading.value = true;
  errorMessage.value = "";
  try {
    // 构建请求参数
    const params = {
      pageId: dataSourceConfig.value.pageId,
      commonParams: [
        {
          ...searchParams.value,
          ...pagination.value,
          ...route.query,
          name: route.path,
        },
      ],
    };
    // 调用API获取数据
    const result = await commonQueryApi(params);
    console.log("result", result);

    if (result.code === 200) {
      if (result.data.data && result.data.data.length > 0) {
        pagination.value.total = result.data.total;
        formData.value = result.data.data;
      } else {
        formData.value = [];
        pagination.value.total = 0;
      }
    }
  } catch (error) {
    errorMessage.value = `获取数据异常: ${error.message || "网络错误"}`;
    formData.value = [];
    pagination.value.total = 0;
  } finally {
    // 设置加载状态为false
    loading.value = false;
  }
}, 300);

onMounted(() => {
  getPageInfo();
});
</script>

<style scoped lang="scss">
.showPageCss {
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: auto;

  .error-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fef0f0;
    color: #f56c6c;
    padding: 12px 20px;
    border-radius: 4px;
    border: 1px solid #fbc4c4;
    z-index: 1000;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    max-width: 80%;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  }

  .dropped-item-wrapper-css {
    position: absolute;
  }
}

@keyframes slideDown {
  from {
    top: -50px;
    opacity: 0;
  }
  to {
    top: 20px;
    opacity: 1;
  }
}

/* 加载遮罩样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 14px;
  color: #606266;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
