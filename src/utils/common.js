/**
 * 通用工具方法
 * 与 ruoyi.js 互补的实用工具函数
 * 优化版本：提升性能、增强功能、代码简洁性
 */

// 检查值是否为空
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// 检查值是否为非空
export function isNotEmpty(value) {
  return !isEmpty(value);
}

// 格式化时间戳为相对时间
export function formatRelativeTime(timestamp) {
  if (!timestamp || typeof timestamp !== 'number') return '';

  const now = Date.now();
  const diff = now - timestamp;

  // 时间单位定义
  const units = [
    { name: '分钟', value: 60 * 1000 },
    { name: '小时', value: 60 * 60 * 1000 },
    { name: '天', value: 24 * 60 * 60 * 1000 },
    { name: '周', value: 7 * 24 * 60 * 60 * 1000 },
    { name: '个月', value: 30 * 24 * 60 * 60 * 1000 },
    { name: '年', value: 365 * 24 * 60 * 60 * 1000 }
  ];

  // 小于1分钟
  if (diff < units[0].value) {
    return '刚刚';
  }

  // 其他时间单位
  for (let i = units.length - 1; i >= 0; i--) {
    if (diff >= units[i].value) {
      const count = Math.floor(diff / units[i].value);
      return `${count}${units[i].name}前`;
    }
  }

  return '';
}

// 安全地获取嵌套对象属性
export function getNestedProperty(obj, path, defaultValue = undefined) {
  if (!obj || !path) return defaultValue;

  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

// 合并两个对象（深合并）
export function mergeObjects(target, source) {
  // 处理基本类型和null/undefined
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // 处理数组
  if (Array.isArray(source)) {
    return source.map((item, index) => {
      if (target && Array.isArray(target) && target[index]) {
        return mergeObjects(target[index], item);
      }
      return item;
    });
  }

  // 处理对象
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (result[key] === undefined) {
          result[key] = source[key];
        } else {
          result[key] = mergeObjects(result[key], source[key]);
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// 生成指定范围内的随机数
export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 截断字符串并添加省略号
export function truncateString(str, length, suffix = '...') {
  if (!str || typeof str !== 'string' || str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

// 检查是否为有效的日期
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

// 格式化日期为指定格式
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';

  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (!isValidDate(d)) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 解析URL参数为对象
export function parseUrlParams(url = window.location.href) {
  try {
    const params = {};
    const searchParams = new URL(url).searchParams;

    for (const [key, value] of searchParams.entries()) {
      // 尝试解析JSON值
      try {
        params[key] = JSON.parse(value);
      } catch {
        params[key] = value;
      }
    }

    return params;
  } catch (error) {
    console.error('Error parsing URL params:', error);
    return {};
  }
}

// 构建URL查询字符串
export function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      // 处理复杂类型
      const paramValue = typeof value === 'object' ? JSON.stringify(value) : value;
      searchParams.append(key, paramValue);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// 检查是否为生产环境
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// 检查是否为开发环境
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// 延迟执行函数
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 重试函数
export async function retry(fn, maxAttempts = 3, delayMs = 1000, onError) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;

      // 调用错误回调
      if (typeof onError === 'function') {
        onError(error, attempts, maxAttempts);
      }

      if (attempts >= maxAttempts) {
        throw error;
      }

      // 指数退避策略
      await delay(delayMs * Math.pow(2, attempts - 1));
    }
  }
}

// 防抖函数（Promise 版本）
export function debouncePromise(fn, wait) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        try {
          const result = fn.apply(this, args);
          resolve(result);
        } catch (error) {
          resolve(undefined);
        }
      }, wait);
    });
  };
}

// 节流函数（Promise 版本）
export function throttlePromise(fn, wait) {
  let lastCall = 0;
  let pendingPromise;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall < wait) {
      if (!pendingPromise) {
        pendingPromise = new Promise((resolve) => {
          setTimeout(() => {
            lastCall = Date.now();
            pendingPromise = null;
            try {
              const result = fn.apply(this, args);
              resolve(result);
            } catch (error) {
              resolve(undefined);
            }
          }, wait - (now - lastCall));
        });
      }
      return pendingPromise;
    }

    lastCall = now;
    try {
      const result = fn.apply(this, args);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.resolve(undefined);
    }
  };
}

// 安全地执行函数
export function safeExecute(fn, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    console.error('Error executing function:', error);
    return undefined;
  }
}

// 批量执行异步函数
export async function batchExecuteAsync(functions, options = {}) {
  const {
    concurrent = false,
    onError = null
  } = options;

  if (!Array.isArray(functions)) return [];

  if (concurrent) {
    // 并发执行
    return Promise.all(
      functions.map(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          if (typeof onError === 'function') {
            onError(error);
          } else {
            console.error('Error in batch execution:', error);
          }
          return null;
        }
      })
    );
  } else {
    // 顺序执行
    const results = [];

    for (const fn of functions) {
      try {
        results.push(await fn());
      } catch (error) {
        if (typeof onError === 'function') {
          onError(error);
        } else {
          console.error('Error in batch execution:', error);
        }
        results.push(null);
      }
    }

    return results;
  }
}

// 计算两个日期之间的天数差
export function getDaysDiff(date1, date2, options = {}) {
  // 解析选项
  const {
    includeTime = false, // 是否包含时间部分
    round = 'ceil', // 取整方式：ceil(向上), floor(向下), round(四舍五入)
    absolute = true, // 是否返回绝对值
    timezone = 'local' // 时区处理：local(本地时区), utc(UTC时区)
  } = options;

  // 参数验证
  if (!date1 || !date2) return 0;

  // 转换为Date对象
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // 检查日期有效性
  if (!isValidDate(d1) || !isValidDate(d2)) return 0;

  // 重置时间部分（如果不包含时间）
  if (!includeTime) {
    if (timezone === 'utc') {
      d1.setUTCHours(0, 0, 0, 0);
      d2.setUTCHours(0, 0, 0, 0);
    } else {
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
    }
  }

  // 计算时间差（毫秒）
  const diffTime = absolute ? Math.abs(d2 - d1) : (d2 - d1);

  // 转换为天数
  const oneDay = 1000 * 60 * 60 * 24;
  let diffDays;

  // 根据取整方式计算天数
  switch (round) {
    case 'floor':
      diffDays = Math.floor(diffTime / oneDay);
      break;
    case 'round':
      diffDays = Math.round(diffTime / oneDay);
      break;
    case 'ceil':
    default:
      diffDays = Math.ceil(diffTime / oneDay);
      break;
  }

  return diffDays;
}

// 检查是否为闰年
export function isLeapYear(year) {
  // 转换为数字
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;

  // 验证年份
  if (isNaN(yearNum) || yearNum < 0) return false;

  // 闰年规则：能被4整除但不能被100整除，或者能被400整除
  return (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
}

// 获取指定月份的天数
export function getDaysInMonth(year, month) {
  // 转换为数字
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;

  // 验证参数
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) return 0;

  // 使用Date对象获取月份天数
  // 下个月的第0天就是当月的最后一天
  return new Date(yearNum, monthNum, 0).getDate();
}

// 生成UUID
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 检查是否为有效的URL
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    // 尝试添加http前缀再检查
    try {
      new URL(`http://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

// 深比较两个对象是否相等
export function deepEqual(obj1, obj2) {
  // 引用相同
  if (obj1 === obj2) return true;

  // 处理null/undefined
  if (obj1 == null || obj2 == null) return false;

  // 类型不同
  if (typeof obj1 !== typeof obj2) return false;

  // 处理基本类型
  if (typeof obj1 !== 'object') return obj1 === obj2;

  // 处理数组
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // 处理Map
  if (obj1 instanceof Map && obj2 instanceof Map) {
    if (obj1.size !== obj2.size) return false;
    for (const [key, value] of obj1.entries()) {
      if (!obj2.has(key) || !deepEqual(value, obj2.get(key))) return false;
    }
    return true;
  }

  // 处理Set
  if (obj1 instanceof Set && obj2 instanceof Set) {
    if (obj1.size !== obj2.size) return false;
    for (const value of obj1.values()) {
      let found = false;
      for (const v of obj2.values()) {
        if (deepEqual(value, v)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // 处理对象
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

// 缓存函数结果
export function memoize(fn, keyGenerator = JSON.stringify) {
  const cache = new Map();

  return function (...args) {
    const key = keyGenerator(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 限制函数调用频率
export function rateLimit(fn, limit, windowMs) {
  const calls = [];

  return function (...args) {
    const now = Date.now();

    // 过滤掉窗口期外的调用
    const recentCalls = calls.filter(timestamp => now - timestamp < windowMs);
    calls.length = 0;
    calls.push(...recentCalls);

    // 检查是否超过限制
    if (calls.length >= limit) {
      return undefined;
    }

    calls.push(now);
    return fn.apply(this, args);
  };
}
