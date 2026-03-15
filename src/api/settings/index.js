import http from "@/utils/request";

let prefix = ''

//  dataOps登录
export let dataOpsLoginApi = (data) => http.post(`${prefix}/open-api/auth/third-party/token`, {
    ...data,
});
// 新增组件
export let addComponentApi = (data) => http.post(`${prefix}/business/design-component/insert`, {
    ...data
})
// 根据id获取组件详情
export let getComponentDetailApi = (data) => http.post(`${prefix}/business/design-component/detail`, {
    ...data
})
//  列表组件
export let listComponentApi = (data) => http.post(`${prefix}/business/design-component/list`, {
    ...data
})
// 修改组件
export let updateComponentApi = (data) => http.post(`${prefix}/business/design-component/update`, data)


//  查询组件
export let queryComponentApi = (data) => http.post(`${prefix}/business/design-data/queryDataList`, {
    ...data
})

//  新增页面
export let addPageApi = (data) => http.post(`${prefix}/business/design-page/insert`, {
    ...data
})
//医疗信息化新增
export let addMrmsTableMangerInfo = (data) => http.post(`${prefix}/business/mrmsTableManger/addMrmsTableMangerInfo`, {
    ...data
})
//  页面列表
export let pageListApi = (data) => http.post(`${prefix}/business/design-page/list`, {
    ...data
})

//  页面详情
export let pageDetailApi = (data) => http.post(`${prefix}/business/design-page/detail`, {
    ...data
})
export let getMrmsTableMangerInfo = (data) => http.post(`${prefix}/business/mrmsTableManger/getMrmsTableMangerInfo`, {
    ...data
})
//  页面更新
export let pageUpdate = (data) => http.post(`${prefix}/business/design-page/update`, {
    ...data
})
//  医疗信息化页面更新
export let updateMrmsTableMangerInfo = (data) => http.post(`${prefix}/business/mrmsTableManger/updateMrmsTableMangerInfo`, {
    ...data
})

//  sql 查询接口
export let querySqlApi = (data) => http.post(`${prefix}/business/design-datasource/page`, {
    ...data
})


