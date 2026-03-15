import router from "@/router";
import { themeStoreMenu } from "@/store/theme";
import { useStoreMenu } from "@/store/user";
import { ElMessage } from "element-plus";
export function logout(data) {
  const userStore = useStoreMenu();
  const storeTheme = themeStoreMenu();
  userStore.menus.forEach((item) => router.removeRoute(item.name));
  userStore.showMenu = [];
  userStore.menus = [];
  userStore.token = "";
  storeTheme.tabs = [];
  sessionStorage.removeItem("token");
  router.push("/login");
  if (data === "401") {
    ElMessage.error("token过期，请重新登录！");
  } else if (data === "Logout") {
    ElMessage.success("退出成功！");
  }
}
