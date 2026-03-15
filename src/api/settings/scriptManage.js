import http from "@/utils/request";

//  脚本库管理
export let scriptListApi = (data) => http.post(``, {
    ...data,
});