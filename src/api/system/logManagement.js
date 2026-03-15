import http from "@/utils/request";

let prefix = "/specialty-evaluation";


//查询日志--- 查询平台端系统访问记录
export let pageGetloginLog = (data) =>
  http.post(`${prefix}/logininfor/page`, {
    ...data
  })

///查询日志---导出平台端系统访问记录
export function exportloginLog(params, url = '/plat/logininfor/export') {
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
    link.setAttribute('download', '登录日志' + (params.fileType ? params.fileType : '.xlsx'))  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

///操作日志---导出消息引擎执行日志
export function exportoperLog(params, url = '/plat/operlog/export') {
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
    link.setAttribute('download', '操作日志' + (params.fileType ? params.fileType : '.xlsx'))  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

///查询日志---通知分类查询
export let listNoticeType = (data) => http.post('/plat/noticeType/list', {
  ...data
})


///查询日志---导出消息引擎执行日志
export function exportnoticeLog(params, url = '/plat/messageEngineExecutionLog/export') {
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
    link.setAttribute('download', '消息推送日志' + (params.fileType ? params.fileType : '.xlsx'))  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}


//  ------------------------------------------------   评分规则库   ---------------------------------------------
//  关联指标
export let listRelatedIndexApi = (data) => http.post(`/business/rule/indexList`, {
  ...data
})

//  新增评分规则
export let addRuleApi = (data) => http.post(`/business/rule/insert`, data)

//  编辑评分规则
export let editRuleApi = (data) => http.post(`/business/rule/update`, {
  ...data
})

//  详情评分规则
export let detailRuleApi = (data) => http.post(`/business/rule/detail`, {
  ...data
})


//  删除评分规则
export let deleteRuleApi = (data) => http.post(`/business/rule/delete`, data)

// 指标值下拉框(查询数据项)
export let indexValueOptionsApi = (data) => http.post(`/business/rule/dataItemList`, {
  ...data
})

// 子项下拉框（）
export let subItemOptionsApi = (data) => http.post(`/business/rule/dataItemChildList`, {
  ...data
})

// 更新是否应用
export let updateIsApplyApi = (data) => http.post(`/business/rule/applyUpdate`, {
  ...data
})


//  ------------------------------------------------------------- 机构信息 --------------------------------------------------
// 查询机构信息
export let listInstitutionApi = (data) => http.post(`/plat/sysOrganInfo/selectMainOrganInfo`, {
  ...data
})
//  编辑机构信息
export let editInstitutionApi = (data) => http.post(`/plat/sysOrganInfo/updateOrganInfo`, {
  ...data
})

// 行政区下拉
export let getXzqh = (data) => http.post(`/business/xzqh/getXzqh`, {
  ...data
})

// 机构字典接口
export let institutionOptionsApi = (data) => http.post(`/business/DICTIONARY/generalDiction`, data)

export let dictionaryAPI = (data) => http.post('/business/DICTIONARY/V2/generalDiction', data)

export let alldictionaryAPI = (data) => http.post('/business/DICTIONARY/page', data)


// --------------------------------------------------------------  文件管理  ---------------------------------------------------
//  批量新增文件
export let uploadFileListApi = (data) => http.post(`/business/file-management/insertBatch`, data)

// 编辑文件
export let editFileApi = (data) => http.post(`/business/file-management/update`, {
  ...data
})
// 批量删除
export let deleteFileListApi = (data) => http.post(`/business/file-management/delete`, data)

// 修改状态
export let updateStatusApi = (data) => http.post(`/business/file-management/update-status`, {
  ...data
})


//  -------------------------------   亚专科画像分析  ------------------------------------------
//  亚专科树状查询
export let subSpecialistTreeApi = (data) => http.post(`/business/InformationRecord/listHxInfoTree`, {
  ...data
})
//  查询亚专科成员
export let subSpecialistMemberApi = (data) => http.post(`/business/infoRecord/listInfo`, {
  ...data
})

//  -------------------------------  医师画像  ---------------------------------------------------
// 列表查询
export let listDoctorApi = (data) => http.post(`/business/DEPTMAPINFO/standDptListV2`, {
  ...data
})

// 人资信息
export let listPersonnelApi = (data) => http.post(`/business/humanResManagentDeptdetail/selectHumanResourcesNotPlatUserInfo`, {
  ...data
})
// 人资信息改
export let ersonnelSearch = (data) => http.post(`/business/humanResManagentDeptdetail/ersonnelSearch`, {
  ...data
})

// 获取医师具体数据
export let getSelectYshxInfo = (data) => http.post(`/business/humanResManagentDeptdetail/selectYshxInfo`, {
  ...data
})


//  -----------------------------------  目录管理  -----------------------------------
// 新增
export let addCatalogApi = (data) => http.post(`/business/mlglgxb/add`, data)
// 编辑
export let editCatalogApi = (data) => http.post(`/business/mlglgxb/edit`, data)
// 删除
export let deleteCatalogApi = (data) => http.post(`/business/mlglgxb/delete`, data)
// 启用否
export let updateStatusCatalogApi = (data) => http.post(`/business/mlglgxb/updateIsQy`, data)


//  ----------------------------------- 标准管理  --------------------------------------
// 标准修改
export let updateStandardApi = (data) => http.post(`/business/bmtableList/update`, {
  ...data
})
// 下钻(手术操作编码表) 查询
export let operationCodeApi = (data) => http.post(`/business/bmtableList/selectByTableCode`, {
  ...data
})
//  手术查询
export let standardListApi = (data) => http.post(`/business/bmOperation/V2/getOperationTree`, {
  ...data
})
// 手术操作编码新增
export let addOperationCodeApi = (data) => http.post(`/business/bmsscz/insert`, {
  ...data
})
// 手术操作编码编辑
export let editOperationCodeApi = (data) => http.post(`/business/bmsscz/update`, {
  ...data
})
// 手术操作编码删除
export let deleteOperationCodeApi = (data) => http.post(`/business/bmsscz/delete`, {
  ...data
})

// icd10接口查询
export let icd10Api = (data) => http.post(`/business/bmicdV2/list`, {
  ...data
})
// icd10新增
export let addIcd10Api = (data) => http.post(`/business/bmicdV2/insert`, {
  ...data
})
// icd10编辑
export let editIcd10Api = (data) => http.post(`/business/bmicdV2/update`, {
  ...data
})
// icd10删除
export let deleteIcd10Api = (data) => http.post(`/business/bmicdV2/delete`, {
  ...data
})




// ------------------------------------------------------------  得分趋势分析  ---------------------------------------------------
// 标准科室/实际科室
export let scoreTrendTreeApi = (data) => http.post(`/business/scoreTrend/page`, {
  ...data
})



//  ----------------------------------------------------------- 人员详情  ----------------------------------------------------------
//  人员详情
export let getHumanDetail = (data) => http.post(`/business/humanResManagentDeptdetail/selectByIdCode`, {
  ...data
})

//  ------------------------------------------------  亚专科画像  --------------------------------------------------------------
// 明细
export let getAsiaPortraitApi = (data) => http.post(`/business/InformationRecord/listYzkPracticeInfo`, data)


// 亚专科管理查询未绑定的人员
export let humanJuniorCollege = (data) => http.post(`/business/humanResManagentDeptdetail/humanJuniorCollege`, data)