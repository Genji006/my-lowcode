<template>
  <div class="allPages">
    <!-- 侧边栏 -->
    <el-container v-if="storeTheme.menuLayout === 'vertical'">
      <el-header style="display: flex">
        <Header></Header>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '50px' : '200px'">
          <Aside></Aside>
        </el-aside>·
        <el-main>
          <RouterView v-slot="{ Component }">
            <KeepAlive>
              <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </KeepAlive>
            <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
          </RouterView>
          <!-- <router-view></router-view> -->
        </el-main>
      </el-container>
    </el-container>
    <!-- 顶部栏 -->
    <el-container v-if="storeTheme.menuLayout === 'horizontal'">
      <el-container>
        <el-header>
          <div class="headerLayout">
            <div class="logoName">
              <div style="
                  display: flex;
                  line-height: 3px;
                  align-items: center;
                  width: 200px;
                ">
                <img :src="storeTheme.logo" alt="logo" width="34px" height="34px" />
                <span style="margin-left: 10px">{{
                  storeTheme.systemName
                }}</span>
              </div>
              <div style="width: calc(100% - 200px)">
                <Aside></Aside>
              </div>
            </div>
            <div class="rightOperate">
              <!-- <el-badge :is-dot="8" :size="50" class="item">
                <el-icon><Bell /></el-icon>
              </el-badge> -->
              <el-avatar class="ml mr" style="width: 34px; height: 34px" :src="storeTheme.avatar"></el-avatar>
              <el-dropdown @command="handleCommandTop" class="homePage-dropdown-class">
                <span class="el-dropdown-link">
                  欢迎您，{{ storeTheme.nickName }}
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="User" icon="User">个人中心</el-dropdown-item>
                    <el-dropdown-item command="Logout" icon="SwitchButton">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        <el-footer style="height: 40px;display: flex;border-top: 2px solid #e4e4e4;border-bottom: 2px solid #e4e4e4; align-items: center;line-height: 17px !important;">
          <div style="width: 100%; display: flex">
            <div class="scroll-container">
              <div class="arrow" @click="scrollLength('left')">
                <el-icon>
                  <ArrowLeftBold />
                </el-icon>
              </div>
              <div class="tagScroll" ref="scrollDiv">
                <p v-for="(item, index) in storeTheme.tabs" :key="item.menuName" @click="handleClick(item, index)" :class="
                    item.menuName == currentTab.menuName
                      ? 'TagCheck'
                      : 'TagChecks'
                  ">
                  {{ item.menuName }}
                  <el-icon size="12" v-if="index != 0" @click.stop="remove(item.menuName)">
                    <CloseBold class="TagIndex" />
                  </el-icon>
                </p>
              </div>
              <div class="arrow" @click="scrollLength('right')">
                <el-icon>
                  <ArrowRightBold />
                </el-icon>
              </div>
            </div>
            <div style="flex-basis: 80px">
              <el-dropdown placement="bottom-start" @command="handleCommand" class="homePage-dropdown-class">
                <p class="page_operate">页面操作</p>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in dropdownList" :icon="item.icon" :command="item.value" :key="item.value">
                      <span>{{ item.label }}</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-footer>
        <el-main style="height: calc(100vh - 114px); padding-bottom: 0 !important;overflow: hidden;">
          <router-view v-slot="{ Component }">
            <KeepAlive>
              <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </KeepAlive>
            <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
          </router-view>
          <!-- <router-view></router-view> -->
        </el-main>
        <div style="height:24px;width: 100%;padding:0 10px;box-sizing: border-box;background-color: rgb(231, 233, 235);display: flex;align-items: center; justify-content: center;font-size: 14px;">
        
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import {
  ref,
  watch
} from "vue";
import Aside from "./components/Aside.vue";
import {
  storeToRefs
} from "pinia";
import Header from "./components/Header.vue";
import {
  themeStoreMenu
} from "@/store/theme";
import {
  useStoreMenu
} from "@/store/user";
// import { useTabsStore } from "@/store/tabs"
import {
  useRoute,
  useRouter
} from "vue-router";
import {
  logout
} from "@/utils/logout";

const dropdownList = [
  // { value: '0', label: '刷新页面', icon: 'Refresh' },
  {
    value: "all",
    label: "关闭全部",
    icon: "CloseBold"
  },
  {
    value: "other",
    label: "关闭其他",
    icon: "SemiSelect"
  },
  {
    value: "left",
    label: "关闭左侧",
    icon: "ArrowLeftBold"
  },
  {
    value: "right",
    label: "关闭右侧",
    icon: "ArrowRightBold"
  },
];

const route = useRoute();
const router = useRouter();

const userStore = useStoreMenu();
const storeTheme = themeStoreMenu(); //  主题存储
const {
  showMenu
} = storeToRefs(userStore); //  菜单

const {
  currentTab
} = storeToRefs(storeTheme);

// const tabsStore = useTabsStore();
// console.log(storeTheme.tabs, "storeTheme.tabs");

const {
  setCurrentTab,
  addTab,
  removeTab
} = storeTheme.tabsFn;

// 定义滚动容器的引用
const scrollDiv = ref(null);
const scrollStep = 200; //  滚动步长

function findObjectbyPath(arr, path) {
  // console.log(path, "path");
  // console.log(arr, "3");
  for (const item of arr) {
    if (item.path === path || path === '/' + item.path ) {
      // console.log(item, "3");
      return item;
    }
    if (item.children) {
      const result = findObjectbyPath(item.children, path);
      if (result) {
        // console.log(result, "result");
        return result;
      }
    }
  }
  return null;
}



const { meta, path } = findObjectbyPath(showMenu.value, route.path);
addTab(meta.title, path, meta.icon, route.params || {}, route.query || {}); // 确保params和query是对象
setCurrentTab(meta.title, path, meta.icon);



// 点击标签页时使用存储的参数
const handleClick = (data, index) => {
  const tab = storeTheme.tabs[index];
  router.push({
    path: tab.path,
    params: tab?.params || {},
    query: tab?.query || {}
  });
  setCurrentTab(tab.menuName, tab.path, tab.icon);
};

//  移除标签
const remove = (tabPanName) => {
  // console.log(tabPanName, "remove");
  removeTab(tabPanName);
  router.push(storeTheme.currentTab.path); //  跳转上一个
};

//  滚动步长
const scrollLength = (type) => {
  if (scrollDiv.value) {
    if (type === "left") {
      scrollDiv.value.scrollLeft -= scrollStep;
    } else {
      scrollDiv.value.scrollLeft += scrollStep;
    }
  }
};

//  全部右边
function keepFirstAndAfterPosition(arr, position) {
  if (arr.length <= position) {
    return arr; // 如果数组长度小于等于指定位置，直接返回原数组
  }
  const firstItem = arr[0]; // 保留第一项
  const afterPosition = arr.slice(position); // 从指定位置开始截取
  return [firstItem, ...afterPosition]; // 合并第一项和指定位置之后的元素
}

//  页面操作
const handleCommand = (data) => {
  // console.log(data, "data");
  if (data === "all") {
    storeTheme.$patch((state) => {
      state.tabs = [storeTheme.tabs[0]];
    });
    router.push(storeTheme.tabs[0].path); //  跳转第一个
    setCurrentTab(
      storeTheme.tabs[0].menuName,
      storeTheme.tabs[0].path,
      storeTheme.tabs[0].icon
    );
  } else if (data === "other") {
    if (storeTheme.currentTab.menuName === storeTheme.tabs[0].menuName) {
      storeTheme.$patch((state) => {
        state.tabs = [storeTheme.tabs[0]];
      });
      router.push(storeTheme.tabs[0].path); //  跳转第一个
      setCurrentTab(
        storeTheme.tabs[0].menuName,
        storeTheme.tabs[0].path,
        storeTheme.tabs[0].icon
      );
    } else {
      if (storeTheme.tabs.length <= 2) { } else {
        let objectValue = storeTheme.tabs.find(
          (f) => f.menuName === storeTheme.currentTab.menuName
        );
        storeTheme.$patch((state) => {
          state.tabs = [storeTheme.tabs[0], objectValue];
        });
        setCurrentTab(
          storeTheme.tabs[1].menuName,
          storeTheme.tabs[1].path,
          storeTheme.tabs[1].icon
        );
      }
    }
  } else if (data === "right") {
    let indexTabs = storeTheme.tabs.findIndex(
      (tab) => tab.menuName === storeTheme.currentTab.menuName
    ); // 高亮索引
    console.log(indexTabs, "indexTabs");
    storeTheme.$patch((state) => {
      state.tabs = storeTheme.tabs.slice(0, indexTabs + 1);
    });
  } else if (data === "left") {
    let indexTabs = storeTheme.tabs.findIndex(
      (tab) => tab.menuName === storeTheme.currentTab.menuName
    ); // 高亮索引
    storeTheme.$patch((state) => {
      state.tabs = keepFirstAndAfterPosition(storeTheme.tabs, indexTabs);
    });
  }
};



// 监听路由变化，更新当前标签页的参数
watch(
  () => route,
  (newRoute) => {
    // 查找菜单信息
    const menuObj = findObjectbyPath(showMenu.value, newRoute.path);
    if (menuObj) {
      // 如果 tabs 里没有这个 tab，则添加
      const exists = storeTheme.tabs.some(tab => tab.menuName === menuObj.meta.title);
      if (!exists) {
        addTab(menuObj.meta.title, menuObj.path, menuObj.meta.icon, newRoute?.params || {}, newRoute?.query || {}); // 确保params和query是对象
      } else {
        // 更新现有标签页的参数
        const tabIndex = storeTheme.tabs.findIndex(tab => tab.menuName === menuObj.meta.title);
        if (tabIndex !== -1) {
          storeTheme.tabs[tabIndex].params = { ...(newRoute.params || {}) }; // 确保params是对象
          storeTheme.tabs[tabIndex].query = { ...(newRoute.query || {}) }; // 确保query是对象
        }
      }
      // 设置当前 tab
      setCurrentTab(menuObj.meta.title, menuObj.path, menuObj.meta.icon);
    }
  },
  { immediate: true, deep: true }
);

//  顶部栏点击事件
const handleCommandTop = (data) => {
  // console.log(data, "data");
  //  退出登录
  if (data === "Logout") {
    logout("Logout");
  }
};

	// console.log(menuName, "menuName");
</script>

<style lang="less">
.allPages {
  height: 100vh;

  .el-header {
    height: 50px;
    padding: 0 0 0 10px;
    background-color: #fff;
  }

  .el-aside {
    background-color: #fff;
    height: calc(100vh - 50px);

    &::-webkit-scrollbar {
      width: 0;
    }
  }

  .el-main {
    background-color: rgb(231, 233, 235);
    padding: 10px !important;
    // padding:10px 10px 0px 10px !important;
  }

  .el-sub-menu__title {
    font-size: 16px;
    color: rgb(83, 128, 253);
  }

  .el-menu--horizontal {
    border: none;
    padding-top: 10px;
    font-weight: 600;
    --el-menu-horizontal-height: 45px;
  }

  .el-footer {
    --el-footer-padding: 0;
  }
}

.homePage-dropdown-class {
  .el-tooltip__trigger:focus-visible {
    outline: unset !important;
  }
}
</style>

<style lang="less" scoped>
.headerLayout {
  display: flex;
  width: 100%;
  height: 100%;
}

.rightOperate {
  width: 300px;
  // background-color: aqua;
  height: 40px;
  padding: 0px 10px;
  display: flex;
  align-items: center;
  justify-content: end;
  padding-top: 10px;

  .item {
    margin-top: 10px;
  }
}

.logoName {
  width: calc(100% - 300px);
  display: flex;
}
</style>

<style lang="scss" scoped>
.scroll-container {
  // width: 99%;
  // margin: 0 0.5%;
  display: flex;
  flex-grow: 1;
  /* 自适应 */
  align-items: center;
  overflow: hidden;
  position: relative;
}

.arrow {
  width: 1%;
  padding: 5px 10px 0 10px;
  cursor: pointer;
}

.tagScroll {
  display: flex;
  width: 98%;
  overflow-x: scroll;
  scrollbar-width: none;
  white-space: nowrap;
  font-size: 15px;
}

::-webkit-scrollbar {
  display: none;
}

.TagCheck {
  color: rgba(83, 128, 253, 1);
  padding: 10px 10px 4px 10px;
  border-bottom: 3px solid rgba(83, 128, 253, 1);
  background-color: rgba(83, 128, 253, 0.15);
  // font-weight: 600;
  cursor: pointer;
}

.TagCheck .TagIndex {
  display: block;
}

.TagChecks {
  white-space: nowrap;
  color: #000;
  padding: 10px 10px 4px 10px;
  border-bottom: 3px solid #fff;
  background-color: #fff;
  cursor: pointer;
}

.TagChecks:hover {
  padding: 10px 10px 4px 10px;
  color: rgba(83, 128, 253, 1);
  background-color: rgba(83, 128, 253, 0.15);
  border-bottom: 3px solid rgba(83, 128, 253, 1);
  transition: 0.3s;
  cursor: pointer;
}

.TagIndex {
  display: none;
}

.TagChecks:hover .TagIndex {
  display: block;
  cursor: pointer;
}

.page_operate {
  white-space: nowrap;
  color: rgb(0, 0, 0);
  font-size: 16px;
  font-family: "Microsoft YaHei";
  margin-left: 0.5%;
  line-height: 36px;
}
</style>