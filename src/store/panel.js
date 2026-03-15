import { defineStore } from "pinia";
import { panelKey } from "./keys";

export const panelStore = defineStore(panelKey, {
    state: () => {
        return {
            panelData: {},   //  流程
        }
    },
    persist: {
        // 指定存储方式为 localStorage
        storage: localStorage,
        // 指定存储的键名
        paths:
            [
                "panelData",
            ],
    },
});
