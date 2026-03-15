import http from "../utils/request";

//  登录
export let loginApi = (data) => http.post(`/login`, {
  ...data,
});

//  个人信息
export let getUserInfoApi = (data) => http.get(`/getInfo`, {
  ...data,
});

//  菜单
export let userInfoApi = (data) => http.post(`/getRouters`, {
  ...data,
});


//  字典
export let dictApi = (data) => http.post(`/system/dict/data/type`, {
  ...data
})



//  kettle登录
export let logApi = (data) => http.post(`/getApi/user/doLogin.do`, {
  ...data
})