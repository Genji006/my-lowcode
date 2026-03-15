/**
 *  @Author: <原增旺>
 */
//  性别
export function sexFn(data, type) {
  let arr = [
    { value: "1", label: "男" },
    { value: "2", label: "女" },
    { value: "0", label: "未知" },
    { value: "9", label: "未说明的性别" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}


//  0否1是通用字典
export function yesOrNoFn(data, type) {
  let arr = [
    { value: "0", label: "否" },
    { value: "1", label: "是" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  1否0是通用字典
export function yesOrNoFns(data, type) {
  let arr = [
    { value: "0", label: "正常", name: "显示" },
    { value: "1", label: "停用", name: "隐藏" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}


// 生成唯一ID
export function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


//  sql类型
export function sqlType(data, type) {
  let arr = [
    { value: "SQL", label: "SQL" },
    { value: "API", label: "API" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  数据项分子/分母
export function dataItemTypeList(data, type) {
  let arr = [
    { value: "1", label: "分子" },
    { value: "2", label: "分母" },
    // { value: "3", label: "直接关联指标展示" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  采集方式
export function colTypeFn(data, type) {
  let arr = [
    { value: 0, label: "采集" },
    { value: 1, label: "录入" },
    { value: 2, label: "录入&采集" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

//  统计周期
export function statPerFn(data, type) {
  let arr = [
    { value: "0", label: "月度" },
    { value: "1", label: "年度" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  数据项类型
export function dataItemTypeFn(data, type) {
  let arr = [
    { value: "0", label: "原子数据项" },
    { value: "1", label: "计算数据项" },
    { value: "2", label: "分析数据项" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  国家检测否
export function isNationFn(data, type) {
  let arr = [
    { value: 0, label: "否" },
    { value: 1, label: "是" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

// 机构等级
export function InstitutionalLevel(data, type) {
  let arr = [
    { value: "1", label: "三级甲等", background: '#FFE2C4', color: '#FF8D1A' },
    { value: "2", label: "三级乙等", background: '#FFF5D4', color: '#FFC300' },
    { value: "3", label: "三级丙等", background: '#F2F2F2', color: '#808080' },
    { value: "4", label: "二级甲等", background: '#FFE2C4', color: '#FF8D1A' },
    { value: "5", label: "二级乙等", background: '#FFF5D4', color: '#FFC300' },
    { value: "6", label: "二级丙等", background: '#F2F2F2', color: '#808080' },
    { value: "7", label: "一级甲等", background: '#FFE2C4', color: '#FF8D1A' },
    { value: "8", label: "一级乙等", background: '#FFF5D4', color: '#FFC300' },
    { value: "9", label: "一级丙等", background: '#F2F2F2', color: '#808080' },
  ];
  if (type === "formatter") {
    return arr.find((item) => item.label === data) || {};
  } else {
    return arr;
  }
}
//  模型类型
export function isStandardModelFn(data, type) {
  let arr = [
    { value: "0", label: "自定义模型" },
    { value: "1", label: "标准模型" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  分析周期
export function analysisCycleTypeFn(data, type) {
  let arr = [
    { value: "1", label: "年" },
    { value: "2", label: "季度" },
    { value: "3", label: "月份" },
    { value: "4", label: "星期" },
    { value: "4", label: "日" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  指标配置情况
export function configStatusFn(data, type) {
  let arr = [
    { value: "0", label: "已配置" },
    { value: "1", label: "进行中" },
    { value: "2", label: "未配置" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}


// 时间转换(年月日时分秒)
export function formatToStandardTime(date) {
  // 处理空值情况
  if (!date && date !== 0) {
    return '';
  }

  let dateObj;

  // 根据不同类型转换为Date对象
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    // 数字类型，假设是时间戳（毫秒）
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    // 字符串类型，尝试转换
    // 处理可能的时间戳字符串
    if (/^\d+$/.test(date)) {
      dateObj = new Date(parseInt(date, 10));
    } else {
      // 处理日期字符串
      dateObj = new Date(date.replace(/-/g, '/')); // 兼容 Safari
    }
  } else {
    // 其他情况尝试直接转换
    dateObj = new Date(date);
  }

  // 验证日期有效性
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }

  // 获取年月日时分秒
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//数据项
export function sourceAppFn(data, type) {
  let arr = [
    { value: '1', label: "临床专科能力监测评价系统" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}


//启用否
export function statusFn(data, type) {
  let arr = [
    { value: "0", label: "禁用" },
    { value: "1", label: "启用" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

// 分析引擎执行状态
export function executeStatusFn(data, type) {
  let arr = [
    { value: "0", label: "未分析" },
    // { value: "1", label: "已分析" },
    { value: "2", label: "分析中" },
    // { value: "4", label: "已取消" },
    // { value: "3", label: "暂停中" },
    // { value: "9", label: "错误" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

//  分析引擎配置情况
export function scriptConfigFn(data, type) {
  let arr = [
    { value: "0", label: "未配置" },
    { value: "1", label: "已配置" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 脚本执行结果
export function jobStatusFn(data, type) {
  let arr = [
    { value: "0", label: "异常" },
    { value: "1", label: "正常" },
    { value: "2", label: "指标项脚本为空" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 日志执行状态
export function logStatusFn(data, type) {
  let arr = [
    { value: '1', label: "执行成功" },
    { value: '2', label: "执行中" },
    { value: '3', label: "执行失败" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 应用来源
export function appSourceFn(data, type) {
  let arr = [
    { value: '0', label: "平台配置" },
    { value: '1', label: "自研接入" },
    { value: '2', label: "第三方接入" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 应用来源
export function applicationArchitectureFn(data, type) {
  let arr = [
    { value: '0', label: "B/S端" },
    { value: '1', label: "C/S端" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

export function noticeStatusFn(data, type) {
  let arr = [
    { value: '0', label: "暂存中" },
    { value: '1', label: "已发布" },
    { value: '2', label: "已撤销" },
    { value: '3', label: "已过期" },
    { value: '4', label: "待发布" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 菜单类型
export function menuTypeFn(data, type) {
  let arr = [
    { value: 'M', label: "目录" },
    { value: 'C', label: "菜单" },
    { value: 'F', label: "按钮" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 用户类型
export function userTypeFn(data, type) {
  let arr = [
    { value: '0', label: "系统用户" },
    { value: '1', label: "注册用户" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 证件类型
export function idcardTypeFn(data, type) {
  let arr = [
    { value: "1", label: "身份证" },
    { value: "2", label: "居民户口簿" },
    { value: "3", label: "护照" },
    { value: "4", label: "军官证" },
    { value: "5", label: "驾驶执照" },
    { value: "6", label: "港澳居民来往内地通行证" },
    { value: "7", label: "台湾居民来往内地通行证" },
    { value: "99", label: "其他" },
  ];
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

// 授权类型
export function authTypeFn(data, type) {
  let arr = [
    { value: '1', label: "快速授权" },
    { value: '2', label: "角色授权" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 行政管理职务
export const postFn = (data, type) => {
  let arr = [
    { value: "1", label: "党委(副)书记" },
    { value: "2", label: "院(所、站)长" },
    { value: "3", label: "副院(所、站)长" },
    { value: "4", label: "科室主任" },
    { value: "5", label: "科室副主任" },
  ];
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

// 人员类型
export const medicalTypeFn = (data, type) => {
  let arr = [
    { value: "1", label: "医师类" },
    { value: "2", label: "护士类" },
    { value: "3", label: "乡村医生类" },
    { value: "4", label: "技师类" },
    { value: "5", label: "药师类" },
    { value: "6", label: "管理类" },
    { value: "7", label: "工勤类" },
    { value: "8", label: "其他" },
  ];
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}








// 科室对照 ---------------------------------------------------------
//  登陆方式
export function loginTypeFn(data, type) {
  let arr = [
    { value: "1", label: "账号登录" },
    { value: "2", label: "手机验证码登录" },
    { value: "3", label: "邮箱登录" }
  ];
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

//  来源
export function loginFromFn(data, type) {
  let arr = [
    { value: "1", label: "管理端" },
    { value: "2", label: "应用端" },
  ];
  // 转换值
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}

// 科室类别: 1-临床科室, 2-医技科室, 3-行政管理科室, 9-其他科室
export function dptTypeFn(data, type) {
  let arr = [
    { value: "1", label: "临床科室" },
    { value: "2", label: "医技科室" },
    { value: "3", label: "行政管理科室" },
    { value: "9", label: "其他科室" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 防抖节流
export function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 科室级别
export function hospitalCodeLevelFn(data, type) {
  let arr = [
    // { value: 0, label: "未定级" },
    { value: '1', label: "一级" },
    { value: '2', label: "二级" },
    { value: '3', label: "三级" },
  ]
  if (type === "formatter") {
    return arr.find((item) => item.value == data)?.label || "";
  } else {
    return arr;
  }
}

// 临床重点专科级别
export function keydptClassFn(data, type) {
  let arr = [
    { value: "0", label: "无重点专科" },
    { value: "1", label: "国家级" },
    { value: "2", label: "省级" },
    { value: "3", label: "市级" },
    { value: "4", label: "区县级" },
  ];
  if (type === "formatter") {
    return arr.find((item) => item.value === data)?.label || "";
  } else {
    return arr;
  }
}