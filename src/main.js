import { createApp } from "vue";
import "./style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import { createPinia } from "pinia";
import App from "./App.vue";
import Antd from 'ant-design-vue';


import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css'; // 选择一个您喜欢的主题样式
import hljsVuePlugin from "@highlightjs/vue-plugin";
import PartTitle from "./components/element/partTitle.vue";

// 注册需要的语言
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

// import "./mock";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import zhCn from "element-plus/es/locale/lang/zh-cn";


// 注册全局组件
import szycShowDialog from "./components/dialog/showDialog.vue";
// svg图标

// import SvgIcon from './components/SvgIcon/index.vue'
// import elementIcons from '@/components/SvgIcon/svgicon.js'

// import 'mxgraph/javascript/mxClient'
// import 'mxgraph/styles/mxgraph.css'



import showTip from './utils/rewriteElTooltip';         //  自定义指令（tooltip超出显示）

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.directive('show-tip', showTip);         //  超出文本显示（自定义）
// app.component('svg-icon', SvgIcon)    //  图标
app.component("SzycDialog", szycShowDialog);  // 弹窗
// app.provide("PageListData", PageListData);
app.component("PartTitle", PartTitle);

// 注册highlight.js插件
app.use(hljsVuePlugin);
// .use(elementIcons)
app.use(pinia).use(Antd).use(router).use(ElementPlus, { locale: zhCn }).mount("#app");
