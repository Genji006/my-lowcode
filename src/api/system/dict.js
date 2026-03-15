import http from "@/utils/request";

// 查询字典类型详细
export function getType(dictId) {
  return http({
    url: '/system/dict/type/' + dictId,
    method: 'get'
  })
}

// 新增字典类型
export function addType(data) {
  return http({
    url: '/system/dict/type',
    method: 'post',
    data: data
  })
}

// 修改字典类型
export function updateType(data) {
  return http({
    url: '/system/dict/type',
    method: 'put',
    data: data
  })
}

// 删除字典类型
export function delType(dictId) {
  return http({
    url: '/system/dict/type/' + dictId,
    method: 'delete'
  })
}

// 刷新字典缓存
export function refreshCache() {
  return http({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  })
}


//字典——导出
export function exportDict(params, url, fileName) {
  http({
    method: 'POST',
    url: url,
    data: params,
    headers: {
      'Authorization': sessionStorage.getItem("token")
    },
    responseType: 'blob'
  }).then(res => {
    const link = document.createElement('a')  // 创建元素
    let blob = new Blob([res], { type: 'application/x-download' })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)   // 创建下载的链接
    link.setAttribute('download', fileName + '.xlsx')  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}


// 系统内置
export function systemDictType(query) {
  return http({
    url: 'system/dict/data/type/sys_yes_no',
    method: 'get',
    params: query
  })
}

// 获取字典选择框列表
export function optionselect() {
  return http({
    url: '/system/dict/type/optionselect',
    method: 'get'
  })
}


// 查询字典数据列表
export function listData(query) {
  return http({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return http({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return http({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return http({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return http({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return http({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}
