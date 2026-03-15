import { defineStore } from "pinia";
import { themeKey } from "./keys";

export const themeStoreMenu = defineStore(themeKey, {
  state() {
    return {
      menuLayout: "horizontal", //  菜单布局 （'horizontal(顶部)' | 'vertical(侧边)'）
      avatar: "", // 头像
      logo: "", // 系统 logo
      systemName: "数据运营管理平台",
      nickName: "",
      tabs: [], //   标签页数组
      currentTab: {},
    };
  },
  getters: {
    tabsFn() {
      let that = this;
      // const tabs = ref([]);
      // this.currentTab = { menuName: "", path: "", menuId: "" };
      const addTab = (menuName, path, icon, params = {}, query = {}) => {
        if (!that.tabs.some((tab) => tab.menuName === menuName)) {
          that.tabs.push({ menuName, path, icon, params, query });
        }
      };
      //  设置高亮
      const setCurrentTab = (menuName, path) => {
        this.currentTab = { menuName, path };
        // console.log(this.currentTab, "this.currentTab");
      };
      //  删除tab
      const removeTab = (menuName) => {
        //  如果删除的是高亮tab
        if (this.currentTab.menuName === menuName) {
          const currentIndex = that.tabs.findIndex(
            (tab) => tab.menuName === menuName
          ); // 高亮索引
          // console.log(currentIndex, "currentIndex");
          if (currentIndex != 0) {
            this.currentTab = that.tabs[currentIndex - 1] || that.tabs[0]; // 高亮tab变更
          } else {
            return;
          }
        }
        // store.$patch((state) => {
        this.tabs = this.tabs.filter((tab) => tab.menuName !== menuName);
        // });
        // console.log(this.currentTab, "this.currentTab");

        // store.tabs = store.tabs.filter((tab) => tab.menuName !== menuName);
      };
      return { addTab, setCurrentTab, removeTab };
    },
  },
  persist: {
    // 指定存储方式为 sessionStorage
    storage: sessionStorage,
    // 指定存储的键名
    paths: ["tabs", "currentTab"],
  },
});
