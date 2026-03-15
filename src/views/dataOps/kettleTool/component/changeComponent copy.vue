<!-- <template>
  <div class="cardShadow">

  </div>
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
</style> -->

<template>
  <div class="cardShadow">
    <!-- 左侧控制台 -->
    <div class="left-panel" ref="generalToolItems">
      <div v-for="(item, index) in objTypeList" :key="index" class="tool-item">
        <div>{{ item.type }}</div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="(items, indexs) in item.list"
            :key="indexs"
            @click="addVertex(items.name,)"
            style="cursor: pointer"
          >
            <img :src="items.img"  /> {{ items.name }}
          </div>
        </div>
      </div>
      
      <div class="tool-item" @click="addVertex('开始')">开始</div>
      <div class="tool-item" @click="addVertex('结束')">结束</div>
      <div class="tool-item" @click="addVertex('流程')">流程</div>
      <div class="tool-item" @click="addVertex('判断')">判断</div>
      <div class="tool-item" @click="createConnection">创建连线</div>
    </div>

    <!-- 右侧 mxGraph 容器 -->
    <div class="kettleToolCss">
      <div
        style="
          display: flex;
          background-color: #fff;
          height: 40px;
          gap: 10px;
          align-items: center;
        "
      >
        <div>保存</div>
        <div>运行</div>
        <div>暂停/恢复</div>
        <div>停止</div>
        <div>预览</div>
        <div>测试</div>
        <div>校验</div>
        <div>生成运行SQL</div>
        <div>集群schema</div>
        <div>数据分区</div>
        <div>更多</div>
        <div>数据库连接</div>
        <div>Hadoop Cluster</div>
      </div>
      <div
        ref="graphContainer"
        style="width: calc(100%-200px); height: 100%"
      ></div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
// import { mxGraph, mxEvent, mxRubberband } from 'mxgraph-js'

const graphContainer = ref(null);
const generalToolItems = ref(null);

const objTypeList = ref ([
  {
    type: "输入",
    list: [
      {
        name: "EXCEL输入",
        img: '/src/assets/ItemImg/pldc.svg',
      },
      {
        name: "文本文件输入",
        img: '/src/assets/ItemImg/hbmdgl.svg',
      },
    ],
  },
  {
    type: "输出",
    list: [
      {
        name: "EXCEL输出",
      },
      {
        name: "SQL输出",
      },
    ],
  },
]);

let graph,
  parent = null;

// 初始化 mxGraph
const createGraph = () => {
  // 直接使用全局mxGraph对象
  if (window.mxGraph && window?.mxEvent) {
    graph = new window.mxGraph(graphContainer.value);
    parent = graph.getDefaultParent();
    new window.mxRubberband(graph);
    window.mxEvent.disableContextMenu(graphContainer.value);


    // 使用全局mx对象
    window.mxEvent.disableContextMenu(graphContainer.value);
    new window.mxRubberband(graph);

    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, "World", 200, 150, 80, 30);
      graph.insertEdge(parent, null, "", v1, v2);
    } finally {
      graph.getModel().endUpdate();
    }
    // 添加连接处理配置
    graph.connectionHandler.enabled = true;
    graph.connectionHandler.edgeStyle = (state) => {
      return {
        strokeWidth: 2,
        strokeColor: "#3498db",
        elbow: "horizontal", // 垂直拐弯
      };
    };
    // 启用连接点吸附
    graph.connectionHandler.snapToTerminals = true;
    graph.connectionHandler.terminalDistance = 10;

    // Defines the default constraints for all shapes
    mxShape.prototype.constraints = [
      new mxConnectionConstraint(new mxPoint(0.25, 0), true),
      new mxConnectionConstraint(new mxPoint(0.5, 0), true),
      new mxConnectionConstraint(new mxPoint(0.75, 0), true),
      new mxConnectionConstraint(new mxPoint(0, 0.25), true),
      new mxConnectionConstraint(new mxPoint(0, 0.5), true),
      new mxConnectionConstraint(new mxPoint(0, 0.75), true),
      new mxConnectionConstraint(new mxPoint(1, 0.25), true),
      new mxConnectionConstraint(new mxPoint(1, 0.5), true),
      new mxConnectionConstraint(new mxPoint(1, 0.75), true),
      new mxConnectionConstraint(new mxPoint(0.25, 1), true),
      new mxConnectionConstraint(new mxPoint(0.5, 1), true),
      new mxConnectionConstraint(new mxPoint(0.75, 1), true),
    ];

    // 覆盖获取连接约束的方法
    graph.getAllConnectionConstraints = function (terminal, source) {
      if (terminal != null && terminal.shape != null) {
        if (terminal.shape.stencil != null) {
          if (terminal.shape.stencil.constraints != null) {
            return terminal.shape.stencil.constraints;
          }
        } else if (terminal.shape.constraints != null) {
          return terminal.shape.constraints;
        }
      }

      return null;
    };
    console.log(graph, "实例");
  }
};

// 添加节点函数
const addVertex = (type, img, x = 200, y = 200) => {
  graph.getModel().beginUpdate();
  try {
    // 创建复合节点
    const comp = graph.insertVertex(parent, null, '', x, y, 80, 70, {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_FILL_COLOR]: '#f5f5f5',
      [mxConstants.STYLE_STROKE_COLOR]: '#ccc'
    });

    // 添加图标子节点
    const icon = graph.insertVertex(comp, null, img, 10, 10, 60, 40, {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_IMAGE,
      [mxConstants.STYLE_IMAGE]: img,
      [mxConstants.STYLE_FILL_COLOR]: 'none',
      [mxConstants.STYLE_STROKE_COLOR]: 'none'
    });

    // 添加文字子节点
    const text = graph.insertVertex(comp, null, type, 0, 45, 80, 25, {
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER,
      [mxConstants.STYLE_VERTICAL_ALIGN]: mxConstants.ALIGN_MIDDLE,
      [mxConstants.STYLE_FILL_COLOR]: 'none',
      [mxConstants.STYLE_STROKE_COLOR]: 'none'
    });
  } finally {
    graph.getModel().endUpdate();
  }
};
// ... existing code ...

// 拖拽到画布方法
const initDragAndDrop = () => {
  const container = graphContainer.value;
  if (!container) {
    console.error("画布容器未找到");
    return;
  }
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();

    const nodeType = e.dataTransfer.getData("nodeType");
    if (!nodeType) return;

    const pt = graph.getPointForEvent(e);
    pt.x -= 40;
    pt.y -= 15;

    graph.getModel().beginUpdate();
    try {
      console.log(nodeType, "nodeType");
      // let vertexStyle = 'shape=image;verticalLabelPosition=bottom;verticalAlign=top;fontColor=#000000;';

      // // 查找拖拽的工具项以获取图像路径
      // const toolItem = objTypeList.value.find(item => item.name === nodeType);
      // if (toolItem && toolItem.image) {
      //   vertexStyle += `image=${toolItem.image};`;
      // } else {
      //   // 默认图像
      //   vertexStyle += 'image=/public/svg/404.svg;';
      // }

      // const vertex = graph.insertVertex(parent, null, nodeType, pt.x, pt.y, 50, 40, vertexStyle)
      graph.insertVertex(parent, null, nodeType, pt.x, pt.y, 80, 30);
    } finally {
      graph.getModel().endUpdate();
    }
  });
};

// 配置右键菜单栏
const configMenu = () => {
  console.log(graph, "graph11");
  // 配置弹出菜单
  graph.popupMenuHandler.factoryMethod = (menu, parent, cell, evt) => {
    // 清除旧菜单项
    menu.items = [];

    // 编辑步骤
    menu.addItem("编辑步骤", null, () => {});

    // 添加新菜单项
    menu.addItem("输出所有节点", null, () => {
      Object.values(graph.getModel().cells).forEach((cell) =>
        console.log(cell)
      );
    });

    menu.addItem("全选", null, () => {
      graph.selectAll();
    });

    menu.addItem("删除", null, () => {
      const cells = graph.getSelectionCells();
      graph.removeCells([...cells]);
    });

    menu.addItem("添加连线", null, () => {
      const cells = graph.getSelectionCells();
      if (cells.length === 2) {
        addEdge(cells[0], cells[1]);
      } else {
        alert("请先选择两个节点");
      }
    });
    // 强制设置菜单位置为鼠标坐标
    if (evt) {
      menu.style.left = `${evt.clientX}px`;
      menu.style.top = `${evt.clientY}px`;
    }
  };
};

// 初始化工具项拖拽
const initGeneralTool = () => {
  const items = generalToolItems.value.querySelectorAll(".tool-item");
  items.forEach((item) => {
    item.setAttribute("draggable", "true");

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("nodeType", item.textContent.trim());
    });
  });
};

const configMouseEvent = () => {
  graph.addMouseListener({
    mouseDown: (sender, evt) => {
      if (!evt.state) {
        console.log("点击了画布");
      } else if (evt.state.cell.edge) {
        console.log("点击了连线", evt.state.cell);
      }
    },

    mouseMove: function (sender, me) {
      try {
        if (me.isSource(graph.getDefaultParent())) {
          const cell = me.getCell();
          // 处理逻辑
          if (cell) {
            console.log("当前悬停元素:", cell);
          }
        }
      } catch (error) {
        console.error("鼠标事件处理错误:", error);
      }
    },

    mouseUp: (sender, evt) => {
      if (evt.sourceState === undefined) {
        return false;
      } else {
        let cell = evt.sourceState.cell;
        if (cell) {
        }
      }
    },
  });
};

onMounted(() => {
  createGraph();
  initGeneralTool();
  initDragAndDrop();
  configMenu();
  configMouseEvent();
});
</script>

<style lang="scss" scoped>
.cardShadow {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-panel {
  width: 200px;
  background-color: #f5f7fa;
  padding: 10px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.tool-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #e4e7ed;
  border-radius: 4px;
  cursor: grab;
  transition: background-color 0.2s ease;
}

.tool-item:hover {
  background-color: #dcdfe6;
}

.kettleToolCss {
  flex: 1;
  height: 100%;
  height: 800px;
  background-color: #fff;
  background-image: linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px; // 网格间距
  position: relative;
}
</style>

<style lang="scss">
.mxPopupMenu {
  position: absolute;
  background: #fff;
  cursor: pointer;
  border: 1px solid #ededed;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  white-space: nowrap;
  padding: 5px;
}

// 添加连接点样式
.mxConnectionConstraint {
  background-color: #4385f5 !important;
  border-color: #2d5aac !important;
  width: 8px !important;
  height: 8px !important;
}

.mxConnectionHandler {
  stroke: #4385f5 !important;
  stroke-width: 2 !important;
}
</style>