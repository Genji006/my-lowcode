import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus' // 1. 引入 Element Plus
import 'element-plus/dist/index.css'   // 2. 引入样式
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(createPinia()) // 3. 启用 Pinia
app.use(router)
app.use(ElementPlus)   // 4. 启用 Element Plus

app.use(VueMonacoEditorPlugin, {
    paths: {
        // 这里使用 CDN 加速，或者你也可以配置本地路径
        vs: '/public/vs'
    }
})

app.mount('#app')