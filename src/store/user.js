import { defineStore } from "pinia";
import { userKey } from "./keys";

//  查找所有子级菜单的路由
function getNodesWithChildren(tree, item) {
  let result = [];
  tree.forEach((node) => {
    if (node.children && node.children.length > 0) {
      result.push(node);
      // 递归处理子节点
      result = result.concat(getNodesWithChildren(node.children));
    } else {
      if(!node?.meta?.title){
        console.log(node,'node');
      }
      result.push(node);
    }
  });
  let list = [];

  result.forEach((e) => {
    list.push({
      path: e.path,
      component: e.component,
      meta: { keepAlive: e.meta?.keepAlive }
    });
  });
  return list;
}

// 生成随机字符串
function generateRandomLetters(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
// 所有子级菜单的路由分为两级，第一级为父级菜单，第二级为子级菜单
function componentData(arr) {
  let arrList = [];       //  第一级有子级的
  let arrLengthNo = [];   //  第一级没有子级的
  arr.forEach((e) => {
    if (e.children && e.children.length > 0) {
      arrList.push({
        path: e.path,
        // component: modules[`../views/home/index.vue`],
        children: getNodesWithChildren(e.children, e),
        meta: { keepAlive: e?.meta?.keepAlive }
      });
    } else {
      arrLengthNo.push({
        path: e.path,
        component: e.component,
        meta: { keepAlive: e?.meta?.keepAlive }
      });
    }
  });
  // 将第一级没有子级的菜单合并到，第一级有子级的菜单的第一项的children中
  if (arrList.length > 0) {
    arrList[0].children = arrList[0].children.concat(arrLengthNo);
  } else if (arrList.length === 0 && arrLengthNo.length > 0) {
    // 如果第一级有子菜单的数组为空，而第一级没有子菜单的数组不为空，则生成一个随机的路径作为第一级的路径
    arrList.push({
      path: "/" + generateRandomLetters(8),
      children: arrLengthNo,
      meta: { keepAlive: false }
    });
  }
  return arrList;
}

export const useStoreMenu = defineStore(userKey, {
  state: () => ({
    showMenu: [], //  展示的菜单
    menus: [], //  添加的动态路由
    username: "张三",
    token: sessionStorage.getItem("token") || "",
  }),
  actions: {},
  getters: {
    routes() {
      let menus = [];
      menus = componentData(this.menus);
      return menus;
    },
  },
});
