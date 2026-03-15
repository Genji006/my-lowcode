import { createRouter, createWebHashHistory } from "vue-router";
import { userInfoApi } from "../api/index";
import { useStoreMenu } from "../store/user";
import { themeStoreMenu } from "@/store/theme";
import { menuListFn } from '@/utils/menuListFn'
// import Login from "../views/login/index.vue";
// import AppHome from "../views/appHome/index.vue"

const whiteList = ["/login", "/loginApp"];

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/indicator-analysis",
    name: "IndicatorAnalysis",
    component: () => import("@/views/indicatorAnalysis/index.vue"),
    children: [
      {
        path: "/indicator-analysis/dashboard",
        name: "IndicatorDashboard",
        component: () => import("@/views/indicatorAnalysis/IndicatorDashboard.vue"),
        meta: { keepAlive: true }
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

function normalizeTreePath(data, childrenKey = 'children') {
  // 如果是数组，递归处理每个元素
  if (Array.isArray(data)) {
    return data.map(item => normalizeTreePath(item, childrenKey));
  }
  // 如果是对象，创建副本以避免修改原数据
  if (data && typeof data === 'object') {
    const result = { ...data };
    // 处理path字段
    if (result.path && typeof result.path === 'string') {
      // 如果path不为空且第一个字符不是/，则在前面添加/
      if (result.path.charAt(0) !== '/') {
        result.path = '/' + result.path;
      }
    }

    // 递归处理子节点
    if (result[childrenKey] && Array.isArray(result[childrenKey]) && result[childrenKey].length > 0) {
      result[childrenKey] = normalizeTreePath(result[childrenKey], childrenKey);
    }

    return result;
  }
  // 非数组非对象时直接返回
  return data;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const store = useStoreMenu();
  const isLogin = store.token;
  if (store.showMenu.length === 0 && isLogin) {
    userInfoApi().then((res) => {
      console.log(res, "userInfoApi");
      if (res.code === 200) {
        store.showMenu = normalizeTreePath(res.data); //  展示的菜单
        store.menus = res.data; //  添加的动态路由
        const modules = import.meta.glob("../views/**/*.vue");
        // console.log(store.routes, "store.routes");
        // 递归收集所有叶子页面
        function collectAllRoutes(menuList) {
          let routes = [];
          menuList.forEach(item => {
            if (item.children && item.children.length > 0) {
              routes = routes.concat(collectAllRoutes(item.children));
            } else {
              const compPath = `../views/${item.component}.vue`;
              if (!modules[compPath]) {
                console.warn('找不到页面组件:', compPath);
              }
              let path = item.path;
              if (path && !path.startsWith('/')) {
                path = '/' + path;
              }
              routes.push({
                path: path,
                name: item.path,
                component: modules[compPath],
                meta: { keepAlive: item.meta?.keepAlive }
              });
            }
          });
          return routes;
        }
        //  处理所有子级
        const allChildren = collectAllRoutes(store.routes);
        // for (let i = 0; i < allChildren.length; i++) {
        //   if(!allChildren[i]?.title){
        //     console.log(allChildren[i], "allChildren[i]");
        //   }
        // }

        // 注册 home layout 路由
        router.addRoute({
          path: '/home',
          name: 'Home',
          component: modules['../views/home/index.vue'],
          children: allChildren
        });
        next(to.fullPath);
      }
    });
  } else if (!isLogin && to.path !== "/login") {
    next("/login");
  } else if (isLogin && store.showMenu.length !== 0 && to.path === "/login") {
    next(from.fullPath);
  } else {
    next();
  }
});

router.afterEach((to, from) => { 
    const themeStore = themeStoreMenu();
    document.title = themeStore.systemName
})




export default router;
