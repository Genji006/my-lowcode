import http from "@/utils/request";

// 修改菜单
export let changeStatus = (data) => http.put('/system/role/changeStatus', data);

export let treeselect = (data) => http.get('/system/menu/treeselect', data);

// 新增角色
export let addRole = (data) => http.post('/system/role', data);

// 修改角色
export let updateRole = (data) => http.put('/system/role', data);

// 根据角色ID查询菜单下拉树结构
export let roleMenuTreeselect = (roleId) => http.get( '/system/menu/roleMenuTreeselect/' + roleId )

// 查询角色详细
export let getRole = (roleId) => http.get('/system/role/' + roleId);


// 删除角色
export let delRole = (roleId) => http.delete('/system/role/' + roleId, roleId);

//导出角色
export function exportRole(params) {
  http({
    method: 'POST',
    url: '/system/role/export',
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
    link.setAttribute('download', '角色列表' + ".xlsx")  // 给下载后的文件命名
    document.body.appendChild(link)
    link.click()  // 点击下载
    document.body.removeChild(link)  //  下载完成移除元素
    window.URL.revokeObjectURL(link.href)  // 释放掉blob对象
  }).catch(err => { })
}

// 根据角色ID查询部门树结构
export let deptTreeSelect = (roleId) => http.get('/system/user/deptTree/' + roleId);

// 查询角色已授权用户列表
export let allocatedUserList = (data) => http.get('/system/role/authUser/allocatedList', {
  params: data
});

// 授权用户选择
export let selectAll = (data) => http.put('/system/role/authUser/selectAll',  data) 

// 取消用户授权角色
export let authUserCancel = (data) => http.put('/system/role/authUser/cancel',  data)

export let authUserCancelAll = (data) => http.put('/system/role/authUser/cancelAll',  data)




