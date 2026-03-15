import { defineStore } from "pinia";
import { dictKey } from "./keys";

export const dictStore = defineStore(dictKey, {
    state: () => {
        return {
            dict: {},   //  字典数据
            zbVerNumList: [], // 指标定义级别列表
            zbDirList: [], // 指标方向列表
            respDptList: [], // 责任科室列表
            zbAttrList: [], // 指标属性列表
            scriptTypeList: [], // 脚本执行类型列表
            zbTypeList: [], // 指标类型列表
            analPerList: [], // 统计周期列表
            dataFmtList: [], // 数据格式列表
            unitList: [], // 计量单位列表
            sysTypeList: [], // 显示类型列表
        }
    },
    persist: {
        // 指定存储方式为 sessionStorage
        storage: localStorage,
        // 指定存储的键名
        paths: ["dict", "zbVerNumList", "zbDirList", "respDptList", "zbAttrList", "scriptTypeList", "zbTypeList", "analPerList", "dataFmtList", "unitList", "sysTypeList"],
    },
});
