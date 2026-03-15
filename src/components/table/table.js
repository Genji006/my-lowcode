// 所有按钮
const arrListBtn = [
  {
    text: "新增",
    btnType: "add",
    icon: "Plus",
    img: "/ItemImg/xinzen.svg",
    typeRow: "noneType", // noneType, rowType, selectType ,
    bind: { type: "base" },
  },
  {
    text: "编辑",
    btnType: "edit",
    icon: "EditPen",
    img: "/ItemImg/bianji.svg",
    typeRow: "rowType",
    bind: { type: "base" },
  },
  {
    text: "详情",
    btnType: "detail",
    icon: "",
    img: "/ItemImg/zhuanhuanshuxing.svg",
    typeRow: "rowType",
    bind: { type: "base" },
  },
  {
    text: "删除",
    btnType: "delete",
    icon: "Delete",
    img: "/ItemImg/shanchu.svg",
    typeRow: "selectType",
    bind: { type: "delete" },
  },
  {
    // 单个删除
    text: "删除",
    btnType: "deletes",
    icon: "Delete",
    img: "/ItemImg/shanchu.svg",
    typeRow: "rowType",
    bind: { type: "delete" },
  },
  {
    text: "导入",
    btnType: "import",
    icon: "Upload",
    img: "",
    typeRow: "noneType",
    bind: { type: "base" },
  },
  {
    text: "导出",
    btnType: "export",
    icon: "Download",
    img: "",
    typeRow: "selectType",
    bind: { type: "base" },
  },
  {
    text: "上一步",
    btnType: "last",
    icon: "",
    img: "",
    typeRow: "noneType",
    bind: { type: "base" },
  },
  {
    text: "下一步",
    btnType: "next",
    icon: "",
    img: "",
    typeRow: "noneType",
    bind: { type: "base" },
  },
  {
    text: "取消",
    btnType: "cancel",
    icon: "",
    img: "",
    typeRow: "noneType",
    bind: { type: "cancel" },
  },
  {
    text: "确定",
    btnType: "confirm",
    icon: "",
    img: "",
    typeRow: "noneType",
    bind: { type: "base" },
  },
  {
    text: "确定",
    btnType: "save",
    icon: "",
    img: "",
    typeRow: "noneType",
    bind: { type: "base" },
  },
  {
    text: "回收站",
    btnType: "recycleBin",
    icon: "",
    img: "/ItemImg/huishouzhan.svg",
    typeRow: "noneType",
    bind: { type: "recycleBin" },
  },
  {
    text: "页面配置",
    btnType: "set",
    icon: "Setting",
    typeRow: "rowType",
  },
  {
    text: "复制",
    btnType: "copy",
    icon: "DocumentCopy",
    typeRow: "rowType",
  },
  {
    text: "导出",
    btnType: "importFile",
    icon: "Upload",
    img: "/ItemImg/pldc.svg",
    typeRow: "selectType",
    bind: { type: "base" },
  },
];
export function btnListArr() {
  //  typeRow : noneType(对表格无任何关联)，rowType(当前按钮关联行数据)，selectType(当前按钮关联勾选行数据)
  return arrListBtn;
}
// 按钮是否禁用
export function disabledFn(type, lightRow, selectRow) {
  if (type && type == "rowType") {
    if (lightRow && Object.keys(lightRow).length > 0) {
      return false;
    } else {
      return true;
    }
  } else if (type && type == "selectType") {
    if (selectRow && selectRow.length > 0) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}
// 按钮图标处理
// 图表类型
// 新增:add, 编辑：edit, 删除：deletes,  导入：import, 导出：export, 详情：detail,
// 上一步：last,下一步：next，取消：cancel, 确定: confirm,保存：save（一般是弹窗里面的按钮没有图标和禁用）
// export function btnFn(data){
//   // 使用 Map 提高查找效率，避免嵌套循环
//   const arrMap = new Map(data.map(item => [item.btnType, item]));
//   // 过滤并合并对象属性
//   return btnListArr
//     .filter(btnItem => arrMap.has(btnItem.btnType))
//     .map(btnItem => ({
//       ...btnItem,
//       ...arrMap.get(btnItem.btnType)
//     }));
// }
export function btnFn(data) {
  const btnMap = new Map(arrListBtn.map((item) => [item.btnType, item]));
  return data.map((btnItem) => ({
    ...btnMap.get(btnItem.btnType),
    ...btnItem,
  }));
}

//  数字类型转boolean  0 false  1 true
export function booleanFn(data) {
  if (data == 1 || data == '1' || data === true) {
    return true;
  } else {
    return false;
  }
}

// 分页样式布局
// export function tablePageBtn(pageOpen, btnList, bottomBtnList) {
//   if (pageOpen == 1) {
//     if (btnList && btnList.length > 0) {
//       if (bottomBtnList && bottomBtnList.length > 0) {
//         return 160;
//       } else {
//         return 110;
//       }
//     } else {
//       if (bottomBtnList && bottomBtnList.length > 0) {
//         return 110;
//       } else {
//         return 60;
//       }
//     }
//   } else {
//     if (btnList && btnList.length > 0) {
//       if (bottomBtnList && bottomBtnList.length > 0) {
//         return 110;
//       } else {
//         return 60;
//       }
//     } else {
//       if (bottomBtnList && bottomBtnList.length > 0) {
//         return 60;
//       } else {
//         return 10;
//       }
//     }
//   }
// }
export function tablePageBtn(pageOpen, btnList, bottomBtnList, textList) {
  let baseHeight = 0;

  if (pageOpen == 1) {
    if (btnList && btnList.length > 0) {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 160;
      } else {
        baseHeight = 110;
      }
    } else {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 110;
      } else {
        baseHeight = 60;
      }
    }
  } else {
    if (btnList && btnList.length > 0) {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 110;
      } else {
        baseHeight = 60;
      }
    } else {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 60;
      } else {
        baseHeight = 10;
      }
    }
  }

  // 如果textList为真且长度大于0，则增加40
  if (textList && textList.length > 0) {
    baseHeight += 40;
  }

  return baseHeight;
}
export function tablePageBtnC(pageOpen, btnList, bottomBtnList, textList) {
  let baseHeight = 0;

  if (pageOpen == 1) {
    if (btnList && btnList.length > 0) {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 160;
      } else {
        baseHeight = 110;
      }
    } else {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 110;
      } else {
        baseHeight = 100;
      }
    }
  } else {
    if (btnList && btnList.length > 0) {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 110;
      } else {
        baseHeight = 100;
      }
    } else {
      if (bottomBtnList && bottomBtnList.length > 0) {
        baseHeight = 100;
      } else {
        baseHeight = 10;
      }
    }
  }

  // 如果textList为真且长度大于0，则增加40
  if (textList && textList.length > 0) {
    baseHeight += 40;
  }

  return baseHeight;
}

// rowKey 处理
export function bindRowKey(value, type, url) {
  let str = '/data-ops/business/design-data/queryDataPage'
  if (str.includes(url)) {
    return { "row-key": 'keyRowId' };
  } else {
    if (value) {
      return { "row-key": value };
    } else {
      return { "row-key": type ? "keyRowId" : "uuid" };
    }
  }
}

// 定义一个函数，用于从 props.queryParams 中提取时间范围参数
export function extractTimeRangeParams(params) {
  let timeRangeParams = {};
  //  key 为当前数组参数的变量名拼接Start/End
  for (let key in params) {
    if (Array.isArray(params[key]) && params[key].length === 2) {
      timeRangeParams[`${key}Start`] = params[key][0];
      timeRangeParams[`${key}End`] = params[key][1];
    }
  }
  return timeRangeParams;
}

// 生成唯一ID
export function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 递归为树形数据每一行加keyRowId
export function addKeyRowIdRecursive(data, childrenKey = "children") {
  if (!Array.isArray(data)) return [];
  return data.map((row, index) => {
    const newRow = { ...row, keyRowId: row.keyRowId || generateRandomId(), indexId: index + 1 };
    if (Array.isArray(newRow[childrenKey]) && newRow[childrenKey].length > 0) {
      newRow[childrenKey] = addKeyRowIdRecursive(
        newRow[childrenKey],
        childrenKey
      );
    }
    return newRow;
  });
}
