//  表格类型
export function bindTable() {
  let bindObj = {
    ref: "tableRef",
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    showIndex: "1", //  是否需要序号
    columnTotalAlways: "0", // 是否开启合计功能
    manualSorting: "0", // 是否开启手动排序
    btnList: [
      // { btnType: "add" },
      // { btnType: "edit" },
      // { btnType: "delete" },
      // { text: '复制', icon: 'DocumentCopy' },
      // { text: '删除', icon: 'Delete', bind: { type: 'delete' } },
      // { text: '来源配置', icon: 'Connection' }
    ], // 表格按钮
    apiUrl: "/business/design-data/queryDataPage", //  接口地址
    // apiUrl: [{ versionNumber: '1.0.0' }],
    showBorder: true, //  是否需要边框
    //  表格列配置
    designTableColumns: [
      {
        columnLabel: "版本号",
        columnName: "versionNumber",
        isHeader: '0',
         isNeedSum:'1',
        columnWidth: "",
        idRow: generateRandomId(),
      },
      {
        columnLabel: "数据项编码",
        columnName: "dataItemCode",
         isHeader: '0',
          isNeedSum:'1',
           columnWidth: "",
        idRow: generateRandomId(),
      },
      {
        columnLabel: "数据项名称",
        columnName: "dataItemName",
         isHeader: '0',
          isNeedSum:'1',
          columnWidth: "",
        idRow: generateRandomId(),
      },
      {
        columnLabel: "来源应用",
        columnName: "productName",
         isHeader: '0',
          isNeedSum:'1',
           columnWidth: "",
        align: "center",
        idRow: generateRandomId(),
      },
    ],
  };
  return bindObj;
}
//  表单类型
export function bindForm() {
  let bindObj = {
    modelValue: {
      versionNumber: "",
      dataItemCode: "",
      dataItemName: "",
      productName: "",
    },
    items: [
      {
        label: "起止时间",
        prop: "timeData",
        component: "el-radio-date",
        attrs: {
          placeholder: "请输入版本号",
          clearable: true,
        },
      },
      {
        label: "科室名称",
        prop: "H_DPT_CODE",
        component: "el-select",
        attrs: {
          placeholder: "请选择",
          clearable: true,
        },
      },
    ],
    // 表单属性
    formProps: {
      inline: true,
      // labelPosition: 'right'
    },
    // 标签宽度
    labelWidth: "",
  };
  return bindObj;
}

// 漏斗组件类型
export function bindDivCharts() {
  let bindObj = {
    legendDataList: [
      {
        legendData: [
          { label: "40岁以下", count: 40, bgColor: "rgba(83, 128, 253, 0.6)" },
          { label: "40-45岁", count: 130, bgColor: "rgba(83, 128, 253, 0.8)" },
          { label: "45-49岁", count: 100, bgColor: "rgba(83, 128, 253, 1)" },
          { label: "50-59岁", count: 120, bgColor: "rgba(83, 128, 253, 0.8)" },
          { label: "60岁以上", count: 80, bgColor: "rgba(83, 128, 253, 0.6)" },
        ],
        legendName: "111",
      },
      {
        legendData: [
          { label: "医师", count: 100, bgColor: "rgba(255, 141, 26, 0.6)" },
          { label: "主治医师", count: 120, bgColor: "rgba(255, 141, 26, 0.8)" },
          { label: "副主任医师", count: 100, bgColor: "rgba(255, 141, 26, 1)" },
          { label: "主任医师", count: 90, bgColor: "rgba(255, 141, 26, 0.8)" },
        ],
        legendName: "222",
      },
    ],
  };
  return bindObj;
}

//  柱形图
export function bindBarEchart() {
  // 当前配置
  const currentConfig = {
    basic: {
      theme: "light", //  主题
      showToolbox: true, //  显示工具箱
      direction: "value", //  方向
      title: "图表样式配置示例", //  标题
      subtitle: "实时预览样式效果",
      showLegend: true, //  是否显示图例
      legendPosition: "", //  图例位置
      legendLeft: "", //  图例左边距
      legendRight: "", //  图例右边距
      legendTop: "", //  图例上边距
      legendBottom: "", //  图例下边距
      showGrid: true, //  是否显示网格
      gridLeft: "", //  图表左侧距离
      gridRight: "", //  图表右侧距离
      gridTop: "", //  图表顶部距离
      gridBottom: "", //  图表底部距离
      autoResize: true,
      renderer: "canvas",
    },
    colors: {
      primaryColor: "#5470c6",
      colorScheme: "default",
      customColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"],
    },
    topConfig: {
      title: "", //  标题
      date: "", //  时间1
    },
    dataConfig: {
      dsType: "", //  数据源类型
      dsConfig: "", //  数据源配置sql
      designChartConfigList: [], //  x轴数据
    },
  };
  return {
    series: [120, 200, 150, 80, 70],
    xAxis: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    // theme: currentConfig.basic.theme,
    // showToolbox: currentConfig.basic.showToolbox,
    // direction: currentConfig.basic.direction,
    // title: currentConfig.basic.title,
    // showLegend: currentConfig.basic.showToolbox,
    // legendPosition: currentConfig.basic.legendPosition,
    // legendLeft: currentConfig.basic.legendLeft,
    // legendRight: currentConfig.basic.legendRight,
    // legendTop: currentConfig.basic.legendTop,
    // legendBottom: currentConfig.basic.legendBottom,
    // // 'subtitle': currentConfig.basic.subtitle,
    // showGrid: currentConfig.basic.showGrid,
    // gridLeft: currentConfig.basic.gridLeft,
    // gridRight: currentConfig.basic.gridRight,
    // gridTop: currentConfig.basic.gridTop,
    // gridBottom: currentConfig.basic.gridBottom,
    // // 'renderer': currentConfig.basic.renderer,
    // colors: currentConfig.colors.customColors,
    // colorScheme: currentConfig.colors.colorScheme,
    // primaryColor: currentConfig.colors.primaryColor,
    basic: currentConfig.basic,
    colors: currentConfig.colors.customColors || currentConfig.colors,
    dataConfig: currentConfig.dataConfig,
    topConfig: currentConfig.topConfig,
  };
}

// 判断类型
export function isNeedDetailApi(data) {
  let arr = ["TABLE"]; //  组件类型
  if (arr.find((f) => f == data)) {
    return true;
  } else {
    return false;
  }
}

// 删除指定对象
export function removeNodeByIdRow(tree, idRow, childrenKey = "children") {
  return tree.filter((node) => {
    if (node.idRow === idRow) {
      return false;
    }
    if (node[childrenKey] && node[childrenKey].length > 0) {
      node[childrenKey] = removeNodeByIdRow(
        node[childrenKey],
        idRow,
        childrenKey
      );
    }
    return true;
  });
}

// 添加key
export function addParamToArrayRecursively(arr, key) {
  return arr.map((item) => {
    if (typeof item === "object" && item !== null) {
      if (Array.isArray(item)) {
        return addParamToArrayRecursively(item, key);
      } else {
        // 为当前对象添加参数
        const newObj = { ...item };
        newObj[key] = generateRandomId();
        // 递归处理对象的每个属性
        for (const prop in newObj) {
          if (typeof newObj[prop] === "object" && newObj[prop] !== null) {
            newObj[prop] = addParamToArrayRecursively([newObj[prop]], key)[0];
          }
        }
        return newObj;
      }
    }
    return item;
  });
}

//  随机生成一个id
export function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------  处理事件  -----------------------------------
//  对应类型组件
export function filterFn(data, type) {
  return data.filter((item) => item.typeFilter === type);
}


//  组件数组
export const componentsList = [
  {
    id: 1,
    name: "表格组件",
    typeFilter: "base",
    componentType: "YLTABLE",
    bind: bindTable(),
  },
  {
    id: 2,
    name: "表单组件",
    typeFilter: "base",
    componentType: "YLsearchform",
    bind: bindForm(),
  },
  // { id: 3, name: "文本组件", typeFilter: 'base', componentType: "text", bind: {} },
  // { id: 4, name: "图片组件", typeFilter: 'base', componentType: "image", bind: {} },
  {
    id: 3,
    name: "柱形图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "BAR",
    bind: bindBarEchart(),
  },
  {
    id: 4,
    name: "折线图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "LINE",
    bind: bindBarEchart(),
  },
  {
    id: 5,
    name: "散点图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "SCATTER",
    bind: bindBarEchart(),
  },
  {
    id: 6,
    name: "雷达图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "RADAR",
    bind: bindBarEchart(),
  },
  {
    id: 7,
    name: "饼图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "PIE",
    bind: bindBarEchart(),
  },
  {
    id: 8,
    name: "漏斗图",
    typeFilter: "echart",
    componentType: "CHART",
    chartType: "FUNNEL",
    bind: bindBarEchart(),
  },
  {
    id: 9,
    name: "特殊类型侧边栏",
    typeFilter: "base",
    componentType: "DIV_TAB",
    bind: { listPath: [] },
  }
]