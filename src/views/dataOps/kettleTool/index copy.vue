<template>
  <div class="kettleToolCss">
    <div ref="graphContainer" style="width:100%;height:100%;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const graphContainer = ref(null)

onMounted(() => {

  // 直接用全局 mxGraph
  const graph = new window.mxGraph(graphContainer.value)
  const url = 'https://cdn.pixabay.com/photo/2016/02/19/11/25/business-1209705_960_720.jpg'
  const img = new mxImage(url, 400, 400)
  graph.setBackgroundImage(img)
  new window.mxRubberband(graph)   // 禁用浏览器默认的左键菜单栏
  const parent = graph.getDefaultParent()
  //   console.log(parent);
  mxEvent.disableContextMenu(graphContainer.value); // 禁用浏览器默认的右键菜单栏
  // 鼠标滚轮缩放
  mxEvent.addMouseWheelListener(function (evt, up) {
    if (up) {
      graph.zoomIn();
    } else {
      graph.zoomOut();
    }
    mxEvent.consume(evt);
  });
  graph.getModel().beginUpdate()
  try {
    const v1 = graph.insertVertex(parent, null, 'Hello', 20, 20, 80, 30)
    const v2 = graph.insertVertex(parent, null, 'mxGraph', 200, 150, 80, 30)
    graph.insertEdge(parent, null, '', v1, v2)
  } finally {
    graph.getModel().endUpdate()
  }
})
</script>

<style lang="scss" scoped>
.kettleToolCss {
  width: 100%;
  height: 100%;
  //   background-color: rgba(238, 238, 238, 1);
  background-color: #fff;
}
</style>