import http from "@/utils/request";

export let listMenu = (params = {}) => {
  // 构建查询参数，自动过滤空值
  const queryParams = {};
  console.log(params,'1');
  Object.keys(params).forEach(key => {
    const value = params[key];
    // 过滤掉空字符串、null、undefined，但保留数字0和布尔值false
    if (value !== '' && value !== null && value !== undefined) {
      queryParams[key] = value;
    }
  });
  console.log(queryParams,'2');
  return http({
    url: '/system/menu/list',
    method: 'get',
    params: queryParams
  });
};

export let getMenu = (menuId) => http.get(`/system/menu/${menuId}`);

// 新增菜单
export let addMenu = (data) => http.post('/system/menu', data);

// 修改菜单
export let updateMenu = (data) => http.put('/system/menu', data);

// 删除菜单
export let delMenu = (menuId) => http.delete(`/system/menu/${menuId}`);

