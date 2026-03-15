import axios from "axios";
import { ElMessage } from "element-plus";
import { logout } from "@/utils/logout";

const request = axios.create({
  baseURL: "",
  timeout: 60000,
});

// 存储正在进行的请求
const pendingRequests = new Map();

// 生成请求标识
const generateRequestKey = (config) => {
  const { url, method, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

// 取消请求
const cancelPendingRequest = (key) => {
  if (pendingRequests.has(key)) {
    const cancelToken = pendingRequests.get(key);
    cancelToken.cancel("Request cancelled due to duplicate request");
    pendingRequests.delete(key);
  }
};

// 移除已完成的请求
const removePendingRequest = (key) => {
  if (pendingRequests.has(key)) {
    pendingRequests.delete(key);
  }
};

//   请求拦截器
request.interceptors.request.use(
  (config) => {
    // 生成请求标识
    const requestKey = generateRequestKey(config);

    // 取消相同标识的待处理请求
    cancelPendingRequest(requestKey);

    // 创建新的取消令牌
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    // 存储当前请求
    pendingRequests.set(requestKey, source);

    // console.log(config, "config");
    if (config.url.startsWith("/getApi")) {
      config.baseURL = "";
    } else {
      // console.log(config, "config.url")
      config.baseURL = "/api/data-ops";
    }
    config.headers["Authorization"] = `Bearer ${
      sessionStorage.getItem("token") || ""
    }`;
    // 如果数据是 FormData，不需要设置 Content-Type，浏览器会自动设置
    if (config.data instanceof FormData) {
      // 不设置 Content-Type，让浏览器自动设置 boundary
    } else if (config.form) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // console.log(config, "config");

    return config;
  },
  (error) => {
    // 处理请求错误
    if (axios.isCancel(error)) {
      // console.log("Request cancelled:", error.message);
      return Promise.resolve({ code: 200, data: null }); // 取消请求视为成功，避免触发错误处理
    }
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 生成请求标识
    const requestKey = generateRequestKey(response.config);
    // 移除已完成的请求
    removePendingRequest(requestKey);

    const data = response.data;
    if (data.code === 401) {
      logout("401");
    } else {
    }
    // console.log(data, 'data')
    if (data.code !== 200) {
      if (data.msg) {
        ElMessage({
          type: "error",
          duration: 5000,
          showClose: true,
          message: data.msg,
        });
      }
    }
    return response.data;
  },
  (error) => {
    // 处理响应错误
    if (axios.isCancel(error)) {
      // console.log("Response cancelled:", error.message);
      return Promise.resolve({ code: 200, data: null }); // 取消请求视为成功，避免触发错误处理
    }

    // 生成请求标识并移除
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      removePendingRequest(requestKey);
    }

    return Promise.reject(error);
  },
);

export default request;
