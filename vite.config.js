import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import monacoEditorPlugin from "vite-plugin-monaco-editor";
// ElementPlus
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "path";
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    }),
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      directoryAsNamespace: true,
    }),
    //  monacoEditorPlugin({
    //   languageWorkers: ["editorWorkerService", "typescript", "json", "html"],
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    open: true,
    port: 2717, // 指定启动端口
    proxy: {
      "/api": {
        target: "http://192.168.10.228:10068",
        // target: "http://192.168.10.225:10068",
        // target: "http://192.168.10.115:10068",
        // target: "http://192.168.10.100:10068", //宋淑鹏
        // target: "http://192.168.10.99:10068", //董子恒
        // target: "http://192.168.10.228:20068",
        // target: "http://192.168.10.171:10068",
        // target: "http://192.168.10.39:10068",
        changeOrigin: true, //是否跨域
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // library(standby)
      "/getApi": {
        target: "http://192.168.10.247:8080",
        changeOrigin: true, //是否跨域
        rewrite: (path) => path.replace(/^\/getApi/, ""),
      },
      '/data-ops-bucket': {
        target: 'http://192.168.10.247:9000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // chunkSizeWarningLimit: 1600, // 可选：调大警告阈值
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes('node_modules')) {
    //         if (id.includes('element-plus')) return 'element-plus'
    //         if (id.includes('ant-design-vue')) return 'antdv'
    //         return 'vendor'
    //       }
    //     }
    //   }
    // },
    terserOptions: { compress: { drop_console: true, drop_debugger: true } }, // 删除console
    // outDir: `dataOps dist`,     // 打包输出目录
  },
});
