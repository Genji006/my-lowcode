import http from "@/utils/request";


export let list = (data) =>
  http.post(`/business/menu/list`, {
    ...data,
  });
//  新增菜单项
export let insert = (data) =>
  http.post(`/business/menu/insert`, data);


//  更新菜单项
export let update = (data) =>
  // http.post(`/business/menu/update`, data);
  http.post(`/business/menu/updateCpxxMenuItem`, data);


// 删除菜单项
export let deleteMenu = (data) =>
  http.post(`/business/menu/delete`, {
    ...data,
  });
// 绑定菜单项
export let bindMenu = (data) => http.post(`/business/menu/conditionQuery`, data)

// 绑定菜单项至组上
export let updateBindMenu = (data) => http.post(`/business/menu/menuGroupBinding`, data)

// 解绑菜单项
export let unBindMenu = (data) => http.post(`/business/menu/removeBindingByMenuId`, data);

// 菜单状态
export let menuStatus = (data) => http.post(`/business/menu/updateStatus`, data);


//菜单模板——导出
export function menuExport(params, url, fileName) {
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

export let updateMenuGroup = (data) =>
  http.post(`/business/menu/update`, data);