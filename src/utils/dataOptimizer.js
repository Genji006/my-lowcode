/**
 * 数据优化工具类
 * 用于优化前端数据大小、提升性能和管理数据缓存
 * 提供数据压缩、树形结构处理、分页、虚拟化等功能
 */
export class DataOptimizer {
  /**
   * 计算数据大小（字节）
   * @param {any} data - 要计算的数据（可以是对象、数组等任何类型）
   * @returns {number} 数据大小（以字节为单位）
   */
  static getDataSize(data) {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString]);
    return blob.size;
  }

  /**
   * 格式化数据大小为人类可读格式
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小（如：1.2 KB, 3.4 MB）
   */
  static formatDataSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 优化树形数据 - 移除不必要的字段
   * @param {Array} data - 原始树形数据
   * @param {Array} keepFields - 需要保留的字段数组，默认为 ['uniqueCode', 'name', 'bind']
   * @returns {Array} 优化后的树形数据（仅包含指定字段）
   */
  static optimizeTreeData(data, keepFields = ['uniqueCode', 'name', 'bind']) {
    if (!Array.isArray(data)) return data;

    return data.map(node => {
      const optimizedNode = {};

      // 只保留指定的字段
      keepFields.forEach(field => {
        if (node[field] !== undefined) {
          optimizedNode[field] = node[field];
        }
      });

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        optimizedNode.children = this.optimizeTreeData(node.children, keepFields);
      }

      return optimizedNode;
    });
  }

  /**
   * 压缩数据 - 使用短字段名减少数据体积
   * @param {Array} data - 原始数据
   * @param {Object} fieldMap - 字段映射关系，默认：{uniqueCode: 'u', name: 'n', bind: 'b', children: 'c'}
   * @returns {Array} 压缩后的数据（使用短字段名）
   */
  static compressData(data, fieldMap = {
    uniqueCode: 'u',
    name: 'n',
    bind: 'b',
    children: 'c'
  }) {
    if (!Array.isArray(data)) return data;

    return data.map(item => {
      const compressed = {};

      // 将长字段名替换为短字段名
      Object.keys(fieldMap).forEach(originalField => {
        const shortField = fieldMap[originalField];
        if (item[originalField] !== undefined) {
          compressed[shortField] = item[originalField];
        }
      });

      // 递归压缩子节点
      if (item.children && item.children.length > 0) {
        compressed[fieldMap.children] = this.compressData(item.children, fieldMap);
      }

      return compressed;
    });
  }

  /**
   * 解压数据 - 将压缩数据恢复为原始字段名
   * @param {Array} compressedData - 压缩后的数据
   * @param {Object} fieldMap - 字段映射关系，与压缩时使用的映射必须一致
   * @returns {Array} 解压后的数据（恢复原始字段名）
   */
  static decompressData(compressedData, fieldMap = {
    uniqueCode: 'u',
    name: 'n',
    bind: 'b',
    children: 'c'
  }) {
    if (!Array.isArray(compressedData)) return compressedData;

    // 创建反向映射表（短字段名 -> 原始字段名）
    const reverseFieldMap = {};
    Object.keys(fieldMap).forEach(originalField => {
      reverseFieldMap[fieldMap[originalField]] = originalField;
    });

    return compressedData.map(item => {
      const decompressed = {};

      // 将短字段名恢复为原始字段名
      Object.keys(item).forEach(shortField => {
        const originalField = reverseFieldMap[shortField];
        if (originalField) {
          decompressed[originalField] = item[shortField];
        }
      });

      // 递归解压缩子节点
      const childrenField = fieldMap.children;
      if (item[childrenField] && item[childrenField].length > 0) {
        decompressed.children = this.decompressData(item[childrenField], fieldMap);
      }

      return decompressed;
    });
  }

  /**
   * 数据分页处理
   * @param {Array} data - 完整数据集
   * @param {number} page - 当前页码，默认为1
   * @param {number} pageSize - 每页数据量，默认为50
   * @returns {Object} 分页结果对象，包含当前页数据、总页数、是否有下一页等信息
   */
  static paginateData(data, page = 1, pageSize = 50) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const total = data.length;

    return {
      data: data.slice(start, end),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: end < total,
      hasPrev: page > 1
    };
  }

  /**
   * 数据虚拟化 - 只加载可见区域数据（用于大数据列表优化）
   * @param {Array} data - 完整数据集
   * @param {number} visibleCount - 可见区域数据数量，默认为20
   * @param {number} startIndex - 开始索引，默认为0
   * @returns {Object} 虚拟化结果，包含可见数据、总数量、是否有更多数据等信息
   */
  static virtualizeData(data, visibleCount = 20, startIndex = 0) {
    const endIndex = Math.min(startIndex + visibleCount, data.length);
    const visibleData = data.slice(startIndex, endIndex);

    return {
      data: visibleData,
      total: data.length,
      startIndex,
      endIndex,
      hasMore: endIndex < data.length,
      hasPrev: startIndex > 0
    };
  }

  /**
   * 缓存存储 - 使用Map实现的内存缓存
   * @type {Map}
   */
  static cache = new Map();

  /**
   * 设置缓存
   * @param {string} key - 缓存键名
   * @param {any} data - 要缓存的数据
   * @param {number} ttl - 缓存过期时间（毫秒），默认为5分钟
   */
  static setCache(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键名
   * @returns {any|null} 缓存数据（如果存在且未过期），否则返回null
   */
  static getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 清除缓存
   * @param {string|null} key - 可选，指定要清除的缓存键名；如果不提供则清除所有缓存
   */
  static clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 性能监控 - 测量函数执行时间
   * @param {Function} fn - 要监控的函数
   * @param {string} label - 监控标签（用于控制台输出）
   * @returns {any} 函数执行结果
   */
  static monitorPerformance(fn, label) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${label} 耗时:`, (end - start).toFixed(2), 'ms');
    return result;
  }

  /**
   * 数据大小监控 - 测量数据占用空间
   * @param {any} data - 要监控的数据
   * @param {string} label - 监控标签（用于控制台输出）
   * @returns {number} 数据大小（字节）
   */
  static monitorDataSize(data, label) {
    const size = this.getDataSize(data);
    console.log(`${label} 数据大小:`, this.formatDataSize(size));
    return size;
  }

  /**
   * 计算数据优化率
   * @param {any} originalData - 原始数据
   * @param {any} optimizedData - 优化后数据
   * @returns {number} 优化率（百分比，保留整数）
   */
  static calculateOptimizationRate(originalData, optimizedData) {
    const originalSize = this.getDataSize(originalData);
    const optimizedSize = this.getDataSize(optimizedData);
    return Math.round((1 - optimizedSize / originalSize) * 100);
  }

  /**
   * 批量处理大数据集（避免一次性处理大量数据导致性能问题）
   * @param {Array} data - 完整大数据集
   * @param {Function} processor - 处理函数，接收分块数据并返回处理结果
   * @param {number} chunkSize - 分块大小，默认为1000条/块
   * @returns {Promise<Array>} 所有分块处理结果的合并数组
   */
  static async processLargeData(data, processor, chunkSize = 1000) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    const results = await Promise.all(
      chunks.map(chunk => processor(chunk))
    );

    return results.flat();
  }
}

// 导出工具函数（支持直接导入单个函数）
export const {
  getDataSize,
  formatDataSize,
  optimizeTreeData,
  compressData,
  decompressData,
  paginateData,
  virtualizeData,
  monitorPerformance,
  monitorDataSize,
  calculateOptimizationRate,
  processLargeData
} = DataOptimizer;