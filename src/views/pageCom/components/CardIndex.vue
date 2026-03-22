<template>
  <el-card shadow="always" type="base" :class="type">
    <slot></slot>
    <!-- card body -->
  </el-card>
</template>
<script setup>
const props = defineProps({
  type: String,
});
</script>
<style lang="scss" scoped>
// base基础样式
.base {
  width: 100%;
  box-sizing: border-box;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-color: #ffffff;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 12px 24px 12px;
}
.cycle {
  height: 100%;
  width: 100%;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-color: #ffffff;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  box-sizing: border-box;
  padding: 20px;
}
// 人员明细card
.xtsz {
  width: 100%;
  height: 800px;
  box-sizing: border-box;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-color: #ffffff;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 24px;
}

.detail {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 24px;
}

.charts {
  width: 100%;
  // height: 100%;
  box-sizing: border-box;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-color: #ffffff;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 24px 0 12px;
}

// Dashboard为仪表板card样式
.dashboard {
  width: 100%;
  height: 100%;
  // height: 170px;
  box-sizing: border-box;
  border-top: 2px solid var(--btn_stroke, #fff);
  border-left: 2px solid var(--btn_stroke, #fff);
  border-radius: 4px;
  background: #5380fd;
  box-shadow: 0px 5.33333px 5.33333px 0px rgba(255, 255, 255, 0.1) inset,
    0px -10.66667px 10.66667px 0px rgba(0, 0, 0, 0.05) inset,
    10.66667px 0px 10.66667px 0px rgba(0, 0, 0, 0.02) inset,
    -10.66667px 0px 10.66667px 0px rgba(0, 0, 0, 0.02) inset,
    0px 4px 4px 0px rgba(88, 122, 244, 0.2),
    12px 12px 16px 0px rgba(88, 150, 244, 0.2),
    -4px -4px 14px 0px rgba(88, 160, 244, 0.1);
  padding: 12px 24px 24px 12px;
}

// 指标信息准备
.prepare {
  width: 100%;
  // height: 100%;
  box-sizing: border-box;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-color: #ffffff;
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px;
}

//现场检查2.0
.check {
  border-top: 2px solid var(--btn_stroke, #fff);
  border-left: 2px solid var(--btn_stroke, #fff);
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 24px 24px 24px;
}

// 国考--政策文件中心
.policy {
  // width: 374px;
  // height: 100%;
  box-sizing: border-box;

  border-left: 2px solid rgba(255, 255, 255, 1);
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px;
}

//国考--特殊指标
.special {
  height: 100%;
  border-left: 2px solid rgba(255, 255, 255, 1);
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 12px 6px 6px 6px;
  box-sizing: border-box;
}

.ip {
  // width: 100%;
  opacity: 1;
  border-left: 2px solid rgba(255, 255, 255, 1);
  border-radius: 4px;
  background: rgba(250, 250, 250, 1);
  box-shadow: 0px 4px 4px rgba(164, 174, 183, 0.25),
    12px 12px 16px rgba(164, 174, 183, 0.15);
  padding: 20px;
}
</style>
