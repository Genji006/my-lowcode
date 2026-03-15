//专科信息
import http from "@/utils/request";

// 标准科室查询
export let listBmks = (data) => http.post(`/business/DEPTMAPINFO/listBmks`, {
  ...data
});
// 新增
export let insertHosDpt = (data) => http.post(`/business/DEPTMAPINFO/insertHosDpt`, {
  ...data
});

// 编辑
export let updateHosDpt = (data) => http.post(`/business/DEPTMAPINFO/updateHosDpt`, {
  ...data
});

// 状态变更
export let updateIsQy = (data) => http.post(`/business/DEPTMAPINFO/updateIsQy`, {
  ...data
});

// 科室对照
export let deptComp = (data) => http.post(`/business/DEPTMAPINFO/deptComp`, {
  ...data
});

// 删除
export let deleteHosDpt = (data) => http.post(`/business/DEPTMAPINFO/deleteHosDpt`, {
  ...data
});

// 批量导入
export let importHosDpt = (data) => http.post(`/business/DEPTMAPINFO/import`, {
  ...data
});

// 查询机构信息
export let listInstitutionApi = (data) => http.post(`/plat/sysOrganInfo/selectMainOrganInfo`, {
  ...data
})

//下载模板
export function downTemplate(params) {
  http({
    method: 'POST',
    url: '/business/DEPTMAPINFO/downTemplate',
    data: [],
    headers: {
      'Authorization': sessionStorage.getItem("token")
    },
    responseType: 'blob'
  }).then(res => {
    const link = document.createElement('a')  // 创建元素
    let blob = new Blob([res], { type: 'application/x-download' })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)   // 创建下载的链接
    link.setAttribute('download', params.fileName + ".xlsx")  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

//导出
export function exportDpt(params) {
  http({
    method: 'POST',
    url: '/business/DEPTMAPINFO/export',
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
    link.setAttribute('download', params.fileName + ".xlsx")  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

//导出
export function downImportError(params) {
  http({
    method: 'POST',
    url: '/business/DEPTMAPINFO/downImportError',
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
    link.setAttribute('download', '科室导入失败数据' + ".xlsx")  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

// 查询科室负责人
export let queryInfoDataList = (data) => http.post(`/system/resources-management/simple/V2/queryDataList`, {
  ...data
})